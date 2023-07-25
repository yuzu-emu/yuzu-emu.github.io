+++
date = "2021-07-10T03:40:00+05:30"
title = "New Feature Release - Shader Decompiler Rewrite"
author = "CaptV0rt3x"
forum = 423256
+++

Greetings, yuz-ers!
The long awaited day is finally here.
We are very excited to present to you, **Project Hades**, our shader decompiler rewrite!
This massive update includes huge performance improvements, countless bug fixes, and more.
Let's get started!

<!--more-->
&nbsp;

Project Hades is now available in the latest [yuzu Early Access build](https://yuzu-emu.org/help/early-access/).
As always, we ask that you test various games with these builds and if you encounter any issues, bugs, or crashes, please reach out to us via the [Discord](https://discord.gg/u77vRWY) Patreon channels.
<article class="message is-warning"><div class="message-header"><p>Notice</p></div><div class="message-body"><p style="color:white">The entire shader generation process has been redesigned from the ground up, thus existing shader caches have been invalidated. Users will need to build their shader caches again, from scratch, with Project Hades.</p></div></article>

# What is Project Hades ?

> **Project Hades** is the codename for our shader decompiler code rewrite, although at this point it's become much more than that.

For those who don't know what a shader decompiler is, you'll need to understand the process of how games render (show/display) anything.
[Shaders](https://en.wikipedia.org/wiki/Shader) are special programs that are coded to perform various tasks on GPUs, typically relating to rendering graphics on display.
Shaders are usually written in high-level shader languages compatible with the graphics API in use - e.g. [OpenGL Shading Language (GLSL)](https://en.wikipedia.org/wiki/OpenGL_Shading_Language), [Standard Portable Intermediate Representation - V (SPIR-V)](https://en.wikipedia.org/wiki/Standard_Portable_Intermediate_Representation), and [OpenGL ARB Assembly language (GLASM)](https://en.wikipedia.org/wiki/ARB_assembly_language).
Games often use hundreds or thousands of these shaders to tell the GPU what to render and how to do it.

{{< imgs
    "./yuzu_gpu.png| yuzu Shader Generation"
>}}

In the case of Switch games, they also use shaders to render graphics on the Switch itself.
However, since these shaders are precompiled for the Switch's GPU, yuzu cannot use them directly to render graphics using the host GPU (User's GPU).
Therefore, yuzu first decompiles these shaders into something called [IR, or Intermediate Representation](https://en.wikipedia.org/wiki/Intermediate_representation), which is then used to generate the high-level **GLSL/SPIR-V/GLASM** shaders used by the graphics APIs and drivers to render games on the host GPU.

Shader decompilation is the process of translating the guest (in this case, the Nintendo Switch) GPU machine code to a representation that can be compiled on the host (User's PC) GPU.
Shader compilation is the process of taking that representation and sending it to the host GPU driver to get compiled and then executed on the user's GPU.

## Goals

The main goal of Project Hades was to redesign the decompiler and shader generation code with a focus on simplicity and accuracy.
It aimed to make both decompilation and compilation faster overall, thus improving the performance.
Rewriting the decompiler would allow us to audit it through [unit testing](https://en.wikipedia.org/wiki/Unit_testing), following a design similar to [dynarmic](https://github.com/MerryMage/dynarmic), allowing proper program analysis and optimizations over fast-to-emit intermediate representation.

&nbsp;

{{< imgs
    "./Dark Souls.png| Dark Souls"
    "./Dragon Quest XI.jpg| Dragon Quest XI"
>}}

Taking a leaf from dynarmic's book, the developers opted to use an [SSA representation](https://en.wikipedia.org/wiki/Static_single_assignment_form), as it would work very nicely with the `SPIR-V` IR used for shaders, thanks to its native support for SSA.
As for the unit testing, [Rodrigo](https://github.com/ReinUsesLisp) wrote [homebrew tests for the hardware](https://github.com/ReinUsesLisp/nxgpucatch) which helped the developers accurately emulate hardware behaviour.

But this was just the beginning.
Over the course of a few months, the developers would go on to face and overcome many hurdles with the code rewrite and the Project's goals would expand to accommodate much more.

# Overview of changes

Project Hades was a collaborative effort from developers [Rodrigo](https://github.com/ReinUsesLisp), [Blinkhawk](https://github.com/FernandoS27), and [epicboy](https://github.com/ameerj).
They distributed the required work among themselves and spent countless hours in coding, unit testing, game testing, and performance validation.

[Blinkhawk](https://github.com/FernandoS27) mainly worked on implementing miscellaneous instructions, including texture sampling instructions required for decompilation.
He added support for Nvidia's `VertexA shader stage`, a non-standard shader stage available on Nvidia hardware that is executed before the regular `VertexB shader stage`.

This allowed games such as `Catherine: Full Body`, `Bravely Default 2`, and `A Hat in Time` to render graphics for the first time.
[Blinkhawk](https://github.com/FernandoS27) also fixed an issue in yuzu's texture cache relating to the texture streaming used in Unreal Engine 4 (UE4) games, resolving many of their rendering issues.

**Note:** Due to a race condition in our GPU Emulation, to render Catherine Full Body correctly, you may need to disable Asynchronous GPU Emulation.

&nbsp;

{{< single-title-imgs
    "Catherine: Full Body"
    "./Catherine.png"
    "./Catherine_2.png"
>}}

{{< imgs
    "./Hat in Time.png| A Hat in Time"
>}}

{{< single-title-imgs
    "Bravely Default II"
    "./Bravely_Default_2.png"
    "./Bravely_Default_2_2.png"
>}}

[epicboy](https://github.com/ameerj) implemented almost all of the arithmetic, logical, and floating-point instructions, as well as developing the entire GLSL backend.
**GLSL** is the default backend, when the OpenGL API is selected in the yuzu configuration settings.

The **GLSL** backend rewrite was not part of the initial plan for Project Hades, as the developers only intended to work on **GLASM** and **SPIR-V**, but it was later included due to how buggy and slow some OpenGL **SPIR-V** compilers are.
That said, some OpenGL drivers benefit greatly from the use of **SPIR-V** shaders, so the choice of using **SPIR-V** on OpenGL is left as an experimental setting.

&nbsp;

{{< imgs
    "./Mario and rabbids.png| Mario and Rabbids"
    "./monchrome_hades.png| Monochrome"
>}}

[Rodrigo](https://github.com/ReinUsesLisp) designed the overall structure to support these changes, and developed multiple optimization passes to improve performance wherever possible.
In addition to that, he rewrote the entire **GLASM** (GL Assembly) backend, and integrated the existing frontend rasterizers with the new backends.

The **GLASM** backend is a special path where the decompiled shaders ([assembly language](https://en.wikipedia.org/wiki/Assembly_language)) skip the shader compilation steps on the host GPU, thus improving the performance.
Unfortunately, **GLASM** is only supported by Nvidia GPUs, limiting the scope of this performance boost.

&nbsp;

{{< imgs
    "Crash Bandicoot 4.png| Crash Bandicoot 4"
    "world-of-ff-hades.jpg| World of Final Fantasy"
>}}

While these were the major changes, there were also many other minor improvements.
Changing how the shaders are generated also meant changing the way shader information is presented to the renderers.
This was overhauled for simplicity, which led to some new features, and ease of caching.

## Vulkan Pipeline Caching

All the information required to generate pipelines from scratch now gets cached to disk, thereby removing shader stutter almost completely on Vulkan.
In contrast, OpenGL can still encounter  shader stutters due to unpredictable or undocumented state changes.
Vulkan still can have minor stutters when new shaders are detected, but it hasn't been noticeable during our testing.

## Asynchronous Pipeline Creation

yuzu already supported `Asynchronous Shaders`, where draw calls are skipped (rendering is paused) until the shader, or in Vulkan's case, the pipeline, is compiled.
This is nice in some cases because it allows for more consistent play sessions, minimizing stutter from shader compilations.
But this also has a big drawback: it introduces graphical glitches, which are sometimes persistent throughout the play session.
While this is not an issue after restarting emulation and having the shaders cached, it's not optimal.

A better way to implement this for Vulkan was to build pipelines in parallel without skipping draw calls.
In other words, continue processing GPU commands while the pipelines are being built.
This allows building one pipeline per CPU thread (minus one) in parallel while the game is executing.
This results in reduced stutter that is, in a way, similar to skipping draw calls.

<article class="message"><div class="message-header">How does this work?</div><div class="message-body">
To understand why this is possible, it's necessary to explain how yuzu's Vulkan command recording works. Commands are recorded and deferred to a separate thread for processing (sometimes called the "Command Submission (CS) thread").<br>
<br>
This thread runs in parallel to the main GPU thread. This means the CS thread can build the pipelines sequentially while the main GPU thread continues its execution, periodically pushing new commands to the CS thread.<br>
<br>
Sadly, this is not possible at the moment on OpenGL, because drivers wait more often for their CS thread than yuzu on its own CS thread.
It may be possible if we optimize the whole OpenGL backend to avoid "glGen*" and "glGetSynciv" calls within a draw call.
</div></article>

## Even more!!

On top of these big improvements, we also have many minor optimizations. Some notable ones are listed below:

- Project Hades keeps track of the number of bytes used in constant buffers and passes this information to the buffer cache. This reduces the number of uploaded bytes on some titles, thus improving performance.
- Vulkan command submission to the GPU now happens on the separate CS thread, increasing performance by 1 to 2 FPS in `Super Mario Odyssey`, although presentation to screen is still being synchronized.
- Synchronization for [texture buffers](https://www.khronos.org/opengl/wiki/Buffer_Texture) between the texture cache and the buffer cache, fixing some crashes on Koei Tecmo games.
- Generate specialized Vulkan descriptor pools, sharing pools within similar pipelines. This reduces memory consumption and boot time on most drivers, saving ~700 MiB of VRAM on AMD compared to the previous approach.
- Usage of [VK_KHR_push_descriptor](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VK_KHR_push_descriptor.html) when available. Reduces the overhead of updating descriptor sets on Nvidia by 57% and by 10% on Intel (measured on `Super Smash Bros. Ultimate` 1v1 on Final Destination). It also reduces memory consumption but this hasn't been measured.
- Usage of [VK_EXT_conservative_rasterization](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VK_EXT_conservative_rasterization.html) and [VK_EXT_provoking_vertex](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VK_EXT_provoking_vertex.html) when available.
- Use specialized "pre-draw" functions per pipeline to reduce unnecessary work.
- `Texture Reaper`, which cleans the least used resources in your VRAM to reduce VRAM usage. We will cover this and others, in detail, in our next progress report.

# Graphical fixes

Thanks to the redesign and reimplementation of our entire shader generation code, the developers were able to investigate and identify the causes for graphical glitches in many games.
In fact, some games like `Yoshi's Crafted World`, `Trials of Mana`, `Minecraft Dungeons`, and many others, now render almost perfectly.
`The Legend of Zelda: Breath of the Wild` is now fully playable on Vulkan.

{{< imgs
    "./BOTW_Vulkan.png| Breath of the Wild (fixed runes in Vulkan)"
>}}

{{< single-title-imgs
    "The Legend of Zelda: Breath of the Wild (EA Vs. HADES)"
    "./botw-ea.png"
    "./botw-hades.png"
>}}

{{< imgs
    "./Yoshi's Crafted World.png| Yoshi's Crafted World"
    "./bd2.png| Bravely Default II"
>}}

{{< single-title-imgs
    "Minecraft Dungeons"
    "./minecraft_dungeons.png"
    "./Minecraft_Dungeons_2.png"
>}}

The broken bloom, causing sand and fog in `Super Mario Odyssey` to render incorrectly, is now fixed!

{{< single-title-imgs
    "Super Mario Odyssey (EA Vs. HADES)"
    "./smo_sand_ea.png"
    "./smo_sand_hades.png"
    "./smo_fog_ea.png"
    "./smo_fog_hades.png"
>}}

Thanks to the implementation of tessellation shaders, the sand in `Luigi's Mansion 3` is no longer broken!
{{< imgs
    "./Luigis Mansion 3.png"
>}}

Various graphical glitches, crashes and general stability issues in `Fire Emblem: Three houses`, `Hyrule Warriors: Age of Calamity`, `Marvel Ultimate Alliance 3`, `Persona 5 Strikers`, and `Xenoblade Chronicles` were also fixed.

{{< single-title-imgs
    "Fire Emblem: Three Houses"
    "./Fire emblem Three houses.jpg"
    "./feth1.png"
    "./feth2.png"
>}}

{{< single-title-imgs
    "Hyrule Warriors: Age of Calamity"
    "./AOC_2.png"
    "./AOC_3.png"
    "./AOC_4.png"
>}}

{{< imgs
    "./Marvel Ultimate Alliance 3.png| Marvel Ultimate Alliance 3"
    "./Hyrule_Warriors_DE.png| Hyrule Warriors Definitive Edition"
>}}

{{< single-title-imgs
    "Persona 5 Strikers"
    "./P5S.png"
    "./P5S_2.png"
    "./P5S_3.png"
>}}

{{< single-title-imgs
    "Xenoblade Chronicles (EA Vs. HADES)"
    "./xc-ea.jpg"
    "./xc-hades.jpg"
>}}

`Hollow Knight's` issue with transparent textures has been fixed.
{{< single-title-imgs
    "Hollow Knight (EA Vs. HADES)"
    "./hollow_knight_ea.png"
    "./hollow_knight_hades.png"
>}}

`Kirby Star Allies`, `Mario Kart 8 deluxe`, `Tony Hawk Pro Skater`, `Story of Seasons`, and `Clubhouse` games, were among many other titles that saw graphical glitches fixed.
`Rune Factory 4` renders perfectly now and `Rune Factory 5` has improved rendering.

{{< single-title-imgs
    "Kirby Star Allies (EA Vs. HADES)"
    "./kirby-ea.jpg"
    "./kirby-hades.jpg"
>}}

{{< single-title-imgs
    "Mario Kart 8 Deluxe (EA Vs. HADES)"
    "./MK8_EA.png"
    "./MK8_Hades.png"
>}}

{{< single-title-imgs
    "Tony Hawk Pro Skater (EA Vs. HADES)"
    "./tonyhawk-ea.png"
    "./tonyhawk-hades.png"
>}}

{{< single-title-imgs
    "Story of Seasons (EA Vs. HADES)"
    "./story-of-seasons_ea.png"
    "./story-of-seasons_hades.png"
>}}

{{< single-title-imgs
    "Rune Factory 4 (EA Vs. HADES)"
    "./runefactory-ea.jpg"
    "./runefactory-hades.jpg"
>}}

{{< single-title-imgs
    "Rune Factory 5"
    "./Rune_Factory_5.png"
    "./Rune_Factory_5_2.png"
>}}

{{< imgs
    "./Trials of mana.png| Trials of Mana"
    "./clubhouse.png| Clubhouse"
    "./farm_sim_20.png| Farming Simulator 20"
>}}

### And many more!!

{{< single-title-imgs
    "Densha de Go"
    "./Densha_de_Go.png"
    "./Densha_de_Go_2.png"
>}}

{{< single-title-imgs
    "Final Fantasy XII"
    "./FF_XII.png"
    "./FF_XII_2.png"
>}}

{{< single-title-imgs
    "Hellblade: Senua's Sacrifice"
    "./hellblade.png"
    "./hellblade_2.png"
>}}

{{< single-title-imgs
    "Spyro Reignited Trilogy"
    "./Spyro_Reignited.png"
    "./Spyro_Reignited_2.png"
>}}

# Alright! Let's talk numbers now!

Project Hades rewrote a vast majority of the GPU code and made tons of improvements and optimizations to boost the performance.
Since the changes touched on many areas of the GPU emulation, we observed performance improvements in many titles.

Below are some performance comparison charts between yuzu Early Access (1860) and Project Hades on our recommended specifications using Vulkan API.
Please note that at the time of comparison, EA 1860 was almost equivalent to yuzu Mainline, with no changes that would significantly affect performance.

{{< imgs
    "./perf-1.png| Recommended Specs (* is OpenGL)"
>}}

That's not all.
The improvements made to the Vulkan backend in Project Hades have greatly improved performance for AMD GPU users on Linux (RADV).

{{< imgs
    "./perf-2.png| Linux AMD (RADV)"
>}}

These are just a small testament to the performance improvements that Hades brings.
We will be sharing more performance charts with our next progress report.

# Fin

Our development efforts were massively accelerated by our testers, who tested dozens of titles for bugs, fixes, and performance regressions.
Since our testing couldn't realistically cover all titles, we request that you test and play your favourite games in yuzu and experience the improvements yourselves.
While testing, if you come across any regressions, glitches, bugs, or crashes, please reach out to us via our Discord Patreon Channels.
This will assist us in identifying and fixing any potential issues Project Hades might present.

### That's all we have for now, until next time! Happy emulating!

&nbsp;
{{< article-end >}}
