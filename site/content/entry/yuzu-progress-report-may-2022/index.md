+++
date = "2022-06-10T05:00:00-03:00"
title = "Progress Report May 2022"
author = "GoldenX86"
coauthor = ""
forum = 0
+++

Greetings yuz-ers. While this monthly report will not be as extensive as others, we have several critical changes to discuss. Roll the tape!

<!--more--> 

## End of support for EOL Windows versions

Let’s first address the elephant in the room, shall we?

While working on dynarmic and kernel emulation, including improving the compatibility of 4 thread CPU systems, we made changes to dynarmic and fastmem that broke support for Windows 10 revision 1803 and older, including Windows 7 and Windows 8/8.1.

While it was a purely accidental change, this was warned with the introduction of fastmem.
We will not divert attention on fixing EOL versions of Windows. 
From Mainline version 991 and onward, only Windows 10 revision 1809 and newer, Windows 11, and Linux, will be the officially supported operating systems.

This decision is reinforced by the lack of GPU driver support on EOL systems (which affects Vulkan support going forward), inconsistencies in long file path limitations (critical for file system emulation improvements), as well as worse memory handling on a kernel level, memory handling we require to properly emulate the Switch.

Less code to maintain means faster development.

Finally, as a *special reason*, the response from certain members of the community, not only regarding [yuzu](https://github.com/yuzu-emu/yuzu/issues/8247), but also [Dolphin](https://www.reddit.com/r/emulation/comments/utbpmm/dolphin_has_dropped_support_for_windows_7_and_8/) and [Ryujinx](https://www.reddit.com/r/emulation/comments/ucit8l/ryujinx_will_officially_drop_support_for_windows/), made us take the decision that there is nothing to gain from continuing to support decade old operating systems that require custom code paths to continue working.

A 13 years old Windows is too old. 

If the user insists on running an unsupported operating system, [Mainline 990](https://github.com/yuzu-emu/yuzu-mainline/releases/download/mainline-0-990/yuzu-windows-msvc-20220419-a5e7c5330.zip) and older will work just fine.

## Vulkan by default

[As previously discussed](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2022/#vulkan-is-the-future), we have to circumvent some vendor locking and broken third party software limitations in order to provide a smooth experience with Vulkan as the default API.

The two main reasons for Vulkan related crashes when trying to boot a game or opening yuzu’s configuration are:

- Broken Vulkan layers on HUD and screen recording software, which could cause issues when yuzu and drivers add support for new Vulkan extensions.
- Outdated GPU drivers that lack the required features to run Vulkan. This is usually caused by relying on Windows Update to provide the drivers instead of manually installing the latest version, or Intel laptop vendors providing locked custom (meaning nerfed) drivers that are never updated.

Thankfully, we have a new system that can workaround those issues that are outside of our control.
yuzu will now perform a Vulkan check at boot.

If the check passes, yay!, you can use Vulkan or OpenGL and select which API to use, or in Vulkan’s case, which device to run yuzu with, as always from the Graphics section in configuration.

{{< imgs
    "./ok.png| Check passes, Vulkan works!"
  >}}

If the check fails, a warning will be displayed next boot, and you will be forced to use only OpenGL as the graphics API, with the option to pick its shader backend (GLASM, GLSL, SPIR-V) being available as always.

{{< imgs
    "./error.png| Oh oh.."
  >}}

For those poor souls that are stuck in OpenGL-only land, a button labeled "Check for Working Vulkan" at the bottom of the Graphics settings window will show up, allowing to retest Vulkan support.

{{< imgs
    "./button.png| Once you manage to solve the issue, click on the button at the bottom!"
  >}}

Thanks to [toastUnlimited](https://github.com/lat9nq), gone is OpenGL as the default graphics API. 
Out with the old, in with the new. {{< gh-hovercard "8393" "Long live King Vulkan." >}}

Keep in mind, we’re not removing OpenGL support, it will just be a lower priority from now on.

## Graphical changes, driver issues, and the nostalgia bliss that is the good old 64

[byte[]](https://github.com/liamwhite) continues the wave of improvements for `Super Mario 3D All-Stars`, this time, he noticed a bug in the [direct memory access](https://en.wikipedia.org/wiki/Direct_memory_access) of the Nintendo Switch’s GPU.

`DMACopy` is a mechanism that many games use to send texture data to the GPU, it handles the format conversion from "pitch" (just pixels on a line by line basis) to "tiled" images (optimized for sampler usage).
What they'll do is they'll write the pitch image data into GPU memory, then request DMACopy to tile it into a separate buffer that will be the texture for a draw.

{{< gh-hovercard "8313" "After fixing `bytes_per_pixel`," >}} `Super Mario Galaxy` now has proper lens flare.

{{< single-title-imgs-compare
    "RTX On? (Super Mario Galaxy)"
    "./dmabug.png"
    "./dmafix.png"
>}}

byte[] also improved the way OpenGL interprets face flips depth, [replacing the previously reported fix](https://yuzu-emu.org/entry/yuzu-progress-report-apr-2022/)

Now `Super Mario 64` {{< gh-hovercard "8314" "is playable in OpenGL." >}} 
Fermi GPU users rejoyce.

{{< imgs
    "./n64.png| We should get more games with the atmosphere The Legend of Zelda: Majora's Mask had"
  >}}

MacroJIT is an optimization that provides a performance improvement of 10%, more or less.
byte[] found that if the macro tried to access a parameter that was too far outside the bounds of what it was supposed to be accessing, the result would be a crash.
{{< gh-hovercard "8319" "One less reason for annoying crashes." >}}

MME, or Macro Method Expander, or simply macros, are small programs sent to the GPU when booting a game, responsible for executing methods (anything that changes the current status of the GPU).
byte[] added the option to {{< gh-hovercard "8320" "dump macros" >}} for debugging purposes.

But why are macros important?
Turns out, the `Nintendo 64` emulator (*totally not outside the Nintendo ToS*), included with the `Nintendo Switch Online` subscription, reasigns the same macros multiple times, each with different code.
{{< gh-hovercard "8328" "Properly clearing that code" >}} on upload address assignments allows the Nintendo 64 emulator to be playable.
Time to re-enjoy those classics!

For now, NVIDIA users will have to use OpenGL to run the Nintendo 64 emulator, and some graphical fixes are expected with the release of `Project Y.F.C.`.
AMD and Intel users are free to run Vulkan.

Polaris AMD Radeon users (RX 400 and RX 500 series) reported that drivers 22.3.2 and newer caused crashes on multiple games, most notably `The Legend of Zelda: Breath of the Wild` and `Animal Crossing: New Horizons`.

Driver patch notes mentioned implementing the `VK_KHR_workgroup_memory_explicit_layout` Vulkan extension.
The quick conclusion would be that AMD released a broken extension on the new drivers, which wouldn't be the first time, but that wasn’t the case.
The issue only affects Polaris GPUs, and the extension is available to newer architectures too, like Vega or RDNA2 (we don’t talk about ~~Bruno~~ RDNA1).

After a few debugging sessions we found out that yuzu’s implementation of VK_KHR_workgroup_memory_explicit_layout assumes that all GPUs compatible with it support 16-bit integer operations.
While this was the case for all GPUs previous to AMDs implementation of the extension, Polaris is notorious for its lack of 16-bit precision support (shows its age, you could say), and as expected, forcing a GPU to do something it doesn’t support will result in a crash, hurray.

toastUnlimited {{< gh-hovercard "8369" "disabled the extension" >}} on Polaris GPUs while we wait for our dedicated GPU devs to have the time to implement the proper fix, allow the extension to work with 32-bit precision.

Now, still on the subject of AMD, Windows Vulkan drivers, and extension blocking.
Since driver version 22.5.2, support was added for `VK_KHR_push_descriptor`, an old extension that has been working in every other driver for the past 5 years, be it Intel, NVIDIA or Mesa.

We don’t know the cause, but only AMD’s Windows drivers crash when calling VK_KHR_push_descriptor, and since this extension is critical in the whole rendering process, any AMD GPU would crash on any game.

Maybe this time we do have a broken implementation at release? It’s easy to believe so, this extension has been working since our first Vulkan release on any other driver.
If that’s the case, it’s AMD’s turn to solve the issue.
In the meantime, toastUnlimited {{< gh-hovercard "8379" "blocked the extension" >}} on AMD drivers with affected Vulkan driver versions.

[asLody](https://github.com/asLody) {{< gh-hovercard "8311" "implemented stencil fixes when two faces are disabled." >}}
This has the potential to improve rendering in native OpenGL games.

## UI changes

[Docteh](https://github.com/Docteh) has been very helpful with some translation holes we had for a while.

For example, the Custom RTC setting had several issues if the Windows system locale was set in certain languages, making it either display incorrectly (for example lacking the AM/PM indicator), or completely unusable.
{{< gh-hovercard "8291" "Fixing the display format" >}} allows Custom RTC to show up correctly in any language now.

The Network tab in `Emulation > Configure… > System` could remain untranslated after changing languages. This was a simple case of forgetting to include the tab in the translations, so Docteh {{< gh-hovercard "8293" "fixed the oopsie" >}} and the lone Network tab now displays as it should.

{{< single-title-imgs-compare
    "Netto-kun. Now I want a Battle Network Legacy Collection, c'mon CAPCOM!"
    "./netbug.png"
    "./netfix.png"
>}}

yuzu’s icon in the About dialog has been in a struggle lately, a fix for Linux builds would break Windows support, and vice versa.
Via qtcreator, Docteh {{< gh-hovercard "8339" "fixed the About dialog UI file," >}} and removed an old warning caused by the original .png image.
Thanks for taking the time to properly address the issue once and for all!

## Controller changes

Motion continued reporting data when disabled, causing `Pokémon Let’s Go, Eevee/Pikachu!` to spam `StopSixAxisSensor` errors in the log.
While working on this, [german77](https://github.com/german77) noticed a missing parameter, `delta_time`.
Its implementation allows yuzu to have an {{< gh-hovercard "8308" "accurate motion refresh rate," >}} equal to the Switch.

In an all-in-one pull request, german77 made {{< gh-hovercard "8368" "several input changes," >}} including:

- Add proper error handling for several [HID](https://en.wikipedia.org/wiki/Human_interface_device) functions
- Improve previous implementations to match more closely to native hardware.
- Implement functions needed by `Nintendo Switch Sports`, `EnableSixAxisSensorUnalteredPassthrough`, `IsSixAxisSensorUnalteredPassthroughEnabled`, `LoadSixAxisSensorCalibrationParameter`, `GetSixAxisSensorIcInformation`, `ResetIsSixAxisSensorDeviceNewlyAssigned`.

Nintendo Switch Sports will only be playable after an audio rewrite and more GPU work.

`Arcaea` was reported as having issues with touch emulation.
Turns out this game checks the position on release and some input drivers didn't keep it's position on release. 
Also, multi-touch wasn't working on touch screens.

After performing basically {{< gh-hovercard "8372" "a mini-rewrite of the touch emulation," >}} german77 fixed both issues.

{{< imgs
    "./arcaea.png| Osu! but better? (Arcaea)"
  >}}

One of the hurdles when working with an infinite amount of different controllers is the different quality of implementations they have.
Since yuzu used to wait for the controller to respond after sending a vibration signal, slow controllers could stall the whole emulator, causing severe stuttering.
To counter this, german77 {{< gh-hovercard "8374" "moved vibration to a queue in a separate thread," >}} allowing yuzu to move along with emulation while our controllers try to do their best.
An example of why more CPU threads help more than few faster threads, there’s always some background process that could be made asynchronous.

## Future projects

[Blinkhawk](https://github.com/FernandoS27) has been waiting for NVflinger to be back on track before continuing with `Project Y.F.C.`, so work can resume now.

[Maide](https://github.com/Kelebek1) is up to something.

And toastUnlimited is working on getting MinGW Clang builds for Windows, which could potentially be faster than the MSVC builds we’re using now. This work is tied with the release of `Project Gaia`, so it will take a bit.

## Bonus track

As an extra bonus, gidoly, one of our team members recently got his hands on a Ryzen 5800X3D, giving us the chance to compare it to a regular 5800X fixed at 4.5GHz so only the extra cache should be relevant.

Here are the results!

{{< imgs
    "./chart.png| Still the best upgrade path for a Zen1 user"
  >}}

While the 5800X is manually forced to a 4.5GHz frequency, the 5800X3D naturally tops out at a 4.45GHz clock speed, the results are respectable, but nothing amazing.
Pokémon Brilliant Diamond certainly loves the extra cache, while Metroid Dread is punished by its extra latency.

That’s all folks! As always, a pleasure to have you here. See you next month!
Some content had to be pushed to the next progress report, we're sorry for the inconvenience.

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
