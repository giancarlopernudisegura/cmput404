import { h, render, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';

import store from './store/store';

import Login from './pages/Login';
import Homepage from './pages/Homepage';
import { get_author_me } from './utils/apiCalls';
import { CircularProgress } from '@mui/material';


import { useEffect, useState } from 'preact/hooks';

import './css/main.css';

const App = () => {
  const [ author, setAuthor ] = useState(null);
  const [ isLoading, setIsLoading ] = useState(true);

  useEffect(() => {
    const get_author_helper = async () => {
      try {
        let response = await get_author_me();
        setAuthor(response.data);
        setIsLoading(false);
      } catch(err) {
        // TODO: handle error, show a message
        setIsLoading(false);
      }
    }
    get_author_helper();
  }, []);


  return (
    <div class="app">
      {isLoading === true ? <CircularProgress /> : (
        <Router>
          <Homepage path="/" />
          <Login path="/login" />
        </Router>
      )
      }
    </div>
  )
}

render (
  <Provider store={store}>
    <App />
  </Provider>,
  document.body
);
