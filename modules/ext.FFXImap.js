
function CoordToLatLng(x, y, tale) {
  tale = typeof tale !== 'undefined' ? tale : 10;
  var mapy = 0 - (0.015625 * (8192 - y));
  var mapx = (0.015625 * ((tale<6 ? 7168 : 3068) + x));
  return new L.latLng(mapy, mapx);
}
function LatLngToCoord(ll, tale) {
  tale = typeof tale !== 'undefined' ? tale : 10;
  var mapy = (ll.lat / 0.015625) + 8192;
  var mapx = (ll.lng / 0.015625) - (tale<6 ? 7168 : 3068);
  return new L.Point(mapy, mapx);
}

class FFXImap {

	
	constructor(mapID, ID, tileset, minzoom, maxzoom, tale, attrib) {
		minzoom = typeof minzoom !== 'undefined' ? minzoom : 1;
		maxzoom = typeof maxzoom !== 'undefined' ? maxzoom : 8;
		attrib = typeof attrib !== 'undefined' ? attrib : "(c) Desert Nomad Games 2021";
		this.mapID = typeof mapID !== 'undefined' ? mapID : 0;
		var self = this;
		this.panes = [];
		this.dlayer = "";
		//this.tale = typeof tale !== 'undefined' ? tale : 10;
		this.tileset = typeof tileset !== 'undefined' ? tileset : "/maps/mapId_0/{z}/{x}/{y}.png";
		L.tileLayer(this.tileset, {
  	      maxZoom: maxzoom,
  	      minZoom: minzoom,
  	      continuousWorld: false,
  	      noWrap: true,
 	      attribution: attrib
        }).addTo(mapID);
		this.layerscontrol = new L.Control.Layers(null, null, {position: 'bottomright'});
		this.createRegions();
		mapID.setMaxBounds(new L.LatLngBounds(this.C2LL(-3251, -8372),this.C2LL(5300,9000)));
		if (this.mapID.getPane('overlay') == undefined)
			this.setdPane('overlay',400,1);
		if (this.mapID.getPane('markers') == undefined)
			this.setmPane('markers',600,1);
		
		// Create, but do not add, Full Screen Control
		
		this.fullscreencontrol = new L.Control.FullScreen();
		// Create, but do not add, Region Control
		var EgyptMouseRegionControl = L.Control.extend({ options: { position: 'topright' },
				onAdd: function (mapID) {
					var container = L.DomUtil.create('input', 'region'+ID);
					container.setAttribute("style","width: 114px;text-align: center; border: 1px solid black;");
					container.value = "Hinterlands";
					container.id = "region"+ID;
					container.title = "Region Name at Mouse Position";
					container.onclick=function(){document.getElementById("region"+ID).blur()}; // REMOVE?
					return container;
				}});
		
		this.regioncontrol = new EgyptMouseRegionControl();

		// Create secondary Region Control at bottom left
		var EgyptMouseSecondRegionControl = L.Control.extend({ options: { position: 'bottomleft' },
				onAdd: function (mapID) {
					var container = L.DomUtil.create('input', 'region'+ID);
					container.setAttribute("style","width: 114px;text-align: center; border: 1px solid black;");
					container.value = "Hinterlands";
					container.id = "region"+ID;
					container.title = "Region Name at Mouse Position";
					container.onclick=function(){document.getElementById("region"+ID).blur()}; // REMOVE?
					return container;
				}});

		this.secondregioncontrol = new EgyptMouseSecondRegionControl();
		
		// Create, but do not add, Position Control
		var EgyptMousePositionControl = L.Control.extend({ options: { position: 'topright' },
			onAdd: function (mapID) {
				var container = L.DomUtil.create('input', 'mousepos'.ID);
				container.setAttribute("style","width: 114px;text-align: center; border: 1px solid black; cursor:pointer;");
				container.value = "0, 0";
				container.id = "mousepos"+ID;
				container.title = "Mouse Position (click to add marker)";
				container.onclick=function(){ 
					document.getElementById("mousepos"+ID).blur();
					var coords=prompt("Please enter coords","");
					var n = coords.match(/^(\-?\d+),\s*(\-?\d+)$/);
					if (IsValidCoord(Number(n[2]),Number(n[1])) == true) {
						var ll = CoordToLatLng(Number(n[1]),Number(n[2]));
						mapID.panTo(ll);
						icon = icons.replace("{label}","location");
						var pop = "<p><b>Location: "+n[1]+", "+n[2]+"</b><br /><small>Click Marker to Remove</small></p>";

						var mkr = L.marker(ll, {
							icon: L.icon({iconSize: [32,37],
							iconAnchor: [16,37],
							iconUrl: icon}
						)}).addTo(mapID);

						mkr.on('click', function(e){ 
						mapID.closePopup();
						mapID.removeLayer(mkr);
						});

						mkr.on('mouseover mousemove', function(e){
						var hover_bubble = new L.Rrose({ offset: new L.Point(0,-30), closeButton: false, autoPan: false })
							.setContent(pop)
							.setLatLng(e.latlng)
							.openOn(mapID);
						});
						mkr.on('mouseout', function(e){ mapID.closePopup() });
                    }
                  };

	    	return container;
		}});

		this.positioncontrol = new EgyptMousePositionControl();
		
		// Create secondary Position Control at bottom left
		var EgyptMouseSecondPositionControl = L.Control.extend({ options: { position: 'bottomleft' },
			onAdd: function (mapID) {
				var container = L.DomUtil.create('input', 'secondmousepos'.ID);
				container.setAttribute("style","width: 114px;text-align: center; border: 1px solid black; cursor:pointer;");
				container.value = "0, 0";
				container.id = "secondmousepos"+ID;
				container.title = "Mouse Position (click to add marker)";
				container.onclick=function(){ 
					document.getElementById("secondmousepos"+ID).blur();
					var coords=prompt("Please enter coords","");
					var n = coords.match(/^(\-?\d+),\s*(\-?\d+)$/);
					if (IsValidCoord(Number(n[2]),Number(n[1])) == true) {
						var ll = CoordToLatLng(Number(n[1]),Number(n[2]));
						mapID.panTo(ll);
						icon = icons.replace("{label}","location");
						var pop = "<p><b>Location: "+n[1]+", "+n[2]+"</b><br /><small>Click Marker to Remove</small></p>";

						var mkr = L.marker(ll, {
							icon: L.icon({iconSize: [32,37],
							iconAnchor: [16,37],
							iconUrl: icon}
						)}).addTo(mapID);

						mkr.on('click', function(e){ 
						mapID.closePopup();
						mapID.removeLayer(mkr);
						});

						mkr.on('mouseover mousemove', function(e){
						var hover_bubble = new L.Rrose({ offset: new L.Point(0,-30), closeButton: false, autoPan: false })
							.setContent(pop)
							.setLatLng(e.latlng)
							.openOn(mapID);
						});
						mkr.on('mouseout', function(e){ mapID.closePopup() });
                    }
                  };

	    	return container;
		}});

		this.secondpositioncontrol = new EgyptMouseSecondPositionControl();

		// Create and bind update function for Position and Region controls
		function onMouseMove(e) {
		    var p = self.LL2C(e.latlng);
		    var region = "Hinterlands";
		    if (IsValidCoord(p.x, p.y) == true) {
				if (self.showposition) {
					document.getElementById("mousepos"+ID).value = p.y.toFixed(0) + ', ' + p.x.toFixed(0);
					document.getElementById("secondmousepos"+ID).value = p.y.toFixed(0) + ', ' + p.x.toFixed(0);
                }
            } 

		}
		mapID.on('mousemove', onMouseMove);
         
	
	}
	
