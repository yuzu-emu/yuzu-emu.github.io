+++
date = "2019-09-09T00:55:00+05:30"
title = "yuzu Patreon Preview Release September 2019"
author = "CaptV0rt3x"
forum = 144316
+++

Good Day yuz-ers! (*yeah, that's sticking!*)
Many of you thought that yuzu's development slowed down, didn't you?
Well, guess again - The team has been working tirelessly to bring you this exciting new feature!
What is it? Jump right in to find out!
<!--more-->
****
{{< single-title-imgs
    "Super Mario Maker 2 - Rescaled to 6k"
    "./smm2-1.jpg"
    "./smm2-2.jpg"
    "./smm2-3.jpg"
>}}

{{< message "Images take time to load, Please wait patiently.">}}
{{< / message >}}

We hope everyone had an enjoyable and relaxing summer.
While you may have noticed a bit of a lull during August, make no mistake that our team was still hard at work!
Behind the scenes, our GPU team has been investing a ton of time and talent into bringing about this patreon releases' biggest feature: `Resolution Rescaler!`

### You can download this release on our [Patreon](https://www.patreon.com/yuzuteam)!

As you might expect from the name, this feature increases native resolution through a set of rules enforced by a profile, very similar to other emulators such as Cemu.
You'll notice an option to `Enable Resolution Scanner` in your graphics settings menu.

- When this option is `ON`, yuzu will continuously learn more about your specific games rendering methods, and will help create a resolution profile for that game.
- Once a profile is generated or obtained, the user can then select what multiplier they would like to increase their resolution by (2x, 4x, etc - `Auto sizing does not work!`). 

This of course doesn't come without a few kinks that need to be ironed out.
For now, some of the dev teams known issues include:

 - `Super Mario Odyssey` and `The Legend of Zelda: Breath of the Wild` won't rescale correctly on the edges due to a hardcoded AA shader that those games have. <br>
 The game itself will still look better and more accurate, but you'll noticed the jagged edges typically associated with hardcoded AA games.
 
 {{< single-title-imgs
     "The Legend of Zelda: Breath of the Wild - Rescaled to 6k"
     "./botw-1.jpg"
     "./botw-2.jpg"
     "./botw-3.jpg"
 >}}
 
 - `Pokémon: Let's Go` and some other games have small rendering artefacts when rescaled, such as the flames on Charizard's tail do not render.
 
 {{< single-title-imgs
     "Super Mario Odyssey - Rescaled to 6k"
     "./smo-1.jpg"
     "./smo-2.jpg"
     "./smo-3.jpg"
 >}}

That's not all that has changed, other notable fixes include:

- sRGB has been fixed. This essentially corrects some games that looked lighter than usual  .
- Viewport and scissor testing have been corrected, which fixes a ton of issues in many different games, most notably in `Hyrule Warriors`.

{{< single-title-imgs
    "Hyrule Warriors - Rescaled to 6k"
    "./hw-1.jpg"
    "./hw-2.jpg"
    "./hw-3.jpg"
>}}

- Tons of refactoring changes, to better prepare us for our Vulkan backend and other future improvements. 
- Reworked GPU buffer cache is now more accurate and faster, which lead to fixes in `Super Smash Bros. Ultimate`, `Onimusa Warriors`, and many other titles.

{{< single-title-imgs
    "Super Smash Bros. Ultimate - Rescaled to 6k"
    "./ssbu-1.jpg"
    "./ssbu-2.jpg"
    "./ssbu-3.jpg"
>}}

- Corrected our shader code to help set up preparation for `Fire Emblem: Three Houses`.
- Several fixes for `Xenoblade 2` - character models look better and most vertex explosions are gone.

{{< imgs
    "./xenoblade.png|Xenoblade 2"
>}}

This is a huge release for our testing purposes.
The `Resolution Rescaler` is still being thoroughly worked on, so if you come across any bugs that weren't mentioned above, or have any feedback, please don't hesitate to share it with us in our patreon channels on our discord server.

Once again thank you for your patronage, and we look forward to hearing back from you all! <br>
Cheers, <br>
- yuzu development team

****
**If you'd like to try out this preview release, please head on over to our [Patreon](https://www.patreon.com/yuzuteam) to get access!
Thank you again for your support!**