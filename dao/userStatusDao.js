const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId
const Dao = require('./dao')

class UserStatusDao extends Dao {
    static setUserStatus(db, username, socketId, chatRoomName, isOnline, onSuccess, onError) {
        const _this = this
        const collection = this.getCollection(db)
        this.getUserStatusForChatRoom(db, username, socketId, chatRoomName, (status) => {
            if (status && status.length > 0) { // User status record exists, find record by socket id and 
                const updateSuccess = (result) => {
                    onSuccess(result)
                }

                const updateError = (err) => {
                    onError(err)
                }

                const userStatusProps = { socketId: socketId, online: isOnline, chatRoomName: chatRoomName }

                // Update query using username if online and socketId when offline since we only have socket obj from disconnection callback
                if (isOnline) {
                    _this.update(db, { username: username }, userStatusProps, updateSuccess, updateError)
                } else {
                    _this.update(db, { socketId: socketId }, userStatusProps, updateSuccess, updateError)
                }
            } else { // User status does not exist in chat room, have to create a record
                console.log('creating')
                _this.create(db, { 'username': username, 'socketId': socketId, 'chatRoomName': chatRoomName, 'online': isOnline }, (result) => {
                    onSuccess(result)
                }, (err) => {
                    onError(err)
                })
            }
        }, (err) => {
            onError(err)
        })
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
