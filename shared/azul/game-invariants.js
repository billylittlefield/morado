exports.AZUL = 'azul'

exports.MIN_PLAYERS = 2
exports.MAX_PLAYERS = 4

exports.TILE_COLORS = ['black', 'blue', 'red', 'snowflake', 'yellow']
exports.STARTING_PLAYER = 'starting-player'
exports.NUM_TILES_OF_COLOR = 20

exports.TILES_PER_FACTORY = 4
exports.GET_FACTORY_COUNT = numPlayers => numPlayers * 2 + 1

exports.POINTS_FOR_COMPLETING_ROW = 2
exports.POINTS_FOR_COMPLETING_COLUMN = 7
exports.POINTS_FOR_COMPLETING_COLOR = 10

// action types
exports.FACTORY_REFILL = 'FACTORY_REFILL'
exports.TILE_PULL = 'TILE_PULL'
exports.TILE_TRANSFER = 'TILE_TRANSFER'
exports.TILE_DUMP = 'TILE_DUMP'

exports.DROPPED_TILE_PENALTIES = [-1, -1, -2, -2, -2, -3, -3]

exports.REQUIRED_ORDER = [
  ['blue', 'yellow', 'red', 'black', 'snowflake'],
  ['snowflake', 'blue', 'yellow', 'red', 'black'],
  ['black', 'snowflake', 'blue', 'yellow', 'red'],
  ['red', 'black', 'snowflake', 'blue', 'yellow'],
  ['yellow', 'red', 'black', 'snowflake', 'blue'],
]
