/*	Attributions:
 *  Leaflet library used for all map related objects: https://leafletjs.com/
 *	Leaflet Control Search - Copyright Stefano Cudini - Leaflet addon for search box - https://github.com/stefanocudini/leaflet-search
 *	Accessing CSS custom properties through javascript - https://stackoverflow.com/questions/36088655/accessing-a-css-custom-property-aka-css-variable-through-javascript
 *  Markers in multiple layer groups - https://stackoverflow.com/questions/71644888/having-leaflet-markers-visible-in-more-than-one-layer
 *  Javascript function links inside leaflet popup - https://stackoverflow.com/questions/13698975/click-link-inside-leaflet-popup-and-do-javascript 
 */


 /**
 * _hookNewMap created to support a proper hook function using mw.hook .
 * Original design was not loading entire ext.FFXIMap.js file after an 
 * edit was made on the wiki page, so following any edit (and saving)
 * the map would not immediately load due to the FFXIMap class not loading
 * yet. Unsure really why the ex.FFXIMap.js was firing the mw.hook and the 
 * FFXIMap class was not loaded, but setting up ext.FFXIMap-hook.js forces
 * the entire ext.FFXIMap.js to load prior to beginning this _hookNewMap
 * sequence, and thus solves the problem.
 * 
 * Function meant to set up the map from scratch, called from ext.FFXIMap-hook.js
 * using mw.hook after the full wikipage content has loaded.  
 */	
function _hookNewMap(){
	setPageAttributes();
	setupMarkers();
	setupMapData();
	setupNewMap();
}
exports._hookNewMap = _hookNewMap;


/**
 * The map object used by leaflet  
 */
let m = null;

//
/**
 * ID# of the map to be displayed. 
 * This is parsed from the tag in the WikiText 
 * @return {number} Map # for display. 
 */
let mapID = null;

/**
 * id of the <div> class from the extension PHP 
 * references the div container where the map view is placed
 * @return {string} divID = "mapid_" + mapID 
 */
let divID = null;

let tileset, 
	minZoom,
	maxZoom,
	zoom,
	showdetails,
	showconnections,
	currentMapMarkersArray = {},
	baseDir,
	baseMapDir,
	baseMapTilesDir,
	baseMapZonesDir;

/**
 * class MapMarkers defined in ext.maphelper.js
 * Object containing the various icons used as map markers
 * and functions supporting icon display.
 * Icons returned follow the leaflet Icon object model
 * @return {MapMarkers} MapMarkers object
 */	
const MapMarkers = require("./ext.mapMarker.js");
let mapMarkers = null;


/**
 * class MapData defined in ext.mapData.js
 * Object managing javascript markup data
 * @return {MapData} MapData object
 */	
const MapData = require("./ext.mapData.js");
let mapDataModel = null;



function setupNewMap(_mapID) {
	if (m != undefined)  {
		console.log("setupNewMap: map undefined");
		m.remove();
		m = undefined;
	}
	if (_mapID == undefined) _mapID = mapID;
	m = new FFXIMap( divID, _mapID, tileset, minZoom, maxZoom, zoom );
}

/**
 * Takes all custom <span> tag attributes and assigns those values to our global variables
 * This is parsed from the document, after it the content is loaded
 * @return {nil} no return value 
 */
function setPageAttributes() {
	var tagAttributesQuery = document.querySelector('#tagAttributes');
	if (tagAttributesQuery === null) return null;
		dataTagAttributes = tagAttributesQuery.dataset;
		
		divID = dataTagAttributes.divid;
		mapID = dataTagAttributes.mapid;
		//tileSource = dataTagAttributes.tilesource;
		minZoom = dataTagAttributes.minzoom;
		maxZoom = dataTagAttributes.maxzoom;
		zoom = dataTagAttributes.zoom;
		showdetails = (dataTagAttributes.showdetails === "1");
		showconnections = (dataTagAttributes.showconnections === "1");

		baseDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/';
		baseMapDir = baseDir + 'maps/';
		baseMapTilesDir = baseDir + 'maps/tiles/';
		baseMapZonesDir = baseDir + 'maps/zones/';
		baseMapMarkersDir = baseDir + 'maps/markers/';
		
}

