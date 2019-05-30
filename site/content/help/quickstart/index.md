---
title: Quickstart Guide
description: A guide designed to get you started with yuzu quickly.
---

# yuzu Quickstart Guide

To start playing games, yuzu needs a couple of different files and directories from your switch in order to play them properly.

This guide will help you copy all of your system files, games, updates, and DLC from your switch to your computer and organize them in a format yuzu understands. This process should take about an hour to an hour and a half.

## Hardware Requirements
|   	|  CPU 	|   GPU	|   RAM	|
|-----	|---	|---	|---	|
|**Minimum**|Intel Core i3-6100 / AMD Ryzen 5 2500X|Intel HD Graphics 530 / Nvidia GeForce GT 710|8GB|
|**Recommended**|Intel Core i7-8700k|Nvidia GTX 1070 Ti|16GB|

<p style="color:cyan"><b><i>Currently on Windows, an Intel or Nvidia GPU is recommended due to AMD GPU driver issues.</b></i><p>

- **GPUs must support OpenGL 4.5 (or higher) & OpenGL Compatibility profile.**<br>
To find out if your GPU meets these requirements, visit https://opengl.gpuinfo.org and check your GPU details.<br>

Sample Image:

![GPUInfo](./gpuinfo.png)

## Prerequisites
- A Nintendo Switch vulnerable to fusee-gelee (purchased before July 2018 will definitely work, purchased after has a lower probability of working)
- An SD card with at least ~29 GB of free space (an almost empty 32GB card will work)
- [biskeydump](http://switchtools.sshnuke.net/)
- [hekate](https://github.com/CTCaer/hekate/releases/)
- [Kosmos](https://github.com/AtlasNX/Kosmos/releases/)
- [Copy Script](https://yuzu-emu.org/help/quickstart/yuzu_copy.bat)
- [HacDiskMount](https://files.sshnuke.net/HacDiskMount1055.zip)
- [TegraRcmSmash](https://files.sshnuke.net/TegraRcmSmash1213.zip)
- [Zadig](https://zadig.akeo.ie/)
- [microSD Card Reader](https://www.amazon.com/Anker-Portable-Reader-RS-MMC-Micro/dp/B006T9B6R2/ref=sr_1_4?s=pc&ie=UTF8&qid=1538875513&sr=1-4&keywords=micro+sd+card+reader) -- If your computer has one built-in, you can use that
- [RCM Jig](https://www.amazon.com/gp/product/B07FP3PC4R/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) -- we highly recommend this one, but you could use any of the methods outlined [here](https://xghostboyx.github.io/RCM-Guide/)

`%YUZU_DIR%` is the home directory for yuzu on your computer:
    - For Windows, this is `C:\Users\<YourUserName>\AppData\Roaming\yuzu`
    - For Linux, this is `~/.local/share/yuzu`

## Directions
1. Download this [keys template](https://yuzu-emu.org/help/quickstart/console.keys). It will help make sure you don't miss anything in the next steps.
2. We will now boot biskeydump on your switch to dump your BIS (Built-In Storage) keys.
    - 2a. Extract the `TegraRcmSmash1213.zip` zip file you downloaded in the prerequisites. Extract the `biskeydump` file you downloaded earlier and but the put the `biskeydump.bin` in the `TegraRcmSmash1213/x64` folder. 
    - 2b. Open Zadig
    - 2c. Plug your switch into your computer.
    - 2d. Power off your switch while it is still connected to your computer.
    - 2e. Insert your RCM jig into the right joy-con slot and then press VOL+ and Power at the same time. Nothing should happen. If the switch starts to turn on normally, go back to step 2c and try again.
    - 2f. and choose APX in the device list. If APX does not show, go to the Options menu and check List all devices. If it still doesn't appear, double check the connection the between the switch and your computer.
    - 2g. For Driver type, cycle the arrows until it says `libusbK (v3.0.7.0)`. This is very important.
    - 2h. Hit install driver.
    - 2i. Close Zadig.
    - 2j. Drag and drop the bin file from step 1 of this guide onto `TegraRCMSmash.exe`. It should not stay open and your switch should now display some text on it. If it did not, make sure you have carefully followed all of the previous steps and try again.
    - 2k. You are now in biskeydump. If the background of the QR code is red, retry until it is blue. You can scan the QR code for convenience or copy the codes by typing them into your computer. Our testing has found that QRDroid doesn't work properly but [QR Code Reader by Kaspersky Lab](https://play.google.com/store/apps/details?id=com.kaspersky.qrscanner) does. Copy the keys template from step 1 into `%YUZU_DIR%/keys` and make sure it is still named `console.keys`. Open `console.keys` and replace the large `XXXX...XXX` strings with the corresponding key from biskeydump. You should have copied:
        - `tsec_key`
        - `bis_key_0_crypt`
        - `bis_key_0_tweak`
        - `bis_key_1_crypt`
        - `bis_key_1_tweak`
        - `bis_key_2_crypt`
        - `bis_key_2_tweak`
3. We will now boot hekate to dump your system files:
    - 3a. Extract the `TegraRcmSmash1213.zip` zip file you downloaded in the prerequisites. Put the `hekate_ctcaer_x.x.bin` (the version of this file is dependent on your firmware) file from the prerequisites in the `TegraRcmSmash1213/x64` folder. 
    - 3b. Open Zadig
    - 3c. Plug your switch into your computer.
    - 3d. Power off your switch while it is still connected to your computer.
    - 3e. Insert your RCM jig into the right joy-con slot and then press VOL+ and Power at the same time. Nothing should happen. If the switch starts to turn on normally, go back to step 3c and try again.
    - 3f. and choose APX in the device list. If APX does not show, go to the Options menu and check List all devices. If it still doesn't appear, double check the connection the between the switch and your computer.
    - 3g. For Driver type, cycle the arrows until it says `libusbK (v3.0.7.0)`. This is very important.
    - 3h. Hit install driver.
    - 3i. Close Zadig.
    - 3j. Extract the `sept` folder from the Kosmos download and place the `sept` folder onto your SDcard.
    - 3i. Drag and drop the bin file from step 1 of this guide onto the `TegraRCMSmash.exe` program. It should flash briefly and not stay open, and your switch should now display some text on it. If it did not, make sure you have carefully followed all of the previous steps and try again.
    - 3l. You are now in hekate. Navigate hekate using volume up and down to go up and down and power to select. Select `Console info` and then `Print fuse info`. It should print out some data onto your screen and then say `Press Power to dump to SD card`. Press power and it should now say `Done!` and `Press volume to go to menu`. Press a volume button and then select `back` in the menu.
    - 3m. Select `Tools` and then select `Dump package1/2`. After it finishes, it should say `Done. Press any key` near the bottom. Press any key to return to the tools menu.
    - 3n. Select `Backup` and then select `Backup eMMC BOOT0/1`. This make take a few seconds to load. After it finished filling the progress bar it should say `Finished and verified! Press any key`. Press any key to return to the backup menu.
    - 3o. Finally, select `Backup eMMC Raw GPP`. This should take some time as your switch's nand is quite large. If the progress bar appears to go backwards at some points or turn green, do not worry as this is hekate verifying the data. This should take between 40-80 minutes depending on the quality of your SD card.
    - 3p. Power off your switch to avoid damage to your sd card, by selecting `Back` and then selecting `Power Off` and then eject your sd card. Then open your sd card on your computer. Find the `yuzu_copy.bat` file you downloaded earlier and copy it to the root of your sd card. Double-click it to start the copy. This should take between 10-20 minutes. It should not have any errors listed. If it does, double check and make sure you ran steps 3a-3d correctly.

# Move system and user to Desktop
4. Open `HacDiskMount` as Administrator (Right-click and select Run As Administrator) and go to `File > Open file` and select the `rawnand.bin` that was copied to your Desktop in step 3e.
    - 4a. Double-click on the row marked `PRODINFO`. Under the dump to file area, click browse and pick somewhere easy to get to, like your Desktop. Dump the file as `PRODINFO.bin`. Click start and wait for it to complete. Then close the window. (NOTE: There is no need to enter any keys in the boxes at the top of the dialog at this moment.)
    - 4b. Select the row named `BCPKG2-1-Normal-Main`. Under the dump to file area, click browse and pick somewhere easy to get to, like your Desktop. Dump the file as `BCPKG2-1-Normal-Main.bin`. Click start and wait for it to complete. Again, no keys are necessary at this point. After it finishes, close the window.
    - 4c. Copy the `PRODINFO.bin` and `BCPKG2-1-Normal-Main.bin` files to the `%YUZU_DIR%/sysdata` dir.
    - 4d. Double-click on the row named `SYSTEM`. In the keys boxes, enter the `bis_key2_crypt` key in the crypt box and the `bis_key2_tweak` key in the tweak box (both aquired from the QR Code) and click test. If the text is red, double check your keys. If the text is blue, click on `Install` and wait until it says `Driver (ver XXXXX) installed, Service is running` where XXXXX is anything, then select `Y:` in the dropdown and click `Mount`. The application may become unresponsive for a moment. Press Windows-R and type `Y:` into the box and click OK and there will be a couple of folders with some named `Contents` and `save`. Copy all of these into `%YUZU_DIR%/nand/system`. After this is done, click `Unmount` and close the window.
    - 4e. Double-click on the row named `USER`. Enter the same key. Click `Mount`, and the tool may become unresponsive again. Once this mounts, open the new drive and copy the `Contents` and `save` folders to `%YUZU_DIR%/nand/user`. After, click `Unmount` and close the window and then the program.
5. (OPTIONAL) If you have games or game data stored on your sd card, copy the `Nintendo` folder of your sd card into `%YUZU_DIR%/sdmc`.
6. Open yuzu. You should see a dialog with a progress bar informing you that your keys are being derived. If you get a missing file error message, double check the files in your `sysdata` dir and try again. If there are no errors, a message informing you that it was successful will show and then yuzu will refresh to show you your games. 

### If you need any help during this process or get a strange error during or while using yuzu, feel free to ask for help on the yuzu discord! Happy Emulating!

## Notes
- Should you need to re-run this process (in the event of a firmware update or new games), you can simply update the sysdata files and then go to `Help > Reinitialize keys...`. 
