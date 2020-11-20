---
title: Quickstart Guide
description: A guide designed to get you started with yuzu quickly.
---

{{< youtube j0fXerrGjF4 >}}

<h1 id="hardware"><br></h1>

# Hardware Requirements

|   	|  CPU 	|  GPU	|  RAM	|
|-------|-------|-------|-------|
|**Minimum**|Intel Core i5-4430 / AMD Ryzen 3 1200|Intel HD Graphics 520 / NVIDIA GeForce GT 1030 2GB / AMD Radeon R7 240 2GB|8GB|
|**Recommended**|Intel Core i5-10400 / AMD Ryzen 5 3600|Intel UHD Graphics 630 / NVIDIA GeForce GTX 1650 4GB / AMD Radeon RX Vega 56 8GB|16GB| 

- Our recommended specifications don't guarantee perfect performance in most games, but rather strive to provide a cost effective recommendation while still considering performance.

- Most games are playable on older Nvidia GPUs from the Fermi family (400 series) or later, but at least Pascal (1000 series) is strongly recommended.

- CPUs lacking the FMA instruction set will produce very poor results. Intel Core gen 3 series or older, AMD phenom II or older and all Pentium/Celeron CPUs will not produce optimal results.

- Mobile CPUs will not reach the same performance as their desktop counterparts due to thermal, power, and technical limitations. 

- **GPUs must support OpenGL 4.5 (or higher) & OpenGL Compatibility profile, or Vulkan 1.1.**<br>
To find out if your GPU meets these requirements, visit https://opengl.gpuinfo.org or https://vulkan.gpuinfo.org/ and check your GPU details.<br>

Sample Image:

![GPUInfo](./gpu_info.png)

# yuzu Quickstart Guide

To start playing commercial games, yuzu needs a couple of system files and folders from your switch in order to play them properly.
To check if your Switch is hackable, visit https://damota.me/ssnc/checker and test your Switch's serial number.

<article class="message has-text-weight-semibold">
<div class="message-body">
<p>NOTE:</p>
<ul>
    <li>If your Switch is patched, you will be unable to complete the following steps.</li>
    <li>The Switch v2 (Mariko/Red Box) and the Switch Lite are both patched and you will not be able to complete the following steps.</li>
</ul>
</div>
</article>

This guide will help you copy all your system files, games, updates, and DLC from your switch to your computer and organize them in a format yuzu understands.
This process should take about 60 to 90 minutes.

**IMPORTANT: <br>
Make sure to place your Nintendo Switch into Airplane Mode before starting this guide.** <br>
`System Settings -> Airplane Mode -> Airplane Mode "ON"`

# Prerequisites

