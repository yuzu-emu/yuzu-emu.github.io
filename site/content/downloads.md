---
title: "Downloads"
layout: "downloads"
FullWidth: true
---



## Windows

<article class="message has-text-weight-semibold">
<div class="message-body">
<p style="color:cyan;margin-bottom: 0px;">yuzu requires the latest versions of Microsoft Visual C++. 
 Please download and install the dependency from below.</p>
<a href="https://aka.ms/vs/17/release/vc_redist.x64.exe">Download Microsoft Visual C++ 2022 here!</a>
</div>
</article>

#### Windows Installer

The installer will allow you to download your preferred release channel. 

If you are a Patreon subscriber, the "Early Access" channel will be available to you, and will provide early access to exciting experimental changes on top of what is available in the main channel. Please follow our [Early Access guide](https://yuzu-emu.org/help/early-access/) for assistance linking your Patreon account.

Intel and AMD users are strongly recommended to switch to Vulkan by going to `Emulation > Configure > Graphics > API`. Latest GPU drivers are recommended.

## Linux

<link href="//cdn.jsdelivr.net/npm/font-logos@0.18/assets/font-logos.css" rel="stylesheet">
<article class="message has-text-weight-semibold">
<div class="message-body">
<p style="color:cyan;margin-bottom: 0px;">We have yuzu as an AppImage and Flatpak now! This relaxes dependency requirements for yuzu, as well as enabling it to run on a lot of older distributions.</p>
</div>
</article>

If you prefer to use the Flatpak version, you can download it from the <a href="https://flathub.org/apps/details/org.yuzu_emu.yuzu"><span class="fl-flathub"></span>&nbsp;Flathub</a>.

To run yuzu as an AppImage, first download it, then add the executable bit from the terminal:

```
chmod a+x yuzu-*.AppImage
```

Or with the GUI, right click the AppImage, click Properties, then Permissions, then click "Allow this file to run as a program". After that, double-click the AppImage to run it.
