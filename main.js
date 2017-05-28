var geolib = require('geolib/dist/geolib');
var fileSystem = require('fs')

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

createPolygon("./boundaries/etobicoke.geojson")

app.get('/', function(req, res){
  res.sendFile(__dirname + '/main.html')
})

io.on('connection', function(socket){
  socket.join('Test room')
  console.log('a user connected')

  socket.on('chat message', function(msg){
    console.log('message ' + msg)
    io.to('Test room').emit('chat message', msg)
  })

  socket.on('disconnect', function(){
    console.log('user disconnected')
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000')
})

function createPolygon(file) {
  fileSystem.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }

    var parsedData = JSON.parse(data)

    var polygon = []

    for (let coordinate of parsedData.features[0].geometry.coordinates[0]){
        var tempLat = coordinate[0]
        coordinate[0] = coordinate[1]
        coordinate[1] = tempLat

        polygon.push({"latitude": coordinate[0], "longitude": coordinate[1]})
    }

    var isInside = geolib.isPointInside({"latitude": 43.614612, "longitude": -79.567578}, polygon)
  })
}
