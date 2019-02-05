export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

export const TILE_COLORS = ['blue', 'yellow', 'red', 'black', 'snowflake']
export const FIRST_PLAYER_TOKEN = 'first_player_token'
export const NUM_TILES_OF_COLOR = 20

export const TILES_PER_FACTORY = 4
export const GET_FACTORY_COUNT = (numPlayers) => numPlayers * 2 + 1

export const POINTS_FOR_COMPLETING_ROW = 2
export const POINTS_FOR_COMPLETING_COLUMN = 7
export const POINTS_FOR_COMPLETING_COLOR = 10

export const DROPPED_TILE_PENALTIES = [1, 1, 2, 2, 2, 3, 3]

export const REQUIRED_ORDER = [
  ['blue', 'yellow', 'red', 'black', 'snowflake'],
  ['snowflake', 'blue', 'yellow', 'red', 'black'],
  ['black', 'snowflake', 'blue', 'yellow', 'red'],
  ['red', 'black', 'snowflake', 'blue', 'yellow'],
  ['yellow', 'red', 'black', 'snowflake', 'blue'],
]
