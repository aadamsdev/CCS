const MongoConfig = require('../config/mongoConfig')
const ObjectId = require('mongodb').ObjectId
const Dao = require('./dao')
const bcrypt = require('bcrypt')

const saltRounds = 10

class UserDao extends Dao {
    // Returns true if a user exists with either the same username or email, false otherwise
    static checkIfUserExists(db, username, email, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({ $or: [{ 'username': username }, { 'email': email }] })
            .toArray()
            .then((users) => {
                if (users && users.length > 0) {
                    onSuccess(true)
                } else if (users && users.length === 0) {
                    onSuccess(false)
                }
            }).catch(err => {
                onError(err)
            })
    }

    static register(db, username, password, email, onSuccess, onError) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                onError(err)
            } else {
                this.create(db, { username: username, password: hash, email: email }, () => {
                    onSuccess()
                }, (err) => {
                    onError(err)
                })
            }
        })
    }

    static getByUserName(db, username, onSuccess, onError) {
        const collection = this.getCollection(db)
        collection.find({ 'username': username })
            .toArray()
            .then((users) => {
                if (users) {
                    onSuccess(users)
                } else {
                    onSuccess(null)
                }
            }).catch(err => {
                onError(err)
            })
    }

    static login(db, username, password, onSuccess, onError) {
        const collection = this.getCollection(db)
        this.getByUserName(db, username, (users) => {
            const user = users[0]
            if (user) {
                bcrypt.compare(password, user.password, (err, same) => {
                    if (same) {
                        onSuccess({ loginSuccess: true })
                    } else {
                        onError({ loginSuccess: false, error: 'Incorrect username/password' })
                    }
                })
            } else {
                onError({ loginSuccess: false, error: 'Username does not exist' })
            }
        }, (err) => {

        })
    }

    static getCollection(db) {
        return db.collection(MongoConfig.db.collections.user)
    }
}

module.exports = UserDao
