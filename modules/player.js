/*global console*/
/*global module*/
/*global require*/

var Class = require( "./class.js" ).Class;

var Player;
( function()
{
    "use strict";
    
    Player = module.exports.Player = Class.extend(
    {
        _username: "player",

        ctor: function( socket, playerId )
        {
            this.socket = socket;
            this.playerId = playerId;
    
            this.addToSession( null );
        },

        //adds to a new session, resetting tracking vars
        addToSession: function( session )
        {
            this._isReady = false;
            this._reportedGameOver = false;
        },

        isReady: function()
        {
            return this._isReady;
        },

        setIsReady: function( ready )
        {
            this._isReady = ready;
        },
        
        reportedGameOver: function()
        {
            return this._reportedGameOver;
        },
        
        setReportedGameOver: function( over )
        {
            this._reportedGameOver = over;
        },

        setUsername: function ( username )
        {
            this._username = username;
        },

        getUsername: function ()
        {
            return this._username;
        }
    } );
}() );