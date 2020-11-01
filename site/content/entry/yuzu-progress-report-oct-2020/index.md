+++
date = "2020-10-25T12:00:00-03:00"
title = "Progress Report October 2020"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++ 

How is it going, yuz-ers? Here work continues. This month's report offers you input fixes, changes and additions, Vulkan and OpenGL stability fixes, and news on the continued fight to make Super Mario 3D All-Stars render. 

<!--more-->

## Project Mjölnir

### Part 3 - Rumble, profiles and improvements



## Back to the Pokéfuture

A very requested fix, and understandably so. Pokémon has long been a franchise that uses time as a game mechanic, and in yuzu, this feature was not working as intended in `Sword and Shield`. What would normally be saving, closing yuzu and coming later expecting time to naturally pass, ends up as if nothing happened, rendering several events (like berries respawn, changing weather, Pokéjobs, different Pokémon spawns, or just simple time of day changing) useless. We don't have a proper fix to naturally progress time yet, but for now, thanks to work done by [bunnei](https://github.com/bunnei), it is posible to [bypass this problem by changing the clock in real time from yuzu's settings while playing.](https://github.com/yuzu-emu/yuzu/pull/4792)

You can find the setting in Emulation > Configure > System, enable `Custom RTC` and time travel!

{{< imgs
    "./rtc.png| Try to avoid changing the divergence value, Doc!"
  >}}

## [Greetings Professor! Fixes to report!](https://www.youtube.com/watch?v=xr-aIARiea4)

[Rodrigo](https://github.com/ReinUsesLisp) has for us a couple of stability improvements for `Fire Emblem: Three Houses`, for now involving Vulkan and assembly shaders (GLASM).

On the Vulkan side, [managing primitive topologies as fixed state](https://github.com/yuzu-emu/yuzu/pull/4782) fixes regressions introduced by recent Nvidia drivers, but it has been reported to also help AMD Radeon users quite a bit too.

On the GLASM side, and helping the most for our Nvidia users, [implementing robust buffer operations](https://github.com/yuzu-emu/yuzu/pull/4807) like it is done in GLSL helps make the game playable when using this very useful shader implementation.

{{< imgs
    "./fe3h.png| I have something to ask of you (Fire Emblem: Three Houses)"
  >}}
  
Crashes will still be experienced in specific chapters of the game, like Ch. 15 and Ch. 17. For those cases, we can offer you a workaround:

1. You need to get old `yuzu 66`from [here](https://github.com/yuzu-emu/yuzu-mainline/releases?after=mainline-0-70). 
2. Set it up as a standalone version by extracting it and creating an `user` folder where `yuzu.exe` is located.
3.  This folder will replace `%appdata%\yuzu`, so you need to extract a copy of your keys there, along with any save data you want to transfer to get past the crashes. Make sure to also copy your `nand` folder so you can transfer all DLC and updates to the standalone yuzu 66.
4. Play the game, expect tons of glitches and pretty bad performance for such an old build. Save after the crashing area and transfer that save to the latest `Mainline/Early Access` version you are using, and continue playing regularly from there.

## Emuception

[bunnei](https://github.com/bunnei) seems to have a personal vendetta with `Super Mario 3D All-Stars`.

He has [implemented the nvhost_as_gpu::FreeSpace service](https://github.com/yuzu-emu/yuzu/pull/4783), [BufferQueue::CancelBuffer service](https://github.com/yuzu-emu/yuzu/pull/4784), [stubbed IManagerForApplication::StoreOpenContext](https://github.com/yuzu-emu/yuzu/pull/4793), [rework the program loader to better handle multiple processes](https://github.com/yuzu-emu/yuzu/pull/4799), [fix crashes when trying to launch subsequent games](https://github.com/yuzu-emu/yuzu/pull/4832) and finally [improve GPU synchronization.](https://github.com/yuzu-emu/yuzu/pull/4869). 

The last one also improves stability in games like `Luigi's Mansion 3`. Only thing missing to get `Super Mario 3D All-Stars` rendering is the `Texture Cache Rewrite`.

## NVDEC improvements

Work on video decoding continues, thanks to [epicboy](https://github.com/ameerj). Some games like `Onimusha: Warlords` or `Ni no Kuni`had an incompatible `BGRA8` format in our first NVDEC implementation. Now they render correctly.

{{< imgs
    "./ninokuni.png| Working menu rendering (Ni no Kuni)"
  >}}
  
Additionally, games like `FINAL FANTASY XII THE ZODIAC AGE`, `The Legend of Zelda: Link's Awakening` or `Onimusha: Warlords` had problems on memory addressing, causing poor performance and glitches. Consider this as also solved.

{{< imgs
    "./onimusha.png| Happy moments (Onimusha: Warlords)"
  >}}
  
And not least important, NVDEC is now in Mainline too! Anyone can now enjoy they in-game videos in yuzu. As tradition for all merged Pull Requests, [Lioncache](https://github.com/lioncash) didn't take long to [clean it up.](https://github.com/yuzu-emu/yuzu/pull/4837)
  
## Yes, even more input changes

We have some great changes, work of [german77](https://github.com/german77). Thank you!

To start with, now [buttons that are impossible to use on certain input configurations are now blocked](https://github.com/yuzu-emu/yuzu/pull/4742). For example, if an emulated Pro Controller is changed to a left Joy-Con, the right stick, A, X, Y and Z will no longer be accessible to the games. No cheating!

Up next, some devices have access to an accelerometer, but lack a gyroscope. While this setup is basically useless for full motion, it can be used to detect simple shaking motions, [so we don't see why not add support for that.](https://github.com/yuzu-emu/yuzu/pull/4757)

And finally, for our traditional fighters out there, improvements in GC adapters. Now [adapters can be hotplugged, basic rumble support was added and compatibility with more vendors was improved.](https://github.com/yuzu-emu/yuzu/pull/4781)

[FrogTheFrog](https://github.com/FrogTheFrog) tuned up [the shake values](https://github.com/yuzu-emu/yuzu/pull/4727) to improve compatibility with the rare `Steam Controller`. Wouldn't having Portal and Portal 2 on Switch be awesome?

## Bug fixes and improvements

[bunnei](https://github.com/bunnei) [changed the values for `Multicore`, `Asynchronous GPU` and `Assembly Shaders`](https://github.com/yuzu-emu/yuzu/pull/4805) to enabled by default. This will help provide a much better experience out of the box to all users that haven't changed those values already. Some other advanced settings like `Asynchronous shaders` are not altered by this change as they still require further testing and bug-fixing.

By [implementing CUBE textures and fixing an issue with arrays,](https://github.com/yuzu-emu/yuzu/pull/4766) [Rodrigo](https://github.com/ReinUsesLisp) made the `Pikmin 3: Deluxe Demo` playable. This will most likely help in making the final game playable.

{{< imgs
    "./pikmin3.png| Thanks GG for the capture! (Pikmin 3: Deluxe Demo)"
  >}}
  
In a minor change to Vulkan, [Rodrigo](https://github.com/ReinUsesLisp) [changed the way GPU devices are sorted in yuzu,](https://github.com/yuzu-emu/yuzu/pull/4765) helping pick the best GPU according to yuzu's current compatibility and needs.

{{< imgs
    "./vklist.png| One of our developer's system, gotta render 'em all!"
  >}}

The current method will give priority to the GPU vendor following the `Nvidia > AMD > Intel` order. Then, dedicated hardware will take priority over integrated, for example an RX 570 will have a higher priority than an Intel UHD630. Finally, the device name will be considered, a GTX 1650 will be selected over a GTX 1060.

In the previous progress report we mentioned that we removed a blacklist on AMD GPUs for the `VK_EXT_extended_dynamic_state` Vulkan extension. Turns out, RDNA1 GPUs crash to desktop while using this extension, so [Rodrigo](https://github.com/ReinUsesLisp) (while using your writer's PC) had to [manually add a new blacklist only including current Navi based GPUs.](https://github.com/yuzu-emu/yuzu/pull/4772) One would expect that an informed extension is tested before releasing the drivers that start supporting it... Latest 20.10.1 driver version from AMD seems to revert to an older Vulkan version lacking this extension, so the Red Team is aware of the issue.

[epicboy](https://github.com/ameerj) changed how `Asynchronous Shaders` [determines the amount of threads to use,](https://github.com/yuzu-emu/yuzu/pull/4865) increasing it for higher thread count CPUs. Past the 8 threads mark, one shader thread is added every two CPU threads.

| CPU Threads | Shader Threads | Example CPUs |
| :-----------: | :--------------: | ------------ |
| 1 - 7 | 1 | R3 3200G, i3-6100 |
| 8 | 2 | R3 3300X, i3-10100 |
| 12 | 4 | R5 3600, i5-10400 |
| 16 | 6 | R7 3700X, i7-10700K |

[Kewlan](https://github.com/Kewlan) is back again, fixing another important UI bug. This time, yuzu will [no longer ask for a profile if there is a single one created.](https://github.com/yuzu-emu/yuzu/pull/4817) The devil is in the details.

[Morph](https://github.com/Morph1984) [added a check to see if a directory is a `nullptr`.](https://github.com/yuzu-emu/yuzu/pull/4785) This fixes the creation of a save in `Hades`. More work is needed to get the game playable.

With the demo just released, [Rodrigo](https://github.com/ReinUsesLisp) started the work to get `Hyrule Warriors: Age of Calamity - Demo Version` playable. By implementing [FCMP immediate](https://github.com/yuzu-emu/yuzu/pull/4853) and [texture CUBE array shadows](https://github.com/yuzu-emu/yuzu/pull/4854) the game starts to render.

{{< imgs
    "./aoc.png| Where are my glasses? (Hyrule Warriors: Age of Calamity - Demo Version)"
  >}}
  
I personally want to thank [Lioncache.](https://github.com/lioncash) He's not mentioned much in the progress reports due to how technical are the changes and fixes he implements, but he is without a doubt the biggest contributor to the project. Thank you Lion, for the patience you have, and the huge help you give us.

## Future changes

There are some important core fixes in the works, NVDEC has more plans in its way, and there is now a roadmap of what will follow the Texture Cache Rewrite once its done, but we will tell you more about that later.

And that's all folks! Thank you so much for reading, and see you all in the next progress report!
Thanks RodrigoTR for the pics!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
