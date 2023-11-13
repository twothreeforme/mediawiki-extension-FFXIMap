

class MapMarker {
    //baseMapMarkersDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/maps/markers/';

    #divIcon_markerCircle() {
        return L.divIcon({
            className: CSS.npc,
            html: " ",
            iconSize: [8,8]
        });
    }

    #divIcon_markerCircle_2x() {
        return L.divIcon({
            className: CSS.npc,
            html: " ",
            iconSize: [13,13]
        });
    }

    icon_NPC(){
        return this.#divIcon_markerCircle();
        
        // return L.circleMarker(coords, {
        //     className: 'ffximap-marker ffximap-marker-blinking',
        //     html: " "
        // });
    }
    
    connectionMarker(){
        return L.divIcon({
            className: ``,
            html: `<div class="${CSS.connection}"></div>`,
            //html: '<div style="height:30px;width:30px;"></div>',
            iconAnchor: [20,20]
            })
    }

    scaledIcon(currentZoom, _marker){
        if (currentZoom >= 0 && currentZoom < 3) return this.#divIcon_markerCircle();
        else if (currentZoom >= 3) return this.#divIcon_markerCircle_2x();
    }

    //get custom CSS variable.... https://stackoverflow.com/questions/70013627/from-class-scope-get-css-custom-property-variable-value-using-javascript
    // #getCssVar(selector, style) {
    //     var element = document.getElementsByClassName(selector);
    //     if(!element[0]) { 
    //         console.log(`element failed:${element.length}, selector: ${selector}`); 
    //         return false 
    //     }
    //     var returnVar = getComputedStyle(element[0]).getPropertyValue(style);
    //     if(!returnVar) { 
    //         console.log('variable not defined'); 
    //         return false 
    //     }
    //     else return returnVar;
    //     //console.log(`${selector} : ${getComputedStyle(element).getPropertyValue(style)}`) 
    //   }


}

module.exports = MapMarker;


const MapMarkerIconType = {
    Connection: 0,
    NPC: 1,
    Enemy: 2,
    ExpCamp: 3,
    MiningNode: 4
}

class CSS {

    static connection = 'ffximap-connection-marker';
    static npc = 'ffximap-marker ffximap-marker-blinking';
    static connectionMultiple_Popup = 'ffximap-connection-multiple-popup';

}