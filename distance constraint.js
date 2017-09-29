
var game = new Phaser.Game(960, 540, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render});

function preload() {

    game.load.image('atari', 'assets/sprites/cokecan.png');
    game.load.image('ball', 'assets/sprites/red_ball.png');
    game.load.image('clouds', 'assets/misc/clouds.jpg');

}

var sprite1;
var sprite2;
var cursors;

function create() {

    back = game.add.image(0, 0, 'clouds'); 
    back.width = 960;
    back.height = 540;

	//	Enable p2 physics
	game.physics.startSystem(Phaser.Physics.P2JS);
    
    // Add sprites that will be joint with constraints
    sprite1 = game.add.sprite(400, 150, 'ball');
    sprite2 = game.add.sprite(400, 300, 'ball');
    sprite3 = game.add.sprite(325, 430, 'ball');
    sprite4 = game.add.sprite(475, 430, 'ball');
    sprite5 = game.add.sprite(510, 300, 'ball');

    game.physics.p2.enable([sprite1, sprite2, sprite3, sprite4, sprite5]);

    game.physics.p2.gravity.y = 500

    //sprite1.body.mass = 100;

    //sprite2.body.gravity.y = 500;
    //fsprite3.body.gravity.y = 500;

    var constraint = game.physics.p2.createDistanceConstraint(sprite1, sprite2, 150);
    var constraint = game.physics.p2.createDistanceConstraint(sprite2, sprite3, 150);
    var constraint = game.physics.p2.createDistanceConstraint(sprite2, sprite4, 150);
    var constraint = game.physics.p2.createDistanceConstraint(sprite3, sprite4, 150);
    var constraint = game.physics.p2.createDistanceConstraint(sprite2, sprite5, 110);

    text = game.add.text(20, 20, 'move with arrow keys', { fill: '#ffffff' });

    cursors = game.input.keyboard.createCursorKeys();

}

function render() {
   game.debug.text('x ' + sprite1.body.x, 32, 32);
}

function applyAngularForce(spriteA, spriteB, force) {
    spriteA.body.force = [30,30];
    console.log(5);
}

function update() {

	sprite1.body.velocity.x = 0;
    sprite1.body.velocity.y /= 3;

    sprite5.body.angularVelocity /= 2;

    if (cursors.left.isDown)
    {
    	applyAngularForce(sprite5, sprite2, 30);
    }
    else if (cursors.right.isDown)
    {
    	sprite5.body.applyForce([10,0],sprite1.body.x + 10,sprite1.body.y);
        //sprite2.body.rotateLeft(500);
    }

    if (cursors.up.isDown)
    {
        sprite1.body.moveUp(400);
    }
    else if (cursors.down.isDown)
    {
        sprite1.body.moveDown(400);
    }

}

