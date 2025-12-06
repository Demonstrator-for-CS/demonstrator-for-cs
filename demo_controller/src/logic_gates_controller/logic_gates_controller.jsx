/**
 * Logic Gates Controller Component
 *
 * This controller is displayed when the Logic Gates demo is active. It provides:
 *     - Left/right arrow buttons to navigate between logic gate slides
 *     - Input toggles (A and B) to control the logic gate inputs on the demo-site
 *     - Home button to return to the demo selection screen
 *
 * The Logic Gates demo consists of 8 slides (0-7) that teach:
 *     - Introduction to binary and logic gates
 *     - OR, AND, XOR, NOT gates
 *     - Combining gates to create complex circuits
 *     - Building a simple adder circuit
 *
 * When users toggle input A or B, the change is immediately sent to the demo-site
 * to update the interactive logic gate visualization.
 */
import { useState } from 'react'
import '@/css/App.css'
import { navigate, pause, sendLogicGatesInput, setDemo, navigateHome } from '@/services/api'
import { useEffect } from 'react'

function App() {
  // Track the state of logic gate inputs A and B
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);

  // Set the active demo when this controller mounts
  useEffect(() => {
    setDemo('logic-gates');
  }, []);

  /**
   * Toggle input A and send the updated values to the demo-site.
   * The demo-site will update its logic gate visualization in real-time.
   */
  const handleInputA = () => {
    const newValue = !inputA;
    setInputA(newValue);
    sendLogicGatesInput({ inputA: newValue, inputB });
  };

  /**
   * Toggle input B and send the updated values to the demo-site.
   * The demo-site will update its logic gate visualization in real-time.
   */
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