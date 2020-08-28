+++
title = "Resolution Rescaler"
description = "How to use the resolution rescaler feature."
+++

<article class="message has-text-weight-semibold">
<div class="message-body">
<p>PSA: Due to some stability issues and not working on other GPU vendors (Intel/AMD), the feature has been removed and is currently absent in the latest Mainline/Early Access builds. Resolution scaling will return at a later date once the aforementioned issues are fixed by the development team.</p>
</div>
</article>

yuzu has a powerful resolution rescaler allowing for the upscaling of the game's docked and undocked render resolution.

### Accessing the feature

The options for the resolution rescaler can be accessed via the yuzu Configuration menu `(Emulation > Configure...)`, 
in the `Graphics` tab, under `Internal Resolution`:

{{< imgs
   "./scanner.png"
>}}

Clicking on the `Internal Resolution` dropdown list displays options for the upscaling factor, alongside its respective 
resolution that it will output for `(Undocked/Docked)`:

{{< imgs
   "./scanner+dropdown.png"
>}}

### Profile Scanner

Selecting the `Profile Scanner (Native)` option allows yuzu to continuously analyse the game's rendering methods in order 
to create its respective resolution rescaling profile. After the creation of the rescaling profile, the upscaling factor 
of choice can then be selected from the `Internal Resolution` dropdown list.

**NOTE:** For optimal results, it is recommended to completely traverse throughout all of the game while having the Profile 
Scanner enabled to complete the analysis of the game's rendering methods.

### Resolution rescaling profiles

Resolution rescaling profiles can be found under `%APPDATA%/yuzu/rescaling` on Windows and `~/.local/share/yuzu-emu/rescaling/` 
on Linux, or you can right-click the game on the UI and click on `Open Rescaling Profile`. Rescaling profiles are transferable 
for use in other computers.

{{< imgs
   "./gameUI.png"
>}}
