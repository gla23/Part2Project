
var gameWidth  = 960;
var gameHeight = 540;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render});

function preload() {
    game.load.image('body', 'assets/lowerLeg.png');
    game.load.image('limb', 'assets/lowerLeg.png');
    game.load.image('head', 'assets/head.png');
    game.load.image('shoe', 'assets/nikey.png');
    game.load.image('background', 'assets/sky.png ');
}


var torso, upperLegLeft, upperLegRight;
var lowerLegLeft, lowerLegRight;
var upperArmLeft, lowerArmLeft;
var shoeLeft, shoeRight;
var QKey, WKey, OKey, PKey, ResetRunnerKey;
var JKey, KKey, HKey, LKey, SKey, DKey, AKey, FKey;
var floorCollisionGroup, athleteStandingCollisionGroup, athleteFallenCollisionGroup;

// Easy mode joint restrictions
// var  hipMaxAngle = Phaser.Math.degToRad( 105);
// var  hipMinAngle = Phaser.Math.degToRad(-20 );
// var kneeMaxAngle = Phaser.Math.degToRad( 2  );
// var kneeMinAngle = Phaser.Math.degToRad(-115);
// var ankleMaxAngle = Phaser.Math.degToRad( 20);
// var ankleMinAngle = Phaser.Math.degToRad(-20);
// var shoulderMaxAngle = Phaser.Math.degToRad( 40);
// var shoulderMinAngle = Phaser.Math.degToRad(-40);
// var elbowMaxAngle = Phaser.Math.degToRad( 80);
// var elbowMinAngle = Phaser.Math.degToRad(-70);
// var neckMaxAngle = Phaser.Math.degToRad( 30);
// var neckMinAngle = Phaser.Math.degToRad(-30);

//################################################
// Variables to fiddle with
// Joint constraints angles
var  hipMaxAngle = Phaser.Math.degToRad( 90);
var  hipMinAngle = Phaser.Math.degToRad(-50 );; //-20 for easy mode
var kneeMaxAngle = Phaser.Math.degToRad( 2  );
var kneeMinAngle = Phaser.Math.degToRad(-115);
var ankleMaxAngle = Phaser.Math.degToRad( 10);
var ankleMinAngle = Phaser.Math.degToRad(-10);
var shoulderMaxAngle = Phaser.Math.degToRad( 40);
var shoulderMinAngle = Phaser.Math.degToRad(-40);
var elbowMaxAngle = Phaser.Math.degToRad( 80);
var elbowMinAngle = Phaser.Math.degToRad(-70);
var neckMaxAngle = Phaser.Math.degToRad( 30);
var neckMinAngle = Phaser.Math.degToRad(-30);
// Start angles for limbs
upperLegLeftAngle = Phaser.Math.degToRad(-5);
lowerLegLeftAngle = Phaser.Math.degToRad(-37.4) + upperLegLeftAngle; //-37.4 sinks into a stance rather than falling over
shoeLeftAngle     = Phaser.Math.degToRad( 5) + lowerLegLeftAngle;
upperLegRightAngle = Phaser.Math.degToRad( 25);
lowerLegRightAngle = Phaser.Math.degToRad(-25) + upperLegRightAngle;
shoeRightAngle     = Phaser.Math.degToRad(-5) + lowerLegRightAngle;
upperArmLeftAngle = Phaser.Math.degToRad(-25);
lowerArmLeftAngle = Phaser.Math.degToRad( 60) + upperArmLeftAngle;
upperArmRightAngle = Phaser.Math.degToRad(35);
lowerArmRightAngle = Phaser.Math.degToRad(60) + upperArmRightAngle;
// Physics values
var gravity = 500; // 600 seems realistic 400 seems good
var muscleMotorPower = 3.3; //3 with mass all 1
var playerFriction = 3.7; // 3.5 good for 3,1,2.5,2 masses
// Body dimensions
var bodyScale = 0.8;
var armScale = 0.8; //0.9
var shoulderOffset = 0.2;
var legSeperator = 11*bodyScale;
var armSeperator = 30*bodyScale;
// Body masses
var headMass = 7;
var armMass = 1;
var torsoMass = 3;
var upperLegMass = 1;
var lowerLegMass = 2.5; // 1.8
var shoeMass = 2;



