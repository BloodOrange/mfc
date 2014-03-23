ws = null;
board = null;
graphic = null;
players = new Array();
eggs = new Array();
myplayer = null;
var imageMur = new Image();
var imageMurPaille=new Image();
/*var imageMur = new Image();
imageMur.src = "http://localhost:8000/mur.png";*/
var Board = common.Board;
var murSolide=new Array();
var murPaille=new Array();
/*function Board(width, height, imgMurSrc){
	this.width=width;
	this.height=height;
	this.img = new Image();
	var imgMurSrc = "http://localhost:8000/" + imgMurSrc;
	this.img.src = imgMurSrc;
	common.Board.call(this,width, height, imgMurSrc);
}
Board.prototype=new common.Board();*/
function Player (id, pseudo, x, y, color, score, life, imgSrc) {
	this.realX = x;
	this.realY = y;

	this.state = 0; // 0 - WAITING; 1 - WALKING
	this.speed = 10;
	this.img = new Image();
	var imgSrc = "http://localhost:8000/" + imgSrc;
	this.img.src = imgSrc;
	//this.img.src = imgSrc;

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
	playerNode.style.backgroundImage = "linear-gradient(to right, " + this.color +
		" 0%, white 20%, white 100%)";

	var orderNode = document.createElement("div");
	orderNode.setAttribute("class", "playerOrder");
	orderNode.innerHTML = order;
	playerNode.appendChild(orderNode);
	
	var nameNode = document.createElement("div");
	nameNode.setAttribute("class", "playerName");
	nameNode.innerHTML = this.pseudo;
	playerNode.appendChild(nameNode);
	
	var scoreNode = document.createElement("div");
	scoreNode.setAttribute("class", "playerScore");
	scoreNode.innerHTML = "" + this.score;
	playerNode.appendChild(scoreNode);

	var lifeNode = document.createElement("div");
	lifeNode.setAttribute("class", "playerLife");
	lifeNode.innerHTML = "" + this.life;
	playerNode.appendChild(lifeNode);

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
		this.context.fillStyle = "olivedrab";
		this.context.fillRect(0, 0, this.width, this.height);
	}
}

Board.prototype.draw = function (graph) {
	

	  
	  
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			if (this.tiles[y][x] == 1) {
				array=new Array(x,y);
				murSolide.push(array);
				//graph.context.fillStyle = "red";
				//img.onload = function(){
					
				//}

				
			} else if (this.tiles[y][x] == 2) {
				//graph.context.fillStyle = "blue";
				array=new Array(x,y);
				murPaille.push(array);
				

			} else {
				graph.context.fillStyle = "olivedrab";
			}
			graph.context.fillRect(x * 64, y * 64, 64, 64);
		}
	}

	imageMur.src="http://localhost:8000/mur.png";
	imageMurPaille.src="http://localhost:8000/murPaille.png";
	
		for (var i = murSolide.length - 1; i >= 0; i--) {
		
			x=parseInt(murSolide[i][0])*64;
			y=parseInt(murSolide[i][1])*64;
			graph.context.drawImage(imageMur, x, y);
			
					graph.context.stroke();
					graph.context.fill();
					
		};
		for (var i = murPaille.length - 1; i >= 0; i--) {
		
			x=parseInt(murPaille[i][0])*64;
			y=parseInt(murPaille[i][1])*64;
			graph.context.drawImage(imageMurPaille, x, y);
			
					graph.context.stroke();
					graph.context.fill();
					
		};
}

function Egg(id, x, y, owner, power, imgSrc){
	this.realX = x;
	this.realY = y;

	this.owner = owner; // 0 - WAITING; 1 - WALKING
	this.power = power;
	this.img = new Image();
		
	var imgSrc = "http://localhost:8000/" + imgSrc;
	this.img.src = imgSrc;
	common.Egg.call(this, id, x, y, owner, power, imgSrc);
}

Egg.prototype = new common.Egg();

