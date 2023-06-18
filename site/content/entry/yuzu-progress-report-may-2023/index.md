+++
date = "2023-06-17T12:00:00-03:00"
title = "Progress Report May 2023"
author = "GoldenX86"
forum = 835148
+++

*What a month!* GOAT releases, yuzu ventures onto new platforms, we get a taste of Project Gaia, full Amiibo support, further Project Y.F.C., and a lot more!
Put on your safety belt and start playing some [eurobeat](https://youtu.be/8B4guKLlbVU), this will be a long ride.

<!--more--> 

## The Legend of Zelda: Tears of the VRAM

Six years and the wait was worth it. 
No pay to win mechanics, no soul-draining microtransactions, no apology letter published after release. [Just game, just good game](https://youtu.be/i1qnIBLNOG0?t=16).

{{< imgs
	"./totk1.png| Runs on a 2015 tablet. (The Legend of Zelda: Tears of the Kingdom)"
  >}}

Zelda is back, and once again teaches the gaming industry how to make a video game, while also making it fit inside a 15-year-old USB stick and run on an 8-year-old mobile SoC.

{{< imgs
	"./totk2.png| And it’s only 16GB! (The Legend of Zelda: Tears of the Kingdom)"
  >}}

`The Legend of Zelda: Tears of the Kingdom` not only made its predecessor (a game which already reinvented how open-world gameplay should be done) look like a tech demo, but it also turned out to be one massive heavyweight, punching way above its class in hardware requirements when emulated.
The combination of a heavier physics engine, massive amounts of shaders, and the ludicrous use of enormous ASTC textures has brought emulators to their knees.

Let’s begin with the most complex problem the Princess introduced the project to. The old Switch-emulation-on-PC nemesis, now elevated to new heights: ASTC.

{{< imgs
	"./deer.png| Deer. (The Legend of Zelda: Tears of the Kingdom)"
  >}}

As there isn't a single dedicated desktop or laptop graphics card that supports the native decoding of [ASTC textures](https://en.wikipedia.org/wiki/Adaptive_scalable_texture_compression) (with the exception of Intel iGPUs), yuzu is forced to transcode them on the fly into a safe and lossless format that all GPUs support; in this case, the `RGBA8` format.

This was perfectly fine until now (even on 2GB GPUs), since `ASTRAL CHAIN` was the only game that made "extensive" use of ASTC textures, shipping with 4K textures on a mobile device intended for 1080p and 720p screen resolutions. 
Our garbage collector, introduced two years ago with [Project Hades](https://yuzu-emu.org/entry/yuzu-hades/), which our veteran users know as “the memory Reaper”, was tuned for this worst case scenario at the time.

But what happens if a game with many more textures and a teletransportation system that allows the player to reach different regions in-game (and, in turn, load a truckload of new, different textures) releases?
What if this hypothetical game made use of dozens and dozens of huge ASTC textures?

{{< imgs
	"./totk3.png| The VRAM is on fire! (The Legend of Zelda: Tears of the Kingdom)"
  >}}

Well, suddenly the old and trusted garbage collector we developed is no longer capable of keeping even 8GB GPUs working.
That’s right, the VRAM starvation affecting the PC gaming industry hurts yuzu too.
Serious changes had to be made, and they had to allow 2GB GPUs to still be compatible somehow.

{{< imgs
	"./gpu.jpg| Your writer’s Tower of VRAM Testing. GTX 750 2GB, RX 550 2GB, and RX 6600 8GB. Not pictured, GTX 1650 4GB, GTX 1660 SUPER 6GB, and RTX 3060 Ti 8GB"
  >}}

The solution, which took many attempts, was split into several parts to ensure that no other games were negatively affected by the changes, and required the combined efforts of [Maide](https://github.com/Kelebek1), [byte[]](https://github.com/liamwhite) and [Blinkhawk](https://github.com/FernandoS27).

While investigating very low VRAM devices, byte[] found that yuzu used {{< gh-hovercard "10286" "incompatible memory property flags" >}} when the Vulkan memory allocator was under pressure, causing low VRAM GPUs to crash when trying to actually use a recycled allocation.

Having more VRAM available certainly helps, but that’s not enough to avoid the game from biting off more than the GPU’s memory can chew under stressful conditions — for example, teleporting between different regions.

Previously, if VRAM was almost full, the memory manager would try to use shared memory, which is just a portion of system RAM, for new allocations.
This caused massive slowdowns during gameplay, as the transfer operation of going over system RAM, CPU, PCIe, GPU, and finally VRAM is a slow process that introduces a high latency.

Collecting memory in VRAM is much faster than transferring data over to system RAM.
So, instead of relying on the slow shared memory, the memory manager (Reaper) now {{< gh-hovercard "10288" "keeps everything in dedicated memory" >}} (VRAM), leaving some free space to accommodate sudden spikes in VRAM usage when new assets are loaded.
If you see 2GB or more of always-free VRAM in your system, know that its purpose is to keep gameplay smooth, even on 4GB GPUs.
Don’t worry, we’re not wasting your precious VRAM. We’re just keeping it warm and cozy for when you need it.
This also has the added benefit of saving on system RAM consumption, allowing 8GB RAM users to have more stable gameplay.

All of this is not enough to allow 4GB VRAM users or less to achieve stable gameplay, so it’s time to reveal the ace up yuzu’s sleeve.
What if, instead of relying on the pixel-accurate but bigger `RGBA8` texture format, the emulator recompressed to some other smaller formats?

Ladies and gentlemen, we present you `ASTC recompression`, a {{< gh-hovercard "10398" "new option" >}} available in `Emulation > Configure > Graphics > Advanced` that intends to reduce VRAM consumption by turning those Ganon-cursed unsupported ASTC textures into something more suitable for low-VRAM GPUs.

{{< imgs
	"./astcrecomp.png| We recommend avoiding BC1 if possible."
  >}}

The principle is pretty simple, we just add one more step to the recompression process, from ASTC > RGBA8, to ASTC > RGBA8 > [BC1 or BC3](https://en.wikipedia.org/wiki/S3_Texture_Compression).

The default `Uncompressed` setting uses the old `RGBA8` method, which preserves the original image quality, but also consumes the most VRAM.
For users that wish to emulate `Tears of the Kingdom`, we recommend setting this option if their GPU has at least 10-12GB of VRAM.
For other, more **reasonable** games, this option is suitable for users with cards with at least 4GB of VRAM.

The `BC3 (medium quality)` setting reduces the VRAM usage of ASTC textures by a factor of four, with a very minimal loss in quality, typically showing as marginally softer textures.
This setting is recommended for emulating `Tears of the Kingdom` on 6GB and 8GB GPUs.
For other games, this setting is good for GPUs with 3GB of VRAM.

Finally, the `BC1 (low quality)` setting cuts down the VRAM consumption by a factor of eight, but will also have a significant impact on texture quality, to the point where some assets will look completely different.
We don’t recommend using this setting unless you really have to. 
It allows users with 4GB of VRAM to play `Tears of the Kingdom` without significant issues, and will make 2GB users have a smoother and more reliable experience in other games.

{{< single-title-imgs
    "From first to last, BC1 vs BC3 vs ASTC (Fire Emblem Engage)"
    "./bc11.png"
    "./bc31.png"
    "./astc1.png"
    >}}

As you can see, BC1 destroys image quality in some games.

{{< single-title-imgs
    "From first to last, BC1 vs BC3 vs ASTC (The Legend of Zelda: Tears of the Kingdom)"
    "./bc12.png"
    "./bc32.png"
    "./astc2.png"
    >}}

But in others, the difference is less noticeable.
If you only have 2GB of VRAM and 8GB of RAM, the sacrifice may be worth it.

This is currently done using the CPU, but GPU acceleration is planned for the future.
We also hope to add an option to use BC7 in the future to provide a higher quality experience.

Keep in mind that {{< gh-hovercard "10398" "ASTC recompression" >}} only works on ASTC textures, so the actual VRAM usage reduction will depend on the game. Not every resource held in VRAM is ASTC.
If your hardware can handle ASTC natively, this setting won’t do anything for you, as there's no need for any recompression.

In addition, byte[] has also {{< gh-hovercard "10422" "tuned the memory manager" >}} to be more ruthless.
This change should help improve gameplay stability during long sessions on systems with less RAM.
yuzu always aims to support a minimum of 8GB of RAM on systems with dedicated GPUs.

He also made sure that {{< gh-hovercard "10452" "memory collection doesn’t happen during the configuration step," >}} so that it doesn't cause a device loss (i.e. the GPU driver shutting down).

By fixing the {{< gh-hovercard "10433" "block depth adjustment on slices," >}} Blinkhawk solved the rendering issues affecting the gloom textures on the terrain in `Tears of the Kingdom`, a bug that was especially frustrating on low VRAM hardware.

{{< single-title-imgs-compare
    "Let’s not make the gloom feel depressed… (The Legend of Zelda: Tears of the Kingdom)"
    "./gloombug.png"
    "./gloomfix.png"
    >}}

And for integrated GPU users with 16GB of system RAM or less, such as the Steam Deck, newcomer [scorpion81](https://github.com/scorpion81) has a treat for you.
{{< gh-hovercard "10411" "Setting a hard cap at 4GB" >}} allows `Tears of the Kingdom` to be playable without hitting the page file/swap too hard.

{{< single-title-imgs
    "The difference made on a 2GB equipped GTX 750 (The Legend of Zelda: Tears of the Kingdom)"
    "./astcbug.mp4"
    "./astcfix.mp4"
    >}}

That wraps up the list of changes made to memory management to allow `Tears of the Kingdom` to be playable in at least the components listed in our [hardware requirements](https://yuzu-emu.org/help/quickstart/#hardware-requirements).

These changes would not be necessary if GPUs just supported ASTC textures.
Wouldn't you like your games to be no bigger than 100GB instead of having software features that ruin image quality, such as frame generation?
Native ASTC decoding support would make this possible.

An Intel Iris Xe iGPU can run the game at 30 FPS in handheld mode while using less memory than any other hardware combination, all thanks to being their last GPU capable of decoding ASTC.
More on Intel's driver support later.

{{< imgs
	"./totkception.png| We need to go deeper! (The Legend of Zelda: Tears of the Kingdom)"
  >}}

This was the worst part... up to this point. More work was needed to get the game to boot and render properly. Let’s dive into that.

One thing that both the Switch and Android devices have in common is the way they present to the screen.
Google's OS uses `SurfaceFlinger` (the only good Linux presentation method), and the Switch uses `nvnflinger`, which is a custom adaptation of `SurfaceFlinger` designed for the Switch's firmware and operating system.
While this gives us a good frame of reference for how `nvnflinger` should be emulated, sometimes bugs can still sneak in.
These bugs are not always easy to spot, especially if no game had rendering problems until now.

byte[] realised that yuzu was {{< gh-hovercard "10236" "serialising binder responses incorrectly" >}} (in a different way to how Android does it).
Fixing this simple bug allowed for `Tears of the Kingdom` to boot.

Meanwhile, Maide implemented {{< gh-hovercard "10234" "shader fixes," >}} suggested by [Kristijan1001](https://github.com/Kristijan1001), solving issues with cloud flickering and missing geometry in The Depths. 

{{< imgs
	"./depths.jpeg| Your GPU is fine, it’s just software. (The Legend of Zelda: Tears of the Kingdom)"
  >}}

Next is a bug that only affected the base game. Following updates were unaffected, as they rendered in a different order.

{{< imgs
	"./red.png| Ganon likes to record Link… (The Legend of Zelda: Tears of the Kingdom)"
  >}}

This mysterious red dot on the right was caused by {{< gh-hovercard "10243" "incorrectly tracking" >}} render target indexes when clearing.
Thanks to some behaviour changes made by Maide, Link is no longer being spied on.

After the game was released, several users reported that the date in the game's save files was always set to January 1st, 1970.
After checking the behaviour of the Switch, byte[] implemented {{< gh-hovercard "10244" "a few changes" >}} that solved the issue with an updated service implementation that allows for computing the time in nanoseconds, automatically adjusting for clock skew, and using the same clock source as the system’s steady clock.

There were also reports of graphical glitches when using the 2X resolution scaling factor: Link and terrain textures would become corrupted after switching weapons.

{{< imgs
	"./2x.png| Scrambled textures. (The Legend of Zelda: Tears of the Kingdom)"
  >}}

Blinkhawk quickly found the cause of this problem: wrong clears were performed in the code responsible for synchronization in the buffer cache.
{{< gh-hovercard "10249" "Some tweaks," >}} and the game can be safely played while scaled.

For the Linux AMD users, especially those not using the latest Mesa RADV Vulkan driver releases, byte[] found that one of the features of `VK_EXT_extended_dynamic_state3`, dynamic depth clamp, was implemented incorrectly in the driver, leading to vertex explosions in some expository moments in the game.

{{< single-title-imgs-compare
    "Oh, there goes the vertex… (The Legend of Zelda: Tears of the Kingdom)"
    "./radvbug.png"
    "./radvfix.png"
    >}}

{{< gh-hovercard "10262" "Disabling the feature" >}} for the affected driver version and older solves this issue.

Another identified issue affected the light projection made by the Ultrahand ability, intended to help the player position objects.
The green glow had a pixelated look, caused by {{< gh-hovercard "10402" "missing barriers on attachment feedback loops." >}}

{{< single-title-imgs-compare
    "Green Lantern hand. (The Legend of Zelda: Tears of the Kingdom)"
    "./ultrabug.jpg"
    "./ultrafix.jpg"
    >}}

Several keyboard strokes later, and byte[] went green with envy.

Next on the list of weird rendering issues is one that affected camera changes — for example, when talking to an NPC or aiming with the bow/throwing a weapon.
Large areas in front of the player would turn black for a frame and then return to normal.
Needless to say, it was very distracting.

{{< imgs
	"./bow.mp4| A bow so cursed, it tries to take you to the Shadow Realm! (The Legend of Zelda: Tears of the Kingdom)"
  >}}

This bug was caused by the way the {{< gh-hovercard "10418" "texture cache" >}} processed aliases and overlaps, which were in the wrong order and caused sync problems.
After a few tries by Blinkhawk and byte[], the issue was finally fixed.

While investigating bugs related to `Tears of the Kingdom`, a copy-paste error hidden in the code for 3 years was also found.
In the shader recompilation code, [Rodrigo](https://github.com/ReinUsesLisp) copied over the wrong value from one line to the next.
This is another interesting case of the problem not being an issue until now, as no one noticed this bug until Zelda needed rescuing again...
By {{< gh-hovercard "10459" "changing a single character," >}} byte[] solved the terrain gaps that could be spotted from a distance all over the map, but most noticeably in The Depths.

{{< single-title-imgs-compare
    "What’s deeper than The Depths? (The Legend of Zelda: Tears of the Kingdom)"
    "./gapbug.png"
    "./gapfix.png"
    >}}

In an interesting case where a UI setting is needed to improve a game’s rendering, byte[] added an option to {{< gh-hovercard "10464" "clean the cache storage for a game," >}} which can be accessed from the `Remove` menu when right clicking a game in yuzu’s game list.

{{< imgs
	"./remove.png| It’s fun to watch the game reconstruct the images in real time."
  >}}

This option is needed because using Asynchronous shader building in `Emulation > Configure… > Graphics > Advanced` will mess up fused weapon icons in the weapon selection menu, as well as autobuild history.

{{< single-title-imgs-compare
    "Not even close, baby! (The Legend of Zelda: Tears of the Kingdom)"
    "./cachebug.png"
    "./cachefix.png"
    >}}

Disabling Asynchronous shader building and clearing the cache storage lets the game properly rebuild the images of all your weaponized abominations.

That’s the progress so far with `The Legend of Zelda: Tears of the Kingdom`!
You may have noticed there are no performance improvements mentioned here.
We’re following one of the most important rules of coding, “Make it work. Make it right. Make it fast.”

As this is a particularly popular game (and for good reason), here are some recommendations that user reports and fixes have taught us.

- This game is very demanding on hardware. What we list in yuzu’s `recommended` [hardware requirements](https://yuzu-emu.org/help/quickstart/#hardware-requirements) is the minimum needed to sustain 30 FPS in most areas. A 6-core desktop Zen 2/11th gen Core, 16GB of RAM, and a GPU with at least 6GB of VRAM are the baseline for now.
- The latest CPUs (Zen 4/13th gen Core, always speaking of desktop products) provide massive improvements in IPC, RAM bandwidth, and cache sizes. Where a Ryzen 7 5800X3D barely manages 55 FPS, a Ryzen 5 7600 reaches 90 FPS.
- Normal GPU accuracy can be used to improve performance safely.
- Unsafe CPU accuracy can improve performance at the cost of small inaccuracies.
- Enabling asynchronous presentation degrades performance a bit.
- Don't use `Decode ASTC textures asynchronously` for this game, it will cause crashes.
- In some rare cases audio events can cause crashes, so be careful when using multi-arrow bows and bombs.
- The Depths are particularly hungry for VRAM. Remember to use ASTC recompression if you are VRAM starved. We recommend at least 8GB of VRAM for 2X resolution scaling using BC3 compression.
- The modding community has been providing amazing mods. Dynamic framerate, improved resolution and details, and much more are only a few clicks away. Here’s a [collection with recommendations](https://github.com/HolographicWings/TOTK-Mods-collection).
- Old FPS mods compatible with the base version of the game (1.0.0) are unstable and will cause softlocks and crashes during certain actions like the Game Over screen. Update your game and use newer mods.
- Remember to test the game without mods before reporting issues, as mods are still altering memory regions to work.
- If you disabled `Use Fast GPU Time` due to recommendations from modders, do it only for `Tears of the Kingdom`, as you will be seriously affecting performance in other games. Right clicking a game in yuzu’s game list and selecting properties shows the per-game configuration. We strongly recommend keeping `Use Fast GPU Time` enabled in all scenarios.

[Now go. Let the Legend come back to life.](https://www.youtube.com/watch?v=1pN8TvupNn4)

## Project Lime

{{< gh-hovercard "10508" "Bet you didn’t expect this." >}}

That’s right, with the blessing from Skyline’s [bylaws](https://github.com/bylaws), help from Dolphin’s [t895](https://github.com/t895) and Citra’s [GPUCode](https://github.com/GPUCode), work from yuzu’s and Citra’s [flTobi](https://github.com/FearlessTobi), [bunnei](https://github.com/bunnei), [Merry](https://github.com/merryhime), [Flamboyant Ham](https://github.com/Schplee), [german77](https://github.com/german77), and more, yuzu is now [available for Android devices](https://yuzu-emu.org/downloads/#android)!

We recommend that you read the dedicated yuzu on Android article [here](https://yuzu-emu.org/entry/yuzu-android/).
In this section, we will give you an overview of our future plans, some tips on settings and hardware requirements, and a realistic outlook on what you can expect from yuzu on Android right now.

The Android version of yuzu was not an easy feat. It took us almost eight months of hard work to make it happen. 
Right now, the core is essentially the same as the desktop version, with an Android UI and *very few* platform-specific tweaks.
This means you can enjoy features like 32-bit game support, NVDEC video decoding support, motion, controller automapping, resolution scaling, and filters.
On the other hand, features like mod and cheat management, LDN, and the controller configuration applet are still under development.
Our goal is to gradually have the Android builds reach parity with the PC version.

In addition to the Google Play Store, we will soon be posting releases on our GitHub, and F-Droid is also on the horizon.

{{< imgs
	"./lime1.png| Don’t judge, it’s a light game and loads quickly, it was great for testing. (Sakura Neko Calculator)"
  >}}

One of the biggest lessons we learned from Project Lime is that, even after 8 years since the launch of the NVIDIA Tegra X1 (the SoC that powers the Nintendo Switch), Android SoC vendors still don’t know how to make GPU drivers.

They all started working on Vulkan drivers around the same time in 2016. And yet, none of them have managed to deliver a compliant and stable Vulkan Android driver, except for the rare few NVIDIA devices.

It is obvious that only 4 vendors have the expertise and the commitment to make Vulkan drivers work: NVIDIA, AMD, and Mesa, with a special mention for Intel, who recently stepped up their game.

Although not one of these 4, we decided that limiting support to Qualcomm SoCs was our only option for now if we didn't want to spend several months further modifying our GPU code to accommodate all the quirks and broken extensions of Android phones and tablets.
Not because their driver is decent — it’s bad.
But it was just good enough to get some games to render, albeit incorrectly most of the time.

Qualcomm is the best option (and for now, the only one) because bylaws created [AdrenoTools](https://github.com/bylaws/libadrenotools), which lets users load the ***vastly*** superior [Mesa Turnip](https://docs.mesa3d.org/drivers/freedreno.html) drivers on their Adreno 600 series GPUs, providing more accurate rendering, comparable to the quality expected of PC products.
Any Qualcomm SoC with a name like “Snapdragon ###” from the 460 to the 888+ equipped with an Adreno 600 series GPU can choose to use either the proprietary Qualcomm driver or Mesa Turnip.

The performance gain you can expect from a device with a Snapdragon Gen 1 or Gen 2 is quite significant. 
But the problem is that, while the Adreno 700 series GPU that comes with it is very powerful hardware-wise, the proprietary Qualcomm driver for it is subpar at best, and Mesa has only just begun to work on adding support for Turnip.
There's an early driver release to test, but results are not great for now.
It will take weeks, if not months, before we see proper support emerge. In the meantime, we intend to work on improving the rendering on the official Adreno drivers.

{{< single-title-imgs
    "Try several, don’t marry the first one that works. Divorcing a shader cache isn’t fun."
    "./driver.png"
    "./driver2.png"
    >}}

The Adreno 500 series is too outdated for yuzu. Its proprietary Vulkan driver is missing many of the essential features required, and Turnip has no plans to support it either.

Mali is an example of good but weak hardware being limited by the quirks of its available drivers. 
Unlike Adreno, Mali has no viable Mesa alternative to rescue it, and the current proprietary Mali drivers are in bad shape for Switch emulation.
Its current status is that it won’t boot any game on yuzu, but:

{{< single-title-imgs
    "Internal dev build, work-in-progress in getting G series Mali running."
    "./mali.jpg"
    "./mali2.jpg"
    >}}

We’re working on solving all the quirks needed to get Mali rendering on yuzu as soon as possible.
This is the most common GPU vendor on the platform after all.
Mali support will happen, we just need some time.
Expect news very soon!

The last case of hardware that should work, but doesn’t, is the AMD RDNA2-based Xclipse 920 from Samsung, used only in the latest Exynos 2200 SoC, and somehow completely skipped from the S23 series phones.
Available information suggests that it may just be an old AMD Windows driver ported to Android, but for some reason the devices refuse to start rendering on yuzu.
This is a GPU we want to get working, as there is no clear reason why it doesn't work, while desktop AMD products work almost flawlessly.
Unfortunately, we haven't yet been able to get our hands on one, but we'll update with more info once we do.

For all other vendors like PowerVR, Vivante, etc: don't bother.
These vendors offer such low quality drivers that support is impossible.

We’re working hard on improving GPU compatibility, adding the necessary changes needed to boot within the limitations set by the vendors.

CPU emulation still relies on the Dynarmic JIT, instead of native code execution. 
This allows us to run 32-bit games like `Mario Kart 8 Deluxe`, but is slow for 64-bit games.
Expect “good” compatibility, similar to the desktop version thanks to this, but also low performance and high temperatures.
Native code execution, or NCE (do I smell `Project Nice`?) is on our list of goals for the Android builds.

The CPU itself, while very crucial for performance and the main bottleneck for now, is less important than the GPU, for the reasons previously mentioned (the drivers).
The same rules as on PC apply here: 6 cores or more is preferred, and the highest possible IPC is strongly recommended. A Snapdragon 8 Gen 2 can be twice as fast as a Snapdragon 865.

RAM use is both a blessing and a curse.
A blessing because Android devices natively support ASTC textures — the format is designed for such devices.
This allows the GPU to use very little RAM, just like on the Switch.

The curse is that, because Android is such a heavy OS, there is no guarantee that complex games will run on devices with 6GB of RAM. 8GB is the strong recommendation, which puts compatibility on the pricey side of the spectrum. 
A certain Zelda game we wrote a lot about currently requires at least 12GB of RAM to run.

There are ongoing efforts to reduce memory requirements, such as native code execution and [UMA](https://en.wikipedia.org/wiki/Unified_Memory_Architecture) optimizations for the GPU code, but the reality is that emulation adds overhead and Android will only get fatter over time.
We may be able to get light 2D games running on 4GB devices, but we don't expect complex 3D games to run on less than 8GB any time soon, if ever.

We have set the minimum required operating system to Android 11. 
This decision was made to prevent installation on completely unsuitable hardware (like Adreno 500 series devices or older T series Mali GPUs), and to reduce installation on low-memory devices as much as possible.
This is final, as there are no plans to support older Android versions.

Of course, it must be a 64-bit Android 11 or newer; just like on desktop, 32-bit devices will never be supported.

Users with capable hardware stuck on older Android versions can either build yuzu themselves and remove the code responsible for performing this check, or install custom ROMs such as [LineageOS](https://lineageos.org/) to get unofficial Android updates on their device.

{{< imgs
	"./lime2.png| Your writer will enjoy playing visual novels and simple platformers. (The Liar Princess and the Blind Prince)"
  >}}

Now that we have covered the harsh reality of Android software and hardware, let’s focus on the current experience.

We included a customisable input overlay with haptics, which can be disabled if you prefer to play with a Bluetooth Xbox controller, Sony Dualshock 4 or Dual Sense, or a Nintendo Pro Controller, and a framerate counter.
You can access these settings in-game by dragging from the left side of the screen.

If you updated from a previous version, the overlay may be invisible. Just select `Overlay Options > Reset Overlay` to make it visible again.

{{< imgs
	"./settings1.png| Set as you see fit. (Cooking Mama: Cookstar)"
  >}}

While playing a game you can select Settings from the left menu, or select it from the main menu.

{{< single-title-imgs
    "Expect this tab to expand in the coming months."
    "./settings2.png"
    "./settings3.png"
    >}}

Here you will find setting and customization options. Most are self-explanatory, but if you want explanations for the options in Advanced settings, check our settings glossary [here](https://community.citra-emu.org/t/settings-glossary/768483).

After the initial configuration is done, just tap a game and play. 
A search option is available for your convenience, along with a few search filters.

{{< single-title-imgs
    "Choose your destiny."
    "./list.png"
    "./search.png"
    >}}

One of the first improvements added by [PabloG02](https://github.com/PabloG02) is a {{< gh-hovercard "10534" "save manager" >}} that can be accessed from the Settings.
This makes importing and exporting saves very simple. Thank you!

{{< imgs
	"./saves.png| It’s dangerous to go alone, take this!"
  >}}

One important thing to remember: Android has the most… unusual file system permissions.
We recommend creating a yuzu folder on your storage root to store your keys, as to avoid any permissions issues.

You can get different Adreno and Turnip driver versions to test from [here](https://github.com/K11MCH1/AdrenoToolsDrivers/releases).
Keep in mind, this option will only change the driver for yuzu. It won’t (and can’t) replace anything on a system level.

At the time of writing, we recommend [Turnip 23.2.0](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v23.2.0-dev) (or [23.1.0](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v23.1.0-dev) if you have Android 11) for Adreno 600, while Adreno 700 users can run the [Qualcomm 676.22](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v676.22FIX) driver to improve performance and compatibility somewhat.

There’s an early alpha Turnip release supporting Adreno 730 and 740 products (but not 725) [here](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v23.2.0_A7XX).
It is also compatible with Adreno 600 series hardware, so it’s a simple global driver to test.

There have been reports of users not being able to load custom drivers — we are still investigating this, but there's still a lot of work to do.

For those interested in playing with the source, we have a work-in-progress build guide [here](https://yuzu-emu.org/wiki/building-for-android/).

That’s all fo… What do you mean there’s still a whole article to write?
Oh right, we have more to talk about!

## Other graphical changes

Because this isn’t just a Zelda emulator after all.

Who wants more `Project Y.F.C.` goodies?
Blinkhawk serves us {{< gh-hovercard "10155" "Reactive Flushing," >}} with fries.

In the early days of yuzu, if the CPU were to read an area modified by the GPU, full sync flushing between the host and guest GPU (emulated and system’s GPU) would trigger (let’s call it “old reactive flushing”).
This was safe and rendered things properly, but was also slow.
Blinkhawk replaced this system with predictive flushing some years ago, improving performance significantly but introducing several graphical regressions, such as broken shadows and lighting, wrong thumbnails on saves and photos, and even vertex explosions.

With this release of the yuzu fried chicken, Blinkhawk introduces the new Reactive Flushing, which has the following fixes:

- Fixes old regressions such as `Bayonetta 2`'s shadows.
- Fixes lighting in `Xenoblade Chronicles` games.
- Improves performance in buffer-heavy games like `Monster Hunter Rise`.
- Thumbnails and in-game photos in a bunch of games such as: saves in `Xenoblade Chronicles Definitive Edition` and `Xenoblade Chronicles 3`, camera photos in `ASTRAL CHAIN`, and partially fixes thumbnails in `Luigi's Mansion 3`.
- Vertex explosions in `Pokemon Violet/Scarlet` and `Yoshi’s Crafted World`.
- Make High GPU Accuracy fully use asynchronous buffers in Vulkan, improving performance.

{{< single-title-imgs
    "From first to last: Bayonetta 2, ASTRAL CHAIN, Xenoblade Chronicles Definitive Edition, and Luigi’s Mansion 3"
    "./rf1.png"
    "./rf2.png"
    "./rf3.png"
    "./rf4.png"
    >}}

{{< single-title-imgs
    "From first to last: Mario + Rabbids Kingdom Battle, Pokémon Scarlet, and Yoshi's Crafted World"
    "./rf6.png"
    "./rf7.png"
    "./rf8.png"
    >}}

The option still carries a performance cost, sometimes a considerable one.
It’s enabled by default, but users can disable it from `Emulation > Configure… > Graphics > Advanced > Enable Reactive Flushing`.
If you need the performance, and can tolerate the graphical regressions introduced by disabling it, the option is there.

{{< imgs
	"./reactive.png| If you have performance to spare, keep it enabled."
  >}}

Users with AMD and Intel GPUs complained that high-framerate mods couldn't push the framerate past the display's refresh rate when using Vulkan.
This was because the VSync toggle was assuming the best option for each hardware driver based on compatibility.

What used to be just VSync on, off, or triple buffer in the good old OpenGL days is now more complex with Vulkan, even if current games insist on mistakenly calling the setting “VSync on” for legacy reasons.
In fact, nowadays there are 4 VSync options commonly supported by GPU drivers:

- Immediate: No VSync. Tearing will happen, but no framerate restrictions will apply.
- FIFO: Double buffering. This is equivalent to yuzu’s old VSync on. Tearing won’t happen, but input will have one frame of latency, and the refresh rate can’t exceed the display’s capabilities.
- Relaxed FIFO: Identical to regular FIFO, but allows for tearing to happen if a desynchronisation happens. Can be considered similar to adaptive VSync. Useful for games with dynamic framerates.
- Mailbox: Triple buffering, avoids tearing while allowing for framerates higher than the refresh rate of the display. Similar to what AMD calls Enhanced sync, and what NVIDIA calls Fast sync.

Mailbox is the obvious recommendation for most games, so of course only NVIDIA on Windows, Mesa on Linux, and Android drivers offer support for it.

{{< imgs
	"./vsync.png| Android has no tolerance for tearing."
  >}}

Per your writer’s ~~begging~~ request, [toastUnlimited](https://github.com/lat9nq) updated the old VSync toggle in the Graphics menu to a {{< gh-hovercard "10125" "proper drop list" >}} mentioning all available Vulkan options.

{{< imgs
	"./mailbox.png| If it is an option, pick Mailbox."
  >}}

If, for example, someone with an AMD or Intel GPU on Windows wants to play `Super Smash Bros. Ultimate` with a 120 FPS mod on a 60 Hz display, they now have the option to use Immediate mode, which is what the emulator switches to when the player unlocks the framerate with Ctrl + U.
The rest can just enjoy Mailbox.

We recommend setting the driver’s control panel to Enhanced/Fast sync for the best results.

{{< single-title-imgs
    "Press F to sync"
    "./amd.png"
    "./nvidia.png"
    "./intel.png"
    >}}

Maide found an issue related to the size of the pipeline cache.
yuzu used to return the size of the shader code in bytes, which was later used to resize the unsigned 64 bit integer array in charge of storing the cache, making the array 8 times larger than it was supposed to be.
This is fixed by {{< gh-hovercard "10145" "using the length of the array" >}} instead of the size in bytes.

A common complaint from users with 8GB of RAM is that games become unstable over time. This isn't necessarily a memory leak — it's likely just the system running out of RAM as new shaders are added to the pipeline cache.
This change greatly benefits them.
~~But it’s 2023, you should seriously consider getting 16GB by now. Tears of the Kingdom is not Super Mario Odyssey.~~

ASTC continues to be in the news here — this time a problem with {{< gh-hovercard "10206" "3D ASTC" >}} textures, because it isn’t enough to deal with flat 2D ones.
A bug in their implementation caused the level Frantic Fields in `Donkey Kong Country: Tropical Freeze` to render incorrectly.
Some tweaks by the ‘hawk, and the Kong army is back in action.

{{< imgs
	"./dk.png| No more quicksand! (Donkey Kong Country: Tropical Freeze)"
  >}}

yuzu's buffer cache is responsible for storing most forms of arbitrary data for the GPU to process.
Buffers can be modified by either the GPU or the CPU, so yuzu would track the buffer to one type of modification, then wait for the other type of modification to synchronize the data. But in reality, {{< gh-hovercard "10216" "performing the synchronization" >}} before tracking the modification would make much more sense.
Maide noticed this discrepancy and set out to correct it, streamlining the code.

Since the old code would track buffers globally, some draws would end up ignoring channel swaps, leading to leftover values from the wrong channel getting bound in uniform buffers.
If instead we {{< gh-hovercard "10469" "move buffer bindings" >}} to be channel specific, the issue is solved.
This fix should affect more games using multiple 3D channels too.

Continuing with code optimisations, Maide found some incorrect behaviour in how render targets are selected.

The `Render Target` (The OG RT for rendering devs before RTX came to town) is a texture containing the image to be rendered during a draw or clear operation.

The emulator has to look at the format of the available render targets to determine which one to clear.
For example, suppose there are 5 images bound as render targets, indexed from `0` to `4`, and the game requests to clear the render target with index `2`.
The next step is to look at the format of render `target[2]` in the array.
This is where the old code would work incorrectly and inefficiently, as it would iterate through all the render targets and pick the first one that returned a valid format corresponding to `target[2]`.
This could very well be `target[2]` as expected, or an earlier render target such as `target[0]` or `target[1]`, in which case the code would completely ignore the actual render target we wanted to clear.

In short, this process was both slower and potentially unsafe due to the risk of clearing the wrong render target.
Not happy with this, Maide worked to sort it out, getting {{< gh-hovercard "10217" "the correct render target" >}} cleared.

Time to introduce another term! `Descriptor Sets` are a feature of the Vulkan API. Their purpose is to allow the CPU to update input bindings, the list of resources used by a shader, in an efficient way.

Previously, yuzu would share the same descriptor set update queues between guest operations (operations directly translated from a game) and host operations (operations yuzu performs to emulate specific Switch GPU features which don't exist in Vulkan).
This could mistakenly end up with host operations overwriting the descriptor set updates of a guest pipeline during processing.
At best, this would break the state of the guest pipeline, and at worst, it would take down the entire GPU driver.
If you experienced random crashes in `Xenoblade Chronicles` games, `Luigi’s Mansion 3`, `Bayonetta 3`, among others, you might now know why.

So, how can this be solved? “Simple!” Let’s just give the host and guest compute pipelines their own {{< gh-hovercard "10222" "queues." >}} 
Having this information in separate queues fixes the data integrity issues, greatly improving stability.

Newcomer [danilaml](https://github.com/danilaml) identified a {{< gh-hovercard "10254" "missing bitflag" >}} in the header responsible for decoding H.264 videos.
This fixes video rendering for `Layton's Mystery Journey: Katrielle and the Millionaires' Conspiracy`.

{{< imgs
	"./layton.png| Games are boring without their cutscenes, right? (Layton's Mysterious Journey: Katrielle and the Millionaires)"
  >}}

Not stopping there, danilaml also added support for deinterlaced video playback by using the {{< gh-hovercard "10283" "yadif filter" >}} included with [FFmpeg](https://ffmpeg.org/), fixing the game's video rendering.
Thank you!

Intel’s Linux Mesa Vulkan driver, ANV, broke the `VK_KHR_push_descriptor` extension with version 22.3.0 and later, causing several games to fail to boot.
toastUnlimited {{< gh-hovercard "10365" "disabled the extension" >}} to ensure proper game compatibility, and then, after a quick response from the ANV developers fixing the issue, byte[] {{< gh-hovercard "10414" "allowed the use" >}} of the extension on current Mesa versions.
Mesa is an example of how GPU driver development should be done.

GPUCode improved overall performance when using Vulkan in a few percentage points by {{< gh-hovercard "10474" "removing a wait semaphore." >}}
Every bit helps.

[Epicboy](https://github.com/ameerj) continues his crusade to improve OpenGL.
This time, he {{< gh-hovercard "10483" "fixed" >}} the use of `Accelerate ASTC texture decoding` when ASTC recompression was set to Uncompressed.

And finally, to close this section, Maide fixed homebrew console apps crashing by {{< gh-hovercard "10506" "skipping a section of the buffer cache" >}} that isn’t needed when an app doesn’t use graphics.

## Project Gaia-lite

byte[] implemented some file system changes on his own, giving us a taste of what’s to come.

Here’s a fun one. Why does it take minutes to boot `Fire Emblem Engage` or `Animal Crossing: New Horizons` with mods?
Because the old implementation became quadratically slower as the number of the files in the game increased!

{{< gh-hovercard "10183" "Fixing" >}} the terrible time complexity reduces patch times during boot in `Fire Emblem Engage` from one and a half minutes to _three seconds_, and in `Animal Crossing: New Horizons` from about a minute to _one and a half seconds_. Wow!

That function wasn't the only source of unnecessarily quadratic behavior. Reads also grew quadratically in time with file count, which has now been {{< gh-hovercard "10463" "optimized," >}} improving in-game load times as well as boot times.

Another source of slowdown we've identified comes from unnecessary copying and freeing of strings, and we plan to address this in Project Gaia in the future.

Finally, a savedata reader for `cache storage` needed to be {{< gh-hovercard "10237" "stubbed" >}} to get `Tears of the Kingdom` to boot.

## Input and Amiibo improvements

HD Rumble is one of the marketed features of the Switch, which is a cool way of saying the official Switch controllers have `Linear Resonant Actuators` in charge of rumble, instead of the good old rumble motors we were used to in the past.

Well, Sony’s DualSense controller also has linear resonant actuators, so in theory, it should be able to emulate HD Rumble.
The problem is that SDL, the API we use to support non-Nintendo controllers on yuzu, currently doesn’t expose a way to take advantage of these fancy actuators.

Well, newcomer [marius851000](https://github.com/marius851000) improved this situation for DualSense owners, so they came up with the idea to {{< gh-hovercard "10119" "change the rumble amplitude" >}} based on the frequency requested by the game, with 140-400 Hz operating as the low frequency, and 200-700 Hz as the high frequency.
This way, some sense of “rumble audio”, and an overall better shaky-shaky experience, is achieved.
Thank you!

To help you see if the motion controls are working, german77 has added a {{< gh-hovercard "10167" "cute little cube" >}} to the controller preview.
Feel free to play with it!

{{< imgs
	"./motion.png| Warning, it’s addictive."
  >}}

Stick drift is not the only fear for gamers using controllers, there’s also the rarer *motion drift!*
This could happen naturally, or after some *serious gaming* moments, so an option for {{< gh-hovercard "10203" "recalibration" >}} was needed.
Thankfully german77 took care of it, adding the option if you right click the Motion # mapping in `Emulation > Configure… > Controls`.
If you use it, remember to leave the controller/device on a flat surface for at least 5 seconds so the process can take place.

{{< imgs
	"./gyro.png| Stop shaking!"
  >}}

Now something for the ~~dirty cheaters~~ open-minded players out there.
Games will block trying to use the same Amiibo more than once, so german77 added a way to {{< gh-hovercard "10207" "randomly generate a new ID" >}} each time the Amiibo is used. The option can be enabled from `Emulation > Configure.. > Controls > Advanced > Use random Amiibo ID`.

{{< imgs
	"./id.png| Bottom right corner, can’t miss it."
  >}}

Keep in mind games like `Super Smash Bros. Ultimate` will complain if the ID changes.

Scanning for Amiibos seems to be a very demanding task for the available Bluetooth bandwidth when using Joy-Cons.
To mitigate this, german77 {{< gh-hovercard "10265" "reduced the scan rate" >}} from once per frame (30 or 60 Hz) to 5 Hz, and reduced the number of attempts to get valid data to 1 down from 7.
This should alleviate the right Joy-Con’s oversaturation of the available Bluetooth bandwidth, reducing stutters considerably.

But what if you want to enjoy some Amiibo scanning on your Pro Controller?
Previously, support was only available for Joy-Cons.
But now, {{< gh-hovercard "10344" "Pro Controllers are also supported!" >}} As long as the controller is connected over Bluetooth and the custom Pro Controller driver is enabled in `Emulation > Configure.. > Controls > Advanced > Enable direct Pro Controller driver [EXPERIMENTAL]`.
That EXPERIMENTAL label is in its last days now.

Not stopping there with the Amiibo changes, german77 also implemented {{< gh-hovercard "10396" "full support for Amiibo writing" >}} when using a Joy-Con or Pro Controller!
This enables the last missing piece for full Amiibo emulation, just as you would use them on the Switch itself.

Feel free to scan to your heart's content! As long as you managed to grab one of the plastic things while they were in stock.

It's worth mentioning that writing Amiibo data will require dumping the relevant keys.
However, if all you want to do is load decrypted Amiibo dumps, german77 {{< gh-hovercard "10415" "added support" >}} for using them without needing to dump the Amiibo keys.

At this point, the only thing left to complete Amiibo support is to add a manager!

## Audio and miscellaneous changes

The war against properly shutting down yuzu rages on.
This time Maide implements a {{< gh-hovercard "10128" "fix in the DSP engine" >}} so it closes before a required system instance is terminated.
This way a deadlock is avoided during shutdown, improving the situation slightly.
Another battle won, but how many remain?

This next one left us wondering...
[ronikirla](https://github.com/ronikirla) reported that `Pokémon Mystery Dungeon Rescue Team DX` would consistently crash due to a read access violation after two hours of gameplay.

That’s not a simple bug to track down and fix, yet someone in ronikirla's Twitch chat identified the issue as a {{< gh-hovercard "10178" "bad block check" >}} in the address space code and passed along a fix.

{{< imgs
	"./pmd.png| Love the art style! (Pokémon Mystery Dungeon Rescue Team DX)"
  >}}

The change seems to also fix `Advance Wars 1+2: Re-Boot Camp`.

{{< imgs
	"./aw.png| Bond, yuzu Bond. (Advance Wars 1+2: Re-Boot Camp)"
  >}}

Recent changes made to audio emulation improved performance and solved crashes, but also had an interesting regression.
Some sound effects played at a slower speed.

After doing some extensive reverse engineering, Maide reached the conclusion that due to how the DSP works, a {{< gh-hovercard "10221" "5 ms timeout" >}} is needed in the processing wait.
With the timeout implemented, `SUPER MARIO ODYSSEY` and `Kirby Star Allies`, among others can now play back their audio at full speed.

[danilaml](https://github.com/danilaml) continues to deliver the good stuff.
This time, simply {{< gh-hovercard "10362" "updating cubeb" >}} (one of our audio backends, and most of the time the default one) fixed a bug that muted the emulator after waking the PC from sleep.
Feel free to close your lids and continue later!

Users noticed that after recent changes to fix the wire audio in `SUPER MARIO ODYSSEY`, audio in many games could desync and sound crackled or distorted.
bylaws suggested allowing the audio buffer to {{< gh-hovercard "10471" "wait indefinitely" >}} if a queue is too big, so Maide implemented this idea and et voilà, the problem is gone!
(Pardon my French; Spanish is cooler).

## UI improvements

If your yuzu is configured with multiple user profiles, and the `Prompt for user on game boot` option in `Emulation > Configure > General` option is enabled, you will have to click the profile you want to boot and then click OK.
Well, for the newcomer [Qigo42](https://github.com/Qigo42), this was unsatisfactory, so they allowed the {{< gh-hovercard "10189" "profile selection pop-up" >}} to work with just a double click!
Nothing beats quality-of-life changes. Thank you!

[jbeich](https://github.com/jbeich) is back, fixing {{< gh-hovercard "10205" "BSD support" >}} again!
It’s always good to have more OS alternatives working.

Continuing the trend in quality-of-life changes, newcomer [grimkor](https://github.com/grimkor) has a nice gift for us.

{{< imgs
	"./context.png| And now, for your convenience…"
  >}}

A {{< gh-hovercard "10352" "context menu" >}} for the filter and antialiasing options! You no longer have to go through the entire list of options if you want to try a different one, simply right click and choose.
Thank you!

If you double clicked a game in the game list, you could end up double clicking it again or pressing enter before the game list got unloaded, which would cause yuzu to try to load the game twice, and usually just crash. 
german77 fixed this up by {{< gh-hovercard "10482" "immediately disabling the game list" >}} after a game has been launched.

## Hardware section

We no longer only support the PC! In future articles, we will include any news for Android GPU vendors.

### NVIDIA

We have some good news and a little disappointment for the Green Team.
But first, we have some progress with the Maxwell and Pascal situation.

In the past, we used to recommend users to stick to older driver releases for the GTX 750/900/1000 series, as anything newer than the 470 driver series was unstable.
Thanks to the work done with the garbage collector for `Tears of the Kingdom`, we now know that the problem with these cards is how the driver handles out-of-memory situations.
We were even able to observe it on Turing cards with 4GB, so it wasn't unique to older cards, we just didn't have a game that used VRAM as much as Zelda.

We reported our findings to NVIDIA with a test case, so it’s in their hands now.

As the VRAM fills up, an AMD card will get slower and slower until it stops working and crashes yuzu, while an NVIDIA GPU would corrupt the entire desktop, taking all the displays with it, sometimes even forcibly rebooting the system.

Using the ASTC recompression option helps a lot to avoid this problem.
But if it does happen, it can still cause a system lock or reboot, so we need a way to mitigate this while NVIDIA investigates the issue.

{{< single-title-imgs-compare
    "Now playable with only 2GB of VRAM! (The Legend of Zelda: Tears of the Kingdom)"
    "./nvidiabug.png"
    "./nvidiafix.png"
    >}}

Fortunately, we stumbled upon a stopgap measure that solves the problem, and we updated our [recommended settings](https://community.citra-emu.org/t/recommended-settings/319349) guide to include it. 
Just change `Vulkan/OpenGL presentation method` in the NVIDIA Control Panel to `Prefer layered on DXGI Swapchain`.
The same setting used to get AutoHDR working helps contain the out-of-VRAM crashes.
Using this in combination with BC1 ASTC recompression will make old 2GB cards run without crashes.

{{< imgs
	"./nvcp.png| This interface is so old…"
  >}}

Switching to the the good side of news, [HolographicWings](https://github.com/HolographicWings/) made an amazing tutorial on how to use `DLDSR` in yuzu [here](https://github.com/HolographicWings/TOTK-Mods-collection/blob/main/Guide/Guide.pdf).
DLDSR is a way to use the Tensor cores available in RTX cards to upscale the image. You can consider it a mix of DLSS and FSR 1.0, as it works for any game, but uses deep learning instead of traditional filters.
Needless to say, it’s a great way to improve image quality if you have the hardware to test it.

And in other good news, [Special K](https://special-k.info/) now supports HDR in Vulkan and it works with yuzu!
NVIDIA is still the only supported vendor, as this is only possible thanks to the magic `Prefer layered on DXGI Swapchain` option, but the quality and customization offered by Special K over AutoHDR is outstanding. That expensive OLED never looked so tempting.

Note that we have confirmed in testing that `Prefer layered on DXGI Swapchain` needs to be manually enabled for Special K to work properly.
This also includes other NVIDIA-exclusive goodies such as input lag reduction thanks to NVIDIA Reflex.
Feel free to experiment with the app, it's amazing.

Here are some comparison pics in .jxr format, they can be opened with the default Photo app included with Windows 11, and an SDR control capture in .png format: 

- First the scene in [SDR](https://github.com/yuzu-emu/yuzu-emu.github.io/blob/hugo/site/content/entry/yuzu-progress-report-may-2023/sdr.png), the default experience.
- Windows 11’s [AutoHDR](https://github.com/yuzu-emu/yuzu-emu.github.io/blob/hugo/site/content/entry/yuzu-progress-report-may-2023/autohdr.jxr) with the Cemu renaming trick.
- SpecialK’s HDR with [Perceptual Boost disabled](https://github.com/yuzu-emu/yuzu-emu.github.io/blob/hugo/site/content/entry/yuzu-progress-report-may-2023/specialk.jxr).
- SpecialK’s HDR with [Perceptual Boost enabled](https://github.com/yuzu-emu/yuzu-emu.github.io/blob/hugo/site/content/entry/yuzu-progress-report-may-2023/specialkpb.jxr).

Keep in mind, Special K needs to be tuned to the capabilities of the display, and my humble 350 nit Gigabyte G27Q is a disservice to what this change can do on actually good HDR displays. 
Expect better results if you have an OLED, or a display with dimming zones and a higher peak brightness.

Now, on to the disappointing news: the RTX 4060 Ti.

We don’t understand what kind of decisions NVIDIA took when deciding the Ada Lovelace GeForce product stack, but it has been nothing but mistakes.
The RTX 4060 Ti 8GB with only a 128-bit wide memory bus and GDDR6 VRAM is a serious downgrade for emulation when compared to its predecessor, the 256-bit wide equipped RTX 3060 Ti.
You will be getting slower performance in Switch emulation if you get the newer product.
We have no choice but to advise users to stick to Ampere products if possible, or aim higher in the product stack if you have to get a 4000 series card for some reason (DLSS3 or AV1 encoding), which is clearly what NVIDIA is aiming for.

The argument in favour of Ada is the increased cache size, which RDNA2 confirmed in the past helps with performance substantially, but it also has a silent warning no review mentions: if you saturate the cache, you’re left with the performance of a 128-bit wide card, and it’s very easy to saturate the cache when using the resolution scaler — just 2X is enough to tank performance.

Spending 400 USD on a card that has terrible performance outside of 1X scaling is, in our opinion, a terrible investment, and should be avoided entirely.
We hope the 16GB version at least comes equipped with GDDR6X VRAM, which would increase the available bandwidth and provide an actual improvement in performance for this kind of workload.

### AMD

AMD has shown steady progress with each new driver release and, thanks to this, the experience on yuzu is in very good shape for Radeon owners, besides some documented hardware limitations causing graphical issues we've mentioned [in the past](https://yuzu-emu.org/entry/yuzu-progress-report-apr-2023/#amd-delivering-on-their-promises).

The main exception is a rendering issue affecting `Tears of the Kingdom`, which only happens with RDNA3 hardware, the RX 7000 series.

{{< single-title-imgs
    "Both the RX 7900 and RX 7600 series are affected. (The Legend of Zelda: Tears of the Kingdom)"
    "./rdna1.png"
    "./rdna2.png"
    "./rdna3.png"
    >}}

As you can see, the textures get mangled in an interesting way.
We couldn’t find any issue in the code, and older hardware is not affected, so we submitted a simple test case to AMD to demonstrate the extent of the problem.
Affected users will have to wait to see if future driver updates solve this.

### Intel

After the… peculiar [discussion](https://github.com/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/159) we had with Intel regarding their drivers and how they handle bug reports, we are happy to announce the [latest public beta driver](https://www.intel.com/content/www/us/en/download/729157/intel-arc-iris-xe-graphics-beta-windows.html) solves the SPIR-V issues we reported seven months ago!
We strongly recommend Intel Windows users to update to this driver to improve stability with most games.

Sadly, fixing this issue showed us two areas where yuzu is at fault.
But luckily both issues have fixes in testing in the latest Early Access release (at the time of writing). If everything goes according to plan, they should hit Mainline in a few days. Stay tuned.

The first problem is in yuzu's code. 
Some compute shaders have barriers in places that result in generating invalid SPIR-V code, and while NVIDIA and AMD have no problem with it, Intel is following the Vulkan specification much more closely and doesn’t like the result, leading to crashes.
While we test the solution, for now we recommend Mainline Intel users to keep the {{< gh-hovercard "10181" "freshly added" >}} `Enable Compute Pipelines (Intel Vulkan only)` disabled in `Emulation > Configure… > Graphics > Advanced`.

{{< imgs
	"./compute.png| This is just temporary (famous last words…)"
  >}}

The other issue is a hardware limitation.
Intel decided to remove support for Float64 operations on their Generation 12 graphics products (UHD 700/Xe/Arc) without providing a driver fallback.
Well, it turns out that, for unknown reasons, `Tears of the Kingdom` requires over the top precision in its cutscenes — precision that current Intel hardware physically lacks, causing us to crash when building the shader.
We’re testing a Float64 to Float32 shader conversion to solve the problem.
For now, Mainline Intel users will want to use a save that's past the intro cutscene, or use OpenGL, as the OpenGL spec dictates that Float64 must be supported one way or another, even if it is via software emulation.

Currently, the game is playable at a mostly-consistent 30 FPS with an i5 1240P running an Iris Xe iGPU (if you stick to handheld rendering), and exhibits better performance than AMD's Vega iGPUs. 

For those interested in the experience with desktop products, here is footage captured with an Arc A770 16GB:

{{< imgs
	"./totk.mp4| Arc is viable! (The Legend of Zelda: Tears of the Kingdom)"
  >}}

## Future projects

We don’t have much to announce for now regarding ongoing projects — we were very busy with `Tears of the Kingdom` and the Android release!

GPUCode is working on a couple of cool things. One of them is implementing a way to have an equivalent to {{< gh-hovercard "10545" "DXGI presentation" >}} working on Intel and AMD hardware; that way, AutoHDR can be used with any GPU vendor, not just NVIDIA.

That’s all folks! For real this time. If you've reached this point, thank you for your patience and for reading to the end. We hope you've enjoyed this mega-report! See you next month!
~~We all need some sleep…~~

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