	addPane(name, zlevel, opacity) {
		opacity = typeof opacity !== 'undefined' ? opacity : 1;
		zlevel = typeof zlevel !== 'undefined' ? zlevel : 400;
		if(name == undefined)
			return true;
	
		if(this.mapID.getPane(name) == undefined)
		{
			this.mapID.createPane(name);
			this.mapID.getPane(name).style.opacity = opacity;
			this.mapID.getPane(name).style.zIndex = zlevel;
			this.panes.push({name: name, layer: L.layerGroup().addTo(this.mapID)});
			this.layerscontrol.addOverlay(this.panes.find(function( obj ) { return obj.name == name; }).layer, name);
		}
	}
	
	hidePane(name) {
		this.mapID.getPane(name).style.display = 'none';
		console.log("hide pane");
		console.log(this.mapID.getPane(name));
	}
	
	showPane(name) {
		this.mapID.getPane(name).style.display = 'block';
	}
	
	setdPane(name,zlevel, opacity){
		console.log("setdPane(" + name + "," + zlevel + "," + opacity + ")");
		opacity = typeof opacity !== 'undefined' ? opacity : 1;
		zlevel = typeof zlevel !== 'undefined' ? zlevel : 400;
		if (name != undefined) {
			if(this.mapID.getPane(name) == undefined)
				this.addPane(name,zlevel,opacity);
			this.dpane = name;
			this.dlayer = this.panes.find(function( obj ) { return obj.name == name; }).layer;
			this.mapID.getPane(name).style.opacity = opacity;
			this.mapID.getPane(name).style.zIndex = zlevel;
		}

	}
	
	setmPane(name,zlevel, opacity){
		opacity = typeof opacity !== 'undefined' ? opacity : 1;
		zlevel = typeof zlevel !== 'undefined' ? zlevel : 400;
		if (name != undefined) {
			if(this.mapID.getPane(name) == undefined)
				this.addPane(name,zlevel,opacity);
			
			this.mpane = name;
			this.mlayer = this.panes.find(function( obj ) { return obj.name == name; }).layer;
		}
	}

