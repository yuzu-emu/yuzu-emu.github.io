+++
date = "2021-11-09T12:00:00-03:00"
title = "Progress Report October 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Hey there, yuz-ers! We've had quite an exciting month. Our most anticipated and highly requested feature, Resolution Scaling, is finally out! But we didn't rest on our laurels, a host of other fixes were pushed this month and we can't wait to tell you all about them!

<!--more--> 

## PSA for NVIDIA users

Before delving further, we want to remind NVIDIA users that there are issues with the latest graphics drivers, specifically the 49X releases.

Past the last 472.XX drivers, NVIDIA removed support for Windows versions prior to 10 and the Kepler series of GPUs (mostly 600 and 700 series cards). 
Additionally, OpenGL GLSL and Vulkan rendering were affected, with GLSL becoming virtually unusable and Vulkan exhibiting minor glitches.

While NVIDIA works to resolve the issues, and we work on alternatives to mitigate the problems, we've configured
[NVIDIA GPUs on affected drivers to only use GLASM when OpenGL is selected](https://github.com/yuzu-emu/yuzu/pull/7243). This seems to workaround most of the GLSL errors we've been seeing on these latest drives.
Thanks to [toastUnlimited](https://github.com/lat9nq) for the quick update.

GLSL will still be available for version 472.XX and older drivers. 
If someone wishes to use GLSL on recent 49X series drivers, turn on `Enable Graphics Debugging` in `Emulation > Configure… > General > Debug`. 
Keep in mind this will reduce performance, as it is only intended for debugging.

With the PSA out of the way, let's get into the good stuff!

## Project A.R.T.


`Advanced Rendering Techniques` or was it `Aristotle’s Rescaling Technology`? I think there's another name I’m forgetting. Maybe [the Pull Request](https://github.com/yuzu-emu/yuzu/pull/7219) will have more information for those curious.

Anyway, `Project A.R.T.` is out in the wild! [Blinkhawk](https://github.com/FernandoS27), [BreadFish](https://github.com/breadfish64), [epicboy](https://github.com/ameerj), and 
[Rodrigo](https://github.com/reinuseslisp) are to thank for this incredible release.

As explained in its dedicated article [here](https://yuzu-emu.org/entry/yuzu-art/), this is a complete rewrite of our old resolution scaling implementation from 2019.
Before we jump into the end-user benefits, let's first cover some terminology.
The correct terms for the scaling process are `Upsampling` and `Supersampling`, which can also be more commonly called `Downsampling`.
In layman's terms, downsampling means taking a big frame and reducing its size to fit a smaller display. Downsampling is rendering the game at a higher resolution than your 
display’s native one.

In contrast, `upsampling` means taking a smaller frame and stretching it to fit a bigger display. 
It results in a lower quality image, but users with low-end GPUs, particularly users of integrated graphics, may prefer to have better framerates over image quality.

{{< imgs
	"./art.png|A work of art (read left to right)"
>}}

There seems to be a lot of confusion about this. Remember, improving the visual quality of the game is downsampling, not upsampling.
Games look their best when they have a 1:1 ratio between rendering and display resolution, or when downsampling.

With that out of the way, let’s get started.
All new options can be found in `Emulation > Configure… > Graphics`

{{< imgs
	"./options.png|yuzu Graphics configuration window "
>}}

Starting with `Resolution`, this option is the Scaling Multiplier being used. It will double the width and height of whatever resolution the game is rendering at.
At the moment, we offer two upsampling multipliers: `0.5X` and `0.75X`, and five downsampling multipliers: `2X`, `3X`, `4X`, `5X`, and `6X`.

Here's an example, `Super Mario Odyssey` displays a 1920x1080 frame in docked mode but actually renders at 1600x900, and at 1280x720 in undocked mode.
Applying a 2X resolution to Super Mario Odyssey gives us a rendering resolution of 3200x1800 in docked mode and 2560x1440 in undocked mode. 
3X would give us 4800x2700 and 3840x2160 respectively, 0.5X would be 800x450 and 640x360, and so on.
Keep in mind that games can reduce graphical details in undocked mode, not only their resolution.

With high resolutions comes increased texture sizes. This has a significant impact on both video memory (VRAM) and other available graphical resources, like memory bandwidth. 
The user must consider the available VRAM and the performance of the GPU they are using when deciding which resolution multiplier to use. 
For integrated GPU users, RAM overclocking becomes critical, as faster RAM means faster “VRAM” for your iGPU.

If the GPU runs out of VRAM faster than the emulator or graphics driver can manage resources, yuzu will close, so follow our recommended values in the picture below.

{{< imgs
	"./vram.png|We recommend 2GB and lower users to use 1X on graphic intensive games"
>}}

Small, low-end GPUs (like our recommended GT 1030, RX 550, or any integrated GPU) will see considerable performance benefits when upsampling as the reduction in 3D load and the 
lower VRAM utilization will provide higher framerates.

People with current mid to high-end GPUs can benefit from the surplus of computational capabilities and available VRAM. 
Actual performance will be determined by each specific game, but it’s safe to assume that good hardware can use a 2X or 3X multiplier with little issue most of the time.
We personally don’t recommend going higher than 3X as not even the best consumer hardware available at this moment can provide a perfect experience when rendering at very high 
resolutions, but the options are there to experiment with. 

Light or very well optimized games like `Super Smash Bros. Ultimate` and `Metroid Dread` can make for great experiences on 4K or 8K displays.
On the other hand, particular games like `Astral Chain` should not be downsampled, as they already use 3840x2160 textures. 
Trying high resolution multipliers with games like this will result in your GPU's VRAM not being very happy.

We strongly recommend using Vulkan for downsampling as VRAM use will be considerably lower as compared to OpenGL.

Let’s move on to the second option, `Window Adapting Filter`.

When using a display with a different native resolution than your rendering resolution, you need some way of deciding which pixels will be shown in the final image. Filters are used for that!

Currently, yuzu offers 6 filtering options, each recommended for different scenarios, and with different performance costs. We plan to expand this section in the future, 
adding sliders to let users customize the filters to their own tastes.
And yes, on GPU limited scenarios, the filter in use can affect framerate.

{{< imgs
	"./filters.png|Tested on Mario Kart 8 Deluxe, filtering ain't free!"
>}}

While an integrated GPU will suffer the performance cost, even a low-end dedicated card will handle the increased computational load with ease.

Here are some recommendations and comparisons of all current options against the default bilinear filter.

`Nearest Neighbor` is ideal for pixel art style games like `UNDERTALE` or `OCTOPATH TRAVELER`, it can also provide the best results when the game’s rendering resolution 
matches the window or display’s resolution. It and `Bilinear` have the lowest performance cost of all the options.

{{< single-title-imgs-compare
	"OCTOPATH TRAVELER (Bilinear Vs. Nearest Neighbour)"
	"./otbilinear.png"
	"./otnearest.png"
>}}

`Bilinear` is our combat tested default option. It's very good for downsampling and like `Nearest Neighbor`, it has almost no performance cost. It’s a great all-rounder.
If you have a 1080p display, we recommend `Bilinear` with a 2X resolution multiplier.

`Bicubic` can produce better downsampling results than `Bilinear`, but at a slightly higher performance cost. We recommend it for 2X or 3X multipliers on 1080p displays.

{{< single-title-imgs-compare
	"The Legend of Zelda: Breath of the Wild (Bilinear Vs. Bicubic)"
	"./botwbilinear.png"
	"./botwbicubic.png"
>}}

`Gaussian` is intended for extreme cases, like when the user wants to test a very high multiplier. It also has a high performance cost. 
When very high values are used, the image can, ironically, start to become pixelated again. The gaussian blur produced by this filter will help provide a more pleasant image. 
Recommended for 4X to 6X multipliers on 1080p displays.

{{< single-title-imgs-compare
	"Metroid Dread (Bilinear Vs. Gaussian)"
	"./dreadbilinear.png"
	"./dreadgaussian.png"
>}}

`Scaleforce` was invented by BreadFish. It is a great downsampling filter for 3D games and a fine upsampling filter for 2D games, while also only requiring a moderate performance 
cost. A true jack of all trades.

{{< single-title-imgs-compare
	"OCTOPATH TRAVELER (Bilinear Vs. Scaleforce)"
	"./otbilinear.png"
	"./otscaleforce.png"
>}}

`AMD Fidelity FX™ Super Resolution`, or FSR for short, is [in AMD’s own words](https://github.com/GPUOpen-Effects/FidelityFX-FSR) “...an open source, high-quality solution 
for producing high resolution frames from lower resolution inputs.”

This means that it is particularly useful for low-end users trying to restore some of the missing details lost when upsampling a game to gain performance. 
It is NOT recommended for downsampling, as the output resolution is used as part of the process. A perfect pick for people forced to run 0.5X or 0.75X multipliers for performance reasons.

{{< single-title-imgs-compare
	"Super Mario Odyssey (1X Bilinear Vs. 0.75X FSR)"
	"./smo1xbilinear.png"
	"./smo075xfsr.png"
>}}


If the user tries FSR while downsampling, they ***will be reducing image quality*** and will end up only seeing the sharpening aspect of the filter, negating any advantage of 
increasing the rendering resolution while incurring the full performance cost of it.

{{< single-title-imgs-compare
	"The Legend of Zelda: Link's Awakening (2X Bilinear Vs. 2X FSR on a 1080p display)"
	"./zlabilinearbad.png"
	"./zlafsrbad.png"
>}}

So, in short, if the rendering resolution is *higher* than the display’s resolution, FSR should be avoided.
If the rendering resolution is *equal or lower* than the display’s resolution, FSR is an excellent shader-based filtering option, but with the highest performance cost on the 
list.

As a way to cheat around this limitation, AMD and NVIDIA Windows users can fake higher display resolutions with the use of 
[Virtual Super Resolution](https://www.amd.com/en/support/kb/faq/dh2-010) and [Dynamic Super Resolution](https://www.nvidia.com/en-us/geforce/technologies/dsr/technology/) 
respectively.
This way, for example, a 1080p display can fake a 2160p (4K) maximum resolution, giving FSR a lot more information to play with.

{{< single-title-imgs-compare
	"The Legend of Zelda: Link's Awakening (2X Bilinear Vs. 2X FSR on a 4K display)"
	"./zlabilineargood.png"
	"./zlafsrgood.png"
>}}

Finally our current last option, `Anti-Aliasing Method`. 
Pixels are almost squares and squares aren't great for displaying curves. Anti-aliasing methods are used to smooth out this undesired effect.
At the moment we only offer [FXAA](https://en.wikipedia.org/wiki/Fast_approximate_anti-aliasing), which can help reduce the excessive sharpening shown when using FSR.
In the near future, we plan to add more options like [MLAA/SMAA](https://en.wikipedia.org/wiki/Morphological_antialiasing)

{{< single-title-imgs-compare
	"Luigi's Mansion 3 (FSR Vs. FSR + FXAA, both on a 4K display)"
	"./lm3fsr.png"
	"./lm3fxaa.png"
>}}

Both the filters and anti-aliasing options can be changed while in-game using the buttons on the bottom left of yuzu’s window. 
Changing the resolution multiplier in-game is not possible at the moment.

As an additional note, `A.R.T.` also reimplements our `Anisotropic Filtering`!
This option can be accessed from the Advanced tab in the graphics settings.
In the past we recommended skipping this option as not all games are particularly fond of forcing values higher than they specified, but this new implementation is smarter, 
avoiding previous drawbacks.

At a low performance cost, it will increase the quality of textures at oblique angles, particularly ground textures, most noticeable in first and third person view games.
It should now be safe to set at 16x and forget about it.

{{< single-title-imgs-compare
	"Pokémon Sword (default Vs. 16X Anisotropic Filtering)"
	"./pksw1x.png"
	"./pksw16x.png"
>}}

One last note, AMD users should ensure that [Radeon Image Sharpening](https://www.youtube.com/watch?v=wTh_O9BZlGc) is disabled before using the scaler, as it can affect the 
quality of some filters, especially FSR which includes its own sharpening already.

At the time of writing this article, `Resolution Scaling` remains in [Early Access](https://yuzu-emu.org/help/early-access/) for testing and regression finding, but be sure that it won’t take long to be merged into [Mainline](https://yuzu-emu.org/downloads/).
Check the progress in the pull request previously listed, code review is usually the main reason for delays on merging.

## Graphical and general bugfixes

`Metroid Dread` has been a very important release both for the series and for the console, giving us the first main entry for the series in years.

This game is heavily optimized and well polished all around, part of that is thanks to using very clever tricks to render. 
Dread doesn’t shy away from using pre-rendered videos for backgrounds, displays, manuals, and the intro menu.
Such videos were using an [unsupported frame format, `RGBX8`](https://github.com/yuzu-emu/yuzu/pull/7138), which epicboy implemented.

{{< single-title-imgs
	"There's no need to introduce more dread into this game (Metroid Dread)"
	"dreadbug.png"
	"dreadfix.png"
>}}

While this solves the rendering of a single video on screen, some areas of the game can play multiple streams simultaneously, causing glitches on screen.
yuzu’s decoding needs to be improved to handle those cases, something we’re still working on.

While Blinkhawk was working on `Project A.R.T`, he also [doubled the counter of cached pages in the rasterizer](https://github.com/yuzu-emu/yuzu/pull/7127).

yuzu uses these counters to keep track of the number of GPU objects stored in a cache within a CPU page.
Previously, this counter would account for pages whose addresses were up to a size of 38 bits.
Some games, however, can use memory addresses of up to 39 bits.

By doubling the counter, the rasterizer can effectively keep track of these addresses now, allowing certain games that did not work with the old counter to boot, such as 
`Final Fantasy X`.

{{< imgs
	"./ffx.png|Listen to my story, the story of the worst laugh ever recorded (FINAL FANTASY X/X-2 HD Remaster)"
>}}

epicboy investigated the graphical issues present in `Mario Party Superstars`.
Following the lead from this initial research, Blinkhawk found the problem and submitted a patch that 
[improves the performance of the backtracking algorithm](https://github.com/yuzu-emu/yuzu/pull/7262) used by the shader cache to find the handlers of a bindless texture.

{{< single-title-imgs
	"Old school minigames are the best (Mario Party Superstars)"
	"mpsbug.png"
	"mpsfix.png"
>}}

yuzu’s window can be freely resized, but users may want some presets to return things to accurate 16:9 proportions.
In the past we offered 720p and 1080p options, but now epicboy [adds a 900p option](https://github.com/yuzu-emu/yuzu/pull/7158), useful for both people with 1080p displays 
wanting some free space on their screen, and for getting a 1:1 ratio on 3D games that render natively at 1600x900.

{{< imgs
	"./size.png|A simple way to make good use of nearest neighbour"
>}}

Blinkhawk has been investigating an issue affecting `Catherine: Full Body`, `Hyrule Warriors: Definitive Edition`, and an unknown number of other games. 

NVN, the graphics API most Nintendo Switch games use, will skip [fences](https://www.khronos.org/registry/vulkan/specs/1.2-extensions/man/html/VkFence.html) (ways to 
synchronize rendering)  if a certain amount of time has passed. This is a sensical design choice on native hardware, where a long wait could mean a 
[TDR](https://en.wikipedia.org/wiki/Timeout_Detection_and_Recovery) from a malfunctioning game or faulty hardware.
In the emulator, on the other hand, long wait times can be caused by shaders being built, textures being downloaded or uploaded, background processes hogging the system, etc.

If those delays are not taken into consideration, games can experience graphical glitches and bad frame pacing. The solution is 
[forcing the GPU to wait](https://github.com/yuzu-emu/yuzu/pull/7187) until the system responds with all tasks finished.

{{< single-title-imgs
	"Almost a Nice Boat protagonist (Catherine: Full Body)"
	"catbug.png"
	"catfix.png"
>}}

[vonchenplus](https://github.com/vonchenplus) is back with more fixes! This time a couple of stubs helping in-game stability or rendering.

[Stubbing `IHOSBinderDriver::TransactParcel` and `GetBufferHistory`](https://github.com/yuzu-emu/yuzu/pull/7184) help to boot `Luigi’s Mansion 3`, which is notorious for 
refusing to load at random. 
While this helps mitigate the issues, they are not fully solved. It seems the small delay introduced by shader building can affect the stability of this game too. We 
need to investigate this issue further.

It’s time to add some love to `yuzu-cmd` again, our command line alternative to the default Qt-based yuzu. 
toastUnlimited added the option to [select the network interface to use](https://github.com/yuzu-emu/yuzu/pull/7148), providing LAN support to terminal-loving users.

Some videos in `Touhou Genso Wanderer -Lotus Labyrinth R-` and `Tsukihime -A piece of blue glass moon-` would render completely black.
[v1993](https://github.com/v1993) figured out the cause of the problem, which happened because the height of the video frame that needed to be decoded was smaller than the 
surface where it was supposed to be drawn upon.
In order to avoid writing outside of bounds, there is a check that ensures these two dimensions are equal, or it will not draw the frame.
v1993 changed this check to [allow the surface to be higher than frame](https://github.com/yuzu-emu/yuzu/pull/7152), so that videos with this issue can render their frames.

But this was a transient solution, as epicboy later addressed the problem by [implementing a general solution](https://github.com/yuzu-emu/yuzu/pull/7157) that uses the 
minimum between these two sizes when writing the decoded image into the GPU, while keeping the aforementioned check in place to ensure no out-of-bounds memory is compromised.

These changes affect all titles with size disparities, allowing them to render their videos even if the height of the frame and the surface differ by a couple of pixels.

{{< single-title-imgs
	"That piano really hits with nostalgia (Tsukihime -A piece of blue glass moon-)"
	"thbug.mp4"
	"thfix.mp4"
>}}

{{< single-title-imgs
	"Speaking of good music (Touhou Genso Wanderer -Lotus Labyrinth R-)"
	"gwbug.png"
	"gwfix.png"
>}}

epicboy also made changes to the SPIR-V emitter, so that 
[implicit LOD sampling behaves the same way as the hardware on all GPU drivers](https://github.com/yuzu-emu/yuzu/pull/7201) during non-fragment stages of the pipeline.

It is possible to specify how detailed things can appear on the screen based on the `LOD` (Level of Detail).
So, for example, objects further away from the camera will use lower-quality textures, saving computation power and also preventing other problems, such as 
[Moiré patterns](https://en.wikipedia.org/wiki/Moir%C3%A9_pattern).
The programmer is able to specify in the shader whether they sample from the original texture (level 0), or from these lower-quality textures (level 1, 2, 3..., etc.).
In case the `LOD` isn't specified in non-fragment stages of the pipeline (i.e. implicit LOD sampling), the LOD level is considered zero in the Nintendo Switch.
Since other GPU drivers don't necessarily behave this way, epicboy simply ensured that this always happens.

While this change doesn't necessarily translate as a performance or graphic improvement, it guarantees the code ran among different GPU vendors matches the behaviour of the 
console.

Morph updated the [dynarmic external dependency](https://github.com/yuzu-emu/yuzu/pull/7120) to use the CPU cache invalidation fixes submitted by Blinkhawk to 
[perform ranged invalidations when unmapping code memory](https://github.com/yuzu-emu/yuzu/pull/7173).

Memory usually gets invalidated when unloading from memory `NROs` (Nintendo Relocatable Object), which are dynamic libraries utilized by a variety of titles.
These changes should alleviate (but not completely solve) the crashes that occur when titles swap NROs in-and-out of memory, such as the case of `Super Smash Bros. Ultimate`.

Some games would crash if the user had a profile picture set in yuzu.
[Narr](https://github.com/german77) discovered that this happened when the image's dimensions were greater than `256x256`.
To avoid the crash, he made it so that [yuzu now resizes big profile pictures](https://github.com/yuzu-emu/yuzu/pull/7246) to fit the allowed dimensions instead.

On Linux, opening the Configuration Window and pressing the `OK` button would lead consistently to a crash.
[MightyCreak](https://github.com/MightyCreak) found the cause of this problem and submitted a patch to [solve it](https://github.com/yuzu-emu/yuzu/pull/7186).

Another linux-only crash would happen when inputting text on `The Legend of Zelda: Breath of the Wild`.
Morph investigated the problem and found it was caused by an out-of-bounds access in the string buffer, so 
[he added the necessary checks](https://github.com/yuzu-emu/yuzu/pull/7172) to prevent it.

## UI changes

On the way to achieve better high DPI support, [Morph](https://github.com/Morph1984) [updated the version of Qt](https://github.com/yuzu-emu/yuzu/pull/7122) used by yuzu.
This will allow in the near future to finally have legible UI elements on high DPI settings.

MightyCreak has arrived with several internal changes, most helping with the build process of yuzu.
One of them is [enabling mouse cursor auto-hide by default](https://github.com/yuzu-emu/yuzu/pull/7174), a very welcome quality of life change, especially now that more users 
will be playing their games in fullscreen.
Thanks!

Linux gamepad users will no longer have to periodically tap their mouse to avoid the screensaver from taking over their screens! 
toastUnlimited [properly disabled the screensaver while running yuzu](https://github.com/yuzu-emu/yuzu/pull/6702).

[Moonlacer](https://github.com/Moonlacer) continues polishing the text strings in the UI, this time helping new users 
[understand what our `NVDEC` (video decoding) options do](https://github.com/yuzu-emu/yuzu/pull/7165).

Some users tend to think that NVDEC means that video decoding will only work on NVIDIA GPUs, this is not the case.
NVDEC is the name of the module in the Nintendo Switch, which uses the Tegra X1, an NVIDIA SoC (System on a Chip).
This SoC uses the NVDEC module to decode videos, and the work yuzu has to do is emulate it to work on any compatible system, including systems without NVIDIA GPUs on them. 
We have a full explanation [here](https://yuzu-emu.org/entry/yuzu-nvdec-emulation/).

So, for the sake of clarity, the options were renamed to better convey the intended result:

- `No Video Output` will result in a black screen every time a video wants to render, nothing is displayed, no fun.
- `CPU Video Decoding` means processing videos using the CPU. This can be useful for AMD Windows users, since the AMD driver is notorious for having bad VP9 video decoding 
performance on Vega and newer GPU series, and using the CPU to render could be both faster and more accurate.
- `GPU Video Decoding` means actually using the GPU's decoding capabilities to process videos. This is considerably faster than CPU decoding and is the default option. If a video 
format is not compatible with the user’s GPU, yuzu’s NVDEC emulation will automatically fallback to CPU decoding.

For some time, we were wondering why the Switch had an open spot in its language selection.
Turns out, with the release of `Mario Party Superstars`, Nintendo added support for Brazilian Portuguese!
Morph [rushed to add support for it in yuzu](https://github.com/yuzu-emu/yuzu/pull/7244).
Our game language selection menu can be found at `Emulation > Configure… > System > System > Language`.
Jogo bonito on your gameplay sessions!

The text on the TAS configuration window looked cramped, so [Behunin](https://github.com/behunin) edited the 
[UI file and reformatted the text](https://github.com/yuzu-emu/yuzu/pull/7147) to make it easier to read.
Later, [Moonlacer](https://github.com/Moonlacer) added to these changes by [fixing some grammar nits and adding a hyperlink](https://github.com/yuzu-emu/yuzu/pull/7197) that 
links to the guide on our site.

{{< single-title-imgs
	" "
	"tasbug.png"
	"tasfix.png"
>}}

Moonlacer also [fixed a problem with the per-game configuration window](https://github.com/yuzu-emu/yuzu/pull/7223), where scaling the monitor over 100% would squash the 
window.

{{< single-title-imgs
	" "
	"csbug.png"
	"csfix.png"
>}}

## Input changes

When [german77](https://github.com/yuzu-emu/yuzu/pull/7142) added 
[auto-centering support all the way back in July](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2021/#input-changes), the range of the new center wasn’t considered, 
making the analog sticks overpass 100% in a direction while failing to reach it in the opposite way.
[Scaling the value of the range depending on the offset applied when centering](https://github.com/yuzu-emu/yuzu/pull/7142) solves this issue.

## Future projects

With the resolution scaler finished, our GPU devs have space to breathe, and they can focus back on work that was reserved for later.
`Project Y.F.C` is an example.
In Blinkhawk’s words, “there'll be Chicken Nuggets for everyone soon, a.k.a. it will cover many different things.”

{{< imgs
	"./wol.png|Lifelight intensifies (Super Smash Bros. Ultimate)"
>}}

`Project Gaia` is advancing very well, and `Project Kraken` (our Input Rewrite) [is out](https://github.com/yuzu-emu/yuzu/pull/7255) but didn’t make it in time for this progress report. Don't worry, we 
will discuss it next time!

That’s all folks! Thank you so much for your attention and see you next month!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
