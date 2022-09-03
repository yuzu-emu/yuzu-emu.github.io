+++
date = "2022-09-03T18:00:00+05:30"
title = "New Feature Release - Local Wireless Multiplayer"
author = "CaptV0rt3x"
forum = 622491
+++

Hey there, yuz-ers!
The MOST awaited feature of yuzu, Local Wireless Multiplayer, is finally here!
So what are you waiting for?
Time to grab your friends and jump right in!

<!--more-->

## What is this?

The Nintendo Switch console supports various multiplayer options. 
Among these, the following options are useful when you want to play multiplayer with other Switch consoles.
{{< imgs "./multi.png" >}}

The image below, shows the key difference between these three.
{{< imgs "./Switch_Conn.png" >}}

<article class="message has-text-weight-semibold"><div class="message-body"><p>
The Switch's HorizonOS uses the LDN service for the Local Wireless multiplayer. <br>
That's the reason this can also be referred to as LDN multiplayer.
</p></div></article>

Thanks to the efforts of our developers [FearlessTobi](https://github.com/FearlessTobi) and [german77](https://github.com/german77), yuzu now has support for Local Wireless multiplayer.
Special thanks to [spacemeowx2](https://github.com/spacemeowx2/) and [all the contributors](https://github.com/spacemeowx2/ldn_mitm/graphs/contributors) of the [ldn_mitm](https://github.com/spacemeowx2/ldn_mitm) project.
Without their extensive reverse-engineering of the `LDN` service and the gracious [license exemption](https://github.com/spacemeowx2/ldn_mitm#licensing) for yuzu, this would not have been possible.


## Where can you get it?

{{< imgs "./where-is-it.png" >}}

The LDN multiplayer feature is now available on the latest version of the Early-Access builds.
We will work on polishing this release and make this available on the Mainline builds soon.

<article class="message has-text-weight-semibold"><div class="message-body"><p>
If you're using the yuzu installer, you'll automatically be updated to the latest build. <br>	
If you're not using the yuzu installer, please download it from our <a href= https://yuzu-emu.org/downloads/>downloads</a> page. <br>
We highly recommend using our installer to always stay up-to-date on both Mainline and Early-Access builds.
</p></div></article>

## Local Wireless (LDN) Multiplayer

yuzu's Local Wireless multiplayer (LDN) differs a little bit when compared to the Nintendo Switch.
The Switch console uses the `LDN` service to scan for other Switch consoles using Wi-Fi and connects all players.
Here, one player would act as the `host` and all others would connect to the host.

yuzu, on the other hand, uses virtual rooms to allow players to create and join game lobbies within the room.
Since this emulates the Switch's ability to do local wireless multiplayer, it doesn’t rely on Nintendo’s servers and does not require a Nintendo Network ID. 
While on a real Switch you’d be limited to the people in your immediate vicinity, yuzu boasts a complex server/client infrastructure that forwards a game’s wireless communication across the internet.

In order to get together with other players, you’re going to have to join the same room with yuzu’s room browser. 
Out of the box, we provide you with a bunch of public rooms hosted across the world by yuzu.
Creating and joining rooms is extremely easy in yuzu and can be done in just a few clicks.

{{< imgs "./room_browser.png" >}}

If you’re a verified user, you can create a public room for people to join. 
These public rooms can be seen by anyone using the room browser, but you can also put a password on them to restrict users. 
Remember to port forward, otherwise your friends won’t be able to connect!

Unverified users aren’t left without options, though - they still have the ability to create unlisted rooms, direct connecting, and can join any yuzu hosted room.

Do note that verified users will have their privileges revoked for violating any site policies while on the room chatroom. 
Please respect the "recommended game" listed in publicly hosted rooms, as even unrelated games will add to the bandwidth load.

{{< imgs "./room_chat.png" >}}

**Note: You can use these rooms for LAN mode games too - instead of ZeroTier or Hamachi.**

## Development

FearlessTobi began the development by leveraging the existing virtual rooms infrastructure from [Citra](https://citra-emu.org).
Due to code similarities between yuzu and Citra, this tried and tested infrastructure easily became the foundation of this feature.

Now that the virtual rooms were taken care of, Tobi moved onto the `LDN` service and its protocols.
Using the research and code from the [ldn_mitm](https://github.com/spacemeowx2/ldn_mitm) project, he implemented the necessary changes for yuzu instances to communicate with each other over these virtual rooms.

As the feature slowly matured, Tobi began leveraging yuzu's internal team of testers to test the feature across several titles for compatibilty and performance validation. 
And to prevent user IPs from being leaked when connected to rooms, Tobi changed the implementation to use fake IPs for routing.

With the multiple testing iterations, various bugs and glitches were found. 
[german77](https://github.com/german77) relied on his own reverse-engineering and hardware tests, to debug these issues and fixed them all.
He also made several UI fixes to improve its usability and brought the codebase up to yuzu standards.

## Compatibility

Please note that as this is the initial release of the feature, some games might have some limitations.
We hope to slowly fix these over the course of next few months.

yuzu's Local Wireless Multiplayer was tested by our testers across a small set of games and their corresponding compatibilty is as follows:

{{< imgs "./compat.png" >}}


## Screenshots

{{< single-title-imgs
    "Animal Crossing: New Horizons"
    "./acnh1.jpg"
    "./acnh2.png"
>}}

{{< single-title-imgs
    "Pokémon Legends: Arceus"
    "./arceustrade1.png"
    "./arceustrade2.png"
>}}

{{< single-title-imgs
    "Mario Kart 8 Deluxe"
    "./mk8d_2.png"
	"./mk8d_3.png"
>}}

{{< single-title-imgs
	"Super Mario Smash Bros. Ultimate"
	"./ssbu_ldn_3.png"
	"./ssbu_ldn_4.png"
	"./smash_ldn.png"
>}}

{{< single-title-imgs
	"Splatoon 2"
	"./splatoon2_1.png"
	"./splatoon2_2.png"
	"./splatoon2_3.png"
>}}

{{< imgs
	"./lm3.png| Luigi's Mansion 3"
>}}

{{< imgs
	"./cowabunga.png| Teenage Mutant Ninja Turtles: The Cowabunga Collection" 
	"./diablo3.png| Diablo III: The Eternal Collection"
>}}

{{< imgs
	"./monster_hunter_ultimate.png| Monster Hunter Generations Ultimate"
	"./kirby_dream_buffet.png| Kirby's Dream Buffet"
>}}



## Fin

As with any new update, we've tested the feature internally, but our efforts can't compare to the community as a whole. 
We could have easily missed an edge case or some weird bug or issue among the vast collection of games with Local Wireless mode.
So, please reach out to us on our [Discord](https://discord.gg/u77vRWY) and report any bugs you find, so that we can quickly address them.

That's all we have for now, until next time! Happy emulating! <br><br>

{{< article-end >}}
