
// const _ffximap = require('./ext.FFXIMap.js');

// mw.hook( 'wikipage.content' ).add( function ( $content ) {
// 	//console.log('mw.hook( \'wikipage.content\' ) FIRED'); 
//     _ffximap._hookNewMap();
// });


const FrameController = require("./ext.FFXIMap_FrameController.js");

mw.hook( 'wikipage.content' ).add( function ( $content ) {
    //console.log("hook fired");
    var spanMaps = document.getElementsByClassName('FFXIMap_mapSpan');
    if (spanMaps === null) return null;

    const frameController = new FrameController(spanMaps);
});