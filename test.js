
var game = new Phaser.Game(960, 540, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render});

function preload() {

    game.load.image('limb', 'assets/limb.png');
    game.load.image('torso', 'assets/aqua_ball.png');
    game.load.image('background', 'assets/sky.png');

}

var torso;
var limb1;
var limb2;


function create() {

    back = game.add.image(0, 0, 'background'); 
    back.width = 960;
    back.height = 540;
    
    // Add sprites that will be joint with constraints
    torso = game.add.sprite(400, 75, 'torso');
    limb1 = game.add.sprite(400, 150, 'limb');
    limb2 = game.add.sprite(400, 300, 'limb');


	//	Enable p2 physics
	game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 800;
    game.physics.p2.enable([torso, limb1, limb2]);

    torso.body.setRectangle(5,5);
    limb1.body.setRectangle(20,135);
    limb2.body.setRectangle(20,135);

    torso.body.static = true;
 
    // limb1.body.velocity.x = 200;
    // limb2.body.velocity.x = -200;
    
    limb1.body.mass = 10;
    limb2.body.mass = 10;

    //var constraint = game.physics.p2.createDistanceConstraint(sprite1, sprite2, 150);
    game.physics.p2.createRevoluteConstraint(limb1, [0, 75],limb2,[0,-75],10000)
    game.physics.p2.createRevoluteConstraint(limb1, [0,-75],torso,[0,  0],10000)
    
    cursors = game.input.keyboard.createCursorKeys();
    
}


function render() {
   game.debug.text('xv: ' + limb1.body.velocity.x, 32, 32);
}

function applyAngularForce(spriteA, spriteB, force) {
}

function update() {

    if (cursors.left.isDown)
    {
        limb1.body.applyForce([100, 100],limb1.body.x,limb1.body.y);
    }
    else if (cursors.right.isDown)
    {
        limb1.body.applyForce([100,-100],limb1.body.x,limb1.body.y);

    }

    if (cursors.up.isDown)
    {
        limb1.body.applyForce([100, 100],limb2.body.x,limb1.body.y);
    }
    else if (cursors.down.isDown)
    {
        limb1.body.applyForce([100,-100],limb2.body.x,limb1.body.y);
    }
}


