import { h, render, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';

import store from './store/store';

import ExplorePage from './views/ExplorePage'
import Header from './components/Header'
import Login from './pages/Login';
import Homepage from './pages/Homepage';

import './css/main.css';

const App = () => {
  return (
    <div class="app" className="min-h-screen static bg-stone-50">
      <Header />
      <Router>
        <Homepage path="/app" />
        <Login path="/app/login" />
      </Router>
    </div>
  )
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.body
);
