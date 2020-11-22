+++
date = "2020-11-22T16:00:00-03:00"
title = "New Feature Release - Texture Cache Rewrite"
author = "GoldenX86"
coauthor = "BSoD"
forum = 0
+++

Hi yuz-ers! We’re very excited to offer you one of the biggest code rewrites in yuzu’s history: The Texture Cache Rewrite! Now available to our Early Access members, continue reading to learn more.

<!--more-->

## But what is the TCR?

yuzu started as a fork of [Citra](https://github.com/citra-emu/citra), so Citra's texture cache (or rasterizer cache, as it was called at the time) was used in the early days of yuzu. However, this cache only supported OpenGL, so one of the first efforts when adding support for [Vulkan](https://yuzu-emu.org/entry/yuzu-vulkan/) was to make the code more generic, helping in GPU emulation.

When this was being worked on, we were still learning how the Nintendo Switch's GPU worked (we still are, but even more so then). Some design decisions taken at the time stuck with the codebase making things harder to change in the future. It was also easier to break with unrelated changes.

So out with the old, in with the new. The previous implementation was no longer sufficient, so [Rodrigo](https://github.com/ReinUsesLisp) started working on a complete rewrite from scratch. This includes but is not limited to:

- Cleaner code. No more virtual calls or shared pointers, this allows for easier maintenance in the future.
- Proper handling for texture swizzling.
- Some operations are now done in the GPU instead of in the CPU, improving performance.
- Control over when to destroy textures.
- Previously, textures were removed from the cache on CPU writes, but now they are flagged as dirty. This allows yuzu to cache already visited image views and render targets, saving time.
- Multiple textures can coexist in the same address now.
- Aliased images are now emulated through copies on demand.
- Rendering to compressed textures is properly emulated.
- 3D BC4 textures are emulated with RGBA8.
- Rendering to texture views of different compatible formats is emulated without copies.

{{< imgs
    "./lain.png| A very detailed explanation from our developer"
  >}}

## OK, but how does this help?

In short: it fixes a lot of graphical bugs, improves performance, and is not limited to any hardware configuration or driver in use. Improvements for everyone, once all parts are finished.

Before we talk about performance, here are just a few examples of the rendering fixes you can expect to see with this release:

{{< single-title-imgs
    ""
    "./splatoon_2_before_2.png"
    "./Splatoon_2_after_2.png"
  >}}

{{< single-title-imgs
    "Shadows in Splatoon 2 are now rendered correctly, finally allowing us to admire the beautiful cityscape"
    "./Splatoon_2_before.png"
    "./Splatoon_2_after.png"
  >}}

{{< single-title-imgs
    "Lighting and stencil shadow corruption is now fixed in Luigi's Mansion 3"
    "./LM3_before.png"
    "./LM3_After.png"
  >}}

{{< single-title-imgs
    ""
    "./AC_before_3.png"
    "./AC_after_3.png"
  >}}

{{< single-title-imgs
    "Astral Chain no longer exhibits black texture corruption"
    "./AC_Before_2.png"
    "./AC_After_2.png"
  >}}
 
{{< single-title-imgs
    ""
    "./acnh_OLD.png"
    "./acnh_NEW.png"
  >}}
 
{{< single-title-imgs
    "Depth of field issues are gone in Animal Crossing: New Horizons"
    "./acnh_OLD_2.png"
    "./acnh_NEW_2.png"
  >}}

{{< single-title-imgs
    "Xenoblade Chronicles 2 is free from vertex explosions on AMD Vulkan drivers"
    "./xc2b.png"
    "./xc2f.png"
  >}}
  
{{< imgs
    "./torna.mp4| Texture swapping & flickering issues are fixed in all Xenoblade Chronicles games"
  >}}
  
{{< single-title-imgs
    ""
    "./smashb.png"
    "./smashf.png"
  >}}  

{{< single-title-imgs
    "Jumbotrons now display correctly in Super Smash Bros. Ultimate. Here’s an example running in the radeonsi mesa OpenGL Linux drivers"
    "./smashb2.png"
    "./smashf2.png"
  >}}

{{< single-title-imgs
    "yuzu now has Multisample anti-aliasing (MSAA) support, as shown in SONIC FORCES here"
    "./sf1b.png"
    "./sf1f.png"
    "./sf2b.png"
    "./sf2f.png"
  >}}
  
{{< imgs
    "./rain.mp4| Slow rainfall fixed in The Legend of Zelda: Breath of the Wild (Requires High GPU accuracy)"
  >}}
  
{{< imgs
    "./botw.mp4| Rune transportation renders just like native hardware in The Legend of Zelda: Breath of the Wild"
  >}}
  
## But what about performance?

On top of the rendering improvements, many games show a 10-30% improvement to framerate, with greatly improved frametime stability as demonstrated below:
  
{{< imgs
    "./lm3.mp4| Luigi’s Mansion 3 received some huge leaps in rendering accuracy *and* performance, notice the frametime graph"
  >}}

{{< imgs
    "./smo.mp4| Super Mario Odyssey"
  >}}

{{< imgs
    "./link.mp4| The Legend of Zelda: Breath of the Wild"
  >}}

{{< imgs
    "./acnh.mp4| Animal Crossing: New Horizons"
  >}}

## Current limitations and future progress

Due to these changes, hardware lacking the `VK_EXT_robustness2` extension will not produce the optimal experience. In Windows, this includes AMD graphics cards older than Vega (Polaris and older series) and all Intel iGPUs to date. You can check the current support [here](http://vulkan.gpuinfo.org/listdevicescoverage.php?extension=VK_EXT_robustness2&platform=windows). Games requesting this extension on unsupported hardware may behave randomly or crash in rare instances. A fallback code path is being worked on. Make sure to be up to date with your drivers, as the GPU vendor may be able to add support in the future if the hardware allows it.

Originally, `Bindless Texture` support was expected to be added, but several difficulties emerged during development. One of the problems is the lack of native hardware support for ASTC texture decoding. If we used uncompressed textures, GPUs with less than 8GB of VRAM would not be able to load all the game assets, and if we recompressed them in another texture format to avoid this problem, image quality would degrade. True bindless texture support can be considered again in the future.

`Depth Stencil Blits` are not implemented on Vulkan for devices that don't offer native support (any AMD and Intel GPU).

Another complication that emerged during development is related to memory management. The idea was to release the Texture Cache Rewrite with what the team calls the `Texture Reaper`, a way to remove textures from VRAM that have not been used after some time. While this has been almost working in OpenGL during testing, managing to run Luigi's Mansion 3 in under 300MB of VRAM, Vulkan on the other hand received no benefit.

Vulkan faces one main problem: it fragments the memory when textures need to be mapped to *contiguous* video memory. There’s no tolerance for fragmentation, so freeing blocks will not help at all if the next texture doesn’t fit in the new empty space. This will require the development of a VRAM defragmentation routine, work that can take quite some time. So we can say that today marks the day `Project Texture Reaper` starts.

A feature that will be added shortly later will be `Accelerated Texture Decoding`, which will handle any texture format via `Compute Shaders`, even formats the GPU doesn’t support natively. [epicboy](https://github.com/ameerj) is working on the ASTC compute decoder.

The next project [Rodrigo](https://github.com/ReinUsesLisp) is working on is the `Buffer Cache Rewrite`. This work promises to solve more rendering issues (for example font rendering problems) and seriously improve performance, especially on memory bandwidth starved hardware like integrated GPUs.

And with that, our overview of the Texture Cache Rewrite is finished! Please report any bugs or problems you face with this new feature on our [Discord server](https://discord.gg/u77vRWY) or on our [Forums.](https://community.citra-emu.org/c/yuzu-support/)

{{< imgs
    "./ugg.png| HONK"
  >}}

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
