+++
date = "2020-09-29T23:20:00+05:30"
title = "New Feature Release - NVDEC emulation!"
author = "CaptV0rt3x"
forum = 309130
+++

Hello, yuzu fans!
Tired of broken cutscenes and having to mash your controller buttons in hopes of skipping them? Well, look no further!
Thanks to the efforts of [epicboy](https://github.com/ameerj), yuzu can now play (most of) your favorite in-game cutscene videos.
Jump right in to find out more!
<!--more-->

&nbsp;
{{< youtube usvAZosD16o >}}

# NVDEC - What is it?

For a long time, one of the most noticeable missing features of yuzu was support for NVDEC. <br>
What is [NVDEC](https://en.wikipedia.org/wiki/Nvidia_NVDEC)?
NVDEC stands for **Nvidia Video Decoder** and is a feature in Nvidia GPUs that performs video decoding.
And since the Switch has an Nvidia Tegra X1 SoC, it too makes use of its NVDEC module to offload all CPU intensive video decoding tasks to the GPU.

NVDEC supports video codecs like `MPEG-2`, `VC-1`, `H.264 (AVC)`, `H.265 (HEVC)`, `VP8`, and `VP9`, but Nintendo only exposes `H.264`, `H.265`, `VP8` and `VP9`.
Most games seem to use `H.264` because of its wide support and efficiency ratio. 
But many first party games are known to use `VP9` too - eg. Super Smash Bros. Ultimate, Pokémon: Let's Go, Pikachu/Eevee!

With NVDEC support, users no longer have to rely on old save files or crazy button mashing to bypass broken cutscenes. 
Grab the latest yuzu Early Access build to try it out now!

&nbsp;
{{< youtube XsXpxZE2rcc >}}
&nbsp;

# Development

The Switch uses NVDEC along with VIC (Video Image Composer) in the GPU for video decoding.
Games are exposed to higher level APIs by Nintendo which abstract the configuration of these modules.

NVDEC and VIC work together to decode incoming videos and the process usually goes like this:

	- Allocate memory
	- Place encoded video frame data in known memory location
	- Decode and place frame data into GPU memory
	- Clear intermediary allocated memory

Although this seems fairly simple, implementing it was quite the task.
[epicboy](https://github.com/ameerj) began working on this by implementing the service/command calls to NVDEC and VIC.
It was decided to use the [FFmpeg](https://github.com/FFmpeg/FFmpeg) library to decode the frame data once we knew its codec (`H.264` or `VP9`).	

&nbsp;
{{< youtube EGDodmeKGWY >}}
&nbsp;

### VP9 

`VP9` was the biggest challenge as its decoding required knowledge on the different attributes of a specific frame.
Each frame carries two headers and raw frame data with it.
The headers contain the information as to which previous frame the current frame refers to or depends on.
Frames usually refer to previously decoded frames, along with transformations to be done on various parts of those, to compose new frames.
This is done in an effort to reduce the memory footprint of each frame.

Here is where things got complicated.
On the Switch, these headers are parsed by the Nvidia library in the games; therefore, NVDEC never receives this data.
But for us to decode the frames using FFmpeg, we need to provide it with the full frame - Two headers and raw frame data from NVDEC.
And since NVDEC hardware doesn't expose all of the data of the two `VP9` headers, [epicboy](https://github.com/ameerj) had to manually compose these headers from the provided information.

[epicboy](https://github.com/ameerj) took an interesting approach to this problem - he buffered two frames in advance.
As the frame data from NVDEC holds some data on previous frames, knowing two frames in advance was useful.
But this wasn't sufficient as a few games resulted in issues with this approach.
We are currently researching these edge cases to properly fix it for all games.

&nbsp;
{{< youtube xHYYntEB05o >}}
&nbsp;

### H.264

`H.264` was relatively easier compared to `VP9`.
Each `H.264` frame contains two headers and raw frame data with it.
Unlike `VP9`, `H.264` doesn't have different headers for each frame but has same headers for entire video.

[ogniK](https://github.com/ogniK5377) had, long ago, already implemented `H.264` support in his experimental branch.
[epicboy](https://github.com/ameerj) based his work off of [ogniK](https://github.com/ogniK5377)'s and fixed a bug in it which caused distorted videos.
It turned out that [ogniK](https://github.com/ogniK5377) was using incorrect dimensions when writing the pixel location.

Currently NVDEC operations are synchronous, but are asynchronous compatible.
This means that in the future, NVDEC operations can be made asynchronous thus yielding even better performance.
Also, thanks to the FFmpeg library, we have access to hardware acceleration for faster decoding.
And in the future, this will allow yuzu to offload video decoding to the host GPU (user's GPU).

&nbsp;
{{< youtube ImXim7BXl0E >}}
&nbsp;

### VP8 & H.265

The Switch officially supports `VP8` and `H.265` too, along with `VP9` and `H.264`.
However, we are yet to see games make use of these codecs for in-game videos and hence support for these codecs remains unimplemented for now.

# Testing

As development work progressed, there were a lot of challenges and issues with games.
**Link's Awakening**, for example, wasn't providing the proper memory locations to write frame data to and
the NVDEC/VIC service/command calls were inaccurate as well.
This led to data corruption when we wrote frame data to wrong memory locations.

&nbsp;
{{< youtube 4Lz1NqZsYlA >}}
&nbsp;

[epicboy](https://github.com/ameerj) and our testers spent tens of hours testing various games in yuzu to make sure any minor issues were ironed out.
This rigorous testing also brought to our attention more games that exhibit weird edge cases.
Over the next couple of weeks, we plan to fix these bugs and make our decoding even more accurate.

Huge shoutout to our testers for testing and compiling these lists.

{{< message "Games that work" >}}
The following games were tested by our team and work well with minor occasional glitches:

* 1-2-Switch 
* AI: The Somnium Files
* Animal Crossing: New Horizons
* Attack on Titan 2
* Atelier Ryza: Ever Darkness & the Secret Hideout
* Bloodstained: Ritual of the Night
* Bulletstorm
* Children of Morta
* Dark Souls Remastered
* Deadly Premonition Origins
* Devil May Cry
* Devil May Cry 2
* Devil May Cry 3
* Disgaea 5 Complete
* Donkey Kong Country: Tropical Freeze
* Dragon's Dogma
* Dragon Quest Builders
* Dragon Quest XI:S
* Dragons: Dawn Of New Riders
* Fairy Tail
* Final Fantasy IX
* Fire Emblem: Three Houses
* Fire Emblem Warriors
* Go Vacation
* Hollow Knight
* Huntdown
* Hyrule Warriors: Definitive Edition
* Indivisible
* Just Dance 2020
* Kirby Star Allies
* LEGO City Undercover
* Mario Kart 8 Deluxe
* Marvel Ultimate Alliance
* Monster Boy and the Cursed Kingdom 
* ŌKAMI HD
* Paper Mario: The Origami King
* Pokkén Tournament DX
* Psyvariar Delta
* Resident Evil
* Resident Evil 0
* Resident Evil 4
* Resident Evil 5
* Resident Evil 6
* Resident Evil Revelations
* Resident Evil Revelations 2
* Ring Fit Adventure
* Rune Factory 4 Special
* Shantae and the Seven Sirens
* Star Ocean First Departure R
* Steins;Gate Elite
* Super Mario 3D All-Stars
* Super Mario Odyssey
* Super Smash Bros. Ultimate
* TLOZ - Breath of the Wild
* Tokyo Mirage Sessions #FE Encore
* Trials of Mana
* Xenoblade Chronicles Definitive Edition
* Yu-Gi-Oh: Legacy of the Duelist
{{< /message >}}

{{< message "Games with known issues">}}
The following games are known to have issues, and we are actively working on fixing them:

* Alien: Isolation
* Ni no Kuni: Wrath of the White Witch
* Onimusha: Warlords
* Persona 5 Scramble
* Resident Evil 0
* TLOZ: Link's Awakening
* The Legend of Heroes: Trails of Cold Steel III
* Final Fantasy VIII Remastered
* Pokémon Let's Go
* Pokémon Sword
{{< /message >}}


# Fin

As always, we would like to remind users that the features released on Early Access are still being worked on.
Hence not all games might behave in the way we want them to.
If you come across more games (other than the ones mentioned above) that encounter bugs or issues, feel free to
reach out to us on our [Discord server](https://discord.com/invite/u77vRWY) and share your findings.

See you next time, <br>
	- yuzu development team!


&nbsp;
{{< article-end >}}
