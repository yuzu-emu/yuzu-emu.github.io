+++
date = "2023-10-20T12:00:00-03:00"
title = "Progress Report September 2023"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 920177
+++

Hi yuz-ers! Last month has been interesting, and we're excited to report what we've been up to. Miis come out to play, GPU changes, Android improvements, and more! Let’s get into it.

<!--more--> 

## Of Miis and applets

{{< imgs
	"./miiedit4.png| Wii want to play"
  >}}

For quite some time, it has been possible to load the default Miis in supported games on yuzu. 
However, yuzu's implementation of the Mii service was lacking the necessary support for the Mii database.

The Mii database is a file saved on the Switch which holds up to 100 Miis.
Without the proper support for this database within the Mii service, it was impossible to load your custom Miis.

Our in-house input emulation expert, [german77](https://github.com/german77), embarked on an adventurous journey to test the MiiEdit applet as part of his ongoing quest to make system applets function smoothly on yuzu. 
Initially, things were progressing well, but his efforts hit a roadblock when softlocks while booting the applet became a recurring issue.

Suspecting that erroneous data from the Mii service might be the root cause of these softlocks, german77 decided to undertake the task of completely reverse engineering the Mii service.
His dedicated efforts led to an {{< gh-hovercard "11526" "almost fully-implemented Mii service," >}} with the only missing piece being the ability to send and receive Miis from nearby users.
This {{< gh-hovercard "11480" "comprehensive implementation" >}} involved rectifying some of the older code, reorganising data structures, and, at long last, providing support for the eagerly anticipated Mii database.
Adventurous users have the ability to load their own Mii characters in any game by placing their console’s database file at `%appdata%/yuzu/nand/system/save/8000000000000030/MiiDatabase.dat`.

With the Mii service completed and behind him, Narr swiftly returned to the task of making the MiiEdit applet function seamlessly on yuzu.
Thanks to some troubleshooting assistance from [byte[]](https://github.com/liamwhite), {{< gh-hovercard "11569" "he ultimately managed to make it work." >}}
The last piece of the puzzle was {{< gh-hovercard "11561" "completing Mii database support for the applet," >}} and with this crucial addition, yuzu's Mii functionality is now more robust than ever.
Users can now seamlessly create, edit, and store their Miis using the new MiiEdit applet via `Tools` > `Open Mii Editor`, and games can automatically generate a random Mii for players without crashing.

{{< single-title-imgs
    "Edit to your heart’s content"
    "./miiedit1.png"
    "./miiedit2.png"
    "./miiedit3.png"
    >}}

Building on the success of the MiiEdit applet, Narr continued his productive streak by {{< gh-hovercard "11632" "fully implementing support for the Cabinet applet." >}}
The Cabinet applet, if you weren't already familiar, is the amiibo manager applet. 
With these recent changes, users can register, rename, delete, and restore their amiibo data via `Tools` > `Amiibo`.

{{< single-title-imgs
    "And register as many as you want"
    "./cabinet1.png"
    "./cabinet2.png"
    "./cabinet3.png"
    >}}

## Graphics changes

Switching to the graphics department, let’s begin with some interesting decisions from the Khronos group that affected the Linux Mesa drivers.

After getting reports of crashes when running `Pikmin 4` on Linux, byte[] discovered that Khronos removed the ability to declare an `OpTypeSampledImage` for buffer textures from the latest release of the SPIR-V specification, the shader backend used by yuzu for Vulkan support.

This is extremely unusual — usually a deprecation is preferred (to not affect old code).
Mesa, being the textbook example of following the specification, followed through with this change, forcing us to {{< gh-hovercard "11435" "skip samplers for buffer textures." >}}
With these weird Vulkan decisions properly handled, `Pikmin 4` is once again playable for those running Mesa drivers.

Speaking of `Pikmin 4`, and of `Master Detective Archives: RAIN CODE`, byte[] also found the cause of the lighting issues and wrong faces rendering affecting the former and the latter game, respectively.

byte[] noticed an additional validation error Mesa was providing when debugging the issue with sampled buffers. yuzu's SPIR-V emitter was generating atomic operations on a typeless image, which the SPIR-V specification has never allowed. 
After a false start by trying to avoid typeless images, he found the real culprit: the code for generating SPIR-V atomics incorrectly used the array index of the image, instead of its designated descriptor.

{{< gh-hovercard "11567" "Correcting this shader behaviour" >}} fixed the headlamp lighting required in specific dark sections of `Pikmin 4` and the facial expressions of characters in `Master Detective Archives: RAIN CODE`.

{{< imgs
	"./p4.mp4| A little bit of exploration never hurt anyone (Pikmin 4)"
  >}}

[GPUCode](https://github.com/GPUCode) also joined the fray this month with several code additions.

First of all, something *light*, let’s introduce {{< gh-hovercard "11535" "separate command buffer uploads!" >}}
This gives the benefit of a slight performance uplift, caused by reduced renderpass breaks, which greatly helps mobile GPUs. 
The larger the renderpass, the longer mobile GPUs can keep data in tile memory, so breaking it is a costly operation. Dedicated GPUs benefit from this change, but much less.

We measured an 8% performance increase in some games with a 5800X3D. 
Lower end systems could see bigger gains.

GPUCode also fought against the rendering issues affecting `Mortal Kombat 1` and `Sonic Forces` when using Vulkan.
For those deep into the yuzu lore, this is a compute shader implementation of {{< gh-hovercard "11556" "MSAA image copies," >}} similar to what epicboy [did back in February](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2023/#other-gpu-and-video-changes).
As said back then, compared to OpenGL, Vulkan requires a lot more work.

{{< single-title-imgs-compare
	"Round 1, Fight! Emutality! (Mortal Kombat 1)"
	"./mk1bug.png"
	"./mk1fix.png"
>}}

This change also improves the original shader, allowing games like `Pinball FX3` to render and work correctly now, regardless of the graphics API in use, while also improving the rendering of games like `Fate/EXTELLA: The Umbral Star`.

{{< imgs
	"./msaa1.png| I ask of you. Are you my Master? (Fate/EXTELLA: The Umbral Star)"
  >}}

{{< imgs
	"./msaa2.png| Don’t break it, please (Pinball FX3)"
  >}}

Players of `The Legend of Nayuta: Boundless Trails`, and other Falcom games like `The Legend of Heroes` series, reported that text was rendered incorrectly, displaying weird colour highlights.
GPUCode investigated this and found that we were using the wrong colour component order (BGR vs RGB for example) for the `A4B4G4R4_UNORM` texture format.
Instead, `A4B4G4R4_UNORM_PACK16_EXT` has {{< gh-hovercard "11557" "the order" >}} the game expects, providing correct rendering.

{{< single-title-imgs-compare
	"Ask Jobs what he thinks about good font rendering (The Legend of Nayuta: Boundless Trails)"
	"./nayubug.png"
	"./nayufix.png"
>}}

Continuing this trend of texture fixes, GPUCode also identified a bug in how sRGB textures were being handled.

The problem was that sRGB textures could not be used as storage images in shaders. 
The solution was to create the texture as linear, which is another colour space that does not have gamma correction, and then use an sRGB view to access it. 
This way, the texture can be used as a storage image and still have the correct colours.

However, this solution had an unintended side effect. 
When the texture was used directly without the view — for example, when it was resolved by copying it to another image — the colours were wrong because the colour space had changed. 

To fix this, the pull request {{< gh-hovercard "11562" "ensures sRGB creation is only disallowed when transcoding," >}} which means that it always applies except when converting compressed formats to uncompressed formats on the GPU.
This way, the texture is created as sRGB and has the correct colours in both cases.

Thanks to this, `Momotaro Dentetsu` and `Star Ocean First Departure R` can now render with the colours and gamma intended by their developers.
The way it’s meant to be played, as a certain luxury-focused graphics card vendor says.

{{< single-title-imgs-compare
	"Don’t mess with my gamma! (Momotaro Dentetsu)"
	"./momobug.png"
	"./momofix.png"
>}}

Now’s the turn for our classic [Key](https://en.wikipedia.org/wiki/List_of_Key_video_games) visual novel fans, your writer included. 
Users reported the games had some terrible flickering.
The cause, as [Maide](https://github.com/Kelebek1) found out, is due to how particular the rendering for these classic games is.
Most games create a single render target on a single address, either 1080p or 720p. 
Key’s visual novels instead use the same address to create both 720p and 1080p render targets, with the 1080p one being created first, but never being used. 
yuzu, by default, always picked the first render target.

This wasn’t an issue for other games, but for this engine, the texture cache constantly detected the wrong image, causing it to alternate between both render targets on each frame. 
This resulted in a black frame being rendered between two valid frames, causing dangerous flickering for those with photosensitive epilepsy.

By changing yuzu’s behaviour to {{< gh-hovercard "11479" "look for the most recently modified image" >}} to present, the issue is completely fixed, and users can now cry entire nights reading these games.

{{< imgs
	"./planetarian.png| All the stars in the sky are waiting for you (planetarian)"
  >}}

And to close this section, [Blinkhawk](https://github.com/FernandoS27) fixed some {{< gh-hovercard "11646" "memory leaks" >}} caused by the recent query cache rewrite.

## Android additions

Our resident Terminator and Nier: Automata enjoyer [t895](https://github.com/t895), and other members of the team, continue to work hard on improving the experience of the Android build:

- A hardware limitation exposed by the Buffer Cache Rewrite from Project Y.F.C. was {{< gh-hovercard "11471" "worked around." >}} This change was done by GPUcode.
- A bug where certain temporary {{< gh-hovercard "11505" "settings would be reset" >}} on emulation start (for example, “Limit emulation speed”) has been fixed.
- An issue where {{< gh-hovercard "11506" "game shortcuts would appear cropped" >}} on certain devices was fixed.
- {{< gh-hovercard "11523" "The amount of thread workers for shader compilation" >}} was reduced to one. This is intended to reduce memory consumption.
- More {{< gh-hovercard "11542" "screen orientation and aspect ratio" >}} misbehaviours were fixed.
- An issue where the {{< gh-hovercard "11564" "input overlay" >}} would {{< gh-hovercard "11583" "draw offscreen" >}} on some devices was fixed.
- An issue where the {{< gh-hovercard "11594" "settings activity" >}} would appear dim when in landscape mode while using 3 button navigation was fixed.
- The in-game menu could be unintentionally opened during the loading animation. {{< gh-hovercard "11597" "This is now fixed." >}}
- {{< gh-hovercard "11613" "Several crashes" >}} related to the initial setup, emulation activity, and emulation fragment are now fixed.
- The emulator will now {{< gh-hovercard "11616" "correctly reload the settings file" >}} after resetting all settings.
- Lastly, a new settings menu {{< gh-hovercard "11603" "unifies all content installation" >}} into a single place. Users can now access the `Manage yuzu data` menu to import/export firmware, saves, user data, and install game content, console, and Amiibo keys. The {{< gh-hovercard "11543" "new User data option" >}} allows users to backup and restore all app data. Useful for example when migrating to other builds, like from a GitHub release to a Play Store release.

{{< single-title-imgs
    "For the convenience of the lady and the gentleman"
    "./data1.png"
    "./data2.png"
    >}}

## Audio changes

Maide shines here by giving us a {{< gh-hovercard "11460" "rewrite" >}} of the hardware Opus service, responsible for handling decompression of Opus-formatted audio in games.
The old implementation lacked several functions documented by the reverse engineering community, which is what this rewrite focused on the most.

Now the hardware Opus implementation matches the current information available.
Maide also took the opportunity to move the processing of Opus to the emulated ADSP (the emulated implementation of the audio coprocessor of the Switch).

The end result of this effort is allowing games that previously faced crashes when trying to decode Opus audio, like `MLB The Show 22 & 23`, the `Touhou` series games, `Pokemon Quest`, `Pokemon Let's Go Eevee!/Pikachu!`, and `Sea of Stars` to play the audio correctly without crashing.

Maide also fixed audio command processing, avoiding some command lists from returning early before being properly finished.
After an interruption, the previous implementation would restart processing the list from the beginning instead of continuing from where it left off. This stalled audio rendering until it finished properly.
Correcting {{< gh-hovercard "11465" "this behaviour" >}} solved cases where the audio engine would run too slowly, improving performance.

Another issue that required quite the investigation caused background sound in `Xenoblade Chronicles 2` to cut off randomly.
The cause was found to be in the data source commands during loops.
Changing the {{< gh-hovercard "11467" "behaviour between its different versions" >}} restored proper ambient noises to this great game and a few others.

To close this section, Maide also discovered what caused the dropping of music and voices in `New Super Mario Bros. U Deluxe`’s final level.
The audio command buffer sometimes took longer to process than estimated, which caused voices in the renderer to be dropped.
The game depends on this behaviour to some extent, but yuzu's calculation of the estimation was subtly incorrect, causing almost everything to be dropped.

{{< gh-hovercard "11520" "Improving the time estimation algorithm" >}} solved the issue.
Let’s hear those voices!

## Miscellaneous changes

Sometimes, we overlook testing on devices that don't meet our standard hardware recommendations.
With the addition of the new Vulkan VSync options, we made an incorrect assumption. As it turns out, users do not always have Vulkan drivers installed! Shocking, right?

While most of the time users do have support for Vulkan, that certainly is not the case for NVIDIA Fermi users (people that were promised a Vulkan driver but never got it), or users of Linux distros which don't package GPU firmware files, like [Trisquel](https://trisquel.info/).
This caused the {{< gh-hovercard "11450" "VSync combobox" >}} to refuse to offer any options when no Vulkan driver and device was detected, which blocked OpenGL-only users from toggling VSync.

While it’s easy to just ask the users to upgrade to newer hardware, and/or use a more functional distro, that doesn’t change the fact that the behaviour is incorrect.

Enter [toastUnlimited](https://github.com/lat9nq), who fixed the UI and took the opportunity to improve the broken Vulkan detection, ensuring OpenGL is selected as the default API if needed.

{{< imgs
	"./ogl.png| Fermi still rocking it"
  >}}

byte[] fixed {{< gh-hovercard "11473" "language selection" >}} being ignored in multi-program applications, which was affecting games like `Super Mario 3D All-Stars`, `Grandia HD Collection`, and others.
Proper localisation is very important to us! 
Not everyone can corrupt their minds by learning English, after all.

{{< imgs
	"./sm3das.png| ¡Mamá Mía! (Super Mario 3D All-Stars)"
  >}}

Newcomer [rkfg](https://github.com/rkfg) found one of those bugs that makes you question how this even worked before.
yuzu's parsing for the PFS file format would try to read filenames from the header as a C string.
C strings definitionally end at a null byte, but this failed to account for the fact that the next null byte could sometimes be well past the end of the header, and parsing a file with this specific construction would cause yuzu to fail to find files inside the archive and/or crash.
By unconditionally {{< gh-hovercard "11553" "inserting a null byte" >}} after the header data, rkfg solved this one.
Now games like `Luigi’s Mansion 3` don’t encounter strange crashes seemingly out of nowhere.

While working on more file system improvements, byte[] implemented a simple NCA (Nintendo Content Archive) verification system, which checks that the names of NCA files match their contents to guard against filesystem corruption.
Now users can {{< gh-hovercard "11456" "check the integrity" >}} of their game dumps by right clicking a game in the game list and selecting `Verify Integrity`.
Implementing proper signature and hash-based verification is planned, but expected to be very slow in comparison.

{{< imgs
	"./verify.png| Always helpful"
  >}}

By {{< gh-hovercard "11483" "stubbing" >}} the `GetSaveDataSizeMax` filesystem service method, [FearlessTobi](https://github.com/FearlessTobi) made `Minecraft Legends Deluxe Edition` able to display its boot screen.
Sadly the game crashes after that, guess there’s more work to do!

{{< imgs
	"./minecraft.png|This is as far as it goes for now (Minecraft Legends)"
  >}}

Continuing with the stubbing procedures, fixing up {{< gh-hovercard "11540" "purchase info calls" >}} allows `The Settlers: New Allies` to start properly.

{{< single-title-imgs
    "NVIDIA on the left, AMD on the right (The Settlers: New Allies)"
    "./nvidia.png"
    "./amd.png"
    >}}

As you can see, more work is needed to get this game to render properly.
Extra points for being a game that renders better on AMD over NVIDIA.

But what about {{< gh-hovercard "11496" "a new service?" >}} byte[] added a stub for the `ngc` service, allowing the `Baten Kaitos HD` collection to work.

{{< single-title-imgs
    "Old-school (Baten Kaitos HD collection)"
    "./bk1.png"
    "./bk2.png"
    >}}

Likewise, {{< gh-hovercard "11590" "adding" >}} the `GetFileSystemAttribute` service method makes `Tiny Thor` playable; it no longer gets stuck during the initial loading screens.
C’mon, without googling, spell the name of Thor’s hammer correctly.

{{< single-title-imgs
    "So adorable! (Tiny Thor)"
    "./tt1.png"
    "./tt2.png"
    "./tt3.png"
    >}}

Back again with good fixes is [Squall-Leonhart](https://github.com/Squall-Leonhart), who now focused on Windows file system error handling.
For example, yuzu would simply crash if you disconnected a removable storage containing games loaded into yuzu’s list, a network SMB share, or a Bitlocker protected location was unavailable.

But not anymore! By adding the {{< gh-hovercard "11499" "proper error handling" >}} to these file system exception cases, the emulator now avoids a crash here; complaining, but working. 

Managing another critical blow to the fight for proper shutdown behaviour, byte[] managed to spot an {{< gh-hovercard "11652" "optimization" >}} that should save around a second of time on high-end CPUs.
Does this mean the fighting is over? No, some edge cases remain, but now under normal circumstances, closing a game should be almost instantaneous.
We have a medal ready for byte[].

## Hardware section

### NVIDIA: VRAM fixes, and focusing on the latest hardware

The latest driver releases have proven to be stable for Turing and newer products, but we got reports of small regressions affecting Pascal and Maxwell users.
If you’re still running older 750, 900, and 1000 series products and you face new issues in games, try reverting to older driver versions like the 52X series.

Still, it's worth to mention that driver release `545.84` seems to have solved the instabilities caused by excessive VRAM use, like for example while running `The Legend of Zelda: Tears of the Kingdom` in the Depths with 2GB/4GB GPUs of any architecture.
This is great news for low-end users struggling to run this particularly ASTC-heavy game.

### AMD: general fixes, AutoHDR, VSync problems, and frame interpolation

First, good news, the latest Windows driver version at the time of writing, `23.10.2` has solved the D24 issue affecting AMD cards on Vulkan.
Those bothered by clipping lines and textures should upgrade to get the proper graphics experience.
Keep in mind that this doesn't solve the vertex explosions affecting the Pentelas region and the DLC of `Xenoblade Chronicles 3`, we manage to confirm this is a different issue affecting AMD cards on a much lower level, as it is architecture, OS, and driver agnostic.

Another good bit is that recent drivers also seem to have introduced DXGI swapchain support, allowing AMD cards to work with AutoHDR out of the box. 
There doesn't seem to be a driver toggle for this though.
Users interested in enabling AutoHDR for yuzu can use [this piece of software](https://github.com/ledoge/autohdr_force) to do the registry work for them.

Now for a bit of bad news. 
Windows driver version `23.9.3` and newer cause the VSync options to be ignored, resulting in tearing during gameplay.
If you’re affected by this, revert back to driver `23.9.2` for now.
The standard procedure was followed: we've opened a ticket with AMD regarding this issue and provided a generic test case.

ED: Driver `23.10.2` seems to have solved this issue entirely, we recommend updating to it.

Switching to something more interesting, we heard you! Despite our previous rants about frame generation, we think
vendor-agnostic frame generation like FSR3 would be cool to make Pokémon games playable, but the same requisites which prevent us from using
FSR2, or even DLSS/XeSS for that matter, apply here.
Games don’t report their motion vector data to the console, since they were never developed to support DLSS.

There are ways to implement this, such as adding one frame of delay and extrapolating data. 
The downside here is that 33ms of delay for 30 FPS games would be an awful experience.
We could guess motion from previous frames, but this could have a very high performance cost and can potentially produce erratic results, old frames can't read the future.
Or we could dip our toes into AI, which has given us unsatisfactory results in the past.
While coding a generic way to extract motion vector data might be possible, it’s a huge endeavour, so expect it to be a very low priority at the moment. 
We have bigger fires to put out first, after all.

What could work is [AFMF](https://community.amd.com/t5/gaming/amd-fluid-motion-frames-is-out-now-on-amd-radeon-rx-7000-series/ba-p/634372), if AMD adds Vulkan support for it in the future.

“But writer, AFMF is not vendor-agnostic! It’s an AMD Windows driver exclusive feature!” you say.
Ah, but that's where you’re wrong. It is vendor-agnostic on desktop PCs! Kinda. 

The only thing you have to do is get an RX 6400 (or higher) as a secondary GPU in your desktop PC, connect your displays to it, and enjoy enforcing frame interpolation even when using a primary Intel or NVIDIA GPU for rendering!
Sadly, this doesn’t apply to yuzu yet, because the current beta driver for AFMF at the time of writing only supports the Direct3D 11 and 12 APIs. 

Let’s hope we get Vulkan support and we may be able to finally see `Tears of the Kingdom` hitting over 100 FPS, or `Pokémon Scarlet` model animations reaching ~~smooth~~ cinematic 30 FPS.
Meanwhile, try to enjoy converting 20 FPS to 40 when using Path Tracing.
At least you don’t have to pay 500+ bucks for this.

### Intel...

Sadly, we have another driver-level issue to report from Team Blue.
This time, the problem is in geometry shaders.
The SPIR-V shader compiler crashes the Vulkan Arc driver due to a [null pointer dereference](https://www.youtube.com/watch?v=bLHL75H_VEM).
This affects many games, even popular ones like `Xenoblade Chronicles 3` and `The Legend of Zelda: Tears of the Kingdom`.

The bug report has been filed. Fingers crossed for a resolution faster than seven months this time, and a more satisfatory result than 14th gen products.

### Turnip, steadily progressing

The latest release of the Turnip driver for Adreno 700 series at the time of writing, [R7](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v23.3.0_R7), seems to reduce overhead considerably, resulting in less overheating for Qualcomm Android users.
Since the driver is also compatible with Adreno 600 series GPUs, we recommend users to give it a try.

A word of warning though! Turnip drivers don’t have support for Adreno 725 and Adreno 730 GPUs at the moment. 
Older releases like [R5](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v23.3.0_R5) can be used on these devices instead.

The official Qualcomm driver got some updates, but it continues to be absolutely terrible, so we don’t recommend using it, if at all possible.

## Future projects

Project Nice, the implementation of native code execution (NCE) for ARM devices is booting its first games!

{{< single-title-imgs
    "And so it begins…"
    "./nce1.jpg"
    "./nce2.jpg"
    >}}

A lot more work is needed before we can even move to the internal testing phase. There are many crashes and softlocks to sort out first, so please have some patience, Android gang.

With the progress on the Album applet going so well, german77 is progressing further into other interesting applets too. Stay tuned.

{{< imgs
	"./album.png|There’s an easter egg somewhere here!"
  >}}

That’s all folks! Hope you enjoyed this month's report.
See you next time!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
