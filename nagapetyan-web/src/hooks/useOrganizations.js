import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export function useOrganizations(token) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!token) {
      setOrganizations([]);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getOrganizations(token);
      setOrganizations(Array.isArray(data) ? data : []);
    } catch {
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