function create() {
    // Set-up game
    back = game.add.image(0, 0, 'background');
    back.fixedToCamera = true;
    back.width = gameWidth;
    back.height = gameHeight;

    var style = { font: "45px Arial", fill: "#eeeeee", align: "center", boundsAlignH: "center" };
    scoreText = game.add.text(gameWidth/2, 32, "0m", style);
    scoreText.fixedToCamera = true;
    scoreText.anchor.set(0.5);
    startText = game.add.text(40, game.world.centerY, "Run this way\n-->\n", style);
    

    // //  Modify the world and camera bounds
    game.world.setBounds(0,0,6000, gameHeight);


    // Set-up input keys
    JKey = game.input.keyboard.addKey(Phaser.Keyboard.J);
    KKey = game.input.keyboard.addKey(Phaser.Keyboard.K);
    HKey = game.input.keyboard.addKey(Phaser.Keyboard.H);
    LKey = game.input.keyboard.addKey(Phaser.Keyboard.L);
    SKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    DKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    AKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    FKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
    QKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    WKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    OKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
    PKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
    resetRunnerKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
    resetRunnerKey.onDown.add(resetRunner,this);
    toggleJointsKey = game.input.keyboard.addKey(Phaser.Keyboard.T);
    toggleJointsKey.onDown.add(toggleJointPower,this);
    
    floorHeight = 25;
    floorWidth = 1920;
    
    // Define variables specifying the model of the body
    torsoX = 300;
    torsoY = 210;
    torsoHeight = 180*bodyScale;
    torsoWidth = 70*bodyScale;
    upperLegHeight = 130*bodyScale;
    upperLegWidth = 25*bodyScale;
    lowerLegHeight = 120*bodyScale;
    lowerLegWidth = 18*bodyScale;
    upperArmHeight = 130*bodyScale*armScale;
    upperArmWidth = 25*bodyScale*armScale;
    lowerArmHeight = 120*bodyScale*armScale;
    lowerArmWidth = 18*bodyScale*armScale;
    shoeSize = 100*bodyScale;
    shoeLegDistance = 10*bodyScale;
    shoeXOffset = 20*bodyScale;
    headWidth = 62*bodyScale;
    headHeight = 81*bodyScale;
    headOffset = 38*bodyScale; //38




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
    upperLegRightStartX = torsoX+legSeperator;
    upperLegRightStartY = torsoY+torsoHeight/2;
    lowerLegRightStartX = upperLegRightStartX + Math.sin(upperLegRightAngle)*upperLegHeight;
    lowerLegRightStartY = upperLegRightStartY + Math.cos(upperLegRightAngle)*upperLegHeight;
    lowerLegRightEndX = lowerLegRightStartX + Math.sin(lowerLegRightAngle)*lowerLegHeight;
    lowerLegRightEndY = lowerLegRightStartY + Math.cos(lowerLegRightAngle)*lowerLegHeight;
    upperLegRightX = (upperLegRightStartX+lowerLegRightStartX)/2;
    upperLegRightY = (upperLegRightStartY+lowerLegRightStartY)/2;
    lowerLegRightX = (lowerLegRightStartX+lowerLegRightEndX)/2;
    lowerLegRightY = (lowerLegRightStartY+lowerLegRightEndY)/2;
    shoeRightX = lowerLegRightEndX + shoeXOffset*Math.cos(shoeRightAngle) + shoeLegDistance*Math.sin(shoeRightAngle);
    shoeRightY = lowerLegRightEndY - shoeXOffset*Math.sin(shoeRightAngle) + shoeLegDistance*Math.cos(shoeRightAngle);

    upperArmLeftStartX = torsoX-armSeperator;
    upperArmLeftStartY = torsoY+(shoulderOffset-0.5)*torsoHeight;
    lowerArmLeftStartX = upperArmLeftStartX + Math.sin(upperArmLeftAngle)*upperArmHeight;
    lowerArmLeftStartY = upperArmLeftStartY + Math.cos(upperArmLeftAngle)*upperArmHeight;
    lowerArmLeftEndX = lowerArmLeftStartX + Math.sin(lowerArmLeftAngle)*lowerArmHeight;
    lowerArmLeftEndY = lowerArmLeftStartY + Math.cos(lowerArmLeftAngle)*lowerArmHeight;
    upperArmLeftX = (upperArmLeftStartX+lowerArmLeftStartX)/2;
    upperArmLeftY = (upperArmLeftStartY+lowerArmLeftStartY)/2;
    lowerArmLeftX = (lowerArmLeftStartX+lowerArmLeftEndX)/2;
    lowerArmLeftY = (lowerArmLeftStartY+lowerArmLeftEndY)/2;
    upperArmRightStartX = torsoX+armSeperator;
    upperArmRightStartY = torsoY+(shoulderOffset-0.5)*torsoHeight;
    lowerArmRightStartX = upperArmRightStartX + Math.sin(upperArmRightAngle)*upperArmHeight;
    lowerArmRightStartY = upperArmRightStartY + Math.cos(upperArmRightAngle)*upperArmHeight;
    lowerArmRightEndX = lowerArmRightStartX + Math.sin(lowerArmRightAngle)*lowerArmHeight;
    lowerArmRightEndY = lowerArmRightStartY + Math.cos(lowerArmRightAngle)*lowerArmHeight;
    upperArmRightX = (upperArmRightStartX+lowerArmRightStartX)/2;
    upperArmRightY = (upperArmRightStartY+lowerArmRightStartY)/2;
    lowerArmRightX = (lowerArmRightStartX+lowerArmRightEndX)/2;
    lowerArmRightY = (lowerArmRightStartY+lowerArmRightEndY)/2;
    headX = torsoX;
    headY = torsoY - torsoHeight/2 - headOffset;

    // Add the sprites in the position as if all the angles were 0
    floor         = game.add.sprite(floorWidth/2,gameHeight-floorHeight/2 , 'limb');
    torso         = game.add.sprite(torsoX, torsoY, 'limb');
    head          = game.add.sprite(headX , headY , 'head');
    upperLegLeft  = game.add.sprite(upperLegLeftStartX,upperLegLeftStartY+upperLegHeight/2, 'limb');
    lowerLegLeft  = game.add.sprite(upperLegLeftStartX,upperLegLeftStartY+upperLegHeight+lowerLegHeight/2, 'limb');
    shoeLeft      = game.add.sprite(upperLegLeftStartX+shoeXOffset,upperLegLeftStartY+upperLegHeight+lowerLegHeight+shoeLegDistance, 'shoe');
    upperLegRight = game.add.sprite(upperLegRightStartX,upperLegRightStartY+upperLegHeight/2, 'limb');
    lowerLegRight = game.add.sprite(upperLegRightStartX,upperLegRightStartY+upperLegHeight+lowerLegHeight/2, 'limb');
    shoeRight     = game.add.sprite(upperLegRightStartX+shoeXOffset,upperLegRightStartY+upperLegHeight+lowerLegHeight+shoeLegDistance, 'shoe');
    upperArmLeft  = game.add.sprite(upperArmLeftStartX,upperArmLeftStartY+upperArmHeight/2, 'limb');
    lowerArmLeft  = game.add.sprite(upperArmLeftStartX,upperArmLeftStartY+upperArmHeight+lowerArmHeight/2, 'limb');
    upperArmRight = game.add.sprite(upperArmRightStartX,upperArmRightStartY+upperArmHeight/2, 'limb');
    lowerArmRight = game.add.sprite(upperArmRightStartX,upperArmRightStartY+upperArmHeight+lowerArmHeight/2, 'limb');

    sprites = [torso, upperLegLeft, lowerLegLeft, shoeLeft, upperLegRight, lowerLegRight, shoeRight, upperArmLeft, lowerArmLeft, upperArmRight, lowerArmRight, head];

    // Change the dimensions of the sprites as specified by the model defined earlier
    torso.width  = torsoWidth;
    torso.height = torsoHeight;
    upperLegLeft.width  = upperLegWidth;
    upperLegLeft.height = upperLegHeight;
    lowerLegLeft.width  = lowerLegWidth;
    lowerLegLeft.height = lowerLegHeight;
    shoeLeft.width = shoeSize;
    shoeLeft.height = shoeSize/20*9;
    upperLegRight.width  = upperLegWidth;
    upperLegRight.height = upperLegHeight;
    lowerLegRight.width  = lowerLegWidth;
    lowerLegRight.height = lowerLegHeight;
    shoeRight.width = shoeSize;
    shoeRight.height = shoeSize/20*9;
    upperArmLeft.width  = upperArmWidth;
    upperArmLeft.height = upperArmHeight;
    lowerArmLeft.width  = lowerArmWidth;
    lowerArmLeft.height = lowerArmHeight;
    upperArmRight.width  = upperArmWidth;
    upperArmRight.height = upperArmHeight;
    lowerArmRight.width  = lowerArmWidth;
    lowerArmRight.height = lowerArmHeight;
    head.width  = headWidth;
    head.height = headHeight;
    floor.height = floorHeight;
    floor.width = floorWidth;
    

    // #######################################################
    // Start the P2 Physics engine and add the sprites to it.
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = gravity;
    // Add the sprites to the physics engine, true or false at the end is the debug for the sprites
    game.physics.p2.enable([torso, upperLegLeft, lowerLegLeft, shoeLeft, upperLegRight, lowerLegRight, shoeRight, upperArmLeft, lowerArmLeft, upperArmRight, lowerArmRight, head, floor],false);

    rubberMaterial = game.physics.p2.createMaterial('rubberMaterial');
    athleteMaterial = game.physics.p2.createMaterial('athleteMaterial');
    groundPlayerCM = game.physics.p2.createContactMaterial(rubberMaterial, rubberMaterial, { friction: playerFriction }); // was 10.0
    upperLegLeft.body.mass *= upperLegMass;
    upperLegRight.body.mass *= upperLegMass;
    lowerLegLeft.body.mass *= lowerLegMass;
    lowerLegRight.body.mass *= lowerLegMass;
    shoeLeft.body.mass *= shoeMass;
    shoeRight.body.mass *= shoeMass;
    upperArmLeft.body.mass *= armMass;
    upperArmRight.body.mass *= armMass;
    lowerArmLeft.body.mass *= armMass;
    lowerArmRight.body.mass *= armMass;
    head.body.mass *= headMass;

    torso.body.mass *= torsoMass;
    floor.body.static = true;


    // Reshapes the shoe collision boxes so that they doesn't have collision in the whole rectangle
    shoeLeft.body.setRectangle(shoeSize,shoeSize/10,0,shoeSize/40*9-shoeSize/15);
    shoeRight.body.setRectangle(shoeSize,shoeSize/10,0,shoeSize/40*9-shoeSize/15);

    torso.body.setRectangle(torsoWidth,torsoHeight*1.05,0,0.1*torsoHeight);

    // Create collision groups so that the limbs do not collide with each other
    floorCollisionGroup = game.physics.p2.createCollisionGroup();
    athleteStandingCollisionGroup = game.physics.p2.createCollisionGroup();
    athleteFallenCollisionGroup = game.physics.p2.createCollisionGroup();
    game.physics.p2.updateBoundsCollisionGroup(false,false,false,false);

    floor.body.setCollisionGroup(floorCollisionGroup);
    floor.body.collides(athleteStandingCollisionGroup);
    floor.body.collides(athleteFallenCollisionGroup);
    floor.body.setMaterial(rubberMaterial);

    for (var i = sprites.length - 1; i >= 0; i--) {
        // Give shoes the rubber material
        if (i==3 || i==6) {
            sprites[i].body.setMaterial(rubberMaterial);
        } else {
            sprites[i].body.setMaterial(athleteMaterial);
        }

        if ((i>=1 && i<=6)) { //||(i==8||i==10)
            // Limbs that are allowed to touch the floor
            sprites[i].body.setCollisionGroup(athleteStandingCollisionGroup);
        } else {
            sprites[i].body.setCollisionGroup(athleteFallenCollisionGroup);
            // Calls the athlete fallen function when a collision happens with the parts of the body that can't touch the floor     //sprites[i].body.onBeginContact.add(athleteFallen,);
            floor.body.createBodyCallback(sprites[i], athleteFallen,);
        }
        sprites[i].body.collides(floorCollisionGroup);         

    }
    // Turns on collisions set above
    game.physics.p2.setImpactEvents(true);
    
    // Once the body parts have been created move them into the desired start position as calculated earlier.
    // resetRunner();

    // Create joints between limbs
    maxForce = 10000;
    hipLeft = game.physics.p2.createRevoluteConstraint(upperLegLeft, [0,-upperLegHeight/2],torso,[-legSeperator, torsoHeight/2],maxForce);
    kneeLeft = game.physics.p2.createRevoluteConstraint(lowerLegLeft, [0,-lowerLegHeight/2],upperLegLeft,[0,upperLegHeight/2],maxForce);
    ankleLeft = game.physics.p2.createRevoluteConstraint(shoeLeft, [-shoeXOffset,-shoeLegDistance],lowerLegLeft,[0,lowerLegHeight/2],maxForce);
    upperLegLeft.connectedJoint = hipLeft;
    lowerLegLeft.connectedJoint = kneeLeft;
    shoeLeft.connectedJoint = ankleLeft;
    hipRight = game.physics.p2.createRevoluteConstraint(upperLegRight, [0,-upperLegHeight/2],torso,[legSeperator, torsoHeight/2],maxForce);
    kneeRight = game.physics.p2.createRevoluteConstraint(lowerLegRight, [0,-lowerLegHeight/2],upperLegRight,[0,upperLegHeight/2],maxForce);
    ankleRight = game.physics.p2.createRevoluteConstraint(shoeRight, [-shoeXOffset,-shoeLegDistance],lowerLegRight,[0,lowerLegHeight/2],maxForce);
    upperLegRight.connectedJoint = hipRight;
    lowerLegRight.connectedJoint = kneeRight;
    shoeRight.connectedJoint = ankleRight;
    
    shoulderLeft  = game.physics.p2.createRevoluteConstraint(upperArmLeft , [0,-upperArmHeight/2],torso,[-armSeperator,(shoulderOffset-0.5)*torsoHeight],maxForce);
    elbowLeft = game.physics.p2.createRevoluteConstraint(lowerArmLeft, [0,-lowerArmHeight/2],upperArmLeft,[0,upperArmHeight/2],maxForce);
    shoulderRight = game.physics.p2.createRevoluteConstraint(upperArmRight, [0,-upperArmHeight/2],torso,[ armSeperator,(shoulderOffset-0.5)*torsoHeight],maxForce);
    elbowRight = game.physics.p2.createRevoluteConstraint(lowerArmRight, [0,-lowerArmHeight/2],upperArmRight,[0,upperArmHeight/2],maxForce);

    neck = game.physics.p2.createRevoluteConstraint(head , [0,headHeight/2],torso,[0,-torsoHeight/2-headOffset+headHeight/2],maxForce);

    joints = new Array(hipLeft,kneeLeft,ankleLeft,hipRight,kneeRight,ankleRight,shoulderLeft,elbowLeft,shoulderRight,elbowRight,neck);
    jointPowersThisFrame = new Array();

    // Once the body parts have been created move them into the desired start position as calculated earlier.
    resetRunner();

    // Initialise the motors on the joints
    for (i = 0; i < joints.length; i++) {
        joints[i].enableMotor();
        joints[i].setMotorSpeed(0);
        joints[i].disableMotor();
        // joints[i].stiffness = 0
        // joints[i].motorMaxTorque = 0;
        joints[i].lowerLimitEnabled = true;
        joints[i].upperLimitEnabled = true;
        jointPowersThisFrame.push(0);
    }

    // Give joints the restrictions as defined earlier
    hipLeft.upperLimit = hipMaxAngle;
    hipLeft.lowerLimit = hipMinAngle;
    kneeLeft.upperLimit = kneeMaxAngle;
    kneeLeft.lowerLimit = kneeMinAngle;
    ankleLeft.upperLimit = ankleMaxAngle;
    ankleLeft.lowerLimit = ankleMinAngle;
    hipRight.upperLimit = hipMaxAngle;
    hipRight.lowerLimit = hipMinAngle;
    kneeRight.upperLimit = kneeMaxAngle;
    kneeRight.lowerLimit = kneeMinAngle;
    ankleRight.upperLimit = ankleMaxAngle;
    ankleRight.lowerLimit = ankleMinAngle;

    shoulderLeft.upperLimit = shoulderMaxAngle;
    shoulderLeft.lowerLimit = shoulderMinAngle;
    elbowLeft.upperLimit = elbowMaxAngle;
    elbowLeft.lowerLimit = elbowMinAngle;
    shoulderRight.upperLimit = shoulderMaxAngle;
    shoulderRight.lowerLimit = shoulderMinAngle;
    elbowRight.upperLimit = elbowMaxAngle;
    elbowRight.lowerLimit = elbowMinAngle;
}