	createRegions() {
		if (this.dpane != undefined)
			var prevpane = this.dpane;
		else
			var prevpane = 'overlay';
		this.setdPane('regions',250, 0.75);
		var self = this;
		var json = "https://atitd.bpuk.org/api/t10";
		if(this.tale > 3){
			if (this.tale == '10')
				json = "https://atitd.bpuk.org/api/t10";
			if (this.tale == '9')
				json = "https://atitd.bpuk.org/api/t9";
			if (this.tale == '8')
				json = "https://atitd.bpuk.org/api/t8";
			if ((this.tale == '6') || (this.tale == '7')) 
				json = "/t7wiki/maps/t7.json";
			if (this.tale == '5')
				json = "/t7wiki/maps/t5.json";
			if (this.tale == '4')			
				json = "/t7wiki/maps/t4.json";
			var geojsonLayer = L.geoJSON.ajax(json, { pane: 'regions', style:function (feature) {
				if (feature.properties.perm == "true")
					var opac = 0.5;
				else
					var opac = 0.25;
				switch(feature.properties.Owner) {
					
					case 'Hyksos': return {color: 'red', stroke: 1, opacity: 0.25, fillOpacity: opac};
					case 'Meshwesh': return {color: 'blue', stroke: 1, opacity: 0.25, fillOpacity: opac};
					case 'Kush': return {color: 'green', stroke: 1, opacity: 0.25, fillOpacity: opac };
					case 'Nobody': return {color: 'white', stroke: 1, opacity: 0.25};
					case 'NA': return {color: feature.properties.color, stroke: 1, opacity:0.25};}

				}, onEachFeature: function (feature, layer) {
                    layer.on('mouseover', function (e) {
					if (self.regioncontrol._container.value != layer.feature.properties.name)
						self.regioncontrol._container.value = layer.feature.properties.name;
					if (self.secondregioncontrol._container.value != layer.feature.properties.name)
						self.secondregioncontrol._container.value = layer.feature.properties.name;
                    });
                }
			}
			);
			this.setdPane('regions',250, 0.75);
			this.dlayer.addLayer(geojsonLayer);
		}
			
		this.setdPane(prevpane);


}
	
	initIcons(iconsize,iconanchor,icons, mousepopup){
		this.iconsize = typeof iconsize !== 'undefined' ? iconsize : [32,32];
		this.iconanchor = typeof iconanchor !== 'undefined' ? iconanchor : [10,32];
		this.icons = typeof icons !== 'undefined' ? icons : "https://static.atitd.wiki/maps/markers/marker{label}.png";
		this.mousepopup = typeof mousepopup !== 'undefined' ? mousepopup : false;
	}
	
	setControls(position, region, fullscreen, zoom, layer, measure) {
		this.showposition = typeof position !== 'undefined' ? position : 1;
		this.showregion = typeof region !== 'undefined' ? region : 1;
		this.fullscreenc = typeof fullscreen !== 'undefined' ? fullscreen : 1;
		this.zoomc = typeof zoom !== 'undefined' ? zoom : 1;
		this.layerc = typeof layer !== 'undefined' ? layer : 1;
		position ? this.mapID.addControl(this.positioncontrol) : this.mapID.removeControl(this.positioncontrol);
		region ? this.mapID.addControl(this.regioncontrol) : this.mapID.removeControl(this.regioncontrol);
		region ? this.mapID.addControl(this.secondregioncontrol) : this.mapID.removeControl(this.secondregioncontrol);
		position ? this.mapID.addControl(this.secondpositioncontrol) : this.mapID.removeControl(this.secondpositioncontrol);
		fullscreen ? this.mapID.addControl(this.fullscreencontrol) : this.mapID.removeControl(this.fullscreencontrol);
		layer ? this.mapID.addControl(this.layerscontrol) : this.mapID.removeControl(this.layerscontrol);
		measure ? this.mapID.addControl(this.mapID.measureControl) : this.mapID.removeControl(this.mapID.measureControl);
		zoom ? this.mapID.addControl(this.mapID.zoomControl) : this.mapID.removeControl(this.mapID.zoomControl);
		
	}
	
