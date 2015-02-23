
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function randomRespawn(){
    var radios = document.getElementsByName('Repsawn at Random Cords');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // do whatever you want with the checked radio
            var onOrOff = (radios[i].value);

            return !(onOrOff.indexOf("ff") > -1);
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

function setFrction(){
    var radios = document.getElementsByName('Frictionless');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // do whatever you want with the checked radio
            var onOrOff = (radios[i].value);

            if(onOrOff.indexOf("ff") > -1)
                friction = 1;
            else
                friction = .5;
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

function setSpeed(){
    var radios = document.getElementsByName('Fast');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // do whatever you want with the checked radio
            var onOrOff = (radios[i].value);

            if(onOrOff.indexOf("ff") > -1)
                maxSpeed = 200;
            else
                maxSpeed = 400;
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

function Circle(game) {
    this.player =1;
    this.radius = 2;//how big the circles are
    this.visualRadius = 200;// initial how far they can see
    this.colors = ['#6FC3DF','#DF740C'];
    this.setNotIt();
    this.turnsIt = 0;
    this.inmune = false;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = 1;
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    setFrction();
    setSpeed();
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];

        if(ent.it  && !ent.inmune){
            ent.turnsIt++;
           // console.log(ent.turnsIt);

            if(ent.turnsIt > 100000){
                ent.setNotIt();
                ent.turnsIt = -10000;
                ent.inmune = true;

                if(randomRespawn()){
                    ent.x = Math.random()*800;
                    ent.y = Math.random()*800;
                }
                          }
        }else if(ent.inmune){
            ent.turnsIt++;
            if(ent.turnsIt>0) {
                ent.inmune = false;
            }
        }
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it) {
                //this.setNotIt();
                ent.setIt();
            }
            else if (ent.it) {
                this.setIt();
                //ent.setNotIt();
            }
        }

        if ( !ent.it && ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }

        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};



// the "main" code begins here
var friction = 1;
var acceleration = 10000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

var canvas;
var ctx;
var gameEngine;

ASSET_MANAGER.queueDownload("./img/Tron.mp3");

ASSET_MANAGER.downloadAll(function () {
    canvas = document.getElementById('gameWorld');
    ctx = canvas.getContext('2d');
    gameEngine = new GameEngine();

    for (var i = 0; i < 500; i++) {// how many circles
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }


    var circle = new Circle(gameEngine);
    circle.setIt();
    gameEngine.addEntity(circle);

    gameEngine.init(ctx);
    var ost = new Audio("./img/Tron.mp3");
    ost.play();
    ost.loop = true;
    gameEngine.start();
});
