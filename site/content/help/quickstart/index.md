---
title: Quickstart Guide
description: A guide designed to get you started with yuzu quickly.
---

{{< youtube j0fXerrGjF4 >}}

<h1 id="hardware"><br></h1>

# Hardware Requirements

|   	|  CPU 	|  GPU	|  RAM	|
|-------|-------|-------|-------|
|**Minimum (for 2D games)**|Intel Core i3-6100 / AMD Ryzen 3 1200|Intel HD Graphics 520 / NVIDIA GeForce GT 1030 / AMD Radeon R7 240|8GB|
|**Recommended (for 3D games)**|Intel Core i5-8600K / AMD Ryzen 5 3600|NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 470 8GB|16GB| 

- Our recommended specifications don't guarantee perfect performance in most games, but rather strive to provide a cost effective recommendation while still considering performance.

- **GPUs must support OpenGL 4.5 (or higher) & OpenGL Compatibility profile, or Vulkan 1.1.**<br>
To find out if your GPU meets these requirements, visit https://opengl.gpuinfo.org or https://vulkan.gpuinfo.org/ and check your GPU details.<br>

Sample Image:

![GPUInfo](./gpu_info.png)

# yuzu Quickstart Guide

To start playing games, yuzu needs a couple of system files and folders from your switch in order to play them properly.
To check if your Switch is hackable, visit https://damota.me/ssnc/checker and test your Switch's serial number.

    - If your Switch is patched, you will be unable to complete the following steps.
    - The Switch v2 (Mariko) and the Switch Lite are both patched and you will not be able to complete the following steps.

This guide will help you copy all your system files, games, updates, and DLC from your switch to your computer and organize them in a format yuzu understands.
This process should take about 60 to 90 minutes.

**IMPORTANT: <br>
Make sure to place your Nintendo Switch into Airplane Mode before starting this guide.** <br>
`System Settings -> Airplane Mode -> Airplane Mode "ON"`

# Prerequisites

