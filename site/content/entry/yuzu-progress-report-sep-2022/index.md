+++
date = "2022-09-10T12:00:00-03:00"
title = "Progress Report September 2022"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 0
+++

Yuz-ers! We have much to talk about this month. From game fixes, input changes and quality of life improvements, to new gameplay options available to all users.

<!--more--> 

## Project London, open source online Local Wireless

As promised on the [previous progress report](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2022/#future-projects), 
and explained on its [dedicated article](https://yuzu-emu.org/entry/ldn-is-here/), {{< gh-hovercard "8876" "LDN support is here, and for all users!" >}}
Enjoy pwning some noobs in your favourite games.
Before explaining the how, there is some theory to cover.

Pic

The Nintendo Switch offers 4 methods for multiplayer gameplay:

Good old couch *local multiplayer*. While this normally means only people on the same room with their controllers, the community has been enjoying the benefits of 
remote access streaming with services like [Parsec](https://parsec.app/) to play online and with the lowest possible delay.
Local Area Network (LAN) multiplayer. Multiple Switches connected to the same previously available network. This option has been available on yuzu 
[for quite a while now](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2021/#lan-party-time). It’s limited to very few games, and it doesn’t have good tolerance 
for lag.
LDN multiplayer, more commonly known as Local Wireless, the star of this section. One Switch hosts the session with their WiFi hardware while others connect to it as 
guests. The trick here is that nothing stops emulators from using a server infrastructure to host rooms so users from anywhere in the world, including locally, can 
join and smash each other. This method is far more supported by games than LAN.
Nintendo Online. The paid Nintendo service to play online, which also includes other bonuses as official emulators to play older titles. As many know, we have some 
history with this method. At least while the console is in service, we won’t pursue offering support for Nintendo Online.

*Project London* includes full support for LDN, with room hosting and joining, and revamping LAN support to use the new LDN code in place.

So, how to use it.

The user can join the room lobby from either the Multiplayer menu up top selecting the *Browse Public Game Lobby*, or by clicking the bottom right status bar tip 
*Not Connected. Click here to find a room!*

Ldn pic

From there, double clicking a room will allow the user to join them. Keep in mind the Preferred Game is just a suggestion, there is no restriction on which games 
can be played in a room, unless an user hosted one wants to enforce it.

rooms

Speaking of user hosted rooms, the *Create Room* option in the Multiplayer menu allows users to host their own rooms, with custom player limits and password security.
Some ports need to be forwarded in the host’s router/modem configuration, so please [follow our guide here](https://yuzu-emu.org/help/feature/multiplayer/).

Create

Once the player joins a room, they can chat with other members, see the game they are running, and very importantly, the game version.
Most games only like to work when all players run the same game update version, so remember to dump the latest from your Switch!

It’s not mandatory to join a room before starting a game on yuzu, but it’s recommended.
At the moment, only LAN supports connection with real Switches, LDN is yuzu <> yuzu only at the moment.
We’re working to include native Switch support for LDN.

So far very few games have issues with LDN, only *Super Mario Maker 2*, * Mario Golf Super Rush* and *Dragon Ball Fighterz* are currently reported as incompatible.
Any other local wireless compatible game should work fine, but don’t be shy to report if there are more.

One bit of advice, *Super Smash Bros. Ultimate* has hardcoded 6 frames of delay when playing over LDN, supposedly to “help buffer” the latency expected from online 
and WiFi gameplay.
While the ideal solution is to play in local multiplayer with Parsec (no forced delay on local play), not everyone has good upload speeds to host, or is comfortable 
with giving remote access to their computer.

An alternative is available, run the game at 120 FPS, reducing the delay to only 3 frames instead.
For this, all users in the room must do two things:

- Install the 120 FPS mod [available here](https://cdn.discordapp.com/attachments/402001453381713920/1018356262582354091/120.rar). Right click the game in yuzu’s game 
list and select “Open Mod Data Location”, then place *the folder* of the compressed file in the location that yuzu opens.
- Set game speed to 200%. This can be set on a per game basis with custom configurations. Right click the game in yuzu’s list like before and go to “Properties”, in 
the General tab, set the “Limit Speed Percent” to a blue enabled value (this means it’s a custom value, ignoring the default one), then change it to 200%.

pic

Some GPU performance is required to sustain 120 FPS, our minimum hardware recommendations may not cut it (an RX 550 falls under 100 FPS in 1v1 fights), but modern 
low/mid end hardware should be fine.
Testing also shows that AMD Windows drivers can only reach framerates higher than 60 if the display supports it. 
We reported the issue to AMD, hopefully in the future this doesn’t force users to get high refresh rate monitors.

And that’s it! Join rooms, both in yuzu and in game, and fight! Or trade those Pokémon, your call.
This endeavour was possible thanks to the [ldn_mitm project](https://github.com/spacemeowx2/ldn_mitm) who provided us a licence exemption, and the work done by 
[Tobi](https://github.com/FearlessTobi) and [german77](https://github.com/german77), along with the testers (your writer included), who never had so much fun 
crashing games in the name of progress.

After the Mainline release, Linux users reported to us that LDN rooms refused to work on some Linux distributions.
The issue is in how the SSL package is distributed, so  [toastUnlimited](https://github.com/lat9nq), taking reference from a previous pull request from 
[Docteh](https://github.com/Docteh) {{< gh-hovercard "8933" " fixed the issue" >}} so now all supported operating systems can enjoy LDN.

Some users reported crashes when playing `Pokémon Sword/Shield`. 
While we implement the correction for it, make sure that a valid network device is selected in `Emulation > Configure… > System > Network > Network Interface`.
The crash seems to happen when “None” is set as the network interface.

## Graphic changes

Nvidia OpenGL users OpenGL may have seen some strange graphical glitches in games like `Dragon Quest Builder`, `Snack World: The Dungeon Crawl`, and 
`Werewolf Princess Kaguya` due to an oversight in yuzu's handling of the performance-enhancing `vertex_buffer_unified_memory` extension. 
[vonchenplus](https://github.com/vonchenplus) {{< gh-hovercard "8874" "swooped in with a fix," >}} and these games now render as they should.

pics

Users may have noticed an intriguing square moon in `Live a Live`. 
This is caused by the texture cache not correctly synchronizing ASTC textures that the game is using to all layers, so vonchenplus added {{< gh-hovercard "8910" 
"a workaround to avoid filling the extra invalid layers with an error colour," >}} which changes the moon back to the round shape we all love.

pics

Some systems, like Steam, don't like yuzu's behaviour of spawning a new process to check for working Vulkan support. toastUnlimited updated the Vulkan checker to, 
well, {{< gh-hovercard "8930" "avoid checking if a configuration option is set," >}} allowing those systems to function as previously.

After three months of regression solving and the usual nasty delays, `Project Y.F.C.` part 1 is finally merged to mainline!
You can find more information about it, and what’s expected in the near future for part 2 
[here](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2022/#part-1-of-project-yfc).

One regression remains, for now. 
It affects certain puzzles in the single player mode of `Splatoon 2`.
While part 2 is in development, users affected by this problem should stick to 
[Mainline version 1190](https://github.com/yuzu-emu/yuzu-mainline/releases/tag/mainline-0-1190).

We mentioned last month about trying to push more aggressive `Staging Buffer` values in order to {{< gh-hovercard "8987" "benefit GPU users that can enable 
Resizable BAR/Smart Access Memory" >}} (or ReBAR/SAM).
While the option did get merged briefly with Mainline 1189, users quickly reported both big performance gains and losses, with no correlation on GPU and CPUs in use.
This change seems to be very platform specific, and the average tilts towards performance losses, so [byte](https://github.com/liamwhite) 
{{< gh-hovercard "9027" "reverted it." >}}

It’s been a while since [Morph](https://github.com/Morph1984) dabbled in graphics work.
Ok let’s try to get this game’s name right… 
`.hack//G.U. Last Recode` (that wasn’t so bad) couldn’t boot due to excessive vsync event calls. 
{{< gh-hovercard "8992" "Limiting the event to only once per display" >}} allows this .hack to boot and play.

Pic

## Audio changes

The cleanup to `Xenoblade Chronicles 3` from last month continues this month, with {{< gh-hovercard "8842" "a new audio pull request" >}} from 
[Maide](https://github.com/Kelebek1). 
This fixed the audio desynchronization issue that some users were having during cutscenes. 
Previously, Maide's audio implementation sometimes had issues with the game audio producing samples too quickly for the host audio backend (SDL or Cubeb) to be able 
to play in time. 
Now, if the game starts producing too many samples, it will be temporarily paused until the audio backend catches up.

Maide also implemented {{< gh-hovercard "8878" "a relatively large cleanup of the audio system" >}} and how it relates to pausing and shutdown. 
Before pull request 8842, the audio system had its own timer system for dealing with the backend (SDL or Cubeb) that ran independently of yuzu's timer system, 
`CoreTiming`. 
Now that the synchronization issues when doing this were fixed, Maide removed the custom timer system to now run everything through `CoreTiming`, which correctly 
handles pausing and shutdown. 
The scaffolding for the audio system to be aware of pausing and shutdown was therefore no longer needed, and could be deleted.

pic

These audio changes came with a minor regression. 
In multi-core mode, timer callbacks are run on their own thread, which allows them to execute independently of the CPU cores. 
However, because yuzu tries to be deterministic in single-core mode, every timing callback and every emulated processor instruction in this mode is run from a 
single host thread. 
In single-core mode, this prevents the timer callbacks from being effectively paused, which causes the audio service to try to continuously pause the game to catch up.
Maide worked around this issue by simply {{< gh-hovercard "8941" "not pausing if single-core mode is enabled." >}}

For once, Maide was not the only contributor to work on audio! 
vonchenplus noticed that the new hwopus service, which is a service for optimized playback of Opus audio, didn't implement any of the multi-stream functionality 
needed for `Dragon Quest X` to boot. 
He {{< gh-hovercard "8915" " added one new function that the game needed," >}} `GetWorkBufferSizeForMultiStreamEx`,  and the game booted.

Pic

## Core emulation

yuzu is slowly but gradually improving its ability to run homebrew applications. 
So when the team discovered that the [Ship of Harkinian](https://github.com/HarbourMasters/Shipwright) homebrew (a PC port of `The Legend of Zelda: Ocarina of Time`) 
did not work correctly in yuzu, they were intrigued and tracked it down to a single missing service implementation. 
[german77](https://github.com/german77) {{< gh-hovercard "8855" "added support for the `pl:s service`," >}} which is used for loading fonts, and the game now boots 
and renders, with frame interpolation up to 60 fps working correctly.

vid

In the realm of our "other architecture" news, [liushuyu](https://github.com/liushuyu) {{< gh-hovercard "8904" "modified yuzu's CMake setup to be partly compatible 
with the ARM64 architecture." >}} 
This allows building the yuzu-room LDN server application for ARM64.
Pi server, anyone?

Stay tuned for future news about yuzu on ARM64...

## Input Changes

One of the longstanding issues with yuzu's input emulation was motion controls not working after the controller reconnects.
Thanks to german77, {{< gh-hovercard "8847" "this has now been fixed." >}}
This was happening because yuzu was only checking for motion controls when the controller first connected, but not on subsequent reconnections.
Ensuring that yuzu checked for motion controls on every reconnection resolved this issue.

Over the years, yuzu's input emulation had been missing support for emulating the popular `Pokéball Plus` Controller.
In his efforts to reverse engineer this, german77 found that most meaningful features for it were locked behind Nintendo Switch Online (NSO).
Although this made him lose interest in it, he {{< gh-hovercard "8934" "partially implemented support" >}} for emulating this controller (including motion controls), 
thus opening it up for others to improve upon.
For now, you can select this in **Pokémon Let's Go, Pikachu/Eevee!** and use it as any other controller, but loading data from it or writing data to it is NOT 
supported.

Last month's Amiibo emulation support work also saw {{< gh-hovercard "8955" "major improvements and bug fixes." >}}
With these changes, Amiibo keys are now a mandatory requirement to read/write any data.
This also fixed Amiibo support on games like `Shovel Knight` and `Super Smash Bros. Ultimate` among others.

A minor {{< gh-hovercard "8863" "bug within GameCube controller" >}} input mapping which led to GC triggers overwriting the `ZL/ZR` buttons was fixed.
And to further complement this fix, german77 also made {{< gh-hovercard "8864" "analog input buttons toggleable" >}} for extended usability.

Accessibility is both very important, and, sadly, very easy to ignore too.
For example, something simple. What if a user needs more time to map buttons individually?
So, in an effort to help in this particular case, the {{< gh-hovercard "8880" "button mapping timer duration" >}} has been increased from `2.5 seconds` to 
`4 seconds`.

## UI Changes

We also had a variety of UI improvements from multiple contributors this month.

The old SD card icon has been {{< gh-hovercard "8902" "replaced with a new colourful microSD Card icon" >}} by [Dev-draco](https://github.com/Dev-draco).

pic

[Tachi107](https://github.com/Tachi107) {{< gh-hovercard "8945" "fixed a few minor typos" >}} within the yuzu source code. 

german77 modified the input profiles He also fixed the {{< gh-hovercard "8948" "sorting to now sort them by name." >}}

While the colourful theme has been the default for a while, some icons remained in a "Default" theme directory.
But as grabbing icons from other themes isn't supported on linux, this was broken.
Docteh fixed this by {{< gh-hovercard "8906" "moving all the icons to the colourful theme." >}}

Since the **Debug** configuration tab was getting crowded, Docteh {{< gh-hovercard "8854" "made it scrollable." >}}

pics

Docteh also fixed the {{< gh-hovercard "8909" "broken help page hyperlink on the `TAS` configuration window" >}}.

pic

## Miscellaneous 

For a long time, any yuzu bug reports from Windows users had to be manually reproduced and investigated by the team.
Linux users had the option of providing stack traces, but there wasn't an easy way for Windows users to provide similar debug info.

To overcome this, toastUnlimited implemented {{< gh-hovercard "8682" "support to create Windows crash dumps within yuzu" >}} itself.
This allows any layman on Windows to easily obtain a crash dump without jumping through various developer intended hoops.
But since this feature has a big performance impact, this was added behind an option in the **Debug** settings for users to access.
You can find it in `Emulation > Configure… > General > Debug > Create Minidump After Crash`.

Pic

Since the dumps use modern Windows SDK features, there’s a risk that this change can break compatibility with older Windows options.
Yuzu only officially supports Windows versions 10 1803 and newer. And Linux, of course.

## Hardware section

Users started reporting crashes when booting up `Xenoblade Chronicles 3` on AMD Radeon GPUs running official AMD drivers (either the Windows driver, or the Linux 
amdvlk driver).
We’re investigating and already passed AMD the relevant information.

Affected users can try running [Mainline 1188](https://github.com/yuzu-emu/yuzu-mainline/releases/tag/mainline-0-1188) (doesn’t seem to be a consistent fix), or 
just run the game using OpenGL.
The Mesa RADV driver is unaffected.

## Future projects

For once, we don’t have much to say in this section.
Or at least, we don’t want to start generating hype about new projects just yet.

[Blinkhawk](https://github.com/FernandoS27) has started working on part 2 of `Project Y.F.C.`, as previously mentioned, and the rest of the GPU gang (Byte[], Maide, 
vonchenplus) is also busy with some top secret changes (for now, your writer has a reputation to uphold) to improve both rendering accuracy and performance.

Having the first part of Y.F.C. merged to Mainline opens the floodgates to many projects that were on hold until now, we will talk about more of them in the next 
progress report.

That’s all folks! As always, many thanks for your time. We hope to see you next.

Special thanks to Mysterious Writer B for their help, and to CaptV0rt3x who came to aid at a moment’s notice.
