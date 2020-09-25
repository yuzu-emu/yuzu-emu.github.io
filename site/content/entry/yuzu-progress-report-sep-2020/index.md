+++
date = "2020-09-30T12:00:00-03:00"
title = "Progress Report September 2020"
author = "Honghoa"
coauthor = "GoldenX86"
forum = 0
+++ 

Greetings Yuz-ers! Welcome to September's progress report. This month we offer you more input fixes and additions, small Vulkan improvements, and the initial ground work needed to get Super Mario 3D All-Stars playable.

<!--more-->

## An emulator inside an emulator

`Super Mario 3D All-Stars` is a special case, in several aspects. For starters the game is just a container for several other binary executables (known as `Program NCAs`), each one with their own Title ID. Step one to get this game to boot is to handle [a particular case like this](https://github.com/yuzu-emu/yuzu/pull/4675), a job [Morph](https://github.com/Morph1984) did. 

Good, finished, right? Wrong. Turns out, handling several integrated programs with different title IDs will make XCI game dumps conflict, as they include game updates. [Morph](https://github.com/Morph1984) also [had to add checks for cases like this.](https://github.com/yuzu-emu/yuzu/pull/4710)

Next step, unimplemented functions. [Morph](https://github.com/Morph1984) did a [partial implementation of `LoadOpenContext`](https://github.com/yuzu-emu/yuzu/pull/4678), a function that several collections games use. Some examples are `Clubhouse Games: 51 Worldwide Classics`, `Grandia HD Collection`, `XCOM 2 Collection`, `Baldur's Gate I and II`, `Dr Kawashima's Brain Training`. and of course `Super Mario 3D All-Stars`.

Similarly, [`GetPreviousProgramIndex` needed to be stubbed](https://github.com/yuzu-emu/yuzu/pull/4676). The end result is getting the game-selector/menu working.

{{< imgs
    "./menu.png| For now, just the menu and soundtrack sections (Super Mario 3D All-Stars)"
  >}}
  
## Nvidia specific fixes

Recent Nvidia Geforce drivers introduced a performance regression, important enough that we had to recommend our users to stay on older driver versions until we could figure out what was going on. Turns out, the newer drivers don't seem to like how Qt handles VSync, so [Rodrigo](https://github.com/ReinUsesLisp) fixed it by [calling `SwapBuffers` from the emulation thread](https://github.com/yuzu-emu/yuzu/pull/4692). This change means that Nvidia users are free to use the latest driver version without fearing low framerate.

Just in time for Ampere's release, eh!



## Bug fixes and improvements



## Future projects



&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
