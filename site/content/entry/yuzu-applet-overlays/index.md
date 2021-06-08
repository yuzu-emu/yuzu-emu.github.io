+++
date = "2021-04-03T01:00:00+05:30"
title = "New Feature Release - Applet Overlays"
author = "CaptV0rt3x"
forum = 387809
+++

Hey there, yuz-ers!
Have you ever thought of enjoying yuzu on your TV, relaxing on your couch, but found our user interface cumbersome?
Thanks to the efforts of our developers [Morph](https://github.com/Morph1984) and [Rei](https://github.com/Its-Rei), yuzu has taken a massive step forward in making couch gaming comfy.
Let's dig in!
<!--more-->

# What is this about?

For a while now, users have complained that yuzu's couch setup (full-screen, TV, controller) experience isn't as comfortable as it could be.
One pain point was that pop-ups of any kind can't be addressed with a controller.
On top of that, these pop-up windows were separate background processes that wouldn't appear until you exited full-screen mode.
As you can guess, you always had to have a keyboard and mouse handy.

{{< imgs
    "./error_old.png| Old error applet"
>}}
{{< imgs
    "./error_new.png| New controller friendly error applet"
>}}

To fix this once and for all, Rei started work on eliminating all pop-up windows and to make it possible to control all system messages with a controller.
It was during this time that Morph began working on rewriting our software keyboard applet.
And since the software keyboard applet wasn't controller friendly either, they both collaborated and redesigned it from the ground up.

{{< imgs
    "./swkbd_old.png| Old software keyboard applet"
>}}
{{< imgs
    "./swkbd_new.mp4| New controller friendly software keyboard applet"
>}}

# The Software Keyboard

As many of you might know, the Switch has a software keyboard that allows players to input text into games.
What you might not know is that there are multiple variants of keyboards implemented within the Switch's Horizon OS.
For example, there is the full-screen keyboard, which pauses games and allows input, and there is the inline keyboard, which allows input while the game is running.

Our old software keyboard implementation was just the bare minimum required by the full-screen variant and, due to its design, was difficult to add support for the other variants.
It also quickly became outdated due to the newer revisions of the applet that shipped with later Switch firmware updates.
Equipped with the knowledge and expertise from previously rewriting two other applets - namely, the browser applet & the controller applet - Morph set out to rewrite the entire software keyboard applet from scratch.

Rei had meticulously designed the new overlays for the keyboard applet and they turned out to be absolutely stunning.
Now, all that was left was to implement the keyboard applet backend and connect it to the frontend — but then came the challenges.

{{< single-title-imgs
    "The new software keyboard layouts for each yuzu theme"
    "./osk_ssbu_line_white.png"
    "./osk_ssbu_line_midnight.png"
    "./osk_ssbu_line_dark.png"
>}}

# Challenges

As mentioned earlier, our old implementation was not designed with multi-variant support in mind.
With the rewrite, our foundational goal was to ensure all keyboard variants were supported.
A major challenge was figuring out how the inline keyboard variant worked.
In contrast to the full-screen variant, this one worked asynchronously.

Applets run as separate processes on the Switch, but games have a habit of pausing their processes, invoking the keyboard applet, and making it seem synchronous.
There are several more applets that work asynchronously in addition to the inline keyboard variant.
As such, Morph spent a lot of time and effort on testing how the applet worked on original hardware — figuring out how all the pieces fall into place, making optimizations, and thus slowly perfected the backend implementation.

{{< imgs
    "./mhgu_line_swkbd.mp4| Monster Hunter Generations Ultimate - Inline Keyboard in action"
>}}
{{< imgs
    "./swsh_num_swkbd.mp4| Pokémon Sword/Shield - Numeric Keyboard in action"
>}}

With the backend in place, a new set of challenges arose due to yuzu's frontend library, [Qt](https://www.qt.io/).
Qt has a **lot** of annoying quirks, such as window positioning, transparency, and more.
These took several days of testing to track down and resolve.
For the frontend, Morph and Rei also had to plan and account for various other things like game specific keyboard scaling, high DPI displays, and higher resolutions.

The final and most important challenge was figuring out how to make the applet controller friendly.
Thanks to the efforts spent in planning and testing at various stages of development, our devs were able to overcome these challenges.

# Extra

Although the overlay dialogs were initially designed with the keyboard applet in mind, the devs soon discovered its potential as a replacement for pop-up windows.
Thanks to this, the error applet has now joined the list of controller friendly applets, with more to come soon.
The error applet is used by games to crash and report back error codes to the user in various scenarios, which was previously done via a pop-up window.

{{< single-title-imgs
    "The new error applet overlays for each yuzu theme"
    "./error_white.png"
    "./error_midnight.png"
    "./error_dark.png"
>}}

# Fin

Both the new keyboard applet and the controller friendly error applet are now available in the [latest Early Access build](https://yuzu-emu.org/help/early-access/).
Since these are currently still under development, we would like to hear more about your experiences and any bugs/issues you might encounter.
Please don't hesitate to reach out to us on our Discord server's Patreon support channels to report any findings.
That's all we have for today but, we're sure to be back with more exciting news soon!

&nbsp;
{{< article-end >}}
