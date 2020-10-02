+++
date = "2020-09-30T12:00:00-03:00"
title = "Progress Report September 2020"
author = "Honghoa"
coauthor = "GoldenX86"
forum = 0
+++ 

Greetings Yuz-ers! Welcome to September's progress report. This month we offer you actual dancing, pictures per second, more input fixes and additions, small Vulkan improvements, and the initial ground work needed to get Super Mario 3D All-Stars playable.

<!--more-->

## Ya like to (move it!)

Many of the most popular titles for the Nintendo Switch have mechanics that were designed with motion controls in mind, so naturally this has been a long-awaited feature a lot of people wanted to see implemented in yuzu. We are very happy to announce that, thanks to the efforts of the developer [german77](https://github.com/german77), it is now possible to [use any controller that supports motion sensing](https://github.com/yuzu-emu/yuzu/pull/4594) and play these games the way they were meant to be. Just be careful not to hit anything when you shake it!

{{< imgs
    "./motion1.mp4| Functional Motion Input ('A SixAxis tester by German77', a homebrew application)."
>}}

The development of this feature began back in July, when german77 was working on the implementation of a [native Joy-Con adapter for yuzu](https://github.com/yuzu-emu/yuzu/pull/4411) (a task which is still in the works). While he was analyzing the data sent by the controllers, he realized he could read the values reported by the accelerometer and the gyroscope too. Feeling curious about what could be done with this knowledge, he decided to experiment and see what happened if he tried implementing some buttons and analog axes and feeding them with the input from these sensors. The result was quite satisfactory: Not only this actually worked, but it would become the main motivation to investigate and implement motion controls the way it works on the Switch.

german77 was aware of the existence of a previously discontinued [PR for motion](https://github.com/yuzu-emu/yuzu/pull/3882) by [anirudhb](https://github.com/anirudhb), and decided the best course of action would be to take it from there, fixing any incompatibilities, adding new code and sorting out the subsequent bugs it produced. As he ironed out the implementation, he tested how it performed with the game `Captain Toad: Treasure Tracker`. The results this time, however, were far from satisfactory: The controls didn't feel natural and responded quite differently as they did on the Switch, indicating that there was an error in how the values sent by the controllers were processed. In order to have a better understanding of the problem, german77 developed two homebrew applications to identify and fix these deviations.

After a long period of extensive testing, and with the help of [theboy181](https://github.com/theboy181) (who focused on testing the feature on different games), german77 finally realized the root of problem laid in part of the logic of the implementation: There was an error in the transformation of a [quaternion](https://en.wikipedia.org/wiki/Quaternion) into a [rotation matrix](https://en.wikipedia.org/wiki/Rotation_matrix). For the people allergic to math, you can think of a quaternion as a system to describe orientations and rotations in a 3D space, and a rotation matrix as a "translation" from the quaternion system into the ol' (x, y, z) Cartesian coordinate system we all know and love. When the translation fails, it's only natural that the results will be completely wrong! But thankfully, once this error was fixed, almost all the games that showed problems started to work flawlessly!

{{< imgs
    "./motion2.mp4| "
>}}

{{< imgs
    "./motion3.mp4| Motion in action. Top: 'Super Mario Odyssey', bottom: 'The Legend of Zelda: Breath of the Wild'."
>}}

This feature currently works with Wiimotes, Joy-Cons, Pro Controllers, DualShock 4 Wireless Controllers, and even cellphones, provided they have an accelerometer and a gyroscope. To bridge these devices to yuzu, the implementation makes use of the DSU protocol (also known as "CemuHook UDP"), so users will need to utilize BetterJoy (for Nintendo controllers), ds4windows (for Sony controllers), or any app that supports CemuHook for cellphones and or other compatible devices in order to connect them. Make sure to try it out!

Bear in mind that devices such as generic copies of official Nintendo or Sony controllers may work, although it's not guaranteed. Needless to say, no matter how hard you shake your keyboad and mouse, that's not going to work, so please don't do it!

## I have no motion, and I must shake

If your favorite controller has no support for motion controls (such as xbox controllers), don't worry, not everything is lost. After developing the code necessary to support this feature into the emulator, german77 also made this follow-up PR to [implement a button to simulate a shake](https://github.com/yuzu-emu/yuzu/pull/4677). This will allow you to configure any key of your liking to work as if you were physically swinging your controller and activate the in-game mechanics just as well as the real thing.

While this should work with games such as `Super Mario Odyssey` and others, do note it won't be able to cover all cases or titles, as every game is different and the required input might not necessarily be just a shake.

## Remember the Rumble Pak?

Also thanks to [german77](https://github.com/german77), yuzu can now proudly boast [Rumble support](https://github.com/yuzu-emu/yuzu/pull/4291). Any SDL2 compatible device will vibrate when aksed by your Switch games. This includes but is not limited to DualShock, Xbox and Nintendo controllers.

HD Rumble is not possible because both the SDL2 specification is not compatible, and not everyone will play with Nintendo pripherals. This means that a Pro Controller or a pair of Joy-Cons will not be able to reach that level of precision, for now. Additionally, some games seem to use different ways to ask for rumble and are not supported yet, we are investigating this.

In the near future, german77 has plans to add native Joy-Con pairing support, this will allow for real HD Rumble compatibility.

## Video decoding, or how to suffer for so long with a single codec

It's finally here! After such a long wait, and thanks to the work made by [ogniK](https://github.com/ogniK5377) and [epicboy](https://github.com/ameerj), [yuzu can now play videos in-game!](https://github.com/yuzu-emu/yuzu/pull/4729) For now, `H.264` and `VP9` videos are supported, this thankfully seems to cover all released games until now. Support for `H.265` and `VP8` will come later.

{{< imgs
    "./mk8.mp4| Video Killed the Radio Star (Mario Kart 8 Deluxe)"
  >}}
  
This is possible by using [FFmpeg.](https://ffmpeg.org/) For now, decoding happens in a single CPU thread, support for multiple threads and GPU decoding is currently being worked on.

We have an entire article dedicated to showing how this feature came to be, how it works, its challenges and current limitations in more detail [here.](https://yuzu-emu.org/entry/yuzu-nvdec-emulation/) So please take your time to read it, it also includes a list of games confirmed working and not-so-working yet.

## An emulator inside an emulator

`Super Mario 3D All-Stars` is a special case, in several aspects. For starters the game is just a container for several other binary executables (known as `Program NCAs`), each one with their own Title ID. Step one to get this game to boot is to handle [a particular case like this](https://github.com/yuzu-emu/yuzu/pull/4675), a job [Morph](https://github.com/Morph1984) did. 

Good, finished, right? Wrong. Turns out, handling several integrated programs with different title IDs will make XCI game dumps conflict, as they include game and even firmware updates, to account for users without internet access. [Morph](https://github.com/Morph1984) also [had to add checks for cases like this.](https://github.com/yuzu-emu/yuzu/pull/4710)

Next step, unimplemented functions. [Morph](https://github.com/Morph1984) did a [partial implementation of `LoadOpenContext`](https://github.com/yuzu-emu/yuzu/pull/4678), a function that several collections games use. Some examples are `Clubhouse Games: 51 Worldwide Classics`, `Grandia HD Collection`, `XCOM 2 Collection`, `Baldur's Gate I and II`, `Dr Kawashima's Brain Training`. and of course `Super Mario 3D All-Stars`.

Similarly, [`GetPreviousProgramIndex` needed to be stubbed](https://github.com/yuzu-emu/yuzu/pull/4676). The end result is getting the game-selector/menu working.

{{< imgs
    "./menu.png| For now, just the menu and soundtrack sections! (Super Mario 3D All-Stars)"
  >}}
  
## Vulkan changes

`VK_KHR_timeline_semaphore` is a relatively recent Vulkan extension only supported by *desktop or laptop* GPUs. In the past, resources were being assigned with `VkFence`, and freed when arbitrarily asked, leading to a possible small pileup. With `VK_KHR_timeline_semaphore` each resource is tied to a periodically checked "GPU tick" and you only need to verify on which tick you are at the moment to know if that resource is now free.

{{< imgs
    "./vk.png| Our implementation is not that complex, this is just an example provided by Khronos"
  >}}

[Adding support for timeline semaphores on yuzu](https://github.com/yuzu-emu/yuzu/pull/4674) helps simplify the code a lot, should improve VRAM use in a small amount, and will pave the way for more important changes coming to our Vulkan implementation later on with the finalization of the `Texture Cache rewrite`. Thank you [Rodrigo](https://github.com/ReinUsesLisp) for its addition! The end result should be transparent for the user, no perceptible change besides a bit of VRAM savings.

## Bug fixes and improvements

A missing feature in the input rewrite was the ability to merge two separate single left and right Joy-Cons into a single dual Joy-Con, a function `Super Mario Odyssey` needs. [Morph](https://github.com/Morph1984) [implemented `MergeSingleJoyasDualJoy`](https://github.com/yuzu-emu/yuzu/pull/4629), so this is no longer a problem for Mario. He can return to work once again for nothing, 39 years and no rewards for the best hero the Mushroom Kingdom ever saw.

A small PSA for our Linux users, the [Qt required version has been raised to `5.12.8`](https://github.com/yuzu-emu/yuzu/pull/4638) now. Thanks [Morph](https://github.com/Morph1984) for the update! We need those new Plasma functions.

Users have been reporting input latency, so [Tobi](https://github.com/FearlessTobi) decided to [test some changes](https://github.com/yuzu-emu/yuzu/pull/4643) and see if the situation improves. To further mitigate this issue if you experience it, be sure to enable `Radeon Anti-Lag` or `Nvidia Ultra-Low Latency` in your respective driver control panel. Nothing makes you ragequit more than losing in Smash due to lag.

Now [Gamecube controllers will be autoconfigured!](https://github.com/yuzu-emu/yuzu/pull/4618) Thanks to work done by [german77](https://github.com/german77), now the Gamecube Adapter controllers will show up as devices in the input window, and their buttons will be mapped automatically. Laziness is the best.

`Clubhouse Games: 51 Worldwide Classics` now manages to boot and with a save, load the board games. [Morph](https://github.com/Morph1984) managed this by [implemention the `Get/SetNpadHandheldActivationMode` function](https://github.com/yuzu-emu/yuzu/pull/4683). The game will render almost everything in black for now, so don't consider it playable yet.

{{< single-title-imgs
    "Paint it all black (Clubhouse Games: 51 Worldwide Classics)"
    "./51a.png"
    "./51b.png"
  >}}

One of those little annoying details. If you ran a game in fullscreen and a pop-up needed to show up (for example, naming a character), it used to render behind the main yuzu window, forcing you to exit fullscreen, focus the pop-up, address the reason for it, and then continue with your game. Quite annoying indeed. [Morph](https://github.com/Morph1984) is our saviour for this one, by [using the `Qt::WindowStaysOnTopHint` flag](https://github.com/yuzu-emu/yuzu/pull/4728), the pop-ups will now show up on top of your game. Thanks a lot, poyo.

## GPU vendor specific fixes and changes

Recent Nvidia Geforce drivers (past the 446.14 version) introduced a performance regression mainly affecting `Paper Mario: The Origami King` and `Super Smash Bros. Ultimate's` menus, important enough that we had to recommend our users to stay on older driver versions until we could figure out what was going on. Turns out, the new drivers don't seem to like how Qt handles VSync, so [Rodrigo](https://github.com/ReinUsesLisp) fixed it by [calling `SwapBuffers` from the emulation thread](https://github.com/yuzu-emu/yuzu/pull/4692). This change means that Nvidia users are free to use the latest driver version without fearing low framerates.

{{< single-title-imgs
    "Just in time for Ampere, eh! Good luck getting one for now (Super Smash Bros. Ultimate)"
    "./SSBU-broken.mp4"
    "./SSBU-fixed.mp4"
  >}}

As mentioned in [July's progress report](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2020/), [toastUnlimited](https://github.com/lat9nq) continued to work in solving crashes only experienced with recent Nvidia Vulkan drivers in Linux. Thanks to work done by DXVK, the [current implementation aims to be global](https://github.com/yuzu-emu/yuzu/pull/4724), and so far we haven't got any report on getting the issue or any sort of regression. Please feel free to contact us if you are still affected by this issue.

Not a fix in yuzu's code, but in fact a fix AMD implemented in their drivers. As mentioned in the previous [August progress report](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2020/), `VK_EXT_extended_dynamic_state` was giving problems on the AMD Vulkan Windows driver. This has been fixed in the latest 20.9.2 driver version, allowing [yours truly](https://github.com/goldenx86) to [remove the previously needed blacklisting.](https://github.com/yuzu-emu/yuzu/pull/4735) No more nightmares when playing `Super Mario Odyssey`.

## Future projects

Not much information can be given right now, but you all should know that [Raptor](https://www.youtube.com/watch?v=zHalXjs0cDA) is advancing at a very impressive speed. Our devs are so preoccupied with whether they can, they don't stop to think if they should.

That's all she wrote, folks! See you next time in the October progress report!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
