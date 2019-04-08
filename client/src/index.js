import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Modal from 'react-modal';

import blueTile from 'images/blue-tile.png'
import blueTileSmall from 'images/blue-tile-small.png'
import snowflakeTile from 'images/snowflake-tile.jpg'
import snowflakeTileSmall from 'images/snowflake-tile-small.jpeg'
import blackTile from 'images/black-tile.png'
import blackTileSmall from 'images/black-tile-small.png'
import yellowTile from 'images/yellow-tile.jpeg'
import yellowTileSmall from 'images/yellow-tile-small.jpeg'
import redTile from 'images/red-tile.png'
import redTileSmall from 'images/red-tile-small.png'
import startingPlayerTile from 'images/starting-player-tile.png'
import startingPlayerTileSmall from 'images/starting-player-tile-small.png'
import rootReducer from 'redux/reducers';
import App from 'app';

document.getElementById('blue-tile-img').setAttribute('href', blueTile);
document.getElementById('blue-tile-small-img').setAttribute('href', blueTileSmall);
document.getElementById('snowflake-tile-img').setAttribute('href', snowflakeTile);
document.getElementById('snowflake-tile-small-img').setAttribute('href', snowflakeTileSmall);
document.getElementById('black-tile-img').setAttribute('href', blackTile);
document.getElementById('black-tile-small-img').setAttribute('href', blackTileSmall);
document.getElementById('yellow-tile-img').setAttribute('href', yellowTile);
document.getElementById('yellow-tile-small-img').setAttribute('href', yellowTileSmall);
document.getElementById('red-tile-img').setAttribute('href', redTile);
document.getElementById('red-tile-small-img').setAttribute('href', redTileSmall);
document.getElementById('starting-player-tile-img').setAttribute('href', startingPlayerTile);
document.getElementById('starting-player-tile-small-img').setAttribute('href', startingPlayerTileSmall);

const production = process.env.NODE_ENV === 'production';

const AppToRender = production ? App : hot(module)(App);

const targetElementId = 'app';
const targetElement = document.getElementById(targetElementId);

const store = createStore(rootReducer);

Modal.setAppElement(`#${targetElementId}`);

ReactDOM.render(
  <Provider store={store}>
    <AppToRender />
  </Provider>,
  targetElement
);
