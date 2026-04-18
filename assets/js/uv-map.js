!function() {

	// source options
	const VIEWER_MANIFEST_URL 		= "https://jrynhart.github.io/jrynhart/manifests/manifest2b.json";
  const MAP_MANIFEST_URL 				= "https://jrynhart.github.io/jrynhart/manifests/manifest3c.json";

	// universal viewer settings
	const UV_DIV_ID 							= "uv";

  // map settings
	const INITIAL_MAP_LOCATION 		= [39.711254, -104.998832]; // Denver, Colorado, USA (I-25 and Alameda)
  const INITIAL_ZOOM_LEVEL 			= 13;
	const DEFAULT_POINT_COLOR 		= "#00ff00";
	const HIGHLIGHT_POINT_COLOR 	= "#FFFF00";
	const POPUP_LABEL_FONT_SIZE 	= "18px";
	const POPUP_SUMMARY_FONT_SIZE = "16px";

	let _mapInstance;
	let _manifest;

  // initialize the universal viewer
	const data = {
    manifest: VIEWER_MANIFEST_URL,
    embedded: true // needed for codesandbox frame
  };
  const UV_INSTANCE = UV.init(UV_DIV_ID, data);

	// event listeners for the universal viewer
	UV_INSTANCE.on("load", function() {
	    console.log("Universal Viewer is loaded.");
	});
	UV_INSTANCE.on("manifestIndexChange", function (manifestIndex) {
	    console.log("Manifest loaded, index: " + manifestIndex);
	});
	UV_INSTANCE.on("canvasIndexChange", function (canvasIndex) {
		let canvas = _manifest.items[canvasIndex];
		let canvasId = parseInt( canvas.id.substring( canvas.id.lastIndexOf('/')+1 ) );
		setActiveLocation(canvasId);
	});

  // initialize the map
  const manifest = fetch(MAP_MANIFEST_URL)
    .then(response => response.json())
    .then(data => {
      initializeLeafletMap(data)
			_manifest = data;
    })
    .catch(error => console.error('Error fetching manifest:', error));
  
	/**
	* code derived from: "https://iiif.io/guides/guides/navplace/"
	* 
	* Initialize the Leaflet Map. The map will need to know the GeoJSON from navPlace to draw it. This function assumes you are passing in the resolved Manifest JSON as a parameter. In other implementations, it may be necessary to perform a GET request to get the JSON. In javascript, the fetch API is a good place to start.
	* @param {*} manifestObject
	*/
	function initializeLeafletMap(manifestObject) {
	  _mapInstance = L.map('leafletInstanceContainer')

	  let leafletOptions = {
	    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	    maxZoom: 19
	  }

		/**
		  Define the base map projection of the Earth that you want (satellite, elevation, infrared, etc.)
		  The projections are powered by Tile Service providers. You can find examples at http://leaflet-extras.github.io/leaflet-providers/preview/
		*/
		L.tileLayer(
		  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
		  leafletOptions
		).addTo(_mapInstance)

		_mapInstance.setView(
			INITIAL_MAP_LOCATION, 
			INITIAL_ZOOM_LEVEL
		);

		//Add the GeoJSON from the Manifest object
		L.geoJSON(manifestObject.navPlace, {
		  pointToLayer: function (feature, latlng) {
				 
		    return L.circleMarker(latlng, {
		      radius: 8,
		      fillColor: DEFAULT_POINT_COLOR,
		      color: "#000",
		      weight: 1,
		      opacity: 1,
		      fillOpacity: 0.8
		    });
		  },
		  onEachFeature: pointEachFeature
		}).addTo(_mapInstance);

		//Add the GeoJSON from the Canvas objects
		manifestObject.items.forEach((canvasObject) => {
			L.geoJSON(canvasObject.navPlace, {
			  pointToLayer: function (feature, latlng) {
					 
			    return L.circleMarker(latlng, {
			      radius: 8,
			      fillColor: DEFAULT_POINT_COLOR,
			      color: "#000",
			      weight: 1,
			      opacity: 1,
			      fillOpacity: 0.8
			    });
			  },
			  onEachFeature: pointEachFeature
			}).addTo(_mapInstance);
		});
	}

  /**
	 * A helper function for Leaflet. Leaflet sees GeoJSON objects as "features". This function says what to do with each feature when adding the feature to the map. Here is where you detect what metadata appears in the pop-ups. For our purposes, we assume the metadata you want to show is in the GeoJSON 'properties' property. Our 'label' and 'summary' will be formatted as language maps, since they are most likely coming directly from a IIIF resource type and IIIF Presentation API 3 requires 'label' and 'summary' to be formatted as a language map.
	 * @param {*} feature 
	 * @param {*} layer 
	 */
  function pointEachFeature(feature, layer){
  	let popupContent = "";

    if (feature.properties) {

      if(feature.properties.label.en) {
        popupContent += 

					`<div style="font-size: ${POPUP_LABEL_FONT_SIZE}">
						<strong>
							${feature.properties.label.en.toString()}
						</strong>
					</div>`;
      }

      if(feature.properties.summary?.en) {
        popupContent += 
				
					`<br>
					<div style="font-size: ${POPUP_SUMMARY_FONT_SIZE}">
						${feature.properties.summary.en.toString()}
					</div>`
      }
    }
    layer.bindPopup(popupContent)
  }

	/**
	 * Find the map layer by feature id that matches the canvas id, and set the style to the highlight color and open the popup. Set all other layers to the default color. This function is called when the canvas index changes in the Universal Viewer, and the canvas id is passed in as a parameter. The function iterates through all the layers on the map, checks if the layer has a feature with an id that matches the canvas id, and if so, sets the style to the highlight color and opens the popup. If not, it sets the style to the default color.
	 * @param {*} canvasId 
	 */
  function setActiveLocation(canvasId) {
		// open geojson popup for the feature with the same id as the canvas (at thumbnail index) e.g. get id from canvas at index 2 (manifest.items[2]) and set active the feature with the same id 
		_mapInstance.eachLayer(function (layer) { // is there no way to get the layer by index directly? (not that I can find in the documentation) 
			
			if(layer.feature?.id) {
				let featureId = parseInt( layer.feature.id.substring(layer.feature.id.lastIndexOf('/')+1) );

				if ( canvasId === featureId ) { 
					layer.setStyle({fillColor: HIGHLIGHT_POINT_COLOR});
					layer.bringToFront();
			    layer.openPopup();
			  } 
				else {
					layer.setStyle({fillColor: DEFAULT_POINT_COLOR});
				}
			}
		});
	}

}();
