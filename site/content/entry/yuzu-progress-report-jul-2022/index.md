+++
date = "2022-08-01T12:00:00-03:00"
title = "Progress Report July 2022"
author = "GoldenX86"
coauthor = "byte[]"
forum = 0
+++

Hi yuz-ers! What a month we had! Great graphical changes, an amazing audio rewrite, preliminary work on LDN support, new OpenGL drivers testing, and lots of fixes! Read along to find out more.

<!--more--> 

## Part 1 of Project Y.F.C.

As we’ve been righteously teasing you for months (and we will continue to do so) on previous articles, you know [Blinkhawk](https://github.com/FernandoS27) has been working on {{< gh-hovercard "8467" "a miscellaneous bunch of GPU related fixes and performance improvements." >}}
We have more information in its [dedicated article here]().

Since the scope of the project grew to too big proportions to handle, the team decided to split it in two parts, with the released first part focusing more on game fixes and improving accuracy.
While that doesn’t mean part 1 doesn’t already improve performance, part 2 will focus exclusively on it.

{{< single-title-imgs
    "Becoming playable! (Hades / Mario Golf: Super Rush)"
    "./hades.png"
    "./golf.png"
    >}}

This story started [many moons ago](https://www.youtube.com/watch?v=6IXecLOXWR4).
The awesome devs working on [Skyline Emulator](https://github.com/skyline-emu/skyline) finished implementing their `NVDRV` service, or Nvidia Driver service, and they offered it to us, as it is way more accurate than our old implementation.

{{< single-title-imgs-compare
	"YO-KAI WATCH 4, before and after"
	"./yokaibug.png"
	"./yokaifix.png"
>}}

The implemented changes in part 1 include:

Full rework of the GPU driver based on the reverse-engineering and code from Skyline Emulator with full permission from the respective team. Thanks Skyline!
Full rework of GPU memory management.
Initial implementation of GPU Channels, which fixes `Super Smash Bros. Ultimate` “World of Light” mode, `Deltarune`, and several other games.
Fixes and performance improvements to the GPU DMA engine.
Several fixes for Vulkan, the GPU Buffer Cache, and the Shader Decompiler, all of which affect multiple games.
Rework host frame presentation to be considerably smoother (improves `Xenoblade Chronicles` games).

{{< single-title-imgs
    "World of Light is now playable! (Super Smash Bros. Ultimate)"
    "./wol.png"
    "./wol2.png"
    >}}

A list of critical changes like this sadly includes regressions with it.
We’re working to solve such regressions, so expect a delay to see these changes implemented into Mainline while we sort things out and pave the way for part 2.
Remember to check the hovercard or the PR itself.

{{< single-title-imgs
    "Not all games are in perfect shape yet (The Witcher 3: Wild Hunt)"
    "./witcher.png"
    "./plaid.png"
    >}}

## Project Andio

Not a name we mentioned before, right? Well it was a surprise for us as well!
[Maide](https://github.com/Kelebek1) is behind this wonderful gift, {{< gh-hovercard "8545" "an almost complete rewrite of yuzu’s audio engine." >}}

The main driving force for this project was to solve the years old issues that have accumulated thanks to our very old initial audio implementation.
yuzu was missing many playback features, like audio effects, and the old code was too hard to maintain, making it impossible to keep up with the Switch's changes over the years.

{{< audio "./audiobug.mp3" >}}

{{< audio "./audiofix.mp3" >}}

Here's an example of `Metroid Dread` while underwater, you can notice the effects missing in the first recording, as if Samus was just out in the open.

Cleaner code allows developers to more easily stay up to date (the current implementation uses the changes introduced in firmware version 14.0.0), and should help introduce changes found by reverse engineering in the future.

The list of fixes is so big, it’s uncountable.
While over 15 official issues were fixed, it’s impossible to know how many undocummented issues are now gone too.

We plan to have a dedicated article for Andio in the near future where we will dig deeper into the changes introduced.

All users can enjoy Project Andio, both Mainline and Early Access!

## Preliminary work on Project London

Yes, [bunnei](https://github.com/bunnei), it’s London.

For those that didn’t catch on the name, Project **L**on**d**o**n** is our work to get LDN, or `Local Wireless` support into yuzu, including rooms to get online connectivity.

{{< gh-hovercard "8541" "Such rooms, and their corresponding user interface" >}} are what [Tobi](https://github.com/yuzu-emu/yuzu/pull/8541) has been working on.

{{< imgs
	"./lobby.png| Multiplayer rooms can be created, with chat functionality."
  >}}

The implementation is based on [Citra](https://citra-emu.org/), and while it’s already perfectly functional, it won’t be available for users until the network backend is ready.

{{< imgs
	"./puyo.png| How's SEGA nowdays? (Puyo Puyo Tetris)"
  >}}

Thankfully, as you can see above, internal testing has been positive under ideal conditions, so the “only” remaining work is on tweaking and bugfixing.
If only it was that simple…

An online service like this requires the transfer of network packets, so [ENet](http://enet.bespin.org/) is added as a dependency.

Stay tuned for future improvements on this work in progress!

## Core timing, or how to suffer so much with a fix

It has been an eventful month for a long-maligned corner of the yuzu codebase, generally referred to in hushed tones among developers as CoreTiming. CoreTiming may be the cause of many timing-related emulation issues in yuzu.

While reviewing Project Andio, Blinkhawk noted that one of his longstanding open pull requests, which implemented a more precise version of CoreTiming, fixed some audio corruption regressions in emulated games, and even fixed some games that were previously having issues with freezing, such as `Mario Strikers: Battle League`. 
With the new audio code being almost ready to go at that point, the team decided to get this pull request rebased and merged so we could have a new audio system without any regressions. 
The new CoreTiming implementation would use multiple host threads to wait for events, and should have been much better in theory.

However, it didn't fix everything. 
Maide found that there were still some lingering issues with audio callbacks not looping as precisely as they needed to. 
In yuzu, looping events previously used CoreTiming to reschedule themselves for an exact number of milliseconds after their execution, instead of when they were intended to be executed. 
This caused significant drifting and issues with the new audio renderer.
The usual victims were the most affected, users running CPUs with only 4 threads.

To fix this, Maide {{< gh-hovercard "8561" "reworked the way looping events were handled." >}}
Now, CoreTiming automatically computes the correct time to reschedule a looping event, making the implementation significantly more precise for those types of events. 
With the change to looping events in, and noticing that the other changes Blinkhawk had added were causing serious regressions, the team opted to {{< gh-hovercard "8531" "remove the multi-threaded host CoreTiming implementation," >}} and then {{< gh-hovercard "8591" "most of Blinkhawk's new implementation entirely," >}} as it was still causing serious performance problems for a subset of users.

But that wasn't all that changed for timing this month. 
Alder Lake (Gen. 12) CPU users on Windows have long been reporting noticeable clock drift in Super Smash Brothers Ultimate, but it got a lot worse since the NVNFlinger rewrite a few months ago. 
As previously reported, the resident bunnei rabbit mostly fixed this issue in a follow-up pull request which restored the (inaccurate) behaviour of the old implementation, and the clock drift issue improved significantly for those users.

Maide, not content to just improve audio, discovered that {{< gh-hovercard "8650" "the way yuzu's NVNFlinger implementation was waiting on buffers would drift," >}} due to the same problem that was previously fixed in CoreTiming! 
Instead of reimplementing the fix here as well, he modified NVNFlinger to use a timing callback, which fixed the drifting issues in SSBU, and also resolved many longstanding issues with frametime inconsistency. 
This also provides a significant performance boost in many games due to keeping the frametime presentation consistent, and allows `Fire Emblem Warriors: Three Hopes` to be playable.

{{< imgs
	"./ftold.png| Jumpy, visible stuttering"
  >}}

{{< imgs
	"./ftnew.png| Smooth as silk"
  >}}

{{< single-title-imgs
    "Time to smash those attack buttons (Fire Emblem Warriors: Three Hopes)"
    "./few3h.png"
    "./3hopes.png"
    >}}

Finally, [BreadFish64](https://github.com/BreadFish64) {{< gh-hovercard "8543" "implemented a way to read the exact TSC frequency of the host CPU." >}} 
The `TSC`, or timestamp counter, is a high precision timer measuring the number of base clock ticks by an Intel or AMD processor since boot. 
CoreTiming uses this value to emulate the ARM physical count register, which performs a similar role as the TSC for ARM devices, like the Switch. 
Getting the exact TSC frequency, as opposed to just estimating it, allows CoreTiming to avoid drifting here due to mismatch between the host frequency, which depends on your CPU, and the guest clock frequency, which is fixed to 19.2MHz.

More precision and faster boot times are never a bad thing!

## Kernel changes

While using the new debugger on games and homebrew, [comex](https://github.com/comex) spotted an issue causing yuzu to miss breakpoints in code that had already been run, or hit breakpoints which had already been deleted. 
[Merry](https://github.com/merryhime) investigated and discovered an inaccuracy in [Dynarmic's](https://github.com/merryhime/dynarmic) caching of code blocks. 
{{< gh-hovercard "8571" "Fixing the cache clearing, and calculating block hashes correctly" >}} fixes the issues with breakpoints being hit.

comex also observed an issue with watchpoints, where resuming execution after breaking on a watchpoint would seemingly fail to resume with the correct state. 
[byte[]](https://github.com/liamwhite) investigated the issue and found that it happened when Dynarmic failed to update the PC register inside watchpoint callbacks. 
Merry fixed this issue again by {{< gh-hovercard "8569" "completely rewriting Dynarmic's support for watchpoints, breaking immediately when necessary and avoiding almost all of the performance penalty of enabling watchpoints," >}} nice.

byte[] has also been hard at work fixing various kernel issues and inconsistencies during the past month, and this month was no exception. 
This time around, searching for the source of a mysterious freezing bug in `Super Mario Galaxy`, he rewrote the entire scheduler, bringing it in line with the current state of the art in reverse engineering of the Switch kernel. 
This fixed issues in a number of games, but most notably fixed the freezing issues users had in `Mario Strikers: Battle League` (once you use an [intro-skipping mod](https://github.com/piplup55/switch-mods/blob/master/mario%20strike%20battle%20league/cutscene%20skip.7z?raw=true)), and allowed a new game, `Mononoke Slashdown`, to boot for the first time.

{{< imgs
	"./strikers.png| Some graphical bugs are expected for now (Mario Strikers: Battle League)"
  >}}

{{< imgs
	"./mononoke.png| Mononoke Slashdown"
  >}}

While preparing the new scheduler for release, byte[] also noticed an inefficiency in the way guest threads were being emulated. To fix it, he {{< gh-hovercard "8532" "changed the process of starting fibers to use support for C++ language features, and significantly simplified the implementation." >}}

## GPU changes

Last month, [Behunin](https://github.com/behunin) contributed a new GPU queue implementation intended to improve the performance of submission handling from the emulated game. 
Some time after this, freezing issues in `Fire Emblem: Three Houses` started cropping up.
After a long trail of hunting, byte[] thought the issue had been found and fixed by pull requests [#8483](https://github.com/yuzu-emu/yuzu/pull/8483) and [#8538](https://github.com/yuzu-emu/yuzu/pull/8538), but more careful debugging revealed that the cause of the freeze was unfortunately from the new GPU queue implementation!
[Morph](https://github.com/Morph1984) stepped up and {{< gh-hovercard "8542" "reverted the use of the new queue implementation," >}} finally fixing the issue, at least for now.

{{< imgs
	"./feth.png| Don't ask (Fire Emblem: Three Houses)"
  >}}

Xenoblade Chronicles 3, one of the most anticipated Switch releases in a while, released, and to the dismay of the yuzu community, would crash on boot when using Vulkan. 
Due to differences in time zones, Maide was our first developer to lay hands on the new game, with byte[] lagging behind. 
Maide found that there were some Vulkan shaders that crashed the GPU driver when they were compiled. yuzu is different from most Vulkan programs, and it directly generates shaders in binary format to respond to the needs of the game's shaders, which can cause problems when the way yuzu translates a shader is different from the way a GLSL compiler would translate it. 
byte[] quickly helped Maide identify the sources of these shader compilation crashes and together, fixed both `FSwizzleAdd` and `ConvertDepthMode`, {{< gh-hovercard "8667" "allowing users to run the game in Vulkan…" >}}.

{{< single-title-imgs
    "Thank you Night for the amazing pics! (Xenoblade Chronicles 3)"
    "./xc31.png"
    "./xc32.png"
    "./xc33.png"
    "./xc34.png"
    "./xc3.png"
    >}}

We’re aware that AMD Radeon GPUs running on Windows still experience crashes with Vulkan at boot, this is caused because those drivers lack support for the `VK_FORMAT_R16G16B16_SFLOAT` texture format.
We implemented an alternative path emulating this format with a similar one to solve this issue. 
We’ll cover it more deeply in the next progress report, along with several other bugfixes for this amazing game.

Another of the various issues affecting this new release is an absurd level of memory usage when running in OpenGL.
Yuzu in the past cleaned shader sources after dealing with the shader.
Now, for some reason, this game manages to skip that check, 
In order to improve the ridiculous memory usage, byte[] {{< gh-hovercard "8684" "implemented `glDetachShader`," >}} a more “official” way to achieve the same result.
While this doesn’t solve the issue entirely, testing shows a 5GB reduction in RAM usage just from a single code line addition.

Let’s stay on the subject of GPU emulation for a bit longer.
We previously explained how [toastUnlimited](https://github.com/lat9nq) [implemented a status check system](https://yuzu-emu.org/entry/yuzu-progress-report-may-2022/#vulkan-by-default) to ensure good Vulkan compatibility when opening yuzu for the first time.

The original implementation worked by running a small Vulkan instance at boot, detecting if it crashed and saving the result in the configuration file.
The next boot after the crash, yuzu informs the user and locks itself to only offer OpenGL.
So two boots were required to get the whole picture, and a manual intervention by the user was needed to re-enable Vulkan as an option, pressing a button in yuzu’s configuration.

{{< gh-hovercard "8564" "This new approach" >}} uses a child process, only tasked with starting the Vulkan loader.
If the child crashes, the parent process marks the currently running instance of yuzu as not being Vulkan compatible.
This has the benefit of only having to run yuzu once to detect the current status.
If the user solves the issue (updates the drivers or any Vulkan layer application causing issues), only restarting yuzu is needed, as nothing is changed in the configuration files now.

This change helps users identify issues and stop potential crashes, but still, the general recommendations still apply, manually update your GPU drivers (never trust Windows Update), and keep any application that runs an overlay or records the screen in their latest version.

Moving on to more specific game fixes not related to GOAT Xenoblade Chronicles 3, our resident Kirby clone, Morph, {{< gh-hovercard "8528" "implemented a texture format" >}} `MONSTER HUNTER RISE` has been asking for, `ASTC_10x6_UNORM`.
That’s right, another ASTC format, your GPU will hate you while decoding it.

This doesn’t solve the rendering bugs we face with this game, but it makes things look a bit better!

{{< imgs
	"./mhr.png| Rise ye Tarnished! Wait, wrong game (MOSNTER HUNTER RISE)"
  >}}

## Linux Flatpak (Discovery) and AppImage fixes

While Flatpak is not the recommended way for yuzu users to enjoy their favourite Switch titles on Linux, due to lower performance and some missing desktop integration features, it is a great option for many Linux users who have Flatpak installed by default and want a low-friction way to get access to yuzu.
It has been the preferred choice by Steam Deck users since its release. 
As the reports from users rolled in, the team fixed some notable Flatpak-exclusive regressions this month.

But why were these issues Flatpak-exclusive, and not found in the regular Linux AppImage builds? 
Flatpak enables extra checks in the C++ standard library, which are aimed to catch buffer overflow errors before they happen, intending to help with debugging. 
Unfortunately, if a check fails, it causes yuzu to instantly crash, which makes it more difficult to debug the issue from yuzu's log files alone.

The switch to Vulkan by default caused games which used any CPU-based rendering to crash. 
If a game wants to render an image to the screen from the CPU, instead of the GPU, it will first convert the image into an optimized layout that the Switch GPU understands, and then ask the GPU to render the optimized image. 
To deal with this, yuzu undoes this layout conversion and uploads the data to the host GPU for presentation. 
byte[] discovered that due to the size of the optimized layout and the unoptimized layout being different, a subspan used in unoptimizing the layout would overflow, and cause the check to fail. 
The fix was simple: just {{< gh-hovercard "8611" "use the optimized size for the converted layer," >}} since it would always be larger.

{{< imgs
	"./wetbear.png| Thanks Wetbear for the pic!"
  >}}

It wouldn't be a proper yuzu pull request without a seemingly unrelated regression.
`Pokemon: Let's Go, Pikachu!/Eevee!` had a strange performance regression caused by byte[]'s previous change, where the framerate when attempting to play with Pikachu or Eevee would drop to approximately 7 frames per second. 
byte[] investigated it and found that using the larger size was causing re-optimizing a frame for the game to read back was now much slower, since it was now dealing with a much larger image. 
He then fixed it by {{< gh-hovercard "8658" "using different sizes for the optimized and unoptimized images," >}} finally putting these foolish performance issues to rest.

Project Andio introduced a few new regressions in the Flatpak builds as well. 
One of these was fixed in the pull request itself before it was merged. 

When decoding buffers which were input from the emulated game, it was possible for a span operation to overflow. 
Maide fixed this by being more careful about handling the sample buffers when decoding input. 
From user reports, there were still crashes, and Maide found a second issue {{< gh-hovercard "8657" "the `DepopPrepare` command, with another overflowing span." >}} 
Fixing this finally allowed users to enjoy the Flatpak builds once more. 
Flatpak Linux users rejoice!

{{< imgs
	"./flathub.png| Simple and covenient"
  >}}

But not only Flatpak gets a piece of the cake, there is some AppImage love too!

Vulkan detection is not only a Windows issue, it can also happen in free land.
toastUnlimited found out that the `libQt5Multimedia` library causes issues with Vulkan on AppImage builds.
Since the library is used, {{< gh-hovercard "8642" "excluding `libwayland-client`" >}} is the workaround in place for now.
We’ll evaluate the user response we get from this change and consider keeping it or removing libQt5Multimedia altogether.

[Docteh](https://github.com/Docteh) started working on {{< gh-hovercard "8625" "improving the environment variables used in our build process to give AppImages a proper title bar." >}}
Once this work is finished, the title bar should look exactly like on Windows builds.

## Input improvements

An unique feature of the Nintendo Switch is the capability to use infrared cameras installed on the right Joy-Con.
The main function of the cameras is to detect shapes and measure the distance to objects, but it can also be used to transmit a feed to screen, letting you turn your Joy-Con into a heat-seeking monstrosity. Fox-2!

Interested in adding this awesome feature to yuzu, and providing full support for games like `Game Builder Garage`, or the `Nintendo Labo` collection, [german77](https://github.com/german77) {{< gh-hovercard "8636" "emulated the clustering processor" >}} required to let the games access the camera on the Joy-Cons, or any camera the user wants to provide, even if it is a desktop capture obtained from OBS Studio.

{{< imgs
	"./ir.png| "
  >}}

Users wanting to play with this setting can find it in `Emulation > Configure… > Controls > Advanced tab > Infrared Camera`.

{{< imgs
	"./camera.png| "
  >}}

This work doesn’t include the moment processor required by `1-2-Switch!` yet

Steam Deck users reported having issues when using external controllers, but not while using the integrated Deck ones.
toastUnlimited hopped onto the issue and found out that the reason is the included prerelease [SDL2](https://www.libsdl.org/) version we’ve been using.
{{< gh-hovercard "8607" "Reverting to a slightly older version" >}} solved the issue.

A recent and very interesting community effort is to focus on adding online functionality to single player games, allowing for fun co-op opportunities not possible on the original game.
`Super Mario Odyssey` recently got a [mod that allows for this online functionality](https://github.com/CraftyBoss/SuperMarioOdysseyOnline), and the one of the things keeping yuzu from supporting it was the on-screen keyboard lacking a way to input an IP address!
Luckily Morph is on the case, and {{< gh-hovercard "8633" "implemented the necessary symbols" >}} to write the required IPv4 addresses by the online mod.

{{< imgs
	"./smoo.png| Up to 10 people at once! (Super Mario Odyssey)"
  >}}

[Link4565](https://github.com/Link4565) {{< gh-hovercard "8598" "implemented some required fixes" >}} in yuzu’s network services to improve compatibility with this awesome mod. 
Thank you very much!

Have fun ruining Bowser’s wedding!

## UI changes

A small regression from the [input rewrite](https://yuzu-emu.org/entry/yuzu-progress-report-nov-2021/#project-kraken) poked its nose just now. 
The WebApplet’s input bit was assumed incorrectly, causing user input to be completely ignored.
Thankfully, Morph {{< gh-hovercard "8536" "found the reason" >}} and implemented the fix.

Last month, Docteh [renamed](https://yuzu-emu.org/entry/yuzu-progress-report-jun-2022/#ui-changes) the status bar’s DOCKED status (redundancy, yeah!).
For consistency, [this dumb writer](https://github.com/goldenx86) decided to {{< gh-hovercard "8610" "do the same for the Controls configuration window," >}} for consistency.

{{< imgs
	"./dock.png| Boring change, who is responsible for this?"
  >}}

Sometimes correct functionality looks stalled to the user’s point of view due to how the UX (user experience) is presented, ask any new Linux user for example.
In this case, when loading an application, the shader progress bar at boot would look stuck if a game was started with no previous pipeline cache, or if a homebrew was booted.
Since this leads to confusion, byte[] decided that {{< gh-hovercard "8622" "it’s better to reset the status bar than let it remain stuck" >}} until the program finishes loading.
As said before, the devil is in the details

One of the available configurable hotkey options in `Emulation > Configure… > General > Hotkeys` is Audio Volume Up/Down.
Users have requested to tune the curve in how volume is changed so it’s more sensitive at the lower values. 
Human hearing senses volume in a logarithmic way instead of linear anyway, so it makes perfect sense.
german77 {{< gh-hovercard "8656" "added incremental steps" >}} the closer you are to 0% volume as a way to better copy how our flesh and bones bodies hear things.

## General bugfixes and improvements

A beautiful feature of tightly integrated systems is their wonderful control over suspend and resume, and the Steam Deck is no exception.
If you ever experienced issues with suspend and resume, you know what I mean.
Experienced developer [devsnek](https://github.com/devsnek) wants to help yuzu take advantage of this feature over the course of three {{< gh-hovercard "8585" "different" >}} {{< gh-hovercard "8592" "pull requests." >}}
This includes {{< gh-hovercard "8581" "emulating the actual suspend/resume mechanic of the Switch," >}} as some games make use of it as one of their gameplay features.
With these changes, users can suspend their games by simply pressing the power button of the Deck, exactly like on a Switch.
There’s a reason ||Naked|| Snake earned the name Big Boss!

For us people living in remote places, just suffering from terrible ISPs, or both (FML), we have fantastic news!
toastUnlimited reduced the size of each yuzu download by around 24MB by {{< gh-hovercard "8686" "only including what specifically belongs to yuzu" >}} in its source.
Those interested in building the bundled source that comes with the installer, must now do a `git submodule update --init --recursive` in order to be able to compile the project.

## Hardware section

This is a new section to communicate and discuss new relevant bugs, fixes and findings related to specific hardware that can affect the user experience with yuzu.

#### NVIDIA, missing the perfection that 472.12 was

[We mentioned last month](https://yuzu-emu.org/entry/yuzu-progress-report-jun-2022/#psa-for-amd-radeon-users-and-nvidia-tags-along) how the 516 series of drivers is detrimental to Maxwell and Pascal users, making Vulkan unstable.
We’re still debugging the issue, as it isn’t easy to catch, but a possible cause is suspected: GPU accelerated ASTC texture decoding.
If you own a Maxwell or Pascal GPU, must remain on the latest driver update, and want to test if you can make Vulkan stable again, try disabling `Accelerate ASTC Texture Decoding` in `Emulation > Configure… > Graphics`.
Please report your results in our [forums](https://community.citra-emu.org/c/yuzu-support/14) or [Discord server](https://discord.gg/u77vRWY).

Users with G-SYNC/FreeSync displays experiencing low performance (usually stuck at 24-30 FPS on any game) have a couple of ways to solve this issue:

Unfocus and refocus yuzu’s window each time you boot a game.
In yuzu, disable `View > Single Window Mode`.
Enable Exclusive Fullscreen from `Emulation > Configure.. > Graphics > Fullscreen Mode`. Then just play your games in fullscreen by pressing F11.

The issue is caused by some bad combination of running a Qt window inside another window, and NVIDIA’s way to detect framerate for windowed applications.
Removing any of the two solves the low framerate while using Variable Refresh Rate displays.

#### AMD, great news, for a chance

Hell froze over, pigs learned to fly, and starting with the Windows driver version 22.7.1, AMD introduced a completely new OpenGL driver, making Radeon cards on Windows viable to use both APIs, not just Vulkan.

Performance is close to 100% higher, or more in some titles, and many rendering bugs are fixed. But why write about it, it’s better to let the numbers do the talking:

{{< imgs
	"./perf.png| Thank you RodrigoTR!"
  >}}

{{< single-title-imgs
    "Thanks toastUnlimited!"
    "./xc2.png"
    "./botw.png"
    "./smo.png"
    "./psw.png"
    "./pla.png"
    "./md.png"
    "./mk8.png"
    >}}

Here are results of an RX 6600 and a GTX 1660 SUPER running all games in OpenGL. 22.6.1 represents the old OpenGL driver, 22.7.1 the new driver, Mesa is running radeonsi with the amdgpu kernel module for OpenGL, and RADV for Vulkan, and NVIDIA is running its currently latest Windows driver.
Remaining relevant hardware used is a 5600X and 16GB of RAM at 3600MHz, the GPU was run at PCIe 4.0 8x with Smart Access Memory enabled, although that won’t make a difference, more on that later. 
Operating systems used are Windows 11 and Manjaro Linux, both up to date on their respective default stable branches.
yuzu is on Mainline 1112, with GPU accuracy set to normal to make GPU driver bottlenecks easier to measure, 1X resolution multiplier and Default value for Anisotropic Filtering.

A single regression under investigation and reported to AMD aside (Xenoblade Chronicles 2 crashes loading Abble’s Fountain, the measuring spot, could be caused by some driver thread crash), performance is now very close to Vulkan numbers, be it either from AMD or Nvidia. 

It’s now perfectly valid for a Radeon user to switch to OpenGL if a specific game requires it, like for example with Xenoblade Chronicles 3, or an Unity/Unreal Engine based game (SHIN MEGAMI TENSEI V).
As a bonus, while not being very stable, the SPIR-V shader back-end can be used on games with “simple” shaders like Super Smash Bros. Ultimate or Super Mario Odyssey, making shader building much more tolerable when compared to GLSL, giving it a performance much closer to the Nvidia-only GLASM.

Another lesson learned from this is that some games, like Legend of Zelda: Breath of the Wild, just outright prefer Nvidia’s mature OpenGL driver. Ara ara.

Lastly, to end this Red Team section.
[In the past](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2022/#vulkan-is-the-future) we reported a way to defeat RDNA2’s overcorrecting power manager in order to get decent framerates.
This method, while simple, has a downside: It’s an overclock.
Or at least counts as one.

We found an alternative that should be more globally applicable.
The trick this time is to make the driver force high clocks on a more important section of the GPU when speaking about emulation performance in general: GPU VRAM.
All this while keeping the warranty in check.

The process is simple, make the integrated video encoder work in the background while yuzu (or any other emulator) runs.
This is easily achieved from Radeon Software by going to `Settings > Record & Stream` and enabling `Instant Replay`.
Intel/Linux owners should be able to reach similar results by instead using the Xbox Game Ba, or [setting OBS to keep a buffer](https://obsproject.com/forum/resources/instant-replay.575/).

{{< imgs
	"./instantreplay.png| A driver toggle for power management would be so much simpler"
  >}}

Then on yuzu, enable Exclusive Fullscreen from `Emulation > Configure.. > Graphics > Fullscreen Mode`.
Then just play your games in fullscreen by pressing F11.
This step can be avoided if you also enable `Record Desktop`, but keep in mind this would increase your power consumption even while doing nothing.

The performance gains are the same as with the previous overclocking method, up to 73% in GPU bottlenecked titles.

RX 6500 XT and RX 6400 users, since you lack a video encoder in the first place, refer to our original method mentioned at the start, or ask for a refund.

#### Intel, being Intel

Intel [recently announced](https://community.intel.com/t5/Graphics/Graphics-Driver-Support-Update-for-10th-Generation-and-Older/m-p/1403969/thread-id/108899) that their Windows driver for Gen. 9, Gen. 9.5, and Gen. 11 GPUs (that is any CPU based on the 14nm Skylake architecture and all its many marketing renames, plus Ice Lake) is now in “legacy software support”, which basically means they are officially dead.
While this doesn’t affect yuzu immediately, any new Vulkan features we add in the future could potentially break functionality in a similar way to what happened with old AMD GCN hardware last year.
This leaves integrated Intel GPU users with a single alternative, Linux, which offers support for even older hardware.
For example, an ancient HD 4000 can *run* yuzu with the Mesa drivers.

Users should consider learning Linux if a hardware upgrade is not a viable option in the near future, Mesa always offered better performance for Intel GPUs.

## Future projects

Part 2 of `Project Y.F.C.` is a bit delayed for now, real life issues, but its feature list and expected progression is laid out.

`Project London` is progressing in a healthy fashion, we loved the internal testing done so far.

We recently revived our Linux EA support, and are now testing {{< gh-hovercard "8667" "publishing Early Access AppImage builds" >}} for Patreon subscribers! 
In the coming months, we should also have an installer available, which will automatically update yuzu as new EA releases are made.

And a possibility has just recently started to open for even better GPU performance in the (not so near) future. 
`GPU fastmem` is one of the features that Rodrigo had to leave for later, before passing the torch and moving onto “greener sides”.
The main roadblock holding GPU fastmem was driver support, which is now a mostly solved issue, we *only* need to start talks with the AMD, Intel, and the AMD Linux kernel module developers to ask for some increased limits.
Once those obstacles are out of the way, yuzu should for example be able to take partial advantage of Resizable BAR/Smart Access Memory, helping reduce PCIe bottlenecks, and should help improve particle rendering to make GPU accuracy a less critical performance setting.
No pressure, Blinkhawk!

That’s all folks! This one turned out to be longer than expected. Thank you for staying until the end, and we hope to see you again next month!
Thank you NazD for the summary pic!

~~Movistar, you can go to hell.~~

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
