import { useState, useEffect } from 'react'
import '@/css/App.css'
import { navigate, pause, setDemo, navigateHome } from '@/services/api'
import { startSorting } from '../services/api';

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  // Set demo on mount
  useEffect(() => {
    setDemo('searching-sorting');
  }, []);

  return (
    <>
      <div className='controller-container'>
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

        <div className="sorting-algorithms">
          <button onClick={() => startSorting()} id='start_sorting'>
            Start
          </button>

          <button onClick={() => reset()} id='reset_sorting'>
            Reset
          </button>

        </div>

        <div className="home" style = {{marginTop: '20px'}}>
          <button onClick={() => navigateHome()} id='home_button'>
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