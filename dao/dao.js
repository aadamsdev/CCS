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
        // console.log('Dao.update', collection)
        console.log('Dao.Update updatedQuery', updateQuery)
        console.log('Dao.Update updatedProps', updatedProps)
        // onSuccess({'1': 1})
        // console.log('!!!!!!!!!!!!')

        collection.updateOne(updateQuery, updateProps, {upsert:true, w: 1}, (err, result) => {
            console.log('err', err)

            console.log('res', result)
        })
        console.log()
        // .then((result) => { onSuccess(result)})
        // .catch((err) => { onError(err)})
    }

    static getCollection(db) {
        return db.collection(this.collection)
    }
}

module.exports = Dao
