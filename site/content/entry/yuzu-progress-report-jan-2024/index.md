+++
date = "2024-02-06T12:00:00-03:00"
title = "Progress Report January 2024"
author = "GoldenX86"
coauthor = "CaptV0rt3x"
forum = 0
+++

Welcome to 2024 yuz-ers! What better way to begin the year than to do major code refactors resulting in almost full applet support. We present this, and plenty more, to you today! Remember to right click and unmute the embedded videos.

<!--more--> 

## Multiprocess, services, LLE applets, and Project Leviathan

Converting a single process emulator into a multiprocess one is no simple task.

{{< imgs
	"./keyboard.png| Typing speed challenge with the Nintendo keyboard?"
  >}}

2024 started out quite busy thanks to the combined efforts of [byte[]](https://github.com/liamwhite), [german77](https://github.com/german77), [Blinkhawk](https://github.com/FernandoS27), and [Maide](https://github.com/Kelebek1) in implementing multiprocess support, taking advantage of it in multiple areas (heh, get it?) including GPU, input, services, and applet emulation, and fixing long standing problems along the way.

As of writing, multiprocess support {{< gh-hovercard "12756" "is not yet merged," >}} but fixes in the GPU, input, and other modules (implemented by byte[], Blinkhawk, and german77) have already been staged and released, allowing full support to be added in parts.

Implementing the requirements to support multiprocess in yuzu led us to make five significant changes in the past month:

- Allow the GPU to run multiple programs. This is where SMMU support comes in, which we will discuss in the next section.
- Rewrite the old, basic applet manager.
- Rewrite presentation. Part of the prerequisites to run more than one program simultaneously is to be able to display all of them to the user.
- Rewrite every other relevant area (for example, input) to support multiple processes.
- Automate the serialization of service calls.

### Device mapping and SMMU

We start off with a big on: Blinkhawk implemented device memory mapping emulation and rewrote the GPU implementation with support for the {{< gh-hovercard "12579" "SMMU," >}} or for desktop enthusiasts/Linux VM users/UEFI lurkers, its other common name, IOMMU.

The ARM **S**ystem **M**emory **M**anagement **U**nit handles memory mapping for peripheral devices like the GPU.
It’s a hardware component on the Switch in charge of translating device virtual memory addresses into physical memory addresses.
The GPU adds an MMU of its own, `GMMU`, an additional layer that maps over the SMMU.

The emulator already had a performant memory translation layer for the GMMU, but it could only handle a single program using the GPU at a time, unable to share it with other processes. And support for *multiple processes* was needed.

The main benefits of this rewrite are:

- Increased accuracy.
- Reduced video memory usage (testing shows around a 300MB reduction).
- Enables multiprocess use of the GPU.
- Allows other emulated devices to use the device mapper.
- Leaves room for potential future optimizations

One downside of this change was how it increased debugging complexity, which led to more development time spent with every bug found on its implementation. 
For example, games on Android getting stuck at 0 FPS randomly, breaking compatibility with NCE, or running out of memory on some game engines.
This led to a couple of fixes implemented first by {{< gh-hovercard "12749" "byte[]" >}} and then {{< gh-hovercard "12869" "Blinkhawk himself," >}} with more on the way.

This change opened the floodgates to applet emulation and is the starting point to implement [Direct Memory Import](https://github.com/skyline-emu/skyline/pull/2106) sometime in the future — but let’s slow down a bit, there’s more to cover.

{{< imgs
	"./miiedit.mp4| Time to launch another program, GPU!"
  >}}

### Project Leviathan

german77 had to adapt his input rewrite, `Project Leviathan` to the requirements of multiprocess too. The rewrite is still ongoing, with more parts planned.
But just in January, the following changes, either specifically for multiprocess or more generally as part of the rewrite, were implemented:

- {{< gh-hovercard "12536" "Use individual applet resources," >}} so each applet has its own view of the controller input.
- {{< gh-hovercard "12549" "Implement NpadResource emulation," >}} now using the input process ID to distinguish HID state and controller style configuration between multiple processes.
- Create the {{< gh-hovercard "12605" "abstracted pad" >}} structure, which is in charge of updating the shared memory and assignment of controllers. The old implementation was too simple, causing the controller applet to unnecessarily be shown, or showing up with no supported controllers available.
- Fully implement {{< gh-hovercard "12660" "abstract vibration," >}} removing old inaccurate code and matching the behaviour of newer Switch firmware.

While this leads to us being able to load the native controller applet (among others) and have fun with it, it doesn’t have much use for emulation.

{{< single-title-imgs
    "Just for fun"
    "./controller1.png"
    "./controller2.png"
    "./controller3.png"
    >}}

### Now Presenting

Besides the emulated GPU, {{< gh-hovercard "12761" "presentation to screen" >}} also needed some work to support running applets — without it, none of the benefits could actually be displayed. 
If there is no multi-layer composition in place, there is no applet fun.

byte[] rewrote almost all of the presentation code to support layer overlays and blending, taking special care to not break the existing filtering and antialiasing options.
FSR in particular was converted from a compute shader to a fragment shader, so proper blending could be enabled.
The end result is the same, with no image quality changes — but now FSR can be used while games display the native inline keyboard, for example.

{{< imgs
	"./keyboard.mp4| That transparency behind the keyboard wasn’t free."
  >}}

### [I AM the applet manager](https://www.youtube.com/watch?v=7ZLS5KNDelI)

Another critical service that required a rewrite to have proper multiprocess support is `AM`, the {{< gh-hovercard "12760" "Applet Manager." >}}
AM has now been almost completely refactored to track state for every applet individually, properly allowing it to support running more than one at the same time.

{{< imgs
	"./web1.mp4| Help is only one button press away (Super Smash Bros. Ultimate)"
  >}}

While byte[] got the rewrite up and running, german77 {{< gh-hovercard "12837" "fixed an issue" >}} causing `The Battle Cats Unite` to softlock past the starting loading screen.

{{< imgs
	"./bc.png| This is one of the games of all time. Nyaa. (The Battle Cats Unite)"
  >}}


### Sounds good

Maide was responsible for making {{< gh-hovercard "12831" "audio emulation" >}} compatible with multiprocess. 
Games should be able to share audio playback with applets, right? Sharing is caring.

{{< imgs
	"./web2.mp4| Special menus included (Super Mario 3D All-Stars)."
  >}}

### Universal Serialization Byte[]

The {{< gh-hovercard "12783" "serialization and deserialization" >}} of service calls from programs is one of the most important tasks yuzu must perform when interacting with guest programs.
Communication between programs and the Switch system modules uses a special binary format with custom parsers.
Interacting with guest processes required tedious and error-prone layout calculations for every single interface method yuzu needed to implement, wasting a lot of development time on error checking and maintenance.

With the increased involvement in service implementations and the exponential growth of complexity you’ve seen so far, byte[] aims to automate and simplify serialization by using a template-based approach that automatically generates the code needed for the method.

So far, the work on multiprocess has taken over twenty thousands lines of code and continues growing.
All you have to do now to enjoy your native applets is to [dump your firmware](https://rena21.github.io/yuzu-wiki/setup-guide/dump-firmware/). Minimum required version to get the applets running is FW16.

### Other service rewrites and fixes

Here’s a toast to Maide for fixing one of the longest standing bugs in yuzu: the passage of time in games like `Pokémon Sword/Shield` and `Pokémon Quest`.

In the past, while time tracked during saving, some game events like Dens or Pokéjobs wouldn’t reset, forcing users to manually advance time with the custom RTC option.
It was quite bothersome.

It took an entire {{< gh-hovercard "12499" "rewrite of the time services" >}} to resolve the issue, “only” about nine thousand lines of code.
The new implementation is much more accurate, allowing Pokéjobs and other timed events to finally be enjoyed normally in this low-poly, almost-always-30-FPS masterpiece.

{{< single-title-imgs
    "Get to work! (Pokémon Sword)"
    "./pj1.png"
    "./pj2.png"
    >}}

Continuing this work, Maide removed some old workarounds that were no longer needed in the time services, and fixed {{< gh-hovercard "12864" "network clock to local clock" >}} synchronisation on every game boot.
This fixed time progression in `Pokémon Quest`.
No longer a [Time Quest](https://en.wikipedia.org/wiki/Hype:_The_Time_Quest).

{{< imgs
	"./pq.png| Set camp (Pokémon Quest)"
  >}}

To close the section, byte[] fixed how the {{< gh-hovercard "12867" "AOC service" >}} lists available DLC for multi-program applications, allowing `Assassin’s Creed Rogue` to boot with its DLC installed.
Just like the Navy intended.

## Graphics changes

### A dose of Dozen

Unforeseen issues are one of the signature “comes with the job” moments of emulation — you never know from where a new problem will arise, so we’ll have to start this section with a PSA.

**PSA:** If yuzu has recently started showing Microsoft as the GPU vendor for you, and you can no longer play any game, uninstall the package named `OpenCL™, OpenGL®, and Vulkan® Compatibility Pack`, or if you prefer to keep it, go to `Emulation > Configure… > Graphics > Device` and change the GPU to your correct model, without “Microsoft Direct3D 12” at the start of its name.

AMD and Intel users running Windows 11 suddenly started having their hardware completely incapable of launching any games while using Vulkan.
The reason is something none of us expected at all, Microsoft… And Mesa! Please lower those pitchforks.

Microsoft decided to roll out an install of this package, which allows incapable hardware to run the mentioned APIs if no proper driver was provided from the hardware vendor, or just if the hardware is incapable of running it.

The project used to achieve this is Mesa `Dozen`, which [runs Vulkan atop a Direct3D 12 interface](https://gitlab.freedesktop.org/mesa/mesa/-/merge_requests/14766).
The intended purpose is to offer Vulkan support to devices that only ship a Direct3D 12 driver, for example, Qualcomm ARM laptops.
We don’t know why Microsoft decided to silently test this feature on x86-64 PCs that already ship hardware capable of proper Vulkan support, but here we are.

Those new devices generated by `Dozen` are added to the Vulkan devices available to the OS, named “Microsoft Direct3D 12 (GPU model name)”, and conflict with how yuzu orders its device list.

To ensure the best GPU is selected by default on yuzu, three sorts are performed in order:

- Prefer NVIDIA hardware over AMD, AMD hardware over Intel. This favours NVIDIA hardware and also double ensures dedicated GPUs get selected over integrated ones. Plus, in the rare case a user has multiple GPUs from different vendors on a system, we ensure the one with the least issues is picked by default. “Outdated NVIDIA tablet-turned-console likes NVIDIA drivers,” after all.
- Prefer dedicated hardware over any other, including integrated and CPU rendering. There are people out there trying to run yuzu with CPU rendering.
- Order in inverse alphabetical order. This helps ensure an RTX 4090 is picked over a GTX 1050, or an RX 7900 XTX over an RX 780m.

Did you notice it? The last point is the problem. `Dozen` devices share the same identical features as the real Vulkan device but change the name. 
Since the list is ordered in inverse alphabetical order, a device named “Microsoft” will take priority over an identical one named AMD or Intel.

The issue is simple enough to solve: detect when a {{< gh-hovercard "12781" "device is Dozen" >}} and demote it to the bottom of the list.
Even if `Dozen` was capable of running yuzu, we would prefer not to run a layered implementation by default.

{{< imgs
	"./dozen.png| Nice way of having a Dozen GPUs"
  >}}

Sadly, `Dozen` isn't compatible with yuzu for the moment — it lacks multiple mandatory extensions and has some issues your writer enjoyed reporting to its devs while testing this. 
Fixes for multiple of them arrived in just a couple of days. Mesa devs are built differently.

This could be an interesting experiment for Fermi users or other end-of-life hardware once `Dozen` is suitable for yuzu.

### Your regularly scheduled GPU changes

The fun testing for multiprocess revealed a graphical issue when opening the web applet help page in `Super Smash Bros. Ultimate`.
One fix for {{< gh-hovercard "12875" "pitch linear reading and writing" >}} in the software blitter code later, and Blinkhawk resolved the issue.

{{< single-title-imgs-compare
	"Da Rules (Super Smash Bros. Ultimate)"
	"./webappletbug.png"
	"./webapplet.png"
>}}

Android users have regularly reminded us that `Mortal Kombat 11` is unable to boot.
After his enthusiastic walk through the code, byte[] found that {{< gh-hovercard "12652" "8-bit and 16-bit storage writes" >}} in shaders were completely broken on hardware which did not support them.

The problem, at least one of them, was lack of hardware support for `shaderInt8` and `shaderInt16`, something the big three, NVIDIA (the Switch included, of course), AMD (and by extension, Xclipse), and Intel, have full support for with up-to-date drivers, but [Android devices](https://vulkan.gpuinfo.org/listdevicescoverage.php?core=1.2&feature=shaderInt8&platform=all&option=not) with Adreno and Mali GPUs don’t.

Mali moment #1, along with Adreno.

The solution byte[] implemented to solve this specific issue is the usual for the lack of hardware support. If you can’t run it, emulate it!
These platforms support storage atomics, so by performing a compare-and-swap loop to atomically (in the thread safety sense, not radioactive) write a value to a memory location, 8-bit and 16-bit values can be written to larger 32-bit memory words without tearing the value seen by other threads.



{{< imgs
	"./mk11.png| Dear gods, you don’t need to make the menu low resolution too (Mortal Kombat 11)"
  >}}

This emulation incurs a small performance loss, but beggars can’t be choosers.
Mobile GPUs are very stingy with their feature sets, which frequently holds our development back and necessitates adding workarounds.

We doubt only `Mortal Kombat 11` is affected — this change improved many unknown games that were crashing on Android devices or for people running outdated GPU drivers on desktop/laptop PCs.
Sadly, this change alone isn’t enough to make the game playable on Android devices.
This issue exposed other shader problems related to lack of support for `StorageImageExtendedFormats`, but that’s homework for later, most likely for future byte[].

Switching to the other Linux kernel equipped OS (erm, Linux), Tuxusers reported garbled rendering issues when resizing the yuzu window while on Wayland.

The solution was thankfully simple, reverting an unnecessary change in one of the previous DMA fixes.
By forcing a {{< gh-hovercard "12688" "recreation of the swapchain" >}} each time the window frame size changes, the issue is gone.

Proper tear-free gameplay with safe window management shall return to Wayland.
HDR support when, Linux?

Newcomer [shinra-electric](https://github.com/shinra-electric) {{< gh-hovercard "12713" "updated the MoltenVK dependency" >}} to its latest version. Thank you!

While the update brings tons of improvements and many Vulkan extensions are now supported, there are no new changes to report in rendering or compatibility on Apple devices.
But hey, no reported regressions is good news!

## Android augmentations

[t895](https://github.com/t895) kicked off the new year with a flurry of changes to improve yuzu Android.
While one of these changes enhances the overall app performance, the majority are quality-of-life (QoL) fixes that some of our users have been anticipating.

As many of you might already be aware, yuzu Android supports exporting user data and saves in ZIP format to transfer between different versions of the app.
ZIP compression, in most cases, can result in a reduction of file size compared to the original size of files on disk.
However, applying compression overtop of encrypted data is almost always a waste of time.
 
t895 observed that when compression was turned on, these ZIP exports were excessively slow, while still resulting in negligible size reduction gains, as the largest files in the user data are NCAs, and those are encrypted.
Therefore, he {{< gh-hovercard "12558" "disabled compression for these ZIP exports," >}} exhibiting up to a 3x decrease in export times.

Moving on to the QoL fixes, t895 {{< gh-hovercard "12571" "extended support for custom screen orientations." >}}
With this change, yuzu now supports a total of seven orientation styles, listed below.

- Auto. Selects any of the four orientations based on the phone’s sensor.
- Sensor Landscape. Limits the sensor detection to only landscape orientations.
- Landscape. Fixed regular landscape.
- Reverse Landscape. Fixed inverted landscape.
- Sensor Portrait. Limits the sensor detection to only portrait orientations, if the device allows it.
- Portrait. Fixed regular portrait.
- Reverse Portrait. Fixed inverted portrait

{{< imgs
	"./orientations.png| Reverse portrait, the way it’s meant to be played"
  >}}

Next up is the improved global save manager.
There are two possible save directories for games, and the original global save manager was only checking one of them. 
So, t895 removed this broken feature a while back and has now {{< gh-hovercard "12576" "reintroduced an improved version" >}} of the same.

With this improved version, you can now also use exports made with the global save manager in the per-game save manager and vice versa.

Following that are the new uninstall add-on buttons.
t895 {{< gh-hovercard "12715" "added an uninstall button" >}} for every kind of add-on in the Android app.
yuzers can now easily uninstall any updates, DLCs, mods, and cheats that they might have installed.
Note: Currently, yuzu on PC doesn't have UI support for uninstalling mods or cheats.

{{< imgs
	"./uninstall.png| Your internal storage starts breathing again"
  >}}

Ever spend a long time copying over your dumps or installing content to NAND, only to have them fail to work?
Look no further: t895 {{< gh-hovercard "12736" "brings the PC version's integrity check features to Android." >}}
You can now easily verify the file integrity of your game dumps and your NAND contents.
To verify a game dump, simply go to your game's properties and under `Info`, select `Verify Integrity`.
There is also a separate, self-explanatory button within `Settings` labelled `Verify Installed Content`.

{{< single-title-imgs
    "Great for peace of mind after experiencing a game crash"
    "./verify1.gif"
    "./verify2.gif"
    >}}

How many times have you accidentally opened the in-game menu when using the left thumbstick area?
Well, {{< gh-hovercard "12738" "you can now lock the in-game menu" >}} so as to avoid accidentally triggering it.
When locked, you can still bring up the in-game menu by using the "back" button or gesture on your device.

{{< imgs
	"./lock.png| Anti-frustration changes"
  >}}

Now, let's delve into game shortcuts on your home screen.
With Android's dynamic shortcuts feature, apps can now provide users with quick access to specific actions or content within an app directly from the home screen.
Although this feature was introduced back in 2016, it seems that some Android launchers do not yet support it.

While this feature is already supported on yuzu and works perfectly, it becomes pretty tedious when you have to launch each and every game to get a shortcut for it, especially after a reinstall.
As a one-size-fits-all solution to this problem, t895 {{< gh-hovercard "12747" "implemented a button" >}} in the game properties activity that allows you to easily add a shortcut to any game to your home screen without needing to launch the game first.

{{< imgs
	"./icon.gif| Gotta pin ’em all"
  >}}

t895 followed that up with some {{< gh-hovercard "12796" "controller focus optimizations." >}}
Android controller focus is the highlight you see over buttons indicating that you can select it.
These changes fix a few issues observed when using a controller to navigate the yuzu app UI and solved an issue where the emulation surface would appear gray.

In his quest to bring feature parity between yuzu on PC and yuzu on Android, t895 implemented {{< gh-hovercard "12777" "the 'encryption keys missing' warning on Android." >}} 
You will now get this warning on app startup if you don't have the keys required to decrypt games/firmware.	

{{< imgs
	"./keys.png| Time to grab that jig"
  >}}

t895 also implemented {{< gh-hovercard "12824" "support for multi-program app switching." >}}
This feature allows for game compilations like `Super Mario 3D All-Stars` and `Klonoa: Phantasy Reverie Series` to switch between games within the bundle.

{{< imgs
	"./multiprogram.mp4| Multi-game drifting! (Klonoa: Phantasy Reverie Series)"
  >}}
 
He also made some minor UI improvements like:
 
 - {{< gh-hovercard "12786" "Show driver vendor in the FPS overlay." >}} This informs users which driver is loaded.
 - {{< gh-hovercard "12826" "Show System GPU driver information" >}} in the driver manager for improved visibility.

{{< imgs
	"./driver.png| Now you can know how outdated it is"
  >}}
 
And that's not all. 
Newcomer [Emma](https://github.com/GayPotatoEmma) {{< gh-hovercard "12560" "implemented basic support for the game dashboard" >}} feature found on Pixel devices.
Thank you!

Resident AMD tester [Moonlacer](https://github.com/Moonlacer) noticed that Samsung mobile devices with the new RDNA-based Xclipse GPUs had the {{< gh-hovercard "6900" "same wireframe issues in various Pokémon games,">}} that plague the PC AMD Vulkan drivers.
With some help from [byte[]](https://github.com/liamwhite), {{< gh-hovercard "12885" "a fix for these Xclipse GPU drivers was implemented" >}} by considering these devices as AMD, gaining access to the same old workarounds Radeon cards benefit from.
Thanks to user `no.kola` on discord for testing these!

Xclipse moment #1. We have some bad news for Xclipse users we’ll discuss in the hardware section.

## Miscellaneous changes

One notable standing issue with yuzu is profile corruption, when after a badly-timed crash, the emulator creates a new profile and leaves all user data in the old one, forcing the user to manually move their saves back to the newly created active profile.
Thankfully, german77 {{< gh-hovercard "12665" "fixes user profile corruption" >}} issues by only saving profile data when contents change.

While NCE has been with us for some time now, that doesn’t mean it’s entirely stable yet.
As an Android user pointed out, some hardcore mods like `Luminescent Platinum` for `Pokémon Brilliant Diamond/Shining Pearl` would get stuck in a black screen while using NCE.

After the detective work was finished by byte[], the reason was found to be in how some mods make assumptions about the module layout, and yuzu would try to give each module a dedicated patch section.
To alleviate this bottleneck, [GPUCode](https://github.com/GPUCode) modified
the {{< gh-hovercard "12677" "NCE loader" >}} to try to use the same patch section for as many sequential modules as possible.

{{< imgs
	"./platinum.jpg| The community never fails to provide impressive mods (Pokémon Brilliant Diamond)"
  >}}

This should allow mods for other games that make assumptions about module layout to work under NCE as well.

Jumping to a bit of input changes, german77 was notified that a user tried to dump their Amiibos, but yuzu failed to generate any dump because the Amiibos were mounted as read-only and no backup was available.
The solution? {{< gh-hovercard "12683" "Dump Amiibos" >}} if no backup exists, no questions asked.

Resident helper [anpilley](https://github.com/anpilley) decided it was time to improve the available command-line arguments for the yuzu binaries, adding the use of `-u` to specify a {{< gh-hovercard "12695" "user to load" >}} and suppress the user selector from showing.
Thank you!

Back for more, [FearlessTobi](https://github.com/FearlessTobi) decides to tackle a few problems with the virtual file system emulation, or `VFS`.
Since Project Gaia is in indefinite hiatus, priorities have shifted into patching as much of the current implementation as possible.

The {{< gh-hovercard "12707" "list of changes" >}} is long: it includes moving files, unifying error code naming for ease of debugging, making file system definitions more consistent with current reverse engineering information available, and leaving the overall structure prepared for future code additions.
Never hurts to improve an area that was designed back when there was little information available.

The boss of Dynarmic herself, [merryhime](https://github.com/merryhime), {{< gh-hovercard "12830" "updated the bundled build" >}} in yuzu to the latest version, bringing some new changes and fixes with it.
There are some instruction emulation optimizations, more 32-bit ARM instructions were added, and the startup times of games on Android was improved — it’s not as fast as NCE, but it’s considerably faster for those games that must run on JIT.

To close this section and move to an interesting hardware discussion, t895 has one last gift for us this month, {{< gh-hovercard "12868" "per-game audio settings." >}}
One of the missing settings that could be set on a per-game basis, and it includes the full set, output engine, output device, input device, etc.

{{< imgs
	"./audio.gif| Sounds good to me!"
  >}}

The more you’re able to choose, the better, right?

## Hardware and software section

As promised last month, we’ll talk about frame generation, and the new tools available to take advantage of it in yuzu.
But first, one last HDR example for NVIDIA users.

### NVIDIA TrueHDR

With the 551.XX series of drivers, NVIDIA introduced the option to auto-generate an HDR output for any video displayed on a Chromium-based browser (Google Chrome, Microsoft Edge, Brave, etc).
It didn’t take long for the community to come up with plug-ins to take advantage of this change in [local video players](https://github.com/emoose/VideoRenderer/releases), but that’s not the only application outside NVIDIA’s official intended use.

Enter [NvTrueHDR](https://www.nexusmods.com/site/mods/781), an alternative to Windows AutoHDR and Special K HDR.
Always fun to have more options to pick from!

### Lossless Scaling to the rescue

[Lossless Scaling](https://store.steampowered.com/app/993090/Lossless_Scaling/), a program intended for resolution scaling, recently introduced a generic frame generation option, making it the first vendor agnostic implementation.

{{< imgs
	"./ls1.png| Clean UI"
  >}}

Usage is simple, set Frame Generation to the right to `LSFG`, if you’re an Intel iGPU user, set Legacy capture API to enabled, open yuzu, enable Scale and switch back to playing your game, or press the default hotkey Ctrl + Alt + S while in game. Exclusive fullscreen recommended.

{{< imgs
	"./ls2.png| Scroll down to find it"
  >}}

The results are good on smaller displays, but on larger monitors (such as 27 inch displays), the artifacts of the generated frames are too noticeable, making this tool more suitable for laptops and handhelds than for desktop or TV gameplay.
Still, it’s a cheap way of improving perceived framerates and bypassing CPU bottlenecks on any GPU vendor without driver or hardware restrictions.

Below you can see comparison videos between native 30 FPS and Lossless Scaling generating frames to 60 FPS in `The Legend of Zelda: Breath of the Wild`. 
Due to YouTube only supporting 60FPS video, you won't see the true 120 FPS framegen examples.

{{< youtube v-U7GJYrY64 >}} {{< youtube XNBTxr6HBlA >}}

The above videos demonstrate native 30 FPS vs Lossless Scaling generating frames from a 30 FPS base.
You can see with so little information, artifacts are common. Lossless Scaling doesn’t handle scene transitions.

{{< youtube CG_e5yOnd9E >}} {{< youtube UpvdLJUtEis >}}

The above videos demonstrate native 60 FPS vs Lossless Scaling generating frames from a 60 FPS base.
With more information to play with, Lossless Scaling does a better job. Scene transitions are still an issue.

While the quality is not perfect, it’s a simple and harmless way of improving the experience on any hardware — especially on ~~ugly~~ 30 FPS games like the Pokémon series, or cinematic experiences like the Xenoblade saga. No double standards here.
Still, for those with recent AMD GPUs (RDNA2 and RDNA3 so far), there’s a better option available now:

### AMD Fluid Motion Frames

Driver release 24.1.1 introduced the first public release of [AFMF](https://community.amd.com/t5/gaming/amd-fluid-motion-frames-is-out-now-on-amd-radeon-rx-7000-series/ba-p/634372), AMD’s game-independent frame generation algorithm.

“But writer, AFMF is only for Direct3D 11 and 12 games!” you say.
That’s where you’re wrong. You see, the [Guru3D forums](https://forums.guru3d.com/threads/amd-software-adrenalin-edition-23-40-01-10-preview-driver-for-amd-fluid-motion-frames.449598/page-35#post-6197794) has some fantastic information, AFMF can be run on Vulkan, OpenGL, and Direct3D 9/10 too, it only needs a registry edit:

```
[HKEY_LOCAL_MACHINE\SOFTWARE\AMD\DVR]
"GFGEnableAPI"=dword:00000007
```

Manually make this change with regedit, reboot Windows if needed, add yuzu to the Radeon Software, set `Wait for Vertical Refresh` to `Disabled`, enable AMD Fluid Motion Frames:

{{< imgs
	"./radeon.png| Good looking UI, AMD"
  >}}

In the performance tab, you can set the overlay to show the generated frames' performance (it won’t show up on regular apps or yuzu, as it isn’t informed by the game engine), along with latency and stuttering.

Open yuzu, set Fullscreen Mode to Exclusive Fullscreen:

{{< imgs
	"./fullscreen.png| It’s as shrimple as that"
  >}}

And that’s it, start a game, go into fullscreen by pressing F11 or the hotkey assigned to your controller, and enjoy 2x to 3x the perceived framerate.

Note that, while the image quality is much better than the result from Lossless Scaling, AMD disables AFMF if there is too much variance between one frame and the next in order to avoid smoothing out scene transitions like camera changes or opening the menu.
This leads to a noticeable frametime inconsistency when a lot of action is happening on screen. We hope AMD adds an option in the future to toggle the sensitivity of this behaviour.

{{< youtube v-U7GJYrY64 >}} {{< youtube 8Cbov_uR2Dc >}}

The above videos demonstrate native 30 FPS vs AFMF generating frames from a 30 FPS base.
While a better result than Lossless Scaling at 30 FPS, artifacts are still noticeable in faster movements, especially on vegetation. Scene transitions are clear and there is less shimmering around the player.

{{< youtube CG_e5yOnd9E >}} {{< youtube GfRjc9v0jls >}}
The above videos demonstrate native 60 FPS vs AFMF generating frames from a 60 FPS base.
And at 60 FPS, the results are great! Allowing for smoother gameplay on 120-180Hz displays.

No performance graphs are included because your writer doesn’t consider perceived framerate as real performance, but to provide an example, `The Legend of Zelda: Tears of the Kingdom`, which produces solid 60 FPS in open world with a 5600X and an RTX 3060 Ti, can produce 170-180 “FPS” with AFMF enabled, and with little to no distortion visible.

The games can be rendered with an NVIDIA or Intel GPU while still generating frames with AFMF, although the experience is slightly worse than just using the AMD card directly due to the added latency of transmitting the finished frames over PCIe.
The only requisite for AFMF to work is to have the display connected to the compatible AMD GPU, any other GPU can do the actual rendering after that.
Time to invest in an RX 6400? Smash must look amazing at 240 FPS.

### Intel delivering on its promises

As promised, Intel fixed [their crashes](https://github.com/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/551) while building geometry shaders, starting with driver version [31.0.101.5186/5234](https://www.intel.com/content/www/us/en/download/785597/intel-arc-iris-xe-graphics-windows.html).

While this allows for games like `Xenoblade Chronicles 3` to finally get in-game on integrated GPUs and ARC dedicated cards, it seems like there are other areas where the driver needs to mature to produce proper rendering:

{{< imgs
	"./xc3.png| Intel moment (Xenoblade Chronicles 3)"
  >}}

On the flip side, `The Legend of Zelda: Tears of the Kingdom` improved stability with this driver fix, so Intel Windows specific rendering issues aside, the game should be quite playable now.

### Qualcomm

[K11MCH1](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v24.1.0_R16)’s driver releases continue to flow out, improving performance and compatibility for Adreno users. 
We strongly recommend staying up-to-date.

While there have been new releases of the proprietary driver, nothing of value has been added or fixed yet.

Total Adreno moments count this month: 1.

### Exynos and Mali

Why together? Because we found some *interesting* limitations in the Exynos hardware that reminds us of the existential crisis Mali suffers.
Besides the AMD specific issue we previously mentioned, Exynos’ Xclipse GPU series shares a quality with Mali: total lack of support for BC4 to BC7 texture decoding.

While this is *fine* for native Android games (developers just have to scratch their head at the decision to skip basic texture support, and use an alternative like ASTC), Switch games do use BCn textures, extensively in some cases, and adding the extra CPU work of having to decode those textures into something the GPU can handle (RGBA8) will limit performance and increase memory usage.
This is one of the main reasons these GPUs are not on par with Adreno in terms of feature support.

So:

Total Xclipse moments count this month: 2.

Total Mali moments count this month: 2.

## Linux

Certain distributions like SteamOS, Fedora since [version 39](https://bugzilla.redhat.com/show_bug.cgi?id=2216765), and any distro with a [linux-zen](https://github.com/zen-kernel/zen-kernel/commit/d22e337dca65bd7056e27b93c212df25a9b4c376) package available (Arch Linux for example), have significantly increased their default `vm.max_map_count` values, leading to much more stable out-of-box experiences when running Unreal engine games on yuzu.

Progress feels so good! You could learn a little, Windows.

## Future projects

Work on multiprocess support is far from over. We’re aiming to support `QLaunch`, meaning being able to boot the native game launcher, launch games from there, close them, suspend them, launch a different game, the whole deal.

{{< imgs
	"./ql1.mp4| QLaunching in 3, 2, 1!"
  >}}

Resuming a game works too.

{{< imgs
	"./ql2.mp4| Back and forth."
  >}}

The work on applets and multiprocess is exposing a lot of hidden bugs in multiple areas — the accuracy improvements are a very welcome addition; we're having so much fun testing and running the applets.

That’s all folks! Thank you for reaching the end of this progress report. We hope to see you next time!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
