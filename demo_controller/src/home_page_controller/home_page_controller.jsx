/**
 * Home Page Controller Component
 *
 * This is the initial controller screen that users see when they scan the QR code.
 * It allows users to navigate between available demos and select one to launch.
 *
 * The controller displays simple left/right arrow buttons to cycle through demos,
 * and a "Select Demo" button to launch the chosen demo. When a demo is selected:
 *     1. The demo-site switches to the selected demo
 *     2. The controller navigates to the demo-specific controller page
 *     3. The server updates its state to track the active demo
 *
 * Available demos:
 *     - Logic Gates (/logic-gates)
 *     - Searching & Sorting (/searching-sorting)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import '@/css/App.css'
import { navigate, setDemo } from '@/services/api'

// List of available demo paths
const DEMO_PATHS = ['/logic-gates', '/searching-sorting'];
const NUM_DEMOS = DEMO_PATHS.length;

function App() {
  // Track which demo is currently highlighted in the carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigateRouter = useNavigate();

  /**
   * Navigate to the previous demo in the carousel.
   * Sends a 'prev' command to the demo-site to update its carousel as well.
   */
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + NUM_DEMOS) % NUM_DEMOS);
    navigate('prev');  // Tell demo-site to also move backwards
  };

  /**
   * Navigate to the next demo in the carousel.
   * Sends a 'next' command to the demo-site to update its carousel as well.
   */
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % NUM_DEMOS);
    navigate('next');  // Tell demo-site to also move forward
  };

  /**
   * Select the currently highlighted demo and launch it.
   *
   * This performs three actions:
   *     1. Tells the demo-site to navigate to the selected demo
   *     2. Tells the server to update its active demo state
   *     3. Navigates this controller to the demo-specific controller page
   */
  const handleSelect = () => {
    // Get the demo path based on current carousel position
    const demoPath = DEMO_PATHS[currentIndex % NUM_DEMOS];

    // Send navigate select with the demo path so HomePage knows which demo to load
    navigate('select', { demoPath });

    // Tell the server which demo is now active (for state tracking)
    setDemo(demoPath);

    // Navigate the controller to the appropriate controller page
    navigateRouter(demoPath);
  };

  return (
    <>
      <div>
      </div>

      <div className="card">
        <h3 style={{fontsize: '60px'}}>Select Demo</h3>
        <div className="directions">
          <button className = "navigate-button" id='left-navigate' onClick={handlePrev}> &#8656; </button>
          <button className = "navigate-button" id='right-navigate' onClick={handleNext} > &#8658; </button>
        </div>
        <button className = "navigate-button" id='navigate-select' onClick={handleSelect}> Select Demo </button>
        <p className="read-the-docs" id = 'instructions'>
        Use these buttons to navigate through the demonstrator!
      </p>
      </div>
    </>
  )
}

export default App