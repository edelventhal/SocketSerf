/*global require*/
/*global console*/
/*global process*/

//entrypoint for starting the server.
//
//possible params:
//
//socketio - normally we use WebSocket since only that is supported on mobile,
//but if the user wants to use socket.io for some reason (it's nicer to use on web),
//then you have the option

var ServerIO = require( "./modules/serverIO.js" ).Server;
var ServerWS = require( "./modules/serverWS.js" ).Server;

var params = require( "./modules/paramHelper.js" ).getParamsObject();

var serverCallback = function( err )
{
    //don't care...
};

//create the server.
var server;
if ( params.socketio )
{
    server = new ServerIO( serverCallback );
}
else
{
    server = new ServerWS( serverCallback );
}