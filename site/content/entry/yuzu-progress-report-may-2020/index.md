+++
date = "2020-06-07T03:15:00-03:00"
title = "Progress Report May 2020"
author = "GoldenX86"
forum = 0
+++ 

Hello yuzu users! How are you doing?

In this episode of yuzu: Trials and Tribulations, we offer you: major rewrites, massive performance gains, 
stability improvements, bug fixes and graphical corrections.
More, after the break.
<!--more-->

## The worst kept secret

It has its own [article](https://yuzu-emu.org/entry/yuzu-prometheus/), and it has been already guessed to hell and back before the official announcement.
`Project Prometheus`, teased so much in yuzu’s official Discord server, is a proper multithreaded emulation of the 4 CPU cores the Nintendo Switch offers.
This brings a massive performance boost to users with CPUs with 4 physical cores or more. But for this to happen, a lot of groundwork was needed.
Besides changes previously discussed in the past reports, old external libraries (which yuzu needs to operate) needed to be updated,
and with that, some changes were needed for our Linux users. 

Thanks to [jroweboy’s](https://github.com/jroweboy) work, yuzu now uses [conan](https://conan.io/),
helping the project manage dependencies, and letting Linux distributions use their native ones when possible. 
[Pull Request #3735.](https://github.com/yuzu-emu/yuzu/pull/3735)

With the memory use reduced, dependencies updated, and all the groundwork done, [Blinkhawk](https://github.com/FernandoS27) 
pressed the nuclear button and released Project Prometheus, making yuzu use up to 6 to 7 CPU threads in ideal conditions 
compared to the previous 2 to 3. Expect a performance boost in a lot of games, while others will stay mostly the same due to 
being coded to only use a single thread of the possible 3 the Switch offers to games.
[Pull Request #3955.](https://github.com/yuzu-emu/yuzu/pull/3955)

Now, some clarifications are needed on this change. Multicore support can’t hit mainline for now due to incompatibilities with 
its code and the Master branch of yuzu. Those are being resolved, but please have patience.
Also, users with 2 cores and either 2 or 4 threads should not enable multicore as it will most likely result in a performance 
loss for them due to the lack of physical cores on their CPUs. Our [hardware recommendations](https://yuzu-emu.org/help/quickstart/#hardware) 
have been updated accordingly.

## Unreal Engine fixes

[Rodrigo](https://github.com/ReinUsesLisp) implemented rendering more than one slice of 3D textures, fixing the most glaring 
issue in Unreal Engine 4 games, known as “the Rainbow”. This also improves the previous implementation that was used in 
Xenoblade games.
[Pull Request #4027.](https://github.com/yuzu-emu/yuzu/pull/4027)

{{< single-title-imgs
    "Your Excellency (OCTOPATH TRAVELER)"
    "./01.png"
    "./02.png"
  >}}

## Animal Crossing: New Horizons changes

[Rodrigo](https://github.com/ReinUsesLisp) fixed Animal Crossing: New Horizons terrain borders in Vulkan by implementing 
constant attributes. This is not a native extension, constant attributes has to be completely emulated in Vulkan as there is no 
current official support for it.
[Pull Request #3930.]( https://github.com/yuzu-emu/yuzu/pull/3930)

{{< single-title-imgs
    "Beautiful beaches, now in Vulkan too (Animal Crossing: New Horizons)"
    "./04.png"
    "./05.png"
  >}}

Some more “internal” fixes were also done to Nook Inc.’s escape package, [bunnei](https://github.com/bunnei) added a time zone 
mechanism to show the correct time in game depending on where our users live, previously yuzu always assumed a GMT+0 timezone 
was in place.
[Pull Request #3909.](https://github.com/yuzu-emu/yuzu/pull/3909)

[bunnei](https://github.com/bunnei) also improved the saving mechanism. Normal games save their data on each user profile, but 
`Animal Crossing: New Horizons` does it in a “device” profile, so yuzu had to be accommodated for that.
[Pull Request #3665.](https://github.com/yuzu-emu/yuzu/pull/3665)

##Xenoblade specific fixes

Rendering bugs are abundant in Xenoblade games, and they are not of the “easy to solve” sort due to how these games are coded. 
[Rodrigo](https://github.com/ReinUsesLisp) managed to fix most of them by improving the texture cache, you can see the results 
bellow.
https://github.com/yuzu-emu/yuzu/pull/3991

{{< single-title-imgs
    "Who said yuzu can’t run JRPGs? (Xenoblade Chronicles 2)"
    "./06.png"
    "./07.png"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) also optimized the performance in Xenoblade games, one method was profiling the 
texture cache line by line and finding where it bottlenecks. By improving the code you get a faster frametime, which translates 
to better performance.
[Pull Request #3999.](https://github.com/yuzu-emu/yuzu/pull/3999)

Another way, and not an expected one, is to log less information, this avoids saturating the GPU thread, giving more room to 
actual processing and rendering.
[Pull Request #4007.](https://github.com/yuzu-emu/yuzu/pull/4007)

## General performance improvements

[ogniK](https://github.com/ogniK5377) wrote a new Macro JIT (Just In Time) to improve the performance of games spending too 
much time in the macro interpreter. This should be a global performance boost independent of GPU vendor or API.
[Pull Request #4009.](https://github.com/yuzu-emu/yuzu/pull/4009)

When [Rodrigo](https://github.com/ReinUsesLisp) improved yuzu’s ASTC decoding in the past, he also added a rule to use native 
hardware decoding whenever possible. The Nvidia driver informs such capabilities, but they use an internal software decoder, 
and turns out, it is far slower than our own implementation. Ignoring the Nvidia driver level software decoder gave a massive 
performance improvement when facing the dreaded ASTC texture format in games. It will still be immediate on Intel GPUs,
no software optimizations will beat a dedicated hardware decoder.
[Pull Request #4014.](https://github.com/yuzu-emu/yuzu/pull/4014)

## Bug fixes and improvements

Vulkan is an ongoing process in yuzu, and it has stability problems as expected of a relatively new and complex feature. 
[Blinkhawk](https://github.com/FernandoS27) did a couple of critical changes to Vulkan and Asynchronous GPU, improving stability 
considerably.
[Pull Request #3905.](https://github.com/yuzu-emu/yuzu/pull/3905)

Speaking about Vulkan, many 2D games have their sprites flipped or completely wrong, but once again, we currently lack the 
extension required to fix this, so [Rodrigo](https://github.com/ReinUsesLisp) implemented support for `NV_viewport_swizzle`, 
this Nvidia only extension is the only way to solve this problem in a clean manner for now. An universal method is being 
developed.
[Pull Request #3885.](https://github.com/yuzu-emu/yuzu/pull/3885)

{{< single-title-imgs
    "Quack (Duck Game)"
    "./10.png"
    "./11.png"
  >}}

The updated libraries also gave us a new version of our [cubeb](https://github.com/kinetiknz/cubeb) audio engine which adds 
support for 6 channel audio, [ogniK](https://github.com/ogniK5377) added the support for surround sound with this change.
[Pull Request #3827.](https://github.com/yuzu-emu/yuzu/pull/3827)

Our good shark [ogniK](https://github.com/ogniK5377) also fixed keyboard emulation support, so expect compatible games to be 
able to have proper direct input from your keyboards now.
[Pull Request #3926.](https://github.com/yuzu-emu/yuzu/pull/3926)

One small but important annoyance when running a fullscreen program is the mouse being in front of everything you are doing. 
[Tobi](https://github.com/FearlessTobi) implemented an option to automatically hide the mouse once it has been inactive after 
some time.
[Pull Request #3892.](https://github.com/yuzu-emu/yuzu/pull/3892)

## An elegant feature of a more civilized age.

Recently released in the Early Access build and coming soon to Mainline is support for `assembly shaders`, or `GLASM`, usually 
just called `ARB shaders`.
In days past there was no common language for the recently added shading units in GPUs, so the `OpenGL Architecture Review Board`
decided to create a proper standardised shading language to use, made considering the hardware limitations of the time. In broad
terms, this is assembly language to communicate with the GPU, so it is very hard to work with, and the set of debugging tools 
available is very limited.
In the present it has been mostly deprecated in favour of easier to work with, high level shading languages like GLSL or SPIR-V.
While this means faster results for the game developers due to less time spent looking at the code, it has the disadvantage of 
being far slower for emulators that have to constantly intercept, decode and recompile shaders on the fly. 
Luckily, and for no apparent sane reason, Nvidia decided to keep offering support for such an old feature, even on the latest 
OpenGL version.
You have the crazy driver team, but you also need a crazy and very patient developer to implement this in yuzu, so 
[Rodrigo](https://github.com/ReinUsesLisp) decides to take on this, with only [apitrace](https://apitrace.github.io/) as his 
debug tool.
With this initial assembly shading support in place, Nvidia OpenGL users can enjoy extremely fast shader compilation times. 
And due to being closer to the native hardware of the Nintendo Switch, we can also expect some precision fixes.
Now, it has some limitations too, to list some of them:
* This is an Nvidia only and OpenGL only feature, other vendors offer support for assembly shaders only for the feature sets of 
the old games that used to require it, and that’s very unlikely to change.
* Currently some games like `Luigi’s Mansion 3`, `Astral Chain` or `The Legend of Zelda: Link’s Awakening` experience bugs that 
have to be ironed out.
* There are architecture specific bugs, so a Pascal GPU may face different issues than a Turing or Kepler GPU.
[Pull Request #3964.](https://github.com/yuzu-emu/yuzu/pull/3964)

{{< single-title-imgs
    "You can see the progress from simple things… (Cave Story)"
    "./12.png"
    "./13.png"
  >}}

{{< single-title-imgs
    "To more complex tests (Fire Emblem Warriors)"
    "./14.png"
  >}}

## Future Projects

I can’t say much here, but there is something going on with both Project Viper and Project Hearn.

That’s all for now, folks! See you in the June article!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