- A Nintendo Switch vulnerable to the fusée gelée RCM exploit -- Visit https://damota.me/ssnc/checker and test your Switch's serial number
- An SD card with at least 30 GB of free space (an almost empty 32GB card will work)
- A USB-C to USB-A or USB-C to USB-C Cable to connect your Switch to your computer
- [TegraRcmGUI](https://github.com/eliboa/TegraRcmGUI/releases) -- Download the TegraRcmGUI installer
- [Hekate](https://github.com/CTCaer/hekate/releases) -- Download the `hekate` zip file
- [Atmosphere](https://github.com/Atmosphere-NX/Atmosphere/releases) -- Download both the `atmosphere` zip file and `fusee-primary.bin`
- [Lockpick_RCM](https://github.com/shchmue/Lockpick_RCM/releases) -- Download `Lockpick_RCM.bin`
- [nxdumptool](https://github.com/DarkMatterCore/nxdumptool/releases) -- Download `nxdumptool.nro`
- [Copy Script](https://yuzu-emu.org/help/quickstart/yuzu_copy.bat)
- [HacDiskMount](https://files.sshnuke.net/HacDiskMount1055.zip)
- [microSD Card Reader](https://www.amazon.com/dp/B006T9B6R2) -- If your computer has one built-in, you can use that
- [RCM Jig](https://www.amazon.com/dp/B07J9JJRRG) <-- We highly recommend one like this, but you could use any of the methods outlined [here](https://noirscape.github.io/RCM-Guide/)

`%YUZU_DIR%` is the home directory for yuzu on your computer:

    - For Windows, this is '%APPDATA%\yuzu' or 'C:\Users\{username}\AppData\Roaming\yuzu'
    - For Linux, this is '~/.local/share/yuzu'


# Preparing the microSD Card

1. We will now prepare the microSD card.
    - 1a. Extract the contents of the `atmosphere` and `hekate` zip files into the root of your SD card.
    - 1b. Place the `fusee-primary.bin` and `Lockpick_RCM.bin` files into the `bootloader/payloads` folder of the SD card.
    - 1c. Create a folder named `nxdumptool` within the `switch` folder of your SD card and place the `nxdumptool.nro` file inside it.
    - 1d. Once done, eject the SD card and place it into your Nintendo Switch.

{{< imgs
    "./sd_template.png|Your SD card should look like this."
>}}

# Dumping BIS Keys

2. We will now dump your BIS (Built-In Storage) keys for use in later decryption.
    - 2a. Run the TegraRcmGUI installer you downloaded from the prerequisites, and after installation, start the program. 
    - 2b. In the `Settings` tab, click on `Install Driver` which will install the drivers necessary for your computer to interface with your Nintendo Switch. 
    - 2c. After the drivers have been installed, plug your Nintendo Switch into your computer.
    - 2d. Power off your Switch while it is still connected to your computer.
    - 2e. Insert your RCM jig into the right joy-con slot, make sure it is seated securely at the base, and then press VOL+ and Power buttons at the same time. Nothing should happen on your Switch; if the switch starts to turn on normally, go back to the beginning of step 2d and try again.
    - 2f. In the program TegraRcmGUI you should see the Nintendo Switch icon in the lower left corner flash green and state `RCM O.K.`
    - 2g. In the `Tools` tab of TegraRcmGUI, click on `biskeydump (by rajkosto)`.
    - 2h. Your Switch will briefly flash with a blue QR code (you may or may not see this) and your computer will prompt you to save a text document titled `BIS_keys.txt`. Navigate to `%YUZU_DIR%/keys` and save the file as `console.keys`. Open the file to make sure you have the following key entries.
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

<h1 id="keys"><br></h1>

# Dumping Prod.keys and Title.keys

3. We will now dump your `prod.keys` and `title.keys` for decryption of your game files.
    - 3a. Boot your Nintendo Switch into RCM mode (steps 2d to 2f) and make sure it is connected to your computer.
    - 3b. Extract the `hekate.bin` file from the `hekate` zip file you downloaded from the prerequisites.
    - 3c. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate.bin` file you extracted earlier.
    - 3d. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 3e. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 3f. Tap on `Lockpick_RCM.bin` in the list of payloads.
    - 3g. After Lockpick_RCM has successfully booted, press the power button to select `Dump from SysNAND`. 
    - 3h. It will automatically boot to sept and start deriving the keys. Wait for it to finish deriving the keys.
    - 3i. After Lockpick_RCM has finished deriving the keys, please make note of the location of the key files. Default is: `sd:/switch/prod.keys` and `sd:/switch/title.keys`.
    - 3j. Press any key to return to the menu, then navigate with the VOL+/VOL- buttons to highlight and select `Power Off` by pressing the power button.
    - 3h. Once your Switch is powered off, remove the SD card.
    - 3i. Insert your SD card into your computer and copy both `prod.keys` and `title.keys` to the `%YUZU_DIR%/keys` directory.

# Backing up System Files

4. We will now boot Hekate to dump your system files:
    - 4a. Boot your Nintendo Switch into RCM mode (steps 2d to 2f) and make sure it is connected to your computer.
    - 4b. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate.bin` file you extracted earlier. (step 3b)
    - 4c. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 4d. Select `Tools`, the wrench icon at the top of the screen, and select `Backup eMMC`. Underneath the `Full` section, tap on `eMMC BOOT0 & BOOT1`. This may take a few seconds to load. After it is finished filling the progress bar it should say `Finished and verified!`. Beneath `Filepath:` you will see the location of the dump. 
    - 4e. Click `Close` and select `eMMC RAW GPP`. This should take some time as the Switch's `rawnand.bin` is quite large. If the progress bar appears to go backwards at some points or turn green, do not worry as this is Hekate verifying the data. This should take between 15-45 minutes depending on the quality/speed of your SD card and the default verification setting. Please keep note of the location the output file is placed.
    - 4f. Power off your switch to avoid damage to your SD card by selecting `Back` and then selecting `Power Off` and then eject your SD card. Insert your SD card into your computer and use your file explorer to open the contents. Place the `yuzu_copy.bat` file you downloaded earlier into the root of your SD card. Double-click it to start combining your `rawnand.bin` if it was dumped into sections i.e. `rawnand.bin.00`. If your `rawnand.bin` dumped as one ~30gb file, then proceed with the guide. 
    - 4g. If you needed to dump the `rawnand.bin` into sections due to lack of space on your sd card, transfer the files that did dump to a new folder on your desktop, and then resume the backup of your `eMMC RAW GPP`. After you have obtained all of the `rawnand.bin` files, add them to the same folder as before, place the `yuzu_copy.bat` file you downloaded earlier into that same folder and double-click to run. After they are combined, please proceed with the guide.

# Moving SYSTEM and USER to the yuzu directory

5. We will now extract the necessary directories from your `rawnand.bin` for yuzu to read your system files. 
    - 5a. Open `HacDiskMount` as Administrator (Right-click and select Run As Administrator) and go to `File > Open file` and select your `rawnand.bin`.
    - 5b. Double-click on the row marked `PRODINFO`. Under the dump to file area, click browse and pick somewhere easy to get to, like your Desktop. Dump the file as `PRODINFO.bin`. Click start and wait for it to complete. Then close the window. (NOTE: There is no need to enter any keys in the boxes at the top of the dialog at this moment.)
    - 5c. Select the row named `BCPKG2-1-Normal-Main`. Under the dump to file area, click browse and pick somewhere easy to get to, like your Desktop. Dump the file as `BCPKG2-1-Normal-Main.bin`. Click start and wait for it to complete. Again, no keys are necessary at this point. After it finishes, close the window.
    - 5d. Copy the `PRODINFO.bin` and `BCPKG2-1-Normal-Main.bin` files to the `%YUZU_DIR%/sysdata` directory.
    - 5e. Double-click on the row named `SYSTEM`. In the keys box, enter the `bis_key2_crypt` key in the crypt box and the `bis_key2_tweak` key in the tweak box and click test. If the text is red, double check your keys. If the text is blue, click on `Install` and wait until it says `Driver (ver XXXXX) installed, Service is running` where XXXXX is anything, then select `Y:` in the dropdown and click `Mount`. The application may become unresponsive for a moment. Press Windows-R and type `Y:` into the box and click OK and there will be a couple of folders with some named `Contents` and `save`. Copy all of these into `%YUZU_DIR%/nand/system`. After this is done, click `Unmount` and close the window.
    - 5f. Double-click on the row named `USER`. Enter the same key and click `Mount` (the tool may become unresponsive again). Once this mounts, open the new drive and copy the `Contents` and `save` folders to `%YUZU_DIR%/nand/user`. After this, click `Unmount` and close the window and then the program.
    - 5g. If you have games or game data stored on your SD card, copy the `Nintendo` folder of your SD card into `%YUZU_DIR%/sdmc`.

<h1 id="cart"><br></h1>

# Dumping Cartridge Games

6. We will now dump the `Cartridge Image (XCI)` file from your game cartridge(s), to use in yuzu. Insert the game cartridge of your choice.
    - 6a. Boot your Nintendo Switch into RCM mode (steps 2d to 2f) and make sure it is connected to your computer.
    - 6b. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate.bin` file you extracted earlier. (step 3b)
    - 6c. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 6d. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 6e. Tap on `fusee-primary.bin` in the list of payloads.
    - 6f. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, click/tap on the Album application. This will launch the Homebrew Menu.
    - 6g. Either use the touchscreen or navigate using your controller, and choose `nxdumptool`.
    - 6h. Choose the `Dump gamecard content` option.
    - 6i. Choose the `Cartridge Image (XCI) dump` option.
    - 6j. Make sure to dump the certificate with the cartridge. The options can be toggled by pressing `left` or `right`.
    - 6k. Once the cartridge image has been dumped, power off your switch by holding the power button for a few seconds, then select the Power Options > Turn off.
    - 6l. With your Switch powered off, remove the SD card.
    - 6m. Insert your SD card into your computer. If the XCI was dumped in parts combine them with this command, for example: `copy /b "Super Mario Odyssey.xc0" + "Super Mario Odyssey.xc1" "Super Mario Odyssey.xci"`. Now you can place this XCI in a game directory of your choice.

# Dumping Save Files (Optional)

7. We will now dump the games' save files from your switch to use in yuzu.
    - 7a. Download [Checkpoint.nro](https://github.com/FlagBrew/Checkpoint/releases)
    - 7b. Insert your SD card into your computer.
    - 7c. Create a folder named `Checkpoint` within the `switch` folder of your SD card and place the `Checkpoint.nro` file inside it.
    - 7d. Eject your SD card and place it in your Switch.
    - 7e. Boot your Nintendo Switch into RCM mode (steps 2d to 2f) and make sure it is connected to your computer.
    - 7f. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate.bin` file you extracted earlier. (step 3b)
    - 7g. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 7h. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 7i. Tap on `fusee-primary.bin` in the list of payloads.
    - 7j. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, click/tap on the Album application. This will launch the Homebrew Menu.
    - 7k. Either use the touchscreen or navigate using your controller, and choose `Checkpoint`.
    - 7l. Pick the games that you want to dump their save files (multiselect with the `Y` button), and press the `L` button to backup the saves.
    - 7m. Once you have backed up the save files, power off your switch by holding the power button for a few seconds, then select the Power Options > Turn off.
    - 7n. With your Switch powered off, remove the SD card.
    - 7o. Insert your SD card into your computer. Your save files will be located in the `switch/Checkpoint` folder.

# Running yuzu

8. We will now run yuzu to verify that your keys and system files were dumped and are being read correctly by yuzu.
    - 8a. Run either the `yuzu` or `yuzu Early Access` shortcuts that were created by the yuzu installer tool. If you have moved your `Nintendo` folder from your SD card to `%YUZU_DIR%/sdmc` you should see your SD installed games populate.
    - 8b. If you extracted your `XCI` files from your Nintendo Switch cartridges, then, in yuzu, click on `+ Add New Game Directory` in the browser, and navigate to the folder where you placed your `XCI` files.

### If you need any help during this process or get a strange error during or while using yuzu, feel free to ask for help on the yuzu discord! Happy Emulating!
