'use strict'
const geolib = require('geolib/dist/geolib');
const fileSystem = require('fs')
const path = require('path')

class Geofence {
    constructor(name, coordinates){
        this.name = name
        this.polygon = []
        this.createGeofenceFromFile(coordinates)
    }

    createGeofenceFromFile(coordinates) {   
        for (let coordinate of coordinates){
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
