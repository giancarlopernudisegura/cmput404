import { h, render, Component, ComponentChild } from 'preact'
import Router from 'preact-router'
import { Provider } from 'unistore/preact'

import store from './store/store'

import HelloWorld from './views/hello_world'

import './css/main.css'
import ExplorePage from './views/ExplorePage'
import Header from './components/Header'

class App extends Component {

  public render = (): ComponentChild => {
    return (
      <div class="app"
        className="min-h-screen static bg-stone-50">

        <Header />

        <Router>
          <ExplorePage path="/" />
          {/* TODO: add Friends and Personal pages */}
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
)
