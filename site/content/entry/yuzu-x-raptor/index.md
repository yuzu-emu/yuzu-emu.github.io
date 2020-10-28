+++
date = "2020-10-31T04:00:00+05:30"
title = "yuzu x Raptor Partnership"
author = "CaptV0rt3x"
forum = 319939
+++

Hey there, yuzu fans!
We are very excited to announce that yuzu now has beta support for online services!
Jump right in to find out more!
<!--more-->

## Wait, what?!

Yes, you read that right.
yuzu now has beta support for online services by leveraging [Raptor Network](https://raptor.network/).
Raptor Network is a replacement for Nintendo Online Services, which yuzu has partnered with to deliver this service to you!
Thanks to the efforts of developers [DarkLordZach](https://github.com/DarkLordZach) and [ReinUsesLisp](https://github.com/ReinUsesLisp), 
we are now able to launch this publicly for our users to test and enjoy.

Right now, Raptor Network only supports two games: **Super Mario Maker 2** and **Super Mario Odyssey**. 
In **Super Mario Maker 2**, you can upload and share custom levels with others, while in **Super Mario Odyssey**, you can 
play hide-and-go-seek in Luigi's Balloon World or share high scores in minigames on the leaderboards.
Reverse engineering new games is an arduous task, but the service is in continuous development, so keep your eyes peeled for future updates.

Raptor also allows you to set a nickname and profile image, which is used to identify you in games. 
In addition to this, Raptor allows you to friend other people across the internet! 
You can then interact with your friends in supported games, such as viewing courses made by them in **Super Mario Maker 2**.

Special thanks to developers [fincs](https://github.com/fincs/) and [yellows8](https://github.com/yellows8/), widely known for their contributions to Switch reverse engineering. 
Without their help, it would've probably taken us significantly longer to implement the client side functionality required for Raptor.

## Here is video of our staff playing SMO & SMM2 on Raptor Network
** INSERT VIDEO HERE **

## How can I try it?

To use the online service, you need an `active` yuzu Early Access subscription to connect to Raptor Network.
Simply download the latest Early Access build and follow the instructions below to obtain access to raptor network on your yuzu acccount.

>**Note:<br>
If you are new to yuzu early access, then please visit our [yuzu Early Access guide](https://yuzu-emu.org/help/early-access/) to setup your yuzu account.**

#### Step 1
Once you've linked your patreon account to your yuzu profile and activated your early access subscription, navigate to https://profile.yuzu-emu.org and scroll down.
At the bottom, you will find a `Raptor` under a section titled `Your other services`.
{{< imgs
    "./rapt_act.png| Raptor service"
>}}

#### Step 2
Click on `Activate Now` and you'll see a prompt asking you to `Agree` to Raptor Network's legal agreements.
Users are **required** to agree to their terms to gain access to Raptor Network. 
We strongly advise users to read the legal agreements before proceeding.
{{< imgs
    "./rapt_act_2.png| Raptor Legal Agreements"
>}}

#### Step 3
If you clicked `Agree`, then you'll see that your access to Raptor Network has been activated.
{{< imgs
    "./rapt_act_3.png| Activated!"
>}}

#### Step 4
Scroll to the top of page and copy your login token.
{{< imgs
    "./5.png| Copy your token"
>}}

#### Step 5
Now, open yuzu and navigate to `Emulation -> Configure... -> Online`, and enter your `token` and click `verify` to verify your client.
{{< imgs
    "./rapt_act_5.png| Paste your token"
    "./rapt_act_6.png| Yay! Verified!"
>}}

#### Step 6
Once your yuzu token is verified, you will be able to connect to the network without any additional configuration.
You can also check your connection status to Raptor Network at the bottom right corner of yuzu.
{{< imgs
    "./rapt_cntd.png| "
>}}

## Screenshots
Here are some screenshots from our private beta testing:

{{< single-title-imgs
    "Raptor Beta Test"
    "./rapt1.png"
    "./rapt2.png"
    "./rapt3.png"
>}}

{{< single-title-imgs
    "Raptor : Super Mario Odyssey"
    ""
    ""
    ""
    ""
>}}

{{< single-title-imgs
    "Raptor : Super Mario Maker 2"
    ""
    ""
    ""
    ""
>}}

## Fin

Please keep in mind that Raptor Network is a seperate service and we are parterning with them to bring this to our users.
You can keep an eye out for the status of Raptor servers [here](https://status.raptor.network/) and for news and updates check [here](https://news.raptor.network/).

As always, we thank all of our patrons for their continued love and support!
We hope to bring you more exciting stuff like this in the near future.

Until next time, keep playing!<br>
&nbsp;&nbsp; -- yuzu development team

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
