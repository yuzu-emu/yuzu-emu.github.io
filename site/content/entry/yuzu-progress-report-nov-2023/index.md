+++
date = "2023-12-18T12:00:00-03:00"
title = "Progress Report November 2023"
author = "GoldenX86"
forum = 963750
+++

Hello there, yuz-ers! November brought us many GPU fixes, followed shortly by driver fixes, significant Android/ARM changes, more applet work, new input projects, and much more!

<!--more--> 

## Mario Role-playing as Mario!

As if `Super Mario Bros. Wonder` wasn’t enough, a cult classic is back, with improved graphics to boot!
`Super Mario RPG` brings some distilled nostalgia to the old SNES-era guard (we still stand strong), so the question was at the tip of their tongues on release day: "Does it run in yuzu?"

It did ― with some buts, as usual.
Two things needed to be fixed to get this colourful cast into good shape: an audio fix affecting everyone and a separate fix for NVIDIA users.

{{< single-title-imgs
    "Is she in that castle? (Super Mario RPG)"
    "./rpg1.png"
    "./rpg2.png"
    "./rpg3.png"
    >}}

Users immediately noticed how the game’s background audio was completely muted, detracting a lot from the experience.
After performing a cross-examination, [with music and all](https://youtu.be/5I443rHIYVk), [byte[]](https://github.com/liamwhite) found out the cause was {{< gh-hovercard "12058" "a leftover" >}} from the Opus rewrite [Maide](https://github.com/Kelebek1) did [back in September](https://yuzu-emu.org/entry/yuzu-progress-report-sep-2023/#audio-changes).
With this specific case fixed, the game started playing audio as it should.

Meanwhile, [epicboy](https://github.com/ameerj) performed a separate investigation in the shader recompiler for NVIDIA’s broken rendering.

{{< single-title-imgs
    "Imagine if the Switch was capable of HDR (Super Mario RPG)"
    "./rpg4.png"
    "./rpg5.png"
    >}}

For those not familiar with the shader pipeline of yuzu and other emulators:

Games have compiled shaders built for the architecture of the console they are intended to run on – in this case, the Switch.
Those shaders are useless for any other device, so the emulator has to intercept those shaders during run-time, convert them into a shader format the selected graphics API can understand (in yuzu’s case the options are SPIR-V, GLSL, and GLASM), and only then those converted shaders can be sent to the GPU driver for rendering.
After multiple steps of conversion, a Switch shader finally gets turned into a, for example, Ampere shader, or Adreno, or RDNA3.
(And now you know why shader stuttering is a thing.)

NVIDIA drivers have a lot of optimizations for various code patterns in shaders. When you hit a bug in these optimizations, odd stuff can happen, regardless of settings, API, or shader backend in use. There’s no escape.
In this case, it led to swapped character colours in menus because NVIDIA drivers disliked {{< gh-hovercard "12066" "the specific pattern" >}} the game’s shader used in menus ― and unlike most other driver bugs, it was broken in every single backend!

Here’s a generic example provided by epicboy:

```cpp
uint low = uint(bitfieldExtract(some_number, 0, 16));
low <<= 16U;
uint high = uint(bitfieldExtract(some_number, 16, 16));
uint swapped = low + high;
```

epicboy’s solution was to detect this specific pattern in yuzu before passing it to the driver, and replace the last line with a [bitwise OR](https://en.wikipedia.org/wiki/Bitwise_operation):

```cpp
uint swapped = low | high;
```

This makes the NVIDIA compiler happy and provides colour accurate character sprites in the game–everyone wins.

{{< single-title-imgs-compare
	"Wario? (Super Mario RPG)"
	"./rpgbug.png"
	"./rpgfix.png"
>}}

With both issues out of the way, there’s only one thing left to say: Happy stomping!

## Project NiCE

Here it is! 
Time to graduate from a PC emulator compatible with Android to a "native" Android emulator.

{{< gh-hovercard "12074" "NCE support," >}} or `Native Code Execution`, a huge effort made by [GPUCode](https://github.com/GPUCode) and byte[], adapted [Skyline](https://github.com/skyline-emu/skyline)’s ability to run game code natively on ARM devices, with no recompiler to slow things down.

This sounds great on paper, but what does it mean for users?
The advantage of using a JIT recompiler is ensuring compatibility regardless of the device in use ― that’s how an AMD64 computer can run 64-bit ARM games.
While this method is good enough for AMD64 desktop and laptops (and one of the few possible ways to do it), it’s very slow on Android phones and tablets, not to mention very taxing, as the recompiled code is less efficient, uses a lot of resources, and requires more power to execute as a byproduct, resulting in increased heat.

Thanks to dropping the translation overhead of a JIT, NCE increases performance proportional to how much power and thermal headroom is available on the user’s device. 
NCE also saves up to 128MB of memory per guest CPU core (of which the Switch has four), meaning up to 512MB of RAM is saved by dropping the JIT.

Having a device with active cooling will still produce the best results, but with NCE, performance is higher, battery life is higher, heat output is lower, and games load faster.
The FPS boost is usually around 20-100%, depending on the game and device.

{{< single-title-imgs
    "Results aren’t comparable between the two devices, Mali was run at 0.5x to reduce its bottleneck"
    "./nce1.png"
    "./nce2.png"
    >}}

Sadly, as always, it’s not all perfect ― "restrictions may apply."
Not all games can take advantage of NCE. 
Due to limitations in the Linux kernel and the requirements to run on a very restricted memory address space, some early Switch games need to have their updates installed to be able to run with NCE.
Games like `The Legend of Zelda: Breath of the Wild` and `ARMS` use a deprecated 36-bit address space in their original v1.0.0 release, and NCE requires 39-bit to work. Here the emulator automatically reverts to JIT to allow booting the game.
These games get full 39-bit support only with their respective updates installed.
You can confirm this when enabling the framerate counter, which will show if NCE or JIT is in use:

{{< single-title-imgs
	"As simple as that (The Legend of Zelda: Breath of the Wild)"
	"./jit.png"
	"./nce.png"
>}}

Another limitation is 32-bit games. `Mario Kart 8 Deluxe` and `Captain Toad: Treasure Tracker`, among others, just won’t work with NCE, and the emulator will, just like with 36-bit games, automatically revert to using the [Dynarmic](https://github.com/merryhime/dynarmic) JIT.

While there are ways to be able to use NCE with 32-bit games, our investigation found that it would require a secondary 32-bit build target, which we have never supported, and it is no longer viable on Android API versions for Android 11 or later, which happens to be our minimum requirement.

There are also rare cases of games refusing to work with NCE, due to Linux being less permissive than the Switch operating system. One example is `Paper Mario: The Origami King`, which needs to have NCE manually disabled to run correctly for the moment.

These limitations apply to both Android devices and other ARM devices like Linux ARM boards or laptops.

We enable NCE by default on the latest GitHub and Play Store builds. The option can be found in `Settings > Advanced settings > Debug > CPU backend`.

{{< imgs
	"./cpu.png| Doesn’t hurt to double check"
  >}}

For the setting "optimizers" out there, disabling Fastmem disables NCE with it, so we don’t recommend disabling it unless you cannot run the game you want otherwise.
If you see old pictures of games running with Fastmem disabled but still showing NCE under the framerate counter, that’s because the counter didn’t consider this scenario originally; it has since then been patched to correct this.

## Yet more changes for Android

But why stop there? There’s more work baked into the Android builds ― here’s this month’s list:

- byte[] authored and [t895](https://github.com/t895) uploaded the {{< gh-hovercard "11972" "FPS counter." >}} The text was changed to white, its reading is now continuously updated, and it now mentions what CPU backend is in use, JIT or NCE. The FPS counter can be enabled by dragging from the left while running a game and selecting `Overlay options > FPS counter`.
- {{< gh-hovercard "12018" "Many improvements were made to the settings tab, thanks to t895." >}} Icons and descriptions have been added, and the order of the elements and the location of some settings was changed.
{{< imgs
	"./icons.png| Pretty"
  >}}
- {{< gh-hovercard "12014" "The Settings tab and About page" >}} have been tweaked to add a landscape layout. This work by t895 improves usability for tablets, foldables, and other large form-factor devices.
{{< single-title-imgs
    "Thank you Alphonsokurukuchu for the tablet pics"
    "./layout1.png"
    "./layout2.png"
    >}}
-  t895 {{< gh-hovercard "12034" "added a drop shadow" >}} to the FPS counter to improve readability, and allowed the device’s font style to control the text size of the FPS readout.
- When enabled, {{< gh-hovercard "12035" "t895 now blocks Picture-in-Picture" >}} during startup or shutdown, improving stability.
- [Blinkhawk](https://github.com/FernandoS27) {{< gh-hovercard "12036" "disabled write syncing" >}} on Android devices running Turnip drivers, fixing crashes in games like `Red Dead Redemption` and `Luigi’s Mansion 3`.
- By democratic decision from the users, {{< gh-hovercard "12043" "t895 has disabled Picture-in-Picture " >}} by default. Work by t895.
- Blinkhawk re-enabled using {{< gh-hovercard "12081" "multithreaded pipeline compilation" >}} for Android, reducing stuttering when loading caches at boot and building new shaders while in-game. This was made possible thanks to the lower resource consumption under NCE.
- byte[] found another cause for {{< gh-hovercard "12083" "crashes on Mali GPUs:" >}} they don’t support multi-viewport rendering. Disabling this feature greatly improves stability on Mali equipped devices. (And so the list of features Mali doesn’t support keeps growing.)
- The upper {{< gh-hovercard "12091" "speed limit was increased to 400%," >}} as t895 found out using a high limit is more stable than disabling it at all. Happy benchmarking! 
- When accessing the Search tab, t895 set the first results before filtering to be your {{< gh-hovercard "12092" "most recently played games." >}}
- Thanks to t895, you can now {{< gh-hovercard "12093" "store save exports locally" >}} by using a file picker.
- Another Mali limitation, another workaround by byte[]. This time {{< gh-hovercard "12110" "nullDescriptor got a special slower codepath" >}} so Mali devices can run `Super Smash Bros. Ultimate`. Everyone is here!
- byte[] also fixed an {{< gh-hovercard "12140" "edge case in the query cache" >}} that caused crashes on Turnip drivers.
- Users reported the {{< gh-hovercard "12166" "face ABXY buttons on Redmagic controllers" >}} were flipped, so [german77](https://github.com/german77) addressed the issue.
- t895 added support in the UI for {{< gh-hovercard "12204" "multiple game folders" >}} and the ability to scan subdirectories. Feel free to be as disorganised as you want now; we won’t judge.
{{< imgs
	"./folders.png| We chads use a single folder"
  >}}
- And to close up, after fixing issues affecting Mali and Turnip, byte[] decided it was Qualcomm’s turn to get the axe. The vertex input dynamic state {{< gh-hovercard "12229" "Vulkan extension" >}} is marked as supported by most official Qualcomm drivers and devices, yet on older 600 series GPUs it’s completely broken, leading to games only displaying a black screen. Excluding this extension solves the issue, and exposes how Qualcomm only tests its drivers on very basic conformance tests and nothing else. Do the bare minimum work, let the community do the rest for you…

## Graphics changes

The `Force maximum clocks` setting seems to cause a lot of confusion among users, which sadly leads to it being enabled in cases where it isn’t intended to be used, particularly power/thermally restricted devices.

The setting was originally intended to solve an AMD problem: their RDNA based cards suffer from severe downclocking, or what your writer calls "chronic downclocking syndrome", when emulating many games. 
The GPU load the emulator produces is often so low, its workload fails to be detected as a game, causing the card to keep its clock speeds set to extremely low values.
As you might expect, this leads to very low performance.

Enter `Force maximum clocks`, which on desktop yuzu simply generates a dummy compute load to run on the GPU, triggering the card to clock up by force.
While this solves the issue and puts the performance of AMD cards on par with NVIDIA (and even helps NVIDIA cards under some scenarios), running a compute load like this is *not* a viable option for integrated GPUs.
Mobile devices have limited cooling and a power budget: there’s a limited amount of power the CPU and the GPU can share, and enabling the setting will shift that budget’s priority to the GPU, while the user wants to run an emulated game, which is almost always severely CPU bottlenecked.
The extra power demanded by the compute load leads to increased heat, which will cause lower performance when cooling is not up to par.

So, what we mean by all this is, don’t use `Force maximum clocks` on handhelds {{< gh-hovercard "12153" "like the Steam Deck," >}} integrated-GPU-only portable computers with limited cooling capabilities, or integrated GPU desktop PCs.
The setting will result in degraded performance and extra bothersome fan noise, and it is only intended for dedicated GPUs with proper cooling.
Not every guide online knows what they are talking about.

To help combat this, byte[] expanded the blocklist of this setting to include the recently released Steam Deck OLED.
Since there's no hardware variance in the Steam Deck, it’s a safe case to block.

After Linux NVIDIA users running the Wayland display server reported crashes when using the latest drivers, newcomer [lucasreis1](https://github.com/lucasreis1) found the cause: The new driver seems to need {{< gh-hovercard "11981" "allocating window resources" >}} before asking or system info.
Adding the correct line in the correct place [makes all the difference in the world](https://youtu.be/tXGyEq3OJSo?t=41).
Wayland NVIDIA users can now load games crash-free. Thanks!

byte[] and Maide have been working on performance improvements for video decoding, aiming to not rely exclusively on FFmpeg for this task.
The {{< gh-hovercard "12045" "initial changes" >}} are up, but more work is needed until the results reach the end user.

Blinkhawk managed to catch and {{< gh-hovercard "12072" "fix several regressions" >}} affecting `Pokémon Scarlet/Violet` introduced by the new Query Cache.

{{< imgs
	"./scarlet.png| Playable again (Pokémon Scarlet)"
  >}}

In a bit of sad news, byte[] had to {{< gh-hovercard "12173" "disable" >}} the support for the depth bias Vulkan extension which was intended to solve the D24 issues affecting AMD cards on Linux (the Windows driver doesn’t support it yet, and uses a different workaround).
RADV users (the Linux Mesa Vulkan driver for AMD GPUs) noticed issues with certain stages in `Super Smash Bros. Ultimate`.
Investigating the cause reveals that, even with the use of the extension, you can only fix some games and break others in the process.
While we investigate alternatives for this situation, the old workaround is back in place, allowing players to fight in the Nintendo 64 Zelda stage without going blind from the glare.

{{< single-title-imgs-compare
	"Back to the drawing board (Super Smash Bros. Ultimate)"
	"./smashbug.png"
	"./smashfix.png"
>}}

Never forgetting about good old OpenGL, epicboy has a list of changes for it this month too.

First of all, he {{< gh-hovercard "12056" "implemented asynchronous downloads," >}} a feature that was previously only available on Vulkan, leading to an 11% performance boost when using the old API.

Next, epicboy fixed the rendering issues affecting `Xenoblade Chronicles: Definitive Edition` and `Xenoblade Chronicles 3` when using the {{< gh-hovercard "12068" "GLASM shader backend" >}}― these two games heavily rely on transform feedback to render.
That Monado can look good even if you’re still rocking a Kepler GPU.

Continuing the work on improving the performance of OpenGL, epicboy implemented the use of the `glBindVertexBuffers` and `glBindBuffersRange` {{< gh-hovercard "12094" "commands," >}} making the use of the previous `GL_NV_vertex_buffer_unified_memory` extension obsolete.
This reduces the API call overhead that is so notorious in OpenGL, reducing CPU use as a result.

And finally, to close the section, epicboy helped to mitigate a bothersome disadvantage OpenGL has, shader build times ― but only when the user is running NVIDIA hardware.
By lowering the size of {{< gh-hovercard "12196" "the constant buffer" >}} in the declaration to the size actually used by the shader, shader compilation performance is improved!
It’s not as good as Vulkan, but it’s certainly a VERY welcome addition for those cases where OpenGL is the only option.

## Applets, input, and other services

Back this month for more is [Macj0rdan](https://github.com/Macj0rdan) along with german77, partners in crime working in implementing the {{< gh-hovercard "12011" "controller menu applet." >}}
Functionality is limited at the moment, but you can now see your connected controllers just as intended.
As usual, a firmware dump is required to launch any applets.

{{< single-title-imgs
    "While this is native fun, don’t expect it to be very usable for the time being"
    "./applet1.png"
    "./applet2.png"
    "./applet3.png"
    >}}

Working on his own, german77 managed to {{< gh-hovercard "11969" "fix the profile pictures" >}} for all currently available system applets, like for example, during profile selection.
The Switch wants exactly 256x256 images, so included as part of the package is a resizer to just give the applet what it wants.

{{< imgs
	"./profiles.png| They’re multiplying!"
  >}}

Continuing his [previous work](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2022/#input-improvements) on infrared shenanigans (which thankfully don’t involve explosives or self-guidance), german77 finished {{< gh-hovercard "11980" "implementing the" >}} `moment image processor`.
This means games like `Trombone Champ`and `WarioWare: Put a lid on it` are now playable with Joy-Cons.
Feel free to crack that volume dial and torture your neighbours to your heart’s content.
Here’s an example by german77 himself, enjoy:

{{< imgs
	"./trombone.mp4|Guitar Hero got nothing on this (Trombone Champ)"
  >}}

Switching a bit to input, german77 fixed an omission in the input code regarding the {{< gh-hovercard "12007" "single Joy-Con SL and SR" >}} buttons, allowing one of the minigames of `WarioWare: Plug your leaks` to be playable. Oops.

{{< imgs
	"./leak.png|Got teflon tape? (WarioWare: Plug your leaks)"
  >}}

This breaks backwards compatibility with saved input profiles of single right Joy-Cons ― an unlikely configuration for most games. If you are using this configuration, you might have to rebind your controller, but other profiles are unaffected.

Thanks to the work of newcomer [dima-xd](https://github.com/dima-xd), the native {{< gh-hovercard "11929" "software keyboard applet" >}} can be run. 
Sadly, it’s not possible to use it in games at this moment, as it can't be launched on demand yet ― multiprocess support is needed for this.
As an apology, here’s how it looks:

{{< imgs
	"./osk.png| Tactile switches? Touch Switch!"
  >}}

Since yuzu can now work with Mii data inside Amiibos, the code will also automatically {{< gh-hovercard "12183" "validate their integrity." >}}
Thanks to german77’s work, the emulator can now detect corrupted Amiibos and automatically load a backup.
This avoids crashes in games sensitive to Amiibo integrity, like `Super Smash Bros. Ultimate`.

Macj0rdan, working solo this time, has a separate fix for us.
The controller applet started crashing after the release of firmware 17.0.0.
New firmware, new functions to implement ― in this case, {{< gh-hovercard "12201" "implementing" >}} `SetTouchscreenDimensions` solved the problem.

One of the calls `Super Bomberman R 2` makes checks for blocked users. 
Since the emulator doesn’t yet store that information, nor has any use for it anyway, it’s {{< gh-hovercard "12107" "safe to stub," >}} which is exactly what newcomer [daisymlleung](https://github.com/daisymlleung) did. Thank you!

{{< imgs
	"./bomber.png|The game only boots for now, it doesn’t reach in-game yet (SUPER BOMBERMAN B 2)"
  >}}

To close out this section, [toastUnlimited](https://github.com/lat9nq) had to deal with Qt shenanigans.
Qt’s text parsing didn’t like how yuzu's frontend strings were stored, causing it to miss many UI translations.
A bit of {{< gh-hovercard "11984" "restructuring" >}} by the Unlimited Toast, and we’re back in business.

## Miscellaneous changes

To help users check the status of their firmware installation, and since the firmware version makes a difference for the system applets, german77 added a {{< gh-hovercard "12156" "firmware version indicator" >}} to the status bar of the user interface.
Gone is the confusion about "when was the last time I updated this?"

{{< imgs
	"./fw.png|One day there will be an easier way to install firmware"
  >}}

Mouse emulation, along with keyboard emulation, are options for users within yuzu for the few games that support it.
These are available in `Emulation > Configure… > Settings > Controls > Advanced`, and report to games that a USB keyboard and/or mouse is plugged to the console.

To help mouse players ― and we don’t mean "use mouse as a stick for aiming", we mean emulating an attached USB mouse ― german77 made sure the actual native cursor of your OS {{< gh-hovercard "12160" "doesn’t leave the yuzu window." >}}
If you hate clicking your own game out of focus, you will like this change.

While continuing his work on improving yuzu’s file system emulation, byte[] solved a bug that caused `MONSTER HUNTER GENERATIONS ULTIMATE` to {{< gh-hovercard "11936" "fail to boot" >}} when RomFS mods for the game were installed.

But that was only an appetiser; here’s the main dish.
byte[] {{< gh-hovercard "12208" "improved the performance" >}} of parsing and building RomFS mods, lowering the patch time of `The Legend of Zelda: Tears of the Kingdom` with mods applied from 2.8 seconds to 0.3 seconds on a high performance CPU (a Ryzen 9 5950X in this case). This was very noticeable in testing.

Modders out there, fill up that list ― you won’t waste time now waiting for games to load.

Exactly the same fix needed for `Super Mario RPG`, but in a different spot, allows `Star Ocean: The Second Story R` to boot and play.
What did the trick? Allowing a {{< gh-hovercard "11952" "stereo count" >}} of zero or higher and fixing a typo. 
Coding shenanigans.

And to close out this section, what better way to end than enumerating some of the battles byte[] won for improving shutdown stability!

Audio gets the first one. 
When enough {{< gh-hovercard "12019" "stream data" >}} is still waiting in the output queue, the audio renderer will wait until it has space to add more data. 
But during shutdown, more space might never be made available, which would block the audio renderer forever and hang. 
Fixing this blockade fixes shutdown operations on Android.

Next one is quite a bit more involved, as it involves the procedure needed to ~~kill~~ terminate a process, James Bond style.
This procedure consists of two steps for each thread in the terminated process:
- The thread is marked for termination and an interrupt is sent to all cores with that thread's affinity if it is runnable.
- The kernel then waits for the thread to actually terminate.

Runnable threads marked for termination are not removed from the scheduling priority queue. This means they can get scheduled during termination, even if the core already cleared the interrupt when a previous thread was terminated.
{{< gh-hovercard "12025" "Checking for termination" >}} just before running the thread again, as the Switch does, fixed a very common shutdown deadlock on Android.

And lastly, the timing event queue was causing issues. 
On shutdown, the system calls to clear pending events, even while the timing thread may still be removing items from the event queue.
{{< gh-hovercard "12028" "Locking access" >}} to the event queue solves the final shutdown crash of this month.

## Hardware section

### AMD, mixing drivers

[Last month](https://yuzu-emu.org/entry/yuzu-progress-report-oct-2023/#amd-giving-a-last-hurrah-to-polaris-and-vega), we reported that AMD is discontinuing driver support for Polaris and Vega products, and speculated how it would affect yuzu.

What we didn’t consider is what happens to mixed configurations, for example running a Vega iGPU and an RDNA2 dGPU.
This kind of configuration is quite common, as AMD is still selling new devices with integrated Vega GPUs, and laptop vendors can sell configurations with dedicated RDNA2 or RDNA3 products.

Unlike Intel, who just decided to say "good luck and goodbye" to their Gen 9/9.5/11 graphics userbase with no warning, AMD implemented a system where you can still run drivers for mixed configurations.
Since on an all-AMD laptop you can’t use different vendor drivers for the two GPUs, this was basically mandatory.

What AMD did is provide two different drivers, one for RDNA based hardware, and another for Vega and Polaris.
If you have a mixed device, you can install the driver for RDNA based hardware first, and then on top install the driver for Vega and Polaris.
This allows you to access all software features of the driver, and allows you to have both GPUs operating with no issue.

But there’s a price to pay: the Vulkan driver in the Vega and Polaris driver is *older* than the one in the RDNA2-based hardware driver, and all AMD GPUs running this mixed configuration will run a single Vulkan driver.
This results in a setback in features and fixes for the RDNA-based GPU just to keep compatibility.

If you experience issues in yuzu when running this configuration, you now know the reason. Sadly, the only solution is to run Linux, which has a single unified and up-to-date Vulkan driver: RADV.

### Intel, fixing drivers (WIP)

Intel confirmed that the geometry shader crash affecting multiple games has been fixed internally, and it’s just a matter of time until a driver comes out with the fix implemented.
The currently latest release at the time of writing, 101.5122 (first release driver for gen 2 Iris Xe products), doesn’t include the fix yet.

We hope when we mention this in the next progress report, the issue will be fixed.

## Future projects

We’re past the middle of December and we already know the next report will be juicy, just from changes already merged alone. Some things to look forward to include memory savings, improved load times, and higher performance. Blinkhawk is up to something and your writer should really stop spoiling it.
Maybe some Christmas gift? Only Emperor Nero knows.

That’s all folks! This [Folk Blues](https://www.youtube.com/watch?v=CjUVTEExfBg) is over, see you next month, space cowboy.

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