- A Nintendo Switch vulnerable to the fusée gelée RCM exploit -- Visit https://damota.me/ssnc/checker and test your Switch's serial number
- An SD card with at least 30 GB of free space (an almost empty 32GB card will work)
- A USB-C to USB-A or USB-C to USB-C Cable to connect your Switch to your computer
- [TegraRcmGUI](https://github.com/eliboa/TegraRcmGUI/releases/latest) -- Download the TegraRcmGUI installer
- [Hekate](https://github.com/CTCaer/hekate/releases/latest) -- Download the `hekate` zip file
- [Atmosphere](https://github.com/Atmosphere-NX/Atmosphere/releases/latest) -- Download both the `atmosphere` zip file and `fusee-primary.bin`
- [Lockpick_RCM](https://github.com/shchmue/Lockpick_RCM/releases/latest/download/Lockpick_RCM.bin) -- Download `Lockpick_RCM.bin`
- [nxdumptool](https://github.com/DarkMatterCore/nxdumptool/releases/latest/download/nxdumptool.nro) -- Download `nxdumptool.nro`
- [nxDumpMerger](https://github.com/emiyl/nxDumpMerger/releases/latest) -- Download the `nxDumpMerger_Windows.7z` zip file (Note: You need [7-zip](https://www.7-zip.org/) to extract this zip archive)
- [Goldleaf](https://github.com/XorTroll/Goldleaf/releases) -- Download `Goldleaf.nro`
- [microSD Card Reader](https://www.amazon.com/dp/B006T9B6R2) -- If your computer has one built-in, you can use that
- [RCM Jig](https://www.amazon.com/dp/B07J9JJRRG) <-- We highly recommend one like this, but you could use any of the methods outlined [here](https://noirscape.github.io/RCM-Guide/)

`%YUZU_DIR%` is the home directory for yuzu on your computer:

    - For Windows, this is '%APPDATA%\yuzu' or 'C:\Users\{username}\AppData\Roaming\yuzu'
    - For Linux, this is '~/.local/share/yuzu'

<h1 id="sd"><br></h1>

# Preparing the microSD Card

1. We will now prepare the microSD card.
    - 1a. Extract the contents of the `atmosphere` and `hekate` zip files into the root of your SD card.
    - 1b. Rename the `hekate_ctcaer_X.X.X.bin` file to `reboot_payload.bin` and move it into the `atmosphere` folder. Replace the file when prompted.
    - 1c. Place the `fusee-primary.bin` and `Lockpick_RCM.bin` files into the `bootloader\payloads` folder of the SD card.
    - 1d. Place the `Goldleaf.nro` file in the `switch` folder of the SD card.
    - 1e. Create a folder named `nxdumptool` within the `switch` folder of your SD card and place the `nxdumptool.nro` file inside it.
    - 1f. Once done, eject the microSD card and insert it into your Nintendo Switch.

{{< imgs
    "./sd_template.png|Your SD card should look like this."
>}}

<h1 id="rcm"><br></h1>

# Booting into RCM

2. We will now boot your Nintendo Switch into RCM mode
    - 2a. Run the TegraRcmGUI installer you downloaded from the prerequisites, and after installation, start the program. 
    - 2b. In the `Settings` tab, click on `Install Driver` which will install the drivers necessary for your computer to interface with your Nintendo Switch. 
    - 2c. After the drivers have been installed, plug your Nintendo Switch into your computer.
    - 2d. Power off your Switch while it is still connected to your computer.
    - 2e. Insert your RCM jig into the right joy-con slot, make sure it is seated securely at the base, and then press VOL+ and Power buttons at the same time. Nothing should happen on your Switch; if the switch starts to turn on normally, go back to the beginning of step 2d and try again.
    - 2f. If you see the Nintendo Switch icon in the lower left corner flash green and state `RCM O.K.`, your switch has successfully entered RCM mode.

<h1 id="keys"><br></h1>

# Dumping Prod.keys and Title.keys

3. We will now dump your `prod.keys` and `title.keys` for decryption of your game files.
    - 3a. Boot your Nintendo Switch into RCM mode[# Booting into RCM] and make sure it is connected to your computer.
    - 3b. Extract the `hekate_ctcaer_X.X.X.bin` file from the `hekate` zip file you downloaded from the prerequisites.
    - 3c. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate.bin` file you extracted earlier.
    - 3d. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 3e. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 3f. Tap on `Lockpick_RCM.bin` in the list of payloads.
    - 3g. After Lockpick_RCM has successfully booted, press the power button to select `Dump from SysNAND`. 
    - 3h. It will automatically boot to sept and start deriving the keys. Wait for it to finish deriving the keys.
    - 3i. After Lockpick_RCM has finished deriving the keys, please make note of the location of the key files. Default is: `sd:/switch/prod.keys` and `sd:/switch/title.keys`.
    - 3j. Press any key to return to the menu, then navigate with the VOL+/VOL- buttons to highlight and select `Reboot (RCM)` by pressing the power button.
    - 3k. Once the screen is off, repeat step 3c. to 3d. If you receive a `Payload already injected.` warning, click `Yes`.
    - 3l. In the Hekate Home menu, tap on the `Tools` tab to show the Tools menu.
    - 3m. Tap on `USB Tools`.
    - 3n. Tap on `SD Card`. Your SD card should now be mounted to your computer.
    - 3o. Navigate to your SD card drive and copy both `prod.keys` and `title.keys` to the `%YUZU_DIR%/keys` directory.
    - 3p. Once you're done copying, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.

# Backing up Switch NAND (Optional but Recommended)

4. We will now boot Hekate to dump your switch's NAND. This step is optional, but highly recommended to ensure you have a backup of your Switch's data in its internal storage.
    - 4a. Boot your Nintendo Switch into RCM mode (steps 2d. to 2f.) and make sure it is connected to your computer.
    - 4b. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate_ctcaer_X.X.X.bin` file you extracted earlier. (Step 3b.)
    - 4c. Tap on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 4d. Select `Tools`, the wrench icon at the top of the screen, and select `Backup eMMC`. Underneath the `Full` section, tap on `eMMC BOOT0 & BOOT1`. This may take a few seconds to load. After it is finished filling the progress bar it should say `Finished and verified!`. Beneath `Filepath:` you will see the location of the dump. 
    - 4e. Tap on `Close` and select `eMMC RAW GPP`. This should take some time as the Switch's `rawnand.bin` is quite large. If the progress bar appears to go backwards at some points or turn green, do not worry as this is Hekate verifying the data. This should take between 15-45 minutes depending on the quality/speed of your SD card and the default verification setting. Please keep note of the location the output file is placed.
    - 4f. Tap on `Close` two times to return to the Tools menu.
    - 4g. Tap on `USB Tools`.
    - 4h. Tap on `SD Card`. Your SD card should now be mounted to your computer.
    - 4i. Navigate to your SD card drive and copy the `backup` folder to your computer.
    - 4j. Once you're done copying, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.

# Dumping System Update Firmware

5. Some games such as `Mario Kart 8 Deluxe` require the use of files found inside the `Nintendo Switch System Update Firmware` to be playable. In this step, we will now dump the firmware files from your Switch for use in yuzu.
    - 5a. Boot your Nintendo Switch into RCM mode[#Booting into RCM] and make sure it is connected to your computer.
    - 5b. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate_ctcaer_X.X.X.bin` file you extracted earlier. (Step 3b.)
    - 5c. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 5d. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 5e. Tap on `fusee-primary.bin` in the list of payloads.
    - 5f. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, press and hold the `R` button on your controller and launch a game. This will launch the Homebrew Menu in `title override mode`.
    - 5g. Either use the touchscreen or navigate using your controller, and select `Goldleaf`.
    - 5h. Select `Console and Goldleaf settings` near the bottom.
    - 5i. Select `Firmware and updates`.
    - 5j. Select `Export update`.
    - 5k. Select `Directory`.
    - 5l. Once the exporting process finishes, the `.nca` files will be located in your SD card in `sd:/switch/Goldleaf/dump/update` in a folder named after the firmware revision dumped.
    - 5m. Press `+` on your controller to return to the Homebrew Menu.
    - 5n. Select `Reboot to Payload` and then press `-` on your controller to return to the Hekate menu.
    - 5o. In the Hekate Home menu, tap on the `Tools` tab to show the Tools menu.
    - 5p. Tap on `USB Tools`.
    - 5q. Tap on `SD Card`. Your SD card should now be mounted to your computer.
    - 5r. Navigate to your SD card drive and copy the contents in the firmware folder (step 5l.) to `%YUZU_DIR%/nand/system/Contents/registered`. Alternatively, you can write `%appdata%\yuzu\nand\system\Contents\registered` in the address bar of a file explorer.
    - 5s. Once you're done copying, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.

<h1 id="cart"><br></h1>

# Dumping Cartridge Games

6. We will now dump the `Cartridge Image (XCI)` file from your game cartridge(s), to use in yuzu. Insert the game cartridge of your choice.
    - 6a. Boot your Nintendo Switch into RCM mode[#Booting into RCM] and make sure it is connected to your computer.
    - 6b. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate_ctcaer_X.X.X.bin` file you extracted earlier. (Step 3b.)
    - 6c. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 6d. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 6e. Tap on `fusee-primary.bin` in the list of payloads.
    - 6f. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, press and hold the `R` button on your controller and launch a game. This will launch the Homebrew Menu in `title override mode`.
    - 6g. Either use the touchscreen or navigate using your controller, and select `nxdumptool`.
    - 6h. Select the `Dump gamecard content` option.
    - 6i. Select the `Cartridge Image (XCI) dump` option.
    - 6j. Once the cartridge image has been dumped, press any button to return to the previous menu and then press `+` to return to the Homebrew Menu.
    - 6k. Select `Reboot to Payload` and then press `-` on your controller to return to the Hekate menu.
    - 6l. In the Hekate Home menu, tap on the `Tools` tab to show the Tools menu.
    - 6m. Tap on `USB Tools`.
    - 6n. Tap on `SD Card`. Your SD card should now be mounted to your computer.
    - 6o. Navigate to your SD card drive. XCI dumps are located under `sd:/switch/nxdumptool/XCI`.
    - 6p. If your XCIs are dumped in parts with `.xc0`, `.xc1`, `.xc2`, etc extensions, use the `nxDumpMerger` tool you have downloaded in the prerequisites to assist in merging these parts into a complete XCI. If they were dumped as complete XCI files with the `.xci` extension, you can proceed to copy these to a game directory of your choice.
    - 6q. Extract the contents of `nxDumpMerger` into a new folder and start the program.
    - 6r. Select the button with the triple dots `...` next to the `Input` field. This will open a file selector.
    - 6s. Find and select one of the parts and click `Open`.
    - 6t. Next, select the button with the triple dots `...` next to the `Output` field. This will open a folder selector.
    - 6u. Select a folder where you would like your games stored and click `Select Folder`.
    - 6v. After completing these steps, the parts are ready to be merged. Select `Merge Dump` and the program will merge the parts into a complete XCI located in the `Output` folder. Repeat these steps for all other games dumped as parts.
    - 6w. Once you're done merging, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.

<h1 id="installed titles"><br></h1>

# Dumping Installed Titles (eShop)

7. We will now dump the `Nintendo Submission Package (NSP)` file from your installed eShop game(s), to use in yuzu.
    - 7a. Boot your Nintendo Switch into RCM mode[#Booting into RCM] and make sure it is connected to your computer.
    - 7b. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate_ctcaer_X.X.X.bin` file you extracted earlier. (Step 3b.)
    - 7c. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 7d. When it has successfully booted into the Hekate menu, tap on `Payloads`. This will show a list of payloads.
    - 7e. Tap on `fusee-primary.bin` in the list of payloads.
    - 7f. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, press and hold the R button on your controller and launch a game. This will launch the Homebrew Menu in `title override mode`.
    - 7g. Either use the touchscreen or navigate using your controller, and select `nxdumptool`.
    - 7h. Select the `Dump installed SD Card / eMMC Content` option.
    - 7i. Select the game you want to dump.
    - 7j. Select the `Nintendo Submission Package (NSP) dump` option.
    - 7k. If your game contains an update or DLC, you will see multiple dumping options such as `Dump base application NSP`, `Dump installed update NSP` or/and `Dump installed DLC NSP` in the next screen. Select `Dump base application NSP` to dump the base game.
    - 7l. Select the `Start NSP dump process` option and wait for the dumping process to finish.
    - 7m. Press the `B button` to return to the previous menu(s) and repeat the previous steps to dump the base, updates and DLC of all your games.
    - 7n. Once all your games are dumped, press any button to return to the previous menu and then press `+` to return to the Homebrew Menu.
    - 7o. Select `Reboot to Payload` and then press `-` on your controller to return to the Hekate menu.
    - 7p. In the Hekate Home menu, tap on the `Tools` tab to show the Tools menu.
    - 7q. Tap on `USB Tools`.
    - 7r. Tap on `SD Card`. Your SD card should now be mounted to your computer.
    - 7s. Navigate to your SD card drive. NSP dumps are located under `sd:/switch/nxdumptool/NSP`.
    - 7t. If your NSPs are dumped as folders with `00`, `01`, `02`, etc parts within them, use the `nxDumpMerger` tool you have downloaded in the prerequisites to assist in merging these parts into a complete NSP. If they were dumped as files, you can proceed to copy these to a game directory of your choice.
    - 7u. Extract the contents of `nxDumpMerger` into a new folder and start the program.
    - 7v. Select the button with the triple dots `...` next to the `Input` field. This will open a file selector.
    - 7w. Find a NSP that is dumped as a folder with parts. Select one of the parts within the folder and click `Open`.
    - 7x. Next, select the button with the triple dots `...` next to the `Output` field. This will open a folder selector.
    - 7y. Select a folder where you would like your games stored and click `Select Folder`.
    - 7z. After completing these steps, the parts are ready to be merged. Select `Merge Dump` and the program will merge the parts into a complete NSP located in the `Output` folder. Repeat these steps for all folder NSPs.
    - 7aa. Once you're done merging, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.

# Dumping Save Files (Optional)

8. We will now dump the games' save files from your switch to use in yuzu.
    - 8a. Download [Checkpoint.nro](https://github.com/FlagBrew/Checkpoint/releases)
    - 8b. Boot your Nintendo Switch into RCM mode[#Booting into RCM] and make sure it is connected to your computer.
    - 8c. Run TegraRcmGUI. In the `Payload` tab of TegraRcmGUI, click on the folder icon and navigate to the `hekate_ctcaer_X.X.X.bin` file you extracted earlier. (Step 3b.)
    - 8d. Click on `Inject Payload` and your Switch will boot into the Hekate menu.
    - 8e. In the Hekate Home menu, tap on the `Tools` tab to show the Tools menu.
    - 8f. Tap on `USB Tools`.
    - 8g. Tap on `SD Card`. Your SD card should now be mounted to your computer.
    - 8h. Navigate to your SD card drive and create a folder named `Checkpoint` within the `switch` folder of your SD card and place the `Checkpoint.nro` file inside it.
    - 8i. Once you're done, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.
    - 8j. Tap on `Close` again to return to the Tools menu.
    - 8k. Tap on the `Home` tab to return to the Hekate Home menu.
    - 8l. Tap on `Payloads`. This will show a list of payloads.
    - 8m. Tap on `fusee-primary.bin` in the list of payloads.
    - 8n. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, press and hold the `R` button on your controller and launch a game. This will launch the Homebrew Menu in `title override mode`.
    - 8o. Either use the touchscreen or navigate using your controller, and choose `Checkpoint`.
    - 8p. Pick the games that you want to dump their save files (multiselect with the `Y` button), and press the `L` button to backup the saves.
    - 8q. Once you have backed up the save files, press any button to return to the previous menu and then press `+` to return to the Homebrew Menu.
    - 8r. Select `Reboot to Payload` and then press `-` on your controller to return to the Hekate menu.
    - 8s. Repeat steps 8e. to 8g.
    - 8t. Navigate to your SD card drive. Your save files will be located in the `switch/Checkpoint` folder.
    - 8u. Once you're done transferring your save files, safely unmount the SD card from your computer. Return to the Switch's screen and tap on `Close`.

# Running yuzu

9. We will now run yuzu to verify that your dumped keys and games are being read correctly.
    - 9a. Run either the `yuzu` or `yuzu Early Access` shortcuts that were created by the yuzu installer tool.
    - 9b. in yuzu, click on `+ Add New Game Directory` in the browser, and navigate to the folder where you placed your `XCI` or `NSP` files.

### If you need any help during this process or get a strange error during or while using yuzu, feel free to ask for help on the yuzu discord! Happy Emulating!
