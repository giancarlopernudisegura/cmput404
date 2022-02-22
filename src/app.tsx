import { h, render, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';

import store from './store/store';

import Login from './pages/Login';
import Homepage from './pages/Homepage';
import { get_author_me } from './utils/apiCalls';

import { useEffect, useState } from 'preact/hooks';

import './css/main.css';

const App = () => {
  const [ author, setAuthor ] = useState(null);

  const test = () => {
    
  }

  useEffect(() => {
    const d = async () => {
      await get_author_me();
    }
    d();
  }, []);


  return (
    <div class="app">
      <Router>
        <Homepage path="/" />
        <Login path="/login" />
      </Router>
    </div>
  )
}

render (
  <Provider store={store}>
    <App />
  </Provider>,
  document.body
);
