import { useState } from 'react'
import { useNavigate } from 'react-router'
import '@/css/App.css'
import { navigate, setDemo } from '@/services/api'

const DEMO_PATHS = ['/logic-gates', '/searching-sorting'];
const NUM_DEMOS = DEMO_PATHS.length;

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigateRouter = useNavigate();

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + NUM_DEMOS) % NUM_DEMOS);
    navigate('prev');
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % NUM_DEMOS);
    navigate('next');
  };

  const handleSelect = () => {
    // Calculate which demo based on current position
    const demoPath = DEMO_PATHS[currentIndex % NUM_DEMOS];

    // Send navigate select with the demo path so HomePage knows which demo to load
    navigate('select', { demoPath });

    // Also send the demo path so server knows which demo to load
    setDemo(demoPath);

    // Navigate the controller to the appropriate controller page
    navigateRouter(demoPath);
  };

  return (
    <>
      <div>
      </div>
      <h3>Select Demo</h3>
      <div className="card">
        <button className = "navigate-button" onClick={handlePrev}> ← </button>
        <button className = "navigate-button" onClick={handleSelect}> Select </button>
        <button className = "navigate-button" onClick={handleNext}> → </button>
      </div>
      <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
      <p className="read-the-docs">
      </p>
    </>
  )
}

export default App