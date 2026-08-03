====================
Networking Functions
====================

These functions let your game host or join an online multiplayer session and share data between
players in real time. They all live in the global ``net`` table.

Sessions are created through the platform's own dialogs: :func:`net.host` and :func:`net.join`
open them for the player. The platform handles the session title, visibility (public or
invite-code), invite codes, and session browsing -- your game only decides the player capacity,
an optional default title, and *when* to host, join, or leave. Under the hood, players connect
peer-to-peer with an automatic relay fallback; your code never has to care which one is in use.

.. note::

   Except for :func:`net.host`, :func:`net.join`, and :func:`net.leave`, every ``net`` function
   requires an active session and raises the error ``net: no active session`` otherwise. See
   :doc:`/multiplayer` for the concepts behind the API.

``net.host``
============

.. function:: net.host(config, callback)

   Ask the player to create (host) a new session by opening the platform's host dialog.

   :param table config: Optional session settings (see below).
   :param function callback: Optional function called once, with no arguments, when the session
      has been created.

   Both arguments are optional, and ``net.host(callback)`` is also accepted. The ``config``
   table supports two keys; any other key is ignored:

   +-----------------+--------+---------------------------------------------------------+
   | Key             | Type   | Meaning                                                 |
   +=================+========+=========================================================+
   | ``max_players`` | number | Session capacity, **including the host**. Defaults to   |
   |                 |        | ``2``. The player cannot change it -- capacity belongs  |
   |                 |        | to the game.                                            |
   +-----------------+--------+---------------------------------------------------------+
   | ``title``       | string | Default session title offered in the dialog. The player |
   |                 |        | can edit it.                                            |
   +-----------------+--------+---------------------------------------------------------+

   The callback fires only when the session is actually created. If the player cancels the
   dialog, the callback is never called and no session starts -- design your game so it simply
   stays in its menu state in that case.

   Raises ``net: already in a session; call net.leave() first`` if a session is active. A
   second call made while a host/join dialog is still open is silently ignored (a no-op), not
   an error.

   .. warning::

      While the dialog is open a repeat call is ignored, but once the session is created an
      unconditional ``net.host`` from ``_update()`` raises ``net: already in a session`` on the
      very next frame. Guard it so it runs once, for example by switching to a ``"waiting"``
      state before the call.

   .. code-block:: lua

      net.host({ max_players = 4, title = "Tag arena" }, function()
        state = "playing"
        print("session created, id " .. net.id())
      end)

``net.join``
============

.. function:: net.join(callback)

   Ask the player to join an existing session by opening the platform's join dialog, where they
   can enter an invite code or browse public sessions.

   :param function callback: Optional function called once, with no arguments, after the session
      has been joined.

   As with :func:`net.host`, the callback fires only on success: if the player cancels the
   dialog, nothing happens. Like :func:`net.host`, it raises ``net: already in a session; call
   net.leave() first`` when a session is already active, and silently ignores a repeat call
   made while a dialog is still open.

   .. code-block:: lua

      net.join(function()
        state = "playing"
        print("joined as player " .. net.id())
      end)

``net.leave``
=============

.. function:: net.leave()

   Leave the current session and tear it down. Safe to call when there is no session (it does
   nothing). After leaving, the game may host or join again.

   .. code-block:: lua

      if game_over then
        net.leave()
        state = "menu"
      end

``net.id``
==========

.. function:: net.id()

   :returns: Your own player id in the session, as an integer.

   This is the same id other peers receive in ``peer.joined`` / ``peer.left`` notifications and
   as the ``from`` argument of custom events, so it is the natural key for per-player data in
   :data:`net.state`.

   .. code-block:: lua

      print("I am player " .. net.id())

``net.state``
=============

