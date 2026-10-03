---
title: Lua · coroutine
slug: api/coroutine
section: api
order: 12
description: The coroutine library of standard Lua, for sequences that span many frames, written as one function that pauses and goes on.
namespace: coroutine
---

# coroutine · Functions that pause

A coroutine is a function that can stop half way and go on later from the same point. Resumed once per `_update`, it turns a sequence that spans many frames, a cutscene or a patrol, into one function read from top to bottom.

> [!WARNING]
> **The console's own functions cannot be called from inside a coroutine**: `print`, `gfx`, `sound` and the rest stop it with `Unsupported Lua type thread`. The coroutine changes the game's state, and `_draw` shows it.

{{api:coroutine.create}}

{{api:coroutine.resume}}

{{api:coroutine.yield}}

{{api:coroutine.status}}

{{api:coroutine.wrap}}

{{api:coroutine.running}}

{{api:coroutine.isyieldable}}
