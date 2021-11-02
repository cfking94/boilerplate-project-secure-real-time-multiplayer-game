import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import {playField, randomPosition} from './Canvas.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

// ---------- ---------- functions ---------- ----------
// create image element
function createImage(src) {
  let img = new Image();
  img.src = src;

  return img;
}

// draw game
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  context.strokeStyle = 'white';
  context.strokeRect(
    playField.fieldMinX,
    playField.fieldMinY,
    playField.fieldWidth,
    playField.fieldHeight
  );

  // control buttons text
  context.fillStyle = 'white';
  context.font = '15px Arial';
  context.textAlign = 'center';
  context.fillText('Controls: WASD', 100, 32.5);

  // game title
  context.font = '20px Arial';
  context.fillText('Coin Race', playField.canvasWidth / 2, 32.5);

  // Calculate score and draw players each frame
  playerList.forEach(player => {
    player.draw(context, collectible, {mainP, enemyP}, playerList);
  });

  // draw coin
  collectible.draw(context, {bronzeCoin, silverCoin, goldCoin});

  // remove eaten coin
  if (collectible.eaten) {
    socket.emit('eaten-collectible', {playerID: collectible.eaten, coinValue: collectible.value, coinID: collectible.id});
  }

  if (gameOver) {
    context.fillStyle = 'white';
    context.font = `15px Arial`
    context.fillText(`You ${gameOver}! Restart and try again.`, playField.canvasWidth / 2, 80);
  }

  if (!gameOver) {
    animation = requestAnimationFrame(draw);
  }
}

// control movement
function control(player, socket) {
  function getKey(event) {
    if (event.keyCode === 87 || event.keyCode === 38) {
      return 'up'
    };

    if (event.keyCode === 83 || event.keyCode === 40) {
      return 'down'
    };

    if (event.keyCode === 65 || event.keyCode === 37) {
      return 'left'
    };

    if (event.keyCode === 68 || event.keyCode === 39) {
      return 'right'
    };
  }

  document.addEventListener('keydown', () => {
    let dir = getKey(event);

    if (dir) {
      player.moveDir(dir);

      // pass player's position to server
      socket.emit('move-player', player);
    }
  });

  document.addEventListener('keyup', () => {
    let dir = getKey(event);

    if (dir) {
      player.stopDir(dir);

      // pass player's position to server
      socket.emit('stop-player', player);
    }
  });
}
// ---------- ---------- end ---------- ----------


// images
const bronzeCoin = createImage('https://cdn.freecodecamp.org/demo-projects/images/bronze-coin.png');
const silverCoin = createImage('https://cdn.freecodecamp.org/demo-projects/images/silver-coin.png');
const goldCoin = createImage('https://cdn.freecodecamp.org/demo-projects/images/gold-coin.png');
const mainP = createImage('https://cdn.freecodecamp.org/demo-projects/images/main-player.png');
const enemyP = createImage('https://cdn.freecodecamp.org/demo-projects/images/other-player.png');

let animation;
let collectible;
let playerList = [];
let gameOver;

socket.on('init', ({id, players, coin}) => {
  console.log(`${id} connected`);

  // cancel animation if one already exists and
  // the page isn't refreshed, like if the server
  // restarts
  cancelAnimationFrame(animation);

  // generate player & coin when login
  let mainPlayer = new Player({
    x: randomPosition()[0],
    y: randomPosition()[1],
    score: 0,
    id: id,
    main: true
  });

  collectible = new Collectible(coin);

  // control movement
  control(mainPlayer, socket);

  // send player to server
  socket.emit('new-player', mainPlayer);

  // add new player when login
  socket.on('new-player', mainPlayer => {
    playerList.push(new Player(mainPlayer));
  });

  // handle movement
  socket.on('move-player', player => {
    let movingPlayer = playerList.find(i => i.id == player.id);
    movingPlayer.movementDirection = player.movementDirection;

    // force sync in case of lag
    movingPlayer.x = player.x;
    movingPlayer.y = player.y;
  });

  socket.on('stop-player', player => {
    let stoppingPlayer = playerList.find(i => i.id == player.id);
    stoppingPlayer.movementDirection = player.movementDirection;

    // force sync in case of lag
    stoppingPlayer.x = player.x;
    stoppingPlayer.y = player.y;
  });

  // update scoring player's score
  socket.on('update-player', player => {
    const scoringPlayer = playerList.find(i => i.id == player.id);
    scoringPlayer.score = player.score;
  });

  // handle game over
  socket.on('game-over', result => gameOver = result);

  // handle new coin generation
  socket.on('new-coin', newCoin => {
    collectible = new Collectible(newCoin);
  });

  // handle player disconnection
  socket.on('remove-player', id => {
    console.log(`${id} disconnected`);
    playerList = playerList.filter(player => player.id != id);
  });

  playerList = players.map(i => new Player(i)).concat(mainPlayer);
  draw();
});

