'use strict';
const Client = require('./client.js')
const Geofence = require('./Geofence.js')

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000;

const path = require('path')

var currentRoom = 'Default'

//TODO: Create geofence manager
const geofenceMap = new Map()
geofenceMap.set(path.basename('./boundaries/Etobicoke.geojson', '.geojson'), new Geofence('./boundaries/Etobicoke.geojson'))

const OUTGOING_MESSAGE = 'OUTGOING_MESSAGE';
const INCOMING_MESSAGE = 'INCOMING_MESSAGE';
const LOCATION_UPDATE = 'LOCATION_UPDATE';
const CHATROOM_UPDATE = 'CHATROOM_UPDATE';

http.listen(port, function () {
    console.log('listening at port %d', port)
})

io.on('connection', function (socket) {
    console.log('a user connected ' + socket.id)
    socket.join('Default')

    // Client location update
    socket.on(LOCATION_UPDATE, function (locationUpdate) {
        console.log(locationUpdate)

        
        if (locationUpdate.lastKnownChatRoom
            && geofenceMap.has(locationUpdate.lastKnownChatRoom)
            && geofenceMap.get(locationUpdate.lastKnownChatRoom).containsPoint({ "latitude": locationUpdate.latitude, "longitude": locationUpdate.longitude })) {

            socket.join(locationUpdate.lastKnownChatRoom)
            io.to(socket.id).emit(CHATROOM_UPDATE, {
                chatRoomName: locationUpdate.lastKnownChatRoom
            })
        } else {
            console.log('2')

            // Change to for loop to allow for breaking
            geofenceMap.forEach((geofence, key, map) => {
                if (geofence.containsPoint({ "latitude": locationUpdate.latitude, "longitude": locationUpdate.longitude })) {
                    socket.join(locationUpdate.lastKnownChatRoom)
                    io.to(socket.id).emit(CHATROOM_UPDATE, {
                        chatRoomName: geofence.name
                    })
                }
            })
        }
    })

    // Send received message
    socket.on(OUTGOING_MESSAGE, function (messageDetails) {
        console.log(messageDetails)
        const time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        io.to('Default').emit(INCOMING_MESSAGE, {
            message: messageDetails.message,
            username: messageDetails.username,
            timestamp: time
        });
    })

    // Disconnection
    socket.on('disconnect', function () {
        console.log('user disconnected')
    })
})
