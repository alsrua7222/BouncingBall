var game;
var gameOptions = {
    bounceHeight: 300,
    ballGravity: 2000,
    ballPower: 1500,
    obstacleSpeed: 250,
    obstacleDistanceRange: [100, 250],
    localStorageName: 'bestballscore'
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x87ceeb,
        pixelArt: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'thegame',
            width: 750,
            height: 500
        },
        physics: {
            default: 'arcade'
        },
        scene: playGame,
        audio:{
            disableWebAudio: true
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}
class playGame extends Phaser.Scene{
    constructor(){
        super('PlayGame');
    }
    preload(){
        this.load.image('ground', 'ground.png');
        this.load.image('ball', 'ball.png');
        this.load.image('obstacle', 'obstacle.png');
        this.load.audio('backgroundmusic', 'background.wav');
        this.load.audio('landing', 'landing05.wav');
    }
    create(){
        this.obstacleGroup = this.physics.add.group();
        this.firstBounce = 0;
        this.ground = this.physics.add.sprite(game.config.width / 2, game.config.height / 4 * 3, 'ground');
        this.ground.setImmovable(true);
        this.ball = this.physics.add.sprite(game.config.width / 10 * 2, game.config.height / 4 * 3 - gameOptions.bounceHeight, 'ball');
        this.ball.body.gravity.y = gameOptions.ballGravity;
        this.ball.setBounce(1);
        this.ball.setCircle(25);
        let obstacleX = game.config.width;
        for(let i = 0; i < 10; i++){
            let obstacle = this.obstacleGroup.create(obstacleX, this.ground.getBounds().top, 'obstacle');
            obstacle.setOrigin(0.5, 1);
            obstacle.setImmovable(true);
            obstacleX += Phaser.Math.Between(gameOptions.obstacleDistanceRange[0], gameOptions.obstacleDistanceRange[1])
        }
        this.obstacleGroup.setVelocityX(-gameOptions.obstacleSpeed);
        this.input.on('pointerdown', this.boost, this);
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.music_ld = this.sound.add('landing');
        this.music_bg = this.sound.add('backgroundmusic');
        this.music_bg.loop = true;
        this.music_bg.volume = 0.4;
        this.music_bg.play();
        this.updateScore(this.score);
    }
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }
    boost(){
        if(this.firstBounce != 0){
            this.ball.body.velocity.y = gameOptions.ballPower;
        }
    }
    getRightmostObstacle(){
        let rightmostObstacle = 0;
        this.obstacleGroup.getChildren().forEach(function(obstacle){
            rightmostObstacle = Math.max(rightmostObstacle, obstacle.x);
        });
        return rightmostObstacle;
    }
    update(){
        this.physics.world.collide(this.ground, this.ball, function(){
            if(this.firstBounce == 0){
                this.firstBounce = this.ball.body.velocity.y;
            }
            else{
                this.ball.body.velocity.y = this.firstBounce;
            }
            if(gameOptions.ballGravity >= 5000){
                this.ball.body.gravity.y = gameOptions.ballGravity;
                gameOptions.ballGravity += 100;
            }
            gameOptions.obstacleSpeed += 5;
            this.obstacleGroup.setVelocityX(-gameOptions.obstacleSpeed);
            this.music_ld.play();
        }, null, this);
        this.physics.world.collide(this.ball, this.obstacleGroup, function(){
            localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));

            gameOptions.ballGravity = 2000;
            gameOptions.obstacleSpeed = 250;
            this.scene.start('PlayGame');
        }, null, this);
        this.obstacleGroup.getChildren().forEach(function(obstacle){
            if(obstacle.getBounds().right < 0){
                this.updateScore(1);
                obstacle.x = this.getRightmostObstacle() + Phaser.Math.Between(gameOptions.obstacleDistanceRange[0], gameOptions.obstacleDistanceRange[1]);
            }
        }, this)
    }
}
