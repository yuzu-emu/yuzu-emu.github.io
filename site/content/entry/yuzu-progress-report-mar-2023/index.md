+++
date = "2023-04-10T12:00:00-03:00"
title = "Progress Report March 2023"
author = "GoldenX86"
forum = 756599
+++

Hi yuz-ers! We've been working hard as usual, and this March saw improvements in performance, graphics, audio, CPU precision, input, and much more!

<!--more--> 

## Making CPUs go the opposite of BRRRR

One of the biggest changes this month is the set of improvements in CPU accuracy.
This requires some backtracking so let’s rewind a little bit.

Back in [July,](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2022/#core-timing-or-how-to-suffer-so-much-with-a-fix) we explained how `CoreTiming` operates in its current form, using a host timer. 
A thread called `HostTiming` is used to process HLE events such as input and audio.
However, some of these events, like audio, require a high level of timer precision to behave the way games expect, more than Windows would usually allow.

By default, Windows only allows a precision of 1ms since the OS event loop runs at 1000Hz. 
This is not enough. 
However, devices running Linux, BSD, and MacOS don't face this limitation and can achieve μs (microsecond) levels of precision.

If a game wants to run at a frametime of 16.67ms (60 FPS), you could wait for 17ms two-thirds of the time and 16ms for the remaining one-third, but this has already proved in the past to be terrible for audio accuracy.
The alternative, and old method in use for Windows, is to wait for 16ms and do a busy wait for 0.67ms. 
During that 0.67ms, the CPU thread isn't doing anything and consumes power without actually working.

Here comes the benefit of removing support for Windows 7 and 8/8.1. 
The Windows 10 SDK has new undocumented functions, `NtSetTimerResolution` and `NtDelayExecution`, which allow improving timer resolution down to 0.5ms.
This allows yuzu to wait for 16.5ms and only spin the remaining 0.17ms, which is four times shorter than the previous default method.

By implementing these {{< gh-hovercard "9889" "new functions," >}} [Morph](https://github.com/Morph1984) reduced the time the CPU spends in a spinlock, resulting in reduced CPU usage for timing-heavy games like Kirby Forgor 💀… `Kirby and the Forgotten Land`, and `Super Smash Bros. Ultimate`.
The new free resources mean better performance for low core count CPUs such as quad cores, and for systems with limited power budgets such as laptops and handhelds.
With this change, we measured up to a 24% reduction in CPU use or power consumption, depending on the limiting factor.

{{< single-title-imgs
    "Left: old 1ms precision; Right: current 0.5ms precision. The result comes from your writer’s laptop which runs a Single Language Windows installation, so don’t mind the Spanish. Note that there is a difference in CPU use between the two results"
    "./usebug.png"
    "./usefix.png"
    >}}

If you can perform more tasks in the same power envelope, you can improve performance without sacrificing battery life.
Alternatively, a more common scenario for an emulator, if your ceiling is a fixed framerate, you can reduce temperatures.

{{< single-title-imgs
    "This is why the lap in laptop is a lie, mind the package temperature (Xenoblade Chronicles 3)"
    "./tempbug.png"
    "./tempfix.png"
    >}}

Users reported that games have less audio stuttering thanks to the improved timer precision.

Another nice tool that the Windows 10 SDK adds is allowing us to set yuzu as a `HighQoS` process, hinting to the Windows scheduler that if there are higher performance cores available, they should take priority.
This further improves performance for current Ryzen CPUs by suggesting to use the best cores of a CCX, and for Intel 12th Gen and newer, by prioritizing P-cores ("performance cores", normal cores).

It’s heavily recommended to keep chipset drivers up to date to take the best advantage of your hardware.

If the CPU performs in a more efficient way, how do we go even further beyond?
Well, Morph figured the next step is to improve how the CPU counts time itself!

On modern CPUs using the x86 architecture, the invariant timer is fetched with the the [RDTSC](https://en.wikipedia.org/wiki/Time_Stamp_Counter) instruction.
The thing with RDTSC is that… it isn’t accurate over longer periods. 
It can’t be on multicore processors.

The small differences between what RDTSC provides as a best estimate and actual reality causes time drift in games like `Super Smash Bros. Ultimate`. 
You may notice this issue surfaces its ugly head as inaccurate match times.
Intel 12th Gen, the most affected CPU architecture we measured (also all the way back in July), was as bad as a second off per minute.

Morph’s {{< gh-hovercard "9917" "solution" >}} to this issue is to spawn an extra thread whose task is to take two measurements of the TSC for 10 seconds, then take that difference and apply it to know how many actual ticks have passed in those first 10 seconds.
If you then divide the number of ticks by 10, you get the exact frequency the host RDTSC timer was running at.

{{< single-title-imgs
    "Good thing we don’t have to use old stopwatches for this (Super Smash Bros. Ultimate)"
    "./timerbug.png"
    "./timerfix.png"
    >}}

The result is practically perfect timing on Ryzen and Intel 11th Gen and older systems, and *almost* perfect timing on 12th Gen Alder Lake systems. 
Having completely different cores counting time simultaneously inside the CPU is not pretty for this specific application.
We can’t defeat the hybrid asymmetric nature of Intel’s design, but we managed to reduce the drift from a second per minute, to a second every 5 minutes or so.

"Okay, this is pretty good" said Morph, but how can you go even deeper?
The only option left is to {{< gh-hovercard "9982" "drop to assembly." >}}

The optimization in question is currently only available for 12th Gen and newer Intel CPUs; AMD has not added support for it yet.
We’re talking about [TPAUSE](https://www.felixcloutier.com/x86/tpause) (CPUID name `WAITPKG`), a new instruction from Team Blue which allows the CPU to enter a lower power state and idle until a precise amount of time has passed.

Some testing was required to specify the correct number of cycles for the wait period; a wrong value would reduce precision too much on one extreme, or not produce any benefit on the other.
100000 cycles was the magic number in Morph’s testing, which reduced CPU use/power consumption by up to 20%, on top of the previous benefits.

If only Intel GPU drivers [worked](https://github.com/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/159), their Xe equipped laptops/handhelds would now be very viable yuzu gaming machines…
Oh well, 12th/13th Gen users running actual working GPU drivers from NVIDIA or AMD will benefit greatly from all this work.

## Graphical changes

Enough with the CPU improvements. What about graphics?
Well, we have quite a bit to talk about.

Users reported interesting colour banding on `STORY OF SEASONS: A Wonderful Life`. [Maide](https://github.com/Kelebek1) dug deep into the issue, and identified the culprit in `S8_UINT` colour formats, like `D32_FLOAT_S8_UINT` and `S8_UINT_D24_UNORM`.
With some trial and error, and some big help from the great [bylaws](https://github.com/bylaws) (from the [Skyline](https://github.com/skyline-emu/skyline) emulator), Maide managed to sort out the issues, providing {{< gh-hovercard "9896" "accurate colour rendering" >}} without breaking other games.

{{< single-title-imgs-compare
	"Now you can enjoy this farming simulator, with all its vibrant hues, without having to worry about colour banding. Isn’t that a-moo-sing? (STORY OF SEASONS: A Wonderful Life)"
	"./sosbug.png"
	"./sosfix.png"
>}}

[epicboy](https://github.com/ameerj) strikes again with his ninja updates. This time he gives some love to the *still thriving* OpenGL gang, bringing all the goodies of {{< gh-hovercard "9913" "AccelerateDMA," >}} which we discussed in the [last report](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2023/#project-yfc-175).

This means that OpenGL users, especially those with Fermi and Kepler GPUs, can enjoy the speed boost of this pseudo-Y.F.C. 2 change, making games such as `Metroid Prime Remastered` run much faster.
No more waiting for Samus to load her arm cannon.

We strongly advise users of older hardware without good Vulkan support to upgrade to something newer, as support for OpenGL is soon nearing its End of Life. That being said, thanks to epicboy, those who can’t upgrade won’t suffer from terrible performance using the old but gold OpenGL API.

But that’s not all, epicboy also added an {{< gh-hovercard "9925" "optimization" >}} for `GL_SYNC_STATUS`, boosting performance slightly.
Your writer observes a 3-5% performance increase in `The Legend of Zelda: Breath of the Wild`, one of the few games that runs faster on OpenGL with NVIDIA hardware, if you ignore the shader stuttering.

{{< imgs
	"./botw.png| From 54 to 57 FPS in one of the heaviest spots in the game, OpenGL still has life in it! For now… (The Legend of Zelda: Breath of the Wild)"
  >}}

bylaws came to the rescue again, pointing out that our old Vulkan scheduler implementation had some regressions [back in October](https://yuzu-emu.org/entry/yuzu-progress-report-oct-2022/#graphics-and-general-bug-fixes) of last year, when [byte[]](https://github.com/liamwhite) worked on making homebrew apps work with Vulkan.

This meant that games and homebrew would have to wait for a frame to show up on screen before starting to render, which in some cases is a bad example of feedback looping at its worst.

By {{< gh-hovercard "9931" "waiting in the background" >}} for the queue to be emptied without having to wait for the frame to be presented, byte[] fixed the regression.
Thanks bylaws!

Remember that lovely game we talked about [last month?](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2023/#other-gpu-and-video-changes)
The one for all ages! Totally safe to play with your family.

[vonchenplus](https://github.com/vonchenplus) decided to make it playable, so ~~weebs~~ players around the world could enjoy the amazing gameplay of `Moero Crystal H`, by {{< gh-hovercard "9943" "fixing" >}} some errors in how yuzu processed the inline index and draw texture commands.

{{< imgs
	"./mch.png| Cultured gaming (Moero Crystal H)"
  >}}

A recent system update for the Steam Deck messed up the graphics in many games. The culprit? Some issue with `VK_EXT_extended_dynamic_state3`, one of the Vulkan extensions that helps reduce shader building stutter.

A combination of yuzu expecting NVIDIA driver behaviour, and a difference in the latest Mesa implementation on the Deck caused what you see next:

{{< single-title-imgs
    "Looks like someone spilled some paint on the screen (The Legend of Zelda: Breath of the Wild)"
    "./eds1.png"
    "./eds2.png"
    "./eds3.png"
    >}}

byte[] {{< gh-hovercard "9955" "disabled" >}} the feature that caused the problem for now, but we’ll reconsider turning it on again in the future as it’s very likely Mesa [has already fixed the issues](https://gitlab.freedesktop.org/mesa/mesa/-/issues/8325) on their end.

Here’s a couple of important fixes for the Xenoblade fans, which Maide spent a lot of time working on.

Shaders were broken in-game due to issues with sRGB border colour conversions in the samplers. 
This is a process that converts colours from one colour space to another.
This would cause inaccuracies that made some checks fail on affected shaders, resulting in discarding the wrong pixels as shadows.

We need more information to fully understand the issue, but for now, {{< gh-hovercard "9962" "ignoring" >}} colourspace transformations on sRGB samplers allows for hardware-accurate rendering.

{{< single-title-imgs-compare
	"Rex knew what the future held for him, wink wink (Xenoblade Chronicles 2)"
	"./xcbug.png"
	"./xcfix.png"
>}}

The other long-standing issue affecting the Xenoblade trilogy (well, Definitive Edition and 2 at least) has been plaguing yuzu since the legendary [Texture Cache Rewrite](https://yuzu-emu.org/entry/yuzu-tcr/). 
It was the random "rainbow mode" that could happen anytime during gameplay, or in a specific late-game cutscene in `Xenoblade Chronicles 2` that I won’t spoil for new players.
If you played it in yuzu, you know which one. 
It makes you wonder if you’re in [Rapture](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Bioshock).

{{< imgs
	"./sea.jpg| Somewhere, beyond the (cloud) sea! (Xenoblade Chronicles 2)"
  >}}

Another observed problem was excessive lighting making the whole scene unreadable (especially at night with an HDR display, not a pleasant sudden flashbang).

{{< imgs
	"./flashbang.png| My eyes! (Xenoblade Chronicles 2)"
  >}}

Maide found that the issue was caused by {{< gh-hovercard "10004" "replacing" >}} fresh guest data with stale host data in the environment lighting cubemaps. 
The solution is to only copy data that has been marked as GPU-modified, following the behaviour of the [Buffer Cache Rewrite](https://yuzu-emu.org/entry/yuzu-bcr/).

{{< single-title-imgs-compare
	"This isn’t 2009, we don’t need this much bloom, thank you very much (Xenoblade Chronicles: Definitive Edition)"
	"./xcdebug.png"
	"./xcdefix.png"
>}}

With these changes, few graphical issues remain affecting the Xenoblade Chronicles saga, making it a great choice to enjoy on yuzu from start to finish. 
Then you can join your writer in debating over which Queen is the best.

{{< single-title-imgs-compare
	"Since this issue only happens the first time the cutscene renders, I’ll cheat using bug report pics, bite me (Xenoblade Chronicles 2)"
	"./xc2bug.jpg"
	"./xc2fix.jpg"
>}}

Newcomer [rschlaikjer](https://github.com/rschlaikjer), I hope I pronounced that right, has been digging deep into the texture cache, trying to figure out why a simple visual novel like `Tsukihime -A Piece of Blue Glass Moon-` would stutter when changing scenes. 
Maybe it’s because the game is too emotional for the emulator to handle.

The culprit was a missing reference operator when capturing the GPU page table, which caused the table to be copied over and over again thousands of times per second. That would make anyone stutter, let alone an emulator. {{< gh-hovercard "9988" "Converting" >}} the capture to a reference solved the issue, and it might also fix similar problems in other games.

We’re glad rschlaikjer caught this bug before it got out of hand. We don’t want to end up like [that chair](https://youtu.be/NPVRBa-VSMg).

## UI changes

Some issues are so elusive that they go unnoticed for years. Some issues are so complex that they require a deep understanding of all the layers involved to find the right solution. They frustrate many developers who give up, hoping someone else will have better luck.

And some issues are just plain silly. Like when a game crashes because the default user profile is damaged.
 
[german77](https://github.com/german77) found a simple fix for crashes in dozens of games:  {{< gh-hovercard "9908" "setting the default profile picture" >}} to a real 32x32 resolution instead of 0x0. 
That’s it.

Continuing to work on UI improvements, german77 also {{< gh-hovercard "9941" "moved the last audio" >}} setting `Mute audio when in background` to the Audio section, where it belongs. No more wandering around in General for this option.

{{< single-title-imgs-compare
	"Good, proper order"
	"./audiobug.png"
	"./audiofix.png"
>}}

This next one is a great improvement for UX (user experience), and a huge relief for me personally. 
Before, when using per-game controller profiles, if you forgot to change your input settings before starting a game, you would lose them when the game closes and have to set them up again next time.

epicboy {{< gh-hovercard "9965" "fixed this annoying issue" >}} and german77 merged the changes.
Thank you so much for this fix.

german77 is also working on making the profile selection applet better.
The {{< gh-hovercard "10006" "current changes" >}} are just the beginning, we will keep you updated on any progress in the future.

## Input improvements

Let’s talk about input, where german77 continues to shine.

Not satisfied with the mouse and keyboard experience when {{< gh-hovercard "9906" "playing" >}} `Metroid Prime Remastered`, german77 set the default mouse sensitivity to 50% and removed the smoothing filter, improving the performance on high DPI gaming mice after getting valuable feedback from Metroid fans.
He also lowered the motion threshold, clamped the rotation speed, and accumulated all input until delivery, which fixed the delay and choppiness of the previous implementation.

{{< imgs
	"./prime.jpg| Have you noticed how Samus lacks a lead indicator? Her suit couldn’t spare a tiny bit more processing power for that? (Metroid Prime Remastered)"
  >}}

Thanks to those changes, `Metroid Prime Remastered` showed that it could be a great PC game. If only Nintendo would let it out of its dungeon.

A common question we get is "will this third party Switch controller work?"
The short answer is maybe, but the long answer is a bit more complicated.
 
According to Nintendo’s API, Joy-Cons have two modes: active and passive.
Official Joy-Cons use active mode, but some third party controllers use passive mode, usually because they don’t follow the API properly and don’t support any configuration commands. 
They just run with the default settings, for better or worse.

That doesn’t mean passive controllers are useless. They still work on the Switch. But it does mean that they work differently. Active controllers update their status every 15 ms, while passive controllers only do it when something happens, such as a button press or release.

Well, it turns out yuzu didn’t support passive mode until now! So german77’s {{< gh-hovercard "9907" "changes" >}} made a lot of third party controller users happy.
That’s quite handy, considering how many unofficial controllers are out there.

The battle with vibration goes on!
While doing his usual research, german77 found out that if you have more than one player using the same type of controller, or if you use a dual Joy-Con setup with a single controller, you can end up sending two vibration commands to the same controller in a row.
This can be annoying, and it also takes up the limited bandwidth of Bluetooth connections.

The {{< gh-hovercard "9939" "solution is simple:" >}} only take the latest element in the [cool vibrations](https://www.youtube.com/watch?v=gzY8VH7eb8Y) queue for each controller, check if the controller can handle the requested vibration, and ignore the rest.

We all love Quality of Life changes, right? Even if they are not very flashy.

Let’s talk about the `Controller Applet`, which is responsible for asking players to choose their input settings when the game requests it.
Until now, the applet was unskippable; you had to give a valid answer to continue with your game.
While this was passable, it’s bothersome and inaccurate. 
Some games go back to a previous menu instead of getting stuck in an endless loop if the players can’t or won’t confirm their input style.

{{< imgs
	"./applet.png| You shall pass!"
  >}}

german77 solved this {{< gh-hovercard "9997" "behaviour," >}} and while at it also solved a bug where the player count wasn’t correct. 

german77 implemented the… hold on, let me catch my breath first, `SetNpadJoyAssignmentModeSingleWithDestination` service call.
He {{< gh-hovercard "9999" "implemented" >}} it hoping to make `Let’s Get Fit` playable, but unfortunately there are more issues in the way.

Changing topics to Amiibo support, a lot has happened this month.

First of all, german77 managed to {{< gh-hovercard "9953" "write" >}} the correct [CRC](https://en.wikipedia.org/wiki/Cyclic_redundancy_check), making Amiibo data written by yuzu compatible with the Switch; no more invalid info.

Next, if you tried to connect a controller while scanning an Amiibo, it would not be recognized. By {{< gh-hovercard "9981" "accounting" >}} for this and initializing or finalizing the controller, he fixed the issue.

And last but not least, to wrap up the Amiibo saga, Herman the German Sherman {{< gh-hovercard "9995" "added support" >}} for plain Amiibo files.
Some Amiibos, like the ones themed after `Super Smash Bros. Ultimate`, can be edited without the need of keys. Now yuzu can read non-encrypted game data from your Amiibos correctly!

## Audio fixes

Maide managed to spot a bug in how the reverb pre-delay line was being read, causing problems in the output.
Solving it by {{< gh-hovercard "9890" "correctly reading" >}} via input instead of output gives games like `New Super Mario Bros. U Deluxe` proper audio.
Now you can enjoy Mario’s voice without any echo. Mama mia!

bylaws has been digging deep into {{< gh-hovercard "9969" "audio synchronization," >}} improving the codebase here and there, and managing to avoid stalls by linking the guest sample tracking to the host.

This change caused some regressions, as some games are *very sensitive* to audio scheduling requirements. 
Users reported popping sounds after the merge, so bylaws improved the situation by adding a constant 15 ms of {{< gh-hovercard "10027" "latency" >}} to the sample count reporting.

## Other code changes

Fire Emblem fans have been experiencing freezes in-game, and after some investigation, Morph found out that the culprit was the bounded threadsafe queue, introduced with a pull request from [behunin](https://github.com/behunin).

The queue’s job is to pass events from an event producer (like the CPU cores) to an event consumer (like the GPU thread).
The previous implementation, which behunin replaced, kept allocating and freeing memory, causing periodic latency spikes.

The way to solve this issue is to turn the queue into a {{< gh-hovercard "9778" "bounded queue," >}} meaning no memory allocation is needed as there is a fixed amount of resources available.
And that’s what behunin did, but the new queue implementation seemed to be buggy. 
Morph added a {{< gh-hovercard "9971" "simplified implementation," >}} fixing the new gameplay freezes affecting `Fire Emblem: Three Houses` and `Fire Emblem Engage`.

[Your writer](https://github.com/goldenx86) re-enabled LTO for GCC builds, following the changes made for Windows last time, but only applying the {{< gh-hovercard "10014" "optimizations to the core and video_core subprojects," >}} providing Linux users a nice, free performance boost.

## Hardware section

### AMD 23.3.2 and newer drivers

One bad and two good pieces of news.

On the positive side, AMD has finally added support for the missing dynamic state extensions in their latest Windows driver release, which improves the shader build times and reduces the stuttering on Radeon GPUs, making them perform on par with NVIDIA.

However, on the negative side, this driver update also introduces a serious regression:

{{< imgs
	"./amd.jpg| This can affect your entire desktop (Metroid Prime Remastered)"
  >}}

Some games, such as `Metroid Prime Remastered` and `Pokémon Legends: Arceus`, trigger what seems to be an out-of-bounds crash that causes desktop corruption and a driver crash.
We advise users to stay on driver version 23.3.1 or older for now. Some older Radeon cards may also benefit from using 23.2.2.

We reported this issue to AMD and they promptly confirmed it, reproduced it, and informed us that they are working on a fix.

Now *that’s* how you do customer support.

Speaking of which…

### Doing Intel’s job

While testing a crucial rendering fix for `The Legend of Zelda: Breath of the Wild` that we will discuss next month, Morph did some feature testing to investigate what makes Intel Windows drivers run so horribly.

His findings are both expected and disappointing. 
The main culprit for about 95% of the crashes is a faulty compute shader stage in the drivers. 
Disabling compute shaders like we used to do for older Intel hardware makes most games run, but not all. 
We still don’t know the cause of the crashes when opening the menu in `Xenoblade Chronicles 3`.

We’re now trying to figure out what triggers the compute shaders to crash the driver like this, but this also raises a dilemma. 
Should we patch the issue ourselves, making game rendering worse and letting Intel off the hook, or should we leave it broken so they have to fix it properly?

The solution while the investigation continues is to use ol’ reliable Linux, or avoid buying hardware that relies only on Intel GPUs. Sigh.

## Future projects

We’re not even halfway through April and I’m already thrilled about what’s coming up in the next progress report. 
The devs are on fire and they’re not stopping anytime soon.

Maide is working on more improvements for the Xenoblade series, such as fixing the cloud flickering in `Xenoblade Chronicles 2`, the particle effects in `Xenoblade Chronicles 3`, and the texture flickering that affects the whole saga and some other games.
However, these fixes come at a performance cost, so he needs some help from another GPU developer to optimize them.
Maybe [Blinkhawk](https://github.com/FernandoS27) could lend a hand?

Nintendo contributed in releasing the holy grail of Vulkan extensions, [VK_EXT_shader_object](https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VK_EXT_shader_object.html).
This extension promises to cut down the amount of work needed to build shaders significantly, as its dependencies suggest, requiring support for all previous dynamic state extensions.

Most likely Nintendo intends to use it for their internal emulators, maybe for "backwards compatibility."
Regardless of any of that, we have a lot of work ahead of us to add support for this extension.

But enough about that. Let’s talk about some exciting projects in the works.
{{< imgs
	"./gaia.jpg| Flute intensifies"
  >}}

Regarding Project Gaia:
it is still in development.

Oh, and Project Lime is in release candidate status, under intense internal testing.

That’s all folks! Thank you for sticking around until the end of this progress report.

Thanks to Bing Chat for the terrible jokes.

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
