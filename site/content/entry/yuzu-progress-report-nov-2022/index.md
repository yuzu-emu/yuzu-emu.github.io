+++
date = "2022-12-01T12:00:00-03:00"
title = "Progress Report November 2022"
author = "GoldenX86"
forum = 0
+++

As a dear friend likes to say, meowdy yuwu-zers! 
This month is special, a report of developer tears caused mostly by the release of new titles in the goliath franchise that is Pokémon, the adventures on new architecture lands, and the list of fixes and improvements along the way. Fasten your seat-belts, here we go!

<!--more-->

## PSA for NVIDIA users: Return of the Jedi

Before we move to what everyone wants to learn about, just a new Pokémon game, we have very good news to announce.
NVIDIA driver version `527.37` finally solves all known driver related regressions!
And to make it better, it affects all cards, from the GTX 745 to the RTX 4090, there are no more driver related graphical issues, exactly like the cards used to perform with version 472.12.
There’s no longer a need to stick to old versions, feel free to update to the latest release, no matter which card generation you have!

## Guess who’s back

It’s finally here.
~~For better or worse.~~ 

Taking some of the new gameplay elements introduced with `Pokémon Legends: Arceus`, is now with us `Pokémon Scarlet/Violet`!
This time with ultra-realistic tree textures, and 5 FPS walking NPCs.

Fun new gameplay aside, this release has been quite the challenge for yuzu, exposing several issues and their corresponding fixes helping other games in unexpected ways.
It doesn’t help that the game has problems running under native conditions already. 
Low performance, storage related stuttering, and memory leaks being some of them.

