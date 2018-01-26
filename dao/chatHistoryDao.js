const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId

class ChatHistoryDao {
    static getForChatRoomByPage(db, chatRoomName, lastMessageInChat, onSuccess, onError) {
        const collection = this.getCollection(db)
        db.collection(MongoConfig.db.collections.chatHistory)
            .find({ '_id': { $gte: new ObjectId(lastMessageInChat) }, 'chatRoomName': chatRoomName })
            .sort({ '_id': -1 })
            .limit(50)
            .toArray()
            .then(messages => onSuccess(messages))
            .catch(err => onError(err))
    }

    static getForChatRoomUpdate(db, chatRoom, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({ chatRoomName: chatRoom })
            .sort({ timeStamp: -1 })
            .limit(50)
            .toArray()
            .then(products => onSuccess(products))
            .catch(err => onError(err))
    }

    static putForChatRoom(db, message, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.insertOne(message, (err, result) => {
            if (err) onError(err)
            onSuccess(message)
        })
    }

    static getCollection(db) {
        return db.collection(MongoConfig.db.collections.chatHistory)
    }
}

module.exports = ChatHistoryDao
