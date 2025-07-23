let baseDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/';

module.exports = {
    "base": baseDir,
    "maps": baseDir + 'maps/',
    "zones": baseDir + 'maps/zones/',
    "tiles": baseDir + 'maps/tiles/' + '{z}/{x}/{y}.jpeg',
    "markers": baseDir + 'maps/markers/',
    "wiki_logo": baseDir + '/leaflet/images/wiki_logo.png',
    "mapJSON": baseDir + '/modules/mapdata/json/'
};