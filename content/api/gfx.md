---
title: Rendering
slug: api/gfx
section: api
order: 1
description: The gfx functions draw every frame of the game on its 320 by 180 screen, from clearing it to sprites, shapes, text and per-row effects.
legacy_slugs:
- api/rendering.html
namespace: gfx
---

# gfx · Rendering

Everything the screen shows goes through `gfx`: the console is **320 × 180 pixels with 16 palette colours**, drawn again from scratch every frame inside `_draw()`.

The origin is the top-left corner, `x` grows to the right and `y` downwards, and every position is floored to a whole pixel before it is drawn. The [coordinates](/learn/concepts/coordinates) page has the full model.

## The frame

Clear the screen first, then draw over it. Some settings outlive the frame: **the camera, the clip, a `set_col` remap and the screen palette stay as they are** until you change them, so a camera set in `_init()` holds for the whole game and a remap forgotten in `_draw()` tints the next frame too. The row effects are the exception: they are forgotten each time a frame is shown, unless [[gfx.persist_effects]] keeps them.

The camera moves what is drawn and what [[gfx.get_pixel]] reads. It moves neither the clip rectangle, which is in screen pixels, nor [[gfx.clear]], which fills the whole screen whatever the camera and the clip say.

{{api:gfx.clear}}

{{api:gfx.width}}

{{api:gfx.height}}

{{api:gfx.camera}}

{{api:gfx.clip}}

## Sprites and the map

Sprites come from the sheet the ART tab edits, by number; the map is drawn with [[map.draw]], documented on the [map](/learn/api/map) page.

{{api:gfx.draw_sprite}}

{{api:gfx.draw_region}}

## Shapes and pixels

A colour is a palette index from `0` to `15`. **An index outside that range wraps around**: `16` draws as `0`, `-1` as `15`, and `3.7` as `3`. No function checks its colour, so nothing stops the game, and nothing draws a random colour either.

{{api:gfx.pixel}}

{{api:gfx.get_pixel}}

{{api:gfx.line}}

{{api:gfx.rect}}

{{api:gfx.fill_rect}}

{{api:gfx.circle}}

{{api:gfx.fill_circle}}

## Text

{{api:gfx.print}}

## Effects

Per-row effects for water, heat and shake. **They last one frame**: the console forgets them when the frame is shown, so set them again in every `_draw()`, or keep them with [[gfx.persist_effects]].

{{api:gfx.scanline}}

{{api:gfx.scanline_range}}

{{api:gfx.scanline_fn}}

{{api:gfx.reset_scanlines}}

{{api:gfx.persist_effects}}

The palette functions have a page of their own: [Palette](/learn/api/gfx-palette).
