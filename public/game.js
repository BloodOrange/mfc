ws = null;
board = null;
graphic = null;
players = new Array();

colorPlayer = [
	"blue", "red", "orange", "green", "pink"
]

var Graphic = function (canvasName) {
	this.canvas = document.getElementById(canvasName);
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.context = this.canvas.getContext("2d");

	this.erase = function () {
		this.context.fillStyle = "olivedrab";
		this.context.fillRect(0, 0, this.width, this.height);
	}
}

var Board = function (width, height) {
	this.width		= width;
	this.height		= height;
	this.tiles		= new Array();
	//this.tileset	= new Array(); // Liste des images

	for (var y = 0; y < this.height; y++) {
		this.tiles[y]	= new Array();
		for (var x = 0; x < this.width; x++) {
			if (x == 0 || x == 9 || y == 0 || y == 9)
				this.tiles[y][x] = 1;
			else
				this.tiles[y][x] = 0;
		}
	}

	this.draw = function (graph) {
		/*var image = new Image();
		  image.src = "file.jpg";
		  
		  graph.context.drawImage(image, 50, 50);*/
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				if (this.tiles[y][x] == 1) {
					graph.context.fillStyle = "red";
					graph.context.fillRect(x * 64, y * 64, 64, 64);
				}
			}
		}
	}
}

var Player = function (id, pseudo, x, y, color, score) {
	this.id = id;
	this.pseudo = pseudo;
	this.x = x;
	this.y = y;
	this.score = score;
	this.color = color;
	//this.image = new Image();
	//this.image.src = "image.png";

	this.move = function (x, y) {
		this.x += x;
		this.y += y;
	}

	this.draw = function (graph) {
		//graph.context.drawImage(this.image, this.x, this.y);
		console.log(this.color);
		graph.context.fillStyle = this.color;
		graph.context.beginPath();
		graph.context.arc(this.x, this.y, 32, 0, 2 * Math.PI);
		graph.context.stroke();
		graph.context.fill();
	}
}

function toggleInfo(connected) {
	var overlay = document.getElementById("boardOverlay");
	var joinButton = document.getElementById("joinButton");
	var connection = document.getElementById("connection");

	if (connected) {
		overlay.style.display = "none";
		connection.style.display = "block";
		joinButton.disabled = false;
	} else {
		overlay.style.display = "block";
		connection.style.display = "none";
		joinButton.display = true;
	}
}

function addPlayerOnListView(player) {
	var playerNode = document.createElement("div");
	playerNode.setAttribute("id", "player" + player.id);
	playerNode.setAttribute("class", "player");
	playerNode.style.backgroundImage = "linear-gradient(to right, " + player.color +
		" 0%, white 20%, white 100%)";
	
	var nameNode = document.createElement("div");
	nameNode.setAttribute("class", "playerName");
	nameNode.innerHTML = player.pseudo;
	playerNode.appendChild(nameNode);
	
	var scoreNode = document.createElement("div");
	scoreNode.setAttribute("class", "playerScore");
	scoreNode.innerHTML = "" + player.score;
	playerNode.appendChild(scoreNode);

	var listPlayers = document.getElementById("listPlayers");
	listPlayers.appendChild(playerNode);
}

function clearPlayerListView() {
	var listPlayers = document.getElementById("listPlayers");
	listPlayers.innerHTML = "";
}


function updatePlayersListView() {
	clearPlayerListView();
	for (var i = 0; i < players.length; i++) {
		addPlayerOnListView(players[i]);
	}
}

function initGame(gameState) {
	if (gameState.board && gameState.board.tiles) {
		board.tiles = gameState.board.tiles;
		board.draw(graphic);
	}
	console.log(board);
	if (gameState.players) {
		for (var i = 0; i < gameState.players.length; i++) {
			var newPlayer = gameState.players[i];
			var player = new Player(newPlayer.id, newPlayer.pseudo,
									newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
									newPlayer.color, newPlayer.score);
			player.draw(graphic);
			players.push(player);
			addPlayerOnListView(player);
		}
	}
} 

function connectServer() {
	if (ws) return;

	ws = io.connect('http://mfc.lo:8000');
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
	ws.on('newPlayer', function (newPlayer) {
		console.log("New player");
		//console.log(event.newPlayer);
		var player = new Player(newPlayer.id, newPlayer.pseudo,
								newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
								newPlayer.color, newPlayer.score);
		player.draw(graphic);
		players.push(player);
		addPlayerOnListView(player);
	});
	ws.on('youJoin', function (myPlayer) {
		console.log('You join the game');
		console.log(myPlayer);
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
	case 39:		// Right
	case 37:		// Left
	case 38:		// Up
	case 40:		// Down
	case 32:		// Space
		if (ws) {
			var data = {
				"event": "keydown",
				"key": e.keyCode
			}
			ws.emit('keypress', data);
		}
		break;
	default:
		console.log("unknown key: " + e.keyCode);
	}
	
	return true;
}

function init() {
	graphic = new Graphic("boardCanvas");
	graphic.erase();
	board = new Board(10, 10);
	board.draw(graphic);

	connectServer();
	
	var join = document.getElementById("join");
	join.addEventListener("submit", function (e) {
		e.preventDefault();
		if (ws) {
			var login = document.getElementById("login");
			if (login.value != "") {
				ws.emit("joinParty", login.value);
			} else {
				alert("Vous devez rentrer un pseudo !");
			}		 
		}
	}, false);

	var connect = document.getElementById("connect");
	connect.addEventListener("click", function (e) {
		connectServer();
	});

	var canvas = document.getElementById("boardCanvas");
	canvas.tabIndex = 1000;
	canvas.addEventListener("keydown", keydown, false);
	canvas.focus();
}

window.onload = init;
