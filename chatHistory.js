const MongoConfig = require('./mongoConfig.js')

class ChatHistory {


    static getForChatRoom(db, chatRoom, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({chatRoomName: chatRoom})
            .sort({timeStamp: -1})
            .limit(50)
            .toArray()
            .then(products => onSuccess(products))
            .catch(err => onError(err))
    }

    static getForChatRoomUpdate(db, chatRoom, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({chatRoomName: chatRoom})
            .sort({timeStamp: -1})
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

module.exports = ChatHistory
