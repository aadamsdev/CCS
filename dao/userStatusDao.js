const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId
const Dao = require('./dao')

class UserStatusDao extends Dao {
    static setUserStatus(db, username, socketId, chatRoomName, isOnline, onSuccess, onError) {
        const collection = this.getCollection(db)
        const status = this.getUserStatusForChatRoom(db, username, socketId, chatRoomName, onSuccess, onError)

        if (status) { // User status record exists, find record by socket id and 
            this.update(db, 'username', username, { $set: { 'socketId': socketId, 'online': isOnline, 'chatRoomName': chatRoomName } }, (result) => {
                onSuccess(result)
            }, (err) => {
                onError(err)
            })
        } else { // User status does not exist in chat room, have to create a record
            this.create(db, { 'username': username, 'socketId': socketId, 'chatRoomName': chatRoomName, 'online': isOnline }, (result) => {
                onSuccess(result)
            }, (err) => {
                onError(err)
            })
        }
    }

    static getUserStatusForChatRoom(db, username, socketId, chatRoomName, onSuccess, onError) {
        const collection = this.getCollection(db)

        var query
        if (username) {
            query = collection.find({ 'username': username })
        } else if (socketId) {
            query = collection.find({ 'socketId': socketId })
        } else if (chatRoomName) {
            query = collection.find({ 'chatRoomName': chatRoomName })
        }

        query.toArray()
            .then(userStatus => onSuccess(userStatus))
            .catch(err => onError(err))
    }

    static getCollection(db) {
        return db.collection(MongoConfig.db.collections.userStatus)
    }
}

module.exports = UserStatusDao
