+++
date = "2022-09-11T01:40:00+05:30"
title = "New Feature Release - Local Wireless Multiplayer"
author = "CaptV0rt3x"
forum = 622491
+++

Hey there, yuz-ers!
The MOST awaited feature of yuzu, Local Wireless Multiplayer (LDN), is finally here!
So what are you waiting for?
Time to grab your friends and jump right in!

<!--more-->

## What is this?

The Nintendo Switch console supports various multiplayer options. 
Among these, the following options are useful when you want to play multiplayer with other Switch consoles.
{{< imgs "./multi.png| Table indicating yuzu's supported Switch multiplayer modes" >}}

{{< imgs 
    "./Switch_Conn.png| Graphic demonstrating the key differences between the three wireless modes" 
>}}

<article class="message has-text-weight-semibold"><div class="message-body"><p>
The Switch's HorizonOS uses the LDN service for all Local Wireless communication. <br>
This is why Local Wireless Multiplayer can also be referred to as LDN Multiplayer.
</p></div></article>

Thanks to the incredible efforts of our developers [FearlessTobi](https://github.com/FearlessTobi) and [german77](https://github.com/german77), Local Wireless Multiplayer in yuzu is no longer a dream!
Special thanks to [spacemeowx2](https://github.com/spacemeowx2/) and [all the contributors](https://github.com/spacemeowx2/ldn_mitm/graphs/contributors) of the [ldn_mitm](https://github.com/spacemeowx2/ldn_mitm) project.
Without their extensive reverse-engineering of the `LDN` service, and the gracious [license exemption](https://github.com/spacemeowx2/ldn_mitm#licensing) for yuzu, this would not have been possible.

<br>
<article class="message"><div class="message-header">
<p>⚠️ Attention</p>
</div>
<div class="message-body"><p style="color:white;">
<b>Currently, Local Wireless Multiplayer (LDN) is only supported between instances of yuzu.<br>
Multiplayer between yuzu and a real Switch or between yuzu and other emulators is not supported!</b>
</p></div></article>

## Where can you get it?

The Local Wireless Multiplayer feature is now available in the latest version of the Early Access release.
We will be working to polish this feature and make this available to the Mainline builds soon.

<article class="message has-text-weight-semibold"><div class="message-body"><p>
If you're using the yuzu installer, you'll automatically be updated to the latest build.<br>    
If you're <b>not</b> using the yuzu installer, please download it from our <a href= https://yuzu-emu.org/downloads/>Download</a> page. <br>
<br>
We highly recommend using our installer to always stay up to date on both Mainline and Early Access builds.
</p></div></article>

## Local Wireless (LDN) Multiplayer

yuzu's Local Wireless multiplayer (LDN) differs a little bit when compared to the Nintendo Switch.
The Switch console uses the `LDN` service to scan for other Switch consoles using Wi-Fi and connects all players.
Here, one player would act as the `host` and all others would connect to it.

yuzu, on the other hand, employs virtual rooms to allow players to create and join game lobbies within said rooms.
Since this emulates the Switch's ability to do local wireless multiplayer, it does NOT rely on Nintendo’s servers and does NOT require a Nintendo Account. 
While on a real Switch, you’d be limited to the people in your immediate vicinity, yuzu boasts a complex server/client infrastructure that forwards a game’s wireless communication across the internet.

In order to connect with other players, players simply need to join the same room within yuzu’s Public Room Browser. 
But, before opening the Public Room Browser, you will have to first configure your network interface in yuzu.

You can find this setting under `System -> Network` and you need to select your internet connection from the drop-down as shown below.

{{< imgs "./network_interface.png| yuzu's Network Interface configuration" >}}

Out of the box, we provide you with an assortment of public rooms hosted across the world by yuzu.
Creating and joining rooms is extremely easy in yuzu and can be done in just a few clicks.

{{< imgs "./room_browser.png| yuzu's Public Room Browser" >}}

If you’re a [Verified User](https://community.citra-emu.org/signup), you can create your very own public room for people to join. 
These public rooms can be seen by anyone using the Public Room Browser, but you can also password protect them to restrict users' access.
Verified Users will have their forum nickname and profile picture populated in the chatroom.
<br>

<article class="message"><div class="message-header">
<p>⚠️ Reminder</p></div>
<div class="message-body"><p style="color:#eed202;">
<b>When hosting a room, remember to port forward or your friends won’t be able to connect!</b>
</p></div></article>

If you prefer not to sign up for our platform, you aren’t out of luck! 
Unverified Users still have the ability to create unlisted rooms, directly connect to unlisted rooms, and can join any yuzu hosted room.

Do note that Verified Users will have their privileges revoked for violating any yuzu policies while in the room chatroom.
Please respect the `Preferred Game` listed in publicly hosted rooms, as even unrelated games will add to the bandwidth load.

{{< imgs "./room_chat.png| Public Room chat and moderation features" >}}

<article class="message has-text-weight-semibold"><div class="message-body"><p>
You can use these rooms for LAN mode games as well — instead of ZeroTier or Hamachi.</b>
</p></div></article>

Please visit [our multiplayer guide](https://yuzu-emu.org/help/feature/multiplayer/) for further help with Hosting, Port Forwarding, Authentication, and Moderation of your publicly hosted rooms.

## Development

FearlessTobi began development by leveraging the existing virtual rooms infrastructure from [Citra](https://citra-emu.org).
Due to code similarities between yuzu and Citra, this tried-and-tested infrastructure easily became the foundation of this feature.

Now that the virtual rooms were taken care of, Tobi moved onto the `LDN` service and its protocols.
Using the research and code from the [ldn_mitm](https://github.com/spacemeowx2/ldn_mitm) project, he implemented the necessary changes for yuzu instances to communicate with each other over these virtual rooms.
During this process, Tobi put an extra emphasis on ensuring no personal data, such as IP addresses, was leaked to the other room members.

As the feature slowly matured, Tobi began utilizing yuzu's internal team of testers to verify the feature across several titles for compatibility and performance validation. 

With the multiple testing iterations, various bugs and glitches were found. 
german77 relied on his own reverse-engineering and hardware tests to debug these issues, which then made it easy for the team to fix these various problems.
He also made several UI fixes to improve its usability and brought the codebase up to yuzu standards.

## Compatibility

Please note that as this is the initial release of the feature, some games may have some limitations.
We hope to slowly fix these over the course of the next few months.

yuzu's Local Wireless Multiplayer was tested by our team of Testers and Support staff across a small set of popular titles. Their compatibility findings are as follows:

{{< imgs "./compat.png| List of yuzu-tested multiplayer titles" >}}


## Screenshots

{{< single-title-imgs
    "Animal Crossing: New Horizons"
    "./acnh1.jpg"
    "./acnh2.png"
>}}

{{< single-title-imgs
    "Splatoon 2"
    "./splatoon2_1.png"
    "./splatoon2_3.png"
    "./splatoon2_2.png"
>}}

{{< single-title-imgs
    "Mario Kart 8 Deluxe"
    "./mk8d_1.png"
    "./mk8d_2.png"
>}}

{{< single-title-imgs
    "Pokémon Legends: Arceus"
    "./arceustrade1.png"
    "./arceustrade2.png"
    "./arceustrade3.png"
>}}

{{< single-title-imgs
    "Luigi's Mansion 3"
    "./lm3_1.png"
    "./lm3_2.png"
>}}

{{< single-title-imgs
    "Super Mario Smash Bros. Ultimate"
    "./ssbu_ldn_2.png"
    "./ssbu_ldn_3.png"
    "./ssbu_ldn_1.png"
>}}

{{< imgs
    "./PLG_1.png|"
    "./PLG_2.png|"
>}}

{{< single-title-imgs
    "Pokémon Let's Go: Pikachu/Eevee"
    "./PLG_3.png"
    "./PLG_4.png"
>}}

{{< imgs
    "./bdsp_1.png|"
    "./bdsp_2.png|"
>}}

{{< single-title-imgs
    "Pokémon Brilliant Diamond/Shining Pearl"
    "./bdsp_3.png"
    "./bdsp_4.png"
>}}

{{< single-title-imgs
    "Diablo III : Eternal Collection"
    "./Diablo3_LDN_1.png"
    "./Diablo3_LDN_2.png"
>}}

{{< imgs
    "./cowabunga.png| Teenage Mutant Ninja Turtles: The Cowabunga Collection" 
    "./monster_hunter_ultimate.png| Monster Hunter Generations Ultimate"
    "./kirby_dream_buffet.png| Kirby's Dream Buffet"
>}}


## Fin

As with any new update, we've tested the feature internally, but our efforts can't compare to the community as a whole. 
We could have easily missed an edge case or some weird bug or issue among the vast collection of games with Local Wireless.

Test any and all games! Poke, prod, and play! Please break this release if you can! With your help, we can make yuzu the best it can be.
Please reach out to us on our [Discord](https://discord.gg/u77vRWY) and report any bugs you find, so that we can quickly address them.

That's all we have for now, until next time! Happy emulating! <br><br>

{{< article-end >}}
