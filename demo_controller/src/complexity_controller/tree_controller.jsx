import { useState, useEffect } from 'react'
import '@/css/App.css'
import { navigate, pause, setDemo, navigateHome, reset, startSorting } from '@/services/api'

function App() {
  const [inputStart, setInputStart] = useState(false);
  const [inputReset, setInputReset] = useState(false);

  // Set demo on mount
  useEffect(() => {
    setDemo('searching-sorting');
  }, []);

  return (
    <>
      <div className='controller-container'>
      </div>
      <div className="sorting-card">
        <h3 style={{padding:'5px'}}>Searching and Sorting</h3>
        <div className="directions">
          <button onClick={() => navigate('prev')} id='left'>
            &#8656;
          </button>
          <button onClick={() => navigate('next')} id = "right">
            &#8658;
          </button>
        </div>
        <p id = 'sorting-title'>Searching Algorithm Controls</p>
        <div className="sorting-controls-container" style = {{marginTop: '15px'}}>
          <button onClick={() => startSorting()} className = 'sorting-controls' id='start_sorting'>
            Start
          </button>

          <button onClick={() => reset()} className = 'sorting-controls' id='reset_sorting'>
            Reset
          </button>

        </div>

        <div className="home" style = {{marginTop: '20px'}}>
          <button onClick={() => navigateHome()} id='home_button'>
            &#127968;
          </button>
          {/*<button onClick={() => pause()} id='pause_button'> || </button>*/}
        </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
      </div>
    </>
  )
}

export default App