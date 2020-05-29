+++
date = "2020-05-28T12:00:00-03:00"
title = "Progress Report April 2020"
author = "GoldenX86"
forum = 243216
+++ 

Hello awesome yuz-ers! We hope you are all doing well. 
We have lots of material to cover in this April progress report: some new additions, bug and regression fixes, and the groundwork for future improvements that affect both Mainline and Early Access. But first, let's discuss a few really big changes.
<!--more-->

## The Big Changes

This month brought us huge improvements to compatibility, fidelity and resource management. 
[bunnei](https://github.com/bunnei), our master of serendipity, fixed a softlock in `FINAL FANTASY VIII Remastered`. 
What he didn’t know at the time is that this small fix also made `Super Smash Bros. Ultimate` playable. Thanks to this, you can now enjoy local multiplayer battles with your friends, either locally or even via Parsec!

For quite a while, Nvidia Turing users (GTX 16 series and RTX 20 series GPUs) had to deal with several rendering bugs, like black and white terrain in `Fire Emblem: Three Houses`, or black areas in `Super Monkey Ball: Banana Blitz HD`. 
[Rodrigo](https://github.com/ReinUsesLisp) fixed most of them by improving the accuracy of the shader decoder. This also fixes some bugs on older Nvidia GPUs too.

{{< single-title-imgs
    "Monochrome no more (Fire Emblem: Three Houses)"
    "./29.png"
    "./30.png"
  >}}

{{< single-title-imgs
    "No greasy black peels (Super Monkey Ball: Banana Blitz HD)"
    "./27.png"
    "./28.png"
  >}}
  
Speaking of shader decoding accuracy, [Rodrigo](https://github.com/ReinUsesLisp) improved the precision of the `HADD2` and `HMUL2` instructions, fixing some long standing bugs like the fog in `Fire Emblem: Three Houses` and the excessive brigthness in most maps in `Super Smash Bros. Ultimate`.

{{< single-title-imgs
    "You can now take off your sunglasses (Super Smash Bros. Ultimate)"
    "./33.png"
    "./34.png"
  >}}
  
{{< single-title-imgs
    "From steampunk, to the proper medieval fantasy setting (Fire Emblem: Three Houses)"
    "./15.png"
    "./16.png"
  >}}

We talked about this in its own [article](https://www.patreon.com/posts/35856792), but it deserves a mention here:
[bunnei](https://github.com/bunnei) rewrote the Virtual Memory Manager (known internally as `Project Epimetheus`), which drastically reduced the amount of RAM games use, and helped Multicore support (also known as`Project Prometheus`) become a reality.

One of the features in yuzu, and a common one in other emulators, is the ability to separate the rendering thread from the main emulation thread. This makes better use of the CPU's resources, while also helping deliver better performance.
That is exactly what Asynchronous GPU does in yuzu. Thanks to [Blinkhawk](https://github.com/FernandoS27), our Emulated GPU improved drastically, achieving better performance, stability, and accuracy.
These changes introduce the option to adjust the GPU accuracy level while playing.

{{< imgs
    "./31.png| Performance may be reduced with more accurate levels"
  >}}

{{< single-title-imgs
    "Normal accuracy (left) and High accuracy (right) (Super Mario Odyssey)"
    "./v1.mp4"
    "./v2.mp4"
  >}}


## One Line to Fix 'em All

`Toki Tori` had sound problems that were related to a floating point instruction, and while investigating the issue, 
[Merry](https://github.com/MerryMage) and [bunnei](https://github.com/bunnei) were worried that it may be a problem in [Dynarmic](https://github.com/MerryMage/dynarmic), our ARM to x64 recompiler.
It turns out the problem was just a bad default value in yuzu’s Dynarmic configuration.
Remember what we said about bunnei and serendipity? With a simple one line change, a plethora of bugs were resolved! A special mention goes to `Pokémon Sword/Shield`, as that single line fixed the softlock that plagued us for months and made the game fully playable!

Here's only a *partial* list of fixes:

+ `Pokémon Sword/Shield` - All softlocks fixed, running in tall grass fixed, hair salons fixed
+ `The Legend of Zelda`: Link's Awakening - Miniature placing fixed
+ `Toki Tori`, `Final Fantasy 7`, `Diablo 3`, `Project DIVA MegaMix` - Distorted audio fixed
+ `Team Sonic Racing` - Physics fixed
+ `Onimusha Warriors`, `Tales of Vesperia`, `The Messenger` - Game logic fixed
+ `Skyrim` - Audio looping fixed, game progresses further
+ `Oninaki` - Elevator softlock fixed
+ `All Unreal Engine 4 games` - Motion jitter fixed
+ `Super Smash Bros. Ultimate` - Fighter select jitter / flickers fixed
+ `Starlink` - Softlock fixed, game progresses further

&nbsp;

{{< imgs
    "./32.png| This sofa is no longer our enemy (Pokémon Sword/Shield)"
  >}}

## Bug fixes and improvements
[Morph](https://github.com/Morph1984) used some Kirby magic and implemented the first steps to get World of Light 
working in `Super Smash Bros. Ultimate`. 
Even though it doesn’t work yet, the first step is always the most important one!

[Kewlan](https://github.com/Kewlan) strikes once again with more quality-of-life UI improvements.
This time, they've fixed the placement of button mappings in the input settings for single joycons.

{{< imgs
    "./03.png| From this"
  >}}
  
{{< imgs
    "./05.png| To this"
  >}}

Not stopping there, Kewlan added a slider for the analog stick modifier, allowing keyboard users to half press the emulated 
sticks. Additionally, the sliders now show percentages, making them easier to read.

{{< imgs
    "./07.png| Precision"
  >}}

And to top it off, he also added a way to restore the default value for a hotkey. An important part of the user experience is having a tidy and useful interface.

{{< imgs
    "./08.png| More customization"
  >}}

[Tobi](https://github.com/FearlessTobi) fixed some of the internal workings of the input settings, and improved the games list sorting process. He also reworded some of our error and warning popups to be more user friendly.

{{< single-title-imgs
    "The old errors"
    "./19.png"
    "./21.png"
  >}}
  
{{< single-title-imgs
    "The new errors"
    "./20.png"
    "./22.png"
  >}}

Waluigi is not part of Smash, yet, but that doesn't mean he can't enjoy some limelight. 
[Rodrigo](https://github.com/ReinUsesLisp) decided to help the purple fellow and fixed the shadows in `Mario Tennis Aces`. 
The border color of textures in this game are in sRGB format, and we had some small precision errors. 
Now you can enjoy those intense matches!

{{< single-title-imgs
    "WAA! (Mario Tennis Aces)"
    "./09.png"
    "./10.png"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) added indexed QUADS to Vulkan, this brings major graphical fixes to `Xenoblade Chronicles 2` and `Fast RMX`! Some barrier fixes are still required to get `Xenoblade Chronicles 2` rendering properly, but work on these rendering fixes is on-going.

{{< single-title-imgs
    "From a dark void to RPG (Xenoblade Chronicles 2)"
    "./23.png"
    "./24.png"
  >}}

[Blinkhawk](https://github.com/FernandoS27) implemented some optimizations to the GPU command list, improving performance 
in Diablo 3 and many other games. 
He also ported a [Ryujinx](https://github.com/Ryujinx/Ryujinx) hack made by [gdkchan](https://github.com/gdkchan), `Fast GPU Time`. This helps force games to render at their maximum resolution, when they would otherwise dynamically lower it due to not hitting their target framerate. Some examples include `ARMS`, `Super Mario Odyssey`, `Splatoon 2`, `Luigi’s Mansion 3`, and `Mario Tennis Aces`. 
This is not only a graphical improvement, but also a way to avoid very high memory usage in dynamic resolution games. 
We still recommend the use of resolution mods, but if such mods are not available for your game, Fast GPU Time will help you. 
A good example of this is `The Legend of Zelda: Breath of the Wild` with the latest 1.6.0 update.

{{< single-title-imgs
    "Milk baths are over Link, go save Zelda or something (Legend of Zelda: Breath of the Wild)"
    "./35.png"
    "./36.png"
  >}}

## Fixed regressions

[Rei](https://github.com/Its-Rei) found a 3D texture regression in the Wooden Kingdom of `Super Mario Odyssey` that was affecting both Vulkan and OpenGL. 
[Blinkhawk](https://github.com/FernandoS27) investigated it and found that there was a bug in the texture cache. 
Now it works as intended again, with no more fog stripes on trees.

{{< single-title-imgs
    "As it should be (Super Mario Odyssey)"
    "./17.png"
    "./18.png"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) fixed a regression found in `Puyo Puyo Tetris` while running in OpenGL. 
With it in place, character portraits have their proper white border rendered.

{{< single-title-imgs
    "Better, right? (Puyo Puyo Tetris)"
    "./01.png"
    "./02.png"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) also fixed a regression in `Kirby Star Allies`, which restored the shading and life to this cute game. 
Kirby deserves a colorful world for his adventures!

{{< single-title-imgs
    "Poyo! (Kirby Star Allies)"
    "./25.png"
    "./26.png"
  >}}

## Future plans

[Rodrigo](https://github.com/ReinUsesLisp) also removed the need to have a Qt build with Vulkan support in Linux, which will help get Vulkan support in our Ubuntu pre-built packages.

That’s all for now, folks! See you in the May report!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