function athleteFallen(body1,body2) {
    // console.log('failed: ' + body1.id + ' : ' + body2.id);
    jointsPower = false;
    for (i = 6; i < joints.length-1; i++) {
        joints[i].lowerLimitEnabled = false;
        joints[i].upperLimitEnabled = false;
    }
}

function toggleJointPower() {
    // Toggle joints holding their angle
    jointsPower = !jointsPower;
}

function resetRunner() {
    // Make the athlete controllable again
    jointsPower = true;

    // Move the body parts back to the start  position as calculated earlier.
    upperLegLeft.body.x = upperLegLeftX;
    upperLegLeft.body.y = upperLegLeftY;
    lowerLegLeft.body.x = lowerLegLeftX;
    lowerLegLeft.body.y = lowerLegLeftY;
    shoeLeft.body.x = shoeLeftX;
    shoeLeft.body.y = shoeLeftY;
    upperLegLeft.body.rotation = -upperLegLeftAngle;
    lowerLegLeft.body.rotation = -lowerLegLeftAngle;
    shoeLeft.body.rotation = -shoeLeftAngle;
    upperLegRight.body.x = upperLegRightX;
    upperLegRight.body.y = upperLegRightY;
    lowerLegRight.body.x = lowerLegRightX;
    lowerLegRight.body.y = lowerLegRightY;
    shoeRight.body.x = shoeRightX;
    shoeRight.body.y = shoeRightY;
    upperLegRight.body.rotation = -upperLegRightAngle;
    lowerLegRight.body.rotation = -lowerLegRightAngle;
    shoeRight.body.rotation = -shoeRightAngle;

    upperArmLeft.body.x = upperArmLeftX;
    upperArmLeft.body.y = upperArmLeftY;
    lowerArmLeft.body.x = lowerArmLeftX;
    lowerArmLeft.body.y = lowerArmLeftY;
    upperArmLeft.body.rotation = -upperArmLeftAngle;
    lowerArmLeft.body.rotation = -lowerArmLeftAngle;
    upperArmRight.body.x = upperArmRightX;
    upperArmRight.body.y = upperArmRightY;
    lowerArmRight.body.x = lowerArmRightX;
    lowerArmRight.body.y = lowerArmRightY;
    upperArmRight.body.rotation = -upperArmRightAngle;
    lowerArmRight.body.rotation = -lowerArmRightAngle;

    torso.body.rotation = 0;
    torso.body.x = torsoX;
    torso.body.y = torsoY;
    head.body.rotation = 0;
    head.body.x = headX;
    head.body.y = headY;

    for (i = 0; i < sprites.length; i++) {
        sprites[i].body.velocity.x = 0;
        sprites[i].body.velocity.y = 0;
        sprites[i].body.angularVelocity = 0;
    }
    // Make joints have constraints again
    for (i = 0; i < joints.length; i++) {
        joints[i].lowerLimitEnabled = true;
        joints[i].upperLimitEnabled = true;
    }
}

