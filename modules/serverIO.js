/*global console*/
/*global require*/
/*global module*/
/*global __dirname*/

//a socket.io implementation of a server

var app = require( "express" )();
var http = require( "http" ).Server( app );
var io = require( "socket.io" )( http );
var ServerSocketHandler = require( "./ServerSocketHandler.js" ).ServerSocketHandler;
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
        
            ServerSocketHandler.register( io );
        
            http.listen( 13375, function()
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

