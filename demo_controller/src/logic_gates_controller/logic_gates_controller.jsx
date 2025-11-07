import { useState } from 'react'
import '@/css/App.css'

function App() {
  const [count, setCount] = useState(0)
  const [background, setBackground] = useState('#ffffff');

  return (
    <>
      <div>
      </div>
      <h3>Logic Gates</h3>
      <div className="card">
        <div className="directions"> 
          <button onClick={() => setCount((count) => count + 1)} id='left'>
            ←
          </button>
          <button onClick={() => setCount((count) => count - 1)} id = "right">
            →
          </button>
        </div>
        <p id = 'num-pad-title'>Num Pad</p>
        <div className="num-pad-container" style = {{marginTop: '20px'}}>
          <button className = 'num-pad'>1</button>
          <button className = 'num-pad'>2</button>
          <button className = 'num-pad'>3</button>
          <button className = 'num-pad'>4</button>
          <button className = 'num-pad'>5</button>
          <button className = 'num-pad'>6</button>
          <button className = 'num-pad'>7</button>
          <button className = 'num-pad'>8</button>
          <button className = 'num-pad'>9</button>
        </div>
        <div className="home" style = {{marginTop: '20px'}}>
          <button onClick={() => setCount((count) => count + 1)} id='home_button'>
            &#127968;
          </button>
        </div>
      </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
    </>
  )
}

export default App