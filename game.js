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
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
var player;
var isMovingLeft = false;
var isMovingRight = false;
var isJumping = false;
var guitar;
var cursors;
var currentlyOverlapping = false;
var hasReachedGuitar = false;

var scaleFactor = winHeight / 1024;

const cameraMinX = 0;
const cameraMaxX = winHeight - winWidth;

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
  this.load.spritesheet("player", "assets/happy_sprite.png", { frameWidth: 64, frameHeight: 64 });
  this.load.spritesheet("guitar", "assets/guitar_sprite.png", { frameWidth: 128, frameHeight: 128 });
  var joy_url = "plugins/rexvirtualjoystickplugin.min.js";
  this.load.plugin("rexvirtualjoystickplugin", joy_url, true);
}

function create() {
  this.background = this.add.image(winHeight / 2, winHeight / 2, "background");
  this.background.setDisplaySize(winHeight, winHeight);

  var platforms = this.physics.add.staticGroup();
  platforms
    .create(winHeight / 2, winHeight * 0.935, "ground")
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

  player = this.physics.add.sprite(winHeight * 0.3, winHeight * 0.3, "player");
  // player = this.physics.add.sprite(winHeight * 0.1, winHeight * 0.8, "player");
  player.body.setSize(54, 64);
  player.body.setOffset(5, 0);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.setScale(scaleFactor * 1.3).refreshBody();
  this.cameras.main.scrollY = 0;

  this.physics.add.collider(player, platforms);
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
    frameRate: 12,
    repeat: -1,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("player", { start: 2, end: 3 }),
    frameRate: 12,
    repeat: -1,
  });

  guitar = this.physics.add.sprite(winHeight * 0.1, winHeight * 0.35, "guitar");
  guitar.setScale(scaleFactor * 1.3).refreshBody();
  guitar.body.setSize(100, 100);
  this.physics.add.collider(guitar, platforms);
  this.physics.add.overlap(player, guitar, reachGuitar, null, this);
  var frames = [];
  for (var i = 0; i < 8; i++) {
    frames.push({ key: "guitar", frame: i });
  }
  for (var i = 7; i >= 0; i--) {
    frames.push({ key: "guitar", frame: i });
  }
  this.anims.create({
    key: "glowing",
    frames: frames,
    frameRate: 8,
    repeat: -1,
  });
  guitar.anims.play("glowing", true);

  if (winHeight > winWidth) {
    var jump_button_x = winWidth * 1.25;
    var buttons_y = winHeight * 0.9;
    var left_button_x = winWidth * 0.6;
    var right_button_x = winWidth * 0.89;
    var jumpButtonObject = this.add.circle(jump_button_x, buttons_y, 50, 0x888888).setScrollFactor(0).setInteractive();
    jumpButtonObject.setAlpha(0.9);
    var text = this.add.text(jump_button_x, buttons_y, "jump", { color: "#fff", align: "center" }).setOrigin(0.5, 0.5).setScrollFactor(0);
    jumpButtonObject.on("pointerdown", () => (isJumping = true));
    jumpButtonObject.on("pointerup", () => (isJumping = false));

    var cursor_button_size = 40;
    var leftButtonObject = this.add.circle(left_button_x, buttons_y, cursor_button_size, 0x888888).setScrollFactor(0).setInteractive();
    leftButtonObject.on("pointerdown", () => (isMovingLeft = true));
    leftButtonObject.on("pointerup", () => (isMovingLeft = false));
    var text2 = this.add.text(left_button_x, buttons_y, "<", { color: "#fff", align: "center" }).setOrigin(0.5, 0.5).setScrollFactor(0);
    jumpButtonObject.on("pointerdown", () => (isJumping = true));
    jumpButtonObject.on("pointerup", () => (isJumping = false));

    var rightButtonObject = this.add.circle(right_button_x, buttons_y, cursor_button_size, 0x888888).setScrollFactor(0).setInteractive();
    rightButtonObject.on("pointerdown", () => (isMovingRight = true));
    rightButtonObject.on("pointerup", () => (isMovingRight = false));
    var text2 = this.add.text(right_button_x, buttons_y, ">", { color: "#fff", align: "center" }).setOrigin(0.5, 0.5).setScrollFactor(0);
    jumpButtonObject.on("pointerdown", () => (isJumping = true));
    jumpButtonObject.on("pointerup", () => (isJumping = false));
  }

  cursors = this.input.keyboard.createCursorKeys();
  jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  currentlyOverlapping = this.physics.world.overlap(player, guitar);

  if (cursors.left.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
  }

  if ((cursors.up.isDown || jumpKey.isDown || spaceBar.isDown) && player.body.touching.down) {
    player.setVelocityY(-300);
  }

  if (winHeight > winWidth) {
    if (this.joystick) {
      var force = this.joystick.force;
      var angle = this.joystick.angle;

      if (force !== 0) {
        this.player.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
      }
    }

    if (isMovingLeft) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
    } else if (isMovingRight) {
      player.setVelocityX(160);
      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);
    }

    if (isJumping && player.body.touching.down) {
      player.setVelocityY(-300);
    }

    this.cameras.main.scrollY = 0;
    let playerX = player.x;
    let minX = winWidth / 2;
    let maxX = winHeight - winWidth / 2;
    let cameraX = Phaser.Math.Clamp(playerX, minX, maxX);
    this.cameras.main.scrollX = cameraX - this.cameras.main.width / 2;
  }
}

