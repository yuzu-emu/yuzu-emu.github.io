+++
date = "2021-08-09T12:00:00-03:00"
title = "Progress Report July 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Bienvenidos yuz-ers, to our latest monthly progress report! We have a *lot* to talk about this month, so buckle up, ‘cause this will be one good ride!

<!--more--> 

# Project Hades

[Kept you waiting huh.](https://www.youtube.com/watch?v=4Zq3OCrzn84)

{{< imgs
	"./hades.png| Why Hades? Well here's why!"
  >}}

After being in development for six months, and spanning almost 50,000 lines of new code, `Project Hades`, the codename decided for our 
[rewrite of the shader decompiler](https://github.com/yuzu-emu/yuzu/pull/6585) that has been worked on by [Rodrigo,](https://github.com/ReinUsesLisp) 
[Blinkhawk,](https://github.com/FernandoS27) and [epicboy.](https://github.com/ameerj) has been finally released.

Fixing an innumerable amount of rendering bugs, reducing shader build times, improving compatibility, and increasing performance over 30% for all GPU vendors, this is easily 
one of the biggest changes made to yuzu to date.

[We have a dedicated article explaining the process in technical detail,](https://yuzu-emu.org/entry/yuzu-hades/) so we will be focusing only on the end user changes and some 
recommendations to help you get the best experience of this new feature that both Early Access and Mainline users can enjoy.

While we keep OpenGL as the default API for compatibility reasons (outdated drivers won’t affect it as much, and it lets Nvidia Fermi GPU users run yuzu out of the box), we 
strongly recommend testing your games in Vulkan first, as not only performance and compatibility have improved greatly (specially if you pair it with the Texture Reaper, 
[the GPU Cache Garbage Collector,](https://yuzu-emu.org/entry/yuzu-progress-report-jun-2021/#project-texture-reaper)) but now rendering and shader build performance is most of 
the time better than OpenGL.
This applies not only for AMD and Intel GPU users, but also for Nvidia users too. 

There is an exception to make, the Intel Linux Vulkan driver is not stable at the moment, we’re investigating the cause of the issue, so for now, Intel Linux users should 
stick to OpenGL.

{{< imgs
	"./perf.png| Integrated GPU users benefit the most from Hades"
  >}} 

Hades implements a `Pipeline Cache` for both Vulkan and OpenGL, meaning no matter which API you are using, all shaders are now stored and reused the next time the game is 
started, pretty much like the Shader Cache of OpenGL previously operated.
Needless to say, this means that all previous caches are no longer valid, and will be discarded if someone tries to use them.

The difference in terminology lies in the fact that now the whole [Graphics Pipeline](https://en.wikipedia.org/wiki/Graphics_pipeline) is stored, not just a specific set of 
Shader stages.
An important detail, the OpenGL pipeline cache is not transferable with the Vulkan pipeline cache and vice versa. 
You build two separate sets of shaders if you use both APIs.

Vulkan now also benefits from `parallel shader building`, meaning all CPU threads will be able to handle all upcoming shaders in a parallel fashion, instead of asynchronously, 
avoiding graphical issues and building faster.
The end result is the shortest build times of all API and shader backends options (more on this later).
So, on a fresh game with no previously built cache, more CPU threads will provide a smoother experience, with no imposed limit.
Someone test run `Super Smash Bros. Ultimate` on a big server, please!

{{< imgs
	"./vulkan.mp4| First time gameplay has never been smoother!"
  >}} 

All CPU threads minus one are in use for this task, the remaining free thread either handles shader saving to the pipeline cache, or continues the rendering process, depending 
on if all shaders have been dealt with at the moment.
This decision was made not only to improve performance, but also to improve overall system response times while building several shaders simultaneously, and to avoid certain 
“gaming” laptops from overheating the CPU while keeping all threads busy.

Note that this is a hardware design flaw by the laptop vendors, not an issue with the emulator. The product should provide enough cooling performance to keep its components 
cool enough even at full demand, not just for reaching advertised turbo clock speeds in short bursts.
(Writer note: basically, if you want good gaming performance and longevity, buy thicc laptops)

Now, not all games will perform or render the best in Vulkan, some will still prefer OpenGL instead. For the old API, we have some changes too.

{{< imgs
	"./backend.png| When selecting OpenGL, new options show up!"
  >}} 

We have introduced a new drop list option in the Graphics settings. 
Replacing the device selection of Vulkan when using OpenGL, `Shader backend` shows up, giving three different options to choose from.

Out of the box, yuzu uses [GLSL](https://en.wikipedia.org/wiki/OpenGL_Shading_Language), the default backend for OpenGL. 
On good performing OpenGL GPU drivers (only Nvidia and the Linux Mesa drivers as of now), it has the best performance, but also takes the longest time to build shaders, 
resulting in noticeable stuttering when accessing new areas or performing new attacks.
This is the recommended option for Nvidia users with a previously built cache searching for the highest performance.
While it has its uses in some edge cases, we recommend Windows AMD and Intel users to run Vulkan instead.
Linux Mesa users don’t have this limitation and can enjoy GLSL without issues, thanks to far more mature drivers.

Next up is [GLASM](https://en.wikipedia.org/wiki/ARB_assembly_language), what in the past was called Assembly Shaders.
This is an Nvidia only feature, it provides lower performance than GLSL or Vulkan, but the second fastest shader build times, only behind Vulkan’s parallel shaders.
We recommend Nvidia users interested in using OpenGL to first run games in GLASM in order to build their pipeline cache, and once done, move to GLSL to get the best performance 
without suffering the shader stuttering associated with GLSL.
Any other GPU vendor will skip GLASM and default to GLSL.

Finally, [SPIR-V](https://en.wikipedia.org/wiki/Standard_Portable_Intermediate_Representation), the default backend of Vulkan, which is a valid option in OpenGL since the 
release of version 4.6.
Originally, we wanted OpenGL to use this backend, discontinuing support for GLSL.

Reality always hits back like the laws of thermodynamics, delaying the release of Hades for several months.
Driver support for SPIR-V in Windows is very bad (specially for Nvidia), with only the Linux Mesa drivers having a correct and fast implementation.
So we decided to keep the option as an experimental feature, focusing on the old GLSL and GLASM backed first. We plan to improve SPIR-V rendering and performance later.
Ideally, SPIR-V in OpenGL should be a Jack of all trades, a mix of the performance of GLSL and the shader build times of GLASM.

So to ease our user’s decision on what to choose, here’s a chart of all possible options for the most common GPU vendors.

{{< imgs
	"./best.png| "
  >}} 

Another important change is in how GPU accuracy operates. 
In the past certain games like `Pokémon Sword & Shield` preferred using High GPU accuracy to get the best performance.
This is no longer the case, now Normal consistently provides the best performance, at a low cost in accuracy, while High provides better particle effects and lighting, at a 
low performance cost.

[We removed values](https://github.com/yuzu-emu/yuzu/pull/6575) that should be enabled by default from the bottom left action buttons of the user interface, like Asynchronous 
GPU shaders and Multicore, and in their place, now users can *switch* between Normal and High GPU accuracy while playing.
A fast and easy way to test what’s better for each game, GPU vendor, and API.

{{< imgs
	"./statusbar.png| Old (top) vs new (bottom)"
  >}} 

## Thank you, Captain Obv — er, I mean, Captain Vortex

Communication is vital for any project, and it is essential that we make our configuration options *even more explanatory* than they already are.

We want to thank our fellow developer [Vortex](https://github.com/CaptV0rt3x) for this marvellous change of 
[rewording the explanation of GLASM](https://github.com/yuzu-emu/yuzu/pull/6736), in order to elaborate that it is, effectively, a shorthand for `OpenGL Assembly Shaders`.

{{< imgs
	"./vortex.png| This is critical"
  >}} 

Fear not, my fellow yuzers, for we have the most serious and capable people doing only the best work for your comfort.
Rest assured that if a similar situation were to arise again in the future, Vortex will have your back.
I salute you, my dear friend, and pray that you may ennoble yuzu even further with your contributions one more time.

## Graphical fixes

epicboy has been very busy during the development of Hades, and after it was finished too.

World 1-5 of `Super Mario 3D World + Bowser's Fury` crashed during loading on AMD and Intel GPU equipped systems running Vulkan.
A depth image was being cleared as a regular colour image, while OpenGL is totally fine with this, Vulkan is more strict, leading to a crash.
[By only clearing valid colour images,](https://github.com/yuzu-emu/yuzu/pull/6635) the issue was solved.

{{< imgs
	"./sm3dw.png| Affected world in Super Mario 3D World + Bowser's Fury"
  >}} 

As a way to limit the maximum framerate a dynamic FPS game can run at, epicboy [implemented a multiplier based cap](https://github.com/yuzu-emu/yuzu/pull/6697).
So, for example, if a game natively runs at 30 FPS, but can be run without issues at 240 FPS, setting an FPS cap of 8x will limit the FPS unlimiter to that value. Ideal for 
high refresh displays!

To avoid confusion with the FPS unlimiter, the old Frame limit was [renamed to Speed limit.](https://github.com/yuzu-emu/yuzu/pull/6696)

{{< imgs
	"./fpscap.png| You can find the new options here"
  >}}

Since before the [release of the texture cache rewrite](https://yuzu-emu.org/entry/yuzu-tcr/) brought with it a regression that made taking screenshots no longer work. 
Turns out [a single directory separator was missing in the code,](https://github.com/yuzu-emu/yuzu/pull/6709).
Now screenshots will work by either pressing the `Ctrl + P` hotkey, or via selecting the `Tools > Capture Screenshot…` menu option.

epicboy also [enabled support for Vulkan screenshots](https://github.com/yuzu-emu/yuzu/pull/6720), solving an even older debt, from way back when 
[Vulkan was first implemented](https://yuzu-emu.org/entry/yuzu-vulkan/) two years ago. How time flies...

Finally, before being dragged against his will to work on Hades, epicboy was working on improving the performance of our compute shader accelerated ASTC decoder.
By reducing the size of the workgroup, making some code simplifications, moving some look up tables, and other changes, 
[performance increased 15% on average.](https://github.com/yuzu-emu/yuzu/pull/6791)
`Astral Chain` and similar titles that madly love ASTC should see more consistent frametimes with this change.

Blinkhawk has also been constantly working lately, not only on Hades and several other improvements, but also in some top secret projects we will mention later.

Koei Tecmo games are usually quite special, they never fail to provide headaches to our developers thanks to… unique decisions on the game’s part.
It’s not an exaggeration to say that Project Hades’ main motivation was improving the situation of these games on yuzu.

One of the remaining issues with Koei games like `Hyrule Warriors: Age of Calamity`, `Fire Emblem: Three Houses`, and similar games was instabilities caused by running in High 
GPU accuracy when loading specific levels.
In Blink’s own words, [a simple fix,](https://github.com/yuzu-emu/yuzu/pull/6627) and the problem got solved.

Another old regression introduced by the buffer cache rewrite affected particles in games like `The Legend of Zelda: Breath of the Wild`, the rendering of the BowWow in 
`The Legend of Zelda: Link’s Awakening` and caused vertex explosions in Unreal Engine 4 games like `Yoshi’s Crafted World`, `BRAVELY DEFAULT 2` and similar.
[Tuning how to handle high downloads and not fully waiting for command buffers to finish](https://github.com/yuzu-emu/yuzu/pull/6557) solved these issues.
To make the best out of this change, High GPU accuracy needs to be in use.

{{< single-title-imgs
    "High GPU Accuracy is recommended (The Legend of Zelda: Breath of the Wild)"
    "./particlebug.mp4"
    "./particlefix.mp4"
    >}}

When Blinkhawk introduced the new fence manager while working on improvements for `Asynchronous GPU Emulation` two years ago, some frame delays came with it, causing stuttering 
in gameplay even if the framerate counter showed a solid 30 or 60 FPS value.
To counter this, Blink starts [pre-queueing frames](https://github.com/yuzu-emu/yuzu/pull/6787), providing a smooth gameplay experience, especially noticeable if the user 
hardware can’t sustain perfect performance constantly.

{{< single-title-imgs
    "Smooth as butter (Xenoblade Chronicles Definitive Edition)"
    "./vsyncbug.mp4"
    "./vsyncfix.mp4"
    >}}

Rodrigo has also been hitting those keycaps without rest.

`Hyrule Warriors: Age of Calamity` suffered from very dark environments due to unprepared images that were used as render targets. When their dirty flags were not properly set, 
a desynchronization happened on the texture cache, causing the issue shown below.
[By correctly preparing such images](https://github.com/yuzu-emu/yuzu/pull/6670), the game renders correctly.

{{< single-title-imgs
    "That looks like the Dark World to me (Hyrule Warriors: Age of Calamity)"
    "./aocbug.png"
    "./aocfix.png"
    >}}

By optimizing shaders doing [FMA](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation#Fused_multiply%E2%80%93add) operations, yuzu 
[gains an extra 4% of performance](https://github.com/yuzu-emu/yuzu/pull/6722) overall.

Some games like `Katana ZERO`, `UNDERTALE`, `DELTARUNE`, `Shantae`, `Fire Emblem: Shadow Dragon and the Blade of Light`, and others experience flipping issues in Vulkan, when 
parts of their rendering are rotated, mirrored or both.
By [flipping the viewport](https://github.com/yuzu-emu/yuzu/pull/6765) in `Y_NEGATE`, Rodrigo matches in Vulkan the correct behaviour OpenGL has, providing the correct 
rendering for those games.

{{< single-title-imgs
    "Fire Emblem: Shadow Dragon and the Blade of Light"
    "./flipbug.png"
    "./flipfix.png"
    >}}

`Xenoblade Chronicles 2` experienced crashes in Vulkan Mesa drivers related to lacking null buffers in its transform feedback bindings. Rodrigo had to 
[emulate the lack of this function](https://github.com/yuzu-emu/yuzu/pull/6580) in order to solve the crashing.

AMD Radeon Linux users may have noticed that `The Legend of Zelda: Skyward Sword` would run at very slow framerates in stable versions of the OpenGL Mesa drivers.
This is caused by a driver level bottleneck resulting in very slow [PBO](https://www.khronos.org/opengl/wiki/Pixel_Buffer_Object) (Pixel Buffer Object)  downloads.
While the current mesa-git has this bottleneck solved, a solution is needed until those fixes reach the stable release versions.
[By specifying the `GL_CLIENT_STORAGE_BIT` flag,](https://github.com/yuzu-emu/yuzu/pull/6685) an alternative faster path can be used, increasing performance from around 8 FPS 
to a solid 60 FPS.
Mesa drivers are the best drivers.

Another contributor to graphical fixes is [Morph](https://github.com/Morph1984). 

`New Super Mario Bros. U Deluxe` provides video tutorials via the web applet, prior to this PR, trying to access that list would only result in the game returning to the 
previous menu.
[By implementing how to handle Nintendo CDN URLs in the web applet,](https://github.com/yuzu-emu/yuzu/pull/6641) this section of the game can now be accessed.

{{< imgs
	"./nsmbuvid.png| Video playback is still a work in progress (New Super Mario Bros. U Deluxe)"
  >}}

Morph also solved a quite specific render issue affecting users with multiple displays.
If two or more monitors were in use and the user started a game from any display besides the primary, black borders would show up at the right and bottom corners of the 
rendering window.
To solve this, [Morph needed to tell Qt to create a dummy render widget.](https://github.com/yuzu-emu/yuzu/pull/6658)

{{< single-title-imgs
    "Sonic Mania, in proper pixelated format"
    "./bordersbug.png"
    "./bordersfix.png"
    >}}

Newcomer [yzct12345](https://github.com/yzct12345) came like a sonic boom, implementing critical improvements at impressive speeds!

By [ignoring an invalid texture operation,](https://github.com/yuzu-emu/yuzu/pull/6679) an early crash affecting `Pokémon: Let’s go, Eevee! & Pikachu!` in Vulkan was solved. 
No more crashes when catching your first Pokémon. Gotta catch’em all!

[yzct12345’s work on optimizing UnswizzleTexture](https://github.com/yuzu-emu/yuzu/pull/6790) resulted in up to double performance for video decoding, and it also improved 
general gameplay!
This results in far smoother video playback and in a considerable reduction of the CPU performance needed to get a pleasant gaming experience. Thanks! 

[toastUnlimited](https://github.com/lat9nq) is our specialist in Linux testing and bug reporting.
He noticed that the rune telemorting animation in `The Legend of Zelda: Breath of the Wild` wasn’t working correctly on the Iris and radeonsi Mesa drivers, the default OpenGL 
drivers for recent Intel and AMD GPUs, respectively.

[Thanks to instructions the Mesa driver team gave us](https://gitlab.freedesktop.org/mesa/mesa/-/issues/3820#note_753371) in how to properly use BindImageTexture, 
toastUnlimited was able to [implement the needed changes in yuzu](https://github.com/yuzu-emu/yuzu/pull/6570), making the animation render correctly.

{{< single-title-imgs
    "Well excuse me, Princess (The Legend of Zelda: Breath of the Wild)"
    "./botwbug.png"
    "./botwfix.png"
    >}}

[K0bin](https://github.com/K0bin) arrived to give us a hand, fixing an important screw up we made.

Prior to the introduction of full support on Resizable BAR in modern GPUs and systems, the PCI-Express standard is limited to a buffer of 256MB in video memory to communicate 
to the CPU at a time.
yuzu uses this small portion of VRAM for allocating its staging buffer, but if the user has GPU intensive background applications, there may not be enough space to allow the 
allocation to happen, and yuzu would refuse to create a Vulkan instance, failing to boot any game.
OpenGL is, as usual, excluded from this issue thanks to letting the GPU driver handle those allocations on its own.

K0bin fixes this issue by [doing the allocation in system RAM](https://github.com/yuzu-emu/yuzu/pull/6740) if there isn’t enough free space. Many thanks!

## Stop This Sound!

[Maide](https://github.com/Kelebek1) has been dedicated to improving the audio side of yuzu this month.
By [introducing some missing PCM formats](https://github.com/yuzu-emu/yuzu/pull/6564), the missing audio present in `Ys IX: Monstrum Nox` was finally fixed.

`PCM` stands for [Pulse-Code Modulation](https://en.wikipedia.org/wiki/Pulse-code_modulation), an encoding technique used to represent analogue audio signals digitally.
These signals have two basic properties: The [sample rate](https://en.wikipedia.org/wiki/Sampling_(signal_processing)#Sampling_rate) (how many samples of the signal are taken 
per second), and the [bit-depth](https://en.wikipedia.org/wiki/Audio_bit_depth) (how many bits are used to represent the "loudness" of the signal's samples at any given point 
in time).

In this PR, Maide introduced a number of methods to process formats that were missing in the current implementation — namely, the ability to decode PCM files encoded with a 
bit-depth of 8-bit, 32-bit, and also floating-point values.
Since previously none of these formats were being decoded by yuzu, any audio file that made use of them was not being reproduced, causing this behaviour.

`Tales of Vesperia` was another title with sound problems, in which audio would be played monaurally through the left channel — far from a pleasant experience, as you can hear 
here:

{{< audio "./vesperiabug.mp3" >}}

This game in particular would request the available number of active channels and cap its output based on this information — in other words, the game would not output audio to 
more channels than what yuzu reported.
Since yuzu was always returning a value of `1`, the game ended up outputting all the audio into the left channel.
This problem was thus fixed by [reporting two channels as active instead of one](https://github.com/yuzu-emu/yuzu/pull/6567), which is now mixed properly:

{{< audio "./vesperiafix.mp3" >}}

Not satisfied with just this, Maide also went on and [changed the downmixing logic](https://github.com/yuzu-emu/yuzu/pull/6569), which improved the audio in titles such as 
`The Legend of Zelda: Link's Awakening`, `New Super Mario Bros. U`, `Disgaea 6: Defiance of Destiny`, and `Super Kirby Clash`.

Simply put, downmixing refers to the process of combining multiple audio channels so it is possible to reproduce them in a system with a lower number of available audio 
channels.
There is some mathematics involved here and there, but the general idea behind it is to balance the volume of these individual channels so that the resulting signal sounds 
centred.

In the case of the Nintendo Switch, many games report six audio channels as available to the system, even though they end up providing data for only two channels (stereo sound).
Consequently, yuzu would think the games used all these channels and then "downmix" them to stereo, affecting the volumes of the left and right channel in the process, which 
would end up being much quieter than needed.
While the maths used by yuzu are valid when used to downmixing six-channels-to-two, it certainly was not a desirable effect in this case.
Therefore, Maide changed the code to preserve the volume of these channels if the audio in a game is already stereo, which now reproduces with the correct levels.

On the same page of volume problems, there was also a bug with the volume in certain areas of `Xenoblade Chronicles 2`, where it would occasionally spike out of proportion.
Maide tracked down the cause of this behaviour, and discovered that the gain of the samples sent by this game to yuzu had their values set as `NaN`.

A [NaN](https://en.wikipedia.org/wiki/NaN) is a type of placeholder used by computers to represent numeric values that can't be defined otherwise — hence, the acronym 
`N`ot `a` `N`umber.
Particularly, the problem at hand lies in the fact that, in order to operate over the samples of the audio signal, these gain values must be converted into integers.
But in this process, the `NaN` values, in turn, become obscenely large positive and negative integer values.

As these samples were further processed by yuzu before sending them to your sound system, these gains would distort and cap the volume of the audio samples to their maximum or 
minimum value, causing this bug.
To prevent this problem, Maide added a check that [changes the gain value from NaN to zero in such cases](https://github.com/yuzu-emu/yuzu/pull/6571), so that no error is 
propagated along the mixing.

This is mostly a workaround, as it still remains under investigation why the game is yielding these `NaN` values, but at the very least, it should help prevent a number of 
bleeding ears here and there.

## Input changes

HD RUMBLE HERE

// Hong: Rewording here (as HD rumble is not ready yet, this section doesn’t need a follow-up line to introduce these changes).

Along with some miscellaneous QoL changes, [german77](https://github.com/german77) also changed the behaviour of recently enabled controllers in yuzu.
In order to provide the most precise experience, now [sticks will be auto-centred](https://github.com/yuzu-emu/yuzu/pull/6698) the moment the device is detected by yuzu.
Surprisingly, this happens with almost every game controller, sticks always are slightly off-centre, and if the dead zone value is small enough, users would perceive slight 
drifting during gameplay
No drift in this emulator!

Thanks to internal changes on how settings are stored, the default values of mouse panning were affected. 
german77 [restored the previous values](https://github.com/yuzu-emu/yuzu/pull/6659) and additionally solved an issue where the emulated stick would always look down if the user 
had multiple screens.
No drift, not even with the mouse!

# UI changes

A silent change that has the potential to improve performance considerably to users of old or low end CPUs has been made by toastUnlimited.
In the past, we recommended our users to manually select the `Unsafe` CPU accuracy option if their CPU lacked the FMA instruction set, this is not only confusing for the users, 
as it required them knowing if their specific CPU model was compatible with FMA, but also relied on communication channels and guides properly explaining this to as many people 
as possible, of course resulting in several users not even knowing why they ran games at such poor performance.

Additionally, it was later discovered that using the whole Unsafe preset can cause precision issues affecting things like the shape of the character hitboxes in 
`Super Smash Bros. Ultimate`. A better solution was needed.

toastUnlimited now offers us [the all new `Auto` CPU accuracy setting!](https://github.com/yuzu-emu/yuzu/pull/6573) 
Enabled by default for all users, this setting determines the need to use the `Unfuse FMA` value automatically, by reading if the FMA instruction set is supported by the CPU 
in 
use.
It also sets other values, for example `Faster ASIMD instructions`, to boost the performance of 32-bit games.
Auto CPU accuracy has the potential to more than triple the performance of users running old or very low end CPUs!

Thanks to work done by Morph, [now all default six Miis are available to the user](https://github.com/yuzu-emu/yuzu/pull/6556) in games that request them.

{{< imgs
	"./mii.png| We're still far away from offering full Mii customization, but at least more options are available now (Mario Kart 8 Deluxe)"
  >}}

[lioncash](https://github.com/yuzu-emu/yuzu/pull/6574), our silent optimizer and code cleaner, found an issue with the new strings that report if a game is 32 or 64-bit.
Languages that read from right to left had issues with the initial implementation, and translating this string was disabled.
[Now both issues are resolved!](https://github.com/yuzu-emu/yuzu/pull/6574)

After gathering more information on the behaviour of the FPS unlimiter, epicboy discovered that some games will crash when attempting to boot them unlimited.
[Simply force-enabling the limiter at each game boot is enough to solve the issue.](https://github.com/yuzu-emu/yuzu/pull/6576)
Remember to unlock the framerate manually after you start a game!

[vonchenplus](https://github.com/vonchenplus) is back with another nice addition!
Certain game dumps contain several games inside them, and yuzu would default to only launching the first one in the list.
[This change makes the necessary modifications so all games are properly listed.](https://github.com/yuzu-emu/yuzu/pull/6582)

{{< imgs
	"./games.png| "
  >}}

## Command-Line Shenanigans

toastUnlimited did a general [update to the settings of the command-line version of yuzu](https://github.com/yuzu-emu/yuzu/pull/6651), `yuzu-cmd`.

The previous implementation had many options that were originally carried over from Citra and later deprecated, as well as others that were not read properly from the `ini` 
file, or were read but not written into the `ini` file, etc.
In other words, there were a lot of things wrong with it, and some updating was in order to properly synchronize everything back with the settings present in the main 
executable of yuzu.

Since toastUnlimited was already working on `yuzu-cmd`, he also went on and [fixed some problems related to Vulkan on Linux](https://github.com/yuzu-emu/yuzu/pull/6652).
When this executable was launched, it wouldn't be able to detect the window manager, and would proceed to exit instead of booting a game.

The cause behind this problem lies in the fact that we recently updated how the SDL external library is being fetched for our Linux binaries, which came with a dummy 
configuration file with invalid settings.
toastUnlimited made it so that we manually include the correct generated configuration file for building SDL instead of this dummy, while also adding some new logging 
information to report when support for a window manager was not compiled.

In a follow-up PR, toastUnlimited also added [support for the full-screen mode settings](https://github.com/yuzu-emu/yuzu/pull/6693) to `yuzu-cmd`.
Concurrently, he also fixed a bug that caused yuzu to render with the wrong resolution when in full-screen.

Some time ago, we made it possible for yuzu to run on different full-screen modes, but these options were never added to the command-line version of our executable, which is 
addressed on this PR.

## Technical Changes

Meanwhile, [bunnei](https://github.com/bunnei) was busy [improving the management of kernel objects](https://github.com/yuzu-emu/yuzu/pull/6551), reducing drastically the 
amount of objects that kept dangling on memory after closing the emulation session.

A dangling object refers to information that has references in memory (i.e. pointers to access it), even though the object isn't being used any more.

In yuzu, kernel objects are implemented so that they keep track of themselves through a [reference counter](https://en.wikipedia.org/wiki/Reference_counting), which keeps the 
object alive for as long as they're needed.
In other words, whenever a process needs an object, the reference counter is increased, and conversely, the reference is decreased when the object isn't needed any more.

Once this value reaches zero, the object is automatically deleted.
Previously, yuzu wasn't doing a great job at maintaining this reference counter, as these kernel objects can be called by more more than just one process — i.e. the "owners", 
who are responsible of freeing the resource once they're done with it.
In some cases, some of these owners weren't properly freeing the object at all, which meant that the reference counter never reached zero, leaving this object "dangling" in 
memory, even though the information became basically useless at this point.

One of the many jobs of the kernel in the OS is to keep track of all the resources available in the system.
For this reason, these dangling objects were a problem, as the kernel calculates the number of resources that can be spawned based partly on the number of active objects in 
memory.
With dozens of different kernel objects being created thousands of times between emulation sessions, this easily saturated the amount of objects that could be spawned due to 
yuzu hitting the resource limits much earlier than expected.

bunnei took a long look at the problem and improved the situation, but there's still ongoing work to make our implementation more robust and accurate.

blink also had his share of bufixing work, as he revisited the texture cache code related to [1D-to-2D texture overlaps](https://github.com/yuzu-emu/yuzu/pull/6553), which 
fixes problems in `Re:ZERO -Starting Life in Another World- The Prophecy of the Throne` and `Monster Hunter Rise`, among others. // inquire about more games and fixes.

Similarly to how two-dimensional textures are mapped to three dimensions, one-dimensional textures are a simple type of texture that is mapped as two-dimensional when rendered 
on the screen.
The problem here lies in the fact that the GPU is unable to tell the difference between a one-dimensional texture and a two-dimensional texture with a height of one.

As such, it was necessary to add support for them, so that they can be processed correctly by our texture cache.
With the changes on this PR, blink made it so that they can be copied seamlessly, fixing this faulty behaviour.

If you're interested in a more technical explanation about textures and their types, we recommend reading 
[the D3D11 documentation provided by Microsoft](https://docs.microsoft.com/en-us/windows/win32/direct3d11/overviews-direct3d-11-resources-textures-intro).

## Future projects

`Project A.R.T.`, the designated name for our revival of the resolution scaler, has started, and early results look very promising!                   .

{{< imgs
	"./art.png| Getting blue-shelled at 4K doesn't really help with anger management (Mario Kart 8 Deluxe)"
  >}}

There are many bugs to fix, optimizations to make and tons of testing to do before we can safely release this feature. 
So for now, know that the scaler is returning!

toastUnlimited [started the preliminary work to get an operational Linux installer](https://github.com/yuzu-emu/yuzu/pull/6667) to accompany our current Windows one. 
This also means offering precompiled builds for both Mainline and Early Access.
Once it is finished, Linux users will no longer need to be forced to build from the source (if so they prefer)!

That’s all folks! As a certain AI singer would say, thank you for your kind attention. See you next time!

&nbsp;
{{< article-end >}}