function setupMarkers() {

	// L.Marker.prototype.options.icon = L.icon({
	// 	iconRetinaUrl: baseMapMarkersDir + 'npc-icon-2x.png',
	// 	iconUrl: baseMapMarkersDir + 'npc-icon.png',
	// 	iconSize: [12, 12],
	// 	iconAnchor: [6, 6],
	// 	className: 'blinking'
	// });

	
	// let temp = new MapMarkers(baseMapMarkersDir);
	// console.log( typeof(temp) );
	mapMarkers = new MapMarkers;

	// L.Marker.prototype.options.icon = L.icon({
	// 		iconRetinaUrl: baseMapMarkersDir + 'npc-icon-2x.png',
	// 		iconUrl: baseMapMarkersDir + 'npc-icon.png',
	// });
}

/**
 * Takes all custom <span> tag attributes and assigns those values to our global variables
 * This is parsed from the document, after it the content is loaded
 * @return {nil} no return value 
 */
function setupMapData() {
	//console.log(baseDir + 'modules/mapdata.json');
	var data = require("./mapdata.json");
	mapDataModel = new MapData(data);
	//console.log(mapDataModel.listMaps());
}




class FFXIMap {
	connectionLayerHover;
	
	constructor(divID, mapID, tileset, minzoom, maxzoom, zoom) {
		//console.log('FFXIMap constructor began');

		this.divID = typeof divID !== 'undefined' ? divID : "mapid_0";
		this.mapID = typeof mapID !== 'undefined' ? mapID : 0;
		this.tileset = typeof tileset !== 'undefined' ? tileset : baseMapTilesDir + "{z}/{x}/{y}.jpeg";

		this.minzoom = typeof minzoom !== 'undefined' ? minzoom : 1;
		this.maxzoom = typeof maxzoom !== 'undefined' ? maxzoom : 6;
		this.zoom = typeof zoom !== 'undefined' ? zoom : 1;
		this.zoomSnap = 0.25;

		this.attrib = '©Remapster |©Square Enix| ©FFXI-Atlas';

		this.bounds = mapDataModel.getMapBounds(this.mapID);

		// Map viewing history supports the back button and returning to previously viewed maps
		this.mapHistory = new MapHistory();
		
		//one last check for mobile vs desktop 
		const mapDivWidth = document.getElementById(this.divID).clientWidth;
		const parentDivWidth = document.getElementById(this.divID).parentElement.clientWidth;
		//console.log(parentDivWidth + " " + mapDivWidth);
		if (parentDivWidth < mapDivWidth ) {
			//console.log("adjusting screen size to account for mobile");
			if (parentDivWidth < 375)  document.getElementById(this.divID).style.width = `375px`; 
			else document.getElementById(this.divID).style.width = `${parentDivWidth}px`;
			document.getElementById(this.divID).style.height = document.getElementById(this.divID).style.width;
		}

		this.screenW = window.screen.width;
		//console.log(`${this.screenW} : ${document.getElementById(this.divID).style.width}`);

		this.map = L.map(this.divID, {
			crs: L.CRS.Simple, // CRS.Simple, which represents a square grid:
			measureControl: false,
			minZoom: this.minzoom,
			maxZoom: this.maxzoom,
			zoomSnap: this.zoomSnap,
			wheelPxPerZoomLevel: 70,
			maxBoundsViscosity: 0.75,
			//attribution: this.attrib
			attributionControl: false
		}).setView([0,0], this.zoom);

		var tempAttribution = L.control.attribution({prefix: ''}).addTo(this.map);
		
		// Assigns new map imageoverlay/tiles
		// Sets up all associated layers/layerGroups
		this.newMapWithControls(this.mapID);
		//this.searchBar = new SearchBar();
		this.addWaterMark();
	}
	

