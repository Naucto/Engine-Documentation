---
title: Naucto Game Engine
slug: index
section: start
order: 0
description: The documentation of Naucto, a fantasy console in the browser where you draw, compose, code in Lua, play with friends and publish, all in one place.
legacy_slugs:
- index.html
---

# Naucto Game Engine

Naucto is a fantasy console that lives in your browser. This page says what it is made of and where each part is documented; if you would rather start typing, go straight to [Getting started](/learn/getting-started).

## What you get

A game is drawn on a **320 × 180 screen** with sixteen colours, 8 × 8 sprites and a built-in 4 × 6 font. It is written in Lua against a small API, and everything, from the art to the sound to the code, is edited and run in the same tab of your browser.

The editor has **six tabs**, one per part of a game: GAME holds the name, summary, cover, saved versions and the Publish button; CODE holds the Lua, with the screen and the Console beside it; ART is where sprites are drawn, MAP where they are laid out into levels, SOUND where instruments, patterns and songs are made, and NET where a multiplayer game declares who may write what. Every tab is described in [Editors](/learn/editors/index).

Everything you make is saved as you go, and collaborators invited with Share edit the same game live. When it is ready, **Publish** puts it on the hub for anyone to play.

## Multiplayer

A game can be played online by several people: one player hosts, the others join, and a replicated table (`net.state`) plus events keep every screen in step. The platform handles the dialogs, invite codes and connections; the game only says how many players it takes. [Multiplayer](/learn/concepts/multiplayer) explains the model, and the [Networking](/learn/api/net) reference lists the functions.

## Where to go next

- [Getting started](/learn/getting-started) makes a first game in three steps.
- [Game loop](/learn/concepts/game-loop) and [Coordinates](/learn/concepts/coordinates) explain how a game runs and where things are drawn.
- [API reference](/learn/api/index) lists every Lua function, by namespace.
- [Tutorials](/learn/tutorials/index) build complete games: a platformer, a multiplayer pong, a coin rush, a tag arena.
- [Debugging](/learn/reference/debugging) and [Limitations](/learn/reference/limitations) are for when something does not work, or cannot.
