---
title: Debugging Tips
slug: reference/debugging
section: reference
order: 0
description: Common issues and how to fix them.
legacy_slugs:
- debugging.html
---

# Debugging Tips

Common issues and how to fix them.

## Nothing draws on screen

Check these first:

1.  Did you define `_draw()`?
2.  Are you calling `gfx.clear(...)` at the start of `_draw()`?
3.  Are your coordinates within the visible screen area (0--319 for x, 0--179 for y)?
4.  Are you using valid sprite indexes (0--255) and palette indexes?

## Input does not work

The [[input.key_pressed]] function uses the browser's `event.key` values. The exact string is case-sensitive:

- Arrow keys: `"ArrowLeft"`, `"ArrowRight"`, `"ArrowUp"`, `"ArrowDown"`
- Space bar: `" "` (a single space character)
- Letters: `"a"`, `"d"`, `"w"`, `"s"` (lowercase)

Common mistakes:

- `"arrowleft"` -- wrong, must be `"ArrowLeft"`
- `"space"` -- wrong, must be `" "`
- `"A"` -- this only matches when Caps Lock is on; use `"a"` for normal key presses

## Colors look wrong

If you used [[gfx.set_col]] to remap palette colors, make sure you call [[gfx.reset_col]] when the effect is done. Otherwise, the swapped colors persist into all subsequent drawing calls.

``` lua
-- Wrong: color swap leaks into other sprites
set_col(8, 10)
sprite(0, x, y, 1, 1)
-- Everything after this also uses the swapped color!

-- Correct: reset after the effect
set_col(8, 10)
sprite(0, x, y, 1, 1)
reset_col()
```

## Errors in the output panel

The engine prints Lua runtime errors to the output panel. Common causes:

- **Invalid palette index** in `clear` or `set_col` (the only two that validate it)
- **Out-of-bounds tile or sprite index** in `mget` / `fget`
- **Typos in function names** -- Lua is case-sensitive (`Key_Pressed` is not `key_pressed`)
- **Lua syntax errors** -- missing `end`, unmatched parentheses, etc.
- **Nil values** -- accessing a table field that does not exist

> [!WARNING]
> With one exception, an uncaught runtime error **stops the game loop**: the screen freezes on the last frame until you fix the error and re-run. The exception is [[gfx.set_col]] / [[gfx.reset_col]], whose errors are caught and only printed.

Note that [[gfx.line]], [[gfx.rect]], and [[gfx.fill_rect]] do **not** validate the color index: an out-of-range value silently draws with a garbage color instead of raising an error. If a shape shows up in a color you never picked, check the index you passed.

## Using print for debugging

The [[sys.log]] function is your primary debugging tool. Use it to inspect values at runtime:

``` lua
function _update()
  handle_input()
  move_player()
  print("pos:", player.x, player.y)
  print("vel:", player.vx, player.vy)
  print("ground:", player.on_ground)
end
```

The output panel shows the most recent lines and automatically trims older ones.
