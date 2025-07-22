const MapData = require("./mapdata/ext.mapData.js");
const MapDataJSON = require("./mapdata/mapdata.json");
const FFXIMap = require("./ext.FFXIMap.js");


/**
 * Object managing FFXIMap instances with dependencies
 * @param {mapElements} HTMLCollection all DOM elements with FFXIMap tags
 * @return {nil} no return
 */
class FFXIMap_FrameController {

    mapDataModel;       // Wrapper for MapDataJSON
    mapsArray;          // Array of all maps created on the page
    directories;        // Object mapping all relevant directories

    constructor(mapElements){
        this.mapDataModel = new MapData(MapDataJSON);
        
        let baseDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/';
        this.directories = {
            "base": baseDir,
            "maps": baseDir + 'maps/',
            "zones": baseDir + 'maps/zones/',
            "markers": baseDir + 'maps/markers/',
            "wiki_logo": baseDir + '/modules/images/wiki_logo.png'
        };


        // loop through all FFXIMap tagged elements in the DOM and
        // build the map objects for each
        for (let i = 0; i < mapElements.length; i++) {
            this.addMap(mapElements[i].dataset);
        }

    }

    addMap(dataset){        
        // create the map
        let m = this.createNewMap(dataset);

        // add reference to class variable for later?
        this.mapsArray.push(m);
    }

    createNewMap(){
	    return new FFXIMap( divID, _mapID, tileset, minZoom, maxZoom, zoom );
    }

    destroyMap(){

    }

    // setupNewMap(_mapID) {
    //     if (m != undefined)  {
    //         console.log("setupNewMap: map undefined");
    //         m.remove();
    //         m = undefined;
    //     }

    //     if (_mapID == undefined) _mapID = mapID;
    //     m = new FFXIMap( divID, _mapID, tileset, minZoom, maxZoom, zoom );
    // }

}

module.exports = FFXIMap_FrameController;
