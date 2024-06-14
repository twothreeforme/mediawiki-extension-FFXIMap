
class MapData {
    constructor(json){
        this.json = json.mapData;
    }
    
    getMapID(mapName){
        for (const [key, value] of Object.entries(this.json)){
            let keyName = this.json[key].name;
            keyName = keyName.replace('\'', '');
            //mystring = mystring.split('/r').join('/')
            if ( keyName == mapName || keyName == (mapName + ": Map 1"))  return key;

        }
        return ;
    }

    hasEntities(mapid){
        if ( this.json[mapid].hasOwnProperty("entities")  ) return true;
        else return false;
    }

    getEntities(mapID){
        if (mapID == null) return ;
        mapID = typeof mapID == 'string' ? mapID : `${mapID}`;
        return this.json[mapID].entities;
    }

    hasMobSpawns(mapid){
        if ( this.json[mapid].hasOwnProperty("mobSpawns")  ) return true;
        else return false;
    }

    getMobSpawns(mapID){
        if (mapID == null) return ;
        mapID = typeof mapID == 'string' ? mapID : `${mapID}`;
        return this.json[mapID].mobSpawns;
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

    getMapName(mapid){
        return this.json[mapid].name;
    }

    hasBounds(mapid){
        if ( this.json[mapid].hasOwnProperty("bounds")  ) return true;
        else return false;
    }

    getMapBounds(mapid){
        // Should be from lower left corner to upper right corner in game coordinates
        // from mapData: "bounds" : [[-381.94, -319.31], [259.39, 320.69] ],
        if ( this.hasBounds(mapid) )return [[ this.json[mapid].bounds[1][1], this.json[mapid].bounds[1][0] ], [this.json[mapid].bounds[0][1], this.json[mapid].bounds[0][0]] ];
        else return [[0,0], [256,256]];
    }

	isWithinBounds(y, x, mapID){
		var mapBounds = this.getMapBounds(mapID);
     	if ( x < mapBounds[1][1] || x > mapBounds[0][1] || y < mapBounds[1][0] || y > mapBounds[0][0]) return true; 
		return false;
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

    searchBarMapsList(){
        let mapList = {};

        for (const [key, value] of Object.entries(this.json)){
            var str = `${this.json[key].name} ` + `[` + `${key}` + `]`;
            mapList[key] = str;
            //console.log(key  + ":" + str)
        }
        return mapList;
    }

    generateArray(entityInput, _mapID){
        try{
            if ( entityInput.length > 0 ) {
                var returnArray = [];

                for ( var i=0; i < entityInput.length ; i++ ){
                    var page,
                        mapx = "",
                        mapy = "",
                        displayposition = "",
                        displaylevels = "",
                        minL,
                        maxL,
                        entitytypeArray = [],
                        entity = {};

                    page = entityInput[i][1];
                    mapx = entityInput[i][4];
                    mapy = entityInput[i][2];
                    minL = entityInput[i][5];
                    maxL = entityInput[i][6];

                    if ( this.isWithinBounds(mapx, mapy, _mapID) == true ) {
                        console.log(`FFXIMap: addNPCControlLayersFromJSObject: ${page} (${mapx}, ${mapy}) outside map [${_mapID}] bounds !`);
                        continue;
                    }

                    var tempArray = entityInput[i][0];
                    for (let x = 0; x < tempArray.length; x++) { tempArray[x] = tempArray[x].trim(); }
                    entitytypeArray = entitytypeArray.concat(tempArray);

                    entity['page'] = page;
                    entity['mapx'] = mapx;
                    entity['mapy'] = mapy;
                    entity['type'] = entitytypeArray;
                    entity['imageurl'] = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/index.php?title=Special:Redirect/file/${page}.png&width=175`;
                    
                    displayposition = `(${mapx},${mapy})`;
                    entity['displayposition'] = displayposition;

                    if ( minL != null && maxL != null) displaylevels = ` (${minL}-${maxL})`;
                    entity['displaylevels'] = displaylevels;

                    returnArray.push(entity);
                }
                return returnArray;
            }
        }
        catch (error){
            console.log(`Map: ${_mapID} - Error: ${error}`);
            return null;
        }
    }

    
    
    async getJSObjectEntities(_mapID){
        if (_mapID == null || ( this.hasEntities(_mapID) == false && this.hasMobSpawns(_mapID) == false ) ) return ;
        var entityArray, mobSpawnsArray;

        const entities = this.getEntities(_mapID);
        if (typeof(entities) !== `undefined`) entityArray = this.generateArray(entities, _mapID); 
        
        const mobspawns = this.getMobSpawns(_mapID);
        if (typeof(mobspawns) !== `undefined`) mobSpawnsArray = this.generateArray(mobspawns, _mapID);
        
        let returnArray = [];
        if ( typeof(entityArray)  !== `undefined`) { returnArray = returnArray.concat(entityArray); }
        if ( typeof(mobSpawnsArray)  !== `undefined`) { returnArray = returnArray.concat(mobSpawnsArray); }

        return returnArray;
    }
        
		
    parseFetchedEntities(data){
        if (data.cargoquery == null ) return;
        var entityArray = []; 
        data.cargoquery.forEach((d) => {
            
            var entitytypeArray = [];
            var entity = {};  

            Object.entries(d.title).forEach(([key, value]) => {
                //console.log(`${key}: ${value}`);
                if ( key == 'Page') entity['page'] = value;
                else if ( key == 'entitytype') {
                    //console.log("***"+page);
                    var tempArray = value.split(',');
                    for (let i = 0; i < tempArray.length; i++) { tempArray[i] = tempArray[i].trim(); }
                    entitytypeArray = entitytypeArray.concat(tempArray);
                    entity['type'] = entitytypeArray;
                }
                //else if ( key == 'mapid') mapid = value;
                else if ( key == 'mapx') entity['mapx'] = value;
                else if ( key == 'mapy') entity['mapy'] = value;
                else if ( key == 'image' && value !== null) {
                    entity['imageurl'] = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/index.php?title=Special:Redirect/file/${value}&width=175`;
                    //this.fetchImage(entity['imageurl'], value, abortController);
                }
                else if ( key == 'displaylevels') entity['displaylevels'] = value;
               
                });
            entityArray.push(entity);
                       
            });
        if ( entityArray.length > 0 ) return entityArray;
        else return undefined;
    }

