const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId
const Dao = require('./dao')

class UserStatusDao extends Dao {
    static setUserStatus(db, username, chatRoomName, userStatus, onSuccess, onError) {
        const collection = this.getCollection(db)
        const status = this.getUserStatusForChatRoom(db, userStatus.userId, userStatus.chatRoomName, onSuccess, onError)

        if (status) {
            // this.updateById(db, userStatus._id, { $set: { isOnline: true } }, ())
        } else { // User status does not exist in chat room, have to create a record
            this.create(db, { 'username': username, 'chatRoomName': chatRoomName }, (result) => {
                onSuccess(result)
            }, (err) => {
                onError(err)
            })
        }
    }

    static getUserStatusForChatRoom(db, username, chatRoomName, onSuccess, onError) {
        const collection = this.getCollection(db)
        
        var query
        if (username && chatRoomName) {
            query = collection.find({ 'username': username, 'chatRoomName': chatRoomName })
        } else if (username) {
            query = collection.find({ 'username': username })
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
