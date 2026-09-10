---
title: API Reference
slug: api/index
section: api
order: 0
description: The Naucto Lua API provides a small, focused set of functions for building
  games. All functions are available as globals in your Lua scripts.
legacy_slugs:
- api/index.html
---

# API Reference

The Naucto Lua API provides a small, focused set of functions for building games. All functions are available as globals in your Lua scripts.

## Summary

<table style="width:99%;">
<colgroup>
<col style="width: 48%" />
<col style="width: 44%" />
<col style="width: 5%" />
</colgroup>
<tbody>
<tr>
<td rowspan="2"><blockquote>
<p>Function</p>
</blockquote>
<dl>
<dt>==============================================</dt>
<dd>
<p>[[gfx.clear]]</p>
</dd>
</dl></td>
<td rowspan="2"><blockquote>
<p>Description</p>
</blockquote>
<dl>
<dt>==========================================</dt>
<dd>
<p>Clear the screen with a palette color</p>
</dd>
</dl></td>
<td></td>
</tr>
<tr>
<td></td>
</tr>
<tr>
<td colspan="3">[[gfx.draw_sprite]] | Draw a sprite or block of sprites</td>
</tr>
<tr>
<td colspan="3">[[map.draw]] | Draw the tilemap |</td>
</tr>
<tr>
<td colspan="3">[[map.get]] | Read a tile from the tilemap |</td>
</tr>
<tr>
<td>[[map.flag]]</td>
<td>Read sprite flags</td>
<td></td>
</tr>
<tr>
<td>[[gfx.camera]]</td>
<td>Set the camera offset</td>
<td></td>
</tr>
<tr>
<td>[[gfx.line]]</td>
<td>Draw a line</td>
<td></td>
</tr>
<tr>
<td>[[gfx.rect]]</td>
<td>Draw an outlined rectangle</td>
<td></td>
</tr>
<tr>
<td>[[gfx.fill_rect]]</td>
<td>Draw a filled rectangle</td>
<td></td>
</tr>
<tr>
<td colspan="3">[[input.key_pressed]] | Check if a key is held down |</td>
</tr>
<tr>
<td colspan="3">[[sys.log]] | Write text to the output panel |</td>
</tr>
<tr>
<td>[[gfx.set_col]]</td>
<td>Remap a palette color</td>
<td></td>
</tr>
<tr>
<td>[[gfx.reset_col]]</td>
<td>Restore the original palette</td>
<td></td>
</tr>
<tr>
<td colspan="3">[[sound.play_music]] | Play a Sound Editor music slot |</td>
</tr>
<tr>
<td colspan="3">[[sound.stop_music]] | Stop music playback |</td>
</tr>
<tr>
<td colspan="3">[[net.host]] | Host an online multiplayer session |</td>
</tr>
<tr>
<td colspan="3">[[net.join]] | Join an online multiplayer session |</td>
</tr>
<tr>
<td colspan="3">[[net.leave]] | Leave the current session |</td>
</tr>
<tr>
<td colspan="3">[[net.id]] | Your player id in the session |</td>
</tr>
<tr>
<td colspan="3">[[net.state]] | Table shared by all players |</td>
</tr>
<tr>
<td colspan="3">[[net.emit]] | Send a custom event to the other players |</td>
</tr>
<tr>
<td colspan="3">[[net.on]] | React to network events and changes |</td>
</tr>
<tr>
<td colspan="3">[[net.lock]] | Mutual exclusion between players |</td>
</tr>
<tr>
<td colspan="3">[[net.queue]] | Shared first-in, first-out queue |</td>
</tr>
</tbody>
</table>
