import Tether from 'tether';
import { STARTING_PLAYER } from '@shared/azul/game-invariants';

function getUniqueId() {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9) +
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
}

function toRads(degrees) {
  return degrees * (Math.PI / 180);
}

function getHex(color) {
  switch (color) {
    case 'snowflake':
      return '#8c0ad0';
    case 'blue':
      return '#030ea7';
    case 'black':
      return '#ffb201';
    case 'yellow':
      return '#ebde46';
    case 'red':
      return 'red';
  }
}

const svgNS = 'http://www.w3.org/2000/svg';
const largeTileLength = 42;
const smallTileLength = 22;

export default class Tile {
  /**
   *
   * @param {string} color
   * @param {string} boardName - 'c' (communal), 'p0' (player 1), 'p1' (player 2), etc
   * @param {string} groupName - 'f' (factory), 't' (table tiles), 's' (staging rows), 'f' (final rows), 'b' (broken tiles)
   * @param {string} groupIndex - factory index or row index, otherwise 0
   * @param {string} tileIndex - tile index within row / factory
   */
  constructor(parent, color, boardName, groupName, groupIndex, tileIndex, isSmallTile) {
    const id = getUniqueId();
    this.id = id;
    this.parent = parent;
    this.color = color;
    this.boardName = boardName;
    this.groupName = groupName;
    this.groupIndex = groupIndex;
    this.tileIndex = tileIndex;
    this.isSmallTile = isSmallTile || false;
    this.rotationAngle = boardName === 'common' ? Math.floor(Math.random() * 360) : 0;
    this.tether = null;
    this.isSelected = false;
    this.reqId = null;
    const { tileElement, topFace, rightFace, leftFace } = this.createElements(id, color);
    this.tileElement = tileElement;
    this.topFace = topFace;
    this.rightFace = rightFace;
    this.leftFace = leftFace;
    this.createTether();
  }

  createElements(id, color) {
    const tileElement = document.createElementNS(svgNS, 'svg');
    tileElement.setAttribute('id', id);
    tileElement.setAttribute('class', `tile tile-${color} ${this.isSmallTile ? 'tile-small' : ''}`);
    const topFace = document.createElementNS(svgNS, 'rect');
    topFace.setAttribute('x', this.isSmallTile ? 19 : 9);
    topFace.setAttribute('y', this.isSmallTile ? 19 : 9);
    topFace.setAttribute('width', this.isSmallTile ? 21 : 42);
    topFace.setAttribute('height', this.isSmallTile ? 21 : 42);
    topFace.setAttribute('transform', `rotate(${this.rotationAngle} 30 30)`);
    topFace.setAttribute('class', 'top-face');
    topFace.addEventListener('click', this.handleClick.bind(this));
    const leftFace = document.createElementNS(svgNS, 'path');
    leftFace.setAttribute('d', this.leftFacePath);
    leftFace.setAttribute('class', 'left-face');
    leftFace.setAttribute('fill', getHex(this.color));
    const rightFace = document.createElementNS(svgNS, 'path');
    rightFace.setAttribute('d', this.rightFacePath);
    rightFace.setAttribute('fill', getHex(this.color));
    rightFace.setAttribute('class', 'right-face');
    [topFace, leftFace, rightFace].forEach(face => {
      face.setAttribute('stroke', '#fff');
      if (this.isSmallTile) {
        face.setAttribute('stroke-width', '1px');
      } else {
        face.setAttribute('stroke-width', '2px');
      }
      face.setAttribute('stroke-linecap', 'round');
      tileElement.append(face);
    });
    document.getElementById('tile-container').append(tileElement);
    return { tileElement, topFace, leftFace, rightFace };
  }

  createTether() {
    if (this.tether) {
      return;
    }
    this.tether = new Tether(this.tetherOptions);
    setTimeout(() => {
      this.tileElement.style.transition = 'transform 1s, width 1s, height 1s';
    });
  }

  handleClick(event) {
    if (!this.parent) {
      return;
    }
    this.parent.selectTile(this);
  }

  setParent(parent) {
    this.parent = parent;
  }

  get targetLocation() {
    return this.generateLocationString();
  }

  generateLocationString() {
    return `${this.boardName}-${this.groupName}-${this.groupIndex}-${this.tileIndex}`;
  }

  get tetherOptions() {
    return this.generateTetherOptions();
  }

  get isStartingPlayer() {
    return this.color === STARTING_PLAYER;
  }

  get isCommunalTile() {
    return this.boardName === 'common';
  }

