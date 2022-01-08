+++
date = "2022-01-06T12:00:00-03:00"
title = "Progress Report December 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Yuz-ers! Welcome to the last progress report of 2021, released in 2022 because we still haven’t figured out how to travel back in time. 
We keep trying, but we’re running out of bananas to microwave and trash to fuel the Mr. Fusion.
December brought us improved kernel emulation, fixes for driver issues, improvements to input, rendering, overall stability, and more!

<!--more-->

## PSA for NVIDIA users, part 2

As mentioned [two months ago](https://yuzu-emu.org/entry/yuzu-progress-report-oct-2021/#psa-for-nvidia-users), NVIDIA users continued to have issues due to the 
changes introduced by the drop of support for Kepler cards in the 49X series of drivers when using GLSL.

We’re happy to announce that we have a [set of workarounds](https://github.com/yuzu-emu/yuzu/pull/7629) done by [epicboy](https://github.com/ameerj) that solve all 
known issues.
These are already available for both Mainline and Early Access.

The root of the problem in NVIDIA’s drivers seems to be in negation of integer and floating point values, and bitwise conversions of input values.

On previous drivers you could assign a value to a variable named `x`, then assign `-x` as the value to a new variable named `y`. 
`y` would be equal to `-1 * x`.
New drivers ignore this negation entirely, resulting in random spontaneous fires, security breaches, too many dogs causing a 
[Howl](https://www.youtube.com/watch?v=Jw0c9z8EllE), and total chaos.

The workaround is to simply subtract the value from 0. 
In our example, `y` would get the value of `0 - x`.

The bitwise conversion issue is more complex, but we talked about it in the past.
Back in August, 
[we mentioned how Intel had issues in Vulkan](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2021/#another-terrible-implementation-and-other-graphical-fixes) 
affecting Mario’s legendary moustache.

`GetAttribute` returns a float value, so a conversion is needed when working with integer ones.

The same issue that affected Intel GPUs now happens here on the “greener” side, but inverted. 
When using `instance_id`, old drivers accepted a float to unsigned integer conversion without issue, and you could do this conversion multiple times without losing the 
correct value.
The current drivers on the other hand can return zero.

Interpreting the value directly as unsigned integers now solves this issue in both GLSL and [GLASM](https://github.com/yuzu-emu/yuzu/pull/7630). 
Since this counts as an optimization, we now apply it to all APIs.

{{< single-title-imgs-compare
	"Back to the early days (Fire Emblem: Three Houses)"
	"./nvidiabug.png"
	"./nvidiafix.png"
>}}

Please report if you find any issues, as there could be more broken games due to yet unknown driver bugs.
On a similar note, more fixes should be coming to Vulkan too, if needed. 
One solved itself, most likely NVIDIA fixed it on the latest drivers.

## Other graphical fixes

Whenever a game played multiple videos at the same time, some of them would glitch and flicker.
This happened because yuzu was limited to decoding a single video stream at a time. 
Having multiple videos running at the same time would cause the decoder to receive frames that were sent from different video sources, confusing the interpolation algorithm 
and causing the aforementioned problems.
To prevent this issue from happening, [vonchenplus](https://github.com/vonchenplus) implemented a temporary solution that gives each video stream their own video decoder, 
sending the correct frame data only to the correct decoder.

{{< single-title-imgs
    "It still flickers, but that's the Chozo's fault (Metroid Dread)"
    "./mdbug.mp4"
    "./mdfix.mp4"
    >}}

[Morph](https://github.com/Morph1984) added the missing formats [R16G16_UINT](https://github.com/yuzu-emu/yuzu/pull/7544) and 
[ASTC_2D_8X5_UNORM](https://github.com/yuzu-emu/yuzu/pull/7549) to the Vulkan API, fixing the missing graphics on `Immortals Fenyx Rising` and `LEGO® CITY UNDERCOVER`, 
respectively.
(Please note that `Immortals Fenyx Rising` gets in game but has broken graphics at the moment).

{{< imgs
	"./lcu.png| I brick you not (LEGO® CITY UNDERCOVER)"
  >}}

[Blinkhawk](https://github.com/FernandoS27) [fixed a bug in the texture cache](https://github.com/yuzu-emu/yuzu/pull/7495) that was conveniently ignored by the AMD driver, 
but would cause Nvidia GPUs to crash when using the Vulkan API.
This crash happened when blitting textures with different format types, something that points to a problem in the texture cache that will be addressed in a future PR.

Blinkhawk also updated the Vulkan headers to introduce a [fix an extension and implemented logical operations](https://github.com/yuzu-emu/yuzu/pull/7599).
Both the extension and these logical operations are used by Vulkan to describe and process data, in order to compose the frames that will later be sent to the screen.
This PR fixes the sand and shadow graphical problems in The Legend of Zelda: Skyward Sword, and also the shadow problems in seen on Xenoblade Chronicles 2.

{{< single-title-imgs-compare
	"When you invert the polarity of your HDR display (Xenoblade Chronicles 2)"
	"./xc2bug.png"
	"./xc2fix.png"
>}}

epicboy took a look at the issues that affected games that made heavy use of sparse GPU memory, and [made the changes necessary](https://github.com/yuzu-emu/yuzu/pull/7658) 
to mitigate the problem.

Sparse memory is a technique to store data non-contiguously, which is a fancy way to say that data is broken down to small blocks and only the relevant bits are loaded 
into memory.
There was a bug in the code used to map this data into the memory, as the offsets needed to get the right address weren't being included in the calculations.
For the sake of precaution, he also added an extra guard that prevents modifying the memory address 0, as it is used as a placeholder to signal addresses that haven't 
been loaded in yet.

These changes are meant to address (no pun intended) issues related to the GPU memory management, and hopefully alleviate some stability complications related to it.
Notably, the crashes on titles developed with the `UE4` engine *(cough, True Goddess Reincarnation V or some such, cough)*.
The devs are still investigating any other oddities surrounding this game, so stay tuned for more updates.

{{< imgs
	"./ue4.png| These changes mitigate memory-related problems but are not guaranteed to “fix” them completely (SHIN MEGAMI TENSEI V)"
  >}}

Users reported crashes when playing `Sonic Colors Ultimate` on AMD and Intel GPUs on Vulkan after the resolution scaler was introduced.
epicboy quickly jumped in, to intervene and save the Blue Hedgehog.

On the red AMD side, our Blue Blur suffers from ImageView issues, causing an invalid pointer dereference when the `slot_images` container of the texture cache is resized, 
this can happen even at native resolution.
[Keeping a reference of the container](https://github.com/yuzu-emu/yuzu/pull/7622) solves it.

Intel’s blue team turn now.
The Intel Vulkan Windows driver strongly follows the specification when dealing with image blits. 
Khronos defines that [MSAA](https://en.wikipedia.org/wiki/Multisample_anti-aliasing) blits are not allowed, and while most drivers let this pass, Intel is being a good boy and 
crashes when trying to rescale MSAA textures.
Leaving aside that using traditional antialiasing on a mobile device like the Switch is a *crime against humanity* (you don’t waste extremely limited bandwidth on 
traditional antialiasing), the issue is solved by [rendering directly into the scaled image](https://github.com/yuzu-emu/yuzu/pull/7624) when rescaling by using the 3D pipeline.
The performance cost is higher (integrated GPUs like most Intel ones also hate traditional antialiasing), but it’s a price to pay to avoid crashing or losing the scaling.

{{< imgs
	"./sc.png| Colourful (Sonic Colors: Ultimate)"
  >}}

The texture cache has to handle several weird situations when dealing with rendering.
One of the aspects of the process is `overlaps`, when different textures compete for the same video memory space.
A bug in the texture cache's logic was found when an overlap occurs over relatively big distances in GPU memory, an overflow could happen leading to a wrongly massive texture 
trying to be rendered causing VRAM to fill up instantly and leading yuzu to a crash.
This issue was common in `BRAVELY DEFAULT II`.
Thanks to epicboy, [users no longer have to suffer this sudden crash](https://github.com/yuzu-emu/yuzu/pull/7659).

{{< single-title-imgs
    "BRAVELY DEFAULT II"
    "./bd1.png"
    "./bd2.png"
    >}}

## Skyline framework, Part 2

[itsmeft24](https://github.com/itsmeft24) submitted a patch to 
[implement the `ProcessMemory` and `CodeMemory` kernel SVCs](https://github.com/yuzu-emu/yuzu/pull/7519) (Supervisor Calls), which are some of the changes needed to support 
the [Skyline](https://github.com/skyline-dev/skyline) framework for modding.

Part of the ongoing work includes adding support in yuzu for all tiers of `subsdk`. 
Games can use subsdk tiers from 0 to 8, with 9 being free. 
Skyline uses subsdk9 to operate, so [jam1garner](https://github.com/jam1garner) included support for the remaining 
[two missing tiers in yuzu, 8 and 9](https://github.com/yuzu-emu/yuzu/pull/7523).

There are still a couple of things that need to be implemented before it's ready, but things are certainly getting close to be completed.

You can check the current progress [here](https://github.com/yuzu-emu/yuzu/issues/7392).

## Input changes

[german77](https://github.com/german77) has several fixes for us, and some important new additions.

Let’s kick things off with a great new feature for handheld PC users, couch players, and anyone not wanting to reach all the way to their keyboard while playing. 
For us lazy humans, german77 offers us: [Support for gamepad hotkeys](https://github.com/yuzu-emu/yuzu/pull/7633).

{{< imgs
	"./hotkeys.png| You can customize them"
  >}}

With this, users can customize button macros to for example access or exit fullscreen, unlock the framerate, pause/continue emulation, capture a screenshot (by 
default conveniently mapped to the capture button of the Nintendo controllers), close yuzu and more.

{{< single-title-imgs
    "Sorry about the bad quality"
    "./gamepad1.mp4"
    "./gamepad2.mp4"
    >}}

When a game starts, some internal testing is done to ensure that things are where they should and respond with an acceptable delay, one of those tests involves rumble.
Games prod the controllers with a low frequency rumble test, but sometimes, some games never stop and the controller continues to vibrate, depleting battery and making you 
doubt what was the original intention of the developer.
german77 [forces the rumble amplitude to zero after the test](https://github.com/yuzu-emu/yuzu/pull/7593), stopping unwanted vibrations only for these affected games.

VR games may use the gyroscope sensor on the Switch itself (not the controllers) to feed motion data.
Previously, yuzu would only give partial data to the game, causing erratic movements on the game’s camera.
german77 added [all missing data, including the gyro sensor](https://github.com/yuzu-emu/yuzu/pull/7481), to solve this issue. 

german77 also added support for the `SetNpadJoyAssignmentMode` series of services, removing some spam in the logs.
This change [also adds support for](https://github.com/yuzu-emu/yuzu/pull/7521) dual Joy-Con pairs with a single Joy-Con connected, which is somehow something that some 
games seem to do.

After the release of `Project Kraken`, the input rewrite, analog triggers were not accurate, a simple bug slipped by making them work only when sticks were moved. 
[Two lines of code change](https://github.com/yuzu-emu/yuzu/pull/7583), and the issue is no more.

german77 has also been working on trying to make `Ring Fit Adventure` playable.
While there is a lot of work ahead in adding support for the pressure sensor rings required by the game, and the usual aspects of emulation, some changes have been done already.
Most are mentioned later in the article.

One change that ends up benefiting all games is [controller type validation](https://github.com/yuzu-emu/yuzu/pull/7503), which ensures that the emulator can only 
accept controller types that the game supports, while discarding and disconnecting anything else.

A bug in the controller type validation code caused `Captain Toad: Treasure Tracker` to constantly spam the controller applet when trying two player mode.
Well, [not any more](https://github.com/yuzu-emu/yuzu/pull/7647), again thanks to german77.

{{< imgs
	"./toad.png| CO-OP tressure hunting, what else could you ask for? (Captain Toad: Treasure Tracker)"
  >}}

## Flatpak fixes

Following up from our previous mention [last month](https://yuzu-emu.org/entry/yuzu-progress-report-nov-2021/#graphical-fixes), [liushuyu](https://github.com/liushuyu) 
continues to fight against the weirdness of Flatpak.

[NVDEC requirements are now more flexible](https://github.com/yuzu-emu/yuzu/pull/7565), the CUDA libraries are no longer mandatory, without actually affecting CUDA 
decoding support. 
Also, ffmpeg requirements have been raised to version 4.3 and higher.
This should also enable native Vulkan video support later on when there is driver support for it.

With this, decoding crashes are solved when running Flatpak builds of yuzu.

liushuyu also solved an issue affecting the prevent sleep functionality on Flatpak.
[Implementing XDP’s Inhibit API solves the issue](https://github.com/yuzu-emu/yuzu/pull/7614), preventing the display from turning off at the worst moment while playing.

Additionally, Flatpak builds are compiled with asserts enabled, meaning that the emulator will be stopped when an assertion fails or an out-of-bound access inside a 
vector is encountered.
Appimage or regular Mainline/Early Access builds are shipped with asserts disabled.

While this usually isn’t an issue, Flatpak users reported crashes in `Pokémon Sword & Shield` when trying to set their uniform number.
Turns out, the on-screen keyboard (OSK) was doing an out-of-bounds access when calling the number pad.
Morph [pointed the OSK to the proper array](https://github.com/yuzu-emu/yuzu/pull/7579) and the crashing stopped.

{{< imgs
	"./numpad.png| Thank you RodrigoTR for the pic! (Pokémon Sword)"
  >}}

## General changes and bugfixes

[bunnei](https://github.com/bunnei) continues to work on the kernel rewrite, in order to increase the accuracy of our implementation.

This time, by simplifying a number of functions and polishing the tracking of resources, he introduced more changes to 
[improve the threading and scheduling kernel routines](https://github.com/yuzu-emu/yuzu/pull/7462).
These changes increase the parity with recent updates to the Nintendo Switch OS, and also fix a number of race conditions and crashes, such as the ones experimented in 
`Pokémon Sword & Shield` and `Dead or Alive Xtreme 3 Scarlet`.

bunnei also implemented [SetMemoryPermission](https://github.com/yuzu-emu/yuzu/pull/7621), and updated the implementation of 
[SetHeapSize](https://github.com/yuzu-emu/yuzu/pull/7635), which are SVCs used by the kernel to manage the memory resources.

Previously, `SetHeapSize` only supported setting the heap size and expand it, which was good enough for most games.
But since some titles (such as `Donkey Kong Tropical Freeze`) may shrink this size, the implementation was updated to allow games to change the heap as needed, making it 
more accurate.

Both these changes were validated with hardware tests, ensuring that they behave as expected.

While working on these changes, bunnei [found a bug in the service used to retrieve information of the currently executing process](https://gzithub.com/yuzu-emu/yuzu/pull/7616).
Correcting this behaviour allowed `The Witcher 3: Wild Hunt` to boot, although there are still plenty of graphical issues to fix on this title.

Blinkhawk also made a number of [changes to the building process](https://github.com/yuzu-emu/yuzu/pull/7497) to enforce more link time optimizations, and improve the
time needed to generate the `PDB` ([Program Database](https://llvm.org/docs/PDB/index.html)) file, which contains debug information.
If this mumbo-jumbo sounds confusing, the gist of this is that the process of building yuzu should produce more efficient code and smaller binaries now.
But feel free to skip the following paragraphs if you're not interested in the specifics.

Roughly speaking, compiler optimizations work on a "local" level per object.
This optimization step will [inline](https://en.wikipedia.org/wiki/Inline_expansion)) some functions, merge loops, put calling and called functions close in memory for 
better caching, etc.
But if a function defined in another file is called within the file, the compiler can't perform these optimizations, as it doesn't know what this external function does, 
or how to optimize it.

Link time optimizations, on the other hand, take into consideration all the functions in the project.
The linker, thus, is able to perform the same optimizations as the compiler, but more efficiently, as it is aware of the contents of all the functions defined in the project.
This comes at a price, since the process needs more memory and takes more time to finish, but it guarantees that the released binaries perform better.

Along with this work, we considered enforcing [SSE4.2](https://en.wikipedia.org/wiki/SSE4#SSE4.2) support, improving performance but making yuzu incompatible with 12 year 
old CPUs like the Core 2 Duo and Phenom II or older.
While the performance results were positive, the developers are still debating about reducing CPU compatibility..

When you open yuzu, the emulator has to take some time to measure the [RDTSC frequency](https://en.wikipedia.org/wiki/Time_Stamp_Counter), a way to measure the clock 
speed of the CPU.
Due to a bit of bloat in the previous implementation, 3 full seconds were needed to complete the operation.
Morph [rewrote the whole code section](https://github.com/yuzu-emu/yuzu/pull/7494) and now only 0.2 seconds (200 milliseconds) are needed to get results as accurate as
before, considerably reducing the boot times of the emulator itself.

As previously said, german77 continues to work in making `Ring Fit Adventure` playable.
He has [stubbed the](https://github.com/yuzu-emu/yuzu/pull/7524) `SetNpadCaptureButtonAssignment`, `ClearNpadCaptureButtonAssignment`, `ListAlarmSettings`, and 
`Initialize` services, and [added support](https://github.com/yuzu-emu/yuzu/pull/7525) for the `notif:a` service.

With all his changes, the game manages to load the calibration settings:

{{< imgs
	"./ringfit.png| Ring Fit Adventure"
  >}}

[Tatsh](https://github.com/Tatsh) [added NSP and XCI file association to Linux](https://github.com/yuzu-emu/yuzu/pull/7609).
Thanks!

[Tachi107](https://github.com/Tachi107) [updated cubeb](https://github.com/yuzu-emu/yuzu/pull/7527) and removed now deprecated functions.
Cleaner is always better, thanks!

[heinermann](https://github.com/heinermann) fixed a crash that would occur when the 
[emulation was paused and the window was out of focus](https://github.com/yuzu-emu/yuzu/pull/7506). 
Thank you!

[jbeich](https://github.com/jbeich) changed the building configuration so that 
[VA-API, one of the video decoding APIs of Linux, is enabled on Unix systems](https://github.com/yuzu-emu/yuzu/pull/7602), allowing the users who want to build targeting 
BSD or other Unix-based systems to use hardware acceleration for video decoding.

This is just one of several PRs jbeich wrote to help yuzu work on BSD systems, thank you for your contributions!

## UI changes

The favourites row in yuzu’s game list was always expanded, even if the user collapsed it.
epicboy [added a persistent setting](https://github.com/yuzu-emu/yuzu/pull/7570) to remember the user preference between launches.

One of the most common issues users face is lack of Vulkan support on their PC. Not lack of hardware support, but instead missing software support caused by outdated GPU 
drivers or poorly coded/outdated Vulkan injections.

Our old error popup didn’t reflect this so [your writer](https://github.com/goldenx86), with his total lack of coding skills, 
[decided to change it](https://github.com/yuzu-emu/yuzu/pull/7532).

{{< single-title-imgs
    " "
    "./vidbug.png"
    "./vidfix.png"
    >}}

This is a complex issue and the main reason Vulkan is not the default API in use.
Users of old laptops with AMD and Intel integrated GPUs tend to use the driver shipped by either the laptop vendor or Windows Update. 
In both cases those drivers are most likely years old (yuzu can run on AMD GPUs from 2012) and either lack Vulkan support at all, or only support a portion of what’s 
needed to run yuzu.
Also, since laptops by default connect the display directly to the integrated GPU, that’s the first Vulkan driver that will be seen, so it’s critical to have the latest 
GPU driver installed *even if* your laptop has a dedicated NVIDIA GPU running the latest driver.

While telling AMD users to [manually download and install updated drivers](https://www.amd.com/en/support) is a viable option and works as it should, in its 
*infinite wisdom*, Intel decided to block manual installation of its own official drivers if a custom laptop vendor driver is in use (those modified drivers are usually 
created to cheat on battery life metrics and/or to save money on cooling).

The only alternative in those cases is to [manually download the ZIP version](https://www.intel.com/content/www/us/en/download/19344/intel-graphics-windows-dch-drivers.html) 
of the driver, unpack it, go to Device Manager, right-click the correct GPU in Display Adapters, select `Update Driver Software…`, `Browse my computer for driver software`, 
`Let me pick from a list of device drivers on my computer`, `Have Disk…`, then finally browse to the folder where the driver was unpacked and select the `iigd_dch.inf` file.
What a very intuitive and user-friendly way to update a GPU driver, great job Intel…

Here's a [video tutorial](https://www.youtube.com/watch?v=BZG50Nm5sOM&t=72s) for those that prefer visual aid over our rambling. Just make sure to use the `iigd_dch.inf` 
file instead of the one shown in the slightly outdated video.
Other mentioned optimizations on the video no longer apply.

With this *easy job* done, the Intel GPU gets full Vulkan support, runs at its intended performance, and has access to all the new features, fixes, and performance 
improvements that the driver developers worked on. 
The driver is also allowed to auto-update on new official releases.

Known software that uses broken Vulkan injectors are outdated screen recorders like Bandicam, Action!, and even OBS.
We strongly recommend using an up to date OBS, the native encoders from the GPU vendor (Radeon ReLive and Geforce Experience), or the integrated Xbox Game Bar on Windows.
Overwolf is also known to break Vulkan support, so we **strongly** recommend avoiding it.

## Future projects

If you want a sneak peak at the progress on Ring Fit Adventure, here’s a video for you:

{{< imgs
	"./ringfit.mp4| Ring Fit Adventure, again"
  >}}

`Project Gaia`, is progressing smoothly. As a tip, SSD users will notice improvements.

Blinkhawk informs us that `Project Y.F.C.` will be grouping together the changes into smaller pieces, to get more progressive updates instead of delaying for a big release
that would require more testing time.
We continue to plan to add several of GPU features that have been pending, for example:

{{< imgs
	"./golf.png| Mario Golf: Super Rush"
  >}}

That’s all folks! Thank you for your attention, and we hope to see you next month!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
