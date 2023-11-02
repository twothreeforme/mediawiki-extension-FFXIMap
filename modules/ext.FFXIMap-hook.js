
const _ffximap = require('./ext.FFXIMap.js');

mw.hook( 'wikipage.content' ).add( function ( $content ) {
	//console.log('mw.hook( \'wikipage.content\' ) FIRED'); 
    _ffximap._hookNewMap();
});