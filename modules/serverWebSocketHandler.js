/*global module*/
/*global require*/
/*global console*/

var Player = require( "./player.js" ).Player;
var Game   = require( "./games/game.js"   ).Game;
var GameList = require( "./games/gameList.js" ).GameList;
var Session = require( "./session.js" ).Session;

/**
 * The ServerSocketHandler can register itself for socket.io requests, and then potentially respond to them using socket.io.
 * To add more functionality, add more into the types array, and then create matching functions. You can also use the
 * ServerSocketHandler to emit messages to the client with socket.io by calling any of the emit functions.
 */
module.exports.ServerWebSocketHandler =
{
    wss: null,
    
    register: function( wss )
    {
        this.wss = wss;
        
        //players are referenced by their player ID
        this.players =
        {
            nextId: 0
        };
        
        //an optimization to stop the nextId from getting too high over time 
        this.availablePlayerIds = [];
        
        //has slug references to arrays of active sessions
        this.sessions = {};
        
        //1 - a new connection reaches the server
        //2 - a Player object is created for that connection
        //3 - response functions are bound
        //4 - when the player sends a joinGame message, a session for that game is searched for and joined/created
        wss.on( "connection", function( ws )
        {
            console.log( "A new user connected." );
            var player = this._createNewPlayer( ws );
            
            //hook up response functions
            ws.on( "message", function( player, message )
            {
                try
                {
                    var messageData = JSON.parse( message );
                    if ( messageData.t )
                    {
                        //just in case we want to respond in a certain way to this message, handle that
                        if ( this.socketResponseFunctions[ messageData.t ] )
                        {
                            this.socketResponseFunctions[ messageData.t ].call( this, player, messageData.d );
                        }
                        
                        //tell the player's session that a message was sent too
                        if ( player.activeSession )
                        {
                            player.activeSession.player_sentMessage( player, messageData.t, messageData.d );
                        }
                    }
                    else
                    {
                        console.log( "WARN: In a message from the client, there is not a 't' element specifying the function to call." );
                    }
                }
                catch ( err )
                {
                    console.log( err.stack );
                }
                
            }.bind( this, player ) );
            
            //listen for a connection (probably redundant)
            ws.on( "open", function( player )
            {
                this.socketResponseFunctions.open( player );
            }.bind( this, player ) );
            
            //listen for a disconnection
            ws.on( "close", function( player )
            {
                this.socketResponseFunctions.close( player );
            }.bind( this, player ) );
        }.bind( this ) );
    },
    
    ///////////Response Functions///////////
    /**
     * When the client sends us a message, it will automatically try to call one of these functions to respond to it.
     * If the function name matches the emit() call from the client, then it will call that function with any sent data.
     */
    socketResponseFunctions:
    {
        open: function( player )
        {
            console.log( "    player " + player.playerId + " is fully connected." );
        },
        
        close: function( player )
        {
            console.log( "A user disconnected." );
            
            this._removePlayer( player );
        },
        
        //creates or joins a session for the given game slug
        joinGame: function( player, gameSlug )
        {
            var game = GameList.getGame( gameSlug );
            
            //if no sessions for this game exist yet, create an array for them
            if ( !this.sessions[ gameSlug ] )
            {
                this.sessions[ gameSlug ] = [];
            }
            
            //go through all the sessions and see if one has room
            var sessionList = this.sessions[ gameSlug ];
            var session = null;
            var sessionIndex;
            for ( sessionIndex = 0; sessionIndex < sessionList.length; sessionIndex++ )
            {
                var testSession = sessionList[ sessionIndex ];
                if ( testSession.canAddPlayer() )
                {
                    session = testSession;
                    break;
                }
            }

            var doSetHost = false;
            
            //if we had no available session, create one
            if ( !session )
            {
                session = new Session( game );
                sessionList.push( session );
                doSetHost = true;
            }
            
            //add this player to the session
            session.addPlayer( player );
            player.activeSession = session;

            if ( doSetHost )
            {
                session.emit ( "setHost", true, player );
            }
        },

        setPlayerUsername: function ( player, data )
        {
            var username = JSON.stringify ( data );
            player.setUsername ( username );
        }
    },
    
    _createNewPlayer: function( socket )
    {
        var playerId = this._findNextPlayerID();
        var player = new Player( socket, playerId );
        this.players[ playerId ] = player;
        return player;
    },
    
    _findNextPlayerID: function()
    {
        var nextId = this.players.nextId;
        
        if ( this.availablePlayerIds.length <= 0 )
        {
            this.players.nextId++;
        }
        else
        {
            nextId = this.availablePlayerIds[ this.availablePlayerIds.length - 1 ];
            this.availablePlayerIds.splice( this.availablePlayerIds.length - 1, 1 );
        }
        
        return nextId;
    },
    
    _removePlayer: function( player )
    {
        //remove the player from its session
        if ( player.activeSession )
        {
            player.activeSession.removePlayer( player );
        }
        
        //clear out the player from our players object, and free up their id
        this.players[ player.playerId ] = null;
        this.availablePlayerIds.push( player.playerId );
    }
};