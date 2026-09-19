---
title: Networking
slug: api/net
section: api
order: 5
description: The net functions host or join an online session, share a state table between its players, send events, and order locks and queues through the host.
legacy_slugs:
- api/networking.html
namespace: net
---

# net · Multiplayer

Host or join a session, share a state every player reads, and send events between them. **One player is the host** and orders every change. The concepts are on the [multiplayer](/learn/concepts/multiplayer) page; the permissions on the [permissions](/learn/tutorials/permissions) tutorial.

Sessions are created through the platform's own dialogs: [[net.host]] and [[net.join]] open them for the player. The platform handles the session title, visibility (public or invite code), invite codes and session browsing; your game only decides the player capacity, an optional default title, and when to host, join or leave. Players connect peer to peer with an automatic relay fallback, and your code never has to care which one is in use.

> [!NOTE]
> [[net.host]] and [[net.join]] work outside a session (inside one they raise `net: already in a session`), [[net.leave]] at any time, and [[net.lock]] and [[net.queue]] make local objects that work without a session. Everything else, [[net.on]] included, needs an active session and raises `net: no active session` otherwise: register your listeners inside the host or join callback, not in `_init`.

Every example on this page that says "inside the callback" sits in this frame:

```lua
local state = "menu"

function start_hosting()
  net.host({ max_players = 4, title = "Tag arena" }, function()
    state = "playing"
    -- the session exists from here on: net.id(), net.on(...), net.state, net.emit(...)
  end)
end
```

## Host and guests

The host keeps the one true copy of [[net.state]]. **`peer.joined` and `peer.left` fire on the host only**: a guest only ever talks to the host and is not told about the other guests. A guest's write is applied locally at once, sent to the host, and either confirmed or undone; `"error"` therefore fires only on the guest whose write was refused, with the reason `"forbidden"` (the path is not writable by guests) or `"conflict"` (another write got there first). The same `"error"` fires with `"forbidden"` when the permissions refuse a guest's lock acquire, queue push or queue pop. The host's own writes are never refused.

{{svg:img/host-guests.svg}}

Writes leave in batches: the writes made since the last `emit`, lock or queue call of the step leave together, and a batch the host refuses is refused as a whole. There is no fixed send rate and no interpolation: a value that moves every frame arrives every frame, as a series of steps.

## Permissions

What a guest may read or write is set **per path** in the NET tab ([NET](/learn/editors/net)), and the [permissions](/learn/tutorials/permissions) tutorial walks through it. A path without a rule inherits its nearest ancestor's, and everything is allowed until a rule says otherwise. A path guests may not read is never sent to them at all, not in the snapshot they get on joining nor afterwards; the host is never restricted.

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
> Every session has exactly one **host**: the player who called [[net.host]]. The host orders state changes, lock grants and queue operations. There is no host migration: when the host leaves, the session ends for everyone and each remaining peer's `"ended"` callback fires. Handle it by returning to your menu state (see [multiplayer](/learn/concepts/multiplayer)).
