+++
date = "2021-06-08T04:00:00+05:30"
title = "New Feature Release - Fastmem Support"
author = "CaptV0rt3x"
forum = 415882
+++

Hey there, yuz-ers!
While all of you wait eagerly for the release of Project Hades, our shader decompiler rewrite, we thought we'd bring you a nice little surprise to keep you occupied. 
We present to you, the newest addition to yuzu's ever-improving features list - Fastmem (Fast Memory Access)!

<!--more-->
&nbsp;

This is now available in the latest yuzu Early Access build (1759 or newer) and we intend to make this available in Mainline builds very soon. 
As always, we ask that you test various games with these builds and if you encounter any issues, bugs, or crashes, please reach out to us via the [Discord](https://discord.gg/u77vRWY) Patreon channels.

**Note: This feature is enabled by default.**

## What is Fastmem?

Fastmem or Fast Memory Access, is a well-known feature among emulator developers and emulation enthusiasts. 
Emulators like [Dolphin](https://dolphin-emu.org/) and [Citra Android](https://citra-emu.org/) have implemented this in the past.

All modern Operating Systems have this concept of "virtual memory," where addressable memory (from the running process) is a space of memory addresses that are only "known" to that process, e.g. Discord on your PC, or Super Mario Odyssey on your Switch — and the addresses are translated by the Switch's MMU (Memory Management Unit) to the physical location in the Switch’s physical RAM as the game runs.

&nbsp;

{{< imgs
	"./MMU.png|Illustration of an MMU (By Mdjango, Andrew S. Tanenbaum)"
>}}

In yuzu, we emulate the Switch's virtual address space for the running process. 
But, that means for each time the game tries to read/write memory, which happens millions of times per frame, we need to basically "decode" where that Switch virtual address maps to our "emulated" Switch memory (RAM allocated for yuzu).
This adds a lot of overhead when you consider how much the game reads/writes to memory.

The idea behind Fastmem here is to map the emulated Switch game's addressable memory on the host (Windows / Linux), at offset addresses. 
The offset is a constant.

## The Technical - HOW?

On the Switch, we have 4GB of memory. 
The hardware supports a virtual memory size of 48bits (just like x64); however, the Switch kernel limits this to only 39bit to save some memory for storing page tables.
This results in a 512GB virtual address space (2^39) for use. (A page table is the data structure used to store the mapping between virtual addresses and physical addresses.)

To emulate this, we allocated a HUGE page table, which had an offset for each memory page addressable in the virtual memory region of the Switch. This table alone was 1GB in size! 
And whenever a game wanted to access the memory, we looked up this table, which resulted in roughly ~10 x64 CPU instructions and twice the memory latency.
That latency being: first read the table's value, then read the correct memory.

Fastmem, however, uses the host MMU to rebuild the same 39bit virtual memory arena. 
Here, we're lucky that Nintendo limits the memory to 39bit. 
We cannot allocate 48bit because that's the entire virtual address space on the host. 

This cuts the effort to access the memory down to 3+1 x64 CPU instructions with a single memory latency.
3 instructions to check if the pointer is smaller than 39 bit, and one memory load instruction. 
We need this size check to ensure out-of-bounds memory access won't return any physical address.


## The Challenges

Implementing Fastmem required two major things in [Dynarmic](https://github.com/MerryMage/dynarmic/), our JIT recompiler. 

**First:** A64 Fastmem support on Dynarmic.

Dynarmic has had support for A32 Fastmem (see Citra Android) for a while now. 
A64 Fastmem support was [originally worked on a year ago by MerryMage and vdwjeremy](https://github.com/MerryMage/dynarmic/pull/528) but it never got merged to the master branch. 

[degasus](https://github.com/degasus/) worked with [MerryMage](https://github.com/MerryMage/) to clean up and get [these changes merged](https://github.com/MerryMage/dynarmic/pull/613) to the master branch so that yuzu could benefit from this.

**Second:** To generate the 512GB virtual address space with the same mappings as on the Switch.

degasus proved last year that this was easy to implement on Linux as the POSIX mmap call provided very similar features to the Horizon OS.
But it was a huge challenge for Windows, as the Windows Virtual Memory API is larger with a few missing features. 
Moreover, while Windows page tables were 4K aligned, Windows memory management was 64K aligned for [outdated reasons](https://devblogs.microsoft.com/oldnewthing/20031008-00/?p=42223).


## The Solutions

Turns out, Microsoft had realized this too and frequently patched their Virtual Memory API. 
With the release of Windows 10 v1803, their new API supported new "placeholder" memory which didn't suffer from the previous limitations. 

Thanks to [Breadfish64](https://github.com/BreadFish64/), who used this new API in their Gameboy emulator and showed us that it was now indeed possible to support Fastmem on Windows. 
Unfortunately, this makes the feature usable only on Windows versions 1803 and higher.

Since we already met the base requirements for our new Fastmem implementation long ago, our devs were able to quickly address the missing pieces. 
[bunnei](https://github.com/bunnei/) implemented the much-needed kernel rework changes in yuzu, degasus cleaned up their original proof-of-concept code for Linux, and [Rodrigo](https://github.com/ReinUsesLisp/) implemented the Windows Fastmem support. 
[Blinkhawk](https://github.com/FernandoS27) provided valuable advice and coordinated these efforts to get the feature release-ready.

## The Results

As an added bonus, game booting/loading times have been improved thanks to these changes.
Thanks to developer Rodrigo, Normal GPU accuracy no longer triggers a myriad of exceptions on the Smash character selection screen, improving its performance from 10-20 FPS to a full 60.

&nbsp;
{{< imgs
	"./SSBU.png|Super Smash Bros. Ultimate"
>}}

For all game benchmarks, we utilized a PC built to our own recommended hardware spec. 
In this testing we observed performance improvements ranging from 15-60% in some of the most demanding areas of gameplay.
Please note the marked titles that were tested with the processor limited to 2.4Ghz, to synthetically make it slower than usual and highlight the improvements.

&nbsp;
{{< imgs
	"./BENCH_01.png|The * indicates titles tested at 2.4Ghz"
>}}

&nbsp;
{{< imgs
	"./BENCH_02.png|The * indicates titles tested at 2.4Ghz"
>}}

##### That's all we have for now, see you soon with exciting news about Project Hades and more! Happy emulating!

&nbsp;
{{< article-end >}}
