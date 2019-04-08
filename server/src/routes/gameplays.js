import express from 'express';

import GameController from 'controllers/game';

const gameplayRouter = express.Router();

gameplayRouter.route('/').post(async (req, res) => {
  let { gameId, userId } = req.body;
  if (req.session.userInfo.userId !== userId) {
    res.status(401).end();
  }
  await GameController.createGamePlay(gameId, userId);
  await GameController.startGameIfFull(gameId);

  res.status(200).json({ gameId });
});

export default gameplayRouter;
