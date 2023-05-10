+++
date = "2023-05-05T12:00:00-03:00"
title = "Progress Report April 2023"
author = "GoldenX86"
forum = 0
+++

Hello yuz-ers! There were fewer individual changes this month, but the changes that were made are substantial! You won't want to miss this.

<!--more--> 

Poor Melia up there.

## Project Y.F.C. 1.90!

[Blinkhawk](https://github.com/FernandoS27) showed up one weekend and asked, “Want to test a 50% performance boost and almost perfect rendering on Normal GPU accuracy?”
And that’s exactly what we did.

A more accurate name for this change would be “a rewrite of the Buffer Cache Rewrite”, {{< gh-hovercard "10084" "perhaps rBCR for short?" >}} 
Essentially, Blinkhawk rewrote most of the old buffer cache changes that [Rodrigo](https://github.com/ReinUsesLisp) introduced [two years ago](https://yuzu-emu.org/entry/yuzu-bcr/), taking into account the new demands of recent games and the issues found with the original BCR.

Part of the work {{< gh-hovercard "10088" "also involves:" >}}

- Allowing the verification of fencing and writing of asynchronous downloads in a separate thread
- Restructuring how accuracy is managed by skipping host-guest fence synchronization and not downloading on host conditional rendering for normal GPU accuracy
- Improving consistency for `Query Cache` asynchronous downloads

The results are amazing. Most games that used to need High GPU accuracy to render correctly can now run on Normal with no issues.
Additionally, all this wizardry reduces bandwidth usage and boosts performance up to 87% for everyone (50% on average), from the low-end APUs to the high-end beasts.

Here’s an incomplete list of changes:

- As noted previously, many games which required High GPU accuracy to be visually accurate now work with Normal GPU accuracy with minimal sacrifice.
- Particles and character lighting/shading in `Pokémon Sword & Shield` have been fixed on Normal GPU accuracy. Performance has improved by up to 40% on Normal GPU accuracy.
- Models (the BowWow, for example) and particle rendering are fixed on Normal GPU accuracy in `The Legend of Zelda: Link's Awakening`. Performance on Normal accuracy, with correct rendering, is now up to 70% higher than before.
- Lighting in `Diablo II: Resurrected` has been fixed and will no longer flicker.
- Lighting and shadows in `Luigi's Mansion 3` will no longer randomly flicker.
- Pokémon photograph detection and data of `New Pokémon Snap` has been fixed on Normal GPU accuracy. This results in up to a 50% increase in performance with working photograph detection.
- `Kirby and the Forgotten Land` vertex explosions, lighting, and particles have been fixed on Normal GPU accuracy. This results in an up to 40% performance increase, with accurate rendering on Normal accuracy.
- Red lights in some machines in `Xenoblade Chronicles 2` have been fixed.
- `Fire Emblem Warriors` has been accurately fixed and no longer requires a workaround.
- `MONSTER HUNTER RISE` now accurately renders on Normal GPU accuracy, resulting in an up to 50% performance increase (note, however, that updates after 3.0.0 still have issues and require more work).
- Vertex explosions in `Persona 5 Royal` no longer occur with Normal GPU accuracy, resulting in an up to 30% increase in performance.
- `Atelier Ryza` series games now render correctly.
- The pessimistic flushes option in advanced graphics settings is no longer needed in any of the affected games it benefitted and we have now removed it.
- `Mortal Kombat 11` no longer has any vertex explosions.
- `NieR:Automata The End of YoRHa Edition` now renders correctly.
- `Bayonetta 3` no longer requires High GPU accuracy to render correctly.
- `Splatoon 2`’s ink physics work correctly on AMD GPUs while using High GPU accuracy.
- Particles in `The Legend of Zelda: Breath of the Wild` have been fixed, resulting in 40% higher performance and accurate rendering on Normal GPU accuracy.
- Tree flickering in `The Legend of Zelda: Breath of the Wild` has been fixed on all GPU accuracy options.
- And much, much more!
 
No option needs to be enabled to take advantage of all of this, just switch GPU accuracy to Normal if you haven’t already. What are you waiting for?

Here are some stats of some of the most popular games. 
We compared High GPU accuracy in Mainline 1407, and Normal GPU accuracy in Mainline 1421. 
All tests are done at 2X resolution scaling, and using mods to disable dynamic resolution when possible.

{{< imgs
	"./yfc1.png| Hardware makers cry over this kind of free performance boost"
  >}}

And then we have these four, the high FPS squad. They're reason enough to consider asking the modding community to start releasing 240 FPS mods!

{{< imgs
	"./yfc2.png| When you gotta go so fast on a previous generation CPU that a second graph is required"
  >}}

Expect even higher numbers with a Zen 4 3D V-cache chip.
For example, in the same testing spot of `Breath of the Wild`, a non-3D 7900X gets 90 FPS.

{{< imgs
	"./bsod.png| Your writer’s PC is feeling like a snail compared to the current monsters on sale…"
  >}}

## Other graphical changes

[Citra](https://github.com/citra-emu/citra)-legend [GPUCode](https://github.com/GPUCode) stepped up to give us a hand with presentation. Presentation is the final step of most graphics code — the process of getting the output to the screen.

GPUCode's work {{< gh-hovercard "9973" "moves swapchain operations" >}} to a separate thread in order to avoid stalling the main GPU thread. This improves performance in more demanding titles and on low-end hardware, and can make the difference between barely getting 60 and getting a smooth 60 frames per second in many cases.

However, it can also make the frametimes less consistent, therefore we've turned it off by default to allow for further testing. We need to determine which systems and games benefit the most.
For those interested in trying it, the toggle is available in `Emulation > Configure… > Graphics > Advanced > Enable asynchronous presentation (Vulkan only)`.

{{< imgs
	"./async.png| Share your experience with us!"
  >}}

[vonchenplus](https://github.com/vonchenplus) continues to work on making the {{< gh-hovercard "10008" "code match the information NVIDIA has made public" >}} in their latest documentation.

You may remember [Wollnashorn](https://github.com/Wollnashorn) from their role in [overhauling the Vulkan pipeline cache](https://yuzu-emu.org/entry/yuzu-progress-report-jan-2023/#new-challenger-approaching).
Now, Wollnashorn presents us with a technique to bypass hardware limitations in order to make `The Legend of Zelda: Breath of the Wild` render accurately on non-NVIDIA hardware.

Object edges, especially grass blades, had distinct black borders on AMD and Intel GPUs.
The issue occurred regardless of the driver in use, so it was clearly a hardware limitation, and an incompatibility with what the game expects.
`The Legend of Zelda: Breath of the Wild` uses a technique called deferred rendering–in this particular case, shadows render at half the resolution.
Four pixels of the full resolution depth texture are sampled simultaneously with a [textureGather](https://registry.khronos.org/OpenGL-Refpages/gl4/html/textureGather.xhtml) call.
`textureGather` has the characteristic of working with normalized floating-point coordinates for the texture, so each fragment is always at the boundary of the four selected pixels.

{{< imgs
	"./gather.png| The four special pixels"
  >}}

Now, `textureGather` uses floating-point, and each GPU design will have a different rounding precision.
Additionally, thanks to a [blogspot by Nathan Reed](https://www.reedbeta.com/blog/texture-gathers-and-coordinate-precision/), we know the integer coordinates of the pixel on the texture are calculated by the GPU after a conversion from a floating-point number to a fixed-point number.

With floating point conversions involved, you may be able to tell where this is going.
If the user’s GPU is not using the same rounding precision as the Nintendo Switch, different pixels can be sampled. Ergo, only NVIDIA GPUs got the four correct pixels the game intended.

How did Wollnashorn solve this? With a {{< gh-hovercard "10030" "clever little trick," >}} of course.
Adding a very tiny (1/512) subpixel offset to the sample coordinates is sufficient to fudge the rounding.
Achieving that required modifying the code of the SPIR-V and GLSL backends, altering how the operation is handled only for AMD and Intel hardware for now, with the option to force it for any other future hardware that may require it, for example, a certain fruit company.

Here’s the final result:

{{< single-title-imgs-compare
	"Funny how we end up sharing the same problems Cemu faced (The Legend of Zelda: Breath of the Wild)"
	"./botwbug.png"
	"./botwfix.png"
>}}

Something we have to mention is that this doesn’t fix a very similar-looking black line issue present when using `anisotropic filtering` values higher than Default with AMD and Intel GPUs.
That’s a separate issue and we recommend Red and Blue Team users to at least set a per-game setting for `The Legend of Zelda: Breath of the Wild` to set it to Default only.
The game doesn’t benefit from higher values anyway, since its terrain textures don’t seem to take advantage of it.

{{< single-title-imgs-compare
	"That’s a clean look all around (The Legend of Zelda: Breath of the Wild)"
	"./afbug.png"
	"./affix.png"
>}}

Linux got its well deserved share of love too thanks to [byte[]](https://github.com/liamwhite).

First up, he fixed up {{< gh-hovercard "10051" "initialization of the Vulkan swapchain on Wayland," >}} helping Linux NVIDIA users to be able to launch their games.
As some of you may know, NVIDIA was historically very stubborn about their support of Wayland, and it doesn’t help that most Wayland compositors are very stubborn on their own too.
The year of the Linux desktop, always around the corner…

Second, he fixed a crash that happened to Flatpak users trying to play `Bayonetta 3`.
An {{< gh-hovercard "10069" "out-of-bounds" >}} could occur in an array access intended for size estimations, leading to “nasty stuff”.
A small adjustment, and the issue is no more. Nice pull request number there.

Speaking of out-of-bounds, [Maide](https://github.com/Kelebek1) found an interesting case happening in corner sampling due to a previously added offset.
Not accounting for this offset caused another out-of-bounds situation during {{< gh-hovercard "10074" "2D texture blitting." >}}

Fixing this special case solved the depth-of-field rendering issues in `Kirby Star Allies`.

{{< single-title-imgs-compare
	"Poyo! (Kirby Star Allies)"
	"./kirbybug.png"
	"./kirbyfix.png"
>}}

Still on fire, and with more work to come, Blinkhawk hasn’t stopped.
For something light, he decided to refactor a big part of [Accelerate DMA](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2023/#project-yfc-175) to do {{< gh-hovercard "10082" "texture downloads" >}} through the texture cache instead.
The result is a return to the performance `Pokémon Sword & Shield` and `Hyrule Warriors: Age of Calamity` had before the old Y.F.C 1.75 changes.
Add up the gains from Y.F.C 1.90, and you have a winner for low-end systems!

We have many more changes Blinkhawk implemented, but they didn’t make it in time for the deadline for the progress report, so we will be mentioning them next month.

## General changes and settings glossary

The modding community requested us to allow for larger texture mods. The old 6GB limit was not enough, so byte[] {{< gh-hovercard "10035" "expanded it to support a custom 8GB arrangement" >}} instead, giving almost all of it to the emulated program.

However, this had unforeseen consequences.
 
We discovered that users like to enable settings without knowing what they do. 
Shocking, right?

Having a much higher amount of memory available than the normal development console would has caused problems. For example, after getting several reports of Pokémon failing to respawn in `Pokémon Scarlet & Violet` after playing the game for a few minutes, we narrowed the changes down to users with this setting enabled.

However, this option is **only meant** for very large texture mods, and should not be enabled unless you are using such a mod.
Unfortunately, it was on the first page of the yuzu settings when opening it, so it was a very visible setting.
Additionally, we found some YouTube tutorials which incorrectly suggested it may improve performance and stability, and users followed that.
This would have resulted in 4GB of extra RAM wasted for no benefit, and potentially caused issues in games.

To try to prevent this, we recommend reading our new [settings glossary](https://community.citra-emu.org/t/settings-glossary/768483), which together with our [recommended settings](https://community.citra-emu.org/t/recommended-settings/319349) page, should help people understand what each setting does, and what’s recommended to change.

Moreover, to solve the problem for the users who don’t check our official channels, byte[] {{< gh-hovercard "10124" "moved the setting" >}} to the bottom of the `System` tab, and renamed it, ensuring that no previous configuration file will enable it again without user intervention.
If you have a real need for extended memory layout, make sure to manually enable it again.
Or don’t, we won’t judge you… too much.

{{< single-title-imgs-compare
	"You have been relegated to System settings"
	"./extendedbug.png"
	"./extendedfix.png"
>}}

Users reported that `IGS Classic Arcade Collection` wasn’t playable. 
vonchenplus investigated the cause and found the reason in our audio emulation.
Apparently the game doesn’t do a very good job implementing its audio code on the Switch, and fails to initialize a new audio output session, which should return an error.
Properly {{< gh-hovercard "10056" "returning this error as a result" >}} is enough to get the game working.

{{< imgs
	"./igs.png| Nothing beats the classics (IGS Classic Arcade Collection)"
  >}}

One of the options made available to our [LDN](https://yuzu-emu.org/entry/ldn-is-here/) users is the ability to [create private rooms](https://yuzu-emu.org/help/feature/multiplayer/), providing hosts with several options to configure their servers as they want.

[twitchax](https://github.com/twitchax) knows that for certain server hosts, such as `fly.io`, a {{< gh-hovercard "10068" "custom bind address" >}} is needed.
They implemented the functionality and now users can pass the `--bind-address` argument to the room’s configuration.
Thanks!

Continuing his work on {{< gh-hovercard "10086" "improving CPU timing accuracy," >}} [Morph](https://github.com/Morph1984) fixed confusion between the raw CPU frequency and `Counter-timer Frequency`, or CNTFRQ.
The difference between the two is that CNTFRQ reports the frequency of the system clock, instead of the CPU frequency.
While fixing this, he also reduced the time it takes to measure timing information by about 60%.

What does this mean for the user?
A sweet 1-7% performance boost.

## Input changes

Also known as [german77](https://github.com/german77)’s section.

How you interact with a game might just be more important than even graphics or audio. After all, it’s what differentiates it from a CG animated movie. 
As it is tradition by now, our dear Kraken has been working on further improving yuzu’s input emulation.

A big part of the work of writing an emulator involves reverse engineering, so he’s been working on making the NFC service match what the Switch does internally — in this case, implementing all the {{< gh-hovercard "10053" "remaining missing interfaces," >}} putting them on the same level as what the real console does.

This next change is a simple revelation that came from the work done on TAS.
If you implement a {{< gh-hovercard "10060" "virtual controller," >}} it won’t need range and dead zone settings as it will be *virtually* perfect (sorry, not sorry).

But not all work was done by german77, [v1993](https://github.com/v1993) caught a little nasty bug that slipped by.
Motion emulation with mouse movement is handled by a 3D vector (x, y, z). Yes, surprise math lesson, deal with it.
Anyway, yuzu was doing this:

(x, y, z) = (x, y, z) + (1, 2, z)

Which results in:

(x + 1, y + 2, 2z)

The z component was being doubled by mistake!

{{< gh-hovercard "10055" "The solution" >}} is to instead do:

(x, y, z) = (x, y, z) + (1, 2, 0)

Which gives us: 

(x + 1, y + 2, z)

And now all’s right with the world.
This should improve the quality of mouse motion, for those that prefer an FPS experience with a keyboard and mouse.
Or just like to torture themselves.

## Hardware section

A recurring problem users face when running modern emulators that utilize Vulkan is the lack of a way to get helpful feedback if the program crashes.
Vulkan is very picky. 
Any wrong step in the middle and it will refuse to start, and any Vulkan layer program can cause this. Anything from outdated screen recorders, to mod managers, performance overlays, and even the disaster code motherboard vendors call RGB software.
Of particular nasty interest is the Epic Game Store’s overlay, which is reported to cause severe performance issues.

To some extent, yuzu can detect these problems and switch to OpenGL to avoid them, but that doesn’t tell the user where the problem is.
We recently found out about a cute little program the [RPCS3](https://github.com/RPCS3/rpcs3) community has been using for some time to diagnose these problems, [VkDiag](https://github.com/13xforever/vkdiag). 
You can find its latest version [here](https://github.com/13xforever/vkdiag/releases).

What this program does is list all relevant components and layers affecting Vulkan rendering and warn about potential problems in any of them.

{{< single-title-imgs
    "It's already been combat tested, both outdated drivers and broken layers are in its sights"
    "./vkdiag1.png"
    "./vkdiag2.png"
    >}}

We have started using it in our support channels with amazing success, and we recommend self-serving users to keep it in their toolkit. You never know when that OBS install you forgot to update can cause you problems, or when that RGB software decides to go rogue.

### NVIDIA, enjoying Auto HDR

Here’s some great news for Windows 11 users rocking HDR displays.
Some time ago, GitHub user [svonolfen](https://github.com/svonolfen) in our issue tracker found an interesting way to make Auto HDR work with NVIDIA GPUs. [Here’s the link](https://github.com/yuzu-emu/yuzu/issues/9221#issuecomment-1493392941). By renaming yuzu to "Cemu" and performing additional steps, Auto HDR is suddenly functional.

{{< imgs
	"./hdr.png| Don’t mind the Spanish"
  >}}

Cemu gets privileges, indeed.
This is only available for NVIDIA Windows drivers because, at least for now, only the NVIDIA Control Panel offers the option to force a DXGI swapchain — effectively making the Vulkan program present to screen as a Direct3D one.
This has a few benefits: Auto HDR works, improving dynamic range considerably, borderless optimizations are applied to yuzu, improving input lag and frame synchronization, and the G-Sync/Freesync issue is solved.
It has a downside worth mentioning, it can be up to 5% slower than regular Vulkan presentation.

{{< imgs
	"./dxgi.png| Don’t forget to set up your NVIDIA control panel accordingly!"
  >}}

While this fun renaming works fine, we also heard from Windows Insider users that future versions of the Xbox Game Bar application will allow yuzu to work with Auto HDR without doing any renaming. 
This will most likely require newer NVIDIA drivers to work.

If you own an HDR-compatible monitor and want to compare the results, here’s a .jxr [HDR capture](https://github.com/goldenx86/yuzu-emu.github.io/blob/apr23/site/content/entry/yuzu-progress-report-apr-2023/hdr.jxr) that the default Windows 11 photo viewer can open, and a comparable .png native [SDR capture](https://github.com/goldenx86/yuzu-emu.github.io/blob/apr23/site/content/entry/yuzu-progress-report-apr-2023/sdr.png).
You will of course need HDR output enabled in both your display’s and Windows 11 settings.
Notice the difference in the sky and lamps.
The tonemapping isn’t perfect, but we will never get Switch games outputting native HDR anyway.

Your writer’s simple HDR400 display with no dimming zones is enough to notice the benefits, so here’s your excuse to convince your parents/wife to buy that OLED monitor you’ve been eyeing for weeks. Zelda. In HDR.

A Vulkan extension can be implemented in yuzu to get global support for any GPU. 
You can be sure I’ll be nagging our GPU devs until it gets added.

### AMD, delivering on their promises

[Last month,](https://yuzu-emu.org/entry/yuzu-progress-report-mar-2023/#amd-2332-and-newer-drivers) we mentioned that AMD introduced a regression that caused graphical corruption and crashes with some games.

We’re happy to announce that since driver version 23.4.2 and later the issue is resolved for Vega and newer, allowing Radeon Windows users to fully benefit from the new Vulkan extensions supported by the latest drivers, reducing shader building stuttering to a minimum. 
Just as AMD promised, except...

Polaris (RX 400/500 series) cards may still be unstable under some rare cases, but a fix shouldn't take too long to appear. 
In the meantime, Polaris users should stick to driver [23.3.1](https://www.amd.com/en/support/kb/release-notes/rn-rad-win-23-3-1), unless they want to face results like this:

{{< imgs
	"./polaris.png| Your whole desktop looks like this"
  >}}

On another topic, we started talks with AMD to investigate the cause of the Pentelas Region vertex explosions in `Xenoblade Chronicles 3`, and also the initial regions in its new expansion, `Future Redeemed`.

{{< imgs
	"./pentelas.png| That’s the water performing the mother of all vertex explosions (Xenoblade Chronicles 3)"
  >}}

Since the issue affects both the official AMD and Mesa drivers indiscriminately, we suspect it’s a hardware limitation — possibly the lack of support for D24 depth formats, which many games utilize (Xenoblade games included), and both NVIDIA and Intel support.

{{< imgs
	"./d24.png| That’s what a hardware limitation looks like"
  >}}

### Intel…

As we’ve been previously reporting, [Intel Windows Vulkan drivers are unstable](https://github.com/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/159).
The SPIR-V compiler (the part that handles Vulkan pipeline shaders) can crash working on compute shaders and some specific shader instructions.

We found a case where the driver crashes when compiling a shader with more than 5 cases in a switch block, or more than 5 if-else blocks of the same condition. 
Maybe an optimization gone wrong?

{{< imgs
	"./case.png| If you uncomment out the last two cases, the driver crashes"
  >}}

We reported the crash to Intel six months ago, and their reply this month was:

> Thank you for reporting this issue. Our priority is to target the most popular games and apps to focus our efforts on providing a high quality, stable experience for the broadest set of users. We will continue to improve our software performance and compatibility throughout 2023 and beyond.

So even after waiting six months with a test case provided, the reason explained, and even after pointing out where in the driver the crash happens, Intel can’t find the time to fix the issue.
This is some kind of twisted joke.
For comparison, when you do this with NVIDIA, they *hire* you.

We’re left with no option but to mitigate the crashes as much as we can. 
To do so, Morph {{< gh-hovercard "10110" "disabled compute shaders" >}} entirely for Intel Windows drivers, ensuring games like `The Legend of Zelda: Breath of the Wild` can still boot ― even though they'll have gameplay issues as a result.

This isn’t enough to solve all crashes. Some games like `Xenoblade Chronicles 3` will still crash the shader compiler. We haven't diagnosed this yet, but believe that it's likely closely related to the same issue we have already reported.

Disabling compute shaders produces this lovely side effect on some games like `Super Smash Bros. Ultimate`:

{{< imgs
	"./smash.png| That’s what happens when we’re forced to remove an entire pipeline stage, Intel (Super Smash Bros. Ultimate)"
  >}}

For those that prefer proper rendering on Intel Windows drivers, can tolerate the random crashes, and don’t want to just use the actually working Linux Mesa drivers, [Mainline 1414](https://github.com/yuzu-emu/yuzu-mainline/releases/download/mainline-0-1414/yuzu-windows-msvc-20230429-3aaa245f7.7z) is currently the last version with support for compute shaders.
We’re working to add a toggle that can be configured per game.

But wait, there’s more, the fun doesn’t stop there.
Reddit user [r4mbazamba](https://www.reddit.com/user/r4mbazamba/) discovered that Intel 12th and 13th Gen CPUs running on Windows 11 have noticeably worse frametimes than the same hardware running on Windows 10.

{{< imgs
	"./intel.png| What would EA say to this"
  >}}

So if you notice stutter while playing, the solution may be quite simple: perform a clean Windows 10 install!

## Future projects

So releasing `Project Y.F.C` in parts paid off.
Blinkhawk is working on the final part of it, which includes a restructuring of the GPU accuracy settings, and a few other surprises. 
Stay tuned.

You will also hear news about `Project Lime` *very soon!*

That’s all folks! Thank you for reading until the end, nothing makes us happier.

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
