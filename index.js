import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './src/App'
import ReactQueryContextWrapper from './src/components/ReactQueryContextWrapper'


ReactDOM.render(
  <BrowserRouter>
    <ReactQueryContextWrapper>
      <App />
    </ReactQueryContextWrapper>
  </BrowserRouter>, document.getElementById('root'))
