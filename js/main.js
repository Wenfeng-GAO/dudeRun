// var width = document.getElementById("game").innerWidth;
// var width = window.innerWidth;
var width = 1200;
var height = 500;

var runner = null;
// var ledge = null;
var stars = null;
var obstacles = null;

var v = -100;
// var h = height - 100;

var score = 0;
var scoreText = null;


// var game = new Phaser.Game(width, height, Phaser.AUTO, "game", { preload: preload, create: create, update: update }, true);
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', true);

var PhaserGame = function () {
  
};

PhaserGame.prototype = {

    preload: function () {
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48); 
        game.load.image('obstacle', 'assets/obstacle.png'); 
    },


    create: function () {
        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.setTo(2, 2);

        //  The platforms group contains ledges we can jump on
        platforms = game.add.physicsGroup();
        // platforms.enableBody = true;

        //  Finally some stars to collect
        stars = game.add.physicsGroup();

        //  Now let's create ledges
        var x = width;
        var y = height / 4 * 3;

        for (var i = 0; i < 4; i++ )
        {
            var ledge = platforms.create(x, y, 'ground');
            ledge.scale.setTo(0.5, 0.5);
            ledge.body.velocity.x = v;

            var xStar = x;
            for (var j = 0; j < 3; j++)
            {
                xStar += Math.random() * 80;
                var star = stars.create(xStar, y - 50, 'star');
                star.body.velocity.x = v;
            }

            x += 200 + Math.random() * 100;
            y -= (80 + Math.random() * 30);
        }
        
        platforms.setAll('body.immovable', true);
        stars.setAll('body.immovable', true);

        // The runner and its settings
        runner = game.add.sprite(width / 4, height / 4, 'dude');
        //  We need to enable physics on the runner
        game.physics.arcade.enable(runner);
        runner.body.gravity.y = 750;
        runner.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        runner.animations.add('left', [0, 1, 2, 3], 10, true);
        runner.animations.add('right', [5, 6, 7, 8], 10, true);


        // Add some obstacles
        obstacles = game.add.physicsGroup();

        for (var i = 0; i < 10; i++) {
            var obstacle = obstacles.create(game.world.width + i * 300 + Math.random() * 80, game.world.height - 50, "obstacle");
            obstacle.scale.setTo(0.5, 0.8);
            obstacle.body.velocity.x = v;
        };

        obstacles.setAll('body.immovable', true);

        //  The score
        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    },

    setFriction: function (runner, platform) {

        runner.body.x -= platform.body.x - platform.body.prev.x;

    },

    freeze: function (obj) {
        v = 0;
        obj.body.velocity.x = v;
    },

    gameover: function (runner, obstacle) {

        label = game.add.text(game.world.width / 2 , game.world.height / 2, 'Score: '+score+'\nGAME OVER\nPress ENTER to restart',
            { font: '22px Lucida Console', fill: '#fff', align: 'center'});
        label.anchor.setTo(0.5, 0.5);

        platforms.forEach(this.freeze, this);
        obstacles.forEach(this.freeze, this);
        stars.forEach(this.freeze, this);
        runner.animations.stop();
        runner.frame = 4;

    },

    collectStar: function (runner, star) {
        
        // Removes the star from the screen
        // star.kill();
        star.body.x = width / 4 * 5;

        //  Add and update the score
        score += 10;
        scoreText.text = 'Score: ' + score;

    },

    wrapPlatform: function (platform) {

        if (platform.x < -platform.body.width)
        {
            platform.body.x = width;
        }

    },

    wrapStar: function (star) {

        if (star.x < -star.body.width)
        {
            star.body.x = width;
        }

    },

    wrapObstacle: function (obstacle) {

        if (obstacle.x < -obstacle.body.width)
        {
            obstacle.body.x = width;
        }

    },


    update: function () {
        //  Collide the runner and the stars with the platforms
        game.physics.arcade.collide(runner, platforms, this.setFriction, null, this);
        game.physics.arcade.collide(runner, stars, this.collectStar, null, this);
        game.physics.arcade.collide(runner, obstacles, this.gameover, null, this);

        // Movement of runner
        runner.body.velocity.x = 0;
        if (v !== 0)
        {
            runner.animations.play('right');
        }

        var standing = runner.body.blocked.down || runner.body.touching.down;
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && standing) {
            runner.body.velocity.y = -500;
        }
        if (!standing && v !== 0) {
            runner.animations.stop();
            runner.frame = 6;
        }

        // Reuse the platforms stars and obstacles
        platforms.forEach(this.wrapPlatform, this);
        stars.forEach(this.wrapStar, this);
        obstacles.forEach(this.wrapObstacle, this);

        if (v === 0 && game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            game.state.start(game.state.current);
            v = -100;
        }
    },

};

game.state.add('Game', PhaserGame, true);













