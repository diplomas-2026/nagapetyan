import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export function useOrganizationDetails(token, targetOrganizationId) {
  const [organization, setOrganization] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!token || !targetOrganizationId) {
      return;
    }

    try {
      setLoading(true);
      const [organizationData, dashboardData, membersData, reportsData] = await Promise.all([
        api.getOrganization(token, targetOrganizationId),
        api.getDashboard(token, targetOrganizationId),
        api.getMembers(token, targetOrganizationId),
        api.getReports(token, targetOrganizationId),
      ]);

      setOrganization(organizationData);
      setDashboard(dashboardData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch {
      setOrganization(null);
      setDashboard(null);
      setMembers([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [targetOrganizationId, token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    organization,
    dashboard,
    members,
    reports,
    loading,
    reload,
    setOrganization,
    setDashboard,
    setMembers,
    setReports,
  };
}
