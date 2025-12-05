import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useServerState } from '@/hooks/useServerState.js';

export default function NavigationListener() {
  const navigate = useNavigate();
  const { state} = useServerState();

  useEffect(() => {
    if (state.status === 'home') {
      navigate('/');
    }
  }, [navigate, state.status]);

  return null;
}
