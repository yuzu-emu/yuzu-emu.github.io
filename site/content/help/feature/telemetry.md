+++
title = "Telemetry"
description = "Telemetry features"
+++

yuzu has some [issues](https://github.com/yuzu-emu/yuzu/issues), and by its
nature as an open source project, they are visible to everyone and fixable by
anyone. Unfortunately though, most contributions are made by
[a small minority of developers](https://github.com/yuzu-emu/yuzu/graphs/contributors).
These developers have found it difficult to prioritize their efforts, since the
majority of issue reports are written scattered across Discord, Reddit, forums,
IRC, and too many other places to count.

Because of this, the yuzu team has put together a framework to report data about
how yuzu is used to our server, and use that data to discover what are the most
popular games and hardware configurations, where emulated games crash in yuzu
most often, and more. We had considered including this in last month's progress
report, but we decided that it would be best to publish this on its own, so it
gets the attention it deserves. We're very aware that privacy is important to
many of our users, and so from the earliest planning stage we knew we must be as
transparent and open about this as possible.

The telemetry framework will collect information such as:

 * Information about the version of yuzu you are using
 * Performance data for the games you play
 * Your yuzu configuration settings
 * Information about your computer hardware (e.g. GPU, CPU, and OS type)
 * Emulation errors and crash information

Not everyone is comfortable sharing information about their system, so we've made it easy to opt-out.

You may have also noticed the field titled "Telemetry ID" in the screenshots, this
is an identifier generated randomly on install which is used instead of your IP
address. This makes data collection entirely anonymous, unless you choose to log in.
You can also reset your telemetry ID if you'd like by clicking "Regenerate". The
new ID will also be completely random, and so it would be treated as a wholly new
identity.

Telemetry is an extremely useful developer tool, as they allow the developer to
be more aware of the users' needs and priorities accurately, rather than guessing.
But it is only as useful as the data obtained, which is why we urge users to not
opt-out, so the data can be as accurate and correct as possible. Just as inaccurate
measurements can damage a device during calibration, inaccurate statistical data
will only cause damage to yuzu.
