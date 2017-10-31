
var game = new Phaser.Game(960, 540, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render});

function preload() {

    game.load.image('body', 'assets/lowerLeg.png');
    game.load.image('limb', 'assets/lowerLeg.png');
    game.load.image('shoe', 'assets/nikey.png');
    game.load.image('ball', 'assets/aqua_ball.png');
    game.load.image('background', 'assets/sky.png ');

}

var torso;
var upperLegLeft;
var upperLegRight;
var lowerLegLeft;
var lowerLegRight;

var JKey;
var KKey;
var HKey;
var LKey;


function create() {

    // Setup game
    back = game.add.image(0, 0, 'background'); 
    back.width = 960;
    back.height = 540;

    cursors = game.input.keyboard.createCursorKeys();
    JKey = game.input.keyboard.addKey(Phaser.Keyboard.J);
    KKey = game.input.keyboard.addKey(Phaser.Keyboard.K);
    HKey = game.input.keyboard.addKey(Phaser.Keyboard.H);
    LKey = game.input.keyboard.addKey(Phaser.Keyboard.L);

    // Define variables specifying the model of the body
    var bodyScale = 0.9;
    var torsoX = 500;
    var torsoY = 190;
    var torsoHeight = 180*bodyScale;
    var torsoWidth = 70*bodyScale;

    var upperLegHeight = 130*bodyScale;
    var upperLegWidth = 25*bodyScale;
    var lowerLegHeight = 120*bodyScale;
    var lowerLegWidth = 18*bodyScale;
    
    var upperLegLeftAngle = Phaser.Math.degToRad( 15); //Starting angle of upperleg.
    var lowerLegLeftAngle = Phaser.Math.degToRad(-45) + upperLegLeftAngle; //Starting angle of lowerleg.
    var shoeLeftAngle     = Phaser.Math.degToRad( 20) + lowerLegLeftAngle; //Starting angle of the shoe.

    // Specifies the correct joint constaints
    var  hipMaxAngle = Phaser.Math.degToRad( 115);
    var  hipMinAngle = Phaser.Math.degToRad(-20 );
    var kneeMaxAngle = Phaser.Math.degToRad( 5  );
    var kneeMinAngle = Phaser.Math.degToRad(-155);
    var ankleMaxAngle = Phaser.Math.degToRad( 20);
    var ankleMinAngle = Phaser.Math.degToRad(-20);

    var legSeperator = 15*bodyScale;

    var shoeSize = 100*bodyScale;
    var shoeLegDistance = 10*bodyScale;
    var shoeXOffset = 20*bodyScale;

    // Gets the positions the parts need to be moved to once created
    upperLegLeftStartX = torsoX-legSeperator;
    upperLegLeftStartY = torsoY+torsoHeight/2;
    lowerLegLeftStartX = upperLegLeftStartX + Math.sin(upperLegLeftAngle)*upperLegHeight;
    lowerLegLeftStartY = upperLegLeftStartY + Math.cos(upperLegLeftAngle)*upperLegHeight;
    lowerLegLeftEndX = lowerLegLeftStartX + Math.sin(lowerLegLeftAngle)*lowerLegHeight;
    lowerLegLeftEndY = lowerLegLeftStartY + Math.cos(lowerLegLeftAngle)*lowerLegHeight;
    upperLegLeftX = (upperLegLeftStartX+lowerLegLeftStartX)/2;
    upperLegLeftY = (upperLegLeftStartY+lowerLegLeftStartY)/2;
    lowerLegLeftX = (lowerLegLeftStartX+lowerLegLeftEndX)/2;
    lowerLegLeftY = (lowerLegLeftStartY+lowerLegLeftEndY)/2;
    shoeLeftX = lowerLegLeftEndX + shoeXOffset*Math.cos(shoeLeftAngle) + shoeLegDistance*Math.sin(shoeLeftAngle);
    shoeLeftY = lowerLegLeftEndY - shoeXOffset*Math.sin(shoeLeftAngle) + shoeLegDistance*Math.cos(shoeLeftAngle);

    // Add the sprites in the position as if all the angles were 0
    torso        = game.add.sprite(torsoX, torsoY, 'limb');
    upperLegLeft = game.add.sprite(upperLegLeftStartX,upperLegLeftStartY+upperLegHeight/2, 'limb');
    lowerLegLeft = game.add.sprite(upperLegLeftStartX,upperLegLeftStartY+upperLegHeight+lowerLegHeight/2, 'limb');
    shoeLeft     = game.add.sprite(upperLegLeftStartX+shoeXOffset,upperLegLeftStartY+upperLegHeight+lowerLegHeight+shoeLegDistance, 'shoe');

    // Change the dimensions of the sprites as specified by the model defined earlier
    torso.width  = torsoWidth;
    torso.height = torsoHeight;
    upperLegLeft.width  = upperLegWidth;
    upperLegLeft.height = upperLegHeight;
    lowerLegLeft.width  = lowerLegWidth;
    lowerLegLeft.height = lowerLegHeight;
    shoeLeft.width = shoeSize;
    shoeLeft.height = shoeSize/20*9;


	// Start the P2 Physics engine and add the sprites to it.
	game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 150; //400
    game.physics.p2.enable([torso, upperLegLeft, lowerLegLeft, shoeLeft]);
    torso.body.mass *= 6;

    // Create collision groups so that the limbs do not collide with each other
    var athleteCollisionGroup = game.physics.p2.createCollisionGroup();
    game.physics.p2.updateBoundsCollisionGroup();

    torso.body.setCollisionGroup(athleteCollisionGroup);
    lowerLegLeft.body.setCollisionGroup(athleteCollisionGroup);
    upperLegLeft.body.setCollisionGroup(athleteCollisionGroup);
    shoeLeft.body.setCollisionGroup(athleteCollisionGroup);


    // Make the physics bodies have correct physics properties - values guessed and incomplete
    // hipLeft.enableMotor();
    // hipLeft.setMotorSpeed(0.1);
    upperLegLeft.body.angularDamping = 0.8;
    lowerLegLeft.body.angularDamping = 0.8;
    upperLegLeft.body.damping = 0.4;
    lowerLegLeft.body.damping = 0.4;
    

    // Once the body parts have been created move them into the desired start position as calculated earlier.
    upperLegLeft.body.x = upperLegLeftX;
    upperLegLeft.body.y = upperLegLeftY;
    lowerLegLeft.body.x = lowerLegLeftX;
    lowerLegLeft.body.y = lowerLegLeftY;
    shoeLeft.body.x = shoeLeftX;
    shoeLeft.body.y = shoeLeftY;
    upperLegLeft.body.rotation = -upperLegLeftAngle;
    lowerLegLeft.body.rotation = -lowerLegLeftAngle;
    shoeLeft.body.rotation = -shoeLeftAngle;

    // Create joints between limbs
    var  hipLeft = game.physics.p2.createRevoluteConstraint(upperLegLeft, [0,-upperLegHeight/2],torso,[-legSeperator, torsoHeight/2],10000)
    var kneeLeft = game.physics.p2.createRevoluteConstraint(lowerLegLeft, [0,-lowerLegHeight/2],upperLegLeft,[0,upperLegHeight/2],10000)
    var ankleLeft = game.physics.p2.createRevoluteConstraint(shoeLeft, [-shoeXOffset,-shoeLegDistance],lowerLegLeft,[0,lowerLegHeight/2],10000)

    // Give the joints the restrictions as defined earlier
    hipLeft.upperLimit = hipMaxAngle;
    hipLeft.lowerLimit = hipMinAngle;
    hipLeft.lowerLimitEnabled = true;
    hipLeft.upperLimitEnabled = true;
    kneeLeft.upperLimit = kneeMaxAngle;
    kneeLeft.lowerLimit = kneeMinAngle;
    kneeLeft.lowerLimitEnabled = true;
    kneeLeft.upperLimitEnabled = true;
    ankleLeft.upperLimit = ankleMaxAngle;
    ankleLeft.lowerLimit = ankleMinAngle;
    ankleLeft.lowerLimitEnabled = true;
    ankleLeft.upperLimitEnabled = true;
    
}


function render() {
   game.debug.text('Use arrow keys to move the legs.', 32, 32);
}

function applyAngularForce(spriteA, spriteB, force) {

}

var musclePower = 15;

function update() {

    if (cursors.left.isDown) {
        upperLegLeft.body.applyForce([0, musclePower],0,0);
    } else if (cursors.right.isDown) {
        upperLegLeft.body.applyForce([0,-musclePower],0,0);
    }

    if (cursors.up.isDown) {
        lowerLegLeft.body.applyForce([0,-musclePower],0,0);
    } else if (cursors.down.isDown) {
        lowerLegLeft.body.applyForce([0, musclePower],0,0);     
    }
    

    if (JKey.isDown) {

    } else if (KKey.isDown) {

    }

    if (HKey.isDown) {

    } else if (LKey.isDown) {

    }
}


