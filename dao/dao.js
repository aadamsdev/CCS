const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId

class Dao {
    static create(db, obj, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.insertOne(obj, (err, result) => {
            if (err) onError(err)
            onSuccess(obj)
        })
    }

    static update(db, id, obj, onSuccess, onError) {

    }
    
    static getCollection(db) {
        return db.collection(this.collection)
    }
}

module.exports = Dao
