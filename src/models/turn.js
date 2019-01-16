export class Turn {
  constructor(round, turn, playerTurn, factoryRefill) {
    this.round = round
    this.turn = turn
    this.playerTurn = playerTurn
    this.factoryRefill = factoryRefill
    this.tileTransfers = factoryRefill
  }
}

export class PlayerTurn {
  constructor(playerId, factoryIndex, tileColor, tileCount, targetRowIndex) {
    this.playerId = playerId
    this.factoryIndex = factoryIndex
    this.tileColor = tileColor
    this.tileCount = tileCount
    this.targetRowIndex = targetRowIndex
  }
}

export class FactoryRefill {
  constructor(factories) {
    this.factories = factories
  }
}

export class TileTransfer {
  constructor(transfers) {
    this.transfers = transfers
  }
}
