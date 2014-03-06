//https://github.com/LearnBoost/socket.io/wiki/Exposed-events

var http		= require('http');
var fs			= require('fs');
var path		= require('path');
var common = require('./common.js');
var Board = common.Board;
var Player = common.Player;

var server = http.createServer(function(req, res) {
	var filename = path.basename(req.url) || "index.html";
	fs.readFile('./' + filename, 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});

var Id = function () {
	this.id = 0;

	this.next = function () {
		return this.id++;
	}
}

var id = new Id();

function newPlayer(pseudo, x, y, color) {
	return new Player(id.next(), pseudo, x, y, color, 0);
}

function generateBoard(width, height) {
	var board = new Board(width, height);
	board.tiles = [
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
	];
	return board;
}

var players = [
	newPlayer("cactus", 2, 4, "#ff0000"),
	newPlayer("david", 3, 2, "#0000ff"),
	newPlayer("sarah", 5, 5, "ff00ff")
]
var board = generateBoard(10, 10);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log('New connection');
	var player = null;

	socket.emit('initGame', {
		'board': board,
		'players': players
	});
	
	socket.on('keypress', function (data) {
		console.log(data);
	});
	socket.on('joinParty', function (pseudo) {
		console.log(pseudo + ' join the party');
		player = newPlayer(pseudo, 1, 1, "#ff7700");
		socket.broadcast.emit('newPlayer', player);
		socket.emit('youJoin', player);
	});
	socket.on('disconnect', function () {
		console.log('End connection');
	});
});

server.listen(8000);

