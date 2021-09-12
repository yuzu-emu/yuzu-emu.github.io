+++
date = "2021-09-08T12:00:00-03:00"
title = "Progress Report August 2021"
author = "Honghoa"
coauthor = "GoldenX86"
forum = 0
+++

Welcome, yuz-ers, to our monthly report of developer perseverance and other happenings! In this recap, we'll discuss Radeon fixes, Reaper v3, LAN support, smooth video rendering, and more!

<!--more-->

## **A**nother **T**errible **I**mplementation, and other graphical fixes

This month was certainly a happy one for AMD users, as our developers managed to fix a number of graphical bugs present for those with AMD graphics cards.

[epicboy](https://github.com/ameerj) pushed a [fix for the wireframe issue](https://github.com/yuzu-emu/yuzu/pull/6900) affecting various 3D models when playing 
`Pokémon Sword and Shield` while using an AMD GPU on Windows.
Unfortunately, some games, like `Super Mario 3D World + Bowser's Fury`, have similar bugs which were not improved by this fix.
Also, do note that, in some rare cases and conditions, the issue can still occur.

{{< single-title-imgs
    "Best character (Pokémon Sword)"
    "./wirebug.png"
    "./wirefix.png"
    >}}

The cause of the problem boils down to the drivers of *a certain vendor* (AMD) not properly reading shader attributes near a `demote` or `discard` instruction.

Among the many programs that run on the GPU to render graphics, fragment shaders are in charge of calculating the colour of every pixel written into the frame-buffer that will 
be sent to your screen. In some cases, these shaders are used to perform subordinate calculations instead, such as derivatives.

This is a problem, however, as fragments shaders are *always* expected to write into the frame-buffer. When used like this, the colour data of these shader instances remains 
uninitialized, which is undefined behaviour that will most likely result in rainbow-puke graphics being sent to your screen.

This is where the `demote` and `discard` instructions come in to the rescue.
They are used to mark these fragment shaders, so that the colour of every shader instance that is demoted is ignored, keeping the thread alive to perform calculations while the 
frame-buffer remains untouched.

Whenever the driver tried to read attributes (i.e. data such as positions, normals, etc.) in the proximity of these instructions, it would misread them, causing the infamous 
graphical glitch.

Thankfully, this was fixed by simply delaying the demotion of these fragments to the end of the shader program, which has a slight impact on their performance, albeit not one big 
enough to be concerned.

Next on epicboy's list, we have a [fix that solves the brightness of sRGB graphics](https://github.com/yuzu-emu/yuzu/pull/6941) when rendering from a secondary GPU, since they 
looked much darker than they should.

{{< single-title-imgs
    "Free HDR! (Super Mario Odyssey)"
    "./presentationbug.png"
    "./presentationfix.png"
    >}}

This occurred when the rendering was performed by an AMD GPU, but the presentation of images from the [swap chain](https://en.wikipedia.org/wiki/Swap_chain) (the virtual buffers 
used by the GPU to prevent tearing and stuttering when updating your screen) was done by an Intel or Nvidia GPU.
The swap chains that were being rendered on the AMD GPU, which contained images in `sRGB` format, were being read as `Linear` on the secondary GPU, causing them to 
be presented with erroneous intensity levels.
This is because the scales used in these formats are incompatible, and their values do not automatically map to an equivalent value on their counterpart space, resulting in a 
quality degradation of the image when using the wrong format.

As a solution, the `Linear` colour space format is now preferred when presenting frames from the swap chain. 
This alleviates the wrong interpretation of the frame's format, allowing all frames to display properly in the linear colour space.

Another annoying Windows-only AMD GPU bug gone for good thanks to epicboy is [the horrible bright squares](https://github.com/yuzu-emu/yuzu/pull/6948) that would appear in the 
shading of a number of titles: most notably, `Fire Emblem: Three Houses`.

{{< single-title-imgs
    "Not so psychedelic any more (Fire Emblem: Three Houses)"
    "./fethbug.mp4"
    "./fethfix.mp4"
    >}}

The cause of this problem lies at the hardware-level differences between the GPU of the Nintendo Switch, and that of AMD cards.

In graphics programming, it's extremely common to perform the same operation over a considerable number of elements — such as vertices, pixels, etc.
GPUs were, thus, designed to operate over large amounts of data at the same time (i.e. in parallel), using instructions that exploit this principle, known as `SIMD` 
([Single Instruction, Multiple Data](https://en.wikipedia.org/wiki/SIMD)).
This method of parallel computing, combined with multi-threading, is known as `SIMT` 
([Single Instruction, Multiple Threads](https://en.wikipedia.org/wiki/Single_instruction,_multiple_threads)).

In the case of the Tegra X1 (the GPU of the Nintendo Switch), these instructions operate on bundles of 32 threads (called `workgroups`), all of which run the same code — 
although they do not necessarily operate on the same data.
The `SIMT` instructions in AMD cards post the [`GCN` architecture](https://en.wikipedia.org/wiki/Graphics_Core_Next), however, only work with workgroups of 64 threads.
This presented a challenge, as yuzu had to divide these workgroups of 64 threads and make them behave as two workgroups of 32 threads in order to properly emulate the guest GPU 
on these devices.

epicboy [addressed this problem](https://github.com/yuzu-emu/yuzu/pull/6948) and fixed these instructions, so that by using the thread's invocation ID, it's possible to tell 
whether any thread is part of the "lower" or "upper" 32-thread group, effectively allowing AMD cards to emulate the behaviour of the Nintendo Switch GPU.

[Blinkhawk](https://github.com/FernandoS27) has also contributed a number of fixes for bugs affecting AMD, starting with
[disabling a vulkan extension](https://github.com/yuzu-emu/yuzu/pull/6943) (`VK_EXT_SAMPLER_FILTER_MINMAX`) in their GPUs prior to `GCN4` (Polaris), which do not have the 
necessary hardware to support the extension.
Notably, this fixed the psychedelic graphics in `The Legend of Zelda: Skyward Sword HD`, one that many of us will miss, for sure.

{{< single-title-imgs
    "This was originally a video, but it could have triggered epilepsy (The Legend of Zelda: Skyward Sword)"
    "./sshdbug.png"
    "./sshdfix.png"
    >}}

On a similar vein, [he increased the number of sets per pool on AMD](https://github.com/yuzu-emu/yuzu/pull/6944) (a feature used in Vulkan to manage the memory of resources), 
fixing the random crashes that occurred when booting `Xenoblade Chronicles 2`.

[K0bin](https://github.com/K0bin) is back again, fixing another major issue.
This time, yuzu was not following the official Vulkan specification correctly, leading to overlapping information for textures and buffers on Nvidia graphics cards.

`bufferImageGranularity` specifies the size in bytes at which textures and buffers can be aligned. 
AMD and Intel GPUs allow for pretty precise values of 1 or 64 bytes depending on the hardware, but Nvidia on the other hand is hard limited to a 1024 byte block.

yuzu didn’t take this alignment into consideration, leading to data corruption primarily shown by `Super Mario Odyssey` with and without the GPU cache garbage collector enabled. 
But the same issue could affect any game that handles small textures at any time, as any buffer could corrupt any texture, and any texture could corrupt any buffer.

[Properly respecting this hardware set value](https://github.com/yuzu-emu/yuzu/pull/6834) fixes unheard instabilities when running games in Vulkan with an Nvidia GPU, and allows 
Reaper, the GPU cache garbage collector, to work on all games.

There was a bug that made Mario's moustache appear to be light-brown (instead of the classic dark shade we are used to seeing) when using an Intel GPU with the Vulkan API.
The problem was a simple one: yuzu was returning the wrong data type  when querying the `gl_FrontFacing` attribute — an unsigned integer, instead of a 32-bit floating-point value.
The solution was equally simple: epicboy changed the code so that the [queried attribute returned with the correct data type](https://github.com/yuzu-emu/yuzu/pull/6928).

{{< single-title-imgs
    "Finally, that hair dye was on discount (Super Mario Odyssey)"
    "./intelbug.png"
    "./intelfix.png"
    >}}

[v1993](https://github.com/yuzu-emu/yuzu/pull/6887) has been using [PVS-Studio](https://pvs-studio.com/en/) to catch logic errors in the code with good success so far. For example, 
[a small clean up in SPIR-V was possible thanks to this](https://github.com/yuzu-emu/yuzu/pull/6887).

## LAN party time!

Work on `Local Wireless` continues, but in the meantime, yuzu is proud to announce that `LAN` 
[(Local Area Network)](https://github.com/yuzu-emu/yuzu/pull/6863) support has been added for all users! This is all thanks to work done by [spholz](https://github.com/spholz).

This means that a small selection of games can now be played with a Switch or any other computer running yuzu while connected to the same network (be it wired ethernet, or via 
WiFi). With a service like [ZeroTier](https://www.zerotier.com/) (hamachi has not worked so far) or by manually configuring a VPN 
[(Virtual Private Network)](https://en.wikipedia.org/wiki/Virtual_private_network), this can be extended to global gameplay!

**Games with LAN support so far are:**

- `ARMS`
- `Bayonetta 2`
- `Duke Nukem 3D: 20th Anniversary World Tour`
- `Mario & Sonic at the Olympic Games Tokyo 2020`
- `Mario Golf: Super Rush`
- `Mario Kart 8 Deluxe`
- `Mario Tennis Aces`
- `Pokkén Tournament DX`
- `Pokémon Sword & Shield` (limited game functions by design)
- `Saints Row IV®: Re-Elected™`
- `SAINTS ROW®: THE THIRD™ - THE FULL PACKAGE`
- `Splatoon 2` (works with auto-stub enabled)
- `Titan Quest`

At the moment, not all of the listed games work due to missing services or not having the best compatibility with yuzu, but gameplay proved stable in all working cases.

{{< imgs
	"./lan.png| It just works! (Mario Kart 8 Deluxe)"
  >}}

Keep in mind that some games require certain button combinations to switch between LAN and Local Wireless modes. 
For example, `Mario Kart 8 Deluxe` requires the user to simultaneously hold L + R and depress the left analog stick (L3) in the main menu to be able to create or join a LAN room.

[Morph](https://github.com/Morph1984) later followed with [network interface cleanups](https://github.com/yuzu-emu/yuzu/pull/6905).

## Smooth and glitchless videos for the win

Thanks to the [introduction of VA-API](https://github.com/yuzu-emu/yuzu/pull/6713) by [yzct12345](https://github.com/yzct12345) back in July, epicboy made it possible to 
[use hardware video acceleration](https://github.com/yuzu-emu/yuzu/pull/6846) to decode videos with [FFmpeg](https://en.wikipedia.org/wiki/FFmpeg) for all other compatible GPU 
and driver combinations.
Furthermore, yuzu will gracefully fall back to software decoding in case none of the combinations are supported.

This considerably speeds up the decoding process, improving the performance of the emulator when playing videos.

Currently, the following GPU decoders are implemented:

| GPU | WINDOWS | LINUX |
| :------: | :------: | :------: |
|NVIDIA | NVDEC/D3D11VA | NVDEC/VDPAU |
|AMD | D3D11VA | VA-API/VDPAU |
|INTEL | D3D11VA | VA-API |

Please note that, since the GPU used to decode videos isn't necessarily the same as the one used for rendering, NVDEC is preferred on Windows over D3D11VA, as the performance 
experienced with the latter when it defaults to using the iGPU for decoding was lower.

Next on the list, we have had reports of noisy artifacts appearing in the videos of some games. Notably, those that were encoded with the 
[VP9 format](https://en.wikipedia.org/wiki/VP9).
epicboy [investigated the problem and solved it by stubbing `UnmapBuffer`](https://github.com/yuzu-emu/yuzu/pull/6799), a driver command that is, as you could guess, used to free 
GPU memory held by a buffer.
But what was exactly the problem behind this? I'm afraid that this will get a tad bit technical, so bear with me for a while.
I promise it will not hurt... much.

The VP9 codec defines, among other things, a number of frames in the video to be used as references, which are in turn employed to reconstruct the frames in-between these 
`key-frames`.
That means that, to properly interpolate these "in-between" frames, one must rely on the information from both the `key-frames`, and previous `inter-frames`.
`key-frames`, on the other hand, are decoded completely on their own, without relying on any reference.
Decoding a frame like this is a slower process, but it guarantees that the frame will be as clean of errors as possible, which is why they can be used as references.

As was previously mentioned, FFmpeg is used to decode videos.
In the case of the VP9 format, yuzu needs to send FFmpeg the raw bytes that will be decoded (i.e. the actual images that you see in the video), along with a header that contains 
metadata, such as the dimensions of the frame, whether it is a `key-frame`, or, if it isn't, what frames are used as references when processing it, etc.

The information that constitutes this header is mapped to a buffer in memory.
And now, here's where things turn a bit funny.
For some reason, the information in this buffer — namely, that part of the header that specified what `key-frames` should be used as reference, would change inconsistently among 
`inter-frames`.
This led to a degradation of the quality of the video, as every interpolated frame would reference a different `key-frame`, leading to the creation of these infamous garbled noise 
artifacts.

By stubbing the `UnmapBuffer` command, the addresses of these reference frames now remain constant for as long as they are needed, allowing yuzu to pass to `FFmpeg` the correct 
information and decode the videos without any problems.

{{< single-title-imgs
    "Both glitch free and smoother (The Legend of Zelda: Link's Awakening)"
    "./vp9bug.mp4"
    "./vp9fix.mp4"
    >}}

On a related note, epicboy fixed another VP9 problem: the first frame of the bitstream was missing its frame data, so he changed the logic to 
[ensure the first frame is complete](https://github.com/yuzu-emu/yuzu/pull/6844), silencing a runtime error thrown by FFmpeg.

As previously mentioned, yuzu reads the header information directly from the NVDEC registers contained in a buffer.
Unfortunately, one key flag that needs to be passed to FFmpeg, `is_hidden_frame`, was not actually held in this buffer.

To circumvent this problem, our implementation also buffers the next frame, and then, based on another flag that holds the same information (`is_previous_frame_hidden`), informs FFmpeg 
whether the previous frame should be displayed or not.
This means that yuzu would always decode one frame late, and since that was already the case, yuzu wasn't sending the header information for the very first frame, as it needs to 
know the value of `is_hidden_frame` beforehand.

What epicboy did was simply copy the first frame in the bitstream, so that essentially the first and second frame are the same, and thus, exploiting this fact, the header information can be passed 
to FFmpeg so it stops complaining.

Alas, the joys of software development are fleeting in this world.

## General bugfixes

You can’t predict how a bug will show up, sometimes they pop out like daisies. With the addition of Brazilian Portuguese as a language for the user interface, 
`Paper Mario: The Origami King` started to run only in Japanese, ignoring any user setting.

[Fixing the copy amount of `GetAvailableLanguageCodes`](https://github.com/yuzu-emu/yuzu/pull/6793) was enough to solve this issue. Thanks Morph!

{{< imgs
	"./papermario.png| True native gameplay (Paper Mario: The Origami King)"
  >}}

[sankasan](https://github.com/yuzu-emu/yuzu/pull/6795) gave `yuzu-cmd`, our command-line SDL2 alternative to the regular Qt yuzu, some additional love.
By correctly implementing `SDL_ShowCursor`, yuzu-cmd can now [properly hide the mouse cursor while in fullscreen](https://github.com/yuzu-emu/yuzu/pull/6795). Thank you!

Also relating to `yuzu-cmd`, in the past, while button mapping and other settings were working correctly, the toggle to enable the controller was being completely ignored.
[Reading the `connected` value as a boolean](https://github.com/yuzu-emu/yuzu/pull/6816) was all it took to get past this misstep, thanks 
[toastUnlimited](https://github.com/lat9nq)!

toast also found an issue in the logic of how per-game profiles were handled: only the default user profile was ever selected.
[Some code changes, and now the currently selected user profile will be used](https://github.com/yuzu-emu/yuzu/pull/6805).

[gidoly](https://github.com/gidoly) opened his first ever pull request, fixing a small but arguably very important description.

`Use Fast GPU time`, one of the options in the Advanced Graphics tab, is a hack intended to improve compatibility with games that use dynamic resolution as a way to keep steady 
performance on the Switch. 

By lying to the kernel and informing that performance is always good, the emulator avoids unnecessary destruction and reconstruction of textures, saving both performance and VRAM.
As an added benefit, some games use this *totally-not-adulterated* information to constantly render at their highest supported resolution.

For both these reasons we recommend users to keep this option always enabled, as no regressions have been found when using it, and the stability benefits on some particular titles 
like `Luigi’s Mansion 3` are more than worth it.

So, by calling a spade a spade, gidoly now informs us that `Use Fast GPU time` [is indeed a hack](https://github.com/yuzu-emu/yuzu/pull/6817). Al pan, pan, y al vino, vino.

[Stubbing the `NGCT:U` service](https://github.com/yuzu-emu/yuzu/pull/6927) allows `Boyfriend Dungeon` to boot. Good catch by [german77](https://github.com/german77).

{{< imgs
	"./boyfriend.png| Boyfriend Dungeon"
  >}}

epicboy [flipped the positions of `Limit Speed Percent` and `Framerate Cap`](https://github.com/yuzu-emu/yuzu/pull/6839) in the configuration window. Tidying the user interface 
never hurts.

Are there any developers tired of having to wait over 3 minutes to compile each change done to the texture cache section of the code? Well, [yzct12345](https://github.com/yzct12345) 
[split out the definitions](https://github.com/yuzu-emu/yuzu/pull/6820), reducing the build time to only 30 seconds.

yzct12345 also found a [deadlock](https://en.wikipedia.org/wiki/Deadlock) in our `Single-Producer, Single Consumer queue`, 
[and submitted a fix](https://github.com/yuzu-emu/yuzu/pull/6868) to address this problem.
The work to rewrite this queue and make it `Multi-Producer, Multi-Consumer` has also been started, so hopefully we might see a follow-up next month.
If you’re confused about these "[Producer-Consumer](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem)" terms, just know that they basically describe how to tackle 
the access to a resource in a multi-core system, so that the processes that write into (produce), and those that read from (consume), a shared resource, are properly synchronized — 
in this case, the queue.

This adventurous developer also [optimized the UnswizzleTexture function](https://github.com/yuzu-emu/yuzu/pull/6861), yielding a sweet speed gain.
Swizzling refers to a technique used to optimize how textures are stored in memory to minimize cache misses.
The opposite operation, thus, would be to take a swizzled texture and reorganize it so it makes sense to humans.

Some time ago, toast detected a potential out-of-bounds access, which is a bug that occurs when the program accesses memory that is outside the range where it should be operating 
at that given moment.
The code in question is also part of the function used to unswizzle textures.
epicboy noticed that the root of the problem laid in the calculation of the frame buffer size, used to limit where the code should operate, 
[and fixed it in this PR](https://github.com/yuzu-emu/yuzu/pull/6879), effectively eliminating the bug.

While inspecting yuzu manually and with the help of analysis tools, v1993 also found a number of small bugs in different parts of our codebase, such as a 
[misplaced break statement](https://github.com/yuzu-emu/yuzu/pull/6884) in the kernel function `GetThreadContext()` — a human error that changed the logic of the algorithm, 
preventing it from behaving as intended.
In a similar vein, he also corrected a [copy-paste error](https://github.com/yuzu-emu/yuzu/pull/6889) affecting the code of the software keyboard.

v1993 also found another bug in the `GetSubmappedRange()` function, used to obtain the CPU memory segments from a GPU memory address. Blinkhawk 
[went ahead and fixed it](https://github.com/yuzu-emu/yuzu/pull/6894).

Another noteworthy change by Blinkhawk is that he [changed the logic of the Garbage Collector](https://github.com/yuzu-emu/yuzu/pull/6897) (Reaper), so that it uses a Least-Recently Used 
(`LRU`) cache instead.

Previously, the cache of the GC (Garbage Collector) would iterate over `n` textures every frame, checking whether they should be cleaned from memory or not.
It also used certain heuristics that would make the cleaning more aggressive towards certain kinds of textures, cleaning them without synchronizing with the host memory.

The `LRU` scheme, however, orders the textures based on how recently they were used.
Once the memory is full, the GC starts iterating over the elements of the `LRU` cache, eliminating the textures that haven't been used in the longest time.
Additionally, the GC now prioritizes eliminating textures that do not need to synchronize with the host memory, and only considers other textures once these have been emptied 
from the cache.
These changes make the new Garbage Collector more stable, so we can safely enable it by default for all users.

Meanwhile, [BreadFish64](https://github.com/BreadFish64) found that yuzu spent considerable CPU time running `GetHostThreadID()` — a function of the kernel used to manage threads 
— while profiling `Fire Emblem: Three Houses`, and [submitted a patch that optimized the generated code](https://github.com/yuzu-emu/yuzu/pull/6878), providing a small performance 
boost.

# Input improvements

german77 implemented a few input changes this month.

First of all, when mapping and moving an analog stick, the previous implementation used to only show a blue dot representing the relative position of the analog stick.
[A new green dot is now present](https://github.com/yuzu-emu/yuzu/pull/6815), representing the emulated position of the stick, considering range and dead zones values.
It's useful to know if the stick actually reaches the whole input range.

{{< imgs
	"./stick.mp4| Remember to test and set both Range and Deadzone"
  >}}

Next, the usual [update to SDL](https://github.com/yuzu-emu/yuzu/pull/6855), which always brings some goodies. In this case:

- The ability to send effects to DualSense triggers (not implemented at the moment).
- Better sensor data rate for Switch and PlayStation controllers.
- Added support for the Amazon Luna controller.
- Added rumble support for the Google Stadia controller.
- Improved rumble for the Pro Controller.

And finally, the Web Applet can cause the SDL process to die, [disabling an unnecessary feature](https://github.com/yuzu-emu/yuzu/pull/6862) solves the issue.

## Future projects

{{< imgs
	"./art.png| 4K beach episode (Xenoblade Chronicles Definitive Edition)"
  >}}

Progress on `Project A.R.T.` is going well, most major problems have been addressed. Morph had several eureka moments with `Project Gaia`. And now other secret recipes are in the oven, 
waiting their turn.

That’s all folks! Thank you for your attention — happy playing, and see you next time!

&nbsp;
{{< article-end >}}
