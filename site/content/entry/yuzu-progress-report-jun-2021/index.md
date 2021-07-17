+++
date = "2021-07-16T12:00:00-03:00"
title = "Progress Report June 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 431984
+++

Heya yuz-ers! Welcome to June’s progress report. This past month, we've had impressive CPU performance gains, the release of Project Reaper v1, critical audio fixes, an "unlimited" FPS toggle, 
tons of kernel changes, UI improvements, and more!

<!--more-->

## Project Texture Reaper

An old debt we owed since the release of the [Texture Cache Rewrite](https://yuzu-emu.org/entry/yuzu-tcr/) was `Project Texture Reaper`, a `GPU Cache Garbage Collector`,
originally started by [Rodrigo](https://github.com/ReinUsesLisp) and finished by [Blinkhawk](https://github.com/FernandoS27) with new and very important optimizations.

[This garbage collector](https://github.com/yuzu-emu/yuzu/pull/6465) has the task of freeing VRAM space by removing the least used resources (textures and buffers), 
targeting a range of 2 to 4GB of total used VRAM. This range has been decided by Blinkhawk after extensive testing.

It’s worth mentioning that GPUs with 2GB of VRAM or less will be handled by either the driver (in OpenGL) or yuzu (in Vulkan), diverting resources to shared VRAM 
(a portion of system RAM) as needed.
For performance reasons, we strongly recommend a GPU with 4GB of VRAM or more.

While this is a critical feature for our Windows AMD Radeon and Intel GPU users that suffer from bad OpenGL performance and rendering, all GPU vendors benefit from it.
This makes it a safe option to use in most games going forward, with the exception of a few outliers: most notably `Super Mario Odyssey` running in OpenGL.

The end results speak for themselves. Games like `Xenoblade Chronicles 2` can now be played perfectly fine in either OpenGL or Vulkan.
In the following graphs, you can see the effects of Reaper in action. Our test system is running an Nvidia GeForce GTX 1650 SUPER with 4GB of VRAM, and the API in use is Vulkan (in order to avoid 
any possible driver-level garbage collector).

{{< imgs
	"./reaper1.png| Before"
  >}}

The above (Before) result has Reaper disabled just after starting the game. VRAM utilization quickly rises to the maximum 4GB available on the testing graphics card.
Once the available VRAM is consumed, the GPU driver will start to use system RAM as a fallback, continuing to pile up resources until the application crashes.

{{< imgs
	"./reaper2.png| After"
  >}}

The above (After) result has Reaper enabled. You can see how the GPU keeps a steady 2.5-2.6GB of VRAM utilization after several minutes of gameplay, until a sudden spike in use happens. 
Reaper intervenes and VRAM utilization quickly returns to the average idle of 2.5GB.

Reaper is available to all users in `Emulation > Configure… > Graphics > Advanced > Enable GPU Cache Garbage Collector`.
Due to some issues found in `Super Mario Odyssey`, the option is disabled by default. We plan to introduce a more robust version in the future. 
It is expected to be enabled by default then.

While previous `Disable Dynamic Resolution` mods can now be disabled, we recommend keeping them, not only for picture quality purposes, but also to reduce unnecessary 
resource use by avoiding creating new textures after each resolution change.

## One does not simply fastmem into Windows

This was a very exciting month as we were able to [implement `fastmem`](https://github.com/yuzu-emu/yuzu/pull/6422), a technique that provides a considerable performance boost by reducing the CPU load when accessing memory within yuzu.
Instead of emulating the Nintendo Switch's Memory Management Unit (`MMU`) through software, yuzu is now able to use the host PC `MMU` to decode memory addresses. This reduces the latency and size of the code of this operation, allowing for a more efficient use of the instruction cache (used to store instructions within the CPU and speed up the fetching stage).

Originally, implementing `fastmem` in yuzu wasn't considered an option as there was a technical limitation in the Windows OS, but thanks to some changes in the API introduced in Windows 10 version 1803, it finally became viable.
However, due to a lack of documentation of this feature (thanks Microsoft), our devs didn't know they could use it.
We'd like to thank [BreadFish64](https://github.com/BreadFish64/) for informing our devs about this change, and [bylaws](https://github.com/bylaws) for [updating Microsoft's documentation regarding this behaviour](https://github.com/MicrosoftDocs/sdk-api/pull/799). 
As previously mentioned, this feature is incompatible with Windows versions older than 1803. Using an older Windows version will cause yuzu to fallback to the old `MMU` implementation — although this requirement could change in the future.
If you are interested in a more detailed explanation of how it works and the limitations that prevented its implementation, feel free to read the [dedicated article for fastmem](https://yuzu-emu.org/entry/yuzu-fastmem/).

{{< single-title-imgs
    "Some of the measured performance gains, in FPS"
    "./fastmem1.png"
    "./fastmem2.png"
    >}}

Shortly afterwards, [toastunlimited](https://github.com/lat9nq) noticed there was a bug in our MinGW builds, resulting in `fastmem` not working.
This was because the defined constant `MEM_RESERVE_PLACEHOLDER`, a mask value used for reserving virtual memory as a placeholder, was manually imported for these builds, but incorrectly declared.
Thankfully, the fix was as simple as redeclaring it with the correct value, which Toast [did in this PR](https://github.com/yuzu-emu/yuzu/pull/6494).

## Core changes

Meanwhile, [Merry](https://github.com/MerryMage) tweaked dynarmic to add a [new unsafe CPU option](https://github.com/yuzu-emu/yuzu/pull/6499). This new option optimizes performance for the 32-bit [`ASIMD` instructions](https://en.wikipedia.org/wiki/ARM_architecture#Advanced_SIMD_(Neon)), improving the performance in titles such as `Mario Kart 8 Deluxe` and `Megadimension Neptunia VII`.

[Floating-point numbers](https://en.wikipedia.org/wiki/Floating-point_arithmetic) are represented as an exponent in base 2, and a fixed number of significant bits.
But there's a limit to how small a number can be represented as a float, which depends on these significant bits, and the numbers that fall below this threshold are called [Denormal Numbers](https://en.wikipedia.org/wiki/Denormal_number).
Depending on the CPU architecture or the instruction performed, these numbers may be ignored and considered zero (called `FZ` mode, "flush to zero"), while others are capable of operating with these denormal values.
This is the case with these `ASIMD` instructions, whose logic for floating-point operations is different from other instructions in the `ARM` architecture.
To properly emulate the behaviour of these `ASIMD` operations, which ignore the `FZ` flag, it is necessary to modify the `MXCSR` register — which is a very expensive operation — not only once, but twice (to set and unset this flag before and after every instruction).
With this change, it’s now possible to toggle this option on and lose some precision in favour of performance.

A few days later, Merry followed up with the affirmation that yes, [Apple is indeed a POSIX system.](https://github.com/yuzu-emu/yuzu/pull/6532)

[bunnei](https://github.com/bunnei) continues to work on our kernel, and the highlights this month are related to fixes for a number of bugs in some Pokémon games.

[By allocating `ServiceThreads` per service handler instead of per session](https://github.com/yuzu-emu/yuzu/pull/6414), a race condition that resulted in crashes and softlocks in `Pokken Tournament DX` was fixed.

In the same vein, a crash affecting `Pokémon Sword/Shield` — also caused by a race condition — was fixed by [removing the service thread manager and refactoring the code to use weak pointers](https://github.com/yuzu-emu/yuzu/pull/6428).
But this wasn't the only kernel change solving a problem with this game.
bunnei investigated our session code and fixed another crash caused by [disconnected sessions trying to overwrite a cloned session's handler](https://github.com/yuzu-emu/yuzu/pull/6441).
The sessions were also being reserved more times than needed, causing yuzu to run out of available sessions.
For this reason, [he made sure to remove these redundant reservations](https://github.com/yuzu-emu/yuzu/pull/6444) to solve the problem.

bunnei also noticed that the error check for `CancelSynchronization` — used to manage threads — was missing and [added it on this PR](https://github.com/yuzu-emu/yuzu/pull/6440).
This change allows yuzu to avoid a potential crash now, while also making the implementation more accurate.

On top of these kernel changes, bunnei has also been implementing more of the changes introduced by version 12.X.X of the Switch’s firmware, allowing `DOOM Eternal` to boot with its update 1.5 installed — although the game still requires more work in order to start rendering correctly.

## Audio changes

[Maide](https://github.com/Kelebek1) investigated the cause of the crackling and popping in the audio of some titles, and came to the conclusion that not enough audio samples were being fed into the sink in order to be played out in your headset or speakers.

All games call the `RequestUpdateImpl()` to send samples into the sink and also to pass other information, such as the `sampling rate` of the audio signal and the `sample count` (number of samples to be processed).
Some titles — particularly those running at fixed frame rate of 30 FPS — would call this function less frequently than their 60 FPS counterparts, which resulted in not enough audio samples being processed in time and sent into the sink, causing the aforementioned annoying popping.

This is how `Hellblade: Senua's Sacrifice` sounded with the old implementation:

{{< audio "./audiobug.mp3" >}}

By [decoupling the processing and sending of audio samples from the update function](https://github.com/yuzu-emu/yuzu/pull/6498), the games now will be able to call the update function every time they need it (a process that yuzu can't control), while a separate audio thread will process the sample data and send it to the sink. With this new implementation, yuzu is now capable of scheduling the rate at which it will be sending this audio information based on the `sample rate` and the `sample count`. For example: if a game is using a 48 kHz `sample rate` with a `sample count` of 240, yuzu will now send the audio data to the sink at a rate of least 200 times per second — enough to keep the buffers full and prevent these problems with the audio.

And this is `Hellblade: Senua's Sacrifice` again, now with the current implementation merged:

{{< audio "./audiofix.mp3" >}}

This change fixed the slow audio in titles such as `ARK`, `Bulletstorm`, and `Megademension Neptunia VII`, while also — on top of improving the quality — solving the audio softlocks in `Donkey Kong Country: Tropical Freeze` and `Xenoblade Chronicles 2`.

{{< single-title-imgs
    "Better audio and stable gameplay! (Xenoblade Chronicles 2 & Donkey Kong Country: Tropical Freeze)"
    "./xc2.png"
    "./dktf.png"
    >}}

## Graphical improvements

Let’s start with something nice, `Unlimited FPS`!
[Epicboy](https://github.com/ameerj) implemented a toggle that 
[allows the rendering service, nvflinger, to disable the buffer swap interval limit,](https://github.com/yuzu-emu/yuzu/pull/6475) allowing the GPU to process frames as soon 
as they are available, resulting in no FPS limit on games that allow this behaviour.

{{< imgs
	"./unlimitedfps.png| Beat my framerate!"
  >}}

A default hotkey for toggling the FPS limit was also added, say hello to `Ctrl + U`!
For the best results, `Vertical Synchronization` (or vSync) should be disabled in the GPU driver control panel, otherwise games will be constrained by the refresh rate of the monitor.
Keep in mind, not all games like the setting, some will ignore it, some will not behave well (running faster for example), and some will outright break. 
Case-by-case user testing applies.

Some examples of games that have full dynamic FPS support are:

- `Hollow Knight`
- `DRAGON QUEST BUILDERS 2`
- `Dragon Quest XI S: Echoes of an Elusive Age - Definitive Edition`
- `WORLD OF FINAL FANTASY MAXIMA`
- `FINAL FANTASY XV POCKET EDITION HD`
- `Hungry Shark® World`
- `MONSTER HUNTER STORIES 2: WINGS OF RUIN`
- `NEO: The World Ends with You` demo
- `MISTOVER`
- `Crash™ Team Racing Nitro-Fueled`
- `Crash Bandicoot™ N. Sane Trilogy`
- ...and many more

ASTC texture decoding is a complex topic when it comes to emulation, as no desktop graphics card has the required hardware support needed to process these heavily compressed textures. 
The only exception is Intel with their integrated HD Graphics and UHD Graphics series.

[In the past,](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2021/) epicboy implemented a way to accelerate ASTC texture decoding via the use of `Compute Shaders`,
improving decoding performance considerably thanks to taking advantage of the great computing power of modern GPUs.

The issue is that in some games, `Astral Chain` for example, a synchronization issue caused yuzu to try to access a texture before its decoding was finished, resulting in 
driver panics and application crashes. 
[Implementing various optimizations and enhancements to the GPU accelerated decoder](https://github.com/yuzu-emu/yuzu/pull/6496) solved those crashes, even on a simple GT 
730, a card 41.5x times weaker than an RTX 2080 SUPER in compute performance.

Now that [Project Hades](https://yuzu-emu.org/entry/yuzu-hades/) is finished, there are plans to implement performance optimizations on the ASTC GPU accelerated decoder.

Prior to this work, [a toggle to disable the GPU accelerated decoder](https://github.com/yuzu-emu/yuzu/pull/6464) was added for debugging purposes.
It’s no longer needed, but if anyone is curious about how much of a difference decoding with the CPU makes, the option is in `Emulation > Configure… > Graphics > 
Accelerate ASTC texture decoding`.

By [avoiding creating image views for blits for different bytes per block, ](https://github.com/yuzu-emu/yuzu/pull/6469) Rodrigo solved crashes experienced with Unreal Engine 4 
games on Vulkan.

Speaking of blits, [vonchenplus](https://github.com/vonchenplus) found that our previous way of handling out of bounds texture blits wasn’t accurate enough, causing 
rendering glitches in games like `DRAGON QUEST III The Seeds of Salvation`.
[Adding an offset to the source texture address](https://github.com/yuzu-emu/yuzu/pull/6531) puts this bug to rest.

{{< single-title-imgs
    "No more acne! (DRAGON QUEST III: The Seeds of Salvation)"
    "./blitbug.png"
    "./blitfix.png"
    >}}

Some games running in Vulkan, like `Super Smash Bros. Ultimate` or `A Hat in Time`, can cause loops decoding textures, resulting in `Out of Bounds` access on an array, 
potentially leading to a crash, and breaking our Flatpak support.
[As preemptive work](https://github.com/yuzu-emu/yuzu/pull/6410), [toastUnlimited](https://github.com/lat9nq) added a `break` safeguard, and now Flatpaks work as intended.
Having less crashes is always better, right?

## General changes and bugfixes

`discord-rpc`, the submodule in charge of handling Discord’s `Rich Presence` “Now Playing” feature, [was updated](https://github.com/yuzu-emu/yuzu/pull/6484) by 
[Vortex](https://github.com/CaptV0rt3x) to the last version before it was deprecated in favour of a closed-source alternative named `GameSDK` which, of course, we can’t use.
Since `discord-rpc` still is compatible with `Rich Presence`, this update should provide more stable reporting in your Discord Status.

Vortex also [updated `httplib`](https://github.com/yuzu-emu/yuzu/pull/6486), removing the need for previous fixes, solving issues with token verification and 
Compatibility Report uploading.

We previously mentioned Flatpak support. [liushuyu](https://github.com/liushuyu) requested that [Flathub](https://flathub.org/home) add yuzu to their repositories, 
officially providing [another installation option](https://flathub.org/apps/details/org.yuzu_emu.yuzu) for our Linux users.

Maide implemented the `GetAudioOutPlayedSampleCount` service, making `Ninja Gaiden` series games playable!

{{< single-title-imgs
    "Ninja Gaiden series"
    "./ninja1.png"
    "./ninja2.png"
    "./ninja3.png"
  >}}

[german77](https://github.com/german77) has been having fun rewriting how analog input is handled by yuzu.
The old method handled each analog joystick in a separate thread, periodically updating the angle held by the user. This is not only imprecise, but also slower and was 
found to cause data races, eventually leading to random crashes.

[By removing the need for separate threads, and using timestamps the game can consult at its own request](https://github.com/yuzu-emu/yuzu/pull/6389), the data race is 
avoided. This eliminates the crashes, results in considerably smoother movement, and lowers resource utilization, helping performance.
A victory in all scenarios!

[Thanks to changes made upstream](https://github.com/yuzu-emu/yuzu/pull/6450), [toastUnlimited](https://github.com/lat9nq) was able to update the `SDL` version in use, resolving 
crashes experienced by Linux users right when opening yuzu.

[kilaye](https://github.com/clementgallet) has been giving us a hand in an often forgotten area of yuzu, the `yuzu-cmd` binary, which is intended as an SDL2 alternative to 
the most commonly used `yuzu` Qt interface binary.
[OpenGL wasn’t rendering](https://github.com/yuzu-emu/yuzu/pull/6412) due to recent changes applied, and a bad initialization of 
[touch_from_button](https://github.com/yuzu-emu/yuzu/pull/6411) was causing crashes.
All were fixed thanks to kilaye’s work.

While on an SDL2 rush, kilaye also [implemented an SDL2 audio backend](https://github.com/yuzu-emu/yuzu/pull/6418) as an alternative to our default cubeb backend.
More work is needed to refine its performance and end-results, but having an easy-to-maintain, multi-platform backend is never a bad idea.

## Filesystem changes

toastUnlimited has been working along with [morph](https://github.com/Morph1984) to improve the experience of using the 
[Ultimate Mod Manager](https://github.com/ultimate-research/UltimateModManager) application with yuzu — a tool that allows one to mod `Super Smash Bros. Ultimate`.
First, toast added an option in the context menu of a game to support [dumping the RomFS to the SDMC subdirectory](https://github.com/yuzu-emu/yuzu/pull/6471), while morph 
[made the necessary changes](https://github.com/yuzu-emu/yuzu/pull/6472) for this setup to work.

New users intending to use UMM only need to right click the game in yuzu’s game list and select `Dump RomFS > Dump RomFS to SDMC`.

{{< imgs
	"./umm.png| "
  >}}

While [working on new debug options for the filesystem emulation](https://github.com/yuzu-emu/yuzu/pull/6460), Morph also fixed certain DLCs that used to make 
`Xenoblade Chronicles 2` fail to load at boot with the previous implementation.
You can now run the game without major issues, even when fully updated.

When dumping RomFS to disk, there has to be enough free space. Morph 
[added a check to avoid users trying to dump without enough room.](https://github.com/yuzu-emu/yuzu/pull/6451)

Due to a bug in the Microsoft Visual C++ (or just MSVC) compiler, a crash could happen when trying to access folders recursively in order to load game dumps in yuzu’s game 
list.
Morph fixed it by replacing the `recursive_directory_iterator` class [with the `directory_iterator` class](https://github.com/yuzu-emu/yuzu/pull/6448).

## UI changes

Some changes have been done to the title bar by epicboy. 
To begin with, games will now [display if they are built for the 32-bit or 64-bit instruction set.](https://github.com/yuzu-emu/yuzu/pull/6535)
This will help determine when `Unsafe CPU` should be used to get the previously mentioned performance optimization.

Additionally, [the GPU vendor will now be displayed too.](https://github.com/yuzu-emu/yuzu/pull/6502)
This is not only for debugging purposes or providing better support to users, it also clarifies which driver is in use on systems running multiple GPUs.
One would think there are only 3 vendors per API, but that’s far from reality.
[By checking the list](https://github.com/yuzu-emu/yuzu/pull/6502/files), you can see there are many different reported vendors for different needs, including CPU 
software rendering drivers.

For their first Pull Request with yuzu, [OZ](https://github.com/OZtistic) 
[corrected the size of the Per-Game configuration window and removed the useless “help” button](https://github.com/yuzu-emu/yuzu/pull/6514) in the top right corner.

{{< imgs
	"./oz.png| Thanks OZ!"
  >}}

toastUnlimited added a new option to the right click context menu on any game in yuzu’s game list.
You can now [right click a game and launch it](https://github.com/yuzu-emu/yuzu/pull/6426) with any custom per-game configuration you may have, or with 
the current global settings.

{{< imgs
	"./start.png| Quick way to test two different sets of settings"
  >}}

Column sizes in the game list used to constantly resize during updates or DLC installation to NAND, resulting in an extreme width that made the game list uncomfortable to use.
Maide [put a stop to this](https://github.com/yuzu-emu/yuzu/pull/6402), improving the quality of life of our UI.

[Kewlan](https://github.com/yuzu-emu/yuzu/pull/6413) is back at it, this time 
[preventing users from inputting invalid characters in text windows,](https://github.com/yuzu-emu/yuzu/pull/6413) for example when creating a new Input Profile.

{{< imgs
	"./text.png| No more 1337 talk"
  >}}

## Future projects

With Project Hades [(our new shader decompiler)](https://yuzu-emu.org/entry/yuzu-hades/), Rodrigo continues with his crazy experiments, bunnei has yet more kernel changes in the oven, and german77 and Morph continue
to work on their top secret projects.

More GPU related optimizations are underway, and users should keep a keen eye on the horizon.

That’s all folks! As always, we hope you keep enjoying yuzu.
See you next month!

&nbsp;
{{< article-end >}}
