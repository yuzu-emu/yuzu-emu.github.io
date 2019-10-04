+++
date = "2019-10-04T23:51:00+05:30"
title = "yuzu - The Migration"
author = "CaptV0rt3x"
forum = 150132
+++

A very good day to you all ***yuz-ers*** out there! 
We are currently in the process of merging both the Canary and Nightly versions of yuzu into a single version.<br>
Jump right in to find out more about this!
<!--more-->
***

## Announcement

<article class="message">
<div class="message-header is-dropdown">
<p>We are merging yuzu nightly and yuzu canary releases into a single "yuzu" release!</p>
</div>
</article>

Don't fret, we are just doing some reorganization to make things easier for both the users and the developers.
Today marks the retirement of both yuzu nightly and yuzu canary release channels.
From tomorrow, yuzu will have only a single release channel, dubbed just "yuzu".

Most of you might be thinking, "why are they doing this?" or "what does this mean for the users?".
Let's go back in time for a bit to understand the "why?" part.

## A big "Why?"

When yuzu was first forked from Citra and was setting up shop as a separate project, it borrowed a few things from Citra (apart from the code).
In those, were the general ideas about build releases, build generating infrastructure, and release channel naming convention.
For a good while, these ideas served the purpose - that is to generate builds and distribute them, but it was high time for some improvements.

In the initial days of yuzu development, due to the large list of missing/unknown functionality, we had to add `asserts` (or `assertions`) wherever necessary in the codebase. 
Assertions are statements used to test assumptions made by the programmers.
This allowed us to understand what functionality we were missing and which games used those, if we needed to test them.

The philosophy behind the nightly channel was to have a release channel with asserts enabled, so that the developers keep getting data on what games were missing what functionality.
But having yuzu assert and crash while playing a game rendered it unusable for normal users.
To overcome this, we decided to release the canary builds with a specific `IGNORE ASSERTS` code included.

This made yuzu ignore all those assertions and allowed normal users to test or play games on it.
But as yuzu progressed further, the canary builds gained increased popularity among the users as the nightly builds were absolutely unusable.
Because of this the developers too had to concentrate more on the canary builds, so that they could get users to test their code and thus improve yuzu.

As we were making good progress in reducing the assertions, the nightly release branch no longer had anything to offer to the developers or the users.
It was also redundant to have two `stable` release channels for the same codebase.
Hence the reorganization.

## What does it mean for the users?

<article class="message">
<div class="message-header is-dropdown">
<p>From the user's perspective, this doesn't change anything.</p>
</div>
</article>

We are just reorganizing things internally and it will not have `any` impact for you, as end users.
With this slight reorganization, instead of multiple branches we will now have a single stable branch.
This will make it easier for new users to use yuzu.

Also, with the new release channel, we've migrated our CI from `Travis CI & Appveyor CI` to `Azure Dev Ops`.
`Azure Dev Ops` is a free and reliable service provided by Microsoft.
That means things like uptime and support are much better than `Travis or Appveyor`.
It is a single service which can generate builds for all of our platforms, which we didn't have before.
We also get more dedicated resources and therefore builds are generated much faster with Azure.

Starting today, users will be able to get the new and improved yuzu builds via the installer from our [website](https://yuzu-emu.org/download/) or our [GitHub](https://github.com/yuzu-emu/yuzu-mainline/releases/).
And if you are already using our installer, you will be automatically migrated to the latest yuzu build.

{{< imgs
    "./installer.png|yuzu Installer (Updated)"
>}}

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, checkout our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>