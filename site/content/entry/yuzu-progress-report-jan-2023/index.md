+++
date = "2023-02-11T12:00:00-03:00"
title = "Progress Report January 2023"
author = "GoldenX86"
forum = 724529
+++

New year, more work to do! 2023 started with a plethora of graphical changes, audio and input improvements, TAS and LAN/LDN fixes, and more! Stay tuned yuz-ers, this is just the start of what's to come this year!

<!--more--> 

## New challenger approaching!

During the time it took to merge last month’s `Project Y.F.C. 1.5`, several other GPU related changes had to be delayed.
One change that slipped by, made by a new contributor, improved the Vulkan experience so dramatically, it almost feels like cheating…
The change is simple: instead of relying on the GPU driver to store and validate the pipeline cache (a.k.a. the shaders), and having the usual suspects like the Windows AMD driver fail to store 95% of them because of some arbitrary low size limitation, [Wollnashorn](https://github.com/Wollnashorn) decided that {{< gh-hovercard "9527" "doing it with the official Vulkan API is better." >}}

By storing the entire pipeline cache in a custom file among yuzu’s folders, AMD GPUs running on Windows can now properly load large caches in mere seconds, as it should be. 
This has saved me literal hours of time while playing `Xenoblade Chronicles 3` with an RX 6600, as the game has the _lovely perk_ of many heavy shaders.
Booting the game with 25000 shaders used to take close to 15 minutes, with the driver only providing the first 3000 shaders or so, and the rest always being recompiled. The process now takes mere *seconds*.

{{< imgs
	"./shaders.mp4| NVIDIA and Intel are faster at shader building than AMD"
  >}}

But this isn’t just another fix for AMD Windows users. While the objective was accomplished, the benefits didn’t stop there. 
As it turns out, locally stored files are much quicker to save compared to relying on the GPU driver. 
Possibly due to fewer checks being performed? 
All GPU vendors see reduced stuttering when facing new shaders!

The usual limitations apply: the cache still asks the driver for validation, so updating it to a newer or older version will require a recompilation, and since the cache is vendor-specific, you won’t get to keep the cache if you switch to a new GPU from another vendor. (And we’re glad there are more than two options now.)

While Wollnashorn intended this feature to be optional at first, we consider it fully stable, so it’s now enabled by default.
Anyone interested in testing disabling it will find the new option in `Emulation > Configure… > Graphics > Advanced > Use Vulkan pipeline cache`.

{{< imgs
	"./turboui.png| Vulkan only, OpenGL is not this flexible with compute work"
  >}}

Wollnashorn, delivering another amazing entry for the new year, implemented {{< gh-hovercard "9539" "support for AMD's FidelityFX Super Resolution (FSR) in the OpenGL backend." >}}
While AMD only really intended this adapting filter to be used with Vulkan and Direct3D 12, it is actually portable to OpenGL, and provides generally superior results compared to other filters.
Thanks!

{{< imgs
	"./fsr.png| Fermi users rejoice"
  >}}

## Fire Emblem Unity

A new entry in the series, and, some core changes aside, a good one at that!
The best part of this release is in the technical aspect.
Gone is the clunky and slow Koei Tecmo engine. `Fire Emblem Engage` uses  the much more flexible and optimized Unity engine instead.

For us emulation fans, this means 60 FPS is achievable on very low-end hardware, and the game can be reasonably played with the framerate unlocked too. Only some animations and 2D elements experience issues with the higher framerates, something we hope the modding community can solve.
We expect to see 120 and even 240 FPS mods working fine on reasonably powerful hardware.

Another point, and maybe even more important, is shader stuttering.
Koei’s engine is notoriously infamous for having bloated shaders that, without tons of work from our side, can make any GPU driver crash on timeouts.
Unity, on the other hand, has much lighter shaders, allowing Vulkan’s parallel building to shine, and asynchronous shader building provides extra help, if your CPU doesn’t have enough threads to hide what little stutter remains.

Still, new game release, new issues, and new fixes for them. So let’s list what has been done so far.

[byte[]](https://github.com/liamwhite), who may or may not have just discovered the Fire Emblem series, noticed an issue with the shader compiler: the only place where multisampled (MSAA) textures were actually being intentionally processed in shaders was in the `GLASM` shader backend, albeit incorrectly.
In the `GLSL` backend, it was completely ignored, and in the `SPIR-V` backend, it produced an invalid combination of arguments to a `SPIR-V` instruction, which caused Mesa to abort when processing our shader.
{{< gh-hovercard "9652" "Passing through multisample information" >}} fixed the crash, but left more work to do...

...which [epicboy](https://github.com/ameerj), one of the original authors of the shader compiler, took notice of, and came back with a rapid-fire series of fixes to address.
His first fix was to continue what byte[] had started and fully {{< gh-hovercard "9687" "implement multisampled texture fetches" >}} in the `GLSL` and `GLASM` backends, cleaning up rendering of the game with those backends.

{{< single-title-imgs-compare
    "From Stealth to Tactical RPG (Fire Emblem Engage)"
    "./oglbug.png"
    "./oglfix.png"
    >}}

He then implemented two more changes: {{< gh-hovercard "9694" "preventing translations of the `TXQ instruction` from producing another invalid combination of arguments," >}} and then {{< gh-hovercard "9703" "implementing full support for multisampled images" >}} with the `TXQ instruction`, with only a few minor loose ends to tidy up -- which will require another cache invalidation.
We preemptively apologize to all Smash players (even though it hasn't happened yet).

{{< single-title-imgs-compare
    "Now your favorite characters won't be half-way in the Shadow Realm (Fire Emblem Engage)"
    "./feebug.png"
    "./feefix.png"
    >}}

This fixed menu rendering in other games, such as `Dokapon UP!` and `Pokémon Mystery Dungeon: Rescue Team DX`.

{{< single-title-imgs-compare
    "Fight fire with fire (Pokémon Mystery Dungeon: Rescue Team DX)"
    "./pmdbug.png"
    "./pmdfix.png"
    >}}

As any NVIDIA `Pokémon Brilliant Diamond/Shining Pearl` player will tell you, Unity engine games are more stable on OpenGL, one of the rare cases where the old API is preferred.
We’re working to fix this issue, but for now, if you are experiencing crashes when using Vulkan with an NVIDIA GPU, try using OpenGL instead, and as an alternative, see if disabling Accelerate ASTC texture decoding helps.
As always, both options can be found in `Emulation > Configure… > Graphics`.

## [Turbo mode](https://www.youtube.com/watch?v=D3djVW3dSGA)

If you followed previous progress reports, you may have noticed a certain pattern.
Your writer has a stupid idea, and byte[] is the one that ends up listening to my rambling and makes that idea a reality.
This routine worked successfully with SMAA for Vulkan, unsuccessfully with increasing the staging buffer size to take advantage of ReBAR, sadly, and this time, it _almost worked_ with `Turbo mode`, or its official/boring name, {{< gh-hovercard "9552" "Force maximum clocks." >}}

You might be able to see where this is going.
[A year ago,](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2022/#vulkan-is-the-future) Patreon funding got your writer access to an RX 6500 to help with testing and debugging.
That card died a horrible, premature death (and no one misses it), but before kicking the bucket, it allowed us to learn that RDNA and RDNA2 hardware from AMD suffer from serious downclocking issues if you’re not constantly shoving work to the GPU.
Thankfully, due to the cryptomining crash, an RX 6600 took its place for no extra cost.
In your face, miners.

Ehem, back on topic.
The card will try to idle as much as possible to save power, so if the workload is not constant, it switches to a lower clock speed, and raising the clocks again takes time. 
This results in lower performance.
While the issue affects all GPU vendors in one way or another, only AMD suffers from up to 70% performance losses, with both Windows *and* Linux drivers. Yes, even RADV.

Since asking the users to apply external workarounds like encoding video in the background to keep VRAM usage high or overclocking the minimum clock speed are not easy to communicate, or can count as voiding your warranty, your writer was going insane trying to find ways to cleanly solve this issue, as it seems AMD isn’t very interested in it.

The solution came from an overclocking background again.
[memtestCL](https://github.com/ihaque/memtestCL) is a tool to test stability of video memory: you set a size, how many iterations to run, and the compute load will compare results, informing you of any errors.
Running yuzu and memtestCL at the same time completely fixed the downclocking issues of AMD cards!

Some small discussions and prototyping later, and a solution was starting to take shape.
Creating and running an OpenCL/CUDA process in parallel was deemed to be too much work, and could be sent to the background by the scheduler, nullifying any gain.
Instead, we decided to use Vulkan’s own compute capabilities.
A useless dummy load will constantly run on the GPU, forcing it to always keep its clocks as high as possible, and with it, the power consumption.

{{< imgs
	"./turboperf.png| Four of the most GPU intensive games. Lower end cards like the infamous RX 6500 XT can see jumps as high as 70%"
  >}}

While this is a simple solution, it has a few drawbacks that forced us to sadly not enable this option by default:

First, not all users want to or can run their GPUs at maximum performance. On mobile devices, it results in terrible battery life, or hitting power limits on AMD and Intel APUs, like the Steam Deck for example, with its small 15W default TDP.

Second, low constant loads like an old game running at very high framerates, or an emulator performing dummy cycles, produce a noise known as coil whine, an electrical “purring” that varies in intensity with each GPU. Some are barely audible, others can scare their users, even if the card is under no harm.

And third, while this is a safe option for AMD dedicated GPUs, on NVIDIA and Intel, the results are much more variable.
Weaker NVIDIA cards (anything weaker than an RTX 3060) will most likely lose considerable performance with Turbo mode, while the powerful, expensive cards will see performance gains similar to AMD.
The RTX 4090 in particular performs better with Turbo than even NVIDIA’s own “Prefer maximum performance” setting in their control panel.

{{< single-title-imgs
    "Left is default performance with an RTX 4090, middle is using the driver's 'Prefer maximum performance', right is yuzu's Turbo mode (Pokémon Scarlet)"
    "./nvidia1.png"
    "./nvidia2.png"
    "./nvidia3.png"
    >}}

Intel is, as always, a special case.
While Turbo mode certainly helps desktop Arc GPUs, integrated Xe graphics and older can only run a single queue.
This means that, by design, these iGPUs can’t render and run compute tasks at the same time.
While the scheduler seems to do a fantastic job, not causing any performance loss with Turbo, you still get all the drawbacks and no benefit while using Intel iGPUs.

We have worked to resolve as many limitations as we could, but since the results are so variable between different vendors and cards, the option will remain disabled by default.
We strongly recommend that everyone tests it. If it produces a performance gain in a game, it should be consistent across the board.
At least all desktop AMD users, Big Chungus NVIDIA owners, and the 5 people with an Arc will benefit greatly from it.
The option can be found in `Emulation > Configure… > Graphics > Advanced > Force maximum clocks`.
…I still prefer calling it Turbo mode…

{{< imgs
	"./turboui.png| Let's reuse the same pic, no one will notice it"
  >}}

## Yet more GPU changes

Starting off the new year with a bang, [bylaws](https://github.com/bylaws) of [Skyline](https://github.com/skyline-emu/skyline) fame returned with another round of fixes for our shader compiler project.
`Geometry shader passthrough` is an NVIDIA hardware feature available on the Switch which is primarily used to select a viewport or layer without needing an actual geometry shader, and it is available to and used by yuzu with desktop NVIDIA cards.
However, AMD, Intel, and other vendors don't support this extension, and require emulation using geometry shaders.
bylaws {{< gh-hovercard "9535" "added support for geometry shader passthrough emulation," >}} which fixed rendering issues in `NieR:Automata The End of YoRHa Edition`, `Marvel Ultimate Alliance 3: The Black Order`, `Pokémon: Legends Arceus`, and likely many other games.

{{< single-title-imgs-compare
    "Robot shoot is pretty funny (NieR:Automata The End of YoRHa Edition)"
    "./nabug.png"
    "./nafix.png"
    >}}

[vonchenplus](https://github.com/vonchenplus) {{< gh-hovercard "9556" "implemented the `draw texture method`," >}} another NVIDIA-exclusive feature, with both native and emulated versions.
It’s like the Switch used some sort of NVIDIA GPU, hmm.

Generally, graphics APIs like OpenGL and Vulkan require shaders and some geometry (at minimum, a triangle) defined to render a texture to the framebuffer, but the `draw texture method` bypasses this requirement and draws an axis-aligned texture to the screen with only the coordinates of the bounding rectangle.
When using OpenGL on NVIDIA hardware, yuzu will try to use the host's draw texture function, and it will be emulated with shaders on Vulkan or other platforms.
This fixes the rendering of the title screen on `Titan Quest`.

{{< single-title-imgs-compare
    "And people ask why we 'make' games run faster on NVIDIA hardware (Titan Quest)"
    "./tqbug.png"
    "./tqfix.png"
    >}}

byte[] {{< gh-hovercard "9608" "corrected a mistake in the way yuzu treated swap intervals." >}}
One method for limiting framerate on the Switch is to set a number controlling how many times a frame will be presented, where presentation happens 60 times per second.
A program could limit itself to 30 frames per second by setting this number to 2, 20 frames per second by setting this value to 3, and so on.
yuzu mistakenly treated the swap interval as being based on powers of two, so the values of 1 and 2, corresponding to 60 and 30 frames per second, worked correctly, but a value of 3 incorrectly presented at 15 frames per second.
While fixing this mistake, byte[] also added support for mod developers to use negative values as _multiples_ of 60 frames per second.
Let the (high-framerate) games begin!

epicboy also {{< gh-hovercard "9708" "fixed a longstanding issue with asynchronous shader building on OpenGL," >}} forcing shaders to be fully flushed and available to the main rendering context before signalling availability.
This should alleviate any persistent graphical errors exclusive to asynchronous shaders in the old API.

[Blinkhawk](https://github.com/FernandoS27) returns with another {{< gh-hovercard "9559" "significant performance improvement" >}} for the world's seemingly-least optimized Pokémon games. This allows them to render in our much faster, but lower-accuracy, GPU Normal mode, and implements a few related optimizations along the way.
Have fun shiny hunting!

{{< single-title-imgs
    "If you ask why all pics are in the same area, it's one of the best benchmarking spots. Normal accuracy on the left, High accuracy on the right (Pokémon Scarlet)"
    "./psn.png"
    "./psh.png"
    >}}

Keep in mind that Normal GPU accuracy will produce vertex explosions for a frame, but only last just as long. Permanent vertex explosions be gone!
High GPU accuracy will be cleaner, but slower, so pick your side.

As one final note for the GPU section, your writer implemented a feature which had been requested for quite a while since the resolution scaler was released, but nobody had really bothered to look at until now -- {{< gh-hovercard "9612" "additional resolution options." >}}

Now you can select from the additional options of 1.5x scaling, or 7x and 8x (if you have a death wish for your graphics card).
User reports confirm that the RTX 4090 can play some games at 8x, and the RX 6950 XT doesn't have many problems with 7x.
The odd one, 1.5x, was added because our metrics show that the most used non-iGPU cards are strong enough to have surplus performance at 1x, but are not powerful enough to handle 2x.
A middle ground is ideal to get crisper graphics while keeping the 30/60FPS target, or if the user has a 1440p display.
We think this should be reasonably future proof for now.

{{< imgs
	"./16k.jpg| Warning, don't click this image on weak devices: 16K resolution (SUPER MARIO ODYSSEY)"
  >}}

Small warning, AMD and Intel hardware don't support textures as big as NVIDIA, so it's possible to hit this limit in some games and make the driver crash. 
If you have performance and VRAM to spare and you hit a crash, lower the multiplier.

## macOS progress

Since we have been providing little snippets of a possible return for macOS support for the past few months, know that the progress is slow for now, but we have some significant results to report.

{{< imgs
	"./mvk.png| Baby Mario steps (SUPER MARIO ODYSSEY)"
  >}}

byte[] implemented a {{< gh-hovercard "9528" "fallback for the absence of `nullDescriptor` support" >}} in MoltenVK, avoiding a crash when attempting to bind buffer slots on MoltenVK.

Then, he implemented a _substantial_ refactor of how {{< gh-hovercard "9530" "yuzu performs Vulkan feature testing," >}} making it both more streamlined and able to cope with the absence of features which yuzu currently still requires as mandatory -- such as the aforementioned `nullDescriptor` feature.

Finally, [PCSX2](https://github.com/PCSX2/pcsx2) and [Dolphin](https://github.com/dolphin-emu/dolphin) contributor [TellowKrinkle](https://github.com/TellowKrinkle) helped us {{< gh-hovercard "9596" "discover a bug in MoltenVK" >}} where the number of bindings it reports as available doesn't correspond to the number we can actually use, and suggested a workaround, which byte[] committed, allowing trivial homebrew examples to finally begin rendering correctly.
We are also able to render some simpler games, but be aware: most things don't work yet.
Baby steps!

{{< single-title-imgs-compare
    "It's hard to describe, has the performance, but lacks the features, but has modern features"
    "./mvkbug.png"
    "./mvkfix.png"
    >}}

## General changes

byte[] {{< gh-hovercard "9561" " triggered the scheduled mandatory Dynarmic update," >}} blessing us with [fastmem and page table support](https://yuzu-emu.org/entry/yuzu-fastmem/) for ARM64 devices, boosting performance considerably.
Anyone with an ARM64 device running a “normal” GPU (not mobile-tier hardware) interested in testing yuzu, feel free to install our official [Flatpak](https://flathub.org/apps/details/org.yuzu_emu.yuzu).

[german77](https://github.com/german77) stumbled upon an issue which was causing input threads to randomly crash yuzu for seemingly no reason, but only on shutdown.
byte[] found that `CoreTiming` had the same logic issue that he fixed last month in the kernel code when adding `KHardwareTimer`: callbacks could be removed while in-progress, which could cause the input threads to continue using memory after it had been freed. 
With this code changed to {{< gh-hovercard "9619" "wait until any in-progress callbacks are finished before removal," >}} this issue should be solved for good.

After the merge of german77's impressive Joy-Con driver release [last month](https://yuzu-emu.org/entry/yuzu-progress-report-dec-2022/#new-joy-con-driver-and-other-input-improvements), [Morph](https://github.com/Morph1984) noticed that yuzu was often taking a significantly longer amount of time to shutdown, sometimes more than 5 seconds longer than it should have been allowed to.
He discovered that this was due to sleep calls in the Joy-Con driver to poll for new devices that weren't being cancelled on shutdown, and with help from byte[], he {{< gh-hovercard "9677" "implemented a proper fix" >}} so that they would immediately stop waiting when shutdown was signalled.

More battles won for the Shutdown Wars, with seemingly no end in sight! 
It's starting to almost feel like a [Worms](https://www.youtube.com/watch?v=HWJsY4FoSZ8) game.

An interesting report from a user pointed byte[] to the visual novel `うみねこのなく頃に咲 ～猫箱と夢想の交響曲～` (Umineko no Naku Koro ni Saku - Nekobako to Musou no Koukyoukyoku), which seemed to reliably crash in fast-forward mode, but only when audio was enabled.
He quickly identified that the issue was happening at the same time the audio system was temporarily stalling the game (in order to avoid dropping any samples).
He had previously implemented stalling in the kernel in a way that seemed superficially reasonable, but actually completely broke the scheduler when just the right conditions were met!
byte[] then {{< gh-hovercard "9666" "reimplemented stalling more carefully," >}} avoiding breaking the conditions required by the scheduler, and preventing a deadlock due to incorrect behaviour around suspension.

{{< imgs
	"./umi.png| Without love, it cannot be seen (Umineko no Naku Koro ni Saku - Nekobako to Musou no Koukyoukyoku)"
  >}}

Users reported a regression when trying to play `Mario Kart 8 Deluxe` over LAN mode.
The game would refuse to access the mode and return to the main menu.
german77 {{< gh-hovercard "9543" "updated the implementation to match the latest reverse engineering efforts" >}} and poof, back to launching blue shells at all your friends!

{{< imgs
	"./lan.png| Hot take, only Gran Turismo gets close to this series in music quality (Mario Kart 8 Deluxe)"
  >}}

[MonsterDruide1](https://github.com/MonsterDruide1) is back with _the good fixes_.
This time? LDN.
Game mods that add network connectivity sometimes use sockets with a timeout in order to keep the game responsive while waiting for more packets.
yuzu used to hate this behaviour, spamming errors in the log, and generally just having a bad time.
{{< gh-hovercard "9558" "Changing this unnecessarily cautious behaviour" >}} allows network gameplay mods to work properly, for example, [smo-practice](https://github.com/fruityloops1/smo-practice).

[SoRadGaming](https://github.com/SoRadGaming) suddenly showed up one day and {{< gh-hovercard "9661" "implemented IPv6 and hostname support" >}} for LDN.
Thanks! Now more players can enjoy their online matches, and we’re ready for the eventual death of IPv4, which is expected to happen someday in this geological era.
Or maybe the next one.

{{< imgs
	"./dc.png| Remember when domain names were free?"
  >}}

[Merry](https://github.com/merryhime), taking a break from Dynarmic to play with some areas of yuzu, {{< gh-hovercard "9615" "implemented a set of fixes" >}} to the audio codebase, focusing on upsampling.
An off-by-one error fix should translate to in-game music not cutting off as much, and improved audio fidelity.

## Input and TAS improvements

TAS got its fair share of improvements, all thanks to MonsterDruide1 and german77.
The first fix is {{< gh-hovercard "9540" "properly recording sanitized inputs," >}} instead of the raw inputs from the player.
By sanitized, we mean input adjusted by range and dead zone settings.
There isn't much use for a TAS script if what you record doesn’t correspond to what the game received originally.

Next, yuzu, by design, can support multiple controllers per player, which can lead to multiple stick inputs overlapping (“flapping”) each other.
yuzu would ignore switching to any stick input that didn’t reach full tilt.
To avoid this behaviour causing problems with TAS, MonsterDruide1 {{< gh-hovercard "9547" "overrules this safety threshold value" >}} for TAS-based stick input, so every movement gets registered, even the most minuscule ones right from the start.
This change also adds the extra logic of returning to regular input if the TAS stick reaches a value of 0 in both axes.

And to end the TAS changes, MonsterDruide1 also now {{< gh-hovercard "9565" "shows the progress of multiple scripts" >}} when several controllers are running their own records, for example, `TAS state: Running 35/100, 20, 0, 40`.
Now all players in local multiplayer matches can get their corresponding information.

On the topic of regular input, german77 has been busy improving it, and he has implemented a couple of changes that we think many will like.

For our keyboard and mouse fans, there’s now {{< gh-hovercard "9605" "support for mapping the mouse wheel" >}} to any button.
Sounds like a simple way to switch gear in `The Legend of Zelda: Breath of the Wild` to me, for example.

german77 has been gluing his eyes to some unit tests lately trying to find out why `EARTH DEFENSE FORCE: WORLD BROTHERS` would outright ignore input in some cases.
After several back and forths between yuzu and the real Switch, he found out that the stick range didn’t seem to have minimum value of -32768, the usual value expected from a 16-bit signed integer (a range of -32768 to 32767), and instead seemed to have a minimum of -32766.

{{< imgs
	"./input.png| Unpatched Switch consoles are invaluable for us"
  >}}

Okay, [Nintendo is as Nintendo does](https://www.youtube.com/watch?v=VreFw1Zd020), have it your way, we will just {{< gh-hovercard "9617" "fix the minimum stick range" >}} in our code.
Problem solved, right?

No.

As it turns out, this is a game bug. 
You can get the Switch to reach -32767 under certain conditions, and `EARTH DEFENSE FORCE: WORLD BROTHERS` will _also_ refuse to accept input on the real hardware.
So what do we do then? german77 decided that the best solution is to {{< gh-hovercard "9676" "apply a 0.99996x multiplier" >}} to the received input from the sticks, just to avoid weird games from behaving incorrectly.

People have been complaining about poor Joy-Con reception since, well, ever, and honestly, there’s a limit to how much we can do, only Nintendo knows what Bluetooth black magic they use to get good range on the Switch.
Thankfully, the new custom Joy-Con driver allows us to have more freedom on the parameters of the Bluetooth connection, and german77 discovered that {{< gh-hovercard "9683" "disabling low power mode," >}} one of the available parameters, after establishing a connection is closer to what the console does, and should help improve range to some extent.

Our general recommendations still apply: if you’re using an Intel WiFI + BT combo chipset, turn off WiFi, and make sure to have your phone away from the BT chipset and the Joy-Cons.
It’s known that off-brand generic USB dongles provide better range than WiFi + BT combo chips.

Now for players interested in bending the game engines to their limit, or just wanting to have some extra fun (us boomers like to call this “cheating”), german77 has a gift for you.
{{< gh-hovercard "9696" "Turbo button support!" >}} Also known as rapidfire, this allows you to, as the name implies, repeatedly auto-press a button as fast as the game can register it.

{{< imgs
	"./turbo.png| For some reason, Mega Man comes to mind"
  >}}

Enjoy finding new ways to break your games with this!

## UI changes

This one has been cooking for over 2 years now, sheesh.
Morph originally started working on {{< gh-hovercard "4949" "improving high-DPI support" >}} in yuzu all the way back in November of 2020.
Now it’s ready, and the results are great. 
Users that run displays at DPI values over 100% can now see proper UI element scaling, particularly noticeable in the Controls setting window.

{{< single-title-imgs-compare
    "4K display users rejoice"
    "./dpibug.png"
    "./dpifix.png"
    >}}

Nothing is safe from bugs in the user interface code, and Wollnashorn found an interesting one affecting LDN.
The Direct Connect window asks the user for an IP and nickname.

{{< imgs
	"./dc.png| We believe in recycling here, that includes pics"
  >}}

Those settings got lost every time a game was booted.
Well, the issue was that those settings were being saved on the per-game configuration files for no reason.
It doesn't make sense to include a fundamentally global setting in the per-game settings, so {{< gh-hovercard "9521" "removing them" >}} solved the issue.

byte[] solved an issue where accessing fullscreen would cause yuzu to crash.
{{< gh-hovercard "9601" "Adjusting the behaviour of yuzu’s bootmanager" >}} was enough to stop the [CRASH!!](https://github.com/yuzu-emu/yuzu/issues/9550)

Newcomer [SaiKai](https://github.com/SaiKai) implements one of those Quality of Life changes that you can’t live without and you can’t believe it wasn’t a thing before.
Pressing and holding the hotkey assigned to lowering or raising {{< gh-hovercard "9637" "volume will now auto-repeat," >}} making it much easier to control.
Thanks!

Per-game configuration returns to mess with us, now with the language selection.
The language ComboBox index gets altered in per-game configuration, so setting the region to Korea or Taiwan would result in a crash.
german77 {{< gh-hovercard "9660" "fixes this discrepancy" >}} and solves the issue.

## Hardware section

Let’s revive this section for a bit, there’s some information I’d like to discuss.

#### NVIDIA, forgetting about their old cards.

We previously mentioned that the 527.XX release of drivers solved issues we previously had with Pascal and newer cards.
While this was true for most issues, Pascal is still hitting some of the old problems, like crashes with ASTC texture decoding enabled.
We recommend Pascal users to either disable ASTC texture decoding, or revert back to 512.95 drivers.
We hope NVIDIA backports the fixes Turing and newer cards got to the old guard too.

#### AMD, custom drivers are not good

The recently released RX 7000 series, or RDNA3, are not particularly compatible with emulators right now, with yuzu not being an exception.
Broken rendering and crashes were reported by early adopters.

Sadly, we can’t focus on these products while they run a custom driver branch. 
Until AMD merges the RDNA3 driver with the regular Polaris to RDNA2 one we’re all used to, it’s impossible to focus efforts on trying to solve any particular issues of this new release.
Sorry early adopters, you will have to wait.

Having access to hardware that doesn’t cost NVIDIA-stupid levels would also help. 
AMD, please don’t take a year to release the mid and low end.

Now, regarding unofficial custom drivers, we received reports that Amermine Zone drivers break rendering in many games. 
Regular drivers are perfectly fine, so just stick to official AMD releases.

#### Intel, artificial limitations capping good hardware

Your writer recently had to replace an old i3-5005U laptop because its WiFi died, but HP only allows a very limited selection of cards as replacements, and said parts are no longer in production.
I’m never buying HP ever again.

Sorry, back on topic.
This was a great opportunity to get an Iris Xe GPU, so an i5-1240P was acquired. 
ASUS this time.
As this was first hand experience for a tester with a Gen 12 Intel GPU, we now have both good and bad information to discuss.

Let’s start with the bad, and this is something that affects many users, as it is the default configuration of most laptops.

Intel, in their *infinite wisdom*, decided that single channel memory configurations should [artificially limit the integrated GPU to the slower UHD Graphics spec](https://www.intel.com/content/www/us/en/support/articles/000059744/graphics.html), reducing its EU (execution unit) count. 
Basically, running the GPU with half its cylinders.

Unless the user pays the premium for a dual channel configuration, or has the option to manually add the extra SO-DIMM stick later, performance on Intel Xe devices, or “UHD Graphics”, is *terrible*.
Most 3D games can’t run at playable framerates even at 0.5x handheld scaling.

To top it out, it’s very clear that Vulkan drivers are still a weak spot with Intel hardware.
It’s a lottery with each game. They may perform correctly, similar to their AMD and NVIDIA counterparts, or may have glaring issues. 
Some shaders, for example, outright crash the driver. We will report these issues to Intel as we find them.

Sadly, the usual solution of just running Linux is not a fix this time. Mesa support for Gen 12 Intel graphics hardware (Xe, Arc, etc) is still in very early stages, and the performance is usually in the sub-10 FPS territory.
We can’t wait to see Mesa once again show the Windows driver team how their job is done. 
Windows users, make sure to periodically update your drivers, as each release introduces major changes, so it’s critical to keep up.
Intel is finally caring about their GPU division with the release of Arc.
And finally, as a side note, Xe graphics are sensitive to the use of FSR. They lose a considerable amount of performance, so we strongly recommend using Scaleforce instead.

Now the good parts.
Getting a proper dual channel configuration not only doubles the available bandwidth, which is the most critical point of iGPU performance, but also raises the EU count to the proper Iris Xe spec you originally paid for.

Benchmarking shows that under these conditions, Xe graphics manage to surpass Vega iGPUs in yuzu, as long as the Intel Vulkan drivers cooperate.
It also shows that Xe graphics are more tolerant to SMAA than, for example, NVIDIA Pascal GPUs, being an almost free setting, performance wise.
This, coupled with the better IPC of Intel CPUs, should provide an edge on budget laptops.
At least, until AMD remembers that not everyone wants to pay a fortune for an RDNA2 integrated GPU and releases a refreshed low end lineup. I got tired of waiting.

As an extra juicy bonus, unlike Arc, the Intel iGPUs still have their amazing native ASTC texture decoder. 
This means no delays in ASTC heavy games like `Luigi’s Mansion 3`, `Bayonetta 3`, or `Astral Chain`. The almighty RTX 4090 can’t do that.

A small note regarding the ASTC support of Intel iGPUs.
Not all texture formats used by Switch games are supported by Intel, some will still need to be specially decoded.
Since these GPUs only have a single queue, Xe users should disable ASTC texture decoding from yuzu’s graphics settings. 
Most of the time the Xe GPU will be the bottleneck, and making it constantly switch between decoding textures and rendering the game will incur a performance loss.
Letting the CPU carry this work will help graphical performance. 
Finally some good use for those E-Cores.

For those that don’t fear noise or heat, tweaking the sliders in [XTU](https://www.intel.com/content/www/us/en/download/17881/29183/intel-extreme-tuning-utility-intel-xtu.html?) is an easy way to get an extra GHz out of their CPUs while plugged in. 
This can help double the performance in yuzu.

Unfortunately, Intel’s EoL status regarding Windows drivers is starting to affect compatibility with recent games, so we officially consider Gen 9/9.5/11 Intel GPUs to be out of support on yuzu.
This covers Gen 6 to 11 CPUs, Skylake to Ice Lake.
We will provide support and log issues for them only if they run on Linux. 
Or, well, macOS, once MoltenVK is fully working.

## Future projects

I’m still under a sort of “NDA” with the developers, so I’m not allowed to tell you what’s cooking yet, or else.

Our spies still managed to pass along a bit of information before going dark, `Project Lime`, a co-development between bunnei, Tobi, german77, and byte[].
Stay tuned for its official announcement.

`Project Gaia` continues to progress slowly, growing closer to the internal beta testing phase.
Some of its standalone features have already been tested:

{{< imgs
	"./gaia.png| This was a performance test to see how long it takes to load a game list"
  >}}

A bit of sad news for outdated hardware users: we have discussed plans to discontinue OpenGL.
Fixes and improvements that are critical for Vulkan are becoming a chore to port to OpenGL, and, as you’ve seen with the progress on MoltenVK support, we have to worry about new devices that depend exclusively on Vulkan. 
It won’t be very soon, but it’s time to consider getting a GPU with Vulkan support, you know, something made within the last 11 years.

That’s all folks!

Thank you for reading to the end.
And very special thanks to Mysterious Writer B, without their help, this article would have been seriously delayed.

{{< imgs
	"./byte.jpg| Out of the night, when the full moon is bright, comes a horseman known as B…"
  >}}

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