When we first got our hands on some copies, the game didn’t render anything, at all, which is not good, something needed to be done.
[vonchenplus](https://github.com/vonchenplus) was the first to answer, and identified that this was due the game's use of `gl_Layer`, and {{< gh-hovercard "9253" "added support for it in the shader compiler." >}}
You will hear more about this gl_Layer character later.

{{< imgs
    "./poke.png| One thing is for sure, graphics improved (Pokémon Scarlet)"
  >}}

With this change, the game starts to render and the team can focus on finding, documenting and fixing any other bugs that show up.

A limitation was quickly found by the community, gl_Layer depends on having driver support for the `GL_ARB_shader_viewport_layer_array` extension in OpenGL, or  the Vulkan equivalent, `VK_EXT_shader_viewport_index_layer`.

While most GPU drivers do indeed support these extensions, the NVIDIA drivers for Maxwell V1 and older cards don't, meaning users trying to run `Pokémon Scarlet/Violet` on GPUs older than the 900 series wouldn’t get the game to display anything on screen, in either graphics API and any shader backend.
The way byte[] solved this limitation is by {{< gh-hovercard "9636" "translating the gl_Layer assignments with geometry shaders," >}} basically a brute-forced hardware accelerated way to replicate the missing extensions on older hardware.
This results in proper rendering for the decade-old Geforce Fermi, Kepler, and Maxwell V1 series GPUs, in either OpenGL and Vulkan.
Now an extra 6% of users can play the game.

{{< imgs
    "./710.png| The test subject, anyone can cook (GPU-Z)"
  >}}

&nbsp;

{{< imgs
    "./710fix.png| Old but gold! (Pokémon Scarlet)"
  >}}

Let’s switch for a second to CPU related issues.
There were reports that certain moves like `tail whip` could cause the Pokémon to outright vanish, or that changing directions very quickly could cause a soft-lock. 
Even simple map traversal could cause crashes.
What do you do when all issues seem totally unrelated and random? 
You blame the CPU precision, of course!

More, ahem, precisely, in what optimizations are enabled by default.
The responsible one turned out to be `Inaccurate NaN handling`, an optimization made to improve the performance of some rooms in `Luigi’s Mansion 3`.
[Blinkhawk](https://github.com/FernandoS27) handled the change in the Auto setting for CPU accuracy to skip this optimization.

For anyone wishing to restore the performance for `Luigi’s Mansion 3`, you can use per-game settings, just right click the game, go to Properties, CPU tab, set CPU accuracy to unsafe and make sure Inaccurate NaN handling is enabled, like in the following example:

{{< imgs
    "./lm3.png| The per-game settings window is a pathway to knowledge many consider... Unnatural"
  >}}

We strongly recommend using a global setting of Auto CPU accuracy, and only implement custom/unsafe settings on a per game basis, never globally. 
Games WILL break with unsafe settings.

Back on GPU related issues, AMD has its own share of issues, it always does.
Users were quick to point out that the game looked like the usual cheap method USA films resort to when showing anything happening south of their borders, with a yellow filter applied.
This issue is for the history books, as both the official AMD drivers (the Windows driver, amdvlk and AMDGPU-PRO) *and* mesa (RADV) share the same behaviour.

Let’s provide some context.
The default shader backend of Vulkan, [SPIR-V](https://en.wikipedia.org/wiki/Standard_Portable_Intermediate_Representation),  describes the special properties variable decorations have.
Usually, a fragment shader’s input variables are set as `smooth`, interpolating the values between each vertex.
But sometimes you end up with a value that is constant across all vertices in a triangle. There’s no need to waste computational power smoothing anything in a case like this, so you can set the variable as `flat` instead.
Both the official AMD drivers and RADV think that the previously mentioned `gl_Layer` input in the fragment shader needs to be decorated as flat, or they treat it as a constant zero across the triangle, instead of the value set in the vertex shader.
Jury is out on this, we reported the issue to AMD.

A normal Vulkan program would never find itself in this situation because the GLSL compiler always decorates gl_Layer as flat.
The NVIDIA driver doesn’t make this assumption and doesn’t treat gl_Layer as a constant zero, regardless of the presence of the decoration.

{{< single-title-imgs-compare
    "Wasn't this game based in Spain? (Pokémon Scarlet)"
    "./amdbug.png"
    "./amdfix.png"
>}}

{{< gh-hovercard "9260" "By adding the missing flat decoration," >}} [byte[]](https://github.com/liamwhite) gives us Radeon users proper blue skies, in both Windows and Linux.

Let’s do a tennis match, the last bug was GPU related, time for a CPU one.

Even with all the work so far, the game could periodically crash.
This gave us a sense of dread we haven’t felt since the release of `Pokémon Sword/Shield`.
Thankfully our fear was unfounded, as only Windows users reported back. 
Linux users, for example using the Steam Deck, didn’t crash at all.
This gave us the needed hook to reel the line of the cause, which ended up being a problem in dynarmic, {{< gh-hovercard "9271" "a stack misalignment in one of the memory accessors." >}}
A quick call to [Merry](https://github.com/merryhime) over the red phone, and crashing is no more.

Back to GPU, and this one was really annoying.
Your writer had to do an all-nighter running tests with [bunnei](https://github.com/bunnei) to figure it out.
NPCs and characters could vertex explode at random, and while using high GPU accuracy would mitigate the problem to a certain extent, it was still very common in cities, particularly in the academy.

After a few dozen rounds of regression testing, the root of the cause was found in one of the changes introduced by `Project Y.F.C.`, so Blinkhawk took over and implemented the proper fixes, {{< gh-hovercard "9312" "fixing some buffer cache and engine upload issues." >}}

{{< single-title-imgs
    "It's like our personal curse, happens with every release (Pokémon Scarlet & Violet)"
    "./ver1.png"
    "./ver2.png"
    "./ver3.png"
    "./ver4.png"
    >}}

While the NPC vertex explosions are fixed, some geometry pop-up issues remain.
Homework for later.
But, as a bonus, now `Pokémon Legends: Arceus` can be played in Normal GPU accuracy without having the vertex explosions previously experienced, like  we promised to fix [back in January!](https://yuzu-emu.org/entry/yuzu-progress-report-jan-2022/#a-new-legend)
This can greatly increase performance on the superior older Pokémon title. One to scratch from the list.

CPU’s turn, or, well, memory in this case.
byte[] fixed {{< gh-hovercard "9279" "a silly mistake in the cheat engine" >}} that caused it to crash when using speedhack cheats.

GPU now, or well, an user interface aspect related to it.
As you may know from previous reports, Vulkan has a tendency to break when the user installs outdated screen recorders, overlays, or bloatware that messes with the Vulkan layers.
This leads people to still use the OpenGL API, which is not only considerably slower on `Pokémon Scarlet/Violet` (over three times slower in some cases), but also run the `GLASM` shader backend, an NVIDIA exclusive feature which is not particularly good with recent game releases, Scarlet/Violet not being an exception.

yuzu used to default to `GLASM` so NVIDIA users could enjoy lower shader compilation related stuttering, as OpenGL’s default shader backend, `GLSL`, is irritatingly slow in this aspect.
The problem with this approach is that the `GLASM` backend (assembly shaders) was developed as an experiment, and its two primary maintainers have moved on from the project. 
No one remaining on the team is taking the time to maintain a backend that has difficult-to-parse documentation, no debug tools, only partially helps a single GPU vendor, and has its advantages negated by a superior alternative, Vulkan.

{{< single-title-imgs-compare
    "Lavender Town? (Pokémon Violet)"
    "./glasm.png"
    "./vulkan.png"
>}}

Assembly shaders was an useful alternative while Vulkan was in early development, now it’s just dead weight taking precious development time that could be used to improve Vulkan instead.

This problem is far more common than [your writer](https://github.com/goldenx86) would like, so for those NVIDIA users with the *special superpower* to always break Vulkan, {{< gh-hovercard "9318" "OpenGL will default to GLSL now." >}}
The option to use GLASM will remain available, as Fermi users love it due to their chronic lack of Vulkan support.

To finish the fixes implemented this month regarding this flawed best-seller, bunnei fixed an {{< gh-hovercard "9320" "assert spam in the audio suspend process." >}}
This change not only cleans up logs, it has the potential to improve performance a bit.

That’s all for this November’s list of Pokémon fixes and improvements.
More work is in development, as there is still stuff to fix, so while we wait let’s end this section with some recommendations we found to get the best experience while playing:

- NVIDIA, Intel, and AMD users [must run the latest driver versions](https://community.citra-emu.org/t/recommended-settings/319349).
- High GPU accuracy ensures proper rendering of vegetation and buildings.
- Handheld mode improves performance considerably over Docked.
- Gym trials may require switching to Handheld for stability, this could be a game issue as it is known to have memory leaks on console.
- 4 cores/8 threads users seem to improve performance by disabling SMT/HT.
- Installing the latest game update improves performance.

## Graphical fixes

Back to the usual agenda, games in general.
vonchenplus found an {{< gh-hovercard "9167" "issue in how yuzu handles tessellation shaders" >}} which causes black backgrounds in `The Legend of Heroes: Trails from Zero`.

Why would you want to use tessellation shaders for 2D content on an RPG?

{{< imgs
    "./tfz.png| A tessellated 2D background, in all its glory (The Legend of Heroes: Trails from Zero)"
  >}}

Immediately after implementing the change, we noticed that games didn’t render correctly, and it wasn’t the fix’s fault.
In cases like this, a cache invalidation is not only recommended, but needed.
[gidoly](https://github.com/gidoly) {{< gh-hovercard "9175" "updated the cache version number," >}} invalidating all previous ones, and causing a huge disturbance in the Net, as if thousands of Smash players suddenly cried out in terror, and were suddenly silenced.

One of the important changes that didn’t make it in time for the first part of `Project Y.F.C.`, Blinkhawk series of GPU related changes and fixes, is {{< gh-hovercard "9194" " improving the handling of ASTC texture mipmap uploads." >}}

The original implementation rendered the ASTC mipmaps directly. 
What actually happens on Switch is that the NVIDIA driver uploads to its 2D engine first.
The incorrect implementation caused severe texture corruption on many many cases, most commonly on games running Unreal Engine 4.

{{< single-title-imgs-compare
    "Fluffy (Yoshi's Crafted World)"
    "./ue4bug.png"
    "./ue4fix.png"
>}}

The list is long, so here’s a selection of games that improved with this change:

- `Blue Fire`
- `A Hat in Time`
- `The Witcher 3: Wild Hunt Complete Edition`
- `Darksiders III`
- `Diablo II Resurrected` (character hair)
- `DRAGON QUEST XI S: Echoes of an Elusive Age – Definitive Edition`
- `Life is Strange: True Colors`
- `Yoshi's Crafted World`
- `F.I.S.T.: Forged In Shadow Torch`
- `Digimon Story Cyber Sleuth: Complete Edition`
- `Grand Theft Auto` trilogy

Working on improving OpenGL stability, vonchenplus {{< gh-hovercard "9216" "reimplemented the inline index buffer binding," >}} making the OpenGL implementation match the Vulkan one.
This solves certain cases where OpenGL would crash when using non-unified memory mode.

Here’s an interesting one.
If a game had bad performance on a specific system and produced too low framerates at boot, it could hang due to a lost wakeup.
Since the "secret project" byte[] was working on was a platform slower than a normal gaming PC (more on this in the next section), byte[] blasted this limitation to the Dark World, {{< gh-hovercard "9244" "allowing everyone to be able to boot their game dumps." >}}

A problem we reported a couple of times already, and AMD confirmed to be working on, was crashes happening in `Xenoblade Chronicles 3` with Vulkan, thanks to improving the precision of our MacroJIT code.
Since it became clear that more time was needed to solve this issue on the driver side, byte[] managed to implement a workaround, {{< gh-hovercard "9252" "an HLE multi-layer clear mechanism" >}} which bypasses the driver limitation.
This way the game remains playable in Vulkan, where the good performance is at.

{{< imgs
    "./xc3.png| Always with the good title screen music (Xenoblade Chronicles 3)"
  >}}

Here’s an interesting find from one of our *old* testers.
If you run `The Legend of Zelda: Breath of the Wild` in its base 1.0.0 version, recent changes caused distant trees to have a black flicker.
This behaviour was not present in an updated game, but a glitch is a glitch, and it deserves attention.

{{< single-title-imgs
    "The old result (left) has been reduced to 10 FPS to avoid triggering sensitive readers (The Legend of Zelda: Breath of the Wild)"
    "./botwbug.mp4"
    "./botwfix.mp4"
    >}}

vonchenplus found out that the order of the drawing commands was wrong in this case, and implemented a {{< gh-hovercard "9288" "more conservative drawing trigger mechanism." >}}
No other game is known to be affected by this change, but if there is, it’s fixed!

Your writer has been trying to slowly learn the ropes and decided to take on some small projects.
Too bad he’s also an idiot…

The result of too many hours of suffering for the result is the addition of a {{< gh-hovercard "9276" "sharpening slider for the FSR filter." >}}

{{< imgs
    "./slider.png| Emulation > Configure > Graphics"
  >}}

This allows the user to pick how much they want to sharpen a specific game.
Personal preference applies here, for example, `The Legend of Zelda: Breath of the Wild` may look great at 100% sharpening, but that same value may be too much for `Pokémon Scarlet`.

{{< single-title-imgs-compare
    "Seems to help with distant objects (The Legend of Zelda: Breath of the Wild)"
    "./fsr0.png"
    "./fsr100.png"
>}}

Test it to your preference and use the per-game profiles to make the most out of it.
Thank you [toastUnlimited](https://github.com/lat9nq) for helping me with the per-game support.

{{< imgs
    "./pgfsr.png| Right-click > Properties > Graphics"
  >}}

Our own POYO enjoyer [Morph](https://github.com/Morph1984), with help from byte[], worked on {{< gh-hovercard "9307" "improving the usage bits" >}} Vulkan demands of the device’s supported formats, while at it also adding a new format to the list, `R16_SINT`.
One of the “improved” games from this change is `Xenoblade Chronicles: Definitive Edition`.
While the game complained about missing a texture format, graphics don’t seem to have changed.

## CPU, kernel, and debugger changes

The fight for proper kernel emulation rages on, and bunnei raises the bar by {{< gh-hovercard "9173" "implementing most of the Switch’s firmware 15.X.X features." >}}
This brings memory management improvements (must resist making a boomerang joke), which should result in improved stability and slightly better resource usage.
While no game seems to specifically improve with this change, future games targeting the latest firmware versions will certainly benefit.
Nothing better than avoiding future headaches!

Let’s address the elephant in the room, which byte[] has been feeding tons of peanuts lately.
yuzu now supports being {{< gh-hovercard "9198" "built and run on ARM64 devices!" >}}

Of course, hardware requirements remain the same, at least 8GB of RAM and a OpenGL 4.6 compatibility profile/Vulkan 1.2 plus specific extensions GPU driver is required.
This means that yuzu can run on, for example, Asahi Linux on an M1 Apple MacBook Air, but by using Lavapipe, Mesa’s CPU rendering Vulkan driver, which of course results in very slow performance.

{{< single-title-imgs
    "This is what's possible right now (Mario Kart 8 Deluxe & Super Mario Galaxy, loaded directly)"
    "./asahi.png"
    "./asahi2.png"
    >}}

This initial implementation adds support for 32-bit games only. 
As for 64-bit games (the most common), [an update needs to be merged to Dynarmic](https://github.com/merryhime/dynarmic/pull/719). 
Once it’s out, there will be no restrictions on which games can be executed.

{{< single-title-imgs
    "This is what will be possible in the near future (Super Mario 3D World + Bowser's Fury, Super Mario 3D All-Stars, & Super Mario Odyssey)"
    "./asahi64.png"
    "./asahi642.png"
    "./asahi643.png"
    >}}

Further improvements by byte[] includes {{< gh-hovercard "9215" "corrections on atomic store ordering" >}} to improve stability, {{< gh-hovercard "9234" "implement data cache management operations," >}} and the most fun one, {{< gh-hovercard "9289" "fix compilation for Apple Clang," >}} allowing yuzu to run directly on macOS!

{{< imgs
    "./macos.png| If only Apple wasn't a reptilian company and offered Vulkan support"
  >}}

We have a very long road ahead to get full macOS support ongoing.
But a journey of a thousand miles begins with a single step, says the old man.

Outside of venturing into new architecture seas, byte also contributed a few general changes too.

Switch games can be weird, for example `MONSTER HUNTER RISE` has some fundamental love for opening services.
After a recent refactor, our kernel emulation incorrectly used a process per session, and this could lead to running out of slab heap, resulting in a hard crash.
As a workaround while byte[] refactors services to have a process tree accurate to the Switch, {{< gh-hovercard "9224" "the extraneous processes have been removed," >}} keeping stability in check.

## Services, input and audio changes

On the last day of the month, when we cut the list of pull requests that will make it into this article, Morph contacts your writer asking for one last addition.
And it was one important addition.
Morph {{< gh-hovercard "9348" "improved the stubs" >}} for the `Submit`, `GetRequestState`, and `GetResult` service functions, allowing `Splatoon 3` to boot while a network connection was configured for LAN/LDN play.

{{< single-title-imgs
    "While now you can join rooms, the game is not stable yet (Splatoon 3)"
    "./sp31.png"
    "./sp32.png"
    >}}

A lot more work is required to make this game fully playable, but taking out boot related issues is always a great start.

[jbeich](https://github.com/jbeich) is back in action, {{< gh-hovercard "9181" "ensuring that yuzu is compatible with BSD systems!" >}}
This change adds support for previous additions and fixes that were only considering Linux at the time.
A separate pull request deals with {{< gh-hovercard "9178" "making BSD compatible with the changes required to run the LDN services." >}}

As part of byte[]’s efforts to get yuzu running on macOS, he and toastUnlimited had to make some changes to fit the platform’s special needs.
First, byte[] {{< gh-hovercard "9304" "assigned the menuRole property for actions to improve Cocoa support," >}} and then toastUnlimited {{< gh-hovercard "9308" "changed the Vulkan check on other platforms to behave closer to how the check for Windows works," >}} improving the compatibility with the macOS file manager.
[german77](https://github.com/german77) joins the fun, {{< gh-hovercard "9322" "making changes to ensure reading SDL events doesn't crash on macOS." >}}

Regarding input in general, german77 went to infinity and beyond with yuzu’s multitouch detection, raising the 16 fingers limit to, well, infinite.
As part of this change, he also {{< gh-hovercard "9191" "tuned the response speed of touches," >}} which were a little bit too fast, resulting in missing input.
As a result `Mini Motorways` is far more playable now!

{{< imgs
    "./motor.png| C'mon, touch it! (Mini Motorways)"
  >}}

Amiibos also got some love from german77. 
The first example is {{< gh-hovercard "9219" "implementing the NFC" >}} `IUser` service, which fixes the NFC detection in `Ultra Kaiju Monster Rancher`.

{{< single-title-imgs
    "And it's still a premium feature on most phones (Ultra Kaiju Monster Rancher)"
    "./monster.png"
    "./nfc.png"
    >}}

Next, german77 {{< gh-hovercard "9238" "implemented the" >}} `cabinet applet` (Amiibo manager window).
This new settings window allows the user to register, format and delete game data of their Amiibos, while also displaying additional data available.
This first implementation will only show up when a game request it, an UI option will be added in the future

{{< imgs
    "./cabinet.png| Images optional for now (Shovel Knight)"
  >}}

On the audio side of things, [Maide](https://github.com/Kelebek1) has been working on solving out-of-bounds crashing issues related to how the emulator and the Switch handle audio buffers.
Here’s the thing, the game decides how many buffers it wants to use, and has the freedom to use the buffers as it pleases.
As Maide says: “Put voice A in buffer 1 with voice B in buffer 2, mix them together into buffer 3. Put voice C in buffer 4 and mix buffer 3 and 4 into buffer 5, etc.”
At the end of the line, if you need to output to 2 channels, only two final buffers will be used, for 6 channels, 6 buffers, but there is no order to those selected buffers, no rule says that they must be buffer 0 and 1.
yuzu operated under the assumption that games would use buffers 0 to 5 for output, and that has been the case for the majority of games, but as always, there are exceptions, one being `The Legend of Zelda: Skyward Sword HD`.
This particular game uses something similar to 8/9/C/D/A/B for its 6 buffer outputs, as you can see we’re going hexadecimal here.

The previous implementation took the first buffer as a starting point, buffer 0, and added +1 to fill the remaining 5 slots.
That’s obviously not valid for Skyward Sword, the moment you want to access a buffer that is not part of those 6 first consecutive buffers, you get a crash for getting out-of-bounds, and this happens even with the first actual output buffer, at 8!
Fixing this behaviour by {{< gh-hovercard "9297" "checking the highest buffer and adding +1" >}} stops the game from crashing, and should also have the benefit of not outputting weird sounds, as the correct buffers will be selected.

As most of you know, our current file system emulation is far from ideal. 
Morph’s `Project Gaia` should address most issues we have with it once his rewrite is finished.
In the meantime, there’s nothing against fixing existing problems with it, and [v1993](https://github.com/v1993) provides a huge hand by addressing a case that could be invisible to the user, and really annoying as a result.
The emulator can auto-generate some of the keys required to decrypt and run the Swtich games.
The problem is that those auto-generated keys are sometimes worse than the ones the user provided during the dumping process, yet they still took precedence.
V1993 {{< gh-hovercard "9324" "flips this behaviour," >}} solving cases of games refusing to boot due to this conflict.

## User interface improvements

Localization is an ongoing effort, and anyone can contribute [here](https://www.transifex.com/yuzu-emulator/yuzu).
This time the community {{< gh-hovercard "9166" "added support for a new language, Ukrainian!" >}}
This addition is possible thanks to the work done  by [Docteh](https://github.com/Docteh) and GillianMC.

Docteh also {{< gh-hovercard "9180" "fixed the translation of pop-up warnings" >}} that show up when trying to remove game content.

{{< single-title-imgs
    "Como corresponde"
    "./removebug.png"
    "./removefix.png"
>}}

No one wants to lose their saves, especially not if it is the own user’s fault.
As per the request of an user, toastUnlimited added {{< gh-hovercard "9247" "a warning pop-up when an user attempts to delete an user profile." >}}
Because, yes, deleting a profile includes deleting its saves.

{{< imgs
    "./delete.png| The UI must also protect the users from themselves"
  >}}

epicboy surprised everyone by slamming the door, throwing {{< gh-hovercard "9273" "per-game input profile support" >}} into our faces, and leaving refusing to elaborate further.
A real Chad.

{{< imgs
    "./input.png| Right-click game > Properties > Input Profiles"
  >}}

## Future projects

There’s a lot going on behind doors, but it’s too early to start teasing you.
We can confirm that both `Project Gaia` and `Project Y.F.C. Part 2` are progressing healthily, but those are not the only very important changes in the oven.

Personally, I’m trying to implement SMAA, and suffering a lot with it.

That’s all folks! Thank you so much for giving us a bit of your time, and we hope to see you next time!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
