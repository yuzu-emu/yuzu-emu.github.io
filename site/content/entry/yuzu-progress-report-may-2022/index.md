+++
date = "2022-06-12T17:50:00-03:00"
title = "Progress Report May 2022"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 585658
+++

Greetings yuz-ers. This time around, we're covering small and incremental improvements to yuzu. Rest assured, we also have some major rewrites and improvements in the works, and we'll touch on those near the end. Roll the tape!

<!--more--> 

## End of support for EOL Windows versions

Let’s first address the elephant in the room, shall we?

While working on dynarmic and kernel emulation, including improving the compatibility of 4 thread CPU systems, we made changes to [dynarmic](https://github.com/merryhime/dynarmic) and [fastmem](https://yuzu-emu.org/entry/yuzu-fastmem/) that broke support for Windows 10 revision 1803 and older, including Windows 7 and Windows 8/8.1.

While fastmem was only ever designed to work with newer operating systems, the changes to dynarmic breaking support for older Windows versions was purely accidental. 
That being said, it is yet another sign of the times, and that a pre-Windows 10 experience in yuzu will continue to become more subpar.
Due to our focus on improving accuracy, stability and performance, it doesn't make much sense to divert time and resources onto maintaining old and out of support operating systems. 
From Mainline version 991 and onward, only Windows 10 revision 1809 and newer, Windows 11, and Linux, will be the officially supported operating systems.

This decision is reinforced by the lack of GPU driver support on EOL systems (which affects Vulkan support going forward), inconsistencies in the maximum path length (critical for file system emulation improvements), as well as worse memory handling on a kernel level, which is required to properly emulate the Switch and its subsystems.

Not forcing the developers to divert their time into supporting dated platforms (which they no longer use), means that they can instead focus on improving the core emulation components.

Finally, projects like [Dolphin](https://www.reddit.com/r/emulation/comments/utbpmm/dolphin_has_dropped_support_for_windows_7_and_8/) have already followed the same path, and for the same exact reasons.

A 13 years old Windows is old enough to drive in some places.

For those that still prefer to not upgrade, [Mainline 990](https://github.com/yuzu-emu/yuzu-mainline/releases/download/mainline-0-990/yuzu-windows-msvc-20220419-a5e7c5330.zip) and older will work just fine.

## Vulkan by default

[As previously discussed](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2022/#vulkan-is-the-future), we have to circumvent issues like OEM-locked drivers (so common on Intel hardware, [it has its own official procedure](https://www.intel.com/content/www/us/en/support/articles/000056629/graphics.html)) and broken third party software limitations (outdated screen recorders are a common cause of broken rendering) in order to provide a smooth experience with Vulkan as the default API.

The two main causes for Vulkan related crashes when trying to boot a game or opening yuzu’s configuration are:

- Broken Vulkan layers on HUD and screen recording software could cause issues when yuzu and drivers add support for new Vulkan extensions. Keeping software up to date is the only way to prevent this issue from happening.
- Outdated GPU drivers that lack the required features to run Vulkan. This is usually caused by relying on Windows Update to provide the drivers instead of manually installing the latest version, or Intel laptop vendors providing locked custom (meaning nerfed) drivers that are never updated. If possible, always install the latest GPU driver manually, don't rely on Windows Update.

Thankfully, we have a new system that can workaround those issues that are outside of our control.
yuzu will now perform a Vulkan check at boot.

If the check passes, yay!, you can use Vulkan or OpenGL and select which API to use, or in Vulkan’s case, which device to run yuzu with, as always from the Graphics section in configuration.

{{< imgs
    "./ok.png| Check passes, Vulkan works!"
  >}}

If this check fails, a warning will be displayed the next time you launch yuzu. If this happens, you will only be able to use OpenGL as the graphics API. You will still have the option to pick the shader backend (GLSL, GLASM, SPIR-V) that best suits your needs.

{{< imgs
    "./error.png| Oh oh.."
  >}}

For those that happen to land in this situation, a button labeled "Check for Working Vulkan" at the bottom of the Graphics settings window will show up, allowing to retest Vulkan support.

{{< imgs
    "./button.png| Once you manage to solve the issue, click on the button at the bottom!"
  >}}

Thanks to [toastUnlimited](https://github.com/lat9nq), gone is OpenGL as the default graphics API. 
Out with the old, in with the new. {{< gh-hovercard "8393" "Long live King Vulkan." >}}

Going forward, Vulkan will be the top priority for our developers, but they will still continue to support OpenGL.
OpenGL users are recommended to use the GLSL shader backend, as GLASM and SPIR-V will receive limited support from now on.

## Graphical changes, driver issues, and the nostalgia bliss that is the good old 64

This pont month, [byte[]](https://github.com/liamwhite) continued the wave of improvements for `Super Mario 3D All-Stars`.
This time, he noticed a bug in the DMAcopy ([direct memory access](https://en.wikipedia.org/wiki/Direct_memory_access)) of the Nintendo Switch’s GPU.

`DMACopy` is a mechanism that many games use to send texture data to the GPU, it handles the format conversion from "pitch" (pixels on a line by line basis) to "tiled" (gridded) images.
This process works by writing the pitch image data into GPU memory accessible by the DMA engine. Next, a DMAcopy is requested through the DMA engine driver, converting the image data into a separate buffer accessible by the GPU. This buffer will then be used as the texture on the final draw.

{{< gh-hovercard "8313" "After fixing `bytes_per_pixel`," >}} `Super Mario Galaxy` now has proper lens flare.

{{< single-title-imgs-compare
    "RTX On? (Super Mario Galaxy)"
    "./dmabug.png"
    "./dmafix.png"
>}}

byte[] also improved the way OpenGL interprets face flips depth, [replacing the previously reported fix](https://yuzu-emu.org/entry/yuzu-progress-report-apr-2022/#saving-princess-peach-yet-again).
The face flips used by Super Mario 3D All-Stars and the Nintendo 64 emulation are an uncommon configuration on the GPU.
The previous implementation had bad rendering in OpenGL, a complete black screen.

While this wasn't an issue while using Vulkan (performance aside), now `Super Mario 64` and `Super Mario Galaxy` {{< gh-hovercard "8314" "are playable in both graphics APIs." >}} 
Fermi GPU users rejoyce.

{{< imgs
    "./sm64.png| It's-a Mario, now running fast in OpenGL! (Super Mario 64)"
  >}}

One of the important parts of yuzu's graphical emulation is the need to translate small sets of GPU instructions, called `macros`. 
yuzu uses a Just-in-Time (JIT) compiler to execute these macros in a performant way. It provides a performance boost of about 10% over interpretation in most cases.

byte[] found that due to emulation inaccuracies, sometimes a macro could try to access a parameter that was too far outside the bounds of what it was supposed to be accessing. This could crash the emulator without a single trace as to why in some cases.
{{< gh-hovercard "8319" "One less reason for annoying crashes." >}}

Additionally, byte[] added the option to {{< gh-hovercard "8320" "dump all macros" >}} used by a game for debugging purposes.

But why are macros important enough to merit their own dump mechanism?

Turns out, the `Nintendo 64` emulator (*totally not outside Nintendo's Terms of Service*), included with the `Nintendo Switch Online` (NSO) subscription, reassigns the same macros multiple times, each time with different code. yuzu incorrectly appended the new code to the end of the macro in this case, instead of replacing the existing code.
{{< gh-hovercard "8328" "Properly clearing that code" >}} on upload address assignments allows the NSO Nintendo 64 emulator to be playable.
Time to re-enjoy those classics!

{{< imgs
    "./n64.png| We need more games with the atmosphere of The Legend of Zelda: Majora's Mask"
  >}}

Future graphical fixes for the NSO Nintendo 64 emulator will be part of `Project Y.F.C.`.
AMD and Intel users are free to run Vulkan without concerns, but NVIDIA users are recommended to use OpenGL.

Polaris AMD Radeon users (RX 400 and RX 500 series) reported that drivers 22.3.2 and newer caused crashes on multiple games, most notably `The Legend of Zelda: Breath of the Wild` and `Animal Crossing: New Horizons`.

[Driver patch notes mentioned](https://www.amd.com/en/support/kb/release-notes/rn-rad-win-vulkan) implementing the `VK_KHR_workgroup_memory_explicit_layout` Vulkan extension.
The quick conclusion would be that AMD released a broken extension on the new drivers, which wouldn't be the first time, but that wasn’t the case.
The issue only affects Polaris GPUs, and the extension is available to newer architectures too, like Vega or RDNA2 (we don’t talk about ~~Bruno~~ RDNA1).

After a few debugging sessions we found out that yuzu’s implementation of VK_KHR_workgroup_memory_explicit_layout assumes that all compatible GPUs support 16-bit integer operations.
While this was the case for all compatible GPUs previous to AMDs implementation of the extension, the Polaris architecture is notorious for its lack of the more recently popular 16-bit precision support (shows its age, you could say, Polaris is 6 years old by now), and as expected, forcing a GPU to do something it doesn’t support will result in a crash, hurray.

toastUnlimited {{< gh-hovercard "8369" "disabled the extension" >}} on Polaris GPUs while we wait for our dedicated GPU devs to have the time to implement a proper fix. 
We plan to allow the extension to work with old-school 32-bit precision in the future.

While still on the subject of AMD Windows Vulkan drivers, we have to talk about another extension issue.
Since driver version 22.5.2, support was added for `VK_KHR_push_descriptor`, an old extension that has been working in every other driver for the past 5 years, be it Intel, NVIDIA or Mesa.

While we don't yet know the root cause of the issue, only AMD's Windows drivers crash when calling VK_KHR_push_descriptor. 
As this extension is critical to the entire rendering process, any AMD GPU would crash on any game.

It seems that this time around, AMD may have simply released a broken implementation of the extension.
This extension previously worked with yuzu's Vulkan implementation without issue.
If that’s the case, it’s AMD’s turn to solve the issue.
In the meantime, toastUnlimited {{< gh-hovercard "8379" "blocked the extension" >}} on the affected AMD Vulkan driver versions.

Elsewhere on the GPU emulation front, [asLody](https://github.com/asLody) {{< gh-hovercard "8311" "implemented stencil fixes when two faces are disabled." >}}
This should improve rendering for some games that natively use OpenGL.

## HLE Improvements

Moving onto the subject of HLE emulation, a *very dear* section for [bunnei](https://github.com/bunnei). 
The dev team has been working hard at improving the accuracy and performance of yuzu's kernel emulation.

This time around, a big change was made with how games and the emulated OS can "lock resources". 
This improves emulation performance with literally every game, and to a varying degree, on any CPU.
Let's dive in.

In software engineering, a [spinlock](https://en.wikipedia.org/wiki/Spinlock) is a lock that causes a thread trying to acquire it to simply wait in a loop
 ("spin") while repeatedly checking whether the lock is available.

{{< imgs
    "./spinlock.png| Example of a spinlock, simple but gets the job done"
  >}}

There exists another synchronization primitive with a similar function, [the mutex](https://en.wikipedia.org/wiki/Mutual_exclusion). 

The word "mutex" stands for an object providing `MUTual EXclusion` between threads.
A mutex ensures that only one thread has access to a critical section or data by using operations like a lock and unlock.
A critical section is a shared resource that many threads want to access.
While there is no issue if multiple threads want to read the same critical section, no new thread can modify the section until the previous thread finishes its own writing. 
Under this scenario, the first thread locks the section, and will remain that way until the lock is released.

{{< imgs
    "./mutex.png| Example of a mutex"
  >}}

In theory, when a thread tries to lock a mutex and it does not succeed (for example because the mutex is already locked), it will be paused.
The operating system will then take the opportunity to schedule an available and ready thread to run in its place.
The paused thread will continue to sleep until it is able to acquire the mutex. 
This may happen once the current thread holding the mutex lock releases it.

Consequently, threads "spinning" to acquire the lock will waste (perhaps precious) system resources. 
While the Switch's own operating system uses spinlocks, this drain on resources can be problematic when emulating on lower-end hardware. 
Using the host operating system (Windows or Linux) mutex allows yuzu to continue emulation tasks on other available threads.

Helpfully, most modern operating systems use hybrid mutexes and hybrid spinlocks.
The spinlock approach would work fine on systems with threads to spare. 
However, for emulation, we need many threads (for UI, audio, GPU emulation, logging, etc.), so this approach is not quite ideal, especially on CPUs with low core/thread counts.

Thus {{< gh-hovercard "8172" "by moving from spinlocks to mutexes," >}} we were able to improve how yuzu runs on systems with low core counts. 
Our testing results showed that yuzu is now much more usable on 4 thread systems, solving stability issues on 4 cores/4 threads CPUs (most notably in `Pokémon Sword/Shield`), and substantially improving performance on (previously completely non-viable) 2 cores/4 threads CPUs.

The best news for the low-end gang!

## UI changes

Pivoting towards user interface improvements, [Docteh](https://github.com/Docteh), who is becoming a regular here, has been very helpful with some translation holes we had for a while.

For example, the Custom RTC setting had several issues if the Windows system locale was set in certain languages, making it either display incorrectly (for example lacking the AM/PM indicator), or completely unusable.
{{< gh-hovercard "8291" "Fixing the display format" >}} allows Custom RTC to show up correctly in any language now.

The Network tab in `Emulation > Configure… > System` could remain untranslated after changing languages. This was a simple case of forgetting to include the tab in the translations, so Docteh {{< gh-hovercard "8293" "fixed the oopsie" >}} and the lone Network tab now displays as it should.

{{< single-title-imgs-compare
    "Netto-kun. Now I want a Battle Network Legacy Collection, c'mon CAPCOM!"
    "./netbug.png"
    "./netfix.png"
>}}

For a while now, the layout of yuzu's About dialog, particularly on Linux, has had some issues. 
While we've attempted to fix it in the past, these attempts would have an adverse effect on the Windows builds, and vice versa.
Via qtcreator, Docteh {{< gh-hovercard "8339" "fixed the About dialog UI file," >}} and removed an old warning caused by the original .png image.
Thanks Docteh for taking the time to properly address the issue once and for all!

## Controller changes

[german77](https://github.com/german77) is the undisputed king of this section again. He continues the endless quest of providing the best user input experience possible.

german77 noticed that motion continued reporting data even when disabled, causing `Pokémon Let’s Go, Eevee/Pikachu!` to spam `StopSixAxisSensor` errors in the logs.
While working on this, he also noticed a missing parameter, `delta_time`.
Its proper implementation allows yuzu to have an {{< gh-hovercard "8308" "accurate motion refresh rate," >}} equal to the Switch.

In an all-in-one pull request, german77 made {{< gh-hovercard "8368" "several input changes," >}} including:

- Add proper error handling for several [HID](https://en.wikipedia.org/wiki/Human_interface_device) functions
- Improve previous implementations to match more closely to native hardware.
- Implement functions needed by `Nintendo Switch Sports`, `EnableSixAxisSensorUnalteredPassthrough`, `IsSixAxisSensorUnalteredPassthroughEnabled`, `LoadSixAxisSensorCalibrationParameter`, `GetSixAxisSensorIcInformation`, `ResetIsSixAxisSensorDeviceNewlyAssigned`.

While we've made some great progress here, `Nintendo Switch Sports` will be unplayable on yuzu until we rework our audio and make some much needed GPU fixes too. 
While audio and perfect rendering may not seem critical to playability, games often are quite unstable if these are not accurate. 
Rest assured, we're working on these and will have more to share soon!

Changing game genres, `Arcaea` was reported as having issues with touch-release emulation.
Turns out this game checks for the reported touch position on release, and some input drivers lose their position data after release.
Additionally, multi-touch was found to not work properly on touch screens.

After performing basically {{< gh-hovercard "8372" "a mini-rewrite of the touch emulation," >}} german77 fixed both issues.

{{< imgs
    "./arcaea.png| Osu! but better? (Arcaea)"
  >}}

One of the hurdles when working with a near endless amount of different controllers is the different quality of implementations they have.
Since yuzu used to wait for the controller to respond after sending a vibration signal, slow controllers could stall the whole emulator, causing severe stuttering.
To counter this, german77 {{< gh-hovercard "8374" "moved vibration to a queue in a separate thread," >}} allowing yuzu to move along with emulation, letting your controller make its best effort.
This is just another example of how emulation can often be improved by moving blocking operations to asynchronous background threads to improve overall usability. 
In fact, yuzu uses dozens of threads for emulation, which is all the more reason why eliminating spinlocks really helps things to run as smooth as butter!

## Future projects

While `Project Y.F.C.` was slightly stalled due to some NVFlinger regressions, these have since been resolved and will be covered in the next progress report!
Under [blinkhawk](https://github.com/FernandoS27)'s lead, `Project Y.F.C.` is making great progress and is on track to release soon.
As a reminder, `Project Y.F.C.` is an overhaul of various parts of our GPU emulation, fixing many inaccuracies and improving both performance and compatibility.

[Maide](https://github.com/Kelebek1) is up to something. (Hint: if you check the previous progress reports, you'll notice a common theme with their pull requests)

And toastUnlimited is working on getting MinGW Clang builds for Windows, which could potentially be faster than the MSVC builds we’re using now. This work is tied with the release of `Project Gaia`, so it will take a bit.

## Bonus track

As an extra bonus, gidoly, one of our team members recently got his hands on a Ryzen 5800X3D, giving us the chance to compare it to a regular 5800X fixed at 4.5GHz so only the extra cache should be relevant.

Here are the results!

{{< imgs
    "./chart.png| Still the best upgrade path for a Zen1 user"
  >}}

While the 5800X is manually forced to a 4.5GHz frequency, the 5800X3D naturally tops out at a 4.45GHz clock speed, the results are respectable, but nothing amazing.
Pokémon Brilliant Diamond certainly loves the extra cache, while Metroid Dread is punished by its extra latency.

That’s all folks! As always, thank you for your support, and we hope that you enjoyed this summary of our recent progress. 
See you next month! Until then, keep on emulating, and let us know what we can do to make yuzu the best possible emulation experience!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