    async fetchEntities(_mapID, abortController){
        let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image,displaylevels&where=mapid=${_mapID}&format=json`;
        //console.log(url);
        const response = fetch(url, {
            signal: abortController
        });
        const data = await response.json();
        var oeiwhjaioehgaigw;
        const parsedEntities = parseFetchedEntities(data);
        return parsedEntities;
    }

    async fetchImage(url, entityName, abortController){
        //console.log(url);
        var lkaehjfljhaergjlkshlkaehjfljhaergjlkshlkaehjfljhaergjlkshlkaehjfljhaergjlkshlkaehjfljhaergjlkshlkaehjfljhaergjlkshlkaehjfljhaergjlksh = "aklejfnakjrgalkrjnlkjsbglsesslgrjglkajhfLOIHEFIOUAHEWFIULABFKLbbakefbjangfjrankrajeaklejfnakjrgalkrjnlkjsbglsesslgrjglkajhfLOIHEFIOUAHEWFIULABFKLbbakefbjangfjrankrajeaklejfnakjrgalkrjnlkjsbglsesslgrjglkajhfLOIHEFIOUAHEWFIULABFKLbbakefbjangfjrankrajeaklejfnakjrgalkrjnlkjsbglsesslgrjglkajhfLOIHEFIOUAHEWFIULABFKLbbakefbjangfjrankrajeaklejfnakjrgalkrjnlkjsbglsesslgrjglkajhfLOIHEFIOUAHEWFIULABFKLbbakefbjangfjrankrajeaklejfnakjrgalkrjnlkjsbglsesslgrjglkajhfLOIHEFIOUAHEWFIULABFKLbbakefbjangfjrankraje";
        try {
            const response = await fetch(url, {
                signal: abortController.signal
            });
            if (!response.ok && response.status != 404) {  throw new Error(`FFXIMap: ${response.status} ${response.statusText}`); }
            else if (response.status == 404) console.log(`FFXIMap: [${entityName}] No image found`);
          } catch (error) {
            console.log(`FFXIMap: fetchImage() error`);
          }
    }

    
}


module.exports = MapData;