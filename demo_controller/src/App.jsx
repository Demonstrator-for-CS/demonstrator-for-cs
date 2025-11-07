import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  return (
    <>
      <div>
      </div>
      <h3>Select Demo</h3>
      <div className="card">
        <button className = "navigate-button"> ← </button>
        <button className = "navigate-button"> Select </button>
        <button className = "navigate-button"> → </button>
      </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
    </>
  )
}

export default App
