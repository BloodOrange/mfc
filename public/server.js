//https://github.com/LearnBoost/socket.io/wiki/Exposed-events

var http		= require('http');
var fs			= require('fs');
var path		= require('path');
var common = require('./common');
var Board = common.Board;
var Player = common.Player;

var nbPlayer = 10;

var server = http.createServer(function(req, res) {
	var filename = path.basename(req.url) || "index.html";
	fs.readFile('./' + filename, 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});

var colors = [
	"#ff0000",
	"#00ff00",
	"#0000ff",
	"#ff7700",
	"#ff0077",
	"#77ff00",
	"#7700ff",
	"#00ff77",
	"#0077ff",
	"#ff7777",
	"#77ff77",
	"#7777ff"
]

var Id = function () {
	this.id = 0;

	this.next = function () {
		return this.id++;
	}
}

var id = new Id();

function newPlayer(pseudo, x, y) {
	var i = id.next();
	return new Player(i, pseudo, x, y, colors[i], 0);
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

function isWalkable(board, x, y) {
	return !board.tiles[y][x];
}

var players = [
	newPlayer("cactus", 2, 4),
	newPlayer("david", 3, 2),
	newPlayer("sarah", 5, 5)
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
	
	socket.on('keypress', function (key) {
		if (player == null) return;
		
		var x = player.x;
		var y = player.y;
		switch (key) {
		case 39: // Right
			x++;
			break;
		case 37: // Left
			x--;
			break;
		case 38: // Up
			y--;
			break;
		case 40: // Down
			y++;
			break;
		default:
			console.log("Key unknown: " + key);
			return;
		}
		if (!isWalkable(board, x, y)) return;
		player.x = x;
		player.y = y;
		var event = {
			'id': player.id,
			'x': player.x,
			'y': player.y
		};
		socket.emit('move-to', event);
		socket.broadcast.emit('move-to', event);
	});
	socket.on('joinParty', function (pseudo) {
		console.log(pseudo + ' join the party');
		player = newPlayer(pseudo, 1, 1, "#ff7700");
		players.push(player);
		socket.broadcast.emit('newPlayer', player);
		socket.emit('youJoin', player);
	});
	socket.on('disconnect', function () {
		console.log('End connection');
	});
});

server.listen(8080);

