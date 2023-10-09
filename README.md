This is a MediaWiki extension that adds a `{{#tag:FFXIMap}}` tag that creates an interactive map for FFXI. This extension is designed specifically to work with the HorizonXI Wiki. 



```php
wfLoadExtension( 'FFXIMap' );
```

Notes / Adjustments
----
Metalworks: doesnt have a direct connection listed on the map, add a custom image overlay? 
Lower Delkfutt's Tower: Map 4: Add connections to Embassy links? 
Mhaura: Add Ferry? 
Selbina: Add Ferry?
Delkfultts Tower: teleports can take you to more than one place... 
Middle Delkfutt's Tower: Map 2 - where does that go? [G-6] 

Known Issues:
----
Hardly an "issue": after adding the <FFXIMap> tag to a page, and "saving changes", it is likely the map will not render properly. Refresh the page to fix. 




Changing map markers based on zoom levels
https://stackoverflow.com/questions/46015066/leaflet-custom-icon-resize-on-zoom-performance-icon-vs-divicon




"129" : { 
                    "hover" : [[120.71484, 50.04167], [119.58984, 89.41667], [103.83984, 90.04167], [103.46484, 51.16667]],
                    "pulse" : [[112.92643, 94.02083]]
                },
"199" : { 
                    "hover" : [ 
                            [[[96.1224, 144.41667], [96.1224, 155.04167], [88.9974, 155.29167], [88.9974, 144.54167]]],   
                            [[[136.60742, 119.77083], [136.48242, 129.52083], [130.23242, 129.58333], [129.91992, 120.39583]]]
                        ],
                    "pulse" : [[148.32373, 142.19271], [133.37061, 124.42708], [124.74561, 113.17708], [147.12061, 115.44271], [167.51123, 92.14583], [149.52686, 69.47396]]
                }