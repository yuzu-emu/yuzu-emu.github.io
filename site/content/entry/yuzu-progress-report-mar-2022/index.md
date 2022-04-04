+++
date = "2022-04-01T12:00:00-03:00"
title = "Progress Report March 2022"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Hi yuz-ers, glad to have you back. 
This month we have an emulator inside an emulator, parts of Project Y.F.C. being added, graphical fixes for old and new titles, and more!

<!--more-->

## PSA for NVIDIA users: Part 4

Yes, there is more. This time we have a blessing and a curse. 

While the latest 5XX.XX series drivers fixed tessellation issues affecting `Luigi’s Mansion 3` and improved performance in Vulkan, they also introduced a crash when blitting MSAA images, meaning that running games like `Monster Hunter Rise`, `Rune Factory 5`, `Sonic Colors Ultimate`, and several others at resolutions different than native would result in a crash.

Thankfully, [epicboy](https://github.com/ameerj) {{< gh-hovercard "8076" "workarounds the issue by using 3D helpers" >}} like it has been done for AMD and Intel drivers.

Now, to be fair, blitting MSAA images is against the Vulkan specification, so Nvidia is in the right to no longer allow it.
It’s just a bummer to have that sudden change in behaviour with something that was previously allowed and working.

Tagging along, a PSA for AMD users too, the currently latest 22.3.2 driver, which adds support for the `VK_KHR_workgroup_memory_explicit_layout` extension, breaks fishing in `Animal Crossing: New Horizons` and can possibly make other games crash.
Revert to 22.3.1 if you find such a regression.

## The Vulkan emulator

[byte[]](https://github.com/liamwhite), a newcomer to yuzu but in no way a novice at the art, arrived with a very interesting `Pull Request`, {{< gh-hovercard "8000" "implement `Wii Hagi` emulator support" >}} into yuzu.

This *official Nintendo emulator* (totally not outside their own ToS, they swear) is what allows the titles contained inside `Super Mario 3D All-Stars` to work. 
This means getting `Super Mario Galaxy` and `Super Mario Sunshine` playable, with `Super Mario 64` support coming at a later date, as this game needs a complete JIT service implementation.

byte[] didn’t stop there, several other changes were also implemented.

{{< gh-hovercard "8024" "Implementing SPIR-V shader support for register-addressed const buffer accesses" >}}, which also includes the `LDC.IS` access mode (the variant of an instruction), allows Mario to have his body in this dimension on `Super Mario Sunshine` and `Super Mario Galaxy`.

{{< single-title-imgs-compare
	"Super Mario Sunshine"
	"./invisbug.png"
	"./invisfix.png"
>}}

&nbsp;

{{< single-title-imgs-compare
	"Super Mario Galaxy"
	"./smgbug.png"
	"./smgfix.png"
>}}

`Super Mario Galaxy` uses a combination of depth buffer and stencil buffer to “see” the objects behind the star pointer used to shoot star bits.
That’s right, a texture determines game physics.

{{< gh-hovercard "8030" "Properly handling that S8D24 < > ABGR8 texture conversion" >}} solves wrong collisions with the poor star bits.
{{< gh-hovercard "8036" "A later fix solves issues with Nvidia drivers" >}}.

{{< single-title-imgs
	"No star bits for you until you finish your homework (Super Mario Galaxy)"
	"./texturebug.mp4"
	"./texturefix.mp4"
>}}

A shader miscompilation (a bad assumption on yuzu’s part, oops) caused interesting black holes in Sunshine.
{{< gh-hovercard "8038" "Fixing the oopsie" >}} gives Delfino the intended “shading”, and most likely silently solves issues in other games too.

{{< single-title-imgs-compare
	"Super Mario Sunshine"
	"./miscompbug.png"
	"./miscompfix.png"
>}}

And finally, {{< gh-hovercard "8074" "fixing a bottleneck in the buffer cache" >}} eliminates slowdowns and helps improve performance by up to approximately 4.5x in Galaxy.
Again, this could have a positive impact on other games, but don’t expect it to be in such a dramatic way.

[Merry](https://github.com/merryhime) updated [dynarmic](https://github.com/merryhime/dynarmic) to the latest version to provide better support for `Super Mario Galaxy`, {{< gh-hovercard "8054" "adding support for accelerated SHA256 CPU instructions" >}}, among other changes.
This avoids softlocking Galaxy at the final level.

{{< single-title-imgs
	"This toad sure likes to talk a lot (Super Mario Galaxy)"
	"./creditbug.mp4"
	"./creditfix.mp4"
>}}

## POYO!

`Kirby and the Forgotten Land` turned out to be one of the best platformers of recent times, and also quite a challenge for our devs.

epicboy jumped in to keep the ball rolling and started by solving the geometry pop-ins that are very noticeable in the first gameplay scenes.

{{< single-title-imgs
	"That tree just pops! (Kirby and the Forgotten Land)"
	"./popbug.mp4"
	"./popfix.mp4"
>}}

This was achieved by {{< gh-hovercard "8023" "improving the accuracy of the constant buffer uploads" >}}, and has the added benefit of also fixing rendering issues in `Monster Hunter Rise`, making it playable.

{{< single-title-imgs
	"Such pretty locations (MONSTER HUNTER RISE)"
	"./rise.png"
	"./rise2.png"
	"./rise3.png"
>}}

{{< single-title-imgs-compare
	"From Monster to Monster Hunter (MONSTER HUNTER RISE)"
	"./risebug.png"
	"./risefix.png"
>}}

Another issue that was quickly pointed out, is that Nvidia hardware would eat VRAM like crazy, to the point of filling up even high end hardware in minutes.

{{< imgs
	"./kirbyvram.png| PC requirements: RTX 3090? Not on our watch!"
  >}}

{{< gh-hovercard "8093" "Unmapping pre-existing rasterizer memory before the memory range was mapped" >}} solves the issue and allows Nvidia users to not require RTX 3090 levels of hardware to get a good experience.

ED: epicboy informs that this pull request may introduce regressions that are being investigated, and that VRAM consumption is further improved by using the Disable Dynamic Resolution mod [available on our site](https://github.com/yuzu-emu/yuzu/wiki/Switch-Mods).

epicboy also {{< gh-hovercard "8116" "fixed an svc break crash if the game was run with Asynchronous GPU Emulation was enabled" >}}, an option that should always remain enabled.

And finally, an off-by-one error in the stream buffer was responsible for causing vertex explosions.
The solution is to {{< gh-hovercard "8127" "simplify the implementation of stream buffers" >}}.
As the new implementation can only feed a single upload request at a time, this may provide a small performance loss in some cases, but it’s sure to fix several other games in the process.

{{< single-title-imgs-compare
	"A look inside Kirby's powers? (Kirby and the Forgotten Land)"
	"./poyobug.png"
	"./poyofix.png"
>}}

AMD Radeon users may suffer from more stuttering than usual when running this game depending of the specific GPU they have.
This is caused because the available Windows AMD drivers don't offer support for the `VK_EXT_vertex_input_dynamic_state` extension, which helps reduce the shader count by 3 times the original amount.
The Mesa RADV support for the extension is broken in RDNA2 hardware as reported last month, so it remains blacklisted along with the Intel Windows support. 
Nvidia hardware and older AMD GPUs on Linux offer proper support and enjoy the much reduced shader count, and the associated reduced stuttering when building their cache.
CPU thread count will be critial here, at least until AMD adds official support for the extension.

## Graphical changes and optimizations

[bunnei](https://github.com/bunnei) has the highlight of this month with the {{< gh-hovercard "8050" "rewrite of the `NVFlinger` implementation" >}}, a part of `Project Y.F.C`.

NVFlinger is the service in charge of presenting to the display, so any improvement in this area will bring more stable frametimes, perceived as less stuttering even when the frame rate count stays at a solid 60 FPS.

Our original implementation was basically guess work done back in 2018, it was lacking in *several* areas.
For example, yuzu would block threads until the last frame was ready to be presented. 
This obviously leads to undesired stuttering unrelated to system performance.

The new implementation is on par with the Nintendo Switch, based on the [Android Open Source Project](https://source.android.com/).
This means yuzu changes its licence from GPLv2+ to GPLv3+ to accommodate the Apache 2.0 licence AOSP uses.

{{< single-title-imgs
	"ABZU"
	"./abzubug.mp4"
	"./abzufix.mp4"
>}}

Games like `ABZU` and `DRAGON BALL FighterZ` improve considerably, but other games like `Xenoblade Chronicles 2` require fixes that are still in testing in `Project Y.F.C.`

{{< single-title-imgs
	"DRAGON BALL FighterZ"
	"./dbzbug.mp4"
	"./dbzfix.mp4"
>}}

Enjoy the smooth as butter gameplay!

[asLody](https://github.com/asLody) has been working on optimizing the `LOP3-LUT` shader instruction with the objective of improving performance and helping with getting `Hades` to work. 
Sadly, this first implementation caused some issues.

[degasus](https://github.com/degasus), which you may know from *a certain* [Dolphin emulator](https://dolphin-emu.org/?nocr=true), {{< gh-hovercard "7989" "managed to implement a patch" >}}, which later turned into its own pull request, that solved the issues and achieved the same level of optimization.

This is not enough to get Hades running, `Project Y.F.C` will take care of that in the near future, but it’s a small global performance boost that mostly benefits low end GPUs. 
It also provides easier to read code when performing maintenance.

We documented our problems with video decoding on Linux Flatpak builds in previous progress reports.
A check was added to avoid such crashes, but in the process, Windows builds got stuck on CPU decoding!
Users of low thread CPUs could immediately tell the difference during video playbacks.

By simply {{< gh-hovercard "8066" "disabling this check on Windows" >}}, Windows builds can again enjoy the extra performance gained from decoding via GPU.
If video playing feels smoother, you now know the reason! Thanks epicboy!

[toastUnlimited](https://github.com/lat9nq) started work on improving yuzu’s Vulkan error handling.

This is a very common issue caused mostly by very outdated GPU drivers installed by Windows Update, or custom slower drivers provided by laptop manufacturers that are used to lie on battery life metrics or keep up with cheapened cooling solutions.
This most commonly affects Intel GPUs, but Vega based Radeon GPUs can also suffer from it ocasionally.

Another popular reason for this issue, as mentioned in [previous reports](https://yuzu-emu.org/entry/yuzu-progress-report-dec-2021/#ui-changes) are outdated Vulkan injectors breaking support altogether.
Software like OBS Studio, OBS Streamlabs, Bandicam, Action!, Overwolf, GShade, iCUE, MSI Afterburner, *anything* with an overlay that injects into Vulkan can completely break rendering if it is outdated, or the developers don’t keep up with recent Vulkan releases.

{{< gh-hovercard "7986" "toast’s fixes solve 2 different scenarios" >}}.
Changing the behaviour of how yuzu handles both GPU instance creation and rendering instance creation helps avoid direct to desktop crashes caused by outdated drivers or broken Vulkan injectors.

There’s more work to do, but this lets us get closer to offering Vulkan as the default graphics API in the future.

epicboy found out that {{< gh-hovercard "8106" "avoiding a doubly locked mutex" >}} fixes a crash when using Extreme GPU accuracy on the OpenGL backend, making it a safe option for those aiming for the most possible accurate rendering.
This option is only accessible from `Emulation > Configure... > Graphics > Advanced`.

He also includes an {{< gh-hovercard "8068" "optimization focused on eliminating `if(false) …` branches on the shader code" >}}. 
This has the added benefit of reducing shader build times ever so slightly. Hey, less shader stuttering is less shader stuttering!

## Not all changes benefit everybody

In an effort to reduce RAM use on yuzu, Merry tested {{< gh-hovercard "8016" "reducing the size of the code caches" >}} in dynarmic.
During internal testing, the change proved to be perfectly fine, a small reduction of memory use with no side effects.

Once the result went live, users started to complain, reports of sudden stuttering affecting `Super Smash Bros. Ultimate` were on all communication channels.

Dynarmic has to emulate whatever instruction a CPU lacks, and that takes more cache space.
Older hardware, for example Skylake based CPUs (gen. 10 and older) or early first and second generation Ryzen CPUs, would not only have smaller caches, but also would lack support for some instructions more modern CPUs provide.

Once the cache runs out, a recompilation happens. 
This results in impressive lag spikes experienced during Smash battles a few seconds into the match.

{{< gh-hovercard "8070" "Reverting the change" >}} was all that was needed to solve the issue. Happy Smashing!

## General bugfixes

Recent Nintendo Switch firmware updates changed the behaviour of the inline on-screen keyboard.
[Morph](https://github.com/Morph1984) {{< gh-hovercard "8041" "updated yuzu’s emulated equivalent" >}} to match the new versions, allowing games from the `Monster Hunters` series to be playable without having to transfer a save file after character creation was finished.

{{< imgs
	"./osk.png| The hardest part of starting any new game, character naming... (MONSTER HUNTER RISE)"
  >}}

Morph also has worked on `MiiEdit` the applet for Mii creation that [german77](https://github.com/german77) started working on last month.
Morph’s changes {{< gh-hovercard "8031" "add support for games requiring older firmware versions" >}}.

Our holy war against crashes at shutdown continues to rage on.
Merry {{< gh-hovercard "7999" "fixed a deadlock on exit that was hidden in the logging thread" >}}.
It’s like the Hydra, you cut one head, two new ones show up.

toastUnlimited has been having fun working on improving yuzu-cmd.

Adding the `-c` or `--config` argument will allow the user to {{< gh-hovercard "8025" "specify a custom location for a configuration file" >}}. 
Can be useful for specific game settings.

{{< gh-hovercard "8026" "Extended memory layout support was added" >}}.

SDL2 has a limitation in that it doesn’t automatically resize the “rendering canvas” when you enter in fullscreen mode.
yuzu previously used the resolution of the native game, so either 1280x720 in undocked mode and 1920x1080 in docked mode.
With this change, {{< gh-hovercard "8027" "the resolution of the desktop will be used instead" >}}, allowing proper exclusive fullscreen support, and letting the scaling filters display as they should.

[v1993](https://github.com/v1993) applied some changes to the sockets (LAN and LDN) service, {{< gh-hovercard "8028" "allowing inexact address length values" >}}.
This prevents crashes on `Minecraft` v1.12.1, as the game passes zero as the value for the address length. 

toastUnlimited gave us a simple but really important QoL change, {{< gh-hovercard "8035" "disabling the `Web Applet` by default" >}}.
Too many games have issues with it, it’s responsible for blocking controller input, and not many users are interested in the tutorials the service is mostly used for, so it’s a sacrifice worth the small loss.
For anyone interested, the Web Applet can be re-enabled from `Emulation > Configure… > General > Debug > Disable Web Applet`.

And continuing on the topic of quality of life changes, yuzu will now {{< gh-hovercard "8107" "save the fullscreen status" >}} for future boots.
Close or stop a game while in fullscreen and the emulator will automatically maximize for you when you start the next one!

german77 couldn’t let a month pass without contributing a pull request!
He’s fighting to make `Flip Wars` compatible.
{{< gh-hovercard "8120" "''Correctly adding a Signalling events on `AcquireNpadStyleSetUpdateEventHandle`" >}} makes the game playable.

{{< single-title-imgs
	"Flip Wars"
	"./flip1.png"
	"./flip2.png"
>}}

## Future projects

Merry is testing {{< gh-hovercard "8089" "adding a `Paranoid` CPU accuracy" >}}, an option not for the faint of heart!
It would disable most optimizations (but not fastmem) with the main purpose of aiding in CPU optimization debugging, but we all know it will be used for extra comfort if there is CPU performance to spare.

`Project Gaia` is having some minor delays caused by new additions Nintendo made on recent firmware updates.

And on `Project Y.F.C.`, we’re measuring performance increases, as well as getting games to render for the first time:

{{< imgs
	"./hades.png| It's one hell of a game! (Hades)"
  >}}

[That’s all folks!](https://www.youtube.com/watch?v=b9434BoGkNQ) Thank you for staying with us, and see you next month!

We will include relevant kernel changes in the next report.

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
