+++
date = "2023-08-06T06:45:00+05:30"
title = "Progress Report July 2023"
author = "CaptV0rt3x"
coauthor = "GoldenX86"
forum = 0
+++

Hey there, yuz-ers!
Welcome back to our monthly report on all the improved features, performance gains, and bug fixes we've made.
Let's jump right in!

<!--more--> 

## Aliens and ghosts are real... and they run on Unreal Engine!

The wait was long, but worth it. Another game in the charming Pikmin franchise has finally arrived on Earth, just in time to join the wave of UFO reports!

{{< imgs
	"./pk1.png| Imagine a crossover with Toy Story, it would explain The Claw! (Pikmin 4)"
  >}}

This time, `Pikmin 4` decided to use Unreal Engine 4, which guarantees good performance and quality on the Switch.
However, this engine also guarantees headaches for emulating its use of sparse textures, as well as guaranteeing instability for NVIDIA GPU users running Vulkan, as previous games have demonstrated.


[byte[]](https://github.com/liamwhite) identified and fixed a regression caused by a recent change to the texture cache which severely {{< gh-hovercard "11093" "impacted stability" >}} on NVIDIA GPUs, causing constant device losses (the driver cutting off the GPU from rendering, resulting in an emulator crash).

{{< imgs
	"./pk2.png| Moss seems tired (Pikmin 4)"
  >}}

[emufan](https://github.com/GPUCode) found that hardcoding the total number of texture buffers to `16` was causing crashes in some Unreal Engine 4 games and {{< gh-hovercard "11098" "bumped up the count" >}} to `32`.

{{< single-title-imgs
    "Good thing this game didn't cross paths with Pikmin (Master Detective Archives: RAIN CODE)"
    "./rain1.png"
    "./rain2.png"
    >}}

This change has not only helped `Pikmin 4` but also `Master Detective Archives: RAIN CODE`, another recent release using this same engine.

{{< imgs
	"./rain3.png| Yeah, good name for a train, I'll board it in Dracula Station (Master Detective Archives: RAIN CODE)"
  >}}
  
Many things have improved, but there's still a lot of work remaining to improve the compatibility of games using this popular game engine!

# Per-game configurations - Reimagined!

If you're experienced with yuzu, it is very likely that you've seen and used per-game configurations.
But if you didn't know, yuzu supports per-game configurations as an easy way to set game-specific settings, without having to change your global settings for every game you start.
For the games which require GPU accuracy to be high instead of normal, or for games which work best with OpenGL over Vulkan, per-game configurations allow you to easily override settings like these.

So, what's new, you ask?
The brains behind this feature's implementation and our trusty slice of toast, [toastUnlimited](https://github.com/lat9nq/), has started working towards a future where yuzu could select a game-specific configuration file curated by the community, and then apply those settings by default!
The ultimate goal is for users to be able to apply the optimal settings for any game by default, without having to tinker with the many, many configuration options we have today.

Sounds exciting, right? Heck yeah!
While toast was finalizing his designs, he quickly ran into a road-block of his own design: our current per-game configuration system.
The existing system's design made it difficult to programmatically define and override each setting in multiple places across yuzu's backend and frontend systems.

toast decided to take the challenge head-on and {{< gh-hovercard "10839" "rewrote the entire settings backend" >}} to improve it, all while making it programmatically easier to define and implement any setting.
Thanks to these changes, developers now only need to write out the UI text for a setting and the system will do the rest (reading, writing, representing in the UI, resetting global state).

This also had the benefit of providing the perfect opportunity to rework several parts of the global settings UI!
For example, System settings now includes `Multicore CPU Emulation` support, all three possible values for `Memory Layout`, and `Limit Speed Percent`.

{{< single-title-imgs-compare
	"Important changes to System settings"
	"./systembug.png"
	"./systemfix.png"
>}}
&nbsp;

The Graphics section also got its fair share of changes. 
Besides reorganizing the different options, the new `ASTC Decoding Method` option now lists our 3 different alternatives for handling that pesky ASTC format: CPU, GPU, and asynchronous CPU decoding.

{{< single-title-imgs-compare
	"Graphics settings also got some love"
	"./gpubug.png"
	"./gpufix.png"
>}}


There are plenty of changes here, but enough about the global settings! toast also changed how per-game configurations are updated. They will now show an X button on the right of each setting if they were modified from the global value, allowing you to quickly revert them if needed.

{{< single-title-imgs-compare
	"Graphics settings also got some love"
	"./custombug.png"
	"./customfix.png"
>}}

Stay tuned for follow-up changes to our settings, building on top of this new foundation!

# Graphics changes

[Maide](https://github.com/Kelebek1) continued his efforts to improve performance through optimization and {{< gh-hovercard "10996" "his latest changes further optimize" >}} one of his {{< gh-hovercard "10457" "earlier optimizations." >}} We heard you like optimizations, so we put optimizations in your optimizations so you can optimize while you optimize.
While the original changes aimed to reduce memory allocations while copying data from the guest to the host (user's PC), the latest changes remove data copying entirely, resulting in nearly 10% performance boost in parts of `Super Mario Odyssey`, such as the Metro Kingdom area. `Xenoblade Chronicles: Definitive Edition` also sees similar gains.

byte[]'s {{< gh-hovercard "11136" "latest fix" >}} significantly improves the slowest shader compilation times in `Splatoon 3`, reducing it from `30 seconds` to about `4 seconds`.
A {{< gh-hovercard "10583" "recent change to our texture cache's `AccelerateDMA` logic" >}} was identified to have been causing device losses and {{< gh-hovercard "10993" "has been since been reverted." >}}

{{< imgs
	"./sp3.png| She calls it Sasha (Splatoon 3)"
  >}}

# Input Changes

[german77](https://github.com/german77) continued his reverse engineering of the Switch NFC service and {{< gh-hovercard "11096" "improved yuzu's code accuracy." >}}
He also fixed a bug, which would cause mice to stop working after some time, by avoiding an accidental division by zero.

Newcomer [SuperSamus's](https://github.com/SuperSamus) first contribution to yuzu was to {{< gh-hovercard "11050" "fix how button mapping was being handled within yuzu." >}}
With these changes, it's now possible to share the same mappings between Nintendo and non-Nintendo controllers. Thank you!

Note: This change **BREAKS** controller configurations for those using Nintendo controllers without the direct driver.

# Android changes

[bunnei](https://github.com/bunnei/) implemented changes to {{< gh-hovercard "11017" "fix an issue where Turnip drivers would fail" >}} on certain Snapdragon devices and added checks for broken Qualcomm 7xx drivers.
This means that any Snapdragon user should be able to run Turnip drivers now. Links are provided in the Hardware section later in this article.

[t895](https://github.com/t895) {{< gh-hovercard "11067" "disabled the prompt to save user data when uninstalling yuzu." >}} This feature often caused issues when users attempted to use different APK versions.

t895 also {{< gh-hovercard "11070" "added some helpful error prompts" >}} to inform users why certain buttons were disabled on some devices.
The most common case is Mali or Xclipse users trying to install custom drivers, a feature that is only available for Adreno users, at least for now.

{{< imgs
	"./mali.png| Your Mesa driver is in another castle"
  >}}

# Miscellaneous changes

Apart from the ones highlighted above, there have also been several smaller changes that don't necessarily fit nicely into a single category. So let's quickly discuss them below:

[FearlessTobi](https://github.com/FearlessTobi) added {{< gh-hovercard "11047" "detection for compressed and sparse NCAs within yuzu's filesystem." >}} Instead of failing silently, yuzu will now log this info and abort the parsing.

toast added a {{< gh-hovercard "11042" "new Linux build script which added the libraries required to enable `Wayland` support" >}} in our official AppImage releases.

Not stopping there, toast {{< gh-hovercard "11186" "fixed a memory leak with the new timezone data generator." >}} This would happen when games tried to ask for timezone information too many times. 
This was resolved by keeping track of the generated timezone binary instead of recreating it repeatedly.

toast also {{< gh-hovercard "11030" "bypassed an MSVC build crash" >}}  on `Windows version 10 1809 LTSC` from the new timezone binary changes by temporarily disabling it for MSVC until there is a solution from Microsoft. 
The reason, for those interested, is [documented here](https://github.com/microsoft/STL/issues/3853#issuecomment-1627630752).

byte[] implemented missing service functions, {{< gh-hovercard "11113" "fixing a bug that caused `Quake` to fail to launch," >}} and {{< gh-hovercard "11135" "fixed a bug that resulted in `Splatoon 3` having an endless loading screen when LAN was enabled." >}}

byte[] also {{< gh-hovercard "11016" "fixed an issue within yuzu's filesystem" >}} which resulted in either corrupt save data or failing to save data.

A previous merge caused games with non-ASCII titles to crash on Linux due to `DBus` expecting a `UTF8` string. This has now been {{< gh-hovercard "11007" "fixed." >}}
Thanks [zeltermann](https://github.com/zeltermann)!

[Morph](https://github.com/Morph1984) {{< gh-hovercard "10999" "fixed a bug that broke the game installation progress bar" >}} after the recent buffer size increase by refactoring the progress bar calculation code.

Morph also {{< gh-hovercard "11173" "fixed a bug where yuzu would crash on systems with weak CPUs running at very low clock speeds" >}} due to yuzu's strict requirements on CPU clock precision.

german77 eliminated almost 2GB of memory usage in some circumstances by {{< gh-hovercard "11128" "fixing a memory leak within Discord presence code," >}} presumed to be caused by `cpp-httplib`.

german77 also {{< gh-hovercard "11142" "fixed a crash in yuzu's gamelist" >}} that happened when you launched yuzu without keys.

yuzu newcomer and Citra expert, [Steveice10](https://github.com/Steveice10), implemented {{< gh-hovercard "10974" "a few improvements to Vulkan surface creation on macOS." >}} [comex](https://github.com/comex) submitted {{< gh-hovercard "10990" "a few fixes and workarounds for macOS to resolve a few undefined behaviour errors." >}} Thank you both!
This doesn't mean full MoltenVK support yet, but the gap is now smaller.

## Hardware section

### NVIDIA

The latest driver released at the time of writing, 536.99, is stable and also seems to have improved Vulkan performance a small but measurable amount, between 3% and 7%.
Free performance is free performance.

### AMD

It's July and we have another new AMD GPU driver with yet another extension causing issues.
If you recall from our [June progress report](https://yuzu-emu.org/entry/yuzu-progress-report-jun-2023/#amd), we reported that the latest AMD drivers had broken a Vulkan feature - `extendedDynamicState3ColorBlendEquation`, and we had to temporarily disable usage of it on AMD driver version `23.5.2` and above.

Fast-forward to July, and it's still broken for some.
Giving credit where due, AMD ***did*** fix this issue with driver version `23.7.2`, but only for `RDNA2` GPUs (RX 6000 series). `GCN4`, also known as `Polaris` (RX 400 and 500 series), are confirmed to still be broken.
In light of this, and the fact that the fixed driver still reports the same Vulkan version, we {{< gh-hovercard "11182" "reverted" >}} {{< gh-hovercard "11163" "our revert" >}} of {{< gh-hovercard "10946" "our original change from June" >}} and have {{<gh-hovercard "11204" "currently disabled usage of this extension on all AMD official drivers" >}} until this is fixed and has a new version number.

### Turnip

Mesa never slows down its progress, and [K11MCH1's](https://github.com/K11MCH1) AdrenoTools releases are a true blessing from the fairies.

For Adreno 600 users (Snapdragon ### series), [progress is steady](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/vk.1.3.261-A6XX). 
But the [best news](https://github.com/K11MCH1/AdrenoToolsDrivers/releases/tag/v23.3.0-dev) is for A700 users (Snapdragon # Gen # series), which now see much improved rendering and performance on the Mesa Turnip drivers.

Some games still require the proprietary Adreno driver to be more stable or faster, but at this rate of progress, we’ll most likely see this change soon!

## Future projects

Behind the counter, there has been great progress in some key projects.
The last missing piece of `Project Y.F.C.`, the `Query Cache Rewrite`, was released but we'll talk about it next time. We're sure Xenoblade and Luigi's Mansion fans will love it!
byte[] continues to improve the current file system emulation — maybe some particular games will start working soon?
And Maide has some interesting ideas to implement in the shader cache code.

That's all folks! Thank you for reading until the end. See ya next time!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
