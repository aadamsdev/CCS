'use strict'
var geolib = require('geolib/dist/geolib');
var fileSystem = require('fs')

class Geofence {
    constructor(file){
        this.polygons = []
    }

     addGeofenceFromFile(file) {
        // var isInside = geolib.isPointInside({"latitude": 43.614612, "longitude": -79.567578}, polygon)
        var fileText = fileSystem.readFileSync(file, 'utf8')
        var parsedData = JSON.parse(fileText)
        var polygon = []

        for (let coordinate of parsedData.features[0].geometry.coordinates[0]){
            var tempLat = coordinate[0]
            coordinate[0] = coordinate[1]
            coordinate[1] = tempLat

            polygon.push({"latitude": coordinate[0], "longitude": coordinate[1]})
        }

        this.polygons.push(polygon)
    }
}

module.exports = Geofence
