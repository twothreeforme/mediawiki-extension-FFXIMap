
//const MapJSON = require("../mapdata/ext.MapJSON.js");
const MapsData = require("../archived/ext.FFXIMap_MapsData.js");
const FFXIMap = require("../ext.FFXIMap.js");
const MapsController = require("../mapdata/ext.FFXIMap_MapsController.js");


/**
 * Object managing FFXIMap instances with dependencies
 * @param {mapElements} HTMLCollection all DOM elements with FFXIMap tags
 * @return {nil} no return
 */
class FFXIMap_FrameController {

    mapsData;       
    mapsArray = [];
    mapsController;

    constructor(mapElements){
        this.mapsData = new MapsData();
        
        this.mapsController = new MapsController();
        

        // loop through all FFXIMap tagged elements in the DOM and
        // build the map objects for each using the dataset 
        // created on the backend
        for (let i = 0; i < mapElements.length; i++) {
            let data = mapElements[i].dataset;
            if( typeof data.divid == 'undefined' ){
                console.log("Error: No divID exists: ", data);
                continue;
            }
            this.addMap(data);
        }

    }

    addMap(dataset){        
        // create the map
        let m = this.createNewMap(dataset);

        // add reference to class variable for later?
        this.mapsArray.push(m);
    }

    createNewMap(dataset){

        //let mapID = typeof dataset.mapid !== 'undefined' ? dataset.mapid : 0;
        //let mapjson = `../mapdata/json/${mapID}.json`;
        //let json = require(mapjson);
        let json = this.mapsController.getMapData(dataset.mapid);

        console.log(dataset, json);
	    return new FFXIMap( dataset, this.mapsController );
    }

    destroyMap(){

    }

}

module.exports = FFXIMap_FrameController;
