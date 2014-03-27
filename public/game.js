ws = null;
board = null;
graphic = null;
players = new Array();
eggs = new Array();
myplayer = null;
boardExplosed = null;

var host = window.location.href;

function BoardExplosed(width, height) {
	this.eggExplosed = [
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image()
	];

	var eggExplosedSrc = [
		"egg-cross.png",
		"egg-vertical.png",
		"egg-horizontal.png",
		"egg-down.png",
		"egg-up.png",
		"egg-right.png",
		"egg-left.png"
	];

	for (var i = 0; i < this.eggExplosed.length; i++) {
		this.eggExplosed[i].src = host + eggExplosedSrc[i];
	}

	common.Board.call(this, width, height);
	this.changeSize(width, height);
}
BoardExplosed.prototype = new common.Board();

BoardExplosed.prototype.changeSize = function (width, height) {
	this.tiles = new Array();
	for (var y = 0; y < height; y++) {
		this.tiles[y] = new Array();

		for (var x = 0; x < width; x++) {
			this.tiles[y][x] = [-1, 0]; // [imageIndex, last (nb of 16ms)]
		}
	}
	this.width = width;
	this.height = height;
}

BoardExplosed.prototype.addExplosedZone = function (zone) {
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			if (zone[y][x] != -1) {
				this.tiles[y][x] = [zone[y][x], 20];
			}
		}
	}
}

BoardExplosed.prototype.draw = function (graph) {
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			var egg = this.tiles[y][x];
			if (egg[0] != -1 && egg[1] > 0) {
				var alpha = parseFloat(egg[1]) / 20.;
				graph.context.globalAlpha = alpha;
				graph.context.drawImage(this.eggExplosed[egg[0]],
										x * 64, y * 64);
		
				graph.context.stroke();
				graph.context.fill();

				egg[1]--;
				if (egg[1] == 0) {
					egg[0] = -1;
				}
			}
		}
	}
	graph.context.globalAlpha = 1;
}

function Board(width, height, imgMurSrc,imgMurCassableSrc) {
	this.width=width;
	this.height=height;
	this.img=new Image();
	this.imgCassable=new Image();
	var imgMurSrc=host +  imgMurSrc;
	var imgMurCassableSrc=host + imgMurCassableSrc;
	this.img.src=imgMurSrc;
	console.log(this.img);
	this.imgCassable.src=imgMurCassableSrc;
	common.Board.call(this, width, height, imgMurSrc,imgMurCassableSrc);
}
Board.prototype = new common.Board();

Board.prototype.draw = function (graph) {

	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			if (this.tiles[y][x] == 1) {
				graph.context.drawImage(this.img, parseInt(x)*64, parseInt(y)* 64);
		
				graph.context.stroke();
				graph.context.fill();
				
			} else if (this.tiles[y][x] == 2) {
				graph.context.drawImage(this.imgCassable, parseInt(x)*64, parseInt(y)* 64);
		
				graph.context.stroke();
				graph.context.fill();
				
			} else {
				graph.context.fillStyle = "olivedrab";
				graph.context.fillRect(x * 64, y * 64, 64, 64);
			}
			
		}
		
	}
}

function Player (id, pseudo, x, y, color, score, life, imgSrc) {
	this.realX = x;
	this.realY = y;

	this.state = 0; // 0 - WAITING; 1 - WALKING
	this.speed = 10;
	this.img = new Image();
	var imgSrc = host + imgSrc;
	this.img.src = imgSrc;

	common.Player.call(this, id, pseudo, x, y, color, score, life, imgSrc);
}
Player.prototype = new common.Player();

Player.prototype.moveto = function (x, y) {
	this.x = x;
	this.y = y;
	this.state = 1;
}

Player.prototype.draw = function (graph) {
	graph.context.drawImage(this.img, parseInt(this.realX) - 32, parseInt(this.realY) - 32);
		
	graph.context.stroke();
	graph.context.fill();
}

