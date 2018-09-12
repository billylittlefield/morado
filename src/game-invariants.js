export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

export const getNumFactories = numPlayers => 2 * numPlayers + 1

export const NUM_TILES_OF_COLOR = 20

export const TILES_PER_FACTORY = 4

export const TILE_COLORS = ['BLUE', 'YELLOW', 'RED', 'BLACK', 'WHITE']

export const POINTS_FOR_COMPLETING_ROW = 2
export const POINTS_FOR_COMPLETING_COLUMN = 7
export const POINTS_FOR_COMPLETING_COLOR = 10

export const DROPPED_TILE_PENALTIES = [1, 1, 2, 2, 2, 3, 3]

export const getStagingRowSize = rowIndex => rowIndex + 1
