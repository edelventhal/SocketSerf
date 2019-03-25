/*global console*/
/*global module*/
/*global require*/

var Class = require( "../class.js" ).Class;

var Game;
( function()
{
    "use strict";
    
    Game = module.exports.Game = Class.extend(
    {
        /**
         * A Game is the definition of how the server acts for a particular game. Very specifically, this defines
         * how stuff works, but stores no state whatsoever. Instead, the Session object holds the state, and passes
         * state values into various functions to determine changes. If you create your own subclass of Game, you 
         * can put in custom functionality. Just make sure not to store anything in that object, since only one
         * instance of each Game will ever exist. If there is no Game for your slug, this base class is used.
         *
         * @constructs
         */
        ctor: function()
        {
            this.slug = "default";
        },
        
        /**
         * Returns the slug for this game. When a new session is created, if there is a Game class
         * that matches the slug the player wants to play, then that Game will be used.
         *
         * @returns {string} The slug for this game.
         */
        getSlug: function()
        {
            return this.slug;
        },
        
        /**
         * Returns the minimum number of players required before a game can be started.
         *
         * @returns {integer} The min player count.
         */
        getMinimumPlayerCount: function()
        {
            return 2;
        },
        
        /**
         * Returns the maximum number of players allowed to play in this Game at once.
         *
         * @returns {integer} The max player count.
         */
        getMaximumPlayerCount: function()
        {
            return 4;
        },
        
        /**
         * Goes to the next player, in the case of turn-based games.
         *
         * @param {integer} currentPlayerIndex The index of the current player's turn.
         * @param {integer} playerCount How many players are in this game.
         * @returns {integer} The next player's index.
         */
        goToNextPlayer: function( currentPlayerIndex, playerCount )
        {
            return ( currentPlayerIndex + 1 ) % playerCount;
        },
        
        /////////////response functions////////////////
        //when a message comes in during a session, it will ask its game what to do.
        //it will look for a function called respondTo_messageType and try to call it.
        //if the function does not exist, it will call the respondTo_default function.
        //The parameters will always be first the Session the message was sent in,
        //then the Player that sent the message in the first place, the data that was
        //sent with the message, and finally the message type itself.
        
        /**
         * The default response function. Tells the session to send the exact same message
         * back to all other players in the session. Essentially an echo to others. If,
         * however, the data is an object containing "all" : true, then it will emit to
         * all players, including the player who just sent the message.
         *
         * @param {Session} session The session the message was sent in.
         * @param {Player} player The player who sent the message.
         * @param {*} data The data that may have been send with the message.
         * @param {string} type The type of message that was sent.
         */
        respondTo_default: function( session, player, data, type )
        {
            //optional inclusion of the sending player
            if ( data && data.all )
            {
                session.emitToAll( type, data );
            }
            //send to all players other than the sending player
            else
            {
                session.emitToAll( type, data, player );
            }
        }
    } );
}() );