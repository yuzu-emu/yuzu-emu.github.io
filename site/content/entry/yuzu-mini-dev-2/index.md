+++
date = "2019-08-09T08:54:00+05:30"
title = "Mini-Series - Dev Interview #2"
author = "CaptV0rt3x"
forum = 135709
+++

Good day, yu-zers! (~~bad pun, I know~~)
While our devs are hard at work trying to bring you more performance improvements and game compatibility, we are back again with something a little bit more interesting - **Dev Interview #2**.
Jump right in, to find out who we're interviewing this time.
<!--more-->
***
Welcome to the part 2 of our previously announced `Developer Interviews` segment.
We are extremely proud that we were once again successful in dragging one of our developers away from programming, to answer a few questions.
This time, it is an interview with one of our resident GPU emulation experts, ***Rodrigo***.

Rodrigo (a.k.a [ReinUsesLisp](https://github.com/ReinUsesLisp)) is best known for his massive contributions to yuzu in the GPU emulation area.
His various contributions have improved the visual experience and his shader disk caches improved the performance of many games on yuzu.
He is also the guy who is currently working on implementing the Vulkan API.
Below you'll find a nice sit down we had with him, that should also help you all understand a little bit more about what he's doing behind the scenes.
***


**Q: Hi Rodrigo! Wanna tell our patrons a little about yourself?**

**R:** Hi! I'm some random guy from Argentina working on emulating Nintendo Switch's GPU. 
*And I'm totally not ripping off Lioncash with this presentation.*

Right now, I am a school teacher and don't have a formal programming background, but I'd like getting a computer science job in the future. I'm also interested in languages (both spoken & programming) and software development.


**Q: You are entirely self taught?! So, what made you get into emulation?**

**R:** Yes. See, I always used to play games in my childhood through emulators, mostly 90s console emulators (SNES and Genesis). Later on, I remember playing `Twilight Princess` on Hyrule Fields with Dolphin at **3 FPS**, it was just awesome. 

Around 7 years ago, I learnt to program small RPGs in plain C++ (and then C), but that never got beyond the prototyping stages, mainly because of boredom and the lack of artistic resources.

What got me into emulation mainly was, yuzu's very [first video](https://www.youtube.com/watch?v=1VzyIHMTA2Q) of three commercial games booting (Cave Story, Isaac Afterbirth and Puyo Puyo Tetris).
**There it was!** -- an emulator of a console, that I thought was a successful piece of hardware: A tablet with a somewhat desktop GPU? That would have been madness some years ago.

{{< single-title-imgs
   "Cave Story+ (First yuzu build) - We've come a long way from that!"
   "./first.png"
>}}

**Q: That's really interesting to hear. Before yuzu and Switch emulation, have you ever worked on other older emulators?**

**R:** No, I've never worked on a non-Switch emulator. The closest thing I did related to emulation was a clone of Pico-8 Celeste for the NES in 6502 assembly.
It was a fun experience because I learnt the curse and blessing that it is, working that close to the hardware.
And it showed me what a pain it was, to program classics like Super Mario Bros. 3.


**Q: Let's get a bit technical. What areas of switch emulation have you worked on mainly and why? Which other areas keep you interested?**

**R:** I've worked on the graphics department and the compute department of Switch emulation.
For those that don't know, the Switch's GPU - it's a Nvidia Tegra X1, the same architecture of a GTX 960+.
Emulating a modern GPU (Tegra) by using other modern GPUs (user end), is my area of interest. 

As for why I like it, it's because GPUs nowadays are like mini sub-computers inside a machine.
The list of functionality present in the Tegra X1 grows bigger the more we look into it; since it’s a Nvidia device, it can execute CUDA kernels (programs that run some computations in the GPU, primarily used for scientific calculations or accelerated computations).
It has the 5 traditional shader stages, an extra vertex shader stage, compute shaders, while at the same time it supports the supposedly deprecated features from the D3D9 era like rendering with quads and alpha testing.

From time to time, I try to get into Core emulation, but it never ends up with good results. Funnily enough, while I was investigating the SSBU crash, I totally thought I made a breakthrough  - only to find out I was disassembling the wrong module. (LOL)


**Q: What are some of the challenges you generally face, when working on GPU emulation?**

**R:** One of biggest challenges, is the inherent variable state of Nvidia GPUs.
Sometimes graphics APIs like OpenGL and Vulkan have requirements that are the "common ground", something that's needed by the lowest denominator.
We have to write very annoying workarounds to get that functionality working in the emulator.

<p style="color:cyan"><b><i>Here are some sneak peeks from my Vulkan test build. It's still missing a lot of things, but it's not too bad either.</b></i></p>

{{< imgs
   "./botw.png|The Legend of Zelda - Breath of the Wild"
   "./onepiece.png|One Piece - Unlimited World"
   "./smo.png|Super Mario Odyssey"
>}}

**Q: What motivates you every day to keep working on this stuff?**

**R:** Emulating modern GPU features on hardware with those same features, is something that has only been possible in the recent times, due to the increasing similarities in hardware between consoles and desktops.
Slowly understanding how some known functionality is implemented by the hardware, and then re-implementing it on the emulator afterwards, really motivates me.

There are two things that I enjoy the most:
- seeing games run faster and better than how they ran before and
- seeing games get more and more closer to how they look on the console.

And if I manage to get these improvements by writing better code, it's an added bonus.

**Q: Can you tell us a little about what you are currently working on? A sneak-peek perhaps?**

**R:** That's classified information :P
I've recently worked on a improved & generic texture cache. 
Blinkhawk helped by cleaning up my bugs to get the thing working and he's done an awesome job.
A generic texture cache allows us to share the complex part of it across graphics APIs.
That means that we will have the same overall logic for OpenGL and Vulkan, making it easier to maintain and improve.

It's not as good as Dolphin's VideoCommon, one of the better examples for generic graphics code, but it's still better than having to copy-paste code everywhere.
This is one of the last pre-requirements for the Vulkan API.

I've also been working on implementing various compute shaders related instructions like shared memory (ARB_compute_shader), atomic operations, memory shuffles (NV_shader_thread_shuffle), votes (NV_gpu_shader5, NV_shader_thread_group), surface operations (SUATOM, SULD).
These are all features from the D3D11/12 era, meaning that we are reaching interesting complexity on the shaders we find in recently released games.
I am also investigating how to implement some missing functionality in yuzu, but that's a story for another time.

**Q: Would you like to say something to our audience?**

**R:** Well, there are three things I'd like to say.

`First and foremost...` most of our GPU work has been possible thanks to research done by the people working on nouveau (mesa's Nvidia free driver) and libnx's nouveau port to Switch. They have been of huge help.

`Second...` many people believe that Vulkan will bring lots of performance improvements to the emulator, I was one of those too. Don't get me wrong, it might bring some boost on some hardware vendors. 
But the main issue resides in Vulkan's design. It is designed in a way that the programmer cooks and reuses its resources, but in emulation you can't easily know what's going to happen in the future. On the other hand, OpenGL by design works without backing its commands. 

Some people might ask, why would we want two APIs? I think one API is going to perform better on two vendors, while the other API is prevalent on the other vendor. 

`And last but not the least...` We have a console that's just two years old and it's still lacking the mainstream entries for most Nintendo IPs: Metroid, Donkey Kong Country, the announced Gen 8 Pokémon, Star Fox, Mario Kart, F-Zero (who knows? maybe they will find a way to refresh the franchise) and the end-of-cycle Zelda.

I'm really excited about what's to come and how good Switch emulators will perform with these games. Emulation has been surprisingly faster in the last few years. Let's look forward to a wonderful future...
***

This has been absolutely wonderful.
Huge thanks to [Rodrigo](https://github.com/ReinUsesLisp), for taking time off his busy schedule to give us a brief insight into his life.
We wish you success in all your future endeavours. Keep making yuzu awesome!

We hope you guys enjoyed it, and we will be back soon with another featured Yuzu dev to bring you guys behind the curtain again. 
Until then, thank you for your support and stay tuned!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, checkout our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>