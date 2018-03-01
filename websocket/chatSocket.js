const Geofence = require('../geo/geofence')
const GeofenceManager = require('../geo/geofenceManager')
const SocketEvents = require('../config/socketEvents')
const ChatHistoryDao = require('../dao/chatHistoryDao')
const UserStatusDao = require('../dao/userStatusDao')

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
        io.on(SocketEvents.connection, (socket) => {
            console.log('a user connected ' + socket.id)

            // Client location update
            socket.on(SocketEvents.location_update, (locationUpdate) => {
                console.log(locationUpdate)

                // Check if client is in previously known geofence; for performance purposes
                if (locationUpdate.lastKnownChatRoom
                    && instance.geofenceManager.contains(locationUpdate.lastKnownChatRoom)
                    && instance.geofenceManager.getGeofence(locationUpdate.lastKnownChatRoom).containsPoint(locationUpdate)) {

                    const chatRoom = locationUpdate.lastKnownChatRoom
                    const username = locationUpdate.username
                    instance.sendLocationUpdate(db, io, username, socket, chatRoom)
                } else { // Otherwise loop find the geofence containing user's location
                    const geofence = instance.geofenceManager.getGeofenceContainingPoint(locationUpdate)
                    if (geofence) {
                        const chatRoom = geofence.name
                        const username = locationUpdate.username
                        instance.sendLocationUpdate(db, io, username, socket, chatRoom)
                    } else {
                        // TODO: ADD HANDLING FOR USERS OUTSIDE TORONTO
                    }
                }
            })

            // Send received message
            socket.on(SocketEvents.outgoing_message, (message) => {
                console.log(message)
                const chatRoom = message.chatRoomName
                message['timestamp'] = new Date()

                ChatHistoryDao.create(db, message, (result) => {
                    console.log(result)
                    if (result && result.n > 0) {
                        socket.join(chatRoom)
                        io.to(chatRoom).emit(SocketEvents.incoming_message, message);
                    }
                })
            })

            // Disconnection
            socket.on(SocketEvents.disconnect, () => {
                console.log('user disconnected ' + socket.id)
                instance.setUserStatus(db, socket, null, null, false)
            })
        })
    }

    sendLocationUpdate(db, io, username, socket, chatRoom) {
        console.log(chatRoom)

        socket.join(chatRoom) // Place socket in desired chatroom            
        instance.setUserStatus(db, socket, username, chatRoom, true, (result) => { // Set user online status to true for desired chatroom
            if (result) {
                instance.sendChatroomUpdate(io, socket, db, chatRoom) // send chatroom update to client        
            }
        })     
    }

    sendUserOfflineToChatRoom(db, io, socket) {
        UserStatusDao.getUserStatusForChatRoom(db, null, socket.id, null, (userStatus) => {
            if (userStatus && userStatus.online && userStatus.chatRoom) {
                instance.sendUserStatusToChatRoom(io, userStatus.username, userStatus.chatRoom, false)
            }
        }, (err) => {
            console.error('sendUserOfflineToChatRoomError', err)
        })
    }

    sendUserStatusToChatRoom(io, username, chatRoom, isOnline) {
        console.log('Sending user status ' + isOnline + ' to chat room ' + chatRoom + ' for user ' + username)
        io.to(chatRoom).emit(SocketEvents.user_status_update, { username: username, isOnline: isOnline })
    }

    // Set user status for online/offline purposes
    setUserStatus(db, socket, username, chatRoom, isOnline, onSuccess, onError) {
        UserStatusDao.setUserStatus(db, username, socket.id, chatRoom, isOnline, (result) => {
            console.log('updated user status')
            if (onSuccess) {
                onSuccess(result)
            }
        }, (err) => {
            console.error('setUserStatus Error', err)
            if (onError) {
                onError(err)
            }
        })
    }

    // Called when joining a new chatroom, sends room chat history to client
    sendChatroomUpdate(io, socket, db, chatRoom) {
        ChatHistoryDao.getForChatRoomUpdate(db, chatRoom, (chatHistory) => {
            UserStatusDao.getUserStatusForChatRoom(db, null, null, chatRoom, (userStatuses) => {
                io.to(socket.id).emit(SocketEvents.chatroom_update, {
                    'chatRoomName': chatRoom,
                    'messages': chatHistory,
                    'statuses': userStatuses
                })
            }, (err) => {
                console.error('sendChatroomUpdate UserStatusDao Error', err)
            })
        }, (err) => {
            console.error('sendChatroomUpdate ChatHistoryDao Error', err)
        })
    }
}

module.exports = ChatSocket