

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
	console.log('mw.hook( \'wikipage.content\' ) FIRED');
	
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
	var tagAttributesQuery = document.querySelector('#tagAttributes'),
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

	var layersQuery = document.querySelector('#layers'),
		dataLayers = layersQuery.dataset;
		//console.log(dataLayers.name);

		
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
	
	// mapdata = data.mapData;
	// //console.log(mapdata['141']);
	// //console.log(mapdata["53"].connections["141"].pulse);
	// console.log(mapdata["53"].connections["141"]);
	//mapDataModel.getConnections("141");
}


class FFXIMap {
	connectionLayerHover;
	

	constructor(divID, mapID, tileset, minzoom, maxzoom, zoom) {
		
		this.divID = typeof divID !== 'undefined' ? divID : "mapID_0";
		this.mapID = typeof mapID !== 'undefined' ? mapID : 0;
		this.tileset = typeof tileset !== 'undefined' ? tileset : baseMapTilesDir + "{z}/{x}/{y}.jpeg";

		this.minzoom = typeof minzoom !== 'undefined' ? minzoom : 1;
		this.maxzoom = typeof maxzoom !== 'undefined' ? maxzoom : 6;
		this.zoom = typeof zoom !== 'undefined' ? zoom : 1;

		this.attrib = '© HorizonXI | FFXI: © Square Enix | Maps: © Remapster';

		//I have no idea why these bounds work... 
		this.bounds = [[0,0], [256,256]];

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
		if (this.layerControl !== undefined ) this.layerControl.remove(this.map);
		this.map.removeControl(this.position);
	}

	resetMapTo(_mapID) {

		// Breakdown everything
		this.destroyControlLayers();

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
			  this._latlng = latlng;
			  return latlng;
			},
		
