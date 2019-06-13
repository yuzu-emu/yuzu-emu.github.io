+++
date = "2019-06-12T03:48:00+05:30"
title = "yuzu Patreon Preview Release June 12th"
author = "flamesage"
forum = 116565
+++

Good day, yuzu fans! Today we bring you another exciting yuzu update with the June 2019 Patreon Preview Release! We heard your feedback - this time around, we have some major graphical fixes!
<!--more-->

The team has been hard at work to constantly improve yuzu, and these additions are extremely important in painting the whole picture.

**You can download this release on our [Patreon](https://www.patreon.com/yuzuteam)!**

## What you'll find in this new build:
1. **A brand new Texture Cache:** As certain members of our yuzu team inch ever closer to a Vulkan implementation, they realized the current OpenGL backend has an old yet heavily modified (for yuzu) texture cache that would be incompatible with Vulkan. There were also several bugs in our current cache and not everything was being emulated correctly. Now, we have a brand new API-agnostic texture cache that works with both OpenGL (and will work with Vulkan once we complete that renderer)! It's much more accurate and performant over the old/current implementation, and should also provide several graphical fixes!
2. **Basic GPU Sync Mechanisms:** We're well aware the current Async GPU emulation has major issues. The problem was that our current implementation lacked the real syncing mechanisms used by the Nintendo Switch, thus making it very unstable and caused crashes. With this new implementation, you can expect games to work much better with Async enabled!
3. **Swap Interval Emulation:** yuzu will now properly emulate the swap interval between window's refresh times, allowing us to correctly detect a games actual refresh rate. What this basically means is that if a game natively runs at 30fps, you will no longer need the option to "force 30fps" and yuzu automatically detects the games refresh rate! We still however provide this option, as it's useful to emulate some games at lower framerates when a full 60fps cannot be achieved.

As always, we look to our dedicated Patrons to not only enjoy this new build, but to report how the build's new features are working for you. Find us on the Patreon section of discord to report issues, or just drop in to leave a comment. We look forward to continuing to lead the way in proper Switch emulation, and we again thank you for your continued support!

All the best,
yuzu Development Team

**If you'd like to try out this preview release, please head on over to our [Patreon](https://www.patreon.com/yuzuteam) to get access!
Thank you again for your support!**