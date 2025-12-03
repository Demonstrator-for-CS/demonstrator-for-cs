// API service for communicating with Flask server
// Controller sends data one-way - no response handling

const API_BASE_URL = 'https://pitt-cs-demo-server.onrender.com';

export const sendControllerInput = (action, payload = {}) => {
  // Fire and forget - don't wait for response
  fetch(`${API_BASE_URL}/api/controller/input`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      payload,
      timestamp: Date.now(),
    }),
  }).catch(() => {
  });
};


export const navigate = (direction, extraPayload = {}) => {
  sendControllerInput('navigate', { direction, ...extraPayload });
};

export const play = () => {
  sendControllerInput('play');
};

export const pause = () => {
  sendControllerInput('pause');
};

export const reset = () => {
  sendControllerInput('reset');
};

export const setDemo = (demo) => {
  sendControllerInput('set_demo', { demo });
};

export const sendLogicGatesInput = (input) => {
  sendControllerInput('logic_gates_input', input);
};

export const navigateHome = () => {
  sendControllerInput('navigate_home');
  // Also navigate the controller itself to home
  window.location.href = '/';
};