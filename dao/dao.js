const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId

class Dao {
    static create(db, obj, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.insertOne(obj, null)
            .then(result => onSuccess(result))
            .catch(err => onError(err))
    }

    static update(db, updateProperty, propertyToFind, updatedProps, onSuccess, onError) {
        collection.update({ updateProperty: propertyToFind }, updateProps, { upsert: true })
            .then(result => onSuccess(result))
            .catch(err => onError(err))
    }

    static getCollection(db) {
        return db.collection(this.collection)
    }
}

module.exports = Dao
