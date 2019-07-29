---
title: Getting Log Files
description: "How to properly gather and upload log files from yuzu."
---

### Before starting, please make sure that the log filter is set to `*:Info` for better analyzation purposes. You can check the current log filter by going to Emulation -> Configure -> General -> Debug, under the Logging section.

1. Launch the game that exhibits incorrect behaviour.

2. Close out of yuzu once the game crashes, freezes or shows any kind of unwanted behaviour.

**Note: After this step, yuzu needs to remain closed. Do not open the emulator until the rest of the steps are completed.**

3. Gathering the log files:

* 3a. *(Windows only)* Navigate to `%appdata%/Roaming/yuzu/log`. A file called `yuzu_log.txt` should be present in the directory.

* 3b. *(Linux only)* In the terminal, type `echo $XDG_DATA_HOME`. This command will print out the user-specific data directory. If nothing gets printed out, that means the directory hasn't been changed and the log is present in `~/.local/share/yuzu/log`. If something has been printed out, however, you should follow that directory instead and manually navigate to `/yuzu/log` there.

4. *(Optional)* If the log file is larger than 8 MB and you are planning to upload the file to Discord, you'll need to compress the file with a compression tool, such as 7-Zip.

5. Once you have obtained the log file, upload it where you were asked to provide a log file by this guide. (Discord, Community Forums...)

**You're done!**
