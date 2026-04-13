===============
Audio Functions
===============

These functions play music created in the Sound Editor.

``play_music``
==============

.. function:: play_music(index)

   Play a music slot from the Sound Editor.

   :param number index: Optional zero-based music slot index. ``0`` plays the first Sound Editor
      slot, ``1`` plays the second slot, and so on.

   When ``index`` is omitted, the engine plays the default selected slot, which is currently slot
   ``0``.

   .. code-block:: lua

      function _init()
        play_music(0)  -- play Sound Editor slot 1
      end

``stop_music``
==============

.. function:: stop_music()

   Stop the current music playback.

   .. code-block:: lua

      if key_pressed(" ") then
        stop_music()
      end
