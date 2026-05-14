import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SESSION_KEY = 'nag-session';

const SessionContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => readSession() || { token: '', user: null, selectedOrganizationId: '' });

  useEffect(() => {
    if (session.token && session.user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return;
    }
    localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      role: session.user?.role || 'SYSTEM_ADMIN',
      organizationId: session.selectedOrganizationId || session.user?.organizationId || '',
      setAuth(authResponse) {
        setSession({
          token: authResponse.token,
          user: authResponse.user,
          selectedOrganizationId: String(authResponse.user?.organizationId || ''),
        });
      },
      setOrganizationId(nextOrganizationId) {
        setSession((current) => ({
          ...current,
          selectedOrganizationId: nextOrganizationId ? String(nextOrganizationId) : '',
        }));
      },
      clearSession() {
        setSession({ token: '', user: null, selectedOrganizationId: '' });
        localStorage.removeItem(SESSION_KEY);
      },
    }),
    [session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
