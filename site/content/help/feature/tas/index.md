+++
title = "TAS"
description = "Tool Assisted Speedrun"
+++
This tool allows you to send perfectly timed, precise controller inputs to a game with what would be a near-impossible degree of accuracy for a human.
You can set and lock the different analog sticks to certain positions, as well as specify what buttons are to be pressed or released.

# How to use

To play back TAS scripts in yuzu, first select the folder with scripts in the configuration menu below
`Tools -> Configure TAS`. The file itself has to be in plain text format, and it must be named `script0-1.txt`
for controller 1, `script0-2.txt` for controller 2, and so forth (with max. 8 players).

After placing the file at the correct location, it can be read into yuzu with the (default) hotkey
`CTRL+F6` (refresh). The amount of frames contained in the the script file will be displayed at the bottom left corner of the window.
Playback can be started or stopped by using `CTRL+F5`.

However, in order for playback to work, the correct input device must be selected. This is done automatically if `controller profile swapping` is enabled,
if disabled this can be done by going to `Emulation > Configure > Controls` menu and selecting `TAS` from the device list for the controller that the script should be played on.

If you decide to run the script over and over again, `Loop script` will do just that. The tool will not stop until you specifically send the stop hotkey `CTRL+F5`.

`Pause execution during loads` is a feature that stops the tool until the loading screen is done. This feature is currently disabled but left as a placeholder until a
proper solution can be implemented.

## Recording

Recording a new script file is also simple: Just make sure that the proper controller device (not `TAS`) is
connected on P1, and press `CTRL+F7` to start recording your input. When you're done, press the same keys
again (`CTRL+F7`). The new script will be saved at the folder location previously selected, with
`record.txt` as the filename, optionally an overwrite dialog window will pop up that will replace the contents
of `script0-1.txt` with the script that you just recorded allowing you to play back the script right away.

{{< imgs
    "./control_debugger.png|For debugging purposes, the controller debugger can be used"
    "./control_debugger_pressed.png|View -> Debugging -> Controller P1"
>}}

## Example script

A script file has the same format that [TAS-nx](https://github.com/hamhub7/tas-script) uses.
<article class="message"><div class="message-header">Example</div><div class="message-body">
1 KEY_B 0;0 0;0<br>
6 KEY_ZL 0;0 0;0<br>
41 KEY_ZL;KEY_Y 0;0 0;0<br>
43 KEY_X;KEY_A 32767;0 0;0<br>
44 KEY_A 32767;0 0;0<br>
45 NONE 32767;0 0;0<br>
46 NONE 0;0 0;32767<br>
47 KEY_A -32767;0 0;0<br>
</div></article>

For more advanced scripts you can take a look at this Super Mario Odyssey [TAS script](./script0-1.txt) made by matthewpugs24.
{{< youtube Gh2aCXdnZRk >}}