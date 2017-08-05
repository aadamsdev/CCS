'use strict';
const Client = require('./client.js')
const Geofence = require('./Geofence.js')

var geolib = require('geolib/dist/geolib');

var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var port = process.env.PORT || 3000;

var currentRoom = 'Default'
var geofences = []
geofences.push(new Geofence('./boundaries/etobicoke.geojson'))

const OUTGOING_MESSAGE = 'OUTGOING_MESSAGE'
const INCOMING_MESSAGE = 'INCOMING_MESSAGE'
const LOCATION_UPDATE = 'LOCATION_UPDATE';

http.listen(port, function(){
    console.log('listening at port %d', port)
})

app.get('/', function(req, res){
    res.sendFile(__dirname + '/main.html')
})

io.on('connection', function(socket){
    console.log('a user connected ' + socket.id)
    socket.join('Default')

    socket.on(LOCATION_UPDATE, function(location){
        geofences.some(geofence => {
            if (geofence.containsPoint(location)) {
                console.log
            }
        })
    })

    // socket.on(NEW_CLIENT, function(client){
    //     client.id = socket.id
    //     var newClient = new Client(client)
    //
    //
    //     // if (client.username)
    //     clients.push(newClient)
    //
    //
    //     console.log(clients)
    //
    //     // if (geolib.isPointInside(coordinates, etobicoke)){
    //     //     currentRoom = 'Etobicoke'
    //     //     socket.join(currentRoom)
    //     // } else {
    //     //     currentRoom = 'Default'
    //     //     socket.join(currentRoom)
    //     // }
    //     console.log(currentRoom)
    // })

    // Send received message
    socket.on(OUTGOING_MESSAGE, function(messageDetails){
        console.log(messageDetails)
        var time = new Date();
        time = time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true });
        io.to('Default').emit('INCOMING_MESSAGE', {
            message: messageDetails.message,
            username: messageDetails.username,
            timestamp: time,
            userIconId: messageDetails.userIconId
        });
    })

    // Disconnection
    socket.on('disconnect', function(){
        console.log('user disconnected')
    })
})
