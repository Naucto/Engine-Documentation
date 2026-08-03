=====================================
Permissions -- locking down net.state
=====================================

By default ``net.state`` trusts every client: any peer can write any key, and games stay
honest by :doc:`ownership convention </multiplayer>`. That is fine for a friendly game, but a
determined client could just do ``net.state.winner = net.id()`` and win. This tutorial turns
that convention into a rule the host enforces, using the **MULTIPLAYER** tab.

We build on the :doc:`click-race` game -- have it working first.

The two flags
=============

Every ``net.state`` path has two client permissions, set in the **MULTIPLAYER** tab and
enforced by the **host** at runtime:

- **Clients can write** -- when off, only the host may write the path. A client's write is
  applied optimistically and then rolled back when the host's rejection arrives, so a
  ``net.on`` change listener sees the value flip and flip back.
- **Clients can read** -- when off, the host keeps the path private: it is never sent to
  clients, in the join snapshot or in live updates.

Three things to keep in mind:

- **Allow-by-default.** A path you never configure is fully open. You opt into restrictions;
  you never have to grant permissions just to keep a game working.
- **Inheritance.** A path inherits the flags of its nearest configured ancestor, so locking
  ``players`` locks ``players.3.x`` too -- configure at the granularity you actually own.
- **The host is the authority.** There is no separate server to restrict. "Client" always
  means a joined peer.

Make the winner host-authoritative
==================================

In click-race, the client that reaches ``WIN_SCORE`` sets the winner itself, inside
``try_collect``:

.. code-block:: lua

   if me.score >= WIN_SCORE then
     net.state.winner = net.id()      -- a client declaring the result
   end

Delete those lines. The result is a global fact, so the **host** should decide it. Add a host
check and call it from the game loop:

.. code-block:: lua

   function check_winner()
     if net.state.winner then
       return
     end
     for id, p in pairs(net.state.players or {}) do
       if p.score >= WIN_SCORE then
         net.state.winner = tonumber(id)
         return
       end
     end
   end

   function update_playing()
     update_movement()
     update_collect()

     if is_host then
       update_respawns()
       check_winner()          -- the host is the referee
     end

     if net.state.winner then
       state = "over"
       -- ... (unchanged)
     end
   end

Now lock the key. In the **MULTIPLAYER** tab, add a node for ``winner`` and turn **Clients can
write** off (leave **Clients can read** on -- everyone still needs to see who won). Re-run and
host: the game plays exactly as before, because only the host writes ``winner`` now.

To see the rule bite, temporarily add ``net.state.winner = net.id()`` to a client path (say,
on a key press). Instead of ending the game it is rejected -- the write is applied for a moment
and then the host's rejection snaps the value back, so a ``net.on("winner", ...)`` listener
sees it flip and flip back.

.. note::

   A client write that batches several keys in one frame is rejected as a whole if *any* of
   them is protected, so a forbidden write never lands partially. In practice clients only
   write their own open keys, so this rarely comes up.

Keeping state server-private
============================

Turning **Clients can read** off keeps a path on the host only. Use it for anything a client
should not be able to inspect -- a shuffled deck, an AI's target, an unrevealed answer:

.. code-block:: lua

   -- host only
   net.state.deck = shuffle(make_deck())    -- with "Clients can read" off on "deck",
                                            -- clients never receive it
   net.state.top_card = net.state.deck[1]   -- reveal one card through a readable key

Clients simply never have ``net.state.deck`` in their store; reading it returns ``nil``. The
host reveals what it wants through separate, readable keys.

What to lock down
=================

A good rule of thumb: **the host owns anything global or authoritative** -- scores, the
winner, whose turn it is, spawned pickups -- and clients own only their own id-keyed branch
(their position, their inputs). Mark the global keys host-only and you have turned the
ownership convention into something the engine guarantees.
