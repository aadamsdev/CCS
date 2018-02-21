const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId

class Dao {
    static create(db, obj, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.insertOne(obj, null)
            .then(result => onSuccess(result))
            .catch(err => onError(err))
    }

    static updateById(db, id, updatedProps, onSuccess, onError) {
        collection.update({ '_id': new ObjectId(id) }, updateProps, { upsert: true })
            .then(updated => onSuccess(updated))
            .catch(err => onError(err))
    }

    static getCollection(db) {
        return db.collection(this.collection)
    }
}

module.exports = Dao
