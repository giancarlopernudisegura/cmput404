import { h, render, Component, ComponentChild } from 'preact';
import Router from 'preact-router';
import { Provider } from 'unistore/preact';

import store from './store/store';

import Homepage from './views/Homepage';

import './css/main.css'
import ExplorePage from './views/ExplorePage'
import Header from './components/Header'
import Authentication from './views/authentication/authentication'
import SignUp from './views/authentication/authentication-signup'
import ExplorePageV2 from './views/ExplorePageV2';
import sidebar from './components/sidemenu-components/sidebar';
import DrawerMenu from './components/sidemenu-components/Drawer';
import Profile from './views/Profile';
import Notifications from './views/Notifications'

class App extends Component {

  public render = (): ComponentChild => {
    return (
      <div class="app"
        className="min-h-screen static bg-stone-50">

        {/* <Header /> */}

        <Router>
          {/* <ExplorePage path="/" /> */}
          <Authentication path='/'/>
          <SignUp path='/signup'/>
          {/* TODO: add Friends and Personal pages */}
          <Homepage path="/homepage" />
          <ExplorePageV2 path="/explore" />
          <Notifications path="/notifications"/>
          <Profile path='/profile'/>
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
