import { useState } from 'react'
import reactLogo from './assets/react.svg'
import pittLogo from './images/pitt_logo.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  return (
    <>
      <div>
        <a href="https://www.pitt.edu/" target="_blank">
          <img src={pittLogo} className="logo" alt="Pitt logo" />
        </a>
      </div>
      <h1>Demonstrator Controller (Name subject to change obv)</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)} style = {{color: '#61dafbaa'}}>
          6
        </button>
        <button onClick={() => setCount((count) => count - 1)} style = {{color: '#61dafbaa'}}>
          7
        </button>
        <p>
          Code is in <code>src/App.jsx</code> 
        </p>
      </div>
      <p className="read-the-docs">
        This will eventually be the controller for the CS Demonstrator. Will add more buttons for users to control the demos.
      </p>
    </>
  )
}

export default App
