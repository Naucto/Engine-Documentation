===========
Multiplayer
===========

Naucto games can be played online by several players at once. This page explains the model
behind the ``net`` API; the function-by-function reference lives in :doc:`/api/networking`.

Sessions and the host
=====================

A multiplayer game runs inside a **session**. One player creates it with ``net.host`` and
becomes the **host**; the others enter with ``net.join``. The platform takes care of the whole
matchmaking surface -- session titles, public visibility, invite codes, browsing -- through its
own dialogs. Your game decides only the capacity (``max_players``), an optional default title,
and when to call ``net.host``, ``net.join``, and ``net.leave``.

The host is the session's referee. All shared writes, lock grants, and queue operations are
ordered by the host, which is what keeps every player's view consistent. Two consequences:

- **Give global responsibilities to the host.** Physics for shared objects, scoring decisions,
  spawning -- run them on the host and let the results replicate.
- **There is no host migration.** When the host leaves, the session ends for everyone and each
  peer's ``net.on("ended")`` callback fires.

Players connect directly to the host peer-to-peer, with an automatic relay fallback when a
direct connection is impossible. This is invisible to your code.

Three ways to communicate
=========================

The API offers three complementary tools; picking the right one keeps your game simple.

**Shared state --** ``net.state``
   A replicated table for anything that *is* -- positions, scores, the ball, the world. Write
   it like a normal table; every peer reads the same values, and late joiners automatically
   receive the current contents. React to changes with ``net.on("some.path", ...)``.

**Events --** ``net.emit`` / ``net.on("event:...")``
   One-shot messages for things that *happen* -- a serve, a tag, a game start. Events are not
   stored: a player who joins later never sees past events, so anything that must survive a
   join belongs in ``net.state`` instead. The sender does not receive its own event.

**Locks and queues --** ``net.lock`` / ``net.queue``
   Coordination primitives for when players *compete* -- two players grabbing the same coin, or
   work items that exactly one peer should process. Both are ordered by the host, so
   "simultaneous" actions are cleanly serialized.

Who writes what
===============

``net.state`` is **allow-by-default**: with nothing configured, any peer can read or write
any key, and games stay consistent by **ownership convention**:

- Each player writes only its own branch, keyed by its player id:

  .. code-block:: lua

     -- once, when joining the game (the first player creates the branch;
     -- see the net.state reference for why the if is needed)
     local entry = { x = 24, y = 40 }
     if net.state.players then
       net.state.players[net.id()] = entry
     else
       net.state.players = { [net.id()] = entry }
     end

     -- each frame, only your own keys
     net.state.players[net.id()].x = my_x

- The host writes everything global: the ball, the scores, who is "it".
- Everyone may *read* everything.

When two peers genuinely must write the same key, protect it with ``net.lock``.

Enforcing it: permissions
-------------------------

Convention is enough for a cooperative game, but you can make it a rule. The **MULTIPLAYER**
tab in the editor gives every ``net.state`` path two flags, enforced by the host at runtime:

- **Clients can write** (off = only the host may write it). A client's write to a protected
  path is rejected and rolled back -- so a player cannot set its own ``score`` or declare
  itself the ``winner``.
- **Clients can read** (off = the host keeps it private). The host never sends the path to
  clients, in snapshots or live updates -- for server-only state like a shuffled deck.

Flags inherit from the nearest configured ancestor, and paths you never configure stay fully
open, so existing games are unaffected. The host is always the authority (there is no
"server" role to restrict). See :doc:`tutorials/permissions` for a worked example.

Session lifecycle
=================

A robust multiplayer game is a small state machine around the session:

.. code-block:: text

   "menu"            player presses a key; the game calls net.host(...) or net.join(...)
     |
     v
   "waiting"         a platform dialog is open; the game idles
     |                 - player cancels: nothing fires -- offer the menu again
     |                 - success: your callback fires
     v
   "playing"         net.state / net.emit / locks / queues are usable
     |                 - net.on("peer.joined"): a player arrived (mid-game joins included)
     |                 - net.on("peer.left"):   a player disconnected; clean up its state
     |                 - net.on("ended"):       the host left; the session is gone
     v
   back to "menu"    via net.leave() or the "ended" callback

Points that deserve care:

- ``net.host`` and ``net.join`` raise an error only if called while a session is already
  active; a repeat call made while a dialog is still open is silently ignored. Either way, don't
  call them unconditionally every frame -- switch state first so the flow stays clear.
- The success callback is the only signal: if the player cancels the dialog, your game simply
  stays where it was.
- Outside a session, every other ``net`` function raises ``net: no active session``. Gate your
  network code behind your ``"playing"`` state.
- Re-running or reloading the game tears the session down automatically.

Practical constraints
=====================

- **Serializable data only.** Shared values are numbers, strings, and booleans; nested tables
  are flattened into their scalar leaves. Functions can never be shared, sent, or queued.
- **Change events fire on real changes.** Writing the same value again is silent -- you cannot
  use a state write as a "ping"; use ``net.emit`` for that.
- **Iteration keys are strings.** ``pairs(net.state.players)`` yields string keys, even for
  numeric player ids.
- **Capacity is fixed by the game.** Players cannot raise ``max_players`` from the dialog.

Ready to build something? The :doc:`/tutorials/pong`, :doc:`/tutorials/click-race`, and
:doc:`/tutorials/tag` tutorials each exercise a different part of the API.
