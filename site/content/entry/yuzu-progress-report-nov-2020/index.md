+++
date = "2020-12-09T12:00:00-03:00"
title = "Progress Report November 2020"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 334353
+++ 

Salutations, yuz-ers! This is the November progress report which, for an unlimited time, will offer you hundreds of graphical fixes, improved performance, kernel changes, input additions, and major code cleanups. 

<!--more-->

## 4-JITs, four of a kind

[bunnei](https://github.com/bunnei) and [Blinkhawk](https://github.com/FernandoS27) have been taking a look at yuzu's implementation of the kernel, searching for bugs or code that could be refactored — that is to say, rewritten to gain performance or make it easier to read, without changing the core functionality.

[This kernel refactor PR](https://github.com/yuzu-emu/yuzu/pull/4996) focuses on modifying how the JIT (Just-in-time) compiler, an essential tool to emulate the Nintendo Switch's CPU, is being used in yuzu. These changes greatly benefit the user since they will mitigate the need to set up a huge pagefile for the emulator. Setting the default pagefile size to `auto` should now be sufficient, although some games, like `Super Smash Bros. Ultimate`, might still need a pagefile with a more reasonable size due to the sheer amount of resources being allocated. Users may want to set the pagefile size to 10000MB to cover these worst-case scenarios.

Speaking of `Super Smash Bros. Ultimate`, these changes have also fixed a softlock that occurred quite frequently when the Final Smash of the DLC character “Hero” was used. You can now freely kick your opponents off the screen with all your might without needing to hold your breath and cross your fingers.

{{< imgs
	"./hero.mp4| Hero’s Final Smash (Super Smash Bros. Ultimate)"
  >}}

Additionally, the stutters experienced in many games have disappeared. This includes those found while changing character costumes in `Super Smash Bros. Ultimate` and right before the world map and tutorial videos play in `Super Mario Odyssey` (the videos also play much more smoothly).

{{< single-title-imgs
    "World map in Super Mario Odyssey, before (left) and after (right) the changes, now stutter-free!"
    "./smobug.mp4"
    "./smofix.mp4"
  >}}

So, you might be wondering, what exactly is happening behind the curtains?

Computer programs, such as games, are usually written in high-level programming languages. These programs basically consist of a series of statements that will be carried out by the processor in sequential order to accomplish different tasks. The processor, however, does not understand these high-level instructions, so they are converted into a set of more elemental operations in binary called [machine code](https://en.wikipedia.org/wiki/Machine_code), which is directly compatible with the hardware of the system. The process of converting source code into machine code is called `compilation`, and this produces a file that can be loaded into memory and executed by the processor from there.

The Nintendo Switch uses a 4-core ARM-based CPU, so naturally the generated machine code of any Switch game will be fully compatible with that architecture. This arises a problem, however, since yuzu was designed to run on computers using a processor with a AMD64 architecture, which is not capable of understanding these instructions. For this reason, they must be interpreted or translated from guest machine code (ARM) to host machine code (AMD64). There are different approaches to accomplish this, and yuzu does so by using [Dynarmic](https://github.com/MerryMage/dynarmic): a dynamic recompiler written by [MerryMage](https://github.com/MerryMage) that performs this translation in real time. This process, the so-called JIT Compilation, reads chunks of the program in memory, decodes the instructions, and emits the translated code so the host CPU can run it. By invoking Dynarmic, it is possible to recompile game code into machine code that runs natively on the host architecture.

Previously, yuzu would create one instance of Dynarmic per guest thread being emulated on the Switch. This resulted in having multiple instances of the JIT running at the same time, which could be as many as twenty, if not more! As a consequence, a lot of resources were being wasted unnecessarily like this. But with the changes introduced in this PR, yuzu now creates only four instances of Dynarmic: one per core, which is a more efficient solution. The chart shown below compares the usage of memory among some popular titles before and after this PR was implemented; the test was performed during the internal testing phase, while yuzu was being run along Google Chrome and Discord. As it can be seen, the differences in memory usage vary between 3 GB and 6.4 GB, depending on the game. Similar results have been observed across other titles.

{{< imgs
	"./memgraph.png| Memory usage before and after implementing 4-JITs"
  >}}

bunnei is still working on more cleanups and looking for things that can be further improved, so expect more updates in the future.

## The Texture Cache Rewrite

We’ve already spoken in detail about [the Texture Cache Rewrite](https://github.com/yuzu-emu/yuzu/pull/4967) in its [dedicated article](https://yuzu-emu.org/entry/yuzu-tcr/), so in short, the `Texture Cache Rewrite` (which is not a shader cache change) is work done by [Rodrigo](https://github.com/ReinUsesLisp) to reimplement the old texture cache yuzu used, which was forked from [Citra.](https://github.com/citra-emu/citra) This effort took over 10000 lines of code, fixing graphical bugs in numerous games and improving performance along the way.

This paves the way for future important changes, like the `Buffer Cache Rewrite`, which is expected to not only continue to improve render accuracy, but to raise performance by optimizing the “hottest” code in the GPU section of our source, according to profiling. Afterwards, development of `Project Hades` is planned. This is a rewrite of the `Shader Cache`, with its main focus being improved precision and stability, and increased performance in Intel GPUs that are bottlenecked by the current implementation.

Expected soon-ish are the `Compute Texture Decoders` which will leverage the compute shader capabilities of GPUs to decode the texture formats handled by the Nintendo Switch games. This includes even elusive formats like `ASTC`, the main cause of non-shader related stuttering on non-Intel GPUs.

{{< imgs
	"./botw.mp4| Prettiest fast-traveling (The Legend of Zelda: Breath of the Wild)"
  >}}

One sad point of this rewrite is that the “Vulkan memory manager”, now called the `Texture Reaper`, which was expected to help reduce VRAM use in Vulkan, will take longer to implement due to technical complications that surfaced during its development. There is more detailed information in the dedicated article.

A small PSA, AMD users should install the `20.11.3` driver version or newer, as it adds `VK_EXT_robustness2` to all missing Radeon products, helping in stability and precision.

## Project Aether, or how to visit yuzu from within yuzu

Nintendo Switch games have access to a `web applet` that is typically used to show tutorials or guides while playing. Our original implementation using [QtWebEngine](https://doc.qt.io/qt-5/qtwebengine-index.html) had some lasting bugs that impeded gameplay in some cases, like the tutorials on a first boot of `Super Smash Bros. Ultimate`.

[Morph](https://github.com/Morph1984) [rewrote yuzu’s web applet](https://github.com/yuzu-emu/yuzu/pull/5042), still based on QtWebEngine, but completely overhauled. The web applet now accepts controller input instead of only touch emulation via mouse, and rendering fonts extracted from the native OS on the Switch, or using Open Source Software fallbacks.

{{< imgs
	"./webapplet.png| Working tutorials in Super Smash Bros. Ultimate"
  >}}
  
Previously non-rendering applets are now working. This includes the few cases where games got stuck due to the previous implementation, like in `Super Smash Bros. Ultimate`. Mods that bypass the applet are no longer required, like in `Super Mario Odyssey`.

There are limitations listed in the Pull Request that we will continue to work on. Expect this change to force our minimum Ubuntu version requirement to 20.10 in the future due to the need to update Qt to version 5.14.2 or higher.

{{< imgs
	"./yuzu.png| yuzuception!"
  >}}

## General bug fixes and improvements

[Rodrigo](https://github.com/ReinUsesLisp) brings the Xenoblade fans a nice little fix. [Implementing `early fragment tests`](https://github.com/yuzu-emu/yuzu/pull/5013) fixes ghost geometry problems that resulted in dark rendering areas.

{{< single-title-imgs
    "Like night and day! (Xenoblade Chronicles Definitive Edition)"
    "./xcdebug.png"
    "./xcdefix.png"
  >}}

This fix will be a Vulkan exclusive for now to avoid invalidating the current OpenGL shader cache.

More vulkan fixes, now by [epicboy!](https://github.com/ameerj) He [implemented the missing `alpha test culling` feature](https://github.com/yuzu-emu/yuzu/pull/4946) from Vulkan, resolving transparency related rendering bugs. This could be easily spotted in the main menu of `Super Smash Bros. Ultimate` or the vegetation of `Tales of Vesperia: Definitive Edition`.

{{< single-title-imgs
    " "
    "./smashbug.png"
    "./smashfix.png"
  >}}

{{< single-title-imgs
    "Those are some weird plants (Tales of Vesperia: Definitive Edition)"
    "./talesbug.png"
    "./talesfix.png"
  >}}

While we are speaking about [epicboy](https://github.com/ameerj), he also improved the quality of the NVDEC video decoder, by [queueing all frames](https://github.com/yuzu-emu/yuzu/pull/5002) and cleaning up the code. This results in reduced skipped frames, and greatly improves videos encoded in `VP9`.

{{< single-title-imgs
    "Do you need a hand? (Super Smash Bros. Ultimate)"
    "./introbug.mp4"
    "./introfix.mp4"
  >}}

{{< single-title-imgs
    "An example of embedded videos during gamplay (Super Mario Odyssey)"
    "./smovidbug.mp4"
    "./smovidfix.mp4"
  >}}

There has been some progress in World of Light playability, the single player campaign of `Super Smash Bros. Ultimate`. The main problem is not fixed yet, but thanks to [bunnei](https://github.com/bunnei) [stubbing `GetAlbumFileList3AaeAruid`,](https://github.com/yuzu-emu/yuzu/pull/4901) now users can do a single fight in World of Light, save, restart yuzu, and do another one. We’re slowly getting there!

Later updates of `Animal Crossing: New Horizons` fail to load, but by [stubbing `OLSC Initialize` and `SetSaveDataBackupSettingEnabled`](https://github.com/yuzu-emu/yuzu/pull/4951), [bunnei](https://github.com/bunnei) restored playability once again. You can now enjoy all the new content and events added with the latest update.

[ogniK](https://github.com/ogniK5377) [started preliminary work](https://github.com/yuzu-emu/yuzu/pull/4932) on future fixes for audio emulation. This change currently improves fidelity in games like `Shovel Knight` and the `LEGO` series. Expect more audio related changes soon.

yuzu has always been unstable when stopping emulation, and there are several reasons for this. [bunnei](https://github.com/bunnei) fixed two distinct cases, when [closing while shaders were compiling, ](https://github.com/yuzu-emu/yuzu/pull/4978) and when closing [early during the boot process.](https://github.com/yuzu-emu/yuzu/pull/4977) Quality of life fixes are always welcome.

## Input improvements

You’ve been asking for it for ages, and [german77](https://github.com/german77) delivers. [Mouse support is here!](https://github.com/yuzu-emu/yuzu/pull/4939) With this, users can now set their mouse as they desire, be it an analog stick, buttons, motion, or touch screen emulation. A controller with motion support is still the recommended input method, but a mouse can save you in a pinch.

As an extra gift for keyboard users, [german77](https://github.com/german77) also added support for [better analog emulation with keyboard inputs.](https://github.com/yuzu-emu/yuzu/pull/4905) With this change, keyboard players can now “drift” the emulated analog stick to get any angle, not just the fixed eight directions you can get by pressing key combinations.

{{< imgs
	"./analogkey.png| You can find this setting in Emulation > Configure... > Controls > Advanced > Emulate Analog with Keyboard Input"
  >}}

[german77](https://github.com/german77) also enabled the use of [up to 8 different UDP servers.](https://github.com/yuzu-emu/yuzu/pull/4937) This allows for motion controls for each player.

By [using `NpadStyleSet`,](https://github.com/yuzu-emu/yuzu/pull/4959) [Morph](https://github.com/Morph1984) now limits the available input options depending on the game. For example, in `Pokémon: Let’s Go`, the options are now limited to either Handheld, Left Joy-Con, or Right Joy-Con.

{{< imgs
	"./limit.png| No cheating!"
  >}}

[german77](https://github.com/german77) [tweaked the rumble amplification function,](https://github.com/yuzu-emu/yuzu/pull/4950) making it more linear and less aggressive. This should help when low strength percentage values are used.

By [stubbing both](https://github.com/yuzu-emu/yuzu/pull/5021) `SetNpadCommunicationMode` and `GetNpadCommunicationMode`, [german77](https://github.com/german77) made `Borderlands: Game of the Year Edition` and `Borderlands 2: Game of the Year Edition` playable!

## A silent Guardian, a watchful Protector

[Lioncache](https://github.com/lioncash), our harsh but fair code reviewer, has been [removing](https://github.com/yuzu-emu/yuzu/pull/5028) the `global variable accessor` from the whole project (the linked PR is just the latest section), work that has taken months. yuzu used to be able to run a single global system instance, but with this change, yuzu can now create as many emulated instances as needed, all separate from each other. This provides full control over the life cycle of the emulated system, allowing among other things, faster game boot times, and maybe more importantly, forcing the devs to keep up cleaner code, which is easier to maintain in the future.

## Future projects

The `Buffer Cache Rewrite` has been progressing very fast with no delays so far, and Rodrigo is very enthusiastic about starting `Project Hades` after finishing it. More multicore changes are incoming, along with input improvements.

That's all folks! Thank you so much for taking the time to read this progress report. See you next month, maybe Christmas will come early!

&nbsp;
{{< article-end >}}
