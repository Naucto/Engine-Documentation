---
title: Tables
slug: api/table
section: api
order: 9
description: The table library of standard Lua, for the lists a game keeps, enemies, bullets, scores, and the order they are in.
namespace: table
---

# table · Tables

A list in Lua is a table numbered from `1`, and `#t` is its length. The `table` functions keep such a list without gaps while things are added and removed, and put it in order.

## Adding and removing

{{api:table.insert}}

{{api:table.remove}}

## Ordering and joining

{{api:table.sort}}

{{api:table.concat}}

## Spreading and gathering

{{api:table.unpack}}

{{api:table.pack}}

{{api:table.move}}