  get leftFacePath() {
    const height = this.isSmallTile ? 5 : 10;
    const { topLeft, bottomLeft } = this.calculateCornerPositions();
    return `M ${topLeft[0]} ${topLeft[1]} l 0 ${height} L ${bottomLeft[0]} ${bottomLeft[1] +
      height} 
      L ${bottomLeft[0]} ${bottomLeft[1]} Z`;
  }
  get rightFacePath() {
    if (this.isSmallTile) {
      return '';
    }
    const height = this.isSmallTile ? 5 : 10;
    const { bottomRight, bottomLeft } = this.calculateCornerPositions();
    return `M ${bottomLeft[0]} ${bottomLeft[1]} l 0 ${height} L ${bottomRight[0]}
      ${bottomRight[1] + height} L ${bottomRight[0]} ${bottomRight[1]} Z`;
  }

  calculateCornerPositions() {
    const sideLength = this.isSmallTile ? smallTileLength : largeTileLength;
    let radius = sideLength / Math.sin(toRads(45)) / 2;
    let center = [30, 30];
    let rotationAngle = this.rotationAngle;
    let dx = radius * Math.cos(toRads(45 + rotationAngle));
    let dy = radius * Math.sin(toRads(45 + rotationAngle));
    let topLeft = [center[0] - dx, center[1] - dy];
    let topRight = [center[0] + dy, center[1] - dx];
    let bottomRight = [center[0] + dx, center[1] + dy];
    let bottomLeft = [center[0] - dy, center[1] + dx];

    if (rotationAngle < 90) {
      let temp = topLeft;
      topLeft = bottomLeft;
      bottomLeft = bottomRight;
      bottomRight = topRight;
      topRight = temp;
    } else if (rotationAngle >= 90 && rotationAngle < 180) {
      let temp = topLeft;
      let temp2 = topRight;
      topLeft = bottomRight;
      topRight = bottomLeft;
      bottomRight = temp;
      bottomLeft = temp2;
    } else if (rotationAngle >= 180 && rotationAngle < 270) {
      let temp = topLeft;
      topLeft = topRight;
      topRight = bottomRight;
      bottomRight = bottomLeft;
      bottomLeft = temp;
    }

    return { topLeft, topRight, bottomRight, bottomLeft };
  }

  generateTetherOptions() {
    const offset = this.isSmallTile ? '24px 18px' : '18px 8px';
    return {
      element: `#${this.id}`,
      target: `#${this.targetLocation}`,
      attachment: 'top left',
      targetAttachment: 'top left',
      offset,
    };
  }

  select() {
    this.isSelected = true;
    this.startSpinning();
  }

  unselect() {
    this.isSelected = false;
    this.stopSpinning();
  }

  startSpinning() {
    if (this.boardName !== 'common' || this.reqId) {
      return;
    }
    this.isSelected = true;
    this.spinTile();
  }

  stopSpinning() {
    if (this.isSelected) {
      return;
    }
    this.isSelected = false;
  }

  spinTile() {
    this.rotate();
    if (this.isSelected) {
      this.reqId = requestAnimationFrame(this.spinTile.bind(this));
    } else {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }
  }

  destroy() {
    this.boardName = null;
    this.groupName = null;
    this.groupIndex = null;
    this.tileIndex = null;
    if (this.tether) {
      this.tether.destroy();
    }
    if (this.tileElement) {
      this.tileElement.remove();
    }
  }

  updateLocation(boardName, groupName, groupIndex, tileIndex, isSmallTile) {
    (this.boardName = boardName),
      (this.groupName = groupName),
      (this.groupIndex = groupIndex),
      (this.tileIndex = tileIndex);
    this.isSmallTile = isSmallTile;
    this.isSelected = false;
    if (this.isSmallTile) {
      this.tileElement.classList.add('tile-small')
    } else {
      this.tileElement.classList.remove('tile-small')
    }
    this.rightFace.setAttribute('stroke-width', this.isSmallTile ? '1' : '2');
    this.leftFace.setAttribute('stroke-width', this.isSmallTile ? '1' : '2');
    this.topFace.setAttribute('stroke-width', this.isSmallTile ? '1' : '2');
    this.topFace.setAttribute('width', this.isSmallTile ? 21 : 42);
    this.topFace.setAttribute('height', this.isSmallTile ? 21 : 42);
    this.topFace.setAttribute('x', this.isSmallTile ? 19 : 9);
    this.topFace.setAttribute('y', this.isSmallTile ? 19 : 9);
    this.redraw();
    if (this.boardName !== 'common') {
      setTimeout(() => this.rotate(0));
    }
    this.tether && this.tether.setOptions(this.tetherOptions);
  }

  redraw() {
    this.topFace.setAttribute('transform', `rotate(${this.rotationAngle} 30 30)`);
    this.rightFace.setAttribute('d', this.rightFacePath);
    this.leftFace.setAttribute('d', this.leftFacePath);
  }

  rotate(angle) {
    if (angle !== null && angle !== undefined) {
      this.rotationAngle = angle;
    } else {
      this.rotationAngle = (this.rotationAngle + 3) % 360;
    }
    this.redraw();
  }
}
