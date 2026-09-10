---
title: Rendering
slug: api/gfx
section: api
order: 1
description: 'These functions handle all visual output: clearing the screen, drawing
  sprites, tilemaps, and geometric shapes.'
legacy_slugs:
- api/rendering.html
namespace: gfx
---

# gfx · Rendering Functions

These functions handle all visual output: clearing the screen, drawing sprites, tilemaps, and geometric shapes.

{{api:gfx.clear}}



{{api:gfx.draw_sprite}}



{{api:map.draw}}



{{api:gfx.camera}}



{{api:gfx.line}}



{{api:gfx.rect}}



{{api:gfx.fill_rect}}

> [!NOTE]
> [[gfx.line]], [[gfx.rect]], and [[gfx.fill_rect]] do not validate `colorIndex`: an out-of-range value silently draws with a garbage color instead of raising an error. Only [[gfx.clear]] and [[gfx.set_col]] check their palette index.
