
class MapMarker {
    baseMapMarkersDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/maps/markers/';

    #divIcon_markerCircle() {
        return L.divIcon({
            className: 'ffximap-marker ffximap-marker-blinking',
            html: " ",
            iconSize: [8,8]
        });
    }

    #divIcon_markerCircle_2x() {
        return L.divIcon({
            className: 'ffximap-marker ffximap-marker-blinking',
            html: " ",
            iconSize: [13,13]
        });
    }

    circle(coords){
        return L.marker(coords, {
            icon: this.#divIcon_markerCircle()
        });
        // return L.circleMarker(coords, {
        //     className: 'ffximap-marker ffximap-marker-blinking',
        //     html: " "
        // });
    }
    
    connectionMarker(coords){
        return L.marker(coords, {
            icon: L.divIcon({
                className: 'css-icon',
                html: '<div class="gps_ring"></div>',
                iconAnchor: [20,20]
              })
        });
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