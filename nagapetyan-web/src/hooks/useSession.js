import { useEffect, useState } from 'react';

export function useSession() {
  const [role, setRole] = useState(localStorage.getItem('nag-role') || 'SYSTEM_ADMIN');
  const [organizationId, setOrganizationId] = useState(localStorage.getItem('nag-org-id') || '');

  useEffect(() => {
    localStorage.setItem('nag-role', role);
  }, [role]);

  useEffect(() => {
    if (organizationId) {
      localStorage.setItem('nag-org-id', organizationId);
    } else {
      localStorage.removeItem('nag-org-id');
    }
  }, [organizationId]);

  function clearSession() {
    localStorage.removeItem('nag-role');
    localStorage.removeItem('nag-org-id');
    setRole('SYSTEM_ADMIN');
    setOrganizationId('');
  }

  return {
    role,
    setRole,
    organizationId,
    setOrganizationId,
    clearSession,
  };
}
