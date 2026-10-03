---
title: Mathematics
slug: api/math
section: api
order: 10
description: The math library of standard Lua, for rounding positions, drawing random numbers, turning angles into directions, and the limits of the console's numbers.
namespace: math
---

# math · Mathematics

A game's numbers are positions, speeds, angles and dice. The `math` functions round them, bound them and draw them at random. Lua has two kinds of number, integers and floats, which compare equal and differ in how far they reach: **integers are 32 bits on the console**, see [[math.maxinteger]].

## Rounding and bounds

{{api:math.floor}}

{{api:math.ceil}}

{{api:math.abs}}

{{api:math.min}}

{{api:math.max}}

{{api:math.fmod}}

{{api:math.modf}}

## Random numbers

{{api:math.random}}

{{api:math.randomseed}}

## Angles

Angles are in radians: a full turn is `2 * math.pi`. On the screen `y` grows downwards, so an angle grows clockwise.

{{api:math.sin}}

{{api:math.cos}}

{{api:math.tan}}

{{api:math.atan}}

{{api:math.asin}}

{{api:math.acos}}

{{api:math.rad}}

{{api:math.deg}}

## Powers and roots

{{api:math.sqrt}}

{{api:math.exp}}

{{api:math.log}}

## Integers and floats

{{api:math.tointeger}}

{{api:math.type}}

{{api:math.maxinteger}}

{{api:math.mininteger}}

## Constants

{{api:math.pi}}

{{api:math.huge}}
