========================
Tilemap and Sprite Flags
========================

These functions let your Lua code read the map you painted in the Map Editor and inspect the
flags you set in the Sprite Editor.

``mget``
========

.. function:: mget(x, y)

   Read a tile from the map.

   :param number x: Tile column in the map grid.
   :param number y: Tile row in the map grid.
   :returns: Sprite index stored at that map cell.

   ``mget`` uses tile coordinates, not pixel coordinates. Since each tile is ``8 x 8`` pixels,
   divide world positions by ``8`` and floor the result when converting a pixel position to a map
   tile.

   .. warning::

      Reading outside the map -- the default map is **128 x 32 tiles**, so columns ``0``--``127``
      and rows ``0``--``31`` -- raises a fatal runtime error that stops the game. Bounds-check
      the coordinates first (see the example below).

   .. code-block:: lua

      tile_x = math.floor(player.x / 8)
      tile_y = math.floor((player.y + 8) / 8)
      tile_sprite = mget(tile_x, tile_y)

``fget``
========

.. function:: fget(spriteIndex, bit)

   Read the flags stored on a sprite in the Sprite Editor.

   :param number spriteIndex: Sprite index in the sprite sheet (0--255).
   :param number bit: Optional bit index from ``0`` to ``7``.
   :returns: The full flag value when ``bit`` is omitted, or ``true``/``false`` for a single bit.

   A ``spriteIndex`` outside ``0``--``255`` or a ``bit`` outside ``0``--``7`` raises a fatal
   runtime error that stops the game.

   Use sprite flags to attach lightweight gameplay metadata to sprites. A common pattern is to
   mark map tile sprites with flag bits such as "solid" or "hazard", then check those flags after
   reading tiles with :func:`mget`.

   .. code-block:: lua

      tile_sprite = mget(tile_x, tile_y)

      if fget(tile_sprite, 0) then
        -- bit 0 is enabled: treat this tile as solid
      end

      flags = fget(tile_sprite)  -- full 0-255 flag value

.. rubric:: Tile collision example

.. code-block:: lua

   TILE_SIZE = 8
   MAP_W, MAP_H = 128, 32
   FLAG_SOLID = 0

   function is_solid_at_pixel(x, y)
     local tile_x = math.floor(x / TILE_SIZE)
     local tile_y = math.floor(y / TILE_SIZE)

     -- Outside the map: mget would raise an error, so treat it as empty
     if tile_x < 0 or tile_x >= MAP_W or tile_y < 0 or tile_y >= MAP_H then
       return false
     end

     return fget(mget(tile_x, tile_y), FLAG_SOLID)
   end
