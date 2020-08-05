+++
date = "2020-08-04T12:00:00-03:00"
title = "Progress Report July 2020"
author = "Morph & GoldenX86"
forum = 0
+++ 

Hey yuz-ers, what is up and welcome back to the… progress report. In this monthly report we offer you mayor rewrites to critical components, another sliced cut to slow shader compilation, tons of game fixes, and the promise of a very bright future ahead. Let’s get started!

<!--more-->

## Paper Mario: The Origami King fixes

To begin with, [Rodrigo](https://github.com/ReinUsesLisp) implemented several fixes to make `Paper Mario: The Origami King` playable:

- By [clamping the host’s compute shared memory limit](https://github.com/yuzu-emu/yuzu/pull/4359), the game doesn’t get stuck when trying to start rendering.

{{< imgs
    "./pmm.png| Now in A4 format! (Paper Mario: The Origami King)"
  >}}

- Some graphical artifacts affecting OpenGL can be fixed in GLASM by executing the shader instruction [BAR inside control flow](https://github.com/yuzu-emu/yuzu/pull/4360).

{{< single-title-imgs
    "That is one big sheet of paper! (Paper Mario: The Origami King)"
    "./pmcastlebug.png"
    "./pmcastlefix.png"
  >}}

- Lightning issues were fixed by [implementing the S2R.LaneId instruction in the shader decoder](https://github.com/yuzu-emu/yuzu/pull/4361).

{{< single-title-imgs
    "Lights, please! (Paper Mario: The Origami King)"
    "./pmintrobug.png"
    "./pmintrofix.png"
  >}}

## New GPU Virtual Memory Manager

[bunnei](https://github.com/bunnei) brings the big guns. The complete [rewrite of the `GPU Virtual Memory Manager`](https://github.com/yuzu-emu/yuzu/pull/4430) fixes *several* bugs in many games, with the two strongest examples being `Mario Kart 8 Deluxe` and `Super Smash Bros. Ultimate`. Now several graphical bugs are fixed in Mario Kart 8, including tracks that show invisible terrain or missing graphics. In Smash's case, there are no more vertex explosions now.

This rewrite also should reduce commited memory a bit, hopefully reducing the size of the required page file, and opens the possibility to implement new features in the future. We have to clarify that this doesn't fix the high VRAM usage in Vulkan.

{{< single-title-imgs
    "That's not what I meant when I said Anti-Gravity! (Mario Kart 8 Deluxe)"
    "./mk8bug.png"
    "./mk8fix.png"
  >}}

## Bug fixes and improvements

Accompanying the recent addition of 32 bit emulation support, [bunnei](https://github.com/bunnei) implemented [support for the creation of random and default Miis](https://github.com/yuzu-emu/yuzu/pull/4292). This does not include full support for custom ones for now.
With Miis in place games like `Mario Kart 8 Deluxe` or `New Super Mario Bros. U Deluxe` can now get past their menus and become playable. 

For this service to work, the user needs to dump the system archives from their Nintendo Switch.

{{< single-title-imgs
    "Ports, ports everywhere! (Mario Kart 8 Deluxe & New Super Mario Bros. U Deluxe)"
    "./mk8.png"
    "./smbud.png"
  >}}

This is tradition by now. [Morph](https://github.com/Morph1984) fixed another bug in `Kirby Star Allies`, this time by [implementing MirrorOnceClampOGL](https://github.com/yuzu-emu/yuzu/pull/4082). This is done by using the `GL_EXT_texture_mirror_clamp` extension on the OpenGL drivers that support it. The Intel driver doesn’t, so the older `GL_MIRROR_CLAMP_TO_EDGE` property is used.

Improvements to the texture cache by [implementing additional checks](https://github.com/yuzu-emu/yuzu/pull/4176) done by [Rodrigo](https://github.com/ReinUsesLisp) fixed crashing issues on Turing GPUs (RTX 2000 and GTX 1600 series) experienced in `The Legend of Zelda: Breath of the Wild`. Now you can load saves normally, so, get moving, save the princess!

Our GLASM users experienced black textures on top of the vegetation in `The Legend of Zelda: Link’s Awakening`. By using the extensions [`NV_shader_buffer_load` and `NV_shader_buffer_store`](https://github.com/yuzu-emu/yuzu/pull/4168), [Rodrigo](https://github.com/ReinUsesLisp) solved this issue for good.

{{< single-title-imgs
    "Beware of the dark weeds, legend says rupoors lay there (The Legend of Zelda: Link's Awakening)"
    "./zlabug.png"
    "./zlafix.png"
  >}}

We talked about this in the previous June progress report. [Rodrigo](https://github.com/ReinUsesLisp) finished [implementing the support for `VK_EXT_extended_dynamic_state`](https://github.com/yuzu-emu/yuzu/pull/4150), fixing the “triangle glitch” that affects `Super Mario Odyssey` on all Vulkan drivers that support this new extension.

Thanks to help from [gdkchan](https://github.com/gdkchan) and [Blinkhawk](https://github.com/FernandoS27), [Rodrigo](https://github.com/ReinUsesLisp) added support for [copying 2D arrays of pixels into 3D voxels](https://github.com/yuzu-emu/yuzu/pull/4242), fixing rendering bugs in games like `LEGO Marvel Super Heroes 2` and possibly some others.

[toastUnlimited](https://github.com/lat9nq) along with [Rodrigo](https://github.com/ReinUsesLisp) started preliminary work to fix crashes only happening in recent Nvidia Linux Vulkan drivers. Through trial and error, it was found that [increasing the Vulkan device allocable size](https://github.com/yuzu-emu/yuzu/pull/4283) mititagates this issue on most GPUs, but some still remain affected for now.

[epicboy](https://github.com/ameerj) is working on [implementing support for Gamecube adpaters](https://github.com/yuzu-emu/yuzu/pull/4137), allowing players to use original Gamecube gamepads! Veteran Smash players will surely enjoy it.

`Project Prometheus` introduced so many changes, that we are still working on adding settings or features that used to work with the old single core method. [ogniK](https://github.com/ogniK5377) [improved the audio timing](https://github.com/yuzu-emu/yuzu/pull/4219), fixing audio bugs that started happening after the introduction of the new multicore and single core emulation methods.

Since its introduction, enabling multicore was the only way to reach stable gameplay on Linux systems, the single core option would lead to a crash on every game. Thanks to [comex's report](https://github.com/yuzu-emu/yuzu/issues/4424), [Lioncache](https://github.com/lioncash) fixed it by [using the return value of Lock() in the nvflinger surface compositor](https://github.com/yuzu-emu/yuzu/pull/4426). Thanks to this fix, games that are not yet stable with multicore like `Luigi’s Mansion 3` can now be safely played in the Tux OS.

## Project Kobra

Six months ago, [Morph](https://github.com/Morph1984) proposed an [implementation of a batch installer to yuzu](https://github.com/yuzu-emu/yuzu/pull/3385), which allowed users to install many updates and DLCs at the same time. This was a boon for many users, but it remained in early access for a long time due to several issues and anticipation of a new VFS implementation dubbed `Project Viper`. With renewed hope and motivation from the shark [ogniK](https://github.com/ogniK5377), [Morph](https://github.com/Morph1984) went on to fix all of its remaining issues, allowing it to finally be merged into the master/mainline branch of yuzu.

{{< imgs
    "./batch_install.png| I can finally install all the DLCs of Super Smash Bros. Ultimate!"
  >}}

However, as `Project Viper` has been delayed until further notice, [Morph](https://github.com/Morph1984) took it upon himself to fix the list of Virtual File System (VFS) bugs that had been plaguing yuzu.

It was well known that yuzu has problems with installing Updates and DLC into the NAND and reading them correctly. Due to the inability to easily remove individual game files, users had to delete all their installed game files just to ensure that their new Update or DLC got detected properly.

{{< imgs
    "./uninstall_before_fix.png| Not again, my precious write cycles! *sobs*"
  >}}

Upon closer inspection of the inner workings of the VFS, [Morph](https://github.com/Morph1984) found that the previous Updates or DLC were not removed when a newer one was being installed, leading to issues with the detection of these files in yuzu. He solved this by [properly removing the previous update or DLC if it exists on installation](https://github.com/yuzu-emu/yuzu/pull/4249). In addition to this, he also [corrected a small oversight in the way yuzu stores autogenerated titlekeys](https://github.com/yuzu-emu/yuzu/pull/4250). Now, invalid titlekeys will no longer be written into the `title.keys_autogenerated` file, ensuring that only valid ones are written. If your game, update or DLC is not being detected by yuzu, ensure you have the latest key files dumped from your switch, as newer game updates and DLC require newer firmware keys to decrypt.
With these fixes in place, you yuz-ers no longer have to delete all installed game files to install a newer update or DLC as this properly overwrites the previously installed one.

Next, he looked into fixing one of oldest and well known VFS bugs - the `Luigi's Mansion 3` autosave issue. Every time an autosave was triggered, the game would softlock. This has also affected other games such as `KATANA KAMI: A Way of the Samurai Story` and `Okami HD`. After digging into the VFS code, it was found that files were not closed prior to being renamed or moved, leading to a [simple fix](https://github.com/yuzu-emu/yuzu/pull/4265) for any games that use this function.

Keeping the ball rolling, he went on to find out why `Diablo III: Eternal Collection` was not able to get past the EULA screen and thus needing a save file to bypass it. It turned out that an [old PR](https://github.com/yuzu-emu/yuzu/pull/1012) was causing folders instead of files to be created. After this discovery, the PR was immediately removed from mainline/early access and closed as it was no longer needed.

{{< imgs
    "./diablo3fixed.png| EULAs can't stop me! (Diablo III)"
  >}}

Looking for the next meal, Morph took a bite at the saving issues of the Bioshock Trilogy. These games were unable to save due to checking for free space prior to saving. This was fixed by [ensuring that the NAND partition sizes were set to their defaults](https://github.com/yuzu-emu/yuzu/pull/4282) and are read correctly by the relevant filesystem service commands.

{{< single-title-imgs
    "Game saves are for the weak! (Bioshock Remastered)"
    "./bioshock_out_of_space.png"
    "./bioshock_saved.png"
  >}}

After this little treat, the Kirby embarked on an adventure to fix the last remaining issues with the VFS. After 3 days of debugging the Pokemon Sword and Shield RomFS weather bug, he discovered that these games contained a 0 byte file called `global_setting.bin` which caused the file right after it called `weather_data.bin` to be skipped entirely. And you may have guessed by now - this file contains all the data for weather and without it, no weather can be generated within the game! This eureka moment led to an extremely simple fix which [accomodates for 0 byte files during RomFS building](https://github.com/yuzu-emu/yuzu/pull/4309).

{{< single-title-imgs
    " Let it snow, let it snow, let it snow! (Pokemon Sword and Shield)"
    "./swsh_weather.png"
    "./swsh_weather2.png"
  >}}

His adventures have led him to save ~~Zelda~~ Link from the eternal softlocks after awakening from his slumber, seems like Ganon knew of their plans after all. Kirby travelled to the shattered Kingdom of Hyrule and foiled his plans by [creating the save subdirectories](https://github.com/yuzu-emu/yuzu/pull/4345) for Link to save his progress. Finally, he can save the princess without wasting his time eternally stuck from his slumber.

Hearing stories of Nook Inc's deserted islands, Kirby flew off to visit some of them, only to be met by a barrier preventing access to the other realms. He managed to bypass the barrier by [stubbing two filesystem service commands](https://github.com/yuzu-emu/yuzu/pull/4456) which were blocking access to the islands. Now, he can view all the latest treats added in the islands since the last update.

Wrapping up his adventures, he went and brought peace to Dreamland once again by adding an option to [remove individual NAND or SDMC installed games, updates, and DLCs](https://github.com/yuzu-emu/yuzu/pull/4372) and fixing the last remaining issues with the game list, such as [opening the Save/Mod Data Location of installed titles](https://github.com/yuzu-emu/yuzu/pull/4381), [game list subdirectory scanning](https://github.com/yuzu-emu/yuzu/pull/4450), and [game list metadata detection](https://github.com/yuzu-emu/yuzu/pull/4448).

{{< imgs
    "./title_removal.png| Removal of installed game files has never been easier!"
  >}}

## The old guard

When yuzu started using [Conan](https://conan.io/), most of yuzu's dependencies were migrated to it. Unfortunately, one of them, Opus, used for audio decoding, had bad settings in the Conan version, forcing the use of the `AVX/AVX2 instruction set` even on old CPUs that don’t support it, like old AMD Phenom CPUs or any Intel Pentium, Celeron or Atom CPU. This caused some games to crash when processing audio on the affected CPUs. [ogniK](https://github.com/ogniK5377) fixed this by [replacing our included Opus version](https://github.com/yuzu-emu/yuzu/pull/4218).

[Merry](https://github.com/MerryMage) finished the preliminary work needed to [fix a performance regression affecting CPUs that lack the `FMA instruction set`](https://github.com/yuzu-emu/yuzu/pull/4294). This includes AMD Phenom series or older, Intel generation 3 Core i series or older, and all Pentium, Celeron and Atom CPUs. For now this shows up as a debug CPU configuration in yuzu’s settings. We really recommend our users to not play with these settings as altering them will only produce a worse experience.

## UI changes

A very requested feature from our users. [toastUnlimited](https://github.com/lat9nq) raised to the challenge and decided to [add per-game configurations](https://github.com/yuzu-emu/yuzu/pull/4098) to yuzu! For now it lacks support for input settings, but this will be added in the future. To access this new feature just right click a game in yuzu's game list and select properties.

{{< imgs
    "./settings.png| No need to remember specific settings before booting a game!"
  >}}

[Morph](https://github.com/Morph1984) added [a new theme for our anti-light themes users](https://github.com/yuzu-emu/yuzu/pull/4377), `Midnight Blue`! You can access it in Configuration > General > UI.

{{< imgs
    "./midnight.png| Oooh, Spooky"
  >}}

Fixing small annoyances is something that is overlooked most of the time, but very appreciated when done. [Tobi](https://github.com/FearlessTobi) [removed the need to confirm which Switch profile to use when there is only a single one created](https://github.com/yuzu-emu/yuzu/pull/4297). Thank you so much Tobi.

{{< imgs
    "./profile.png| Bye little fella!"
  >}}

## The Sharkman, episode one

[ogniK](https://github.com/ogniK5377) has been working for a long time on a [major audio rewrite](https://github.com/yuzu-emu/yuzu/pull/4310) for yuzu. To avoid a very long explanation of the complexity of Nintendo’s audio renderer systems, we recommend our more tech savvy readers to read the Pull Request’s description where you will find more detailed information.
 
This is “Part 1”, several fixes and more complex (or annoying to code) features will be finished at a later date. Right now the results speak for themselves. Tons of games with broken audio of any kind - like missing sound effects, fading music, mixing errors, crackling or even no sound at all - are either running perfectly or are starting to sound a lot more like the native hardware. Some bugs are to be expected for now, for example, `Shovel Knight` and `Fast RMX` experience choppy audio, and the voices in `Animal Crossing: New Horizons` will play from only one ear.

You would think that this is enough, but [ogniK](https://github.com/ogniK5377) has another fantastic gift for us. Up until now, when several new shaders had to be built during gameplay, they could only be done one at a time. Thanks to some good help provided by [Exzap](https://github.com/Exzap), Cemu's lead developer, [yuzu can now decode shaders asynchronously!](https://github.com/yuzu-emu/yuzu/pull/4273) This means that, depending of the amount of threads your CPU has, the shader compilation will happen on several threads at the same time, cutting down shader build time significantly, especially if you can also use assembly shaders.

To top it off, [epicboy](https://github.com/ameerj) added [support for Vulkan](https://github.com/yuzu-emu/yuzu/pull/4443)!

{{< imgs
    "./async.mp4| Thanks to BSoD Gaming for the video comparison (Super Smash Bros. Ultimate)"
  >}}
  
Due to limitations in the AMD Windows OpenGL driver, we recommend that you avoid using asynchronous shaders in OpenGL if you have a Radeon GPU, as it will only produce frame skipping and lead to a very poor gameplay experience. The Linux OpenGL drivers are unnafected by this, as well as any of the Vulkan drivers.

The number of threads used for asynchronous shader compilation are as follows, along with example CPUs to illustrate the number of CPU threads:

| CPU Threads | Shader Threads | Example CPUs |
| :-----------: | :--------------: | ------------ |
| 1 - 7 | 1 | R3-1200, i3-6100 |
| 8 - 11 | 2 | R5-3300X, i7-7700K |
| 12 - 15 | 3 | R5-3600, i7-8700K |
| 16+ | 4 | R7-3700X, i7-10700K |

## Future projects

[Rodrigo](https://github.com/ReinUsesLisp) started rewriting the `Texture Cache`, once the work is finished, this should affect both OpenGL and Vulkan positively, bringing bug fixes, better performance, and a better experience in Vulkan in particular.

There are also some other yet undisclosed but very impressive projects that we will reveal soon enough. Stay tuned!

That’s all for now, folks! Until the August progress report!

{{< imgs
    "./starallies.png"
  >}}

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
