var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
  	io = require('socket.io')(server),
  	sys = require('util'),
  	exec = require('child_process').exec,
	mongoskin = require('mongoskin'),
  	db = mongoskin.db('mongodb://127.0.0.1:27017/temp_db'),
	child;
const port = process.env.PORT || 8000;

app.use(express.static('www'))
// If all goes well when you open the browser, load the index.html file
app.get('/', function (req, res) {
	res.sendFile(__dirname + 'index.html');
});
 
// When we open the browser establish a connection to socket.io. 
// Every 5 seconds to send the graph a new value.i

io.sockets.on('connection', function(socket) {
	console.log('Client connected ' +  JSON.stringify(socket.handshake));
  	socket.on('cpuTempQuery', function(data) {
		setTimeout(function () {
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
		}, 1000 * 60 * 5 );
	});
	socket.on('sensorTempQuery', function (data) {
		setTimeout(function () {
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
//					console.log(results);
				}
				socket.emit('sensorTemperatureUpdate', results);
			});
		}, 1000 * 60 * 5);
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
				console.log('DB connection OK');
//				console.log(results);
			}
		});
	} catch (e) {
		console.log('DB error connection:' + e);
	}
}

process.stdin.resume();

function handleExit(options, code) {
	if (options.cleanup) {
		console.log('cleaned');
	}
	if (code || code === 0) {
		console.log(code);
	}
	if (options.exit) {
		process.exit();
	}
}

//App closing
process.on('exit', handleExit.bind(null, {cleanup: true}));
//Ctrl+c
process.on('SIGINT', handleExit.bind(null, {exit: true}));
//Catch kill pid
process.on('SIGUSR1', handleExit.bind(null, {exit: true}));
process.on('SIGUSR2', handleExit.bind(null, {exit: true}));
//Exception
process.on('uncaughtException', handleExit.bind(null, {exit: true}));

console.log('Starting server on port %s', port)
server.listen(port);
console.log('Testing DB connection');
testDatabase();
