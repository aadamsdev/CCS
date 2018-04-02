const UserDao = require('../dao/userDao')

module.exports = function (app, db) {

    app.post('/user/register', (req, res) => {
        const body = req.body
        if (body && (!body.email || !body.password || !body.username)) {
            res.status(400).send('Email, username and password are required for registration.')
        } else if (body) {
            const email = body.email
            const password = body.password
            const username = body.username

            UserDao.checkIfUserExists(db, username, email, result => {
                if (!result) {
                    UserDao.register(db, username, password, email, (registrationResult) => {
                        res.status(200).send()
                    }, (err) => {
                        res.status(500).send(err)
                    })
                } else {
                    res.status(400).send({ error: 'A user with the same username or email already exists.' })
                }
            }, err => {
                result.status(500).send(err)
            })
        } else {
            res.status(404).send()
        }
    })

    app.post('/user/login', (req, res) => {        
        const body = req.body
        if (body && (!body.password || !body.username)) {
            res.status(400).send('Username and password are required for login.')
        } else if (body) {
            const username = body.username
            const password = body.password
            
            UserDao.login(db, username, password, (loginResult) => {
                res.status(200).send(loginResult)
            }, (err) => {
                res.status(400).send(err)
            })
        } else {
            res.status(404).send()
        }
    })
};