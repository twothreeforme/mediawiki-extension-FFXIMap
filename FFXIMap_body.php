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

		$parser->getOutput()->updateCacheExpiry(0);
		$parser->getOutput()->addModules(['ext.leafletMain']);
		$parser->getOutput()->addModules(['ext.leafletSearch']);
		$parser->getOutput()->addModules(['ext.FFXIMap']);

		// $tileSource : location of tiles (or the tile server)
		// each map should be it's own $mapIDNum as input
		// tile server should be in this format: "/maps/mapID_X/{z}/{x}/{y}.jpeg" 
		// (where X corresponds with the mapID listed in the tag from mediawiki)
		// $FFXIMapBasePath = $wgFFXIMapBasePath;
		// $tileSource = $FFXIMapBasePath . $mapIDNum . "/{z}/{x}/{y}.jpeg";
		// $tileSource = "./maps/tiles/{z}/{x}/{y}.jpeg";

		// Checking defaults for, and setting, $params prior to anything
		//$zoom_levels = array(0,1,2,3,4,5,6);
		$maxZoom = 6;
		$minZoom = -2;

		$zoom = 1;
		if (isset($params['zoom']) && $params['zoom'] >= 0 && $params['zoom'] <= 6){
			$zoom = $params['zoom'];
			if($zoom < $minZoom) $zoom = $minZoom;
			else if($zoom > $maxZoom) $zoom = $maxZoom;
		}

		$showdetails = "";
		$showdetailsDiv = "";
		if ( (isset($params['showdetails']) ) && ( $params['showdetails'] == "true" ) ){
			$showdetailsDiv = "<div id=\"polyEditing\"></div>";
			$showdetails = true;
		}
		
		$showconnections = ($params['showconnections'] === "true") ? true : false;

		$mapID = isset($params['mapid']) ? intval($params['mapid']) : 0;
		$divID = "mapid_" . $mapID;

		$height = isset($params['height']) ? intval($params['height']) : 512;
		$width = isset($params['width']) ? intval($params['width']) : 512;

		$style = "";
		$style = $style . "height: " . $height . "px; width: " . $width . "px; margin: 10px auto 0;";
		// $style = $style . "z-index: -1; ";

		$script = "";

		$tagAttributesJsonCode = "<span id=\"tagAttributes\" data-divID=\"" . $divID . "\" data-mapID=\"" . $mapID . "\" data-minZoom=\"" . $minZoom . "\"  data-maxZoom=\"" . $maxZoom . "\"  data-zoom=\"" . $zoom . "\" data-showdetails=\"" . $showdetails . "\" data-showconnections=\"" . $showconnections . "\"></span>";
		
		$html = "";
		$html = $html . "<div id=".$divID." style=\"". $style . "\">".  "</div>";
		//$html = $html . "</div>";
		$html = $html . $showdetailsDiv . $script . $tagAttributesJsonCode ;
		
		return 	$html;
	}

	// public static function onParserAfterTidy( Parser &$parser, &$text ) {
	// 	return true;
	// }

	// public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
	// 	return true;
	// }

}
