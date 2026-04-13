=======================
Current Limitations
=======================

The Naucto Lua API is focused and growing. Here are the current limitations to be aware of when
designing your games, along with recommended workarounds.

No collision queries
====================

There are no built-in collision detection functions. You must implement overlap checks yourself.
Use :func:`mget` and :func:`fget` when you want those checks to be driven by the tilemap and
sprite flags.

**Workaround:** Use a simple AABB (axis-aligned bounding box) overlap function:

.. code-block:: lua

   function overlaps(ax, ay, aw, ah, bx, by, bw, bh)
     return ax < bx + bw
        and ax + aw > bx
        and ay < by + bh
        and ay + ah > by
   end

No delta time
=============

The engine does not expose a delta time value. The game loop runs at a fixed frame rate, so
movement values are per-frame rather than per-second.

**Workaround:** Tune your movement speeds, gravity, and jump forces as per-frame values. The
platformer tutorial demonstrates this approach with values like ``speed = 1.8`` and
``gravity = 0.30``.

What works well today
=====================

Despite these limitations, the current API supports a wide range of games:

- Sprite-based characters with animation
- Arcade-style movement
- Basic platformers
- Top-down adventure games
- Puzzle games
- Simple action games
- HUDs and debug overlays with rectangles and lines
- Palette swap effects for visual variety
- Tilemap-driven logic with ``mget()`` and sprite flags
- Music playback from Sound Editor slots
