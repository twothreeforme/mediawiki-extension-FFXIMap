const Globals = require("../helpers/FFXIMap_Globals.js"); // Global helpers
const MapHistory = require("./map/ext.FFXIMap_MapHistory.js");
const MapMarkers = require("./mapdata/ext.mapMarkers.js");

class FFXIMap {
	divID;
	mapID;
	pageName;
	tileset;
	minzoom;
	maxzoom;
	zoom;
	zoomSnap;
	mapJSON; 			// helper class for searching current map data
	mapsController;		// controls all map data
	showdetails;
	showconnections;

	mapHistory;
	abortController;
	connectionLayerHover;
	attrib;

	mapMarkers;
	loadedMapMarkersArray;

	constructor(dataset, mapsController) {

		this.divID = typeof dataset.divid !== 'undefined' ? dataset.divid : "mapid_0";
		this.mapID = typeof dataset.mapid !== 'undefined' ? dataset.mapid : 0;

		this.pageName = ( (typeof dataset.pagename !== 'undefined') || dataset.pagename !== "0" ) ? dataset.pagename : 0;

		console.log( this.divID, this.mapID, this.pageName);
		
		// if ( this.pageName != 0 ) {
		// 	var temp = mapJSON.getMapID(this.pageName);
		// 	//console.log("typeof temp:", typeof temp);
		// 	if ( typeof temp !== 'undefined') this.mapID = temp;
		// }

		this.tileset = Globals.Directories.tiles; // this is for the World Map only

		this.minzoom = typeof dataset.minzoom !== 'undefined' ? dataset.minzoom : -1.75;
		this.maxzoom = typeof dataset.maxzoom !== 'undefined' ? dataset.maxzoom : 6;
		this.zoom = typeof dataset.zoom !== 'undefined' ? dataset.zoom : 0;
		this.zoomSnap = 0.25;

		this.attrib = '©Remapster |©Square Enix| ©FFXI-Atlas';

		this.mapsController = mapsController; 
		this.mapJSON = this.mapsController.getMapData(this.mapID);

		this.showdetails = (dataset.showdetails === "1");
		this.showconnections = (dataset.showconnections === "true");

		// Map viewing history supports the back button and returning to previously viewed maps
		this.mapHistory = new MapHistory();

		this.abortController = null;

		this.mapMarkers = new MapMarkers();
		
		this.loadedMapMarkersArray = {};

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

		//var tempAttribution = L.control.attribution({prefix: ''}).addTo(this.map);

		// Assigns new map imageoverlay/tiles
		// Sets up all associated layers/layerGroups
		this.newMapWithControls();
		//this.searchBar = new SearchBar();
		this.addWaterMark();
	}


