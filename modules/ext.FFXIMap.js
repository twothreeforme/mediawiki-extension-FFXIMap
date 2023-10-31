/*	Attributions:
 *  Leaflet library used for all map related objects: https://leafletjs.com/
 *	Leaflet Control Search - Copyright Stefano Cudini - Leaflet addon for search box - https://github.com/stefanocudini/leaflet-search
 *	
 */

/**
 * The map object used by leaflet 
 * @return {FFXIMap} FFXIMap object. 
 */
let m = null;
let map = null;

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
	baseDir,
	baseMapDir,
	baseMapTilesDir,
	baseMapZonesDir,
	currentMapImageOverlay;


/**
 * class MapMarkers defined in ext.maphelper.js
 * Object containing the various icons used as map markers
 * and functions supporting icon display.
 * Icons returned follow the leaflet Icon object model
 * @string baseMapMarkersDir: location of icon image files, passed to constructor after wikiContent is loaded
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


mw.hook( 'wikipage.content' ).add( function ( $content ) {
	//console.log('mw.hook( \'wikipage.content\' ) FIRED'); 

	setPageAttributes();
	setupMarkers();
	setupMapData();

	setupNewMap();
});

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

	L.Marker.prototype.options.icon = L.icon({
			iconRetinaUrl: baseMapMarkersDir + 'npc-icon-2x.png',
			iconUrl: baseMapMarkersDir + 'npc-icon.png',
	});
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
}


class FFXIMap {
	connectionLayerHover;
	
	constructor(divID, mapID, tileset, minzoom, maxzoom, zoom) {
		//console.log('FFXIMap constructor began');

		this.divID = typeof divID !== 'undefined' ? divID : "mapID_0";
		this.mapID = typeof mapID !== 'undefined' ? mapID : 0;
		this.tileset = typeof tileset !== 'undefined' ? tileset : baseMapTilesDir + "{z}/{x}/{y}.jpeg";

		this.minzoom = typeof minzoom !== 'undefined' ? minzoom : 1;
		this.maxzoom = typeof maxzoom !== 'undefined' ? maxzoom : 6;
		this.zoom = typeof zoom !== 'undefined' ? zoom : 1;

		this.attrib = '© Remapster|© Square Enix|© FFXI-Atlas';

		//I have no idea why these bounds work... 
		this.bounds = [[0,0], [256,256]];

		//one last check for mobile vs desktop 
		const mapDivWidth = document.getElementById(this.divID).clientWidth;
		const parentDivWidth = document.getElementById(this.divID).parentElement.clientWidth;
		//console.log(parentDivWidth + " " + mapDivWidth);
		if (parentDivWidth < mapDivWidth ) {
			//console.log("adjusting screen size to account for mobile");
			if (parentDivWidth < 400)  document.getElementById(this.divID).style.width = `400px`; 
			else document.getElementById(this.divID).style.width = `${parentDivWidth}px`;
			document.getElementById(this.divID).style.height = document.getElementById(this.divID).style.width;
		}

		this.map = L.map(this.divID, {
			crs: L.CRS.Simple, // CRS.Simple, which represents a square grid:
			measureControl: false,
			minZoom: 1,
			maxZoom: 6,
			fitBounds: this.bounds,
			wheelPxPerZoomLevel: 90,
			maxBoundsViscosity: 0.75,
			maxBounds: this.bounds,
			attribution: this.attrib,
		}).setView([0,0], this.zoom);

		// Assigns new map imageoverlay/tiles
		// Sets up all associated layers/layerGroups
		this.newMapWithControls(this.mapID);

		//this.searchBar = new SearchBar();
	}
	

	/******************************************************** */
	/******* Polygons   w/ connections layergroup   ********* */
	setupZoneConnections(_mapID){
		if (_mapID == undefined) _mapID = this.mapID;
		const _connections = mapDataModel.getConnections(_mapID);
		if (_connections == null ) return;

		for (const [key, value] of Object.entries(_connections)) {
		// key = mapID for the connection map
		// value = hover / pulse objects

			// Must use a Pane to change the z-index of ONLY the polygons
			// MUST DO THIS TO ENSURE THE MOUSE POSITION DOES NOT INTERFERE WITH THE PULSING ICONS
			this.map.createPane('connectionsPane');
			this.map.getPane('connectionsPane').style.zIndex = 601;

			// Transparent polygon
			// Options: must include Pane to ensure z-index is set
			var polygonOptions = {color: '#ff000000', weight: 0, stroke: false, pane: 'connectionsPane'};

			var poly = L.polygon(_connections[key].hover, polygonOptions);
				poly.addTo(this.map);
				//poly.bringToFront();

				poly.on('mouseover', () => {
					var _connectionslayerGroup = L.layerGroup();
					for (const [_key, _value] of Object.entries(_connections[key].pulse)) {
						mapMarkers.connectionMarker(_value).addTo(_connectionslayerGroup);
					}
					this.map.addLayer(_connectionslayerGroup);
					this.connectionLayerHover = _connectionslayerGroup;
					});

				poly.on('mouseout', () => {
					this.map.removeLayer(this.connectionLayerHover);
					this.connectionLayerHover = null;
					});

				poly.on('click', () => {
					//console.log(key);
					this.resetMapTo(key);
					});
			
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
				maxZoom: this.maxzoom,
				minZoom: this.minzoom,
				continuousWorld: false,
				noWrap: true,
				maxBoundsViscosity: 0.75,
				maxBounds: this.bounds,
				attribution: this.attrib
			}).addTo(this.map);
		}
		else {
			this.currentMapImageOverlay = L.imageOverlay(baseMapZonesDir + mapDataModel.getMapFilename(_mapID), 
				this.bounds, 
				{
					attribution: this.attrib 
				});
			this.currentMapImageOverlay.addTo(this.map);
		}

		this.map.setZoom(this.zoom);
	}

	newControlLayers(_mapID){
		if (_mapID == undefined) return null;
		
		var _ = addMarkersLayerGroups(_mapID);


		var	denver = L.marker([116, 147], {
			icon: mapMarkers.npcMarker
		}).bindPopup('NPC Name (x, y)');

		var npc_list = L.layerGroup([denver]);
		
		var npcLayer = {
			"<span style='color: green'>NPCs</span>": npc_list
		};

		return new L.control.layers(null, npcLayer).addTo(this.map); 
	}

	destroyControlLayers(){
		if (this.controlLayer !== undefined ) this.controlLayer.remove(this.map);
		if (this.position !== undefined)   this.map.removeControl(this.position);
	}

	resetMapTo(_mapID) {

		// Breakdown everything
		this.destroyControlLayers();

		// Remove Map events
		this.removeMapEvents();

		// Setup new map
		this.newMapWithControls(_mapID);
	}

	display_coordinates(){
		let Position = L.Control.extend({ 
			_container: null,
			options: {
			  position: 'bottomleft'
			},
		
			onAdd: function (map) {
			  var latlng = L.DomUtil.create('div', 'mouseposition');
			  latlng.setAttribute("style","width: 135px;text-align: center; border: 1.75px ridge #69696985; cursor:pointer; background-color: #F8F8F8;border-radius: 3px;");
			  this._latlng = latlng;
			  return latlng;
			},
		
			updateHTML: function(lat, lng, currentZoom) {
			  var latlng = "Zoom:  " + currentZoom + "<br>";
			  latlng += lat + ", " + lng;
			  //this._latlng.innerHTML = "Latitude: " + lat + "   Longitiude: " + lng;
			  this._latlng.innerHTML = latlng;
			}
		});
		

		/*
		*	Displays mouse position on bottom left of map
		*/
		this.position = new Position();
		this.map.addControl(this.position);
		this.map.addEventListener('mousemove', (event) => {
			let lat = Math.round(event.latlng.lat * 100000) / 100000;
			let lng = Math.round(event.latlng.lng * 100000) / 100000;
			
			var currentZoom = this.map.getZoom();
			this.position.updateHTML(lat, lng, currentZoom);
		});


		/*
		*	Prints mouse position when clicked on map
		*/
		var fieldNameElement = document.getElementById('polyEditing');
		if (fieldNameElement) { fieldNameElement.innerHTML = "" }

		//console.log(mapDataModel.listMaps());

		this.map.on('click', function(e) {        
			let lat = Math.round(e.latlng.lat * 100000) / 100000;
			let lng = Math.round(e.latlng.lng * 100000) / 100000;

        	if (fieldNameElement) { fieldNameElement.innerHTML += '[' + lat + ", " + lng + '], '; }
		});
	}

	removeMapEvents(){
		this.map.off('click');
	}

	newMapWithControls(_mapID){
		// Establish new map
		this.newMap(_mapID);

		// Setup new control layers for NPCs, zones, etc.
		//this.controlLayer = this.newControlLayers(_mapID);
		this.addNPCControlLayers(_mapID);


		this.addSearchBar(_mapID);

		// Setup any additional markers/layers for connecting the next zone
		this.setupZoneConnections(_mapID);

		//Coordinate display
		//mainly for debugging
		this.display_coordinates();
	}

	async addNPCControlLayers(_mapID){
		if (mapID == null) return ;
		let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximap_markers&fields=_pageName=Page,entitytype,position,mapid&where=mapid=${_mapID}&format=json`;
		console.log(url);
		// const response = await fetch(url);
		// const temp = await response.json();

		// console.log(typeof temp);
	
		const markerLayers = [];
		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				if (data.cargoquery == null ) return;
				data.cargoquery.forEach((d) => {
					var page, entityType, posX, posY, mapID;
					Object.entries(d.title).forEach(([key, value]) => {
						//console.log(`${key}: ${value}`);
						if ( key == 'Page') page = value;
						else if ( key == 'entitytype') entityType = value;
						else if ( key == 'mapid') mapID = value;
						else if ( key == 'position') {
							var posArray = value.split(',');
							posX = parseFloat(posArray[0]);
							posY = parseFloat(posArray[1]);
							//console.log(posArray[0] + " : " + posArray[1]);
						}
					  });
					if ( page !== undefined && entityType !== undefined &&  posX !== undefined && posY !== undefined && mapID !== undefined) {
						var marker = L.marker([posX, posY], {
							icon: mapMarkers.npcMarker
							}).bindPopup(`${page} (${posX}, ${posY})`);
						markerLayers.push(marker);
					}
				  });
				// console.log(data.cargoquery);

				if (markerLayers.length > 0) {
					var npc_list = L.layerGroup(markerLayers);
		
					var npcLayer = {
						"<span style='color: green'>NPCs</span>": npc_list
					};
		
					this.controlLayer = new L.control.layers(null, npcLayer).addTo(this.map);
				}
			})
			.catch(console.error);

		// var	denver = L.marker([116, 147], {
		// 	icon: mapMarkers.npcMarker
		// }).bindPopup('NPC Name (x, y)');
	
		// var npc_list = L.layerGroup([denver]);
		
		// var npcLayer = {
		// 	"<span style='color: green'>NPCs</span>": npc_list
		// };
		
		// this.controlLayer = new L.control.layers(null, npcLayer).addTo(this.map);
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
}


