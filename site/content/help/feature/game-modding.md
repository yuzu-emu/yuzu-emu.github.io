+++
title = "Game Modding"
description = "Game modding features"
+++

# Game Modding

Yuzu has a powerful modding framework allowing for multiple formats of patches, flexibility in distribution, and easy organization and change.

### Directory Structure

The following is an example of a mod in yuzu.<br>
Each one is its own directory within the Mod Data dir that can be opened by right-clicking on the game in yuzu (alternatively `%YUZU_DIR%/load/<title_id>`)
```
mod_directory
  - exefs
  - romfs
  - romfs_ext
```

#### ExeFS
The ExeFS dir contains patches for the game's executable(s). 
These types of mods typically alter game behavior or logic.
Currently this translates to two types of patches: `IPS` and `IPSwitch`.

To use an `IPS` patch, create a file with the NSO build ID as the name and `.ips` as the extension and put it in the ExeFS dir.
More details on the `IPS` format can be found on [ZeroSoft](https://zerosoft.zophar.net/ips.php).

For `IPSwitch`, the filename can be whatever you want as long as the extension is `.pchtxt` and it contains a NSO build ID.
More details on the `IPSwitch` format can be found on it's [GitHub repo](https://github.com/3096/ipswitch).

#### RomFS
The RomFS dir contains replacements for the game's assets and general files.
These types of mods typically alter a game's textures, text, fonts, sounds, or other graphical assets.
If this directory is not empty, yuzu will combine the contents of it with the base game with files from this directory taking precedence over the base.
This technique is called LayeredFS.
```
It is important to note that for this to work properly,
the directory structure of the game has to be mirrored in this dir.
```

It is much easier to get started with a RomFS mod than an ExeFS mod.
To dump the game's RomFS, right-click on the game and select `Dump RomFS`.
Selecting full will extract everything while skeleton will only create the directories.
The output of this will be opened after the dump and can be found at `%YUZU_DIR%/dump/<title id>`.

#### RomFS Extension (romfs_ext)
The RomFS Extension dir contains patches and stubs for romfs files.
This allows modders to delete files within the romfs if a file of the same name but the extension `.stub` is found at the same directory within `romfs_ext`.
Similarly, if a file with the same name but with extension `.ips` is found at the same directory within `romfs_ext`, the base game file will be patched with it.

### Example 
For example, let's examine Splatoon 2, a popular game for modding.

Since Splatoon 2's title id is `01003BC0000A0000`, all of our mods for this game will go in `%YUZU_DIR%/load/01003BC0000A0000`. 

Say we have two mods to play with, Mod X and Mod Y.
Therefore, we would make two directories in the `01003BC0000A0000` folder, one called "Mod X" and one called "Mod Y".

Within the "Mod X" folder, there are the `exefs`, `romfs`, and `romfs_ext` directories provided by the author.
It is okay to omit one (or more) of them if it is empty. Additionally, if the mod folder is empty yuzu will ignore it.

### Conclusion
If you are a modder looking to distribute mods for yuzu and have another question or found part of this guide confusing, feel free to come ask in out discord. 

If you are a user trying to install a mod for yuzu and it seems like a critical piece of the puzzle is missing, try asking the mod author for help. Otherwise, feel free to come ask in the discord.