.. data:: net.state

   A table shared by every player in the session. Writes replicate to all peers automatically;
   reads always return the latest replicated value. A player who joins mid-game receives the
   whole current contents.

   ``net.state`` behaves like a nested Lua table:

   .. code-block:: lua

      net.state.score = 0                          -- write a value
      net.state.ball = { x = 160, y = 90, dx = 2 } -- assign a whole table at once
      net.state.ball.x = 42                        -- update a nested value
      local s = net.state.score                    -- read (nil if absent)
      net.state.bonus = nil                        -- delete a key (or a whole subtree)

   Rules and behavior:

   - Stored values are **numbers, strings, and booleans**. Nested tables are supported; storing
     a function raises ``net: cannot store a function in net.state``.
   - Assigning a table **replaces** that subtree: existing keys under the path are deleted
     first, then the table's contents are written.
   - Assigning ``nil`` deletes the key, including everything nested below it.
   - Reading an absent key returns ``nil``; reading a branch (like ``net.state.ball``)
     returns a table-like view you can index further.
   - **A branch exists only while at least one value lives under it.** Assigning an empty
     table stores nothing, so the branch still reads back as ``nil`` -- create nested data by
     assigning a non-empty table, then update its fields.
   - ``#net.state.list`` counts consecutive integer keys starting at ``1``, like a regular Lua
     sequence.
   - ``pairs(net.state.players)`` iterates the branch's direct children. **Keys come back as
     strings** (numeric ids included -- use ``tonumber`` if you need the number back).

   Because of the empty-branch rule, adding an entry to a shared collection uses this idiom
   (the first writer creates the branch, later writers go through it):

   .. code-block:: lua

      local entry = { x = 24, y = 40 }
      if net.state.players then
        net.state.players[playerId] = entry
      else
        net.state.players = { [playerId] = entry }
      end

   .. warning::

      There is no built-in write protection: any peer can write any key. Keep your game
      consistent by convention -- each player writes only its own keys, and the host owns
      everything global. See :doc:`/multiplayer`.

``net.emit``
============

.. function:: net.emit(name, payload)

   Send a one-shot custom event to the **other** players in the session.

   :param string name: Event name; receivers subscribe with ``net.on("event:" .. name, ...)``.
   :param payload: Optional value to send along -- a number, string, boolean, or (nested)
      table. Functions cannot be sent. Omitted, the receivers get ``nil``.

   The sender does **not** receive its own event: if the sender needs the same effect, apply it
   locally after emitting.

   .. code-block:: lua

      net.emit("serve", { direction = -1 })

``net.on``
==========

.. function:: net.on(pattern, callback)

   Register a callback for a network event. What arrives depends on the pattern:

   +----------------------+--------------------------+---------------------------------------+
   | Pattern              | Callback arguments       | Fires when                            |
   +======================+==========================+=======================================+
   | ``"peer.joined"``    | ``(playerId)``           | Another player joins the session      |
   +----------------------+--------------------------+---------------------------------------+
   | ``"peer.left"``      | ``(playerId)``           | Another player leaves or disconnects  |
   +----------------------+--------------------------+---------------------------------------+
   | ``"ended"``          | *(none)*                 | The session ends -- in particular     |
   |                      |                          | when the host leaves                  |
   +----------------------+--------------------------+---------------------------------------+
   | ``"event:<name>"``   | ``(from, payload)``      | A peer calls ``net.emit("<name>",     |
   |                      |                          | payload)``; ``from`` is its player id |
   +----------------------+--------------------------+---------------------------------------+
   | ``"error"``          | ``(path, reason)``       | The host rejects (and rolls           |
   |                      |                          | back) a client write to a             |
   |                      |                          | permission-protected path             |
   +----------------------+--------------------------+---------------------------------------+
   | anything else        | ``(path, newValue)``     | A matching :data:`net.state` key      |
   | (a state path)       |                          | changes                               |
   +----------------------+--------------------------+---------------------------------------+

   State patterns match dotted key paths and support two wildcards: ``*`` matches exactly one
   path segment, ``**`` matches any number of segments. Change callbacks fire only when the
   value actually changes (rewriting an identical value is silent), and they fire for your own
   writes too. The names above are reserved: ``net.on("error", ...)`` always registers the
   rejection listener, so it never observes a :data:`net.state` key literally named ``error``.
   Listening for ``"error"`` is the intended way to detect a write the host rolled back --
   see the :doc:`/tutorials/permissions` tutorial.

   .. code-block:: lua

      net.on("score", function(path, value)
        print("score is now " .. value)
      end)

      net.on("players.*.x", function(path, value)
        -- fires for players.7.x but not for players.7.inventory.gold
      end)

      net.on("players.**", function(path, value)
        -- fires for any change anywhere under players
      end)

      net.on("event:serve", function(from, payload)
        serve_ball(payload.direction)
      end)

      net.on("peer.left", function(playerId)
        net.state.players[playerId] = nil
      end)

   .. note::

      An error raised inside a ``net.on`` callback (or a lock/queue callback) is printed to the
      output panel but does **not** stop the game.

