const canvasWidth = 640;
const canvasHeight = 480;
const border = 5;
const infoBar = 45;
const playerWidth = 30;
const playerHeight = 30;

const playField = {
  canvasWidth: canvasWidth,
  canvasHeight: canvasHeight,
  fieldWidth: canvasWidth - (border * 2),
  fieldHeight: canvasHeight - (border * 2) - infoBar,
  fieldMinX: border,
  fieldMaxX: (canvasWidth - playerWidth) - border,
  fieldMinY: border + infoBar,
  fieldMaxY: (canvasHeight - playerHeight) - border
}

function randomPosition() {
  // for generate random position
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  let x = random(playField.fieldMinX, playField.fieldMaxX);
  let y = random(playField.fieldMinY, playField.fieldMaxY);
  x = Math.floor(x / 10) * 10;
  y = Math.floor(y / 10) * 10;

  return [x, y];
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = randomPosition;
} catch(e) {}

export {playField, randomPosition};