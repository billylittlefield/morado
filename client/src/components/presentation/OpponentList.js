import React from 'react'
import PlayerBoard from 'components/presentation/PlayerBoard'

function OpponentList(props) {
  return (
    <div className="opponent-list">
      {props.opponents.map((opponent, index) => {
        return (
          <div key={index} className="opponent">
            <PlayerBoard
              isOpponentBoard={true}
              player={opponent}
            />
          </div>
        )
      })}
    </div>
  )
}

export default OpponentList
