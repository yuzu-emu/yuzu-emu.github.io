+++
date = "2022-02-11T12:00:00-03:00"
title = "Progress Report January 2022"
author = "GoldenX86"
coauthor = "Honghoa"
forum = 535150
+++

What a month we've had, yuz-ers. This time, we offer you a plethora of kernel changes, input fixes and new additions, yet more NVIDIA driver fixes, user interface changes, and more!

<!--more-->  

## PSA for NVIDIA users: Part 3

[It’s not over yet](https://www.youtube.com/watch?v=g02QU-xPV1I).

[As you know](https://yuzu-emu.org/entry/yuzu-progress-report-feb-2021/#paint-me-like-one-of-your-french-bits), regular NVIDIA desktop and laptop GPUs don't support decoding ASTC textures, so yuzu makes use of the compute capabilities of the GPU to parallelize the process. However, the recent release of the 511.XX drivers introduced an issue that affected our compute shader based accelerated ASTC texture decoding.

{{< single-title-imgs-compare
	"Crispy (Super Mario Odyssey)"
	"./astcbug.jpg"
	"./astcfix.jpg"
>}}

After some investigation, [epicboy](https://github.com/ameerj) found that the reason for the bug is an over-optimization introduced by the new drivers (an optimization for one scenario results in issues for another).
{{< gh-hovercard "7724" "A small change in behaviour solves the issue" >}}.
You can find more technical information in the pull request.

Users playing `Hyrule Warriors: Age of Calamity` or `Luigi’s Mansion 3` should stick to the 47X.XX series of drivers, as any version newer than that will have several rendering issues.
Don't fret, we’re investigating the cause!

{{< imgs
	"./aoc.png| Abstract art generator (Hyrule Warriors: Age of Calamity)"
  >}}

On the flip side, version 511.65 includes support for the recently released Vulkan 1.3, and improves performance considerably when using said API.
Some games show an increase in performance of up to 24%!

## A new Legend

Finally, after over two decades, the Pokémon franchise diverges from its tired formula and implements a big change to gameplay in the recently released `Pokémon Legends: Arceus`.

All this at the cost of graphical fidelity. But hey, there are worse looking games... [on the GameCube](https://www.youtube.com/watch?v=-vak7MUaa5E).

Apart from the disappointing graphics, this game's release exposed several issues with yuzu, and has even helped us fix long standing issues that affected many more games.

[bunnei](https://github.com/bunnei) fixed a deadlock found in the code used to {{< gh-hovercard "7787" "migrate threads among the cores" >}}, which caused some noteworthy softlocks present in `Pokémon Legends: Arceus`.

The problem can be summarised as follows: One thread (thread `A`) would be waiting for another one (thread `B`) to release a lock, and conversely, thread `B` would be waiting for thread `A` to release another lock, resulting in a deadlock.

{{< imgs
	"./ending.jpg| Best gameplay change in decades (Pokémon Legends: Arceus)"
  >}}

Moving on from kernel issues, epicboy implemented various GPU changes.

He found that {{< gh-hovercard "7788" "reducing the amount of buffer allocations" >}} at the start, rather than only at the end, prevented the game from crashing in certain locations.

Some Vulkan drivers, especially Intel Windows ones, can’t process 64-bit atomic operations (operations that can run independently of any other processes).
epicboy {{< gh-hovercard "7800" "adds support in yuzu for unsigned 2x32-bit atomic operations" >}}, as that’s the fallback option such drivers use.
With this change, the game boots with Intel GPUs running Vulkan.

AMD had a longstanding issue with `Transform Feedback` in both their official Windows and Linux drivers, causing rendering issues in countless games.
While this was recently solved in the Linux AMDVLK drivers, AMD Windows drivers still need to be told which `Execution Mode` will be in use next.

{{< gh-hovercard "7799" "Explicitly stating to use Xfb" >}} `Execution Mode` before starting to use Transform Feedback solves all issues related to it on AMD Windows Vulkan drivers, not only benefiting `Pokémon Legends: Arceus`, but also games like `Xenoblade Chronicles 2`, `Xenoblade Chronicles Definitive Edition`, `Hellblade: Senua's Sacrifice`, `Donkey Kong Country: Tropical Freeze`, `POKKÉN TOURNAMENT DX`, and many many others.

{{< single-title-imgs-compare
	"Pokémon Legends: Arceus"
	"./tfbug1.png"
	"./tffix1.png"
>}}

&nbsp;

{{< single-title-imgs-compare
	"Xenoblade Chronicles Definitive Edition"
	"./tfbug2.png"
	"./tffix2.png"
>}}

&nbsp;

{{< single-title-imgs-compare
	"Donkey Kong Country: Tropical Freeze"
	"./tfbug3.png"
	"./tffix3.png"
>}}

`Pokémon Legends: Arceus` is affected by vertex explosions, exhibiting what looks like textures stretching at random.
The bad news is that this is a problem with the `Buffer Cache`, and fixing it will take considerable time.

The good news is that [Blinkhawk](https://github.com/FernandoS27), with some help from epicboy, managed to implement a temporary workaround to avoid this problem while a permanent solution starts taking shape.
{{< gh-hovercard "7805" "Flushing the buffer before writing" >}} saves us from polygon hell, at a minimal performance cost.

{{< single-title-imgs-compare
	"Imagine how it looks from space (Pokémon Legends: Arceus)"
	"./vebug.png"
	"./vefix.png"
>}}

Mark this the day we start to plan yet another Buffer Cache Rewrite.

As a start, Arceus showed a considerably higher VRAM use than normal, causing 2GB GPU users to crash during cutscenes.
Blinkhawk’s solution is to {{< gh-hovercard "7812" "expand the specific direction the buffer cache is increasing" >}}, instead of the previous method of doubling the size.
This allows 2GB users to play regularly, and 4GB users to be able to scale to 2x without fear of crashes.

Now for some general recommendations:

Having a save from previous Switch Pokémon games will unlock special clothing options after the tutorial.

We measured a slim performance improvement on the (currently) latest 22.2.1 AMD Windows drivers and, as mentioned, a 24% boost with the 511.65 NVIDIA Windows driver.
Chad Vulkan 1.3 lending a hand.

Regarding GPU accuracy, while `Normal` produces the highest performance, `High` allows for proper particle rendering, so if you want the extra accuracy and have the performance to spare, stick to `High`.

Effects, particles, and certain attacks seem to render incorrectly at resolutions over native 1x. While we’re investigating the reason for this, it seems to also happen on the Switch itself, so it could just be the nature of these shaders (feels reminiscent of the ghosting in the [3DS Pokémon games](https://www.reddit.com/r/Citra/comments/ft28sw/is_there_any_way_to_fix_ghosting_on_pokemon_ultra/).

{{< imgs
	"./particles.png| Thanks Serfrost! (Pokémon Legends: Arceus)"
  >}}

yuzu’s default setting is to run games in OpenGL using GLASM, commonly known as assembly shaders.
These settings will cause weird shadow acne on characters, and the solution is to either use GLSL instead of GLASM, or what we recommend, switch to Vulkan altogether.

{{< single-title-imgs-compare
	"Broken shadows? Zero! (Pokémon Legends: Arceus)"
	"./glasmbug.jpg"
	"./glasmfix.jpg"
>}}

Users of Radeon GPUs older than the 400 series running Windows will experience crashes due to outdated and out of support drivers.
Not even modified drivers seem to help, so the only solution is to use Linux with its still supported, and quite faster, Mesa drivers.

Finally, excessive mod use or high values of `Anisotropic Filtering` can cause vertex explosions with some GPU configurations. We’re still investigating the cause for this.

## Other graphical fixes

Blinkhawk made some {{< gh-hovercard "7720" "changes to the Garbage Collector" >}} (`GC`), which encompasses a number of bug fixes, improving the algorithm to make it clean memory in a smarter fashion, and also making it more efficient for iGPUs.

The value of the `minimal`, `expected`, and `critical` thresholds were rebalanced, so that it does not act as aggressively on GPUs with more memory, while it still performs the job within an acceptable margin for low-memory graphics cards.
Additionally, yuzu now queries the size of the GPU memory instead of estimating it, allowing the `GC` to make better decisions when cleaning it.
These changes seek to benefit both low-end and high-end GPUs the most, without affecting either negatively.

Special consideration was put on ASTC textures, which are notoriously heavy on the memory.
The `GC` would clean them too early, causing graphical corruptions on titles that make use of these resources.
For this reason, the conditions to determine when to clean ASTC textures were made less strict, which should mitigate the problem in most scenarios.

Although these changes were originally part of the `YFC` project, Blinkhawk decided to implement these changes now, in order to alleviate the problems related to the previous `GC` implementation.
There is still a lot to come from this project, so please stay tuned for more information in future updates.

Keep in mind, special case titles like `ASTRAL CHAIN` will still require 3GB of VRAM or more to properly emulate.

On another hand, some titles, such as the `Super Mario 64` port (homebrew), would experience freezes in some GPU models (especially iGPUs).

Blinkhawk investigated the problem, and noticed it lay within our Vulkan Scheduler, a class that abstracts the command buffer so it can perform OpenGL-like operations in a Vulkan environment.

As the scheduler manages the order in which it must queue GPU commands before sending them to the device, it is vital that the fencing logic used to determine this is timed correctly.

Previously, the scheduler would only queue command chunks whose type offsets were different from zero.
The problem arose because there exists a specific valid type of command whose offset is actually zero.
Not taking into consideration this case hindered the fencing logic of the scheduler, preventing it from performing its work properly.

Thankfully, the solution did not require any difficult change, and Blinkhawk was able to mitigate these freezes by {{< gh-hovercard "7814" "submitting a simple patch" >}} that addresses this specific problem.

{{< imgs
	"./mario.png| It's-a him! (Super Mario 64 homebrew)"
  >}}

## Kernel changes

The code for Memory Management — one of the functions of the kernel — was originally written back in early 2020, based on the information available at the time.
Since then, there have been numerous updates to the Nintendo Switch's operating system, as well as new documentation obtained through reverse engineering.

For this reason, [bunnei](https://github.com/bunnei) has been going through each and every part of the code used to manage the memory, focusing on improving both the stability and the accuracy of the kernel.

These changes involved brushing up the memory {{< gh-hovercard "7684" "attribute definitions" >}} and {{< gh-hovercard "7698" "permissions" >}}, so they match the behaviour of the latest `HorizonOS` more closely.
Most of the code used to map and unmap memory was {{< gh-hovercard "7762" "tidied up" >}}, and various functions were renamed to match the official naming.
Similarly, the code used to allocate and clear the heap memory was {{< gh-hovercard "7701" "reviewed" >}} in this way.

This new implementation should perform better, and also make the code easier to read and navigate.

While investigating the long-standing crashes pertaining to `Pokémon Sword/Shield`, bunnei found they were related to race conditions.

The first would happen when opening a new session to a service: that is, yuzu would create a `host thread` (a non-emulated thread), where service session requests can be dispatched to asynchronously.
When this session was closed, the `host thread` for the closing session was being removed from the tracking list at the same time as a new one was added, which caused the race condition.

Services are requested by games when they want to send certain audio to play to the speakers, request certain graphics to be loaded into memory, etc.
`Pokémon Sword/Shield`, in particular, opens and closes LDN service sessions very frequently, which is why it is one of the most affected titles.

By {{< gh-hovercard "7711" "introducing a worker thread to manage the service list" >}}, now only one thread will be able to create or destroy service sessions, preventing the crash from happening.

Following this lead, bunnei revisited the code used to exit threads, and found that another race condition occurred, where thread references were being destroyed while they were still selectable for scheduling, resulting in a crash.

The solution was to {{< gh-hovercard "7712" "reimplement the thread termination code more accurately" >}}, so that it matches that of the HorizonOS.
yuzu now waits for the thread to be unscheduled from all cores before closing it, so that it is destroyed only when it is no longer running.

Another long-standing problem with `Pokémon Sword/Shield` was related to the code used for the High-Level Emulation (`HLE`) Service Thread Management.

When a game requests certain services, instead of emulating the internal logic of the Nintendo Switch's OS (which would be Low-Level Emulation, `LLE`), yuzu runs an implementation written by the developers that performs the same job on the user's computer.

These `HLE` services need to be able to interact with the emulated kernel, in order to grab locks and triggers for rescheduling, etc.
yuzu achieves this by making use of `dummy threads`, which are created as an emulated `KThread` entity.

A `dummy thread` is created for every `host thread` of a service interface running in the user's computer, so that whenever the kernel needs to interact with a `host thread`, it can do so through these `dummy threads`.

Previously, these `dummy threads` were not being released when their main thread was destroyed, and hence, they would accumulate over time.
Since the kernel imposes a limit on the amount of threads a process can make, yuzu was eventually unable to create more threads to open service interfaces in long gaming sessions.
Furthermore, these dummy threads could inadvertently be scheduled on the emulated cores, which resulted in a crash, as they are not real threads meant to be run.

After investigating these problems, bunnei {{< gh-hovercard "7737" "implemented various fixes and checks" >}} to correct this faulty behaviour, and prevent resource leaks and crashes.

Next, bunnei {{< gh-hovercard "7765" "fixed the KThread counter increment/decrement" >}} operations, as the old implementation was incorrect, and could occasionally underflow.
This is the aforementioned counter used to keep track of all the `KThread`s in a process, ensuring the limits imposed by the kernel are not breached.

[epicboy](https://github.com/ameerj) also took a look at the kernel, and added a new shut-down method to {{< gh-hovercard "7670" "properly synchronise threads" >}} before their destruction.
This change fixes a hang that could occur when stopping emulation in yuzu.

## UI improvements

In a series of minor changes, a number of contributors decided to improve and correct some elements displayed on our interface, and the way the user can interact with them.

[german77](https://github.com/german77) noticed that some items, such as the `Stop` and `Start` buttons, were not being disabled from interaction once the emulation process stopped, and {{< gh-hovercard "7662" "promptly fixed this erroneous behaviour" >}}.

He also went ahead and implemented the graphical elements needed to {{< gh-hovercard "7735" "report the battery levels" >}} of UDP controllers.
While this code has been in yuzu's source for some time already, preparing the appropriate front-end graphics and the subsequent implementation into the UI had been pending tasks for a long time.

{{< imgs
	"./battery.png| Pretty useful for Joy-Cons!"
  >}}

While {{< gh-hovercard "7768" "updating the AMD FidelityFX Super Resolution" >}} (`FSR`) dependency to the latest version, [Moonlacer](https://github.com/Moonlacer) changed the text string to replace the brackets around the `Vulkan Only` message with parenthesis, for consistency with all the other text in our interface.

In a similar vein, [gidoly](https://github.com/gidoly) corrected a series of spelling mistakes in the strings describing the name of commercial gamepads, namely the {{< gh-hovercard "7713" "PlayStation" >}} and {{< gh-hovercard "7715" "Xbox" >}} controllers.

Based on a Patreon poll conducted in our [discord server](https://discord.gg/u77vRWY), gidoly also made the necessary changes to make the `Dark Colorful` theme the {{< gh-hovercard "7719" "default theme" >}} used when running yuzu for the first time on Windows.

[v1993](https://github.com/v1993) also made changes, so that now using the Colourful theme {{< gh-hovercard "7755" "allows Qt to use the system-wide colours in *NIX systems" >}}, instead of forcing dark ones.

{{< imgs
	"./theme.png| Default by popular demand"
  >}}

Naturally, users can still change the theme through the configuration settings, if so desired.

## Input changes

german77 has been *especially* busy this month, so there’s quite a bit to cover in this section.

Users reported that the game `パワプロクンポケットR`, and other games of the Power Pocket saga, crashed when in-game.
This is caused by the `SetNpadAnalogStickUseCenterClamp` service being able to initialize the `applet_resource` subsystem even if it wasn’t initialized before.
{{< gh-hovercard "7726" "Emulating this behaviour solves the issue and makes some game modes playable" >}}. 
However, some game modes still show that yuzu lacks support for some vertex formats, causing crashes.

{{< imgs
	"./power.png| パワプロクンポケットR"
  >}}

yuzu will now {{< gh-hovercard "7663" "only display the currently supported controller types in the applet" >}}, depending on what each game reports as compatible.

`Fullkey` is the codename used by Nintendo to refer to a generic type of controller that reports itself as a Pro Controller if you connect an “unsupported” gamepad. This can refer to the GameCube, NES, SNES, N64 and Sega Genesis controllers.
In case of problems, the console falls back to reporting a Pro Controller for those types of controllers. german77 {{< gh-hovercard "7664" "added this functionality to yuzu as well" >}}.

Support was added to {{< gh-hovercard "7680" "allow devices with only an accelerometer present to act as motion devices" >}}.
While this means broader support, lacking a gyroscope means very poor results in motion, as some axis movements won’t be registered.

With the help of v1993, german77 {{< gh-hovercard "7682" "fixed the mapping of UDP controllers" >}} (any device connected using the cemuhook protocol).
Motion now correctly automaps and manual mapping won’t reset the device in the input list.

In a separate PR, by request of v1993, german77 {{< gh-hovercard "7807" "added support for the Home and Touch buttons on UDP connections" >}}.

Some motion devices can input very precise values, if the threshold is too high, the motion values will be ignored.
{{< gh-hovercard "7700" "Reducing the threshold for gyro data" >}} fixes this issue.

While playing `Mario Tennis Aces` in swing mode, motion could suddenly stop working.
This was because the update rate interval for motion data was set too high.
{{< gh-hovercard "7707" "Decreasing the motion update rate to 10ms restores functionality" >}}.

Also related to motion emulation, the quality and sensitivity of the device can also affect gameplay. As a way to compensate, german77 introduced {{< gh-hovercard "7770" "an option to configure the gyro threshold" >}}, you can find it if you have a motion capable controller (in the example, dual Joy-Cons). Configured in `Emulation > Configure… > Controls > right click Motion > Set gyro threshold`.

{{< imgs
	"./gyro.png| Right clicking!"
  >}}

Accessing 2-player mode in `Pokémon: Let’s Go Eevee & Pikachu` requires performing a shake motion.
The emulated shake on the keyboard was too weak to be registered by the game, so {{< gh-hovercard "7710" "increasing its “force”" >}} shakes things up to allow local multiplayer.

One of the features missing with the release of `Project Kraken`, the input rewrite, was mouse motion support.
{{< gh-hovercard "7725" "German77 reintroduced support for it" >}}, now using the mouse wheel as input for the Z-axis.
Also, mouse buttons get their proper names when being mapped.

Another feature that somehow missed the memo {{< gh-hovercard "7760" "was stick modifiers for keyboard input" >}}, holding a mapped key to move an analog stick with a reduced limit.
For example, with default keyboard mappings, if you hold shift, the left analog stick will move only up to 50% of its range, allowing keyboard users to walk.

We recently introduced controller UI navigation.
While comfortable, some users run external programs to translate controller input into keyboard and mouse input.
For them, {{< gh-hovercard "7769" "a toggle to disable controller navigation was added" >}} in `Emulation > Configure… > Controls > Advanced > Controller Navigation`.

{{< imgs
	"./nav.png| Couch gamers will love this"
  >}}

By default, yuzu assumes that non-Nintendo Switch controllers, for example the Xbox controllers, will use rumble motors. These are cheaper and use an exponential amplitude curve for their rumble, making this kind of method incompatible for emulating HD Rumble.
The DS5 on the PlayStation 5, instead, uses more expensive linear actuators (and needs a linear amplitude curve), like the Pro Controller and Joy-Cons.
{{< gh-hovercard "7784" "With this change" >}}, german77 extended support to include the official PlayStation 5 controller, the DS5, which is capable of the required precision for HD Rumble.

## General changes and bugfixes

TAS scripts can sometimes have errors in them, resulting in yuzu encountering a crash.
german77 provides the necessary code to {{< gh-hovercard "7687" "add error handling to TAS scripts" >}}, preventing these crashes.

Windows has a nasty, hidden limitation that is the maximum open-file limit a program can use.
Some game mods can contain many, *many* files, going over the previous 4096 limit. Therefore, [Morph](https://github.com/Morph1984) {{< gh-hovercard "7690" "doubled the limit to 8192" >}}.

v1993 has been working on code cleaning using [PVS-Studio](https://pvs-studio.com/en/pvs-studio/), and the results have been great.
So far, errors were found and fixed in {{< gh-hovercard "7727" "four" >}} {{< gh-hovercard "7728" "separate" >}} {{< gh-hovercard "7729" "input" >}} {{< gh-hovercard "7730" "related areas" >}}, {{< gh-hovercard "7731" "the shader recompiler" >}}, and even {{< gh-hovercard "7732" "kernel emulation" >}}!

Thanks v1993! Nothing beats cleaner code, especially if it solves out-of-bounds issues.

Morph {{< gh-hovercard "7752" "stubbed the `SetCpuOverclockEnabled` service" >}} (you don’t need to overclock the host CPU on the fly when emulating).
This allows `Gravity Rider Zero` to boot, but nothing is yet displayed on screen due to missing texture format support.

And finally, german77 {{< gh-hovercard "7821" "implemented the 32-bit variant of the supervisor call (SVC) `SynchronizePreemptionState`" >}}, making `Espgaluda II` playable.

{{< imgs
	"./esp.jpg| Espgaluda II"
  >}}

Meanwhile, [liushuyu](https://github.com/liushuyu) updated the dynarmic external submodule, providing {{< gh-hovercard "7679" "optimizations and also fixing compile errors" >}} caused by an update of another external, the `fmt` library — used to format text in yuzu's log and interface.

german77 also added new {{< gh-hovercard "7716" "hotkeys that allow users to manipulate the volume" >}} of the application directly with the gamepad, a feature that will surely come in handy to the people who enjoy yuzu from the comfort of their couch.

By default, `Home + D-Pad Right` will mute the application, while `Home + D-Pad Down` will lower the volume, and  `Home + D-Pad Up` will increase it.
Users are free to change these mappings through the configuration menu `Emulation > Configure > Hotkeys`.

{{< imgs
	"./hotkeys.png| The more the merrier!"
  >}}

While working on this change, german77 noticed the equation used to transform from percentage values to "loudness" (i.e. output power) was too aggressive below the 70% mark, making the volume extremely soft in this range.
Thus, he decided to modify the formula, so that the transformation is smoother throughout the full range of percentage values.

{{< imgs
	"./volume.png| Old is in red and new is in green. Look at those curves!"
  >}}

## Future changes

Progress continues smoothly on our projects in development. 
For example, german77 is having fun with some heavily requested features.
Blinkhawk managed to complete one of the top secret projects [Rodrigo](https://github.com/reinuseslisp) left unfinished before *turning green*, `Host Conditional Rendering`. Expect to hear more of it in future `Project Y.F.C.` news.

Now for a small leak of some recent internal testing: `Marvel Ultimate Alliance 3: The Black Order` jumped from 19 to 51 FPS, and your enemy's ink in `Splatoon 2` works correctly, both changes improving Vulkan.

{{< single-title-imgs-compare
	"More than double the performance, for only a few liters of developer tears (Marvel Ultimate Alliance 3: The Black Order)"
	"./1.png"
	"./2.png"
>}}

That’s all folks! It’s always a pleasure to have you here, hope we see you again next month!

&nbsp;
{{< article-end >}}
{{< gh-hovercard-include-end >}}
{{< imgs-compare-include-end >}}
