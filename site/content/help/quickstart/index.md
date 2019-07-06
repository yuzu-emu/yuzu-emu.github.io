---
title: Quickstart Guide
description: A guide designed to get you started with yuzu quickly.
---

# yuzu Quickstart Guide

{{< youtube RwojT7zPVhI >}}
&nbsp;

To start playing games, yuzu needs a couple of different files and directories from your switch in order to play them properly. To see if your Switch is hackable, visit https://damota.me/ssnc/checker and test your Switch's serial number. If your Switch is patched, you will be unable to complete the following steps.

This guide will help you copy all of your system files, games, updates, and DLC from your switch to your computer and organize them in a format yuzu understands. Make sure to place your Nintendo Switch into Airplane mode before starting this guide. This process should take about an hour to an hour and a half.

## Hardware Requirements
|   	|  CPU 	|   GPU	|   RAM	|
|-----	|---	|---	|---	|
|**Minimum (for 2D games)**|Intel Core i3-6100 / AMD Ryzen 5 2500X|Intel HD Graphics 530 / Nvidia GeForce GT 710|8GB|
|**Recommended (for 3D games)**|Intel Core i7-8700k|Nvidia GTX 1070 Ti|16GB|

<p style="color:cyan"><b><i>Currently on Windows, an Intel or Nvidia GPU is recommended due to AMD GPU driver issues.</b></i><p>

- **GPUs must support OpenGL 4.5 (or higher) & OpenGL Compatibility profile.**<br>
To find out if your GPU meets these requirements, visit https://opengl.gpuinfo.org and check your GPU details.<br>

Sample Image:

![GPUInfo](./gpu_info.png)

