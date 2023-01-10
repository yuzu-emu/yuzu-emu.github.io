+++
date = "2023-01-05T12:00:00-03:00"
title = "Progress Report December 2022"
author = "Honghoa"
coauthor = "GoldenX86"
forum = 0
+++

Hello yuz-ers. What a year! We ended 2022 with more yuzu Fried Chicken, Vulkan changes, a new input driver, an exorbitant amount of kernel work, more performance, better visuals, and much more!

<!--more--> 

## Project Y.F.C. part… 1.5, and a cache invalidation

[Blinkhawk](<https://github.com/FernandoS27>) has also been working hard on his beloved project, releasing {{< gh-hovercard "9501" "Y.F.C. Part 1.5." >}}
Basically an abridged version of what is expected for the full “Part 2” release.
The changes in this pull request include a rework of the `MacroHLE` implementation to include various new macros for indirect draws and configurations.

As discussed in previous articles, macros are small GPU programs that implement features like indirect and instanced draws. They must be emulated.
MacroHLE (High-Level Emulation) is the process of avoiding executing a requested macro and instead translating it directly to the code that it would have generated (like an instanced or indirect draw).
This works in contrast and in parallel with MacroJIT, which works by actually emulating the loops and control flow contained in macro programs in a [just-in-time](https://en.wikipedia.org/wiki/Just-in-time_compilation) fashion.

Now, why keep both? Well, each one performs their own specialized task.
MacroHLE's advantage compared to MacroJIT has to do with the emulation of indirect calls.
An indirect call, such as a draw, uses data generated somewhere in the GPU through some shader in order to establish the draw parameters and its draw count.
Traditionally with MacroJIT we had to sync the Host GPU and Guest GPU to obtain the indirect data in order to execute the macro correctly. 
With MacroHLE, we create an indirect draw command in the host GPU that points to the translated address of where the GPU generated data should be. 
Thus skipping the syncing.

Thanks to these improvements, yuzu now is able to more efficiently execute macros, considerably reducing CPU overhead, and without having to change any setting.
What we internally like to call a “passive skill”.

As a result of these changes, performance has been improved in several titles, including those developed by Koei Tecmo, `Pokémon Scarlet and Violet`, `Bayonetta 3`, and `Monster Hunter Rise` (with the exception of version 12.0.0, which still requires further fixes) to name a few.
The crashes in `Fire Emblem: Warriors` have also been fixed.
We measured a 5-20% performance boost in select titles, but the improvement may be higher on CPUs with a lot of cache. From our testing, the 5800X3D can reach over 30% in some games.
The performance cost of rendering at higher resolutions was also greatly reduced.

{{< imgs
	"./yfc.png| R5 5600X - 2x16GB 3933MHz CL18 - RX 6600"
  >}}

But the goodies don’t end here! Blinkhawk also added support for the `VK_EXT_extended_dynamic_state2` and `VK_EXT_extended_dynamic_state3` Vulkan extensions, reducing the amount and size of shaders needed to be built during gameplay.

This relatively “new” pair, along with the already implemented `VK_EXT_extended_dynamic_state` and `VK_EXT_vertex_input_dynamic_state`, are the four extensions responsible for considerably reducing shader building stuttering.
But as it always goes, support for these extensions in consumer GPUs is spotty at best, and a mess to support at worst.
`State3` in particular is only supported by the [NVIDIA Vulkan Beta](https://developer.nvidia.com/vulkan-driver) drivers, version 527.86 at the time of writing, and recent (late 2021 and newer) RADV Mesa drivers.
We recommend anyone interested in testing how a fresh shader cache performs to give these drivers a go.

With no alternative, implementing these extensions forced us to perform another dreaded cache invalidation.

{{< imgs
	"./dynamic.png| Proof that the best GPUs for yuzu continue to be NVIDIA for either OS, or AMD on Linux"
  >}}

Most drivers cover at least 3 of the 4 extensions without issue, one way or another, with one glaring exception, AMD Windows drivers.
The price of this is higher stuttering during gameplay when new shaders are being processed compared to running the same card on Linux with RADV, or using any other brand.

A small side-note, Linux RADV users should update their Mesa version to the latest (or use a more recent distro version if needed), as support for `state2` was broken in versions before 21.2.

As a last second change, Blinkhawk tested removing the 16-bit floating point (FP16) blacklist enforced on NVIDIA Ampere and newer GPUs (RTX 3000 series and higher). If it worked, it would have allowed them to work similarly to Turing and AMD Radeon offerings in this aspect. However, NVIDIA redesigned how their FP32 and FP16 units operate on Ampere and newer, with both providing identical performance. Unfortunately, even if it were faster, it'd be irrelevant in the end, as FP16 on Ampere and Ada is still bugged in the drivers, producing graphical issues in many games.

All irrelevant in the end as the precision of FP16 on Ampere and Ada is still bugged in the drivers, producing graphical issues in many games, and even if we re-enabled it, there is no performance benefit thanks to the specific design of these cards, they are already fast enough with FP32.

The only remaining architecture that could benefit from enabling blacklisted FP16 support is Intel on Windows, but their drivers are a dumpster fire regarding FP16. So they continue to emulate 16-bit precision with 32-bit the same way as Ampere and Ada, in this case with its always present performance loss. 
_Of course_ the weakest architecture that could benefit the most from this change is the only one that remains broken…

Another extra benefit of this iteration of `Y.F.C.` is that `Normal` GPU accuracy is much safer to use. 
Particles will continue to be better in `High`, but games like `Pokémon Scarlet/Violet`, `Bayonetta 3`, and many others can be played with `Normal` accuracy without glitches much more regularly with the big performance benefit this provides (`Bayonetta 3` in particular still needs `High` for its title screen, but gameplay is safe on `Normal`).

## Other awesome GPU changes, and yet more cache invalidations

The month doesn’t stop there, there has been a plethora of changes worth mentioning too in our GPU codebase.

Oh boy, [byte[]](https://github.com/liamwhite) sure has been busy this month.

To start off, he is responsible for {{< gh-hovercard "9409" "implementing the SMAA anti-aliasing filter" >}} for our Vulkan and OpenGL backends. 
But that’s not the whole story, so let’s elaborate further.

`SMAA`, or enhanced subpixel morphological antialiasing, is an improvement over [MLAA](https://en.wikipedia.org/wiki/Morphological_antialiasing) developed by the Spanish Universidad de Zaragoza and video game studio Crytek, of Crysis fame.

[BreadFish](https://github.com/breadfish64) implemented the original OpenGL version, intending to release it as part of the [resolution scaler](https://yuzu-emu.org/entry/yuzu-art/). As it turns out, implementing `SMAA` for Vulkan is no joke, and after being nagged by your writer, byte[] had to work 2 weeks to get it in shape.

`SMAA`, being based on `MLAA`, intends to be a post-processing (aka shader-based) option focused on quality over performance by analyzing adjacent pixels, unlike `FXAA` which just blurs the entire screen.
The `SMAA` filter is implemented using render passes and it produces its best results when combined with FSR filtering. 
AMD recommends properly anti-aliasing the image in their official Overview Integration Guide.
The results speak for themselves:

{{< single-title-imgs-compare
	"Here you can see an ideal test case for SMAA, the simple triangle of death"
	"./noaa.png"
	"./1smaa.png"
	>}}

{{< single-title-imgs
    "Ropes and power lines, the classic example for anti-aliasing testing (Pokémon Scarlet)"
    "./svnoaa.png"
    "./svfxaa.png"
    "./svsmaa.png"
    >}}

{{< single-title-imgs
    "Sprite elements in 3D games benefit from it (Xenoblade Chronicles 3)"
    "./xc3noaa.png"
    "./xc3fxaa.png"
    "./xc3smaa.png"
    >}}

For those interested, we used the `ULTRA` preset, testing showed a low performance loss even with a GT 1030, so we preferred to focus on quality.
Only users with old integrated GPUs should avoid `SMAA`. For the rest, it’s a safe option to turn on and forget.
You can find the feature in `Emulation > Configure > Graphics > Anti-Aliasing Method`.

{{< single-title-imgs-compare
	"SMAA doesn’t suffer from the horrible colour banding of FXAA (The Legend of Zelda: Breath of the Wild)"
	"./botwfxaa.png"
	"./botwsmaa.png"
	>}}

{{< single-title-imgs-compare
	"And it's a great help for users running low resolution multipliers. This example is 0.5x Bilinear alone Vs 0.5x FSR + SMAA (Pokémon Scarlet)"
	"./lowresbug.png"
	"./lowresfix.png"
	>}}

{{< imgs
	"./all3.png| A close-up to finish (Xenoblade Chronicles 3)"
  >}}

As a side note, NVIDIA’s version of FSR, NIS, was also tested, but the result is so ugly and over-sharpened, that we decided to keep the best option of the two, FSR.

byte[] has also fixed a {{< gh-hovercard "9420" "problem with anisotropic filtering." >}} 
If users ran the RADV driver on Linux, anisotropic filtering values other than `Default` would cause a distinct "acne-like" rendering issue in `Super Mario Odyssey`. The issue persists at other anisotropic filtering and resolution multiplier values., but byte[] continues to work on the issue.

{{< single-title-imgs-compare
	"The so called RADV acne (Super Mario Odyssey)"
	"./off1bug.png"
	"./off1fix.png"
	>}}

The change also addresses an issue with the buggy water rendering in `Super Mario Sunshine` with automatic anisotropic filtering on Lavapipe (Mesa, Linux), although the error still occurs at other anisotropic filtering values.

{{< single-title-imgs-compare
	"Kind of makes it look even older (Super Mario Sunshine)"
	"./off2bug.png"
	"./off2fix.png"
	>}}

byte[] also {{< gh-hovercard "9415" "corrected the semantics of data cache management operations" >}} in the memory.

Previously, when the guest requested a cache invalidation, the implementation would simply invalidate the cache on the hardware, rather than making the memory visible to the GPU as intended.

On the side, he also {{< gh-hovercard "9372" "promoted various Vulkan Extensions to use core methods." >}} In the Vulkan API, vendor extensions are optional features provided by specific hardware vendors or drivers that may not be available on all systems. In contrast, core methods are a fundamental part of the Vulkan specification and are guaranteed to be available on all systems that support the API. Thus, promoting extensions to use core methods can improve their reliability and portability.

byte[] made further {{< gh-hovercard "9393" "initialization tweaks to the Vulkan API." >}} These changes included the restoration of `VK_KHR_timeline_semaphore` and `VK_EXT_host_query_reset`, which were mistakenly removed in a previous PR. He also added the flag `VK_INSTANCE_CREATE_ENUMERATE_PORTABILITY_BIT_KHR` to the `VkInstanceCreateInfo` structure for `MoltenVK` to allow `MoltenVK` to be detected as an available Vulkan device.

Keep in mind that a lot more work is needed in order to get yuzu rendering on macOS devices. This is only early preliminary work.

[vonchenplus](https://github.com/vonchenplus) has implemented the {{< gh-hovercard "9401" "draw manager for Maxwell3D" >}} with the aim of eliminating workarounds and reorganising the drawing process to more accurately enumerate the drawing behaviour. 
As a result of these changes, the issue in `Dragon Quest Builders` where some 3D models were not rendering properly has been fixed.

{{< single-title-imgs-compare
	"No more missing stuff! (Dragon Quest Builders)"
	"./dbqbug.png"
	"./dbqfix.png"
>}}

{{< imgs
	"./ds.png| No armour is best armour (DARK SOULS)"
  >}}

Following these changes, vonchenplus also {{< gh-hovercard "9406" "improved the code for the topology update logic" >}} so that the implementation is more accurate. This change was necessary in order to {{< gh-hovercard "9423" "implement special topologies with Vulkan." >}}

This includes support for `quad strips`, which require the use of triangles to simulate them, and the ability to simulate indexed and non-indexed modes.
In non-indexed mode, a fixed mapping table is used to connect the vertices, while in indexed mode, a compute shader is used to dynamically map the original drawing indices.
vonchenplus has also implemented support for line loops, which require the use of triangle lists to simulate them, and for polygons, which require the use of triangle fans.

These changes fixed the Hero's path in `Legend of Zelda: Breath of the Wild`, as well as the Status Summary graphic in `Pokémon Scarlet and Violet`, and they also gave us another shader cache invalidation, yay!

{{< single-title-imgs-compare
	"Don’t mess with the stats! Can’t do breeding without the stats! (Pokémon Scarlet)"
	"./pokebug.png"
	"./pokefix.png"
>}}

{{< single-title-imgs-compare
	"When the Sheika GPS signal returns (The Legend of Zelda: Breath of the Wild)"
	"./botwbug.png"
	"./botwfix.png"
>}}

Blinkhawk has added {{< gh-hovercard "9383" "alpha to coverage and alpha to one" >}} to our Vulkan backend.

`Alpha to coverage` is a multisampling technique that is used to improve the quality of transparent or partially transparent pixels.
It works by blending the alpha values of multiple samples taken from the same pixel to produce a single, more accurate result.
This can help to reduce aliasing and other rendering artifacts that can occur when rendering transparent pixels.

`Alpha to one`, on the other hand, is a technique that is used to improve the quality of partially transparent pixels by setting the alpha value of each pixel to a maximum of `1.0`.
This can help to reduce the amount of alpha blending that needs to be performed, which can improve the performance of the rendering pipeline.

These changes have fixed the shading of trees and grass problems when viewed up close or from a distance in `Pokémon Scarlet and Violet`.

{{< single-title-imgs-compare
	"The camera isn’t more interested in that tree, you should learn from this, Dark Souls (Pokémon Scarlet)"
	"./alphabug.png"
	"./alphafix.png"
>}}

vonchenplus has corrected errors caused by yuzu's faulty detection of draw types.
In the past, yuzu would set every vertex and index count register to zero after each draw to determine if the next draw would be a regular or indexed draw.
`Xenoblade Chronicles 3` proves to us that these registers initiate some draw calls based on previous values.
{{< gh-hovercard "9353" "Changing this behaviour" >}} partially fixes the particles present in `Xenoblade Chronicles 3`. You can now more easily perform your off-seer duties.

{{< imgs
	"./xc3.mp4| Meat is on the menu! (Xenoblade Chronicles 3)"
  >}}

## CPU requirement changes, with free performance

We don’t usually cover compilation changes here, but this time we had to do it because it affects compatibility.

[Your writer](https://github.com/goldenx86) (or co-writer in this progress report, my [partner](https://github.com/kurenaihana) did most of the work this time) has been playing with compilation flags in order to get more free performance, following previous work done by Blinkhawk some time ago.

Microsoft Visual C++ (MSVC, Visual Studio) is simple enough (we’ll talk about Linux later). You enable full program optimizations, optimize for performance instead of size, a bit here, a bit there, and you gain a nice 3%, but I wanted more.
Last month, [Epicboy](https://github.com/ameerj) improved the build process, saving both time and memory. This created a “gap” big enough to enable the *Big One*, {{< gh-hovercard "9442" "Link-Time Optimizations" >}} (LTO), an optimization that in the past had to be discarded for eating all the available RAM of our buildbots.

Windows testing went well and in some cases the performance uplift reached up to 12%.
The problem was Linux. LTO is aggressive by nature, and there’s no guarantee that all parts of the project will react nicely to it.
In this case, the problem was Qt, the UI looked completely garbled. 
So LTO had to go, but in its place, we now require what [Dynarmic](https://github.com/merryhime/dynarmic/) already did for a while, [x86-64-v2](https://en.wikipedia.org/wiki/X86-64#Microarchitecture_levels) hardware.

GCC and Clang builds will now compile assuming the features of CPUs are compatible with the instruction sets that form part of x86-64-v2, the highest one being SSE4.2. 
This means the minimum CPU required for yuzu to work without crashing, in both Windows and Linux, is now the first generation of Core i-series (500-900 series), which are almost 15 years old, and the FX and APU series from AMD, which are almost 12 years old.
The performance boost on GCC and Clang is up to 7%.

{{< single-title-imgs
    "First system runs i7-12700H - 2x16GB 4800MHz CL40 - RTX 3080 Mobile 16GB 175W, second system runs R7 5800X3D - 2x16GB 3600MHz CL16 - RTX 4090"
    "./lto1.png"
    "./lto2.png"
    >}}

We originally wanted to enforce x86-64-v3 to get an even bigger performance boost, as well as to ensure a minimum level of performance, as any CPU lacking AVX, AVX2, and in particular, FMA, will be ***very*** slow, no matter its clock speed or core count.

Yes, that means the 8 core Ivy Bridge Xeon you bought for 20 bucks is *not* fast enough for this task.

The problem, however, is that doing so would leave close to 9% of the user base out of support, according to our telemetry. 
That many users is a considerable number, so we've decided to wait until more users adopt more modern CPUs before implementing this change.
We’ll re-evaluate enforcing x86-64-v3 in the future once OpenGL eventually ends up on the chopping block as well.

While this change would also apply for Windows, MSVC is not flexible enough to let us build for x86-64-v2, it either supports SSE2, or jumps straight to the first AVX.
Dynarmic already manually uses x86-64-v2 extensions, so any CPU lacking SSE4.2 is considered unstable regardless of the OS in use.

x86-64-v4 will not be an option for many years, mainly because Intel can’t decide if AVX-512, made by themselves, is something that their users should be allowed to actually use.

If an old-school user is so strongly set on running yuzu on decades old CPUs, the Flatpak builds are still generic, or there’s always the option of building yuzu manually, allowing you to configure any requirements.

## New Joy-Con driver and other input improvements

[german77](https://github.com/german77) has done it again, giving us an amazing Christmas gift, a {{< gh-hovercard "9492" "new input driver for Nintendo controllers!" >}}
This is an in-house development that doesn’t rely on SDL, so it gives us much more freedom to add features that weren’t previously available.

The basics are covered. Single and Dual Joy-Con modes are available, Pro Controllers are supported, button, stick, motion mapping works the same as before.
But that's not exciting, here’s all the new stuff that was added:

* When launching yuzu, the controller player LEDs will show a blinking pattern to signal that the emulator has taken control. Once you’re in game, the LEDs will reflect the player number.
* HD Rumble is fully implemented now, complete parity to pairing natively.
* The emulator can now automatically select between automatic and custom calibration profiles, avoiding stick drift (as much as the Joy-Con can physically do, we can’t fix Nintendo’s problems) and providing much more accurate motion.
* Colour reading is added, now the actual colour of the controller is reflected in the UI and in games, just like on Switch.
* Amiibos can now be loaded with the Joy-Con just like you do on the Switch. 
* The Ring Controller is now fully supported, no need for external programs.
* Preliminary support for the IR camera is done, games like `Night Vision`, `Game Builder Garage`, and `Nintendo Labo` can make use of this neat feature at the base of the right Joy-Con.

All this extra accuracy highlights a problem we didn’t often face before: PC Bluetooth connections are very easy to saturate. Cheaper/Intel bluetooth chipsets or areas with tons of interference are especially prone to this.
For this reason, HD Rumble can potentially cause lag depending on the user’s specific circumstances. We recommend unmapping/disabling rumble in those cases.

Speaking of saturation, the IR camera may be slow in some games. The reason being that we currently implement only the image transfer mode, which saves 320x240 pictures. Some games prefer faster framerates at the cost of resolution, going as low as 40x30. 
Once all modes are added in, the choppy framerate will disappear.

Amiibo data writing is a work in progress.

german77's desire for incredible input improvements doesn't end there.

german77 implemented the {{< gh-hovercard "9369" "`mifare` service," >}} allowing games read and write plain mifare tags.
Games like `Skylanders Imaginators` make use of this feature.
The only feature lacking is support for encrypted read and writes.

{{< imgs
	"./sky.png| Tagging! (Skylanders Imaginators)"
  >}}

Speaking of SDL, a recent update broke the way it handled the GUID, the identifier of several controllers, including the one integrated into the Steam Deck, causing many annoyances for Deck users.
So, with no alternative on hand, german77 had to implement a {{< gh-hovercard "9404" "custom filter" >}} to solve the issue.

And lastly, as a very important quality of life change, german77 made the {{< gh-hovercard "9495" "input device list refresh automatically," >}} ensuring that yuzu detects controllers without the need for manual intervention. 
Goodbye tiny refresh button!

To close the section, [MonsterDruide1](https://github.com/MonsterDruide1) {{< gh-hovercard "9489" "increased the accuracy of analog sticks" >}} for TAS by hardcoding the range and deadzones of the user input.

## Kernel, building, and core changes

With an update for Dynarmic and SDL2, byte[] enabled {{< gh-hovercard "9374" "support for ARM64" >}} compilation.
This means all Switch titles can be tested on Linux ARM64 devices with compatible Vulkan drivers.

As part of this effort, we started implementing Flatpak support for ARM64 Linux devices. This {{< gh-hovercard "9419" "required making OpenGL optional" >}} for the build process, as Flatpak’s Qt build only supports OpenGL ES, not the full fledged OpenGL 4.6 compatibility profile we require.

Part of these changes fixed compilation for macOS, but the situation remains the same, without `MoltenVK` support, nothing will be rendered.

Epicboy implemented a series of changes with the goal of minimizing the overhead of dynamic memory allocation, a task which involves requesting memory from the operating system, and can slow-down performance in some circumstances.

The texture cache, in particular, was a significant contributor to this issue, as it constantly allocated and then deallocated memory when transferring textures to and from the GPU.
To address this problem, Epicboy optimized the texture cache to {{< gh-hovercard "9490" "pre-allocate a buffer to store swizzle data" >}} and reuse it whenever possible, rather than performing a dynamic memory allocation every time this was done.
This change should result in reduced stuttering, as memory will now only be requested from the operating system if the buffer is not large enough to hold the data.

Epicboy also made similar changes to {{< gh-hovercard "9508" "optimise the `ReadBuffer` function" >}}, which likewise takes a similar approach: instead of allocating and deallocating memory, a buffer is created once to hold data in the memory, and it only reallocates whenever it needs to grow.

Additionally, he introduced a {{< gh-hovercard "9453" "`ScratchBuffer` class" >}} to act as a wrapper around a heap-allocated buffer of memory.

The advantage of this class lies with the fact that it eliminates the need to initialize the stored values, and the need to copy the data when the buffer needs to grow.
Thus, it would help to speed up things by minimizing the amount of time spent on memory management tasks.

german77 implemented {{< gh-hovercard "9444" "the `FreeThreadCount` info type," >}} which is needed by titles such as `Just Dance 2023 Edition` (although that game requires additional changes in order to work).

[Saalvage](https://github.com/Saalvage) noticed an error in yuzu's kernel implementation and made the necessary changes to {{< gh-hovercard "9411" "unlock thread mutex before destruction," >}} as not doing so incurs an undefined behaviour. “Here be Dragons” and all that.

byte[] submitted a change that {{< gh-hovercard "9398" "improves the handling of system startup failure," >}} in order to prevent deadlocks and crashes when/if the GPU initialization fails.

He also {{< gh-hovercard "9474" "added `KHardwareTimer`." >}}
This component is designed to fix an issue with incorrect event unregistration when threads request a timeout for certain operations.

Without the fix, the threads would return successfully from the operation but fail to cancel the timeout, which would cause the timer to mistakenly fire on the thread and cancel a random unrelated operation.

This change fixes the random hangs that have been plaguing us for months in `The Legend of Zelda: Breath of the Wild`, as well as `Persona 5 Royal`.

{{< imgs
	"./p5.png| The soundtrack that steals your heart (Persona 5 Royal)"
  >}}

byte[] also introduced a {{< gh-hovercard "9496" "workaround for crashes caused due to unallocated memory" >}} after noticing that yuzu always used memory blocks without marking them as allocated, causing it to overlap memory used by the game.
He fixed the bug by making sure we now allocate the memory before using it.
This is meant to alleviate the situation while other parts of the kernel are being ironed out.

This is more related to error handling, but counts nonetheless.
byte[] added an option to {{< gh-hovercard "9370" "force the emulator to break when an invalid memory access happens." >}}
This means that if/when a game explodes in the background, the emulator will crash instead of slowly eating all the available system RAM.
Problems like these can be caused by emulation issues, damaged game dumps, or even some wonky mods, so it’s always a better option to avoid  crashing the entire emulator, and if the user has little enough RAM, making the OS suffer.

Along with endless silent changes that don’t get mentioned here, [lioncash](https://github.com/lioncash) made some changes to the input code to {{< gh-hovercard "9389" "reduce memory use ever so slightly." >}}

## User interface and audio changes

We've had some interesting user interface quality of life changes implemented!
lioncash made the {{< gh-hovercard "9394" "SPIR-V shader backend element translatable," >}} so it doesn’t always show in English for everyone.
The community effort working on translation can now take the label and update it accordingly.

{{< imgs
	"./spirv.png| We still don’t recommend using it over GLSL, but Mesa users report they enjoy it"
  >}}

Some months ago, with the core timing changes, we allowed users to boot games with their framerate unlocked after continuous requests from the community.
As it turns out, nothing changed. Several games hate booting with unlocked framerates, and the support channels get their fair share of people asking why their game doesn’t want to boot.
So, simple fix, {{< gh-hovercard "9425" "unlocked framerate at boot rights denied." >}}
The hotkey to toggle unlocked framerate is `Ctrl + U` by default, only a small nuisance.

Users reported that they couldn’t record or stream their yuzu window while in windowed mode.
byte[] found the cause was setting the `WA_DontCreateNativeAncestors` Qt property for all platforms, instead of just for wayland.
{{< gh-hovercard "9461" "Issue down, streamers rejoice." >}}

Discord user piplup reported that yuzu didn’t save the device name (what you would call the console) after accessing a game’s custom configuration window.
german77 {{< gh-hovercard "9466" "fixed the issue" >}} (this particular setting lacked a custom configuration equivalent), and also fixed Qt 6 build issues while at it.

Another very nice quality of life improvement made by german77 is making yuzu {{< gh-hovercard "9467" "remember the last selected directory" >}} for `Install files to NAND…`.
If you keep your dumps in the same folder, updating your games is going to take fewer clicks now.

byte[] managed an amazing victory in the war against crashes when closing/stopping games. He worked on {{< gh-hovercard "9476" "making shutdown not visibly freeze yuzu," >}} avoiding crashing the emulator while the game quits, and showing a nice pop-up message while at it too!

{{< imgs
	"./shutdown.png| We take longer than the Switch, but some games really love to take their time on console"
  >}}

[Morph](https://github.com/Morph1984) helped make this possible by {{< gh-hovercard "9477" "hiding button dialog boxes," >}} allowing for the creation of the dialog overlay byte[] added.

Another battle fought on this front is related to homebrew apps. byte[] is responsible for {{< gh-hovercard "9486" "making them quit properly" >}} now too.

[ChrisOboe](https://github.com/ChrisOboe) suddenly shows up with a glorious quality of life fix for the terminal-based yuzu-cmd build.
Marking the build as a “Windows” application instead of a “Console” one {{< gh-hovercard "9485" "ensures that no empty command line window pops up" >}} needlessly.
This can help streaming programs set up to run specific games with yuzu-cmd, as this prevents the sudden empty black box from appearing in front of other windows.

For our single audio change of this month, [Maide](https://github.com/Kelebek1) properly {{< gh-hovercard "9455" "signals a buffer event on audio stops," >}} fixing an early softlock that affected the `Pokémon Brilliant Diamond/Shining Pearl` games.

## Future projects

We’re only a few days into 2023 and we already want to publish the next progress report. So much has happened in such a short time!

Also, Blinkhaw, bunnei, and byte[] are up to something, and we can’t wait to tell you more.
And yes, there will be yet more cache invalidations. All in the name of progress.

That’s all folks! Expect a few but *very* critical Vulkan improvements next time, hope to see you then!

⭐⭐⭐
Grande Messi

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
