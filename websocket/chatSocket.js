const Geofence = require('../geo/geofence')
const GeofenceManager = require('../geo/geofenceManager')
const SocketEvents = require('../config/socketEvents')
const ChatHistoryDao = require('../dao/chatHistoryDao')

let instance = null

class ChatSocket {

    constructor() {
        if (instance) {
            return instance
        }

        instance = this
        instance.geofenceManager = new GeofenceManager('./boundaries/neighbourhoods.json')
    }

    registerSocketEvents(io, db) {
        io.on(SocketEvents.connection, function (socket) {
            console.log('a user connected ' + socket.id)
        
            // Client location update
            socket.on(SocketEvents.location_update, function (locationUpdate) {
                console.log(locationUpdate)
        
                // Check if client is in previously known geofence; for performance purposes
                if (locationUpdate.lastKnownChatRoom
                    && instance.geofenceManager.contains(locationUpdate.lastKnownChatRoom)
                    && instance.geofenceManager.getGeofence(locationUpdate.lastKnownChatRoom).containsPoint(locationUpdate)) {
        
                    const chatRoom = locationUpdate.lastKnownChatRoom
                    socket.join(chatRoom)
                    instance.sendChatroomUpdate(io, socket, db, chatRoom)
                } else { // Otherwise loop find the geofence containing user's location
                    const geofence = instance.geofenceManager.getGeofenceContainingPoint(locationUpdate)
                    if (geofence) {
                        const chatRoom = geofence.name
                        socket.join(chatRoom)
                        instance.sendChatroomUpdate(io, socket, db, chatRoom)
                    } else {
                        // TODO: ADD HANDLING FOR USERS OUTSIDE TORONTO
                    }
                }
            })
        
            // Send received message
            socket.on(SocketEvents.outgoing_message, function (message) {
                console.log(message)
                const chatRoom = message.chatRoomName
                message['timestamp'] = new Date()
        
                ChatHistoryDao.putForChatRoom(db, message, (updatedMessage) => {
                    socket.join(chatRoom)
                    io.to(chatRoom).emit(SocketEvents.incoming_message, updatedMessage);
                })
            })
        
            // Disconnection
            socket.on(SocketEvents.disconnect, function () {
                console.log('user disconnected')
            })
        })    
    }

    // Called when joining a new chatroom, sends room chat history to client
    sendChatroomUpdate(io, socket, db, chatRoom) {
        ChatHistoryDao.getForChatRoomUpdate(db, chatRoom, (chatHistory) => {
            console.log(chatHistory)
    
            io.to(socket.id).emit(SocketEvents.chatroom_update, {
                chatRoomName: chatRoom,
                messages: chatHistory
            })
        }, (err) => {
            console.log(err)
        })
    }
}

module.exports = ChatSocket
