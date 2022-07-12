---
title: Quickstart Guide
description: A guide designed to get you started with yuzu quickly.
---

## Table of Contents

* [Downloading and Installing yuzu](#downloading-and-installing-yuzu)
* [Hardware Requirements](#hardware-requirements)
* [Guide Introduction](#guide-introduction)
* [Prerequisites](#prerequisites)
* [Preparing the microSD card](#preparing-the-microsd-card)
* [Booting into RCM](#booting-into-rcm)
* [Booting into Hekate](#booting-into-hekate)
* [Mounting the microSD card to your computer in Hekate](#mounting-the-microsd-card-to-your-computer-in-hekate)
* [Dumping the Decryption Keys](#dumping-prodkeys-and-titlekeys)
* [Backing up Switch NAND (Optional)](#backing-up-switch-nand-optional)
* [Dumping System Firmware](#dumping-the-decryption-keys)
* [Dumping Cartridge Games](#dumping-cartridge-games)
* [Dumping Installed Titles (eShop)](#dumping-installed-titles-eshop)
* [Dumping Save Files (Optional)](#dumping-save-files-optional)
* [Rebooting the Switch Back to its Original State](#rebooting-the-switch-back-to-its-original-state)
* [Running yuzu](#running-yuzu)

## Downloading and Installing yuzu

{{< youtube j0fXerrGjF4 >}}

## Hardware Requirements

#### CPU:

Any x86_64 CPU with support for the FMA instruction set. 6 threads or more are recommended.

- **Minimum:** Intel Core i5-4430 / AMD Ryzen 3 1200

- **Recommended:** Intel Core i5-10400 / AMD Ryzen 5 3600

#### Dedicated graphics:

OpenGL 4.6 or Vulkan 1.1 compatible hardware and drivers are mandatory. Half-float support and 4GB of VRAM are recommended.

- **Minimum for Linux:** NVIDIA GeForce GT 1030 2GB / AMD Radeon R7 240 2GB

- **Minimum for Windows:** NVIDIA GeForce GT 1030 2GB / AMD Radeon RX 550 2GB

- **Recommended:** NVIDIA GeForce GTX 1650 4GB / AMD Radeon RX Vega 56 8GB

#### Integrated graphics:

Integrated graphics will produce very low performance. A dedicated GPU will produce better results on all scenarios.
This is only for listing iGPU support.

- **Minimum for Linux:** Intel HD 5300 / AMD Radeon R5 Graphics

- **Minimum for Windows:** Intel HD Graphics 520 / AMD Radeon Vega 3

- **Recommended:** Intel UHD Graphics 750 / AMD Radeon Vega 7

#### RAM:

Since an integrated GPU uses system RAM as its video memory (VRAM), our memory requirement in this configuration is higher.

- **Minimum with dedicated graphics:** 8 GB

- **Minimum with integrated graphics:** 12 GB

- **Recommended:** 16 GB

#### Notes:

- Windows users are recommended to run Windows 10 1803 or newer to get the best performance.

- Our recommended specifications don't guarantee perfect performance in most games, but rather strive to provide a cost effective recommendation while still considering performance.

- Most games are playable on older Nvidia GPUs from the Fermi family (400 series) or later, but at least Pascal (1000 series) is strongly recommended.

- CPUs lacking the FMA instruction set will produce very poor results. Intel Core gen 3 series or older, AMD phenom II or older and all Pentium/Celeron/Atom CPUs will not produce optimal results.

- Mobile CPUs will not reach the same performance as their desktop counterparts due to thermal, power, and technical limitations. 

- Old GCN 1.0 and GCN 2.0 Radeon GPUs on Linux require manually forcing the amdgpu kernel module.

- **GPUs must support OpenGL 4.6 & OpenGL Compatibility profile, or Vulkan 1.1 (or higher).**<br>
To find out if your GPU meets these requirements, visit https://opengl.gpuinfo.org or https://vulkan.gpuinfo.org/ and check your GPU details.<br>

Sample Image:

![GPUInfo](./gpu_info.png)

## Guide Introduction

To start playing commercial games, yuzu needs a couple of system files from a **HACKABLE** Nintendo Switch console in order to play them properly.

This guide will help you copy all your system files, games, updates, and DLC from your switch to your computer and organize them in a format yuzu understands. This process should take about 60 to 90 minutes.

<article class="message has-text-weight-semibold">
    <div class="message-body">
        <p>DISCLAIMER:</p>
        <ul>
            <li>This guide is tailored for early Switch consoles that are vulnerable to the <code>fusée-gelée</code> RCM exploit, as it is the most accessible entryway to load custom firmware and run the tools necessary to obtain the required system files and games.
            <li>While there are alternatives to jailbreaking patched Switch models, instructions for booting into custom firmware on this guide may not work for such other exploits, but the overall dumping process should be mostly consistent. Join the <a href="https://discord.gg/u77vRWY">yuzu Discord server</a> for any further assistance on this case.
            <li>The following Switch models are patched from <code>fusée-gelée</code> and are unable to complete the first couple of steps:
            <ul>
                <li>Original Switch models manufactured after 2018.
                <ul>
                    <li>Visit <a href="https://ismyswitchpatched.com/">Is My Switch Patched?</a> to check if your console is patched.</li>
                </ul>
                <li>Mariko Switch released in late 2019 a.k.a. Red Box Switch, HAC-001(-01)</li>
                <li>Nintendo Switch Lite (HDH-001)</li>
                <li>Nintendo Switch OLED Model (HEG-001)</li>
            </ul>
        </ul>
    </div>
</article>

## Prerequisites

- A **hackable** Nintendo Switch console (preferably a model that is vulnerable to the `fusée-gelée` exploit).
    - Visit [Is My Switch Patched?](https://ismyswitchpatched.com/) to check if your console is not patched.
- A **microSD card** with at least `32 GB` of storage capacity. `64 GB` or higher is recommended.
- A **USB-C to USB-A** or **USB-C to USB-C cable** to connect your Switch to your computer.
- [TegraRcmGUI](https://github.com/eliboa/TegraRcmGUI/releases/latest) -- Download `TegraRcmGUI_v2.6_Installer.msi`
- [Hekate](https://github.com/CTCaer/hekate/releases/latest) -- Download `hekate_ctcaer_X.X.X_Nyx_X.X.X.zip`
    - **Windows users:** Also download `nyx_usb_max_rate__run_only_once_per_windows_pc.reg` and run it for faster transfer speeds over USB. For details, see the **NOTE** section in the release page.
- This hekate configuration file -- [hekate_ipl.ini](./hekate_ipl.ini)
- [Atmosphére](https://github.com/Atmosphere-NX/Atmosphere/releases/latest) -- Download both `atmosphere-X.X.X-master-XXXXXXXX+hbl-X.X.X+hbmenu-X.X.X.zip` and `fusee.bin`.
- [Lockpick_RCM](https://github.com/shchmue/Lockpick_RCM/releases/latest) -- Download `Lockpick_RCM.bin`
- [nxdumptool](https://github.com/DarkMatterCore/nxdumptool/releases/latest) -- Download `nxdumptool.nro`
- [nxDumpFuse](https://github.com/oMaN-Rod/nxDumpFuse/releases/latest) -- Download `win-x64.zip`
- [TegraExplorer](https://github.com/suchmememanyskill/TegraExplorer/releases/latest) -- Download `TegraExplorer.bin`
- [Rufus](https://github.com/pbatard/rufus/releases/latest) -- Download `rufus-X.XX.exe`
- [microSD Card Reader](https://www.amazon.com/dp/B006T9B6R2) -- If your computer has one built-in, you can use that.
- [RCM Jig](https://www.amazon.com/dp/B07J9JJRRG) -- We highly recommend one like this, but you could use any of the methods outlined [here.](https://noirscape.github.io/RCM-Guide/)

## Preparing the microSD Card

We will now format the microSD card to `FAT32` and place some files downloaded from the prerequisites section into it.

- **NOTE:** The `exFAT` file system is not recommended as that format is prone to file corruption when the microSD card interacts with the Switch. Large capacity microSD cards are usually formatted as `exFAT` by default.

**Step 1:** Insert the microSD card into your computer.

- If you have a `Nintendo` folder in your microSD card, make a backup of it by copying the folder to your computer, as the formatting process will erase any data stored in the card.

**Step 2:** Open the **Rufus** formatting tool and set the following settings:

- **Device:** Select your microSD card drive
- **Boot selection:** `Non-bootable`
- **File system:** `FAT32` or `Large FAT32`
- **Cluster size:** `64 kilobytes`

**Step 3:** Click on `START` and wait for the formatting process to finish.

**Step 4:** Move the previously copied `Nintendo` folder back into the microSD card.

**Step 5:** Extract all the contents inside the `atmosphere-X.X.X-master-XXXXXXXX+hbl-X.X.X+hbmenu-X.X.X.zip` archive into the root of the microSD card.

**Step 6:** Extract the `bootloader` folder from inside the `hekate_ctcaer_X.X.X_Nyx_X.X.X.zip` archive into the root of the microSD card.

- **IMPORTANT:** Drag and drop the contents, do not create any new folders from the previous `.zip` files.

**Step 6:** Place the `hekate_ipl.ini` file into the `bootloader` folder.

**Step 7:** Place the `fusee.bin`, `Lockpick_RCM.bin` and `TegraExplorer.bin` files into the `payloads` folder (located inside the `bootloader` folder).

**Step 8:** Create a folder named `nxdumptool` within the `switch` folder and place the `nxdumptool.nro` file inside it.

**Step 9:** Eject the microSD card from your computer and insert it into the microSD card slot of your Switch.

Your microSD card contents should look like this:

{{< imgs
    "./sd_root.png|The root of the microSD card"
    "./atmosphere_dir.png|atmosphere folder"
    "./hekate_dir.png|Hekate bootloader folder"
    "./payloads_dir.png|payloads folder"
    "./switch_dir.png|switch folder"
>}}

## Booting into RCM

The Switch has a hidden recovery mode called `RCM` which allows the execution of unsigned code. However, these steps only work on models vulnerable to `fusée-gelée` despite `RCM` is also present in patched models. 

**Step 1:** Open the **TegraRcmGUI installer** (`TegraRcmGUI_v2.6_Installer.msi`), go through the installation wizard, and start the program. 

**Step 2:** In the `Settings` tab, click on `Install Driver` and follow the installation instructions.

**Step 3:** After the drivers have been installed, connect your Switch to your computer using a **USB-C cable**.

**Step 4:** **Power off** your Switch (not putting it to Sleep Mode) while it is still connected to your computer.

**Step 5:** Insert your **RCM jig** into the **right Joy-con rail**, make sure it is seated securely at the base.

**Step 6:** Hold `Volume +` and press the `Power` button.

If you see the Nintendo Switch icon turn **green** with `RCM O.K.` in the TegraRcmGUI window, your Switch has successfully booted into RCM mode. Else, if your Switch starts to turn on normally (Nintendo logo appears), go back to **Step 4** and try again.

Once you have succesfully booted into `RCM` mode, you can now remove the RCM jig from the console.

## Booting into Hekate

**Step 1:** Extract the `hekate_ctcaer_X.X.X.bin` file from the `hekate_ctcaer_X.X.X_Nyx_X.X.X.zip` archive to any directory on your computer.

**Step 2:** Open **TegraRcmGUI**. In the `Payload` tab, click on the folder icon and navigate to the `hekate_ctcaer_X.X.X.bin` file you extracted earlier.

**Step 3:** Click on `Inject Payload` and your Switch will now boot into the Hekate custom bootloader.

- **NOTE:** If you see a vertical text-based user interface appearing on your Switch's display, some of the Hekate files in your microSD card are not placed properly. Use the `Volume` buttons to navigate through the Hekate menu and select `Power Off` using the `Power` button to turn off the console. Make sure that the files in your microSD card match up with the images shown in [Preparing the microSD Card.](#preparing-the-microsd-card)

## Backing up Switch NAND (Optional)

All the tools used in this guide do not alter or modify the data stored inside the Switch. However, it is possible to make a full backup of the entire internal storage (`NAND`) using Hekate.

**Step 1:** In the Hekate Home menu, tap on the `Tools` tab and select `Backup eMMC`.

**Step 2:** Tap on `eMMC BOOT0 & BOOT1`.

- This may take a few seconds to load. After it is finished filling the progress bar it should say `Finished and verified!`. Beneath `Filepath:` you will see the location of the dump. 

**Step 3:** Tap on `Close` and select `eMMC RAW GPP`.

- This should take some time as the Switch's `rawnand.bin` file is quite large. If the progress bar appears to go backwards at some points or turn green, do not worry as this is Hekate verifying the data. The backup process should take between 15-45 minutes to complete depending on the quality/speed of your microSD card at the default verification setting. Keep note of the location of the output file(s).

**Step 4:** Tap on `Close` for two times to return to the `Tools` menu.

To access the NAND backup, we will now mount the microSD card as a drive from your Switch to your computer via USB.

**Step 5:** Tap on `USB Tools` and select `SD Card`.

- The microSD card should now show up on your computer as a USB drive.

**Step 6:** Navigate to the microSD card drive and copy the `backup` folder to your computer.

**Step 7:** Once the file transfer has completed, safely eject the microSD card drive. Do not unplug the Switch from your computer yet.

- **Windows users:** Follow the instructions in this [support page](https://support.microsoft.com/en-us/windows/safely-remove-hardware-in-windows-1ee6677d-4e6c-4359-efca-fd44b9cec369) if unsure of how to safely eject media.

We will now return to the Hekate Home menu to proceed with the remaining sections of the guide.

**Step 8:** Tap on `Close` for two times to return to the `Tools` menu.

**Step 9:** Tap on the `Home` tab to return to the Hekate Home menu.

## Dumping the Decryption Keys

We will now dump the decryption keys from your Switch so that yuzu is able to decrypt and open your game files.
    
**Step 1:** In the Hekate Home menu, tap on `Payloads`.

**Step 2:** Tap on `Lockpick_RCM.bin` in the list of payloads.

**Step 3:** In the Lockpick_RCM menu, press the `Power` button to select `Dump from SysNAND`.

After Lockpick_RCM has finished dumping the keys, the files will be stored in `sd:/switch/prod.keys` and `sd:/switch/title.keys`.

**Step 4:** Press any button to return to the main menu, then navigate using the `Volume` buttons to highlight and select `Reboot to hekate` using the `Power` button. You should now be booted back into Hekate.

## Dumping System Firmware

Some games such as **Mario Kart 8 Deluxe** require the use of system files found inside the Switch's **System Firmware** to be playable. We will now dump the system firmware files from your Switch for use in yuzu.

**Step 1:** In the Hekate Home menu, tap on `Payloads`.

**Step 2:** Tap on `TegraExplorer.bin` in the list of payloads.

**Step 3:** In the TegraExplorer menu, navigate through the menu using the `Volume` buttons and select the `FirmwareDump.te` script using the `Power` button.

**Step 4:** Select `Dump sysmmc`.

After TegraExplorer has finished dumping the firmware, the files will be stored in `sd:/tegraexplorer/Firmware/<firmware version>` as a series of `.nca` files.

- **NOTE:** As of the Switch's system update version `14.1.2`, there should be `232` `.nca` files stored inside the firmware folder. Make sure your firmware dump matches up with this count.

**Step 5:** Press any button to return to the main menu and select `Reboot to bootloader/update.bin`. You should now be booted back into Hekate.

## Dumping Games

This section will cover the dumping process of a game from either as a physical or digital copy, alongside any available game update and DLC files.

**Step 1:** In the Hekate Home menu, tap on `Launch`.

**Step 2:** Tap on `CFW - sysMMC`.

- Your Switch will now boot into the Atmosphere Custom Firmware (CFW). You should see the Atmosphere logo show up instead of the Nintendo logo at boot. It is normal that the HOME Menu remains the same and you can double check that you are loaded into CFW by navigating into **System Settings > About**

**Step 3:** Once your Switch has booted into the HOME Menu, press and hold the **R** button on your controller and launch a game. This will launch the Homebrew Menu in `title override mode`.

**Step 1** Either use the touchscreen or navigate using your controller, and select `nxdumptool`.

#### Dumping Physical Titles (Game Cards)

**Step 1** Select the `Dump gamecard content` option.

**Step 1** Select the `Cartridge Image (XCI) dump` option.

#### Dumping Digital Titles (eShop)

**Step 1** Once the cartridge image has been dumped, press any button to return to the previous menu and then press **+** to return to the Homebrew Menu.

## Dumping Save Files (Optional)

11. We will now dump the games' save files from your switch to use in yuzu.
    - 11a. Download [JKSV.nro](https://github.com/J-D-K/JKSV/releases/latest)
    - 11b. Boot your Nintendo Switch into [RCM mode](#booting-into-rcm) (steps 2c. to 2f.) and make sure it is connected to your computer.
    - 11c. Boot into [Hekate](#booting-into-hekate) (steps 3b. to 3c.)
    - 11d. [Mount the SD card to your computer in Hekate](#mounting-the-microsd-card-to-your-computer-in-hekate) (steps 4a. to 4c.)
    - 11e. Navigate to your SD card drive and place the `JKSV.nro` file inside the `switch` folder.
    - 11f. Once you're done, [safely eject the SD card drive in your computer and return to the Hekate Home menu.](#mounting-the-microsd-card-to-your-computer-in-hekate) (steps 5a. to 5b.)
    - 11g. Tap on `Payloads`. This will show a list of payloads.
    - 11h. Tap on `fusee.bin` in the list of payloads.
    - 11i. Your Switch will launch into Custom Firmware Mode (CFW), and once your Switch has booted into the home menu, press and hold the `R` button on your controller and launch a game. This will launch the Homebrew Menu in `title override mode`.
    - 11j. Either use the touchscreen or navigate using your controller, and choose `JKSV`.
    - 11k. Move up or down to select a source to dump save data for a single game. (Most save files are stored under the user account of choice. Some save data are located under Device, such as Animal Crossing: New Horizons.)
    - 11l. **For dumping all save data at once from selected source:** Press `X` and then select the `Dump All for <source name>` option.
    - 11m. **For dumping save data of a single game:** Press `A` and then select the game of choice, then press `A` again and select the `New` option.
    - 11n. JKSV will being up the keyboard to set a name for your save data folder. By default, it generates a name containing the source name (user account, Device, etc.) alongside the date and time of when it was dumped, else you can name it to whatever you want. Once you're done, press `+` to dismiss the keyboard.
    - 11o. Once you're done dumping, press `+` to close JKSV.
    - 11p. Select `Reboot to Payload` and then press `-` on your controller to return to the Hekate menu.
    - 11q. [Mount the SD card to your computer in Hekate](#mounting-the-microsd-card-to-your-computer-in-hekate) (steps 4a. to 4c.)
    - 11r. Navigate to your SD card drive. Your save files will be located in `sd:/JKSV/<name of the game>/<folder name from step 11n>/`.
    - 11s. Follow the instructions in the [How do I add a Save to my Game](https://yuzu-emu.org/wiki/faq/#how-do-i-add-a-save-to-my-game) section of our [FAQ.](https://yuzu-emu.org/wiki/faq/)
    - 11t. Once you're done transferring your save files, [safely eject the SD card drive in your computer and return to the Hekate Home menu.](#mounting-the-microsd-card-to-your-computer-in-hekate) (steps 5a. to 5b.)

## Mounting the microSD card to your computer in Hekate

_**NOTE:** These steps will be used in other sections below. Do **not** follow this section yet if you are [booted into Hekate for the first time.](#booting-into-rcm) Skip to the [next section](#dumping-prod-keys-and-title-keys) for now._

4. We will now mount the microSD card as a drive from your Switch to your computer in Hekate, via USB.
    - 4a. In the Hekate Home menu, tap on the `Tools` tab to show the Tools menu.
    - 4b. Tap on `USB Tools`.
    - 4c. Tap on `SD Card`. Your SD card should now be mounted as a drive to your computer.
    
    To unmount the SD card: Safely eject the drive from your computer and tap on `Close` from your Switch's screen.

5. We will now return to the Hekate Home menu.
    - 5a. Tap on `Close` again to return to the Tools menu.
    - 5b. Tap on the `Home` tab to return to the Hekate Home menu.
    
## Rebooting the Switch Back to its Original State

12. If you're done following the sections you needed for yuzu, we will now reboot the Switch back to its original state.
    - 12a. From the Hekate Home Menu, tap on `Reboot`.
    - 12b. Tap on `OFW`.
    - 12c. Your Switch will now reboot into the original firmware.

## Running yuzu

9. We will now run yuzu to verify that your dumped keys and games are being read correctly.
    - 9a. Run either the `yuzu` or `yuzu Early Access` shortcuts that were created by the yuzu installer tool.
    - 9b. in yuzu, click on `+ Add New Game Directory` in the browser, and navigate to the folder where you placed your `XCI` or `NSP` files.
    - 9c. To install game Updates and/or DLC. In yuzu, click `File >> install to NAND` and navigate to your dumped Update-DLC files. For more info refer to [How do I install game Updates or DLC](https://yuzu-emu.org/wiki/faq/#how-do-i-install-game-updates-or-dlc)

### If you need any help during this process or get a strange error during or while using yuzu, feel free to ask for help on the yuzu discord! Happy Emulating!
