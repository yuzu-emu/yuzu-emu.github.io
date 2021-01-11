+++
date = "2021-01-07T12:00:00-03:00"
title = "Progress Report December 2020"
author = "Honghoa"
coauthor = "GoldenX86"
forum = 0
+++ 

Happy New Year, dear yuz-ers! 2020 is finally behind us, so what better way to start 2021 than with a progress report? Follow us for a summary of the last changes yuzu saw in 2020, and a small preview of what will come. This time we offer you kernel changes, new input and user interface additions, and the first changes applied to get the Buffer Cache Rewrite finished.

<!--more-->

## General improvements and bug fixes

[epicboy](https://github.com/ameerj) has been busy squashing bugs, in this case [killing two with one PR.](https://github.com/yuzu-emu/yuzu/pull/5201) In some instances, we were trying to read data from an nvflinger buffer before it even existed. By adding a check addressing this, `Yoshi’s Crafted World` now boots, albeit with several graphical glitches.
This PR also fixes how buffers are accessed, so several games now boot for the first time. Some examples include: `Katana ZERO`, `DELTARUNE Chapter 1`, `Dragon Ball FighterZ` and `Wonder Boy: The Dragon’s Trap`.

{{< imgs
	"./katanazero.png| "
  >}}

{{< imgs
	"./wonderboy.png| Now booting!"
  >}}

A PSA for our Intel graphics users. With the release of the Windows driver version `27.20.100.9126`, Intel added support for not only the much needed `VK_EXT_robustness2`, but also `VK_EXT_custom_border_color`, improving performance and stability with the former extension and solving rendering issues in `The Legend of Zelda: Breath of the Wild` with the latter. Nothing better than free improvements for our integrated graphics crew running Vulkan. Latest is best!

Linux distributions compatibility, and the dependency issues that come with it, have been a long standing problem for our tuxedo-wearing users... Until now.

Thanks to [toastUnlimited,](https://github.com/lat9nq) we now provide [AppImage builds,](https://appimage.org/) simplifying the installation process considerably. AppImages  eliminate the dreaded dependencies issues, and bringing back support for Ubuntu 18.04, Debian Buster, CentOS 8, and many older distributions.

In the future, Early Access will finally be able to be distributed pre-compiled like this, the promise has been made. Thanks to the reduced source code compilation work hours, the CPU Union approves of this change.

During the time the Texture Cache Rewrite spent in Early Access, several regressions have been fixed. One of the notorious ones is related to the camera rune in `The Legend of Zelda: Breath of the Wild`.

{{< imgs
	"./camera.png| "
  >}}

As you can clearly see with [Rodrigo’s](https://github.com/ReinUsesLisp)... art, the game informs two different size values for the same texture, named `pitch` and `width`, so yuzu didn’t transfer needed information between them as it considered them different textures. By changing this behaviour, entities like animals, flowers, enemies, etc. are properly registered by the camera now.

{{< single-title-imgs
    "Tony, get the boulder (The Legend of Zelda: Breath of the Wild)"
    "./botwbug.png"
    "./botwfix.png"
  >}}

There were some crashes when exiting yuzu that was related to the telemetry process. [Tobi](https://github.com/FearlessTobi) ported a fix from [Citra](https://github.com/citra-emu/citra) that [changes the type of `AddField` to a string,](https://github.com/yuzu-emu/yuzu/pull/5127) squashing one bug down.

A commonly reported issue was that configuration changes are lost if yuzu crashes. [toastUnlimited](https://github.com/lat9nq) changed this behaviour to simply [save the current settings before booting a game.](https://github.com/yuzu-emu/yuzu/pull/5217) This change saves several headaches.

[Morph](https://github.com/Morph1984) implemented the [new OSS fonts](https://github.com/yuzu-emu/yuzu/pull/5200) that [Rei](https://github.com/Its-Rei) put together. With this, users no longer require to dump the Switch firmware to get proper button fonts. The firmware dumping process is still needed for games that have Mii related content.

{{< single-title-imgs
    "It’s far cleaner to have ZL and ZR as a trigger button, than just the letters alone, don’t you agree? (Super Mario Maker 2)"
    "./smm2fontbug.png"
    "./smm2fontfix.png"
  >}}

A separate PR [added +/-](https://github.com/yuzu-emu/yuzu/pull/5205) to the fonts.

{{< single-title-imgs
    "THE anime swordsman (Super Smash Bros. Ultimate)"
    "./smashfontbug.png"
    "./smashfontfix.png"
  >}}

{{< imgs
	"./fonts.png| Some insight in the process behind this."
  >}}

Some games report the wrong device handle when sending vibration signals, like `NEKOPARA Vol. 3` (don’t Google this series). [Morph](https://github.com/Morph1984) fixed this by [validating the device handles before use.](https://github.com/yuzu-emu/yuzu/pull/5190) Man of culture.

## UI changes

Finally, a very needed User Interface change, [language support](https://github.com/yuzu-emu/yuzu/pull/5239) is here. Thanks to work done by [Tobi](https://github.com/FearlessTobi) and many, *many* members of the community from around the globe, we can now offer support for 11 different languages, plus regional variations. ¡Muchas gracias!

{{< imgs
	"./language.png| You can find this in Emulation > Configure > General > UI > Interface language"
  >}} 

Anyone is welcome to help [expand the available language list.](https://www.transifex.com/yuzu-emulator/yuzu)

For our command-line or shortcut lovers, [Morph](https://github.com/Morph1984) adds [command-line arguments.](https://github.com/yuzu-emu/yuzu/pull/5229) Current options are:

- `yuzu.exe "path_to_game"` - Launches a game at `path_to_game`.
- `yuzu.exe -f` - Launches the next game in fullscreen.
- `yuzu.exe -g "path_to_game"` - Launches a game at `path_to_game`.
- `yuzu.exe -f -g "path_to_game"` - Launches a game at `path_to_game` in fullscreen.

Feel free to create desktop shortcuts of all of your games!

Thinking of our fast typers, [toastUnlimited](https://github.com/lat9nq) added several [menubar access hot-keys](https://github.com/yuzu-emu/yuzu/pull/5223). Now, for example, a user can press `Alt + F, R, ENTER` to load the most recently played game. Look Ma! No mouse!

[german77](https://github.com/german77) added the option to [resize yuzu’s window to 1920x1080](https://github.com/yuzu-emu/yuzu/pull/5178), on top of the traditional 1280x720. This ensures a perfect 1:1 pixel ratio with native 1080p games while playing windowed, for those with high-resolution displays.

{{< imgs
	"./resize.png| "
  >}} 

## Input changes

[german77](https://github.com/yuzu-emu/yuzu/pull/5178) is back in action with a couple of input improvements.

Adding a way to invert an analog stick axis was a problem we did not expect to have on Xbox and PlayStation controllers, but some alternative brands don’t seem to follow the specifications very closely. Now if you right-click on an axis, you get the [option to invert it.](https://github.com/yuzu-emu/yuzu/pull/5233) 

{{< imgs
	"./invert.png| "
  >}} 

This is also a great way to invert a camera if a game doesn’t allow it in its own settings, for example in `Star Wars Jedi Knight II: Jedi Outcast`.

Analog triggers were sometimes mapped inverted to what the user intended. As a way to avoid some bad moments to our users, now [the program takes two samples when mapping an analog trigger,](https://github.com/yuzu-emu/yuzu/pull/5265) to better determine the direction of movement. This was [ported from Citra](https://github.com/citra-emu/citra/pull/5509), so thanks, guys!

A few games like `Voez` and `The Room` require specific touch gestures, and to achieve that, [multitouch support was added.](https://github.com/yuzu-emu/yuzu/pull/5270) With this, yuzu now offers support for up to 16 touch inputs with the keyboard, touch screen or via UDP services.

{{< imgs
	"./room.png| "
  >}} 

## Preliminary work for the Buffer Cache Rewrite

While we sadly couldn’t give you a Christmas present in the form of the `Buffer Cache Rewrite` (or BCR for short), the preliminary work needed to have it ready has started. [Rodrigo](https://github.com/ReinUsesLisp) has his hands full with cleaning up the TCR recently merged into Mainline, the current internal work and testing on the BCR, and his first steps with `Project Hades`. *“Sleep is for the weak”* indeed.

{{< imgs
	"./rodrigo.png| And you don't seem to understand... (Rodrigo sleeping)"
  >}} 

We will go in-depth once BCR is completed, but one of the required features is [having access to Vulkan at all times](https://github.com/yuzu-emu/yuzu/pull/5225) to make use of `interop`, a driver feature (or as Rodrigo calls it, a monstrosity) that allows developers to cross-code between different graphics APIs on Nvidia and AMD products. This way, [Vulkan can be used from OpenGL if it offers a better solution to a problem.](https://github.com/yuzu-emu/yuzu/pull/5230)

A rather interesting change needed is [related](https://github.com/MerryMage/dynarmic/pull/566) to [Dynarmic](https://github.com/MerryMage/dynarmic). By [masking data in three lower pointer bits](https://github.com/yuzu-emu/yuzu/pull/5249) before reading them, Rodrigo can now store required information of the page tables without needing to use a lock, saving precious execution time and, at most, some 128MB of system memory.

Lastly, [additional granularity in the CPU pages.](https://github.com/yuzu-emu/yuzu/pull/5262) This PR allows informing if the CPU or the GPU modified a range of data in the CPU page. If the relevant range was modified by the CPU, it must be uploaded to the GPU. Processors supporting the `BMI1` instruction set will get a slim performance improvement, these include Intel Haswell (Gen. 4) or newer, and AMD Piledriver (2nd Gen. FX)/Jaguar or newer.

## Future projects

It’s no surprise, but the `Buffer Cache Rewrite` is close to release. Vulkan performance and stability improvements are planned, with kernel improvements continuing to be a high priority.
Plus we also have some other interesting things we’ll reveal later on.

That’s all folks! Thank you so much for sticking around. See you next time in the January progress report! Take care and stay safe!
Thanks to Darkerm and Morph for helping with the pictures.

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
