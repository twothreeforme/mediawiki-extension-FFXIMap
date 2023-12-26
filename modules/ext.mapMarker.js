

class MapMarker {
    currentZoom;
    icon = require("./iconsSVGData.js");

    //baseMapMarkersDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/maps/markers/';

    #divIcon_marker(iconData, label) {
        var labelHTML = ``;
        if ( typeof(label) == 'string' && label != '' ) labelHTML = `</svg><span class=\"${CSS.markerLabel}\">${label}</span>`;

        return L.divIcon({
            className: 'dummy-class',
            //html: labelHTML,
            html: `<svg class="${iconData[0]} ${CSS.markerBLINKING}" width="15" height="15" viewBox="0 -5 25 25" >` + iconData[1] + labelHTML,
            iconSize: [0,0]
        });

        // return L.divIcon({
        //     className: iconTypeClass,
        //     //html: labelHTML,
        //     iconSize: [8,8],
        //     iconAnchor: [0,0],
        // });
        
    }

    #divIcon_marker_2x(iconData, label) {
        var labelHTML = ``;
        if ( typeof(label) == 'string' && label != '' ) labelHTML = `</svg><span class=\"${CSS.markerLabel}\">${label}</span>`;

        return L.divIcon({
            className: 'dummy-class',
            //html: labelHTML,
            html: `<svg class="${iconData[0]}-2X ${CSS.markerBLINKING}" width="15" height="15" viewBox="0 -5 25 25" >` + iconData[1] + labelHTML,
            iconSize: [0,0]
        });

        // return L.divIcon({
        //     className: iconTypeClass,
        //     //html: labelHTML,
        //     iconSize: [13,13],
        //     iconAnchor: [0,0],
        // });
    }

    #createDivIcon(type, label){
        return this.#divIcon_marker(this.#getIconData(type), label);
    }

    #getIconData(type){
        var iconTypeClass = CSS.markerNPC;
        var iconSVG = ``;   

        switch (type[0]) {
            case 'NPC':
                iconTypeClass = CSS.markerNPC;
                iconSVG = this.icon.circle;
                break;
            case 'Home Point':
                iconTypeClass = CSS.markerHOMEPOINT;
                iconSVG = this.icon.homepoint;
                break;
            case 'Treasure Chest':
                iconTypeClass = CSS.markerTREASURECHEST;
                iconSVG = this.icon.treasure;
                break;
            case 'Treasure Coffer':
                iconTypeClass = CSS.markerTREASURECOFFER;
                iconSVG = this.icon.treasure;
                break;
            case 'Standard Merchant':
                iconTypeClass = CSS.markerSTANDARDMERCHANT;
                iconSVG = this.icon.circle;
                break;
            case '???':
                iconTypeClass = CSS.markerQUESTIONMARK;
                iconSVG = this.icon.circle;
                break;
            case 'Logging Point':
                iconTypeClass = CSS.markerLOGGINGPOINT;
                iconSVG = this.icon.logging;
                break;
            case 'Mining Point':
                iconTypeClass = CSS.markerMININGPOINT;
                iconSVG = this.icon.mining;
                break;
            case 'Excavation Point':
                iconTypeClass = CSS.markerMININGPOINT;
                iconSVG = this.icon.mining;
                break;
            case 'Harvesting Point':
                iconTypeClass = CSS.markerHARVESTINGPOINT;
                iconSVG = this.icon.harvesting;
                break;
            case 'Clamming Point':
                iconTypeClass = CSS.markerCLAMMINGPOINT;
                iconSVG = this.icon.clamming;
                break;
            case 'Chocobo':
                iconTypeClass = CSS.markerCHOCOBO;
                iconSVG = this.icon.chocobo;
                break;
            case 'Moogle':
                iconTypeClass = CSS.markerMOOGLE;
                iconSVG = this.icon.moogle;
                break;
            case 'Streetlamp':
                iconTypeClass = CSS.markerSTREETLAMP;
                iconSVG = this.icon.circle;
                break;
          }
          return [iconTypeClass, iconSVG];
    }
    
    connectionMarker(){
        return L.divIcon({
            className: ``,
            html: `<div class="${CSS.connection}"></div>`,
            //html: '<div style="height:30px;width:30px;"></div>',
            iconAnchor: [20,20]
            })
    }

    scaledIcon(type, label){
        //console.log(this.currentZoom);
        if ( this.currentZoom < 2.5 ) return this.#divIcon_marker(this.#getIconData(type), label);
        else return this.#divIcon_marker_2x(this.#getIconData(type),label);
    }

    generateIconHTML( iconArray, label) { 
        var htmlOutput = iconArray[1];
        if ( typeof(label) == 'string' && label != '' ) htmlOutput += `<span class=\"${CSS.markerLabel}\">${label}</span>`;
        return htmlOutput;
    }

    new(page, mapx, mapy, imageurl, displayposition, type){
        //move to MapMarker class once this is functioning correctly
        // var tooltiptemplate = `<div>`; 
        // if (imageurl !== undefined && imageurl !== null && imageurl != "") {

        //     tooltiptemplate += `<img src="${imageurl}" alt=\"\" class="img-alt">`;
        // }
        // tooltiptemplate += `<b><i><center>${page}</i></b><br> ${displayposition}</center></div>`;
        //////
        
        //var label = this.generateIconHTML(page);

        var tempLabel = ( this.currentZoom >= 2.25) ? tempLabel = page : tempLabel = '';
        
        return L.marker([mapx, mapy], {
                icon: this.scaledIcon(type, tempLabel),
                name: page,
                type: type
            })
            // .bindTooltip(L.Util.template(tooltiptemplate, null), {
            //     opacity: 1.0,
            //     className: `${CSS.markerTooltip}`,
            //     direction: 'left',
            //     offset: L.point(0, 8)
            // })
            .on('click', (e) => {
                    window.open(mw.config.get('wgServer') + mw.config.get('wgScript') + `?title=${page}`);
                    //console.log(mw.config.get('wgServer') + mw.config.get('wgScript') + `?title=${page}`);
            });

    }

    async createToolTip(marker, abortController){

        function tipHTML(page, imageurl, displayposition){
            var url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/index.php?title=Special:Redirect/file/${imageurl}&width=175`;
            var tooltiptemplate = `<div>`; 
            if (imageurl !== undefined && imageurl !== null && imageurl != "") { tooltiptemplate += `<img src="${url}" alt=\"\" class="img-alt">`; }
            tooltiptemplate += `<b><i><center>${page}</i></b><br> ${displayposition}</center></div>`;
            return tooltiptemplate;
        }

        var url = mw.config.get('wgServer') + mw.config.get('wgScriptPath') + `/api.php`; 

        var params = {
            action: "query",
            prop: "images",
            titles: marker.options.name,
            format: "json"
        };
        
        url = url + "?origin=*";
        Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
        
        await fetch(url, {
            signal: abortController.signal
        })
            .then(function(response){return response.json();})
            .then(function(response) {
                var pages = response.query.pages;
                for (var page in pages) {
                    console.log(pages[page]);
                    if (typeof(pages[page].images) == 'undefined' || pages[page].images.length <= 0) continue;
                    
                    for (var img of pages[page].images) {
                        var tempStr = img.title.replace("File:", "");
                        var tempStrSplit = tempStr.split('.');
                        //console.log("img:", tempStr[0]);
                        //console.log("Searching: ", pages[page].title, tempStrSplit);   
                        if ( tempStrSplit[0] == pages[page].title ) {
                            //console.log("FOUND: ", pages[page].title, tempStr, img.title);
                            //return tempStr;
                        }
                        
                        //console.log(page, img.title);
                    }

                    var tip = tipHTML(marker.options.name, img.title, ` ( ${marker.getLatLng().lat},${marker.getLatLng().lng} )`);
                    marker.bindTooltip(L.Util.template(tip, null), {
                        opacity: 1.0,
                        className: `${CSS.markerTooltip}`,
                        direction: 'left',
                        offset: L.point(0, 8)
                    });

                }
            })
            .catch(function(error){
                console.log("FFXIMap:createToolTip() ", error);
            });

        // var params = {
        // action: "query",
        // prop: "images",
        // titles: marker.options.name,
        // format: "json"
        // },

        // api = new mw.Api();
    
        // api.get( params ).done( function ( data ) {
        //     var pages = data.query.pages,
        //         page;
        //     for ( page in pages ) {
        //         console.log(pages[page].title);
        //         if ( typeof(pages[ page ].images) != 'undefined' ) {
        //             pages[ page ].images.forEach( function ( img ) {
        //                 var tempStr = img.title.replace("File:", "");
        //                 var tempStrSplit = tempStr.split('.');
        //                 if ( tempStrSplit == pages[page].title ) {
        //                     console.log(pages[page].title, tempStr);
        //                     //return tempStr;
        //                 } 
                        
        //             } );
        //         }
        //     }
        // } );
    }


}


