
class MapJSON {
    #mapID;          // id for the current map
    #name;           // map name
    #filename;       // filename of map image
    
    #bounds;         // indicates the coordinates have been matched with those in game and are available
    #upperBoundX;    // indicates in game coordinates have been NOT been established
    #upperBoundY;    // indicates in game coordinates have been NOT been established

    #connections;    // json obj: PULSE and HOVER with connecting map id
    #entities;       // json obj 
    #mobSpawns;      // json obj

    constructor(json, mapID){
        this.#mapID = mapID;
        this.#name = json.name;
        this.#filename = json.filename;
        
        //check bounds
        if ("bounds" in json) { this.#bounds = json.bounds; }
        else {
            this.#upperBoundX = json.upperBoundX;
            this.#upperBoundY = json.upperBoundY;
        }
        if ("connections" in json) {  this.#connections = json.connections; }
        if ("entities" in json) {  this.#entities = json.entities; }
        if ("mobSpawns" in json) {  this.#mobSpawns = json.mobSpawns; }
    }
    
    hasEntities(){
        if ( this.#entities ) return true;
        else return false;
    }

    hasMobSpawns(){
        if ( this.#mobSpawns ) return true;
        else return false;
    }

    hasBounds(){
        if ( this.#bounds ) return true;
        else return false;
    }

	isWithinBounds(y, x){
		let mapBounds = this.getBounds();
     	if ( x < mapBounds[1][1] || x > mapBounds[0][1] || y < mapBounds[1][0] || y > mapBounds[0][0]) return true; 
		return false;
	}

    getmapID(){ return this.#mapID; }
    getEntities(){ return this.#entities; }
    getMobSpawns(){ return this.#mobSpawns; }
    getConnections(){ return this.#connections; }
    getBounds(){
        if ( this.hasBounds() )return [[ this.#bounds[1][1], this.#bounds[1][0] ], [this.#bounds[0][1], this.#bounds[0][0]] ];
        else return [[0,0], [256,256]];
    }

    getMapName(){ return this.#name; }
    getMapFilename(){ return this.#filename; }

    generateArray(entityInput){
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

                    if ( this.isWithinBounds(mapx, mapy) == true ) {
                        console.log(`FFXIMap: addNPCControlLayersFromJSObject: ${page} (${mapx}, ${mapy}) outside map [${this.getmapID()}] bounds !`);
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
                    if ( minL == 0 && maxL == 0 ) displaylevels = ``;
                    entity['displaylevels'] = displaylevels;

                    returnArray.push(entity);
                }
                return returnArray;
            }
        }
        catch (error){
            console.log(`Map: ${this.getmapID()} - Error: ${error}`);
            return null;
        }
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
                //else if ( key == 'mapID') mapID = value;
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

    /**
     * Async Functions
     */
     async getJSObjectEntities(){
        if ( this.hasEntities() == false && this.hasMobSpawns() == false  ) return ;
        let returnArray = [];
        
        if ( this.hasEntities() ) {
            let entityArray = this.generateArray( this.getEntities() ); 
            if ( entityArray.length > 0 ) returnArray = returnArray.concat(entityArray);
        }

        if ( this.hasMobSpawns() ) {
            let mobSpawnsArray = this.generateArray( this.getMobSpawns() );
            if ( mobSpawnsArray.length > 0 ) returnArray = returnArray.concat(mobSpawnsArray);
        }
        
        return returnArray;
    }
}

module.exports = MapJSON;