---
title: Coroutines
slug: api/coroutine
section: api
order: 12
description: The coroutine library of standard Lua, for sequences that span many frames, written as one function that pauses and goes on.
namespace: coroutine
---

# coroutine · Coroutines

A coroutine is a function that can stop half way and go on later from the same point. Resumed once per `_update`, it turns a sequence that spans many frames, a cutscene or a patrol, into one function read from top to bottom.

> [!WARNING]
> **A coroutine cannot be printed directly**: `print(co)` stops with `Unsupported Lua type thread`. Print `tostring(co)` instead.

{{api:coroutine.create}}

{{api:coroutine.resume}}

{{api:coroutine.yield}}

{{api:coroutine.status}}

{{api:coroutine.wrap}}

{{api:coroutine.running}}

{{api:coroutine.isyieldable}}
