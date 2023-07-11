+++
date = "2023-07-10T12:00:00-03:00"
title = "Progress Report June 2023"
author = "GoldenX86"
forum = 852816
+++

Hello again, yuz-ers! Our devs, old and new, show no signs of slowing down. This month we have general performance and stability improvements, many graphics bug fixes, Android gets its first wave of improvements, and much more! Helmets on, let’s ride. 

<!--more--> 

Before we dive into the report, we have some important news to share. 
We've received reports that some users have been experiencing crashes when trying to use Vulkan or change settings. 
The culprit is `Overwolf`, a mod manager/overlay that comes with a faulty and outdated Vulkan layer, messing up the GPU’s Vulkan driver. 
We strongly advise users to uninstall Overwolf until they have fixed their Vulkan layer.

Now that we’ve cleared that up, let’s get started.

## Illusion of Time

While we implement many features of the Switch operating system, and can boot most games without a firmware dump, some games still require one. This is necessary for things like Mii models or to properly render foreign scripts and button fonts.
The firmware files also include the resources needed for proper time zone support.

Thanks to the amazing work of [toastUnlimited](https://github.com/lat9nq), yuzu {{< gh-hovercard "10603" "now ships with" >}} virtually all {{< gh-hovercard "10797" "time zone data" >}} that the Switch has by default!

In the past, yuzu would pretend that the system was in GMT, and then adjust the universal time by the local offset on the guest.
While this usually worked, it’s not accurate to how the Switch reports times.

The default “Auto” time zone setting will now send a location-accurate time zone to the guest (instead of following the old GMT rule) using the synthesised time zone archive.
The new system also sends a correct representation of the universal time, regardless of whether there is a firmware dump or not.

Now, while Linux had few issues with the new system (aside from a frustrating issue with Flatpak), Windows has some specific requirements. There are two important things to keep in mind: 

- When the changes were released, users needed to run at minimum a 2019 version of Windows 10, with 1809 no longer compatible. For LTSC users, this meant only the newest 2021 release would work. We later {{< gh-hovercard "11030" "implemented a solution" >}} for this. If you're running Windows LTSC 1809, or for some reason blocked Windows Update on a regular Windows version, remember to update to the latest yuzu version.
- You need the latest Visual C++ 2022 redistributable. Download it from this link: https://aka.ms/vs/17/release/vc_redist.x64.exe

Don’t forget to set your clock correctly!

## Graphics changes

This month has been full of GPU changes, so let’s start with a *simple* one.

There’s never rest for the wicked, so [Blinkhawk](https://github.com/FernandoS27) makes good use of that extra time doing what he does best: pulling big changes out of thin air.
In this case, he investigated what happens if a memory page is being used by the GPU and written by the CPU at the same time. 
Lovely little bugs that have been haunting us for half a decade, that’s what happens!

What Blinkhawk adds here is {{< gh-hovercard "10942" "a mechanism to register small CPU writes" >}} that sneak through while the page is being accessed by the GPU, properly invalidating the page if needed.
The following bugs have now been fixed as a result:

- Fixes the vertex explosions affecting `Pokemon Scarlet & Violet`. Use High GPU accuracy.

{{< single-title-imgs
    "No explosions near the Academy, Megumin! (Pokémon Scarlet)"
    "./scarletbug.mp4"
    "./scarletfix.mp4"
    >}}

- Fixes the slow rain and snow particles in `The Legend of Zelda: Breath of the Wild` & `The Legend of Zelda: Tears of the Kingdom`. 

{{< single-title-imgs
    "It’s raining Chuchus out there (The Legend of Zelda: Tears of the Kingdom)"
    "./rainbug.mp4"
    "./rainfix.mp4"
    >}}

- Fixes some particle corruption exclusive to `Tears of the Kingdom` seen, for example, while teleporting.

{{< single-title-imgs
    "It’s not perfect yet, but it’s almost there (The Legend of Zelda: Tears of the Kingdom)"
    "./telebug.mp4"
    "./telefix.mp4"
    >}}

- Fixes the erratic movement of some particles in `SUPER MARIO ODYSSEY`.

{{< single-title-imgs
    "Even the particles dance in this game (SUPER MARIO ODYSSEY)"
    "./smobug.mp4"
    "./smofix.mp4"
    >}}

- Fixes the hilariously wrong eyebrows affecting some characters in `Xenoblade Chronicles 3`, like Noah and Sena. Writer’s note: I will miss this one, it was fabulous.

{{< single-title-imgs
    "Hey, Noah’s eyes are up here (Xenoblade Chronicles 3)"
    "./xc3bug.mp4"
    "./xc3fix.mp4"
    >}}

- Fixes the corrupted save thumbnails in `Xenoblade Chronicles: Definitive Edition`.

{{< single-title-imgs-compare
    "That’s Dunban over there! (Xenoblade Chronicles: Definitive Edition)"
    "./picbug.png"
    "./picfix.png"
    >}}

- And more!

{{< gh-hovercard "10783" "Here’s some good news for the low-RAM folks!" >}}

Since native Switch game shaders can’t be run directly on the user’s GPU, yuzu has to recompile them into an intermediate representation (IR) which is a middle format that can be optimized and then converted to a shader that users' GPU drivers can actually handle (SPIR-V/GLSL/GLASM). For performance reasons, a significant amount of memory is preallocated to store these blocks of IR, and the old implementation would use 34MB per thread, twice.

68MB per thread may not seem like a lot, right? But this allocation is made as many times as the total thread count of the CPU, SMT included. 
With some quick maffs,  you can see that a Ryzen 3600 would gobble up 816 MB of system RAM, a Ryzen 7950X or an i9 13900 would need 2.2GB, and many phones with 8-threads SoCs would lose 544MB to these allocations.
This is, of course, not much of a problem for users with 32GB of system memory, but for 16GB or lower, particularly 8GB RAM users, this is a very steep price to pay. It is not uncommon to see a laptop with only 8GB of RAM and a 12 thread-equipped Ryzen 5500U for example, or 8GB phones and tablets.

[byte[]](https://github.com/liamwhite) wasn’t happy with this behaviour, so he replaced it with a much more memory-friendly one.
The current use per-thread is about 134KB now. That’s a whopping 99.6% reduction!

One of the ways to make games look better is by forcing higher values of anisotropic filtering, which makes textures at steep angles look much sharper.
The old implementation had to skip nearest-neighbour samplers on mipmapped images to avoid rendering issues in games like `Fire Emblem: Three Houses` and `ASTRAL CHAIN`.
This decision meant that many games like `Metroid Prime Remastered` would see no benefit from using higher values of anisotropic filtering, to the point that [Wollnashorn](https://github.com/Wollnashorn) would create mods to force the textures of `Breath of the Wild` and `Tears of the Kingdom` to trilinear filtering, allowing yuzu's anisotropic filtering setting to do its job.

While that was a nice workaround, Wollnashorn wasn’t satisfied with this solution, so they improved the {{< gh-hovercard "10744" " heuristics" >}} used to allow anisotropic filtering on any texture format without rendering issues, improving image quality, and as a bonus, even fixing an old rendering bug affecting `Mario Kart 8 Deluxe` too!

{{< single-title-imgs-compare
	"More accurate and better looking! (Mario Kart 8 Deluxe)"
	"./afbug.png"
	"./affix.png"
>}}

Now you can safely select 16x filtering and enjoy the results, which you can find in `Emulation > Configure… > Graphics > Advanced > Anisotropic Filtering`:

{{< imgs
	"./af.png| Anisotropic Filtering at 16x may affect performance on integrated GPUs, something to keep in mind"
  >}}

In another batch of old issues fixed by Blinkhawk, he managed to pinpoint the cause for Unreal Engine 4 games having broken textures and crashing when running with Vulkan, a problem that mostly affected NVIDIA cards.

Unreal Engine 4 is a big fan of [sparse textures](https://docs.unity3d.com/Manual/SparseTextures.html) to the point of really pushing the limits of the texture cache code.
A bug affecting how NVN virtual images were being remapped after sparse memory gets converted to regular mapped memory caused games like `SHIN MEGAMI TENSEI V`, `Bravely Default`, the `Pikmin 4 Demo`, and many others to display corrupted textures at random.

{{< single-title-imgs-compare
    "Optical camouflage gone wrong, clearly Protag-kun here is not as good as major Motoko (SHIN MEGAMI TENSEI V)"
    "./yvcbug1.png"
    "./yfcfix1.png"
    >}}

{{< single-title-imgs-compare
    "It's not a phase, mom! (BRAVELY DEFAULT II)"
    "./yfcbug1.png"
    "./yfcfix2.png"
    >}}

{{< gh-hovercard "10953" "Fixing this regression" >}} allows games to render properly once again.

Speaking of the `Pikmin 4 Demo`, the game taught us that while you can do it, 3D textures really {{< gh-hovercard "10956" "don’t need to be accelerated" >}} by DMA operations.
In order to avoid crashes in Unreal Engine 4 games like this, the LLE slow code path will be used instead.

{{< imgs
	"./pm4.png| More proof that games don’t need high requirements to be fun (Pikmin 4 Demo)"
  >}}

This pull request introduced a regression that affected rendering in `Metroid Prime Remastered`.
Thankfully, [gidoly](https://github.com/gidoly) quickly solved it by {{< gh-hovercard "11012" "merging both approaches," >}} old and new.

{{< single-title-imgs-compare
	"Chozo Suite error 404: Texture not found (Metroid Prime Remastered)"
	"./mprbug.png"
	"./mprfix.png"
>}}

While working on these crashes, byte[] changed the behaviour of the Vulkan memory manager to prefer (instead of require) {{< gh-hovercard "10994" "using device local memory" >}} (VRAM) for image memory, which ends up allowing up to 50% of shared memory (system RAM) to be used by the GPU.
This simple trick makes most Unreal Engine 4 games stable, but it is very likely it has the cost of making VRAM intensive games stutter more often once VRAM gets close to full, for example, when running `The Legend of Zelda: Tears of the Kingdom` on a GPU with 4GB of VRAM or less.

It’s a high price to pay considering `Tears of the Kingdom` is by far the most played game on yuzu, but we think the huge number of games that benefit from stable gameplay outweighs the latest Zelda stuttering a bit more on low-end GPUs with dedicated VRAM.

What better way to prove that statement than by continuing to write about `The Legend of Zelda: Tears of the Kingdom`!
Ever since its release, the modding community has been working tirelessly to improve the rendering quality of the game.
During their testing they discovered that any rendering resolution mod higher than 1008p would break ambient occlusion effects when scaled above 1x resolution.

byte[], with some help from Wollnashorn's initial investigation, {{< gh-hovercard "10675" "adjusted the rescale size thresholds," >}} and now the game can be safely upscaled with mods to reach that glorious real 1080p rendering—and can then be scaled with yuzu’s internal resolution scaler to any desired resolution.

{{< single-title-imgs-compare
	"The ambient occlusion of this game may not be perfectly implemented, but it really helps with the ambiance of the scene (The Legend of Zelda: Tears of the Kingdom)"
	"./aobug.png"
	"./aofix.png"
>}}

Now you can enjoy the game in all its splendour, without sacrificing any details.

While profiling the GPU code, Maide found a way to squeeze more performance out of the game.
By {{< gh-hovercard "10668" "combining vertex and transform feedback buffer bindings" >}} instead of binding them individually, thousands of API calls per frame can be avoided.
This leads to a small 1-3% improvement in framerates in general, but it manages to boost `Tears of the Kingdom` by a whopping 17%.
The tests were performed with a Ryzen 5 5600X, so it’s very likely that newer CPUs will see even bigger gains.

By adding some {{< gh-hovercard "10818" "additional samples checks" >}} when finding the correct render target, [vonchenplus](https://github.com/vonchenplus) fixed the device loss crashes that affected `Fire Emblem Engage` while playing in handheld mode, as well as the squished character portraits that affected some systems.
This change also fixes incorrect colour and shadows in `SpongeBob SquarePants: The Cosmic Shake`.

{{< single-title-imgs-compare
	"That portrait wasn’t very engaging, your excellency (Fire Emblem Engage)"
	"./feebug.png"
	"./feefix.png"
>}}

vonchenplus also fixed {{< gh-hovercard "10798" "resolution scaling issues" >}} affecting `Titan Quest` and `Crysis Remastered`; glitchy picture-in-picture bug begone!

{{< single-title-imgs-compare
	"Yes, we can run Crysis, now at 4k (Crysis Remastered)"
	"./crybug.png"
	"./cryfix.png"
>}}

OpenGL also got some love once again thanks to efforts made by [Epicboy](https://github.com/ameerj).

In a surprising discovery (or as stated in the pull request description, “here’s a fun one”), Epicboy found out that NVIDIA’s OpenGL drivers get a significant performance boost in shaders using local memory if the previous shader that was executed uses a lot of local memory. 
This seems to be an OpenGL-specific quirk in the NVIDIA driver, as Vulkan is not affected.

This {{< gh-hovercard "10916" "beautiful driver trick" >}} gives a 2-10% performance increase depending on the size of the GPU.

But the OpenGL gains didn’t stop there.
`Persistent Buffer Maps` were already in use by the texture cache, but {{< gh-hovercard "10476" "extending their use" >}} to the buffer cache more than doubles the performance of OpenGL on NVIDIA hardware!

{{< imgs
	"./ogl.png| Fermi and Kepler users rejoice (tested with an RTX 3070)"
  >}}

We expect a similar improvement when using Mesa drivers on Linux.

While most NVIDIA users are advised to stick to Vulkan now, as it is still faster and with WAY less shader stuttering, these changes should greatly help Fermi and Kepler (GTX 400 to GTX 700 series) users that, due to driver support reasons, must still use OpenGL. 
Or those who just like to live dangerously.

With the introduction of the resolution scaler, we added FXAA as a possible anti-aliasing filter, a preferred option over SMAA for games that already look too crisp, or simply for users that can’t afford the performance loss of SMAA.
Its Vulkan implementation has had issues with colour banding since release.
Not satisfied with that, byte[] solved the problem by {{< gh-hovercard "10670" "using a higher colour bit depth." >}}
Sometimes, solutions don’t need to be complicated.

{{< single-title-imgs-compare
	"For those old enough to remember what it felt getting a GPU that could do 24-bit colour (SUPER MARIO ODYSSEY)"
	"./fxaabug.png"
	"./fxaafix.png"
>}}

Many Switch games support dynamic framerates, or get mods that support dynamic framerates, meaning unlocking the framerate (by default by pressing Ctrl + U) is a great way to get a much better and smoother experience while emulating those games.
By the way, here’s a [list](https://github.com/Law022/Dynamic-Frame-Rate/wiki/Game--List) of such games for those curious.

One unwanted side effect with this is that video playback won’t be able to keep up with the increased framerate, often desynchronizing audio while still having to wait for the video to end.
To mitigate this, byte[] {{< gh-hovercard "10666" "added a toggle" >}} in `Emulation > Configure… > Graphics > Advanced` called “Sync to framerate of video playback” that, when enabled, will dynamically re-enable the framerate limit while a video cutscene is playing.

{{< imgs
	"./af.png| Totally not the same pic from earlier"
  >}}

While digging into the AccelerateDMA code, Epicboy found an {{< gh-hovercard "10583" "incorrect check" >}} that affected buffer-to-texture copies.
Fixing it increased performance by a whopping 1%, but as any avid gamer knows, average framerates are only half of the story.
This change also improved frametime consistency, especially in sudden spikes, which are arguably the most noticeable during gameplay.

{{< imgs
	"./frame1.png| "
  >}}

{{< imgs
	"./frame2.png| I have become frametime, the destroyer of gameplay"
  >}}

Users enjoy testing yuzu on a wide variety of devices; one particularly interesting example is the Tegra X1 product line from NVIDIA, the same architecture that powers the actual Nintendo Switch.
Since there are drivers available for those devices, yuzu can be run in a Linux environment, but for some reason, those drivers don’t include the `VK_EXT_robustness2` extension, which was mandatory up until now.
Newcomer [mrcmunir](https://github.com/mrcmunir) decided to change this and {{< gh-hovercard "10635" "mark the extension as optional," >}} making the most optimal ARM boards for Switch emulation able to enjoy gameplay with yuzu.

To close the graphics section, we saved the best for last:
toastUnlimited removed the use of a Windows only external memory Vulkan extension.
Why? To make yuzu {{< gh-hovercard "10829" "compatible with Wine" >}} while using Vulkan!
Why would someone run yuzu on Wine when a native and faster Linux version is available? We don’t know! But you can definitely do it now, given you build Wine from source yourself with support for Vulkan child windows.
We only intend to use this for debugging MinGW releases—for end users, we won't provide any support for running releases in Wine.

This is a fun case where all developers asked your writer to skip mentioning this change because it was considered redundant for this report.
To them I say: YOLO.

## Android additions

The new supported platform in town has a lot of improvements to boast of, but the most important one gets the honour of starting the section.

Thanks to the joint work of byte[] and [GPUCode](https://github.com/GPUCode), and the help from [bylaws](https://github.com/bylaws) who allowed us to use Skyline’s BCn texture decoder, yuzu can now properly advertise {{< gh-hovercard "10837" "support for Mali GPUs!" >}}

[Kept you waiting, huh.](https://www.youtube.com/watch?v=6EBuKP-uc94)

This means users of Mediatek, old Samsung Exynos, and Google Tensor CPUs [(among others)](https://en.wikipedia.org/wiki/Mali_(processor)#Implementations) can run their games in yuzu as long as they have a [G-series Mali GPU](https://en.wikipedia.org/wiki/Mali_(processor)#Variants), for example the Mali-G710 on the Pixel 7 series.

{{< single-title-imgs
    "SUPER MARIO ODYSSEY and Pokémon Mystery Dungeon Rescue Team DX (Running on a Pixel 7 Pro)"
    "./mali1.png"
    "./mali2.png"
    >}}

This theoretically doubles the compatibility of yuzu’s Android builds, as Mali is the most common GPU family in the Android ecosystem.

{{< single-title-imgs
    "The Legend of Zelda: Skyward Sword HD, Advance Wars 1+2: Re-Boot Camp, and OCTOPATH TRAVELER (Running on a Pixel 7 Pro)"
    "./mali3.png"
    "./mali4.png"
    "./mali5.png"
    >}}

Further testing with Mali revealed that while the driver implemented support for the `VK_EXT_extended_dynamic_state2` extension in older Mali drivers, the implementation for `VK_EXT_extended_dynamic_state` was not fully functional, and yuzu was not behaving correctly in this case.
This is most likely the reason both extensions were removed by Google from Pixel drivers. 
To avoid users of affected drivers experiencing no rendering output at all, byte[] {{< gh-hovercard "10790" "disabled the use of the extension" >}} on Mali hardware.

It should be noted that while the Mali drivers are much better at following the Vulkan specification than others, the physical hardware specifications are lacking.
Only high-end devices will reach playable framerates at the moment. 
Lower-end Mali products will be too weak for Switch emulation, even if they meet the driver requirements to run the emulator.
But hey, you’re welcome to try it out and see how it goes!

There’s also been a LOT of work put into the Android user interface. 

To begin with, [PabloG02](https://github.com/PabloG02) has given us a hand again, this time by {{< gh-hovercard "10551" "storing the position of overlay controls" >}} as a percentage, so if there is a change in the dimensions of the window, for example by using a foldable device, or rotating the screen on a tablet, the overlay controls stay in approximately the same location.

{{< imgs
	"./move.png| Place your input anywhere you want!"
  >}}

To help users with transferring the required files to yuzu and with debugging, PabloG02 also {{< gh-hovercard "10578" "added UI options" >}} to import firmware files, a requirement to run and properly display some games, and an option to quickly share the last log file, which can help our support members when trying to diagnose the reason for a crash. Thanks!

{{< imgs
	"./firmware.png| Select your firmware dump location"
  >}}

Users can be very particular about the configuration of overlay controls. Some may be fine with just using the Switch’s touch screen instead (depending on the game), and some have different preferences of opacity levels for buttons.
For cases like these, [t895](https://github.com/t895) added a dialog to {{< gh-hovercard "10557" "adjust the scale and opacity" >}} of the overlay controls.

{{< imgs
	"./overlay.png| Size and transparency"
  >}}

{{< single-title-imgs
    "It’s also a great way to enjoy touch-only games (Witch on the Holy Night)"
    "./ov1.png"
    "./ov2.png"
    >}}

yuzu includes a notification to ensure the app isn’t closed by Android when switching apps.
We need to do this to ensure users don’t lose their progress, but it can also be used to include some cool features.

One possibility is support for Picture-in-Picture when minimising the app.
t895 did the {{< gh-hovercard "10633" "preliminary work" >}} to allow changing the aspect ratio, and newcomer [AbandonedCart](https://github.com/AbandonedCart) {{< gh-hovercard "10639" "did the actual magic." >}}

{{< single-title-imgs
    "That’s a spicy music player (Super Smash Bros. Ultimate)"
    "./pip1.png"
    "./pip2.png"
    >}}

Later, a  {{< gh-hovercard "10811" "button to mute/unmute" >}} was added to the Picture-in-Picture overlay.

Android doesn’t only run on phones and tablets. You can find people crazy enough to play yuzu on TVs too!
For those madlads, newcomer [qurious-pixel](https://github.com/qurious-pixel) added support for an {{< gh-hovercard "10650" "Android TV" >}} banner.
Thank you!

{{< imgs
	"./tv.png| NVIDIA SHIELD anyone?"
  >}}

Since release, users have reported games looking strangely blurry, and issues with the aspect ratio of the rendering window and the orientation of the overlay controls when flipping the device.

This is a bit of an embarrassing one: all those issues were caused by decoupling the rotation of the Vulkan surface with the frontend layer.
This explains why aspect ratios were distorted and the overlay was inverted when the device was rotated, but the explanation for the blurriness issue deserves special mention.
Games present to the screen in docked mode using a landscape form factor and resolution of 1920x1080, but phones typically have a portrait mode form factor.
What happens if the window starts rendering at 1920x1080, then gets modified to 1080x1920 by the device and is stretched to fit the screen? Well, this:

{{< single-title-imgs-compare
	"Did we mention we’re new at this?"
	"./tv.png"
	"./bunnei.png"
>}}

{{< gh-hovercard "10703" "By keeping rotation in sync," >}} both intentionally by the user and unintentionally by the device, all mentioned issues are solved. Oops!

Continuing the effort of reaching feature parity with the desktop builds, [german77](https://github.com/german77) added support for {{< gh-hovercard "10705" "installing updates and DLCs" >}} to NAND, just like on PC.

{{< imgs
	"./dlc.png| Remember to hold to select multiple files!"
  >}}

AbandonedCart once again comes to the rescue by adding support to allow this option to {{< gh-hovercard "10794" "install multiple files" >}} at once.
It’s not fun having to constantly repeat the process to install every single thicc `Atelier Ryza: Ever Darkness & the Secret Hideout` DLC, but it’s so worth it.

Big Boss [bunnei](https://github.com/bunnei) made some changes to the {{< gh-hovercard "10746" "default graphics settings" >}} to improve the out-of-the-box experience, as well as add options required to solve rendering issues and/or improve performance.

Joining yuzu on Android from the desktop release is `Reactive Flushing`, an option that can significantly reduce performance in the name of rendering accuracy. 
To provide the best performance, the option is disabled by default, but if you want accurate shadows in Bayonetta games, or proper save thumbnails, remember to enable it.

`Force maximum clocks` is now disabled by default, since it’s not very relevant while the main bottleneck is on the CPU side of the emulation process. 
We’ll revisit this toggle once native code execution is implemented.

{{< imgs
	"./gpu.png| Feature parity with the PC releases, little by little"
  >}}

An often forgotten feature of the Nintendo Switch is touch support. 
While in handheld mode, some games allow you to play without controls, just with the screen. 
Support was present since release for the Android build, but it wasn’t accurate — the touch event would happen offset to the side of where the user would touch their finger. german77 fixed this {{< gh-hovercard "10751" "touchy behaviour," >}} making playing visual novels with no overlay buttons a joy.

One of the nice additions of Android 13 is the option to set {{< gh-hovercard "10760" "per-app languages," >}} so properly declaring the available language translations allows users to take advantage of this feature. 
Thanks [flTobi](https://github.com/FearlessTobi)!

{{< imgs
	"./lang.png| Your phone knows more languages than you"
  >}}

{{< gh-hovercard "10808" "Expanding the Debug section" >}} a bit, t895 added the option to disable `CPU Fastmem`.
This will reduce performance, but is useful for debugging purposes.

{{< imgs
	"./debug.png| Extremely recommended to leave at default values"
  >}}

Additionally, an option to select the audio backend was added too.

{{< imgs
	"./audio.png| Volume controls"
  >}}

Because it is only supported on Qualcomm devices, t895 {{< gh-hovercard "10864" "now hides" >}} the `Install GPU driver` option if the user is running a non-Qualcomm device.
Since we don’t offer the option to run different drivers on these devices, there’s no reason to show it. 
Of course, if Mesa can deliver a good driver for Mali hardware in the future, we will support custom drivers for it then.

As a way to warn users with devices that may not be capable of stable emulation, AbandonedCart {{< gh-hovercard "10869" "added a warning" >}} if it doesn’t have at least 8GB of RAM.
Android versions prior to the upcoming 14 don’t let apps know the exact RAM amount of the device, so available free RAM is used instead.

Speaking of which, t895 added {{< gh-hovercard "10945" "support for Android 14." >}} 
Better to be ready beforehand! 
You never know when Google might surprise us.

Before we end this section, let us clarify something. 
The Android builds are not limited to the changes mentioned here, but also include any other core improvements mentioned in this article.
For instance, the previously discussed GPU changes, and to be discussed memory and ARM optimizations are also included in the Android builds. 
These changes have boosted performance by 30-70% in the latest versions, for example, and none were Android specific.

We have also completed our release backups on GitHub! 
You can find them [here.](https://github.com/yuzu-emu/yuzu-android/releases/)
If you want to download a previous version, test experimental features, or avoid using the Google Play Store, feel free to grab the APK from there.

## Making CPUs go the opposite of BRRR, AMD edition

[Back in March](https://yuzu-emu.org/entry/yuzu-progress-report-mar-2023/#making-cpus-go-the-opposite-of-brrrr), we explained why Windows is not accurate enough when very high precision timers are required, so in order to improve performance, power consumption, and temperatures on x86_64 CPUs, specific CPU instructions are needed to reduce the time the CPU spends improperly idling.
We have a big mistake to correct here. We said only Intel offered such instructions starting with Alder Lake, and that AMD didn’t offer any.

Fortunately, we were wrong! AMD does indeed have its own implementation, the `monitorx` and `mwaitx` instructions pair, which have been out since *2015*, predating Ryzen!

By performing his usual black magic, [Morph](https://github.com/Morph1984) implemented support for these instructions, providing the same benefit only Intel users previously enjoyed, namely performance and battery life improvements for power-limited products (laptops, handhelds) or CPUs with fewer core counts.

Since AMD CPUs running Windows can now {{< gh-hovercard "10935" "properly idle for longer" >}} while waiting, power consumption and/or performance numbers are improved, depending on which limit is hit first: the power budget of the CPU or a framerate cap.
Sadly, your writer (who got tasked with testing this change) doesn’t have access to an Asus Rog Ally handheld, or even a Ryzen laptop, to do proper benchmarks, so instead please accept the numbers collected with a desktop Ryzen 5 5600X.
The results should be better with a proper mobile platform, but alas, we can only show what we tested.

Power consumption saw a 10-16% reduction, which translates with this particular CPU model to around a 10W reduction.
While simulating a power limited scenario (capping the PPT to 40W), performance improved up to 60%, but on average a 20% gain is more often expected.

Now, we can guess what some of you may be thinking, “how much does this help the Steam Deck? That’s a power-limited system with only four cores!” 
It makes no difference on the Deck. Let us explain.

The Steam Deck by default runs a Linux distribution. 
Linux doesn’t benefit from these changes as its kernel, unlike Windows’, is actually decent and can run high-precision timer events without any problem or undocumented SDK usage. If there’s no need to spin the CPU at all, it gets to idle properly. 
So unless you installed Windows onto your Steam Deck, you already had the best performance it can offer.

## ARM changes

The Android release taught us something very important: Using [Dynarmic](https://github.com/merryhime/dynarmic) adds a lot of overhead on ARM CPUs. While this doesn't pose any major obstacles on Apple Silicon M1 and M2 Macs, it's a big problem for Android devices, which are constantly power-limited with virtually no room for waste.

To reduce the overhead here, we are planning to implement a feature from Skyline, `native code execution`, or NCE, letting the game’s code run directly on the processor untranslated.
This will work for most 64-bit games, but 32-bit Switch games have some special requirements that complicate this.

NCE is a project that will take some time, but for now, byte[] already implemented a way to {{< gh-hovercard "10747" "decouple Dynarmic" >}} from the ARM interface, allowing for a separate CPU backend in the future.
Let’s see what the future brings.

We’re still calling it Project Nice, right? Right.

Regarding 32-bit games, it’s worth mentioning that behind the scenes, [Merry](https://github.com/merryhime) constantly works on optimising and fixing bugs in Dynarmic.
Recently, Merry was able to {{< gh-hovercard "10933" "enable an optimization" >}} for ARM64 host hardware. 
Block linking allows blocks of guest code that directly jump to each other to directly jump to each other when recompiled as well.
After enabling it, this resulted in a 60-70% performance boost for 32-bit games like `Mario Kart 8 Deluxe` on Android SoCs.
This serves as yet another reminder that emulation is very CPU-focused.

## Linux specific fix

Long gameplay sessions can sometimes feel like a gamble regarding stability. 
That’s a very common problem for emulators due to how they have to handle memory in unique ways to match two completely different systems. 
This was especially true for Linux users, who had to rely on increasing the size of the `vm.max_map_count` kernel parameter for certain games to avoid out-of-memory crashes. 
Since the emulator needs to create placeholder memory mappings to keep up with the virtual memory requirements of the game, it wasn’t hard to saturate the default value, resulting in a crash once the placeholder mappings outnumbered the max mapping count.

Enter newcomer [kkoniuszy](https://github.com/kkoniuszy), who had a simple yet very effective idea. 
By {{< gh-hovercard "10550" "keeping track of the creation" >}} of such placeholder mappings and using that information to create fewer larger ones instead of several smaller ones, the stress on `vm.max_map_count` is reduced and generally no longer needs to be modified. 
This results in stable game sessions when playing for hours. 
Thank you!

## Input improvements

The work to make Amiibos and their Near-Field Communication (NFC) behave the same as on real Switch hardware continues.
With the proper implementation finished [last month](https://yuzu-emu.org/entry/yuzu-progress-report-may-2023/#input-and-amiibo-improvements), german77 has focused on the last items on the checklist.

First of all, backup support.
On the Switch, Amiibo data is stored in the console every time data is loaded or saved. 
This is intended to help games restore corrupted Amiibo tags in case of errors.
{{< gh-hovercard "10623" "With this implementation," >}} yuzu now can do the same with Joy-Cons and Pro Controllers.
The backups will be stored in `%appdata%\yuzu\amiibo\backup`.

Our input dev added support for Foomiibos, blank but configurable Amiibo dumps with a signature included at the end, by {{< gh-hovercard "10795" "adding their size as a valid input." >}}

Activision releases NFC equipped toys (aka not-Amiibos) for the `Skylanders` games saga, and they are compatible with the Nintendo Switch, so of course, they must work on yuzu too! 
{{< gh-hovercard "10842" "The implementation" >}} should be transparent; just connect and map a controller, and it’s ready to scan the toys.

And to finish up the NFC section, {{< gh-hovercard "10903" "bugfixes and support for third-party controllers" >}} in a single pull request to rule them all.

Controllers sometimes fail to properly restore to a previous state when pairing. 
This could make yuzu lose input when the controller fails to use the NFC sensor.
If the game stopped polling for Amiibos while one was in range, the Amiibo would be lost but not signaled.
This pull request addressed this particular scenario.

Many third-party controllers don’t accept all commands. 
Reducing the number of attempts to obtain valid data and disabling most commands if errors occur will minimise the stuttering caused by the configuration process when setting up the NFC interface.

Lastly, if the controller properly reports support for NFC, but the user loads an amiibo from a binary dump, we would mistakenly show an error. 
This is now fixed.

Now, what about regular input changes? Well, we have a bit to talk about there too.

SDL, the external library used here to handle input (it can do much more than that), does get updates, and it doesn’t hurt to keep up with those from time to time, after validating they are stable, of course.
{{< gh-hovercard "10873" "Updating to version 2.28.0" >}}improved the calibration profile used on official Switch controllers, added support for the new DualSense Edge controller from Sony, {{< gh-hovercard "10891" "fixed some issues with Pro Controllers," >}} and added other minor changes and fixes that benefit the emulator.

{{< gh-hovercard "10950" "Mouse controls" >}} got more tuning love. 
This time there are some minor tweaks to its calibration. 
Returning to center will consider the assigned deadzones, and motion input has better sensitivity.

For those not in the know, if you set input to Keyboard/Mouse, or manually map a stick to the mouse, you can use the mouse for controlling movement.
`Ctrl + F9` is the default hotkey to take and release control of the mouse while playing.

Lastly, for the fitness enthusiasts, there are some improvements for the Ring-Con.

german77 improved Ring detection by {{< gh-hovercard "10937" "adding timeouts" >}} to let the scanning process try again after a fixed time.

And newcomer [kiri11](https://github.com/kiri11) {{< gh-hovercard "10908" "improved the wording" >}} of the help text to properly enable the Ring-Con, making it much less confusing. 
Thanks!

{{< imgs
	"./ringcon.png| Fitness at 4K"
  >}}

## Yet more Gaia-lite

Yes, there’s more progress by byte[] in fixing the current file system implementation while we wait for `Project Gaia`.

The [previously reported](https://yuzu-emu.org/entry/yuzu-progress-report-may-2023/#project-gaia-lite) “algorithmic complexity issue” when loading mods was working like a charm on Linux, but Windows always has to be difficult.
A {{< gh-hovercard "10588" "memory cache" >}} was added to fully realise the load time benefits on Microsoft’s OS too.

In another single-line-of-code revelation, byte[] discovered that {{< gh-hovercard "10718" "increasing the size of the buffer" >}} when copying files can more than triple the installation speed of updates and DLCs. 
Hurray for simple fixes like this!

A common problem modders and users had to deal with is a hard limit on the number of files that can be loaded per session.
Games like `Fire Emblem Engage` have so many files that it previously was not even possible to replace all of them with a mod.
Of course, byte[] wasn’t happy with this, so by adding a file [LRU](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)) cache to control the number of open files, he {{< gh-hovercard "10729" "removed the file limit." >}}
Users can now run as many mods as they want on their games, and they can have as many files as they need too!

But the fun doesn’t stop there for byte[]. Yet again, Windows demands special attention…
{{< gh-hovercard "10806" "A couple of optimizations" >}} and Windows users can now properly benefit too.

An oversight in the code responsible for caching RomFS mods prevented any caching from taking effect at all, making yuzu take typically twice as long as it needed to when loading a game with them enabled.
By {{< gh-hovercard "10594" "fixing" >}} this oversight, byte[] further reduced game load times with mods.

## Audio fixes

Linux users running the SDL audio backend reported having no audio out when using the JACK output.
The problem, as newcomer [zeltermann](https://github.com/zeltermann) found out after some investigation, is in how SDL identifies the CPU characteristics of the user’s hardware.

SDL’s `CPUInfo` subsystem is called to report the specifications of the user’s CPU. SDL then uses that information to properly configure itself for the environment it will run on, setting optimizations and deciding which internal code paths to use.
We thought CPUInfo shouldn’t be necessary just for audio output, so it was disabled in yuzu.

Well, under normal circumstances, it would have been fine, but SDL can’t decide if not having CPU information means there is or there isn’t a CPU present.
[SIMD](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data) support is reported as disabled, but [SSE2](https://en.wikipedia.org/wiki/SSE2) is assumed as enabled.
This contradiction leads to the fallbacks intended to run in case SIMD support was disabled to fail, making some functions return null, completely destroying audio output.

This chain reaction of events is solved by giving SDL what it wants: a proper {{< gh-hovercard "10739" "report by CPUInfo." >}}
Now Linux users can enjoy their games with audio when using the SDL output.
Thank you!

Out-of-bounds, the silent killer of so many programs… yuzu is of course not immune to them, as Morph found out.
An {{< gh-hovercard "10966" "out-of-bounds write" >}} leads to corruption in an audio heap buffer, which leads to beeping noises, speaker rattling, and crashes in multiple games, including but not limited to `Xenoblade Chronicles: Definitive Edition`, `Xenoblade Chronicles 2`, `Super Smash Bros. Ultimate`, and more.

A few tweaks here and there in the audio core code, and the issues are gone.

## UI changes

Switch games provide pretty game icons for the launcher. 
Needless to say, yuzu makes good use of them while rendering the game list. 
What wasn’t considered when using these icons for the user interface is that some games offer multiple alternatives for different languages. 
yuzu would just pick the first one available.

Enter newcomer [keve1227](https://github.com/keve1227) who coded in the {{< gh-hovercard "10591" "logic required" >}} to properly pick the right image depending on the console language the user picks in `Emulation > Configure… > System > Language`.
Thanks!

{{< single-title-imgs
    "Gotta find ’em all"
    "./langbug.png"
    "./langfix.png"
    >}}

The OpenGL API has three available shader backends in yuzu, and since the only way to know which one is selected is from checking the option in `Emulation > Configure… > Graphics`, newcomer [fastcall](https://github.com/xcfrg) decided it was due time to {{< gh-hovercard "10614" "add this info" >}} to the status bar.
Thanks!

{{< imgs
	"./oglui.png| You won’t forget you left GLASM enabled any more!"
  >}}

## Hardware section

Before starting with the driver rants, we want to share a possible way to save up to 2 GB of VRAM by taking advantage of Windows 11’s per-app graphics selector, assuming you have multiple GPUs available in your system. 
This has the potential of helping VRAM-intensive games like `The Legend of Zelda: Tears of the Kingdom`, and may also improve 1% lows on native PC games too.

For some reason, Windows uses around 1-2 GB of VRAM only for rendering the desktop.
That’s a heavy blow for GPUs equipped with 8 GB or less, without even considering other programs running in the background.

The requisites are a desktop PC running an up-to-date Windows 11, either a motherboard with two full length PCI-Express slots or a CPU with an integrated GPU, and all GPUs being new enough to still get driver updates (a GT 710 won’t work with an RTX 4070 as they run different driver versions, and an Intel HD 620 won’t receive new driver updates). In this example we will use an RTX 3060 Ti and an RX 6600, a combination you might be familiar with from previous articles and charts. 
A lower-end GPU like a GTX 750 or the integrated GPU of an Intel 11th Gen. (and newer) or Ryzen CPU would also work perfectly fine for this purpose.

It should be noted that most laptop users already do this with no user intervention, as most laptops don’t include hardware mux switches and just pass the finished frames over the PCIe bus.

The main trick here is to connect the display or displays to the secondary card, in order to get Windows, your browser, Discord, etc., to spend VRAM exclusively on the secondary card, letting yuzu and other programs/games get full access to the entire VRAM of the main GPU. 
To do this, we will take advantage of some relatively recent additions to Windows 11.

The first step after setting up the GPUs (desktop PCs may need to enable integrated GPUs on the UEFI configuration/BIOS) is to select the high performance card in display settings:

{{< single-title-imgs
    "On desktop PCs, Windows 10 fails here by not letting you select which card is which"
    "./gpu1.png"
    "./gpu2.png"
    "./gpu3.png"
    >}}

While this is enough for yuzu after a reboot, you will also need to manually set up each game or program that requires using the high performance GPU:

{{< single-title-imgs
    "Tech tip: Forza is faster if you run it with your main GPU"
    "./gpu4.png"
    "./gpu5.png"
    "./gpu6.png"
    >}}

Like this, you get the benefits of more free VRAM on the high performance GPU, and if the secondary GPU is more efficient, a power consumption reduction overall when using the PC. More available VRAM results in improved minimum framerates (the 1% low for example).

The cons for using this method is that frame data is transferred over the PCIe interface, which can be saturated. 
This can result in slightly lower average framerates and more input lag.
But hey, a free way to get a 4GB GPU to run `The Legend of Zelda: Tears of the Kingdom` with better frame pacing is worth a try, right?

### NVIDIA, no sign of progress

The new (at the time of writing) 536.40 driver release that adds support for the RTX 4060 hasn’t introduced any regression for yuzu. 
So it’s safe to update, just not “safe to upgrade” from older hardware yet. 
Maybe the RTX 5000 series will be a more viable option.

And from an interesting report that just came in, it seems using the NVIDIA Control Panel’s “Prefer maximum performance” option while playing `Xenoblade Chronicles 3` in conjunction with “Use asynchronous shader building” causes vertex explosions, most noticeably in cutscenes.
yuzu’s own “Force maximum clocks” toggle, while less efficient, doesn’t reproduce this interesting behaviour.
Something to keep in mind if you’re exploring Aionios with an NVIDIA GPU.

### AMD

Since driver release 23.7.1, a mysterious older “23.10.01.41 for Additional Vulkan Extensions” version, and the beta driver only available to Windows Insider testers, AMD official Vulkan drivers introduced a regression in how the `VK_EXT_extended_dynamic_state3` extension handles colour blending.
[Your writer](https://github.com/goldenx86) {{< gh-hovercard "10946" "blocked the affected bit" >}} while we monitor if future AMD driver releases manage to solve this problem.

{{< single-title-imgs-compare
	"Who gave Link the Batman’s Detective Mode? (The Legend of Zelda: Tears of the Kingdom)"
	"./amdbug.png"
	"./amdfix.png"
>}}

The performance loss from this change is very small, so feel free to update to the latest drivers.

[GPUCode](https://github.com/GPUCode) has found a way to emulate D24 support on AMD GPUs by using the `VK_EXT_depth_bias_control` extension, which is currently only available on the RADV Mesa driver on Linux.
In the near future, we’ll check if this method solves the remaining graphical issues specific to AMD hardware. 
If it works, it would also solve the issue on the AMD official drivers, once/if the extension is supported there too.

We know it’s not fun having to switch to OpenGL to be able to play some games, so we’re gearing up to combat even hardware limitations to defeat this foe.

### Intel

Intel had its fair share of fixes this month too.
First of all, as promised last month, byte[] added a translation for FP64 to FP32 when used in shaders.
This was required because Generation 12 Intel graphics (UHD 700/Iris Xe/Arc A series) removed support on a hardware level for double precision operations.
With this {{< gh-hovercard "10693" "shader translation" >}} in place, games will no longer suddenly crash when trying to use these shaders, for example during the opening cutscene of `Tears of the Kingdom` after starting a new game.

The next issue is an interesting mix of unique behaviour by the Switch's own graphics drivers, yuzu’s code at fault, and another case of lack of hardware support. 
Intel's GPUs allow the use of control barriers as specified by SPIR-V, which requires all threads in a dispatch to execute the same barriers at the same times, and don't allow any threads to exit early if another barrier will occur.
But all other GPU vendors besides Intel, including mobile GPUs, do allow threads to exit early, and will free up barriers on the remaining threads as needed.
This situation caused Intel GPUs to hit device losses, as guest compute shaders had barriers that ended up hitting this exact type of control flow.

By {{< gh-hovercard "10699" "removing barriers" >}} after conditional control flow, Intel GPUs are free from their device loss crashes.

And lastly, one loose end remained, our toggle to disable the compute pipeline on Intel GPUs.
This option was a stopgap solution until a driver update was released. But since Intel has finally published a driver update fixing the issues, it has now become irrelevant. toastUnlimited therefore modified the option to only show up in yuzu’s settings if an old driver known to be affected is still in use.
The disable compute pipeline toggle is now a {{< gh-hovercard "10835" "legendary drop option" >}} only available for the most unlucky Generation 12 users, as the option will also remain hidden for unaffected Generation 11 and older devices.
[Remember to update your drivers!](https://www.intel.com/content/www/us/en/download/729157/intel-arc-iris-xe-graphics-beta-windows.html)

With all driver and yuzu stability-related issues fixed, we can finally recommend Intel hardware again, especially current-generation integrated GPUs like the Iris Xe. 
While the lower-end 80EU-equipped Iris Xe can bottleneck performance at docked 1X mode in the most intensive games, it makes up for that by having zero texture related stuttering thanks to being the last breed of Intel GPUs with native ASTC texture support. 
We don’t know if future iGPUs will keep supporting ASTC, but it’s a reality that Arc dedicated GPUs don’t offer it.

Still, we can finally focus on working on the few remaining quirks for the Generation 12 architecture.
Right now, the Iris Xe can easily beat a Geforce MX450 in ASTC intensive games like `The Legend of Zelda: Tears of the Kingdom`, using less RAM and having no texture stuttering. 
Here, the E-cores are a blessing for shader building.

Hopefully future Intel products offer better FP16, higher performance, longer driver life support, don’t base their pricing on software gimmicks like their competition, and add a much-needed dedicated compute queue.

### Android

With the release of the Android builds, the whole team is learning about the platform’s ecosystem, its features and limitations, quirks and advantages.
There are fun times ahead for sure.
This means we also learned about the depressing state of its GPU drivers…

#### Adreno, or just waiting for Mesa

Adreno hardware has great specifications, but their proprietary official drivers are incredibly bad!
We’re starting to work on improving rendering on the official Adreno drivers used by default on Qualcomm equipped devices, but there’s only so much we can do.
The real solution comes from, you guessed it, the team that manages to make good drivers with no access to confidential information: Mesa.

One has to wonder why Android vendors don’t just use Mesa to begin with. Nothing deemed “confidential” or “trade-secret” here is more important than providing good software support! 

While the Adreno 600 series is well-supported and has great rendering with Mesa Turnip drivers, the 700 series is too new to enjoy the same benefits.
There have been a few packaged releases by [K11MCH1](https://github.com/K11MCH1) using the currently-in-development a700 branch of Mesa Turnip, but it’s exactly what it says on the tin: currently in development.
We can’t work on fixing regressions on a driver that is a work in progress; the only thing to do is to wait for it to mature.

#### Mali, good drivers, slow hardware, weird decisions

Mali is the complete opposite of Adreno. While there is no current Mesa support for it, we found their proprietary Vulkan driver to be in great shape once its initial quirks were addressed.
The same can’t be said about their OpenGL ES driver as our friends at Citra will gladly tell you, but thankfully that’s not an issue here.
The main problem is that the most common hardware the driver gets to run on is pretty subpar, at least for Switch emulation.
Clearly, high-end devices won’t have much issue on the GPU front as they are not far behind Adreno in hardware specs, but the rest of the product stack will suffer from low framerates and GPU bottlenecks.

Unfortunately, due to an unstable kernel API, and the lack of a maintained Mesa driver for these devices, there isn't currently any practical way to replace the running driver on a Mali device with a better one.
If a device ships with an outdated driver too old for yuzu and the vendor doesn’t update it, chances are nothing can be done about it.

That’s either planned obsolescence at its finest, or sheer incompetence. We’ll let you be the judge of that.

## Future projects

Fun stuff is cooking, we can’t announce the several yet-unnamed projects at the moment, but know this ship isn’t slowing down any time soon.

There’s work by Blinkhawk for faster GPU emulation, native code execution for ARM CPUs, MacOS gets a bit of much needed love, and more.
We’ll be reporting progress on these projects in the future, so keep your eyes peeled.

toastUnlimited started a big UI rewrite for the [per-game configurations](https://github.com/yuzu-emu/yuzu/pull/10839).

Some changes that didn’t make it in time for the cut-off date of this article include fixing crashes affecting Unreal engine games running on NVIDIA GPUs. 
We’ll cover those next month.

That’s all folks! Thank you for reading until the end. We hope to see you next month!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
