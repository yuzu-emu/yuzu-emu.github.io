+++
date = "2018-07-21T20:00:00+05:30"
title = "Progress Report 2018 Part 2"
author = "CaptV0rt3x"
forum = 35830
+++

We bring you part 2 of the extensive coverage on yuzu's tremendous progress. So buckle up for an
exciting ride, cause its gonna blow your mind!
&nbsp;
<h5 style="text-align: center;">
***Haven't read the first part yet? Read it [here](https://yuzu-emu.org/entry/yuzu-progress-report-2018-p1-1)***
</h5>
<!--more-->

## General Improvements

Software development best practices dictate that one should reuse code whenever possible.
In line with this rule, yuzu began as a fork of the Citra code base with the core emulation code stripped out.
This allows yuzu to focus on the core switch emulation while still having a very functional user interface, but after some time, the code for the user interface will slowly start to diverge.
Several people chipped in to bringing the improvements over from Citra, most notably [Lioncash](https://github.com/lioncash), who over a period of time, has made many number of changes to bring yuzu up to date.
We also ported over some of Citra's recent features like the new fmtlib-based logging backend (thanks to [jroweboy](https://github.com/b0b_d0e) & [daniellimws](https://github.com/daniellimws) ), 'About' dialog, full-screen rendering support, and themes support.

We have also implemented features like:

* Added decrypted NCA support.
* OpenGL extensions support - checking, to ensure system requirements are met.
* 64-bit games - checking, to ensure unsupported 32-bit games aren't launched.
* Switch-specific ***Docked mode*** configuration setting.
* Improved FPS counter.
* And many more.

All of these improvements were only possible because of the efforts of many contributors.

## CPU emulation

The Nintendo Switch is powered by a custom Nvidia Tegra SoC.
For the uninitiated, a SoC (system-on-chip) integrates components like CPU, GPU, memory, input/output ports, storage, etc., on a single chip.
The Switch's SoC (Nvidia ODNX02-A2), is a Tegra X1 chip, has 4 ARM Cortex-A57 CPU cores and 4 ARM Cortex-A53 CPU cores.
The CPU is based on the ARM architecture, which has already been well documented.
We first used [Unicorn](http://www.unicorn-engine.org/) for the CPU emulation.
However Unicorn is meant to assist developers that are debugging code, and isn't capable of running games at an acceptable framerate.
Truth be told, [Lioncash](https://github.com/lioncash) even back-ported relevant changes to Unicorn to make AArch64 emulation more complete.
Our version of Unicorn (QEMU 2.12.50) is miles ahead of actual mainline Unicorn (QEMU 2.2.1).

No one, dev and user alike, wants their emulator to be slow.
So our talented developers [MerryMage](https://github.com/MerryMage) and Lioncash are working tirelessly to bring ARMv8 support to [Dynarmic](https://github.com/MerryMage/dynarmic), the dynamic recompiler that Merry wrote for Citra.
Dynarmic was designed from the beginning to be reusable for many different ARM CPUs, so when we needed a fast and stable recompiler, we already knew what we would use.
Thanks to their efforts Dynarmic now supports many ARMv8 instructions and we have shifted to using Dynarmic for CPU emulation.
They are currently working to implement complete ARMv8 support in the near future.

Dynarmic is generally fast, but it is still missing implementations of a few instructions.
When dynarmic hits a missing instruction, it has to fallback to Unicorn, and falling back to using Unicorn is even slower than just using Unicorn directly!
In order to fallback to Unicorn, we need to copy all the CPU state from Dynarmic to Unicorn, execute Unicorn, and then copy the state back to Dynarmic.
These fallbacks are really slow.
Once we implement all instructions in Dynarmic, we will no longer need these and our CPU emulation will be much faster than it is now.
The most recent update to Dynarmic has vastly improved performance in almost all games, with games going up to 60FPS in some cases.

## GPU emulation

{{< imgs
    "./hmbrewgfx.png|Testing (yuzu)"
    "./hmbrewgfx_nx.jpg|Actual (Switch)"
>}}

We got to the point where commercial games were running on yuzu around February 2018.
We could tell that they were almost ready to draw because they were submitting a command list to the emulated Nvidia GPU services.
For a brief explanation, command lists are how games configure the GPU hardware and let the game know that it is ready to start rendering.
Subv did a lot of work figuring out how the GPU register writes happen and on the communication protocols to get it working.

As mentioned earlier, the Switch uses a Nvidia Tegra Soc which houses a GPU based on Maxwell architecture.
Nvidia's hardware is proprietary and has no public documentation on how it works.
Fortunately, Maxwell based GPUs were released 3 years ago and there are millions of devices using these GPUs.
The people from Linux community and various other places tried to create open source drivers for these GPUs, despite it being proprietary hardware.
They did a lot of leg work on finding out how these GPUs work.
The [Nouveau](https://nouveau.freedesktop.org/wiki/) project creates these open source Linux drivers for Nvidia GPUs and Tegra family of SoCs.
Although Linux drivers for desktop/laptop GPUs aren't the same as the GPU driver for a console like Switch, which runs its own OS, there is a fair amount of overlap.
There were also tools like [envytools](https://github.com/envytools/envytools) and its submodule envydis (disassembler), which did a lot of research into shader decoding.
envydis doesn't have any documentation about actual workings of each shader instruction, it just has the name, decoding and parameters.
The work done by these projects helped us in bringing initial emulation of GPU.

{{< imgs
    "./sonic_glitch.png|Sonic Mania - Then"
    "./sonicmania.mp4|Sonic Mania - Now"
>}}

With the help of these projects we made good progress in GPU emulation and got games to submit drawing calls, not just configuring the hardware but actually writing to registers, indicating that they were ready to draw triangles on the screen.
Even the simplest 2D games are no longer just 2D.
As the Switch uses a modern GPU, there is no hardware for drawing 2D.
So games instead make 2 triangles in the shape of a rectangle, and then render the current screen as a texture and blits it to the 2 triangles.
This way, the game is still a flexible 2D game, but can take advantage of the fast 3D rendering capabilities that the GPU offers.

The first game to show graphics was "Puyo Puyo Tetris" around late February - early March.
The game calls this kind of generic `write` to drawing registers indicating that it was done rendering a batch of triangles.
So we knew that we were drawing and we now had to figure out how to decode these triangles and render them on screen.
At the end of the day, Switch uses a modern GPU and like most modern GPUs it relies on a programmable pipeline.
A programmable pipeline gives game developers the power to control some of the graphics pipeline with a full featured programming language, and these programs that they write are called shaders.
Game developers will write shaders in languages such as GLSL and HLSL, and the graphics driver will compile these into a GPU specific assembly language.
Shaders are really useful to give game developers the ability to change how the geometry is drawn, and even how the pixels are colored on the screen.

{{< imgs
    "./debug.png|Behind the scenes!"
>}}

Because of how much shaders influence the whole scenes, GPU emulation development is not just a matter of handling triangles its also about handling shaders.
We had to actually implement the shader programs to get more graphics output, meaning we needed to decompile each shader instruction.
In case you were wondering, Nintendo Switch games are built with precompiled shader binaries, so we can't just run the original program.
Instead we have to analyze the shader instructions and figure out novel ways to get convert it back to a high level shader code again.
Figuring out what each shader instruction means wasn't an easy task, as this was all Nvidia's proprietary code.
We worked a lot with [gdkchan](https://github.com/gdkchan), as he had made a bit of progress with this, and quickly learned how to decode GPU data based on nouveau and envytools.
envytools and envydis (disassembler) did the reverse engineering of how shaders work in Maxwell based GPUs, so we already know most of the disassemblies of the instructions, but not always what they do.

{{< imgs
    "./sonic_1.png"
    "./sonic_2.png"
		"./sonic_3.png"
		"./sonic_4.png"
		"./sonic_5.png"
>}}

For actual shader implementation in yuzu, we decided to base it on a recent addition to Citra, a shader recompiler that converts the emulated 3DS shaders into GLSL so they can be run on the host GPU.
Instead of running all these shader programs (which have to run for thousands of vertices) on the CPU, we translate these shaders into OpenGL GLSL and upload the program directly as is to GPU.
This is better as GPUs are designed to run these programs in parallel for thousands of vertices, whereas CPUs are not.
In Citra, we were running the fragment shaders on the GPU since at least 2015, but the vertex and geometry shaders were run on the CPU.
The 3DS vertex and geometry shaders have some very hard to account for corner cases, and it took many years to make sure that our reverse engineering efforts were correct.
That way we didn't have to waste effort working on something we couldn't be sure was possible.
If you would like to read more about the feature in Citra, check out the blog post about it ([here](https://citra-emu.org/entry/improvements-to-hardware-renderer/)).

However this isn't an option in case of yuzu, as Switch's GPU is modern and way too powerful for doing this in software.
Around April 2018, we were able to get enough of shader instructions implemented to get "Puyo Puyo Tetris" to show a bit of graphics.
It wasn't much, just rendered `SEGA logo` and `Tetris logo`, and pretty much hung after that.
Furthermore, we were able to get a few other simple 2D games like "Cave Story" and "The Binding of Issac" booting as well.

{{< imgs
    "./splatoon2.mp4|Splatoon 2 - Then"
    "./splatoon2_work.png|Splatoon 2 - Now"
>}}

Another new feature which we implemented was shader `constbuffer` support by Subv.
We have shader programs that we want to reuse for a bunch of different triangles for features like the UI or 3D models.
It isn't efficient to have individual shaders for every single thing, instead we can have a couple of shader programs that can be reused for everything.
So, shader `constbuffer` support is the equivalent of OpenGL `uniform` and `uniform buffer objects (UBO)`.
Uniforms in general are a way to provide constant data to shaders and can also be used to reconfigure the shader as well.

Initial rendering support and blending support were done by bunnei.
Blending is used for alpha transparency - translating Switch GPU register writes to OpenGL calls.
It fixed a bug in "Puyo Puyo Tetris", where the `Saving...` icon in the top left corner had a weird box around it.
Initial texture support was done by Subv and mainly involved reading a texture from memory, decoding it, and uploading it to OpenGL.

Coming to rasterizer cache, its computationally expensive to upload a texture from the emulated Switch memory to the host GPU every time it's used.
The texture will need to be decoded and unswizzled before its uploaded, and then the memory will need to be copied from the CPU RAM into the GPU RAM.
It's much more efficient to just keep texture in the GPU memory, similar to how it works on hardware with normal PC games, but is a little bit trickier for emulation.
This is because we don't know when the game might change the texture or modify it.
bunnei did most of the work to cache these textures, so when a texture is uploaded to OpenGL it is saved in GPU memory and we keep track of it.
When the CPU or our emulated Switch kernel reads or writes to the memory address that the texture was uploaded to, we check to see what we need to do, and reload the texture only if necessary.
This also applies to framebuffers because in some cases, games can use them as textures.
If this caching wasn't existent, we'd essentially have to upload every texture to OpenGL memory (host GPU space) on every draw, copy the final framebuffer back to emulated Switch memory (CPU space) so that the game could potentially use it for framebuffer.

{{< imgs
    "./SMO_astc.png|Testing Super Mario Odyssey"
    "./SMO.png|Inverted render"
		"./SMO_2.png|Inverted render"
>}}

{{< imgs
		"./SMO_debug.png|Debugging"
		"./SMO_work.png| Proper render"
		"./SMO_2_work.png| Proper render"
>}}

We had a couple of fixes to our rasterizer cache mainly because it was based on Citra's rasterizer cache.
Because the compressed texture formats that the 3DS uses are not commonly supported by desktop GPUs, Citra's rasterizer cache decodes any compressed textures before uploading and caching them.
But since the Switch GPU supports many of the same texture formats that desktop OpenGL does, we sped things up by uploading them without decoding them.
At the start, this support was just hacked into Citra's cache, which didn't end up working correctly all the time.
One example was the squid texture in "Splatoon 2", which was identified and fixed by Subv.
We also implemented texture color swizzling, a way to swap color components, which is used by "Splatoon 2" to swap colors for intro background texture.
So, before we implemented this the colors were all wrong.
We fixed YUV2 video playback in our shader support, which fixed the previously busted "Sonic Mania" intro.
We had to implement a field parameter called component masks in `TEX/TEXS` shader instructions, to properly decode `YUV2` videos.
We also implemented texture wrap modes, which gives the ability to specify whether a texture on a triangle is mirrored or repeating etc.

There are lots of other things already implemented and many more that have to be implemented.
As the Switch's GPU is quite advanced, we have dozens of texture formats, vertex formats, lots of registers, different configuration modes, shader instructions that need to be implemented.

{{< imgs
    "./onepiece.png|One Piece - Then"
		"./onepiece_work.png|One Piece - Now"
    "./steam_world.png|Steam World Dig 2"
>}}

Apart from the above mentioned stuff, there have been many more modifications made to yuzu's GPU HLE (high level emulation).
These bug fixes or modifications were done on a per-game experimentation basis and as we progress further we will continue to fix our implementations and improve the accuracy of emulation in yuzu.
All of the progress we have made until now is thanks to the efforts of yuzu's contributors and the good people from Switch hacking communities.

## Virtual File System (VFS) by [DarkLordZach](https://github.com/DarkLordZach) ([here](https://github.com/yuzu-emu/yuzu/pull/676))

A Virtual File System (VFS) is an abstraction layer which allows us to hide the details of where the actual files are stored.
The purpose of a VFS is to enable the emulated Switch file system to read and write to many different types of backends, without changing anything in the emulated FS code.
In layman's terms, the game will still think its reading and writing to a file on the Switch, but in reality it could be reading from a zip file, or from a custom mod that the user adds.
This makes further support for Updates, DLC, new formats, encryption, etc., a little bit easier to implement. [DarkLordZach](https://github.com/DarkLordZach) single-handedly worked on VFS for a couple of weeks and successfully implemented it.

## Touch-Screen Support by [DarkLordZach](https://github.com/DarkLordZach) ([here](https://github.com/yuzu-emu/yuzu/pull/683))

DarkLordZach has been working very actively on various bug fixes, features and has also been lending a hand in testing games too.
His latest contribution comes in the form of touch-screen support for yuzu.
With this feature, yuzu now emulates mouse clicks to touch inputs and if you happen to have a physical touch screen, that can be used as a input device too.

{{< imgs
    "./12switch.png|1-2-Switch"
		"./arms.png|ARMS"
    "./celeste.png|Celeste"
    "./doom.png| Doom"
>}}

{{< imgs
    "./farming.png|Farming Simulator"
    "./Lildew.png|Ittle Dew"
    "./minecraft.png|Minecraft Story Mode"
    "./picross.png|Picross"
>}}

{{< imgs
    "./minecraft.mp4|Our first 3D rendered game - Minecraft"
>}}

## Miscellaneous

Apart from these improvements, we have had multiple PRs which fixed bugs and deadlocks in various games.
We got graphics output in Super Mario Odyssey, fixed saves related issues, launched many new games to the title screen, booted into few networked dependent games like Doom, implemented few SVCs and shader instructions, fixed a major performance regression with controller support, optimized logging system and did many more optimizations.
We thank all the contributors for their valuable contributions and applaud their efforts.

{{< imgs
    "./seiken.png|Seiken Densetsu Collection"
		"./setsuna.png|I am Setsuna"
    "./sm+.png|Sonic Mania Plus"
    "./snipper.png|Snipperclips Plus"
>}}

<h3 style="text-align: center;">
<b><a href="https://github.com/yuzu-emu/yuzu/">Contributions are always welcome !</a></b>
</h3>
