require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require("cors");
const socket = require('socket.io');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(
  helmet({
    noSniff: true,
    xssFilter: true,
    noCache: true,
    hidePoweredBy: {
      setTo: "PHP 7.4.3",
    },
  })
);

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// socket.io
const io = socket(server);
const Collectible = require('./public/Collectible.mjs');
const randomPosition = require('./public/Canvas.mjs');

// function for generate random coin
function generateCoin() {
  let random = Math.random();
  let value = '';

  if (random < 0.6) {
    value = 1;
  } else if (random < 0.8) {
    value = 2;
  } else {
    value = 3;
  }

  let coin = new Collectible ({
    x: randomPosition()[0],
    y: randomPosition()[1],
    value: value,
    id: Date.now()
  });

  return coin;
}

let coin = generateCoin();
let playerList = [];
let eatenCoins = [];

io.on('connection', socket => {
  console.log(`New player: ${socket.id} has connected`);

  socket.emit('init', {id: socket.id, players: playerList, coin: coin});

  socket.on('new-player', mainPlayer => {
    playerList.push(mainPlayer);
    socket.broadcast.emit("new-player", mainPlayer);
  });

  socket.on('move-player', player => {
    let movingPlayer = playerList.find(i => i.id == player.id);

    if (movingPlayer) {
      movingPlayer.x = player.x;
      movingPlayer.y = player.y;
      movingPlayer.movementDirection = player.movementDirection;

      socket.broadcast.emit('move-player', movingPlayer);
    }
  });

  socket.on('stop-player', player => {
    let stoppingPlayer = playerList.find(i => i.id == player.id);

    if (stoppingPlayer) {
      stoppingPlayer.x = player.x;
      stoppingPlayer.y = player.y;
      stoppingPlayer.movementDirection = player.movementDirection;

      socket.broadcast.emit('stop-player', stoppingPlayer);
    }
  });

  socket.on('eaten-collectible', ({playerID, coinValue, coinID}) => {
    if (!eatenCoins.includes(coinID)) {
      let scoringPlayer = playerList.find(i => i.id === playerID);

      scoringPlayer.score += coinValue;
      eatenCoins.push(coinID);

      // broadcast to all players when someone scores
      io.emit("update-player", scoringPlayer);

      // communicate win state and broadcast losses
      if (scoringPlayer.score >= 20) {
        socket.emit("game-over", "win");
        socket.broadcast.emit("game-over", "lose");
      }

      // generate new coin and send it to all players
      coin = generateCoin();
      io.emit("new-coin", coin);
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("remove-player", socket.id);
    playerList = playerList.filter(player => player.id != socket.id);
  });
});

module.exports = app; // For testing