Player.prototype.showInfo = function (order) {
	var playerNode = document.getElementById("player" + this.id);
	if (playerNode == undefined) {
		playerNode = document.createElement("div");
		playerNode.setAttribute("id", "player" + this.id);
		playerNode.setAttribute("class", "player");
	} else {
		playerNode.innerHTML = "";
	}
	
	if (myplayer && myplayer.id == this.id) {
		playerNode.setAttribute("class", "myplayer player");
	}
	//playerNode.style.backgroundImage = "linear-gradient(to right, " + this.color +
	//" 0%, white 20%, white 100%)";

	var orderNode = document.createElement("div");
	orderNode.setAttribute("class", "playerOrder");
	orderNode.innerHTML = order;
	orderNode.style.borderColor = this.color;
	playerNode.appendChild(orderNode);
	
	var nameNode = document.createElement("div");
	nameNode.setAttribute("class", "playerName");
	nameNode.innerHTML = this.pseudo;
	playerNode.appendChild(nameNode);
	
	var lifeNode = document.createElement("div");
	lifeNode.setAttribute("class", "playerLife");
	lifeNode.innerHTML = "" + this.life;
	playerNode.appendChild(lifeNode);

	var scoreNode = document.createElement("div");
	scoreNode.setAttribute("class", "playerScore");
	scoreNode.innerHTML = "" + this.score;
	playerNode.appendChild(scoreNode);

	return playerNode;
}

Player.prototype.update = function () {
	if (this.state == 1) {
		var directionx = this.x - this.realX;
		var directiony = this.y - this.realY;

		if (directionx == 0 && directiony == 0) {
			this.state = 0;
			return;
		}
		
		var speedx = directionx;
		if (directionx < 0) {
			speedx = -directionx;
			directionx = -1;
		} else {
			directionx = 1;
		}

		var speedy = directiony;
		if (directiony < 0) {
			speedy = -directiony;
			directiony = -1;
		} else {
			directiony = 1;
		}
		
		if (speedx > this.speed) {
			speedx = this.speed;
		}
		if (speedy > this.speed) {
			speedy = this.speed;
		}

		this.realX += speedx * directionx;
		this.realY += speedy * directiony;
	}
}

var Graphic = function (canvasName) {
	this.canvas = document.getElementById(canvasName);
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.context = this.canvas.getContext("2d");

	this.erase = function () {
	console.log("dernier ok");
		this.context.fillStyle = "olivedrab";
		this.context.fillRect(0, 0, this.width, this.height);
	}
}

function Egg(id, x, y, owner, power) {
	this.img = new Image();
	var imgSrc = host + "egg.png";
	this.img.src = imgSrc;
	
	common.Egg.call(this, id, x, y, owner, power);
}
Egg.prototype = new common.Egg();

Egg.prototype.draw = function (graph) {
	graph.context.drawImage(this.img, parseInt(this.x) - 32, parseInt(this.y) - 32);
		
	graph.context.stroke();
	graph.context.fill();
}

function refreshBoard() {
	board.draw(graphic);
	players.forEach(function (player) {
		if (player != undefined)
			player.draw(graphic);
	});
	boardExplosed.draw(graphic);
	eggs.forEach(function (egg) {
		if (egg != undefined)
			egg.draw(graphic);
	})
}

function sortPlayersByScore() {
	var sortedPlayer = new Array();

	for (var i = 0; i < players.length; i++) {
		if (players[i] != undefined) {
			sortedPlayer.push(players[i]);
		}
	}

	sortedPlayer.sort(function (a, b) {
		if (a.score > b.score)
			return -1;
		else if (a.score < b.score)
			return 1;
		else
			return 0;
	});
	return sortedPlayer;
}

function toggleInfo(connected) {
	var overlay = document.getElementById("boardOverlay");
	var joinButton = document.getElementById("joinButton");
	var join = document.getElementById("join");

	if (connected) {
		overlay.style.display = "none";
		join.style.display = "block";
		joinButton.disabled = false;
	} else {
		overlay.style.display = "block";
		join.style.display = "none";
		joinButton.display = true;
	}
}

function addPlayerOnListView(pos, player) {
	var listPlayers = document.getElementById("listPlayers");
	if (player != undefined)
		listPlayers.appendChild(player.showInfo(pos));
}

function clearPlayerListView() {
	var listPlayers = document.getElementById("listPlayers");
	var head = document.createElement("div");
	head.setAttribute("id", "headPlayer");
	var headOrder = document.createElement("div");
	headOrder.setAttribute("id", "headOrder");
	head.appendChild(headOrder);
	var headName = document.createElement("div");
	headName.setAttribute("id", "headName");
	headName.innerHTML = "Pseudo";
	head.appendChild(headName);
	var headLife = document.createElement("div");
	headLife.setAttribute("id", "headLife");
	headLife.innerHTML = "Vie";
	head.appendChild(headLife);
	var headScore = document.createElement("div");
	headScore.setAttribute("id", "headScore");
	headScore.innerHTML = "Score";
	head.appendChild(headScore);
	listPlayers.innerHTML = "";
	listPlayers.appendChild(head);
}

