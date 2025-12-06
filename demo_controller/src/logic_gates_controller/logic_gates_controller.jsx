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
      <div className="logic-gates-card">
        <h3 style={{padding: '5px'}}>Logic Gates</h3>
        <div className="directions">
          <button onClick={() => navigate('prev')} id='left'>
            &#8656;
          </button>
          <button onClick={() => navigate('next')} id = "right">
            &#8658;
          </button>
        </div>
        <p id = 'logic-gates-controls-title'>Logic Gates Controls</p>
        <div className="logic-gates-inputs-container" style = {{marginTop: '15px'}}>
          <button className = 'logic-gates-inputs' onClick={handleInputA}>A</button>
          <button className = 'logic-gates-inputs' onClick={handleInputB}>B</button>
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