	/******************************************************** */
	/******* Polygons   w/ connections layergroup   ********* */
	setupZoneConnections(_mapID){
		if (_mapID == undefined) _mapID = this.mapID;
		const _connections = mapDataModel.getConnections(_mapID);
		if (_connections == null ) return;

		// Must use a Pane to change the z-index of ONLY the polygons
		// We set the pane zIndex for the polygons higher, so the mouseover doesnt interfere with the pulsing markers
		// We also set this manually below the default marker zIndex of 600, so all connection related 
		// stuffs are below any entity markers we draw to the map later
		this.map.createPane('connectionsPane_hover');
		this.map.getPane('connectionsPane_hover').style.zIndex = 499;

		this.map.createPane('connectionsPane_pulse');
		this.map.getPane('connectionsPane_pulse').style.zIndex = 498;

		for (const [key, value] of Object.entries(_connections)) {
			// key = mapID for the connection map
			// value = hover / pulse objects

			// Transparent polygon
			// Options: must include Pane to ensure z-index is set
			// Changes based on input from the user with 'showconnections' tag attribute
			var _color = '#ff000000';
			if (showconnections == true) { _color = '#ff4f4f'; }
			var polygonOptions = {color: _color, weight: 0, stroke: false, pane: 'connectionsPane_hover'};
			
			var poly = L.polygon(_connections[key].hover, polygonOptions);
				poly.addTo(this.map);
				//poly.bringToFront();

				poly.on('mouseover', () => {
					var _connectionslayerGroup = L.layerGroup();
					for (const [_key, _value] of Object.entries(_connections[key].pulse)) {
						//mapMarkers.connectionMarker(_value).addTo(_connectionslayerGroup);
						L.marker(_value, { icon: mapMarkers.connectionMarker(), pane: 'connectionsPane_pulse' }).addTo(_connectionslayerGroup);
					}
					this.map.addLayer(_connectionslayerGroup);
					this.connectionLayerHover = _connectionslayerGroup;
					});

				poly.on('mouseout', () => {
					this.map.removeLayer(this.connectionLayerHover);
					this.connectionLayerHover = null;
					});
				

				if ( key == "multiple" ) {

					//console.log(CSS.connectionMultiple_Popup);

					var div = document.createElement("div");
					div.innerHTML = ``;
					
					_connections[key].links.forEach((l) => {					
						const maplink = document.createElement("a");
						maplink.innerHTML = mapDataModel.getMapName(l);
						maplink.style.color = "#644119";
						maplink.onclick = () =>  {
							this.resetMapTo(l);
						}
						div.appendChild(document.createElement("br"));
						div.appendChild(maplink);
					
					});

					//poly.bindPopup(mapDataModel.multipleConnectionsPopupHTML(_connections[key].links));
					poly.bindPopup(div, {
						className: `ffximap-connection-multiple-popup`
					});

				}
				else if( !isNaN(parseInt(key)) ) {

					poly.on('click', () => {
						//console.log(key);
						this.resetMapTo(key);
						});

					//preload images into memory, so load times for any connections are reduced
					
					let preloadedImage = L.imageOverlay(baseMapZonesDir + mapDataModel.getMapFilename(key), mapDataModel.getMapBounds(key))
						preloadedImage._initImage();
						// preloadedImage.once('load', () => {
						// 	this.map.eachLayer((layer) => {
						// 		this.map.removeLayer(layer);
						// 	});
						// });
				}
		}

	}
	
	newMap(_mapID){

		this.map.eachLayer(function (layer) {
			layer.remove();
		});

		if (_mapID == undefined) _mapID = this.mapID;
		
		if ( _mapID == 0 ) {

			//********* World Map
			L.tileLayer(this.tileset, {
				bounds: L.latLngBounds([-256,0], [0,256]),
				attribution: this.attrib
			}).addTo(this.map);
			this.map.setMaxBounds( [[-256,0], [0,256]]);
			this.map.fitBounds( [[-256,0], [0,256]]);
		}
		else {
			var bounds = mapDataModel.getMapBounds(_mapID);
			this.currentMapImageOverlay = L.imageOverlay(baseMapZonesDir + mapDataModel.getMapFilename(_mapID), bounds, 
				{
					attribution: this.attrib 
				});
			this.currentMapImageOverlay.addTo(this.map);
			this.map.fitBounds(bounds);
			this.map.setMaxBounds(bounds);
			
		}

		//this.map.setZoom(this.zoom);
	}

	destroyControlLayers(){
		if (this.controlLayer !== null && this.controlLayer !== undefined) {
			//console.log(this.controlLayer + " : " + this.map);
			this.controlLayer.remove(this.map);
			this.controlLayer = null;
		}
		if (this.position !== undefined)   this.map.removeControl(this.position);

		currentMapMarkersArray = {};
	}


	resetMapTo(_mapID) {
		//console.log("resetMapTo: _mapID:" + _mapID + " this.mapID:" + this.mapID + " getLast:" + this.mapHistory.getLast());
		if (_mapID != this.mapID && this.mapID != this.mapHistory.getLast()) this.mapHistory.add(this.mapID);
		else if (this.mapHistory.getLength() == 0) this.mapHistory.add(this.mapID);

		this._resetMapTo(_mapID);
	}
	
