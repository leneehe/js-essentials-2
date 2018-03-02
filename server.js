// setup basic express server
var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

// this is how we tell our web server where to find the files to serve
app.use(express.static('client'));

var io = require('socket.io')(server);

function getWeather(callback) {
  var request = require('request');
  request.get("https://www.metaweather.com/api/location/4118/", function (error, response) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(response.body);
      callback(data.consolidated_weather[0].the_temp, data.consolidated_weather[0].weather_state_name);
    }
  })
}

io.on('connection', function (socket) {

  socket.on('message', function (msg) {
    console.log('Received Message: ', msg);
    // Detect questions using regular expressions
    if (msg.match(/\?$/)) { // checks for question mark at the end '?'
    console.log ('It is asking a QUESTION')
      if (msg.match(/time/)) { // checks for keyword 'time' in the message
        console.log('It is a QUESTION about time!!');
        io.emit('message', "Time is "+ (new Date));
        msg = "Courtesy of your Chat bot"
      } else if (msg.match(/weather/i)) { //checks for 'weather' in message
      console.log('It is a question about weather!!');
        getWeather(function(the_temp, state) {
        io.emit('message', `Temperature today is ${the_temp} C with ${state}!`)
      })

     }
  }
    io.emit('message', msg);
  });
});

server.listen(8080, function() {
  console.log('Chat server running');
});