	C2LL(x, y) {
		var mapy = 0 - (0.015625 * (8192 - y));
		var mapx = (0.015625 * ((this.tale<6 ? 7168 : 3068) + x));
		return new L.latLng(mapy, mapx);
	}
	LL2C(ll) {
		var mapy = (ll.lat / 0.015625) + 8192;
		var mapx = (ll.lng / 0.015625) - (this.tale<6 ? 7168 : 3068);
		return new L.Point(mapy, mapx);
	}
	centerMap(lat, lon) {
		this.mapID.panTo(this.C2LL(lat, lon));
	}
	sM(icon) {
		icon = typeof icon !== 'undefined' ? icon : "";
		this.setMarker(icon);
	}
	setMarker(icon){
		icon = typeof icon !== 'undefined' ? icon : "";
		this.icon = icon;
	}
	
	
	dm(lat,lon,pop) {
		var self = this;
        if (this.icon == "") {
            iconsize = [20,34];
        }
		var icon = this.icons.replace("{label}",this.icon);
        var ll = this.C2LL(lat,lon);
        if (pop == '') {
			var mkr = this.mlayer.addLayer(L.marker(ll, {
			icon: L.icon({iconSize: this.iconsize,
				iconAnchor: this.iconanchor,
				iconUrl: icon,
				pane: this.dpane}
				), pane: this.mpane}));        
        } else {
			var mkr = this.mlayer.addLayer(L.marker(ll, {
			icon: L.icon({iconSize: this.iconsize,
				iconAnchor: this.iconanchor,
				iconUrl: icon}
				), pane: this.mpane}).bindPopup(pop,{ offset:[0,-30] }));
		if (this.mousepopup) {
			mkr.on('click',function(e) {
				self.mapID.closePopup();
				return true;
		    });
		    mkr.on('mouseover mousemove', function(e){
				var hover_bubble = new L.Rrose({ offset: new L.Point(4,-30), closeButton: false, autoPan: false })
				.setContent(pop)
				.setLatLng(e.latlng)
				.openOn(self.mapID);
		      });
		      mkr.on('mouseout', function(e){ self.mapID.closePopup() });
          }
       }
	}
	
	drawOptions(stroke, color, weight,opacity,fill,fillColor,fillOpacity,dashArray,lineCap,lineJoin){
		this.dstroke = typeof stroke !== 'undefined' ? stroke : true;
		this.dcolor = typeof color !== 'undefined' ? color : '#03f';
		this.dweight = typeof weight !== 'undefined' ? weight : 5;
		this.dopacity = typeof opacity !== 'undefined' ? opacity : 0.5;
		this.dfill = typeof fill !== 'undefined' ? fill : true;
		this.dfillColor = typeof fillColor !== 'undefined' ? fillColor : '#03f';
		this.dfillOpacity = typeof fillOpacity !== 'undefined' ? fillOpacity : 0.2;
		this.ddashArray = typeof dashArray !== 'undefined' ? dashArray : '';
		this.dlineCap = typeof lineCap !== 'undefined' ? lineCap : '';
		this.dlineJoin = typeof lineJoin !== 'undefined' ? lineJoin : '';
	}
	
	line(coords, pop) {
		pop = typeof pop !== 'undefined' ? pop : '';
		for (var i=0; i < coords.length; ++i)
			coords[i] = (this.C2LL(coords[i][0], coords[i][1]));
		 if (pop == '')
			this.dlayer.addLayer(L.polyline(coords, {stroke: this.dstroke, color: this.dcolor,weight: this.dweight, opacity: this.dopacity, fill: this.dfill, fillColor: this.fillColor, dashArray: this.ddashArray, dlineCap: this.dlineCap, dlineJoin: this.dlineJoin, interactive: false, pane: this.dpane}));
		else
			this.dlayer.addLayer(L.polyline(coords, {stroke: this.dstroke, color: this.dcolor,weight: this.dweight, opacity: this.dopacity, fill: this.dfill, fillColor: this.fillColor, dashArray: this.ddashArray, dlineCap: this.dlineCap, dlineJoin: this.dlineJoin, pane: this.dpane}).bindPopup(pop,{ offset:[0,-30] })); 
	}
	poly(coords, pop, className) {
		pop = typeof pop !== 'undefined' ? pop : '';
		for (var i=0; i < coords.length; ++i)
			coords[i] = (this.C2LL(coords[i][0], coords[i][1]));

		 if (pop == '')
			this.dlayer.addLayer(L.polygon(coords, {stroke: this.dstroke, color: this.dcolor,weight: this.dweight, opacity: this.dopacity, fill: this.dfill, fillColor: this.fillColor, dashArray: this.ddashArray, dlineCap: this.dlineCap, dlineJoin: this.dlineJoin, pane: this.dpane, interactive: false, classname: className}));
		else
			this.dlayer.addLayer(L.polygon(coords, {stroke: this.dstroke, color: this.dcolor,weight: this.dweight, opacity: this.dopacity, fill: this.dfill, fillColor: this.fillColor, dashArray: this.ddashArray, dlineCap: this.dlineCap, dlineJoin: this.dlineJoin, pane: this.dpane, classname: className}).bindPopup(pop,{ offset:[0,-30] })); 
		
	}
	circ(coords, rad, pop) {
		pop = typeof pop !== 'undefined' ? pop : '';
		coords = (this.C2LL(coords[0], coords[1]));

	if (pop == '')
		this.dlayer.addLayer(L.circle(coords, {radius: (rad * 0.015625),stroke: this.dstroke, color: this.dcolor,weight: this.dweight, opacity: this.dopacity, fill: this.dfill, fillColor: this.fillColor, dashArray: this.ddashArray, dlineCap: this.dlineCap, dlineJoin: this.dlineJoin, pane: this.dpane, interactive:false}));
	else
		this.dlayer.addLayer(L.circle(coords, {radius: (rad * 0.015625),stroke: this.dstroke, color: this.dcolor,weight: this.dweight, opacity: this.dopacity, fill: this.dfill, fillColor: this.fillColor, dashArray: this.ddashArray, dlineCap: this.dlineCap, dlineJoin: this.dlineJoin, pane: this.dpane, interactive:true}).bindPopup(pop,{ offset:[0,-30] }));
	
	}

}

