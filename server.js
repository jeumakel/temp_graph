var app = require('express')(),
	server = require('http').createServer(app),
  	io = require('socket.io')(server),
  	sys = require('util'),
  	exec = require('child_process').exec,
	mongoskin = require('mongoskin'),
  	db = mongoskin.db('mongodb://127.0.0.1:27017/temp_db'),
	child;

// If all goes well when you open the browser, load the index.html file
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/www/index.html');
});
 
// When we open the browser establish a connection to socket.io. 
// Every 5 seconds to send the graph a new value.i

io.sockets.on('connection', function(socket) {
	console.log('Client connected ' +  socket);
  	socket.on('cpuTempQuery', function(data) {
    		child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
    			if (error !== null) {
      				console.log('exec error: ' + error);
    			} else {
      				// You must send time (X axis) and a temperature value (Y axis) 
      				var date = new Date().getTime();
      				var temp = parseFloat(stdout)/1000;
      				socket.emit('cpuTemperatureUpdate', date, temp); 
    			}
  		});
	}, 5000);
	socket.on('sensorTempQuery', function (data) {
		var collection
		try {
			collection = db.collection('temperatures');
		} catch (e) {
			console.log('DB error connect: ' + e);
		}

		var result = collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray(function (e, results) {
			if (e) {
				console.log('Socket DB error: ' + e);
			} else {
				console.log(results);
			}
			socket.emit('sensorTemperatureUpdate', results);

		});
	});
});

function testDatabase () {
	var collection;
	try {
		collection = db.collection('temperatures');
		collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray(function (e, results) {
			if (e) {
				console.log('Socket DB error: ' + e);
			} else {
				console.log(results);
			}
		});
	} catch (e) {
		console.log('DB error connection:' + e);
	}
}

server.listen(8000);
testDatabase();
