'use strict'
var geolib = require('geolib/dist/geolib');
var fileSystem = require('fs')

class Geofence {
    constructor(file){
        this.createGeofenceFromFile(file)
    }

    createGeofenceFromFile(file) {
        var fileText = fileSystem.readFileSync(file, 'utf8')
        var parsedData = JSON.parse(fileText)
        this.polygon = []

        for (let coordinate of parsedData.features[0].geometry.coordinates[0]){
            var tempLat = coordinate[0]
            coordinate[0] = coordinate[1]
            coordinate[1] = tempLat

            this.polygon.push({"latitude": coordinate[0], "longitude": coordinate[1]})
        }
    }


    containsPoint(point) {
        return geolib.isPointInside(point, this.polygon)
    }
}

module.exports = Geofence
