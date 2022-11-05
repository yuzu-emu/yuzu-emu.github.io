+++
date = "2022-11-03T12:00:00-03:00"
title = "Progress Report October2022"
author = "GoldenX86"
forum = 0
+++

Greetings dear yuz-ers! What a month we had. A dozen graphical fixes, big kernel changes, audio, input and amiibo fixes, and more! 
Don’t touch that dial, because here we go!

<!--more-->

## Graphics and general bug fixes

Let’s start with the meaty part. New month, new games to fix!

`Persona 5 Royal`, one of two blockbuster releases this month, launched with some mysteriously black battle scenes in Vulkan.
[vonchenplus](https://github.com/vonchenplus) identified this as missing support for special OpenGL-style clear commands which are not supported by the Vulkan specification, and added a workaround to {{< gh-hovercard "9127" "skip clearing" >}} in this case. 
More work remains to be done to properly implement these clears in Vulkan, but this allows the game to be playable.

{{< single-title-imgs-compare
    "Joker, no stealing the screen! (Persona 5 Royal)"
    "./p5bug.png"
    "./p5fix.png"
>}}

Longtime graphics contributor [Blinkhawk](https://github.com/FernandoS27) [has returned from the dead](https://www.youtube.com/watch?v=sOnqjkJTMaA) to fix games.
 The other major release of this month, `Bayonetta 3`, came out, and to users' dismay, it did not work in yuzu. 
After defeating the services issue causing it to freeze, Blinkhawk investigated and fixed a {{< gh-hovercard "9155" "rendering issue" >}} causing it to appear white in Vulkan.

{{< single-title-imgs-compare
    "Is this Paradise? (Bayonetta 3)"
    "./bayobug.png"
    "./bayofix.png"
>}}

A new challenger approaches! 
Or rather, a new showing from some older games, `Super Mario Sunshine` and `Super Mario Galaxy`. 
While correct rendering support for these games was previously only available on Vulkan and OpenGL with the GLSL backend, it is now {{< gh-hovercard "9011" "supported with the NVIDIA-exclusive GLASM backend," >}} as [byte[]](https://github.com/liamwhite) finally acquired some NVIDIA hardware for testing and development.

{{< single-title-imgs-compare
    "Best. Music. Ever! (Super Mario Galaxy)"
    "./bayobug.png"
    "./bayofix.png"
>}}

An Nvidia card is not the only new hardware acquired by byte[] this month. 
He also acquired an Intel Arc A770 16GB, and used it to track down a driver issue. 
Despite passing all of our validation tests, the Vulkan Arc driver is unable to compile the ASTC decoder used by yuzu, and yuzu unconditionally compiles it at startup. 
So byte[] has {{< gh-hovercard "9097" "skipped compiling it if CPU decoding for ASTC is used" >}} instead, and filed a [report to Intel for their reference](https://github.com/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/159)
This allows booting games on Vulkan when using the Intel Arc Windows Vulkan drivers.

{{< imgs
    "./arc.png| Blue Player joins the fray! (Super Mario 3D World + Bowser's Fury)"
  >}}

byte[] also found and investigated two issues with the macro JIT this month. 
The macro JIT is an optimization which recompiles small programs that are uploaded to the GPU to control drawing into native machine code. 
The first issue he resolved allowed homebrew applications using the [deko3d](https://github.com/devkitPro/deko3d) rendering API to finally {{< gh-hovercard "9005" "become visible with the macro JIT enabled." >}}

{{< imgs
    "./deko1.png| Better than NVN, it's free!"
  >}}

The second issue was causing `MONSTER HUNTER RISE` to fail to render most scene elements.
yuzu had a workaround in Mainline for [over a year!](https://github.com/yuzu-emu/yuzu/pull/6598) which papered over this issue, which is why it took so long to get fixed.
byte[] fixed this issue as well, and {{< gh-hovercard "9010" "now all is working as intended" >}} -- there are no more known issues with the macro JIT!

{{< single-title-imgs-compare
    "Someone put a world in my ocean (MONSTER HUNTER RISE)"
    "./mhrbug.png"
    "./mhrfix.png"
>}}

Unfortunately, fixing the accuracy issues in the macro JIT has caused `Xenoblade Chronicles 3` to crash at boot with official AMD Vulkan drivers used on Windows and opt-in on Linux (amdvlk). 
This issue previously manifested with the macro JIT disabled, and occurs due to a crash that happens when submitting a clear command. 
We have reported this as a driver issue to AMD, and they have responded, confirming to be looking into the issue.
While we wait for the fix, using OpenGL while running the game on 2x scaling is an alternative.

Speaking of `MONSTER HUNTER RISE`, Blinkhawk contributed another fix for the rendering in this game {{< gh-hovercard "9025" "implementing the ASTC 10x5 format." >}} 
Grainy textures begone!

{{< single-title-imgs-compare
    "ASTC acne, begone! (MONSTER HUNTER RISE)"
    "./mhr2bug.png"
    "./mhr2fix.png"
>}}

byte[] found that while he was debugging graphical issues, yuzu would frequently crash after the merge of Project Y.F.C. 
He narrowed it down to some code that was improperly ported from our friends at the [Skyline emulator](https://github.com/skyline-emu/skyline) {{< gh-hovercard "9049" "and landed a fix," >}} finally allowing him to debug without worrying about the game's rendering speed causing any issues.
Now the user’s PC performance won’t be a cause for crashes.

[Maide](https://github.com/Kelebek1) and [Morph](https://github.com/Morph1984) were on top of two regressions from the merge of the 3D registers pull request from a few months ago.
Morph found that the merge was causing many shaders to be recompiled unintentionally, and narrowed it down to {{< gh-hovercard "9067" "a different default value for the tessellation parameters in the register definitions." >}} 

Meanwhile, Maide and byte[] worked together to find a strange rendering problem affecting Luigi's Mansion 3, and finally found the issue in {{< gh-hovercard "9048" "the values of the stencil mask registers." >}}

{{< single-title-imgs-compare
    "Luigi saw how much an RTX 4090 costs (Luigi's Mansion 3)"
    "./lm3bug.png"
    "./lm3fix.png"
>}}

vonchenplus found an issue with how a compute shader for `TRIANGLE STRATEGY` was being compiled by yuzu's own shader recompiler project, and {{< gh-hovercard "9126" "implemented a fix by deleting a broken optimization pass," >}} returning blocky rendering to normal.

{{< single-title-imgs-compare
    "Project Rectangle, I mean, TRIANGLE STRATEGY"
    "./prbug.png"
    "./prfix.png"
>}}

Still on a roll, vonchenplus also implemented 1D texture copies based on the VMM “kind”, resulting in much improved rendering in `Snack World The Dungeon Crawl Gold`.

{{< single-title-imgs-compare
    "Almost looks like a 3D TV without glasses (Snack World The Dungeon Crawl Gold)"
    "./sw2bug.png"
    "./sw2fix.png"
>}}

As Blinkhawk is finally back in the realm of the living, the team can finally start nagging him to fix his changes, more specifically, Project Y.F.C. part 1.
After {{< gh-hovercard "9095" "addressing some semaphores and cache flush regressions," >}} Blinkhawk fixed the remaining glitches affecting the ink logic in `Splatoon 2` and the models flickering in the ATM in `Animal Crossing: New Horizons`.

{{< imgs
    "./blink.png| Long vacations"
  >}}

As byte[]'s kernel and services work this month has been focused on getting homebrew running, there have also been some graphical fixes associated with getting it running. 
The first was to get it running consistently at all. 
About half the time, byte[] noticed that starting homebrew in yuzu would often cause the entire emulator to lock up - but only when using Vulkan. 
After enabling validation layers, and some careful investigation of the messages, he found and {{< gh-hovercard "9016" "fixed a subtle race condition in Vulkan queue submission," >}} finally enabling homebrew apps to work reliably with Vulkan.

{{< imgs
    "./deko2.png| You could say that unit tests are at the heart of emulation development"
  >}}

vonchenplus has also been on the ball with homebrew support this month, and gifted yuzu corrected support for instanced draws and {{< gh-hovercard "9112" "the zany inline index 3D registers," >}} fixing gpu_console and allowing the `Sonic 1 (2013)` homebrew game to render in yuzu. 
{{< gh-hovercard "9140" "The usual slate" >}} {{< gh-hovercard "9163" "of regressions" >}} associated with these changes, this time affecting `Super Mario 64`, `Super Mario Galaxy`, `Xenoblade Chronicles 3` and `Animal Crossing: New Horizons` have also been identified and fixed.

{{< imgs
    "./console.png| "
  >}}

{{< imgs
    "./sanic.mp4| Yes Doctor, all the nostalgia directly to my bloodstream (Sonic 1 2013)"
  >}}

Finally, byte[] implemented a fix for the intense, seizure-inducing flickering induced by launching homebrew from the homebrew menu in Vulkan mode [#9154], which {{< gh-hovercard "9154" "was caused by not recreating the images intended for presentation." >}}
Now, you can launch console homebrew from the homebrew menu, just like on the Switch!

{{< imgs
    "./hbmenu.png| Emulating hacked consoles is so hot right now"
  >}}

Switching subjects to smooth changes where you don’t even expect them, here’s a quality of life improvement byte[] added this month.
In the past, writing a screenshot taken by yuzu to disk would noticeably block rendering the game.
The user would perceive this as a relatively short freeze (the time of this freeze varies according to the size of the resolution multiplier in use).
byte[] {{< gh-hovercard "9024" "made this fully asynchronous," >}} allowing for smooth gameplay even during intensive user photo sessions.

## CPU, Kernel, services, and core fixes

A fix for CoreTiming accuracy from a few months ago, as part of [Pull Request #8650](https://github.com/yuzu-emu/yuzu/pull/8650), was added to intentionally waste CPU cycles until a certain amount of time had passed, due to extremely poor support in Windows for high precision timing events. 
But in Linux, no such fixes are needed, since Linux natively supports high-precision delays, so byte[] allowed Linux users to take advantage of this and {{< gh-hovercard "9040" "lower the high CPU usage." >}}
Remember when we say that yuzu is faster on Linux? This is the kind of stuff we mean.

`No Man's Sky` was released, and our tester [Law](https://github.com/Law022) found that it could boot with auto-stubbing enabled. 
byte[] investigated the log file, and stubbed the previously unimplemented calls {{< gh-hovercard "9032" "CheckFriendListAvailability" >}} and {{< gh-hovercard "9033" "GetCacheStorageSize," >}} allowing `No Man's Sky` to boot without any stubbing.

{{< imgs
    "./nms.png| Still the best screensaver"
  >}}

`Bayonetta 3`'s release caused some issues that were tricky to track down. 
Your resident [bunnei](https://github.com/bunnei) rabbit properly implemented `ListOpenContextStoredUsers`, and the related `StoreOpenContext` which is used to set stored opened user profiles.
`ListOpenContextStoredUsers` was causing `Bayonetta 3` to crash on startup. 
{{< gh-hovercard "9157" "Fixing the stubs" >}} allowed the game to finally boot, and while it is now playable, it is quite slow still. 
Stay tuned for performance optimizations regarding this game!

[german77](https://github.com/german77) took part in the fun, {{< gh-hovercard "9149" "stubbing the SetRecordVolumeMuted service," >}} allowing the game to boot.

{{< imgs
    "./bayo.png| Hot protagonists in your area (Bayonetta 3)"
  >}}

Another notable release from bunnei this month was the beginning of the {{< gh-hovercard "9071" "multi-process project." >}} 
Since the very beginning, yuzu has only ever supported a single-process architecture, since games only ever would use one process on the Switch. 
However, to help improve yuzu's accuracy to the Switch software, yuzu has been focusing on getting key operating system features working, and one of the most important is multi-process support, since this corresponds to how the Switch software actually works.

byte[] and bunnei have been hard at work this month getting certain prerequisites available for multi-process support. One of those is {{< gh-hovercard "9055" "support for server sessions," >}}  needed for the nx-hbloader homebrew. 
This is used on the Switch to launch homebrew, and is needed for homebrew that do not work when launched directly from their NRO file.

Additionally, byte[] also needed to {{< gh-hovercard "9137" "fix several services," >}} as the previous stub implementations had assumed that they would never be torn down. 
With these changes, and the associated graphical fixes, nx-hbloader and nx-hbmenu now finally work as intended! 
To use them, you can extract hbl.nsp and hbmenu.nro from your Atmosphere installation. 
Place hbmenu.nro in yuzu's SD card directory, and then launch hbl.nsp, and the homebrew menu will boot:

{{< imgs
    "./hbmenu.mp4| They launch now"
  >}}

Let’s talk about amiibos.
Amiibo data is stored both encrypted and as plain data. 
To access the encrypted portion, a key dump is required, but not all games use the encrypted portion, some are just fine with the plain text available.
For those cases, german77 now {{< gh-hovercard "9113" "marks amiibos as read-only if no key dumps are available." >}}
This won’t replace dumping your amiibo keys if a game needs it, but many games will be fine with just a basic level of read-only detection.

{{< single-title-imgs
    "Thank you Gidoly and german77 for the pics!"
    "./amiibo1.png"
    "./amiibo1.png"
    "./amiibo1.png"
    >}}

## Input improvements

Here’s some Switch Vs PC compatibility debate. 
The emulator performs vibration tests regularly each time the game initializes a controller for vibration, the problem (there’s always a problem) is that some controllers take longer than others to respond.
Previously, a fixed 15ms delay was implemented, because some controllers just needed that much time to respond.
If the game performs successive vibration tests, the game is delayed until the controller responds, reducing framerates, for example, from 60 to 32 FPS. 
All that performance being lost waiting for a bad quality controller.

So, a better middle ground is needed. Thankfully german77 came with a much smarter solution.
Instead of repeating the test each time, it’s better to {{< gh-hovercard "9107" "cache it the first time and return that same result afterwards." >}}
A nice free performance boost for generic controller users.

Newcomer [ZwipZwapZapony](https://github.com/ZwipZwapZapony) (love the name) {{< gh-hovercard "9008" "fixed a copy-paste oopsie in how left and right controller colours are identified." >}}
Thank you!

## Audio changes

Ever noticed how in motherboard BIOS/UEFI settings, the Auto option seems to do nothing, instead just being the first option available?
Well, we cheated you exactly like that for years, the “auto” audio backed option only selected cubeb every time by default. The shame.
Maide found out that some audio devices incur a huge latency when using cubeb, so he decided to {{< gh-hovercard "9039" "perform a latency test" >}} and select either cubeb or SDL based on the results.

[toastUnlimited](https://github.com/lat9nq) then {{< gh-hovercard "9080" "addressed a regression" >}} caused by this change, avoiding a crash.

New Switch firmware versions usually come with their fair share of new services and additions, so in an effort to avoid potential problems in future games, Maide {{< gh-hovercard "9096" "implemented some new parameters" >}} that Nintendo added to their audio core with firmware 15.0.0.

## User interface improvements

Some users prefer displays closer to the [Golden Ratio](https://en.wikipedia.org/wiki/Golden_ratio), the glorious 16:10 aspect.
Now, while Switch games are not intended for any ratio different to the standard 16:9, some users are OK with stretching the image to fill their whole display, even if it means some slight distortion.
This has been increasingly popular with the release of the Steam Deck, which uses a 16:10 display, sporting a 1280x800 resolution.
There’s also the option of the community coming up with different aspect ratio mods for each game, allowing for proper use of those nice extra pixels.
german77 took the time to {{< gh-hovercard "9047" "add this new option to the aspect ratio list," >}} which you can find in `Emulation > Configure… > Graphics > Aspect Ratio`.

{{< imgs
    "./aspectratio.png| I'm personally not a fan of stretching, long live the black bars"
  >}}

[Docteh](https://github.com/Docteh), Morph, and [lioncash](https://github.com/lioncash) (who diverted some time from the usual, making sure all PRs submitted to yuzu are sane) had their {{< gh-hovercard "9076" "fair share" >}} of fixing {{< gh-hovercard "9079" "spelling mistakes." >}}. 
Happens to the best of us.

In an effort to help reduce user confusion while we rework our compatibility reports, Docteh added a new option to {{< gh-hovercard "9091" "hide the compatibility rating column" >}} from the game list by default.
Anyone interested in reverting it back, can find it in `Emulation > Configure… > General > UI > Show Compatibility List`.
Keep in mind reports will not be accurate while we work to implement the new report system.

{{< imgs
    "./compat.png| We're working to solve all those Not Tested reports"
  >}}

Not everyone prefers to have their games listed in English in the game list, many would rather have them in their native language, or at least another option from the official languages the Switch supports.
vonchenplus worked to solve this, and now yuzu {{< gh-hovercard "9115" "prioritizes displaying the games in the user selected language." >}}

{{< single-title-imgs-compare
    "Even if working online forces you to constantly use English, reading in your native language is always the best"
    "./langbug.png"
    "./langfix.png"
>}}

## Hardware section

This section will be short this month, most stuff is in progress.

#### AMD WIP

As we said previously, we got confirmation from AMD that they are looking into the cause for the crashes at boot now affecting `Xenoblade Chronicles 3`, along with other previously reported fixes.

Future drivers will be fun to test.

#### NVIDIA, one step closer

We’re making some slow progress in the matter of stability problems affecting Maxwell and Pascal cards.
It’s too early to promise anything, so we’ll keep you updated.
In the mean time, if you MUST run the latest drivers, use OpenGL.

Hopefully the next mid-range cards won't cost an entire PC.

#### Intel ARC, let’s go!

With games now working on Vulkan thanks to byte[], we only need proud owners of Team Blue cards reporting issues on our GitHub.
Intel, there are sales outside of Europe, China, and the USA, please start shipping already so your writer can start testing… 

This goes for you too, Gaben.

## Future projects

With all the regressions caused by the first part of `Project Y.F.C.`, Blinkhawk has started passing us internal testers with the first test builds of some of the changes Part 2 will include.
As with any first try, there are of course regressions, but some long-standing issues were already gone in those builds, so expect more news in future articles.

Not forgetting our file system rewrite, `Project Gaia`, Morph implemented {{< gh-hovercard "9082" "support for the incoming save data path structure." >}}
Work on `Gaia` continues, some roadblocks were hit, slowing progress down, but Morph pushes on.

Special thanks to Mysterious Writer B for their big help while your writer is half dead dealing with classes.

{{< imgs
    "./byte.png| He's Vengeance! He's the Night!"
  >}}

That’s all folks! Thank you for taking your time. See you next month!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
