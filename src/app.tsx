import { h, render, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';
import store from './store/store';
import ExplorePage from './pages/ExplorePage'
import Header from './components/Header'
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import Profile from './pages/Profile'
import SearchPage from './pages/SearchPage';
import './css/main.css';
import Notifications from './pages/Notifications';

const App = () => {
  return (
    <div class="app" className="min-h-screen static bg-stone-50">
      {/* <Header /> */}
      <Router>
        <ExplorePage path="/app" />
        <Login path="/app/login" />
        <Homepage path="/app/homepage"/>
        <Profile path="/app/profile"/>
        <Notifications path="/app/notifications"/>
        <SearchPage path="/app/search" />
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
