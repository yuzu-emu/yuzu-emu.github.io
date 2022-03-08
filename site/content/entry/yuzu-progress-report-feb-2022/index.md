+++
date = "2022-03-08T12:00:00-03:00"
title = "Progress Report February 2022"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Glad to have you here, yuz-ers! This month we can show you tons of kernel changes finally fixing long standing bugs, massive performance improvements, UI and input changes, and more.

<!--more-->  

But first, a heavily requested feature. Not for yuzu, but for these articles.

While we try to only inform changes that are currently in Mainline builds, due to time constraints or delays, we sometimes list pull requests that will be in Early Access for a few extra days after the release of a progress report.

To fix this, [liushuyu](https://github.com/liushuyu) implemented hover-cards we writers then add over each pull request.
If you place the mouse over the dotted hyperlink you get the current status, title, number and merge date, for example, {{< gh-hovercard "7969" "here" >}}.

The different possible statuses are:

{{< imgs
	"./merge.png| There are a few mor, but these 3 are the most important"
  >}}

Red: Pull request closed, it won’t be part of any build.
Purple: Merged to master, it already is on Mainline, or will be in 24 hours at most, if our buildbot doesn’t die in the process!
Green: Pull request open, not yet added to Mainline unless it has the `mainline-merge` tag, check the pull request link to confirm.

You can come back to the articles at any time from now on to see if a feature has been merged to mainline already, as these cards will update dynamically accordingly. 
Keep in mind that this is not an immediate process. 
A merged pull request will be added to mainline on the next autobuild, so it may take up to 24 hours to see a change in place.

With that out of the way, let’s get started.

## Graphical fixes, and how to increase performance

Due to problems with the RADV drivers on Linux, using the Vulkan API would crash yuzu when run on AMD's RDNA2 graphics cards.
Most notably, this problem affected the Steam Deck, as reported by users who tried testing our emulator in their devices.

It was determined that the crash happened because of `VK_EXT_vertex_input_dynamic_state`, a Vulkan extension used to minimize the number of pipeline objects needed during the shader compilation process.
These structures are massive, and sometimes, a game may want to change only a small portion of the contents held in them, such as the vertex input state.
Using this extension allows the API to dynamically change these members in the structure with a simple function call, eliminating the need to create a whole new object, thus, reducing the amount of resources used by the operation.

While this bug is being resolved upstream, [epicboy](https://github.com/ameerj) pushed a PR to {{< gh-hovercard "7953" "blacklist the extension" >}} on RDNA2 devices running RADV drivers, so yuzu does not outright crash.

But there was still one more driver with problems for us out there.

Mesa's ANV driver on Linux does not support the texture format `VK_FORMAT_B5G6R5_UNORM_PACK16`, and this caused yuzu to crash when running a game that made use of it, such as `Bowser's Fury`.
To bypass this problem, [voidanix](https://github.com/voidanix) implemented a solution that emulates `BGR565` textures by {{< gh-hovercard "7913" "swizzling the RGB565 format" >}} instead.

In a similar vein, [Morph](https://github.com/Morph1984) implemented a {{< gh-hovercard "7948" "missing vertex format" >}}, used by the title `パワプロクンポケットR` (Power Pro Kun Pocket R).

[asLody](https://github.com/asLody), also implemented a missing {{< gh-hovercard "7939" "framebuffer format" >}}, used by `Yokai-watch 4`.

{{< imgs
	"./ykw4.png| The real name technically is 妖怪ウォッチ4 ぼくらは同じ空を見上げている"
  >}}

Another addition by this author was {{< gh-hovercard "7930" "adding missing semaphore operations" >}} for `MaxwellDMA`, used  by `Legend of Zelda: Breath of the Wild` and `Pokémon Legends: Arceus`.

## Kernel changes, and how to tame Smash

Continuing with the ongoing work on the kernel, [bunnei](https://github.com/bunnei) has {{< gh-hovercard "7956" "revamped the kernel memory manager" >}} to make it more compatible with the latest system updates.

One neat setting that came along with these changes is the ability for yuzu to support different memory layouts, such as the "6 GB extended memory layout", used in developer units (a feature requested by the modding community).
 
Some mods can take more RAM than the Switch can provide, mainly high resolution texture replacements.
To solve this issue, bunnei {{< gh-hovercard "7932" "added a toggle to enable the extended 6GB memory layout" >}} that real developer kits would have available.
Those extra 2GB will allow heavy mods to work without issues. 
You can find the setting in `Emulation > Configure… > General > Extended memory layout (6GB DRAM)`.

{{< imgs
	"./6gb.png| Mod away!"
  >}}

Don’t expect it to make a difference in emulation performance, games will not care if the emulated console has more than 4GB, they only care about having enough free memory for their operations.

bunnei has also been improving the accuracy of the page table management, by {{< gh-hovercard "7835" "migrating locks to using emulated guest locks" >}} and {{< gh-hovercard "7919" "improving the mapping and unmapping of physical memory" >}}.

As always, the biggest motivator behind this work is increasing the accuracy of our implementation, while also fixing any bugs that may have been hiding there these past years.

[Dynarmic] (https://github.com/merryhime/dynarmic), our ARM JIT recompiler, also got a number of new optimizations and bugfixes this month.

[Blinkhawk](https://github.com/FernandoS27) corrected the fencing logic for the serialization of memory store/load operations in Dynarmic's `x64` code emitter, and subsequently {{< gh-hovercard "7827" "updated the submodule" >}} to bring these changes into yuzu's codebase.
This fixed the freezes that affected `Pokémon Legends: Arceus`.

While investigating the stability issues of `Super Smash Bros. Ultimate`, bunnei and [Merry](https://github.com/merryhime) found that the problem was caused by an error in the `SpaceRemaining` function, used to calculate the remaining space available for JITed code in a cache block.

Dynarmic splits these code blocks in two regions, named `near` and `far`.
This scheme aims to minimize L1 CPU cache misses by keeping "hot" code in `near` readily available for execution, while "cold" code is pushed into the `far` region.
Due to a bug in the way the remaining space was being computed, the `near` region would overflow into the `far` region, overwriting "cold" code with "hot" code.
The CPU would then attempt to run the "cold" code that was previously there, and crash horribly on the try.

Ultimately (no pun intended), this translated as crashes after a few matches in `SSBU`, since that was the time it took to run out of space and overflow the cache.
By {{< gh-hovercard "7955" "correcting the comparisons" >}} used to compute this value, the devs were finally able to mitigate one of the longest-standing problems surrounding this title.

{{< imgs
	"./smash.png| We did so many CPU fights to test these changes... (Super Smash Bros. Ultimate)"
  >}}

Merry has also been busy {{< gh-hovercard "7959" "implementing support for a new CPU optimization" >}}, which makes the emulation of ARM exclusive access instructions through the use of `cmpxchg` (compare and exchange) instruction of the `x64` architecture.

The ARM instruction set contains instructions that can exclude access to a memory address, so that only some instructions — a pair, in this case: one for reading values, and another for writing them — can operate safely in a multicore environment, without the interference of instructions from other threads, who may also want to access the same value in memory.

It achieves this by marking the address "for exclusive access" after reading the value in memory, so that an "exclusive" store instruction only writes into this address if it is marked with this flag.
A "normal" store instruction, on the other hand, was designed to always clear this flag after writing.
Thus, the exclusive instructions can use this information to know when the value in the memory address was altered by a non-exclusive instruction, and restart the whole job again, until the operation succeeds.

ARM is able to control this behaviour through a piece of hardware called the `Exclusive Monitor`.
But emulating these instructions accurately on the `x64` architecture can be very difficult, given the complex nature of testing and debugging in a multithreaded environment.
Thus, their previous implementation was rather conservative and inefficient, to ensure concurrency.

It is possible, however, to approximate the original behaviour through the use of `cmpxchg`, which compares the value in the memory address with a reference, and if they match, it writes a new value into it.
Thus, one can use the value in a memory address as the reference, and later write another value into the same address if, and only if, the stored value matches the reference.
Relying on the semantics of this instruction, exclusive memory reads and writes can be inlined into the JITed code and speed up their execution.

Titles that make extensive use of these exclusive instructions, such as `Pokémon Legends: Arceus`, should see a slight increase in performance.

{{< imgs
	"./gnv.png| Some Nvidia numbers"
  >}}

{{< imgs
	"./gamd.png| And some AMD ones"
  >}}

## General bugfixes and UI changes

[german77](https://github.com/german77) did some work on the UI to spice things up.

He {{< gh-hovercard "7859" "improved SDL battery level detection" >}}, realigned some of the UI elements in the control settings, {{< gh-hovercard "7839" "and gave us new prettier battery symbols!" >}}

{{< single-title-imgs-compare
	"Cute and simple!"
	"./batteryold.png"
	"./batterynew.png"
>}}

german77 also {{< gh-hovercard "7861" "added new hotkeys" >}} by popular request.
Joining the fray are Docked/Undocked (for controllers), Window Adapting Filter, GPU accuracy (switches between normal and high), and mute/unmute audio.

{{< imgs
	"./hotkeys.png| Once you master the hotkey-jutsu, no one will be able to stop you"
  >}}

Another very requested fix was {{< gh-hovercard "7867" "improving Amiibo support" >}}.
Our old code wasn’t very accurate, leading to several games failing.
While there is room for improvement, this new implementation is far more accurate and should allow stable use of Amiibo dumps on most games now.

Native support for NFC scanning of physical Amiibos is being worked on.

Morph fixed a weird issue that’s been appearing lately.
Under some circumstances, after reopening yuzu, the window would be a maximized borderless *thing*.
Turns out, for some reason the configuration file was not resetting the frameless flag after closing yuzu.
{{< gh-hovercard "7849" "Forcing a removal of the flag" >}} at each boot solves the issue.

[Maide](https://github.com/Kelebek1) added a very useful feature to modders and anyone interested in the internals of their games. 
Previously, yuzu dumped the base `exeFS`, which only includes data from the base game, missing any new addition from updates or DLCs.
Instead, by {{< gh-hovercard "7899" "dumping the patched `exeFS`" >}}, like [EliEron](https://github.com/EliEron) {{< gh-hovercard "4341" "suggested in the past" >}}, users will have access to update files!

[toastUnlimited](https://github.com/lat9nq) found out that `Splatoon 2` crashes when accessing the inventory in the [LAN lobby](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2021/#lan-party-time).
{{< gh-hovercard "7887" "Stubbing the `IsUsbFullKeyControllerEnabled` function" >}} is all that was needed.
Splat your friends with impunity!

{{< imgs
	"./splat.png| With all that ink dissipating to the atmosphere, rain must be fantastic"
  >}}

For retro gaming fans, both toastUnlimited and german77 have fixes for the SNES and NES emulators included with the Nintendo Switch Online service (yes, you can dump and play those offline too).
{{< gh-hovercard "7878" "Stubbing`mnpp:app`" >}} solves crashes, and {{< gh-hovercard "7877" "Updating the process revision" >}} of our audio emulation allows the official emulators to work properly on yuzu.

{{< single-title-imgs
    "Our team members are big Earthbound fans"
    "./nes.jpg"
    "./snes.jpg"
    "./snes2.jpg"
    "./snes3.jpg"
  >}}

## Input improvements

As it happens each month, german77 dominates this section.

As a way to test how strong the current rumble setting is, now you can {{< gh-hovercard "7842" "force the controller to vibrate" >}} by pressing any button while the Configure Vibration window is open.

{{< imgs
	"./rumble.png| Joy-Con goes BRRRR"
  >}}

Gamepads have drift, but not only in the exaggerated fashion Joy-Cons are known for, every gamepad has a certain degree of drifting to it.
To hide this, consoles auto-center their sticks.

On yuzu, one of the limitations of [SDL](https://www.libsdl.org/) is that it will only read the factory calibration on a Nintendo official controller, skipping any user calibration profile that may be available.
We counter this by auto-centering at boot, but sticks can still go anywhere they like, so german77 {{< gh-hovercard "7860" "adds an option to manually center each axis" >}} as an additional option.
Just right click any direction of a stick in our controller settings.

{{< imgs
	"./center.png| Just one right click away"
  >}}

Support was added to {{< gh-hovercard "7900" "allow mapping the Enter key" >}}, which previously just restarted the mapping process.

toastUnlimited {{< gh-hovercard "7851" "added support for motion inputs" >}} to `yuzu-cmd`, our terminal version of the executable. 
Terminal warriors can now enjoy some Just Dance too.

## Improving emulation to not use emulation

[xerpi](https://github.com/xerpi) {{< gh-hovercard "7866" "implemented the 32 bit version" >}} of the `OutputDebugString`, `CreateCodeMemory`, and `ControlCodeMemory` supervisor calls. Thanks!

xerpi’s help has a bigger objective in mind than just helping some weird Switch emulator.
They’re developing [vita2hos](https://github.com/xerpi/vita2hos), a translation layer to run `PlayStation Vita` apps and games natively on the Nintendo Switch!
The road ahead is long, since most Switch debug tools are 64-bit only, and the Vita is firmly a 32-bit console, so several rewrites and changes are in order to get the project going.

yuzu lacks some functionality to offer full 32-bit execution mode support, so the PR was opened to help improve that area, since xerpi is using Switch emulators to assist and ease development.
We can’t wait to see how this project grows!

## Future projects

`Project Y.F.C.` continues to mature as more previously broken games start to become playable.
Blinkhawk informs us that he changes focus to performance. 
We can't wait to tell you more!

{{< imgs
	"./yfc.png| Fire Emblem Warriors"
  >}}

Morph has a message regarding the progress of `Project Gaia`:

{{< imgs
	"./gaia.png| Poyo!"
  >}}

And german77 has been playing with {{< gh-hovercard "7964" "implementing a Mii editor applet" >}}.
Current support is pretty barebones, but anyone interested is free to build the pull request and try it.

{{< imgs
	"./mii.png| Sweet home Alabama?"
  >}}

That’s all folks! We thank you for your time, and we hope to see you next month. [Glory to Mankind](https://www.youtube.com/watch?v=DsqfwQwPTH8).

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
