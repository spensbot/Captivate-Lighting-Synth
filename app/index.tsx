import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import './app.global.css';
import Home from './components/Home';
import { configureStore } from '@reduxjs/toolkit';
import timeReducer from './engine/timeSlice';
import {init} from './engine/engine';
import { Provider } from 'react-redux';

const store = configureStore({
  reducer: {
    time: timeReducer,
  },
});

init(store);

// const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  render(
    <AppContainer>
      <Provider store={store}>
        <Home />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
});
