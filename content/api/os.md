---
title: Lua · os
slug: api/os
section: api
order: 13
description: The part of the os library of standard Lua a game can reach, the clock and the date of the player's machine.
namespace: os
---

# os · Clock and date

The `os` library keeps only its clock and its calendar on the console; the functions that run commands or read the environment are gone. These read the player's machine, so they differ from one player to the next: for anything that has to stay in step with the game, [[sys.time]] and [[sys.frame]] count steps.

{{api:os.time}}

{{api:os.date}}

{{api:os.clock}}

{{api:os.difftime}}
