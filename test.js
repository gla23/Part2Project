
var game = new Phaser.Game(960, 540, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render});

function preload() {

    game.load.image('body', 'assets/lowerLeg.png');
    game.load.image('limb', 'assets/lowerLeg.png');
    game.load.image('shoe', 'assets/nikey.png');
    game.load.image('background', 'assets/sky.png ');
}

var torso, upperLegLeft, upperLegRight;
var lowerLegLeft, lowerLegRight;
var QKey, WKey, OKey, PKey, ResetRunnerKey;
var JKey, KKey, HKey, LKey, SKey, DKey, AKey, FKey;

// Specifies the correct joint constraints
var  hipMaxAngle = Phaser.Math.degToRad( 105);
var  hipMinAngle = Phaser.Math.degToRad(-20 );
var kneeMaxAngle = Phaser.Math.degToRad( 2  );
var kneeMinAngle = Phaser.Math.degToRad(-115);
var ankleMaxAngle = Phaser.Math.degToRad( 20);
var ankleMinAngle = Phaser.Math.degToRad(-20);

var bodyScale = 0.8;
var legSeperator = 11*bodyScale;

var torsoMass = 3;

function create() {

    // Set-up game
    back = game.add.image(0, 0, 'background'); 
    back.width = 960;
    back.height = 540;

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
    
    // Define variables specifying the model of the body
    torsoX = 500;
    torsoY = 130;

    musclePower *= bodyScale;
    var torsoHeight = 180*bodyScale;
    var torsoWidth = 70*bodyScale;

    var upperLegHeight = 130*bodyScale;
    var upperLegWidth = 25*bodyScale;
    var lowerLegHeight = 120*bodyScale;
    var lowerLegWidth = 18*bodyScale;
    
    upperLegLeftAngle = Phaser.Math.degToRad(-5);
    lowerLegLeftAngle = Phaser.Math.degToRad(-35) + upperLegLeftAngle;
    shoeLeftAngle     = Phaser.Math.degToRad( 20) + lowerLegLeftAngle;

    upperLegRightAngle = Phaser.Math.degToRad( 35);
    lowerLegRightAngle = Phaser.Math.degToRad(-35) + upperLegRightAngle;
    shoeRightAngle     = Phaser.Math.degToRad( 20) + lowerLegRightAngle;

    shoeSize = 100*bodyScale;
    shoeLegDistance = 10*bodyScale;
    shoeXOffset = 20*bodyScale;


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


    // Add the sprites in the position as if all the angles were 0
    torso         = game.add.sprite(torsoX, torsoY, 'limb');
    upperLegLeft  = game.add.sprite(upperLegLeftStartX,upperLegLeftStartY+upperLegHeight/2, 'limb');
    lowerLegLeft  = game.add.sprite(upperLegLeftStartX,upperLegLeftStartY+upperLegHeight+lowerLegHeight/2, 'limb');
    shoeLeft      = game.add.sprite(upperLegLeftStartX+shoeXOffset,upperLegLeftStartY+upperLegHeight+lowerLegHeight+shoeLegDistance, 'shoe');
    upperLegRight = game.add.sprite(upperLegRightStartX,upperLegRightStartY+upperLegHeight/2, 'limb');
    lowerLegRight = game.add.sprite(upperLegRightStartX,upperLegRightStartY+upperLegHeight+lowerLegHeight/2, 'limb');
    shoeRight     = game.add.sprite(upperLegRightStartX+shoeXOffset,upperLegRightStartY+upperLegHeight+lowerLegHeight+shoeLegDistance, 'shoe');
    var sprites = [torso, upperLegLeft, lowerLegLeft, shoeLeft, upperLegRight, lowerLegRight, shoeRight]

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

    
    // Start the P2 Physics engine and add the sprites to it.
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = gravity;
    game.physics.p2.enable([torso, upperLegLeft, lowerLegLeft, shoeLeft, upperLegRight, lowerLegRight, shoeRight]);
    torso.body.mass *= torsoMass;

    shoeLeft.body.setRectangle(shoeSize,shoeSize/10,0,shoeSize/40*9-shoeSize/15);
    shoeRight.body.setRectangle(shoeSize,shoeSize/10,0,shoeSize/40*9-shoeSize/15);

    // Create collision groups so that the limbs do not collide with each other
    var athleteCollisionGroup = game.physics.p2.createCollisionGroup();
    game.physics.p2.updateBoundsCollisionGroup();

    for (var i = sprites.length - 1; i >= 0; i--) {
        sprites[i].body.friction = playerFriction;
        sprites[i].body.setCollisionGroup(athleteCollisionGroup);
    }

    
    // Once the body parts have been created move them into the desired start position as calculated earlier.
    resetRunner();

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
    
    joints = new Array(hipLeft,kneeLeft,ankleLeft,hipRight,kneeRight,ankleRight);
    jointPowersThisFrame = new Array();


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
}

