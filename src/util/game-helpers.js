/**
 * Shuffles the given array in place using Fisher-Yates algorithm
 * @param {Array} tiles
 */
export const shuffle = tiles => {
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  return tiles
}

export const getNumFactories = numPlayers => 2 * numPlayers + 1
