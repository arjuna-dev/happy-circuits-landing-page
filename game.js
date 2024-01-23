var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var config = {
  type: Phaser.AUTO,
  width: winHeight,
  height: winHeight,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
var player;
var cursors;

var scaleFactor = winHeight / 1024;

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("ground", "assets/platforms/platform.png");
  this.load.image("platform_block", "assets/platforms/platform_block.png");
  this.load.image("platform_extra_medium", "assets/platforms/platform_extra_medium.png");
  this.load.image("platform_long", "assets/platforms/platform_long.png");
  this.load.image("platform_medium", "assets/platforms/platform_medium.png");
  this.load.image("platform_square", "assets/platforms/platform_square.png");
  this.load.image("platform_thin", "assets/platforms/platform_thin.png");
  this.load.image("platform_two_blocks", "assets/platforms/platform_two_blocks.png");
  this.load.image("platform_funky", "assets/platforms/platform_funky.png");
  this.load.image("sphere", "assets/sphere.png");
  this.load.spritesheet("player", "assets/happy_sprite.png", { frameWidth: 64, frameHeight: 64 });
}

function create() {
  this.background = this.add.image(winHeight / 2, winHeight / 2, "background");
  this.background.setDisplaySize(winHeight, winHeight);

  var platforms = this.physics.add.staticGroup();
  platforms
    .create(winHeight / 2, winHeight - 60, "ground")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.1, winHeight / 2, "platform_block")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.86, winHeight * 0.65, "platform_extra_medium")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.2, winHeight * 0.2, "platform_long")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.86, winHeight * 0.35, "platform_medium")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight / 2, winHeight / 2, "platform_square")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.86, winHeight, "platform_thin")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.6, winHeight * 0.78, "platform_two_blocks")
    .setScale(scaleFactor)
    .refreshBody();

  platforms
    .create(winHeight * 0.35, winHeight * 0.6, "platform_funky")
    .setScale(scaleFactor)
    .refreshBody();

  player = this.physics.add.sprite(winHeight * 0.1, winHeight * 0.8, "player");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.setScale(scaleFactor * 1.3).refreshBody();
  this.physics.add.collider(player, platforms);

  var sphere = this.physics.add.staticGroup();
  sphere.create(winHeight * 0.1, winHeight * 0.4, "sphere");
  this.physics.add.overlap(player, sphere, reachSphere, null, this);

  cursors = this.input.keyboard.createCursorKeys();
  jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  if (cursors.left.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if ((cursors.up.isDown || jumpKey.isDown || spaceBar.isDown) && player.body.touching.down) {
    player.setVelocityY(-300);
  }

  if ((cursors.up.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) && player.body.touching.down) {
    player.setVelocityY(-300);
  }
}

function reachSphere(player, sphere) {
  // Pause the game or bring up a modal with project info
  showProjectInfo();
}

function showProjectInfo() {
  var modal = document.getElementById("projectInfoModal");
  modal.style.display = "block";

  var closeButton = document.getElementById("closeModal");
  closeButton.onclick = function () {
    modal.style.display = "none";
  };
}
