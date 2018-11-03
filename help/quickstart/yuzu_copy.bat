@ECHO OFF
TITLE Yuzu Copy Utility v2

ECHO Yuzu Copy Utility v2
ECHO     By DarkLordZach
ECHO 
ECHO Copying fuses...
COPY /B /Y "%~dp0\backup\dumps\fuses.bin" "%APPDATA%\yuzu\sysdata\fuses.bin"
ECHO Copying BOOT0...
COPY /B /Y "%~dp0\backup\BOOT0" "%APPDATA%\yuzu\sysdata\BOOT0"
ECHO Copying package1...
COPY /B /Y "%~dp0\backup\pkg1\secmon.bin" "%APPDATA%\yuzu\sysdata\secmon.bin"
COPY /B /Y "%~dp0\backup\pkg1\pkg1_decr.bin" "%APPDATA%\yuzu\sysdata\pkg1_decr.bin"
ECHO Copying NAND backup...
COPY /B /Y "%~dp0\rawnand.bin.00"+"%~dp0\rawnand.bin.01"+"%~dp0\rawnand.bin.02"+"%~dp0\rawnand.bin.03"+"%~dp0\rawnand.bin.04"+"%~dp0\rawnand.bin.05"+"%~dp0\rawnand.bin.06"+"%~dp0\rawnand.bin.07"+"%~dp0\rawnand.bin.08"+"%~dp0\rawnand.bin.09"+"%~dp0\rawnand.bin.10"+"%~dp0\rawnand.bin.11"+"%~dp0\rawnand.bin.12"+"%~dp0\rawnand.bin.13"+"%~dp0\rawnand.bin.14" "%USERPROFILE%\Desktop\rawnand.bin"

ECHO If no errors about missing files appeared, this utility completed successfully.
ECHO If there were errors, ensure you followed all of the steps in the guide prior to this.

PAUSE