import { h, render } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';
import store from './store/store';
import ExplorePage from './pages/ExplorePage'
import Header from './components/Header'
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import Profile from './pages/Profile'
import './css/main.css';
import Inbox from './pages/Inbox';
import UserPage from './pages/UserPage';
import AdminSettings from './pages/AdminSettings';

const App = () => {

  return (
    <div class="app" className="min-h-screen static bg-stone-50">
      {/* <Header /> */}
      <Router>
        <ExplorePage path="/app" />
        <Login path="/app/login" />
        <Homepage path="/app/homepage"/>
        <Profile path="/app/profile"/>
        <Inbox path="/app/inbox"/>
        <UserPage path="/app/user/:followId" />
        <AdminSettings path="/app/admin" />
        <AdminSettings path="/app/admin" />
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
