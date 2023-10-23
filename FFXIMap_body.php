<?php

# added debug logging
# use:
# MWDebug::log('text to log here');
MWdebug::init();

if ( !defined('MEDIAWIKI') )
{
	die( 'This file is a MediaWiki extension, it is not a valid entry point' );
}

class FFXIMap {
	
	static $FFXIMapBasePath;

		static function onParserInit( Parser $parser ) {
            $parser->setHook('FFXIMap', 'FFXIMap::renderFFXIMap' );
			return true;
		}
   
        public static function renderFFXIMap( $input, array $params, Parser $parser, PPFrame $frame ) {
			////////////////////
			//Debugging only
			//foreach ($params as $x => $val) { MWDebug::log('$params: '.$x.' = '. $val);	}
			//MWDebug::log('$params: '.$params['mapid']);
			////////////////////

			//$parser->getOutput()->updateCacheExpiry(0);
			$parser->getOutput()->addModules(['ext.leafletMain']);
			$parser->getOutput()->addModules(['ext.FFXIMap']);

			global $wgFFXIMapBasePath;

			// $tileSource : location of tiles (or the tile server)
			// each map should be it's own $mapIDNum as input
			// tile server should be in this format: "/maps/mapID_X/{z}/{x}/{y}.jpeg" 
			// (where X corresponds with the mapID listed in the tag from mediawiki)
			// $FFXIMapBasePath = $wgFFXIMapBasePath;
			// $tileSource = $FFXIMapBasePath . $mapIDNum . "/{z}/{x}/{y}.jpeg";
			// $tileSource = "./maps/tiles/{z}/{x}/{y}.jpeg";

			// Checking defaults for, and setting, $params prior to anything
			$zoom_levels = array(0,1,2,3,4,5,6);
			$maxZoom = 6;
			if (isset($params['maxzoom'])){
				$found_key = array_search($params['maxzoom'],$zoom_levels);
				if($found_key !== FALSE) {
					$maxZoom = $zoom_levels[$found_key];
					}
			}

			$minZoom = 0;
			if (isset($params['minzoom'])){
				$found_key = array_search($params['minzoom'],$zoom_levels);
				if($found_key !== FALSE) {
					$minZoom = $zoom_levels[$found_key];
					}
			}

			$zoom = 1;
			if (isset($params['zoom'])){
				$found_key = array_search($params['zoom'],$zoom_levels);
				if($found_key !== FALSE) {
					$zoom = $zoom_levels[$found_key];
					}
				if($zoom < $minZoom)
					$zoom = $minZoom;
				else if($zoom > $maxZoom)
					$zoom = $maxZoom;
			}

			$editingMode = "";
			if ( (isset($params['showdetails']) ) && ( $params['showdetails'] == "true" ) ){
				$editingMode = "<div id=\"polyEditing\"></div>";
			}

			$mapID = isset($params['mapid']) ? intval($params['mapid']) : 0;
			$divID = "mapid_" . $mapID;

			$height = isset($params['height']) ? intval($params['height']) : 512;
			$width = isset($params['width']) ? intval($params['width']) : 512;

			$style = "";
			$style = $style . "height: " . $height . "px; ";
			$style = $style . "width: " . $width . "px; ";

			$script = "";
 
			$tagAttributesJsonCode = "<span id=\"tagAttributes\" data-divID=\"" . $divID . "\" data-mapID=\"" . $mapID . "\" data-minZoom=\"" . $minZoom . "\" data-maxZoom=\"" . $maxZoom . "\" data-zoom=\"" . $zoom . "\"     ></span>";
			
			$html = "<div class=\"search-box\">";
			$html = $html . "<div class=\"row\">";
			$html = $html . "<input id=\"input-box\" type=\"text\" placeholder=\"Search Maps..\" autocomplete=\"off\"> ";
			$html = $html . "<button><i class = \"fa-solid fa-magnifying-glass\"></i></button>";
			$html = $html . "<div id=".$divID." style=\"". $style . "\">".  "</div></div></div>" . $editingMode . $script . $tagAttributesJsonCode ;


			return 	$html;
        }

		// public static function onParserAfterTidy( Parser &$parser, &$text ) {
		// 	return true;
		// }

		// public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		// 	return true;
		// }
}
