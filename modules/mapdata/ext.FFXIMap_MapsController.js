
class MapsController {
    mapsData;
    zoneNames;

    constructor(){
        const MapsData = require("./ext.FFXIMap_MapsData.js");
        this.mapsData = new MapsData();

        const ZoneNames = require("../mapdata/json/zonenames.json"); 
        this.zoneNames = ZoneNames;

        //console.log(this.zoneNames);
    }

}

module.exports = MapsController;