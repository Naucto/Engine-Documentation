---
title: Coordinates and Rendering Model
slug: concepts/coordinates
section: concepts
order: 1
description: The game canvas is 320 x 180 pixels.
legacy_slugs:
- coordinates.html
---

# Coordinates and Rendering Model

## Screen size

The game canvas is **320 x 180 pixels**.

## Coordinate system

- `(0, 0)` is the **top-left** corner of the screen
- `x` increases to the **right**
- `y` increases **downward**
- All drawing functions use **pixel coordinates**

```
(0,0) ---------------------- (319,0)
  |                            |
  |                            |
  |         320 x 180          |
  |                            |
  |                            |
(0,179) --------------------- (319,179)
```

## Sprite sheet layout

The engine uses a sprite sheet made of **8 x 8 pixel** tiles. A new game's sheet is 128 x 128
pixels; the ART editor can make it any whole number of sprites wide and tall, up to 256 x 256.

| Property           | A new game       |
|--------------------|------------------|
| Sprite size        | 8 x 8 pixels     |
| Sheet size         | 128 x 128 pixels |
| Sprites per row    | 16               |
| Total sprite slots | 256 (0 -- 255)   |

A wider sheet fits more sprites in a row, so the number of a given sprite depends on the size the
sheet is: the arithmetic below holds, but `16` is whatever the sheet's width in sprites happens to
be.

### Sprite indexing

Sprites are numbered left-to-right, top-to-bottom:

    Row 0:   [ 0][ 1][ 2][ 3] ... [15]
    Row 1:   [16][17][18][19] ... [31]
    Row 2:   [32][33][34][35] ... [47]
    ...
    Row 15:  [240] ...           [255]

- Sprite `0` = top-left corner of the sheet
- Sprite `1` = next sprite on the same row
- Sprite `16` = first sprite on the second row

To find a sprite at column `c` and row `r`:

``` lua
index = r * 16 + c
```

### Multi-tile sprites

You can draw sprites that span multiple tiles using the `width` and `height` parameters of the [[gfx.draw_sprite]] function. For example, a 16 x 16 pixel character uses `width = 2, height = 2`.

``` lua
-- Draw a 2x2 tile gfx.draw_sprite (16x16 pixels) starting at index 0
gfx.draw_sprite(0, x, y, 2, 2)
```

The engine draws a rectangular block of tiles from the sprite sheet starting at the given index.
