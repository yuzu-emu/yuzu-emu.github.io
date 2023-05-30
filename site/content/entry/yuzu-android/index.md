+++
date = "2023-05-30T00:00:00+05:30"
title = "New Platform Release - yuzu on Android"
author = "CaptV0rt3x"
coauthor = "GoldenX86"
forum = 817979
+++

Hey there, yuz-ers!
We are happy to announce that yuzu is available, today, for Android!
There's so much to discuss and show you, let's get started!

<!--more-->
&nbsp;


# Where do I get it?

If you're too excited, you can jump in immediately by downloading yuzu from the Google Play Store!<br>

<article class="message" style="border-radius:10px;">
  <div class="message-header" style="border-radius:10px 10px 0 0;">
    <p>Download yuzu for free, or support us and receive some fantastic benefits with Early Access.</p>
  </div>
  <div class="message-body" style="text-align: center;">
    <div class="columns is-desktop">
      <div class="column">
        <a href="https://play.google.com/store/apps/details?id=org.yuzu.yuzu_emu">
          <div style="align-items: center"><img alt="yuzu mainline" src="./svg/mainline.svg" width="400"></div>
          <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="200">
        </a>
      </div>
      <div class="column">
        <a href="https://play.google.com/store/apps/details?id=org.yuzu.yuzu_emu.ea">
          <div style="align-items: center;"><img alt="yuzu early access" src="./svg/early_access.svg" width="400"></div>
          <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="200">
        </a>
      </div>
    </div>
  </div>
</article>

The GitHub releases aren't live yet, but we will edit this article with a link to download them once they are.
This initial release won't have parity with the feature-rich Desktop builds of yuzu, but we are looking forward to introducing all the features you love as we fine-tune them for Android.

Features such as multiplayer over LAN/LDN, Input Profiles, TAS, etc. are not yet available.
For now, we want to focus on compatibility and performance as performing cutting-edge emulation on typical Android hardware has several challenges.

If you're still reading, make sure to stick around for a little development history, expectations, and compatibility reports!

{{< single-title-imgs-compare
    "Breath of the Wild (Samsung Galaxy S20 FE, Mesa Turnip GPU driver Vs. Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "./botw.png"
    "./botw_adreno.png"
>}}

# Why?

In the past year, we have made significant strides in improving both the accuracy and performance of yuzu.
And with many more such improvements in progress, we understood that the longer we waited, the more challenging it would become for us to support an Android build.

With this public release, all future yuzu development activities will account for, and address, both feature and platform compatibility for Android.
This is expected to help facilitate and streamline our development process to better achieve our goal of platform independence.

We hope to welcome Android developers interested in lending their expertise to a cutting-edge project and produce new yuzu features, optimizations, and other improvements!

{{< imgs
    "skyrim.png| You're finally awake! yuzu on Android launched! (Samsung Galaxy S20 FE, Mesa Turnip GPU driver)"
>}}


# State of things: Where are we? What can users expect?

Before we talk more about where we are and what users can expect, we would like to make a few things clear:

* We're committed to improving the feature parity, compatibility, and performance of our Android builds; most improvements for desktop platforms, like Windows and Linux, will also help improve our Android users' experience.

* yuzu Android is in rapid development and early builds should be considered akin to a beta.

* Expect to see a variety of results regarding compatibility and performance on different devices, discussed in more detail later.

With that out of the way, let's dive into the state of things for yuzu Android.


## Some background

Like our sister project, Citra, yuzu has always been developed with multi-platform support in mind.
We've supported major desktop operating systems, such as Windows and Linux, since the earliest builds of yuzu.
yuzu's core code has, by design, been kept modular and frontend agnostic to ensure any future efforts to expand supported platforms does not run into unwanted dependency issues.

Although we originally couldn't support macOS due to Apple deprecating OpenGL support on it, there has been a recent rekindling of efforts to support macOS using MoltenVK — and it so happens that the new Macs are powered by 64-bit ARM-based Apple Silicon (M1/M2, at the time of writing) SoCs (System-on-Chip).
But then we faced another hurdle — Dynarmic's lack of host recompilation support for ARM64.

