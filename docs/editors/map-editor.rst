==========
Map Editor
==========

The Map Editor lets you paint tile-based levels and backgrounds using the sprites you created in
the Sprite Editor.

How the map works
=================

The map is a grid where each cell holds a reference to a sprite index. When you call :func:`map`
in your Lua code, the engine draws every tile in the grid at its correct position.

- Each tile is **8 x 8 pixels** (same size as a sprite)
- The map uses the **same sprite sheet** as the Sprite Editor
- Painting a tile on the map means "draw this sprite at this grid position"

Painting tiles
==============

1. **Select a sprite** from the sprite sheet palette (shown alongside the map grid)
2. **Click or drag** on the map grid to place tiles
3. **Erase tiles** by selecting an empty sprite slot and painting over existing tiles

Drawing the map in Lua
======================

To render the map in your game, call :func:`map` inside ``_draw()``:

.. code-block:: lua

   function _draw()
     clear(12)
     map(0, 0)         -- draw the map at position (0, 0)
     draw_player()     -- draw the player on top
   end

The ``x`` and ``y`` parameters control where the top-left corner of the map is drawn. Combined
with :func:`camera`, you can scroll through large levels.

Map and collision
=================

The Lua API can read map tiles with :func:`mget`. This lets you ask which sprite index is stored at
a map cell and combine that value with sprite flags from :func:`fget`.

The recommended tile-flag workflow:

1. **Paint your level visually** in the Map Editor -- platforms, walls, ground
2. **Flag your collision sprites** in the Sprite Editor -- for example, turn on bit ``0`` for
   solid tiles
3. **Read map tiles in Lua** and check the tile sprite's flag:

   .. code-block:: lua

      function is_solid_at_pixel(x, y)
        tile_x = math.floor(x / 8)
        tile_y = math.floor(y / 8)
        tile_sprite = mget(tile_x, tile_y)
        return fget(tile_sprite, 0)
      end

There are still no built-in collision response helpers, so you handle movement and overlap logic
in Lua. ``mget`` and ``fget`` give you the tile data to build those checks against the map you
painted.

Since tiles are 8 x 8 pixels, converting tile coordinates to pixel coordinates is straightforward:

.. code-block:: lua

   -- A platform at tile column 9, row 20, spanning 5 tiles wide
   { x = 9 * 8, y = 20 * 8, w = 5 * 8, h = 8 }
   -- Equivalent to:
   { x = 72, y = 160, w = 40, h = 8 }

See :func:`mget` and :func:`fget` in the API reference for details.
