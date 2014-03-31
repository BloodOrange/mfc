//https://github.com/LearnBoost/socket.io/wiki/Exposed-events

var http		= require('http');
var fs			= require('fs');
var path		= require('path');
var common = require('../public/js/common');
var Board = common.Board;
var Egg = common.Egg;

var nbPlayerMax = 5;
var nbEggsMax = 1000;

var mime = {
	"html":"text/html",
	"css" : "text/css",
	"gif" : "image/gif",
	"jpg" : "image/jpg",
	"jpeg": "image/jpeg",
	"js" : "application/javascript",
	"ttf" : "font/ttf",
	"png" : "image/png"
}

var server = http.createServer(function(req, res) {
	var filename = null;
	if (req.url == '/')
		filename = "/index.html";
	else
		filename = req.url;
	
	var ext=(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;

	console.log('../public' + filename);
	
	fs.readFile('../public' + filename, 'UTF-8', function(error, content) {
		res.writeHead(200, {"Content-Type": mime[ext]});
		if (ext=='png'){
			var img = fs.readFileSync('../public'+filename);
			res.end(img,'binary');
		}
		else{
			res.end(content);
		}
	});
})
var board1=[
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0,1],
		[1, 0, 2, 2, 2, 2, 2, 2, 2, 0,1],
		[1, 0, 2, 1, 2, 1, 2, 1, 2, 0,1],
		[1, 0, 2, 1, 2, 1, 2, 1, 2, 0,1],
		[1, 0, 2, 0, 0, 0, 0, 0, 2, 0,1],
		[1, 0, 2, 1, 2, 1, 2, 1, 2, 0,1],
 		[1, 0, 2, 1, 2, 1, 2, 1, 2, 0,1],
 		[1, 0, 2, 2, 2, 2, 2, 2, 2, 0,1],
 		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0,1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1]
	];
	var board2=[
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0,1],
		[1, 0, 2, 2, 2, 2, 2, 2, 2 ,0,1],
		[1, 0, 1, 2, 2, 2, 2, 2, 1, 0,1],
		[1, 0, 1, 1, 2, 2, 2, 1, 1, 0,1],
		[1, 0, 1, 1, 1, 2, 1, 1, 1, 0,1],
 		[1, 0, 1, 1, 2, 2, 2, 1, 1, 0,1],
 		[1, 0, 1, 2, 2, 2, 2, 2, 1, 0,1],
 		[1, 0, 2, 2, 2, 2, 2, 2, 2, 0,1],
 		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0,1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1]
	];
	var boards=[
		board1,
		board2
	]
