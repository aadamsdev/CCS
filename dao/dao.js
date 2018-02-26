const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId

class Dao {
    static create(db, obj, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.insertOne(obj, null)
            .then(result => onSuccess(result))
            .catch(err => onError(err))
    }

    static update(db, updateQuery, updatedProps, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.updateOne(updateQuery, { $set: updatedProps }, { w: 1 })
            .then((result) => { onSuccess(result) })
            .catch((err) => { onError(err) })
    }

    static getCollection(db) {
        return db.collection(this.collection)
    }
}

module.exports = Dao
