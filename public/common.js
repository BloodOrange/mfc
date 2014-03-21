(function (exports) {
	exports.Board = function (width, height, imgMurSrc) {
		this.width = width;
		this.height = height;
		this.tiles = null;
		this.imgMurSrc=imgMurSrc;
	}

	exports.Player = function (id, pseudo, x, y, color, score, life, imgSrc) {
		this.id = id;
		this.pseudo = pseudo;
		this.x = x;
		this.y = y;
		this.score = score;
		this.color = color;
		this.life = life;
		this.imgSrc = imgSrc;
	}

	exports.Egg = function (id, x, y, owner, power, imgSrc) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.owner = owner;
		this.power = power;
		this.imgSrc = imgSrc;
	}
}) (typeof exports === 'undefined'? this['common']={}: exports);


