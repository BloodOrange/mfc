//https://github.com/LearnBoost/socket.io/wiki/Exposed-events

var http		= require('http');
var fs			= require('fs');
var path		= require('path');
var common = require('./common');
var Board = common.Board;
var Player = common.Player;
var Egg = common.Egg;

var nbPlayerMax = 10;
var nbEggsMax = 1000;

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

var players = new Array();
var eggs = new Array();

var Id = function (start, max, list) {
	this.start = start;
	this.max = max;
	this.id = start;
	this.list = list;

	this.next = function () {
		if (this.id > this.max)
			this.id = this.start;
		while (list[this.id] != undefined) {
			this.id++;
			if (this.id > this.max)
				this.id = this.start;
		} 
		return this.id++;
	}
}

var idPlayer = new Id(0, 100, players);
var idEgg = new Id(0, 100, eggs);

function newPlayer(pseudo, x, y) {
	var i = idPlayer.next();
	return new Player(i, pseudo, x, y, colors[i], 0);
}

function newEgg(owner) {
	return new Egg(idEgg.next(), owner.x, owner.y, owner.id, 2);
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

var board = generateBoard(10, 10);

function impactedByEgg(idEgg) {
	var egg = eggs[idEgg];

	var dead = new Array();

	var wallRight = false;
	var wallLeft = false;
	var wallUp = false;
	var wallDown = false;

	for (var i = 0; i < egg.power; i++) {
		if (!wallRight) {
			if (board.tiles[egg.y][egg.x + i]) {
				wallRight = true;
			} else {
				for (index in players) {
					if (players[index].x == egg.x + i && players[index].y == egg.y) {
						dead.push(players[index]);
					}
				}
			}
		}
		if (!wallLeft) {
			if (board.tiles[egg.y][egg.x - i]) {
				wallLeft = true;
			} else {
				for (index in players) {
					if (players[index].x == egg.x - i && players[index].y == egg.y) {
						dead.push(players[index]);
					}
				}
			}
		}
		if (!wallUp) {
			if (board.tiles[egg.y - i][egg.x]) {
				wallUp = true;
			} else {
				for (index in players) {
					if (players[index].x == egg.x && players[index].y == egg.y - i) {
						dead.push(players[index]);
					}
				}
			}
		}
		if (!wallDown) {
			if (board.tiles[egg.y + i][egg.x]) {
				wallDown = true;
			} else {
				for (index in players) {
					if (players[index].x == egg.x && players[index].y == egg.y + i) {
						dead.push(players[index]);
					}
				}
			}
		}
	}
	
	return dead;
}

function movePlayer(socket, player, key) {
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
}

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log('New connection');
	var player = null;

	socket.emit('initGame', {
		'board': board,
		'players': players,
		'eggs': eggs
	});
	
	socket.on('keypress', function (key) {
		if (player == null) return;
		
		switch (key) {
		case 39: // Right
		case 37: // Left
		case 38: // Up
		case 40: // Down
			movePlayer(socket, player, key);
			break;
		case 32: // Space
			var egg = newEgg(player);
			eggs[egg.id] = egg;
			// use clearInterval(explosedTimer) to desarm timer
			var explosedTimer = setTimeout(function () {
				var deadPlayers = impactedByEgg(egg.id);
				deadPlayers.forEach(function (dead) {
					console.log(dead.pseudo + " is dead!");
				});
				delete eggs[egg.id];
				socket.emit('eggExplosed', egg.id);
			}, 2000);

			socket.broadcast.emit('newEgg', egg);
			socket.emit('newEgg', egg);
			break;
		default:
			console.log("Key unknown: " + key);
			return;
		}
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

server.listen(8000);

