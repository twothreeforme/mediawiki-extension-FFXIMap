
class MapData {
    constructor(json){
        this.json = json.mapData;
    }
    

    getConnections(mapID){
        if (mapID == null) return ;
        mapID = typeof mapID == 'string' ? mapID : `${mapID}`;
        //console.log(mapID + ": " + this.json[mapID].connections);
        return this.json[mapID].connections;
    }


    getMapFilename(mapID){
        if (mapID == null) return ;
        mapID = typeof mapID == 'string' ? mapID : `${mapID}`;
        //console.log(mapID + ": " + this.json[mapID].connections);
        return this.json[mapID].filename;
    }

    consoleJSON() {
        console.log(this.json);
    }

    parseDB(dbEntities){
        var _parsed = dbEntities;


        return _parsed;
    }

}

module.exports = MapData;