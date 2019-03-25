/*global module*/
/*global require*/
/*global console*/

/**
 * The ServerSocketHandler can register itself for socket.io requests, and then potentially respond to them using socket.io.
 * To add more functionality, add more into the types array, and then create matching functions. You can also use the
 * ServerSocketHandler to emit messages to the client with socket.io by calling any of the emit functions.
 */
module.exports.ServerSocketHandler =
{
    io: null,
    
    register: function( io )
    {
        this.io = io;
        
        this.sockets = [];
        
        io.on( "connection", function( socket )
        {
            console.log( "SOMEONE CONNECTED OMG" );
            
            this.sockets.push( socket );
            
            var responseType;
            for ( responseType in this.socketResponseFunctions )
            {
                socket.on( responseType, this.socketResponseFunctions[ responseType ].bind( this, socket ) );
            }
        }.bind( this ) );
    },
    
    ///////////Emit Functions///////////
    
    /**
     * Emits a message to a client, or to all connected clients.
     *
     * @param {*} Any type that you want to send. Doesn't have to be a string.
     * @param {Socket} socket The socket that you want to send to. If you provide none, then all sockets are sent to.
     */
    emitMessage: function( message, socket )
    {
        if ( socket )
        {
            socket.emit( "message", message );
        }
        else
        {
            var socketIndex;
            for ( socketIndex = 0; socketIndex < this.sockets.length; socketIndex++ )
            {
                this.sockets[ socketIndex ].emit( "message", message );
            }
        }
    },
    
    ///////////Response Functions///////////
    /**
     * When the client sends us a message, it will automatically try to call one of these functions to respond to it.
     * If the function name matches the emit() call from the client, then it will call that function with any sent data.
     */
    socketResponseFunctions:
    {
        echo: function( socket, data )
        {
            console.log( "Echoing message received from client: " + JSON.stringify( data ) );
            this.emitMessage( data, socket );
        },
        
        disconnect: function( socket )
        {
            console.log( "A user disconnected." );
            
            var index = this.sockets.indexOf( socket );
            if ( index >= 0 )
            {
                this.sockets.splice( index, 1 );
            }
        }
    }
};