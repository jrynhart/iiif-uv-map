# Universal Viewer with Map 

## contact

### developer

Jeff Rynhart
University of Denver
jeff.rynhart@du.edu

# description

This app utilizes the "navPlace" property in a IIIF manifest (v3). One feature per canvas can be defined to contain a single point location (or other feature type), and this feature will be displayed at the location on the map.

The map will display one feature at a location on the map for each canvas in the IIIF manifest. Currently this feature is a single point marking the location. When a canvas is selected in the UniversalViewer, the point will change to a highlight color and a popup window will appear that can contain custom text (as html content)

# installation

## dependencies

### universalviewer

1. clone the universalviewer into libs/ 

- git clone https://github.com/UniversalViewer/universalviewer.git

(github page: https://github.com/universalviewer)

2. install universalviewer node packages

- cd into universalviewer folder, run "npm install"

3. build universalviewer

- run npm run build" from universalviewer folder

# specifications

## feature ids

- When a thumbnail image is clicked on the UV, the thumbnail index is used to select the canvas at the same index in the manifest "items" array. For example if the first thumbnail is clicked, that is index 0 (first thumbnail in the list) This will result in the selection of the canvas at index 0 in the "items" array (first canvas), and the feature(s) defined in the canvas will be set as active on the map.

- In order to locate the layer on the map that corresponds to the selected canvas, the feature ID needs to be associated with the canvas. To do this, the feature ID and the canvas ID must match *after the last slash in the ID string*

e.g. If the canvas id is "https://example.com/manifest/1/canvas/1" the ID of the feature that defines the location of the canvas must end with "/1" such as "https://example.com/feature/1"


