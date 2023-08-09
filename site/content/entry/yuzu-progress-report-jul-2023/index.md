+++
date = "2023-08-06T06:45:00+05:30"
title = "Progress Report July 2023"
author = "CaptV0rt3x"
coauthor = "GoldenX86"
forum = 0
+++

Hey there yuz-ers!
Welcome back to our monthly report on all the improved features, performance gains, and bug fixes we made.
Let's jump right in!

<!--more--> 

# Aliens are real!

Golden to add details of PIKMIN specific fixes and some american UFO propaganda /s.


# Per-game configurations - Reimagined!

If you're not a new yuz-er, it is very likely that you've seen and used per-game configurations.
But incase you haven't yet, per-game configurations are a way to set game specific settings without having to redo your settings for every game you start.
Imagine if few games require GPU accuracy to be "HIGH" instead of "NORMAL" or if some games work best with "OpenGL" over "Vulkan", with per-game configurations you can easily override these specific settings for just those games.

So, what's new, you ask?
The brains behind this feature's implementation and our trusty slice of toast, [toastUnlimited](https://github.com/lat9nq/), started working towards a future where yuzu could essentially download a game-specific configuration file, that was curated by the community, and then instantly apply those settings.
Thus users obtaining the optimal settings for any game without having to tinker with the several configuration options we have today.

Sounds exciting, right? Heck yeah!
While toast was finalizing his designs, he quickly ran into a road-block of his own design that is our current per-game configuration system.
The existing system's design made it difficult to programmatically define and override each setting in multiple places across yuzu's backend and frontend systems.

toast decided to take the challenge head-on and {{< gh-hovercard "10839" "rewrote the entire settings backend" >}} to improve it while making it programmatically easier to define and implement any setting.
Thanks to these changes, developers now only need to write out the UI text for a setting and the system will do the rest (reading, writing, representing in the UI, resetting global state).

Note: These changes are currently for developers only with no end-user impact, but do keep your eyes open for follow-up changes that will build on top of this foundation.


# Graphics Changes

It's July and We have another new AMD GPU driver with yet another extension broken.
If you recall from our June progress report, we reported that latest AMD drivers had broken a Vulkan extension - `extendedDynamicState3ColorBlendEquation`, and we had to temporarily disable usage of this extension on AMD driver version `23.5.2` and above.

Fast-forward to July, and it's still broken, kind of.
Giving credit where due, AMD ***did*** fix this issue with driver version `23.7.2` but only for `RDNA1` and newer devices, with at least `GCN4`, also known as `Polaris`, confirmed to be still broken.
In light of this, and the fact that the fixed driver still reports the same Vulkan version, we {{< gh-hovercard "11182" "reverted" >}} {{< gh-hovercard "11163" "our revert" >}} of {{< gh-hovercard "10946" "our original change from June" >}} and have {{<gh-hovercard "11204" "currently disabled usage of this extension on all AMD drivers," >}} until AMD fixes this.