In case you weren't aware, yuzu uses [Dynarmic](https://github.com/merryhime/dynarmic) for its CPU emulation.
Dynarmic works by recompiling (translating) the Nintendo Switch's (guest) ARM CPU instructions to the user's (host) CPU.
And because Dynarmic didn't yet support recompiling guest code for ARM64, yuzu's CPU emulation couldn't work on any of these host CPUs.

Thanks to the efforts of [byte[]](https://github.com/liamwhite) and [merryhime](https://github.com/merryhime), this hurdle didn't stand in our way for too long.
With ARM64 host support ready to go, byte[] set his sights on getting yuzu to work on macOS.
But that's a story for another day.

By the way, did you know that there are other platforms that use ARM64 SoCs extensively?


## Bringing yuzu to Android

Knowing that Dynarmic support for ARM64 host recompilation was underway and that Vulkan support on Android would probably be better than macOS, we were optimistic about getting yuzu working on Android.

[flTobi](https://github.com/FearlessTobi) and [bunnei](https://github.com/bunnei) quickly started putting things together, with the first goal to simply get yuzu building for Android.
These early builds lacked a working renderer to display graphics, but progress was promising.
After some fixes, they got a few 32-bit games such as `Mario Kart 8 Deluxe` and `Captain Toad: Treasure Tracker` booting with just the audio.

Once the Dynarmic ARM64 support was completed, byte[] joined them and the trio got working on getting the Vulkan renderer backend working on Android.
While OpenGL ES didn't pan out, bunnei was able to get yuzu to render basic homebrew on Android with Vulkan:

{{< single-title-imgs
    " "
    "./proto1.png"
    "./proto2.png"
>}}

{{< single-title-imgs
    "Snake, try to remember the basics of rendering"
    "./proto3.png"
    "./proto4.png"
>}}

With our lead moderator [Flamboyant Ham](https://github.com/Schplee) working on a new input overlay design and app themes, [german77](https://github.com/german77) started working with them on integrating the input backend to the touch-screen overlay.
As a sudden surprise for us, developer [t895](https://github.com/t895), who's been improving [Dolphin's](https://github.com/dolphin-emu/dolphin) Android app, accepted our request and joined the team to work on overhauling our app UI.

{{< single-title-imgs
    "Peruse our settings and customize as you see fit!"
    "./ui1.png"
    "./ui2.png"
    "./ui3.png"
>}}

Together, with Flamboyant Ham creating the designs and t895 working his dev magic, an onboarding process and search menu were added, helping users select their keys, games folder, and search for titles with ease!

{{< single-title-imgs
    "Simple and straightforward - our favorite!"
    "./intro1.png"
    "./intro2.png"
    "./search.png"
>}}

Special thanks to the Citra GPU dev, [GPUCode](https://github.com/GPUCode), for taking their time away from Citra Android and Vulkan development to improve this release with their special sauce {{< gh-hovercard "9973" "Async Presentation" >}}.

# What to expect?

Android is a platform that boasts a huge userbase, but brings with it its fair share of problems.
As there is a lot of hardware variation for Android devices, compatibility and performance will vary.
So, to temper expectations, we would like to clarify our minimum requirements for the near future.

## Hardware requirements

At the moment, yuzu requires devices powered by Qualcomm Snapdragon SoCs which have Adreno GPUs.
Devices powered by SoCs like Exynos, Mediatek, etc. are expected to not work at all due to their "worse-than-Adreno" GPU drivers, at least for the near future.
Also, yuzu on Android has high RAM requirements, therefore fairly high-end devices provide the best experience (e.g. SD 865 and 8GB of RAM or better).

yuzu on Android ships with the ability to run custom GPU drivers, such as newer official Adreno drivers, or [Turnip](https://docs.mesa3d.org/drivers/freedreno.html) using [libadrenotools](https://github.com/bylaws/libadrenotools) to improve the performance on older generation Snapdragon SoCs.
Apart from this, there are still many more Android-specific optimizations to be done.
We have plenty of opportunity to improve performance, but this explains the current high minimum system requirements.

This initial release has been intentionally kept fairly minimal so that we can focus on improving performance and stability.
As stated earlier, feature parity with our PC builds is something we're committed to, but expect it to happen slowly and not immediately.

## Performance and Compatibility

Regarding software requirements, yuzu requires Android 11 or newer and a myriad of mandatory Vulkan extensions that the Play Store will automatically check for.
That being said, the Android GPU driver ecosystem is very inconsistent; not all devices will be the same.
Being able to download and install yuzu doesn't mean the performance or compatibility will be great.
As expected, Qualcomm is (currently) king here.

All Qualcomm device users will have the option to test different Mesa Turnip driver versions, thanks to [libadrenotools](https://github.com/bylaws/libadrenotools).
We will link them in our [Discord server](https://discord.gg/u77vRWY). You can download any compatible drivers, and select them by going to `Settings > Install GPU Driver > Install` in yuzu.

{{< imgs
    "./gpu_driver_install.png| Just tap on Install!"
>}}

The latest is not always better, and specific games may prefer specific drivers.

Currently, the best compatibility is achieved using Adreno 600 series GPUs running the Mesa Turnip drivers.
If you want games to start and render correctly, this is the way to go.

The best performance comes from Adreno 700 series hardware (Snapdragon 8 Gen 1 and newer), which won't have Turnip support for a while.
While performance is typically higher, you will experience rendering issues or some games refusing to start.

With that said, take a look at some performance numbers from several games:

{{< imgs
    "./performance.png| Not too shabby for a first release!"
>}}

We think that devices with Exynos 2200 and newer SoCs running AMD RDNA2 GPUs could also work well, but we haven’t been able to test them out due to how hard they are to find.
Available information suggests they run some older form of the AMD proprietary driver, so support may be somewhat good knowing AMD's track record.

Regardless of the device, disabling `Docked mode` and/or using lower resolution multipliers can help with performance in most games.
However, your mileage will vary here.
Some games may prefer docked mode, and some drivers don't play well with resolution multipliers under 1x.
You'll have to test and see what works for you!

{{< single-title-imgs
    "We're still figuring out what the best settings are for each game, so please experiment!"
    "./graphics_settings.png"
    "./system_settings.png"
>}}

Cooling is an important factor of performance as well.
We tested several devices with the Snapdragon 8 Gen 2 SoC, and while a gaming-oriented Redmagic 8 Pro had no problems keeping its clock speeds high (even locked to maximum) and temperatures low, a regular Samsung Galaxy S23, on the other hand, is a boiling machine, climbing to 90°C in seconds.
This temperature won't damage the device, as TjMax is at 100°C, but higher temperatures do lead to lower clock speeds.

{{< imgs
    "./pokemon_sword_cpu_usage.png| Hand warmer included (Pokémon Sword)"
>}}

Overheating leading to thermal throttling can result in a 30-50% performance loss over time, so this is one of the few times when gamer-gimmick marketing isn't lying.

Regarding other specs, RAM is crucial.
The recommended value is 8GB or more, big emphasis on more, and the absolute minimum is 6GB, but this will lead to many resource intensive games crashing.
`The Legend of Zelda: Tears of the Kingdom` requires 12GB at the moment.

Storage is not a critical aspect, but keep in mind that Switch games are typically large — there are visual novels over 20GB, and that's not counting updates and DLC.

Controller input support is in its early stages.
The ability to configure multiple controllers and their button mappings is currently being worked on, but not yet ready.
Xbox, PlayStation, and Switch Pro controllers are automatically mapped when they are paired over Bluetooth.
Generic DirectInput controllers are supported, but until more development time is spent dedicated to them, you may see some mapping issues and potentially missing mappings for buttons.
Joy-Cons are not supported for now, Android doesn't allow access to them so they will have missing functionality.

An on-screen input overlay will always be available, and it can be hidden while playing.
Swipe from the left side of the screen and toggle `Input Overlay > Show Overlay` if you want to disable it.
The Button and Stick placements can be adjusted here as well.

{{< single-title-imgs
    "Adjust to your liking"
    "./input1.png"
    "./input2.png"
    "./input3.png"
>}}


# Setup guide

If you need help setting up yuzu, our [Quickstart Guide](https://yuzu-emu.org/help/quickstart/) will provide all the steps required to get up and running.
All the same requirements apply, including having a PC and the mandatory hacked Nintendo Switch.
The yuzu on Android onboarding process will have you select the location of your `prod.keys` file.

The only major difference is that the yuzu folder is located in `Android/data/org.yuzu.yuzu_emu/files`, which you will need access to in order to install Switch firmware files and any preferred mods.
A quick-and-easy management interface for DLC, updates, mods, and saves will be added at a later date, so for those who dare, the process must be done manually for now (or copied from your PC installation of yuzu).

In recent Android versions, Google started blocking access to app folders in file managers, so it is recommended to instead use Android's integrated file manager to access the yuzu folder. Here is a link to an app that allows users to have [direct access to it](https://play.google.com/store/apps/details?id=com.marc.files).

Alternatively, you can always connect the phone/tablet to your PC via USB cable. No restrictions apply there.


# Conclusion

And there you have it!
We're excited for the opportunity that Android provides us, to hear all of your feedback, and we hope you enjoy playing!

{{< imgs
    "./totk.png| The Legend of Zelda: Tears of the Kingdom"
>}}

We don't have anything else to talk about for now, but please enjoy the below selection of screenshots taken from yuzu on Android!

# Media

{{< single-title-imgs
    "The Legend of Zelda: Tears of the Kingdom (Samsung Galaxy S20 FE, Qualcomm proprietary GPU driver)"
    "totk_qcom.png"
    "totk_qcom2.png"
>}}

{{< single-title-imgs
    "Super Smash Bros. Ultimate (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "ssmb.png"
    "ssmb2.png"
>}}

{{< single-title-imgs
    "Mario Kart 8 Deluxe (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "mk1.png"
    "mk2.png"
>}}

{{< single-title-imgs
    "Super Mario Odyssey (Samsung Galaxy S20 FE, Mesa Turnip GPU driver)"
    "smo1.png"
    "smo2.png"
>}}

{{< single-title-imgs
    "Animal Crossing: New Horizons (Samsung Galaxy S20 FE, Mesa Turnip GPU driver)"
    "acnh.png"
    "acnh2.png"
>}}

{{< imgs
    "tloz-awakening.png| The Legend of Zelda: Link's Awakening (Samsum Galaxy S23, Qualcomm proprietary GPU driver)"
>}}

{{< imgs
    "tloz-ss.png| The Legend of Zelda: Skyward Sword HD (Samsung Galaxy S20 FE, Mesa Turnip GPU driver)"
>}}

{{< single-title-imgs
    "Donkey Kong Country: Tropical Freeze (Samsung Galaxy S20 FE, Mesa Turnip GPU driver)"
    "dkctf.png"
    "dkctf2.png"
>}}

{{< single-title-imgs
    "Fire Emblem Engage (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "fe_engage.png"
    "fe_engage2.png"
>}}

{{< single-title-imgs
    "Metroid Dread (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "dread.png"
    "dread2.png"
>}}

{{< imgs
    "pokemon-shield.png| Pokémon Sword (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
>}}

{{< single-title-imgs
    "Pokemon Legends: Arceus (Samsung Galaxy S20 FE, Turnip GPU driver)"
    "arceus.png"
    "arceus2.png"
>}}

{{< single-title-imgs
    "Super Mario 3D World + Bowser's Fury (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "sm3d_1.png"
    "sm3d_2.png"
>}}

{{< single-title-imgs
    "Atelier Ryza: Ever Darkness & the Secret Hideout (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "atelier_ryza_1.png"
    "atelier_ryza_2.png"
>}}

{{< single-title-imgs
    "Diablo III: Eternal Collection (Samsung Galaxy S23, Qualcomm proprietary GPU driver)"
    "d3_1.png"
    "d3_2.png"
>}}

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