			updateHTML: function(lat, lng, currentZoom) {
			  var latlng = "z:" + currentZoom + " " + lat + ", " + lng;
			  //this._latlng.innerHTML = "Latitude: " + lat + "   Longitiude: " + lng;
			  this._latlng.innerHTML = "LatLng: " + latlng;
			}
		});
		
		this.position = new Position();
		this.map.addControl(this.position);
		this.map.addEventListener('mousemove', (event) => {
			let lat = Math.round(event.latlng.lat * 100000) / 100000;
			let lng = Math.round(event.latlng.lng * 100000) / 100000;
			
			var currentZoom = this.map.getZoom();
			this.position.updateHTML(lat, lng, currentZoom);
		});

		this.map.on('click', function(e) {        
			let lat = Math.round(e.latlng.lat * 100000) / 100000;
			let lng = Math.round(e.latlng.lng * 100000) / 100000;    
			
			$('#polyEditing ').append(
				'['+lat + ", " + lng+'], ');
			//console.log(lat + ", " + lng);
		});
	}

	newMapWithControls(_mapID){
		// Establish new map
		this.newMap(_mapID);

		// Setup new control layers for NPCs, zones, etc.
		//this.layerControl = this.newControlLayers(_mapID);
		this.addNewControlLayers(_mapID);

		// Setup any additional markers/layers for connecting the next zone
		this.setupZoneConnections(_mapID);

		//Coordinate display
		//mainly for debugging
		this.display_coordinates();
	}

	async addNewControlLayers(_mapID){
		if (mapID == null) return ;
		let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximap_markers&fields=_pageName=Page,entityType,position,mapID&where=mapID=${_mapID}&format=json`;
		//console.log(url);
		// const response = await fetch(url);
		// const temp = await response.json();

		// console.log(typeof temp);
	
		const markerLayers = [];
		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				data.cargoquery.forEach((d) => {
					var page, entityType, posX, posY, mapID;
					Object.entries(d.title).forEach(([key, value]) => {
						//console.log(`${key}: ${value}`);
						if ( key == 'Page') page = value;
						else if ( key == 'entityType') entityType = value;
						else if ( key == 'mapID') mapID = value;
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
				//console.log(data.cargoquery);

				if (markerLayers.length > 0) {
					var npc_list = L.layerGroup(markerLayers);
		
					var npcLayer = {
						"<span style='color: green'>NPCs</span>": npc_list
					};
		
					this.layerControl = new L.control.layers(null, npcLayer).addTo(this.map);
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
		
		// this.layerControl = new L.control.layers(null, npcLayer).addTo(this.map);
	
		
	}

	initIcons(iconsize,iconanchor,icons, mousepopup){
		this.iconsize = typeof iconsize !== 'undefined' ? iconsize : [32,32];
		this.iconanchor = typeof iconanchor !== 'undefined' ? iconanchor : [10,32];
		this.icons = typeof icons !== 'undefined' ? icons : "maps/markers/marker{label}.png";
		this.mousepopup = typeof mousepopup !== 'undefined' ? mousepopup : false;
	}
	
	// setControls(position, region, fullscreen, zoom, layer, measure) {
	// 	this.showposition = typeof position !== 'undefined' ? position : 1;
	// 	this.showregion = typeof region !== 'undefined' ? region : 1;
	// 	this.fullscreenc = typeof fullscreen !== 'undefined' ? fullscreen : 1;
	// 	this.zoomc = typeof zoom !== 'undefined' ? zoom : 1;
	// 	this.layerc = typeof layer !== 'undefined' ? layer : 1;
	// 	position ? this.mapID.addControl(this.positioncontrol) : this.mapID.removeControl(this.positioncontrol);
	// 	region ? this.mapID.addControl(this.regioncontrol) : this.mapID.removeControl(this.regioncontrol);
	// 	// region ? this.mapID.addControl(this.secondregioncontrol) : this.mapID.removeControl(this.secondregioncontrol);
	// 	// position ? this.mapID.addControl(this.secondpositioncontrol) : this.mapID.removeControl(this.secondpositioncontrol);
	// 	fullscreen ? this.mapID.addControl(this.fullscreencontrol) : this.mapID.removeControl(this.fullscreencontrol);
	// 	layer ? this.mapID.addControl(this.layerscontrol) : this.mapID.removeControl(this.layerscontrol);
	// 	// measure ? this.mapID.addControl(this.mapID.measureControl) : this.mapID.removeControl(this.mapID.measureControl);
	// 	zoom ? this.mapID.addControl(this.mapID.zoomControl) : this.mapID.removeControl(this.mapID.zoomControl);
		
	// }
}



/* Full screen Control */

// (function() {

// L.Control.FullScreen = L.Control.extend({
// 	options: {
// 		position: 'topleft',
// 		title: 'Full Screen',
// 		forceSeparateButton: false
// 	},
	
// 	onAdd: function (map) {
// 		var className = 'leaflet-control-zoom-fullscreen', container;
		
// 		if (map.zoomControl && !this.options.forceSeparateButton) {
// 			container = map.zoomControl._container;
// 		} else {
// 			container = L.DomUtil.create('div', 'leaflet-bar');
// 		}
		
// 		this._createButton(this.options.title, className, container, this.toogleFullScreen, map);

// 		return container;
// 	},
	
// 	_createButton: function (title, className, container, fn, context) {
// 		var link = L.DomUtil.create('a', className, container);
// 		link.href = '#';
// 		link.title = title;

// 		L.DomEvent
// 			.addListener(link, 'click', L.DomEvent.stopPropagation)
// 			.addListener(link, 'click', L.DomEvent.preventDefault)
// 			.addListener(link, 'click', fn, context);
		
// 		L.DomEvent
// 			.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
// 			.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
// 			.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
		
// 		L.DomEvent
// 			.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
// 			.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
// 			.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

// 		return link;
// 	},
	
// 	toogleFullScreen: function () {
// 		this._exitFired = false;
// 		var container = this._container;
// 		if (this._isFullscreen) {
// 			if (fullScreenApi.supportsFullScreen) {
// 				fullScreenApi.cancelFullScreen(container);
// 			} else {
// 				L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
// 			}
// 			this.invalidateSize();
// 			this.fire('exitFullscreen');
// 			this._exitFired = true;
// 			this._isFullscreen = false;
// 		}
// 		else {
// 			if (fullScreenApi.supportsFullScreen) {
// 				fullScreenApi.requestFullScreen(container);
// 			} else {
// 				L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
// 			}
// 			this.invalidateSize();
// 			this.fire('enterFullscreen');
// 			this._isFullscreen = true;
// 		}
// 	},
	
// 	_handleEscKey: function () {
// 		if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
// 			this.fire('exitFullscreen');
// 			this._exitFired = true;
// 			this._isFullscreen = false;
// 		}
// 	}
// }); 

// L.Map.addInitHook(function () {
// 	if (this.options.fullscreenControl) {
// 		this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
// 		this.addControl(this.fullscreenControl);
// 	}
// });

// L.control.fullscreen = function (options) {
// 	return new L.Control.FullScreen(options);
// };


// /* 
// Native FullScreen JavaScript API
// -------------
// Assumes Mozilla naming conventions instead of W3C for now

// source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

// */

// 	var 
// 		fullScreenApi = { 
// 			supportsFullScreen: false,
// 			isFullScreen: function() { return false; }, 
// 			requestFullScreen: function() {}, 
// 			cancelFullScreen: function() {},
// 			fullScreenEventName: '',
// 			prefix: ''
// 		},
// 		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
// 	// check for native support
// 	if (typeof document.exitFullscreen != 'undefined') {
// 		fullScreenApi.supportsFullScreen = true;
// 	} else {
// 		// check for fullscreen support by vendor prefix
// 		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
// 			fullScreenApi.prefix = browserPrefixes[i];
// 			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
// 				fullScreenApi.supportsFullScreen = true;
// 				break;
// 			}
// 		}
// 	}
	
// 	// update methods to do something useful
// 	if (fullScreenApi.supportsFullScreen) {
// 		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
// 		fullScreenApi.isFullScreen = function() {
// 			switch (this.prefix) {	
// 				case '':
// 					return document.fullScreen;
// 				case 'webkit':
// 					return document.webkitIsFullScreen;
// 				default:
// 					return document[this.prefix + 'FullScreen'];
// 			}
// 		}
// 		fullScreenApi.requestFullScreen = function(el) {
// 			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
// 		}
// 		fullScreenApi.cancelFullScreen = function(el) {
// 			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
// 		}
// 	}

// 	// jQuery plugin
// 	if (typeof jQuery != 'undefined') {
// 		jQuery.fn.requestFullScreen = function() {
// 			return this.each(function() {
// 				var el = jQuery(this);
// 				if (fullScreenApi.supportsFullScreen) {
// 					fullScreenApi.requestFullScreen(el);
// 				}
// 			});
// 		};
// 	}

// 	// export api
// 	window.fullScreenApi = fullScreenApi;
// })();

// /* Measure control */
// L.Control.Measure = L.Control.extend({
//     options: {
//         position: 'topleft'
//     },

//     initialize: function (options) {
//         L.Util.setOptions(this, options);

//         this._enabled = false;
//         this._container = null;
//         this._button = null;
//         this._buttonD = null;
//         this._map = null;

//         this._features = new L.FeatureGroup();
//         this._markerList = [];

//         this._startPoint = null;
//         this._endPoint = null;
//         this._line = null;
//     },

//     onAdd: function (map) {
//         this._map = map;
//         this._features.addTo(map);

//         this._container = L.DomUtil.create('div', 'leaflet-control-measure leaflet-bar leaflet-control');
//         this._button = L.DomUtil.create('a', 'leaflet-bar-part', this._container);
//         this._button.href = '#';
//         this._button.innerHTML = 'M';
//         this._button.title = 'Measure';

//         L.DomEvent
//             .on(this._button, 'click', L.DomEvent.stopPropagation)
//             .on(this._button, 'mousedown', L.DomEvent.stopPropagation)
//             .on(this._button, 'dblclick', L.DomEvent.stopPropagation)
//             .on(this._button, 'click', L.DomEvent.preventDefault)
//             .on(this._button, 'click', this._onClick, this);

//         return this._container;
//     },

//     _enable: function() {
//         this._startPoint = null;
//         this._endPoint = null;
//         this._line = null;

//         this._features.clearLayers();
//         this._markerList = [];

//         this._enabled = true;
//         L.DomUtil.addClass(this._button, 'leaflet-control-measure-enabled');
//         this._map.on('click', this._onMapClick, this);
//     },
//     _disable: function() {
//         this._enabled = false;
//         L.DomUtil.removeClass(this._button, 'leaflet-control-measure-enabled');
//         this._map.off('click', this._onMapClick, this);
//     },

//     _onClick: function() {
//         if (this._enabled) this._disable();
//         else               this._enable();
//     },

//     _onMapClick: function(e) {
//         var marker = new L.Marker(e.latlng, { draggable: true });
// 		var ll = LatLngToCoord(e.latlng);
// 		marker.bindPopup(ll.y.toFixed(0) + ', ' + ll.x.toFixed(0));
//         marker.on('drag', this._onMarkerDrag, this);
//         marker.on('dragend', this._onMarkerDragEnd, this);

//         this._features.addLayer(marker);
//         this._markerList.push(marker);

//         if (this._startPoint === null) {
//             this._startPoint = e.latlng;

//         }
//         else if (this._endPoint === null) {
//             this._endPoint = e.latlng;
// 			var ll_end = LatLngToCoord(this._endPoint);
// 			var ll_start = LatLngToCoord(this._startPoint);
//             this._line = new L.Polyline([ this._startPoint, this._endPoint ], { color: 'black', opacity: 0.5, stroke: true });
//             this._features.addLayer(this._line);

//             var distance = Math.sqrt(Math.pow(ll_start.x - ll_end.x, 2) + Math.pow(ll_start.y - ll_end.y, 2));

//             var sz  = 'Distance: ' + distance.toFixed(0) + ' coords.';
//             this._line.bindPopup(sz).openPopup();

//             this._disable();
//         }
//     },

//     _onMarkerDrag: function(e) {
//         var marker = e.target;
//         var i = this._markerList.indexOf(marker);

//         var listLatng = this._line.getLatLngs();
//         listLatng[i] = marker.getLatLng();
//         this._line.setLatLngs(listLatng);

//         if (i == 0)
//             this._startPoint = marker.getLatLng();
//         else if (i == (this._markerList.length - 1))
//             this._endPoint = marker.getLatLng();
//     },
//     _onMarkerDragEnd: function(e) {
// 		var ll_end = LatLngToCoord(this._endPoint);
// 		var ll_start = LatLngToCoord(this._startPoint);
//         var distance = Math.sqrt(Math.pow(ll_start.x - ll_end.x, 2) + Math.pow(ll_start.y - ll_end.y, 2));
//         var sz  = 'Distance: ' + distance.toFixed(0) + ' coords.';
//         this._line.bindPopup(sz).openPopup();
//     }
// });

// L.control.measure = function(options) {
//     return new L.Control.Measure(options);
// };

// L.Map.mergeOptions({
//     measureControl: false
// });

// L.Map.addInitHook(function() {
//     if (this.options.measureControl) {
//         this.measureControl = new L.Control.Measure();
//         this.addControl(this.measureControl);
//     }
// });

/* Rose popups */
