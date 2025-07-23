
const MapJSON = require("../mapdata/ext.MapJSON.js");

class MapController {
    constructor(json){
        this.json = json.mapData;
    }
    
    createMapObject(mapID){
        const newMap = new MapJSON();
        
    }

}

module.exports = MapController;