function IsValidCoord(y, x) {
 return ((x > -3071) && (x < 5120) && (y < 8191) && (y > -8191));
}


/* Full screen Control */

(function() {

L.Control.FullScreen = L.Control.extend({
	options: {
		position: 'topleft',
		title: 'Full Screen',
		forceSeparateButton: false
	},
	
	onAdd: function (map) {
		var className = 'leaflet-control-zoom-fullscreen', container;
		
		if (map.zoomControl && !this.options.forceSeparateButton) {
			container = map.zoomControl._container;
		} else {
			container = L.DomUtil.create('div', 'leaflet-bar');
		}
		
		this._createButton(this.options.title, className, container, this.toogleFullScreen, map);

		return container;
	},
	
	_createButton: function (title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', fn, context);
		
		L.DomEvent
			.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
			.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
			.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
		
		L.DomEvent
			.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
			.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
			.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

		return link;
	},
	
	toogleFullScreen: function () {
		this._exitFired = false;
		var container = this._container;
		if (this._isFullscreen) {
			if (fullScreenApi.supportsFullScreen) {
				fullScreenApi.cancelFullScreen(container);
			} else {
				L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
			}
			this.invalidateSize();
			this.fire('exitFullscreen');
			this._exitFired = true;
			this._isFullscreen = false;
		}
		else {
			if (fullScreenApi.supportsFullScreen) {
				fullScreenApi.requestFullScreen(container);
			} else {
				L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
			}
			this.invalidateSize();
			this.fire('enterFullscreen');
			this._isFullscreen = true;
		}
	},
	
	_handleEscKey: function () {
		if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
			this.fire('exitFullscreen');
			this._exitFired = true;
			this._isFullscreen = false;
		}
	}
});

L.Map.addInitHook(function () {
	if (this.options.fullscreenControl) {
		this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
		this.addControl(this.fullscreenControl);
	}
});

L.control.fullscreen = function (options) {
	return new L.Control.FullScreen(options);
};

/* 
Native FullScreen JavaScript API
-------------
Assumes Mozilla naming conventions instead of W3C for now

source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

*/

	var 
		fullScreenApi = { 
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.exitFullscreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {	
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
		}
	}

	// jQuery plugin
	if (typeof jQuery != 'undefined') {
		jQuery.fn.requestFullScreen = function() {
			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();

/* Measure control */
L.Control.Measure = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);

        this._enabled = false;
        this._container = null;
        this._button = null;
        this._buttonD = null;
        this._map = null;

        this._features = new L.FeatureGroup();
        this._markerList = [];

        this._startPoint = null;
        this._endPoint = null;
        this._line = null;
    },

    onAdd: function (map) {
        this._map = map;
        this._features.addTo(map);

        this._container = L.DomUtil.create('div', 'leaflet-control-measure leaflet-bar leaflet-control');
        this._button = L.DomUtil.create('a', 'leaflet-bar-part', this._container);
        this._button.href = '#';
        this._button.innerHTML = 'M';
        this._button.title = 'Measure';

        L.DomEvent
            .on(this._button, 'click', L.DomEvent.stopPropagation)
            .on(this._button, 'mousedown', L.DomEvent.stopPropagation)
            .on(this._button, 'dblclick', L.DomEvent.stopPropagation)
            .on(this._button, 'click', L.DomEvent.preventDefault)
            .on(this._button, 'click', this._onClick, this);

        return this._container;
    },

    _enable: function() {
        this._startPoint = null;
        this._endPoint = null;
        this._line = null;

        this._features.clearLayers();
        this._markerList = [];

        this._enabled = true;
        L.DomUtil.addClass(this._button, 'leaflet-control-measure-enabled');
        this._map.on('click', this._onMapClick, this);
    },
    _disable: function() {
        this._enabled = false;
        L.DomUtil.removeClass(this._button, 'leaflet-control-measure-enabled');
        this._map.off('click', this._onMapClick, this);
    },

    _onClick: function() {
        if (this._enabled) this._disable();
        else               this._enable();
    },

    _onMapClick: function(e) {
        var marker = new L.Marker(e.latlng, { draggable: true });
		var ll = LatLngToCoord(e.latlng);
		marker.bindPopup(ll.y.toFixed(0) + ', ' + ll.x.toFixed(0));
        marker.on('drag', this._onMarkerDrag, this);
        marker.on('dragend', this._onMarkerDragEnd, this);

        this._features.addLayer(marker);
        this._markerList.push(marker);

        if (this._startPoint === null) {
            this._startPoint = e.latlng;

        }
        else if (this._endPoint === null) {
            this._endPoint = e.latlng;
			var ll_end = LatLngToCoord(this._endPoint);
			var ll_start = LatLngToCoord(this._startPoint);
            this._line = new L.Polyline([ this._startPoint, this._endPoint ], { color: 'black', opacity: 0.5, stroke: true });
            this._features.addLayer(this._line);

            var distance = Math.sqrt(Math.pow(ll_start.x - ll_end.x, 2) + Math.pow(ll_start.y - ll_end.y, 2));

            var sz  = 'Distance: ' + distance.toFixed(0) + ' coords.';
            this._line.bindPopup(sz).openPopup();

            this._disable();
        }
    },

    _onMarkerDrag: function(e) {
        var marker = e.target;
        var i = this._markerList.indexOf(marker);

        var listLatng = this._line.getLatLngs();
        listLatng[i] = marker.getLatLng();
        this._line.setLatLngs(listLatng);

        if (i == 0)
            this._startPoint = marker.getLatLng();
        else if (i == (this._markerList.length - 1))
            this._endPoint = marker.getLatLng();
    },
    _onMarkerDragEnd: function(e) {
		var ll_end = LatLngToCoord(this._endPoint);
		var ll_start = LatLngToCoord(this._startPoint);
        var distance = Math.sqrt(Math.pow(ll_start.x - ll_end.x, 2) + Math.pow(ll_start.y - ll_end.y, 2));
        var sz  = 'Distance: ' + distance.toFixed(0) + ' coords.';
        this._line.bindPopup(sz).openPopup();
    }
});

