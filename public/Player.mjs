import {playField} from './Canvas.mjs';

class Player {
  constructor({x, y, score, id, main, width = 30, height = 30}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.mainPlayer = main;
    this.width = width;
    this.height = height;
    this.movementDirection = {};
  }

  draw(context, collectible, imgObject, playerList) {
    const direction = Object.keys(this.movementDirection).filter(dir => this.movementDirection[dir]);

    direction.forEach(dir => this.movePlayer(dir, 5));

    if (this.mainPlayer) {
      context.font = `15px Arial`;
      context.fillText(this.calculateRank(playerList), 560, 32.5);

      context.drawImage(imgObject.mainP, this.x, this.y);
    } else {
      context.drawImage(imgObject.enemyP, this.x, this.y);
    }

    if (this.collision(collectible)) {
      collectible.eaten = this.id;
    }
  }

  moveDir(dir) {
    this.movementDirection[dir] = true;
  }

  stopDir(dir) {
    this.movementDirection[dir] = false;
  }

  movePlayer(dir, speed) {
    if (dir == 'up') {
      if (this.y - speed >= playField.fieldMinY) {
        this.y -= speed;
      } else {
        this.y -= 0;
      }
    }

    if (dir == 'down') {
      if (this.y + speed <= playField.fieldMaxY) {
        this.y += speed;
      } else {
        this.y += 0;
      }
    }

    if (dir == 'left') {
      if (this.x - speed >= playField.fieldMinX) {
        this.x -= speed;
      } else {
        this.y -= 0;
      }
    }

    if (dir == 'right') {
      if (this.x + speed <= playField.fieldMaxX) {
        this.x += speed;
      } else {
        this.y += 0;
      }
    }
  }

  collision(item) {
    if (
      this.x < item.x + item.width &&
      this.x + this.width > item.x &&
      this.y < item.y + item.height &&
      this.y + this.height > item.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  calculateRank(arr) {
    const sortedScores = arr.sort((a, b) => b.score - a.score);
    let mainPlayerRank = 0;

    if (this.score == 0) {
      mainPlayerRank = arr.length;
    } else {
      mainPlayerRank = sortedScores.findIndex(i => i.id == this.id) + 1;
    }

    return `Rank: ${mainPlayerRank} / ${arr.length}`
  }
}

export default Player;
