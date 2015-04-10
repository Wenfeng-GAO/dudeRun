var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48); 
    game.load.spritesheet('obstacle', 'assets/obstacle.png', 12, 50); 
    game.load.spritesheet('gameover', 'assets/gameover.png'); 

}

var runner;
var ledge;
var obstacles;
var v = -100;
var h = 400 + Math.random() * 50;

var stars;
var score = 0;
var scoreText;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height-2, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    ledge = platforms.create(0, h, 'ground');
    ledge.scale.setTo(0.5, 0.5);
    ledge.body.immovable = true;

    // The runner and its settings
    runner = game.add.sprite(32, h, 'dude');

    //  We need to enable physics on the runner
    game.physics.arcade.enable(runner);

    //  runner physics properties. Give the little guy a slight bounce.
    runner.body.bounce.y = 0;
    runner.body.gravity.y = 600;
    runner.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    runner.animations.add('left', [0, 1, 2, 3], 10, true);
    runner.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 3; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, h - 20, 'star');

    }

    // Add some obstacles
    obstacles = game.add.group();
    obstacles.enableBody = true;
    for (var i = 0; i < 10; i++) {
        var obstacle = obstacles.create(game.world.width + i * 200 + Math.random() * 80, game.world.height - 50, "obstacle");
    };


    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

}

function update() {

    //  Collide the runner and the stars with the platforms
    game.physics.arcade.collide(runner, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(runner, obstacles);

    //  Checks to see if the runner overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(runner, stars, collectStar, null, this);
    game.physics.arcade.overlap(runner, obstacles, gameover, null, this);

    // Movement of runner
    runner.body.velocity.x = 0;
    runner.animations.play('right');
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && runner.body.touching.down) {
        runner.body.velocity.y = -500;
    }
    if (!runner.body.touching.down) {
        runner.animations.stop();
        runner.frame = 6;
    }

    // Movement of  the environment
    for (var i = stars.children.length - 1; i >= 0; i--) {
        var star = stars.children[i];
        star.body.velocity.x = v;
        if (star.body.x < -star.width) {
            star.body.x = game.world.width;
        }
    }

    ledge.body.velocity.x = v;
    if (ledge.body.x < -ledge.width) {
        ledge.body.x = game.world.width;
    }

    for (var i = obstacles.children.length - 1; i >= 0; i--) {
        var obstacle = obstacles.children[i];
        obstacle.body.velocity.x = v;
        if (obstacle.body.x < -obstacle.width) {
            obstacle.body.x = game.world.width;
        }
    }




}

function gameover () {
    v = 0; // Freese the game
    label = game.add.text(game.world.width / 2 , game.world.height / 2, 'Score: '+score+'\nGAME OVER\nPress SPACE to restart',
        { font: '22px Lucida Console', fill: '#fff', align: 'center'});
    label.anchor.setTo(0.5, 0.5);

}

function collectStar (runner, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}