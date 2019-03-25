/*global module*/
/*global process*/

//gets command line params in a useful useable way

//get 'em as an array
module.exports.getParamsArray = function()
{
    return process.argv.slice( 2 );
};

//get 'em as an object that points to its values, can use key=val syntax
module.exports.getParamsObject = function()
{
    var paramsObject = {};
    
    var params = module.exports.getParamsArray();
    var paramIndex;
    for ( paramIndex = 0; paramIndex < params.length; paramIndex++ )
    {
        var param = params[ paramIndex ];
        var paramParts = param.split( "=" );
        
        if ( paramParts.length >= 2 )
        {
            paramsObject[ paramParts[ 0 ] ] = paramParts[ 1 ];
        }
        else
        {
            paramsObject[ param ] = true;
        }
    }
    
    return paramsObject;
};