exports.Board = function (width, height) {
	this.width		= width;
	this.height		= height;
	this.tiles		= null;
}

exports.Player = function (id, pseudo, x, y, color, score) {
	this.id = id;
	this.pseudo = pseudo;
	this.x = x;
	this.y = y;
	this.score = score;
	this.color = color;
	//this.image = new Image();
	//this.image.src = "image.png";
}

