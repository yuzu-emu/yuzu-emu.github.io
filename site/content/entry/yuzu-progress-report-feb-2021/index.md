+++
date = "2021-03-10T12:00:00-03:00"
title = "Progress Report February 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 375270
+++ 

Welcome back yuz-ers, welcome to ~~City 17~~ February’s progress report! This time we will talk about Vulkan performance improvements, audio changes, how to make good use of compute shaders, new input additions, and more kernel rewrites.

<!--more-->

## New minimum requirements

Thanks to progress in Linux’s mesa drivers, we've recently modified our minimum graphics requirements.

[yuzu now requires OpenGL 4.6](https://github.com/yuzu-emu/yuzu/pull/5888). However, any previously compatible hardware reaches this requirement with its latest GPU drivers installed, even old Fermi or GCN 1.0 series products.
Laptop users, like desktop users, should visit the GPU manufacturer's site ([AMD](https://www.amd.com/en/support), [Intel](https://downloadcenter.intel.com/product/80939/Graphics), and [Nvidia](https://www.nvidia.com/en-us/geforce/drivers/)) instead of the laptop vendor’s site (HP, Lenovo, Asus, etc.), as it will provide compatible and up-to-date drivers. 
Thanks [Morph](https://github.com/Morph1984) for the change!

On the flip side, while the requirement of Vulkan 1.1 hasn't changed, as stated in previous articles, [Rodrigo](https://github.com/ReinUsesLisp) made `VK_EXT_robustness2` [a hard requirement.](https://github.com/yuzu-emu/yuzu/pull/5917)
This means that updated drivers are critical now, as lacking this extension will stop yuzu from booting games while on Vulkan.
AMD users still require to install the latest `Optional` driver version to get support for `VK_EXT_robustness2`. At the time of writing, the latest version is `21.2.3`, but yuzu will work with drivers as old as `20.12.1`.

Multi-GPU systems must have all their drivers updated, even for integrated graphics that are functional but not in use.

## Technical bugfixes

[Merry](https://github.com/MerryMage) recently caught a bug in the implementation of yuzu's `SPSC` ring buffer and fixed it by [removing the granularity template argument](https://github.com/yuzu-emu/yuzu/pull/5885).
What does this mean exactly? Let's explain!

A buffer is a data structure that reserves space in memory as slots to store information temporarily: for example, an audio buffer.
In particular, a [ring buffer](https://en.wikipedia.org/wiki/Circular_buffer) is a special type of buffer where the slot next to the final one is the first slot in the buffer (so the start and the end are connected).
Once it's full, no new data is added until some information has been extracted from the buffer and processed.

`SPSC` stands for "Single-Producer/Single-Consumer," and is a model that comes from the [Producer-Consumer problem](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem) proposed by computer scientists to deal with the problem of proper synchronization when various simultaneous processes write and read from the same buffer.
In this case, only one thread at a time can insert data into the buffer (the Single-Producer), and only one thread at a time can remove elements from the buffer (the Single-Consumer).

It's possible to choose a minimal size for each "slot" of the buffer in order to exploit regularities of the information stored.
The entities inside these slots are then considered a single "unit" of information, an *information granule*, from which the term "granularity" stems from.
The ring buffer implementation in yuzu was meant to be as general as possible, which is why granularity was a parameter that the programmer could modify to fit their needs.
Merry noticed there was a small bug when pushing data into the buffer with a granularity different from `1`, but since there is no use case for a granularity different from `1` in yuzu, Merry decided to remove the parameter altogether, in favor of simplifying the codebase.

[bunnei](https://github.com/bunnei) has been taking a look at the timing code and [fixed an integer overflow in the wall-clock](https://github.com/yuzu-emu/yuzu/pull/5964) - a tool used to measure the passage of time in the emulator.
Previously, these calculations would use 128-bit math for high precision, which can be quite expensive on the processor, so a few optimizations were done to perform 64-bit math instead.
However, there was a bug introduced with these optimizations, and the timing math would result in an integer overflow.
This PR fixed the bug by preventing the wall-clock from overflowing, and now things are back to working as intended.

bunnei also continues on his campaign to rewrite the kernel and its codebase. This time, he has been tidying up the [memory management code](https://github.com/yuzu-emu/yuzu/pull/5953) and refactoring the implementation to be closer to the latest Switch firmware in order to make it easier to import code from newer firmware.

Additionally, he changed the implementation of [fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)) to [use unique_ptr instead of shared_ptr](https://github.com/yuzu-emu/yuzu/pull/6006), but later [changed it again to use weak_ptr](https://github.com/yuzu-emu/yuzu/pull/6041) as it's more appropriate in this use case.

Fibers are similar to threads, except they can't be executed in parallel.
Instead, they *yield* control to other fibers in a process.
In yuzu, they're used to have better control over thread scheduling, working as tools for the kernel to quickly pause and resume emulated guest threads from within the application, without having to rely on the OS scheduler.

Previously, fibers were managed through a special object called a `shared pointer`, a kind of variable that stores the memory addresses of other objects - it “references” them.
In particular, this variable keeps track of how many `shared_ptr` references to an object exist in the program, and the memory won't be freed until the total amount of references is zero (i.e. when the object isn't being used anymore).
If these references aren't managed with proper care, some pointers may retain memory and never free it, resulting in memory leaks.
For this reason, bunnei changed the implementation to use a different kind of object, a `weak pointer`, which is similar to the `shared pointer` but it doesn't increase the reference counter, nor is it capable of deleting the original referenced object.
Thus, the referenced memory will be free only when the original pointer is deleted, regardless of how many other `weak_ptr` references to the same memory exist, eliminating the memory leaks caused by the old implementation.

One of the many tasks of the kernel is to assign resources to processes whenever they ask for them.
For this reason, [epicboy](https://github.com/ameerj) started the work necessary to [utilize a more accurate resource_limit implementation](https://github.com/yuzu-emu/yuzu/pull/5877), in order to match the hardware behavior more closely.

Be it memory, threads, or ports, the kernel checks for their availability and keeps track of them through a variable called `resource limit`.
By comparing the current amount of resources being used against the resource limit, the kernel can determine whether to deny a request or not.
This stems from the fact that resources are finite, especially in weaker hardware such as that in the Nintendo Switch.
A PC, on the other hand, isn't as restricted as a Nintendo Switch.
Until now, whenever a process requested resources, yuzu would create its own instance of `resource limit` instead of using a system-wide variable to keep track of it.
This PR is just the initial step in preparation to reverse engineer the correct behavior and implement it in the emulator.

## Paint me like one of your french bits

[epicboy](https://github.com/ameerj) has also been busy this month implementing two features through [compute kernels](https://en.wikipedia.org/wiki/Compute_kernel), a special kind of program that is written to run in the GPU instead of the CPU.
Originally, these subroutines were used to calculate light levels, darkness, colors, and other properties to render 3D images on the screen.
Thus, these programs were promptly named as [shaders](https://en.wikipedia.org/wiki/Shader).

Modern GPUs are designed to break down their workload into smaller sized problems, which in turn are processed simultaneously in the many compute units of the card (entities akin to cores in a CPU).
The reason for this design choice is simply because parallelisation is a very efficient scheme to process computer graphics. A single instruction is capable of operating over many components of data at the same time, such as the vertices and textures of a 3D scene, and produce separate results for each parallel thread of execution, which is generally a pixel. This increases the throughput of information, especially when compared against the performance of running the same operations on a CPU.
Their potential isn't limited to just these functions though.
It is possible to write programs that won't necessarily operate over graphics, but can still take advantage of the high levels of parallelisation provided by GPUs.
This is known as `GPGPU` - [General-purpose computing on graphics processing units](https://en.wikipedia.org/wiki/General-purpose_computing_on_graphics_processing_units) - and it's intended to be used when there is a problem that can be separated into a number of parallel tasks in order to be processed more efficiently. These problems are commonly called `embarrassingly parallel problems`.

One of these cases was the [use of compute shaders to decode ASTC textures](https://github.com/yuzu-emu/yuzu/pull/5927).
`ASTC` stands for "Adaptable Scalable Texture Compression," and it's a fairly new image compression format developed by ARM and AMD mainly aimed at mobile devices.
The Nintendo Switch is capable of decoding these textures natively in hardware, but it's a feature that most PC GPU vendors lack in their products (with the exception of Intel Graphics, being the only vendor that offers native support).
The decoding of these textures is therefore a non-trivial task that can have a huge impact on performance. Two notable examples are `Astral Chain` and `Luigi's Mansion 3`, since both games make extensive use of this format, but it can also be observed to varying degrees in other titles, where these textures are generally used in menu icons, minimaps, etc.

{{< imgs
	"./astral_chain_atsc.mp4| Comparison between the old and the new implementation of the ASTC decoder"
  >}}

This led to the implementation of an `ASTC` decoder through the CPU, which was faster than what GPUs could do with their lack of native support. The CPU decoder was still far from being a satisfactory solution, since it consumed precious CPU resources and, consequently, slowed down to a halt when running games that made extensive use of this format.
The solution, thus, was to implement the decoding through compute shaders.
Since this is an embarrassingly parallel process, seeing as how every block of pixels can be decoded independently, it's more fit to be performed on the GPU by manipulating the data through `GPGPU`.
This way, the load on the CPU will be shifted to the GPU, allowing emulation to run in parallel with the texture decoding.
As a side benefit, now textures remain in the GPU memory all the time, since they don't need to be transferred between CPU and GPU for decoding.
This means that there won't be time spent downloading the texture to the CPU and then uploading it back to the GPU after the decoding is done, like in the old implementation.

This feature works as intended on all GPU vendors on Windows, although there are a few problems on Linux (more specifically, the `AMDGPU-PRO` driver) that still need to be ironed out.
Our devs are working hard to solve these bugs, so we ask our tux-friends to be patient and stay tuned!

Since compute programs were originally meant to manipulate image data, they also worked out nicely to fix a problem with one of the rendering APIs used in yuzu: by [using compute shaders to swizzle BGR textures on copy](https://github.com/yuzu-emu/yuzu/pull/5891).

{{< single-title-imgs
    "Color-swapped and properly swizzled versions of Octopath Traveler's title screen"
    "./octopath1.jpg"
    "./octopath2.jpg"
  >}}

In OpenGL, colors are stored in channels, and the way they are laid out varies depending on the format used.
For example, the `RGB` format stores the color channels in the order "Red, Green, and Blue," while the `BGR` format stores the channels in the order "Blue, Green, and Red."
Unfortunately, this latter format isn't supported internally by OpenGL, which caused problems with a number of games that made use of `BGR` textures: their Red and Blue channels were swapped and the final images looked blue-ish.

{{< single-title-imgs
    "Blue Christina looks nice, but the red hue definitely suits the Nixie Tubes much better in Steins;Gate: My Darling's Embrace"
    "./sg1.jpg"
    "./sg2.jpg"
  >}}

The solution to this problem then was to reorder the Blue and Red channels of `BGR` textures in the copy uploaded to the GPU.
Reordering the graphical information of an image to process it in the graphics card is called swizzling, so what this PR does is copy the values of the Red channel into the Blue channel and vice-versa, a process that can be exploited through parallel computation.
This way, the limitation with OpenGL is directly bypassed on the GPU, and these textures are rendered as intended on screen.

## General bug fixes and improvements

`Pokémon Sword and Shield` players can enjoy one less frequent crash. 
Boss [bunnei](https://github.com/bunnei) [fixed a problem on LDN initialization](https://github.com/yuzu-emu/yuzu/pull/5920), eliminating the crash that occurred if the player pressed `Y` during gameplay (activating online services that yuzu lacks).
An error window will still pop up, but emulation will continue.

Yet another `Animal Crossing: New Horizons` update, yet another service to stub or implement to regain playability.
This time, [stubbing GetSaveDataBackupSetting](https://github.com/yuzu-emu/yuzu/pull/5892) made `1.7.0` and later versions playable again.
Thanks [german77](https://github.com/german77)!

Under certain conditions, the `WebApplet` would crash yuzu when opening, for example, the Action Guide in `Super Mario Odyssey`. 
[aleasto](https://github.com/aleasto) managed to solve this by [fixing an out of bounds read.](https://github.com/yuzu-emu/yuzu/pull/5878) 

A common annoyance that affected new users was a prompt asking for the derivation keys to be placed in the correct `keys` folder, a folder which had to be manually created until now. 
Thanks to [Morph](https://github.com/Morph1984), now there is an empty `keys` folder created by default as part of the installation process of yuzu, ready to be populated by the user’s own Switch keys.

## Graphics improvements

[Maide](https://github.com/Kelebek1) has been working on improving the recently released `Disgaea 6: Defiance of Destiny`. 

First, Vulkan needed some [corrected offsets](https://github.com/yuzu-emu/yuzu/pull/5936) for `TexelFetch` and `TextureGather`, types of texture instructions.

A similar change [was needed for OpenGL.](https://github.com/yuzu-emu/yuzu/pull/5980) This code also includes better handling of `signed atomics`, improving precision. 
Thanks to [Ryujinx](https://github.com/Ryujinx/Ryujinx) for helping here.

Finally, [implementing glDepthRangeIndexedNV](https://github.com/yuzu-emu/yuzu/pull/5997) solves out of range issues in the depth buffer.

{{< single-title-imgs
    "The result of Maide's work (Disgaea 6: Defiance of Destiny)"
    "./d6bug.mp4"
    "./d6fix.mp4"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) [fixed a bug in Vulkan’s stream buffer](https://github.com/yuzu-emu/yuzu/pull/5919), improving performance and reducing VRAM use, while also making better use of the dedicated VRAM, instead of falling back to shared VRAM, which is better known as just system RAM.

By [using dirty flags](https://github.com/yuzu-emu/yuzu/pull/5923), [Rodrigo](https://github.com/ReinUsesLisp) also managed another slim, but measurable, Vulkan performance bump. 
Reducing draw calls always helps!

After a lot of time spent experimenting, [Rodrigo](https://github.com/ReinUsesLisp) [reduced the size of Vulkan’s command pool](https://github.com/yuzu-emu/yuzu/pull/5989), from 4096 to just 4.
This makes the driver assign less memory for command buffers, saving a considerable amount of system RAM.

For example, in `Pokémon Sword and Shield`, Vulkan’s use of system RAM goes from 707MB, to just 2MB.

To end the day, [Rodrigo](https://github.com/ReinUsesLisp) fixed a regression introduced by the `Buffer Cache Rewrite`. 
Some games benefit from skipping the cache, but others lose performance. `Animal Crossing: New Horizons` was an example severely affected in Vulkan.
By [implementing a way to heuristically decide when to skip the cache](https://github.com/yuzu-emu/yuzu/pull/6021), performance was not only restored, but also increased.

## Input improvements

First and foremost, [german77](https://github.com/german77) finished implementing [native Gamecube controller support!](https://github.com/yuzu-emu/yuzu/pull/4940) 
With this change, games will now actually register GC controllers instead of registering them as, for example, emulated Pro Controllers.
Right now Gamecube triggers are mapped as buttons, but they will be correctly handled as analog triggers in coming changes.

[Morph](https://github.com/Morph1984) later added [vibration support for the GC controller.](https://github.com/yuzu-emu/yuzu/pull/5944)

Another new feature [german77](https://github.com/german77) added is stick [mouse panning.](https://github.com/yuzu-emu/yuzu/pull/5869)
This allows users to set the mouse as an analog stick, enabling very comfortable gameplay on titles that use the right analog stick as camera control.
By default, pressing Ctrl +  F9 toggles this feature.

{{< imgs
	"./panning.mp4| Keyboard warriors rejoice! (The Legend of Zelda: Breath of the Wild)"
  >}}

A [separate PR](https://github.com/yuzu-emu/yuzu/pull/5929) improves panning functionality even more, giving it a more natural control.

[Morph](https://github.com/Morph1984) [implemented the Finalize request](https://github.com/yuzu-emu/yuzu/pull/5908) on the inline keyboard implementation, allowing it to exit in a stable and graceful way instead of looping indefinitely. 
This solves issues experienced in `Super Mario 3D World + Bowser’s Fury`.

[Jatoxo](https://github.com/Jatoxo) gives us a feature we didn’t know we wanted. 
[They've added depth to the analog sticks](https://github.com/yuzu-emu/yuzu/pull/5894) of the Pro Controller in the controls preview.
See the result for yourself!

{{< single-title-imgs
    "Nothing beats quality of life changes like this"
    "./stickold.mp4"
    "./sticknew.mp4"
  >}}

## Audio achievements

One of our most requested fixes is finally here. 
`Fire Emblem: Three Houses` no longer echoes voices!
[ogniK](https://github.com/ogniK5377) is responsible for this fix, which properly [implemented I3dl2Reverb.](https://github.com/yuzu-emu/yuzu/pull/5909)

If you paused emulation and resumed it some time later, you would experience severe stuttering until the audio caught up to the rendering.
[german77](https://github.com/german77) resolved this unpleasant experience by [preventing overscheduling audio events](https://github.com/yuzu-emu/yuzu/pull/5868), allowing for a seamless experience after resuming emulation.

## Future projects

Project Kraken is underway. Project Gaia started. Project Hades, the shader decompiler rewrite, is progressing steadily. If it continues like this, it will be released before Memory Reaper. As you’ve seen in this article, bunnei continues to suffer through implementing Kernel changes.

That’s all folks! As always, thank you for reading until the end, and see you next time!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
