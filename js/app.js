// Enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // The starting position of the enemy. They start to the left of the canvas.
    this.x = -25;

    // Use Math.random() to randomly generate 0, 1 or 2. 
    // This is used to randomly place enemies on the first, second or third level of the 'street'
    // Since blocks are 83px high, we choose between the three enemy 'levels' with 50 + 83 * (random number)
    var randomY = 50 + 83 * Math.floor(Math.random() * 3);
    this.y = randomY;

    // Speed is also randomly generated. Between 100 and 400.
    var speed = Math.floor(Math.random() * 300 + 100);
    this.speed = speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + this.speed * dt;

    // this.reset() checks if the bug has moved all the way to the right,
    // and if so, starts them off at a random level on the left again
    this.reset();

    // Check for collisions with the player with collisionCheck()
    this.collisionCheck();
};

/* 
To check for collisions, we first check if the player and enemy are on the same
height (same this.y level). If so, we also check if the absolute distance between
the enemy's and player's 'x' location is less than 51px. 
If so, use player.reset() to move the player back to the start position,
and reset scoreboard.score to 0.
*/
Enemy.prototype.collisionCheck = function() {
    if (this.y == player.y && Math.abs(this.x - player.x) < 51) {
        player.reset();
        scoreboard.score = 0;
    }

    /* Reset the item if an enemy touches the item.   
     * I make sure that item.x - this.x is between 20 and 51, as opposed to an absolute
     * distance of less than 51, because when the item appears on the 'tail' of the bug,
     * then I do not want it to instantly disappear. 
     */
    if (item.visible && this.y == item.y && item.x - this.x < 51 && item.x - this.x > 20) {
        item.reset();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset the enemy's position and speed if he's moved off the screen
Enemy.prototype.reset = function() {
    // If the bug is all the way to the right
    if (this.x > 500) {
        // Starts all the way to the left again
        this.x = -25;

        // Starts in any one of the three levels of the street, at random
        var randomY = 50 + 83 * Math.floor(Math.random() * 3);
        this.y = randomY;

        // Gets a speed between 100 and 400 at random
        var speed = Math.floor(Math.random() * 300 + 100);
        this.speed = speed;
    }
};

// The Player class
var Player = function() {
    // I've chosen the char-boy sprite, because I'm a boy
    this.sprite = 'images/char-boy.png';

    //initial location: The player always starts here
    this.x = 202;
    this.y = 50 + 3 * 83;
};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset the player to his usual starting position
Player.prototype.reset = function() {
    this.x = 202;
    this.y = 50 + 3 * 83;
};

// handleInput method, using the allowed keys to move the player around
Player.prototype.handleInput = function(allowedKeys) {
    /* 
    Moves player around within the confines of the game.
    This does not allow the player to move off the screen,
    but it does allow the player to move into the water.
    */
    if (allowedKeys == 'left' && this.x > 0) this.x = this.x - 101;
    else if (allowedKeys == 'right' && this.x < 404) this.x = this.x + 101;
    else if (allowedKeys == 'up' && this.y > 0) this.y = this.y - 83;
    else if (allowedKeys == 'down' && this.y < 382) this.y = this.y + 83;

    // If the player has reached the water (this.y will be -33)
    // Then we reset the player and add points to the scoreboard
    if (this.y < 0) {
        this.reset();
        scoreboard.score += 100;
    }
};

// The scoreboard. It's relatively simple. It just has a score that render() will show
var Scoreboard = function() {
    this.score = 0;
};

// Show the score in the topright of the screen, in 30px Impact font.
Scoreboard.prototype.render = function() {
    ctx.font = "30px Impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + this.score, 350, 100); 
};

// Items are gems that appear randomly in the street. 
// Both enemies and the player can get them.
// They appear at random times, using the dt variable to count down
var Item = function() {
    /* Use Math.random() to randomly generate X and Y values that are in any
     of the 'street' blocks. */
    var randomX = 101 * Math.floor(Math.random() * 4);
    var randomY = 50 + 83 * Math.floor(Math.random() * 3);

    this.x = randomX;
    this.y = randomY;

    // Any of the three gems can appear, so I put the three sprites in an object
    this.sprite = { 
        'blue' : 'images/Gem-Blue.png',
        'green' : 'images/Gem-Green.png',
        'orange' : 'images/Gem-Orange.png'
    };

    // The first gem is always the blue gem.
    this.color = 'blue';

    /* Extra items are not visible all the time. Initially, the item will be invisible */
    this.visible = false;

    /* The wait until a new item becomes visible is random! */
    this.wait = Math.floor(Math.random() * 15);
};

// update() makes the gem visible if the waiting time is up and then checks for collisions.
Item.prototype.update = function(dt) {
    // The update function counts down the waiting time using dt.
    // Once the waiting time is up, the item becomes visible
    this.wait -= dt;
    if (this.wait < 0) {
        this.visible = true;
    }

    // Only once the item is visible will it be checked for collisions
    if (this.visible) {
        this.collisionCheck();
    }
};

// Render the sprite. This only happens if it's this.visible variable is true
Item.prototype.render = function() {
    if (this.visible) {
        // We use the this.color to decide which sprite to choose from this.sprite
        ctx.drawImage(Resources.get(this.sprite[this.color]), this.x, this.y);
    }
};

/* We check if the player has collided with the item.
 * This can be an exact collision (x and y numbers are exactly equal), because players
 * and items only ever exist in the center of squares.
 * The score depends on the scarcity of the item: blue gets 100 points and orange 500.
 * After awarding the points, the item is reset.
 */
Item.prototype.collisionCheck = function() {
    if (this.y == player.y && this.x == player.x) {
        if (this.color == 'blue') {
            scoreboard.score += 100;
        } else if (this.color == 'green') {
            scoreboard.score += 200;
        } else if (this.color == 'orange') {
            scoreboard.score += 500;
        }

        item.reset();
    }
};

// The reset function for when either enemies or the player hits an item
Item.prototype.reset = function() {
    /* Use Math.random() to randomly generate X and Y values that are in any
     of the 'street' blocks. */
    var randomX = 101 * Math.floor(Math.random() * 4);
    var randomY = 50 + 83 * Math.floor(Math.random() * 3);

    this.x = randomX;
    this.y = randomY;

    /* Extra items are not visible all the time. Initially, the item will be invisible */
    this.visible = false;

    // The color is decided randomly: Orange will appear the least frequently, blue the most
    var random = Math.random() * 10;
    if (random > 9) {
        this.color = 'orange';
    } else if (random > 6) {
        this.color = 'green';
    } else {
        this.color = 'blue';
    }

    /* The wait until a new item becomes visible is random! */
    this.wait = Math.floor(Math.random() * 15);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy());
}

var player = new Player();

// Additionally, also initialize the scoreboard and item
var scoreboard = new Scoreboard();
var item = new Item();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
