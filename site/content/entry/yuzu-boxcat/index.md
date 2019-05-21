+++
date = "2019-05-23T23:00:00+05:30"
title = "New Feature - Boxcat"
author = "CaptV0rt3x"
forum = 108808
+++

Good day, yuzu fans! 
Today we bring you another exciting Switch feature which will create opportunities, for new in-game content across various games!
Without further ado, let's get started! 
<!--more-->

### What?

Yes, you heard that correctly.
New in-game content across various games, with events held occasionally.

### How?

The Nintendo Switch has a network service called `BCAT`, using which games can add new content dynamically, i.e. new content without updating the game itself.
Nintendo can push new content to various games via this service, whenever it wants.
Some examples of this type of content would be - Super Mario Odyssey hints, Super Mario Odyssey costumes, and Splatoon 2 items.

{{< message Note >}}
**Users should possess the following versions of the games at minimum.** <br>
SMO - `1.2.0` || BOTW - `1.1.0` || Splatoon 2 - `3.2.0` 
{{< /message >}}
{{< message "Surprise!" >}}
*The Legend of Zelda - Breath of The Wild, now boots with updates and DLC enabled.*
{{< /message >}}

### Then?

Thanks to the efforts of our developer [DarkLordZach](https://github.com/DarkLordZach), we now have an open source replacement of the service in yuzu.
By emulating the `BCAT` service at a high-level, yuzu is able to intercept the game's calls to Nintendo's servers and reroute them to yuzu's servers.
This means that games running on yuzu, will now check for new content on yuzu's servers instead of Nintendo's.

This allows us to add new in-game content for games that use this service. 
For the inaugural run, our team members have added some cool content across different games which you can check out [here](https://yuzu-emu.org/help/feature/boxcat/).
We will have new events occasionally, so users will have even more fun while playing games on yuzu.

{{< imgs
    "./boxcat.png|Boxcat Settings Configuration"
>}}

### When?

We will be testing this feature in our Patreon preview builds first and it will be available to Canary users in the near future.

We would like to take this opportunity to ask that our users show their support by subscribing to our [Patreon](https://www.patreon.com/yuzuteam).

By subscribing to our Patreon, you will be creating more incentive for developers to spend even more time working on yuzu.
For example - Using Patreon funds, several internal bounties have been setup, which have lead to various new features or fixes you might have seen on our [GitHub](https://github.com/yuzu-emu/yuzu) or our [Discord](https://discord.gg/u77vRWY).

{{< message "Want more information on Boxcat?" >}}
Refer to our help page for Boxcat.
https://yuzu-emu.org/help/feature/boxcat/
{{< /message >}}

### Fin!

We thank all of our 300+ patrons for their continued love and support.
We thank the entire yuzu community for the love and support they have shown to the project.
We will be working even more diligently to bring many more new, and exciting features in the future. <br>
Keep playing on yuzu, and have fun!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, checkout our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>