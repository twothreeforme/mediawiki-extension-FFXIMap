
class MapMarker {
    baseMapMarkersDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/maps/markers/';
    
    npcMarker = L.icon({
        	iconRetinaUrl: baseMapMarkersDir + 'npc-icon-2x.png',
        	iconUrl: baseMapMarkersDir + 'npc-icon.png',
        	iconSize: [9, 9],
        	iconAnchor: [6, 6],
        	className: 'blinking'
        });
    
    
    
    connectionMarker(coords){
        return L.marker(coords, {
            icon: L.divIcon({
                className: 'css-icon',
                html: '<div class="gps_ring"></div>',
                iconSize: [20,20],
                iconAnchor: [20,20]
              })
        });
    }
}

module.exports = MapMarker;