
class MapData {
    constructor(json){
        this.json = json.mapData;
    }
    
    hasEntities(mapid){
        if ( this.json[mapid].hasOwnProperty("entities")  ) return true;
        else return false;
    }

    getEntities(mapID){
        if (mapID == null) return ;
        mapID = typeof mapID == 'string' ? mapID : `${mapID}`;
        //console.log(mapID + ": " + this.json[mapID].connections);
        return this.json[mapID].entities;
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

	isWithinBounds(x, y, mapID){
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

    getJSObjectEntities(_mapID){
        if (_mapID == null || this.hasEntities(_mapID) == false) return ;

		const entities = this.getEntities(_mapID);
	
		var entityArray = []; 

		for ( var i=0; i < entities.length ; i++ ){
			var page,
				mapx = "",
				mapy = "",
				displayposition = "",
				entitytypeArray = [],
				entity = {};

			page = entities[i][1];
			mapx = entities[i][4];
			mapy = entities[i][2];

			if ( this.isWithinBounds(mapx, mapy, _mapID) == true ) {
				console.log(`FFXIMap: addNPCControlLayersFromJSObject: ${page} (${mapx}, ${mapy}) outside map bounds !`);
				continue;
			}

			var tempArray = entities[i][0];
			for (let x = 0; x < tempArray.length; x++) { tempArray[x] = tempArray[x].trim(); }
			entitytypeArray = entitytypeArray.concat(tempArray);

			//mapid = _mapID;
			displayposition = `(${mapx},${mapy})`;

			entity['page'] = page;
			entity['mapx'] = mapx;
			entity['mapy'] = mapy;
			entity['type'] = entitytypeArray;
			entity['imageurl'] = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/index.php?title=Special:Redirect/file/${page}.png&width=175`;
            //console.log("JS:[page] ", page + `.png`);

            var URL = this.fetchImageURL(entity['page']);
            console.log(entity['page'],  URL); 

			entity['displayposition'] = displayposition;

			entityArray.push(entity);
		}

		return entityArray;
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
                    this.fetchImage(entity['imageurl'], value);
                }
                else if ( key == 'displayposition') entity['displayposition'] = value;
               
                });
            entityArray.push(entity);
                       
            });
        if ( entityArray.length > 0 ) return entityArray;
        else return undefined;
    }

    async fetchEntities(_mapID){
        let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image,displayposition&where=mapid=${_mapID}&format=json`;
        //console.log(url);

        const response = fetch(url);
        const data = await response.json();
        const parsedEntities = parseFetchedEntities(data);
        return parsedEntities;
    }

    async fetchImage(url, entityName){
        //console.log(url);
        try {
            const response = await fetch(url);
            if (!response.ok && response.status != 404) {  throw new Error(`FFXIMap: ${response.status} ${response.statusText}`); }
            else if (response.status == 404) console.log(`FFXIMap: [${entityName}] No image found`);
          } catch (error) {
            console.log(`FFXIMap: fetchImage() error`);
          }

    }

    fetchImageURL(entityName){
        var url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php`; 

        var params = {
            action: "query",
            prop: "images",
            titles: entityName,
            format: "json"
        };
        
        url = url + "?origin=*";
        Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
        
        fetch(url)
            .then(function(response){return response.json();})
            .then(function(response) {
                var pages = response.query.pages;
                for (var page in pages) {
                    //console.log(typeof(pages[page].images));
                    if (pages[page].images.length <= 0) continue;
                    //console.log("title:", pages[page].title);
                    
                    for (var img of pages[page].images) {
                        var tempStr = img.title.replace("File:", "");
                        var tempStrSplit = tempStr.split('.');
                        //console.log("img:", tempStr[0]);   
                        if ( tempStrSplit == pages[page].title ) return tempStr;
                        //console.log(page, img.title);
                    }
                }
            })
            .catch(function(error){console.log(error);});

    }

}

module.exports = MapData;