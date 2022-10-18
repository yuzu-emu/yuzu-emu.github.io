+++
date = "2022-10-10T12:00:00-03:00"
title = "Progress Report September 2022"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 0
+++

Hello yuz-ers! We have so much to talk about this month. From game fixes, input changes, and quality of life improvements, to new gameplay options available to everyone!

<!--more--> 

## Project London: open-source, online Local Wireless emulation

As promised in the [previous progress report](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2022/#future-projects), 
and explained in its [dedicated article](https://yuzu-emu.org/entry/ldn-is-here/), {{< gh-hovercard "8876" "LDN support is here and available to all users!" >}}
Enjoy pwning some noobs in your favourite games.
But before we explain the how, let's cover some theory.

{{< imgs
	"./comm.png| Available multiplayer methods on the Nintendo Switch"
  >}}

The Nintendo Switch offers 4 methods for multiplayer gameplay:

- Good, old, couch *local multiplayer*. While this normally only refers to people in the same physical room, the community has been enjoying the benefits of remote access streaming, with services like [Parsec](https://parsec.app/), to play online with the lowest possible latency.
- Local Area Network (LAN) multiplayer. This is when multiple Switches connect to the same local network. This option has been emulated and available in yuzu [for quite a while now](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2021/#lan-party-time). It’s limited to very few games, and it doesn’t have good tolerance for lag.
- LDN multiplayer, more commonly known as Local Wireless, the star of this section. This is when one Switch hosts a session over the built-in Switch WiFi hardware while others connect to it as guests. The trick here is that nothing stops emulators from using a server infrastructure to host rooms so users from anywhere in the world, including locally, can join and smash each other. This method is far more supported by games than LAN.
- Nintendo Online. This is the paid Nintendo service to play online, which also includes other bonuses such as official emulators to play older titles. We have no plans to offer support for Nintendo Online in the near or far future.

`Project London` includes full support for LDN, with room hosting and joining, and revamps our LAN support to use the new LDN code in place.

Now, let's get to the fun part: how to use it!

A user can launch the `Public Room Browser` from the `Multiplayer` option in the Menu Bar and then selecting `Browse Public Game Lobby`, or by clicking the status bar tip in the bottom right labeled `Not Connected. Click here to find a room!`

{{< imgs
	"./ldn.png| The new Multiplayer submenu"
  >}}

From there, double-clicking a room will allow the user to join it. Keep in mind, the `Preferred Game` is just a suggestion and there is no hard restriction on which games can be played in a room. Please keep this in mind when joining public lobbies and be courteous to your fellow yuz-ers! Any that are user-hosted may enforce this by kicking players or locking their room.

{{< imgs
	"./rooms.png| A lock means it's a password protected room"
  >}}

Speaking of user-hosted rooms, the `Create Room` option in the `Multiplayer` menu allows users to host their own rooms, with custom player limits and optional password security.
Some ports need to be forwarded in the host’s router/modem configuration, so please [follow our guide here](https://yuzu-emu.org/help/feature/multiplayer/).

{{< imgs
	"./create.png| Feel free to host any game you want!"
  >}}

Once a player joins a room, they can chat with other members, see the game they are running, and very importantly, the game versions other players are using.
Most games tend to only work when all players run the same game update version, so remember to dump the latest from your Switch!

It’s not mandatory to join a room before starting a game in yuzu, but it’s recommended.
At the moment, only LAN supports connecting with real Switches. LDN is yuzu to yuzu only at the moment.
We’re working to include native Switch support for LDN.

So far, very few games have issues with LDN. Only `Super Mario Maker 2`, `Mario Golf: Super Rush` and `DRAGON BALL FighterZ` have been reported as incompatible.
Any other local wireless compatible game should work fine, but don’t be shy to report any issues should you discover them.

One bit of info, `Super Smash Bros. Ultimate` has a hardcoded 6 frames of delay when playing over LDN. This is supposedly to “help buffer” the latency expected from online and WiFi gameplay.
While the ideal solution is to play in local multiplayer with Parsec (no forced delay on local play), not everyone has good upload speeds to host, or is comfortable with giving remote access to their computer.

An alternative is available: run the game at 120 FPS, reducing the delay to only 3 frames instead.
For this, all users in the room must do two things:

- Install the 120 FPS mod [available here](https://cdn.discordapp.com/attachments/402001453381713920/1018356262582354091/120.rar). Right click the game in yuzu’s game 
list and select `Open Mod Data Location`, then place *the folder* of the compressed file in the location that yuzu opens.
- Set game speed to 200%. This can be set on a per game basis with custom configurations. Right click the game in yuzu’s list like before and go to `Properties`, in the `General` tab, set the `Limit Speed Percent` to a blue enabled value (this means it’s a custom value, ignoring the default one), then change it to 200%.

{{< imgs
	"./200.png| Reducing input lag by running things faster, life hacks"
  >}}

Some GPU power is required to sustain 120 FPS, as such, our minimum hardware recommendations may not cut it (an RX 550 falls under 100 FPS in 1v1 fights), but modern low/mid-end hardware should be fine.
Testing also shows that AMD Windows drivers can only reach framerates higher than 60 if the display supports it. 
We reported the issue to AMD, hopefully in the future this doesn’t force users to get high refresh rate monitors.

And that’s it! Join rooms, both in yuzu and in game, and fight! Or trade those Pokémon, your call.
This endeavour was possible thanks to the [ldn_mitm project](https://github.com/spacemeowx2/ldn_mitm) who provided us a licence exemption, and the work done by [Tobi](https://github.com/FearlessTobi) and [german77](https://github.com/german77), along with the testers (your writer included) who never had so much fun crashing games in the name of progress.

After the Mainline release, Linux users reported that LDN rooms refused to work on some Linux distributions.
The issue is in how the SSL package is distributed. [toastUnlimited](https://github.com/lat9nq), taking reference from a previous pull request from [Docteh](https://github.com/Docteh), {{< gh-hovercard "8933" " fixed the issue" >}} so now all supported operating systems can enjoy LDN.

Some users reported crashes when playing `Pokémon Sword/Shield`. 
While we implement the correction for it, make sure that a valid network device is selected in `Emulation > Configure… > System > Network > Network Interface`.
The crash seems to happen when `None` is set as the network interface.

## Graphic changes

NVIDIA OpenGL users may have seen some strange graphical glitches in games like `Dragon Quest Builders`, `SNACK WORLD: THE DUNGEON CRAWL`, and `Pixel Game Maker Series Werewolf Princess Kaguya` due to an oversight in yuzu's handling of the performance-enhancing `vertex_buffer_unified_memory` extension. 
[vonchenplus](https://github.com/vonchenplus) {{< gh-hovercard "8874" "swooped in with a fix," >}} and these games now render as they should.

{{< single-title-imgs-compare
	"Dragon Quest Builders"
	"./dqbug.png"
	"./dqfix.png"
>}}

{{< single-title-imgs-compare
	"SNACK WORLD: THE DUNGEON CRAWL"
	"./swbug.png"
	"./swfix.png"
>}}

{{< single-title-imgs-compare
	"Pixel Game Maker Series Werewolf Princess Kaguya"
	"./wpbug.png"
	"./wpfix.png"
>}}

Users may have noticed an intriguing square moon in `Live a Live`. 
This is caused by the texture cache not correctly synchronizing ASTC textures that the game is using to all layers, so vonchenplus added {{< gh-hovercard "8910" "a workaround to avoid filling the extra invalid layers with an error colour," >}} which changes the moon back to the round shape we all love.

{{< single-title-imgs-compare
	"Not exactly a Red Moon, dood! (Live a Live)"
	"./lalbug.png"
	"./lalfix.png"
>}}

Some systems, like Steam, don't like yuzu's behaviour of spawning a new process to check for working Vulkan support. toastUnlimited updated the Vulkan checker with a configuration option to, well, {{< gh-hovercard "8930" "stop checking, >}} allowing those systems to function as previously.

After three months of regression solving and the usual nasty delays, `Project Y.F.C.` Part 1 is finally merged to Mainline!
You can find more information about it, as well as what’s expected in the near future for Part 2 
[here](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2022/#part-1-of-project-yfc).

One regression remains, for now. 
It affects certain puzzles in the single player mode of `Splatoon 2`.
While Part 2 is in development, users affected by this problem should stick to 
[Mainline version 1190](https://github.com/yuzu-emu/yuzu-mainline/releases/tag/mainline-0-1190).

We mentioned last month about trying to push more aggressive `Staging Buffer` values in order to {{< gh-hovercard "8987" "benefit GPU users that can enable Resizable BAR/Smart Access Memory" >}} (or ReBAR/SAM).
While the option did get merged briefly with Mainline 1189, users quickly reported both big performance gains and losses, with no correlation to which GPU/CPUs were in use.
This change seems to be very platform specific, and the average tilts towards performance losses, so [byte](https://github.com/liamwhite) {{< gh-hovercard "9027" "reverted it." >}}

It’s been a while since [Morph](https://github.com/Morph1984) dabbled in graphics work. `.hack//G.U. Last Recode` was unable to boot due to excessive vsync event calls. 
{{< gh-hovercard "8992" "Limiting the event to only once per display" >}} allows this `.hack` to finally boot and play.

{{< imgs
	"./hack.png| .hack//G.U. Last Recode"
  >}}

## Audio changes

The cleanup for `Xenoblade Chronicles 3` from last month continues this month with {{< gh-hovercard "8842" "a new audio pull request" >}} from [Maide](https://github.com/Kelebek1). 
This fixed the audio desynchronization issue that some users were having during cutscenes. 
Previously, Maide's audio implementation sometimes had issues with the game audio producing samples too quickly for the host audio backend (SDL or Cubeb) to be able to play in time. 
Now, if the game starts producing too many samples, it will be temporarily paused until the audio backend catches up.

Maide also implemented {{< gh-hovercard "8878" "a relatively large cleanup of the audio system" >}} and how it relates to pausing and shutdown. 
Before  {{< gh-hovercard "8878" "Pull Request 8842," >}} the audio system had its own timer system for dealing with the backend that ran independently of yuzu's timer system, `CoreTiming`. 
Now that the synchronization issues when doing this were fixed, Maide removed the custom timer system to now run everything through `CoreTiming`, which correctly handles pausing and shutdown. 
The scaffolding for the audio system to be aware of pausing and shutdown was therefore no longer needed, and could be deleted.

{{< imgs
	"./xc3.png| Xenoblade Chronicles 3"
  >}}

These audio changes did, however, come with a minor regression. 
In multi-core mode, timer callbacks are run on their own thread, which allows them to execute independently of the CPU cores. 
However, because yuzu tries to be deterministic in single-core mode, every timing callback and every emulated processor instruction in this mode is run from a single host thread. 
In single-core mode, this prevents the timer callbacks from being effectively paused, which causes the audio service to try to continuously pause the game to catch up.
Maide worked around this issue by simply {{< gh-hovercard "8941" "not pausing if single-core mode is enabled." >}}

For once, Maide was not the only contributor to work on audio! 
vonchenplus noticed that the new `HwOpus` service, which is a service for optimized playback of Opus audio, didn't implement any of the multi-stream functionality needed for `Dragon Quest X` to boot. 
He {{< gh-hovercard "8915" " added one new function that the game needed," >}} `GetWorkBufferSizeForMultiStreamEx`,  and the game booted.

{{< imgs
	"./dqx.png| Dragon Quest X"
  >}}

## Core emulation

yuzu is slowly but surely improving its ability to run homebrew applications. 
So when the team discovered that the [Ship of Harkinian](https://github.com/HarbourMasters/Shipwright) homebrew (a PC port of `The Legend of Zelda: Ocarina of Time`) 
did not work correctly in yuzu, we were intrigued and tracked it down to a single missing service implementation. 
[german77](https://github.com/german77) {{< gh-hovercard "8855" "added support for the `pl:s service`," >}} which is used for loading fonts, and the game now boots and renders, with frame interpolation up to 60 fps working correctly.

{{< imgs
	"./oot.mp4| Pure nostalgia, right click and enable audio (Ocarina of Time, Ship of Harkinian)"
  >}}

In the realm of our "other architecture" news, [liushuyu](https://github.com/liushuyu) {{< gh-hovercard "8904" "modified yuzu's CMake setup to be partly compatible with the ARM64 architecture." >}} 
This allows building the `yuzu-room` LDN server application for ARM64.
Pi server, anyone?

Stay tuned for future news regarding yuzu on ARM64...

## Input Changes

One of the longstanding issues with yuzu's input emulation was motion controls not working after the controller reconnects.
Thanks to german77, {{< gh-hovercard "8847" "this has now been fixed." >}}
This was happening because yuzu was only checking for motion controls when the controller first connected, but not on subsequent reconnections.
Ensuring that yuzu checked for motion controls on every reconnection resolved this issue.

Over the years, yuzu's input emulation had been missing support for emulating the popular `Pokéball Plus` controller.
In his efforts to reverse engineer this, german77 found that most meaningful features for it were locked behind Nintendo Switch Online (NSO).
Although this made him lose interest in it, he {{< gh-hovercard "8934" "partially implemented support" >}} for emulating this controller (including motion controls), thus opening it up for others to improve upon.
For now, you can select this in `Pokémon Let's Go, Pikachu/Eevee!` and use it like any other controller, but loading data from it or writing data to it is NOT supported.

Last month's Amiibo emulation support work also saw {{< gh-hovercard "8955" "major improvements and bug fixes." >}}
With these changes, Amiibo keys are now a mandatory requirement to read/write any data.
This also fixed Amiibo support in games like `Shovel Knight` and `Super Smash Bros. Ultimate` among others.

A minor {{< gh-hovercard "8863" "bug within GameCube controller" >}} input mapping which led to GC triggers overwriting the `ZL/ZR` buttons was fixed.
And to further complement this fix, german77 also made {{< gh-hovercard "8864" "analog input buttons toggleable" >}} for extended usability.

Accessibility is both very important, and, sadly, very easy to ignore too.
For example, something simple: what if a user needs more time to map buttons individually?
In an effort to help with this particular case, the {{< gh-hovercard "8880" "button mapping timer duration" >}} has been increased from `2.5 seconds` to `4 seconds`.

## UI Changes

We also had a variety of UI improvements from multiple contributors this month.

The old SD card icon has been {{< gh-hovercard "8902" "replaced with a new colourful microSD Card icon" >}} by [Dev-draco](https://github.com/Dev-draco).

{{< imgs
	"./sdicon.png| Small details matter"
  >}}

[Tachi107](https://github.com/Tachi107) {{< gh-hovercard "8945" "fixed a few minor typos" >}} within the yuzu source code. 

german77 modified the ordering of the input profiles saved in `Emulation > Configure... > Controls`. They are now {{< gh-hovercard "8948" "sorted by name." >}}

While the colourful theme has been the default for a while, some icons remained in a "Default" theme directory.
But as grabbing icons from other themes isn't supported on linux, this was broken.
Docteh fixed this by {{< gh-hovercard "8906" "moving all the icons to the colourful theme." >}}

Since the `Debug` configuration tab was getting crowded, Docteh {{< gh-hovercard "8854" "made it scrollable." >}}

{{< single-title-imgs
    "While this change helps Windows users, Linux users will benefit the most from it"
    "./scrollbug.png"
    "./scrollfix.png"
    >}}

Docteh also fixed the {{< gh-hovercard "8909" "broken help page hyperlink on the `TAS` configuration window" >}}.

{{< imgs
	"./tas.png| People seem to forget that blue underlined text indicates a hyperlink intended to be clicked"
  >}}

## Miscellaneous 

For a long time, any yuzu bug reports from Windows users had to be manually reproduced and investigated by the team.
Linux users had the option of providing stack traces, but there wasn't an easy way for Windows users to provide similar debug info.

To overcome this, toastUnlimited implemented {{< gh-hovercard "8682" "support to create Windows crash dumps within yuzu" >}} itself.
This allows any layman on Windows to easily obtain a crash dump without jumping through various developer intended hoops.
But since this feature has a big performance impact, this was added behind an option in the `Debug` settings for users to access.
You can find it in `Emulation > Configure… > General > Debug > Create Minidump After Crash`.

{{< imgs
	"./minidump.png| Only use it if you want to debug a game or to pass the file to a developer, the performance loss is significant!"
  >}}

Since the dumps use modern Windows SDK features, there’s a risk that this change can break compatibility with older Windows options.
yuzu only officially supports Windows versions 10 1803 and newer. 
And Linux, of course. It's faster than Windows.

## Hardware section

#### AMD Radeon, when increasing accuracy produces crashes

Users started reporting crashes when booting up `Xenoblade Chronicles 3` on AMD Radeon GPUs running official AMD drivers (either the Windows driver, or the Linux amdvlk driver).
We’re investigating the amdvlk source code to find the reason, and already notified AMD with all the relevant information we have.

The cause seems to be improvements in Macro JIT's accuracy.
Testing has shown that even with older driver and yuzu versions, disabling the MacroJIT speedhack causes the official AMD Vulkan drivers to crash, so it sadly checks out that improving its accuracy gives the same result now.

Affected users can try running [Mainline 1188](https://github.com/yuzu-emu/yuzu-mainline/releases/tag/mainline-0-1188), or just run the game using OpenGL.
The Mesa RADV driver is unaffected.

#### NVIDIA, one source of crashes down, more remain

We have merged the [multithreaded ASTC CPU decoder](https://github.com/yuzu-emu/yuzu/pull/8849) mentioned last month, so we strongly recommend NVIDIA Maxwell and Pascal (GTX 745/750, 900 and 1000 series) users to disable ASTC decoding if you run the latest drivers.

You can find the option in `Emulation > Configure... > Graphics > Accelerate ASTC Texture Decoding`, enabling this setting uses the GPU to decode, while disabling it uses the CPU instead.
As a bonus, now this option can be a performance boost on systems with very weak integrated GPUs, like old laptops with MX series Geforce hardware, or any Intel iGPU, where the CPU would do a faster job dealing with ASTC decoding. Testing has shown that Geforce MX 500 and Radeon Vega 7+ tier GPUs are slightly faster using the GPU for decoding.
On affected NVIDIA hardware, the performance decrease while decoding ASTC textures is minimal. Avoiding a crash, for example, when opening the map in `The Legend of Zelda` games is arguably far more important.

Crashes caused by recent driver updates remain, but your writer continues to harass an NVIDIA driver developer daily (I only need to get into Intel to do the same to all three vendors now).
This leads us to recommend the 472/473 series of drivers for Maxwell and Pascal hardware to ensure the best performance and compatibility with yuzu. There's nothing wrong with using the latest drivers, but until these crashes are resolved, expect instabilities and graphical glitches with them.
Turing, Ampere, and Ada hardware (1600, 2000, 3000 and 4000 series) exhibit some weird behaviour but are much more stable on the (at the time of writing) latest 520/522 series of drivers when compared to their older brothers.

One wonders how long Maxwell and Pascal will continue to be supported by NVIDIA drivers.

#### Intel ARC support

No news yet on Vulkan support for these new "AV1 video decoder cards" from Intel that can also work as a GPU. 
Low availability has made it difficult to get our hands on one, but it's something we want to solve ASAP.

OpenGL is "functional" right now, but Intel continues to be the worst vendor regarding OpenGL support on Windows, so the experience is pretty bad.
Linux Mesa drivers are reported to work correctly, and with good performance, in both OpenGL and Vulkan.

Speaking of AV1, for now we've been using h.264 encoding for the videos embedded in our articles, as it is both widely supported and very lightweight in regards to hardware requirements.
Would you prefer if we switched to AV1 from now on? It can be a big battery drain on devices without dedicated hardware decoders, but it would allow for even lower bitrates while keeping a similar level of quality, something datacapped users have complained about in the past.
Let us know on Reddit, our [forums](https://community.citra-emu.org/c/yuzu-news/15), or our [Discord server](https://discord.gg/u77vRWY) what you would prefer!

## Future projects

For once, we don’t have much to say in this section.
Or maybe I should say, we don’t want to start generating hype for new projects just yet.

[Blinkhawk](https://github.com/FernandoS27) has started working on Part 2 of `Project Y.F.C.`, as previously mentioned, and the rest of the GPU gang (Byte[], Maide, vonchenplus) is also busy with some top secret changes (for now, your writer has a reputation to uphold) to improve both rendering accuracy and performance.

Having the first part of `Y.F.C.` merged to Mainline opens the floodgates to many projects that were on hold until now. We will discuss these in more detail in the next progress report.

Special thanks to Mysterious Writer B for their help with this progress report, and to CaptV0rt3x who came to aid at a moment’s notice.

That’s all folks! As always, many thanks for your time. We hope to see you in the next article!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