var colors = [
	"#D84437",
	"#0F9D58",
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

var images = [
	"pouletOrange.png",
	"pouletVert.png",
	"pouletBleuFonce.png",
	"pouletJaune.png",
	"pouletRose.png"
]

var players = new Array();
var eggs = new Array();

var Id = function (start, max, list) {
	this.start = start;
	this.max = max;
	this.id = start;
	this.list = list;

	this.next = function () {
		if (this.id >= this.max)
			this.id = this.start;
		var begin = this.id;
		while (list[this.id] != undefined) {
			this.id++;
			if (this.id >= this.max)
				this.id = this.start;
			if (this.id == begin) {
				return -1;
			}
		} 
		return this.id++;
	}
}

var idPlayer = new Id(0, nbPlayerMax, players);
var idEgg = new Id(0, nbEggsMax, eggs);

function BoardEggs(width, height) {
	common.Board.call(width, height);
}
BoardEggs.prototype = new common.Board();

BoardEggs.prototype.resize = function (width, height) {
	this.tiles = new Array();
	for (var y = 0; y < height; y++) {
		this.tiles[y] = new Array();
		for (var x = 0; x < width; x++) {
			this.tiles[y][x] = null;
		}
	}
	this.width = width;
	this.height = height;
}
BoardEggs.prototype.dropEgg = function (egg) {
	this.tiles[egg.y][egg.x] = egg;
}
BoardEggs.prototype.hasEgg = function (x, y) {
	return this.tiles[y][x] != null;
}
BoardEggs.prototype.removeEgg = function (egg) {
	this.tiles[egg.y][egg.x] = null;
}

var boardEggs = new BoardEggs(0, 0);

function Player(pseudo, x, y) {
	var id = idPlayer.next();
	this.lastActionTime = 0;
	common.Player.call(this, id, pseudo, x, y, colors[id], 0, 5, images[id]);
}
Player.prototype = new common.Player();

Player.prototype.move = function (socket, key) {
	if (Date.now() - this.lastActionTime < 70)
		return;
	
	var x = this.x;
	var y = this.y;
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
	this.lastActionTime = Date.now();
	this.x = x;
	this.y = y;
	var event = {
		'id': this.id,
		'x': this.x,
		'y': this.y
	};
	socket.emit('move-to', event);
	socket.broadcast.emit('move-to', event);
};

function newEgg(owner) {
	return new Egg(idEgg.next(), owner.x, owner.y, owner.id, 4);
}

function generateBoard(width, height) {
	var board = new Board(width, height);

	rand=Math.floor((Math.random()*2));
	console.log(rand);
	board.tiles = boards[rand];

	boardEggs.resize(width, height);
	return board;
}

function isWalkable(board, x, y) {
	return !board.tiles[y][x] && !boardEggs.hasEgg(x, y);
}

var board = generateBoard(11, 11);

function impactedByEgg(idEgg) {
	var egg = eggs[idEgg];
	var player = players[egg.owner];
	
	var dead = new Array();
	var wallBreaking = new Array();

	var wallRight = false;
	var wallLeft = false;
	var wallUp = false;
	var wallDown = false;

	var zone = new Array();
	for (var y = 0; y < board.height; y++) {
		zone[y] = new Array();
		
		for (var x = 0; x < board.width; x++) {
			zone[y][x] = -1;
		}
	}

	for (var i = 0; i < egg.power; i++) {
		if (!wallRight) {
			if (board.tiles[egg.y][egg.x + i]) {
				wallRight = true;
				if (board.tiles[egg.y][egg.x + i] == 2) {
					board.tiles[egg.y][egg.x + i] = 0;
					wallBreaking.push([egg.y, egg.x + i]);

					zone[egg.y][egg.x + i] = 5;
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x + i && players[index].y == egg.y) {
						if (dead.indexOf(players[i]) == -1) {
							dead.push(players[index]);
							if (player && index != player.id)
								player.score += 10;
						}
					}
				}

				if (i == 0) {
					zone[egg.y][egg.x] = 0;
				} else if (i == egg.power - 1) {
					zone[egg.y][egg.x + i] = 5;
				} else {
					zone[egg.y][egg.x + i] = 2;
				}
			}
		}
		if (!wallLeft) {
			if (board.tiles[egg.y][egg.x - i]) {
				wallLeft = true;
				if (board.tiles[egg.y][egg.x - i] == 2) {
					board.tiles[egg.y][egg.x - i] = 0;
					wallBreaking.push([egg.y, egg.x - i]);

					zone[egg.y][egg.x - i] = 6;
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x - i && players[index].y == egg.y) {
						if (dead.indexOf(players[i]) == -1)	{
							dead.push(players[index]);
							if (player && index != player.id)
								player.score += 10;
						}
					}
				}

				if (i == 0) {
					zone[egg.y][egg.x] = 0;
				} else if (i == egg.power - 1) {
					zone[egg.y][egg.x - i] = 6;
				} else {
					zone[egg.y][egg.x - i] = 2;
				}
			}
		}
		if (!wallUp) {
			if (board.tiles[egg.y - i][egg.x]) {
				wallUp = true;
				if (board.tiles[egg.y -i][egg.x] == 2) {
					board.tiles[egg.y -i][egg.x] = 0;
					wallBreaking.push([egg.y - i, egg.x]);

					zone[egg.y - i][egg.x] = 4;
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x && players[index].y == egg.y - i) {
						if (dead.indexOf(players[i]) == -1)	{
							dead.push(players[index]);
							if (player && index != player.id)
								player.score += 10;
						}
					}
				}

				if (i == 0) {
					zone[egg.y][egg.x] = 0;
				} else if (i == egg.power - 1) {
					zone[egg.y - i][egg.x] = 4;
				} else {
					zone[egg.y - i][egg.x] = 1;
				}
			}
		}
		if (!wallDown) {
			if (board.tiles[egg.y + i][egg.x]) {
				wallDown = true;
				if (board.tiles[egg.y + i][egg.x] == 2) {
					board.tiles[egg.y + i][egg.x] = 0;
					wallBreaking.push([egg.y + i, egg.x]);

					zone[egg.y + i][egg.x] = 3;
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x && players[index].y == egg.y + i) {
						if (dead.indexOf(players[i]) == -1)	{
							dead.push(players[index]);
							if (player && index != player.id)
								player.score += 10;
						}
					}
				}

				if (i == 0) {
					zone[egg.y][egg.x] = 0;
				} else if (i == egg.power - 1) {
					zone[egg.y + i][egg.x] = 3;
				} else {
					zone[egg.y + i][egg.x] = 1;
				}
			}
		}
	}
	
	return {"dead": dead, "wall": wallBreaking, "zone": zone};
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
			player.move(socket, key);
			break;
		case 32: // Space
			var egg = newEgg(player);
			if (boardEggs.hasEgg(egg.x, egg.y))
				break;
			boardEggs.dropEgg(egg);
			eggs[egg.id] = egg;
			// use clearInterval(explosedTimer) to desarm timer
			var explosedTimer = setTimeout(function () {
				var data = impactedByEgg(egg.id);
				var deadPlayers = data["dead"];
				var walls = data["wall"];

				boardEggs.removeEgg(egg);
				var message = {"id": egg.id, "zone": data["zone"]};
				socket.broadcast.emit('eggExplosed', message);
				socket.emit('eggExplosed', message);

				deadPlayers.forEach(function (dead) {
					dead.life -= 1
					if (dead.life > 0) {
						var message = {
							"id": dead.id,
							"life": dead.life
						}
						socket.emit("lostLife", message);
						socket.broadcast.emit("lostLife", message);
					} else {
						socket.emit("dead", dead.id);
						socket.broadcast.emit("dead", dead.id);

						delete players[dead.id];
						if (dead.id == player.id) {
							delete player;
						}
					}
				});
				walls.forEach(function (wall) {
					socket.emit("breakWall", {"position": wall});
					socket.broadcast.emit("breakWall", {"position": wall});
				})
				message = {"id": player.id, "score": player.score};
				console.log(message);
				socket.broadcast.emit("changeScore", message);
				socket.emit("changeScore", message);
				delete eggs[egg.id];
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
		player = new Player(pseudo, 1, 1, "#ff7700");
		if (player.id != -1) {
			console.log(pseudo + ' join the party');
			players[player.id] = player;
			socket.broadcast.emit('newPlayer', player);
			socket.emit('youJoin', player);
		} else {
			socket.emit('full', null);
		}
	});
	socket.on('message', function (content) {
		socket.emit('message', content);
		socket.broadcast.emit('message', content);
	});
	socket.on('disconnect', function () {
		if (player != null) {
			// Supprimer player des oeufs
			delete players[player.id];
			socket.broadcast.emit('removePlayer', player.id);
			player = null;
		}
		console.log('End connection');
	});
});

server.listen(8000);

