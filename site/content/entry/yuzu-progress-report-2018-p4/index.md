+++
date = "2018-12-03T4:00:00+05:30"
title = "Progress Report 2018 Part 4"
author = "CaptV0rt3x"
forum = 66507
+++

Sorry for keeping you guys waiting!
A whole slew of new updates and a ton of progress await you.
Let's not waste anymore time and get the party started.
<!--more-->

These past couple of months have been absolutely fantabulous.
If you were following us closely on [twitter](https://twitter.com/yuzuemu), you might have seen a few tweets but, strictly speaking, they don't even come close to describing the amount of work that has been accomplished.

Also, a new remake was released on the Switch a few days back and with it a bunch of contributors raced to fix some of the new issues it uncovered.
We will be covering that in a separate section, so hold on to your seats and enjoy the ride.

{{< imgs
    "./lgpe.png|Pokémon: Let's Go, Eevee!"
>}}

## CPU / Core

[MerryMage](https://github.com/MerryMage) has added a lot of new ARMv8 instructions to [dynarmic](https://github.com/MerryMage/dynarmic), our ARM dynamic recompiler, which further reduce our fallbacks to [unicorn](https://www.unicorn-engine.org/).
Code generation has also been improved by making use of more recent CPU instructions (e.g. SSE4.1, AVX, AVX512, etc).
We are slowly moving towards completely phasing out unicorn in favor of dynarmic, with nearly 85% of the work done.
While there are still a few missing instructions in dynarmic, we didn't observe any games hitting them.

Support for Linux `perf` command has been added, which allows us to profile the time we spend in recompiled game code.
In simple terms, it helps us identify areas of code which are being used by games frequently, so that we can optimize those areas.
For more info on `perf`, visit [here](https://perf.wiki.kernel.org/index.php/Main_Page).

[Lioncash](https://github.com/lioncash) found and fixed a bug in dynarmic's `ExclusiveWrite128()` function.
Due to this bug, when the second half of the value was being written, it would overwrite the first half.
Thankfully this wasn't a bug that was being encountered, as the function is currently unused.

{{< single-title-imgs
    "The Legend of Zelda - Breath of the Wild"
		"./botw.png"
		"./botw-1.png"
		"./botw-2.png"
>}}

## General Improvements

To ensure general feature parity between the sister projects, whenever we have new features implemented in [Citra](https://citra-emu.org/), we port them to yuzu and vice versa.
Recently we have had new features like Joystick Hot-plugging support and Touch Input handling implemented in Citra.
While Joystick hot-plugging allows us to connect/disconnect controllers on-the-go, without crashing the emulator, Touch Input handling allows us to use a physical touch screen for input, in the place of a mouse.

Web Services & Telemetry features are used to gather anonymous user statistics and for other backend stuff like user authentication.
We now have a [Compatibility Database](https://yuzu-emu.org/game/) which lists the playability information for various games.
Mind you that this list is a work-in-progress and is community driven.
Play games on yuzu and while playing, go to `Help -> Report Compatibility` and submit info to help improve the database.
`Discord Rich Presence`, a novelty feature, was also added so that yuzu fans could show off in their discord statuses.

Apart from these, we've also had a few minor improvements like:

* Unsupported OpenGL extensions pop-up - which tells you if your GPU isn't suitable for yuzu.
* Background color changer - to change background color.
* Fixed logging initialization, default `username`, and default language in our SDL frontend.

**Note**: The Multi-core option has been temporarily removed, due to inaccuracies in our kernel and scheduler.
We will likely support multi-core at some point in the future.

## Audio

[FearlessTobi](https://github.com/fearlesstobi) and MerryMage teamed up to bring audio-stretching to yuzu!
While the implementation shares a lot in common with audio-stretching in Citra, it's been tuned and optimized for yuzu to decrease the performance impact on emulation and reduce delay and crackling as much as possible.

If fixes are more your thing, [ogniK](https://github.com/ogniK5377) fixed an annoying softlock in Super Mario Odyssey (SMO).
This game expects various Effect States (for sound effects) to be initialized, even if they aren't updated.
Because SMO hasn't been observed to actually update these states, assertions have been placed to see if they are ever updated.
For now though, his changes mean that various hangs in SMO are fixed, making the game much easier to play.

## GPU

Thanks to tons of contributions the past few months, yuzu's GPU core has seen a lot of fixes, optimizations and new features making emulated games look a lot more like their console experience.
At the forefront of these efforts is getting the sublime 3D platformer, Super Mario Odyssey, to playable status.

#### Super Mario Odyssey (SMO)

As you probably know, while yuzu technically could boot Super Mario Odyssey, it was neither able to properly render graphics nor run the game at decent speeds.
To get the game working, was like an exciting challenge to the developers which, at the end, held a hidden treasure.
So, they set out on a journey - to dig deeper into the internal workings of the game, as well as the console.

But, as with any treasure hunt, you need clues to start somewhere.
The only way to move forward was to try fixing the existing bugs and graphical issues, which could give more insight into what else might be broken.
And thus started the journey, with 2 goals in mind - to fix issues in SMO and to make it run at playable speeds in yuzu.

{{< single-title-imgs
    "Super Mario Odyssey"
		"./SMO-2.png"
		"./SMO.png"
		"./SMO-1.png"
>}}

[bunnei](https://github.com/bunnei) and [Subv](https://github.com/Subv) together implemented `multiple color attachments` for the framebuffers.
A color attachment is a texture, which attaches to a framebuffer as a render target and is used for off-screen rendering.
These are used in several techniques including reflection, refraction, and deferred shading.

A render buffer, or render target, is any specially created single buffer to which part of rendering may be directed.
Some examples would be color buffers and depth buffers.
A framebuffer is a bound collection of several such render buffers.
While all of these changes fixed many graphical issues in SMO and other games, performance still left a lot to be desired.

**What if, for a change, instead of fixing bugs, we try to improve rendering in the game?**
bunnei independently set out to scrutinize the way we were rendering graphics and found out that we could improve the accuracy of how we cached and copied our framebuffers.
And the result was improved rendering in SMO's Ruined Kingdom, without even having to use the `Accurate Framebuffers` setting in yuzu.

{{< imgs
    "./smo-1295-b.png|Before"
    "./smo-1295-a.png|After"
>}}

Our further efforts to improve rendering led to the fact that we needed to properly provide textures to shaders.

> A texture is an OpenGL Object that contains one or more images that all have the same image format.
A texture can be used in two ways - it can either be the source of a texture access from a Shader, or it can be used as a render target.

There are a number of different types of textures in OpenGL and not all of them are 2D - some are arrays and some are cubemaps.
These are special kinds of textures generally called Layered Textures.
[Blinkhawk](https://github.com/FernandoS27) found that we were incorrectly reading these special textures, which was causing various graphical glitches in games.
He then reworked the code to account for size of mipmaps and made sure that we read these textures properly.

[Mipmaps](https://en.wikipedia.org/wiki/Mipmap) are generally pre-calculated, optimized sequences of images, each of which is a progressively lower resolution representation of the same image.
If the image to be rendered is big or close to the camera, the renderer uses a bigger texture map, while if it is smaller or farther away, then smaller textures are used.

The absence of these mipmaps was yet another reason for glitchy rendering in several games.
Blinkhawk identified this, and implemented mipmaps and texture processing modes - which are needed to access said mipmaps.
Mipmaps are intended to increase rendering speed and reduce aliasing artifacts, while texture processing modes change the way games access a texture's mipmaps.

{{< imgs
    "./smo-mip.png|Before"
    "./smo-map.png|After"
>}}

Another missing texture type was Cubemaps.
Cubemaps aren't unique to Super Mario Odyssey - in fact most games use cubemaps.
Essentially, a cubemap is a texture that contains six individual 2D textures that form each side of a textured cube.
The thing that sets SMO apart in this case is *how* it uses cubemaps in an unusual way.
As with emulation, it's easy to emulate *expected* behaviors, but when a game uses a feature for something unanticipated, it can trip up an incomplete implementation.
SMO tends to use a single render target for all six sides of the cubemap surface, necessitating yuzu to allow copying between render targets and cubemaps for correct emulation.

{{< single-title-imgs
    "Before"
    "./metro1-b.png"
    "./sand1-b.png"
>}}

{{< single-title-imgs
    "After"
    "./metro1-a.png"
    "./sand1-a.png"
>}}

Blinkhawk also implemented 3D textures, which are used for global illumination caching and to enable correct coloring.
3D textures work like regular textures, but they are truly 3D and are usually used for volumetric effects like smoke, fire, light rays, realistic fog, etc.
The way in which Switch games create these is very interesting from an emulation perspective.
It turns out that most games compute them on loading, instead of having them pre-computed and they are generated through some sort of hack over Nvidia's memory layout.

{{< single-title-imgs
    "After 3D textures"
    "./smo-1505-1.png"
    "./smo-1505-2.png"
>}}

{{< message XtraByte >}}
The game tries to render 2d textures with a block depth of 16, (block depth should only be used on 3d textures), then overlaps them in a specific order of rendering and reinterprets that as a 3d texture.
The solution we came up with was, to flush all textures in that memory area in the order of modification from last modified to newest and then read that memory as a 3D Texture.
{{< /message >}}

While all the others were trying to fix graphical bugs, bunnei was still searching for ways to optimize performance of the game.
He and Subv identfied a major issue - that we weren't flushing data properly.

> Flushing is the process of taking render buffers that were modified in the host-GPU and write them back to the guest RAM (Host - hardware, Guest - Switch).
If you modify render buffers that were cached on the host-GPU but never flush them, then the games won't see the latest version of those render buffers when they try to access them.

bunnei, over a couple of weeks, implemented flushing in the rasterizer cache and also for DMA transfers.
Along with these, he also implemented accelerated Fermi2D copies.
Fermi2D is one of the engines inside the GPU.
It is like a 2D transformation engine, where you feed it 2D images and you can do a bunch of transformations on it in the GPU.
With accelerated copies, the surface copying was now simpler and faster and as an additional bonus, it fixed several things like the ice effect in SMO and the blur effect in One Piece.

{{< imgs
    "./smo-ice.png|Super Mario Odyssey"
    "./op-blur.png|One Piece"
>}}

Days went by without any new findings but then we finally hit a jackpot.
Code investigation and reverse engineering led us to an issue where `macros` could be skipped.
`macros` are command sequences sent to the guest GPU and since they were being skipped, it led to distant objects not being rendered in SMO.

{{< imgs
    "./smo-1622-b.png|Before"
    "./smo-1622-a.png|After"
>}}

bunnei fixed this by restructuring the way we uploaded these macros to the guest GPU.
Instead of piping macro code into separate memory for each program, we now write it to a single macro memory region and then execute macros via the specified offset into this region.
He also found a bug in our memory manager, where buffers were being mapped over memory which was already in use.
By fixing that, we fixed the rendering when changing areas in SMO.

{{< single-title-imgs
    "Before"
    "./smo-1630-1b.png"
    "./smo-1630-2b.png"
>}}

{{< single-title-imgs
    "After"
    "./smo-1630-1a.png"
    "./smo-1630-2a.png"
>}}

#### New Features, Optimizations, and Fixes

But ~~SMOzu~~ yuzu isn't a Super Mario Odyssey emulator, it's a Nintendo Switch emulator.
And as such, any efforts to fix or improve a single game will definitely impact other games too and thus many other games are reaping the benefits of sustained work.

{{< message Back-to-School >}}
Let's go back to school for a bit.
**What is rendering and how does it work on modern GPUs?**
Rendering is a very generic term which is basically can be defined as "creating an image", which can be, obviously, created in many ways.

In modern GPUs, say if you want to render a triangle, you supply triangle coordinates to GPU and also load a shader to GPU.
Then the GPU starts rendering the data you supplied, it is executing your shader on every triangle vertex (vertex shader) and every triangle pixel (pixel shader).
Shaders are simple programs that describe the traits of either a vertex or a pixel.
In the shader, you basically transform coordinates (vertex) and change color (pixel) of your final image.
Shaders are very powerful and very fast, most effects in modern games are possible because of shaders.

But, how does the shader know to transform given data to our exact requirements?
That's because the shaders are programs that can be written using shader languages.
There are a number of such shader languages, but we use a C-like language GLSL (OpenGL Shader Language).
Modern GPUs make use of shader instruction sets, to pass commands to the individual programmable shader units and make them do the work.

{{< /message >}}

{{< single-title-imgs
    "Kirby Star Allies"
		"./kirby.png"
		"./kirby-1.png"
>}}

{{< single-title-imgs
    "In Game"
		"./kirby-2.png"
		"./kirby-3.png"
>}}

The Nvidia Tegra X1 - which is the brain of the Switch, houses a Maxwell architecture based GPU.
Like all other Nvidia GPUs, this too utilizes Nvidia's shader instruction sets to make the shaders render graphics.
Unlike most other parts of our code base, which is HLE (High Level Emulation), our GPU emulation is LLE (Low Level Emulation).

> LLE just translates the native code and is the traditional way of emulating.
Simply put, in LLE we interpret the `macros` sent to the GPU and then read the registers to render stuff.
And to do that, we need to emulate the shader instructions that the GPU uses.

Our developer Blinkhawk took it upon himself to try and implement the shader instructions in our GPU emulation.
He refactored the existing `IPA` shader instruction, implemented the shader instructions `TMML`, `LEA`, `PSET`, properly implemented `TXQ` and fixed `TLDS`, `FSETP`, `FSET`.

He implemented Cube Arrays, implemented `3 coordinate array` in `TEXS` instruction - which is used by Breath of the Wild, improved shader accuracy on Vertex and Geometry shaders, and improved GPU Cache's lookup Speed - which resulted in better overall performance.

Another developer [Rodrigo](https://github.com/ReinUsesLisp), also lent a hand by independently researching the shader instructions we were missing and implementing them.
He implemented a few instructions like `VMAD` & `VSETP`- which are complex instructions used in Geometry Shaders, `PBK` & `BRK` - which are flow instructions used by some games, and also implemented the whole set of "Half-Float" instructions - `HADD2`, `HMUL2`, `HFMA2`, `HSET2`, and `HSETP2`.

Most games use 32-bit floats, but some use half floats (16-bit floats).
These instructions can execute two operations at once and it's easier for the game to send half the data.
Games like Xenoblade, Hyrule Warriors and L.A. Noire were found to be using these.
As these are not used by [nouveau](https://nouveau.freedesktop.org/wiki/), it required a bit of hardware testing and help from the nouveau team to implement these.
For those of you who don't know, the nouveau project develops and builds open source drivers for Nvidia GPUs on Linux.

In the meantime, Blinkhawk, in his research efforts, found out that some shader information was going missing.
This was because, not all the info of an Nvidia shader is saved in the registers and some can be sent to a temporary shader memory too.
By implementing a shader local memory, we now began emulating such memory and thus fixed many graphical issues in games like ARMS and Splatoon 2, among others.
He also implemented fast layered copy - which fixed performance regressions in ARMS and Splatoon 2, while improving loading performance in many other games.

{{< single-title-imgs
    "ARMS"
		"./arms.png"
		"./arms-1.png"
		"./arms-2.png"
>}}

Generally in OpenGL, rendering is done sequentially in multiple steps.
It is called the [Rendering Pipeline](https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview).
While we had a working implementation of vertex shaders, we were still missing the geometry shaders.
The geometry shader is an optional shader stage, that sits between the vertex and fragment shaders.

Rodrigo did lots of research and finally did a basic implementation of geometry shaders.
This shader has the unique ability to create new geometry on-the-fly, using the output of the vertex shader as input.
Geometry shaders in Maxwell architecture do not specify input topology anywhere, they just receive the data as is.
It doesn't care if it's a point or a triangle list.
But in OpenGL, GS requires that input topology is in their source.

The implementation isn't complete yet, but gets the job done.
Most games that use GS will find correct behavior depending to what extent the games use GS.
It still has scope for improvements and is also missing a few features like:

* built-in types of output.
* buffer streams.

Rodrigo found the cause and fixed the infamous "half-screen rendering" bug on Intel GPUs (Windows).
The cause of the bug was an expression, carried from Citra's GPU emulation code.
Because of setting a default clip distance, the render was being cut to half.
Removing that expression, fixed rendering on Intel GPUs.

Also, he optimized our GPU emulation by using `ARB_multi_bind` for uniform buffers and sampler bindings, and implemented `quads` topology.
The `ARB_multi_bind` is an OpenGL extension, which reduces OpenGL invokes by binding multiple objects to a single call.
`quads` are rendered using OpenGL core and are used by some indie games and Xenoblade.
A `quad` is a 4 vertex quadrilateral primitive and is not exposed in the modern OpenGL API.
So as a workaround, we render `quads` with a pair of triangles.

On a hunch that he could improve performance, Blinkhawk researched swizzling techniques and algorithms.
Unsurprisingly, he found out that yuzu's initial implementations were grossly inefficient and took up the task of optimizing the various swizzling techniques.
He implemented 3D swizzling and also optimized texture swizzling, fast swizzle, and legacy swizzle.
The new Swizzling algorithm is about 6~12 times faster than the old one and adds functionality to read and interpret 3D Textures.
For the users, this meant improved performance and FPS boosts.

>In order to load textures, we must convert them from a guest optimized format to linear format i.e., an Nvidia internal format into a linear format for OpenGL to read them. This process is called Swizzling.
The opposite to this i.e., converting the linear format textures to guest optimized format, is called UnSwizzling.

{{< single-title-imgs
    "Crash Bandicoot"
		"./bandicoot.png"
		"./bandicoot-1.png"
>}}

Furthermore, he implemented the Scissor test, Alpha test - using shader emulation, depth compare, and shadow samplers.
The Scissor test is a per-sample processing operation that discards fragments that fall outside of a certain rectangular portion of the screen.
Alpha test is a hardware feature to skip certain pixels.
The Alpha channel tells OpenGL which parts of image are transparent and which parts are opaque.
Alpha test is used to discard pixels which fall outside of a certain range of alpha values.
Depth Compare & Shadow Samplers are used to implement occlusion in games.
By adding support for them, games will be able to detect where shadows go by checking a depth texture through a shadow sampler.

[Tinob](https://github.com/Tinob), well known for Ishiiruka Dolphin, also contributed to the GPU emulation.
He implemented `sRGB` framebuffers and improved OpenGL state handling to reduce redundant state changes and ensure default state to avoid driver implementation issues.
Also, he researched and implemented various missing OpenGL states, added tweaks to reduce state handling redundancy, and added support for various registers.
These fixed many small graphical bugs in SMO and other games.

[degasus](https://github.com/degasus) fixed few bugs and optimized GPU emulation wherever possible by reducing the overhead per draw call.
His optimization of the shader cache resulted in a significant performance boost across all games.
[FreddyFunk](https://github.com/FreddyFunk), while profiling yuzu, recognized that in some scenarios a lot of time is taken by allocating memory in calls of `CopySurface` and optimized it for better performance.

#### Pokémon: Let's Go, Pikachu! / Eevee!

The Pokémon franchise has been and always will be one of Nintendo's most successful and profitable franchises.
And their newest iteration of games for the Nintendo Switch are Pokémon: Let's Go, Pikachu! & Let's Go, Eevee! - remakes of good old Pokémon Yellow from the GameBoy days.
For the developers, the thought of booting and emulating a hot new game on release day was very exciting.
And thus began the rush - to test the games, fix issues, and essentially make it playable on day one.

{{< single-title-imgs
    "Pokémon: Let's Go, Pikachu!"
		"./lgpe-1.png"
		"./lgpe-2.png"
		"./lgpe-3.png"
>}}

ogniK was the first to get the game, thanks to time zones, and he immediately began his RE (reverse engineering) work.
He found out that the games checked for the `Poké Ball Plus` controller on boot and since we didn't support it, the game wasn't booting in yuzu.
After further research, he implemented a small set of commands and functions used by the bluetooth driver, which got us to the title screen.

And just when we thought that was it, ***a wild softlock appeared!***
ogniK identified the cause of this to be in `HWOpus` and simultaneous RE efforts from [gdkchan](https://github.com/gdkchan) of Ryujinx, revealed more info.
It seems that the ordering of output parameters within a `HWOpus` function - `DecodeInterleaveWithPerformance` was wrong and fixing that resulted in audio output for both the Let's Go games.

{{< single-title-imgs
	  "Pokémon: Let's Go, Eevee!"
    "./lgpe-4.png"
		"./lgpe-5.png"
		"./lgpe-6.png"
>}}

Hexagon12 implemented a missing predicate comparison, which fixed trainer battle crashes in the games.
With these, yuzu was finally able to boot into the game properly but it still crashed when naming the characters.
Because the software keyboard applet wasn't implemented in yuzu, the games couldn't load the applet and hence crashed.
[DarkLordZach](https://github.com/DarkLordZach) was already working on implementing the applet and with a bit of research and testing, he was able to complete his implementation.

{{< imgs
    "./swkbd.png|Software Keyboard in Pokémon: Let's Go, Eevee!"
>}}

Provided that your PC hardware is strong enough to handle yuzu, the new Pokémon games are playable, with a few caveats.
Currently, some of the graphics render well, but there are still a lot of flaws - like fonts missing everywhere.
But hey! the audio works decently, although you still need a save file to bypass softlocks in the beginning.
Even with all these, there are random crashes everywhere - which require more in-depth testing to fix.

{{< single-title-imgs
    "Pokkén Tournament"
    "./pokken.png"
    "./pokken-1.png"
    "./pokken-2.png"
>}}

Apart from these, there were multiple minor improvements and fixes done by our team and other contributors, which helped us get further into accurate GPU emulation.
We also updated the OpenGL's backend version from 3.3 to 4.3 and removed pre 4.3 `ARB` extensions.
With this, the minimum required OpenGl version for yuzu has been bumped up to 4.3 as well.

## Operating System - HLE

In regards, to the operating system, kernel, and various service modules, we have made a lot of progress here as well.
Lioncash has been absolutely phenomenal in fixing and optimizing our HLE (High-level emulation) kernel implementation.
He spent dozens of hours in RE (reverse engineering), to debug our kernel and made sure that everything was proper.
Most of his work in this regard has been:

* Adding missing error codes in the kernel.
* Handling error cases within memory related functions.
* Handling "invalid address" cases within SVC (Supervisor Call) functions.
* Adding missing address range checks in `MapMemory` & `UnMapMemory` functions.
* Fix VMA (Virtual Memory Access) boundary check in `svcQueryMemory`.
* Added missing Korean font in our open-source implementation fallback.

{{< imgs
		"./octo.png|Octopath Traveler"
		"./donkey-kong.png|Donkey Kong"
>}}

He implemented an svc function - `svcGetThreadContext` - which retrieves the the context backing a thread, or the state of the thread at that given moment, and writes it to a provided buffer.
The thread context contains the state of CPU execution - such as general purpose registers, stack pointer, program counter, and several other fields.
This thread context can be used by the executable for debugging purposes, or to save and reuse it later, or anything else entirely depending on the executable.

He also made changes in our virtual memory manager, to load NPDM metadata.
NPDM is the Switch equivalent of 3DS exheader.
Previously we were never loading NPDM metadata in the event that it was available and it meant that we'd be making assumptions about the address spaces.
With this, he de-hardcoded our assumption of a 36-bit address space, given that it's possible for a game to demand a 39-bit one or 32-bit one and we can now derive the parameters from supplied NPDM metadata, if the supplied executable supports it.

Apart from these notable changes, Lioncash made several other contributions to yuzu.
He updated the function tables for various services - based on latest documentation from [Switchbrew](http://switchbrew.org), fixed minor bugs in various svc functions, worked tirelessly on maintaining proper C++ style across the code-base, and made performance optimizations wherever possible.

While Lioncash has been handling the kernel stuff, our Switch RE expert - ogniK has been busy fixing and implementing more service functions.
ogniK properly implemented the `fatal:u` service, stubbed the `IRS` service, and added many missing functions across various services.
He reworked the `nifm` service stubs - which were found to be incorrect, fixed an `acc` service stub - which allowed us to boot the Nintendo Switch Online NES emulator, implemented a few missing functions in `AudRen` and `HwOpus` services - which fixed audio for Sonic Ages.
(Although Nintendo Switch Online NES emulator boots, it doesn't mean users can play online.)

{{< single-title-imgs
    "Nintendo Switch Online - NES emulator"
    "./nso-nes.png"
    "./nso-nes-1.png"
>}}

{{< message XtraByte >}}
Stubbing means that these services return `ok` with no errors, so that the games think that the function succeeded and it can continue on without getting back any valid data. As the games boot further and further, we need to start intercepting these function calls and provide a more meaningful response.
{{< /message >}}

He added the ability to switch between docked and undocked mode while in-game, added support for Amiibo files & uncompressed NSOs, and fixed a few minor bugs in various service functions.
Although, this isn't complete Amiibo support just yet.
Only a few games work and more support will be added in the future.

ogniK reworked and refactored the entire `HID` service implementation, dubbed `Better HID`, and vastly improved it.
He replaced lot of stubbed functions with actual implementations and fixed our `HID layouts`.
This allowed the registration of multiple user controllers **AND** different **TYPES** of controllers (handheld, joycon left, joycon right, pro controller), except for `tabletop mode` - wireless dual joycons.

DarkLordZach hasn't been sitting quietly either.
He picked up from where ogniK's `HID` rework left off and made further improvements.
He added full UI support to change the connectivity, type/layouts and buttons for all eight players, the handheld controller, the debug controller, mouse, keyboard, and finally touchscreen.

He also made many new improvements to the file system and added new features as well.
His other notable works include:

* Added support for `LayeredFS` mods - which brings infinite possibilities for games in yuzu.
* Added support for packed updates - which are basically `XCI` files with both base game and updates.
* Implemented DLC loading.
* Added support for full key-derivation, so that you don't need 3rd party tools for dumping keys, only our [quickstart](https://yuzu-emu.org/help/quickstart/) guide.
* Added support for loading IPS patches.
* Added support for the more easier IPSwitch format patches.
* Implemented save data types - `TemporaryStorage` and `DeviceSaveData`.
* Added UI for multiple user profiles (emulated).
* And many more minor bug fixes and optimizations.

bunnei implemented the `loadNRO` functions from the `ldr:ro` service.
This was a basic implementation of the functions which allowed us to boot Super Mario Party.
DarkLordZach later completed the `ldr:ro` service implementation, based on research done by bunnei, Subv, and the folks at Atmosphere.

## Conclusion

The improvements we've covered here are only the major ones.
In addition to these, we have had many minor bug fixes & feature implementations done by our valuable contributors.
Many thanks to our contributors and also to the devs from various communities who have indirectly helped us progress forward.
Special thanks to our patrons who have showed their continued support for our efforts in this project.
Also, another special thanks to JMC47 - one of the authors for dolphin-emu blog, for all his inputs and criticism regarding this article.

{{< imgs
    "./splatoon2.png|Splatoon 2"
		"./sonic-forces.png|Sonic Forces"
		"./sonic-forces-1.png|Sonic Forces (In game)"
>}}

{{< message Note >}}
All these screenshots have been taken in docked mode of yuzu, using a PC with the following specs:

* CPU - Intel i3 6100
* GPU - Nvidia GTX 750ti
* RAM - 12 GB DDR3
{{< /message >}}

&nbsp;
{{< article-end >}}