## Prerequisites
- A Nintendo Switch vulnerable to fusee-gelee (purchased before July 2018 will definitely work, purchased after has a lower probability of working)
- An SD card with at least ~29 GB of free space (an almost empty 32GB card will work)
- [TegraRCMGui](https://github.com/eliboa/TegraRcmGUI/releases)
- [hekate](https://github.com/CTCaer/hekate/releases/)
- [Kosmos](https://github.com/AtlasNX/Kosmos/releases/)
- [Lockpick] https://github.com/shchmue/Lockpick/releases
- [Lockpick_RCM] https://github.com/shchmue/Lockpick_RCM/releases
- [Copy Script](https://yuzu-emu.org/help/quickstart/yuzu_copy.bat)
- [HacDiskMount](https://files.sshnuke.net/HacDiskMount1055.zip)
- [microSD Card Reader](https://www.amazon.com/Anker-Portable-Reader-RS-MMC-Micro/dp/B006T9B6R2/ref=sr_1_4?s=pc&ie=UTF8&qid=1538875513&sr=1-4&keywords=micro+sd+card+reader) -- If your computer has one built-in, you can use that
- [RCM Jig](https://www.amazon.com/gp/product/B07FP3PC4R/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) -- we highly recommend this one, but you could use any of the methods outlined [here](https://xghostboyx.github.io/RCM-Guide/)

`%YUZU_DIR%` is the home directory for yuzu on your computer:
    - For Windows, this is `C:\Users\<YourUserName>\AppData\Roaming\yuzu`
    - For Linux, this is `~/.local/share/yuzu`

## Directions
1. Download this [keys template](https://yuzu-emu.org/help/quickstart/console.keys). It will help make sure you don't miss anything in the next steps.
2. We will now dump your BIS (Built-In Storage) keys for use in later decryption.
    - 2a. Run the TegraRCMGui installer you downloaded from the prerequisites, and after installation, start the program. 
    - 2b. In the `Settings` tab, click on `Install Driver` which will install the drivers necessary for your computer to interface with your Nintendo Switch. 
    - 2c. After the drivers have been installed, plug your Nintendo Switch into your computer.
    - 2d. Power off your Switch while it is still connected to your computer.
    - 2e. Insert your RCM jig into the right joy-con slot and then press VOL+ and Power at the same time. Nothing should happen. If the switch starts to turn on normally, go back to step 2c and try again.
    - 2f. You should see the Nintendo Switch icon in the lower left corner of TegraRCMGui flash green and state `RCM O.K.`
    - 2g. In the `Tools` tab of TegraRCMGui, click on `biskeydump (by rajkosto)`.
    - 2h. Your Switch will flash with a blue QRC code, and immediately your computer will prompt you to save a text document titled `BIS_keys.txt` Navigate to `C:\Users\$username$\AppData\Roaming\yuzu\keys` and save the file as `console.keys` Open the file and make sure you have copied:
        - `HWI`
        - `SBK`
        - `TSEC KEY`
        - `BIS KEY 0 (crypt)`
        - `BIS KEY 0 (tweak)`
        - `BIS KEY 1 (crypt)`
        - `BIS KEY 1 (tweak)`
        - `BIS KEY 2 (crypt)`
        - `BIS KEY 2 (tweak)`
        - `BIS KEY 3 (crypt)`
        - `BIS KEY 3 (tweak)`
        
3. We will now boot hekate to dump your system files:
    - 3a. In the `Payload` tab of TegraRCMGui, click on the folder icon and navigate to the Hekate file you downloaded earlier from the prerequisites.
    - 3b. Extract the `sept` folder from the Kosmos download and place the `sept` folder onto your SDcard.
    - 3c. Click on `Inject Payload` to inject the Hekate payload. 
    - 3d. You are now in hekate.
    - 3e. Select `Tools`, the wrench icon at the top of the screen, and select `Backup eMMC`. Underneath the `Full` section, click on `eMMC BOOT0 & BOOT1`. This may take a few seconds to load. After it is finished filling the progress bar it should say `Finished and verified!`. Beneath `Filepath:` you will see the location of the dump. 
    - 3f. Click `Close`, and select `eMMC RAW GPP`. This should take some time as your Switch's rawnand.bin is quite large. If the progress bar appears to go backwards at some points or turn green, do not worry as this is hekate verifying the data. This should take between 30-60 minutes depending on the quality of your SD card and the default verification setting. Please keep note of the location the output file is placed.
    - 3g. Power off your switch to avoid damage to your sd card, by selecting `Back` and then selecting `Power Off` and then eject your sd card. Then open your sd card on your computer. Find the `yuzu_copy.bat` file you downloaded earlier and copy it to the root of your sd card. Double-click it to start the copy. This should take between 10-20 minutes. If you see any errors listed referencing `pkg1` or `fuses.bin` please ignore these messages and continue.

# Move system and user to Desktop
4. Open `HacDiskMount` as Administrator (Right-click and select Run As Administrator) and go to `File > Open file` and select the `rawnand.bin`. If your SD card was not large enough to house the entire RAWNAND.bin, then `yuzu_copy.bat` will have combined the files and placed the full rawnand onto your desktop. If your SD card was large enough as to not divide the file, then follow the location indicated after the rawnand was dumped.
    - 4a. Double-click on the row marked `PRODINFO`. Under the dump to file area, click browse and pick somewhere easy to get to, like your Desktop. Dump the file as `PRODINFO.bin`. Click start and wait for it to complete. Then close the window. (NOTE: There is no need to enter any keys in the boxes at the top of the dialog at this moment.)
    - 4b. Select the row named `BCPKG2-1-Normal-Main`. Under the dump to file area, click browse and pick somewhere easy to get to, like your Desktop. Dump the file as `BCPKG2-1-Normal-Main.bin`. Click start and wait for it to complete. Again, no keys are necessary at this point. After it finishes, close the window.
    - 4c. Copy the `PRODINFO.bin` and `BCPKG2-1-Normal-Main.bin` files to the `%YUZU_DIR%/sysdata` dir.
    - 4d. Double-click on the row named `SYSTEM`. In the keys boxes, enter the `bis_key2_crypt` key in the crypt box and the `bis_key2_tweak` key in the tweak box (both acquired from the QR Code) and click test. If the text is red, double check your keys. If the text is blue, click on `Install` and wait until it says `Driver (ver XXXXX) installed, Service is running` where XXXXX is anything, then select `Y:` in the dropdown and click `Mount`. The application may become unresponsive for a moment. Press Windows-R and type `Y:` into the box and click OK and there will be a couple of folders with some named `Contents` and `save`. Copy all of these into `%YUZU_DIR%/nand/system`. After this is done, click `Unmount` and close the window.
    - 4e. Double-click on the row named `USER`. Enter the same key. Click `Mount`, and the tool may become unresponsive again. Once this mounts, open the new drive and copy the `Contents` and `save` folders to `%YUZU_DIR%/nand/user`. After, click `Unmount` and close the window and then the program.
5. (OPTIONAL) If you have games or game data stored on your sd card, copy the `Nintendo` folder of your sd card into `%YUZU_DIR%/sdmc`.

# Dump Prod.keys and Title.keys
6. We will now dump your `prod.keys` and `title.keys` for decryption of your game files. Before you return your SD card to your Switch, place the `Lockpick.nro` you downloaded earlier from the requisties into the `switch` folder of your SD card.
    - 6a. Reboot your Nintendo Switch into RCM mode, and reconnect it to your computer.
    - 6b. Run TegraRCMGui, and in the `Payload` tab of TegraRCMGui, click on the folder icon and navigate to the `Lockpick_RCM` file you downloaded earlier from the prerequisites.
    - 6c. There may be a message on your Switch to `Reboot to Sept...`, Press `Power` or `Vol +/-`
    - 6d. After Lockpick_RCM has finished deriving the keys, please make note of the location fo the dump. Default is: `sd:/switch/prod.keys`.
    - 6e. Reboot to RCM by pressing the `VOL +` key. 
    - 6f. Run TegraRCMGui, and in the `Playload` tab of TegraRCMGui, click on the folder icon and navigate to the `Hekate` file you downloaded earlier from the prerequisites. 
    - 6g. Click on `Launch`, and click on `CFW`. Your Switch will launch into `C`ustom `F`irm`W`are mode, and once your Switch has booted into the home menu, hold the `R` button and click on the Album application. This will launch the Homebrew Menu.
    - 6h. Either use the touchscreen or navigate using your controller, and choose `Lockpick`. After a few seconds, this will dump your `title.keys` file into the indicated folder.
    - 6i. With both `prod.keys` and `title.keys` dumped from your Nintendo Switch, place them in the `C:\Users\$username$\AppData\Roaming\yuzu\keys` directory, and when you next launch yuzu, you should see your games populate the browser. 

### If you need any help during this process or get a strange error during or while using yuzu, feel free to ask for help on the yuzu discord! Happy Emulating!

