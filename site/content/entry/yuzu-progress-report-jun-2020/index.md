+++
date = "2020-07-01T12:00:00-03:00"
title = "Progress Report June 2020"
author = "Morph & GoldenX86"
forum = 264710
+++ 

Hello fellow yuz-ers! We hope you are doing well. Once again, we're here to tell you about some of the exciting changes that were implemented last month in both yuzu Mainline and Early Access.

<!--more-->

In this episode, we have lots of fixes and optimizations, a feature many have been requesting, and as always, some hints of what the future will bring.

## Bug fixes and improvements

How should we start? Oh, I know! With [Morph](https://github.com/Morph1984) fixing another Kirby issue of course! By [reserving 4 image bindings](https://github.com/yuzu-emu/yuzu/pull/4092) in the fragment stage, instead of just one as before, he was able to fix several shader compilation errors that affected both `GLSL` and `GLASM` in `Kirby Star Allies`. Check out the results below, [Poyo!](https://www.youtube.com/watch?v=ObHK_K853k4)

{{< single-title-imgs
    "Here you can see the bug affecting an attack (Kirby Star Allies)"
    "./kirby_before.png"
    "./kirby_after.png"
  >}}
  
{{< single-title-imgs
    "And here affecting terrain (Kirby Star Allies)"
    "./kirby_before2.png"
    "./kirby_after2.png"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) fixed a bug that previously manifested as random black flickering by [marking vertex buffers as dirty after a cache invalidation](https://github.com/yuzu-emu/yuzu/pull/4064). This issue primarily affected `Animal Crossing: New Horizons`, but the bugfix should affect a lot of other games as well. Feel free to share any other games you discover that benefit from this!

{{< imgs
    "./acnh.mp4| Now that doesn't look nice, does it? (Animal Crossing: New Horizons)"
  >}}
  
A very elusive bug in `Super Mario Odyssey`, dubbed the "triangle glitch," had been tormenting us for ages. [Rodrigo](https://github.com/ReinUsesLisp) managed to solve the issue, but only in OpenGL with Nvidia GPUs due to the exclusive `NV_vertex_buffer_unified_memory` extension. However, due to both a yuzu and driver bug, we're unable to use this extension on Turing based GPUs (RTX 2000 and GTX 1600 series) for the moment.

{{< single-title-imgs
    "Dark and glitchy (Super Mario Odyssey)"
    "./smo-bug.png"
    "./smo-fix.png"
  >}}

We are working on a [universal implementation in Vulkan](https://github.com/yuzu-emu/yuzu/pull/4150) that requires the `VK_EXT_extended_dynamic_state` extension, but it is not yet available in all the GPU vendors' drivers. At the time of writing, only the Intel Mesa `ANV` Linux driver and the latest Nvidia Vulkan Beta driver support it.

A rare bug was affecting `Xenoblade Chronicles 2`, causing fantastic vertex explosions on time-of-day transitions. [Rodrigo](https://github.com/ReinUsesLisp) managed to solve the issue by [improving the shader cache](https://github.com/yuzu-emu/yuzu/pull/4194).

{{< single-title-imgs
    "Exactly the same spot (Xenoblade Chronicles 2)"
    "./xc2-bug.png"
    "./xc2-fix.png"
  >}}
  
By [implementing RendererInfo](https://github.com/yuzu-emu/yuzu/pull/4080) into yuzu’s audio emulation, [ogniK](https://github.com/ogniK5377) solved the softlocks affecting the credit sequence in `Animal Crossing: New Horizons` and the softlocks in several areas of `The Legend of Zelda: Link's Awakening`. Now you can enjoy both games without the fear of getting stuck, and even listen to some newly working sound effects!

{{< single-title-imgs
    "Nothing to report! (Animal Crossing: New Horizons & The Legend of Zelda: Link's Awakening)"
    "./acnh-credits.png"
    "./zla-mermaid.png"
  >}}

Also thanks to [ogniK](https://github.com/ogniK5377), `Animal Crossing: New Horizons` no longer needs the crash-fix patch we were distributing in our compatibility article for the game. This was done by [improving the emulation of the Tegra X1 GPU drivers](https://github.com/yuzu-emu/yuzu/pull/4070). As a bonus, this also fixed T-posing on the later updates in `Super Smash Bros. Ultimate`!

Not all games are native to the Nintendo Switch, with a portion of its library consisting of ported games from other consoles or the PC. Up until now, yuzu failed to run PC game ports that were originally developed for `Direct3D` (a Windows graphics API), even though they ran perfectly fine in `NVN` (a Switch exclusive graphics API). However, [Rodrigo](https://github.com/ReinUsesLisp) found a [way to translate this behavior](https://github.com/yuzu-emu/yuzu/pull/4049) to yuzu’s OpenGL and Vulkan implementations, resulting in tons of western games going in-game. This change was also accompanied by a shader cache invalidation.

{{< imgs
    "./bioshock.png| Would you kindly? (BioShock Remastered)"
  >}}
  
By implementing a [missing texture format](https://github.com/yuzu-emu/yuzu/pull/4005), [Rodrigo](https://github.com/ReinUsesLisp) fixed dark surface glitches that appear in `Xenoblade Chronicles Definitive Edition`.

{{< single-title-imgs
    "This is the Monado's power!"
    "./xcde_before.png"
    "./xcde_after.png"
  >}}
   
{{< single-title-imgs
    "(Xenoblade Chronicles Definitive Edition)"
    "./xcde_before2.png"
    "./xcde_after2.png"
  >}}
  
Intel used to have a bug in their OpenGL driver causing many games using `Compute Shaders` to crash or render effects incorrectly. This forced us to disable them on any supported Intel GPU, which introduced adverse effects in many games. One game of note is `Super Smash Bros. Ultimate`, wherein compute shaders are used to render character model animations and without them, character models will be in a `T-pose`.

Additionally, Intel's OpenGL `Geometry Shader` implementation (unlike AMD's and Nvidia's one) lacks an OpenGL extension called `GL_ARB_shader_viewport_layer_array`. This forces us to re-evaluate yuzu's implementation of it.

By [re-enabling Compute Shaders](https://github.com/yuzu-emu/yuzu/pull/4025) and [changing the way yuzu handles Geometry Shaders](https://github.com/yuzu-emu/yuzu/pull/4031), [Morph](https://github.com/Morph1984) closed a big box of issues that previously affected only our Intel GPU users.


{{< single-title-imgs
    "Gone are the rainbows on Intel (Octopath Traveler)"
    "./octopath-before.png"
    "./octopath-fixed.png"
  >}}
  
&nbsp;
   
{{< single-title-imgs
    "No more T-posing (Super Smash Bros. Ultimate)"
    "./ssbu-tpose.png"
    "./ssbu-fixed.png"
  >}}

[Volca](https://github.com/VolcaEM) [stubbed an input instruction](https://github.com/yuzu-emu/yuzu/pull/4032) allowing `Minecraft: Nintendo Switch Edition` to go in-game.

{{< imgs
    "./minecraft.png| Don't dig too deep! (Minecraft: Nintendo Switch Edition)"
  >}}
  
Not all games have to be in 3D. [Morph](https://github.com/Morph1984) [replaced the default texture filtering behaviour](https://github.com/yuzu-emu/yuzu/pull/4081) to achieve crisp graphics in 2D games like `Undertale`.

{{< single-title-imgs
    "Crisp, just the way I like it"
    "./undertale-before.png"
    "./undertale-after.png"
  >}}
  
Now on to our final bug fix of last month. Old AMD GPUs from 2012 lack the OpenGL `GL_EXT_texture_shadow_lod` extension, leading to shaders that failed to build in `The Legend of Zelda: Breath of the Wild`. As described [here](https://github.com/KhronosGroup/SPIRV-Cross/issues/207), by using the [textureGrad function](https://github.com/yuzu-emu/yuzu/pull/4129), [Morph](https://github.com/Morph1984) achieved similar results, improving compatibility with such old devices.

## Vulkan improvements

`OCTOPATH TRAVELER` got some Vulkan love thanks to [Rodrigo](https://github.com/ReinUsesLisp). By implementing a [missing image format](https://github.com/yuzu-emu/yuzu/pull/4033) and [storage texels and atomic image operations](https://github.com/yuzu-emu/yuzu/pull/4034), the game can now reach in-game status in Vulkan, and with some very beautiful visuals!

{{< imgs
    "./octopath.png| This is how nostalgia makes us remember the SNES era (OCTOPATH TRAVELER)"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) also worked on [multiple](https://github.com/yuzu-emu/yuzu/pull/4110) [performance](https://github.com/yuzu-emu/yuzu/pull/4111) optimizations for the Vulkan API. This results in lower frametimes and higher framerates on average.

## User Interface changes

An old misconception our users had with yuzu had to do with the `Internal Resolution` option in the graphics settings. This was carried over from [Citra's](https://citra-emu.org/) UI, but it wasn't coded to do anything in yuzu. So, lots of users set it up at higher values expecting an image quality increase that could never happen. [Morph](https://github.com/Morph1984) decided it was time to [remove it for good](https://github.com/yuzu-emu/yuzu/pull/3966), and so he did.

{{< imgs
    "./res-scaler-removed.png| Until we meet again, Internal Resolution!"
  >}}

Thanks to users requesting it, [Volca](https://github.com/VolcaEM) added [Open Mods](https://github.com/yuzu-emu/yuzu/pull/4136), [FAQ, and Quickstart](https://github.com/yuzu-emu/yuzu/pull/4166) shortcuts to yuzu's interface. This is a great way for users to find helpful information on how to use the emulator — you just need to click on `Help`!

{{< imgs
    "./volca-ui.png| Just an easier way. Thanks Volca!"
  >}}
  
Continuing with UI changes, [Kewlan](https://github.com/Kewlan) added a [mute audio hotkey](https://github.com/yuzu-emu/yuzu/pull/4164). They also fixed a bug with the [fullscreen hotkey](https://github.com/yuzu-emu/yuzu/pull/4182), where the default hotkey would still function even when changed.

## Dreams and reality

`Project Maribel Hearn` has been released, and is available in Mainline too! Native 32-bit Switch games are now starting to work, with some of them even being fully playable! This means that games like `New Super Mario Bros. U Deluxe` and `Captain Toad: Treasure Tracker` work almost perfectly and with great performance, while games like `Mario Kart 8 Deluxe` still need more work. 

This has been a highly requested feature for a very long time, but implementing it required a major rewrite of the kernel, and official support for ARMv7 was needed in [Dynarmic](https://github.com/MerryMage/dynarmic), our ARM JIT recompiler. This took a tremendous amount of work from several of our developers, including, but not limited to: [Merry](https://github.com/MerryMage), [Lioncache](https://github.com/lioncash), [Blinkhawk](https://github.com/FernandoS27), [bunnei](https://github.com/bunnei), [Rodrigo](https://github.com/ReinUsesLisp), [Tobi](https://github.com/FearlessTobi), [ogniK](https://github.com/ogniK5377), [Morph](https://github.com/Morph1984), and many others. Special mention goes to Merry and Lioncache: they are the soul of this project, and without them we couldn't have even started it. Several of their pull requests are "too technical" to be included in the progress reports, but it should be known that Merry and Lioncache are the main code contributors at the heart of yuzu.

You may not have noticed that four months ago, [bunnei](https://github.com/bunnei) and [Tobi](https://github.com/FearlessTobi) laid down the [initial framework](https://github.com/yuzu-emu/yuzu/pull/3478) towards 32-bit support in yuzu.

They accomplished this by refactoring the ARM interface to support 32-bit and 64-bit JIT backends, implementing a 32-bit ARM interface based on Citra's ARMv6 dynarmic backend by adding CP15 coprocessor support, and implementing several 32-bit SVCs such as `GetThreadPriority32`, `WaitSynchronization32`, and many more.

While rewriting the kernel for Prometheus, [Blinkhawk](https://github.com/FernandoS27) and [bunnei](https://github.com/bunnei) saw an excellent opportunity to include support for 32-bit ARMv7 CPU instructions and services. With this spark of motivation, they worked with [Merry](https://github.com/MerryMage) and [Lioncache](https://github.com/lioncash) to make the dream of 32-bit support a reality, by ramping up the implementation of various ARMv7 instructions such as `VPADD`, `VCVT`,  and `VSHL` in Dynarmic, and 32-bit SVCs such as `CreateTransferMemory32`, `MapSharedMemory32`, and `CreateThread32` in yuzu. There are many other ARMv7 instructions and SVCs that we cannot cover here, but the culmination of this work allowed us to get the very first 32-bit games up and running! 

{{< imgs
    "./toad.png| Good performance even on low-end hardware!"
  >}}

Additionally, the merge of this work into the Master branch also means that Multicore support is now working in Mainline! Thanks [Blinkhawk](https://github.com/FernandoS27) for all your hard work on this! Please refer to our previous [May progress report](https://yuzu-emu.org/entry/yuzu-progress-report-may-2020/) and the dedicated [Project Prometheus article](https://yuzu-emu.org/entry/yuzu-prometheus/) to read more about this crucial new feature.

## Future projects

With Multicore finally in Master, some of the ideas we have "in the oven" can start to take shape. `Project Apollo` is starting to be nice and sound. And finally, I've heard [bunnei](https://github.com/bunnei) is up to something, *again*.

That’s all for now, folks! We hope to see you in our July progress report!
Special thanks to gidoly for providing screenshots.

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