	_resetMapTo(_mapID){
		// Breakdown everything
		this.destroyControlLayers();

		// Remove Map events
		this.removeMapEvents();

		// Setup new map
		this.newMapWithControls(_mapID);
	}

	resetMapfromBackButton(_mapID){
		this._resetMapTo(_mapID);
	}

	display_coordinates(){
		let Position = L.Control.extend({ 
			_container: null,
			options: {
			  position: 'bottomleft'
			},
		
			onAdd: function (map) {
			  var latlng = L.DomUtil.create('div', 'mouseposition');
			  latlng.setAttribute("style","width: 135px; font-size: 12px; text-align: center; border: 1.75px ridge #69696985; cursor:pointer; background-color: #F8F8F8;b order-radius: 3px;");
			  this._latlng = latlng;
			  return latlng;
			},
		
			updateHTML: function(lat, lng, currentZoom, mapid) {
				var m = "Map ID: " + mapid + "<br>";
				var latlng = "Zoom:  " + currentZoom + "<br>";
				latlng += lat + ", " + lng;
				if ( mapDataModel.hasBounds(mapid) == true ) latlng += "<br>(in-game coords)";
				else latlng += "<br>(default coords)";
				
				//this._latlng.innerHTML = "Latitude: " + lat + "   Longitiude: " + lng;
				this._latlng.innerHTML = m + latlng;
			}
		});
		

		/*
		*	Displays mouse position on bottom left of map
		*/
		this.position = new Position();
		this.map.addControl(this.position);
		this.map.addEventListener('mousemove', (e) => {
			var currentZoom = this.map.getZoom();
			
			var x = Math.round(e.latlng.lat * 1000) / 1000,	 // Math.round helps us get the number down to 3 decimal places
				y = Math.round(e.latlng.lng * 1000) / 1000;

			// if ( mapDataModel.hasBounds(this.mapID) == true ) this.position.updateHTML(y, x, currentZoom, this.mapID);
			// else this.position.updateHTML(x, y, currentZoom, this.mapID);	
			this.position.updateHTML(x, y, currentZoom, this.mapID);
		});


		/*
		*	Prints mouse position when clicked on map
		*/
		var fieldNameElement = document.getElementById('polyEditing');
		if (fieldNameElement) { fieldNameElement.innerHTML = "" }

		//console.log(mapDataModel.listMaps());

		this.map.on('click', (e) => {
			var x = Math.round(e.latlng.lat * 1000) / 1000,	// Math.round helps us get the number down to 3 decimal places
				y = Math.round(e.latlng.lng * 1000) / 1000;

        	if (fieldNameElement) { 
				if ( mapDataModel.hasBounds(this.mapID) == true ) fieldNameElement.innerHTML += '[' + y + ", " + x + '], '; 
				else fieldNameElement.innerHTML += '[' + x + ", " + y + '], '; 
			}	
			
		});
	}

	removeMapEvents(){
		this.map.off('click');
	}

	newMapWithControls(_mapID){
		// Establish new map
		this.newMap(_mapID);
	
		// Setup any additional markers/layers for connecting the next zone
		this.setupZoneConnections(_mapID);
		
		// Setup Map Markers
		this.addMapMarkers(_mapID);
		
		// Setup new control layer for the search bar
		this.addSearchBar(_mapID);

		// Setup Back button - for loading previously viewed maps
		//console.log("newMapWithControls: " + this.mapHistory.getLength() +" " + this.mapHistory.getIndex(0));
		if (this.mapHistory.getLength() >= 1 && this.mapHistory.getIndex(0) != _mapID) this.addBackButton();
		else if (this.mapHistory.getLength() == 0 && this.backButton ) {
			this.map.removeControl(this.backButton);
			this.backButton = null;
		}

		//Coordinate display
		//mainly for debugging
		if (showdetails == true) this.display_coordinates();

		this.mapID = _mapID;	
	}