function updatePlayersListView() {
	clearPlayerListView();
	var sortedPlayer = sortPlayersByScore();
	for (var i = 0; i < sortedPlayer.length; i++) {
		if (sortedPlayer[i] != undefined)
			addPlayerOnListView(i + 1, sortedPlayer[i]);
	}
}

function addMessageChat(message) {
	var chat = document.getElementById("lines");
	var line = document.createElement("div");
	line.setAttribute("class", "line");
	chat.appendChild(line);
	line.innerHTML = message;
}

function update() {
	players.forEach(function (player) {
		player.update();
	})
}

function initGame(gameState) {
	if (gameState.board && gameState.board.tiles) {
		board.tiles = gameState.board.tiles;
		board.width = gameState.board.width;
		board.height = gameState.board.height;
		boardExplosed.changeSize(board.width, board.height);
		//board.draw(graphic);
	}
	console.log(board);
	if (gameState.players) {
		for (var i = 0; i < gameState.players.length; i++) {
			var newPlayer = gameState.players[i];
			if (newPlayer == undefined)
				continue;
			var player = new Player(newPlayer.id, newPlayer.pseudo,
									newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
									newPlayer.color, newPlayer.score, newPlayer.life, newPlayer.imgSrc);
			//player.draw(graphic);
			players[player.id] = player;
		}
	}
	if (gameState.eggs) {
		gameState.eggs.forEach(function (newEgg) {
			if (newEgg != undefined)
				eggs[newEgg.id] = new Egg(newEgg.id, newEgg.x * 64 + 32, newEgg.y * 64 + 32, newEgg.owner, newEgg.power);
		});
	}
	updatePlayersListView();
} 

