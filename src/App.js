import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import '../styles/styles.scss'

// Pages
import Warehouses from './pages/Warehouses'
import Productions from './pages/Productions'

// Components
import NavBar from './components/Navbar'

const App = () => {
  return (
    <div>
      <NavBar />
      <Switch>
        <Route path="/productions">
          <Productions />
        </Route>
        <Route path="/warehouses">
          <Warehouses />
        </Route>
        <Route path="/">
          <Redirect to="/productions" />
        </Route>
      </Switch>
    </div>
  )
}

export default App
