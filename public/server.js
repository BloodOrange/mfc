//https://github.com/LearnBoost/socket.io/wiki/Exposed-events

var http		= require('http');
var fs			= require('fs');
var path		= require('path');

var server = http.createServer(function(req, res) {
	var filename = path.basename(req.url) || "index.html";
	fs.readFile('./' + filename, 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});

var gameState = {
	'board': {
		'width': 10,
		'height': 10,
		'tiles': [
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 0, 1, 1, 1, 1, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 				[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		]
	},

	'players': [
		{
			'id'		: 0,
			'pseudo'	: 'cactus',
			'color'		: "#ff0000",
			'x'			: 2,
			'y'			: 4,
			'score'		: 0
		},
		{
			'id'		: 1,
			'pseudo'	: 'personne',
			'color'		: "#00ff00",
			'x'			: 5,
			'y'			: 8,
			'score'		: 18
		},
		{
			'id'		: 2,
			'pseudo'	: 'nico',
			'color'		: "#0000ff",
			'x'			: 7,
			'y'			: 3,
			'score'		: 13
		},
		
	]
}

var nextId = 0;
var colors

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log('New connection');
	var player = null;
	
	gameState.players.forEach(function (player) {
		player.id = nextId++;
	});
	socket.emit('initGame', gameState);
	
	socket.on('msg', function (msg) {
		console.log(msg.toto);
	});
	socket.on('anything', function (data) {
		console.log('Message received');
		console.log(data);
	});
	socket.on('keypress', function (data) {
		console.log(data);
	});
	socket.on('joinParty', function (pseudo) {
		console.log(pseudo + ' join the party');
		player = {
			'id': nextId++,
			'pseudo': pseudo,
			'color': "#ff7700",
			'x': 1,
			'y': 1,
			'score': 23
		};
		socket.broadcast.emit('newPlayer', player);
		socket.emit('youJoin', player);
	});
	socket.on('disconnect', function () {
		console.log('End connection');
	});
});

server.listen(8000);

