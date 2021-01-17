+++
date = "2021-01-16T21:00:00-03:00"
title = "New Feature Release - Buffer Cache Rewrite"
author = "CaptV0rt3x"
coauthor = "GoldenX86"
forum = 0
+++

Hey there, yuz-ers! The follow-up to our [previous big code rewrite](https://yuzu-emu.org/entry/yuzu-tcr/) is finally here: the Buffer Cache Rewrite!
This massive undertaking not only improves performance significantly, but also simplifies the code for our developers.
Now let's get this article started!

<!--more-->

## So, what does a Buffer Cache do?

As the name implies, a Buffer Cache — well — caches (stores) buffers.
That might not have made much sense, but that's what it does.

In graphics programming, for the GPU to render anything it needs data like position, color, etc.
Usually, this data is supplied by the application.
But when we have large applications dealing with large volumes of data, it becomes increasingly difficult to constantly supply the GPU 
with data and have it render.
Hence, buffer objects were introduced.

Buffer objects are memory objects that store the render data in the GPU memory — thereby increasing reusability significantly.
There are various types of bindings, commonly referred to as buffer types, like index buffers, vertex buffers, and uniform buffers (among others).
This improves the rendering performance because the data is now readily available for the GPU to use.

### yuzu's Buffer Cache

Coming back to yuzu's case, yuzu initially inherited a stream buffer — originally implemented for [Citra](https://citra-emu.org) by [degasus](https://github.com/degasus).
A stream buffer works in a modify/use cycle, meaning you frequently update the buffer object and you bind that region.
[Rodrigo](https://github.com/ReinUsesLisp) and [Blinkhawk](https://github.com/FernandoS27) later implemented our existing buffer cache to work alongside the stream buffer.

There was nothing inherently wrong with it; stream buffers are in fact one of the fastest ways to upload data to the GPU.
But when [Rodrigo](https://github.com/ReinUsesLisp) profiled yuzu, the cache management and upload copies were something that kept popping up as slow.

{{< message "Profiling" >}}
In software engineering, profiling ("program profiling", "software profiling") is a form of dynamic program analysis that measures, for example, the space (memory) or time complexity of a program, 
the usage of particular instructions, or the frequency and duration of function calls. Most commonly, profiling information serves to aid program optimization.
{{< /message >}}

The problem lay in the fact that games aren't exactly streaming data all the time.
So using immediate uploads (on OpenGL) and faster caching yielded much better performance than having a stream buffer and caching large resources, at least for Nvidia.
Upon further testing, we found that this turned out to be false for non-Nvidia drivers on OpenGL (AMD, Intel, and Mesa) and hence had to add a stream buffer for small uploads in these drivers.

## What's changed now?

The technical design goals for the Buffer Cache Rewrite were the same as our Texture Cache Rewrite.

- Cleaner code: No more virtual function calls or shared pointers, meaning easier maintenence in the future.
- Improved efficiency and improved performance.

Resolving which buffer existed in which memory region was a very expensive operation in our old buffer cache implementation.
This is why the stream buffer existed — to make it faster.

The new Buffer Cache has vastly improved tracking for the various buffers it caches.
In the new implementation, when buffers are created in the memory, they are forcibly aligned to 4K [pages](https://en.wikipedia.org/wiki/Page_(computer_memory)) (4096 bytes - starting at zero).
And to efficiently know what buffer exists on what address, the cache uses a flat array 32 MiB wide to translate from the current CPU page where the buffer exists to what buffer resides in it.
`e.g., if the address is 4096 or 7000, that is page 1 & if it is 8192, that is page 2.`
Thus, the new Buffer Cache can track what pages of a buffer have been modified on a page basis instead of being a binary state.

Imagine if a buffer has a size of 524288 bytes and a game modifies only 1 byte of the buffer.
Since buffers are now aligned to 4096 bytes as mentioned earlier, only those 4096 bytes are uploaded to the GPU.
The same thing happens when the GPU tries to update the cache with data modified by the CPU.

This tracking is done by making use of bit arrays in the buffers.
Each value represents the state of the page - 1 being modified, 0 being clear.
Keeping things in a bit array allows us to use efficient bit operations like `std::countr_zero` and `std::countr_one` (C++20).
This results in fewer instructions yielding the same results (much faster).

## All right, let's talk performance gains!

The main focus of this work is to improve performance, but some graphical improvements also resulted from this rewrite.

{{< single-title-imgs
    "Vertex explosions are no longer a problem in OCTOPATH TRAVELER"
    "./otbug.png"
    "./otfix.png"
  >}}
  
{{< single-title-imgs
    "Font rendering is now working for all GPU vendors in Animal Crossing: New Horizons"
    "./acnhbug.png"
    "./acnhfix.png"
  >}}

{{< single-title-imgs
    "Item drops stop flickering in Xenoblade Chronicles Definitive Edition"
    "./xbdebug.mp4"
    "./xbdefix.mp4"
  >}}

With that out of the way, let's talk about performance. Of course, metrics will vary greatly depending on the hardware and API in use.
Here are some examples measured after a couple of runs in the most demanding or common areas of the games listed:

Nvidia, in this example represented by an RTX3070, shows up to 84% improved performance in OpenGL.
{{< imgs
    "./nvbench.png| "
  >}}

AMD on the other hand, represented by a small RX550, shows an up to 55% improvement in Vulkan.
{{< imgs
    "./amdbench.png| "
  >}}

Regarding Intel, an unsurprising problem arises. All currently released products bottleneck due to immature drivers and simply lacking the raw power for Switch emulation. This results in little to no performance improvements with this rewrite. Hopefully this can be addressed with future improvements to both yuzu and Intel's future drivers and hardware releases.

As a special mention, AMD Vega based integrated GPUs show an up to 223% increase in `Paper Mario the Origami King`, reaching the same level of performance as dedicated cards of a much higher calibre.

## Fin

With that, we conclude our coverage of the new Buffer Cache Rewrite.
As always, we would like to remind users that the features released in [Early Access](https://yuzu-emu.org/help/early-access/) are still being worked on.
If you come across any bugs, issues, performance loss, crashes, or regressions with this new feature, please
reach out to us on our [Discord server](https://discord.com/invite/u77vRWY) and share your findings.

See you next time, <br>
	- yuzu development team!

&nbsp;
<h4 style="text-align:center;">
<b>Please consider supporting us on [Patreon](https://www.patreon.com/yuzuteam)!<br>
If you would like to contribute to this project, check out our [GitHub](https://github.com/yuzu-emu/yuzu)!</b>
</h4>
