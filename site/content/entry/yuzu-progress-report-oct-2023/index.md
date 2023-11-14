+++
date = "2023-11-13T12:00:00-03:00"
title = "Progress Report October 2023"
author = "GoldenX86”
forum = 0
+++

Hello yuz-ers! This past month we got a plethora of GPU fixes, new native applets begin working, a lot of work poured into the Android builds, some interesting stuff coming in the future, and more. Let’s get to it!

<!--more--> 

## Wowie Zowie!

New Mario game! And it’s an excellent one at that.
`Super Mario Bros. Wonder` joins the fray of 2D gameplay Mario games and refines its gameplay to new *wonderful* levels, I’m not sorry.

{{< imgs
	"./wonder1.png| Such a pretty game (Super Mario Bros. Wonder)"
  >}}

The game didn’t boot at release due to incorrect free memory reporting in the kernel.
Thankfully, [byte[]](https://github.com/liamwhite) quickly found the culprit. It was a {{< gh-hovercard "11825" "single line change!" >}}

{{< imgs
	"./wonder2.png| Hope your platforming skills are up to par (Super Mario Bros. Wonder)"
  >}}

However, this wasn’t enough to get the game playable.
Depending on the performance, `Super Mario Bros. Wonder` switches between double and triple buffer VSync presentation modes. 
This is an old-school technique to guarantee frametime consistency, that switches between 60 and 30 FPS if the game can’t sustain a solid 60 FPS experience at any given moment.

{{< single-title-imgs
    "Classic Mario (Super Mario Bros. Wonder)"
    "./wonder3.png"
    "./wonder4.png"
    >}}

yuzu wasn’t ready for this behaviour due to a misunderstanding of how nvnflinger works.
On Android, SurfaceFlinger (the OG Flinger) can free buffers that are beyond the maximum count a program has allocated, but nvnflinger (the Switch's fork) is never supposed to free any buffers unless the program requests it.
Maide made a {{< gh-hovercard "11827" "few presentation code changes" >}} to reflect this behaviour change, and players are now set to grab those fun Wonder Flowers!

Bet you didn’t expect to see the sole input change of the month here, yet here we are.
`Super Mario Bros. Wonder` *loves* vibration, to a point of saturating the old implementation when using HD Rumble on Nintendo controllers (Joy-Cons, Pro Controllers).
This is because waiting for the controller to reply takes time, more than the game would have the patience for, leading to noticeable and bothersome “vibration stuttering”, that’s right ASTC, you’re not the only stuttering kid in town.
By{{< gh-hovercard "11852" "moving vibration calls to a queue" >}} the situation is, while not entirely solved, *much* more pleasant to the hands (or what have you, we don’t judge here).

## The GPU changes

Undefined behaviour: the politically correct way to say “here be dragons”.
It’s a good practice to avoid dragons–I mean, undefined behaviour–in your code, especially when dealing with a complex graphics API like Vulkan.

Remember our explanation of `depth stencils` [back in August](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2023/#more-gpu-changes)? You may wish to reread that, as it provides useful context to what we will talk about next.

When a game is using a depth buffer, it is usually drawing into a busy 3D scene while taking advantage of a hardware-accelerated process called depth testing.

During depth testing, the GPU hardware determines if a pixel is visible or hidden (occluded) by another pixel. This is decided by their depth values (i.e., how far away they are from the camera).
The depth test compares the depth value of every pixel in every triangle with the depth value already stored in the depth buffer (a special image that records the depth of each pixel).
If the pixel is further away than what has already been drawn on the scene, then the pixel is discarded; if it is closer, then it is kept and the colour buffers are updated.

It is possible for a game to use depth testing alone, and turn the actual writes to the depth buffer off for specific elements, and many games do this when rendering partially transparent objects.
However, the opposite is not possible–it wouldn't make any sense to update the depth buffer without first testing its values.
yuzu’s masked clear path for depth/stencil buffers has a shader which updates the depth buffer, and so enables depth writes, but forgot to also enable depth tests.
Most of the time, this worked by coincidence, as the game was enabling depth tests and yuzu was not clearing this state.
However, not all games enabled them, and without depth tests, games like `Super Mario 64`, part of `Super Mario 3D All-Stars`, can’t properly render the face of a certain character (I *think* his name is in the title of the game.)

{{< single-title-imgs-compare
	"Wonder who he is (Super Mario 64)"
	"./depthbug.png"
	"./depthfix.png"
>}}

Thanks to {{< gh-hovercard "11630" "the work done" >}} by [Maide](https://github.com/Kelebek1), Mr. Mario Mario renders correctly now.

Not stopping there, Maide’s dragon-hunting continued for another pull request.
One advantage of using the standard Vulkan Memory Allocator (VMA for short) is how it can help sanitise code.

VMA will raise asserts if things are wrong somewhere.
In this case, a mapped device local buffer (a buffer on VRAM, for providing quicker access to the GPU than the CPU) was allocated to the host memory (system RAM, closer to the CPU), giving the CPU quicker access to it.
VMA is very clear here: device local buffers should not be allocated as mapped because they are outright *not* intended for CPU access.

Making VMA happy {{< gh-hovercard "11734" "eliminated another dragon," >}}, and led to a small optimization.

Thanks to users' reports, [Blinkhawk]() managed to figure out how the new query cache was causing memory leaks in many games, including `The Legend of Zelda: Tears of the Kingdom`.
After {{< gh-hovercard "11646" "some slight tweaking," >}} RAM consumption is put in its place.

Starting a campaign to combat holes in the requirements for formats on yuzu, [Squall-Leonhart](https://github.com/Squall-Leonhart) has been working on implementing some of the necessary format conversions, like  `D32_SFLOAT`.
For this particular depth format on Vulkan, it can {{< gh-hovercard "11677" "now be converted" >}} to `A8B8G8R8_UNORM` when the game needs this behaviour.
Additionally, {{< gh-hovercard "11716" "adding support for" >}} the `Z32`, `FLOAT`, `UINT`, `UINT`, `UINT`, `LINEAR` variants in the internal look-up table helps complete the deal.
This work solves rendering issues in games like `Disney Speedstorm` and `Titan Glory`.

{{< single-title-imgs-compare
	"Look, the most powerful mouse in the world (Disney Speedstorm)"
	"./depthbug.png"
	"./depthfix.png"
>}}

Some games also make aliases of images in the D32 depth format.
Since a similar, but flipped, limitation with format conversion was present here too, `ARGB8_SRGB` and `BGRA8_UNORM/BGRA8_SRGB` {{< gh-hovercard "11795" "can now be converted to" >}} D32_FLOAT to provide proper compatibility.

{{< imgs
	"./gothic.png| Aged graphics have this feel of nostalgia (Gothic)"
  >}}

Continuing with this streak, Maide {{< gh-hovercard "11688" "implemented" >}} the `X8_D24` depth format, allowing `A Sound Plan` to start rendering.
However, more work is needed to make this game properly playable.

Sudden Explanation Time!

Robustness is a feature Vulkan provides that lets developers handle invalid memory accesses in a cleanly defined way.
This can help prevent the application from crashing or ~~summoning dragons~~ invoking undefined behaviour when some part of the code tries to access memory out of bounds.
Robustness can also help with compatibility between different devices and drivers, and this is the area we’re focusing on, as it helps deal with invalid buffer indexes.

For some reason, either Maxwell and Pascal NVIDIA GPUs have broken robustness support on uniform buffers, or yuzu’s codebase makes a wrong assumption somewhere (most likely the latter). As a result, those two NVIDIA GPU generations (GTX 750/GTX 900/GTX 1000 series) suffer from oversized graphics on `Crash Team Racing: Nitro Fueled`.
{{< gh-hovercard "11789" "Manually applying the correct robustness values" >}} on the affected GPU architectures solves the issues, while also opening an investigation of what causes this problem in the first place.
Maide gets to play detective yet again, dear Watson.

pics

Maide also fixed a silent issue hidden in the shadows.
Images were being {{< gh-hovercard "11744" "marked as rescaled" >}}, even if the resolution scaler was not in use (running at 1x). 
This led to a slight overhead and some asserts.
While no game bug was known to be caused by this, it’s good to have preemptive fixes for once instead of just reactionary ones.

In the meantime, Maide has also been removing image alias bits for all image attachments in an effort to allow the drivers to use more memory optimizations.
This pull request also includes {{< gh-hovercard "11747" "some other minor fixes" >}} with it.

By {{< gh-hovercard "11775" "implementing" >}} the first and subsequent draw commands for vertex arrays, Super Meat Boy finally renders correctly! No more black screens!

{{< imgs
	"./smb.png| Well done (Super Meat Boy)"
  >}}

And now, one for the Linux gang.
[v1993](https://github.com/v1993) tested and {{< gh-hovercard "11786" "re-enabled CUDA video decoding" >}} on Linux, allowing better video decoding performance for NVIDIA users (running the proprietary driver, of course).
We previously disabled CUDA by default because it can fail on systems running both a dedicated NVIDIA GPU and a dedicated AMD GPU (iGPUs are fine), a decently rare configuration that only a few people, like your writer, actually ever use.

For those few users running mixed hardware vendors on your systems, please manually  select “CPU Video Decoding” if you’re affected by video decoding issues now. 
This was the previous default behaviour.

We got user reports of crashes happening when grabbing a Grand Star in `Super Mario Galaxy`, as part of `Super Mario 3D All-Stars`.
byte[] found that the problem is in how the Vulkan scheduler incorrectly flushes data.
The solution? [Use a lock](https://www.youtube.com/watch?v=SNgNBsCI4EA). 
And if that doesn’t work, {{< gh-hovercard "11806" "use more locks." >}}
Happy Star hunting!

To improve OpenGL support even further beyond, [Epicboy](https://github.com/ameerj) returns.
First, he found that the `shfl_in_bounds` function, which is used to perform a warp-level parallel reduction in compute, could cause some threads to be inactive and return invalid results. 
{{< gh-hovercard "11847" "The solution" >}} was to move the `shfl_in_bounds` check after the `readInvocationARB` function, which requires all threads to be active, to avoid ~~dragons~~ undefined behaviour. 
This fixed some graphical corruption issues in unit tests, which should lead to fixes in real games too.

Next, a simple gift from epicboy: {{< gh-hovercard "11904" "force enabling" >}} `Threaded optimization`, an NVIDIA specific OpenGL optimization that enables the use of a new separate CPU thread for graphics rendering.
This is a solid performance boost for those running OpenGL with NVIDIA hardware.
And for those asking, yes, Vulkan assigns a separate thread for rendering too–it can be done on an API level, instead of with a driver-level setting.

Maide found a problem in our compute shaders, which caused invalidations in the buffer cache.
yuzu has a lot of code to track the sizes of buffers used by the games.
You can get a buffer with a range going from 1 to 3 and another with a range of 3 to 5. No overlap, no issue.
If after the game runs for a while, a third buffer shows up requiring a range of 1 to 5, the previous two buffers would be considered to overlap it, and are deleted. 
The old information is moved to the new third buffer.
While this was already working for graphics-related buffers, it didn’t correctly consider compute buffers.

{{< gh-hovercard "11859" "Adding the missing loop" >}} to fix this behaviour, problems ranging from minimal graphical issues, to completely broken game logics, are potentially solved.
You know what they say: with compute, the sky's the limit. Just ask AI developers.

Another optimization Maide implemented affects how buffers are handled after they are successfully deleted.
The previous method would unnecessarily create several copies, wasting resources.
By {{< gh-hovercard "11683" "removing one synchronisation step," >}} only the exact amount of needed copies are used.

Here’s a solution for a long-standing issue: some 2D games were flipped on AMD, Intel, and Android GPUs.
Games can use different APIs to run on the Switch. 
Nintendo allows the use of Vulkan, OpenGL, and their proprietary API, NVN. 
This poses a problem for emulation on Vulkan, since [only NVIDIA GPUs](https://vulkan.gpuinfo.org/listdevicescoverage.php?extension=VK_NV_viewport_swizzle&platform=all) support the viewport swizzle extension (which allows for transforming viewports).

To allow other GPU vendors to render games properly, a fallback (and slower) implementation was made, able to handle OpenGL games.
A tiny error in its implementation made it unable to correctly track invalidations of the viewport flip state, resulting in garbled graphics in several games.
byte[] {{< gh-hovercard "11893" "solved" >}} that issue with a one-line change, making games like `Stardew Valley`, and `Streets of Rage 4`, finally render properly on non-NVIDIA hardware.
No more mirrors needed!

{{< imgs
	"./sv.png| THE cozy farming game (Stardew Valley)"
  >}}

While investigating this, a similar but different issue came to light.
Many OpenGL games (that is, games using OpenGL to render, not yuzu rendering on OpenGL) ask for a 1920x1080 framebuffer, regardless of whether the game is running in handheld or docked mode.
The game then simply moves and resizes the region it’s rendering to inside that 1920x1080 buffer, like moving a small box inside a bigger box if you will.
In the final step, the image is flipped and sent to the bottom of that 1080p render target.
yuzu was incorrectly rendering only the top of the render target due to how it used to calculate that flip in the final pass.

{{< gh-hovercard "11894" "Adjusting" >}} this behaviour made `Tiny Thor` render correctly in handheld mode.

{{< imgs
	"./tt.png| To Valhalla (Tiny Thor)"
  >}}

And to close the graphics section, by following this chain of events, the previous pull request helped spot a bug in our Vulkan presentation that led to `Arcaea` being incorrectly cropped in handheld mode.
95 lines of {{< gh-hovercard "11896" "cropping-behaviour code changes" >}} later, and byte[] solved the issue.

{{< imgs
	"./tt.png| Good aesthetics (Arcaea)"
  >}}

## Android changes

This month the Android build got not only great UI changes to improve QoL, but device compatibility was greatly improved for Adreno users.
Here’s the full list!

- A new {{< gh-hovercard "11649" "GPU driver manager" >}} was developed by [t895](https://github.com/t895), allowing the listing of multiple drivers, useful for quickly switching between proprietary Qualcomm or Mesa Turnip releases, or several versions of each. Due to the beta status of Turnip drivers and the immature code of Qualcomm drivers, the latest release is not always the best.

{{< imgs
	"./gpu.png| For all your driver-switching needs!"
  >}}

- byte[] solved a {{< gh-hovercard "11656" "crash related to surface recreation," >}} which could be triggered by simply rotating the device.
- byte[] solved an issue affecting some Android devices that ship an {{< gh-hovercard "11876" "outdated Vulkan 1.1 loader" >}} instead of the current latest 1.3, causing the device to report older features than the driver in use actually supports. This resulted in specific Adreno 600 and 700 devices crashing at boot when using any Mesa Turnip driver version. Forcing the correct Vulkan 1.3 features the driver supports solves the issue. We’ll expand on this at the end of the article.
- t895 implemented a {{< gh-hovercard "11909" "home settings menu split into grids" >}} for devices with bigger screens and/or higher DPIs. This should please our tablet and foldable users, enjoy!

{{< imgs
	"./wide.png| Landscape lovers rejoyce"
  >}}

- byte[] {{< gh-hovercard "11910" "fixed another case" >}} where yuzu would fail to recreate the surface on screen rotations.
- t895 moved the {{< gh-hovercard "11915" "game list loading process to a separate thread" >}} to reduce stuttering when opening yuzu. The process still takes a similar amount of time, but the perceived smoothness is very welcome.
- t895 solved an issue that caused the {{< gh-hovercard "11916" "touch buttons overlay to get stuck" >}} while drawing the in-game menu from the left side.
- While waiting for a controllers settings menu, t895 fixed a bug that caused {{< gh-hovercard "11925" "all controller input to move to player 2" >}} on some devices, blocking users from playing most games. Devices with integrated controllers should have a much better experience now.
- And finally, following the [recent changes](https://yuzu-emu.org/entry/yuzu-progress-report-sep-2023/#of-miis-and-applets) in the desktop version, t895 added a {{< gh-hovercard "11931" "menu to access the currently supported applets," >}} Album and Mii editor, along with the Cabinet applet to manage amiibo data. Wii think you will have fun!

{{< single-title-imgs
    "We hope to expand this selection in the future"
    "./cabinet1.png"
    "./cabinet2.png"
    >}}

{{< single-title-imgs
    "Wii want to play"
    "./mii.png"
    "./album.png"
    >}}

The settings menu was also reorganised:

{{< imgs
	"./settings.png| Hope it’s more convenient now"
  >}}

## UI and Applet changes

After a rocky start, thanks to the early work of [roenyroeny](https://github.com/roenyroeny), [boludoz](https://github.com/boludoz), and [FearlessTobi](https://github.com/FearlessTobi) we now have proper {{< gh-hovercard "11705" "shortcut creation" >}} support for Windows too!

To access this feature, simply right click a game in yuzu’s game list, select Create Shortcut, and pick if you want it on your desktop or the applications section of the start menu, allowing you to start games with a quick search or pin them in the menu/taskbar.

{{< imgs
	"./shortcut.png| Populate that taskbar"
  >}}

Helping improve this, [german77](https://github.com/german77) made the required changes to {{< gh-hovercard "11740" "save multiple resolutions per icon," >}} making smaller sized desktop icons much more readable than before.

{{< imgs
	"./icons.png| Scaling images down doesn’t always look the best"
  >}}

[DanielSvoboda](https://github.com/DanielSvoboda) made several changes in file system handling to {{< gh-hovercard "11749" "improve directory path detection" >}} for the shortcuts, making them far more usable and stable.
Thank you!

Some UI changes are a small detail but they are still a needed one. 
For example, byte[] fixed {{< gh-hovercard "11769" "an issue" >}} where users could interact with the game list before it finished rendering.

Work on improving user experience (UX) is always welcome, it is your writer’s belief that UX is as important as proper functionality, and should never be ignored.
To improve the quality of life, [flodavid](https://github.com/flodavid) changed the behaviour of how users interact with the {{< gh-hovercard "11779" "number of connected controllers" >}} in the controls settings.
Users can now more intuitively click the green lights at the bottom to select how many players/controllers active they want.
Thank you!

{{< imgs
	"./controls.png| Epic Smash sleepover!"
  >}}

Give it a try, you will find it’s far more pleasant now.

Another nice UX addition is by [Macj0rdan](https://github.com/Macj0rdan), who implemented {{< gh-hovercard "11903" "controlling the game volume" >}} with the mouse wheel if the pointer is placed over the volume button in the UI, removing the need to click it and drag a small slider.
Thank you!

Continuing his work on applets support, german77 implemented the `SaveScreenShotEx0` {{< gh-hovercard "11812" "service and its variants," >}} allowing users to take captures from within the games themselves instead of globally with the screenshot hotkey.
This works for games like `Super Smash Bros. Ultimate` and others.
Although it is noted that screenshot editing is not available yet.
Homework for tomorrow!

{{< imgs
	"./smash.png| Save your best moments (Super Smash Bros. Ultimate)"
  >}}

german77 also {{< gh-hovercard "11892" "implemented the" >}} `SaveCurrentScreenshot` service, allowing users to take screenshots on `Pokémon Scarlet/Violet` when it has its latest update installed.
Happy selfie shooting!

{{< imgs
	"./poke.png| Feeling cute, might capture a shiny later (Pokémon Scarlet)"
  >}}

More than a proper report about a change here, this is more a call to the userbase to report issues on the proper channels instead of just ranting online.
One of the changes german77 introduced broke the `Find Mii` stage in `Super Smash Bros. Ultimate`.
Since it’s not a popular stage even among the Smash community, we didn’t notice this issue, and no one reported in our [Discord server](https://discord.gg/u77vRWY), [forums](https://community.citra-emu.org/c/yuzu-support/14), or [GitHub bug report page](https://github.com/yuzu-emu/yuzu/issues/new/choose), we only found out thanks to complains on Reddit.

This is a broad project with many “black box” areas, there will be bugs, tens of thousands of bugs, so it really helps to have reports on the official channels instead of just getting them lost online.

Ok writer rant over, by {{< gh-hovercard "11822" "creating random Miis" >}} with names, german77 solved the issue.

german77 also {{< gh-hovercard "11846" "expanded the character limit of cheats" >}} to more than 64 characters.
Cheat to your heart's content, the Ninja Lawyers are not watching you here.

You know our developers spend a lot of time opening and closing yuzu when byte[] can accurately measure that 10% of shutdown crashes are caused by the game list.
He found the issue was in how Qt deals with messages from objects that were destroyed or disconnected (like stopping the emulator while the game list is loading).
By {{< gh-hovercard "11846" "changing the behaviour" >}} of how the game list is reported to those events, another reason for shutdown crashes has been defeated.

## Kernel, CPU, and file system changes

byte[] has been having a lot of “fun” lately fixing and implementing kernel changes.
First off, he {{< gh-hovercard "11686" "implemented transfer memory," >}} fixed {{< gh-hovercard "11766" "incorrect page group tracking," >}} added the full {{< gh-hovercard "11914" "implementation of KPageTableBase," >}} and even {{< gh-hovercard "11843" "added" >}} nearly the entire KProcess implementation itself!

As preliminary work for NCE support coming in the near future, byte[] implemented {{< gh-hovercard "11718" "native clock support" >}} for arm64 devices running on Linux or Android.
No support for ARM Windows devices, as none has bothered to include a Vulkan driver yet.

The kernel was updated to {{< gh-hovercard "11748" "firmware version 17.0.0," >}} ensuring support for future games.

v1993 {{< gh-hovercard "11772" "solved some warnings" >}} that were spamming our build logs–namely, using `std::forward` where appropriate, and qualifying `std::move` calls.
This should solve build issues for those experimenting with Darwin Build Targets.

By user request, byte[] {{< gh-hovercard "11774" "further improved the build performance of RomFS mods" >}} by getting rid of some unnecessary object copies.
This also fixed a file handle leak, which now allows modders to edit mod files after stopping emulation, helping them work faster on those *juicy and delicious* game mods.

## Audio changes

Our audio connoisseur Maide found thanks to user reports that `Ancient Rush 2` would crash at the end of the first developers screen.
{{< gh-hovercard "11735" "Clearing the DPS buffer" >}} after each call execution closes the issue.

{{< imgs
	"./poke.png| Diggy Diggy Hole! (Ancient Rush 2)"
  >}}

Speaking of audio, byte[] accomplished another blow to shutdown crashes by {{< gh-hovercard "11778" "fixing a shutdown deadlock" >}} in the audio renderer.

## Hardware section

We have some sad news for the old Red Team guard, a warning for the Green Team, and very good news for Adreno droids.

### NVIDIA, our fault this time

The 545 and 546 series of drivers solved the high VRAM usage crashes, we reported this last month, but users reported crashes in games with these drivers.
While reverting to the 53X series of drivers solves the problem, this is not NVIDIA’s fault, not this time.
Mesa also has the issue with its last 24.X.X release, and having the top two drivers crashing under the same conditions is not a coincidence.

We found the problem is in how some shaders are being generated to the intermediate representation that is later used to get proper SPIR-V/GLSL/GLASM shaders to pass to the driver.
The fix will take some time to implement so for NVIDIA and Mesa users experiencing crashes in games like `Bayonetta 3`, please downgrade your drivers for the time being.

### AMD, giving a last hurrah to Polaris and Vega

The time has come, the last 2 remnants of the GCN architecture are in their way to be discontinued.
AMD started releasing [split drivers](https://www.anandtech.com/show/21126/amd-reduces-ongoing-driver-support-for-polaris-and-vega-gpus) for those products, which run outdated Vulkan driver branches compared to RDNA and newer hardware.
[The news](https://www.phoronix.com/news/Mesa-24.0-Faster-RADV-Vega) of AMDVLK, the official Linux AMD driver, killing support for these products means no new Vulkan drivers will be available.

This doesn’t mean the show is over for their owners. 
For the time being no new change breaks compatibility with the cards, and Linux Mesa drivers like RADV will continue to provide support, most likely extending it past what the Windows drivers report as supported, as it's usually the case with Mesa.

But for those stuck on Windows, this is the last ride.

GCN4.0, GCN5.0, you weren’t the most efficient cards, but you gave us good value on the worst moments, *years* of amazing gameplay, and good and funny FineWine moments.
We salute you and thank you for your impeccable service, few GPU architectures leave the stage with such a round of applause.

o7

### Turnip, a very quickly improving work-in-progress

yuzu uses a single codebase for all its releases, upstream/master/main, however you prefer to call it, Mainline, Early Access, and Android all start from there.
When improvements to the codebase are added, they eventually reach all releases, Android included.

What happens if we add support for `occlusion queries` (part of project Y.F.C.) to improve performance on all devices, and its implementation on Turnip drivers is not very robust? 
You get crashes that force users to remain on outdated [GitHub](https://github.com/yuzu-emu/yuzu-android/releases/) versions, and forces us to stall new Play Store releases until the problem gets investigated and solved.

The issue was found, reported, and resolved by Mesa in record time in their current Adreno 700 branches, which then driver repackers like [K11MCH1](https://github.com/K11MCH1/AdrenoToolsDrivers/releases) use to build packages Qualcomm users can load on emulators.

For this reason we *strongly* recommend Adreno 730 and Adreno 725 users to update to the latest [Release X](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/24.0.0-R-X) driver, which not only fixes the crashes caused by occlusion queries, but also the lack of support for the Adreno 725 and some variants (yes, there are several) of the Adreno 730. 
Not only desktop GPU vendors love to rename stuff.

By using this driver, we were able to launch newer Android builds with the latest upstream changes, and all Qualcomm users can safely use the latest GitHub builds if they prefer, which by the way are now properly signed, so you can just update from one to the next without uninstalling them.
If you want to test experimental and potentially unsafe but maybe faster changes before Play Store updates, now it’s much easier.

## Future projects

Let’s begin with what most people want to hear about, Project Nice for Android devices.
NCE is progressing very well, there are still some bugs to iron out. 
Games are becoming not only playable but also faster on devices with thermal restrictions, plus load and closing times are also much faster now.
One of the biggest roadblocks is ARCropolis/Skyline framework support, but we’re slowly but surely pushing through.
NCE has helped us understand issues in our CPU emulation in x86_64 too, so expect gains on both fronts.

{{< imgs
	"./smo.mp4| Recorded with a Red Magic 7S Pro (SUPER MARIO ODYSSEY)"
  >}}

No promises on a release date, as always, but as politicians love to say: “We’re working on it.”

{{< imgs
	"./bayo2.mp4| Destroying those touch screen controls! (Bayonetta 2)"
  >}}

Blinkhawk is *suggesting* your writer to inform you he is working on a new project seeking to make the GPU process agnostic, allowing multiprocess emulation within the GPU. 
We’ve been calling this simply “Multiprocess” internally.
Multiprocess is a mandatory step to start on UMA support, which will provide huge gains to iGPUs and SoCs users, as well as reducing RAM consumption.

That’s all folks! Sorry for the delay, university homework and finals are killing your writer.
Thank you for reading until the end. See you next time!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
