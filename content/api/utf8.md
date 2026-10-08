---
title: UTF-8
slug: api/utf8
section: api
order: 11
description: The utf8 library of standard Lua, for text counted in characters rather than bytes, such as a player's name with accents.
namespace: utf8
---

# utf8 · UTF-8

A Lua string is a row of bytes, and a letter such as `é` takes two of them, so `#s` and [[string.sub]] count bytes. The `utf8` functions count characters instead, which matters for text a player typed.

{{api:utf8.len}}

{{api:utf8.offset}}

{{api:utf8.codes}}

{{api:utf8.codepoint}}

{{api:utf8.char}}

{{api:utf8.charpattern}}
