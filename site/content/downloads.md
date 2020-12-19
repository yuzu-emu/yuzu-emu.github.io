---
title: "Downloads"
layout: "downloads"
FullWidth: true
---

#### Windows Installer

The installer will allow you to download your preferred release channel. 

If you are a Patreon subscriber, the "Early Access" channel will be available to you, and will provide early access to exciting experimental changes on top of what is available in the main channel. Please follow our [Early Access guide](https://yuzu-emu.org/help/early-access/) for assistance linking your Patreon account.

### Windows

<article class="message has-text-weight-semibold">
<div class="message-body">
<p style="color:cyan;margin-bottom: 0px;">yuzu requires the latest versions of Microsoft Visual C++. 
 Please download and install the dependency from below.</p>
<a href="https://aka.ms/vs/16/release/vc_redist.x64.exe">Download Microsoft Visual C++ 2019 here!</a>
</div>
</article>

### Linux

<article class="message has-text-weight-semibold">
<div class="message-body">
<p style="color:cyan;margin-bottom: 0px;">yuzu requires the following dependencies for the most common distributions.</p>
</div>
</article>
## Ubuntu 20.04 / Debial Bullseye / Linux Mint 20 or newer:

`sudo apt update && sudo apt upgrade && sudo apt install libqt5core5a libqt5gui5 libqt5webenginewidgets5 libqt5widgets5 libsdl2-2.0-0 libswscale5 libzip5`

## Fedora 32 or newer:

`sudo dnf update && sudo dnf install SDL2 ffmpeg-libs libzip qt5-qtbase qt5-qtbase-gui qt5-qtwebengine`
RPM Fusion is required: https://rpmfusion.org/Configuration

## Arch Linux / Manjaro:
`sudo pacman -Syu --needed ffmpeg libzip qt5-base qt5-webengine sdl2`
GLIBC 2.31 or newer required.
