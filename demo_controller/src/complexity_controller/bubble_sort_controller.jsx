import { useState } from 'react'
import '@/css/App.css'

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  return (
    <>
      <div>
      </div>
      <h3>Searching and Sorting</h3>
      <div className="card">
        <div className="directions"> 
          <button onClick={() => setCount((count) => count + 1)} id='left'>
            ←
          </button>
          <button onClick={() => setCount((count) => count - 1)} id = "right">
            →
          </button>
        </div>
        <p id = 'num-pad-title'>Controls</p>
        <div className='play-restart-container'>
          <button id='play-button'>▶</button>
          <button id='restart-button'>⟲</button>
        </div>

        <div className="home" style = {{marginTop: '20px'}}>
          <button onClick={() => setCount((count) => count + 1)} id='home_button'>
            &#127968;
          </button>
          <button id='pause_button'> || </button>
        </div>
          
      </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
    </>
  )
}

export default App