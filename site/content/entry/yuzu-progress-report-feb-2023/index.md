+++
date = "2023-03-08T12:00:00-03:00"
title = "Progress Report February 2023"
author = "GoldenX86"
forum = 0
+++

Hello yuz-ers! What a varied month we had! This time we have improvements in GPU, kernel, services, input, user interface and experience, driver related rants, and more!. 

<!--more--> 

## Project Y.F.C. 1.75?

Basically one of the features that was missing from the previous 1.5 release.

King of Turkeys [Blinkhawk](https://github.com/FernandoS27) implemented host texture download acceleration for the Switch’s DMA engine (or Accelerate DMA for short).

{{< gh-hovercard "9786" "DMA acceleration" >}} reduces a ton of overhead by letting the GPU handle texture downloads, improving performance considerably on games that aren’t CPU bottlenecked.

yuzu in the past operated everything from within the CPU and system memory, primarily the process of [swizzling/unswizzling](https://en.wikipedia.org/wiki/Z-order_curve#Texture_mapping) textures.
Now this process is done in the GPU and its VRAM, saving CPU cycles, avoiding having to transfer information back to system memory, and giving us access to the vastly superior bandwidth available in modern GPUs video memory.

When you find a game that benefits from faster texture downloads, the numbers speak for themselves:

{{< imgs
	"./dma.png| Bottleneck busters!"
  >}}

## Other GPU (and video) changes

Before going over the *rendering* changes in GPU emulation, let’s cover something we haven’t touched in a while, video decoding.

Firstly, [vonchenplus](https://github.com/vonchenplus) improved the speed at which {{< gh-hovercard "9777" "video frame data" >}} is copied.
That is, as long as the compiler notices the optimization and makes use of it.
When it works, this has the added benefit of reducing the time it takes to start playing videos.

Next, [Maide](https://github.com/Kelebek1) disabled multi-frame decoding, which caused a frame of delay, giving Maide the option to also {{< gh-hovercard "9810" "set the decoder to use all available CPU threads." >}}
While most people don’t have issues with video decoding performance, people running old GPUs, for example AMD Polaris series (RX 400/500 cards), will use their CPU for decoding VP9 videos, as such old cards lack the required hardware decoder.

Games such as `The Legend of Zelda: Skyward Sword HD` will provide much smoother video playback with these changes.

Okay, enough about pre-rendered 2D frames in sequence, what about real 3D stuff?
Happily, we have a bit to talk about. 

[behunin](https://github.com/behunin) is back, {{< gh-hovercard "9744" "optimizing the" >}} `gpu_thread` code.
The `gpu_thread` has one job and only one job, to consume its command queue.
The problem is that it was also generating commands as well as consuming them.
By getting rid of this undesired behaviour, the `gpu_thread` is back to only consuming commands, leaving the road open for more future fixes.

Even from the shadows, [epicboy](https://github.com/ameerj) still comes with the best new toys. A true Eminence in Shadow.

Avid readers may remember that [MSAA image uploads](https://yuzu-emu.org/entry/yuzu-progress-report-dec-2021/) hold a weird spot in Switch emulation.
There’s a conflict between what the Switch can do with its native NVN API, and what our available graphics APIs (OpenGL and Vulkan) allow.

Both OpenGL and Vulkan are very restrictive regarding {{< gh-hovercard "9746" "MSAA texture" >}} uploads and copies, leaving epicboy with the only remaining tool available. Yep, you’re right! Time to use a compute shader!

{{< single-title-imgs
    "Breaking the rules to ge proper rendering (Sonic Forces)"
    "./msaabug.mp4"
    "./msaafix.mp4"
    >}}

This way, rendering is accurate.
Do keep in mind that this is an implementation only for OpenGL.
Vulkan, as always, is much more work so it’s homework for later.

While working on {{< gh-hovercard "9749" "fixing regressions" >}} in Blinkhawk’s [cached writes pull request](https://github.com/yuzu-emu/yuzu/pull/9559) affecting `Yoshi's Crafted World` (the game would freeze when using Normal GPU accuracy), epicboy also fixed `Pokémon Scarlet/Violet`’s missing building geometry issues.

{{< single-title-imgs-compare
	"No more ghost town (Pokémon Scarlet)"
	"./pokebug.png"
	"./pokefix.png"
>}}

Ahh, [ASTC](https://en.wikipedia.org/wiki/Adaptive_scalable_texture_compression), most of you know the struggle by now.
Mobile devices like phones, tablets, *Macs*, the Nintendo Switch, among others, have native support for this very compressed texture format, but laptop/desktop/*server* GPUs don’t. 
This leaves the Switch emulation community struggling with ways to mitigate the slow process of decoding such textures on hardware that is not designed for such a task.

Yes, even the weak and outdated Switch beats an RTX 4090 in this task. 
Bet your wallet isn’t happy about that fact.

yuzu’s weapons in this fight so far were multithreaded CPU decoding, and GPU decoding via compute shaders, which takes advantage of the huge parallelization power of modern GPUs.
Both solutions have stuttering always present while the decoding takes place, especially in new games that overly use large ASTC textures, like `Bayonetta 3` and `Metroid Prime Remastered`.

Well, epicboy adds a new weapon to our arsenal, and oh boy it can help. At a price.
Introducing {{< gh-hovercard "9849" "Asynchronous ASTC texture decoding!" >}} 

For those that prefer zero ASTC related stuttering during their gameplay, this new toggle uses a background thread to decode ASTC textures while the game is being rendered.
Such an approach will eliminate stuttering, but has the cost of introducing graphical glitches until the textures finish showing up on screen.

Here’s a comparison of asynchronous decoding with a 16 threads Ryzen 7 5800X3D (so not even the king of the hill in thread count, what matters the most for CPU decoding), vs an RTX 4090, the biggest commercially available compute monster for consumers right now.

{{< single-title-imgs
    "GPU compute shader decoding on the left, asynchronous CPU decoding on the right (ASTRAL CHAIN)"
    "./compute.mp4"
    "./async.mp4"
    >}}

As you can see, while the process taking place is pretty obvious to the eye with asynchronous decoding, it’s significantly faster than the best GPU available right now. 
Even a 12-thread CPU would still win a drag race in the most intensive ASTC game ever, `ASTRAL CHAIN`.
Users with lower thread count CPUs (like quad cores with 8 threads or lower) may need to time their results.

You can find the option in `Emulation > Configure… > Graphics > Advanced > Decode ASTC textures asynchronously (Hack)`. 
Enabling it will also override the setting in Graphics, always using CPU decoding, so remember to disable it if you want to use GPU compute decoding instead.

{{< imgs
	"./astc.png| We recommend low CPU thread users to stick to GPU decoding"
  >}}

According to epicboy, while an asynchronous GPU compute method is possible, the rules and limitations of compute shaders hinder its potential, most likely making it barely any better than regular GPU decoding with the compute units.

Life would be so much easier if GPU vendors properly added native ASTC support on their GPUs… Your reporter would gladly take it over useless stuff like RGB, ugly plastic shrouds, or driver DVDs.

NVIDIA, AMD, please consider adding native ASTC support. 
It’s certainly more useful than generating fake frames with disgusting artifacting.
Intel, you had great ASTC support in your iGPUs.
Consider adding it back to future versions of Arc graphics.

Maide has been working on trying to solve the overlapping textures glitches that can be spotted in games like `The Legend of Zelda: Breath of the Wild` and `Xenoblade Chronicles 3`.
While it isn’t a perfect solution, {{< gh-hovercard "9802" "re-adding" >}} the (accidentally) removed `invalidate_texture_data_cache` register helps mitigate the issue at almost any camera angle except the most oblique ones.

{{< single-title-imgs
    "We present you: New crack sealer! Move the camera and the cracks are gone! (The Legend of Zelda: Breath of the Wild)"
    "./botw1.png"
    "./botw2.png"
    >}}

Depending on the shape of the terrain, or the camera angle, the issue can surface again. 
But as a temporary solution, this change makes playing affected games much more tolerable.
Work continues!

## CPU, kernel, services, and optimizations

[Merry](https://github.com/merryhime) {{< gh-hovercard "9735" "updated dynarmic" >}}, our JIT, to version 6.4.5, solving some issues and improving compilation times.
One game that benefited from this is `Taiko Risshiden V DX`, which got its load times reduced considerably.

{{< single-title-imgs
    "Take your time (Taiko Risshiden V DX)"
    "./taiko1.png"
    "./taiko2.png"
    >}}

byte[] has also been going deep into the kernel code. One of his changes improves the `SVC wrappers`.
But what are the wrappers? Well, games and homebrew need to talk to the kernel, and to do so they use SVC instructions, which act as an interface with the kernel.

{{< imgs
	"./wrapper.png| The return of mspaint"
  >}}

The work of the wrapper is to translate a request from the game into a C++ call into the kernel, and then get the result from the kernel back into the game.
In the past yuzu used manually written wrappers that were very error-prone. With this change, byte[] instead {{< gh-hovercard "9742" "automatically generates" >}} the needed wrappers.
This code is far more accurate, so if you find games that no longer crash or soft-lock, here’s the new code responsible for it.
One such example is `Moero Crystal H` which starts booting for the first time.

{{< imgs
	"./mch.png| Don’t judge, it’s part of the Switch’s library (Moero Crystal H)"
  >}}

This game requires more work to get proper video and gameplay rendering.

Keeping the pursuit for accuracy, byte[] also implemented {{< gh-hovercard "9832" "HLE multiprocess" >}} for services.
Now instead of pushing the game’s requests to the services, the services wait for the requests to arrive.
All this processing is done, for the most part, in what would be the emulated `core 3` of the Switch, instead of all over the place with one thread per service. 
Games usually only have access to cores 0 to 2, so we’re making good use of the normally free last core available, just as the actual Switch operating system does!

This part of CPU emulation is one of the main reasons we recommend at least 6 cores in our [hardware requirements](https://yuzu-emu.org/help/quickstart/#hardware-requirements), 4 for uninterrupted emulation of the Switch’s CPU, and extras for other processes and tasks. Just a 4 core CPU will be usually overburdened. HT/SMT may help, but that will always depend on the workload at any given moment.
A SMT/HT thread can’t improve performance in a significant way if the core is already saturated.

Boss [bunnei](https://github.com/bunnei) chimed in too, fixing a mistake in {{< gh-hovercard "9773" "memory mapping." >}}
We erroneously used the (bear with me, it’s not a redundancy) system’s system resource tracking, instead of relying on the application’s one when loading programs into memory.
Most games were tolerant to this, but `FINAL FANTASY CRYSTAL CHRONICLES Remastered Edition` didn’t like it, getting stuck every time the user tried to load a save.
A tweak here and there and the regression is now gone!

{{< imgs
	"./ffcc.png| Feel free to progress the game now (FINAL FANTASY CRYSTAL CHRONICLES Remastered Edition)"
  >}}

New Pokémon game update, new things to fix.
Once again, `Pokémon Scarlet/Violet` is giving us a headache.

This time, the recently released update 1.2.0 wouldn’t boot on yuzu. After investigating for a bit, [german77](https://github.com/german77) found out that the cause was that some {{< gh-hovercard "9874" "Bluetooth functions" >}} weren’t properly implemented, causing the game to crash when attempting to start with the latest update installed.

{{< imgs
	"./ps.png| Mandatory protagonist seat (Pokémon Scarlet)"
  >}}

Some code changes later, and german77 fixed the issue! Now anyone can enjoy the reduced NPC count and lower draw distance.

Even [your writer](https://github.com/goldenx86) tried to give a hand (emphasys on tried).
[As reported in the past](https://yuzu-emu.org/entry/yuzu-progress-report-dec-2022/#cpu-requirement-changes-with-free-performance), we applied `Link-time Optimization` to all of yuzu’s subprojects. This meant that every section like audio, input, UI, etc. used LTO at build time, trying to squeeze out every possible bit of performance.
This caused an unexpected problem: RAM consumption while building increased enough to cause our buildbot to cry for help, causing builds on our Azure DevOps CI to randomly run out of memory.

byte[] suggested that I instead profile which subprojects would provide the most performance boosts, and to only apply LTO to those.
A few rounds of toasting a CPU building yuzu later, and it was determined that the two most obvious candidates, core and video_core, were the responsible ones for the performance boost provided by enabling LTO.

{{< gh-hovercard "9872" "Partially applying LTO" >}} to only the core and video_core projects not only reduced compiler RAM use, but also provided a very minor but still consistently measured performance increase, `The Legend of Zelda: Link’s Awakening` improved from 257 FPS to 260 FPS.
Nothing groundbreaking, but it’s a free bonus from a change that was only intended to reduce RAM use!

[Morph](https://github.com/Morph1984) later added a {{< gh-hovercard "9887" "small but very critical fix" >}} to get all this actually working.
I’m a disaster, sorry.

## Input improvements

`Metroid Prime Remastered` introduced a serious dilemma: People want to play the game as an FPS with mouse and keyboard.

{{< single-title-imgs
    "This game is gorgeous, like Samus (Metroid Prime Remastered)"
    "./mpr.png"
    "./mpr2.png"
    >}}

The problem is that the game uses motion on top of stick input to aim, making it an interesting case for how to handle non-controller input.

This was incentive enough to get german77 interested in giving it a try:

First off, he fixed an issue where {{< gh-hovercard "9757" "motion would be constantly getting recalibrated." >}}
Next, german77 tweaked the {{< gh-hovercard "9815" "mouse scaling" >}} for users running a DPI scaling higher than 100% (1.0x).
Following up, the {{< gh-hovercard "9842" "mapping for mouse input" >}} was improved. By default a mouse to stick is considered a joystick, which includes assuming deadzone and ranges that aren’t zero by default. This pull request includes some other miscellaneous changes, like fixing some UI elements not working.
And finally, to address Metroid Prime Remastered’s `hybrid mode`, support for {{< gh-hovercard "9848" "dedicated motion using the mouse" >}} was added. Since the game only uses two axes, this can be directly mapped 1:1 to mouse movement, giving great ease of aiming!

The user can adjust the sensitivity of mouse motion with the same setting used for mouse panning in `Emulation > Configure… > Controls > Advanced`

{{< imgs
	"./mouse.png| Remember to set sensitivity to your liking"
  >}}

But was all that german77 did this month only focused on Metroid Prime Remastered? No.
Continuing the work started in [December of 2022](https://yuzu-emu.org/entry/yuzu-progress-report-dec-2022/#new-joy-con-driver-and-other-input-improvements), {{< gh-hovercard "9759" "support for Pro Controllers" >}} within the new custom “Joy-Con” driver.
Since the option is experimental, it only works properly on official Nintendo Pro Controllers, not with third parties, it’s disabled by default.
Owners of *real* Pro Controllers are encouraged to enable this option, as it will provide much better motion and HD Rumble support.

{{< imgs
	"./procon.png| Not the same pic as the previous one, I swear"
  >}}

Previous limitations like being unable to use a Pro Controller for Amiibo detection are still in place, as there’s still work to be done.

## Audio improvements

There are some interesting changes in audio emulation that many users will be happy about, let’s go one by one.

A crash was fixed by german77 when {{< gh-hovercard "9758" "initializing" >}} [cubeb](https://github.com/mozilla/cubeb), our default audio library.
Guess having fewer crashes is always good, right?

Merry made an attempt at fixing a {{< gh-hovercard "9768" "rounding issue" >}} in the bi-quad filter. 

While the intention of this change is to partially improve the audio quality in several games, but most notably the game of the month, `Metroid Prime Remastered`, it didn’t quite hit the mark. 
This wasn’t enough to solve the random noise issues affecting the game, so Maide set out to investigate and found out that the audio emulation codebase was wrongly saving the state of all different audio channels in the same address! 

You can imagine what’s the audio result if the left channel stores some precious data, the right channel does the same, overwriting what the left channel did, and then the left channel fetches back what it expects to be the correct information to work on something else.
Users described this problem in Metroid as “if someone shot a gun right by your ears”.

Now each audio channel stores its information in {{< gh-hovercard "9795" "different memory regions," >}} completely avoiding overlapping each other.
Not just `Metroid Prime Remastered` will benefit from this, both `Fire Emblem` games have shown improvements too.

Another issue Maide found was a missed check causing an array index to read negative values, which is, in simple terms, “very wrong”.
This was causing the audio engine to grab {{< gh-hovercard "9769" "random chunks of memory" >}} as information for mixing, crashing the audio engine, and yuzu with it.

Solving this oopsie resolves crashes happening in `Metroid Prime Remastered`, and most likely others too.

## UI changes

The LDN lobby window got some love from newcomer [unfamiliarplace](https://github.com/unfamiliarplace), adding the option to {{< gh-hovercard "9713" "hide empty rooms." >}}
Nothing beats quality of life changes like this, thanks!

{{< imgs
	"./lobby.png| Only the dankest rooms, please"
  >}}

For Discord gamers, [SoRadGaming](https://github.com/SoRadGaming) gives us proper game images for{{< gh-hovercard "9720" "Discord Status!" >}}
The images are grabbed from our compatibility wiki, which is under a rewrite, so expect some games to be missing for now.

{{< single-title-imgs
    "Make your friends envy you with this simple trick!"
    "./discord1.png"
    "./discord2.png"
    >}}

A small mistake caused the web applet to lose the ability to redraw and zoom its content when resizing the yuzu web applet window.
{{< gh-hovercard "9761" "Re-adding" >}} the `setZoomFactor ` feature fixes the scaling, allowing players to fit their Mario Manual to their needs.

Per-game settings are very useful, but also very tricky to get right codewise
[m-HD](https://github.com/m-HD) greets us by adding a few missing graphical settings to the list, solving conflicting issues when setting the fullscreen mode, resolution scaling, filter, and antialiasing values in the {{< gh-hovercard "9784" "per-game" >}} configuration window.

German77 then properly implemented per-game configuration support for the `Force maximum clocks` {{< gh-hovercard "9863" "setting" >}} AMD GPUs [benefit](https://yuzu-emu.org/entry/yuzu-progress-report-jan-2023/) so much from.

yuzu can crash, that’s expected of any first generation emulator.
What shouldn’t happen is missing changes made to the configuration after a crash, or a forced close.
The problem was in our Qt UI, and german77 worked to properly tell Qt to save and sync the configuration to file, avoiding any {{< gh-hovercard "9817" "configuration change loss" >}} after a force close.

## General fixes

[MonsterDruide1](https://github.com/MonsterDruide1) continues to do wonders with the [LDN](https://yuzu-emu.org/entry/ldn-is-here/) code.
This time, proper error handling.
One of the possible errors when handling TCP connections is `ECONNRESET`, which happens when the other end closes the connection abruptly.
Oldschool gamers call this “rage quitting”.

Jokes aside, when a sudden disconnection like this happens, the error used to get caught by yuzu instead of the game, causing the game to never get the notification of the client disconnection.
Properly {{< gh-hovercard "9843" "passing the error" >}} through to the game allows it to handle the issue on its own way instead of crashing the yuzu LDN session.

Some improvements were done to yuzu-cmd, the command-line alternative to the default Qt UI.

german77 added support {{< gh-hovercard "9729" "touch from mouse click and SDL controller input," >}} and {{< gh-hovercard "9730" "two parameters," >}} `-g`  for specifying a game file location and `-u` for specifying an user profile.

Your writer also showed up, {{< gh-hovercard "9737" "updating" >}} the graphical filters and resolution multiplier options that were recently added to regular yuzu.

## Hardware section

### NVIDIA driver 531.18, it’s a good one

This latest (at the time of writing) release of the NVIDIA driver, 531.18, includes support for `VK_EXT_extended_dynamic_state3`, a Vulkan extension previous readers will be familiar with.
Having this extension supported means fewer shaders need to be built, resulting in a smoother experience thanks to reduced shader stuttering, and lower RAM use.

We recommend at least Turing and newer (GTX 1600, RTX 2000-4000) users to update, as we expect this release to not fix the issues affecting Pascal and Maxwell hardware (GTX 1000 and older).

### AMD Ryzen 7000X3D series, and the importance of Game Mode

AMD recently released their Zen 4 CPUs with 3D V-Cache technology, and in an effort to copy Intel in weirdness, they decided to release a top of the line asymmetric design with the 7950X3D.

Only one of this gaming beast CPU’s two CCDs (modules containing 8 cores each) has access to the expanded L3 V-Cache, and the decision on which one to use is up to Windows Game Bar. 
To our dismay, there is no hardware scheduler here. 
The chipset driver and a Windows toggle decides which mode is better.

Since yuzu and basically any other emulator are not registered as games by Windows, the user will have to manually intervene and enable `Game Mode` in order to let the chipset driver profile performance and decide which CCD will provide the best performance.

Doing this should also benefit every user, not just 7000X3D ones, as Windows uses the toggle to allocate resources (RAM, threads) to the affected program, so it’s not a bad practice at all!
 
Here are the steps:

With yuzu or any other emulator/program of choice open, press `Windows + G` and go to the Settings cogwheel.

{{< imgs
	"./xbox1.png| Bet you didn’t know about this extra bloat in Windows"
  >}}

Then enable `Remember this is a game`.

{{< single-title-imgs-compare
	"And just like that, better performance!"
	"./xbox2.png"
	"./xbox3.png"
>}}

That’s it! 

Now Windows will allocate resources in a smarter way, and Ryzen 7000X3D users will get the best performance out of their shiny new CPU. 
Testing also shows that this helps improve performance with proper P-Cores and E-Cores allocation on current Intel CPUs too.
For older Ryzen users, the latest chipset update that enables the performance profiling for the 3D Zen4 products reportedly also improves performance slightly for any other older CPU.

Who can say no to free performance after two clicks, right?

### Intel, please fix your Vulkan support

We’re waiting for Intel to fix their SPIR-V compiler crashes on the Windows drivers. 
In its current status, any game can crash at any moment if you use Vulkan, and unlike AMD who solved most of their OpenGL issues with a rewrite, Intel doesn’t get a fallback option with the old graphics API, which in its current status only renders almost everything in black.

{{< imgs
	"./intel.png| This crash can happen at any moment"
  >}}

Frustratingly, this isn’t a problem with the Mesa Linux drivers, or the old Gen9/9.5/11 iGPUs and its discontinued Windows drivers, so it’s a proper critical regression affecting the new driver branch that will have to wait until AAA native PC games are running well enough to give the developers time to focus on the “less important stuff”, like professional programs, and console emulators.

## Future projects

I’ve been kidnapped by our devs, so no leaks this time. I promise more for next month!

There is one thing I’m allowed to mention, recent core timing changes have reduced CPU use by a 5-20% across the board on Windows depending on the total thread count, this means better performance and reduced power consumption, especially benefiting mobile devices like laptops and handhelds.
This change is already in both Mainline and Early Access, but we’ll talk more about it and other nice stuff next month.

That’s all folks!

Thank you Alicia for the good laughs censoring that pic.

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
