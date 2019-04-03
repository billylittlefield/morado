import Tether from 'tether'
import { STARTING_PLAYER } from '@shared/azul/game-invariants'

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
  )
}

function toRads(degrees) {
  return degrees * (Math.PI / 180)
}

export default class Tile {
  /**
   *
   * @param {string} color
   * @param {string} boardName - 'c' (communal), 'p0' (player 1), 'p1' (player 2), etc
   * @param {string} groupName - 'f' (factory), 't' (table tiles), 's' (staging rows), 'f' (final rows), 'b' (broken tiles)
   * @param {string} groupIndex - factory index or row index, otherwise 0
   * @param {string} tileIndex - tile index within row / factory
   */
  constructor(color, boardName, groupName, groupIndex, tileIndex) {
    this.id = getUniqueId()
    this.color = color
    this.boardName = boardName
    this.groupName = groupName
    this.groupIndex = groupIndex
    this.tileIndex = tileIndex
    this.rotationAngle = Math.floor(Math.random() * 360)
    this.tether = null
  }

  get targetLocation() {
    return this.generateLocationString()
  }

  generateLocationString() {
    return `${this.boardName}-${this.groupName}-${this.groupIndex}-${this.tileIndex}`
  }

  get tetherOptions() {
    return this.generateTetherOptions()
  }

  get isStartingPlayer() {
    return this.color === STARTING_PLAYER
  }

  get isCommunalTile() {
    return this.boardName === 'common'
  }

  get topFacePath() {
    const { topLeft, topRight, bottomRight, bottomLeft } = this.calculateCornerPositions()
    return `M ${topLeft[0]} ${topLeft[1]} L ${topRight[0]} ${topRight[1]} L ${bottomRight[0]} 
      ${bottomRight[1]} L ${bottomLeft[0]} ${bottomLeft[1]} Z`
  }
  
  get leftFacePath() {
    const { topLeft, bottomLeft } = this.calculateCornerPositions()
    return `M ${topLeft[0]} ${topLeft[1]} l 0 10 L ${bottomLeft[0]} ${(bottomLeft[1] + 10)} 
      L ${bottomLeft[0]} ${bottomLeft[1]} Z`
  }
  get rightFacePath() {
    const { bottomRight, bottomLeft } = this.calculateCornerPositions()
    return `M ${bottomLeft[0]} ${bottomLeft[1]} l 0 10 L ${bottomRight[0]} ${(bottomRight[1] + 10)} 
      L ${bottomRight[0]} ${bottomRight[1]} Z`
  }

  calculateCornerPositions() {
    let radius = (42 / Math.sin(toRads(45))) / 2
    let center = [30, 30]
    let rotationAngle = this.rotationAngle
    let dx = radius * Math.cos(toRads(45 + rotationAngle))
    let dy = radius * Math.sin(toRads(45 + rotationAngle))
    let topLeft = [center[0] - dx, center[1] - dy]
    let topRight = [center[0] + dy, center[1] - dx]
    let bottomRight = [center[0] + dx, center[1] + dy]
    let bottomLeft = [center[0] - dy, center[1] + dx]
    
    if (rotationAngle > 0 && rotationAngle < 90) {
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

    return { topLeft, topRight, bottomRight, bottomLeft }
  }

  generateTetherOptions() {
    return {
      element: `#${this.id}`,
      target: `#${this.targetLocation}`,
      attachment: 'top left',
      targetAttachment: 'top left',
      offset: '18px 8px' 
    }
  }

  createTether() {
    if (this.tether) {
      return
    }
    this.tether = new Tether(this.tetherOptions)
  }

  destroyTether() {
    if (!this.tether) {
      return
    }
    this.tether.destroy()
    this.tether = null
  }

  updateLocation(boardName, groupName, groupIndex, tileIndex) {
    ;(this.boardName = boardName),
      (this.groupName = groupName),
      (this.groupIndex = groupIndex),
      (this.tileIndex = tileIndex)
    this.tether && this.tether.setOptions(this.tetherOptions)
  }
}
