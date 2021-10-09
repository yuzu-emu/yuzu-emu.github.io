+++
date = "2021-10-08T12:00:00-03:00"
title = "Progress Report September 2021"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 0
+++

Hi yuz-ers! Welcome to the latest entry in our monthly progress reports. This time we have yet even more GPU rendering fixes, TAS support, 8 players mayhem, input and UI 
changes, some preliminary work for future big changes, and more!

<!--more--> 

## **A**fter **T**esting **I**mages, and other graphical fixes

Certain AMD and Intel GPUs were unable to utilize yuzu's unlock FPS feature on Vulkan, due to the lack of driver support for the `VK_PRESENT_MODE_MAILBOX_KHR` presentation mode.
They, however, support `VK_PRESENT_MODE_IMMEDIATE_KHR`, another mode that allows to present at a higher framerate than the screen refresh rate, so 
[epicboy](https://github.com/ameerj) made the [necessary changes](https://github.com/yuzu-emu/yuzu/pull/7003) in order to unlock FPS on these GPUs.
Due to the nature of this presentation mode, this may cause visible tearing on the screen, so bear that in mind if you try this out.

{{< imgs
	"./framerate.png| And this is with just an RX 550 (Metroid Dread)"
  >}}

Booting a title in Linux with the Vulkan API using the Intel Mesa driver resulted in a crash due to a device loss error.
The problem laid on the synchronization between the rendering and subsequent presentation of frames.

Previously, yuzu would issue the Vulkan `Present` command, then wait for the frame to be rendered before continuing with the process.
While this was fine for other drivers and vendors, ANV (Intel’s Vulkan driver) expected to have the frame already rendered before this command, which caused this error.

epicboy fixed the synchronization behaviour so that 
[yuzu now waits until the frame is fully rendered and ready before presenting it](https://github.com/yuzu-emu/yuzu/pull/6953).

With the release of AMD’s Windows driver version 21.9.1, and its equivalent AMDVLK and AMDGPU-PRO Vulkan Linux counterparts, users started noticing crashes in most games right 
at boot.
We rushed once again to blame AMD for breaking another extension, as it wouldn’t be the first time.
We even singled out `Int8Float16` as the culprit, providing an 
[alternative path that reduced performance on all AMD GPUs running non-RADV drivers.](https://github.com/yuzu-emu/yuzu/pull/7006)

We were wrong.

Turns out, it was our fault. 
epicboy found out that during the process of initializing Vulkan, the emulator 
[assigned Int8Float16’s values after its memory was freed.](https://github.com/yuzu-emu/yuzu/pull/7027) 
Surprisingly, this only started affecting official AMD drivers recently, after their periodical Vulkan version update.
So we had to lay down the pitchforks, *this time.*
No performance numbers were harmed during the production of these PRs.

AMD Windows users are also familiar with certain stages in `Super Smash Bros. Ultimate` turning completely white, or ghosting in a way similar to how we used to play when 
Internet Explorer froze back in the Windows XP era.
Those were the good days. 
For you kids out there, yes, there are older Windows versions than 7.

Ahem, anyway, AMD Radeon GPUs lack support for fixed point 24-bit depth textures, or D24 for short, a relatively common texture format.
To bypass this hardware limitation, yuzu uses D32 textures instead, which can cause precision issues during the conversion process. 
[By adjusting the Depth Bias and Polygon Offset of yuzu’s D24 emulation,](https://github.com/yuzu-emu/yuzu/pull/7070) Blinkhawk solves the issue for good.

{{< single-title-imgs
    "Fair play, please (Super Smash Bros. Ultimate)"
    "./smashbug.png"
    "./smashfix.png"
    >}}

Yet another AMD Radeon specific issue is visible when playing `The Legend of Zelda: Breath of the Wild`.
Terrain textures looked colourful and corrupted, like the default RGB rainbow puke setting of most “gaming” hardware.

This issue affected our regular suspects, GCN4 devices (Polaris, RX 400/500 series) and older, running on the Windows and Linux proprietary Vulkan drivers. 
GCN5 (Vega), RDNA1, and RDNA2 devices were unaffected.
The problem resides in how we guess the textures are being handled by the game.

Some information first, there are several ways to handle textures, and in this particular example we need to focus on two, `Cube Maps` and `Texture Arrays`.

Cube maps are a cube with it’s six faces filled with different textures.
The coordinate used to fetch the data, unlike the regular X and Y values, is a single [versor](https://en.wikipedia.org/wiki/Versor) originating from the center and pointing 
to the surface of the cube.

{{< imgs
	"./array.png| "
  >}}

Texture arrays on the other hand are just as the name implies, an ordered array of textures one after the other, with X and Y used for positioning information inside the 
texture, and a Z axis used to determine which texture of the array is in use.

{{< imgs
	"./cube.png| "
  >}}


So tl;dr, one is a sphere and the other is a list.

Vulkan allows to mark textures to be converted into cube maps later if needed, but the sampling (reading) is determined by the texture type specified by the game’s shader 
instructions. This type is then passed to the graphics API.
We do so and the game instead decides to just keep its textures as arrays, its own decision.
The AMD driver on the other hand decides that the textures shall be sampled as cube maps, ignoring what the texture view determined just before.

While this should not be a problem on its own, as coordinates can still be pulled out from the wrong texture type, the driver can end up reading the wrong texel.

[By disabling Cube Compatibility on GCN4 and older devices running the official AMD proprietary drivers,](https://github.com/yuzu-emu/yuzu/pull/7076) epicboy returned proper 
sense to the devastated land of Hyrule.

{{< single-title-imgs
    "I prefer no RGB, thanks (The Legend of Zelda: Breath of the Wild)"
    "./botwbug.png"
    "./botwfix.png"
    >}}

Speaking of RGB, [as discussed back in February](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2021/#paint-me-like-one-of-your-french-bits), yuzu has to use compute 
shaders to convert most BGR texture formats in OpenGL to avoid mismatched colours.
While this can work fine on most current GPUs, there’s a performance cost that can affect older and slower products.

Users of Kepler series Nvidia GPUs (usually GTX 600/700 series, with several renamed 800 and 900 series too) could experience those performance penalties while also producing 
corrupt rendering.
Instead of using compute shaders to swizzle textures, epicboy figured we could just use `Pixel Buffer Objects` 
[(or PBO for short)](https://www.khronos.org/opengl/wiki/Pixel_Buffer_Object) for [all affected texture formats instead.](https://github.com/yuzu-emu/yuzu/pull/7036) 
This has many benefits, it solves Kepler BGR issues, improves performance on weak devices from any GPU vendor, and is also a required change for `A.R.T.`, the resolution 
scaler in development.

{{< single-title-imgs
    "A Hat in Time"
    "./keplerbug.png"
    "./keplerfix.png"
    >}}

On the subject of changes needed for the resolution scaler, Blinkhawk implemented [fixes to queries and indexed samplers.](https://github.com/yuzu-emu/yuzu/pull/7077)
The result is fewer crashes while playing `Luigi’s Mansion 3` on Intel and AMD GPUs, be it on Windows or Linux. 
This PR also helps improve stability for `A.R.T.` too.

Another issue affecting `Luigi’s Mansion 3` is related to its use of [Tessellation Shaders](https://en.wikipedia.org/wiki/Tessellation_(computer_graphics)) on Vulkan.
The Vulkan specification requires the input-assembler topology to be `PATCH_LIST` in the tessellation stages. Not all games follow this, so 
[manually forcing it](https://github.com/yuzu-emu/yuzu/pull/7101) solves crashes experienced in some drivers, more specifically, as you may have guessed it, AMD’s proprietary 
ones. All thanks to our fishy epicboy.

epicboy has also [fixed some minor bugs with the `StencilOp`](https://github.com/yuzu-emu/yuzu/pull/7001), a type of data buffer intended to help limit the size of the 
rendering area. 
Thanks to this, `WarioWare: Get It Together!` properly renders its models.

{{< single-title-imgs
    "Waa! (WarioWare: Get It Together!)"
    "./waabug.png"
    "./waafix.png"
    >}}

[vonchenplus](https://github.com/vonchenplus) added support for the legacy GLSL `gl_Color` and `gl_TexCoord` attributes into our Vulkan backend, so that any game that uses 
them can render properly when using this API.

Both these attributes are part of a set of attributes with specific definitions and uses.
But they were deprecated on newer versions of OpenGL, in favour of "generic" attributes that the programmer can freely define as they want, based on their needs.

While OpenGL is still able to run shaders that use this legacy feature for the sake of  backwards compatibility, they were already considered obsolete by the time Vulkan was 
created, which means that this API lacks a fallback.

What vonchenplus did is use generic attributes in Vulkan to emulate these features, so that they behave exactly as the legacy GLSL attributes.

After that, vonchenplus corrected the definition of [the values in an enum](https://github.com/yuzu-emu/yuzu/pull/6980) used for blending textures.

Both these changes affect `DRAGON QUEST III: The Seeds of Salvation`, fixing the graphical bugs present in this game.

{{< single-title-imgs
    "DRAGON QUEST III: The Seeds of Salvation"
    "./dqbug.png"
    "./dqfix.png"
    >}}

## Tool-assisted speedrun

[MonsterDruide1](https://github.com/MonsterDruide1) has added [TAS support](https://github.com/yuzu-emu/yuzu/pull/6485) to yuzu!
This means precise input commands can be recorded and replayed in-game.
The format used to store them is the one [TAS-nx](https://github.com/hamhub7/TAS-nx/tree/master/scripts) implemented, and we have a guide on 
[how to enable and use this feature here.](https://yuzu-emu.org/help/feature/tas/)

You can access TAS configuration by going to `Tools > Configure TAS…`

{{< imgs
	"./tas.png| "
  >}}

## Other input changes

Let’s start with a nice addition by [german77](https://github.com/german77) that will make `Super Smash Bros. Ultimate` Parsec players happy, and several others too of course. 
There’s now an option to enable [8 player support](https://github.com/yuzu-emu/yuzu/pull/6950) for XInput devices, at the cost of disabling the Web Applet. A small price to pay 
for epic fights with your friends.

You can find the option in `Emulation > Configure… > Controls > Advanced > Enable XInput 8 player support (disables web applet)`.

{{< imgs
	"./8.png| "
  >}}

[v1993](https://github.com/v1993) later [hid the option on non-Windows OSes,](https://github.com/yuzu-emu/yuzu/pull/7042) as this limitation doesn’t apply outside the Windows 
SDL builds.

Linux kernel drivers for Joy-Cons use a different naming convention than the ones we use on Windows. 
[Properly following this convention makes the Dual Joy-Con input show up in the device list.](https://github.com/yuzu-emu/yuzu/pull/6979) german77 thinks of the penguins.

## UI changes

With the release of [Project Hades](https://yuzu-emu.org/entry/yuzu-hades/), yuzu started using a full `Pipeline cache` instead of single stages of the graphics pipeline, both 
in Vulkan and OpenGL.
This means parts of our UI were outdated so, [your degenerate writer](https://github.com/goldenx86) decided to simply 
[update the context menu entries,](https://github.com/yuzu-emu/yuzu/pull/6976) from Shader cache to Pipeline cache.

Following suit, [Moonlacer](https://github.com/Moonlacer) helped [replace `Use disk shader cache` with `Use disk pipeline cache`](https://github.com/yuzu-emu/yuzu/pull/6977). 
¡Gracias!

Later on, Moonlacer [removed the toggle](https://github.com/yuzu-emu/yuzu/pull/7020) for `Enable audio stretching` from the audio settings, as it no longer had any purpose. 
As a general rule, the fewer options available, the better.

Morph decided to [eliminate a 2 year old feature,](https://github.com/yuzu-emu/yuzu/pull/7102) [boxcat](https://yuzu-emu.org/entry/yuzu-boxcat/). 

BCAT is a network service used by the Nintendo Switch to add content to its games without needing constant updates.
Our old BCAT implementation only added some “gifts” our developers placed into games that were playable at the time, it was unable to support real case uses, like the updates 
games like `Animal Crossing: New Horizons` regularly push.

While the plan is to add support for this in the future, major changes to the file system emulation need to come first.

[behunin](https://github.com/behunin) implemented much needed [clean ups to our debug configuration window.](https://github.com/yuzu-emu/yuzu/pull/7068)
Check the results below:

{{< single-title-imgs
    " "
    "./debugbug.png"
    "./debugfix.png"
    >}}

## General bugfixes

epicboy noticed a memory leak that would grew progressively after stopping and restarting the emulation, which was caused by yuzu’s `main_process` not  being cleaned up.
[By destroying this process when stopping emulation ](https://github.com/yuzu-emu/yuzu/pull/7009), the resources are properly freed now, fixing the leak.

Additionally, epicboy also mitigated the crashes that happened when the emulation was stopped by 
[using std::jthread for worker threads](https://github.com/yuzu-emu/yuzu/pull/7019).

`std::jthread` is a [new implementation of the thread class that was recently introduced in C++20](https://en.cppreference.com/w/cpp/thread/jthread), which alleviates their 
management and usage, since they simplify some of the synchronization challenges inherent to multithreading.

With this change, the number of crashes caused by race conditions between working threads upon shutdown was supposed to decrease, but it also introduced a new bug that would 
cause yuzu to hand when the emulation was stopped.

The reason behind this problem was caused by the order in which objects were being destroyed, which epicboy 
[fixed in a follow-up PR](https://github.com/yuzu-emu/yuzu/pull/7078).

[bunnei](https://github.com/bunnei) also [introduced std::jthreads into the cpu_manager](https://github.com/yuzu-emu/yuzu/pull/6965), in favour of using this more efficient 
implementation of the class for yuzu's host threads.

He also made changes so that the KEvents used in the nvflinger [service](https://github.com/yuzu-emu/yuzu/pull/6968) and [queue](https://github.com/yuzu-emu/yuzu/pull/6971) 
are owned by these services, instead of being owned the process for the emulated game, which makes the implementation more accurate.

We’ve been trying to focus on improving our homebrew support, as this isn’t a powerful tool that only developers use, for example modders have  very powerful homebrew apps 
that the Switch community enjoys.
One important example is [UltimateModManager](https://github.com/ultimate-research/UltimateModManager), or UMM for short, which refuses to work on yuzu for now.

To counter this, [ogniK](https://github.com/ogniK5377) allowed homebrews running in yuzu the [creation of subdirectories](https://github.com/yuzu-emu/yuzu/pull/6974), 
resulting in UMM managing to at least start.
And [Morph](https://github.com/Morph1984) did a [partial implementation of the `GetFileTimeStampRaw` service,](https://github.com/yuzu-emu/yuzu/pull/7010) removing several 
warnings.

This isn’t enough to allow full UMM compatibility, but we’re getting there.

Some games pop-up a confirmation window when trying to stop emulation.

{{< imgs
	"./exit.png| Like this"
  >}}

This kind of redundant question is made by the game itself and while we always had a toggle to skip it, it wasn’t working properly. epicboy comes to the rescue, 
[fixing the toggle](https://github.com/yuzu-emu/yuzu/pull/6997) for good and saving us trying to stop our games some seconds of time in the process.

If you wish to change this behaviour, the option is in `Emulation > Configure… > General > Confirm exit while emulation is running`.

v1993 [moved all QtWebEngine data to a more organized centralized folder,](https://github.com/yuzu-emu/yuzu/pull/7075) improving consistency and reducing clutter from the 
user’s storage.
Instead of a separate folder in `%appdata%`, information is now saved in yuzu’s directory, `%appdata%\yuzu\qtwebengine` by default.

[toastUnlimited](https://github.com/lat9nq) 
[performed his first stubbing surgery with the audio input services `Start`, `RegisterBufferEvent`, and `AppendAudioInBufferAuto`.](https://github.com/yuzu-emu/yuzu/pull/7018) 
This way, `Splatoon 2` can now be played via [LAN](https://yuzu-emu.org/entry/yuzu-progress-report-aug-2021/#lan-party-time) without requiring the use of auto-stub. Happy 
splatting!

german77 [stubbed `SetTouchScreenConfiguration` and implemented `GetNotificationStorageChannelEvent`](https://github.com/yuzu-emu/yuzu/pull/6992) to make `Dr Kawashima's Brain 
Training for Nintendo Switch` playable.

{{< imgs
	"./brain.png| Dr Kawashima's Brain Training for Nintendo Switch"
  >}}

He has also [stubbed `Match`](https://github.com/yuzu-emu/yuzu/pull/7015) to make `Cruis'n Blast` playable. 
This game experiences some crashes, so there’s more work to do.

{{< imgs
	"./blast.png| Cruis'n Blast"
  >}}

ogniK [implemented the `EnsureTokenIdCacheAsync` service,](https://github.com/yuzu-emu/yuzu/pull/6975) making `Death Coming` go in-game, albeit with some graphical bugs that 
we have to sort out in the future.

{{< imgs
	"./death.png| Death Coming"
  >}}

Morph has been working on implementing what is needed to get `Diablo II: Resurrected` working.
Initially, the [`Read` socket service was implemented](https://github.com/yuzu-emu/yuzu/pull/7082), but this mandates also implementing more complex services like `Select` and 
`EventFD`. 
EventFD is particularly tricky as there is no native support for it on Windows, so a considerable amount of work is needed to properly emulate it in the most popular OS.

As a temporary alternative, [Read was just stubbed,](https://github.com/yuzu-emu/yuzu/pull/7085), allowing the game to boot.

{{< imgs
	"./diablo.png| Diablo II: Resurrected"
  >}}

## Future projects

For anyone wondering about `Project A.R.T.`, the following image speaks of its own.

{{< imgs
	"./art.png| Xenoblade Chronicles Definitive Edition"
  >}}

Regarding other works, there are more rendering fixes underway, and we’re already starting plans on what to focus on after A.R.T. is finished.

That’s all folks! We thank you for your kind attention, and see you next month!

&nbsp;
{{< article-end >}}
