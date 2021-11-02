class Collectible {
  constructor({x, y, value, id, width = 15, height = 15}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.width = width;
    this.height = height;
  }

  draw(context, imgObject) {
    if (this.value == 1) {
      context.drawImage(imgObject.bronzeCoin, this.x, this.y);
    } else if (this.value == 2) {
      context.drawImage(imgObject.silverCoin, this.x, this.y);
    } else {
      context.drawImage(imgObject.goldCoin, this.x, this.y);
    }
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
