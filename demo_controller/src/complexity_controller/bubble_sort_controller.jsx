import { useState, useEffect } from 'react'
import '@/css/App.css'
import { navigate, play, pause, reset, setDemo } from '@/services/api'

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  // Set demo on mount
  useEffect(() => {
    setDemo('searching-sorting');
  }, []);

  return (
    <>
      <div>
      </div>
      <h3>Searching and Sorting</h3>
      <div className="card">
        <div className="directions">
          <button onClick={() => navigate('prev')} id='left'>
            ←
          </button>
          <button onClick={() => navigate('next')} id = "right">
            →
          </button>
        </div>
        <p id = 'num-pad-title'>Controls</p>
        <div className='play-restart-container'>
          <button onClick={() => play()} id='play-button'>▶</button>
          <button onClick={() => reset()} id='restart-button'>⟲</button>
        </div>

        <div className="home" style = {{marginTop: '20px'}}>
          <button onClick={() => navigate('select')} id='home_button'>
            &#127968;
          </button>
          <button onClick={() => pause()} id='pause_button'> || </button>
        </div>

      </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
    </>
  )
}

export default App