``net.lock``
============

.. function:: net.lock(path)

   Create a handle for a named mutual-exclusion lock. Locks let players compete for something
   safely -- only one peer at a time can hold a given lock, no matter how simultaneously they
   ask.

   :param string path: The lock's name. Any string; locks are independent from ``net.state``
      keys, but naming them after what they protect (``"score"``, ``"coin.3"``) is a good
      habit.
   :returns: A handle table with two functions:

   .. code-block:: lua

      local lock = net.lock("score")

      lock.acquire(function(release)
        -- exclusive section: no other peer holds "score" right now, so this
        -- read-modify-write cannot lose an increment to a simultaneous one
        net.state.score = (net.state.score or 0) + 1
        release()   -- always release when done
      end)

      if lock.is_locked() then ... end

   - ``acquire(fn)`` requests the lock. When granted, ``fn`` is called with a single argument:
     a ``release`` function that frees the lock. If the lock is busy, the request waits in a
     first-come, first-served queue and ``fn`` runs later, when the current holder releases.
   - ``is_locked()`` returns ``true`` while any peer holds the lock.

   Requests are ordered by the session host, so two peers acquiring "at the same time" are
   serialized -- one runs, then the other. If a peer disconnects while holding locks, its locks
   are released automatically and its pending requests are dropped.

   .. warning::

      Nothing prevents a peer from writing a lock-protected :data:`net.state` key without
      acquiring the lock first. A lock only protects against peers that also use it.

``net.queue``
=============

.. function:: net.queue(path)

   Create a handle for a named shared FIFO queue. All players see the same queue and pops are
   ordered by the session host, so an item is delivered to exactly one popper.

   :param string path: The queue's name. Like locks, queues live in their own namespace,
      separate from ``net.state``.
   :returns: A handle table with four functions:

   .. code-block:: lua

      local q = net.queue("respawns")

      q.push({ coin = 3 })           -- append a value
      q.pop(function(value)          -- remove the head; nil when empty
        if value then
          respawn_coin(value.coin)
        end
      end)
      local n = q.length()           -- current number of items
      local head = q.peek()          -- read the head without removing it (nil if empty)

   - ``push(value)`` appends any serializable value (numbers, strings, booleans, nested
     tables). Pushing a function raises ``net: cannot queue a function``.
   - ``pop(callback)`` removes the head and delivers it to ``callback(value)``. On an empty
     queue the callback receives ``nil``. The callback form exists because the head may live on
     another peer; treat the value as arriving "soon" rather than instantly.
   - ``length()`` and ``peek()`` read the local replica synchronously.

Host authority
==============

.. note::

   Every session has exactly one **host**: the player who called :func:`net.host`. The host
   orders state changes, lock grants, and queue operations. There is no host migration -- when
   the host leaves, the session ends for everyone and each remaining peer's ``"ended"``
   callback fires. Handle it by returning to your menu state (see :doc:`/multiplayer`).
