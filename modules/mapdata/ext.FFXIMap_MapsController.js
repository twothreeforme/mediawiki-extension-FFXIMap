
class MapsController {
    // mapsData;
    zoneNames;

    constructor(){
        // let MapsData = require("../archived/ext.FFXIMap_MapsData.js");
        // this.mapsData = new MapsData();
        
        let ZoneNames = require("../mapdata/json/zonenames.json"); 
        this.zoneNames = ZoneNames;

        //console.log(this.zoneNames);
    }

    /**
     * Read JSON file for specific map data
     * @param {int} mapID
     * @returns {MapJSON} MapJSON object
     */
    getMapData(mapID){
        if ( typeof mapID === 'undefined' ) mapID = 0;

        let mapjson = `../mapdata/json/maps/${mapID}.json`;
        let json = require(mapjson);

        let MapJSON = require("./ext.MapJSON.js");
        return new MapJSON(json, mapID);
    }

    /**
     * Get map name - typically used for the FFXIMap to get the name of a connection,
     * which is not listed in the current map JSON
     * @param {int} mapID 
     * @returns {string} name of zone as string
     */
    getMapName(mapID){
        return this.zoneNames[mapID];
    }

    /**
     * 
     * @returns {array} associative array - list of all maps
     */
    searchBarMapsList(){
        let mapList = {};

        for (const [key, value] of Object.entries(this.zoneNames)){
            var str = `${this.zoneNames[key]} ` + `[` + `${key}` + `]`;
            mapList[key] = str;
            //console.log(key  + ":" + str)
        }
        return mapList;
    }

}

module.exports = MapsController;