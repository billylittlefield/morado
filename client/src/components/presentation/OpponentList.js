import React from 'react'
import PlayerBoard from 'components/presentation/PlayerBoard'

function OpponentList(props) {
  return (
    <div className="opponent-list">
      {props.opponents.map((opponent, index) => {
        return (
          <div key={index} className="opponent">
            <div className="opponent-info">{opponent.username}</div>
            <PlayerBoard
              isOpponentBoard={true}
              isActive={props.activeSeatIndex === opponent.seatIndex}
              stagingRows={opponent.stagingRows}
              finalRows={opponent.finalRows}
              brokenTiles={opponent.brokenTiles}
            />
          </div>
        )
      })}
    </div>
  )
}

export default OpponentList
