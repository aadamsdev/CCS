'use strict';
const Geofence = require('./geofence')
const GeofenceManager = require('./geofenceManager')
const SocketEvents = require('./socketEvents')
const MongoClient = require('mongodb').MongoClient;
const MongoConfig = require('./mongoConfig')
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000;

const geofenceManager = new GeofenceManager('./boundaries/neighbourhoods.json')
let dbClient = null

http.listen(port, function () {
    console.log('listening at port %d', port)
})

// Use connect method to connect to the server
MongoClient.connect(MongoConfig.db.uri, function (err, client) {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected successfully to mongodb server");
        dbClient = client
    }
})

io.on(SocketEvents.connection, function (socket) {
    console.log('a user connected ' + socket.id)
    socket.join('Default')

    // Client location update
    socket.on(SocketEvents.location_update, function (locationUpdate) {
        console.log(locationUpdate)
        if (locationUpdate.lastKnownChatRoom
            && geofenceManager.contains(locationUpdate.lastKnownChatRoom)
            && geofenceManager.getGeofence(locationUpdate.lastKnownChatRoom).containsPoint(locationUpdate)) {

            socket.join(locationUpdate.lastKnownChatRoom)
            io.to(socket.id).emit(SocketEvents.chatroom_update, {
                chatRoomName: locationUpdate.lastKnownChatRoom
            })
        } else {
            const geofence = geofenceManager.getGeofenceContainingPoint(locationUpdate)
            if (geofence) {
                console.log(geofence)
                socket.join(geofence.name)
                io.to(socket.id).emit(SocketEvents.chatroom_update, {
                    chatRoomName: geofence.name
                })
            }
        }
    })

    // Send received message
    socket.on(SocketEvents.outgoing_message, function (messageDetails) {
        console.log(messageDetails)
        const time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        io.to('Default').emit(SocketEvents.incoming_message, {
            message: messageDetails.message,
            username: messageDetails.username,
            timestamp: time
        });
    })

    // Disconnection
    socket.on(SocketEvents.disconnect, function () {
        console.log('user disconnected')
    })
})