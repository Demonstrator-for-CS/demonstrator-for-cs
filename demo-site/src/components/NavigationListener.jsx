import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useServerState } from '@/hooks/useServerState.js';

export default function NavigationListener() {
  const navigate = useNavigate();
  const { command, consumeCommand } = useServerState();

  useEffect(() => {
    if (command && command.name === 'navigate_to_home') {
      navigate('/');
      consumeCommand();
    }
  }, [command, navigate, consumeCommand]);

  return null;
}
