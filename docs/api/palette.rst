================
Palette Controls
================

The engine uses a color palette for all rendering. These functions let you temporarily remap
palette colors for visual effects.

The palette
===========

The palette has **16 colors**, indexes ``0`` to ``15`` (the standard PICO-8 set). Every
function that takes a color expects one of these indexes:

.. TODO: Revalidate palette assumptions in this page after the frontend rendering refactor.

+--------+-------------+-------------+
| Index  | Color       | Hex         |
+========+=============+=============+
| ``0``  | black       | ``#000000`` |
+--------+-------------+-------------+
| ``1``  | dark blue   | ``#1D2B53`` |
+--------+-------------+-------------+
| ``2``  | dark purple | ``#7E2553`` |
+--------+-------------+-------------+
| ``3``  | dark green  | ``#008751`` |
+--------+-------------+-------------+
| ``4``  | brown       | ``#AB5236`` |
+--------+-------------+-------------+
| ``5``  | dark grey   | ``#5F574F`` |
+--------+-------------+-------------+
| ``6``  | light grey  | ``#C2C3C7`` |
+--------+-------------+-------------+
| ``7``  | white       | ``#FFF1E8`` |
+--------+-------------+-------------+
| ``8``  | red         | ``#FF004D`` |
+--------+-------------+-------------+
| ``9``  | orange      | ``#FFA300`` |
+--------+-------------+-------------+
| ``10`` | yellow      | ``#FFEC27`` |
+--------+-------------+-------------+
| ``11`` | green       | ``#00E436`` |
+--------+-------------+-------------+
| ``12`` | blue        | ``#29ADFF`` |
+--------+-------------+-------------+
| ``13`` | lavender    | ``#83769C`` |
+--------+-------------+-------------+
| ``14`` | pink        | ``#FF77A8`` |
+--------+-------------+-------------+
| ``15`` | peach       | ``#FFCCAA`` |
+--------+-------------+-------------+

``set_col``
===========

.. function:: set_col(index, replacementIndex)

   Temporarily remap one palette color to another.

   :param number index: Palette slot to replace.
   :param number replacementIndex: Palette slot to copy into it.

   This changes the active palette used by all subsequent rendering calls. Use it for:

   - **Damage flashes** -- swap sprite colors to white or red for a few frames
   - **Night mode** -- darken all colors
   - **Enemy recolors** -- create enemy variants by swapping specific colors
   - **Power-up effects** -- tint the player when powered up

   Invalid palette indexes print an error in the output panel. Unlike :func:`clear`, the error
   is caught by the engine: the frame keeps running with the palette unchanged.

   .. code-block:: lua

      -- Make color 8 render as color 10
      set_col(8, 10)

      -- Flash the player white on hit
      if player.hit_timer > 0 then
        set_col(8, 7)   -- swap main color to white
        set_col(9, 7)
      end

``reset_col``
=============

.. function:: reset_col()

   Restore the original palette, undoing all ``set_col`` changes.

   .. code-block:: lua

      reset_col()

   Always call ``reset_col()`` after temporary color swaps so that later drawing calls in the
   same frame use the correct colors.

Typical usage pattern
=====================

.. code-block:: lua

   function _draw()
     clear(0)

     -- Draw enemies with a red tint
     set_col(8, 4)
     for i = 1, #enemies do
       sprite(enemies[i].spr, enemies[i].x, enemies[i].y, 1, 1)
     end
     reset_col()

     -- Draw the player with normal colors
     sprite(player.spr, player.x, player.y, 1, 2)
   end
