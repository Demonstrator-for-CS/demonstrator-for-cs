import { useState } from 'react'
import '@/css/App.css'
import { navigate, pause, sendLogicGatesInput, setDemo, navigateHome } from '@/services/api'
import { useEffect } from 'react'

function App() {
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);

  // Set demo on mount
  useEffect(() => {
    setDemo('logic-gates');
  }, []);

  const handleInputA = () => {
    const newValue = !inputA;
    setInputA(newValue);
    sendLogicGatesInput({ inputA: newValue, inputB });
  };

  const handleInputB = () => {
    const newValue = !inputB;
    setInputB(newValue);
    sendLogicGatesInput({ inputA, inputB: newValue });
  };

  return (
    <>
      <div>
      </div>
      <h3>Logic Gates</h3>
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
        <div className="num-pad-container" style = {{marginTop: '20px'}}>
          <button className = 'num-pad' onClick={handleInputA} style={{backgroundColor: inputA ? '#4CAF50' : '#f44336'}}>A</button>
          <button className = 'num-pad' onClick={handleInputB} style={{backgroundColor: inputB ? '#4CAF50' : '#f44336'}}>B</button>
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