[Maide](https://github.com/Kelebek1) continued his efforts on improving performance through optimizations and {{< gh-hovercard "10996" "his latest changes further optimize" >}} one of his {{< gh-hovercard "10457" "earlier optimizations." >}}
While the original changes aimed to reduce guest memory (Switch) allocations while copying data from guest to host (User's PC), the latest changes remove data copying entirely thereby resulting in nearly 10% performance boost in parts of `Super Mario Odyssey` like the Metro Kingdom area, and `Xenoblade Chronicles: Definitive Edition` reporting similar gains.

[emufan](https://github.com/GPUCode) identified that hardcoding the total number of texture buffers to `16` was causing crashes in some games and {{< gh-hovercard "11098" "bumped up the count" >}} to `32`.
[byte[]'s](https://github.com/liamwhite) {{< gh-hovercard "11136" "latest fix" >}} significantly improves the slowest shader compilation in "Splatoon 3" with time taken reduced from `30 seconds` to about `4 seconds`.
A {{< gh-hovercard "10583" "recent change to our texture cache's `AccelerateDMA` logic"  >}} was identified to have been causing device losses and {{< gh-hovercard "10993" "has been since been reverted." >}}


# Input Changes

[Narr](https://github.com/german77) continued his reverse engineering of the Switch NFC service and {{< gh-hovercard "11096" "improved yuzu's code accuracy" >}}.
He also fixed a bug which caused users' mouse to stop working after some time, by avoiding an accidental division by zero.

[SuperSamus's](https://github.com/SuperSamus) first contribution to yuzu was to {{< gh-hovercard "11050" "fix how button mapping was being handled within yuzu." >}}
With these changes, it's now possible to share the same mappings between Nintendo and non-Nintendo controllers.

Note: This change **BREAKS** controller configurations for those using Nintendo controllers without the direct driver.


# Android Changes

- [bunnei](https://github.com/bunnei/) implemented changes to {{< gh-hovercard "11017" "fix an issue where Turnip drivers would fail" >}} on certain devices with Snapdragon 870 and added checks for broken Qualcomm 7xx drivers.
- [t895](https://github.com/t895) {{< gh-hovercard "11067" "disabled yuzu from asking to save user data on uninstall," >}} which could cause issues when users attempted to use different APK versions.
- t895 also {{< gh-hovercard "11070" "added some help text messages" >}} to inform users why certain buttons were disabled when games were running.


# Miscellaneous

Apart from the ones highlighted above, there have also been several smaller changes:

- [FearlessTobi](https://github.com/FearlessTobi) added {{< gh-hovercard "11047" "detection for compressed and sparse NCAs within yuzu's filesystem." >}} Instead of failing silently, yuzu will now log this info and abort the parsing.
- toast added a {{< gh-hovercard "11042" "new Linux build script which added the libraries required to enable `Wayland` support" >}} on our official releases.
- toast {{< gh-hovercard "11186" "fixed a potential memory leak with the new timezone binary," >}} which happened when games tried to ask for timezone information too many times. This was resolved by keeping track of the generated timezone binary instead of recreating it repeatedly.
- toast {{< gh-hovercard "11030" "bypassed a MSVC build crash on `Windows 10 1809 LTSC` with the new timezone binary changes," >}} by temporarily disabling this for MSVC until there is a solution from Microsoft. The actual reason for this is currently unknown.
- byte[] {{< gh-hovercard "11113" "fixed a bug that caused the `Quake` homebrew from failing to launch," >}} and {{< gh-hovercard "11135" "also fixed a bug that resulted `Splatoon 3` having an endless loading screen when LAN was enabled," >}} by implementing the missing service functions.
- byte[] also {{< gh-hovercard "11016" "fixed an issue within yuzu's filesystem" >}} which resulted in either corrupt save data or failing to save data.
- A bug resulting in games like `TLoZ: Breath of the Wild` and `TLoZ: Tears of the Kingdom` to crash on Linux, due to `DBus` expecting a `UTF8` string was {{< gh-hovercard "11007" "fixed." >}}
- [Morph](https://github.com/Morph1984) {{< gh-hovercard "10999" "fixed a bug that broke the game installation progress bar" >}} after the recent buffer size increase, by refactoring the progress bar calculation code.
- Morph also {{< gh-hovercard "11173" "fixed a bug where yuzu would crash on systems with weaker CPUs" >}}, due to yuzu's strict requirements on CPU clock.
- Narr reduced almost 2GB of memory usage, by {{< gh-hovercard "11128" "fixing a memory leak within yuzu's discord game presence" >}} presumed to be caused by `cpp-httplib`.
- Narr also {{< gh-hovercard "11142" "fixed a crash in yuzu's gamelist" >}} which happened when you loaded yuzu without keys.
- [Steveice10](https://github.com/Steveice10) made {{< gh-hovercard "10974" "few improvements to Vulkan surface creation on macOS," >}} while [comex](https://github.com/comex) made {{< gh-hovercard "10990" "few fixes and workarounds for macOS to resolve few undefined behaviour errors." >}}


&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