	async addMapMarkers(_mapID){

		let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image,displayposition&where=mapid=${_mapID}&format=json`;
        //console.log(url);

        const response = await fetch(url);
		var mapMarkersFromJSObject = mapDataModel.getJSObjectEntities(_mapID);
        const data = await response.json();
        const mapMarkersFromFetch = mapDataModel.parseFetchedEntities(data);
		
		// If both markers object are 'undefined' then there are no markers, and return out of this function
		if ( typeof(mapMarkersFromJSObject) == 'undefined' && typeof(mapMarkersFromFetch) == 'undefined' ) return;
		
		// If there are JSObject markers and markers from the Cargo query, 
		// then cycle through them and adjust the JSObject markers to match the
		// cargo query ones

		if ( typeof(mapMarkersFromFetch) != 'undefined') {
			mapMarkersFromFetch.forEach((entityFetch) => {
				var shouldAddToArray = true;

				for ( const entityJS in mapMarkersFromJSObject) {
					if ( entityJS['page'] == entityFetch['page']){
						entityJS['mapx'] = entityFetch['mapx'];
						entityJS['mapy'] = entityFetch['mapy'];
						entityJS['imageurl'] = entityFetch['imageurl'];
						entityJS['displayposition'] = entityFetch['displayposition'];
						shouldAddToArray = false;
						break;
					}
				}	
	
				if ( shouldAddToArray == true) mapMarkersFromJSObject.push(entityFetch);
			});
		}

		//console.log(mapMarkersFromJSObject);
		//console.log(parsedEntities);
		//var mapMarkersFromJSObject = mapDataModel.fetchEntities(_mapID);
		
		// validateMarkers();

		// Create markers for all the entities found in current map 
		let entityTypeNamesObject = { };
		
		//console.log(mapMarkersFromJSObject[1]);

		mapMarkersFromJSObject.forEach((e) => {
			// ***************************************** 
			
			//console.log("addMapMarkers:" ,e['page'], e['mapx'], e['mapy'], e['imageurl'], e['displayposition'], _mapID);
			const marker = this._createEntityMarker(e['page'], e['mapx'], e['mapy'], e['imageurl'], e['displayposition'], _mapID);
			
			e['type'].forEach(value => {

				if (!(value in entityTypeNamesObject)) entityTypeNamesObject[`${value}`] = [];
				//console.log(`${e['page']}: adding: value: ${value}, pushing ${marker} `);
				entityTypeNamesObject[`${value}`].push(marker);
			});
		});
		
		if (Object.keys(entityTypeNamesObject).length > 0) {
			this._createEntityMapObject(entityTypeNamesObject);
		}
	}


	// addNPCControlLayersFromJSObject(_mapID){
	// 	if (_mapID == null || mapDataModel.hasEntities(_mapID) == false) return ;

	// 	const entities = mapDataModel.getEntities(_mapID);
	
	// 	var entityArray = []; 

	// 	for ( var i=0; i < entities.length ; i++ ){
	// 		var page,
	// 			mapx = "",
	// 			mapy = "",
	// 			displayposition = "",
	// 			entitytypeArray = [],
	// 			entity = {};

	// 		page = entities[i][1];
	// 		mapx = entities[i][4];
	// 		mapy = entities[i][2];

	// 		if ( mapDataModel.isWithinBounds(mapx, mapy, _mapID) == true ) {
	// 			console.log(`addNPCControlLayersFromJSObject: ${page} (${mapx}, ${mapy}) outside map bounds !`);
	// 			continue;
	// 		}

	// 		var tempArray = entities[i][0];
	// 		for (let x = 0; x < tempArray.length; x++) { tempArray[x] = tempArray[x].trim(); }
	// 		entitytypeArray = entitytypeArray.concat(tempArray);

	// 		//mapid = _mapID;
	// 		displayposition = `(${mapx},${mapy})`;

	// 		entity['page'] = page;
	// 		entity['mapx'] = mapx;
	// 		entity['mapy'] = mapy;
	// 		entity['type'] = entitytypeArray;
	// 		entity['imageurl'] = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/index.php?title=Special:Redirect/file/${page}&width=175`;
	// 		entity['displayposition'] = displayposition;

	// 		entityArray.push(entity);
	// 	}

	// 	return entityArray;
	// }


	async addNPCControlLayersFromFetch(_mapID){
		if (_mapID == null) return ;
		
		let markerLayers = [];
		//let entitytypeArray = [];
		let entityTypeNamesObject = { };

		/* 
		Table/Template structure:
			Page - String	
			mapid - Integer
			mapx - Float
			mapy - Float
			entitytype - List of Page, delimiter: ,
			image - File
			displayposition - String 
		*/

		let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image,displayposition&where=mapid=${_mapID}&format=json`;
		// console.log(`${url}`);

		// fetch(url)
		// 	.then((response) => response.json())
		// 	.then((data) => {
		// 		if (data.cargoquery == null ) return;
		// 		data.cargoquery.forEach((d) => {
					
		// 			var page,
		// 				mapx = "",
		// 				mapy = "",
		// 				mapid = "",
		// 				imageurl = "",
		// 				displayposition = "",
		// 				entitytypeArray = [];

		// 			Object.entries(d.title).forEach(([key, value]) => {
		// 				//console.log(`${key}: ${value}`);
		// 				if ( key == 'Page') page = value;
		// 				else if ( key == 'entitytype') {
		// 					//console.log("***"+page);
		// 					var tempArray = value.split(',');
		// 					for (let i = 0; i < tempArray.length; i++) { tempArray[i] = tempArray[i].trim(); }
		// 					entitytypeArray = Array.from(new Set(entitytypeArray.concat(tempArray)));
		// 				}
		// 				//else if ( key == 'mapid') mapid = value;
		// 				else if ( key == 'mapx') mapx = value;
		// 				else if ( key == 'mapy') mapy = value;
		// 				else if ( key == 'image' && value !== null) {
		// 					imageurl = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/index.php?title=Special:Redirect/file/${value}&width=175`; 
		// 				}
		// 				else if ( key == 'displayposition') displayposition = value;
		// 			  });
					
		// 			// if ( page !== undefined && entitytypeArray.length >=0 &&  mapx !== "" && mapy !== "") { //&& mapid !== "") {
		// 			// 	const marker = this._createEntityMarker(page, mapx, mapy, imageurl, displayposition, mapid);
		// 			// 	//entityTypeNamesObject = entityTypeNamesObject.concat(marker);

		// 			// 	entitytypeArray.forEach(value => {
		// 			// 		if (!(value in entityTypeNamesObject)) entityTypeNamesObject[`${value}`] = [];
		// 			// 		//console.log(`@${page}: adding: value: ${value} `);
		// 			// 		entityTypeNamesObject[`${value}`].push(marker);
		// 			// 		});
		// 			// 	entitytypeArray = [];
		// 			// }
		// 		  });
				  
		// 		// if (Object.keys(entityTypeNamesObject).length > 0) {
		// 		// 	this._createEntityMapObject(entityTypeNamesObject);
		// 		// }
		// 	})
		// 	.catch(console.error);

		return mapDataModel.fetchEntities(_mapID);
	}

	_createEntityMapObject(entityTypeNamesObject){
		
		// var _layerOverlays = {};

		// for (const key in entityTypeNamesObject) {
		// 	//console.log(key);
		// 	var _layerGroupFromObject = L.layerGroup(entityTypeNamesObject[key]);
		// 	if ( this.controlLayer === undefined || this.controlLayer === null) this.controlLayer = new L.control.layers(null, _layerOverlays).addTo(this.map);
		// 	this.controlLayer.addOverlay(_layerGroupFromObject, key);
		
		// 	this.map.on('zoomend', (e) =>  {
		// 		var actualZoom = e.target._zoom
		// 		_layerGroupFromObject.eachLayer(function (_marker) { 
		// 			if (_marker instanceof L.Marker){
		// 				_marker.setIcon(mapMarkers.scaledIcon(actualZoom, _marker));
		// 			}});
		// 	});
	
		// 	this.map.on("overlayremove", (e) =>  {
		// 			if (this.map.hasLayer(_layerGroupFromObject)) {
		// 				this.map.removeLayer(_layerGroupFromObject);
		// 				this.map.addLayer(_layerGroupFromObject);
		// 			}
		// 	  });
		// }

		

		Object.entries(entityTypeNamesObject).forEach(([key, value]) => {
			//console.log(typeof(value));
			var _layerGroupFromObject = L.layerGroup(value);
			
			//var _layerOverlays = { [key] : _layerGroupFromObject };

			if ( this.controlLayer === undefined || this.controlLayer === null) this.controlLayer = new L.control.layers(null, null).addTo(this.map);
			
			this.controlLayer.addBaseLayer(_layerGroupFromObject, key);
			//this.controlLayer.addOverlay(_layerGroupFromObject, key);

			this.map.on('zoomend', (e) =>  {
				var actualZoom = e.target._zoom
				_layerGroupFromObject.eachLayer(function (_marker) { 
					if (_marker instanceof L.Marker){
						_marker.setIcon(mapMarkers.scaledIcon(actualZoom, _marker));
					}});
			});

			// this.map.on("overlayremove", (e) =>  {
			// 	console.log('fire');
			// 		if (this.map.hasLayer(_layerGroupFromObject)) {
			// 			this.map.removeLayer(_layerGroupFromObject);
			// 			this.map.addLayer(_layerGroupFromObject);
			// 		}
			// });
		});
	}

	_createEntityMarker(page, mapx, mapy, imageurl, displayposition, mapid){
			
			//move to MapMarker class once this is functioning correctly
			var tooltiptemplate = `<div class="ffximap-icon-tooltip">`; 
			if (imageurl !== undefined && imageurl !== null && imageurl != "") {

				tooltiptemplate += `<img src="${imageurl}" alt=\"\" class="img-alt">`;
			}
			tooltiptemplate += `<b><i><center>${page}</i></b><br> ${displayposition}</center></div>`;
			//////

			var marker = L.marker([mapx, mapy], {
					icon: mapMarkers.icon_NPC()
				})
				.bindTooltip(L.Util.template(tooltiptemplate, null), {
					opacity: 1.0
				})
				.on('click', (e) => {
						window.open(mw.config.get('wgServer') + mw.config.get('wgScript') + `?title=${page}`);
						//console.log(mw.config.get('wgServer') + mw.config.get('wgScript') + `?title=${page}`);
				});
		return marker;

	}

	
	addSearchBar(_mapID){
		if (this.controlSearchBar ) return;

		this.controlSearchBar = new L.Control.Search({
			//layer: new L.LayerGroup()
			sourceData: mapDataModel.searchBarMapsList(),

			}).on('search:expanded', function () {
				this._input.onkeyup = function(){
					// console.log(this.value)
					// let result = [];
					// let input = this.value;
					// if (input.length){
					// 	result = this.sourceData.filter((keyword)=>{
					// 		return keyword.toLowerCase().includes(input.toLowerCase());
					// 	});
					// 	console.log(result);
					// }
				}	
			}).on('search:locationfound', (e) => {
				//console.log(e.mapid);
				this.resetMapTo(e.mapid);
			}).addTo(this.map);
	}

	addBackButton() {
		if( this.backButton ) return;

		// from https://web.archive.org/web/20191218192541/http://www.coffeegnome.net/control-button-leaflet/
		let BackButton = L.Control.extend({
			options: {
			  position: 'topleft' 
			},
			onAdd: (e) => {
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-worldmap');
				//graphics managed in leaflet.css
				container.onclick = (e) => {
				  this.backButtonClicked();
				}					
				return container;
			},
		  });

		  this.backButton = new BackButton();
		  this.map.addControl(this.backButton);
	}

	backButtonClicked(){
		var changeMapto = this.mapHistory.getLast();
		this.mapHistory.clearMap();
		//console.log("back to: " + changeMapto);
		this.resetMapfromBackButton(changeMapto);
		
	}
	
	addWaterMark(){
		L.Control.Watermark = L.Control.extend({
			onAdd: function(map) {
				var img = L.DomUtil.create('img');
		
				img.src = baseDir + '/modules/images/wiki_logo.png';
				img.style.width = '50px';
				img.style.opacity = '0.25';
				return img;
			},
		
			onRemove: function(map) {
				// Nothing to do here
			}
		});
		
		L.control.watermark = function(opts) {
			return new L.Control.Watermark(opts);
		}
		
		L.control.watermark({ position: 'bottomleft' }).addTo(this.map);
	}

	async _preloadConnectionMaps(){

	}
}

class MapHistory{
	constructor(){
        this.mapArray = [];
    }

	add(newMap){
		this.mapArray.push(newMap);
		if (this.mapArray.length > 6) this.mapArray.shift();
		//console.log("add:" + this.mapArray);
	}

	clearMap(){
		this.mapArray.pop();
		//console.log("clear: " + this.mapArray);
	}

	getLength(){
		return this.mapArray.length;
	}

	getIndex(index){
		return this.mapArray[index];
	}

	getLast(){
		return this.mapArray[this.mapArray.length - 1];
	}


}