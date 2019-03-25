SocketSerf
==========

Using node.js, creates a generic WebSocket server for multiplayer games. In general, the server will handle running game sessions and send any messages received to all clients in a game session. Note that a lot of the stuff in this readme is not yet implemented. The readme is the planned stuff.

    cd SocketSerf
    node .

Will create a server on that machine. The server will begin listening for connections over WebSocket's on port 13375 (leet five).

The server uses the concept of `Player`, `Game`, and `Session` objects to handle its connections.

Player
-----------
Once a client creates a WebSocket connection to the server, a `Player` object is created for them. This holds onto their IP, their socket, and other connection information. You can also add your own values to the `Player` object if you need more advanced server support for a game – for example you can store the number of points a `Player` has.

Game
-----------
Any server logic that exists goes through `Game` objects. You can use this to make a game that has server side validation or has more complex interactions than simply sending messages around. When a `Player` connects, they tell the server which game that they intend to play, using a unique string identifier (often a game slug). The server then checks to see if it has a Game object associated with that slug. If it does not, then it will use its default behavior, which is to forward all messages received to all clients in a session. Otherwise, it will use that `Game`'s logic where it applies.

Session
-----------
A `Session` is considered a single running gameplay of a specific `Game`.
`Session`s are driven by an internal state, which can be:

`Pregame`
`Gameplay`
`Postgame`

When a `Player` connects to the server, the server checks to see if there are any `Session` objects for the `Game` that the `Player` wants to play. If it finds any that are in the `Pregame` state that have not reached their player limit, then it will add this `Player` to that `Session`. If no `Session`s are found, then a new one is created, and that `Player` is added to it. The `Session` remains in the `Pregame` state until all `Player`s in the `Session` have told the server that they're ready. Once that happens, the `Session` transitions to `Gameplay`.

The `Gameplay` state is when the server will begin relaying messages back and forth, and do anything else the particular `Game` wants it to do. This phase continues until all connected `Player`s have told the server that the game is over.

Finally, `Postgame` state commences. This is a window of opportunity for connected `Player`s to all choose a rematch option. If they do, then the `Session` will go back into the `Pregame` state.

Edge Cases
-----------
*disconnections*
During any `Session`, all other `Player`s in the `Session` will be told that the `Player` has disconnected, so that clients can update any UI necessary. If at any time the number of `Player`s in a `Session` reaches 0, the `Session` is deleted.

*scalability*
WebSocket should handle 65k connections per box. I don't know how true that is, and we're just storing stuff in JS memory. Might need DB support and such.