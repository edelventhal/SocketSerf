/*global console*/
/*global module*/
/*global require*/

var Class = require( "./class.js" ).Class;

var Session;
( function()
{
    "use strict";
    
    Session = module.exports.Session = Class.extend(
    {
        ctor: function( game )
        {
            this.game = game;
            this.state = Session.State.Pregame;
            this.players = [];
            
            this._currentPlayerIndex = 0;
        },

        //this function DOES NOT validate. you should do that before you even try to add a player to a session
        addPlayer: function( player )
        {
            this.players.push( player );
            player.setIsReady( false );
        },
        
        removePlayer: function( player )
        {
            var index = this.players.indexOf( player );
            if ( index >= 0 )
            {
                this.players.splice( index, 1 );
            }
        },
        
        canAddPlayer: function()
        {
            if ( this.state !== Session.State.Pregame )
            {
                return false;
            }
            
            if ( this.players.length >= this.game.getMaximumPlayerCount() )
            {
                return false;
            }
            
            return true;
        },
        
        refreshState: function()
        {
            if ( this.state === Session.State.Pregame )
            {
                var ready = true;
                var readyPlayerCount = 0;
                
                var playerIndex;
                for ( playerIndex = 0; playerIndex < this.players.length; playerIndex++ )
                {
                    var player = this.players[ playerIndex ];
                    if ( !player.isReady() )
                    {
                        ready = false;
                        break;
                    }
                    else
                    {
                        readyPlayerCount++;
                    }
                }
                
                if ( ready && readyPlayerCount >= this.game.getMinimumPlayerCount() )
                {
                    this.setState( Session.State.Gameplay );
                    this.emitToAll ( "allPlayersReady" );
                }
            }
            // else if ( this.state === Session.State.Gameplay )
            // {
            //     //nothing
            // }
            // else if ( this.state === Session.State.Postgame )
            // {
            //     //nothing
            // }
        },
        
        setState: function( state )
        {
            this.state = state;
        },

        goToNextPlayer: function()
        {
            this._currentPlayerIndex = this.game.goToNextPlayer( this._currentPlayerIndex, this.players.length );
        },

        getCurrentPlayer: function()
        {
            return this.players[ this._currentPlayerIndex ];
        },
        
        /**
         * Emits something to either a single Player, or all Players.
         *
         * @param {string} type The type of message to send. This is how the client differentiates messages.
         * @param {Object} [data] The data that you want to send with the message. May be undefined.
         * @param {Player} [player] The player that you want to send to. If you provide none, then all players are sent to.
         */
        emit: function( type, data, player )
        {
            if ( player )
            {
                this._emitToPlayer( player, this._createEmitString( type, data ) );
            }
            else
            {
                this.emitToAll( type, data );
            }
        },
    
        /**
         * Emits something to either all Players, or to all Players excluding a single one.
         *
         * @param {string} type The type of message to send. This is how the client differentiates messages.
         * @param {Object} [data] The data that you want to send with the message. May be undefined.
         * @param {Player} [excludedPlayer] Emit to everyone except for this player.
         */
        emitToAll: function( type, data, excludedPlayer )
        {
            var sendStr = this._createEmitString( type, data );
        
            var playerIndex;
            for ( playerIndex = 0; playerIndex < this.players.length; playerIndex++ )
            {
                if ( this.players[ playerIndex ] !== excludedPlayer )
                {
                    this._emitToPlayer( this.players[ playerIndex ], sendStr );
                }
            }
        },
        
        /**
         * Called by the socket handler when a message was received from a player in this session.
         * The message will then be forwarded to this session's game to be handled.
         *
         * @param {Player} player The player who sent the message.
         * @param {string} type The type of message.
         * @param {*} [data] The data that was sent with the message, if any.
         */
        player_sentMessage: function( player, type, data )
        {
            //specially listen for when a player is ready so we can advance the state if desired
            if ( type === "playerReady" )
            {
                console.log ( "Player " + player.getUsername() + " is ready." );
                player.setIsReady( true );
                this.refreshState();
            }
            
            var funcName = "respondTo_" + type;
            if ( !this.game[ funcName ] )
            {
                funcName = "respondTo_default";
            }
            
            this.game[ funcName ]( this, player, data, type );
        },
        
        /**
         * Since a WebSocket can only send a string message, the message must be turned into
         * a JSON string, and include a type a data value within it.
         *
         * @param {string} type The type of message, becomes the "t" member of the sent JSON string.
         * @param {*} data The data to send with the message, becomes the "d" memeber of the sent JSON string.
         * @returns {string} A string ready to send and be recognized by the ServerHandler in Cocos.
         */
        _createEmitString:function( type, data )
        {
            var sentData = { t: type };
            if ( data )
            {
                sentData.d = data;
            }
        
            return JSON.stringify( sentData );
        },
        
        /**
         * Emits a string to a player. Also puts a try catch around it, just in
         * case something goes wrong.
         *
         * @param {Player} player The player to emit to.
         * @param {string} message The message to send.
         */
        _emitToPlayer:function( player, message )
        {
            try
            {
                player.socket.send( message );
            }
            catch ( err )
            {
                console.log( "Unable to emit to a player.\n" + err.stack );
            }
        }
    } );
}() );

Session.State =
{
    Pregame : 0,
    Gameplay : 1,
    Postgame : 2
};