const MapLayerGroup = Object.freeze({
	NPC: 'NPC',
	ENEMIES: 'Enemies',
	QUESTS: 'Quests',
	HELM: 'HELM',
	HENM: 'HENM'
	//HOMEPOINT: 'Home Point'
  })

const HELMExpandableLayers = ['Mining Point', 'Excavation Point', 'Harvesting Point', 'Logging Point', 'Clamming Point'];


let baseDir = mw.config.get('wgExtensionAssetsPath') + '/FFXIMap/';
const Directories = {
    "base": baseDir,
    "maps": baseDir + 'maps/',
    "zones": baseDir + 'maps/zones/',
    "tiles": baseDir + 'maps/tiles/' + '{z}/{x}/{y}.jpeg',
    "markers": baseDir + 'maps/markers/',
    "wiki_logo": baseDir + '/leaflet/images/wiki_logo.png',
    "mapJSON": baseDir + '/modules/mapdata/json/'
};

module.exports = {
    MapLayerGroup,
    HELMExpandableLayers,
    Directories
}