+++
date = "2019-10-08T04:00:00+05:30"
title = "yuzu Patreon Release October 2019"
author = "CaptV0rt3x"
forum = 150506
+++ 

Hey there ***yuz-ers***!
Curious about what we have in store for you?
It's the October Patreon preview release!
This build showcases the new game in town, **The Legend of Zelda: Link's Awakening**, in yuzu!
Hop right in to find out more.
<!--more-->

## Changelog

Since the last Patreon release, we've made great progress in the OS emulation and GPU emulation areas.
While some of the changes listed below are already in master or tagged for Canary, some are being released as early access to the patrons, with this build.

### OS Emulation (OS HLE)

`Public Changes`

- [#2877](https://github.com/yuzu-emu/yuzu/pull/2877) - Implemented `REV5 Audio`'s frame count.
- [#2873](https://github.com/yuzu-emu/yuzu/pull/2873) - Implemented `ioctl2` & `ioctl3` interfaces in `NVDRV` (Nvidia Services).
- [#2912](https://github.com/yuzu-emu/yuzu/pull/2912) - Fixes and Improvements to Asynchronous GPU:
  
  * New games boot with `Async` - **Fire Emblem: 3 Houses**, **Cadence of Hyrule**, and **Pokkén Tournament**.
  * Fixed the issue where games would suddenly slowdown and report wrong framerates.
  * Fixed the issue where some games would surpass frame limiting.
  * Fixed the issue where dynamic resolution re-scaler would trigger in **Super Mario Odyssey** with full-speed and wouldn't trigger heavily for under-speed games.
  * Removed artificial fence which limited `Async` to `9 ms`. 
  Now `Async` will be limited by the game and this gives performance boosts in many graphic intensive games.

`Patreon Changes`

- Implemented a new `Fair Cycle Core Timer` in order to spread work evenly on the four emulated cores.
- Improved the `New Scheduler` even further, by fixing bugs and implementing `Thread Pre-emption`.
  These improvements to the scheduler have improved performance in games like **Fire Emblem:3 Houses**, **Hyrule Warriors** and **Resident Evil 4**. <br>
  It also has allowed **Astral Chain** and other games to boot (***Not fully playable yet!***).
  
{{< imgs
    "./AC 1.png| Astral Chain"
>}}

{{< single-title-imgs
    "Fire Emblem: Three Houses"
    "./FE 1.png"
    "./FE 2.png"
    "./FE 4.png"
  >}}

  {{< single-title-imgs
      "Resident Evil 4"
      "./RE 4 Title.png"
      "./RE 4.png"
      "./RE 4 II.png"
    >}}

### GPU Emulation

`Public Changes`

- [#2891](https://github.com/yuzu-emu/yuzu/pull/2891) - Implemented `RGBX16F Format` which is used by **Rocket League** to render graphics. 
- [#2870](https://github.com/yuzu-emu/yuzu/pull/2870) - Implemented a `MME draw calls in-liner` which accumulates draw calls from the Macro Interpreter Engine (MME) and sends them as a single unified draw call, thus improving performance significantly in some titles. 
- [#2869](https://github.com/yuzu-emu/yuzu/pull/2869), [#2878](https://github.com/yuzu-emu/yuzu/pull/2878), and [#2855](https://github.com/yuzu-emu/yuzu/pull/2855) - Implemented shader instructions: `SULD`, `ICMP`, `SHFL`(Nvidia only) and `SUATOM`.
- [#2872](https://github.com/yuzu-emu/yuzu/pull/2872) - Fixed memory mapping so that it won't call GPU flushing unnecessarily anymore. 
- [#2868](https://github.com/yuzu-emu/yuzu/pull/2868) - Fixed mipmap filtering. 
- [#2833](https://github.com/yuzu-emu/yuzu/pull/2833) - Fixed stencil testing. 
- [#2914](https://github.com/yuzu-emu/yuzu/pull/2914) - Corrected `Fermi2D` to work within crop areas in order to avoid issues in Vulkan.
- [#2917](https://github.com/yuzu-emu/yuzu/pull/2917) - Added deduction method for `blits` which helps figure if a `blit` is on depth textures. 
This avoids using the fall-back method of buffer copy.

`Patreon Changes`

- Implemented `fast BRX` and fixed `TXQ`. 
This fixes graphics in **Crash Team Racing** & **The Legend of Zelda: Link's Awakening**, and also makes shaders a lot easier to be read by AMD and Intel drivers.
- Reworked shader cache system to support `fast BRX` and `TXQ` fixes.

{{< single-title-imgs
    "The Legend of Zelda: Link's Awakening"
    "./title.png"
    "./intro_house.png"
    "./no_blur_fox.png"
>}}

{{< message "Link's Awakening needs some stuff!!" >}}
**The Legend of Zelda: Link's Awakening** currently needs a few things to work:

 - a save file, to skip the initial movie. 
 - set your controller settings to `Custom > Docked > Pro Controller`. 
 - And `Async` needs to be `OFF`.
 
A save file is being linked here for users' convenience `-->` <a href="./savedata1.bin">Click here to Download</a>
{{</ message >}}

{{< message "Shader caches need to be regenerated!!" >}}
Because of the reworked shader cache system, all previously generated shader caches are `no longer valid`.<br>
**Users will have to regenerate their shader caches for all games.**
{{</ message >}}

## Screenshots

Here are some more screenshots from **The Legend of Zelda: Link's Awakening**, just for you.

{{< imgs
    "./shield_get.png"
    "./sword.png"
    "./sword_get.png"
>}}

{{< imgs
    "./graveyard.png"
    "./swamp.png"
    "./fairy.png"
>}}

{{< imgs
    "./forest1.png"
    "./forest2.png"
    "./dungeon.png"
>}}

{{< imgs 
    "./dungeon1.png"
    "./dungeon_maker.png"
    "./dungeon_maker2.png"
>}}

## Et al.

Please remember that the early access features are still being worked on, so if you encounter any bugs or have any feedback, please don't hesitate to share it with us in our patreon channels on our [Discord server](https://discord.gg/u77vRWY).

As always, we are thankful to all our 450+ patrons for their continued support.
We will keep working diligently to bring you many more improvements, so that you can keep enjoying your favourite games on yuzu.

Until next time, keep playing on yuzu! <br>
- yuzu development team

****
**If you'd like to try out this preview release, please head on over to our [Patreon](https://www.patreon.com/yuzuteam) to get access!
Thank you again for your support!**