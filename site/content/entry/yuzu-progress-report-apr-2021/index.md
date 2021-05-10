+++
date = "2021-05-09T12:00:00-03:00"
title = "Progress Report April 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++ 

Howdy yuz-ers! Another month gone, another progress report showing up. From new firmware versions to Vulkan fixes, we have quite a bit to talk about, so let’s get right into it!

<!--more-->

## Project Eleuthia

As described in [its own dedicated article](https://yuzu-emu.org/entry/yuzu-applet-overlays/), [Morph](https://github.com/Morph1984) and [Rei](https://github.com/Its-Rei) have been very busy [*rei*mplementing the applets](https://github.com/yuzu-emu/yuzu/pull/6133) yuzu uses.

This first step implements the `On-Screen Keyboard` (or OSK) that games use, and the `Error Display` yuzu uses to alert the user to bugs, missing data, or crashes.

{{< single-title-imgs
    "Examples of the different kinds of keyboards games request"
    "./osk1.png"
    "./osk2.png"
    "./osk3.png"
  >}}

Another major advantage is adding gamepad support! No need to get off the couch to grab a keyboard anymore.

{{< imgs
	"./error1.png| An error example"
  >}}

Part of the effort included working around Qt’s quirks, so as a by-product users now have the option to select either the old `Exclusive Fullscreen` (recommended and used as default on Linux), or the [new](https://github.com/yuzu-emu/yuzu/pull/6135) `Borderless Fullscreen` (recommended for most cases and to have OSK properly working).

Borderless not only gives us better input support for gamepads, but also reduces screen tearing and improves clock management related performance issues on some AMD GPUs.

## Input improvements

A feature lacking from our `Stereo Vision` implementation was support for the Switch’s motion detection, and by this we don't mean Joy-Cons, but rather the actual console.
This is commonly used for moving the camera with your head when the Switch is in the Labo goggles.

[german77](https://github.com/german77) [implemented SevenSixAxis and ConsoleSixAxisSensor](https://github.com/yuzu-emu/yuzu/pull/6226), continuing from [previous work](https://github.com/yuzu-emu/yuzu/pull/6224) done by [Morph,](https://github.com/Morph1984) allowing your configured motion device to freely let you look around in compatible games.

{{< imgs
	"./vr.png| Please don't use it like this..."
  >}}

Both the left and right Joy-Cons map their buttons to different memory locations, as [german77](https://github.com/german77) found out. 
He discovered that we had the wrong [location for the SL and SR buttons.](https://github.com/yuzu-emu/yuzu/pull/6131) 
One fix later, and everything is as it should be.

A long standing bug when trying to play `Mario Kart 8 Deluxe` in local split screen multiplayer was a freeze that occurred when confirming all connected players.
[Morph](https://github.com/yuzu-emu/yuzu/pull/6205) fixed this crash by [sending the focus state change message](https://github.com/yuzu-emu/yuzu/pull/6205) on applet state changes.

{{< imgs
	"./mk8input.mp4| Better to crash other players than crash the game!"
  >}}

Thank you EmulationFanatic and riperiperi for the help!

Taking inspiration from [RPCS3](https://rpcs3.net/), [Morph](https://github.com/yuzu-emu/yuzu/pull/6205) [sets the default keyboard input](https://github.com/yuzu-emu/yuzu/pull/6241) to something more suitable for PC users.
You just can’t beat WASD movement, especially when combined with mouse aiming.

{{< imgs
	"./keys.png| Rip and tear, press and click until it is done"
  >}}

Gamecube controllers connected to an adapter sometimes reported the joystick off-center due to invalid data being sent during the connection.
[german77](https://github.com/german77) solved this [by taking 4 measurements during initialization](https://github.com/yuzu-emu/yuzu/pull/6243), ensuring that the controller finds its center, like any warrior should.

## User interface changes

[Kewlan](https://github.com/Kewlan) is back with more input improvements!

To start off, they've [added a favourite option in the context menu,](https://github.com/yuzu-emu/yuzu/pull/6198) so you can force some of your games to the top of the list.

{{< imgs
	"./fav.png| Just right click them!"
  >}}

Additionally, they [updated the results from a filtered search](https://github.com/yuzu-emu/yuzu/pull/6261) after you remove a directory. This fixes incorrect behaviour if the user decides to modify the game folders while doing a filtered search.

And lastly, they fixed a [random bug that caused folders to expand or collapse when moving them in the game list.](https://github.com/yuzu-emu/yuzu/pull/6263)

Several users reported that `Super Smash Bros. Ultimate` may get stuck when loading our web applet, making the whole game softlock.
Turns out the URL used by the applet was getting deleted before being used.
[Morph](https://github.com/Morph1984) got around this bug [by extending the lifetime of the URL.](https://github.com/yuzu-emu/yuzu/pull/6257)

## It’s 12 o’clock and it’s time for a new firmware!

A big challenge made its entrance last month: the Nintendo Switch's firmware version was finally updated to Version 12.X, which has kept our developers quite busy figuring out what has changed and what needs to be implemented.

Thanks to joint efforts of [german77](https://github.com/german77), [epicboy](https://github.com/ameerj), [lioncash](https://github.com/lioncash), and [Morph](https://github.com/Morph1984), yuzu was able to update many system call ID tables ([PR #6153](https://github.com/yuzu-emu/yuzu/pull/6153), [PR #6154](https://github.com/yuzu-emu/yuzu/pull/6154)), services and function tables ([PR #6157](https://github.com/yuzu-emu/yuzu/pull/6157), [PR #6158](https://github.com/yuzu-emu/yuzu/pull/6158), [PR #6159](https://github.com/yuzu-emu/yuzu/pull/6159), [PR #6160](https://github.com/yuzu-emu/yuzu/pull/6160), [PR #6161](https://github.com/yuzu-emu/yuzu/pull/6161), [PR #6164](https://github.com/yuzu-emu/yuzu/pull/6164), [PR #6171](https://github.com/yuzu-emu/yuzu/pull/6171)), as well as some system values ([PR #6155](https://github.com/yuzu-emu/yuzu/pull/6155)).

Firmware updates generally aim to improve the stability of the hardware and patch exploits, but they might also add support for new features under the hood, which usually requires changes to services, their structures, and other monsters lurking within the OS.
Since future games could make use of any of these things, it’s imperative to integrate and support these changes as soon as possible.

## General bugfixes

Recently, [toastUnlimited](https://github.com/lat9nq) caught some bugs using [Sanitizers](https://github.com/google/sanitizers/wiki): a number of tools present in some compilers, which are used to analyse the source code and alert the programmer about memory-related problems (leaks, overflows), undefined behaviour (code that works in one environment but might fail in another), data races (a synchronization problem that appears when dealing with multiple threads accessing the same data), etc.
This led to a series of PRs implementing fixes in yuzu's code, such as: [Prevent stack-use-after-scope](https://github.com/yuzu-emu/yuzu/pull/6141), which ensures that data that used to be accessed indirectly through pointers cannot be accessed again once the reference is lost (possibly corrupting the data that was being pointed to), [Avoid reference binding to misaligned address](https://github.com/yuzu-emu/yuzu/pull/6142), as well as a number of undefined behaviour bugs that occurred when copying memory from one address to another ([PR #6143](https://github.com/yuzu-emu/yuzu/pull/6143), [PR #6145](https://github.com/yuzu-emu/yuzu/pull/6145), and [PR #6146](https://github.com/yuzu-emu/yuzu/pull/6146)).

toastUnlimited also reported an overflow that occurred when he tried playing `Pokémon Sword` and `Pokémon Let's Go Pikachu`’s demo, which was related to some of the operations realized by the clock.
This helped [Morph](https://github.com/Morph1984) notice a problem in the implementation of the `CalculateStandardUserSystemClockDifferenceByUser` function, and [promptly submit a fix](https://github.com/yuzu-emu/yuzu/pull/6167).

Different processes communicate through mechanisms known as `IPC` (Inter-Process Communication), and they can send data by using `data buffers`, typically used for large data transfers, or `raw arguments`, which are usually composed of smaller data sets.
In the case of the clock service of this function, this information has to be sent through the aforementioned `data buffers`, but it was being extracted as `raw arguments` instead.
This caused the function to operate using uninitialized data (in other words, junk), since it retrieved the wrong values.
What should have been generally reported as a couple of milliseconds was instead being reported as a time span of trillions of years — approximately, 320 000 times the calculated age of the universe!
Thankfully, the fix only required a small change, so now the values are retired from the proper buffers, and yuzu won't try to dilate time any more (relatively speaking, if you catch my drift).

[epicboy](https://github.com/ameerj) made a follow-up of previous work that aimed to improve the accuracy of how the values for `resource limits` are [used in the kernel](https://github.com/yuzu-emu/yuzu/pull/6185).

By nature, all resources in any piece of hardware are limited.
The amount of memory, the number of I/O devices, and even the number of processors, just to name a few examples, have a fixed value that cannot be changed at whim, without changing the hardware first.
One of the many functions of the kernel in an operating system is to manage and distribute these resources to the processes that request them  — and for this, it must know the availability and limits of these resources.
Whenever a process is created or deleted, the hardware calculates the amount of memory that is free to use and being used by checking and updating the variables that keep track of these resources.

Previously, yuzu created processes in such a way that each instance of a process had their own value for `resource limits`.
This was a work-around to ensure that, whenever a process queried the kernel for the amount of memory available, a correct value was always returned.
This, however, is not how the hardware works.
Memory is a resource that is shared system-wide among all the processes, and the task of the kernel to coordinate how these resources are shared among the processes in the system.

With this PR, processes don't "own" their own instance of `resource limits`, and they now use the global kernel instance instead.

[Dynarmic](https://github.com/MerryMage/dynarmic) — yuzu's JIT, used to translate the Switch’s ARM CPU instructions — was recently updated again in order to [increase the size of the code cache](https://github.com/yuzu-emu/yuzu/pull/6132) (where yuzu stores the translated code), and add support for some unimplemented instructions from the `thumb32` set, expanding the amount of code that can be translated.

[degasus](https://github.com/degasus) found that the code cache size was too small when testing `The Legend of Zelda: Breath of the Wild`, and alerted [merry](https://github.com/MerryMage), the chief maintainer, about the problem.

{{< imgs
	"./smash.png| No items, The Best only, Final Destination"
  >}}

Surprisingly, this simple change fixed a very obnoxious problem in a completely different game: the strange slowdowns in `Super Smash Bros. Ultimate`.
It turned out that these slowdowns were unrelated to the power of the computer running yuzu, nor were they neither related to building the shader cache.
Dynarmic was just translating code again, simply because the cache where the translated code was stored was too small.
But now, with the new size value in place, Dynarmic has no need for any recompilation, and the emulation can proceed smoothly.

Continuing with previous `Super Smash Bros. Ultimate` Spirit Board’s fixes, [Morph](https://github.com/Morph1984) [synchronized the network clock to the local clock](https://github.com/yuzu-emu/yuzu/pull/6170), solving the game timers getting reset.

[Morph](https://github.com/Morph1984) also fixed `GetClockSnapshotFromSystemClockContext`.
[This PR](https://github.com/yuzu-emu/yuzu/pull/6214) allowing `Super Kirby Clash` and `Yo-Kai Watch 4` to boot.

{{< imgs
	"./kirby.png| Poyo!"
  >}}

[Morph](https://github.com/Morph1984) [stubbing `SetRequestExitToLibraryAppletAtExecuteNextProgramEnabled`](https://github.com/yuzu-emu/yuzu/pull/6234) and [german77](https://github.com/german77) [adding the `ectx:aw` service](https://github.com/yuzu-emu/yuzu/pull/6235) made `Pixel Game Maker Series Werewolf Princess Kaguya` boot!

{{< single-title-imgs
    "Right picture is from a more recent PR that will be mentioned in the next progress report (Pixel Game Maker Series Werewolf Princess Kaguya)"
    "./kaguya.png"
    "./kaguya2.png"
  >}}

The game currently has rendering bugs especially affecting Nvidia hardware. AMD users will have a better experience in this particular game for now.

## Graphics improvements

For our ~~thermonuclear~~ laptop users and heavy multitaskers, the legendary [degasus](https://github.com/degasus) has a treat for you. 
By [avoiding spin loops](https://github.com/yuzu-emu/yuzu/pull/6162) in the video core, more idle time is achieved with no performance loss.
This means the GPU can enter `sleep` state more often, resulting in lower temperatures/power consumption, better battery life, and allows the scheduler to take on other tasks waiting in the background, improving system responsiveness.
No more burned thighs while on the pause menu, laptop users!

[Joshua-Ashton](https://github.com/Joshua-Ashton), the Frog Master from [DXVK](https://github.com/doitsujin/dxvk), brought us a few Vulkan fixes and improvements.

First on the list is avoiding a device loss (GPU locks up and the driver restarts it) by [checking the return value of vkAcquireNextImageKHR.](https://github.com/yuzu-emu/yuzu/pull/6180)

Joshua also [enabled the individual features](https://github.com/yuzu-emu/yuzu/pull/6181) from `VK_EXT_robustness2`, instead of just enabling the extension.

And finally, [fixing a wrong offset for null vertex buffers](https://github.com/yuzu-emu/yuzu/pull/6182) to properly follow the Vulkan specification. 
You never know when a driver will behave in erratic ways. Fixes like this allow developers to report bugs to the vendors' driver development teams, thanks to confirming everything is within specs. Any resulting error falls under responsibility of the driver teams.

OpenGL wasn't the only API to have BGR issues, it turns out Vulkan can also suffer from "blue madness" when a game uses the `A1B5G5R5_UNORM` texture format.

[epicboy](https://github.com/ameerj) [swapped the Red and Blue channels](https://github.com/yuzu-emu/yuzu/pull/6238) of this format, fixing colours in games like `Pokémon Let’s Go Eevee/Pikachu`, `Shantae: Risky’s Revenge`, and many others!
You can see the result in the following pictures, before (left) and after (right).

{{< single-title-imgs
    "I didn’t want Pokémon Blue! (Pokémon Let's Go, Eevee!)"
    "./pokebug.png"
    "./pokefix.png"
  >}}

{{< single-title-imgs
    "That’s definitely not Vivi (Shantae: Risky’s Revenge)"
    "./shanbug.png"
    "./shanfix.png"
  >}}

## Linux Build System

[toastUnlimited](https://github.com/lat9nq) has been periodically improving yuzu’s build system for our Linux user base. 
Not all our users want or are able to use the official AppImage, so not only did our build instructions need to be improved, but it was also equally important to refine the environment necessary to get yuzu running — namely, the dependencies, build process, etc.

The first step was to [make SDL2](https://github.com/yuzu-emu/yuzu/pull/6204) [an external dependency.](https://github.com/yuzu-emu/yuzu/pull/6207)
This would allow us to ship the latest version without having to face Linux distributions' incompatibilities due to different build flags (different characteristics being enabled), or outright outdated versions that aren’t able to support all of the required features that our input asks for.

The changes to SDL2 introduced an incompatibility with the Conan-provided Boost version. [Downloading it as an external dependency](https://github.com/yuzu-emu/yuzu/pull/6222) ensures compatibility, as most of the time the local packages provided by the distribution won’t be enough.
This change also makes our external download script cross-platform with Windows and other distributions that used to require special workarounds.

As a special bonus, due to all of these changes, Red Hat Enterprise Linux 8 and its derivatives can build yuzu in a much more user-friendly way.

For anyone interested, we keep updated build instructions [on this page.](https://github.com/yuzu-emu/yuzu/wiki/Building-For-Linux)

## Future projects

This section has lately turned into Project Hades teasing, but we won’t apologize for that! Here’s more info/teasing:

While working on implementing SPIR-V for OpenGL, we discovered that Nvidia decided to take the lazy way out and just convert SPIR-V back to GLSL, which is then compiled again to GLASM. 
This not only destroys any benefit we expected to gain when switching to SPIR-V by default, it also causes huge delays and rendering problems.
We are forced to also implement GLSL in Project Hades, introducing a considerable amount of extra work that wasn’t expected.

{{< imgs
	"./hades.mp4| The best use of Tessellation Shaders ever"
  >}}

This will provide better compatibility for Nvidia hardware, saving Fermi once again from the gutter.

Regarding other project news, Morph’s Project Gaia is growing. german77 is working hard on Project Kraken. bunnei has more kernel changes in the oven.

That’s all folks! Thank you for sticking with us and see you next month!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
