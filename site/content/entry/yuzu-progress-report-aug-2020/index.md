+++
date = "2020-08-30T12:00:00-03:00"
title = "Progress Report August 2020"
author = "Flamboyant Ham"
coauthor = "GoldenX86 & Morph"
forum = 302337
+++ 

[Yahallo](https://www.youtube.com/watch?v=s28a3nVHCLo) yuz-ers! We hope you are doing well. This monthly report has a few critical topics to cover. Yet another major rewrite is done, some graphical bugs are fixed, the UI is further refined, and ghosts from our past are expelled. Here we go!

<!--more-->

## Project Mjölnir

### Part 1 - Input Rewrite

Let's start with the biggest change. One of yuzu's weakest aspects was its input support. It was riddled with bugs, not very intuitive, and lacked several critical features. Earlier this year, [jroweboy](https://github.com/jroweboy) and [Rei](https://github.com/Its-Rei) decided to start working on what would end up a complete rewrite of the input UI and its internal workings, dubbed `Project Aphrodite`.

{{< imgs
    "./oldinput.png| Never gonna give you up"
  >}}
  
As you can see in the following images, the original draft lacked some of the features we have working right now and some that we plan to add in the future. No code is ever complete, better ideas and new implementations can always be achieved. So that's exactly what happened, Rei continued to iterate on the concept design that is inspired by [RPCS3's](https://github.com/RPCS3/rpcs3) controller UI.

{{< imgs
    "./concept.png| The first draft, in all its glory"
  >}}

With this concept in mind, jroweboy implemented an automapping feature which correctly maps all the inputs upon selecting an input device.

{{< imgs
    "./automap.mp4| Finally, no more spending hours mapping controls!"
  >}}

Since jroweboy's departure from emulator development, [Morph](https://github.com/Morph1984) continued his legacy and picked up where he left off, not wanting to have all this work go to waste. With renewed hope, both Morph and Rei have taken the reins and are continuously refining the UI to achieve the best user experience possible. Their efforts have culminated in the UI we have today.

{{< single-title-imgs
    "The fruits of our labor, the triforce of themes is complete!"
    "./light.png"
    "./dark.png"
    "./midnightblue.png"
  >}}

The user experience would not be complete unless a [long standing issue where updating controllers in the UI will not update them in game](https://github.com/yuzu-emu/yuzu/issues/2906) is fixed. Knowing this, Morph decided to find out what is causing this issue and fix it along with the UI changes. With some guidance from the shark [ogniK](https://github.com/ogniK5377), he discovered that 1. The frontend was not signalling to the backend when a controller changes configuration and 2. `StyleSetChangedEvents` were not being signalled on a controller change. By fixing these two issues, he managed to fix input issues in a wide array of games and allowed users to change their controller and input devices while in game without needing to restart yuzu.

{{< imgs
    "./controllerselect.mp4| Smash players rejoice!"
  >}}

The games that demonstrated the most benefit from these fixes are `Pokemon Let's Go: Pikachu` and `Pokemon Let's Go: Eevee`, as single joycons can now be properly detected in game, bringing us one step closer to hardware accuracy.

{{< imgs
    "./plgjoycon.png| Professor Oak! Input is now in working order!"
  >}}

### Part 2 - Controller Applet

Morph began on [Part 2](https://github.com/yuzu-emu/yuzu/pull/4597) knowing that yuzu lacked an implementation of a Controller Applet, which is crucial for a lot of multiplayer games such as `Super Mario Maker 2`, `Kirby Star Allies`, `Hyrule Warriors: Definitive Edition` and many more. It had previously been [attempted](https://github.com/yuzu-emu/yuzu/pull/1940) by [DarkLordZach](https://github.com/DarkLordZach) but was riddled with issues due to the immature input implementation at the time. Therefore, Morph decided that it was time to implement it after gaining knowledge of and fixing HID in [Part 1](https://github.com/yuzu-emu/yuzu/pull/4530).

While Morph was completing the backend implementation of the applet, Rei was designing the UI that was inspired by DarkLordZach's initial implementation, with an error box showing all the issues with the current controller configuration as shown.

{{< imgs
    "./firstapplet.png| The very first concept of the Controller Applet inspired by DarkLordZach's initial implementation"
  >}}

After taking a look at this first concept, they decided that it wasn't very intuitive for the user. One morning, as Morph was about to finish the backend implementation, [Rei](https://github.com/Its-Rei) had an epiphany to replicate the Switch's native UI for the `Controller Applet` and whipped up the concept design you see below:

{{< imgs
    "./secondapplet.png| The one that started it all"
  >}}

As you can see, this was much closer to the design we have now, but was lacking some features such as the number of supported controllers, LED pattern, border color, and explain text.
Wanting to get as close to the Switch's design as possible, Morph implemented these features one by one, and the frontend UI was adapted by Rei to include these features, bringing us to the final design we have now.

{{< single-title-imgs
    ""
    "./supportedplayers.png"
    "./ledpatterns.png"
  >}}

{{< single-title-imgs
    "It's all coming together now"
    "./bordercolor.png"
    "./explaintext.png"
  >}}

As the design was now complete, Morph hooked up all of these features from the backend to the frontend and produced these clean and pretty results!

Below are comparisons between the Nintendo Switch's and yuzu's Controller Applets:

{{< single-title-imgs
    "Mario Kart 8 Deluxe"
    "./mariokart8deluxe-switch.png"
    "./mariokart8deluxe-yuzu.png"
  >}}

{{< single-title-imgs
    "Kirby Star Allies"
    "./kirbystarallies-switch.png"
    "./kirbystarallies-yuzu.png"
  >}}

{{< single-title-imgs
    "Super Mario Maker 2"
    "./smm2-switch.png"
    "./smm2-yuzu.png"
  >}}

### There is still more to come!

There is always room for improvement, keep your eyes peeled for future additions and features!

As we cannot fit in all the changes present in both parts, our more tech savvy users can read about all the changes in the following PRs: [[Mjölnir Part 1]](https://github.com/yuzu-emu/yuzu/pull/4530), [[Mjölnir Part 2]](https://github.com/yuzu-emu/yuzu/pull/4597).

## Bugfixes and improvements

[Khronos](https://www.khronos.org/) recently added the new `VK_EXT_extended_dynamic_state` extension to the Vulkan API, and driver support is slowly being completed by the vendors. Per the norm with newly supported extensions, you can expect stuff to be in a *non-perfect* state, or as we like to say, "Expect Dragons." AMD recently added support for this extension in the 20.8.3 Windows driver, but part of it is glitched, resulting in graphical errors in games like `Super Mario Odyssey`. [Rodrigo](https://github.com/ReinUsesLisp) temporarily solved this by [blacklisting the extension on the AMD Windows drivers until it is fixed](https://github.com/yuzu-emu/yuzu/pull/4599). Intel doesn't support `VK_EXT_extended_dynamic_state` at the time of writing this, and Nvidia had already fixed their issues with the extension.

{{< single-title-imgs
    "Mario stared into the abyss, and the abyss stared back (Super Mario Odyssey)"
    "./smobug.png"
    "./smofix.png"
  >}}

Continuing with `VK_EXT_extended_dynamic_state`, a glitch affecting `Super Smash Bros. Ultimate`, and others, was discovered when using this new extension. Attack sprites were missing during gameplay, but [Rodrigo](https://github.com/ReinUsesLisp) was able to [solve the issue on all compatible drivers](https://github.com/yuzu-emu/yuzu/pull/4555).

{{< single-title-imgs
    "The Master Sword can't just look like a regular sword (Super Smash Bros. Ultimate)"
    "./smashbug.mp4"
    "./smashfix.mp4"
  >}}

Thumbnail pictures in in-game save slots were a black rectangle for most games up until now. By [fixing block linear copies](https://github.com/yuzu-emu/yuzu/pull/4453), [Rodrigo](https://github.com/ReinUsesLisp) prevented users from loading up the wrong save or course by mistake in games such as `The Legend of Zelda: Breath of the Wild` and `Super Mario Maker 2`.

{{< single-title-imgs
    "Ohh, this one was my good course! (Super Mario Maker 2)"
    "./smm2bug.png"
    "./smm2fix.png"
  >}}
  
## Precision has a cost

Up until now, CPUs lacking the FMA instruction set had to run generic code as fallback. After a lot of work, [Merry](https://github.com/MerryMage) added [optimizations intended for CPUs lacking the `FMA instruction set`](https://github.com/yuzu-emu/yuzu/pull/4541). 

This means that users with CPUs from the AMD Phenom II series or older, Intel 3rd generation Core-i series or older, and all Pentium, Celeron and Atom CPUs can now select the "Unsafe" setting and see major performance improvements in almost all games. Don't bother to try this setting on CPUs that have FMA, as it will not improve your performance in that case.

However, due to being a less precise alternative, expect emulation inaccuracies if you decide to enable it. Here be dragons, as they say.

{{< imgs
    "./fma.png| You can find it here"
  >}}

## UI Changes

As part of the input rewrite, [Rei](https://github.com/Its-Rei) fixed several consistency bugs affecting the `Midnight Blue` UI theme. You can see the results below.

{{< single-title-imgs
    "Input window fixes, before (left) and after (right)"
    "./input_before.png"
    "./input_after.png"
  >}}
  
&nbsp;
  
{{< single-title-imgs
    "Gamelist fixes, before (left) and after (right)"
    "./main_before.png"
    "./main_after.png"
  >}}

Both of our dark themes (Dark and Midnight Blue) had a transparency bug affecting the per-game settings pop-up window. [toastUnlimited](https://github.com/lat9nq) made the necessary changes to fix this by [setting QLabel background color to transparent](https://github.com/yuzu-emu/yuzu/pull/4420). You can see the changes below.

{{< single-title-imgs
    "Dark theme, before (left) and after (right)"
    "./darkbug.png"
    "./darkfix.png"
  >}}

&nbsp;

{{< single-title-imgs
    "Midnight Blue theme, before (left) and after (right)"
    "./midnightbug.png"
    "./midnightfix.png"
  >}}
  
[toastUnlimited](https://github.com/lat9nq) also added an option to [access game specific settings while playing.](https://github.com/yuzu-emu/yuzu/pull/4515) This makes it easy to change graphics accuracy or other settings on the fly.

{{< imgs
    "./pergame.png| Found it!"
  >}}

`Force 30FPS` was an option that was used for debugging, and as an emergency brake for the old days when yuzu lacked a proper frame limiter. The fate of this tick-box was undecided for long, moving it to the `Debug` tab was considered at one point. But in the end, it was finally [removed by](https://github.com/yuzu-emu/yuzu/pull/4446) [Morph](https://github.com/Morph1984). This option was no longer functional after the changes of `Project Prometheus` took effect, so this was a necessary sacrifice.

Our users reported that some checkboxes were duplicated after the addition of Vulkan. These were `Dump Decompressed NRO` and `Dump ExeFS` which could be found both in `General > Debug` and `System > Filesystem > Patch Manager`. [Tobi](https://github.com/FearlessTobi) put an end to this clone war, [removing the duplicates in Debug](https://github.com/yuzu-emu/yuzu/pull/4429).
  
## Future Projects

[epicboy](https://github.com/ameerj) is working on a universal, GPGPU (General-Purpose GPU) accelerated method to decode ASTC textures. We shall hear more of this after the Texture Cache rewrite is finished.

Whispers of more audio changes have been heard, and a certain shark will be responsible for this.

[Devs uh... find a way.](https://www.youtube.com/watch?v=D8zlUUrFK-M)

That's all for now folks! See you again in the September progress report!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