	/******************************************************** */
	/******* Polygons   w/ connections layergroup   ********* */
	setupZoneConnections(){


		//if (_mapID == undefined) _mapID = this.mapID;
		const _connections = this.mapJSON.getConnections();
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
			// Changes based on input from the user with 'this.showconnections' tag attribute
			var _color = '#ff000000';
			if (this.showconnections == true) { _color = '#ff4f4f'; }
			var polygonOptions = {color: _color, weight: 0, stroke: false, pane: 'connectionsPane_hover'};

			var poly = L.polygon(_connections[key].hover, polygonOptions);
				poly.addTo(this.map);
				//poly.bringToFront();

				poly.on('mouseover', () => {
					var _connectionslayerGroup = L.layerGroup();
					for (const [_key, _value] of Object.entries(_connections[key].pulse)) {
						L.marker(_value, { icon: this.mapMarkers.connectionMarker(), pane: 'connectionsPane_pulse' }).addTo(_connectionslayerGroup);
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
						maplink.innerHTML = this.mapsController.getMapName(l);
						maplink.style.color = "#644119";
						maplink.onclick = () =>  {
							this.resetMapTo(l);
						}
						div.appendChild(document.createElement("br"));
						div.appendChild(maplink);

					});

					//poly.bindPopup(this.mapJSON.multipleConnectionsPopupHTML(_connections[key].links));
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

					// let preloadedImage = L.imageOverlay(Globals.Directories.zones + this.mapJSON.getMapFilename(key), this.mapJSON.getBounds(key))
					// 	preloadedImage._initImage();
						// preloadedImage.once('load', () => {
						// 	this.map.eachLayer((layer) => {
						// 		this.map.removeLayer(layer);
						// 	});
						// });
				}
		}

	}

	newMapWithControls(previousMapID = -1){

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
		this.newMap();

		// Setup Map Markers
		this.addMapMarkers(this.abortController);

		// Setup new control layer for the search bar
		this.addSearchBar();

		// Setup Back button - for loading previously viewed maps
		//console.log("newMapWithControls: " + this.mapHistory.getLength() +" " + this.mapHistory.getIndex(0));
		if (this.mapHistory.getLength() >= 1 && this.mapHistory.getIndex(0) != previousMapID) this.addBackButton();
		else if (this.mapHistory.getLength() == 0 && this.backButton ) {
			this.map.removeControl(this.backButton);
			this.backButton = null;
		}

		this.addCoordsOverlayButton();

		//Coordinate display
		//mainly for debugging
		if (this.showdetails == true) this.display_coordinates();

		// Setup any additional markers/layers for connecting the next zone
		this.setupZoneConnections();

		//this.mapID = _mapID;
	}

	newMap(){

		//if (_mapID == undefined) _mapID = this.mapID;

		if ( this.mapID == 0 ) {
			
			//********* World Map
			L.tileLayer(this.tileset, {
				bounds: L.latLngBounds([-256,0], [0,256]),
				attribution: this.attrib
			}).addTo(this.map);
			this.map.setMaxBounds( [[-256,0], [0,256]]);
			this.map.fitBounds( [[-256,0], [0,256]]);
		}
		else {
			var bounds = this.mapJSON.getBounds();
			//console.log(baseMapMarkersDir + "matte_black.png");
			// var blackBackground = L.imageOverlay(baseMapMarkersDir + "matte_black.png", bounds,
			// {
			// 	opacity: 1.0,
			// 	zIndex: 0
			// 	//attribution: this.attrib
			// });
			// blackBackground.addTo(this.map);

			this.currentMapImageOverlay = L.imageOverlay(Globals.Directories.zones + this.mapJSON.getMapFilename(), bounds,
				{
					opacity: 1.0,
					attribution: this.attrib,
				}).addTo(this.map);
			this.map.fitBounds(bounds);
			this.map.setMaxBounds(bounds);

			this.coordsOverlay = L.imageOverlay(Globals.Directories.zones + "grid_overlay.png", bounds,
			{
				opacity: 0.0,
				//attribution: this.attrib,
			}).addTo(this.map);

		}
		this.mapMarkers.currentZoom = this.map.getZoom();
		//this.map.setZoom(this.zoom);
		this.map.on('zoomstart', (e) =>  {
			this.mapMarkers.currentZoom = e.target._zoom;
		});

		this.map.on('zoomend', (e) =>  {
			this.mapMarkers.currentZoom = e.target._zoom;
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
		//if (this.coordsOverlayButton !== undefined) this.map.removeControl(this.coordsOverlayButton);

		this.loadedMapMarkersArray = null;

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
		this.mapID = _mapID;
		this.mapJSON = this.mapsController.getMapData(this.mapID);

		this.newMapWithControls();
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
				if ( this.mapJSON.hasBounds(_mapID) == true ) latlng += "<br>(IN-GAME coords [Lat,Lng])";
				else latlng += "<br>(BASIC coords [X,Y](0-256))";

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

			//const bounds = this.mapJSON.getBounds(_mapID);

			//All blocks are 40x40
			//bounds[0] = NE corner (Y,X)
			//bounds[1] = SW corner (Y,X)
			//var totalX = Math.abs(bounds[0][1]) + Math.abs(bounds[1][1]);
			//var totalY = Math.abs(bounds[0][0]) + Math.abs(bounds[1][0]);


			//console.log(totalX, totalY);

			// if ( this.mapJSON.hasBounds(this.mapID) == true ) this.position.updateHTML(y, x, currentZoom, this.mapID);
			// else this.position.updateHTML(x, y, currentZoom, this.mapID);
			this.position.updateHTML(x, y, currentZoom, this.mapID);
		});


		/*
		*	Prints mouse position when clicked on map
		*/
		var fieldNameElement = document.getElementById('polyEditing');
		if (fieldNameElement) { fieldNameElement.innerHTML = "" }

		//console.log(this.mapJSON.listMaps());

		this.map.on('click', (e) => {
			var x = Math.round(e.latlng.lat * 1000) / 1000,	// Math.round helps us get the number down to 3 decimal places
				y = Math.round(e.latlng.lng * 1000) / 1000;

        	if (fieldNameElement) {
				// if ( this.mapJSON.hasBounds(this.mapID) == true ) fieldNameElement.innerHTML += '[' + y + ", " + x + '], ';
				// else fieldNameElement.innerHTML += '[' + x + ", " + y + '], ';
				fieldNameElement.innerHTML += '[' + x + ", " + y + '], ';
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

	abortFetching(abortDescription) {
		//console.log("FFXIMap: abortFetching()", this.abortController);
		if (this.abortController !== null ) {
			this.abortController.abort(abortDescription);
		}
		this.abortController = null;
    }

	async addMapMarkers(_mapID){
		//console.log(abort);
		var mapMarkersFromJSObject = await this.mapJSON.getJSObjectEntities(_mapID);

		var url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php?action=cargoquery&tables=ffximapmarkers&fields=_pageName=Page,entitytype,mapx,mapy,mapid,image&where=mapid=${_mapID}&format=json`;
        var response = await fetch(url, { signal: this.abortController.signal });
        var data = await response.json();
        var mapMarkersFromFetch = await this.mapJSON.parseFetchedEntities(data);

		// If both markers object are 'undefined' then there are no markers, and return out of this function
		if ( typeof(mapMarkersFromJSObject) === 'undefined' && typeof(mapMarkersFromFetch) === 'undefined' ) return;

		// If there are JSObject markers and markers from the Cargo query,
		// then cycle through them and adjust the JSObject markers to match the
		// cargo query ones
		if ( typeof(mapMarkersFromFetch) != 'undefined') {
			if (typeof(mapMarkersFromJSObject) == 'undefined') mapMarkersFromJSObject = [];

			mapMarkersFromFetch.forEach((entityFetch) => {
				var  multipleSameNamedEntriesFromSamePage = false;
				var shouldAddToArray = true;
				if ( this.mapJSON.hasBounds(_mapID) == true) [entityFetch['mapx'], entityFetch['mapy']] = [ entityFetch['mapy'],  entityFetch['mapx']];

				//console.log(mapMarkersFromJSObject);
				// This portion gives wiki users the ability to adjust markers they see on a given map
				// Issue: only matches by page name... so no way of matching multiple entries
				for ( let i = 0; i < mapMarkersFromJSObject.length; i++){
					//console.log(mapMarkersFromJSObject[i]['page'], entityFetch['page']);
					if ( mapMarkersFromJSObject[i]['page'] == entityFetch['page']){
						//console.log("fire");
						mapMarkersFromJSObject[i]['mapx'] = entityFetch['mapx'];
						mapMarkersFromJSObject[i]['mapy'] = entityFetch['mapy'];
						mapMarkersFromJSObject[i]['imageurl'] = entityFetch['imageurl'];
						mapMarkersFromJSObject[i]['type'] = entityFetch['type'];
						mapMarkersFromJSObject[i]['displaylevels'] = entityFetch['displaylevels'] ;
						mapMarkersFromJSObject[i]['minL'] = entityFetch['minL'];  // REMOVE
						mapMarkersFromJSObject[i]['maxL'] = entityFetch['maxL'];  // REMOVE
						shouldAddToArray = false;
						break;
					}
				}

				if ( entityFetch !== 'undefined' && shouldAddToArray == true){
					mapMarkersFromJSObject.push(entityFetch);
				}
			});
		}

		var finalEntityArray = [];

		function sortedArray(array){
			return array.sort((a, b) => {
				const nameA = a.label.toUpperCase(); // ignore upper and lowercase
				const nameB = b.label.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) {
				  return -1;
				}
				if (nameA > nameB) {
				  return 1;
				}

				// names must be equal
				return 0;
			});
		}

		mapMarkersFromJSObject.forEach((e) => {

			var marker = this.mapMarkers.new(e['page'], e['mapx'], e['mapy'], e['imageurl'], e['type'], e['displaylevels']);

			e['type'].forEach(value => {
				var entityTitle;
				if ( value == 'Enemies') entityTitle = e['page'] + e['displaylevels'];
				else if ( value.includes('Home Point') ) entityTitle = 'Home Point';
				else if ( value.includes('Chocobo') ) entityTitle = 'Chocobo';
				else if ( value.includes('Moogle') ) entityTitle = 'Moogle';
				else entityTitle = e['page'];
				//console.log(entityTitle);

				var added = false;
				for(var i = 0; i < finalEntityArray.length; i++ ){

					if ( ( value == finalEntityArray[i].label ||
						( Globals.HELMExpandableLayers.findIndex((element) => element == value) >= 0 && finalEntityArray[i].label == 'HELM' ))
							 && finalEntityArray[i].hasOwnProperty('children')){

						for(var j = 0; j < finalEntityArray[i].children.length; j++ ){
							//console.log(finalEntityArray[i].children[j].label);
							if ( entityTitle == finalEntityArray[i].children[j].label ) {
								//console.log(finalEntityArray[i].children);
								finalEntityArray[i].children[j].layer.addLayer(marker);
								added = true;
								break;
							}
						}
						if ( added == false ){
							//console.log('adding' + e['page']);
							finalEntityArray[i].children.push({
								label: entityTitle,
								layer: L.layerGroup([ marker ])
							})

							added = true;
							break;
						}
					}
					else if ( (value == finalEntityArray[i].label && finalEntityArray[i].hasOwnProperty('layer'))) {
						//Now we are inside a layer that is not grouped
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( Globals.HELMExpandableLayers.findIndex((element) => element == value) >= 0 &&
							Globals.HELMExpandableLayers.findIndex((element) => element == finalEntityArray[i].label) >= 0){
						//both items evaluated are HELM layers, but dont match
						//save the array found
						var existingArray = finalEntityArray[i];

						//remove the indexed array
						finalEntityArray.splice(i, 1);

						//add a HELM group
						finalEntityArray = finalEntityArray.concat([ {
							label: 'HELM',
							selectAllCheckbox: true,
							children: [
									{label: entityTitle, layer: L.layerGroup([ marker ]) },
									existingArray
									]
						} ]);

						added = true;
						break;
					}
					else if ( value == "Home Point" && finalEntityArray[i].label.includes("Home Point") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Chocobo" && finalEntityArray[i].label.includes("Chocobo") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Dilapidated Gate" && finalEntityArray[i].label.includes("Dilapidated Gate") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Swirling Vortex" && finalEntityArray[i].label.includes("Swirling Vortex") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Spatial Displacement" && finalEntityArray[i].label.includes("Spatial Displacement") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Unstable Displacement" && finalEntityArray[i].label.includes("Unstable Displacement") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Auroral Updraft" && finalEntityArray[i].label.includes("Auroral Updraft") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Afflictor" && finalEntityArray[i].label.includes("Afflictor") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "Mute" && finalEntityArray[i].label.includes("Mute") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
					else if ( value == "HENM" && finalEntityArray[i].label.includes("HENM") ){
						finalEntityArray[i].layer.addLayer(marker);
						added = true;
						break;
					}
				}
				if ( added == false ){
					var newEntity = {};

					if (  Object.values(Globals.MapLayerGroup).indexOf(value) >= 0 ){ // Is it a category found in the MapLayerGroup object?
						newEntity = {
							label: value,
							selectAllCheckbox: true,
							children: [
									{label: entityTitle, layer: L.layerGroup([ marker ]) },
									]
						};
					}
					// Is it a category found in Globals.HELMExpandableLayers array? const Globals.HELMExpandableLayers = ['Mining Point', 'Excavation Point', 'Harvesting Point', 'Logging Point', 'Clamming Point']
					// else {
					// 	newEntity = {
					// 		label: value,
					// 		layer: L.layerGroup([ marker ])
					// 	};
					// }
					else {
						//console.log(value, Globals.HELMExpandableLayers.findIndex((element) => element == value));
						newEntity = {
							label: entityTitle,
							layer: L.layerGroup([ marker ])
						};
					}

					finalEntityArray = finalEntityArray.concat([ newEntity ]);
				}
			});

			this.mapMarkers.createToolTip(marker, this.abortController);
			// console.log(marker.options.name ,marker.getLatLng().lat, marker.getLatLng().lng);
		});

		//console.log(finalEntityArray);

		//Alphabetically sort the arrays
		for(var i = 0; i < finalEntityArray.length; i++ ){
			if ( finalEntityArray[i].hasOwnProperty('children') ){
				finalEntityArray[i].children = sortedArray(finalEntityArray[i].children);
			}
		}
		finalEntityArray = sortedArray(finalEntityArray);


		// Hurry up and get what we have at this point on the map in a control layer
		if (Object.keys(finalEntityArray).length > 0 ) {
			this._createEntityMapControlLayers(finalEntityArray, _mapID);
		}

	}

	adjustMarkersForZoom(zoomLevel){
		this.loadedMapMarkersArray.eachLayer( (_marker) => {
			if (_marker instanceof L.Marker){
				//console.log(_marker.options.type);
				if ( zoomLevel < 2.25 ) _marker.setIcon(this.mapMarkers.scaledIcon(_marker.options.type, null));
				else _marker.setIcon(this.mapMarkers.scaledIcon(_marker.options.type, _marker.options.displaylabel));
			}});
	}

	_createEntityMapControlLayers(finalEntityArray, _mapID){
		var count = 0, dummyLayers = [], markerOverlays = [], mapOverlays = {};

		for (var a = 0; a < finalEntityArray.length; a++ ){
			if ( finalEntityArray[a].hasOwnProperty('children') ) {

				for (var i = 0; i < finalEntityArray[a].children.length; i++ ){
					//console.log(key, entityTypeNamesObject[key]);
					dummyLayers[count] = L.polyline([[0, 0], [0, 0]], {
						id : count,
						stroke: false,
						interactive: false
					});
					//REVERT
					//mapOverlays[key] = dummyLayers[count];

					markerOverlays[count] = finalEntityArray[a].children[i].layer._layers;
					mapOverlays[count] = { label: finalEntityArray[a].children[i].label, layer: dummyLayers[count] };
					//console.log(finalEntityArray[a].children[i].label);
					count++;
				}
			}
			else {
				markerOverlays[count] = finalEntityArray[a].layer._layers;
				mapOverlays[count] = { label: finalEntityArray[a].label, layer: dummyLayers[count] };
				//console.log(finalEntityArray[a].children[i].label);
				count++;
			}
		}

		this.loadedMapMarkersArray = null;
		this.loadedMapMarkersArray =  L.layerGroup([]).addTo(this.map);

		if ( this.controlLayer !== undefined && this.controlLayer !== null) { this.destroyControlLayer(); }

		this.controlLayer = L.control.layers.tree(null, null,
			{
				namedToggle: false,
				//collapseAll: 'Collapse all',
				//expandAll: 'Expand all',
				collapsed: true,
				selectorBack: true,
				openedSymbol: '\u{229F}',
				closedSymbol: '\u{229E}'
			});

		this.controlLayer.addTo(this.map).collapseTree().expandSelected();
		this.controlLayer.setOverlayTree(finalEntityArray).collapseTree(true).expandSelected(false);

		let preZoom;
		this.map.on('zoomstart', (e) =>  {
			//this.mapMarkers.currentZoom = e.target._zoom;
			preZoom = e.target._zoom
		});

		this.map.on('zoomend', (e) =>  {
			//this.mapMarkers.currentZoom = e.target._zoom;
			var postZoom = e.target._zoom;
			if ( (preZoom < 2.25 && postZoom >= 2.25) || (preZoom >= 2.25 && postZoom < 2.25) ) this.adjustMarkersForZoom(this.map.getZoom());
		});

		this.map.on('overlayadd', (evt) => {
			//console.log(`evt.name: ${mapOverlays[evt.name].layer.options.id}` );
			//var i = mapOverlays[evt.name].layer.options.id;
			var i = evt.name;
			//console.log(Object.keys(markerOverlays[i]));

			for ( var key in markerOverlays[i]){
				//console.log(markerOverlays[i]);
				if (this.loadedMapMarkersArray.hasLayer(markerOverlays[i][key])) {
					markerOverlays[i][key].myCount += 1;
				}
				else {
					markerOverlays[i][key].myCount = 1;
					markerOverlays[i][key].addTo(this.loadedMapMarkersArray);
				}
			}

			// for (var j = 0; j < Object.keys(markerOverlays[i]).length; j++) {

			//   if (this.loadedMapMarkersArray.hasLayer(markerOverlays[i][j])) {
			// 	markerOverlays[i][j].myCount += 1;
			// 	}
			//   else {
			// 	markerOverlays[i][j].myCount = 1;
			// 	markerOverlays[i][j].addTo(this.loadedMapMarkersArray);
			//   }
			// }
			//console.log(`this.loadedMapMarkersArray: ${this.loadedMapMarkersArray.getLayers()}`);
			if ( this.loadedMapMarkersArray.getLayers().length > 0 ){
				this.map.eachLayer((layer) => {
					if (layer == this.currentMapImageOverlay) {
						layer.setOpacity(0.5);
					}
				});
			} ;

			this.adjustMarkersForZoom(this.map.getZoom());
		  });

		this.map.on('overlayremove', (evt) => {
			//var i = mapOverlays[evt.name].layer.options.id;
			var i = evt.name;
			//console.log(i);

			for ( var key in markerOverlays[i]){
				if (this.loadedMapMarkersArray.hasLayer(markerOverlays[i][key])) {
					markerOverlays[i][key].myCount -= 1;
					if (markerOverlays[i][key].myCount == 0) {
						this.loadedMapMarkersArray.removeLayer(markerOverlays[i][key]);
					}
				}
			}

			// for (var j = 0; j < Object.keys(markerOverlays[i]).length; j++) {
			//   if (this.loadedMapMarkersArray.hasLayer(markerOverlays[i][j])) {
			// 	markerOverlays[i][j].myCount -= 1;
			// 	if (markerOverlays[i][j].myCount == 0) {
			// 		this.loadedMapMarkersArray.removeLayer(markerOverlays[i][j]);
			// 	}
			//   }
			// }

			if ( this.loadedMapMarkersArray.getLayers().length < 1 ){
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
			sourceData: this.mapsController.searchBarMapsList(),

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
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-backbutton');
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

	addCoordsOverlayButton() {
		if( this.coordsOverlayButton ) return;

		let CoordsOverlayButton = L.Control.extend({
			options: {
			  position: 'topleft'
			},
			onAdd: (e) => {
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-coordsgridoverlay');
				//graphics managed in leaflet.css
				container.onclick = (e) => {
					//console.log(this.coordsOverlay.options.opacity);
					if (this.coordsOverlay.options.opacity == 1.0) this.coordsOverlay.setOpacity(0.0);
					else this.coordsOverlay.setOpacity(1.0);
				}
				return container;
			},
		  });

		  //this.coordsOverlay.setOpacity(1.0);
		  this.coordsOverlayButton = new CoordsOverlayButton();
		  this.map.addControl(this.coordsOverlayButton);
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

				//img.src = baseDir + '/leaflet/images/wiki_logo.png'; 
				img.src = Globals.Directories.wiki_logo;
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


}

module.exports = FFXIMap;