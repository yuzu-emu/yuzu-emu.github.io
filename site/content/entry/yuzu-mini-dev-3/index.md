+++
date = "2020-11-27T19:00:00+01:00"
title = "Mini-Series - Dev Interview #3"
author = "MysticExile" 
forum = 0 
+++

Hey there yuz-ers! We are back with the third installment of this mini series. This is Dev interview #3, let's jump right into the good stuff.
<!--more-->
***
Welcome to the third Developer Interview! This time we're interviewing the myth, the legend, [epicboy](https://github.com/ameerj)! He is the main reason why we have NVDEC now!
If you didn't know already, NVDEC is Nvidia's video decoder used by the Nintendo Switch. Without him we wouldn't be able to watch videos like Fire Emblem: Three House's intro or The Legend of Zelda: Breath of the Wild's memories.
But that's not the only thing he has done! 
He was also responsible for asynchronous shader compilation on the Vulkan renderer, GameCube Controller support and [Alpha Test Culling on the Vulkan renderer](https://github.com/yuzu-emu/yuzu/pull/4946).
Let's jump right into the interview!
***

**Q: Hey epicboy, why don't you start by telling us a bit about yourself?**

**E:** I'm just a typical college student majoring in Computer Science. I'm in my fourth year of studies out of five, pursuing both a BS and MS degree. 
To be honest, I've been suffering from imposter syndrome in my classes, so I wanted to put my programming skills to the test. 
That's what drove me to contribute to yuzu; a real-world test of the knowledge and experience I gained from my classes to prove to myself that my time at college hasn't been a waste.

**Q: Why did you choose yuzu, a Nintendo Switch emulator, specifically?**

**E:** When I first heard of yuzu, back in 2018, I was impressed by the progress made on Switch emulation so soon after the console's release. 
I continued to follow the project's progress and was inspired by the never ending drive and effort of the developers. 
Soon after SSBU was announced as playable on the emulator, which sounded too good to be true, I gave the emulator a shot and was blown away at the compatibility. 
Of course, it wasn't perfect, especially given that my beloved controller of choice, the Nintendo GameCube controller, was not compatible with the emulator. 

**Q: So you decided that it was time to take matters into your own hands and add support yourself?**

**E:** Knowing that other emulators, notably [Dolphin](https://dolphin-emu.org/) had proper support for the official GameCube adapter, 
and considering I was looking to sharpen my programming skillset, 
I decided to take the opportunity and see if I can bring that support over to yuzu, opening the option to use the GameCube controller for anyone on the emulator.

**Q: I'm sure our GC controller users are still very happy with your contribution! Why did you choose to tackle such an grand task as NVDEC?**

**E:** I found the code review for the GC adapter implementation to be really useful. 
I wanted to learn more from the very sharp yuzu developers and continued to make more contributions and became more familiar with the yuzu dev team. 
One feature that I saw many yuzu fans request was for video decoding. 
I learned that [ogniK](https://github.com/ogniK5377) had attempted at implementing nvdec before and reached out to get an understanding of this feature's scope, and challenges faced along the way. 
Before I knew it, I had access to the repository with the old implementation's code and was encouraged to find a way to finish it off.

It was intimidating at first, but the encouragement and mentorship from ogniK kept me motivated. 
It was also the first glimpse I had at the guts of yuzu, and found the work that has gone into the emulation of the Switch's GPU to be very interesting.

**Q: What obstacles did you have to overcome when implementing NVDEC?**

**E:** The earliest challenge was to understand what the data I'm looking at means. At the GPU command level, everything is hexadecimal numbers with no obvious meaning tied to it. 
Thankfully, there have been others who reverse engineered and documented the processes that the GPU goes through for the NVDEC functionality. 
I was able to get quite far with decoding H.264 videos with the help of ogniK's older implementation. But the VP9 encoded videos found in many games were very difficult to decode. 

In order to decode VP9, I needed the frame data along with a "compressed" and "uncompressed" header to be sent to [FFmpeg](https://ffmpeg.org/), a library which is widely used for video decoding. 
The Switch GPU provided me with the frame data, but the headers needed to be manually constructed based on meta data provided by the GPU. 
I found myself spending countless hours reading the VP9, and analyzing the video frame-by-frame in a tool that displays each frame's headers. Ultimately, it paid off, and many VP9 videos are decoded accurately.

{{< single-title-imgs
    "The Legend of Zelda: Link's Awakening"
    "./zla_0.png"
    "./zla_1.png" 
>}}

{{< single-title-imgs
    "Super Smash Bros. Ultimate"
    "./ssbu_0.png"
    "./ssbu_1.png" 
>}}

**Q: Quite the task I imagine. Why did you opt for FFMpeg as library instead of other alternatives?**

**E:** [FFmpeg](https://ffmpeg.org/) was kind of a no-brainer. It's fast, it's open sourced, and it's well documented. It handles decoding with little effort on the programmer's part. 
It also provides API's to re-scale and convert video formats which proved to be useful. 
The other alternative would have been writing my own software decoder from scratch, but there's no point in reinventing the wheel!

**Q: No kidding! Is there anything you're currently working on?**

**E:** Of course! I'm always looking for the next opportunity to contribute to the project, while continuing to learn and grow as a programmer as well. 
There's still some work left for me to finish up for the NVDEC implementation, so I haven't decided on what I'd like to tackle next. All I can say for now is that I genuinely enjoyed GPU related programming.

**Q: We look forward to your future contributions! Is there anything else you would like to share to our users?**

**E:** I'd like to say "thank you" to all the yuz-ers! They are always appreciative of the work the yuzu developers put into the emulator, and are always excited to know what's next for the project. 
Their demands can sometimes be overwhelming, but it continues to motivate the developers, and it's always gratifying to see the positive reaction they have when a feature they've been looking forward to finally becoming a reality.
***

A huge thanks to epicboy for taking the time to sit down with us to give us some insight on NVDEC and himself.
We hope you all enjoyed it, and we will be back soon with another featured yuzu dev to bring you behind the curtains again. Until then, thank you for your support and stay tuned!

**Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!**
**If you would like to contribute to this project, checkout our [GitHub](https://github.com/yuzu-emu/yuzu)!**