export class PlayerTurn {
  constructor(round, turn, playerIndex, factoryIndex, tileColor, targetRowIndex) {
    this.turnType = "TILE_PULL"
    this.round = round
    this.turn = turn
    this.playerIndex = playerIndex
    this.factoryIndex = factoryIndex
    this.tileColor = tileColor
    this.targetRowIndex = targetRowIndex
  }
}

export class FactoryRefill {
  constructor(round, turn, factories) {
    this.turnType = "FACTORY_REFILL"
    this.round = round
    this.turn = turn
    this.factories = factories
  }
}

export class TileTransfer {
  constructor(round, turn, playerIndex, rowIndex, columnIndex, tileColor) {
    this.turnType = "TILE_TRANSFER"
    this.round = round
    this.turn = turn
    this.playerIndex = playerIndex
    this.rowIndex = rowIndex
    this.columnIndex = columnIndex
    this.tileColor = tileColor
  }
}
