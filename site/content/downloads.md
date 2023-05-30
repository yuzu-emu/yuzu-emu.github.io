---
title: "Downloads"
layout: "downloads"
FullWidth: true
---

<div class="tab-content" id="tab-windows">
<h2 class="hide-with-js mt-5">Windows Instructions</h2>
<article class="message has-text-weight-semibold">
<div class="message-body">
<p style="color:cyan;margin-bottom: 0px;">yuzu requires the latest versions of Microsoft Visual C++. 
Please download and install the dependency from below.</p>
<a href="https://aka.ms/vs/17/release/vc_redist.x64.exe">Download Microsoft Visual C++ 2022 here!</a>
</div>
</article>

<h4>Windows Installer</h4>

The installer will allow you to download your preferred release channel. 

If you are a Patreon subscriber, the "Early Access" channel will be available to you, and will provide early access to exciting experimental changes on top of what is available in the main channel. Please follow our [Early Access guide](https://yuzu-emu.org/help/early-access/) for assistance linking your Patreon account.

Intel and AMD users are strongly recommended to switch to Vulkan by going to `Emulation > Configure > Graphics > API`. Latest GPU drivers are recommended.
</div>



<div class="tab-content" id="tab-linux">
<h2 class="hide-with-js mt-5">Linux Instructions</h2>
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
</div>

<div class="tab-content" id="tab-android">
<h2 class="hide-with-js mt-5">Android Instructions</h2>
<article class="message has-text-weight-semibold">
<div class="message-body">
<p style="color:cyan;margin-bottom: 0px;">yuzu requires Android 11 or above.</p>
</div>
</article>

<div class="columns is-desktop" style="text-align: center;">
    <div class="column">
    <a href="https://play.google.com/store/apps/details?id=org.yuzu.yuzu_emu">
        <div style="align-items: center"><img alt="yuzu mainline" src="/entry/yuzu-android/svg/mainline.svg" width="400"></div>
        <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="200">
    </a>
    </div>
    <div class="column">
    <a href="https://play.google.com/store/apps/details?id=org.yuzu.yuzu_emu.ea">
        <div style="align-items: center;"><img alt="yuzu early access" src="/entry/yuzu-android/svg/early_access.svg" width="400"></div>
        <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="200">
    </a>
    </div>
</div>
