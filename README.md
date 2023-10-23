
```php
wfLoadExtension( 'FFXIMap' );
```

This is a HorizonXI exclusive extension that adds an interactive FFXI map with the `<FFXIMap>` tag. 

This is an interactive map for FFXI. This extension is designed specifically to work with the HorizonXI Wiki (https://horizonffxi.wiki/), and is built using the Leaflet library (https://leafletjs.com/). 

The project was started to give players a more intuitive FFXI map tool. Basic functionality includes displaying a zone map (ie: Upper Jeuno) in a custom sized window, zoom controls, and clickable links for all zone connections. Advanced functionality includes displaying pulsating icons on the map for user defined things, for instance NPCs in a city or Treasure Coffers in a zone. The advanced functions work in a local testing environment and are currently being migrated to the Wiki for editors to evaluate. 


The Basics: 
To have an interactive map displayed on a wiki page you would add <FFXIMap /> to the page. Every parameter added to the tag is "optional" and by omitting any particular parameter the extension will just apply a default value in it's place (see Parameters table below for details). 

This is an example of a working tag with likely to be the most commonly used parameters for displaying a map:
<FFXIMap mapID=62 zoom=1 width=512 height=512 />
In this example we have chosen to display the "Upper Jeuno" map, with a desired width and height and a particular zoom level.    

*For v1 of this extension, please always include the "mapID" parameter with a desired map number, and ensure it is not 0. MapID 0 is saved for "world map" features set to be released at a later date. 


-----------------
Known Issues:
----
Hardly an "issue": after adding the <FFXIMap> tag to a page, and "saving changes", it is likely the map will not render properly. Refresh the page to fix. 

-----------------
To Do:
----
Add "back" arrows to revert to previous map in case you click the wrong thing


--------
Additional parameters for tag usage on the wiki
--
Mouse coordinates
Show current map details (debugging)
Search bar with all maps listed

//////////////////////////////////
How to use: 
{{FFXIMap Markers
|mapID=141
|position=50,74
|entityType=NPC
}}

/////////////////////////////////
Max query limit of 500

/////////////////////////////////
Cargo DB entries... 
///
View table: ffximap_markers
< Cargo tables
Jump to navigationJump to search
Table structure:

mapID - Integer
position - List of Integer, delimiter: ,
entityType - List of Page, delimiter: ,
This table has 2 rows altogether.

Recreate data.

Page	mapID	position	entityType
Manjango (edit)	141	50 • 74	NPC
MoogleTest (edit)	141	25 • 100	NPC

///////////////////////////
Cargo Query: (JSON)

{
    "cargoquery": [
        {
            "title": {
                "Page": "Manjango",
                "entityType": "NPC",
                "position": "50,74",
                "mapID": "141"
            }
        },
        {
            "title": {
                "Page": "MoogleTest",
                "entityType": "Seasonal NPC",
                "position": "25,100",
                "mapID": "141"
            }
        }
    ]
}
//////
Parameters

==Tag Parameters==
{| class="wikitable"
|+
!parameter
!default
!type
!description
|-
|mapid
|0
|number
|Map id corresponds with the map name, listed below. See table "Map ID Data" below for details on these values. As of release of this map feature, please use values > 0. The World Map feature is being released at a later date and is not currently working. 
|-
|zoom
|1
|number
|Values range from 0-6, with 0 being very "zoomed out" and 6 being very "zoomed in". 
|-
|width
|512
|number
|Width of window displaying the map. All testing has been with "square" maps where width and height matched values. Rectangular shaped windows appear to work with current settings.
|-
|height
|512
|number
|Height of window displaying the map. All testing has been with "square" maps where width and height matched values. Rectangular shaped windows appear to work with current settings.  
|-
|showdetails
|false
|text [ true/false ]
|Displays mouse coordinates on bottom left of window. When mouse is clicked on map the coordinates of the mouse are printed to a new <div> below the map. <div> is reset if mouse clicks a new zone connection in map. This is primarily used for editors to help grab coordinate arrays quickly. 
|}

////////////////////////////
Map IDs

==Map ID Data==
{| class="wikitable"
|+
!Map ID
!Map Name
|-
|0
|world map
|-
|1
|Bastok Market
|-
|2
|Bastok Mines
|-
|3
|Battalia Downs
|-
|4
|Beaucedine Glacier
|-
|5
|Chateau d'Oraguille
|-
|6
|Konschtat Highlands
|-
|7
|La Theine Plateau
|-
|8
|Lower Delkfutt's Tower: Map 1
|-
|9
|Lower Delkfutt's Tower: Map 2
|-
|10
|Lower Delkfutt's Tower: Map 3
|-
|11
|Lower Delkfutt's Tower: Map 4
|-
|12
|Lower Jeuno
|-
|13
|Metalworks
|-
|14
|Mhaura
|-
|15
|Middle Delkfutt's Tower: Map 1
|-
|16
|Middle Delkfutt's Tower: Map 2
|-
|17
|Middle Delkfutt's Tower: Map 3
|-
|18
|Middle Delkfutt's Tower: Map 4
|-
|19
|Middle Delkfutt's Tower: Map 5
|-
|20
|Middle Delkfutt's Tower: Map 6
|-
|21
|Norg
|-
|22
|Northern San d'Oria
|-
|23
|Port Bastok
|-
|24
|Port Jeuno
|-
|25
|Port San d'Oria
|-
|26
|Port Windurst
|-
|27
|Pso'Xja: Map 1
|-
|28
|Pso'Xja: Map 2
|-
|29
|Pso'Xja: Map 3
|-
|30
|Pso'Xja: Map 4
|-
|31
|Pso'Xja: Map 5
|-
|32
|Pso'Xja: Map 6
|-
|33
|Pso'Xja: Map 7
|-
|34
|Pso'Xja: Map 8
|-
|35
|Pso'Xja: Map 9
|-
|36
|Pso'Xja: Map 10
|-
|37
|Pso'Xja: Map 11
|-
|38
|Pso'Xja: Map 12
|-
|39
|Pso'Xja: Map 13
|-
|40
|Pso'Xja: Map 14
|-
|41
|Pso'Xja: Map 15
|-
|42
|Pso'Xja: Map 16
|-
|43
|Pso'Xja: Map 17
|-
|44
|Pso'Xja: Map 18
|-
|45
|Pso'Xja: Map 19
|-
|46
|Pso'Xja: Map 20
|-
|47
|Qufim Island
|-
|48
|Rolanberry Fields
|-
|49
|Ru'Lude Gardens
|-
|50
|Sauromugue Champaign
|-
|51
|Southern San d'Oria
|-
|52
|Tahrongi Canyon
|-
|53
|Tavnazian Safehold: Map 1
|-
|54
|Tavnazian Safehold: Map 2
|-
|55
|Tavnazian Safehold: Map 3
|-
|56
|Upper Delkfutt's Tower: Map 1
|-
|57
|Upper Delkfutt's Tower: Map 2
|-
|58
|Upper Delkfutt's Tower: Map 3
|-
|59
|Upper Delkfutt's Tower: Map 4
|-
|60
|Upper Delkfutt's Tower: Map 5
|-
|61
|Upper Delkfutt's Tower: Map 6
|-
|62
|Upper Jeuno
|-
|63
|Valkurm Dunes
|-
|64
|Windurst Walls
|-
|65
|Windurst Waters: North
|-
|66
|Windurst Waters: South
|-
|67
|Windurst Woods
|-
|68
|Al'Taieu
|-
|69
|Altar Room
|-
|70
|Apollyon: Map 1
|-
|71
|Apollyon: Map 2
|-
|72
|Apollyon: Map 3
|-
|73
|Apollyon: Map 4
|-
|74
|Apollyon: Map 5
|-
|75
|Apollyon: Map 6
|-
|76
|Apollyon: Map 7
|-
|77
|Apollyon: Map 8
|-
|78
|Attohwa Chasm
|-
|79
|Beadeaux: Map 1
|-
|80
|Beadeaux: Map 2
|-
|81
|Behemoth's Dominion
|-
|82
|Bibiki Bay: Map 1
|-
|83
|Bibiki Bay: Map 2
|-
|84
|Bostaunieux Oubliette: Map 1
|-
|85
|Bostaunieux Oubliette: Map 2
|-
|86
|Bostaunieux Oubliette: Map 3
|-
|87
|Buburimu Peninsula
|-
|88
|Castle Oztroja: Map 1
|-
|89
|Castle Oztroja: Map 2
|-
|90
|Castle Oztroja: Map 3
|-
|91
|Castle Oztroja: Map 4
|-
|92
|Castle Oztroja: Map 5
|-
|93
|Castle Oztroja: Map 6
|-
|94
|Castle Oztroja: Map 7
|-
|95
|Castle Zvahl Baileys: Map 1
|-
|96
|Castle Zvahl Baileys: Map 2
|-
|97
|Castle Zvahl Baileys: Map 3
|-
|98
|Castle Zvahl Baileys: Map 4
|-
|99
|Castle Zvahl Keep: Map 1
|-
|100
|Castle Zvahl Keep: Map 2
|-
|101
|Castle Zvahl Keep: Map 3
|-
|102
|Castle Zvahl Keep: Map 4
|-
|103
|Crawler's Nest: Map 1
|-
|104
|Crawler's Nest: Map 2
|-
|105
|Crawler's Nest: Map 3
|-
|106
|Dangruf Wadi
|-
|107
|Davoi
|-
|108
|East Ronfaure
|-
|109
|East Sarutabaruta
|-
|110
|Fort Ghelsba
|-
|111
|Garlaige Citadel: Map 1
|-
|112
|Garlaige Citadel: Map 2
|-
|113
|Garlaige Citadel: Map 3
|-
|114
|Garlaige Citadel: Map 4
|-
|115
|Ghelsba Outpost: Map 1
|-
|116
|Ghelsba Outpost: Map 2
|-
|117
|Giddeus: Map 1
|-
|118
|Giddeus: Map 2
|-
|119
|Gusgen Mines: Map 1
|-
|120
|Gusgen Mines: Map 2
|-
|121
|Gusgen Mines: Map 3
|-
|122
|Gusgen Mines: Map 4
|-
|123
|Gustav Tunnel: Map 1
|-
|124
|Gustav Tunnel: Map 2
|-
|125
|Inner Horutoto Ruins: Map 1
|-
|126
|Inner Horutoto Ruins: Map 2
|-
|127
|Inner Horutoto Ruins: Map 3
|-
|128
|Inner Horutoto Ruins: Map 4
|-
|129
|Jugner Forest
|-
|130
|Korroloka Tunnel: Map 1
|-
|131
|Korroloka Tunnel: Map 2
|-
|132
|Korroloka Tunnel: Map 3
|-
|133
|Korroloka Tunnel: Map 4
|-
|134
|Korroloka Tunnel: Map 5
|-
|135
|Kuftal Tunnel: Map 1
|-
|136
|Kuftal Tunnel: Map 2
|-
|137
|Kuftal Tunnel: Map 3
|-
|138
|Kuftal Tunnel: Map 4
|-
|139
|Lufaise Meadows
|-
|140
|Meriphataud Mountains
|-
|141
|Misareaux Coast
|-
|142
|Monastic Cavern
|-
|143
|North Gustaberg
|-
|144
|Palborough Mines: Map 1
|-
|145
|Palborough Mines: Map 2
|-
|146
|Palborough Mines: Map 3
|-
|147
|Pashhow Marshlands
|-
|148
|Promyvion Dem
|-
|149
|Promyvion Holla
|-
|150
|Promyvion Mea
|-
|151
|Promyvion Vahzl
|-
|152
|Qulun Dome
|-
|153
|Riverne Site #A01
|-
|154
|Riverne Site #B01
|-
|155
|Ru'Aun Gardens
|-
|156
|Sea Serpent Grotto: Map 1
|-
|157
|Sea Serpent Grotto: Map 2
|-
|158
|Sea Serpent Grotto: Map 3
|-
|159
|Sea Serpent Grotto: Map 4
|-
|160
|Sea Serpent Grotto: Map 5
|-
|161
|Selbina
|-
|162
|South Gustaberg
|-
|163
|Temenos North: Map 1
|-
|164
|Temenos North: Map 2
|-
|165
|Temenos North: Map 3
|-
|166
|Temenos North: Map 4
|-
|167
|Temenos North: Map 5
|-
|168
|Temenos North: Map 6
|-
|169
|Temenos North: Map 7
|-
|170
|Temenos East: Map 1
|-
|171
|Temenos East: Map 2
|-
|172
|Temenos East: Map 3
|-
|173
|Temenos East: Map 4
|-
|174
|Temenos East: Map 5
|-
|175
|Temenos East: Map 6
|-
|176
|Temenos East: Map 7
|-
|177
|Temenos West: Map 1
|-
|178
|Temenos West: Map 2
|-
|179
|Temenos West: Map 3
|-
|180
|Temenos West: Map 4
|-
|181
|Temenos West: Map 5
|-
|182
|Temenos West: Map 6
|-
|183
|Temenos West: Map 7
|-
|184
|Temenos Center: Map 1
|-
|185
|Temenos Center: Map 2
|-
|186
|Temenos Center: Map 3
|-
|187
|Temenos Center: Map 4
|-
|188
|Temenos Center: Basement
|-
|189
|Temenos Entrance
|-
|190
|Temple of Uggalepih: Map 1
|-
|191
|Temple of Uggalepih: Map 2
|-
|192
|Temple of Uggalepih: Map 3
|-
|193
|Temple of Uggalepih: Map 4
|-
|194
|The Boyahda Tree: Map 1
|-
|195
|The Boyahda Tree: Map 2
|-
|196
|The Boyahda Tree: Map 3
|-
|197
|The Boyahda Tree: Map 4
|-
|198
|The Eldieme Necropolis: Map 1
|-
|199
|The Eldieme Necropolis: Map 2
|-
|200
|The Eldieme Necropolis: Map 3
|-
|201
|The Santuary of Zi'Tah
|-
|202
|Uleguerand Range: Map 1
|-
|203
|Uleguerand Range: Map 2
|-
|204
|West Ronfaure
|-
|205
|West Sarutabaruta
|-
|206
|Windurst Walls
|-
|207
|Xarcabard
|-
|208
|Yhoator Jungle
|-
|209
|Yughott Grotto: Map 1
|-
|210
|Yughott Grotto: Map 2
|-
|211
|Yuhtunga Jungle
|-
|212
|Zeruhn Mines
|-
|213
|Eastern Altepa Desert
|-
|214
|Western Altepa Desert
|-
|215
|Rabao
|-
|216
|Quicksand Caves: Map 1
|-
|217
|Quicksand Caves: Map 2
|-
|218
|Quicksand Caves: Map 3
|-
|219
|Quicksand Caves: Map 4
|-
|220
|Quicksand Caves: Map 5
|-
|221
|Quicksand Caves: Map 6
|-
|222
|Quicksand Caves: Map 7
|-
|223
|Quicksand Caves: Map 8
|-
|224
|Sacrarium: Map 1
|-
|225
|Sacrarium: Map 2
|-
|226
|Carpenter's Landing: Map 1
|-
|227
|Carpenter's Landing: Map 2
|-
|228
|Sealion's Den
|-
|229
|Phomiuna Aqueducts: Map 1
|-
|230
|Phomiuna Aqueducts: Map 2
|-
|231
|Phomiuna Aqueducts: Map 3
|-
|232
|Fei'Yin: Map 1
|-
|233
|Fei'Yin: Map 2
|-
|234
|Ranguemont Pass
|-
|235
|Ordelle's Caves: Map 1
|-
|236
|Ordelle's Caves: Map 2
|-
|237
|Ordelle's Caves: Map 3
|-
|238
|Maze of Shakhrami: Map 1
|-
|239
|Maze of Shakhrami: Map 2
|-
|240
|Grand Palace of Hu'Xzoi: Map 1
|-
|241
|Grand Palace of Hu'Xzoi: Map 2
|-
|242
|Grand Palace of Hu'Xzoi: Map 3
|-
|243
|Labyrinth of Onzozo
|-
|244
|King Ranperres Tomb: Map 1
|-
|245
|King Ranperres Tomb: Map 2
|-
|246
|Outter Horutoto: Map 1
|-
|247
|Outter Horutoto: Map 2
|-
|248
|Outter Horutoto: Map 3
|-
|249
|Outter Horutoto: Map 4
|-
|250
|Outter Horutoto: Map 5
|-
|251
|Oldton Movalpolos
|-
|252
|Cape Teriggan
|-
|253
|Toraimarai Canal: Map 1
|-
|254
|Toraimarai Canal: Map 2
|-
|255
|Hall of the Gods
|-
|256
|Ve'Lugannon Palace: Map 1
|-
|257
|Ve'Lugannon Palace: Map 2
|-
|258
|Ve'Lugannon Palace: Map 3
|-
|259
|Ve'Lugannon Palace: Map 4
|-
|260
|Ve'Lugannon Palace: Map 5
|-
|261
|Ve'Lugannon Palace: Map 6
|-
|262
|Ve'Lugannon Palace: Map 6
|-
|263
|Ve'Lugannon Palace: Map 7
|-
|264
|Ve'Lugannon Palace: Map 8
|-
|265
|Ve'Lugannon Palace: Map 9
|-
|266
|The Shrine of Ru'Avitau: Map 1
|-
|267
|The Shrine of Ru'Avitau: Map 2
|-
|268
|The Shrine of Ru'Avitau: Map 3
|-
|269
|The Shrine of Ru'Avitau: Map 4
|-
|270
|The Shrine of Ru'Avitau: Map 5
|-
|271
|The Shrine of Ru'Avitau: Map 6
|-
|272
|Den of Rancor: Map 1
|-
|273
|Den of Rancor: Map 2
|-
|274
|Den of Rancor: Map 3
|-
|275
|Den of Rancor: Map 4
|-
|276
|Den of Rancor: Map 5
|-
|277
|Den of Rancor: Map 6
|-
|278
|Den of Rancor: Map 7
|-
|279
|Den of Rancor: Map 8
|-
|280
|Den of Rancor: Map 9
|-
|281
|Dragon's Aery
|-
|282
|Ro'Maeve
|-
|283
|Ifrit's Cauldron: Map 1
|-
|284
|Ifrit's Cauldron: Map 2
|-
|285
|Ifrit's Cauldron: Map 3
|-
|286
|Ifrit's Cauldron: Map 4
|-
|287
|Ifrit's Cauldron: Map 5
|-
|288
|Ifrit's Cauldron: Map 6
|-
|289
|Ifrit's Cauldron: Map 7
|-
|290
|Ifrit's Cauldron: Map 8
|-
|291
|Kazham
|-
|292
|Newton Movalpolos
|-
|293
|Valley of Sorrows
|}

