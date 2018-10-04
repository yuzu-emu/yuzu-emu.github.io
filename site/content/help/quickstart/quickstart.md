---
title: Quickstart Guide
description: Quickstart guide.
---

# yuzu Quickstart Guide

To start playing games, yuzu needs a couple of different files and directoires from your switch in order to play them properly.

This guide will help you copy all of your system files, games, updates, and DLC from your switch to your computer and organize them in a format yuzu understands. This process should take about an hour to an hour and a half.

## Prerequisites
- A Nintendo Switch vulnerable to fusee-gelee
- An SD card with at least ~29 GB of free space (an almost empy 32GB card will work)
- [biskeydump](https://files.sshnuke.net/biskeydumpv6.zip)
- [hekate](https://github.com/CTCaer/hekate/releases/download/v3.2/hekate_ctcaer_3.2.bin)
- [Joiner Scripts](https://github.com/CTCaer/hekate/releases/download/v3.2/joiner_scripts_for_windows_linux_macos.zip)
- [HacDiskMount](https://files.sshnuke.net/HacDiskMount1055.zip)

You will also need to know how to run RCM payloads on your switch, which is detailed [here](https://gbatemp.net/threads/how-to-boot-hekate-ipl-using-ctcaers-hekate-mod.507619/), except in that guide when it says to use hekate's bin use the one required by that step in this guide.

`%YUZU_DIR%` is the home directory for yuzu on your computer:
    - For Windows, this is `C:\Users\<YourUserName>\AppData\Roaming\yuzu`
    - For Linux, this is `~/.local/share/yuzu`

## Directions
1. Download this [keys template](). It will help make sure you don't miss anything in the next steps.
2. Launch biskeydump on your switch using RCM (Follow the guide in prerequisites but replace the hekate bin with biskeydump.bin). If the background of the QR code is red, retry until it is blue. You can scan the QR code for convenience or copy the codes by typing them into your computer. Copy the keys template from step 1 into `%YUZU_DIR%/keys` and make sure it is still named `console.keys`. In it, replace the large `XXXX...XXX` strings with the corresponding key from biskeydump.
    You should have copied:
    - `tsec_key`
    - `bis_key_0_crypt`
    - `bis_key_0_tweak`
    - `bis_key_1_crypt`
    - `bis_key_1_tweak`
    - `bis_key_2_crypt`
    - `bis_key_2_tweak`
3. Launch hekate on your switch using RCM (Follow the guide in prerequisites exactly, using hekate's bin). 
    - 3a. Go to the tools menu and select `Tools > Dump package1`. Once that is complete select `Tools > Backup > Dump eMMC BOOT`. Then select `Console > Dump fuses`. Finally select `Tools > Backup > Dump eMMC GPP`. This last one will take 20-40 minutes depending on your sd card. Go get a latte and come back then.
    - 3b. Open your sd card on your computer side by side with `%YUZU_DIR%/sysdata`
    - 3c. Copy the following files from your sd card into `sysdata`:
        - `fuse.bin`
    - 3d. Open the folder called backup on your sd card and then open the first directory in that. Copy the following files from that directory into `sysdata`:
         - `BOOT0`
         - `pkg1/secmon.bin`
         - `pkg1/pkg1_decr.bin`
    - 3d. Copy all of the files starting with `rawnand.bin.` and ending in a two-digit number to a folder somewhere on your computer.
4. Select all of the rawnand.bin files from step 3d and drag them onto the joiner script downloaded earlier. This should take some time depending on you system, but you will be left with a single `rawnand.bin`. You can delete any of the files ending in two-digits at this point.
5. Open HacDiskMount and go to File > Open and select the rawnand.bin from step 4.
    - 5a. Double-click on the row marked `PRODINFO`. Under the export to file area, click browse and locate your yuzu sysdata dir (`%YUZU_DIR%/sysdata`). Save the file as `PRODINFO.bin`. Click start and wait for it to complete. Then close the dialog. (NOTE: There is no need to enter any keys in the boxes at the top of the dialog at this moment.)
    - 5b. Repeat step 5a with the row named `BCPKG2-1-Normal-Main`. Save it into the same directory with the name `BCPKG2-1-Normal-Main.bin`. Again, no keys are necessary at this point.
    - 5c. Double-click on the row named `SYSTEM`. In the keys boxes, enter `bis_key2_crypt` in the top one and `bis_key2_tweak` in the bottom one and click test. If the text is red, double check your keys. Click on `Install Driver` and then click `Mount`. The application may become unresponsive for a moment. In the new drive (default Z:), there will be a couple of folders with some named `Contents`, `save`, and `saveMeta`. Copy all of these into `%YUZU_DIR%/nand/system`.
    - 5d. Repeat step 5c with the row named `USER`. Enter the same key. This time you should not have to install the driver again. Once this mounts, copy the `Contents` and `save` folders to `%YUZU_DIR%/nand/user`.
6. (OPTIONAL) If you have games or game data stored on your sd card, copy the `Nintendo` folder of your sd card into `%YUZU_DIR%/sdmc`.
7. Open yuzu. You should see a dialog with a progress bar informing you that your keys are being derived. If you get a missing file error message, double check the files in your `sysdata` dir and try again. If there is no errors, a message informing you that it was successful will show and then yuzu will refresh to show you your games. 

### If you need any help during this process or get a strange error during or while using yuzu, feel free to ask for help on the yuzu discord! Happy Emulating!

## Notes
- Should you need to re-run this process (in the event of a firmware update or new games), you can simply update the sysdata files and then go to `Help > Reinitialize keys...`. 
