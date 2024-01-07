+++
date = "2024-01-06T12:00:00-03:00"
title = "Progress Report December 2023"
author = "GoldenX86"
forum = 0
+++

Happy new year yuz-ers! We say goodbye to 2023 with several good changes, ranging from driver fixes to big memory savings, and quite a bit in between! Let’s go.

<!--more--> 

## Graphics changes and driver fixes

No huge project in this area this time, but developers still solved big problems affecting both APIs.
Let’s start with the most common and important of the two APIs, which is:

### Vulkan

Drivers are fantastical creatures. 
They love to have major behavioural changes while still following the Vulkan specification–or more correctly for this issue, the SPIR-V specification.

Such was the case with NVIDIA drivers.
Since the release of the 540 branch back in September, users have reported sudden crashes when building specific shaders in games, the most common example being some cutscenes and scenarios in `Bayonetta 3`. However, the problem extended to many other games in unexpected places.

After investigating the issue, your writer and [byte[]](https://github.com/liamwhite) came to the conclusion that the problem was not the drivers, but a miscompilation in yuzu's shader compiler for [texture gradient](https://registry.khronos.org/OpenGL-Refpages/gl4/html/textureGrad.xhtml) operations.

Pesky shaders, why don’t we just make them disappear? Well, if you like your games displaying anything besides a [black out](https://www.youtube.com/watch?v=6Peinf-xQWg), you want them, all of them.

In some cases, yuzu would incorrectly (and unintentionally) fetch the gradient derivatives as integers (U32), when they were intended to be reinterpreted bitwise as floats (F32).
While older drivers would implicitly reinterpret when using the wrong type, the 540 driver series will throw a proper shader validation error, which is the correct behaviour for a bug like this.

This meant that if a user with any NVIDIA GPU loaded a pipeline cache with the affected shader after updating to a 540 series driver, or reached a moment where a new affected shader would be built, the game would crash. 
At the same time, if the user reverted the driver to the older 536/537 series drivers, the same cache would work fine.

Culprit found (it was us the whole time), sentence dictated: texture gradient operations will now {{< gh-hovercard "12435" "enforce F32 types on derivatives" >}} to comply with the SPIR-V specification.
Now games don’t have to crash, users can keep their drivers up to date, and your writer sleeps peacefully at night knowing this is resolved.
Anyone using an NVIDIA GPU, regardless of operating system, feel free to update to the latest release for your platform.

{{< imgs
	"./bayo3.png|Magical Infernal Ladies Fighting (Bayonetta 3)"
  >}}

Android users have a knack for finding bugs, partially thanks to the different set of default settings we use for the small screen.
Handheld mode for example is picked by default to improve performance (Mali users thank this substantially) and save a tiny bit of RAM, but hey, we’re not in the Android section yet!

`Fight'N Rage`, a fantastic beat’em up, had its screen cut in half in handheld mode, something most desktop users missed, since it runs fine in docked mode.
The issue was–and this is a classic for sprite games by now–in how swizzle and window origin adjustment were being handled.
Viewport transform and window origin mode are handled separately in the GPU, so {{< gh-hovercard "12235" "splitting the two jobs" >}} is what doctor byte[] ordered. Feel free to smash that attack button now.

{{< single-title-imgs-compare
	"Quite a big difference (Fight'N Rage)"
	"./fnrbug.png"
	"./fnrfix.png"
>}}

Guess who’s back. A game that is special in many aspects, an emulator itself, one of the few native Vulkan titles on the Switch, a game that is even out of print in an era of digital releases, and the reason byte[] started contributing to yuzu.

That’s right, `Super Mario 3D All-Stars` is back in a report, this time addressing one of its remaining interesting quirks: the incredibly slow performance of its intro video on non-NVIDIA and non-Mesa drivers.

The quirkiness lied in that the game was causing yuzu to continuously recreate its swapchain on every single frame.
A swapchain is a set of framebuffer images used by the graphics API and the GPU to draw to the screen.

The game used one of its framebuffer images as sRGB during startup, which caused yuzu to detect it as sRGB. The other framebuffer image was only used as linear. Since yuzu tries to respect the colorspace of the output image, this problem was causing yuzu to incorrectly think it needed to recreate the swapchain on every single frame.
This constant, per-frame swapchain recreation is not that expensive on NVIDIA and Mesa drivers, but anything else (Intel, AMD, Android drivers) can spend as much as 30ms processing this switching.
That’s around 30 FPS lost in a game supposed to render at 60!

How do we avoid this? Well, Vulkan always interprets any framebuffer currently being presented to screen as sRGB, so replacing the frame with a non-sRGB one is just adding unnecessary additional work and pissing off several drivers.
Changing the logic to {{< gh-hovercard "12274" "ignore sRGB in framebuffer images" >}} provides smooth frametimes to *unholy driver users*.

{{< imgs
	"./sm3d.png|What does Mario do with all those many stars? Not sing Peaches I hope (Super Mario 3D All-Stars)"
  >}}

On a related note, let’s talk about presentation limits and how they affect asynchronous presentation, which moves presenting to screen to a different CPU thread.

Due to several factors, yuzu’s Vulkan renderer could only process up to 6 frames at a time.
While this isn’t normally an issue on desktop, especially for users that don’t enable Asynchronous Presentation (available in `Emulation > Configure… > Graphics > Advanced`), Android, a platform that demands always using asynchronous presentation, showed us that low enough performance with the setting toggled on, regardless of OS or platform, can cause the queue of swapchain images to grow beyond the limit of 6 frames, which leads to a driver crash, and your progress being lost. Ouch.

{{< imgs
	"./async.png|Feel free to test enabling it now"
  >}}

Android users found a workaround to this very early on: lowering the game speed limit under 100%, which slowed down the presentation rate, thereby usually keeping yuzu under the 6 frame limit.

While that technically worked, the idea is to run games at least at 100% speed whenever possible, right?

The easy solution byte[] found for this problem after identifying it was to {{< gh-hovercard "12345" "force the presentation process to wait" >}} before reaching the limit, improving stability substantially on low-end hardware, including Android devices, while also improving input lag!
Now asynchronous presentation is safe to use, improves frametimes, reduces input latency, and does your laundry! That’s a solid win for everyone.

Enough about presentation, let’s talk about clip distance instead now.
I can hear you asking in the back, "what the living Koopa Castle is a clip distance?".

Most GPUs allow shaders to set up custom clipping planes for vertex data, which allows the GPU to cut geometry invisible to the viewport with no extra triangles generated or rendering cost.
The members of gl_ClipDistance, a global variable and float array declared in the shader, represent the distance to the clipping plane on each vertex.

Many games use these values, including `Red Dead Redemption`, `Fire Emblem Warriors: Three Hopes`, `DEAD OR ALIVE Xtreme 3 Scarlet`, `Hyrule Warriors: Definitive Edition` and `Portal`.
Weird group, isn’t it? A cowboy, a skimpy Japanese fighter, two mediaeval warriors and a Companion Cube enter a bar…

On most desktop drivers, the default values for all global variables will be zero implicitly.
However, SPIR-V says that these values are actually undefined.
This assumption broke rendering in `Portal` on the radv Mesa driver―for clip distances specifically.

byte[]'s {{< gh-hovercard "12403" "first fix" >}} attempted to only declare an array of clip distances as large as actually needed, which would prevent any undefined values from persisting in the array.
While some shaders (like those used in `Portal`) write directly to the clip distance array values, others (like in `Red Dead Redemption`) use a loop variable to access the array.
Thus, the first fix attempt resulted in declaring an array of zero clip distances in those games, which is illegal in SPIR-V.

{{< imgs
	"./doabug.png|Emulation, when The Void does indeed stare back (DEAD OR ALIVE Xtreme 3 Scarlet)"
  >}}

After revisiting the issue, byte[] {{< gh-hovercard "12487" "implemented a more robust solution:" >}} when clip distances are used, always declare an array of as many clip distances as the host driver supports, and use a default value to ensure the array members are all set to zero, avoiding any undefined behaviour. 
All drivers except Mali support eight clip distances; Mali supports *zero*, so a special case had to be made for this driver. 
Mali moment #1.

{{< single-title-imgs
    "This was a triumph"
    "./doafix.png"
    "./rdr.png"
    "./hwde.png"
    "./few.png"
    "./portal.png"
    >}}


GPUs often work with texture data in a variety of formats.
Among the parameters used by compressed textures like ASTC and BCn is `pitch`, which is the size of one row of compressed blocks.
This eventually gets divided by the block size of the texture by the emulator, giving the number of blocks per row.
This worked flawlessly for linear 1x1 block-sized uncompressed textures, but broke compressed ones that have larger block sizes.
Vulkan expects the pitch to be the number of texels (the minimum unit of a texture map, think of pixels but for textures) per row, plus some padding, but yuzu was calculating the value incorrectly.

{{< single-title-imgs-compare
	"A new tournament begins (THE KING OF FIGHTERS XIII GLOBAL MATCH)"
	"./kofbug.png"
	"./koffix.png"
>}}

{{< gh-hovercard "12479" "Fixing the buffer row length," >}} and, while at it, tuning the software BCn decoder Mali needs (Mali moment #2), is how [GPUCode](https://github.com/GPUCode) fixed the rendering of `THE KING OF FIGHTERS XIII GLOBAL MATCH` and the Eatsa Pizza minigame from `Mario Party Superstars`.

{{< imgs
	"./pizza.png|Your writer is old enough to remember playing this on the Nintendo 64 (Mario Party Superstars)"
  >}}

That ends the Vulkan section section, so what’s left is to follow up with the:

{{< imgs
	"./opengl.png|And you can’t prove Khronos wrong"
  >}}

### OpenGL

Because [epicboy](https://github.com/ameerj) won’t let the old API rest.

One remaining issue (of many) for the OG open API was a bug with the shadows of `Metroid Prime Remastered`.
By bringing the {{< gh-hovercard "12412" "counter query accuracy," >}} which was first seen in Vulkan, to OpenGL, this issue is now solved.

{{< imgs
	"./metroid.png|SPAAAAACE (Metroid Prime Remastered)"
  >}}

Another win for OpenGL users are two fixes for `Xenoblade Chronicles 3`.
This is particularly important for AMD users, Windows or Linux, since most AMD GPUs can’t avoid vertex explosions while running the game with Vulkan in the Pentelas region of the main story, and the DLC, Future Redeemed.

First, by {{< gh-hovercard "12415" "implementing" >}} the `DrawTransformFeedback` macro, which is the OpenGL equivalent of Vulkan’s `DrawIndirectByteCount`, particles were fixed.

{{< imgs
	"./xc3.mp4|Remember the Game Awards flute guy? (Xenoblade Chronicles 3)"
  >}}

And second, a lesson of how a simple typo can cause havoc, {{< gh-hovercard "12377" "fixing the transform feedback binding" >}} from `strides` to `sizes` stopped the grass in the game from becoming some space demon abomination.

{{< single-title-imgs-compare
	"That experiment really went wrong, Dr. (Xenoblade Chronicles 3)"
	"./xc3bug.png"
	"./xc3fix.png"
>}}

With these changes, AMD users suffering from the Pentelas/DLC vertex explosion bug can safely play the game in OpenGL.

But you know what would help even more? If epicboy also added more optimizations for the AMD proprietary OpenGL driver. {{< gh-hovercard "12437" "Which is exactly what he did." >}}

With the release of the new OpenGL driver back in [July of 2022](https://yuzu-emu.org/entry/yuzu-progress-report-jul-2022/#amd-opengl-25-years-in-the-making), several unsavoury workarounds that yuzu code had for the red vendor could be removed (and now have been), improving performance.

## Android adventures, and kernels with benefits

Instead of a bulleted list like in previous articles, let’s start with the big change first.

### Saving RAM makes games boot fast

One of the properties of the Linux kernel, which GNU/Linux distributions and Android benefit from, is its flexibility and constant progress made by the community and contributors.
One such case is the Linux kernel extension [MADV_REMOVE](https://man7.org/linux/man-pages/man2/madvise.2.html), which allows for freeing up a given range of memory pages, "punching a hole" in the specified range of memory.

Thanks to byte[]’s work, the emulator can {{< gh-hovercard "12358" "take advantage" >}} of this extension to remove the requirement of needing 3GB of free RAM immediately after booting a game, and to also significantly decrease boot times while at it.
Memory isn’t a problem for most users with 16GB of system RAM (unless you do too much stuff in the background), but for 8GB or lower users running an OS with a Linux kernel (desktop Linux or Android), this greatly reduces immediate memory requirements, even allowing `Celeste` to work on 4GB devices…

…For a time. While the system doesn’t need to provide the full 3GB at game boot now, the game will still slowly demand that amount as it runs.
But this might be enough to let 8GB devices, or even 6GB ones (which we don’t officially support, but users use them anyway) reach the next save point.

Feel free to play the most complex games now on your 8GB Linux laptop or phone and enjoy the improved boot times!
We believe only `The Legend of Zelda: Tears of the Kingdom` still requires 12GB on ASTC compatible devices (Android devices or Intel iGPUs) to be safely playable now.

For the Windows gang, sorry: only bad news.
The Windows kernel doesn’t have an equivalent to MADV_REMOVE, so if you have a low end device with a small RAM amount, Linux is the way to go.

No surprise there though.

### 4K

The resolution? No, worse, crazier than pixel density.
Remember `Paper Mario: The Origami King`? Good game, pretty graphics and fun humour.
This game has a unique situation in its hands, its ARM CPU code is illegal.
Not "FBI OPEN UP" illegal, but "not able to run natively on contemporary systems due to a difference in stack pointer alignment handling" type of illegal.
The Switch clears a hardware bit that checks the stack pointer alignment and generates an exception, but practically every other operating system sets it, and there is no way to turn it off without a kernel modification.

This meant modern devices couldn’t run this game with NCE enabled.
Until now.

By using the {{< gh-hovercard "12237" "ARM parser" >}} of [Dynarmic](https://github.com/merryhime/dynarmic), byte[] parses the instructions responsible for causing the crash due to the alignment error this game produces, and interprets them in software.
The result? Three thousand eight hundred and fifty eight lines of code added to get a game that doesn’t render correctly on Android booting, and even needs a save file to get past the intro…

{{< imgs
	"./tokbug.png|Luigi sure is brave to drive in the Dark Woods (Paper Mario: The Origami King)"
  >}}

So, wasted effort? With byte[]? Never.
The game wouldn’t render correctly because the emulator was binding float images with a mismatched sampler type.
By {{< gh-hovercard "12432" "forcing the use of floats" >}} for all pixel formats in the shader cache which aren’t explicitly declared as integer, mobile drivers are now able to properly render the Mario brothers in all their flat glory.

{{< imgs
	"./tokfix.png|Now that’s more like it, it only costs us a shader invalidation (Paper Mario: The Origami King)"
  >}}

Slight deja-vu with the fix for NVIDIA 540 driver series previously mentioned, right? 
This work was an additional one hundred and eighty four lines of code, giving a total of four thousand and thirty eight lines of code, 4K, spent on Origami paper, just for Android.

### Other Android specific GPU changes

Another peculiar problem the Android builds faced were the slow video decoding performance in games like `SUPER MARIO ODYSSEY`, famous for its video pop-up tutorials.
The culprit was unnecessarily downloading some texture memory which was about to be overwritten anyway. Some {{< gh-hovercard "12543" "tweaks to the DMA code" >}} by [Blinkhawk](https://github.com/FernandoS27), and the performance is now fixed!

{{< imgs
	"./smo.png|No more hints here, scra-CAW! ♪ No more hints (SUPER MARIO ODYSSEY)"
  >}}

One early regression yuzu had when the Android builds were first introduced affected the FXAA antialiasing filter.
As it turns out, the fix for the colour banding FXAA experienced on desktop hardware (which byte[] implemented back in June) missed updating the renderpass to the {{< gh-hovercard "12256" "proper format." >}}
By properly using the `VK_FORMAT_R16G16B16A16_SFLOAT` format for the renderpass, GPUCode resolved the issue.

{{< single-title-imgs-compare
	"From Cursed Triforce to proper Triangle of Death"
	"./fxaabug.jpg"
	"./fxaafix.jpg"
>}}

The Switch offers a JIT service (not to be confused with yuzu’s JIT, Dynarmic) that allows games to write to code memory during runtime–which wouldn't normally be possible due to the restrictions of the platform. 
This is currently only used for the official Nintendo 64 emulators in `Super Mario 3D All-Stars` and the `Nintendo Switch Online` collection.

Properly using {{< gh-hovercard "12513" "code memory handles" >}} allows the JIT service to work with yuzu’s NCE backend, letting the user run games from the `Nintendo 64 - Nintendo Switch Online` library.
Thank you byte[] for yet again making an emulator work inside an emulator.

{{< imgs
	"./n64.png|Look, savestates! (SUPER MARIO 64)"
  >}}

As a continuation to November’s progress on improving Mali stability due to their lack of support for `nullDescriptor`, byte[] now added the workaround to {{< gh-hovercard "12410" "not pass null views." >}} 

Mali moment #3.

nullDescriptor was added with the Vulkan extension [VK_EXT_robustness2](https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VK_EXT_robustness2.html), back in 2020, for version 1.1 of the API. Vulkan is currently at version 1.3. 
Given that the feature has native hardware support on all Direct3D-compatible GPUs, and is trivial to emulate in the driver, we are not sure why this has not been implemented yet...

Turnip drivers are a work in progress from Mesa developers–while they typically perform and render very well, they are still in development.
One case that demonstrated this was how a change to improve driver compatibility in Mali caused Turnip to regress in response. 
Mali moment # 4? No. This was last month.

This only specifically affects the Adreno 610 series GPUs when running Turnip drivers.
byte[]’s solution to the issue is to purposely {{< gh-hovercard "12390" "use the Vulkan API incorrectly" >}} for Turnip while we wait for Mesa to address the issue.
Now Adreno 610 users can run Turnip drivers again.

### Android-specific UI and miscellaneous changes

Let’s round up the Android changes–we have more stuff to cover affecting both desktop and Android users too, after all.

First and most important to mention, [t895](https://github.com/t895) outdid himself and finished implementing {{< gh-hovercard "12335" "Game Properties" >}}.

{{< imgs
	"./config1.gif|Kept you waiting, huh"
  >}}

This new section can be accessed by hold pressing a game in the list, and gives access to these new pages:

- A game information page to check program ID, game developer, game version running, and game ROM path.

{{< imgs
	"./config2.png| Great for diagnosing update installation shenanigans"
  >}}

- Per-game settings page, with the option to revert a setting to the global default.

{{< imgs
	"./config3.png|As a game tester, and an 8GB sufferer, your writer considers this a huge blessing"
  >}}

- Similarly, a per-game driver selector, for the cases where Qualcomm did something correctly, or an older Turnip release is better.
- An add-ons manager to install, enable, and disable updates, DLCs, and mods. While there are plans to support compressed mods, right now they must be uncompressed and manually selected here.

{{< single-title-imgs
    "Bet you enjoy this one the most"
    "./config4.png"
    "./config5.png"
    >}}

- A save data manager, allowing to export or import per game saves, along the global option.
- An option to delete all save data of that particular game.
- An option to clear the pipeline cache of that particular game.
- And a Start button, which allows you to select global or custom configuration. Launching from the game list will always load the custom configuration.

{{< imgs
	"./config6.png|To round it up"
  >}}

This covers one of the biggest missing components the Android build has left.
The only remaining settings are a content manager to delete installed content, and the controller mapping UI.
Rest assured, we’re working on them.

t895 has continued to work on bringing Android to feature parity with the desktop build, while considering the specific needs of the mobile platform.
Some of the {{< gh-hovercard "12520" "recent changes" >}} included are:

-  Hiding the Fastmem toggle if CPU debugging is disabled, avoiding confusion on how it operates.
- Exposing the anisotropic filtering setting in graphics, an option that greatly helps visuals in several games with minimal performance cost.
- Centering the switch setting title when no description is present.

One of the unique Android features is their {{< gh-hovercard "12387" "Oboe" >}} audio backend, which is, as expected of something unique to the platform, quite robust.
byte[] implemented it into yuzu to stop audio from cutting off when changing audio outputs (switching to wireless headphones for example) or starting a screen video capture.

The option can be found at `Settings > Advanced settings > Audio > Output engine`.
While Auto is the recommended value (it will always use Oboe on Android), users can take advantage of per-game settings to test Oboe vs Cubeb in any game they want.

And finally, a minor change for end users which we think someone out there will enjoy.
With the work on the game properties section, t895 also had to equalise the {{< gh-hovercard "12518" "configuration file" >}} `config.ini` to make it work on both desktop and Android builds.

## Memory heap allocation, or how the Linux kernel can be wrong sometimes

Yes, Linux did an oopsie, how will they ever recover?

The Linux kernel has a large set of runtime parameters. 
One in particular is a limit on how many times a program can use the `mmap` system call.
The default maximum value is 65530, which "ought to be enough for anyone", or so the meme goes, but in practice that isn’t always the case.

Typically, Switch games will query the amount of memory heap they have available, reserve all of it, and then suballocate from their OS-level reservation as they use up memory. 
This is already well-supported when using host-mapped addressing (most commonly known as fastmem) on Linux-based operating systems, as it only requires a few calls to map the physical memory blocks which comprise the heap.

Games based on Unreal Engine 4 do not do this.
Instead of reserving all of the available memory heap immediately, they reserve small blocks from the kernel on demand.
If only the software page table is being used, there’s no problem, as the blocks aren’t resulting in calls to `mmap`.

When yuzu uses host-mapped addressing, the emulator propagates all of these mappings into the host address space.
That in itself wouldn’t normally be a problem, if it wasn’t for the fact that Unreal Engine 4 can allocate hundreds of thousands of small heap blocks, going over the kernel limit with ease, and crashing the entire program.

yuzu is not the only [project](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html) affected by this completely arbitrary limitation–it has been a complaint for quite a long time.

To work around this limitation, byte[] {{< gh-hovercard "12466" "inserts a layer" >}} between the software page table and the host mapping system, constantly tracking the heap allocations made by programs and automatically recycling some less recently used mappings, which causes some stuttering―but better than a game crash. Collection will reduce the number of mappings to around half of the 65530 limit most systems ship with.

Yep, 64k is not enough for everyone.

This way, Unreal Engine games can be safely played on Linux-based systems, like desktop distributions and Android devices, without needing to disable fastmem and NCE, two big performance settings that no one wants to keep off.

## Project Leviathan, applets, and input fun

As usual, [german77](https://github.com/german77) has been having his good share of fun working on input and the native applets.

First in the list is a solution for Amiibos with read-only permissions. If a program mounted them as read-only, yuzu doesn’t access any of their encrypted data, and could mark them as corrupt, which wasn’t really the case.
Since read-only data is set from the factory, {{< gh-hovercard "12255" "skipping the corruption check" >}} allows the use of read-only mounts in games like `The Legend of Zelda: Tears of the Kingdom`.

Next up, an announcement. german77 started working on a rewrite for the HID (human interface devices) code, called `Project Leviathan` with the intention of further improving the accuracy of yuzu’s input emulation.
So far only preliminary work has been done, but some results have already been put into service.

The first part finished is the {{< gh-hovercard "12289" "emulation" >}} of `AppletResource`, which allows the developers to start working on multiprocess support in the near future, as well as other necessary resources like `AppletResourceUserId`, or simply aruid.

Following up, german77 implemented the necessary code to allow the {{< gh-hovercard "12359" "creation of multiple instances" >}} of HID shared memory, removing an old workaround and relieving the kernel from being responsible for handling shared memory, which in turn allows having a single shared memory instance per aruid.

Another spot that is starting to shape up thanks to this HID rewrite is {{< gh-hovercard "12425" "object creation," >}} more specifically, `InitializeVibrationDevice`, which would cause games like `Rocket League` to crash.

But not only german77 worked on input this month, newcomer [HurricanePootis](https://github.com/HurricanePootis) brought us an interesting fix for Linux users.
Linux handles hardware permissions on a per-user level.
For example, if for some reason the administrator desires it, an user can be completely blocked from having access to the `video` group, or `audio`, etc.

Connected devices are often only able to be accessed by the `root` user or group. While this usually isn’t a problem for just using the device, it can block access to the custom Joy-Con and Pro Controller drivers german77 implemented, regardless of whether the user runs an appimage or Flatpak yuzu build.
By {{< gh-hovercard "12292" "adding a udev rule" >}} to grant access to `hidraw` devices, HurricanePootis circumvented this limitation.
Thank you!

## Miscellaneous changes

### Multiprocess preliminary work

We spoke about preliminary work for multiprocess support. There’s more to cover on the matter.

byte[] refactored how yuzu emulates {{< gh-hovercard "12236" "CPU core activation," >}} he assures us writing three thousand lines of code simplifies the design of the ARM interface the emulator uses.
This has the added benefit of allowing code from multiple guest processes to run simultaneously, which is another of the prerequisites for starting the multiprocess effort.

ARM guest emulation also received support for {{< gh-hovercard "12394" "multiple memory instances," >}} which can now coexist and interact with multiple server sessions.
One step closer with every pull request.

### Core, kernel, and file system changes

german77 found some… unexpected… behaviour in how the {{< gh-hovercard "12328" "user profile manager" >}} behaved.
It generated around 13 instances of itself, which lead to multiple, hard to explain bugs related to user data, including the sudden loss of profile after emulator crashes.
Slapping the profile manager and telling it to run a single instance should mitigate most random profile loss issues.

Sometimes, games have unexpected file organisation strategies.
A recent episode of this phenomenon affects the `Batman: Arkham` trilogy: the base games ship with a null RomFS.
That shouldn't have been a problem; having a RomFS is never a requirement to run a program. 
`Batman: Arkham Asylum` did have a RomFS, and was launching fine, but `Batman: Arkham City` and `Batman: Arkham Knight` require their updates installed to be playable (their base game size is only 8MB).
The update contains the RomFS, but since the base game didn't contain it, yuzu couldn't find the RomFS to load, even with the update installed.

Handling this {{< gh-hovercard "12263" "peculiar case" >}} fell into byte[]’s hands, and the World’s Greatest Detective can now go fetch ? signs all over the place at ease.

{{< imgs
	"./batman.png|The Goddamn Batman (Batman: Arkham Knight)"
  >}}

Another {{< gh-hovercard "12392" "file system implementation" >}} byte[] gave us was support for the `OpenDirectoryMode` flag, which allows `Portal 2` to save and load properly. One has to wonder why this wasn’t fixed earlier.

{{< imgs
	"./portal21.png|Are we going to space? (Portal 2)"
  >}}

Some additional work was needed to get this masterpiece fully playable. 
An entire service needed some patching-up, specifically, `ro`, or {{< gh-hovercard "12321" "relocatable object" >}} (allowing programs to load libraries on the fly), needed to be rewritten a bit–just over a thousand lines of code.

And finally, `vi`, one of the services responsible for drawing on the screen, needed to distinguish between {{< gh-hovercard "12331" "closing and destroying layers" >}} in order to get `Portal 2` in-game.

{{< imgs
	"./portal22.png|Ever get that feeling of Deja Vu? (Portal 2)"
  >}}

A silly issue byte[] made in the [SSL](https://www.openssl.org/) buffer size configuration broke the Open Course World section of `SUPER MARIO MAKER 2`.
{{< gh-hovercard "12372" "Fixing this configuration mishap" >}} allows the game to run its "main mode".

Yet another set of findings by byte[], yet another battle won against shutdown crashes.
This time we have timing related crashes in {{< gh-hovercard "12454" "core timing" >}} being addressed, and a rather rare {{< gh-hovercard "12455" "shutdown crash" >}} in the kernel being squashed.

Let’s close this longer-than-expected report and move to the hardware section.
Our last section in the list is:

### UI changes

german77 spotted an oopsie in the UI configuration files, leading to the language selection never getting saved.
If anyone noticed yuzu always selected the default language, you now know what the reason was.
{{< gh-hovercard "12402" "Making this value persistent" >}} solved the problem.

And lastly one last minor buff to Linux desktop users, from the hands of newcomer [ReillyBrogan](https://github.com/ReillyBrogan).

When using a Wayland compositor, program windows are matched to their `.desktop` shortcut file.
The appId window property is intended to match the name of the `.desktop` file, for example, `org.yuzu_emu.yuzu.desktop`.
Plasma desktop by default sets this property to the name of the binary file, which in this case is just `yuzu`, and doesn’t match the expected value of `org.yuzu_emu.yuzu`.
This led to Plasma desktop users (Steam Deck included) displaying yuzu without our glorious icon.
One {{< gh-hovercard "12521" "manual override" >}} later, and the icon is properly there. Thank you!

## Hardware section

Not much to mention this time, but there’s a few nits that deserve to be brought up.

## NVIDIA, safe to update

### Proprietary NVIDIA driver

As previously mentioned, it’s safe to update to the latest driver versions thanks to the fixes implemented by byte[].
This will become more critical once the SUPER refresh of Ada cards is out, so perfect timing there.
Hopefully they finally provide good value.

### NVK

What’s this? A free and open source Mesa Vulkan driver for Turing and later NVIDIA hardware, that’s what it is!

[It’s still very early days](https://www.phoronix.com/news/Mesa-23.3-Released), Mesa just started shipping preliminary support for this new driver, but we can’t wait to try it out once it’s mature enough.
There’s nothing better than having the option to choose.

## AMD

We identified `Pokémon Scarlet & Violet` crashes on RDNA1 hardware exclusively (RX 5000 series).
The usual standard procedure was followed, a custom test case was provided in a bug report.

## Intel…

In contrast, Intel failed us again. 
No words from the fix for the geometry shader crash we [reported](https://github.com/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/551) back in October yet.

We hope it’s just a delay from the holidays.
2024 is the year of ~~the Linux desktop~~ working Intel Windows drivers.

## Qualcomm

This section needs to be split too. Just a moment.

### Proprietary Qualcomm driver

Much better.

We recently got our hands on a Snapdragon 8 Gen 3 device (a Red Magic 9), and while the official Qualcomm driver is still mediocre at best, we’re very impressed with the performance of the new Adreno 750 GPU. 
In spite of its driver, it managed to bruteforce amazing framerate numbers. It still produced the same graphical glitches any other Adreno card has with their respective official drivers.

Some games reached the 120 FPS limit imposed by the device’s screen refresh rate.
In simpler terms, Balanced mode in the Red Magic 9 is faster than Diablo mode in the previous Red Magic 8.

We can’t wait for Mesa to add Turnip support to this new hardware in town, but as anyone with experience using Mesa will tell you: "let them cook".

Speaking of which.

### Turnip

Adreno 750 aside, the Turnip network of support continues to improve.
Current [releases](https://github.com/K11MCH1/AdrenoToolsDrivers/releases) for example have added support for rare variants, like Adreno 642L and Adreno 644.
Performance has improved too, as well as stability.

Keep up to date with Turnip releases; they usually only bring benefits.

## Mali moment

Total Mali moments count this month: 3.

But it’s not all bad news dear Mali sufferers!

[Newer generations](https://www.phoronix.com/news/Panthor-DRM-Newer-Mali) of Mali hardware, codenamed "Panthor" will have an officially backed Mesa driver, the already existing but almost abandoned [Panfrost/PanVK](https://gitlab.freedesktop.org/mesa/mesa/-/merge_requests/26358) driver.
This means in the future Mali moments will maybe stop existing, in a similar way to how Turnip provides a much better experience to Adreno users.

## Future projects

Multiprocess [GPU SMMU](https://github.com/yuzu-emu/yuzu/pull/12579) support is almost done now, thanks to Blinkhawk.
We’ll cover it in more detail next month, but you can check the pull request draft meanwhile to see the expected benefits it brings.

And maybe the rest of the team has something more going on, yeah. But let’s save that surprise for later, it’s more fun that way (this in no way means any attempt to leak a picture of the current progress was rejected by all devs, no no).

That’s all folks! I’m finishing writing and collecting media at 7AM. Thank you for reading until the end, let’s see you all again next time in the first progress report of 2024!

&nbsp;
{{< article-end >}}
{{< imgs-compare-include-end >}}
{{< gh-hovercard-include-end >}}
