const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId
const Dao = require('./dao')

class ChatHistoryDao extends Dao {
    static getForChatRoomByPage(db, chatRoomName, lastMessageInChat, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({ '_id': { $lt: new ObjectId(lastMessageInChat) }, 'chatRoomName': chatRoomName })
            .sort({ '_id': -1 })
            .limit(50)
            .toArray()
            .then(messages => onSuccess(messages.reverse()))
            .catch(err => onError(err))
    }

    static getForChatRoomUpdate(db, chatRoom, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({ chatRoomName: chatRoom })
            .sort({ '_id': -1 })
            .limit(50)
            .toArray()
            .then(messages => onSuccess(messages.reverse()))
            .catch(err => onError(err))
    }

    static getCollection(db) {
        return db.collection(MongoConfig.db.collections.chatHistory)
    }
}

module.exports = ChatHistoryDao