Egg.prototype.draw = function (graph) {
	/*var imgEgg=new Image();
	imgEgg.src="http://localhost:8000/oeuf.png";
	console.log(this.x+", "+this.y);
	imgEgg.onload = function(){*/
	
	graph.context.drawImage(this.img, parseInt(this.x)- 30, parseInt(this.y)- 32);
		
	graph.context.stroke();
	graph.context.fill();
/*}*/
	/*graph.context.fillStyle = "white";
	graph.context.beginPath();
	graph.context.arc(this.x, this.y, 24, 0, 2 * Math.PI);
	graph.context.stroke();
	graph.context.fill();*/
}
Egg.prototype.drawJauneOeuf = function (graph) {
	var imgEgg=new Image();
	imgEgg.src="http://localhost:8000/jauneOeuf.png";
	console.log('oeuf détruit');
	imgEgg.onload = function(){
	
	graph.context.drawImage(imgEgg, parseInt(this.x)- 30, parseInt(this.y)- 32);
		
	graph.context.stroke();
	graph.context.fill();
}
	
}
function refreshBoard() {

	board.draw(graphic);
	players.forEach(function (player) {
		player.draw(graphic);
	});
	eggs.forEach(function (egg) {
		egg.draw(graphic);
	
	})
}
function refreshEggsDestroyed(egg){
	egg.drawJauneOeuf(graphic);

	
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
	var listPlayers = document.getElementById("listPlayers");
	listPlayers.appendChild(player.showInfo(player.id + 1));
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
		board.img=gameState.board.imgMurSrc;
		board.draw(graphic);

	
	}
	//console.log(board);
	if (gameState.players) {
		for (var i = 0; i < gameState.players.length; i++) {
			var newPlayer = gameState.players[i];
			var player = new Player(newPlayer.id, newPlayer.pseudo,
									newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
									newPlayer.color, newPlayer.score, newPlayer.life, newPlayer.imgSrc);
			//player.draw(graphic);
			players[player.id] = player;
			addPlayerOnListView(player);
		}
	}
	if (gameState.eggs) {
		gameState.eggs.forEach(function (newEgg) {
			eggs[newEgg.id] = new Egg(newEgg.id, newEgg.x * 64 + 32, newEgg.y * 64 + 32, newEgg.owner, newEgg.power, newEgg.imgSrc);
		});
	}
} 

function connectServer() {
	if (ws) return;

	ws = io.connect('http://localhost:8000');
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
								newPlayer.color, newPlayer.score, newPlayer.life,
								newPlayer.imgSrc);
		//player.draw(graphic);
		players[player.id] = player;
		addPlayerOnListView(player);
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
	ws.on('youJoin', function (newPlayer) {
		console.log('You join the game');
		console.log(newPlayer);
		var joinButton = document.getElementById("joinButton");
		var connection = document.getElementById("connection");

		joinButton.disabled = false;
		connection.style.display = "none";

		myplayer = new Player(newPlayer.id, newPlayer.pseudo,
							  newPlayer.x * 64 + 32, newPlayer.y * 64 + 32,
							  newPlayer.color, newPlayer.score, newPlayer.life,
							 newPlayer.imgSrc);
		//myplayer.draw(graphic);
		players[myplayer.id] = myplayer;
		addPlayerOnListView(myplayer);

		var canvas = document.getElementById("boardCanvas");
		canvas.tabIndex = 1000;
		canvas.addEventListener("keydown", keydown, false);
		canvas.focus();
	});
	ws.on('newEgg', function (newEgg) {
		console.log('Oh no, a bomb edd has dropped');
		//console.log(newEgg.imgSrc);

		eggs[newEgg.id] = new Egg(newEgg.id, newEgg.x * 64 + 32, newEgg.y * 64 + 32, newEgg.owner, newEgg.power, newEgg.imgSrc);
		//eggs[newEgg.id] = newEgg;
		//eggs[newEgg.id].draw(graphic);
		//eggs[newEgg.id].draw(graphic);
	});
	ws.on('eggExplosed', function (eggId) {
		console.log('The egg ' + eggId + ' has explosed!');
		//refreshEggsDestroyed(eggs[eggId]);
	
		delete eggs[eggId];
		refreshBoard();
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
			ws.emit('keypress', e.keyCode);
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
	board = new Board(0, 0, "mur.png");
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

	setInterval(function(){
		delete(imageMur);
		update();
		refreshBoard();
    }, 16);
	
}

window.onload = init;
