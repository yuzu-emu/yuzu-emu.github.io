+++
date = "2022-08-15T12:00:00-03:00"
title = "Progress Report July 2022"
author = "GoldenX86"
forum = 614640
+++

Hello yuz-ers, what a month we've had! Great graphical changes, an amazing audio rewrite, preliminary work on LDN support, testing new OpenGL drivers, and plenty of fixes! Continue reading to find out more.

<!--more--> 

## Part 1 of Project Y.F.C.

Since we’ve been teasing you for months (and we will continue to do so) in previous articles, you know [Blinkhawk](https://github.com/FernandoS27) has been working on {{< gh-hovercard "8467" "a bunch  of miscellaneous GPU related fixes and performance improvements." >}}
While we will have more information in a dedicated article in the near future, please enjoy the following brief overview.

As the scope of the project grew, the team decided to split it in two parts, with the released first part focusing more on game fixes and improving accuracy.
While that doesn’t mean part 1 doesn’t already improve performance, part 2 will focus exclusively on it.

{{< single-title-imgs
    "Becoming playable! (Hades & Mario Golf: Super Rush)"
    "./hades.png"
    "./golf.png"
    >}}

This story started [many moons ago](https://www.youtube.com/watch?v=6IXecLOXWR4).
The awesome devs working on [Skyline Emulator](https://github.com/skyline-emu/skyline) finished implementing their `NVDRV` service (NVIDIA Driver service) and they offered it to us, as it is much more accurate than our old implementation.

{{< single-title-imgs-compare
	"YO-KAI WATCH 4, before and after"
	"./yokaibug.png"
	"./yokaifix.png"
>}}

The implemented changes in part 1 of Project Y.F.C. include:

 * Full rework of the GPU driver, based on the reverse-engineering and code from Skyline Emulator with full permission from the respective team.
 * Full rework of GPU memory management.
 * Initial implementation of GPU Channels, fixing `Super Smash Bros. Ultimate` “World of Light” mode, `Deltarune`, and several other games.
 * Bug fixes and performance improvements to the GPU DMA engine.
 * Several fixes for Vulkan, the GPU Buffer Cache, and the Shader Decompiler, all of which affect multiple games.
 * Reworked host frame presentation to be considerably smoother (improves `Xenoblade Chronicles` games).

{{< single-title-imgs
    "The World of Light single-player mode is now playable! (Super Smash Bros. Ultimate)"
    "./wol.png"
    "./wol2.png"
    >}}

A large list of critical changes like this, sadly, brings regressions with it.
We’re working to resolve these regressions, but Blinkhawk is busy with IRL things, so expect a delay to see these changes implemented into Mainline while we sort things out and pave the way for part 2.
(Remember: you can check the hovercard or the PR itself to see its merge status!)

{{< single-title-imgs
    "Not all games are in perfect shape... yet! (The Witcher 3: Wild Hunt)"
    "./witcher.jpg"
    "./plaid.jpg"
    >}}

## Project Andio

Not a name we've mentioned before, right? Well, it was a surprise for us as well!
[Maide](https://github.com/Kelebek1) is behind this wonderful gift: {{< gh-hovercard "8545" "an almost complete rewrite of yuzu’s audio engine." >}}

The main driving force behind this project was to resolve the multi-year old issues that have accumulated thanks to our very old initial audio implementation.
yuzu was missing many playback features, such as audio effects. But the old code was too hard to maintain, making it impossible to keep up with the Switch's updates over the years.

Here is a before and after of `Metroid Dread` while underwater. You can notice the effects missing in the first recording, as if Samus was just out in the open.

{{< audio "./audiobug.mp3" >}}

{{< audio "./audiofix.mp3" >}}


Cleaner code allows developers to more easily stay up to date (the current implementation uses the changes introduced in firmware version 14.0.0), and should help introduce changes found by reverse engineering in the future.

The list of fixes is so large, it’s practically countless.
While over 15 official issues were fixed, it’s impossible to know how many undocumented issues have been resolved.

We plan to have a dedicated article for Andio in the near future where we will dig deeper into the changes introduced.

All users can enjoy the benefits of Project Andio, available in both Mainline and Early Access!

## Preliminary work on Project London

Yes, [bunnei](https://github.com/bunnei), it’s London.

For those that didn’t catch on to the name, Project **L**on**d**o**n** is our work to get LDN (Local Wireless) support into yuzu, including hosted rooms for online connectivity.

{{< gh-hovercard "8541" "Such rooms, and their corresponding user interface," >}} are what [Tobi](https://github.com/yuzu-emu/yuzu/pull/8541) has been working on.

{{< imgs
	"./lobby.png| Multiplayer rooms can be created, with chat functionality."
  >}}

The implementation is based on [Citra](https://citra-emu.org/), and while it’s already perfectly functional, it won’t be available for users until the network backend is ready.

{{< imgs
	"./puyo.png| How's SEGA nowdays? (Puyo Puyo Tetris)"
  >}}

Thankfully, as you can see above, internal testing has been positive under ideal conditions, so the “only” remaining work is tweaking and bug fixing.
If only it were that simple…

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
Intel Alder Lake (Gen. 12) CPU users on Windows have long been reporting noticeable clock drift in `Super Smash Bros. Ultimate`, but it got a lot worse since the NVNFlinger rewrite a few months ago. 
As previously reported, the resident bunnei rabbit mostly fixed this issue in {{< gh-hovercard "8428" "a follow-up pull request" >}} which restored the (inaccurate) behaviour of the old implementation, and the clock drift issue improved significantly for those users.

Maide, not content to just improve audio, discovered that {{< gh-hovercard "8650" "the way yuzu's NVNFlinger implementation was waiting on buffers would drift," >}} due to the same problem that was previously fixed in CoreTiming! 
Instead of reimplementing the fix here as well, he modified NVNFlinger to use a timing callback, which fixed the drifting issues in SSBU, and also resolved many longstanding issues with frametime inconsistency. 
This also provides a significant performance boost in many games due to keeping the frametime presentation consistent, and allows `Fire Emblem Warriors: Three Hopes` to be playable.

{{< imgs
	"./ftold.png| Jumpy, visible stuttering"
  >}}

{{< imgs
	"./ftnew.png| Flat, smooth as silk"
  >}}

{{< single-title-imgs
    "Time to smash those attack buttons (Fire Emblem Warriors: Three Hopes)"
    "./few3h.jpg"
    "./3hopes.jpg"
    >}}

Finally, [BreadFish64](https://github.com/BreadFish64) {{< gh-hovercard "8543" "implemented a way to read the exact TSC frequency of the host CPU." >}} 
The `TSC` (timestamp counter) is a high precision timer measuring the number of base clock ticks performed by an Intel or AMD processor since boot. 
CoreTiming uses this value to emulate the ARM physical count register, which performs a similar role as the `TSC` for ARM devices, like the Switch. 
Getting the exact `TSC` frequency, as opposed to just estimating it, allows CoreTiming to avoid drifting due to mismatch between the host frequency, which depends on your CPU and the guest clock frequency, which is fixed to 19.2MHz.

More precision and faster boot times are never a bad thing!

## Kernel changes

While using the new debugger on games and homebrew, [comex](https://github.com/comex) spotted an issue causing yuzu to miss breakpoints in code that had already been run, or hit breakpoints which had already been deleted. 
[Merry](https://github.com/merryhime) investigated and discovered an inaccuracy in [Dynarmic's](https://github.com/merryhime/dynarmic) caching of code blocks. 
{{< gh-hovercard "8571" "Fixing the cache clearing and calculating block hashes correctly" >}} fixes the issues with breakpoints being hit.

comex also observed an issue with watchpoints, where resuming execution after breaking on a watchpoint would seemingly fail to resume with the correct state. 
[byte[]](https://github.com/liamwhite) investigated the issue and found that it happened when Dynarmic failed to update the PC register inside watchpoint callbacks. 
Merry fixed this issue again by {{< gh-hovercard "8569" "completely rewriting Dynarmic's support for watchpoints," >}} now breaking immediately when necessary and avoiding almost all of the performance penalty of enabling watchpoints. Nice!

byte[] has also been hard at work fixing various kernel issues and inconsistencies throughout June, and this month is no exception. 
This time around, while searching for the source of a mysterious freezing bug in `Super Mario Galaxy`, he rewrote the entire scheduler and brought it in line with the current state of the art in reverse engineering of the Switch kernel. 
This fixed issues in a number of games, but most notably fixed the freezing issues users had in `Mario Strikers: Battle League` (once you use an [intro-skipping mod](https://github.com/piplup55/switch-mods/blob/master/mario%20strike%20battle%20league/cutscene%20skip.7z?raw=true)), and allowed `Mononoke Slashdown` to boot for the first time.

{{< imgs
	"./strikers.jpg| Some graphical bugs are expected for now (Mario Strikers: Battle League)"
  >}}

{{< imgs
	"./mononoke.png| Mononoke Slashdown"
  >}}

While preparing the new scheduler for release, byte[] also noticed an inefficiency in the way guest threads were being emulated. To fix it, he changed the {{< gh-hovercard "8532" "process of starting fibers" >}} to use support for C++ language features, and significantly simplified the implementation.

## GPU changes

Last month, [Behunin](https://github.com/behunin) contributed a new GPU queue implementation intended to improve the performance of submission handling from the emulated game. 
Some time after this, freezing issues in `Fire Emblem: Three Houses` started cropping up.
After a long trail of hunting, byte[] thought the issue had been found and fixed by pull requests [#8483](https://github.com/yuzu-emu/yuzu/pull/8483) and [#8538](https://github.com/yuzu-emu/yuzu/pull/8538), but more careful debugging revealed that the cause of the freeze was unfortunately from the new GPU queue implementation!
[Morph](https://github.com/Morph1984) stepped up and {{< gh-hovercard "8542" "reverted the use of the new queue implementation," >}} finally fixing the issue, at least for now.

{{< imgs
	"./feth.png| Don't ask (Fire Emblem: Three Houses)"
  >}}

`Xenoblade Chronicles 3`, one of the most anticipated Switch releases in a while, released, and to the dismay of the yuzu community, would crash on boot when using Vulkan. 
Due to differences in time zones, Maide was our first developer to lay hands on the new game, with byte[] lagging behind. 
Maide found that there were some Vulkan shaders that crashed the GPU driver when they were compiled. yuzu is different from most Vulkan programs, and it directly generates shaders in binary format to respond to the needs of the game's shaders, which can cause problems when the way yuzu translates a shader is different from the way a GLSL compiler would translate it. 
byte[] quickly helped Maide identify the sources of these shader compilation crashes and, together, fixed both `FSwizzleAdd` and `ConvertDepthMode`, {{< gh-hovercard "8667" "allowing users to run the game in Vulkan." >}}

{{< single-title-imgs
    "Thank you Night for the amazing pics! (Xenoblade Chronicles 3)"
    "./xc31.png"
    "./xc32.png"
    "./xc33.png"
    "./xc34.png"
    "./xc3.png"
    >}}

We’re aware that AMD Radeon GPUs running on Windows still experience crashes with Vulkan at boot. This is because those drivers lack support for the `VK_FORMAT_R16G16B16_SFLOAT` texture format.
We implemented an alternative path emulating this format with a similar one to solve this issue. 
We’ll cover it more deeply in the next progress report, along with several other bugfixes for this amazing game.

Another of the various issues affecting this new release is an absurd level of memory usage when running in OpenGL.
yuzu, in the past, cleaned shader sources after dealing with the shader.
Now, for some reason, this game manages to skip that check. 
In order to improve the ridiculous memory usage, byte[] {{< gh-hovercard "8684" "implemented" >}} `glDetachShader`, a more “official” way to achieve the same result.
While this doesn’t solve the issue entirely, testing shows a 5GB reduction in RAM usage from just a single code line addition.

Let’s stay on the subject of GPU emulation for a bit longer.
In a past Progress Report, we explained how [toastUnlimited](https://github.com/lat9nq) [implemented a status check system](https://yuzu-emu.org/entry/yuzu-progress-report-may-2022/#vulkan-by-default) to ensure good Vulkan compatibility when opening yuzu for the first time.

The original implementation worked by running a small Vulkan instance at boot, detecting if it crashed, and saving the result in the configuration file.
On the next boot after the crash, yuzu informs the user and locks itself to only offer OpenGL.
This required two boots to get the whole picture, and a manual intervention by the user was needed to re-enable Vulkan as an option, pressing a button in yuzu’s configuration.

{{< gh-hovercard "8564" "This new approach" >}} uses a child process that is only tasked with starting the Vulkan loader.
If the child process crashes, the parent process marks the currently running instance of yuzu as not being Vulkan compatible.
This has the benefit of only having to run yuzu once to detect the current status.
If the user solves the issue (updating the drivers or any Vulkan layer application causing issues), only restarting yuzu is needed as nothing is changed in the configuration files now.

This change helps users identify issues and stop potential crashes, but the general recommendations still apply: manually update your GPU drivers (never trust Windows Update), and keep any application that runs an overlay or records the screen updated to their latest version.

Moving on to more specific game fixes not related to GOAT `Xenoblade Chronicles 3`, our resident Kirby clone, Morph, {{< gh-hovercard "8528" "implemented a texture format" >}} `MONSTER HUNTER RISE` has been asking for: `ASTC_10x6_UNORM`.
That’s right, another `ASTC` format. Your GPU will hate you while decoding it.

This doesn’t solve the rendering bugs we face with this game, but it makes things look a bit better!

{{< imgs
	"./mhr.jpg| Rise ye Tarnished! Wait, wrong game (MONSTER HUNTER RISE)"
  >}}

## Linux Flatpak (Discover) and AppImage fixes

While Flatpak is not the recommended way for our users to enjoy their favourite Switch titles on Linux, due to lower performance and some missing desktop integration features, it is a great option for many Linux users who have Flatpak installed by default and want a low-friction way to get access to yuzu.
It has been the preferred choice by Steam Deck users since its release. 
As the reports from users rolled in, the team fixed some notable Flatpak-exclusive regressions this month.

But why were these issues Flatpak-exclusive, and not found in the regular Linux AppImage builds? 
Flatpak enables extra checks in the C++ standard library, which are aimed to catch buffer overflow errors before they happen, intending to help with debugging. 
Unfortunately, if a check fails, it causes yuzu to instantly crash, which makes it more difficult to debug the issue from yuzu's log files alone.

The switch to Vulkan by default caused games which used any CPU-based rendering to crash. 
If a game wants to render an image to the screen from the CPU, instead of the GPU, it will first convert the image into an optimized layout that the Switch GPU understands, and then ask the GPU to render the optimized image. 
To deal with this, yuzu undoes this layout conversion and uploads the data to the host GPU for presentation. 
byte[] discovered that due to the size of the optimized layout and the unoptimized layout being different, a subspan used in unoptimizing the layout would overflow and cause the check to fail. 
The fix was simple: just {{< gh-hovercard "8611" "use the optimized size for the converted layer," >}} since it would always be larger.

{{< imgs
	"./wetbear.png| Thanks Wetbear for the pic!"
  >}}

It wouldn't be a proper yuzu pull request without a seemingly unrelated regression.
`Pokémon: Let's Go, Pikachu!/Eevee!` had a strange performance regression caused by byte[]'s previous change, where the framerate when attempting to play with Pikachu or Eevee would drop to approximately 7 frames per second. 
byte[] investigated it and found that using the larger size caused the process of re-optimizing a frame for the game to read back to be much slower, since it was now dealing with a much larger image. 
He then fixed it by {{< gh-hovercard "8658" "using different sizes for the optimized and unoptimized images," >}} finally putting these foolish performance issues to rest.

Project Andio introduced a few new regressions in the Flatpak builds as well. 
One of these was fixed in the pull request itself before it was merged. 

When decoding buffers which were input from the emulated game, it was possible for a span operation to overflow. 
Maide fixed this by being more careful about handling the sample buffers when decoding input. 
From user reports, there were still crashes, and Maide found an issue with {{< gh-hovercard "8657" "the `DepopPrepare` command, causing another overflowing span." >}} 
Fixing this finally allowed users to enjoy the Flatpak builds once more. 
Flatpak Linux users rejoice!

{{< imgs
	"./flathub.png| Simple and convenient"
  >}}

Flatpak isn't the only one to get a piece of the cake, AppImage receives some love too!

Vulkan detection is not only a Windows issue, it can also happen in [free land](https://www.linuxfoundation.org/).
toastUnlimited found out that the `libQt5Multimedia` library causes issues with Vulkan in AppImage builds.
Since the library is used, {{< gh-hovercard "8642" "excluding `libwayland-client`" >}} is the workaround in place for now.
We’ll evaluate the user response we get from this change and consider keeping it or removing `libQt5Multimedia` altogether.

[Docteh](https://github.com/Docteh) started working on {{< gh-hovercard "8625" "improving the environment variables" >}} used in our build process to give AppImages a proper title bar.
Once this work is finished, the title bar should look identical to Windows builds.

## Input improvements

A unique feature of the Nintendo Switch is the capability to use infrared cameras installed in the right Joy-Con.
The main function of the cameras is to detect shapes and measure the distance to objects, but it can also be used to transmit a feed to a screen, letting you turn your Joy-Con into a heat-seeking monstrosity. [Fox-2](https://en.wikipedia.org/wiki/Fox_(code_word))!

Interested in adding this awesome feature to yuzu, and providing full support for games like `Game Builder Garage` or the `Nintendo Labo` collection, [german77](https://github.com/german77) {{< gh-hovercard "8636" "emulated the clustering processor" >}} required to let the games access the camera on the Joy-Cons or any camera the user wants to provide, even if it is a desktop capture obtained from OBS Studio.

{{< imgs
	"./ir.png| While this looks like a homebrew app, it's in fact the real IR interface Nintendo provides for its games"
  >}}

Users wanting to play with this setting can find it in `Emulation > Configure… > Controls > Advanced tab > Infrared Camera`.

{{< imgs
	"./camera.png| What a sleek little menu"
  >}}

This work doesn’t include the moment processor required by `1-2-Switch!` just yet.

Steam Deck users reported having issues when using external controllers, but not while using the integrated Deck controls.
toastUnlimited hopped onto the issue and found that the reason is the included prerelease [SDL2](https://www.libsdl.org/) version we’ve been using.
{{< gh-hovercard "8607" "Reverting to a slightly older version" >}} solved the issue.

A recent and very interesting community effort is to focus on adding online functionality to single player games, allowing for fun co-op opportunities not possible in the original game.
`Super Mario Odyssey` recently received a [mod that allows for this online functionality](https://github.com/CraftyBoss/SuperMarioOdysseyOnline), and the one thing keeping yuzu from supporting it was the on-screen keyboard lacking a way to input an IP address!
Luckily, Morph was on the case and {{< gh-hovercard "8633" "implemented the necessary symbols" >}} to input the required IPv4 addresses by the online mod.

{{< imgs
	"./smoo.png| Up to 10 people at once! (Super Mario Odyssey)"
  >}}

[Link4565](https://github.com/Link4565) {{< gh-hovercard "8598" "implemented some required fixes" >}} in yuzu’s network services to improve compatibility with this awesome mod. 
Thank you very much!

Have fun ruining Bowser’s wedding!

## UI changes

A small regression from the [input rewrite](https://yuzu-emu.org/entry/yuzu-progress-report-nov-2021/#project-kraken) revealed itself just now. 
The WebApplet’s input bit was assumed incorrectly, causing user input to be completely ignored.
Thankfully, Morph {{< gh-hovercard "8536" "found the reason" >}} and implemented the fix.

Last month, Docteh [renamed](https://yuzu-emu.org/entry/yuzu-progress-report-jun-2022/#ui-changes) the status bar’s DOCKED status (redundancy, yeah!).
For consistency, [this dumb writer](https://github.com/goldenx86) decided to {{< gh-hovercard "8610" "do the same for the Controls configuration window," >}} for consistency.

{{< imgs
	"./dock.png| Boring change, who is responsible for this?"
  >}}

Sometimes something "functioning as designed" can look stalled from the user’s point of view due to how the UX (user experience) is presented, ask any new Linux user for example.
In this case, when loading an application, the shader progress bar at boot would appear stuck if a game was started with no previous pipeline cache or if a homebrew was booted.
Since this leads to confusion, byte[] decided that {{< gh-hovercard "8622" "it’s better to reset the status bar" >}} than let it remain stuck until the program finishes loading.
As said before, the devil is in the details.

One of the available configurable hotkey options in `Emulation > Configure… > General > Hotkeys` is `Audio Volume Up/Down`.
Users have requested to tune the curve in how volume is changed so that it’s more sensitive at lower values. 
Human hearing senses volume logarithmically instead of linearly, so it makes perfect sense.
german77 {{< gh-hovercard "8656" "added incremental steps" >}} the closer you are to 0% volume as a way to better copy how our flesh and bone bodies perceive the world.

## General bugfixes and improvements

A beautiful feature of tightly integrated systems is their wonderful control over suspend and resume, and the Steam Deck is no exception.
If you've ever experienced issues with suspend and resume, you know what I mean.
Experienced developer [devsnek](https://github.com/devsnek) wants to help yuzu take advantage of this feature over the course of three {{< gh-hovercard "8585" "different" >}} {{< gh-hovercard "8592" "pull requests." >}}
This includes {{< gh-hovercard "8581" "emulating the actual suspend/resume mechanic of the Switch," >}} as some games make use of it as one of their gameplay features.
With these changes, users can suspend their games by simply pressing the power button of the Deck, exactly like on a Switch.

For those of us living in remote places, suffering from terrible ISPs, or both (FML), we have fantastic news!
toastUnlimited reduced the size of each yuzu download by around 24MB by {{< gh-hovercard "8686" "only including what specifically belongs to yuzu" >}} in its source.
Those interested in building the bundled source that comes with the installer must now run `git submodule update --init --recursive` in order to be able to compile the project.

## Hardware section

This is a new section to communicate and discuss new relevant bugs, fixes, and findings related to specific hardware that can affect the user experience within yuzu.

#### NVIDIA, missing the perfection that 472.12 was

[We mentioned last month](https://yuzu-emu.org/entry/yuzu-progress-report-jun-2022/#psa-for-amd-radeon-users-and-nvidia-tags-along) how the 516 series of drivers is detrimental to Maxwell and Pascal users, making Vulkan unstable.
We’re still debugging the issue, as it isn’t easy to catch, but a possible cause is suspected: GPU accelerated `ASTC` texture decoding.
If you own a Maxwell or Pascal GPU, must remain on the latest driver update, and want to test if you can make Vulkan stable again, try disabling `Accelerate ASTC Texture Decoding` in `Emulation > Configure… > Graphics`.
Please report your results on our [forums](https://community.citra-emu.org/c/yuzu-support/14) or [Discord server](https://discord.gg/u77vRWY).

Another known issue caused by the 516 series of drivers is some funny flickering on trees in KOEI TECMO games like `Hyrule Warriors: Age of Calamity`.

{{< single-title-imgs
    "Day time party! NVIDIA Vulkan Left: 516.94 & Right: 512.95 (Hyrule Warriors: Age of Calamity)"
    "./aocbug.mp4"
    "./aoc.mp4"
    >}}
    
These issues could either be regressions or undocumented behaviour changes, possibly caused after following the API specification more rigorously.

There are also performance related issues affecting users with G-SYNC/FreeSync displays, causing low framerates (usually games get stuck at 24-30 FPS).
We have a few ways to bypass this issue:

1. Unfocus and refocus yuzu’s window each time you boot a game.
2. In yuzu, disable `View > Single Window Mode`.
3. Enable `Exclusive Fullscreen` from `Emulation > Configure.. > Graphics > Fullscreen Mode`. Then just play your games in fullscreen by pressing F11.

The root of the problem is caused by some bad combination of running a Qt window inside another window, and NVIDIA’s way of detecting the framerate of windowed applications.
Removing any of the two factors solves the low framerate while still taking advantage of Variable Refresh Rate.

#### AMD OpenGL, 25 years in the making

Hell froze over, pigs learned to fly, and starting with the Windows driver version 22.7.1, AMD introduced a completely new OpenGL driver, making Radeon cards on Windows viable options to use both APIs, not just cool kid Vulkan.
Performance is close to 100% higher, or more in some titles, and many rendering bugs are fixed. 
But why write about it, let the numbers do the talking:

{{< imgs
	"./perf.png| Thank you RodrigoTR!"
  >}}

Wow! That's a lot of numbers, let's try to make it easier to digest:

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

We're not experts in the benchmarking area, so hopefully the above graphs help.

Above are results of an RX 6600 and a GTX 1660 SUPER running a few games in OpenGL and Vulkan. 
22.6.1 represents the old infamous OpenGL driver, 22.7.1 is of course the new driver. Linux is represented by Mesa 22.1.3 running radeonsi with the amdgpu kernel module for OpenGL, and RADV for Vulkan. NVIDIA is running its latest (at the time of writing) Windows driver.
Remaining relevant hardware used is a 5600X and 16GB of RAM at 3600MHz. The RX 6600 was running at PCIe 4.0 8x with Smart Access Memory enabled, although that won’t make a difference, more on that later.
Operating systems used are Windows 11 and Manjaro Linux, both up to date and on their respective default stable branches.
yuzu is on Mainline 1112, with GPU accuracy set to normal to make GPU driver bottlenecks easier to measure, 1X resolution multiplier, and Default value for Anisotropic Filtering.

A single regression under investigation and reported to AMD aside (`Xenoblade Chronicles 2` crashes loading Abble’s Fountain, the measuring spot, could be caused by some driver thread crash), performance is now very close to Vulkan numbers, be it either from AMD or NVIDIA. 

It’s now perfectly valid for a Radeon user to switch to OpenGL if a specific game requires it, like for example with `Xenoblade Chronicles 3`, or a Unity/Unreal Engine based game (`SHIN MEGAMI TENSEI V`).
As a bonus, while not being very stable, the SPIR-V shader back-end can be used on games with “simple” shaders like `Super Smash Bros. Ultimate` or `Super Mario Odyssey`, making shader building much more tolerable when compared to GLSL, giving it a performance much closer to the Nvidia-only GLASM.

Another lesson learned from this is that some games, like `Legend of Zelda: Breath of the Wild`, just outright prefer NVIDIA's mature OpenGL driver. Ara ara.

Lastly, to end this Red Team section.
[In the past](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2022/#vulkan-is-the-future), we reported a way to defeat RDNA2’s overcorrecting power manager in order to get decent framerates.
This method, while simple, has a downside: It’s an overclock.
Or at least counts as one.

We found an alternative that should be more globally applicable.
The trick this time is to make the driver force high clocks on a more important section of the GPU when speaking about emulation performance in general: GPU VRAM.
All this while keeping the warranty in check.

The process is simple, make the integrated video encoder work in the background while yuzu (or any other emulator) runs.
This is easily achieved from Radeon Software by going to `Settings > Record & Stream` and enabling `Instant Replay`.
Intel/Linux owners should be able to reach similar results by instead using the Xbox Game Bar or [setting OBS to keep a buffer](https://obsproject.com/forum/resources/instant-replay.575/).

{{< imgs
	"./instantreplay.png| A driver toggle for power management would be so much simpler"
  >}}

After this, in yuzu enable Exclusive Fullscreen from `Emulation > Configure.. > Graphics > Fullscreen Mode`.
Then just play your games in fullscreen by pressing F11.
This step can be avoided if you also enable `Record Desktop`, but please keep in mind this will increase your power consumption even while idling.

The performance gains are the same as with the previous overclocking method, up to 73% in GPU bottlenecked titles.

RX 6500 XT and RX 6400 users, since you lack a video encoder in the first place, refer to our original method mentioned at the start, or ask for a refund.

#### Intel, killing support for 2 year old hardware

Intel [recently announced](https://community.intel.com/t5/Graphics/Graphics-Driver-Support-Update-for-10th-Generation-and-Older/m-p/1403969/thread-id/108899) that their Windows driver for Gen. 9, Gen. 9.5, and Gen. 11 GPUs (that is any CPU based on the 14nm Skylake architecture and all its many marketing renames, plus Ice Lake) is now in “legacy software support”, which in layman's terms means they are officially dead.
While this doesn’t affect yuzu immediately, any new Vulkan features we add in the future could potentially break functionality in a similar way to what happened with old AMD GCN hardware last year.
This leaves integrated Intel GPU users with a single alternative, Linux, which offers support for even older hardware.
For example, an ancient HD Graphics 4400 *can* run yuzu with the Mesa drivers.

Users should consider learning how to use Linux if a hardware upgrade is not a viable option in the near future, Mesa has always offered better performance for Intel GPUs.

## Future projects

Part 2 of `Project Y.F.C.` is a bit delayed for now, real life issues as previously mentioned, but its feature list and expected progression is laid out.

`Project London` is progressing in a healthy fashion, we loved the internal testing done so far.

And a possibility has just recently started to open for even better GPU performance in the (not so near) future. 
`GPU fastmem` is one of the features that [Rodrigo ](https://github.com/ReinUsesLisp) had to leave for later, before passing the torch and moving onto “greener sides”.

The main roadblock holding `GPU fastmem` back was driver support, which is now a mostly solved issue. We *only* need to start talks with the AMD, Intel, and the AMD Linux kernel module developers to ask for some increased limits.
Once those obstacles are out of the way, yuzu should, for example, be able to take partial advantage of Resizable BAR/Smart Access Memory, helping reduce PCIe bottlenecks, and should help improve particle rendering to make GPU accuracy a less critical performance setting.
No pressure, Blinkhawk!

That’s all folks! This one turned out to be longer than expected. Thank you for staying until the end, and we hope to see you again next month!
Thank you NazD for the summary pic!


&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
