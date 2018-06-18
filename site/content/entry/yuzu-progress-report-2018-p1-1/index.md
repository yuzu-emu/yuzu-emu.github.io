+++
date = "2018-07-14T08:00:00+05:30"
title = "Progress Report 2018 Part 1"
author = "CaptV0rt3x"
forum = 33660
+++

It's been a bumpy ride. We have had lots of stuff happen to yuzu and we are excited to share that
with you. Let's get started!
<!--more-->


After months of research and countless hours of coding, the developers who gave you [Citra](https://citra-emu.org),
an emulator for the Nintendo 3DS, now bring to you yuzu – an experimental emulator for the Nintendo
Switch. yuzu is based off of Citra's code, with many changes tailored towards the Switch made. It
gives me great pleasure to welcome you all into the world of yuzu.

## Backstory

The Switch is the 7<sup>th</sup> major video game console from Nintendo. As the Wii U had struggled
to gain external support, leaving it with a weak software library, Nintendo opted to use more standard
electronic components to make development for the console easier.

[bunnei](https://github.com/bunnei), the lead developer of Citra, saw that the Switch hacking scene
was very active and that there were signs of the Switch's operating system, called _Horizon_, being
based on the 3DS's operating system. The Switch hacking communities ([ReSwitched](https://reswitched.tech/)
and [Switchbrew](http://switchbrew.org)) had many people working on hacking and documenting the system.
[bunnei](https://github.com/bunnei), being a _huge Nintendo fan_, was very excited at the prospect
of an emulator for Switch. Using the available documentation, [bunnei](https://github.com/bunnei)
worked on yuzu privately for a few months before other Citra developers joined him. They made some
progress and finally went public on 14 January, 2018.

{{< gifv
	  "/images/entry/yuzu-progress-report-2018-p1/homebrew.mp4|Before (Colors are wrong)"
    "/images/entry/yuzu-progress-report-2018-p1/homebrew_work.mp4|After (fixed)"
>}}

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/homebrew_game.png|Very first homebrew on yuzu, Space Game !!"
>}}

## Baby Steps

yuzu shares the same common and core code, with much of the same OS (operating system) HLE, with Citra
(as both OSs are similar). For the uninitiated, with HLE (high level emulation), parts of the OS are
re-implemented in the emulator, which the emulated game can call directly. This contrasts with low-level
emulation (LLE), where the hardware is emulated, and the real OS bits are run within the emulator.
Initially, [bunnei](https://github.com/bunnei) worked hard to get the Citra code base working for
Switch emulation. He updated the core emulation and Citra's memory management to work with 64-bit
addresses (as Citra emulates 32-bit apps), did lots of OS HLE, added a loader for the Switch games
/ homebrew, and integrated [Unicorn](http://www.unicorn-engine.org/) into yuzu for CPU emulation.
Unicorn was chosen at that time and not [Dynarmic](https://github.com/MerryMage/dynarmic) (which is
used in Citra) because the Switch has an ARMv8 CPU (64-bit) and dynarmic only had support for ARMv6
at that time. He got some basic SVC (Supervisor Call) implementation hooked up to begin booting some
homebrew applications and very simple games. At this time, there was no graphical output yet.

Later, [Subv](https://github.com/Subv), another Citra veteran, joined him and together they both got
framebuffer rendering support for basic homebrew. It was at this point that yuzu was announced publicly
and went open-source. As the project became open-source, many developers and reverse engineers joined
the team and as of today, yuzu is able to run 12 games. This fast paced progress is a result of the
highly active Switch hacking scene. When bunnei first started Citra (in 2014), the 3DS was already
3 years old, homebrew was barely starting to happen, and game dumps were still encrypted. Contrary
to this, Switch has a much more active hacking scene, much earlier on in the console's life-cycle
(few months). It is believed that, fueled by the successes with 3DS hacking, a lot of the same teams
and people have started working on the Switch hacking as well.

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/puyo_boot.png|First game rendering triangles (actually SEGA logo) !!"
>}}

## Pit Crew & Their Efforts So Far

***Rivalry of scholars advances wisdom***. This proverb is highly accurate in terms of emulators. The
clash of knowledge between peers helps mutual growth. During its early days, Citra had a peer too,
[3dmoo](https://github.com/plutooo/3dmoo). In the case of Switch emulation, we have [Ryujinx](https://github.com/gdkchan/Ryujinx).
Our developers have worked with [gdkchan](https://github.com/gdkchan) (he main developer of Ryujinx) on
reverse engineering (RE), figuring out how games work, and how the Switch GPU works.

[Subv](https://github.com/Subv) worked on initial framebuffer rendering support, and then went on to
do lots of OS reverse engineering and bug fixes. Lately, [bunnei](https://github.com/bunnei) and him
have been working on GPU emulation. [ogniK](https://github.com/ogniK5377) (from the [ReSwitched](https://reswitched.tech/)
team) also joined us and is one of our RE experts. He has done a lot of Switch OS RE, which helps us
to get yuzu booting games further. He has contributed a lot, mostly in audio, kernel, and services.

[shinyquagsire](https://github.com/shinyquagsire), another Citra developer, came forward and implemented
user input and various other things. [Lioncash](https://github.com/lioncash) and [MerryMage](https://github.com/merrymage)
worked tirelessly on adding ARMv8 support to dynarmic, and thanks to their efforts we are now using
[dynarmic](https://github.com/MerryMage/dynarmic) for CPU emulation. Apart from these people, there
are more than a dozen contributors for yuzu who have worked on minor things. It's because of their
invaluable efforts that yuzu now proudly boasts it's ability to boot several commercial games like ARMS,
Splatoon 2, One Piece Unlimited Red Deluxe, Cave Story+, and many more. As of now, a few games are
actually playable on yuzu – Binding of Isaac, Sonic Mania, Stardew Valley, etc.

## Reverse Engineering (RE)

The RE process of yuzu is very similar to that of Citra. We collaborate with the hacking communities,
for documenting the workings of Switch and do some RE ourselves as well. It's a mix of learning and
implementing things ourselves, using community documentation to validate or guide our process. The
fact that the Switch is based on off-the-shelf Tegra SoC does not necessarily make the process easier,
because, similar to the PICA200 (3DS GPU), the Maxwell GPU architecture isn't publicly documented.

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/setup.jpg|ogniK's janky RE setup"
>}}

That said, there are more resources and non-Switch related projects ([Nouveau](https://nouveau.freedesktop.org/wiki/),
[envytools](https://github.com/envytools/envytools), etc.) that we can use. Switch's GPU is many times
more advanced/powerful than 3DS', and so are the challenges in its RE. RE on the OS HLE side of things
has otherwise been the same and is moving at the same pace. We currently have a graphics renderer,
based off of Citra's graphics renderer, which uses OpenGL 4.1.

Mind you, yuzu is at a very young stage in its development. As such, any progress we make would be
only possible if we have a proper direction. Right now, most of our development is being done in a
trial-and-error manner. Simply put, we are working on making games boot and then we fix our implementations
based on further RE and any other new found info.  

## OS emulation

The Switch's OS (operating system), called Horizon, is based on the 3DS's OS. This was a silver lining,
as it meant that Citra's OS HLE code could be largely reused. A point to remember, is that both Citra
and yuzu are high level emulators. In both of these, we are trying to implement the software rather
than the hardware of the consoles.

As an emulator, the first necessity in yuzu would be to load the Switch game dumps. So, [bunnei](https://github.com/bunnei/)
started working on a loader and file system service for yuzu. Citra's loader and file system frameworks
were reused and modified heavily to support Switch game dump files ([here](https://github.com/yuzu-emu/yuzu/pull/123)).
Further fixes and improvements to the loader were done by ogniK, Rozelette, gdkchan, and shinyquagsire.

Next, we would need a way for games to read or load save data. [Subv](https://github.com/Subv) believed
that the save data in the Switch has a similar behavior as the save data in the 3DS. He implemented the
file system and save data behaviors, which allowed games to read and write files to the save data directory.
([here](https://github.com/yuzu-emu/yuzu/pull/216)). This implementation allowed us to boot further
in "Puyo Puyo Tetris" and "Cave Story".

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/cavestory_boot.png|First boot - Cave Story+"
    "/images/entry/yuzu-progress-report-2018-p1/cavestory_work.png|Now - Cave Story+"
>}}

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/tetris.png|First boot - Puyo Puyo Tetris"
    "/images/entry/yuzu-progress-report-2018-p1/tetris_work.png|Now - Puyo Puyo Tetris"
>}}

Often, the best way to debug or RE any functionality is to use homebrew. For the uninitiated, homebrew
is a popular term used for applications that are created and executed on a video game console by hackers,
programmers, developers, and consumers. The good folks at Switchbrew created `libnx`, a userland library
to write homebrew apps for the Nintendo Switch. To support homebrew apps, written using libnx, our
developers bunnei and shinyquagsire made various fixes and finally yuzu now supports loading libnx apps.

The Switch's OS uses a lot of 'services' to provide the games with functionality which allows it to do
things like getting user input, audio output, graphics output, etc. However since the Switch hasn't
been completely reverse engineered, we still don't know how to implement some of these services.
Currently, some service calls, which we are fairly confident can be ignored, are being stubbed. Stubbing
means that these services return `ok` with no errors, so that the games think that the function
succeeded and it can continue on without getting back any valid data. As the games boot further and
further, we need to start intercepting these function calls and provide a more meaningful response.

Switch IPC (Inter-process communication) is how the OS communicates between the various services running.
This was much more robust and complicated than the 3DS's, for a lot of reasons. First of all, it does
lot more validation on responses. This means that both our service HLEs or stubs need to have the
responses be exactly what it expects with exactly right number of output parameters at right offsets,
results have to be at right offsets, data needs to be at right offsets, and a couple of other magic
fields need to be present.

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/stardew.png|First boot - Stardew Valley"
		"/images/entry/yuzu-progress-report-2018-p1/stardew_2.png|in-game - bugs"
    "/images/entry/yuzu-progress-report-2018-p1/stardew_work.png|Now - Stardew Valley"
>}}

In addition to this, we have a couple of different command modes, a typical IPC request response, and
something called a _Domain_. Once a IPC session is opened to a service, the game can use this command
to turn that session into what's called a Domain. This is a more efficient way to do lots of service
calls. Our implementations were mostly iterations of learning how the IPC worked and implementing it.
After facing many issues and fixing them, we finally got things working. We then wrote a wrapper code
around this, which allows us to implement service functions without needing intricate knowledge of
how the IPC system works.

A lot of our work is based on background research the ReSwitched team did with their Switch
debug emulators, [CageTheUnicorn](https://github.com/reswitched/CageTheUnicorn) (python) and [Mephisto](https://github.com/reswitched/mephisto)(C-lang).
These emulators were designed for debugging and they implemented the Switch IPC and did most of the
work to figure that out. We thank [daeken](https://github.com/daeken) and [mission20000](https://github.com/mission20000),
authors of CageTheUnicorn and Mephisto respectively, as without their initial help and their work, we
wouldn't have gotten as far as we have.

The Nvidia services configure the video driver to get the graphics output. Nintendo re-purposed the
Android graphics stack and used it in the Switch for rendering. We had to implement this even to get
homebrew applications to display graphics. The Switch is very different from older systems, where we
could find a physical or virtual address of the framebuffer in memory and start writing to it to get
quick output. Here, we actually have to configure the OS to create a render surface and we can start
writing to it. Even the simplest homebrew had to implement this graphics layering for rendering. Subv
did most of the work to get the initial framebuffer working.

Coming to Kernel OS threading, scheduling, and synchronization fixes, most of the OS HLE for yuzu was
ported from Citra's OS implementation. As the Switch RE progressed and we learned things, we made
multiple fixes to yuzu's OS implementation. The Switch's scheduler is almost identical (if not
identical) to the 3DS's. We had to make several changes to support Switch's different synchronization
primitives but the rest if it (thus far) has been very similar and has used a similar SVC interface.
Hence we've reused Citra's code here as well.

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/1-2-switch.png|First boot - 1-2-Switch"
		"/images/entry/yuzu-progress-report-2018-p1/1-2-switch_jap.png|Wrong Language"
    "/images/entry/yuzu-progress-report-2018-p1/1-2-switch_work.png|Now - 1-2-Switch"
>}}

{{< imgs
	  "/images/entry/yuzu-progress-report-2018-p1/boi_2.png|First boot - The Binding of Issac"
		"/images/entry/yuzu-progress-report-2018-p1/boi.png|in-game - first renders"
    "/images/entry/yuzu-progress-report-2018-p1/boi_work.png|Now - The Binding of Issac"
>}}

As we now have some games booting, the next step along the line would be adding HID (user input support).
shinyquagsire worked on getting initial HID support and made further fixes along the way. HID services
maps some shared memory region to which the games can read to, get user input state and gamepad input
writes to this. yuzu now supports handheld inputs with analog sticks and buttons. We still have a lot
to implement in HID, like support for all 9 controllers, rumble, LEDs, layouts etc., and its going to
take a bit of additional work to get it all implemented. As much of this has already been RE'd, this
is a great place for new developers to make contributions!

Currently Audio HLE is in progress, but we do not support audio playback (_yet!_). ogniK did a lot of
reverse engineering on the `AudRen` service (Audio renderer) which most games use for audio output.
There is another service called `AudOut` service, which homebrew and a few games use for audio output.
It's a much simpler service and the homebrew community figured this out. We haven't implemented this
as not many games use this. ogniK did most of the work on `AudRen` service and he pretty much figured
out how it works. This is a major breakthrough as most complicated games we have seen so far were
getting stuck, either hanging or deadlocking because they were waiting for proper `AudRen` state to
be set. ogniK's work on this helped us go further in a few other games.

Apart from the work mentioned above, we have also had minor fixes which helped us boot further in
games like Super Mario Odyssey, 1-2-Switch, and The Binding of Issac.

***Stay tuned for the next part of this report....***

<h3 align="center">
<b><a href="https://github.com/yuzu-emu/yuzu/">Contributions are always welcome !</a></b>
</h3>
