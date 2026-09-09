---
title: Input
slug: api/input
section: api
order: 3
description: '{{api:input.key_pressed}}'
legacy_slugs:
- api/input.html
namespace: input
---

# Input



{{api:input.key_pressed}}

## Common key values

| Key         | String         |
|-------------|----------------|
| Left arrow  | `"ArrowLeft"`  |
| Right arrow | `"ArrowRight"` |
| Up arrow    | `"ArrowUp"`    |
| Down arrow  | `"ArrowDown"`  |
| Space bar   | `" "`          |
| A key       | `"a"`          |
| D key       | `"d"`          |
| W key       | `"w"`          |
| S key       | `"s"`          |

> [!WARNING]
> Key names are **case-sensitive**. `"ArrowLeft"` works, but `"arrowleft"` does not.

## Examples

``` lua
-- Arrow key movement
if input.key_pressed("ArrowLeft") then
  player.x = player.x - 2
end

-- WASD movement
if input.key_pressed("a") then player.x = player.x - 2 end
if input.key_pressed("d") then player.x = player.x + 2 end
if input.key_pressed("w") then player.y = player.y - 2 end
if input.key_pressed("s") then player.y = player.y + 2 end

-- Space bar action
if input.key_pressed(" ") then
  jump()
end
```
