---
title: Networking
slug: api/net
section: api
order: 5
description: These functions let your game host or join an online multiplayer session
  and share data between players in real time. They all live in the global net table.
legacy_slugs:
- api/networking.html
namespace: net
---

# Networking Functions

These functions let your game host or join an online multiplayer session and share data between players in real time. They all live in the global `net` table.

Sessions are created through the platform's own dialogs: [[net.host]] and [[net.join]] open them for the player. The platform handles the session title, visibility (public or invite-code), invite codes, and session browsing -- your game only decides the player capacity, an optional default title, and *when* to host, join, or leave. Under the hood, players connect peer-to-peer with an automatic relay fallback; your code never has to care which one is in use.

> [!NOTE]
> Except for [[net.host]], [[net.join]], and [[net.leave]], every `net` function requires an active session and raises the error `net: no active session` otherwise. See [multiplayer](/learn/concepts/multiplayer) for the concepts behind the API.

{{api:net.host}}



{{api:net.join}}



{{api:net.leave}}



{{api:net.id}}



{{api:net.state}}



{{api:net.emit}}



{{api:net.on}}



{{api:net.lock}}



{{api:net.queue}}

## Host authority

> [!NOTE]
> Every session has exactly one **host**: the player who called [[net.host]]. The host orders state changes, lock grants, and queue operations. There is no host migration -- when the host leaves, the session ends for everyone and each remaining peer's `"ended"` callback fires. Handle it by returning to your menu state (see [multiplayer](/learn/concepts/multiplayer)).
