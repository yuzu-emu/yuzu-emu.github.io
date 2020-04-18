+++
date = "2020-04-19T04:00:00-03:00"
title = "Progress Report March 2020"
author = "GoldenX86"
forum = 217502
+++ 

How are you doing in this quarantine, yuz-ers? We hope you are all staying in your homes safe and sound.
Today, we are bringing you a report on a few changes from the past month for both the Early Access and regular Mainline versions of yuzu.
<!--more-->

We have on our plate a couple of bug fixes, some graphical improvements, the first “performance win” for Intel GPUs, a really serious case of serendipity, and some groundwork for amazing improvements that will be coming to you in a “near-ish” future.

## Bug fixes and improvements

After some intensive debugging by [Rodrigo](https://github.com/ReinUsesLisp), an OpenGL rendering bug in ARMS (that was with us since the game started to boot), was solved by simply updating our buildbot VM from Visual Studio 2017 to the latest 2019 version.
Thanks to [DarkLordZach](https://github.com/DarkLordZach) for the change!

PSA - Please update to or install the latest [Visual C++ 2019 x64 redistributable](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads), or else you won’t be able to open yuzu, as it will complain that the library VCRUNTIME140.dll cannot be found.

{{< single-title-imgs
    "Better, right?"
    "./03.png"
    "./04.png"
  >}}

perillamint and [bunnei](https://github.com/bunnei) stubbed (this means to send a fake `everything’s OK` signal so the game can continue) some VR related services.
These changes are needed for version 1.6.0 of The Legend of Zelda: Breath of the Wild, 1.3.0 of Super Mario Odyssey, and versions 3.1.0 and above of Super Smash Bros. Ultimate.

Commercial games aren't everything.
[Rodrigo](https://github.com/ReinUsesLisp) decided to give homebrew lovers and old-school gamers something to play with, by implementing some attributes from the old OpenGL 1.X and 2.X days.
It’s now possible to run `Xash3D`, so you can frag in Counter-Strike, or follow G-Man’s orders in Half-Life!
Currently, this needs to be manually built with newer dependencies, but that should be solved for good in the near future.

Margen67 and [Morph](https://github.com/Morph1984) wanted to improve the graphics for games and so they added Anisotropic Filtering (AF) to yuzu.
With this feature in place, distant textures now look much sharper, improving game quality even over what the original Switch does! 
Games like Pokémon Sword, Pokémon Shield, and Fire Emblem Three Houses benefit a lot from this.
However, some other games don’t respond well to this new feature, one example being Astral Chain. Feel free to experiment with it!

An example in Pokémon Sword:

{{< imgs
    "./15.png| AF Off"
    "./14.png| AF 16x"
  >}}
  
And another example in Fire Emblem Three Houses:  
  
{{< imgs
    "./01.png| AF Off"
    "./02.png| AF 8x"
  >}}

Shader cache invalidations are something our users don’t like at all. 
We don't too, but it’s all part of the process of improving yuzu to achieve better performance and accuracy.
For example, one of our recent invalidations was needed to fix the reflections in Luigi’s Mansion 3, making certain parts of the game playable.

Because dancing is important, [namkazt](https://github.com/namkazt) and [Rodrigo](https://github.com/ReinUsesLisp) have been fighting with the code, allowing us to enjoy 3D graphics in Hatsune Miku: Project DIVA MEGA39's, and as collateral, fixed some rendering issues in Bayonetta 1 and Super Smash Bros. Ultimate.

{{< imgs
    "./07.png| Miku Miku Dance!"
  >}}

{{< single-title-imgs
    "Super Smash Bros. Ultimate's menu (Before & After)"
    "./08.png"
    "./09.png"
  >}}

[Kewlan](https://github.com/Kewlan), a regular in our Discord Server, submitted a small change to our input mapping GUI, changing the position of the shoulder buttons so they no longer make anyone angry.

{{< imgs
    "./11.png| Incorrect."
    "./12.png| Much better."
  >}}

We also have a cool improvement by [Tobi](https://github.com/FearlessTobi).
The Switch is a surround sound compatible console and our implementation of downmixing removed any channel that wasn’t left or right.
By keeping the extra channels and mixing them in the left and right stereo outputs, the sound in tons of games, including Luigi’s Mansion 3, Sonic Forces, and Bayonetta, has been improved.

## A peculiar case of "Even a broken clock is right twice a day!"

The Nintendo Switch supports `ASTC`, a type of texture format generally used in mobile hardware such as phones and tablets in order to reduce bandwidth usage (a limited resource in those devices).
Since it's a heavily compressed format, decoding it via the CPU, like it is normally done on PC, is a time-consuming task.

To give an example, Astral Chain is a game that uses `ASTC` very extensively and in bizarre ways, as previous fixes and optimizations have shown.
On NVIDIA and AMD graphics hardware, the first scene of a new game normally takes typically `17` seconds to load. The GPU has to wait for the CPU to decode all the `ASTC` textures first, thus, slowing down the whole process.

Thanks to [Rodrigo's](https://github.com/ReinUsesLisp) research, it was discovered that on any recent Intel GPU this same operation is immediate and occurs with no delay, thanks to it being the only vendor providing a native `ASTC` decoder in their hardware.
That’s right, the best way to experience Astral Chain in yuzu is with a small, and typically inferior, iGPU (like the ones that come in any desktop or notebook CPU from Intel).

On the topic of formats, implementing the `RG32` and `RGB32` vertex formats fixed a room that refused to load in The Legend of Zelda: Link’s Awakening in Vulkan.
Great work [Rodrigo](https://github.com/ReinUsesLisp)!

{{< imgs
    "./13.png| Works!"
  >}}
  
## Paving the road for even bigger changes

[Rodrigo](https://github.com/ReinUsesLisp)'s initial work on Transform Feedback has concluded and is now partially working. 
This already helps games like POKKÉN Tournament DX, Donkey Kong Country: Tropical Freeze and Xenoblades Chronicles.

An optimization by [Blinkhawk](https://github.com/FernandoS27) reduced the use of RAM by 1GB.
When talking about RAM usage, less is best!

Now, an important but also astonishing fix; one that nobody expected, not even our project leader [bunnei](https://github.com/bunnei).
While he was working on fixing what seemed to be a simple bug on Final Fantasy VIII, he also accidentally fixed Super Smash Bros. Ultimate fights!
This case of serendipity is without a doubt a surprise, but a welcome one.

Now all users can brawl all they want thanks to a measly 5-line change in yuzu’s code!
However, keep in mind that any Super Smash Bros. Ultimate update newer than 3.1.0 will work, but will also make the characters T-pose, resulting in hilarious fights and victory screens.
We’re working on resolving this, but for now, stick to update 3.1.0 or older!

[bunnei](https://github.com/bunnei) fixed audio crackling in various games like Crash Team Racing and Super Mario Odyssey.
We are slowly, but surely, improving our audio quality.
He also implemented initial support for `32-bit ARM` emulation. 
Nothing tangible can be tested yet, but thanks to this, it will be possible in the future to run `32-bit` games like Mario Kart 8 Deluxe.

And last but not least, [Blinkhawk](https://github.com/FernandoS27) has been making some serious changes to the yuzu's GPU emulation, while also laying the foundation for the recent rework of yuzu's Virtual Memory Manager (codename: Project Epimetheus).

These, in turn, will help further advance the development of Project Prometheus; one of the super-secret Projects our devs are currently working on to bring some considerable changes to yuzu’s performance and hardware requirements.
Stay tuned to hear more about them in the future!

That’s all for now folks, see you on the April report.

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
