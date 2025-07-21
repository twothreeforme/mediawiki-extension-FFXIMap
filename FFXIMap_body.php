<?php

# added debug logging
# use:
# MWDebug::log('text to log here');
# MWdebug::init();

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
		$parser->getOutput()->addModules(['ext.leafletControlLayerTree']);
		$parser->getOutput()->addModules(['ext.FFXIMap']);
		$parser->getOutput()->addModules(['ext.FFXIMap_MapFiles']);


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
		$minZoom = -2.75;

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
		
		$showconnections = isset($params['showconnections']) ? $params['showconnections'] : false;

		// Determine if mapid parameter was in the tag. If not, then look for the pagename. If no pagename, then 0 for default.
		// default mapID = 0
		$mapID = isset($params['mapid']) ? intval($params['mapid']) : 0;
		$pagename = ( isset($params['usepagename']) && $params['usepagename'] == "true") ? $parser->getTitle() : 0;

		$divID = "mapid_" . $mapID;
		
		$height; $width;
		if ( isset($params['width']) ) {
			if (str_contains($params['width'], '%')) { $width = $params['width']; }
			elseif ( !str_contains($params['width'], 'px') ) { $width = $params['width']."px"; }
			else $width = $params['width'];
		}
		else $width = '512px';
		
		if ( isset($params['height']) ) {
			if (str_contains($params['height'], '%')) { $height = $params['height']; }
			elseif ( !str_contains($params['height'], 'px') ) { $height = $params['height']."px"; }
			else $height = $params['height'];
		}
		elseif (str_contains($params['width'], 'px')) { $height = $width;}

		
		//$height = isset($params['height']) ? intval($params['height']) : '512px';
		//$width = isset($params['width']) ? intval($params['width']) : '512px';

		$style = "";
		if ( isset($height) ) {
			$style = $style . "height: " . $height . "; width: " . $width . "; margin: 10px auto 0;";
		}
		else {
			//print_r("no height");
			$style = $style . "width: " . $width . "; margin: 10px auto 0; aspect-ratio: 1 / 1;";
		}
		// $style = $style . "z-index: -1; ";

		$script = "";

		$tagAttributesJsonCode = "<span id=\"tagAttributes\" data-divID=\"" . $divID . "\" data-mapID=\"" . $mapID . "\" data-pagename=\"" . $pagename . "\" data-minZoom=\"" . $minZoom . "\"  data-maxZoom=\"" . $maxZoom . "\"  data-zoom=\"" . $zoom . "\" data-showdetails=\"" . $showdetails . "\" data-showconnections=\"" . $showconnections . "\"></span>";
		
		$html = "";
		$html = $html . "<div id=".$divID." style=\"". $style . "\">".  "</div>";
		//$html = $html . "</div>";
		$html = $html . $showdetailsDiv . $script . $tagAttributesJsonCode ;

		return 	$html;
	}


}