// .88b  d88.  .d88b.  d8888b.  .d8b.  db      .d8888.
// 88'YbdP`88 .8P  Y8. 88  `8D d8' `8b 88      88'  YP
// 88  88  88 88    88 88   88 88ooo88 88      `8bo.
// 88  88  88 88    88 88   88 88~~~88 88        `Y8b.
// 88  88  88 `8b  d8' 88  .8D 88   88 88booo. db   8D
// YP  YP  YP  `Y88P'  Y8888D' YP   YP Y88888P `8888Y'

// Close modal functionality
document.querySelectorAll(".close").forEach((element) => {
  element.onclick = function () {
    this.parentElement.parentElement.style.display = "none";
  };
});

// Simple carousel functionality (consider using a library for a full-featured carousel)
let currentImageIndex = 0;
function showImage(index) {
  let images = document.querySelectorAll("#imageCarouselWindow .carousel img");
  images.forEach((img, i) => {
    img.style.display = i === index ? "block" : "none";
  });
}

// Call this function to cycle through images
function nextImage() {
  let images = document.querySelectorAll("#imageCarouselWindow .carousel img");
  currentImageIndex = (currentImageIndex + 1) % images.length;
  showImage(currentImageIndex);
}

// Display the first image initially
showImage(0);

function reachGuitar() {
  if (!hasReachedGuitar) {
    console.log("reached guitar");
    document.getElementById("videoWindow").style.display = "block";
    document.getElementById("imageCarouselWindow").style.display = "block";
    document.getElementById("textWindow").style.display = "block";
    setInterval(nextImage, 10000); // Change image every 3 seconds
  }
  hasReachedGuitar = true;
  if (!currentlyOverlapping) {
    hasReachedGuitar = false;
  }
}

/*                                                                           
    //    ) )                                                                
   //    / /  __      ___      ___      ___      ___     / __     //  ___    
  //    / / //  ) ) //   ) ) //   ) ) //   ) ) //   ) ) //   ) ) // //___) ) 
 //    / / //      //   / / ((___/ / ((___/ / //   / / //   / / // //        
//____/ / //      ((___( (   //__     //__   ((___( ( ((___/ / // ((____     */

function makeDraggable(modalSelector) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  var modals = document.querySelectorAll(modalSelector);

  modals.forEach(function (modal) {
    // Move the modal content on mousedown
    modal.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      modal.style.top = modal.offsetTop - pos2 + "px";
      modal.style.left = modal.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  });
}

// Call the function for your modals
document.addEventListener("DOMContentLoaded", function () {
  makeDraggable(".modal-window");
});

//   #####
//  #     #   ##   #####   ####  #    #  ####  ###### #
//  #        #  #  #    # #    # #    # #      #      #
//  #       #    # #    # #    # #    #  ####  #####  #
//  #       ###### #####  #    # #    #      # #      #
//  #     # #    # #   #  #    # #    # #    # #      #
//   #####  #    # #    #  ####   ####   ####  ###### ######

// Function to show the next image
function nextImage() {
  let images = document.querySelectorAll("#imageCarouselWindow .carousel img");
  currentImageIndex = (currentImageIndex + 1) % images.length;
  showImage(currentImageIndex);
}

// Function to show the previous image
function previousImage() {
  let images = document.querySelectorAll("#imageCarouselWindow .carousel img");
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length; // Ensure the index stays within bounds
  showImage(currentImageIndex);
}

// Set up click event listeners for the arrows
document.querySelector("#imageCarouselWindow .carousel-control.left").addEventListener("click", previousImage);
document.querySelector("#imageCarouselWindow .carousel-control.right").addEventListener("click", nextImage);