function connectServer() {
	if (ws) return;

	ws = io.connect(host);
	ws.on('connect', function () {
		console.log("Socket opened");
		toggleInfo(true);
	});
	ws.on('disconnect', function () {
		console.log("Socket closed");
		toggleInfo(false);
		clearPlayerListView();
		players = new Array();
		ws = null;
	});
	ws.on('initGame', function (gameState) {
		console.log(gameState);
		initGame(gameState);
	});
	ws.on('breakWall', function (wall) {
		board.tiles[wall.position[0]][wall.position[1]] = 0;
	});
	ws.on('dead', function (playerid) {
		if (playerid == myplayer.id) {
			myplayer = null;
			var canvas = document.getElementById("boardCanvas");
			canvas.removeEventListener("keydown", keydown);
			var joinButton = document.getElementById("joinButton");
			var join = document.getElementById("join");

			joinButton.disabled = false;
			join.style.display = "block";
		}
		addMessageChat("<i><span style='color:" + players[playerid].color + "';>" + players[playerid].pseudo + "</span> est mort !</i>");
		
		delete players[playerid];
		updatePlayersListView();
	});
	ws.on('removePlayer', function (playerid) {
		addMessageChat("<i><span style='color:" + players[playerid].color + "';>" + players[playerid].pseudo + "</span> est parti !</i>");
		delete players[playerid];
		updatePlayersListView();
	});
	ws.on('changeScore', function(event) {
		console.log(event);
		var player = players[event["id"]];
		player.score = event["score"];
		player.showInfo(player.id + 1);
		updatePlayersListView();
	});
	ws.on('full', function (event) {
		console.log("Serveur full");
		alert("Le serveur est plein");
	});
	ws.on('newPlayer', function (newPlayer) {
		console.log("New player");
		//console.log(event.newPlayer);
		var player = new Player(newPlayer.id, newPlayer.pseudo,
								newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
								newPlayer.color, newPlayer.score, newPlayer.life,
								newPlayer.imgSrc);
		//player.draw(graphic);
		players[player.id] = player;
		//addPlayerOnListView(player);
		updatePlayersListView();
		addMessageChat("<i><span style='color:" + player.color + "';>" + player.pseudo + "</span> a rejoint la partie !</i>");
	});
	ws.on('move-to', function (event) {
		console.log(event);
		var player = players[event.id];
		player.moveto(event.x * 64 + 32, event.y * 64 + 32);
	});
	ws.on('lostLife', function (event) {
		console.log("Lostlife");
		console.log(event);
		var player = players[event["id"]];
		player.life = event["life"];
		player.showInfo(player.id + 1);
	});
	ws.on('message', function (content) {
		var message = content["message"];
		var player = players[content["id"]];
		addMessageChat("<b><span style='color:" + player.color + "';>" + player.pseudo + "</span> dit :</b> " + message);
	});
	ws.on('youJoin', function (newPlayer) {
		console.log('You join the game');
		console.log(newPlayer);
		var joinButton = document.getElementById("joinButton");
		var join = document.getElementById("join");

		joinButton.disabled = false;
		join.style.display = "none";

		myplayer = new Player(newPlayer.id, newPlayer.pseudo,
							  newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
							  newPlayer.color, newPlayer.score, newPlayer.life,
							 newPlayer.imgSrc);
		//myplayer.draw(graphic);
		players[myplayer.id] = myplayer;
		//addPlayerOnListView(myplayer);
		updatePlayersListView();

		addMessageChat("<i><span style='color:" + myplayer.color + "';>Vous</span> avez rejoint la partie !</i>");
		
		var canvas = document.getElementById("boardCanvas");
		canvas.tabIndex = 1000;
		canvas.addEventListener("keydown", keydown, false);
		canvas.focus();
	});
	ws.on('newEgg', function (newEgg) {
		console.log('Oh no, a bomb edd has dropped');
		console.log(newEgg);
		eggs[newEgg.id] = new Egg(newEgg.id, newEgg.x * 64 + 32, newEgg.y * 64 + 32, newEgg.owner, newEgg.power);
		//eggs[newEgg.id] = newEgg;
		//eggs[newEgg.id].draw(graphic);
	});
	ws.on('eggExplosed', function (event) {
		console.log('The egg ' + event["id"] + ' has explosed!');
		boardExplosed.addExplosedZone(event["zone"]);
		delete eggs[event["id"]];
	});
	ws.on('error', function (e) {
		console.log("Socket error: " + e);
		toggleInfo(false);
		clearPlayerListView();
		players = new Array();
		ws = null;
	});
}

function keydown(e) {
	switch (e.keyCode) {
	case 13:        // Return
		chatMessage = document.getElementById("chatMessage");
		chatMessage.style.display = "block";
		chatInput = document.getElementById("chatInput");
		chatInput.focus();
		
		break;
	case 39:		// Right
	case 37:		// Left
	case 38:		// Up
	case 40:		// Down
	case 32:		// Space
		if (ws) {
			ws.emit('keypress', e.keyCode);
		}
		break;
	default:
		console.log("unknown key: " + e.keyCode);
	}
	
	return true;
}

function joinParty() {
	if (ws) {
		var login = document.getElementById("login");
		if (login.value != "") {
			ws.emit("joinParty", login.value);
		} else {
			alert("Vous devez rentrer un pseudo !");
		}		 
	}
}

function init() {
	graphic = new Graphic("boardCanvas");
	graphic.erase();
	board = new Board(0, 0, "mur.png", "wood.png");
	boardExplosed = new BoardExplosed(0, 0);
board.draw(graphic);
	connectServer();
	chatInput = document.getElementById("chatInput");
	chatInput.addEventListener("keydown", function (event) {
		if (event.keyCode == 13) {
			if (ws && chatInput.value != "") {
				ws.emit("message", {"id": myplayer.id, "message": chatInput.value});
			}
			chatInput.value = "";
			var chatMessage = document.getElementById("chatMessage");
			chatMessage.style.display = "none";
			var canvas = document.getElementById("boardCanvas");
			canvas.focus();
		}
	}, false);
	
	var join = document.getElementById("join");
	join.addEventListener("submit", function (e) {
		e.preventDefault();
		joinParty();
	}, false);
	
	var joinButton = document.getElementById("joinButton");
	joinButton.addEventListener("click", joinParty);

	var connect = document.getElementById("connect");
	connect.addEventListener("click", function (e) {
		connectServer();
	});

	setInterval(function(){
		update();
		refreshBoard();
    }, 16);
	
}

window.onload = init;
