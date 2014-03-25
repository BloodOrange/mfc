//https://github.com/LearnBoost/socket.io/wiki/Exposed-events

var http		= require('http');
var fs			= require('fs');
var path		= require('path');
var common = require('./common');
var Board = common.Board;
var Egg = common.Egg;

var nbPlayerMax = 10;
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
	var filename = path.basename(req.url) || "index.html" ;

	var ext=(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;


	fs.readFile('./' + filename, 'UTF-8', function(error, content) {
		res.writeHead(200, {"Content-Type": mime[ext]});
		if (ext=='png'){
			var img = fs.readFileSync('./'+filename);
			res.end(img,'binary');
		}
		else{
			res.end(content);
		}
	});
})

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

var idPlayer = new Id(0, nbPlayerMax, players);
var idEgg = new Id(0, nbEggsMax, eggs);

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

	return new Egg(idEgg.next(), owner.x, owner.y, owner.id, 2, "oeuf.png");

}

function generateBoard(width, height, img) {
	var board = new Board(width, height, img);
	board.tiles = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 2, 1, 2, 1, 0, 1, 0, 1],
		[1, 0, 2, 0, 2, 0, 0, 0, 0, 1],
		[1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
 		[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	];
	return board;
}

function isWalkable(board, x, y) {
	return !board.tiles[y][x];
}

var board = generateBoard(11, 11, "mur.png");

function impactedByEgg(idEgg) {
	var egg = eggs[idEgg];
	var player = players[egg.owner];
	
	var dead = new Array();
	var wallBreaking = new Array();

	var wallRight = false;
	var wallLeft = false;
	var wallUp = false;
	var wallDown = false;

	for (var i = 0; i < egg.power; i++) {
		if (!wallRight) {
			if (board.tiles[egg.y][egg.x + i]) {
				wallRight = true;
				if (board.tiles[egg.y][egg.x + i] == 2) {
					board.tiles[egg.y][egg.x + i] = 0;
					wallBreaking.push([egg.y, egg.x + i]);
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x + i && players[index].y == egg.y) {
						if (dead.indexOf(players[i]) == -1) {
							dead.push(players[index]);
							if (index != player.id)
								player.score += 10;
						}
					}
				}
			}
		}
		if (!wallLeft) {
			if (board.tiles[egg.y][egg.x - i]) {
				wallLeft = true;
				if (board.tiles[egg.y][egg.x - i] == 2) {
					board.tiles[egg.y][egg.x - i] = 0;
					wallBreaking.push([egg.y, egg.x - i]);
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x - i && players[index].y == egg.y) {
						if (dead.indexOf(players[i]) == -1)	{
							dead.push(players[index]);
							if (index != player.id)
								player.score += 10;
						}
					}
				}
			}
		}
		if (!wallUp) {
			if (board.tiles[egg.y - i][egg.x]) {
				wallUp = true;
				if (board.tiles[egg.y -i][egg.x] == 2) {
					board.tiles[egg.y -i][egg.x] = 0;
					wallBreaking.push([egg.y - i, egg.x]);
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x && players[index].y == egg.y - i) {
						if (dead.indexOf(players[i]) == -1)	{
							dead.push(players[index]);
							if (index != player.id)
								player.score += 10;
						}
					}
				}
			}
		}
		if (!wallDown) {
			if (board.tiles[egg.y + i][egg.x]) {
				wallDown = true;
				if (board.tiles[egg.y + i][egg.x] == 2) {
					board.tiles[egg.y + i][egg.x] = 0;
					wallBreaking.push([egg.y + i, egg.x]);
				}
			} else {
				for (index in players) {
					if (players[index].x == egg.x && players[index].y == egg.y + i) {
						if (dead.indexOf(players[i]) == -1)	{
							dead.push(players[index]);
							if (index != player.id)
								player.score += 10;
						}
					}
				}
			}
		}
	}
	
	return {"dead": dead, "wall": wallBreaking};
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
			eggs[egg.id] = egg;
			// use clearInterval(explosedTimer) to desarm timer
			var explosedTimer = setTimeout(function () {
				var data = impactedByEgg(egg.id);
				var deadPlayers = data["dead"];
				var walls = data["wall"];
				socket.broadcast.emit('eggExplosed', egg.id);
				socket.emit('eggExplosed', egg.id);

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
					}
				});
				walls.forEach(function (wall) {
					socket.emit("breakWall", {"position": wall});
					socket.broadcast.emit("breakWall", {"position": wall});
				})
				var message = {"id": player.id, "score": player.score};
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
		console.log(pseudo + ' join the party');
		player = new Player(pseudo, 1, 1, "#ff7700");
		players.push(player);
		socket.broadcast.emit('newPlayer', player);
		socket.emit('youJoin', player);
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

