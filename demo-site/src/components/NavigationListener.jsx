import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useServerState } from '@/hooks/useServerState.js';

export default function NavigationListener() {
  const navigate = useNavigate();
  const { socket } = useServerState();

  useEffect(() => {
    if (!socket) return;

    const handleNavigateHome = () => {
      navigate('/');
    };

    socket.on('navigate_to_home', handleNavigateHome);

    return () => {
      socket.off('navigate_to_home', handleNavigateHome);
    };
  }, [socket, navigate]);

  return null; // This component doesn't render anything
}
