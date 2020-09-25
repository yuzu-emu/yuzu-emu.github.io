+++
date = "2020-08-30T12:00:00-03:00"
title = "Progress Report September 2020"
author = "Honghoa"
coauthor = "GoldenX86"
forum = 0
+++ 

Greetings Yuz-ers! Welcome to September's progress report. This month we offer you more input fixes and additions, small Vulkan improvements, and the initial ground work needed to get Super Mario 3D All-Stars playable.

<!--more-->

## Ya like to (move it!)



## An emulator inside an emulator

`Super Mario 3D All-Stars` is a special case, in several aspects. For starters the game is just a container for several other binary executables (known as `Program NCAs`), each one with their own Title ID. Step one to get this game to boot is to handle [a particular case like this](https://github.com/yuzu-emu/yuzu/pull/4675), a job [Morph](https://github.com/Morph1984) did. 

Good, finished, right? Wrong. Turns out, handling several integrated programs with different title IDs will make XCI game dumps conflict, as they include game updates. [Morph](https://github.com/Morph1984) also [had to add checks for cases like this.](https://github.com/yuzu-emu/yuzu/pull/4710)

Next step, unimplemented functions. [Morph](https://github.com/Morph1984) did a [partial implementation of `LoadOpenContext`](https://github.com/yuzu-emu/yuzu/pull/4678), a function that several collections games use. Some examples are `Clubhouse Games: 51 Worldwide Classics`, `Grandia HD Collection`, `XCOM 2 Collection`, `Baldur's Gate I and II`, `Dr Kawashima's Brain Training`. and of course `Super Mario 3D All-Stars`.

Similarly, [`GetPreviousProgramIndex` needed to be stubbed](https://github.com/yuzu-emu/yuzu/pull/4676). The end result is getting the game-selector/menu working.

{{< imgs
    "./menu.png| For now, just the menu and soundtrack sections! (Super Mario 3D All-Stars)"
  >}}
  
## Bug fixes and improvements

`VK_KHR_timeline_semaphore` is a very recent Vulkan extension only supported by *desktop or laptop* GPUs. [Adding support for it on yuzu](https://github.com/yuzu-emu/yuzu/pull/4674) helps simplify the code a lot, should improve VRAM use in a small amount, and it will pave the way for more important changes coming to our Vulkan implementation later on. Thank you [Rodrigo](https://github.com/ReinUsesLisp) for its addition! The end result should be transparent for the user.

A missing feature in the input rewrite was the ability to merge two separate single left and right Joycons into a single dual Joycon, a function `Super Mario Odyssey` needs. [Morph](https://github.com/Morph1984) [implemented `MergeSingleJoyasDualJoy`](https://github.com/yuzu-emu/yuzu/pull/4629), so this is no longer a problem for Mario.

A small PSA for our Linux users, the [Qt requirement has been raised to `Qt 5.12.8`](https://github.com/yuzu-emu/yuzu/pull/4638) now. Thanks [Morph](https://github.com/Morph1984) for the update!

Some users have been reporting input latency, so [Tobi](https://github.com/FearlessTobi) decided to [test some changes](https://github.com/yuzu-emu/yuzu/pull/4643) and see if the situation improves. To further help on this issue if you experience it, be sure to enable `Radeon Anti-Lag` or `Nvidia Ultra-Low Latency` in your respective driver control panel.

Now [Gamecube controllers will be autoconfigured!](https://github.com/yuzu-emu/yuzu/pull/4618) Thanks to work done by [german77](https://github.com/german77), now the Gamecube Adapter controllers will show up as devices in the input window, and their buttons will be mapped automatically.

`Clubhouse Games: 51 Worldwide Classics` now manages to boot and with a save, load the board games. [Morph](https://github.com/Morph1984) managed this by [implemention the `Get/SetNpadHandheldActivationMode` function](https://github.com/yuzu-emu/yuzu/pull/4683). The game will render almost everything in black for now, so don't consider it playable yet.

{{< single-title-imgs
    "Paint it all black (Clubhouse Games: 51 Worldwide Classics)"
    "./51a.png"
    "./51b.png"
  >}}

## Nvidia specific fixes

Recent Nvidia Geforce drivers (past the 446.14 version) introduced a performance regression mainly affecting `Paper Mario: The Origami King` and `Super Smash Bros. Ultimate's` menus, important enough that we had to recommend our users to stay on older driver versions until we could figure out what was going on. Turns out, the new drivers don't seem to like how Qt handles VSync, so [Rodrigo](https://github.com/ReinUsesLisp) fixed it by [calling `SwapBuffers` from the emulation thread](https://github.com/yuzu-emu/yuzu/pull/4692). This change means that Nvidia users are free to use the latest driver version without fearing low framerates.

{{< single-title-imgs
    "Just in time for Ampere, eh! (Super Smash Bros. Ultimate)"
    "./SSBU-broken.mp4"
    "./SSBU-fixed.mp4"
  >}}

As mentioned in [July's progress report](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2020/), [toastUnlimited](https://github.com/lat9nq) continued to work in solving crashes only experienced with recent Nvidia Vulkan drivers in Linux. Thanks to work done by DXVK, the [current implementation aims to be more global](https://github.com/yuzu-emu/yuzu/pull/4724), hopefully finally solving this problem for good.

## Future projects



That's all she wrote, folks! See you next time in the October progress report!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
