---
title: Tilemap
slug: api/map
section: api
order: 2
description: These functions let your Lua code read the map you painted in the Map
  Editor and inspect the flags you set in the Sprite Editor.
legacy_slugs:
- api/tilemap.html
namespace: map
---

# map · Tilemap and Sprite Flags

These functions let your Lua code read the map you painted in the Map Editor and inspect the flags you set in the Sprite Editor.

{{api:map.get}}



{{api:map.flag}}

**Tile collision example**

``` lua
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
```
