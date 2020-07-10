+++
date = "2020-06-07T03:15:00-03:00"
title = "Progress Report May 2020"
author = "GoldenX86"
forum = 264713
+++ 

Hello yuz-ers! How are you all doing?

In this monthly episode of "yuzu — Trials and Tribulations," we offer you: major rewrites, massive performance gains, 
stability improvements, bug fixes and graphical corrections.
*More after the commercial break.*
<!--more-->

## The worst kept secret

It has its own [article](https://yuzu-emu.org/entry/yuzu-prometheus/), and it had been guessed to hell and back before the official announcement.
`Project Prometheus` is a proper multithreaded emulation of the 4 CPU cores the Nintendo Switch offers.
This brings a massive performance boost to users with CPUs with 4 physical cores or more, but for this to happen, a lot of groundwork was needed.
Besides changes previously discussed in past reports, old external libraries (which yuzu needs to operate) needed to be updated,
and with that, some changes were needed for our Linux users. 

Thanks to [jroweboy’s](https://github.com/jroweboy) work, yuzu now uses [Conan](https://conan.io/),
helping the project [manage dependencies](https://github.com/yuzu-emu/yuzu/pull/3735), and letting Linux distributions use their native ones when possible.

With the previous VMM rewrite reducing memory use, the dependencies updated, and all the groundwork done, [Blinkhawk](https://github.com/FernandoS27) 
pressed the metaphorical nuclear launch button and [released Project Prometheus](https://github.com/yuzu-emu/yuzu/pull/3955).
yuzu can now use up to 6 or 7 CPU threads (in ideal conditions) 
compared to the previous 2 or 3. You should expect a performance boost in a lot of games, but still see some titles perform mostly the same due to being coded to only use a single thread.

Now, some clarifications are needed for this change. Multicore support can’t be merged into our [Mainline](https://github.com/yuzu-emu/yuzu-mainline) release for now due to incompatibilities between Multicore and the [Master](https://github.com/yuzu-emu/yuzu) branch of yuzu. Work is being done to resolve the conflicts, but please have patience.
Additionally, users with 2 cores, and either 2 or 4 threads, should not enable multicore as it will most likely result in a performance 
loss for them due to the lack of physical cores on their CPUs. Our [hardware recommendations](https://yuzu-emu.org/help/quickstart/#hardware) 
have been updated accordingly.

## Unreal Engine fixes

[Rodrigo](https://github.com/ReinUsesLisp) implemented [rendering more than one slice of 3D textures](https://github.com/yuzu-emu/yuzu/pull/4027), fixing the most glaring 
issue in Unreal Engine 4 games, known as “the Rainbow”. This also improves the previous implementation that was used in 
Xenoblade games.

{{< single-title-imgs
    "Your Excellency (OCTOPATH TRAVELER)"
    "./01.png"
    "./02.png"
  >}}

## Animal Crossing: New Horizons changes

[Rodrigo](https://github.com/ReinUsesLisp) fixed `Animal Crossing: New Horizons` terrain borders in Vulkan by implementing 
[constant attributes](https://github.com/yuzu-emu/yuzu/pull/3930). This is not a native extension, constant attributes have to be emulated in Vulkan as there is currently no official support for it.

{{< single-title-imgs
    "Beautiful beaches, now in Vulkan too (Animal Crossing: New Horizons)"
    "./04.png"
    "./05.png"
  >}}

[bunnei](https://github.com/bunnei) implemented [time zone support](https://github.com/yuzu-emu/yuzu/pull/3909), and Windows users will find that yuzu automatically detects their time zone. For those not on Windows (or want to spice up their life), you can manually change your system time via the "Custom RTC" option in the System settings. Previously, yuzu always assumed the user was located in the GMT+0 time zone.

[bunnei](https://github.com/bunnei) also improved the [saving mechanism](https://github.com/yuzu-emu/yuzu/pull/3665). Most games save their data in each user profile, but `Animal Crossing: New Horizons` does it via a “device” profile, so yuzu had to accommodate for that.

## Xenoblade specific fixes

Rendering bugs are abundant in Xenoblade games due to the complexity of their engine, and they are not trivial to solve. 
However, with the help of [gdkchan](https://github.com/gdkchan) and using this [Pull Request](https://github.com/Ryujinx/Ryujinx/pull/1277) from [Ryujinx](https://github.com/Ryujinx/Ryujinx), [Rodrigo](https://github.com/ReinUsesLisp) fixed one of the major rendering issues in `Xenoblade Chronicles 2` related to [front face flipping](https://github.com/yuzu-emu/yuzu/pull/3996). Additional [improvements to texture depth samplings](https://github.com/yuzu-emu/yuzu/pull/3991) resolved some rendering glitches, such as the clouds and start menu. Additionally, a better handling of [mipmap overlaps](https://github.com/yuzu-emu/yuzu/pull/4012) solved the constantly moving textures the games previously had. You can see the results below.

{{< single-title-imgs
    "Who said yuzu can’t run JRPGs? (Xenoblade Chronicles 2)"
    "./06.png"
    "./07.png"
  >}}

[Rodrigo](https://github.com/ReinUsesLisp) also optimized the performance in Xenoblade games, one method of which was [profiling the texture cache](https://github.com/yuzu-emu/yuzu/pull/3999) line by line and finding where it bottlenecks. By improving the code, you get a faster frametime, which translates 
to better performance.

Another way, and not an expected one, was to [log less information](https://github.com/yuzu-emu/yuzu/pull/4007). This avoids saturating the GPU thread, giving more room to 
actual processing and rendering.

## General performance improvements

[ogniK](https://github.com/ogniK5377) wrote a new [Macro JIT](https://github.com/yuzu-emu/yuzu/pull/4009) (Just-in-Time) to improve the performance of games that spend too 
much time in the macro interpreter. This should be a global performance boost independent of GPU vendor or API.

When [Rodrigo](https://github.com/ReinUsesLisp) improved yuzu’s ASTC decoding, he also added a rule to use native 
hardware decoding whenever possible. The Nvidia driver tells yuzu it supports ASTC decoding, but as it turns out, they actually use an internal software decoder that is much slower than our own implementation. [Ignoring the Nvidia driver-level software decoder](https://github.com/yuzu-emu/yuzu/pull/4014) produced a massive 
performance improvement when facing the dreaded ASTC texture format in games. It will still be immediate with Intel GPUs,
as no software optimizations will beat a dedicated hardware decoder.

## Bug fixes and improvements

Vulkan development is an ongoing process in yuzu, and it has stability problems as expected of a relatively new and complex feature. 
[Blinkhawk](https://github.com/FernandoS27) made a couple of [critical changes to Vulkan and Asynchronous GPU](https://github.com/yuzu-emu/yuzu/pull/3905), improving stability 
considerably.

Speaking of Vulkan, many 2D games had their sprites flipped or completely wrong, and once again, we currently lack the 
extension required to fix this. Therefore, [Rodrigo](https://github.com/ReinUsesLisp) implemented [support for `NV_viewport_swizzle`](https://github.com/yuzu-emu/yuzu/pull/3885).
This Nvidia-exclusive extension is the only way to solve this problem in a clean manner for now, but a universal method is being 
developed.

{{< single-title-imgs
    "Quack (Duck Game)"
    "./10.png"
    "./11.png"
  >}}

The updated libraries (that the migration to Conan brought us) also gave us a new version of the [cubeb](https://github.com/kinetiknz/cubeb) audio engine which adds 
support for 6 channel audio, allowing [ogniK](https://github.com/ogniK5377) to add [support for surround sound](https://github.com/yuzu-emu/yuzu/pull/3827).

Our good shark, [ogniK](https://github.com/ogniK5377), also fixed [keyboard emulation support](https://github.com/yuzu-emu/yuzu/pull/3926), so expect compatible games to have proper direct input from your keyboards now.

[Morph](https://github.com/Morph1984) implemented the missing support for [`R8G8UI` textures](https://github.com/yuzu-emu/yuzu/pull/3839), fixing both the performance problems and saving crashes that `The Walking Dead` games experienced.

{{< single-title-imgs
    "Thank you Toxa for the screenshot (The Walking Dead: The Final Season)"
    "./08.png"
  >}}

Although objectively a small issue, the mouse cursor didn't hide when running yuzu in full screen, causing a subjectively significant annoyance. Thankfully, [Tobi](https://github.com/FearlessTobi) implemented an [option to automatically hide the mouse](https://github.com/yuzu-emu/yuzu/pull/3892) once it has been inactive after some time.

## An elegant feature of a more civilized age

Recently released in the Early Access build, and coming soon to Mainline, is support for `assembly shaders` (`GLASM`), usually 
refered to as `ARB shaders`.
&nbsp;

A couple decades ago, there was no common language for the then newly added programmable shading units in GPUs, so the `OpenGL Architecture Review Board` decided to create a proper standardised shading language they called `GLASM`. In broader terms, this is an assembly language used to communicate with the GPU. This makes it very difficult to work with, and the difficulty is only exacerbated by the limited set of debugging tools available. Furthermore, the language was developed with the hardware limitations of the time in mind.
In the present, `GLASM` has been mostly deprecated in favour of easier-to-work-with, high-level shader representations like `GLSL` or `SPIR-V`.
While this means faster results for game developers due to less time spent looking at the code, it also has the disadvantage of being far slower for emulators that have to constantly intercept, decode, and recompile shaders on the fly. 
&nbsp;

In the beginning, support for `GLASM` started as just an experiment. Armed with [apitrace](https://apitrace.github.io/) as his only debug tool, [Rodrigo](https://github.com/ReinUsesLisp) set to his task. 
Luckily, and for no apparent sane reason, Nvidia still maintains support for such an old feature, even on the latest OpenGL versions. As such, support for `GLASM` soon became a reality and with this initial [assembly shading](https://github.com/yuzu-emu/yuzu/pull/3964) support in place, Nvidia OpenGL users can enjoy extremely fast shader compilation times.
&nbsp;

Due to being closer to the native hardware of the Nintendo Switch, we can also expect some precision fixes, with more coming in the future.
&nbsp;

Unfortunately, `GLASM` has some limitations. To list some of them:

- This is an Nvidia and OpenGL only feature — other vendors (AMD and Intel) only offer support for the specific assembly shaders that old games require and this is highly unlikely to change in the future.

- Currently, some games experience bugs that will need to be ironed out, such as: `Luigi’s Mansion 3`, `Astral Chain`, and `The Legend of Zelda: Link’s Awakening`.

- There are architecture specific bugs; a Pascal GPU may face different issues than a Turing or Kepler GPU.

{{< single-title-imgs
    "You can see the progress from simple things… (Cave Story)"
    "./12.png"
    "./13.png"
  >}}

{{< single-title-imgs
    "To more complex tests (Fire Emblem Warriors)"
    "./14.png"
  >}}
  
{{< youtube Oj5ntdszfyQ >}}

## Future projects

I can’t say much here, but there is something going on with both `Project Viper` and `Project Hearn`.

That’s all for now, folks! See you in the June article!
Special thanks to BSoD Gaming for the comparative `GLASM` video, and Toxa for providing some screenshots.

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
