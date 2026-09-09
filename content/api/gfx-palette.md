---
title: Palette
slug: api/gfx-palette
section: api
order: 7
description: The engine uses a color palette for all rendering. These functions let
  you temporarily remap palette colors for visual effects.
legacy_slugs:
- api/palette.html
namespace: gfx
---

# gfx · Palette Controls

The engine uses a color palette for all rendering. These functions let you temporarily remap palette colors for visual effects.

## The palette

The palette has **16 colors**, indexes `0` to `15` (the standard PICO-8 set). Every function that takes a color expects one of these indexes:

| Index | Color       | Hex       |
|-------|-------------|-----------|
| `0`   | black       | `#000000` |
| `1`   | dark blue   | `#1D2B53` |
| `2`   | dark purple | `#7E2553` |
| `3`   | dark green  | `#008751` |
| `4`   | brown       | `#AB5236` |
| `5`   | dark grey   | `#5F574F` |
| `6`   | light grey  | `#C2C3C7` |
| `7`   | white       | `#FFF1E8` |
| `8`   | red         | `#FF004D` |
| `9`   | orange      | `#FFA300` |
| `10`  | yellow      | `#FFEC27` |
| `11`  | green       | `#00E436` |
| `12`  | blue        | `#29ADFF` |
| `13`  | lavender    | `#83769C` |
| `14`  | pink        | `#FF77A8` |
| `15`  | peach       | `#FFCCAA` |

{{api:gfx.set_col}}



{{api:gfx.reset_col}}

## Typical usage pattern

``` lua
function _draw()
  gfx.clear(0)

  -- Draw enemies with a red tint
  gfx.set_col(8, 4)
  for i = 1, #enemies do
    gfx.draw_sprite(enemies[i].spr, enemies[i].x, enemies[i].y, 1, 1)
  end
  gfx.reset_col()

  -- Draw the player with normal colors
  gfx.draw_sprite(player.spr, player.x, player.y, 1, 2)
end
```
