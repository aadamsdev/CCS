'use strict'
const fs = require('fs')
const Geofence = require('./Geofence.js')
const path = require('path')

class GeofenceManager {
    constructor(geofenceJsonFile){
        this.geofenceMap = new Map()
        this.populateGeofenceArray(geofenceJsonFile) 
    }

    populateGeofenceArray(file) {
        const neighbourhoods = JSON.parse(fs.readFileSync(file, 'utf8'));
        for (const neighbourhood of neighbourhoods) {
            const name = neighbourhood.properties.HOOD
            this.geofenceMap.set(name, new Geofence(name, neighbourhood.geometry.coordinates[0]))
        }
    }

    contains(geofenceName) {
        return this.geofenceMap.has(geofenceName)
    }

    getGeofence(geofenceName) {
        return this.geofenceMap.get(geofenceName)
    }

    getGeofenceContainingPoint(point) {
        for (let [name, geofence] of this.geofenceMap.entries()) {   
            // console.log(name, geofence.polygon)
            if (geofence.containsPoint(point)) {
                return geofence
            }
        }
    }
}

module.exports = GeofenceManager