import { h, render, Component, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';

import store from './store/store';

import Homepage from './views/Homepage';

import './css/main.css';

class App extends Component {

  public render = (): ComponentChild => {
    return (
      <div class="app">
        <Router>
          <Homepage path="/" />
        </Router>
      </div>
    )
  }
}

render (
  <Provider store={store}>
    <App />
  </Provider>,
  document.body
);
