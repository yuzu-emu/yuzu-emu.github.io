+++
date = "2021-03-08T12:00:00-03:00"
title = "Progress Report February 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++ 

Welcome back yuz-ers, welcome to ~~City 17~~ Febraury’s progress report! This time we will talk about Vulkan performance improvements, audio changes, how to make good use of compute shaders, new input additions, and more kernel rewrites.

<!--more-->

## New minimum requirements

Thanks to Linux’s mesa drivers progress, we recently modified our minimum graphics requirements.

[yuzu now requires OpenGL 4.6](https://github.com/yuzu-emu/yuzu/pull/5888), any compatible hardware achieves this with its latest GPU drivers installed. Even old Fermi or GCN1.0 series products.
Laptop users, like desktop users, should visit the GPU’s manufacturer site ([AMD](https://www.amd.com/en/support), [Intel](https://downloadcenter.intel.com/product/80939/Graphics), [Nvidia](https://www.nvidia.com/en-us/geforce/drivers/) instead of the vendor’s site of the laptop (HP, Lenovo, Asus, etc.), as it will provide compatible and much more updated drivers. Thanks [Morph](https://github.com/Morph1984) for the change!

On the flip side, we still keep our requirement of Vulkan 1.1, but as stated in previous articles, [Rodrigo](https://github.com/ReinUsesLisp) made `VK_EXT_robustness2` [a hard requirement now.](https://github.com/yuzu-emu/yuzu/pull/5917)
This means that updated drivers are critical now, as lacking this extension will stop yuzu from booting games while on Vulkan.
AMD users still require to install the latest `Optional` driver version to get support for robustness2. At the time of writing, the latest version is 21.2.3, but yuzu will work with drivers as old as 20.12.1.

Multi GPU systems must have all their drivers updated, even for integrated graphics that are operative but not in use.

## Technical ~~suffering~~ bugfixes

[Merry](https://github.com/MerryMage) recently catched a bug in the implementation of yuzu's `SPSC` ring buffer, and fixed it by [removing the granularity template argument](https://github.com/yuzu-emu/yuzu/pull/5885).
What does this mean?

A buffer is a data structure that reserves space of memory as slots to store information temporarily (for example, an audio buffer).
In particular, a [ring buffer](https://en.wikipedia.org/wiki/Circular_buffer) is a special type of buffer where the slot next to the final one is the first slot in the buffer (so the start and the end are connected).
Once it's full, no new data is added until some information has been extracted from the buffer and processed.

`SPSC` stands for "Single-Producer-Single-Consumer", and it's a model that comes from to the [Producer-Consumer problem](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem) proposed by computer scientists to deal with the problem of proper synchronization when various simultaneous processes write and read from the same buffer.
In this case, one thread will generate data into the buffer (the producer), while the other will take the data from it (the consumer).

It's possible to choose a minimal size for each "slot" of the buffer, in order to exploit regularities of the information stored.
The entities inside these slots are then considered a single "unit" of information, an *information granule*, from which the term "granularity" stems from.
The ring buffer implementation in yuzu was meant to be as general as possible, which is why granularity was a parameter that the programmer could modify to fit their needs.
Merry noticed there was a small bug when pushing data into the buffer with a granularity different from `1`, but since there is no use case for a granularity different from `1` in yuzu, Merry decided to remove the parameter altogether, in favour of simplifying the codebase.

[bunnei](https://github.com/bunnei) has been taking a look at the at the timing code and [fixed a integer overflow in the wall-clock](https://github.com/yuzu-emu/yuzu/pull/5964) - a tool used to measure the passage of time in the emulator.
Previously, these calculations would use 128-bit math for high precision, which can be quite expensive on the processor, so a few optimizations were done to perform 64-bit math instead.
However, there was a bug introduced with these optimizations, and the timing math would result in an integer overflow.
This PR fixed the bug by preventing the wall-clock from overflowing, and now things are back to working as intended.

bunnei also continues on his campaign to rewrite the kernel and its codebase. This time, he has been tidying up the [memory management code](https://github.com/yuzu-emu/yuzu/pull/5953) and refactoring the implementation to be closer to the latest firmware up to date, in order to make it easier to import code from newer firmware easier.

Going along with kernel work, he also changed the implementation of [fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)) to [use unique_ptr instead of shared_ptr](https://github.com/yuzu-emu/yuzu/pull/6006).
Fibers are similar to threads, except they can't be executed in parallel.
Instead, they *yield* control to other fibers in a process.
In yuzu, they're used to have better control over thread scheduling, working as tools for the kernel to quickly pause and resume emulated guest threads from within the application, without having to rely on the OS scheduler.

Previously, fibers were managed through a special object called `shared pointer`, a kind of variable that holds as value the memory of address of other objects - it “references” them.
In particular, this variable keeps track of how many references to an object exist in the program, and the memory won't be freed until the total amount of references is zero (i.e. when the object isn't being used anymore).
If these references aren't managed with proper care, there could always remain some pointers holding memory and never freeing it, resulting in memory leaks.
For this reason, bunnei changed the implementation to use a different kind of object, a `unique pointer`, which is similar to the `shared pointer` but it doesn't allow the existence of more than one reference to the object, solving the problem of loose references causing memory leaks.

One of the many tasks of the kernel is to assign resources to processes whenever they ask for them.
For this reason, [epicboy](https://github.com/ameerj) started the work necessary to [utilize a more accurate resource_limit implementation](https://github.com/yuzu-emu/yuzu/pull/5877), in order to match the hardware behaviour more closely.

Be it memory, threads, or ports, the kernel checks for their availability and keeps track of them through a variable called `resource limit`.
By comparing the current amount of resources being used against the resource limit, the kernel can determine whether to deny a request or not.
This stems from the fact that resources are finite, especially in a small hardware such as the Nintendo Switch.
A PC, on the other hand, isn't as restricted as a Nintendo Switch.
Until now, whenever a process requested resources, yuzu would create its own instance of `resource limit` instead of using a system-wide variable to keep track of it.
This PR is just the initial step in preparation to reverse engineer the correct behaviour and implement it on the emulator.

## Paint me like one of your french bits

[epicboy](https://github.com/ameerj) has also been busy this month implementing two features through [compute kernels](https://en.wikipedia.org/wiki/Compute_kernel), a special kind of program that is written to run in the GPU instead of the CPU.
Originally, these subroutines were used to calculate light levels, darkness, colours, and other properties to render 3D images on the screen.
Thus, these programs were promptly named as [shaders](https://en.wikipedia.org/wiki/Shader).

Modern GPUs are designed to break down their workload into smaller sized problems, which in turn are processed simultaneously in the many computing units of the card (entities akin to cores in a CPU).
The reason for this design choice is simply because parallelisation is a very efficient scheme to process computer graphics, since a single instruction is capable of operating over many components of data at the same time (like the vertices and textures of a 3D scene), increasing the throughput of information (especially when compared against the performance of performing the same operations in a CPU).
But their potential isn't limited to just these functions.
It is possible to write programs that won't necessarily operate over graphics, yet still benefit from these characteristics.
This is known as `GPGPU` - [General-purpose computing on graphics processing units](https://en.wikipedia.org/wiki/General-purpose_computing_on_graphics_processing_units) - and it's intended to be used when there is a problem that can be separate into a number of parallel tasks in order to be processed more efficiently - also known as `embarrassingly parallel` problems.

One of such cases was the [use of compute shaders to decode ATSC textures](https://github.com/yuzu-emu/yuzu/pull/5927).
`ATSC` stands for "Adaptable Scalable Texture Compression", and it's a fairly new image compression format mainly aimed at mobile devices.
The Nintendo Switch is capable of decoding these textures natively in hardware, but it's a feature that most PC GPUs vendors lack in their products, with the exception of Intel Graphics, being the only vendor that offers native support.
The decoding of these textures is therefore a non-trivial task that can have a huge impact on performance, as seen in games such as `Astral Chain` and `Luigi's Mansion 3`.

astral chain vid

This led to the implementation of an `ATSC` decoder through the processor, which was faster than what GPUs could do with their lack of support, but was still far from being a satisfactory solution since it consumed CPU resources and consequently slowed down games that made extensive use of this format.
The solution, thus, was to implement the decoding through compute shaders.
Since this is an embarrassingly parallel process, it's more fit to be performed on the GPU by manipulating the data through `GPGPU`.
This way, the load on the CPU will be shifted to the GPU, allowing emulation to run in parallel with the texture decoding.
As a side benefit, now textures remain in the GPU memory all the time, since they don't need to be transferred between CPU and GPU for decoding.
This means that there won't be time spent downloading the texture to CPU and then uploading it back to the GPU after the decoding is done, like in the old implementation.

bgr picset 1

Since compute programs were originally meant to manipulate image data, they also worked out nicely to fix a problem with one of the rendering APIs used in yuzu, by [using compute shaders to swizzle BGR textures on copy](https://github.com/yuzu-emu/yuzu/pull/5891).
In OpenGL, colours are stored in channels, and the way they are laid out varies depending on the format used.
For example, the `RGB` format stores the color channels in the order "Red, Green and Blue", while the `BGR` format stores the channels in the order "Blue, Green and Red".
Unfortunately, this latter format isn't supported internally in OpenGL, which caused problems with a number of games that made use of `BGR` textures: their Red and Blue channels were swapped and the final images looked blue-ish.

bgr picset 2

The solution to this problem then was to reorder the Blue and Red channels in the copy uploaded into the GPU.
Reordering the graphical information of an image to process it in the graphic card is called swizzling, so what this PR does is to copy the values of the Red channel into the Blue channel and vice-versa, a process that can be exploited through parallel computation.
This way, the problem with OpenGL is directly bypassed on the GPU, and games can render as they should on the screen.

This feature works as intended on all GPU vendors on Windows, although there are a few problems on Linux that still need to be ironed out.
Our devs are working hard to solve these, so we ask our tuxfriends to be patient and stay tuned!

## General bug fixes and improvements

`Pokémon Sword and Shield` players can enjoy one less reason to crash the game. 
Boss [bunnei](https://github.com/bunnei) [fixed LDN initialization,](https://github.com/yuzu-emu/yuzu/pull/5920) eliminating the crash that occurred if the player pressed `Y` during gameplay, activating online services that yuzu lacks by mistake.
An error window will still pop up, but emulation will continue.

Another `Animal Crossing: New Horizons` update, another service to stub or implement to regain playability.
This time, [stubbing GetSaveDataBackupSetting](https://github.com/yuzu-emu/yuzu/pull/5892) made 1.7.0 and later versions playable again.
Thanks [german77!](https://github.com/german77)

Under certain conditions, the `WebApplet` would crash yuzu when opening, for example, the Action Guide in `Super Mario Odyssey`. [aleasto](https://github.com/aleasto) managed to solve this by [fixing an out of bounds read.](https://github.com/yuzu-emu/yuzu/pull/5878) 

A common annoyance that affected new users was asking for placing the derivation keys in the correct `keys` folder, a folder that had to be manually created until now. 
Thanks to [Morph,](https://github.com/Morph1984) now there is an empty `keys` folder created by default as part of the installation process of yuzu, ready to be populated by the user’s own Switch’s keys.

## Graphics improvements

[Maide](https://github.com/Kelebek1) has been working on improving the recently released `Disgaea 6: Defiance of Destiny`. 

First, Vulkan needed some [corrected offsets](https://github.com/yuzu-emu/yuzu/pull/5936) for `TexelFetch` and `TextureGather`, types of texture instructions.

A similar change [was needed for OpenGL.](https://github.com/yuzu-emu/yuzu/pull/5980) this work also includes better handling of `signed atomics`, improving precision. Thanks to [Ryujinx](https://github.com/Ryujinx/Ryujinx) for helping here.

Finally, [implementing glDepthRangeIndexeddNV](https://github.com/yuzu-emu/yuzu/pull/5997) solves out of range issues in the depth buffer.

{{< single-title-imgs
    "Disgaea 6: Defiance of Destiny"
    "./d6bug.mp4"
    "./d6fix.mp4"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) [fixed a bug in Vulkan’s stream buffer,](https://github.com/yuzu-emu/yuzu/pull/5919) improving performance and reducing VRAM use, while also making better use of the dedicated VRAM, instead of falling back to shared VRAM, better known as just system RAM.

By [using dirty flags](https://github.com/yuzu-emu/yuzu/pull/5923), [Rodrigo](https://github.com/ReinUsesLisp) also managed another slim but measurable Vulkan performance bump. Reducing draw calls always helps!

After a lot of time of experimentation, [Rodrigo](https://github.com/ReinUsesLisp) [reduced the size of Vulkan’s command pool](https://github.com/yuzu-emu/yuzu/pull/5989), from 4096 to just 4.
This makes the driver assign less memory for command buffers, saving a considerable amount of system RAM.

For example, in `Pokèmon Sword/Shield`, Vulkan’s use of system RAM goes from 707MB, to just 2MB.

To end the day, [Rodrigo](https://github.com/ReinUsesLisp) fixed a regression introduced by the `Buffer Cache Rewrite`. Some games benefit from skipping the cache, but others lose performance. For example `Animal Crossing: New Horizons` was severely affected in Vulkan.
By [implementing a way to heuristically decide when to skip the cache,](https://github.com/yuzu-emu/yuzu/pull/6021) performance was not only restored, but also increased.

## Input improvements

First and foremost, [german77](https://github.com/german77) finished implementing [native Gamecube controller support!](https://github.com/yuzu-emu/yuzu/pull/4940) 
With this change games will now detect GC controllers as such, instead of emulated Pro Controllers, for example.
Planned for the future is support for analog triggers, right now they are mapped as buttons, but they will be handled correctly in coming changes.

[Morph](https://github.com/Morph1984) later added [vibration support for the GC controller.](https://github.com/yuzu-emu/yuzu/pull/5944)

Another new feature [german77](https://github.com/german77) added is [mouse panning.](https://github.com/yuzu-emu/yuzu/pull/5869)
This allows to set the mouse as an analog stick, allowing very comfortable gameplay on games that for example use the right analog stick as camera control.
By default, pressing Ctrl +  F9 toggles this feature.

{{< imgs
	"./panning.mp4| Keyobard warriors rejoyce! (The Legend of Zelda: Breath of the Wild)"
  >}}

A [separate PR](https://github.com/yuzu-emu/yuzu/pull/5929) improves panning functionality even more, giving it a more natural control.

[Morph](https://github.com/Morph1984) [implemented the Finalize request](https://github.com/yuzu-emu/yuzu/pull/5908) on the inline keyboard emulation, allowing it to exit in a stable, graceful way instead of looping indefinitely. 
This solves issues experienced in `Super Mario 3D World + Bowser’s Fury`.

[Jatoxo](https://github.com/Jatoxo) gives us a feature we didn’t know we wanted. [Added depth to the analog sticks](https://github.com/yuzu-emu/yuzu/pull/5894) of the Pro Controller in the controls preview.
See the result for yourself!

{{< single-title-imgs
    "Nothing beats quality of life changes like this"
    "./stickold.mp4"
    "./sticknew.mp4"
  >}}

## Audio achievements

One of our most requested fixes is finally here! 
`Fire Emblem: Three Houses` no longer echoes voices!
[ogniK](https://github.com/ogniK5377) is responsible for this fix, which properly [implemented I3dl2Reverb.](https://github.com/yuzu-emu/yuzu/pull/5909)

If you paused emulation and some time later resumed it, you would experience severe stuttering until the audio catched up to the rendering.
[german77](https://github.com/german77) solved this pleasant experience by [preventing overscheduling audio events,](https://github.com/yuzu-emu/yuzu/pull/5868) allowing for a seamless experience after resuming emulation.

## Future projects

Project Kraken is underway. Project Gaia started. Project Hades, the shader decompiler rewrite is progressing steadily, if it continues like this, it will be released before Memory Reaper. As you’ve seen in this article, bunnei continues to suffer with Kernel changes.

That’s all folks! As always, thank you for reading until the end, and see you next time!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