class CSS {

    static connection = 'ffximap-connection-marker';
    static connectionMultiplePopup = 'ffximap-connection-multiple-popup';
    
    static markerBLINKING = 'ffximap-marker-blinking';

    static markerNPC = 'ffximap-marker-npc';
    static markerHOMEPOINT = 'ffximap-marker-homepoint';
    static markerTREASURECHEST = "ffximap-marker-treasure-chest";
    static markerTREASURECOFFER = "ffximap-marker-treasure-coffer";
    static markerSTANDARDMERCHANT = "ffximap-marker-standardmerchant";
    static markerQUESTIONMARK = "ffximap-marker-questionmark";
    static markerLOGGINGPOINT = "ffximap-marker-loggingpoint";
    static markerMININGPOINT = "ffximap-marker-miningpoint";
    static markerHARVESTINGPOINT = "ffximap-marker-harvestingpoint";
    static markerCLAMMINGPOINT = "ffximap-marker-clammingpoint";
    static markerCHOCOBO = "ffximap-marker-chocobo";
    static markerMOOGLE = "ffximap-marker-moogle";
    static markerSTREETLAMP = "ffximap-marker-streetlamp";


    static markerLabel = 'ffximap-marker-label';
    static markerTooltip = 'ffximap-marker-toolip';
}



module.exports = { MapMarker };
