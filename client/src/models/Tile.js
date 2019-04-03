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

const svgNS = 'http://www.w3.org/2000/svg'

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
    const id = getUniqueId()
    this.id = id
    this.color = color
    this.boardName = boardName
    this.groupName = groupName
    this.groupIndex = groupIndex
    this.tileIndex = tileIndex
    this.rotationAngle = Math.floor(Math.random() * 360)
    this.tether = null
    this.parent = null
    this.isSpinning = false
    const tileElement = document.createElementNS(svgNS, 'svg')
    tileElement.setAttribute('id', id)
    tileElement.setAttribute('class', `tile tile-${color}`)
    const topFace = document.createElementNS(svgNS, 'path')
    topFace.setAttribute('d', this.topFacePath)
    topFace.setAttribute('class', 'top-face')
    topFace.addEventListener('click', this.handleClick.bind(this))
    const leftFace = document.createElementNS(svgNS, 'path')
    leftFace.setAttribute('d', this.leftFacePath)
    leftFace.setAttribute('class', 'left-face')
    const rightFace = document.createElementNS(svgNS, 'path')
    rightFace.setAttribute('d', this.rightFacePath)
    rightFace.setAttribute('class', 'right-face')
    ;[topFace, leftFace, rightFace].forEach(face => {
      face.setAttribute('stroke', '#fff')
      face.setAttribute('stroke-width', '2px')
      tileElement.append(face)
    })
    this.tileElement = tileElement
    this.topFace = topFace
    this.rightFace = rightFace
    this.leftFace = leftFace
    document.getElementById('tile-container').append(tileElement)
    this.createTether()
  }

  handleClick(event) {
    if (!this.parent) {
      return
    }
    this.parent.selectTile(this)
  }

  setParent(parent) {
    this.parent = parent
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
    return `M ${topLeft[0]} ${topLeft[1]} l 0 10 L ${bottomLeft[0]} ${bottomLeft[1] + 10} 
      L ${bottomLeft[0]} ${bottomLeft[1]} Z`
  }
  get rightFacePath() {
    const { bottomRight, bottomLeft } = this.calculateCornerPositions()
    return `M ${bottomLeft[0]} ${bottomLeft[1]} l 0 10 L ${bottomRight[0]} ${bottomRight[1] + 10} 
      L ${bottomRight[0]} ${bottomRight[1]} Z`
  }

  calculateCornerPositions() {
    let radius = 42 / Math.sin(toRads(45)) / 2
    let center = [30, 30]
    let rotationAngle = this.rotationAngle
    let dx = radius * Math.cos(toRads(45 + rotationAngle))
    let dy = radius * Math.sin(toRads(45 + rotationAngle))
    let topLeft = [center[0] - dx, center[1] - dy]
    let topRight = [center[0] + dy, center[1] - dx]
    let bottomRight = [center[0] + dx, center[1] + dy]
    let bottomLeft = [center[0] - dy, center[1] + dx]

    if (rotationAngle > 0 && rotationAngle < 90) {
      let temp = topLeft
      topLeft = bottomLeft
      bottomLeft = bottomRight
      bottomRight = topRight
      topRight = temp
    } else if (rotationAngle >= 90 && rotationAngle < 180) {
      let temp = topLeft
      let temp2 = topRight
      topLeft = bottomRight
      topRight = bottomLeft
      bottomRight = temp
      bottomLeft = temp2
    } else if (rotationAngle >= 180 && rotationAngle < 270) {
      let temp = topLeft
      topLeft = topRight
      topRight = bottomRight
      bottomRight = bottomLeft
      bottomLeft = temp
    }

    return { topLeft, topRight, bottomRight, bottomLeft }
  }

  generateTetherOptions() {
    return {
      element: `#${this.id}`,
      target: `#${this.targetLocation}`,
      attachment: 'top left',
      targetAttachment: 'top left',
      offset: '18px 8px',
    }
  }

  spinTile(timestamp) {
    this.rotate()
    if (this.isSpinning) {
      requestAnimationFrame(this.spinTile.bind(this))
    } else {
      cancelAnimationFrame(timestamp)
    }
  }

  startSpinning() {
    this.isSpinning = true
    this.spinTile()
  }

  stopSpinning() {
    this.isSpinning = false
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

  rotate() {
    this.rotationAngle = (this.rotationAngle + 4) % 360
    this.topFace.setAttribute('d', this.topFacePath)
    this.rightFace.setAttribute('d', this.rightFacePath)
    this.leftFace.setAttribute('d', this.leftFacePath)
  }
}
