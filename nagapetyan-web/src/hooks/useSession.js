import { useEffect, useState } from 'react';

const SESSION_KEY = 'nag-session';

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useSession() {
  const [session, setSession] = useState(() => readSession() || { token: '', user: null, selectedOrganizationId: '' });

  useEffect(() => {
    if (session.token && session.user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return;
    }
    localStorage.removeItem(SESSION_KEY);
  }, [session]);

  function setAuth(authResponse) {
    setSession({
      token: authResponse.token,
      user: authResponse.user,
      selectedOrganizationId: String(authResponse.user?.organizationId || ''),
    });
  }

  function setOrganizationId(nextOrganizationId) {
    setSession((current) => ({
      ...current,
      selectedOrganizationId: nextOrganizationId ? String(nextOrganizationId) : '',
    }));
  }

  function clearSession() {
    setSession({ token: '', user: null, selectedOrganizationId: '' });
    localStorage.removeItem(SESSION_KEY);
  }

  return {
    token: session.token,
    user: session.user,
    role: session.user?.role || 'SYSTEM_ADMIN',
    organizationId: session.selectedOrganizationId || session.user?.organizationId || '',
    setAuth,
    setOrganizationId,
    clearSession,
  };
}
