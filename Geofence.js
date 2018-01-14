'use strict'
const geolib = require('geolib/dist/geolib');
const fileSystem = require('fs')
const path = require('path')

class Geofence {
    constructor(file){
        this.polygon = []
        this.createGeofenceFromFile(file)
    }

    createGeofenceFromFile(file) {
        this.name = path.basename(file, '.geojson')
        
        const fileText = fileSystem.readFileSync(file, 'utf8')
        const parsedData = JSON.parse(fileText)
        
        for (let coordinate of parsedData.features[0].geometry.coordinates[0]){
            const tempLat = coordinate[0]
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
