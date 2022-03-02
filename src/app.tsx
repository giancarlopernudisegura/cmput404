import { h, render, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';

import store from './store/store';

import ExplorePage from './pages/ExplorePage'
import Header from './components/Header'
import Login from './pages/Login';
import Homepage from './pages/Homepage';

import './css/main.css';
import HomepageV2 from './views/HomepageV2';

const App = () => {
  return (
    <div class="app" className="min-h-screen static bg-stone-50">
      <Header />
      <Router>
        <ExplorePage path="/app" />
        <Login path="/app/login" />
        <HomepageV2 path="/app/homepage"/>
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
