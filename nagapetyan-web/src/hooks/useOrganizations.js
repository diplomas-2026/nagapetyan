import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export function useOrganizations(role, organizationId) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getOrganizations(role, organizationId || undefined);
      setOrganizations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [organizationId, role]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    organizations,
    setOrganizations,
    loading,
    reload,
  };
}