function render() {
    // game.debug.text('Press E to restart, and T to toggle joint rigidity.', 32, 32);
    // game.debug.text('Torso x: ' + torso.x, 620, 32);

    // game.debug.cameraInfo(game.camera, 64, 96);

    if (!jointsPower) {
        // game.debug.text('Joints are not rigid.', 300, 64);
    }
    if (Phaser.Math.difference (Phaser.Math.radToDeg(torso.body.rotation),0) < stabalisingAngle) {
        // game.debug.text('Applying balancing force.', 32, 64);
    }
}

function applyAngularForce(spriteA, spriteB, force) {
    // Check that the force is non-zero
    if (force == 0) {
        return;
    }
    // and apply the angular force
    spriteA.body.applyForce([0,-force],spriteA.body.x,spriteA.body.y);
    spriteB.body.applyForce([0, force],spriteB.body.x,spriteB.body.y);
}

function setAll(a, v) {
    var i, n = a.length;
    for (i = 0; i < n; ++i) {
        a[i] = v;
    }
}

function distanceTraveled() {
    return Math.floor((torso.x - torsoX)/20)/10;
}

var stabalisingPower = 10;
var stabalisingAngle = 40;
var hipPower = 1;
var jointsPower = true;
 
function update() {

    // Help the athlete stay upright
    if (Phaser.Math.difference (Phaser.Math.radToDeg(torso.body.rotation),0) < stabalisingAngle) {
        // torso.body.rotation *= 1 - 0.01; // 0.001
    }

    
    // Move the camera to the athlete
    game.camera.x = Math.max(torso.x - gameWidth/2);

    // Update Score Text // Math.round(game.time.now)
    scoreText.text = distanceTraveled().toFixed(1) + " m";


    // Interesting half way between power and not
    // jointsPower = !jointsPower;     

    // Power the muscles
    setAll(jointPowersThisFrame,0); // Hip knee ankle hip knee ankle
    jointPowersThisFrame[0] = (SKey.isDown || WKey.isDown) ?  1 : jointPowersThisFrame[0];
    jointPowersThisFrame[0] = (DKey.isDown || QKey.isDown) ? -1 : jointPowersThisFrame[0];
    jointPowersThisFrame[1] = (AKey.isDown || PKey.isDown) ?  1 : jointPowersThisFrame[1];
    jointPowersThisFrame[1] = (FKey.isDown || OKey.isDown) ? -1 : jointPowersThisFrame[1];
    jointPowersThisFrame[3] = (JKey.isDown || QKey.isDown) ?  1 : jointPowersThisFrame[3];
    jointPowersThisFrame[3] = (KKey.isDown || WKey.isDown) ? -1 : jointPowersThisFrame[3];
    jointPowersThisFrame[4] = (HKey.isDown || OKey.isDown) ?  1 : jointPowersThisFrame[4];
    jointPowersThisFrame[4] = (LKey.isDown || PKey.isDown) ? -1 : jointPowersThisFrame[4];

    jointPowersThisFrame[6] = (SKey.isDown || WKey.isDown) ? -1 : jointPowersThisFrame[6];
    jointPowersThisFrame[6] = (DKey.isDown || QKey.isDown) ?  1 : jointPowersThisFrame[6];
    // jointPowersThisFrame[7] = (AKey.isDown || PKey.isDown) ? -1 : jointPowersThisFrame[7];
    // jointPowersThisFrame[7] = (FKey.isDown || OKey.isDown) ?  1 : jointPowersThisFrame[7];
    jointPowersThisFrame[8] = (JKey.isDown || QKey.isDown) ? -1 : jointPowersThisFrame[8];
    jointPowersThisFrame[8] = (KKey.isDown || WKey.isDown) ?  1 : jointPowersThisFrame[8];
    // jointPowersThisFrame[9] = (HKey.isDown || OKey.isDown) ? -1 : jointPowersThisFrame[9];
    // jointPowersThisFrame[9] = (LKey.isDown || PKey.isDown) ?  1 : jointPowersThisFrame[9];

    // Cheats for camera checking
    if (JKey.isDown) {
        torso.body.velocity.x = 400;
        torso.body.velocity.y = -100;
    }

    for (i = 0; i < joints.length; i++) {
        if ((i!=2)&&(i!=5)&&(i<10)&&jointsPower){
            joints[i].enableMotor();
            joints[i].setMotorSpeed(muscleMotorPower*jointPowersThisFrame[i]);
        } else {
            // If power isn't allowed to the joints, just let them flop.
            joints[i].disableMotor();
        }
    }
}


