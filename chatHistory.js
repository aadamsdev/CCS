const MongoConfig = require('./mongoConfig.js')

class ChatHistory {
    static getForChatRoom(chatRoom) {
        const collection = getCollection()
        collection.find({soldOut: isSoldOut}).toArray()
            .then(products => res.status(200).send(products))
            .catch(err => res.status(500).send(err))
    }

    static getCollection() {
        return db.collection(MongoConfig.db.collections.chatHistory)
    }
}

module.exports = ChatHistory
