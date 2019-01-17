import produce from 'immer'

const handleFactoryRefill = (state, action) => {
  return produce(state, draft => {
    draft.factories = action.payload.factories
    draft.turnHistory = [...draft.turnHistory.slice(0, draft.historyIndex), action.payload]
    draft.historyIndex++
    draft.round++
    draft.turn = 1
  })
}

export default handleFactoryRefill
