
const Map = require("./map.js");

class MapController {
    constructor(json){
        this.json = json.mapData;
    }
    
    createMapObject(mapID){
        const newMap = new Map();
        
    }

}

module.exports = MapController;