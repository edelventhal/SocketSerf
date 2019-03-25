/*global module*/
/*global require*/

var Game = require( "./game.js" ).Game;

/**
 * Creates every Game object and allows you to get them by slug, returning Game if there is
 * no match for a given slug.
 */
var GameList = module.exports.GameList =
{ 
    //if you make a custom game, you need to put it in here via a require etc
    //later I may implement browsing the file system and doing this automatically
    games:
    [
        new Game()
    ], 
    
    lookupTable : null,

    getGame:function( slug )
    {
        if ( !this.lookupTable )
        {
            this.lookupTable = {};
            var gameIndex;
            for ( gameIndex = 0; gameIndex < this.games.length; gameIndex++ )
            {
                var game = this.games[ gameIndex ];
                this.lookupTable[ game.getSlug() ] = game;
            }
        }
        
        if ( this.lookupTable[ slug ] )
        {
            return this.lookupTable[ slug ];
        }
        
        return this.lookupTable[ "default" ];
    }
};

