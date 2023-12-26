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
	loadedMapMarkersArray,
	baseDir,
	baseMapDir,
	baseMapTilesDir,
	baseMapZonesDir;

/**
 * imported from ext.mapMarker.js
 * contains module.exports {} 
 *  */	
const MapMarkersDataImport = require("./ext.mapMarker.js");
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
	mapMarkers = new MapMarkersDataImport.MapMarker();
}


/**
 * Takes all custom <span> tag attributes and assigns those values to our global variables
 * This is parsed from the , after it the content is loaded
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

		this.abortController = null;


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
			//console.log(baseMapMarkersDir + "matte_black.png");
			var blackBackground = L.imageOverlay(baseMapMarkersDir + "matte_black.png", bounds, 
			{
				opacity: 1.0,
				zIndex: 0
				//attribution: this.attrib 
			});
			blackBackground.addTo(this.map);

			this.currentMapImageOverlay = L.imageOverlay(baseMapZonesDir + mapDataModel.getMapFilename(_mapID), bounds, 
				{
					opacity: 1.0,
					attribution: this.attrib 
				});
			this.currentMapImageOverlay.addTo(this.map);
			this.map.fitBounds(bounds);
			this.map.setMaxBounds(bounds);

			

			
		}
		mapMarkers.currentZoom = this.map.getZoom();
		//this.map.setZoom(this.zoom);
		this.map.on('zoomstart', (e) =>  {
			mapMarkers.currentZoom = e.target._zoom;
		});

		this.map.on('zoomend', (e) =>  {
			mapMarkers.currentZoom = e.target._zoom;
		});

	}

	destroyControlLayer(){
		if (this.controlLayer !== null && this.controlLayer !== undefined) {
			this.controlLayer.remove(this.map);
			this.controlLayer = null;
		}
	}

	destroyMap(){
		this.abortFetching();

		this.destroyControlLayer();

		if (this.position !== undefined)   this.map.removeControl(this.position);
		
		loadedMapMarkersArray = null;

		this.map.eachLayer((layer) => {
			this.map.removeLayer(layer);
		});
	}

	resetMapTo(_mapID) {
		//console.log("resetMapTo: _mapID:" + _mapID + " this.mapID:" + this.mapID + " getLast:" + this.mapHistory.getLast());
		if (_mapID != this.mapID && this.mapID != this.mapHistory.getLast()) this.mapHistory.add(this.mapID);
		else if (this.mapHistory.getLength() == 0) this.mapHistory.add(this.mapID);

		this._resetMapTo(_mapID);
	}
	
	_resetMapTo(_mapID){
		// Breakdown everything
		this.destroyMap();

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
		this.map.off('zoomstart');
		this.map.off('zoomend');
		this.map.off('overlayadd');
		this.map.off('overlayremove');

	}

	async addMapMarkers(_mapID){
		//console.log(abort);

		var mapMarkersFromJSObject = await mapDataModel.getJSObjectEntities(_mapID, this.abortController);

		var url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image,displayposition&where=mapid=${_mapID}&format=json`;
        var response = await fetch(url, { signal: this.abortController.signal });
        var data = await response.json();
        var mapMarkersFromFetch = await mapDataModel.parseFetchedEntities(data, this.abortController);
		
		// If both markers object are 'undefined' then there are no markers, and return out of this function
		//console.log(mapMarkersFromJSObject, mapMarkersFromFetch);
		if ( typeof(mapMarkersFromJSObject) == 'undefined' && typeof(mapMarkersFromFetch) == 'undefined' ) return;
		
		// If there are JSObject markers and markers from the Cargo query, 
		// then cycle through them and adjust the JSObject markers to match the
		// cargo query ones
		if ( typeof(mapMarkersFromFetch) != 'undefined') {
			if (mapMarkersFromJSObject == 'undefined') mapMarkersFromJSObject = {};
			mapMarkersFromFetch.forEach((entityFetch) => {
				var shouldAddToArray = true;

				for ( var entityJS in mapMarkersFromJSObject) {
					if ( entityJS['page'] == entityFetch['page']){
						entityJS['mapx'] = entityFetch['mapx'];
						entityJS['mapy'] = entityFetch['mapy'];
						entityJS['imageurl'] = entityFetch['imageurl'];
						entityJS['displayposition'] = entityFetch['displayposition'];
						shouldAddToArray = false;
						break;
					}
				}	
				
				if ( entityFetch !== 'undefined' && shouldAddToArray == true){
					//console.log(entityFetch);
					mapMarkersFromJSObject.push(entityFetch);
				} 
			});
		}

		var entityTypeNamesObject = { };
		
		mapMarkersFromJSObject.forEach((e) => {
			var marker = mapMarkers.new(e['page'], e['mapx'], e['mapy'], e['imageurl'], e['displayposition'], e['type']);
			
			e['type'].forEach(value => {

				if (!(value in entityTypeNamesObject)) entityTypeNamesObject[`${value}`] = [];
				//console.log(`${e['page']}: adding: value: ${value}, pushing ${marker} `);
				entityTypeNamesObject[`${value}`].push(marker);
			});

			mapMarkers.createToolTip(marker, this.abortController);
			// console.log(marker.options.name ,marker.getLatLng().lat, marker.getLatLng().lng);
		});

		// Hurry up and get what we have at this point on the map in a control layer
		if (Object.keys(entityTypeNamesObject).length > 0) {
			this._createEntityMapObject(entityTypeNamesObject, _mapID);
		}

	}

	abortFetching(abortDescription) {
		//console.log("FFXIMap: abortFetching()", this.abortController);
		if (this.abortController !== null ) {
			this.abortController.abort(abortDescription);
		}
		this.abortController = null;
    }

	newMapWithControls(_mapID){

		if ( this.abortController !== null ) {
			this.abortFetching("FFXIMap: Changing maps");
		}

		this.abortController = new AbortController();
		// this.abortController.signal.addEventListener(
		// 	"abort",
		// 	() => {
		// 	  console.log(this.abortController.signal.reason);
		// 	  return;
		// 	}
		//   );

		// Establish new map
		this.newMap(_mapID);
	
		// Setup Map Markers
		this.addMapMarkers(_mapID, this.abortController);
		
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

		// Setup any additional markers/layers for connecting the next zone
		this.setupZoneConnections(_mapID);

		this.mapID = _mapID;	
	}

	// async addNPCControlLayersFromFetch(_mapID){
	// 	if (_mapID == null) return ;
	// 	//let url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image,displayposition&where=mapid=${_mapID}&format=json`;
	// 	return mapDataModel.fetchEntities(_mapID);
	// }

	_createEntityMapObject(entityTypeNamesObject, _mapID){
		var count = 0;
		var dummyLayers = [];
		var markerOverlays = [];
		var mapOverlays = {};
		
		for (const key in entityTypeNamesObject){
			
			var _layerGroupFromObject = entityTypeNamesObject[key];
			dummyLayers[count] = L.polyline([[0, 0], [0, 0]], { 
				id : count, 
				stroke: false, 
				interactive: false
			}); 
			markerOverlays[count] = _layerGroupFromObject;
			mapOverlays[key] = dummyLayers[count];
			count++;
		}

		//console.log(_mapID, loadedMapMarkersArray);
		loadedMapMarkersArray = {};
		loadedMapMarkersArray =  L.layerGroup([]).addTo(this.map);

		if ( this.controlLayer === undefined || this.controlLayer === null) this.controlLayer = new L.control.layers(null, mapOverlays).addTo(this.map);
		else {
			this.destroyControlLayer();
			this.controlLayer = new L.control.layers(null, mapOverlays).addTo(this.map);
		}

		function adjustMarkersForZoom(zoomLevel){
			loadedMapMarkersArray.eachLayer(function (_marker) { 
				if (_marker instanceof L.Marker){
					//console.log(_marker.options.name);
					if ( zoomLevel < 2.25 ) _marker.setIcon(mapMarkers.scaledIcon(_marker.options.type, null));
					else _marker.setIcon(mapMarkers.scaledIcon(_marker.options.type, _marker.options.name));
				}});
		}

		let preZoom;
		this.map.on('zoomstart', (e) =>  {
			//mapMarkers.currentZoom = e.target._zoom;
			preZoom = e.target._zoom
		});

		this.map.on('zoomend', (e) =>  {
			//mapMarkers.currentZoom = e.target._zoom;
			var postZoom = e.target._zoom;
			if ( (preZoom < 2.25 && postZoom >= 2.25) || (preZoom >= 2.25 && postZoom < 2.25) ) adjustMarkersForZoom(this.map.getZoom());
		});

		this.map.on('overlayadd', (evt) => {
			var i = mapOverlays[evt.name].options.id;
			//console.log(i);
			for (var j = 0; j < markerOverlays[i].length; j++) {
			  if (loadedMapMarkersArray.hasLayer(markerOverlays[i][j])) {
				markerOverlays[i][j].myCount += 1;
				}
			  else {  
				markerOverlays[i][j].myCount = 1;
				markerOverlays[i][j].addTo(loadedMapMarkersArray);
			  }
			}
			if ( loadedMapMarkersArray.getLayers().length > 0 ){
				this.map.eachLayer((layer) => {
					if (layer == this.currentMapImageOverlay) {
						layer.setOpacity(0.5);
					}
				});
			} ;

			adjustMarkersForZoom(this.map.getZoom());
		  });
		  
		this.map.on('overlayremove', (evt) => {
			var i = mapOverlays[evt.name].options.id;
			//console.log(i);
			for (var j = 0; j < markerOverlays[i].length; j++) {
			  if (loadedMapMarkersArray.hasLayer(markerOverlays[i][j])) {
				markerOverlays[i][j].myCount -= 1;
				if (markerOverlays[i][j].myCount == 0) {
					loadedMapMarkersArray.removeLayer(markerOverlays[i][j]);
				}
			  }
			}
			if ( loadedMapMarkersArray.getLayers().length < 1 ){
				this.map.eachLayer((layer) => {
					if (layer == this.currentMapImageOverlay) {
						layer.setOpacity(1.0);
					}
				});
			} ;

		  });
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