L.control.measure = function(options) {
    return new L.Control.Measure(options);
};

L.Map.mergeOptions({
    measureControl: false
});

L.Map.addInitHook(function() {
    if (this.options.measureControl) {
        this.measureControl = new L.Control.Measure();
        this.addControl(this.measureControl);
    }
});

/* Rose popups */

/*
  Copyright (c) 2012 Eric S. Theise
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
  persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
  Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
    
L.Rrose = L.Popup.extend({

  _initLayout:function () {
    var prefix = 'leaflet-rrose',
      container = this._container = L.DomUtil.create('div', prefix + ' ' + this.options.className + ' leaflet-zoom-animated'),
      closeButton, wrapper;

    if (this.options.closeButton) {
      closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
      closeButton.href = '#close';
      closeButton.innerHTML = '&#215;';

      L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
    }

    // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
    var x_bound = 80, y_bound = 80;
    // Determine the alternate direction to pop up; north mimics Leaflet's default behavior, so we initialize to that.
    this.options.position = 'n';
    // Then see if the point is too far north...
    var y_diff = y_bound - this._map.latLngToContainerPoint(this._latlng).y;
    if (y_diff > 0) {
      this.options.position = 's'
    }
    // or too far east...
    var x_diff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - x_bound);
    if (x_diff > 0) {
      this.options.position += 'w'
    } else {
    // or too far west.
      x_diff = x_bound - this._map.latLngToContainerPoint(this._latlng).x;
      if (x_diff > 0) {
        this.options.position += 'e'
      }
    }
    // If it's too far in both dimensions, determine which predominates. e.g., turn 'nw' into either 'nnw' or 'wnw'.
    if (this.options.position.length === 2) {
      (y_diff > x_diff) ? 
        this.options.position = this.options.position.charAt(0) + this.options.position :
        this.options.position = this.options.position.charAt(1) + this.options.position;
    }

    // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
    if (/s/.test(this.options.position)) {
      if (this.options.position === 's') {
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      } 
      else {
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + this.options.position, container);
      }
      this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
    } 
    else {
      if (this.options.position === 'n') {
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      } 
      else {
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + this.options.position, container);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
      }
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
      this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
    }

  },

  _updatePosition:function () {
    var pos = this._map.latLngToLayerPoint(this._latlng),
      is3d = L.Browser.any3d,
      offset = this.options.offset;

    if (is3d) {
      L.DomUtil.setPosition(this._container, pos);
    }

    if (/s/.test(this.options.position)) {
      this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y);
    } else {
      this._containerBottom = -offset.y - (is3d ? 0 : pos.y);
    }

    if (/e/.test(this.options.position)) {
      this._containerLeft = offset.x + (is3d ? 0 : pos.x);
    } 
    else if (/w/.test(this.options.position)) {
      this._containerLeft = -Math.round(this._containerWidth) + offset.x + (is3d ? 0 : pos.x);
    } 
    else {
      this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (is3d ? 0 : pos.x);
    }

    this._container.style.bottom = this._containerBottom + 'px';
    this._container.style.left = this._containerLeft + 'px';
  }

});


// Leaflet AJAX

!function e(t,n,r){function a(i,s){if(!n[i]){if(!t[i]){var l="function"==typeof require&&require;if(!s&&l)return l(i,!0);if(o)return o(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var c=n[i]={exports:{}};t[i][0].call(c.exports,function(e){var n=t[i][1][e];return a(n?n:e)},c,c.exports,e,t,n,r)}return n[i].exports}for(var o="function"==typeof require&&require,i=0;i<r.length;i++)a(r[i]);return a}({1:[function(e,t,n){"use strict";function r(){}function a(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=j,this.queue=[],this.outcome=void 0,e!==r&&l(this,e)}function o(e,t,n){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof n&&(this.onRejected=n,this.callRejected=this.otherCallRejected)}function i(e,t,n){p(function(){var r;try{r=t(n)}catch(a){return v.reject(e,a)}r===e?v.reject(e,new TypeError("Cannot resolve promise with itself")):v.resolve(e,r)})}function s(e){var t=e&&e.then;return e&&"object"==typeof e&&"function"==typeof t?function(){t.apply(e,arguments)}:void 0}function l(e,t){function n(t){o||(o=!0,v.reject(e,t))}function r(t){o||(o=!0,v.resolve(e,t))}function a(){t(r,n)}var o=!1,i=u(a);"error"===i.status&&n(i.value)}function u(e,t){var n={};try{n.value=e(t),n.status="success"}catch(r){n.status="error",n.value=r}return n}function c(e){return e instanceof this?e:v.resolve(new this(r),e)}function f(e){var t=new this(r);return v.reject(t,e)}function d(e){function t(e,t){function r(e){i[t]=e,++s!==a||o||(o=!0,v.resolve(u,i))}n.resolve(e).then(r,function(e){o||(o=!0,v.reject(u,e))})}var n=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var a=e.length,o=!1;if(!a)return this.resolve([]);for(var i=new Array(a),s=0,l=-1,u=new this(r);++l<a;)t(e[l],l);return u}function h(e){function t(e){n.resolve(e).then(function(e){o||(o=!0,v.resolve(s,e))},function(e){o||(o=!0,v.reject(s,e))})}var n=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var a=e.length,o=!1;if(!a)return this.resolve([]);for(var i=-1,s=new this(r);++i<a;)t(e[i]);return s}var p=e("immediate"),v={},y=["REJECTED"],m=["FULFILLED"],j=["PENDING"];t.exports=n=a,a.prototype["catch"]=function(e){return this.then(null,e)},a.prototype.then=function(e,t){if("function"!=typeof e&&this.state===m||"function"!=typeof t&&this.state===y)return this;var n=new this.constructor(r);if(this.state!==j){var a=this.state===m?e:t;i(n,a,this.outcome)}else this.queue.push(new o(n,e,t));return n},o.prototype.callFulfilled=function(e){v.resolve(this.promise,e)},o.prototype.otherCallFulfilled=function(e){i(this.promise,this.onFulfilled,e)},o.prototype.callRejected=function(e){v.reject(this.promise,e)},o.prototype.otherCallRejected=function(e){i(this.promise,this.onRejected,e)},v.resolve=function(e,t){var n=u(s,t);if("error"===n.status)return v.reject(e,n.value);var r=n.value;if(r)l(e,r);else{e.state=m,e.outcome=t;for(var a=-1,o=e.queue.length;++a<o;)e.queue[a].callFulfilled(t)}return e},v.reject=function(e,t){e.state=y,e.outcome=t;for(var n=-1,r=e.queue.length;++n<r;)e.queue[n].callRejected(t);return e},n.resolve=c,n.reject=f,n.all=d,n.race=h},{immediate:2}],2:[function(e,t,n){(function(e){"use strict";function n(){c=!0;for(var e,t,n=f.length;n;){for(t=f,f=[],e=-1;++e<n;)t[e]();n=f.length}c=!1}function r(e){1!==f.push(e)||c||a()}var a,o=e.MutationObserver||e.WebKitMutationObserver;if(o){var i=0,s=new o(n),l=e.document.createTextNode("");s.observe(l,{characterData:!0}),a=function(){l.data=i=++i%2}}else if(e.setImmediate||"undefined"==typeof e.MessageChannel)a="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){n(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(n,0)};else{var u=new e.MessageChannel;u.port1.onmessage=n,a=function(){u.port2.postMessage(0)}}var c,f=[];t.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],3:[function(e,t,n){(function(n){"use strict";var r=e("./jsonp"),a=e("lie");t.exports=function(e,t){if(t=t||{},t.jsonp)return r(e,t);var o,i,s=new a(function(r,a){i=a,void 0===n.XMLHttpRequest&&a("XMLHttpRequest is not supported");var s;o=new n.XMLHttpRequest,o.open("GET",e),t.headers&&Object.keys(t.headers).forEach(function(e){o.setRequestHeader(e,t.headers[e])}),o.onreadystatechange=function(){4===o.readyState&&(o.status<400&&t.local||200===o.status?(n.JSON?s=JSON.parse(o.responseText):a(new Error("JSON is not supported")),r(s)):a(o.status?o.statusText:"Attempted cross origin request without CORS enabled"))},o.send()});return s["catch"](function(e){return o.abort(),e}),s.abort=i,s}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./jsonp":5,lie:1}],4:[function(e,t,n){(function(t){"use strict";var n=t.L||e("leaflet"),r=e("lie"),a=e("./ajax");n.GeoJSON.AJAX=n.GeoJSON.extend({defaultAJAXparams:{dataType:"json",callbackParam:"callback",local:!1,middleware:function(e){return e}},initialize:function(e,t){this.urls=[],e&&("string"==typeof e?this.urls.push(e):"function"==typeof e.pop?this.urls=this.urls.concat(e):(t=e,e=void 0));var a=n.Util.extend({},this.defaultAJAXparams);for(var o in t)this.defaultAJAXparams.hasOwnProperty(o)&&(a[o]=t[o]);this.ajaxParams=a,this._layers={},n.Util.setOptions(this,t),this.on("data:loaded",function(){this.filter&&this.refilter(this.filter)},this);var i=this;this.urls.length>0&&new r(function(e){e()}).then(function(){i.addUrl()})},clearLayers:function(){return this.urls=[],n.GeoJSON.prototype.clearLayers.call(this),this},addUrl:function(e){var t=this;e&&("string"==typeof e?t.urls.push(e):"function"==typeof e.pop&&(t.urls=t.urls.concat(e)));var r=t.urls.length,o=0;t.fire("data:loading"),t.urls.forEach(function(e){"json"===t.ajaxParams.dataType.toLowerCase()?a(e,t.ajaxParams).then(function(e){var n=t.ajaxParams.middleware(e);t.addData(n),t.fire("data:progress",n)},function(e){t.fire("data:progress",{error:e})}):"jsonp"===t.ajaxParams.dataType.toLowerCase()&&n.Util.jsonp(e,t.ajaxParams).then(function(e){var n=t.ajaxParams.middleware(e);t.addData(n),t.fire("data:progress",n)},function(e){t.fire("data:progress",{error:e})})}),t.on("data:progress",function(){++o===r&&t.fire("data:loaded")})},refresh:function(e){e=e||this.urls,this.clearLayers(),this.addUrl(e)},refilter:function(e){"function"!=typeof e?(this.filter=!1,this.eachLayer(function(e){e.setStyle({stroke:!0,clickable:!0})})):(this.filter=e,this.eachLayer(function(t){e(t.feature)?t.setStyle({stroke:!0,clickable:!0}):t.setStyle({stroke:!1,clickable:!1})}))}}),n.Util.Promise=r,n.Util.ajax=a,n.Util.jsonp=e("./jsonp"),n.geoJson.ajax=function(e,t){return new n.GeoJSON.AJAX(e,t)}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./ajax":3,"./jsonp":5,leaflet:void 0,lie:1}],5:[function(e,t,n){(function(n){"use strict";var r=n.L||e("leaflet"),a=e("lie");t.exports=function(e,t){t=t||{};var o,i,s,l,u=document.getElementsByTagName("head")[0],c=r.DomUtil.create("script","",u),f=new a(function(r,a){l=a;var f=t.cbParam||"callback";t.callbackName?o=t.callbackName:(s="_"+(""+Math.random()).slice(2),o="_leafletJSONPcallbacks."+s),c.type="text/javascript",s&&(n._leafletJSONPcallbacks||(n._leafletJSONPcallbacks={length:0}),n._leafletJSONPcallbacks.length++,n._leafletJSONPcallbacks[s]=function(e){u.removeChild(c),delete n._leafletJSONPcallbacks[s],n._leafletJSONPcallbacks.length--,n._leafletJSONPcallbacks.length||delete n._leafletJSONPcallbacks,r(e)}),i=-1===e.indexOf("?")?e+"?"+f+"="+o:e+"&"+f+"="+o,c.src=i}).then(null,function(e){return u.removeChild(c),delete r.Util.ajax.cb[s],e});return f.abort=l,f}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{leaflet:void 0,lie:1}]},{},[4]);


// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}