const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId
const Dao = require('./dao')

class UserStatusDao extends Dao {
    // static setUserOnline(db, userStatus, onSuccess, onError) {
    //     const collection = this.getCollection(db)
    //     const status = this.getUserStatusForChatRoom(db, userStatus.userId, userStatus.chatRoomName, onSuccess, onError)
    //     if (status) {
    //         this.updateById(db, userStatus._id, { $set: { isOnline: true } }, ())
    //     } else { // User status does not exist in chat room, have to create a record
    //         this.create(db, userStatus, (userStatus) => {
    //             onSuccess(userStatus)
    //         }, (err) => {
    //             onError(err)
    //         })
    //     }
    // }

    static getUserStatusForChatRoom(db, userId, chatRoomName, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({ 'userId': userId, 'chatRoomName': chatRoomName })
            .then(userStatus => onSuccess(userStatus))
            .catch(err => onError(err))
    }

    static getCollection(db) {
        return db.collection(MongoConfig.db.collections.userStatus)
    }
}

module.exports = UserStatusDao