function toggleJointPower() {
    // Toggle joints holding their angle
    jointsPower = !jointsPower;
}

function resetRunner() {
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

    torso.body.rotation = 0;
    torso.body.x = torsoX;
    torso.body.y = torsoY;
}

function render() {
    game.debug.text('Press E to restart, and T to toggle joint rigidity.', 32, 32);
    if (!jointsPower) {
        game.debug.text('Joints are not rigid.', 300, 64);
    }
    if (Phaser.Math.difference (Phaser.Math.radToDeg(torso.body.rotation),0) < stabalisingAngle) {
        game.debug.text('Applying balancing force.', 32, 64);
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

var gravity = 600;
var muscleMotorPower = 3;
var musclePower = 18; //175 with motor, 15 without
var stabalisingPower = 10;
var stabalisingAngle = 40;
var playerFriction = 1000;
var hipPower = 1;
var jointsPower = true;

function update() {

    // Help the runner stay upright
    if (Phaser.Math.difference (Phaser.Math.radToDeg(torso.body.rotation),0) < stabalisingAngle) {
        torso.body.rotation *= 1 - 0.01 ; 0.001
    }
    
    // Interesting half way between power and not
    // jointsPower = !jointsPower;     

    // Power the muscles
    setAll(jointPowersThisFrame,0); // Hip knee ankle hip knee ankle
    jointPowersThisFrame[0] = (SKey.isDown || QKey.isDown) ?  1 : jointPowersThisFrame[0];
    jointPowersThisFrame[0] = (DKey.isDown || WKey.isDown) ? -1 : jointPowersThisFrame[0];
    jointPowersThisFrame[1] = (AKey.isDown || PKey.isDown) ?  1 : jointPowersThisFrame[1];
    jointPowersThisFrame[1] = (FKey.isDown || OKey.isDown) ? -1 : jointPowersThisFrame[1];
    jointPowersThisFrame[3] = (JKey.isDown || WKey.isDown) ?  1 : jointPowersThisFrame[3];
    jointPowersThisFrame[3] = (KKey.isDown || QKey.isDown) ? -1 : jointPowersThisFrame[3];
    jointPowersThisFrame[4] = (HKey.isDown || OKey.isDown) ?  1 : jointPowersThisFrame[4];
    jointPowersThisFrame[4] = (LKey.isDown || PKey.isDown) ? -1 : jointPowersThisFrame[4];

    // applyAngularForce(torso,upperLegLeft, jointPowersThisFrame[0]*musclePower*hipPower);
    // applyAngularForce(upperLegLeft,lowerLegLeft, jointPowersThisFrame[1]*musclePower);
    // applyAngularForce(torso,upperLegRight, jointPowersThisFrame[3]*musclePower*hipPower);
    // applyAngularForce(upperLegRight,lowerLegRight, jointPowersThisFrame[4]*musclePower);

    for (i = 0; i < joints.length; i++) {
        if ((i!=2)&&(i!=5)&&jointsPower) {
            joints[i].enableMotor();
            joints[i].setMotorSpeed(muscleMotorPower*jointPowersThisFrame[i]);
        } else {
            // If power isn't allowed to the joints, just let them flop.
            joints[i].disableMotor();
        }
    }
}


