'use strict';

const Geofence = require('./geofence')
const GeofenceManager = require('./geofenceManager')
const SocketEvents = require('./socketEvents')
const MongoClient = require('mongodb').MongoClient;
const MongoConfig = require('./mongoConfig')
const ChatHistory = require('./chatHistory')

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000;

const geofenceManager = new GeofenceManager('./boundaries/neighbourhoods.json')
let db = null

http.listen(port, function () {
    console.log('listening at port %d', port)
})

// Use connect method to connect to the server
MongoClient.connect(MongoConfig.db.uri, function (err, client) {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected successfully to mongodb server");
        db = client.db(MongoConfig.db.name)
    }
})

io.on(SocketEvents.connection, function (socket) {
    console.log('a user connected ' + socket.id)

    // Client location update
    socket.on(SocketEvents.location_update, function (locationUpdate) {
        console.log(locationUpdate)

        // Check if client is in previously known geofence; for performance purposes
        if (locationUpdate.lastKnownChatRoom
            && geofenceManager.contains(locationUpdate.lastKnownChatRoom)
            && geofenceManager.getGeofence(locationUpdate.lastKnownChatRoom).containsPoint(locationUpdate)) {

            const chatRoom = locationUpdate.lastKnownChatRoom
            ChatHistory.getForChatRoom(db, chatRoom, (chatHistory) => {
                console.log(chatHistory)

                socket.join(chatRoom)
                io.to(socket.id).emit(SocketEvents.chatroom_update, {
                    chatRoomName: chatRoom,
                    messages: chatHistory 
                })
            }, (err) => {
                console.log(err)
            })
        } else { // Otherwise loop find the geofence containing user's location
            const geofence = geofenceManager.getGeofenceContainingPoint(locationUpdate)
            if (geofence) {
                console.log(geofence)
                socket.join(geofence.name)
                io.to(socket.id).emit(SocketEvents.chatroom_update, {
                    chatRoomName: geofence.name
                })
            } else {
                // TODO: ADD HANDLING FOR USERS OUTSIDE TORONTO
            }
        }
    })

    // Send received message
    socket.on(SocketEvents.outgoing_message, function (message) {
        console.log(message)
        const chatRoom = message.chatRoomName
        message['timestamp'] = getTimestampString()

        ChatHistory.putForChatRoom(db, message)
        socket.join(chatRoom)
        io.to(chatRoom).emit(SocketEvents.incoming_message, message);
    })

    // Disconnection
    socket.on(SocketEvents.disconnect, function () {
        console.log('user disconnected')
    })
})

function getTimestampString() {
    return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}