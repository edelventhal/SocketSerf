/*global console*/
/*global require*/
/*global module*/
/*global __dirname*/

//a WebSocket implementation of a server

var app = require( "express" )();
var http = require( "http" ).Server( app );
var WebSocketServer = require( "ws" ).Server;
var ServerWebSocketHandler = require( "./ServerWebSocketHandler.js" ).ServerWebSocketHandler;
var Class = require( "./class.js" ).Class;

var Server;
( function()
{
    "use strict";
    
    Server = module.exports.Server = Class.extend(
    {
        ctor: function( cb )
        {
            app.get( "/", function( req, res )
            {
                res.send( "Yo this my server, bro." );
            } );
        
            var wss = new WebSocketServer( {server: app, port:13375} );
            ServerWebSocketHandler.register( wss );
        
            http.listen( 13376, function()
            {
                console.log( "Server is started." );
        
                if ( cb )
                {
                    cb();
                }
            } );
        }
    } );
}() );

