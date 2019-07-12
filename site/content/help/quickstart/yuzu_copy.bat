@ECHO off
TITLE Yuzu Copy Utility v6

ECHO Yuzu Copy Utility 
ECHO By DarkLordZach
ECHO v6 -  07/11/2019

SET mypath=%~dp0\backup\
cd /d %mypath%
if not exist %appdata%\yuzu\sysdata\ (
mkdir %appdata%\yuzu\sysdata\
)
if exist dumps goto noid
if not exist dumps goto id

:id
for /d %%A in (*) do cd %%A
ECHO Copying BOOT0...
COPY /B /Y "BOOT0" "%APPDATA%\yuzu\sysdata\BOOT0"
if exist "rawnand.bin.00" (
ECHO Copying NAND backup...
COPY /B /Y "rawnand.bin.00"+"rawnand.bin.01"+"rawnand.bin.02"+"rawnand.bin.03"+"rawnand.bin.04"+"rawnand.bin.05"+"rawnand.bin.06"+"rawnand.bin.07"+"rawnand.bin.08"+"rawnand.bin.09"+"rawnand.bin.10"+"rawnand.bin.11"+"rawnand.bin.12"+"rawnand.bin.13"+"rawnand.bin.14" "%USERPROFILE%\Desktop\rawnand.bin"
ECHO **Your rawnand.bin files have been combined into one rawnand.bin onto your desktop.**
)
if exist "%~dp0\rawnand.bin.00" (
COPY /B /Y "%~dp0\rawnand.bin.00"+"%~dp0\rawnand.bin.01"+"%~dp0\rawnand.bin.02"+"%~dp0\rawnand.bin.03"+"%~dp0\rawnand.bin.04"+"%~dp0\rawnand.bin.05"+"%~dp0\rawnand.bin.06"+"%~dp0\rawnand.bin.07"+"%~dp0\rawnand.bin.08"+"%~dp0\rawnand.bin.09"+"%~dp0\rawnand.bin.10"+"%~dp0\rawnand.bin.11"+"%~dp0\rawnand.bin.12"+"%~dp0\rawnand.bin.13"+"%~dp0\rawnand.bin.14" "%USERPROFILE%\Desktop\rawnand.bin"
ECHO **Your rawnand.bin files have been combined into one rawnand.bin onto your desktop.**
)
if exist "rawnand.bin" (
ECHO ** Your rawnand.bin is in one file, please continue with the guide.
)
if exist "%~dp0\rawnand.bin" (
ECHO ** Your rawnand.bin is in one file, please continue with the guide.
)

ECHO **If no errors about missing files appeared, this utility completed successfully. Please continue with QuickStart guide.**
ECHO **If there were errors, ensure you followed all of the steps in the guide prior to this.**
goto exit

:noid
ECHO Copying BOOT0...
COPY /B /Y "%~dp0\backup\BOOT0" "%APPDATA%\yuzu\sysdata\BOOT0"
if exist "%~dp0\rawnand.bin.00" (
ECHO Copying NAND backup...
COPY /B /Y "%~dp0\rawnand.bin.00"+"%~dp0\rawnand.bin.01"+"%~dp0\rawnand.bin.02"+"%~dp0\rawnand.bin.03"+"%~dp0\rawnand.bin.04"+"%~dp0\rawnand.bin.05"+"%~dp0\rawnand.bin.06"+"%~dp0\rawnand.bin.07"+"%~dp0\rawnand.bin.08"+"%~dp0\rawnand.bin.09"+"%~dp0\rawnand.bin.10"+"%~dp0\rawnand.bin.11"+"%~dp0\rawnand.bin.12"+"%~dp0\rawnand.bin.13"+"%~dp0\rawnand.bin.14" "%USERPROFILE%\Desktop\rawnand.bin"
ECHO **Your rawnand.bin files have been combined into one rawnand.bin onto your desktop.**
)
if exist "%~dp0\rawnand.bin" (
ECHO ** Your rawnand.bin is in one file, please continue with the guide.
)
ECHO **If no errors about missing files appeared, this utility completed successfully. Please continue with QuickStart guide.**
ECHO **If there were errors, ensure you followed all of the steps in the guide prior to this.**
goto exit

:exit
pause
