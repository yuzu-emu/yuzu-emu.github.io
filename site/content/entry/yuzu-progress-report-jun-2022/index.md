+++
date = "2022-07-10T12:00:00-03:00"
title = "Progress Report June 2022"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 597525
+++

Dear yuz-ers, we had fantastic progress during June! Driver bugs are being squashed, there are kernel and CPU improvements, UI and input changes, and more!

<!--more--> 

## PSA for AMD Radeon users (and NVIDIA tags along)

Let’s begin with a driver bug we [mentioned last month](https://yuzu-emu.org/entry/yuzu-progress-report-may-2022/#graphical-changes-driver-issues-and-the-nostalgia-bliss-that-is-the-good-old-64).
The Vulkan extension `VK_KHR_push_descriptor` finally arrived for AMD hardware with driver version 22.5.2 for Windows, but it wasn’t stable. Radeon users would tell you that any game would crash in Vulkan after updating.
To mitigate this, [toastUnlimited](https://github.com/lat9nq) implemented an extension block for the specific Vulkan driver version AMD reports for 22.5.2 (and its equivalent Linux AMDVLK package), 2.0.226.

Skip forward a month and the new 22.6.1 driver is released with `VK_KHR_push_descriptor` fixed!
But, and there is a but, the new driver reports the same Vulkan version, 2.0.226, which forces our devs into a dilemma.
Since the extension block can only work with what the GPU driver reports, the Vulkan driver version in this case, we can either keep the block and ensure compatibility with older broken drivers, or remove the block and force users to update to the current (at the time of writing) 22.6.1 driver.
{{< gh-hovercard "8518" "We opted to do the latter," >}} as it keeps the codebase cleaner, and there is some evidence that suggests this may fix input lag issues found when using FreeSync displays.

To be specific, AMD Radeon users with cards still supported by AMD (Polaris and newer) must update to the latest video driver, 22.6.1 or newer, in order to get proper Vulkan support.
Users with older cards out of support (GCN 1 to GCN 3) don’t have to worry, that hardware already can’t update to newer drivers (custom drivers can’t update Vulkan to add new extensions either), and yuzu will use the slower code path that works without requiring support for `VK_KHR_push_descriptor`.

Okay, that covers Radeon users. Let’s talk about the greener side.
With the release of the 516.XX NVIDIA driver series, there seems to be a performance boost for Turing and Ampere GPUs running under Vulkan (that’s 3000, 2000, and 1600 series cards).
Great, but it has a price.

Maxwell and Pascal users (1000, 900, 750, and 745 series cards) will experience device loss crashes some minutes into running games in Vulkan. 
A device loss basically means the driver pulling the plug for some reason.
Until we find the cause of this issue and either implement a fix or report it to NVIDIA, Maxwell and Pascal users should stick to 512.XX drivers.

It’s always boring to start an article with a bunch of warnings, but this is one of the few tools we have available to reach as many affected users as possible.

## Graphical changes

We should be covering the release of the {{< gh-hovercard "8467" "first part of `Project Y.F.C.`" >}} here, but due to schedule issues it was moved to the next report. 
We're sorry for the inconvenience and we'll make sure to cover it in the next article.
The good news is that besides yuzu Fried Chicken, there have been other fun GPU improvements to report.

[Behunin](https://github.com/behunin) is back with a {{< gh-hovercard "8413" "very interesting optimization for our `gpu_thread`," >}} [“a bounded multi-producer multi-consumer concurrent queue”](https://github.com/rigtorp/MPMCQueue).
This delivers a small 1 or 2 FPS performance boost, but more importantly, better recovery times after load related stuttering spikes.

The beloved `The Elder Scrolls V: Skyrim`, once considered the benchmark for open world gaming, until better games came out that is, can now boot!
[Skyline emulator](https://github.com/skyline-emu/skyline) developer [bylaws](https://github.com/bylaws) found the reason this classic refused to boot until now: {{< gh-hovercard "8414" "the assumed behaviour of the first value" >}} of the GPU related [semaphore](https://en.wikipedia.org/wiki/Semaphore_(programming)) was wrong, it should perform a release instead of returning a constant zero.
Now, thanks to this great find by bylaws, the Dovahkiin can finally wake up in that cart. 


{{< imgs
    "./skyrim.png| Yes, we're finally awake (The Elder Scrolls V: Skyrim)"
  >}}

You can see we have some rendering issues to solve.

One of our recent important rendering changes was the [NVFlinger rewrite](https://yuzu-emu.org/entry/yuzu-progress-report-mar-2022/#graphical-changes-and-optimizations), who would have guessed that coding an implementation closer to the Switch would result in a smoother gaming experience?

However, after its release, user reports mentioned timing and frame pacing issues in games like `Super Smash Bros. Ultimate`. 
Match time would pass increasingly slower, around a second longer per minute on Ryzen systems, and exacerbated with Intel Alder Lake CPUs (12th gen).

The solution [bunnei](https://github.com/bunnei) arrived to, contrary to what one would think, is to {{< gh-hovercard "8428" "implement a *less accurate* behaviour." >}}
yuzu is multithreaded, and very heavily so (even if it doesn’t show up in CPU % usage graphs), and a 100% accurate implementation of NVFlinger would not be sensitive enough for the emulator’s requirements.

Weird CPU architectures aside, while the issue is solved, Intel Alder Lake users are recommended to run the latest BIOS and chipset driver versions. Check your motherboard/laptop support sites for these updates.

While still on the topic of NVFlinger goodies, we present a highly requested feature!
Veteran users will remember that during its single threaded days, yuzu would allow control over game speed. 
With the arrival of multicore, known at the time as [Project Prometheus](https://yuzu-emu.org/entry/yuzu-prometheus/), this feature was only available in single core mode, to the chagrin of many people. How time flies!

{{< gh-hovercard "8508" "yuzu now has control over the frame time calculation," >}} allowing a new method to unlimit the framerate regardless of the CPU emulation mode!
You can find the option in `Emulation > Configure… > General > Limit Speed Percent`.
Needless to say, if you want to make a game run faster, the game should allow it, and you must have the hardware performance to reach the new target speed.

{{< imgs
    "./speed.png| No visual change compared to previous versions, but completely new functionality"
  >}}

## Debugger

Now, we're going to dive into a bit of developer paradise here.

A few months ago, yuzu developer [byte[]](https://github.com/liamwhite) found himself trying to debug some game issues in yuzu involving [a certain Welsh cat](https://www.youtube.com/watch?v=-z99PKe7kOA), among others.
Unfortunately, he soon ran into more trouble, as it was exceedingly difficult to view the internal states of games and watch or modify their behaviour without needing to extensively hack up yuzu.

The source of the pain was not having any way to use a debugger with the emulated games.

Originally, yuzu inherited a `GDB-compatible debugger interface` from [Citra](https://citra-emu.org), but it was lacking many important features.
And even that had to be deprecated during [Project Prometheus](https://yuzu-emu.org/entry/yuzu-prometheus/) (multicore emulation) because of its inherent shortcomings.

 * It only worked with single core mode
 * It was _slow_ - it could sometimes take 30+ minutes to boot a game, particularly if you had any logging scripts
 * It had some significant code quality issues

After being removed during the Prometheus rewrite, yuzu did not have ***any*** debugger interface for a long time.

### Wait, what is GDB again?

> <p style="color:cyan;">The GNU Debugger (GDB) is a portable debugger that runs on many Unix-like systems and works for many programming languages, including Ada, C, C++, Objective-C, Free Pascal, Fortran, Go, and partially others.</p>
>
> -- [*Wikipedia*](https://en.wikipedia.org/wiki/GNU_Debugger)

With GDB, you can:
 * Step through code on an instruction-by-instruction basis
 * Modify memory and registers on-the-fly
 * Even completely replace sections of running code dynamically

Thus, you can see how extremely useful having a `GDB-compatible debugger interface` is, for developers and mod creators alike, as you can now debug games, homebrew, and game mods without having to fiddle with the console every single time.

{{< imgs
    "./gdb1.png| A 32-bit example, in this case Super Mario Galaxy"
  >}}

### Challenges

After the old debugger interface had been deprecated, a few members of the community forked it and continued to patch and maintain it.
A few notable ones are [Hedges](https://github.com/Hedges/yuzu) and [astrelsky](https://github.com/astrelsky/yuzu).
It was thanks to these forks that byte[] was able to add [initial support for the Wii Hagi emulator](https://github.com/yuzu-emu/yuzu/pull/8000) in yuzu.

However, he was soon faced with a much more annoying problem.
[Recent changes to yuzu's CPU emulation](https://github.com/yuzu-emu/yuzu/pull/8148) were causing Super Mario Galaxy to [deadlock](https://en.wikipedia.org/wiki/Deadlock).
This issue only happened in multicore mode, right after the end of the first video cutscene. He was out of ideas and needed a functional debugger to continue investigating the issue.

Since the old debugger interface didn't support multicore mode, byte[] had to start from scratch.
Motivated by his drive to figure out the issue, byte[] began working towards a new GDB-compatible debugger interface for yuzu and he had very specific goals:
 * It should work
 * It should quickly get out of the way, so he could focus more on the root cause

As the saying goes, "the first step is always the hardest".
And for byte[], indeed it was; his biggest challenge: "Not knowing where to start".

byte[] had the networking code written and working, but did not initially understand how to tie it with the threading code. After some healthy brainstorming sessions with other devs, he eventually figured out solutions for the challenges he was facing.

### Changes

Since he was starting from scratch, byte[] took the opportunity to make some sorely needed improvements to the interface.

The old debugger interface was based on "stepping" the emulated CPU core. `Stepping` here means executing one instruction of the emulated program at a time.

This posed a number of problems because almost all games have multiple threads, and if you are stepping and a thread asks to wait, then another thread can start running in its place in the same CPU core, with all the state changed. This breaks continuity and can even crash the debugger.

{{< gh-hovercard "8394" "The new debugger interface" >}} overcomes this by performing debug stepping on threads instead of stepping the emulated CPU core. In yuzu's context, when a thread is stepped, the debugger will ask the thread to step, then the Dynarmic interface will detect this condition and tell Dynarmic to step it, and when the thread has been scheduled again, it will mark that the thread stepped and notify the debugger again.

{{< imgs
    "./gdb2.png| Super Mario Odyssey, in gibberish form"
  >}}

### What are the benefits?

Apart from this, we have a few more notable quality-of-life (QoL) additions.
The debugger interface is now thread-stable, edge cases in stepping and pausing are now handled, and it has tons of useful debugging features, like:

- Support for both 32-bit and 64-bit code
- Ability to modify any memory and registers at any time
- Readout of guest thread names
- Support for unlimited numbers of instruction breakpoints
- Support for up to 4 memory watchpoints

## UI changes

When talking about user interface and experience, you can always count on [Docteh](https://github.com/Docteh).

[In a repeat of what Morph fixed back in February](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2022/#general-bugfixes-and-ui-changes), Docteh found out that after a crash, the yuzu main window may reopen in some kind of borderless fullscreen… *thing*.
The culprit was {{< gh-hovercard "8400" "the `UILayout\geometry` value in yuzu’s qt-config.ini file." >}} 
A slap in the face and the issue should be gone for good. Ouch.

With the intention of helping new users adapt to yuzu, Docteh {{< gh-hovercard "8405" "renamed the status bar" >}} `DOCK` text (which used to only change colour to reflect its status) to `DOCKED/HANDHELD`.
Now the current emulated status is clearer, and users won’t confuse it when using dark or light themes. 
Making things easier to understand must never be underestimated. Car makers should try it someday.

{{< single-title-imgs
    "The devil is in the details"
    "./dockbug.png"
    "./dockfix.png"
    >}}

Translation bugs always manage to slip by. 
The first time yuzu is opened, it will display a big folder with a plus icon, asking the user to add the location of their game dumps.
The text of this message failed to re-translate if the user changed the interface language from `Emulation > Configure… > General > UI > Interface Language`.
Solving this {{< gh-hovercard "8449" "took a couple of changes in how the window handles re-translation." >}}

{{< single-title-imgs
    "Good way to learn another language!"
    "./addbug.png"
    "./addfix.png"
    >}}

Docteh is also sneaking {{< gh-hovercard "8427" "some preliminary work for migrating to Qt6" >}} in the future.
The `QDesktopWidget` class is [now officially deprecated](https://doc.qt.io/qt-5/qdesktopwidget.html), so `QScreen` takes its place.

Additionally, some classes affecting the Web Applet were also deprecated, so {{< gh-hovercard "8477" "some tweaks were in order to ensure future compatibility." >}}
Hopefully Qt6 will mean the return of the Web Applet by default?

Once we’re ready to migrate, this should provide better dynamic DPI scaling, allowing 4K display users to finally understand what is going on in the control settings window, for example.

## Input improvements

Input is [german77’s](https://github.com/german77) speciality, a “diamond in the rough” that is being polished one PR at a time, for eternity….

Continuing the work with `Ring Fit Adventure`, german77 {{< gh-hovercard "8487" "stubbed the `PerformSystemButtonPressingIfInFocus` service" >}}, solving an SVC (Supervisor Call) crash which occurred when pressing ZL or ZR.

With the official Switch update for the firmware version 13.2.0, Nintendo implemented a new `GetVibrationDeviceInfo`. 
While german77 worked on implementing those changes, one game in particular refused to work, `de Blob`.
When this game sends a controller disconnect signal, it uses a `-1` value, which is invalid as only unsigned values are accepted on the Switch.
Maybe it’s an emulation issue somewhere, or this game just loves to do this and the Switch just accepts invalid values. Regardless, our solution is to {{< gh-hovercard "8492" "replicate this peculiar behaviour." >}}
The end result is `de Blob` now gets in-game!

{{< imgs
    "./deblob2.png| de Blob 2"
  >}}

## Kernel and CPU changes

Possibly the most silent part of yuzu’s code, but also the most critical.
Kernel emulation is the engine block that keeps all parts working together in harmony, so you can expect that changing even a small part of it can have ripple effects anywhere.
One must tread carefully, heh, thread carefully.
Sorry, not sorry.

Anyway, byte[] has been particularly busy this month in this delicate area, screwdriver in hand and not fearing anything. 
Several changes include getting up to date with the latest reverse engineering findings, but there’s more.

To help with pause and resume functionality, he has {{< gh-hovercard "8457" "implemented KProcess suspension," >}} “the kernel mechanism intended for this” as the pull request explains.
Clean pause and resume is always a blessing when you have to leave the PC to do something else.

While working on {{< gh-hovercard "8388" "simplifying guest pauses" >}} for single core and multicore emulation, byte[] discovered that if asynchronous GPU emulation and multicore CPU emulation were disabled (something we strongly recommend against, but it’s a valid option for CPU thread starved users, or FX users), a race condition would happen when initializing the CPU and GPU threads.
Several single threads still are multiple threads.
Hammer in hand, byte[] {{< gh-hovercard "8476" "implemented some barriers" >}} to fix this specific crash.

Pause is the word of the week, and this time, it could make a specific game crash.
The old StallCPU behaviour would wait for all thread execution to stop. 
It was slow, but safe.
`Fire Emblem: Three Houses` would get into a GPU thread race condition with the new method.
{{< gh-hovercard "8483" "Telling the kernel to wait for all threads to stop on pause" >}} avoids the crash.

If, for some reason, yuzu would jump to an invalid address, emulation would hang and the log would get spammed with infinite amounts of `Unmapped Reads`.
Fixing this required work on both Dynarmic and yuzu, resulting in {{< gh-hovercard "8490" "stopping ReadCode callbacks to unmapped addresses." >}}

[exlaunch](https://github.com/shadowninja108/exlaunch) is a framework for injecting C or C++ code into Switch applications and modules.
exlaunch can work on unpatched units, allowing developers to “go to town” with it.
yuzu didn’t support it, but [comex](https://github.com/comex) {{< gh-hovercard "8504" "implemented the required functionality" >}} to have it up and running. 
Thank you!

Newcomer [DCNick3](https://github.com/DCNick3) joins the fray!
For their first brawl, they {{< gh-hovercard "8473" "implemented the `ExitProcess` SVC," >}} which allows homebrew apps to gracefully exit on close.

## Issues with third-party antiviruses

Users have recently reported crashes starting with Mainline version 1075 and newer.
The cause seems to be third-party antiviruses, more specifically ESET/ NOD32. 
A [HIPS](https://help.eset.com/ees/8/en-US/idh_hips_main.html) false positive is issued, sandboxing yuzu and blocking its access to the system page file.
Basically, if fastmem is unable to secure 4GB of page file to work (or 6GB if the extended memory option is enabled), the emulator will crash.

Three options are available to solve this for now:

- The user can disable fastmem from yuzu’s settings, the setting is in `Emulation > Configure… > General > Debug`, from there, enable the option labeled as `Enable CPU Debugging` at the bottom, and from the CPU tab, disable both `Enable Host MMU Emulation` options near the bottom. This will produce a performance loss that can reach up to 30% on some games.
- Add a HIPS exception to both yuzu folders, `%appdata%\yuzu` and `%localappdata%\yuzu`. User reports show mixed results with this approach.
- Outright uninstall ESET and use Windows Defender instead.

{{< single-title-imgs
    "Here are image examples on how to reach the required options"
    "./fastmem1.png"
    "./fastmem2.png"
    >}}

## Future changes

toastUnlimited has been working on {{< gh-hovercard "8455" "making yuzu compatible to be compiled with" >}} [LLVM Clang](https://clang.llvm.org/) under [MinGW-w64](https://www.mingw-w64.org/).
There are multiple reasons to consider this approach:

- The default compiler we use for Windows builds, MSVC, is currently unstable on its latest 2022 version, forcing us to revert to version 2019, and making yuzu lose some compiler optimizations in the process, losing a bit of performance.
- GCC 12, the default Linux compiler yuzu uses, has optimization errors and problems with some warnings, making it unviable at the moment.
- Clang allows for aggressive optimizations that should provide good performance boosts. One example is [Polly](https://polly.llvm.org/).
- Along with GCC, LLVM makes it much easier to produce code optimized for the SSE4.2 instruction set. That’s right Core 2 Duo users, you’re next in line for the chopping block.

The main reason we haven’t switched to this new system by default is `Project Gaia`, or, well, the lack of Gaias currently. 
Some of its changes are mandatory to get Clang builds up and running on Windows. 
While this pull request is completed, its full implementation will be on hold until Gaia is out, which isn’t far away now.

Get a kettle, boil some [wotah](https://www.youtube.com/watch?v=XE6DT9y7L-w), and make yourself a cuppa tea, because `Project London` has bloody began.

That’s all folks! Thank you for staying until the end. See you next month!

&nbsp;
{{< article-end >}}
{{< gh-hovercard-include-end >}}
