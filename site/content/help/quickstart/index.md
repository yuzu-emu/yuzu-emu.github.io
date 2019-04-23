---
title: Quickstart Guide
description: A guide designed to get you started with yuzu quickly.
---

# yuzu Quickstart Guide

To start playing games, yuzu needs a couple of different files and directories from your Switch in order to play them properly.

This guide will help you copy all of your system files, games, updates, and DLC from your console to your computer and organize them in a format yuzu understands. This process should take about half an hour.

## Prerequisites
- A Nintendo Switch vulnerable to fusee-gelee (Check at [this website](https://damota.me/ssnc/checker)
- An SD card with at least ~29 GB of free space (an nearly empty 32GB card will work)
- [TegraRCMGui](https://github.com/eliboa/TegraRcmGUI/releases)
- [biskeydump](http://switchtools.sshnuke.net/)
- [hekate](https://github.com/CTCaer/hekate/releases/)
- [Atmosphère](https://github.com/Atmosphere-NX/Atmosphere/releases)
- [Copy Script](https://yuzu-emu.org/help/quickstart/yuzu_copy.bat)
- [HacDiskMount](https://files.sshnuke.net/HacDiskMount1055.zip)
- [RCM Jig](https://switchjigs.com/) -- ships worldwide, but you could use any of the methods outlined [here](https://nh-server.github.io/switch-guide/user_guide/entering_rcm/)
- A cable which can transfer data from your Switch to your PC (most USB-A > USB-C, or USB-C to USB-C cables will work)

`%YUZU_DIR%` is the home directory for yuzu on your computer:
    - For Windows, this is `C:\Users\<YourUserName>\AppData\Roaming\yuzu`
    - For Linux, this is `~/.local/share/yuzu`
    If the website could not determine your console status, [follow this](https://nh-server.github.io/switch-guide/user_guide/sending_payload/) to determine if your console is vulnerable.

## Directions
1. Download this [keys template](https://yuzu-emu.org/help/quickstart/console.keys). It will help make sure you don't miss anything in the next steps.
2. We will now boot biskeydump on your switch to dump your BIS (Built-In Storage) keys.
    - 2a. Launch TegraRcmGUI.exe 
    - 2b. Within TegraRCMGui, navigate to the `Settings` tab, and select `Install Driver`
    - 2c. Put your Switch in RCM, then connect it to your PC 
    - 2d. Navigate to the `Payload` tab , then click on the folder icon near `Select Payload`. Navigate to your biskeydump .bin file and launch it.
    - 2e. You are now in biskeydump. If the background of the QR code is red, retry until it is blue. You can scan the QR code for convenience or copy the codes by typing them into your computer. Use [QR Code Reader by Kaspersky Lab](https://play.google.com/store/apps/details?id=com.kaspersky.qrscanner) on Android. Copy the keys template from step 1 into `%YUZU_DIR%/keys` and make sure it is still named `console.keys`. Open `console.keys` and replace the large `XXXX...XXX` strings with the corresponding key from biskeydump. You should have copied:
        - `tsec_key`
        - `bis_key_0_crypt`
        - `bis_key_0_tweak`
        - `bis_key_1_crypt`
        - `bis_key_1_tweak`
        - `bis_key_2_crypt`
        - `bis_key_2_tweak`
3. We will now boot hekate to dump your system files:
    - 3a. Launch TegraRCMGui.
    - 3b. Click on the folder icon near `Select Payload`. Navigate to your Hekate .bin file and launch it.
    - 3c. Extract the `sept` folder from Atmosphère's download and place the `sept` folder onto your SD card.
    - 3d. You are now in Hekate. Navigate using Volume+/- to go up/down, and Power to select. Select `Console info` and then `Print fuse info`. It will print out data on your screen, then say `Press Power to dump to SD card`. Press Power, and it should say `Done!` and `Press volume to go to menu`. Press a volume button and then select `Back` in the menu.
    - 3e. Select `Tools` and then select `Dump package1/2`. After it finishes, it should say `Done. Press any key` near the bottom. Press any key to return to the tools menu.
    - 3f. Select `Backup` and then select `Backup eMMC BOOT0/1`. This make take a few seconds. After it finished filling the progress bar it should say `Finished and verified! Press any key`. Press any key to return to the backup menu.
    - 3g. Finally, select `Backup eMMC Raw GPP`. This should take some time as your switch's nand is quite large. If the progress bar appears to go backwards at some points or turn green, this just is Hekate verifying the data. This should take between 40-80 minutes depending on the quality of your SD card.
    - 3h. Power off your console to avoid damage to your microSD card, by selecting `Back` and then selecting `Power Off` and ejecting your microSD card. Then open your microSD on your computer. Find the `yuzu_copy.bat` file you downloaded earlier and copy it to the root of your microSD. Double-click it to start the copy. This should take between 10-20 minutes. It should not have any errors listed. If it does, double check and make sure you ran steps 3a-3g correctly.

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
