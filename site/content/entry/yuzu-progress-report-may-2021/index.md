+++
date = "2021-06-05T12:00:00-03:00"
title = "Progress Report May 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Hola yuz-ers! It's time yet again for another progress report! 
We have dozens of changes to discuss: Kernel fixes, input and UI improvements, graphical updates, the saga of the legendary dot, and even a method to procure extra VRAM!

<!--more-->

## Pokémon Snap, but it’s New

`New Pokémon Snap`’s release resulted in tons of work needed to make the game playable. For starters, Snap experienced crashes during gameplay, 
an issue [epicboy](https://github.com/ameerj) was not happy about. 
The [buffer cache rewrite](https://yuzu-emu.org/entry/yuzu-bcr/) introduced an optimized fast path for `uniform bindings`, but the conditions to take advantage of it are that buffers must be both small and *non-null*. Turns out, 
null buffers were not being explicitly checked for, causing stabilities along the way.
[Properly checking for those zero sized buffers](https://github.com/yuzu-emu/yuzu/pull/6322) fixed the stability issues the new Snap was facing.

{{< single-title-imgs
    "New Pokémon Snap"
    "./1.png"
    "./2.png"
    "./3.png"
  >}}

[Morph](https://github.com/Morph1984) has been working hard on implementing much needed fixes in yuzu's file system emulation.
In this particular case, [improving the accuracy of CreateFile](https://github.com/yuzu-emu/yuzu/pull/6265) fixes the saving and loading issues Snap was experiencing.
Unexpectedly, the error codes of conditions like “parent directory doesn’t exist” or “path already exists” were incorrect, causing havoc in the file system emulation.

Snap also revealed flaws in our touch screen gesture emulation. 
Thanks to work done by [german77](https://github.com/yuzu-emu/yuzu/pull/6275), yuzu [now properly supports multiple fingers](https://github.com/yuzu-emu/yuzu/pull/6267).

GPU emulation related issues stop this game from being perfectly playable. In its current status, photos are not recognized when they are evaluated at the end of a stage. [Like mother, like daughter](https://bugs.dolphin-emu.org/issues/4460).
This can be partially solved by using High GPU accuracy in OpenGL with Assembly Shaders enabled, or for non-Nvidia users, using Extreme GPU accuracy on Vulkan.

## Graphical fixes

Texture blits (bit block transfers, a combination of bitmaps) can sometimes work out of bounds by interleaving copy regions, by design.
yuzu has to be able to [properly emulate this behaviour](https://github.com/yuzu-emu/yuzu/pull/6289) and return the correct portion, 
something epicboy had no problem properly implementing for us.

{{< imgs
	"./blits.png| Here’s a beautifully detailed example of the old out-of-bounds incorrect behaviour in red, and the correct result in blue, with the affected area moving to the next row, as it should"
  >}}

The result is quite noticeable in games that use this blit technique, such as `Shantae` and `Pixel Game Maker Series Werewolf Princess Kaguya`, which we mentioned in the [previous progress report](https://yuzu-emu.org/entry/yuzu-progress-report-apr-2021/).

{{< single-title-imgs
    "Textures and text rendering correctly, notice the stairstepping in the right side"
    "./shantae-bug.png"
    "./shantae-fix.png"
    >}}

Thanks to user reports, it has been brought to our attention that our FPS counter in the lower right corner of yuzu’s window was not accurate.
The readings were accurate in the past, when the GPU thread was synchronous with the other services. 
Since asynchronous GPU emulation was implemented, this is no longer the case.

The solution epicboy came up with is, instead of letting the nvflinger service handle the counter, [let the graphics API inform the counter after it finishes drawing the frame](https://github.com/yuzu-emu/yuzu/pull/6317), 
this way the value is far more accurate and stable on performance oscillations.
Additionally, the update frequency of the counter was changed from 2000 ms to 500 ms, giving more information on the reading.

A big one for Vulkan users waiting for `Project Reaper`to leave the development board. 
The previous Vulkan `memory allocator` used local memory as top priority (that’s the physical VRAM on your dedicated GPU), 
and only used host memory in certain applicable cases that varied depending on how the GPU driver informed the different memory heaps available to yuzu, 
primarily in keeping critical required information closer to the CPU.

[Rodrigo](https://github.com/ReinUsesLisp) implemented a new method (solving some issues with the old one) that 
[allows yuzu to access all the available host memory](https://github.com/yuzu-emu/yuzu/pull/6367). 
Up to 50% of the total system RAM is available to the GPU as host memory, or as Windows calls it in the Task Manager, GPU shared memory. 
This change means that the GPU effectively has more RAM available to use in Vulkan, helping delay our sadly infamous out-of-memory issues with this API.

For those that can’t wait, want to test an in-development partial solution, and have experience with git, 
[Maide](https://github.com/Kelebek1) has been working on what can be called a [“light Reaper”](https://github.com/yuzu-emu/yuzu/pull/6378), 
a simpler version of what Rodrigo plans to release in the future, working as a garbage collector on a configurable fixed timer.
For anyone interested and with the time to spare in building yuzu manually, the PR is open to be tested. 
We don’t plan to merge it for now as it needs as much refinement as the regular Reaper to provide a pleasant user experience.

[bunnei](https://github.com/bunnei) removed [the risk of an overflow in the rasterizer cache](https://github.com/yuzu-emu/yuzu/pull/6372) 
by doubling the size of the responsible array. 

The Nintendo Switch shares its RAM with both the CPU and GPU, so games are free to assume any information in VRAM will be the same in RAM (since it physically is). 
As PCs don’t allow this (even on integrated GPU systems), yuzu has to keep track of any memory pages in use by the GPU, 
to ensure that all information is also reflected in system RAM. 
The previous limit of 255 references was observed to be surpassed in some rare instances during testing, resulting in utter chaos, so this PR increases it to a maximum of 65535. 

All of this costs the user 2*MB* of RAM instead of the previous 1MB. Such a heavy price to pay for the additional peace of mind, Google Chrome would be proud of us.

## Core changes and improvements

The kernel — that is, the part of an operating system that controls the resources of the machine where it is installed — organises some of the parameters of these resources 
(e.g. process `identifiers`, `priorities`, file `share` and `open` modes, etc.) into units called `kernel objects`, which are then stored in memory for future reference.
Thus, bunnei [migrated old implementation of kernel objects to KAutoObjects](https://github.com/yuzu-emu/yuzu/pull/6266), 
which is part of the newly written implementations that have been added in the past months to match more closely how the kernel of the Nintendo Switch works.
This was a big change that involved refactoring the codebase for consistency and fleshing out the implementation of various existing kernel objects and their definitions to match the 
new behaviour correctly.
Part of the work also involved improving some [system calls](https://en.wikipedia.org/wiki/System_call) (the so-called `SVC`s), 
by implementing missing services such as `UnmapSharedMemory`, or making the implementation of other calls more robust (e.g. better error checking, etc.).
These `SVC`s are functions used by games or user software to signal the OS that they want to perform operations for which they do not have the necessary permissions, 
such as access to hardware elements — for example, some I/O devices.
Thus, a process asks the entity with the highest permissions — that is, the kernel — to perform these actions on its behalf.
These `SVC` functions are essential for the communication between processes and the OS, so their correct functioning is imperative, 
as they are the programs that run whenever a game needs the kernel to perform operations that require elevated permissions.

With the introduction of the firmware version `12.0.0`, the protocol of [Inter-Process Communication](https://en.wikipedia.org/wiki/Inter-process_communication) (`IPC`) 
has also been updated.
bunnei worked on [various improvements to the IPC and session management](https://github.com/yuzu-emu/yuzu/pull/6299), with the aim to support `TIPC` — the new protocol.

`IPC` is a mechanism provided by the OS and used by processes to communicate between themselves, usually to manage or cooperate in the processing of some shared resource — such 
as a memory region, a file, etc.
A `session` in this context refers to an object that is created to manage the information exchange between a client (i.e. games) and a server (services that the game uses to 
render graphics, play audio, get user input, etc.).
With these changes, the code in charge of `session management` has been updated to support the new `IPC` protocol, besides fixing a number of inaccuracies in some of the 
error-checking functions.
bunnei has also greatly simplified the original `IPC` code, which should improve the memory usage and performance of these operations.

As a consequence of the changes introduced in the previous `KAutoObject` PR, the maximum values for many of the kernel objects have started to be enforced, which resulted in 
crashes in games that open and close sessions often, such as `Nintendo Labo`, `Pokémon Sword` and `Pokémon Shield`, due to yuzu not managing sessions correctly.
The root problem was also the cause of small memory leaks that hadn't been noticed until now, since the sessions weren't being properly closed and remained in memory.
For this reason, bunnei implemented mechanisms for moving and closing objects in a [follow-up PR](https://github.com/yuzu-emu/yuzu/pull/6347), which corrected the way the 
session counter and its opening and closing operations worked.

There are still many other kernel objects to migrate, and for this reason, bunnei introduced a PR to make the 
[KSlabHeap use both guest and host allocations](https://github.com/yuzu-emu/yuzu/pull/6373), 
as this will facilitate the process while missing functions and other structures are being implemented.

Simply put, the [slab heap](https://en.wikipedia.org/wiki/Slab_allocation) is a structure used to store kernel elements in memory efficiently in a 
[linked list](https://en.wikipedia.org/wiki/Linked_list).

As yet, yuzu doesn't emulate the memory structure of the Nintendo Switch completely, and the memory space only provides enough functionality to emulate a single process 
(i.e. a game), while using High Level Emulation (`HLE`) for everything else.
In other words, the memory used for the kernel isn't an emulated virtual memory space like the one used by the games, but just memory that yuzu, as a common program running in 
your PC, uses outside of it.
This implementation works because the games aren't allowed to access kernel memory, and so, when yuzu switches from executing a game to running some kernel procedure, 
it just handles this internally through the `HLE` implementations, with the games completely oblivious to where any of said procedures are stored.
However, there are certain elements that the games actually need to access, and so, they must be inside the emulated memory.
One such case is the [Thread Local Storage](https://en.wikipedia.org/wiki/Thread-local_storage) (`TLS`), 
a memory region used by the emulated threads to store variables that only they see but none of their peers have access to — because a thread can access only its own `TLS` region.
Since these entities can be allocated in the `KSlabHeap`, along with other entities that don't need to be inside the emulated memory accessible for the games, 
bunnei introduced this hybrid method so yuzu is able to manage the slab list for all kernel objects, regardless of whether they need to be `HLE`'d, 
or stored in the virtual memory.

Of course, there are still many other things to flesh out and implement.
The kernel is an essential part of the system that makes it possible for everything else to work.
Any improvements and additions to this component make the emulation experience more robust and solidify the accuracy of how the emulator works.

Morph has also been paying attention to the kernel, refactoring part of the IPC code and adding a function to 
[pop the ID of a process](https://github.com/yuzu-emu/yuzu/pull/6320), fixing a small bug where a [wrong value was being returned](https://github.com/yuzu-emu/yuzu/pull/6337), 
and stubbing a [function for the memory manger](https://github.com/yuzu-emu/yuzu/pull/6358).

However, the real poyo-pearl of this month has been his [rework of yuzu's Common File System Interface](https://github.com/yuzu-emu/yuzu/pull/6270) to make use of the 
`std::filesystem` library introduced in C++17, as a continuation of the work done by the maintainer [lioncash](https://github.com/lioncash).

The file system interface is the code that controls how yuzu accesses files (e.g. the creation of save files, or how yuzu loads DLC and updates files for a game, etc.).
Since yuzu originally started as a fork of [Citra](https://citra-emu.org/), there were many functions inherited from that project that weren't as new as the ones included in 
this newly added library, or weren't compatible with the new Virtual File System that yuzu uses, or simply weren't used at all.

With this huge PR, after Morph reversed-engineered the file system in order to bring yuzu's behaviour closer to how it works on the Nintendo Switch, he removed the clutter in 
favour of simpler code and rewrote the whole implementation, fixing some problems that the old code had on Windows in the process.
As a bonus, he also documented all of yuzu's file system functions.

While these changes don't necessarily reflect as a performance increase for end-users, they have certainly tackled some long-standing problems with how yuzu handled files, 
besides simplifying the codebase notably, making it much easier to read and maintain for our developers.

## On-Screen Keyboard changes

Morph has been working hard on fixes for the software keyboard.

Games received the text string of the inline keyboard instead of the regular one, resulting in empty fields being sent which could cause games to panic, 
as it would mean an invalid entry was sent.
[Fixing this only required sending the correct information from the right keyboard type.](https://github.com/yuzu-emu/yuzu/pull/6333)

Users reported crashes when pressing Enter after naming a ruleset or controller layout on `Super Smash Bros. Ultimate`.
Turns out, the `QLineEdit::returnPressed` signal generated a [race condition](https://en.wikipedia.org/wiki/Race_condition), resulting in the crashes. 
[Switching to `Qt::QueuedConnection`](https://github.com/yuzu-emu/yuzu/pull/6339) solved the issue.

Additionally, testing confirmed that games can leave regions of memory uninitialized if a text check is performed and doesn’t result in either `Failure` or `Confirm`, 
resulting, again, in crashes.
[This is fixed by reading only the text check message.](https://github.com/yuzu-emu/yuzu/pull/6374). Thanks to gidoly and OZ for all the help in finding this!

Lastly, there was an issue where the mouse input is captured by the software keyboard until the user moves to the next event.
german77 fixed this [by releasing the mouse input when yuzu is out of focus.](https://github.com/yuzu-emu/yuzu/pull/6275)

## General bugfixes

Let’s begin this section with an obituary.
Keen eyed users may have noticed that old builds used to have a single . *dot* at the end of the title bar. A suspicious *dot* whose purpose was unknown.

{{< imgs
	"./dot.png| The Legend"
  >}}

When resuming an old quest that was previously left unfinished, epicboy, 
[while working on displaying the game version on the title bar](https://github.com/yuzu-emu/yuzu/pull/6316), found the code related to the existence of the *dot*, 
and decided to slay it.

Of course, the *dot* wouldn’t be gone without a fight, and removing it caused the yuzu version info to disappear from logs and even the “about us” window!
Morph was the next hero of light selected by the king to slay the monster, [and so did he](https://github.com/yuzu-emu/yuzu/pull/6326).

And thus, the saga of the mysterious *dot* ends, for now.

Speaking of sagas, [ogniK](https://github.com/ogniK5377) works in ways beyond our comprehension.
An open PR about [allowing yuzu to set a nickname for the emulated switch](https://github.com/yuzu-emu/yuzu/pull/6354) and 
[implementing the `DisableAutoSaveDataCreation` service](https://github.com/yuzu-emu/yuzu/pull/6355) are some of the surprises The Shark left us. 
By the way, that last service? It’s used by `Mii Edit`.

Morph [stubbed the ´ImportClientPki´ and ´ImportServerPki´ services](https://github.com/yuzu-emu/yuzu/pull/6301), making `JUMP FORCE Deluxe Edition` boot. 
`Project Hades` will help make this game playable.

{{< single-title-imgs
    "Thanks Ghost for the pics! (JUMP FORCE Deluxe Edition)"
    "./jfmenu.png"
    "./jfingame.png"
    >}}

bunnei [fixed a hang on shutdown in the NVFlinger thread](https://github.com/yuzu-emu/yuzu/pull/6386) (used for compositing), 
this fixes hangs when pressing stop while playing `Super Mario Odyssey`.
You not only have to let’s-a go, Mario, but also let’s-a stop sometimes.

While yuzu allows users to install anything to NAND, be it updates, DLC, or even the base game, we recommend that only updates and DLC be installed, 
leaving yuzu to find the base game with the user provided locations of the game dumps.
Morph [properly blocked this,](https://github.com/yuzu-emu/yuzu/pull/6319) and added a warning that accompanies it.

Besides what was mentioned at the start of the article, `Shantae` took a bit of extra work to become playable. Another case of an emulator inside an emulator.
epicboy [solved a softlock at boot](https://github.com/yuzu-emu/yuzu/pull/6284) by creating layers when queried but not found in the compositting service NVFlinger.
and ogniK [fixed the crashes](https://github.com/yuzu-emu/yuzu/pull/6279) by stubbing the emulation of `nvhost-prof-gpu`.

{{< imgs
	"./shantae.mp4| Atta girl! Thank you OZ! (Shantae)"
  >}}

Linux deserves some love too, and [toastUnlimited](https://github.com/lat9nq) shall give it.
linuxdeploy introduced a regression that caused any file open dialog to crash yuzu if you ran one of our official AppImages. 
toast solved it [by downloading our own version hosted as one of our externals](https://github.com/yuzu-emu/yuzu/pull/6324), allowing us to have better control on changes to 
linuxdeploy, as well as fixing the crashes.
Users can enjoy the ease of use of the AppImages again.

An old limitation we faced on distros that decide to “stay on their old and trusted packages” is the provided version of the Qt binaries.
[By setting up version 5.12 as the minimum requirement and adding 5.15 to our externals,](https://github.com/yuzu-emu/yuzu/pull/6366) we can ensure that no problems are faced 
when building yuzu with any of the valid compilers, be it MSVC, GCC, Clang or even MinGW.
## UI and other Quality of Life improvements

Users have the option to customize the game list in `Emulation > Configure… > General > UI`, the Add-Ons column can be disabled there. 
Previously, if the user disabled it, the game list was not being refreshed, forcing the user to find inventive ways to manually do it.
Thanks to [Kewlan](https://github.com/Kewlan)’s work, 
[now the game list properly refreshes itself with no need for manual intervention!](https://github.com/yuzu-emu/yuzu/pull/6298)

{{< imgs
	"./add-ons.png| Add-Ons shows which update, DLCs and mods are installed and enabled"
  >}}

toastUnlimited reluctantly [added the CPU tab to per-game settings.](https://github.com/yuzu-emu/yuzu/pull/6321) At the same time, Custom RTC was removed to force it as a global value.

{{< imgs
	"./cpu.png| Totally not a hint of anything"
  >}}

While we’re on this subject, some things that need to be clarified about the CPU settings tab. 
Unsafe was originally only intended for CPUs that lacked the FMA instruction set, which causes games to run at very low framerates.
Later on, a fix was discovered that could boost the performance of `Luigi’s Mansion 3` by reducing precision. This was described in 
[January’s progress report.](https://yuzu-emu.org/entry/yuzu-progress-report-jan-2021/)

As a result, we recommend users of CPUs that do have FMA to stick to `Accurate` and only force `Unsafe` for Luigi’s Mansion 3. 
Using Unsafe is known to cause precision issues, for example, exaggerating the hitboxes of characters in `Super Smash Bros. Ultimate`.
Users with old or low-end Intel CPUs that lack FMA, feel free to keep Unsafe enabled all the time.

We provide some examples in the following gorgeous and totally perfect table:

| CPU series | FMA support | Recommended setting |
| :-----------: | :--------------: | ------------ |
| Intel Core 4000 to 11000 series | Yes | Use Accurate, Unsafe for LM3 |
| Intel Core 500 to 3000 series and older | No | Use Unsafe |
| Intel Atom, Celeron and Pentium series | No | Use Unsafe |
| AMD Ryzen series | Yes | Use Accurate, Unsafe for LM3 |
| AMD FX and A 4000 to 9000 APU series | Yes | Use Accurate, Unsafe for LM3 |
| AMD Phenom, A 3000 APU series and older | No | Use Unsafe |

*LM3 = Luigi’s Mansion 3

toastUnlimited also gave us the option to [apply settings while games are running](https://github.com/yuzu-emu/yuzu/pull/6346). 
This can help more comfortably test for ideal settings while playing.
Keep in mind that settings that require a reboot to take effect won't be affected by the apply button.

{{< imgs
	"./apply.png| "
  >}}

Continuing with the per-game setting improvements, toast also added an exception for homebrew.
Since most homebrew use a game-ID of 0000000000000000, using the ID to save the per-game settings would have been useless, so instead, 
[yuzu will use the name of the homebrew file.](https://github.com/yuzu-emu/yuzu/pull/6361)

And finally, toast, continuing work from german77 and [Tobi](https://github.com/FearlessTobi), [added a button to reset yuzu settings to default](https://github.com/yuzu-emu/yuzu/pull/6362). 

{{< imgs
	"./reset.png| Simple as that"
  >}}

This is sometimes needed in very rare cases, for example, when being unable to boot `Super Smash Bros. Ultimate`.

## [Shake it, baby](https://youtu.be/Iac0T6dnuzM)

german77 has been working on [implementing SDL motion](https://github.com/yuzu-emu/yuzu/pull/6244), with the purpose of removing our dependence on third party programs to get 
motion input from valid controllers like Dual Sense, Joy-Cons, or Pro Controllers.
With this PR, users can simply pair their controllers via Bluetooth and yuzu will pick them up as a valid input device, auto-mapping and enabling motion support, effectively 
removing the need to use betterjoy, ds4windows or other third party software in yuzu.

A separate PR adds [detection of two separate Joy-Cons as a single input device](https://github.com/yuzu-emu/yuzu/pull/6318).

And to provide motion support on the Linux side, [v1993](https://github.com/v1993) [enables the use of HIDAPI within SDL2](https://github.com/yuzu-emu/yuzu/pull/6293). 

Work continues to fine tune how the sensor data is interpreted, specially from non-Nintendo devices.
For example, PS3 controllers operate motion on a single Z axis, but inform the remaining 2 axis to the operating system with useless NaN values, 
making any motion calculations useless.
[By replacing the X and Y axis values with zeros](https://github.com/yuzu-emu/yuzu/pull/6310), german77 solved the issue.

Games don’t always check for obvious physical limitations. 
For example, in the past, it was possible to use handheld controller emulation while the game was in a docked status.
Doing this can break games like `Xenoblade Chronicles 2`, as the game expects the console to disable input when the Joy-Cons are connected to a docked Switch’s rails.
german77 solves this by [forcing an emulated Pro Controller instead](https://github.com/yuzu-emu/yuzu/pull/6353). 
No more weird Frankenstein input monstrosities, please.

Finally, yuzu could be hard to map on analog sticks due to a bug in how the event was handled. While fixing this, german77 also 
[fixed a crash caused by controllers not listed in the controller list disconnecting](https://github.com/yuzu-emu/yuzu/pull/6312).

## Future projects

Some of our devs have recently been implementing the preliminary work in dynarmic needed for hardware `fastmem`, a feature that will lower part of the load when the CPU accesses 
memory, which will help with boosting the performance of the emulator.
This feature has been in debate for over a year, with the devs going back and forth on how to implement it on Windows, as there are some complications that arise from how the 
memory is managed in this OS. 
We expect to have nice surprises for you on its release, as it will be the prerequisite for more exciting stuff to come.

Now, I know we keep teasing `Project Hades`, but we have good news!
SPIR-V is finalized, GLASM is in its final testing, and GLSL is not far behind. Few regressions remain to be squashed.
Once the shading languages are done, previous features like the old asynchronous shaders are reimplemented, and the fine tuning is finished, it will finally be released.
We're trying to release it alongside Reaper, but time will tell.

{{< single-title-imgs
    "MARVEL ULTIMATE ALLIANCE 3: The Black Order, WORLD OF FINAL FANTASY MAXIMA, Yoshi's Crafted World"
    "./hades1.png"
    "./hades2.png"
    "./hades3.png"
  >}}

That’s all folks! Thank you so much for staying with us until the end of this month’s progress report.
See you in the next one!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>

.
