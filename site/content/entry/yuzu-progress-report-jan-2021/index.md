+++
date = "2021-02-10T12:00:00-03:00"
title = "Progress Report January 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 359093
+++ 

Welcome yuz-ers, to the first progress report of 2021! We have quite a bit in store for you: from kernel and CPU emulation improvements to another major graphical rewrite. Here are the most important changes of January.
<!--more-->

## The Buffer Cache Rewrite

WWhile we have a [dedicated article detailing the improvements from the Buffer Cache Rewrite](https://yuzu-emu.org/entry/yuzu-bcr/) [(BCR)](https://github.com/yuzu-emu/yuzu/pull/5741), [Rodrigo](https://github.com/ReinUsesLisp) didn't sit idle and continued to improve the buffer cache. These new changes and improvements deserve some time in the spotlight. For the full context, we advise reading the dedicated article before continuing.

{{< single-title-imgs
    "The BCR offers performance and rendering improvements (Xenoblade Chronicles Definitive Edition)"
    "./xcdebug.mp4"
    "./xcdefix.mp4"
  >}}

Vulkan needed some improvements to be compatible with the BCR. In particular, its [memory allocator](https://github.com/yuzu-emu/yuzu/pull/5297) got a complete overhaul, improving its functionality.

A performance bottleneck affecting Intel GPUs in Vulkan was fixed by [using timeline semaphores instead of spin waits.](https://github.com/yuzu-emu/yuzu/pull/5311)

[Preliminary work was done](https://github.com/yuzu-emu/yuzu/pull/5363) to have the compute accelerated texture decoders working in the near future.

Assembly shaders are very limited and hard to work with due to their [ancient origins.](https://en.wikipedia.org/wiki/ARB_assembly_language#History) A problem faced during the BCR development is keeping compatibility with them while offering their advantage in shader build times to Nvidia users.
At release, the first implementation [Rodrigo](https://github.com/ReinUsesLisp) tried made use of `interops`, a feature that allows calling functions of one graphics API from another. In this particular case, he used the new memory allocator of Vulkan from within an OpenGL context.
While the results in Windows 10 and Linux were satisfactory, this had some limitations:

- Windows 7 was unstable due to broken memory management. A known problem that was never fixed during the lifetime of this now discontinued operating system.
- Fermi era GPUs (mostly 400 and 500 series) had to skip assembly shaders due to Nvidia never adding Vulkan support.
 
So, as a workaround for now, the old pre-BCR method is currently in place. Since this method may be slower in some games compared to the updated GLSL implementation, assembly shaders is now disabled by default while Rodrigo works on a different implementation. Feel free to re-enable this setting if you get playable performance in your games. You can find it in `Emulation > Configure… > Graphics > Advanced tab`

Vulkan users are advised to update their GPU drivers to the very latest version, as the BCR makes the extension `VK_EXT_robustness2` mandatory, instead of its previous optional status after the release of the Texture Cache Rewrite.
All three main GPU companies (Nvidia, AMD, and Intel) now offer support for this extension in their latest driver.
AMD users updating from Radeon Software may need to allow `Optional` driver download support to get the corresponding driver version to have access to this valuable Vulkan extension (at the time of writing).

Several games now prefer `High` GPU accuracy over the default `Normal` value.
Users can change this setting while playing by going to `Emulation > Configure… > Graphics > Advanced tab > Accuracy level`.
We recommend users to play with this setting to find the optimal performance, but to avoid the `Extreme` value for the moment, as it will either result in very low performance (intended result), or crash the game entirely (not intended, being investigated).

{{< imgs
	"./bcr.png| While there are big improvements across the board, this graph shows the limitations of integrated GPUs constantly fighting the CPU for RAM resources. Having your own fast dedicated on-board VRAM is very important for performance."
  >}}

Analysis time. If you compare this graph to the one of the RX550 in the [BCR artricle,](https://yuzu-emu.org/entry/yuzu-bcr/) you will notice that a small integrated Vega manages to beat a dedicated Polaris card in `Fire Emblem: Three Houses` by a few frames. 
This is because newer GPU architectures offer features that are useful for Switch emulation. Ray tracing is not the only cool kid in town!

The Tegra X1 SoC in the Nintendo Switch offers native support for FP16 with a 2:1 performance ratio, allowing games to double their performance over regular FP32 when doing floating point calculations. A simple way to achieve a higher frame rate on limited hardware.
Vega (GCN 5.0), Turing, Gen 9 Intel Graphics and newer offer native support for FP16, or as AMD calls it, “Rapid Packed Math”. 
Series like Polaris (GCN 4.0), Pascal and older may offer support in their drivers but don’t provide a performance advantage, and in the case of Pascal, it reduces performance considerably (64 times slower than FP32). 
In those cases FP32 is used to emulate FP16, obviously resulting in no performance gains.

This is the main reason our [Hardware Requirements](https://yuzu-emu.org/help/quickstart/#hardware-requirements) lists Gen 9.5, Vega, and Turing cards, as the recommended GPUs. Maxwell v2, Vega, Gen9 and later series also offer `conservative rasterization`, a very useful feature that yuzu can take advantage of in the future.

## General bug fixes and improvements

Let’s start with good news, Champion Leon can no longer win by default!
Thanks to [ogniK’s](https://github.com/ogniK5377) work, [unregistering already registered events](https://github.com/yuzu-emu/yuzu/pull/5799), games like `Pokémon Let’s Go Eevee/Pikachu` and `Pokémon Sword/Shield` won’t softlock when the game requests playing a video. Gotta beat em all, was it?

{{< imgs
	"./pksw.png| Let’s battle, for real this time! (Pokémon Sword)"
  >}}

Quality of Life improvements, although seemingly small, can still require several considerations.
[Morph](https://github.com/Morph1984) made [docked mode the default option](https://github.com/yuzu-emu/yuzu/pull/5324), with the intention to offer users the highest game quality, and to remove flickering experienced in `Super Mario Odyssey` when running the game with assembly shaders enabled while in undocked mode.
Users with integrated, slow, and/or old GPUs should consider using undocked mode, as the reduced resolution and detail level will help avoid performance bottlenecks.

[german77](https://github.com/german77) solved one of the most common problems users had when playing `Super Smash Bros. Ultimate`, [the inability to boot the game if more than one user profile was created](https://github.com/yuzu-emu/yuzu/pull/5842).
Thanks to this fix, users are no longer forced to play the game with the top profile in the list.

[toastUnlimited](https://github.com/lat9nq) continues his work on Linux’s `AppImages`.
Now yuzu’s [AppImage build can be updated](https://github.com/yuzu-emu/yuzu/pull/5302), reducing the download size to just around 9MB [if you use AppImageUpdate.](https://appimage.github.io/AppImageUpdate/)

[By improving `nvflinger`, the display service of the Nintendo Switch,](https://github.com/yuzu-emu/yuzu/pull/5279) [bunnei](https://github.com/bunnei) made `Katana ZERO` playable again.

Serendipity strikes again.
By [fixing a data race](https://github.com/yuzu-emu/yuzu/pull/5284) introduced by one of the recent kernel changes, [epicboy](https://github.com/ameerj) also fixed unlimited FPS mods which previously made the emulator crash.

By [fixing invalid buffer index errors,](https://github.com/yuzu-emu/yuzu/pull/5840) [Morph](https://github.com/Morph1984) was able to resolve various crashes in booting `Super Mario Maker 2` that occurred due to file system issues.

In the eternal torture that is audio development, [ogniK](https://github.com/ogniK5377) [implemented `FlushAudioOutBuffers`,](https://github.com/yuzu-emu/yuzu/pull/5809) making the `Devil May Cry` series playable.

{{< imgs
	"./dmc2.png| Look at the graphics, that's you know, what it's really all about (Devil May Cry 2)"
  >}}

## Miscellaneous graphical improvements

We have three public service announcements, one for each GPU vendor:

First, a message for AMD users with RX 5000 series graphics cards. 
In the past, we blacklisted the `VK_EXT_extended_dynamic_state` Vulkan extension on all RDNA1 based GPUs on Windows. The drivers at the time were unstable when using this extension, causing yuzu to crash to the desktop.
[This block has been removed](https://github.com/yuzu-emu/yuzu/pull/5814) by [Rodrigo,](https://github.com/ReinUsesLisp) but keep in mind that the user needs to be running `20.12.1` or newer driver versions.
“Navi“ users can expect several graphical fixes thanks to this change.

Blue team’s turn. On the topic of blacklists, [Rodrigo](https://github.com/ReinUsesLisp) had to [disable FP16 math support from Intel Windows Vulkan drivers](https://github.com/yuzu-emu/yuzu/pull/5798) to solve stability issues affecting `Astral Chain`. 
For now, half float operations will be emulated using FP32 math. This will result in lower performance if the game manages to make full use of the compute capabilities of the GPU. Usually on current Intel graphics, rasterization will be bottlenecking before this happens.

Thanks to this change and Intel’s native ASTC texture decoding support, Intel Graphics now has the best rendering quality in this particular game. 
We’re waiting for a driver fix to come relatively soon, so as always, keep your drivers updated!

{{< imgs
	"./acfp16.png| Astral Chain on integrated GPUs, reaching 30 FPS (docked mode)"
  >}}

Finally, regarding Nvidia. 
If the shader cache is stored in Nvidia’s own provided directory, a 200MB total folder size limit is imposed. 
BSoD found out that such a limit is easy to surpass if other shader intensive programs are in use, like Adobe’s software suite. 
[Rodrigo](https://github.com/ReinUsesLisp) bypassed this problem [by moving the cache to yuzu’s own directory,](https://github.com/yuzu-emu/yuzu/pull/5778) instead of using the default directory the driver provides.

With this change, we recommend building your cache with assembly shaders enabled, but once the cache is complete or close to completion, switch to regular GLSL (disable assembly shaders). 
That way (after a long period of shader compilation at boot), stuttering will be completely avoided.
Thanks to [Exzap](https://github.com/Exzap) from [Cemu](https://cemu.info/) for the help!

Our resident shark, [ogniK,](https://github.com/ogniK5377) [implemented the missing services to have `Stereo Vision`,](https://github.com/yuzu-emu/yuzu/pull/5810) the Nintendo Switch’s implementation of Virtual Reality using a `Nintendo Labo` “headset”. 
Games like `The Legend of Zelda: Breath of the Wild`, `Super Mario Odyssey`, `Super Smash Bros. Ultimate` and `Captain Toad: Treasure Tracker` can now render for both eyes.

While this doesn’t offer full VR support for PC compatible headsets yet, it allows users to make their own cardboard headsets à la Google, so long as they are handicraft-inclined.
Pro tip, stream to a phone or tablet.

{{< imgs
	"./vr.png| You will need a lot of cardboard if you want to use this on big displays (The Legend of Zelda: Breath of the Wild)"
  >}}

By [fixing the constant buffer’s size calculation](https://github.com/yuzu-emu/yuzu/pull/5786), `Undertale` can now be run in OpenGL with Assembly Shaders disabled, allowing the game to run on Intel and AMD GPUs. 
[Rodrigo](https://github.com/ReinUsesLisp) will no longer have a [bad time.](https://www.youtube.com/watch?v=wDgQdr8ZkTw)

The Buffer Cache Rewrite helped expose new issues in games, one example is geometry explosions in `Zombie Panic in Wonderland DX`. 
[Rodrigo](https://github.com/ReinUsesLisp) fixed this by [flushing the destination buffer on CopyBlock.](https://github.com/yuzu-emu/yuzu/pull/5785)

{{< single-title-imgs
    "More work is needed to make this game look right (Zombie Panic in Wonderland DX)"
    "./zpiwbug.png"
    "./zpiwfix.png"
  >}}

One of the important additions of the Texture Cache Rewrite is the support for `Format Views`, a feature games request and use natively.
Unfortunately, AMD and Intel Windows drivers have a broken implementation, and format views had to be disabled to fix rendering problems.

{{< single-title-imgs
    "Mushroom Dark World? (Super Mario Odyssey)"
    "./smobug.png"
    "./smofix.png"
  >}}

We reported this problem a long time ago to both vendors, but it seems like OpenGL is not a priority on Windows. The Linux mesa team, on the other hand, [has *fantastic* response times](https://gitlab.freedesktop.org/mesa/mesa/-/issues/4034) to bug reports of any API.

For the Linux side, recent changes made the Vulkan Intel driver `anv` incompatible.
By [removing a not critical requirement](https://github.com/yuzu-emu/yuzu/pull/5341) (for now), and [fixing initialization,](https://github.com/yuzu-emu/yuzu/pull/5349) [Rodrigo](https://github.com/ReinUsesLisp) restored functionality.

Due to its constant use of ASTC textures of considerable size (way bigger than the display resolution of the Nintendo Switch), `Astral Chain` is a prime example for testing the stability of yuzu’s software ASTC decoder.
Game crashes were common due to reading or writing out of bounds, [Rodrigo](https://github.com/ReinUsesLisp) fixes this by [improving the robustness of the decoder.](https://github.com/yuzu-emu/yuzu/pull/5348)

## [The Youkai, the rabbit, and friends](https://www.youtube.com/watch?v=195XntreoMc)

[MerryMage](https://github.com/MerryMage) has recently made some changes to [Dynarmic](https://github.com/MerryMage/dynarmic) that improved the performance of some games.

We start off with [a PR that introduces a setting to remove some NaN checks from JITed code.](https://github.com/yuzu-emu/yuzu/pull/5278)
This inherently results in a decrease of accuracy on the representation of these and other special values, which is why this setting is `unsafe`.
However, this also boosts the performance of games that make heavy use of NaN values, such as `Luigi's Mansion 3` (especially in the `basement 2` and `floor 12` areas, where previously performance would decrease greatly).
This setting can be found in `Emulation > Configure > CPU > Unsafe` as a toggle option, `Inaccurate NaN handling`.

{{< imgs
	"./LM3_1.mp4| Luigi's Mansion 3, the new and the old. The general performance of the game improved drastically thanks to this PR."
  >}}

On any digital system, all numbers are represented in a binary base in order to be stored and perform operations with them.
Naturally, there is a limit to the amount of numbers and the precision with which they can be represented, not to mention that a number can be expressed in many ways by just declaring it as a different type (e.g. integer, [floating-point](https://en.wikipedia.org/wiki/Floating-point_arithmetic) number, etc.).
Likewise, there are also many mathematical elements that aren't numbers per se, but special cases that result from mathematical operations.
Think, for example, about the square root of a negative number: although the result of this operation is a valid [complex number](https://en.wikipedia.org/wiki/Complex_number), it's not a defined type (i.e. a number that the computer understands), therefore, it becomes *something else*.
There are many other operations which yield similar results: division by zero, multiplying by infinity, or even more exotic things like dividing zero by zero, zero by infinity, or multiplying zero by infinity.

These types of indeterminations are defined as a special floating-point value called [`NaN`](https://en.wikipedia.org/wiki/NaN) - which stands for "Not a Number".
The architecture of the CPU of the Nintendo Switch (`ARM`) handles these NaN values differently from the architecture used by any computer CPU (`AMD64`).
For example, while a NaN is always produced as a positive value in `ARM`, it is always produced as a negative value in `AMD64`.
These NaN values might also be `quiet` or `signaling` - a characteristic that determines whether the CPU detects a NaN value at the end of an operation, or in an intermediate step (which can be halted or not, depending on the program).
Dynarmic is in charge of translating the code of a game from instructions understood by the `ARM` architecture into instructions understood by the `AMD64` architecture.
This includes ensuring these NaN values are represented properly.
By toggling this optimization, however, many of these checks are now skipped by dynarmic in favor of performance.
The reason is quite simple: most software, including games, ignore the sign and payload of these values, so it's safe to ignore them.

MerryMage also submitted [a PR to prevent flushing the cache when an ISB instruction is executed](https://github.com/yuzu-emu/yuzu/pull/5831), fixing a wide range of games that ran at 1-2fps, such as `Cobra Kai`, `Megadimension Neptunia VII`, `Super Robot Wars series`, `Windbound`, and many others.

{{< imgs
	"./mn7.png| Megadimension Neptunia VII"
  >}}

In order to process instructions faster, modern CPUs read program code from memory and store it in a cache, because access times are much faster that way.
But processing these instructions isn't an instantaneous task.
First, an instruction is fetched from the cache, decoded, executed, and the result is written back to a register or memory.
To make this process more efficient, the CPU has a dedicated circuit for every one of these steps, and they execute these tasks for different instructions at the same time.
This parallelization process is known as [Instruction Pipelining](https://en.wikipedia.org/wiki/Instruction_pipelining).

The `ARM` architecture has a variety of special instructions (called `Memory Barrier Instructions`) that give the CPU better control over how instructions are written in and from program memory.
One of these is `ISB`, which stands for "Instruction Synchronization Barrier", and it's used to flush the CPU pipeline and cache, so that all instructions following the `ISB` instruction are refeteched from memory.
Normally, this is useful when running self-modifying programs, since there is new code being written into executable memory (where the program is stored), and flushing the queued instructions ensures that no old code is run.
So, naturally, when Dynarmic executed an ISB instruction, the whole cache was being flushed on the assumption that it was outdated.
This resulted in yuzu constantly flushing out and recompiling the cache, which translated as severe slowdowns and performance drops for certain games.

Now, here's the catch.
The Nintendo Switch is a platform that, with some exceptions, doesn't allow for executable code to be rewritten.
So, there will never be a case where yuzu will need to flush the cache this way, because games can't overwrite code in memory.
This PR changed the behaviour of dynarmic, so that whenever there's an `ISB` instruction, it executes a `NOP` (no operation) instead - a special instruction that does nothing.
This way, performance is not affected anymore, as yuzu doesn’t need to rebuild the cache since it safely ignores these `ISB` instructions.

On a different note, [bunnei](https://github.com/bunnei) has been continuing with his work on the kernel.
The first change introduced last month was [a PR to rewrite threads to be more accurate](https://github.com/yuzu-emu/yuzu/pull/5779).
While there are not many visible benefits for the user due to the low-level nature of the change, it helped to fix a lot of smaller inaccuracies, including the softlocks in `Animal Crossing: New Horizons` when transitioning between scenes.

{{< imgs
	"./acnh.png| We don't judge you, Isabelle (Animal Crossing: New Horizons)"
  >}}

Originally, yuzu started as a fork of [Citra](https://github.com/citra-emu/citra), the 3DS emulator.
Naturally, there is a remnant of code that was used on Citra and later modified to work for the Nintendo Switch.
While it was fully functional and did the job, it was far from being accurate.
`KThread` is yuzu's implementation of [computing threads](https://en.wikipedia.org/wiki/Thread_(computing)), and this change aims to make it match as closely as possible to the implementation of threads of the real Nintendo Switch kernel.

The second change introduced last month is [Refactoring of KEvent/KReadableEvent/KWritableEvent](https://github.com/yuzu-emu/yuzu/pull/5862).
A `Kernel Event` is a kernel primitive that is used to "signal events", generally across processes.
This is one of the simplest mechanisms used to communicate different threads: one thread signals an event, and then another thread waits for it.
The `KReadableEvent` and `KWritableEvent` attributes are just an abstraction used to further enhance the synchronization across processes.
These three objects are thus used to represent a single "signallable event".

These mechanisms would be used, for example, when a game needs to play a sound.
The audio service will produce a `KEvent` that will "signal" when it's ready for more audio data from a game, and this will communicate with the audio thread so that data can be submitted and requested as needed by using these `KReadableEvent` and `KWritableEvent` attributes.

As always, the major benefit of these rewrites is accuracy.
These changes will also make it easier in the long term to add the code of future updates that Nintendo might do to their kernel, since the behaviour of this implementation will be closer to the hardware and the existing code won’t need many changes to accommodate for it.

There’s still room for more additions and improvements, so stay tuned for more work on this area.

After a period of inactivity, [FernandoS27](https://github.com/FernandoS27) is back with a PR to [optimize clock calculations](https://github.com/yuzu-emu/yuzu/pull/5275) by introducing a new method to compute time values, such as nanoseconds, microseconds, milliseconds, and also guest clock and cpu cycles, from the native clock of the CPU.
This is a relatively small change, but since these calculations are performed often, all optimizations are helpful to reduce the time spent on these transformations.

## Input changes

What can be better than QoL changes that you didn’t know you wanted until you saw them?
[german77](https://github.com/german77) gives us just that by [animating the controller input settings image](https://github.com/yuzu-emu/yuzu/pull/5339) on player actions.
You can see the results yourself:

{{< single-title-imgs
    "I like to move it, move it!"
    "./pro.mp4"
    "./joy.mp4"
  >}}

The animation will highlight the buttons that are currently being pressed.
There’s also a second animation for the analog sticks to make the calibration of deadzones and range more intuitive.
Your controller will behave in-game as shown by the animation in the settings, so if you think there’s any problem with your input, it’s a good idea to check if it’s working as intended here.

Input lag, the worst enemy of competitive games… And [german77](https://github.com/german77) comes to the rescue, by [preventing overscheduling events.](https://github.com/yuzu-emu/yuzu/pull/5861)

`Pokémon Let’s Go Eevee/Pikachu` may disconnect the emulated controller, or fail to recognise the connection.
By [applying a delay to this process](https://github.com/yuzu-emu/yuzu/pull/5805), [german77](https://github.com/german77) improves the stability of input emulation for this series of games.
Handheld or single Joy-Con input modes are still needed to play this game, be sure to check your input settings in `Emulation > Configure… > Controls. Swap the default Pro Controller to, for example, Handheld`.

Users discovered that some games may continue to send vibration signals, this is due to the game never sending a 0 amplitude signal. 
[Morph](https://github.com/Morph1984) fixes those erroneous vibrations by [adding a 1 second maximum time for any vibration.](https://github.com/yuzu-emu/yuzu/pull/5800)

In a double combo, [Morph](https://github.com/Morph1984) and [german77](https://github.com/german77) hit us with fixes regarding Handheld mode.
[A wrong behaviour regarding player 1 was addressed](https://github.com/yuzu-emu/yuzu/pull/5743), which used to result in input changes not saving, especially in handheld mode.
[A check was added to ensure handheld mode is connected](https://github.com/yuzu-emu/yuzu/pull/5757) only in the correct `npad_index` value.

Holding a button would sometimes stutter, resulting in unstable behaviour. [Morph](https://github.com/Morph1984) [adds a new method to check the duration of the press or hold of the buttons](https://github.com/yuzu-emu/yuzu/pull/5366), resulting in stable behaviour.

## Future projects

The merge of the Buffer Cache Rewrite will open the way to some improvements and fixes on the roadmap, epicboy will have some interesting things to show thanks to this. Morph is up to something. german77 is up to something. ogniK is up to something. bunnei continues to suffer with the Kernel rewrites. Rodrigo is making the first tests on Project Hades, while also planning a couple of nice Vulkan and video memory management improvements.

That’s all folks! Thank you so much for staying with us. See you in the February report!

And remember kids, winners update their GPU drivers to the latest version!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
