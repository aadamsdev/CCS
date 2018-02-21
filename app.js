'use strict';

const MongoClient = require('mongodb').MongoClient;
const MongoConfig = require('./config/mongoConfig')

const ChatSocket = require('./websocket/chatSocket')
const ObjectId = require('mongodb').ObjectID;

const bodyParser = require('body-parser')

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

http.listen(port, function () {
    console.log('listening at port %d', port)
})

// Use connect method to connect to the server
MongoClient.connect(MongoConfig.db.uri, function (err, client) {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected successfully to mongodb server");
        const db = client.db(MongoConfig.db.name)

        const chatSocket = new ChatSocket()
        chatSocket.registerSocketEvents(io, db)

        require('./routes/chatHistoryRoute')(app, db)
        require('./routes/userRoute')(app, db)
    }
})