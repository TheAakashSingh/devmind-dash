import { useEffect, useState } from 'react';

const KEY = 'devmind_token';
const AUTH_EVENT = 'devmind-auth-change';

function readToken() {
  return localStorage.getItem(KEY);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => readToken());

  useEffect(() => {
    const sync = () => setToken(readToken());

    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_EVENT, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, []);

  const login = (t: string) => {
    localStorage.setItem(KEY, t);
    setToken(t);
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem('devmind_apikey');
    setToken(null);
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  return { token, login, logout };
}
