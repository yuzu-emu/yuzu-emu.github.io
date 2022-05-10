+++
date = "2022-05-07T12:00:00-03:00"
title = "Progress Report April 2022"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 0
+++

Hello yuz-ers, the month of April has been amazing! We'll discuss CPU and Kernel performance improvements, several GPU emulation changes, UI tweaks and more!

<!--more--> 

## Saving Princess Peach yet again

Continuing his work to better support the [official](https://yuzu-emu.org/entry/yuzu-progress-report-mar-2022/#the-vulkan-emulator) GameCube/Wii and Nintendo 64 emulators (codenamed `Hagi` and `Hovercraft` respectively), [byte[]](https://github.com/liamwhite) has introduced several new PRs to further improve the compatibility of the titles included within `Super Mario 3D All-Stars`.

byte[] first implemented support for GLSL in `Super Mario Sunshine`, as not everyone can run Vulkan.
This is achieved by adding {{< gh-hovercard "8133" "support for indirect addressing" >}} in OpenGL.

This change doesn’t include support for GLASM at the moment, since our developers aren't too fond of having to deal with NVIDIA assembly shader code.
Imagine being asked to fix an issue in a car engine, and the only given tools for the job are a rock and a stick.

However, that was only half the battle. Proper OpenGL support for `Super Mario Sunshine` and `Super Mario Galaxy` required solving an old limitation we had with the aging API: broken Z scale inversion.

Most Switch games use either OpenGL, the popular free graphics API, or NVN, the proprietary NVIDIA API exclusive to the console. 
Arguably, NVN is much closer to OpenGL than Vulkan in how it operates.

The Tegra X1 GPU on the Switch is flexible enough to allow the coordinate system to be changed at the discretion of the game developer. While most games will behave closer to what OpenGL expects, with the Z-axis facing away from the camera, `Hagi` and `Hovercraft` emulated games (which render using Vulkan and is exclusive to a tiny handful of titles on the Switch) have the coordinates inverted and the Z-axis facing into the camera, the way Vulkan games would expect to natively render.

{{< imgs
	"./coords.png| byte[]'s Z-axis diagram"
  >}}

This was not an issue if you wanted to play `Super Mario Galaxy` or `Super Mario Sunshine` in yuzu with yuzu's Vulkan backend, as the behaviour matched with what the game expected. 
But if you tried to play using OpenGL instead, yuzu would not correctly interpret that the faces were flipped due to the Z scale inversion, and thus rendered only the back faces of objects.

The solution is very simple, {{< gh-hovercard "8149" "flip the front faces" >}} when the Z-axis is inverted.

{{< single-title-imgs-compare
	"Welcome to the Shadow Realm Resort (Super Mario Sunshine)"
	"./zbug.png"
	"./zfix.png"
>}}

Next in line, you may have noticed that `Super Mario Sunshine` rendered with a black bar at the bottom.
This is because the Wii and GC games natively use an aspect ratio different to the usual 16:9 we’re used to.
Instead, the games render at a 5:3 aspect ratio. 
`Super Mario Galaxy` informs the system to explicitly crop the screen to its native resolution of 1920x1012, but `Super Mario Sunshine` does not, so yuzu previously did not attempt to crop the game, resulting in a conspicuous black bar at the bottom of the render.

{{< imgs
	"./crop.png| Diagram of the cropping process"
  >}}

While the game proportions in `Super Mario Sunshine`, arguably, appear more correct with the black bar, that’s not how Nintendo intended the game to be played. For accuracy’s sake, byte[] interprets the game's implicit crop request, which stretches the image to match the native 1920x1080 resolution of the Switch, both {{< gh-hovercard "8150" "for Vulkan" >}} and {{< gh-hovercard "8152" "for OpenGL" >}}.

{{< single-title-imgs-compare
	"Don not adjust your set (Super Mario Sunshine)"
	"./cropbug.png"
	"./cropfix.png"
>}}

In the previous report, we mentioned how S8D24 < > ABGR8 texture conversions allow `Super Mario Galaxy` star bits to behave correctly. 
Well, it’s {{< gh-hovercard "8161" "OpenGL’s turn" >}} to join the fun.

{{< imgs
	"./s8d24.png| S8D24 to ABGR8 texture conversion diagram"
  >}}

We mentioned last month how `Super Mario 64` had special requirements to start running on yuzu. 
Most games compile their code `ahead-of-time` ([AOT](https://www.youtube.com/watch?v=DeYTBDQnQZw)), that is, before being shipped to you. The Operating System’s job is to execute that precompiled binary code, and then you're playing games.

`Super Mario 64`, on the other hand, runs `just-in-time` (JIT), to make it easier to develop the `Hovercraft` emulator, and to allow reusing the same `Hovercraft` binary for different games.
The `Hovercraft` emulator loads a native Nintendo 64 ROM of Super Mario 64, and then its JIT compiler takes the ROM and translates the original [MIPS](https://en.wikipedia.org/wiki/MIPS_architecture) (the architecture of the Nintendo 64’s CPU) instructions into [AArch64](https://en.wikipedia.org/wiki/AArch64) (the Switch’s CPU architecture) instructions on the fly.
Only then will the operating system execute the game code.

{{< imgs
	"./jitsrv.png| Ahead-of-time versus Just-in-time compilation diagram"
  >}}

This is similar to how yuzu translates AArch64 instructions into AMD64 instructions with the assistance of [Dynarmic](https://github.com/merryhime/dynarmic).

The JIT service, which is required to use JIT compilation on retail titles, is a functionality that yuzu didn’t have implemented, simply because no other game had ever needed it.
Additionally, there were some obstacles to implementing it in a direct way, since it requires calling custom code supplied by the game, something which was never needed by any previous service implementation.
So, {{< gh-hovercard "8164" "some preliminary stubs aside" >}}, byte[] {{< gh-hovercard "8199" "implemented the HLE JIT service" >}} to allow the `Hovercraft` emulator to function and `Super Mario 64` to boot.

{{< gh-hovercard "8261" "In a separate PR" >}}, byte[] adds documentation of how the JIT service interface operates.
This should help other open source projects, if needed.

Of course, this wasn’t enough to get `Super Mario 64` playable, as there were rendering issues to solve as well.

It’s never that simple… but let's try to explain it simply.
Nintendo Switch games bundle their own individual GPU driver with each game. 
This is done to increase compatibility, you don't need to update every console in the world if a driver version has an issue.

For unknown reasons, either the `Hovercraft` emulator or the bundled GPU driver reports Vertex Buffers that are simply too large, especially when compared to what the game actually uses.
Whether it's an issue in the included emulator or just a driver bug, we can't know for certain, but we do need to work around this problem.

{{< imgs
	"./vb.png| Erroneous Vertex Buffer size diagram"
  >}}

So, instead of using the insane reported buffer size, byte[] says NO! and {{< gh-hovercard "8205" "uses the backing memory size" >}} instead.

{{< imgs
	"./sm64.png| It's-a him! (Super Mario 64)"
  >}}

Performance on Vulkan is not stellar for now, but you can finally enjoy all 3 of the `Super Mario 3D All-Stars` games with both APIs.

Lastly, [Morph](https://github.com/Morph1984) implemented a fix to {{< gh-hovercard "8135" "keep the web applet open in the foreground" >}}, as the `Super Mario 3D All-Stars` games require it or else they would crash a few minutes into gameplay.

## General graphical fixes

Following up on last month's NVFlinger rewrite, [bunnei](https://github.com/bunnei) continued to track issues and bug reports.
He fixed the reported issues and further cleaned up the code to improve code quality.
{{< gh-hovercard "8137" "See the code changes for the NVFlinger rewrite here" >}}.

`Xenoblade Chronicles 2` and `Hyrule Warriors: Age of Calamity` would experience interesting issues which were caused by the new `GPU Garbage Collector` introduced as part of `Project Y.F.C.`. 
We talked about those changes back in [January](https://yuzu-emu.org/entry/yuzu-progress-report-jan-2022/#other-graphical-fixes).

As you can see below, `Xenoblade Chronicles 2` would use exorbitant amounts of VRAM in OpenGL (Vulkan was unaffected):

{{< single-title-imgs-compare
	"Not a great way to test your whole VRAM (Xenoblade Chronicles 2)"
	"./xc2bug.png"
	"./xc2fix.png"
>}}

`Age of Calamity` would display *interesting* graphics at random intervals:

{{< single-title-imgs-compare
	"This is why you don't blast Caramelldansen too hard (Hyrule Warriors: Age of Calamity)"
	"./aocbug.png"
	"./aocfix.png"
>}}

[Blinkhawk](https://github.com/FernandoS27) {{< gh-hovercard "8128" "fixed the regressions" >}} and both games are back in business.

Often times in emulation, when you fix one issue, another pops up.
The cropping fix byte[] implemented for `Super Mario 3D All-Stars` had the lovely unintended side effect of breaking  rendering for homebrew apps in Vulkan.
Thankfully, Morph added the {{< gh-hovercard "8267" "magic line to the code" >}} that solves this regression.

## Skyline framework: Part 3

There has been important progress in getting the [Skyline](https://github.com/skyline-dev/skyline) modding framework working.
[Here are](https://yuzu-emu.org/entry/yuzu-progress-report-nov-2021/#skyline-framework-part-1) the [two links](https://yuzu-emu.org/entry/yuzu-progress-report-dec-2021/#skyline-framework-part-2) if you missed our previous progress reports on the subject.

[tech-ticks](https://github.com/tech-ticks) has been quite busy {{< gh-hovercard "8171" "working on the finishing touches" >}}.
The latest changes include:
- Better `LayeredExeFs` support, which results in easier mod distribution and self-updating capabilities.
- Support for the `SO_KEEPALIVE` socket option, which allows the Skyline TCP logger to operate.
- Implementation of [DNS](https://en.wikipedia.org/wiki/Domain_Name_System) address resolution, which is required by plugins that use HTTPS requests.

We must mention that while Skyline kernel support is basically finished, bugs in yuzu’s codebase prevent proper operation of the modding framework.
For example, due to underlying emulation issues, [ARCropolis](https://github.com/Raytwo/ARCropolis) won’t work until `Project Gaia` is finished, and some of the changes previously mentioned need some fine tuning from our part to function properly.

There’s yet more work to do, but we’re a lot closer. [I can see the finish line!](https://www.youtube.com/watch?v=IAAKG57ouyM)

## UI improvements

[Merry](https://github.com/merryhime), the core developer of `Dynarmic`, {{< gh-hovercard "8140" "made some changes to the add-ons game properties window" >}}, improving column widths.

{{< single-title-imgs
	"Low resolution users will like this"
	"./addonbug.png"
	"./addonfix.png"
>}}

The hotkeys configuration window {{< gh-hovercard "8141" "also got some love" >}}, changing the minimum column width.

{{< single-title-imgs
	"It's also great for GNOME users"
	"./hotkeybug.png"
	"./hotkeyfix.png"
>}}

Both changes are extremely beneficial for bloated or size unoptimized desktop environments, like GNOME Shell.

[Tachi107](https://github.com/Tachi107) {{< gh-hovercard "8142" "fixed some embarrassing typos in our logging" >}}, and {{< gh-hovercard "8225" "updated the About yuzu window" >}} to properly mention our new licence, `GPLv3.0+`.
The `+` is there because we want to leave the door open for newer revisions.

{{< imgs
	"./about.png| "
  >}}

Not stopping there, Taichi {{< gh-hovercard "8283" "brings cleanups and improvements to Flatpak builds" >}}, including using proper app ID, fixing some typos, and adding a launch parameter to make yuzu use the dedicated GPU by default on Linux instead of the integrated GPU.

[Docteh](https://github.com/Docteh) has also helped considerably in improving yuzu’s UI.

With a bit of manual thinkering, they managed to bypass some Qt limitations in order to {{< gh-hovercard "8190" "display more readable hyperlinks" >}} over dark themes.

{{< single-title-imgs
	"People seem to have forgotten what hyperlinks are for, just click them!"
	"./hyperlinkbug.png"
	"./hyperlinkfix.png"
>}}

Thanks to a report from GillianMC from our [Discord server](https://discord.gg/u77vRWY), Docteh found out that some quirks in the Qt API caused the compatibility status of listed games to not be translated.
The cause lies in QObject, you can find the specific details in the {{< gh-hovercard "8204" "pull request’s description" >}}. Now status is properly reported in the corresponding language.

{{< single-title-imgs
	"Example in Spanish"
	"./compatbug.png"
	"./compatfix.png"
>}}

Similarly, D-Pad directions also didn’t translate properly. The same suspect, {{< gh-hovercard "8224" "once again" >}}.
Someone, please send a warrant asking for the detention of Carmen Sandiego.

{{< single-title-imgs
	"Example in French"
	"./hatbug.png"
	"./hatfix.png"
>}}

## Kernel and CPU emulation changes

Ket's begin with two changes that happened in March.

Our resident bunnei rabbit continued his work on rewriting yuzu's kernel memory management to make it 
accurate to the latest system updates. This time, he tackled and revamped {{< gh-hovercard "7974" "how the kernel code memory is mapped and unmapped" >}}.

Code memory support, in the context of the Switch, allows games and apps to load and unload smaller parts of their code on the fly.
Thanks to these changes, 'Super Smash Bros. Ultimate' no longer causes memory access issues while loading/unloading NROs, making the game stable for long runs.

bunnei also {{< gh-hovercard "8013" "migrated slab heaps for the guest (Switch) kernel objects" >}} from host heap memory to emulated guest memory.
With this change, yuzu's memory layout is now more closely matching the console.

> A slab represents a contiguous piece of memory. A heap is a general term used for any memory that is
allocated dynamically and randomly.

So, slab heaps are basically pieces of memory dynamically allocated for guest kernel objects.
By moving these away from the host (PC) heap memory (RAM) to emulated guest (Switch) memory, we can ensure
that the kernel objects never go beyond the system limits to cause memory leaks on the host (PC).

Thread local storage (TLS), the mechanism by which each thread in a given multithreaded process allocates storage for 
thread-specific data, was also rewritten making it accurate to the latest HorizonOS behaviour.

With these changes, we have now completely fixed the kernel memory object leaks that affected a few games, but went largely unnoticed, due to the previous implementation allowing unlimited allocations.

Back to the list of April changes, bunnei also {{< gh-hovercard "8122" "reimplemented how yuzu handled thread allocation" >}} for HLE service interfaces.

> Services are system processes running in the background which wait for incoming requests. 
The Switch's HorizonOS has various services that perform various tasks e.g Audio, Bluetooth, etc.

Previously we used to allocate one host thread per HLE service interface because -

- some service routines need to block threads, and 
- we don't support guest thread rescheduling from host threads.

> A thread in block state will have to wait until an action can be completed.
> exmaple needed

The issue with this approach was that since it's the host OS that schedules these threads, yuzu could end up creating dozens of threads for services and that could lead to weird behaviour particularly on systems with hardware limitations.

With the rewrite, yuzu now has a single "default service thread" that is used for 99% of the service methods that are non-blocking.
For the services that are time-sensitive and for those that need blocking, we still allow thread creation (e.g. Audio, BSD, FileSystem, nvdrv)

This brings down the service thread count from double digits to single digits, thus improving stability and consistency - especially on systems with less cores.
Users with 4 thread CPUs (either 2 cores + HT/SMT, or 4 cores) should see performance and stability improvements on most games.

Another battle for proper shutdown behaviour is fought and won.
yuzu currently does not emulate multi-process capabilities of the HorizonOS kernel, however these still need to be managed.
To begin, the HorizonOS services have a port (for both client and server) that is used as a channel of communication for multiprocess (between game process to the server process).
A session is opened for each communication interface for them both and they are managed by their respective kernel objects.
When the game closes the client port, the service closes the server port, and everything is shut down.

The issue with our previous implementation was that yuzu wasn't properly tracking all the `KServerPort` and `KServerSession` objects for each service.
And because of this, the services weren't properly getting closed and they in turn were causing further issues.

This originally worked fine, but was regressed when we migrated guest kernel objects to emulated guest memory, as we mentioned previously.
bunnei figured out the issue and quickly {{< gh-hovercard "8165" "reimplemented how we track these kernel objects" >}}.

By having a single place where we can register/unregister open ports and sessions, we can now keep better track of these kernel objects.
And by ensuring that they are closed when we tear down all services and kernel, we get much better emulation shutdown behaviour.

## Input changes and general bugfixes

If the user sets a very high DPI value for their mouse while using mouse panning, the cursor may be able to escape the rendering window.
[IamSanjid](https://github.com/IamSanjid) implemented the {{< gh-hovercard "8170" "required fixes" >}}, including better centering timings to solve this issue. Thanks!

[german77](https://github.com/german77) has several fixes ready for us.

Let’s begin with an interesting one.
yuzu’s screenshot capture feature allows an easy way to save moments at the resolution the scaler is currently set at.
The hotkey for capture could be spammed, leading yuzu to a crash if several requests for capture were sent, this could be aggravated if the rendering resolution was set to a high value.
To solve this, yuzu now {{< gh-hovercard "8192" "ignores new requests while a capture is being processed" >}}, and prints a warning in the log.

There’s always room for improvements in emulation, as nothing is ever truly complete. This time, german77 focuses on inaccuracies found on our input emulation.

{{< gh-hovercard "8222" "`IsSixAxisSensorFusionEnabled` is implemented" >}} by reverse engineering all sixaxis functions, and it was verified by comparing with unit test homebrew results done on the Switch.
This should potentially improve motion accuracy.

The [HID](https://en.wikipedia.org/wiki/Human_interface_device) service in charge of handling input commands, among other things, used to operate by copying its assigned shared memory and reporting back the changes.
This leads to mismatches or delays in the input process, and can potentially make games read completely wrong data.

Of course, this is not ideal at all, so german77 {{< gh-hovercard "8229" "gets rid of the memory duplication" >}} and uses the ever magical * pointers to access the shared memory directly instead.
This can fix bugs on countless games, with the biggest example being the `Pokémon: Let’s Go` games having a hard time detecting controllers.

Hotkey presses will now be {{< gh-hovercard "8249" "triggered by using a queue" >}}. This has the benefit of not having to wait for the UI to respond, reducing their delay.

Analog sticks {{< gh-hovercard "8272" "got some love" >}}, with a couple of important changes in their mapping:

The default maximum range is now set to 95%, to ensure that games get to use the whole range. This change, for example, avoids character walking when the stick is at certain angles in games like `Pokémon Legends: Arceus`.
Minimum range was lowered from 50% to 25%, providing greater precision, particularly for people trying to play racing games with a matching wheel.
Auto-center correction is stronger now, avoiding drifting without having to rely on stronger dead-zone values.
Individual axis values can be manually deleted now if buttons were mapped manually.

Previously, only player 1 could automatically reconnect a controller by pressing a button. Other players only could do so when using a keyboard.
german77’s pull requests aims to solve that, {{< gh-hovercard "8277" "allowing any of the remaining 7 players to reconnect their controller" >}}. No privileges for the higher in hierarchy anymore.

This change is under testing at the time of writing, as it could potentially cause regressions. Be sure to use the status hovercard to check back in a few days!

## Future projects

`Project Y.F.C.` is not far away from releasing its first part of two planned.

`Project Gaia` continues to progress slowly but surely, it can now finally let some previously broken games to boot for the first time.

{{< single-title-imgs
	"."
	"./gaia1.png"
	"./gaia2.png"
>}}

That’s all folks! We're still playing catch up with some kernel and CPU optimization changes, so expect a more extensive section next time. 
Thank you for the company, see you next month!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
