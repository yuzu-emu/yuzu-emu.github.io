+++
date = "2019-07-02T21:55:00+05:30"
title = "yuzu Patreon Preview Release July 2019"
author = "CaptV0rt3x"
forum = 123917
+++

Hey there, people! You won’t believe what we’ve got in store for you this time!
The new Patreon preview has a big surprise waiting for you.
Hop in now, to find out more details.
<!--more-->

For the past couple of weeks, the team has been hard at work getting some important services and functions implemented. 
It’s thanks to these specific services and functions that you all will now get to play `Super Mario Maker 2` on yuzu!

Yes, you heard right, `Super Mario Maker 2` now boots and goes in-game, and is mostly playable on yuzu.
Grab our latest - Patreon preview build now, to check it out.

{{< imgs
    "./SMM2.png|Super Mario Maker 2 (Title screen)"
>}}

#### You can download this release on our [Patreon](https://www.patreon.com/yuzuteam)!

### Patreon Release Changelog

- `LR Assignment Mode` by [ogniK](https://www.github.com/ogniK5377) – This handles the press LR to bind controllers screen.
- `SwapNpadAssignment` by [ogniK](https://www.github.com/ogniK5377) – A crucial HID command.
- `Audren` Event and Audio Fixes by [ogniK](https://www.github.com/ogniK5377).

- `Prepo SaveReport` by [DarkLordZach](https://github.com/DarkLordZach).
- Filesystem Access Logging by [DarkLordZach](https://www.github.com/DarkLordZach).
- Boost Mode by [DarkLordZach](https://www.github.com/DarkLordZach) – <br> 
`Note: does NOT make yuzu faster! We do not overclock yuzu.`
- `SetInterfaceVersion` by [DarkLordZach](https://www.github.com/DarkLordZach) – Another crucial HID command.
- OSS Mii Model by [DarkLordZach](https://www.github.com/DarkLordZach) – An HLE implementation of the Mii Model system archive.

- Several GPU bug fixes by [Rodrigo](https://github.com/ReinUsesLisp) and [Subv](https://github.com/Subv).
- Implementing Conditional Rendering by [BlinkHawk](https://github.com/FernandoS27) – GPU will now execute, manage, and administer queries, avoiding code paths that are not necessary.
- New Shader Scanner by [BlinkHawk](https://github.com/FernandoS27) – A new, faster, and more reliable shader scanner that’s less prone to crashing and corrupting shader caches. This also fixes a bug with fonts.
- And the baseline `Canary version 2425`.
***

Phew, that’s quite a few new implementations.
It’s thanks to the hard work of the yuzu development team, that all of these functions are now ready for testing.
A big shout out to Hexagon12 for hunting down all of the service functions that were necessary to get `Super Mario Maker 2` in game, and also to [DarkLordZach](https://www.github.com/DarkLordZach) for orchestrating the entire project.

Here are some in-game screenshots from the Patreon preview build, just for you guys.

{{< single-title-imgs
    "Super Mario Maker 2 in-game screenshots"
    "./SMM2_1.png"
    "./SMM2_2.png"
>}}

{{< imgs    
    "./SMM2_3.png"
    "./SMM2_4.png"
>}}

**Note: All these screenshots have been taken using the Patreon preview. We removed the yuzu title-bar, to keep the beauty of images intact.**

{{< single-title-imgs
    "More Super Mario Maker 2 in-game screenshots"
    "./SMM2_5.png"
    "./SMM2_6.png"
>}}    

{{< imgs
    "./SMM2_7.png"
    "./SMM2_8.png"
>}}

~~**Note: Currently saving levels causes yuzu to crash, due to a swkbd (software keyboard) issue. But rest assured, we are working on a fix.**~~
The issue with the software keyboard has now been fixed. Please download the latest build from our patreon page.

As always, we bring this to you as a `thank you` for your patronage and dedication to our team!
Please hop on Discord and use the Patreon channels to report any new bugs, or to just say Hi and discuss the new features.
We will keep working diligently to improve yuzu and deliver you with the best possible experience while playing.

Until next time, keep playing on yuzu and have fun! <br>
- yuzu development team.

 
**If you'd like to try out this preview release, please head on over to our [Patreon](https://www.patreon.com/yuzuteam) to get access!
Thank you again for your support!**
