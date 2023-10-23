
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

    getMapNamesArray(){
        const mapNamesArray = [];
        for (const [key, value] of Object.entries(this.json)){
            if (this.json[key].name) {
                var str = `${this.json[key].name} ` + `[` + `${key}` + `]` +  `\n`;
                mapNamesArray.push(str);
            }
        }
        return mapNamesArray;
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

    // Purely for printing a table of all the maps for copy/paste onto the wiki
    listMaps(){
        var str = ""
        for (const [key, value] of Object.entries(this.json)){
            str += `|-` + `\n` + `|${key}` + `\n` + `|${this.json[key].name}` +  `\n`;
        }
        return str;
    }
    // parseDB(dbEntities){
    //     var _parsed = dbEntities;


    //     return _parsed;
    // }

}

module.exports = MapData;