import { useState } from 'react'
import '@/css/App.css'
import { navigate } from '@/services/api'

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  return (
    <>
      <div>
      </div>
      <h3>Select Demo</h3>
      <div className="card">
        <button className = "navigate-button" onClick={() => navigate('prev')}> ← </button>
        <button className = "navigate-button" onClick={() => navigate('select')}> Select </button>
        <button className = "navigate-button" onClick={() => navigate('next')}> → </button>
      </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
    </>
  )
}

export default App