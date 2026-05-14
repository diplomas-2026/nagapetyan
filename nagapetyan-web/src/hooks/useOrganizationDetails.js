import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export function useOrganizationDetails(role, organizationId, targetOrganizationId) {
  const [organization, setOrganization] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!targetOrganizationId) {
      return;
    }

    try {
      setLoading(true);
      const [organizationData, dashboardData, membersData, reportsData] = await Promise.all([
        api.getOrganization(role, organizationId, targetOrganizationId),
        api.getDashboard(role, targetOrganizationId),
        api.getMembers(role, targetOrganizationId),
        api.getReports(role, targetOrganizationId),
      ]);

      setOrganization(organizationData);
      setDashboard(dashboardData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } finally {
      setLoading(false);
    }
  }, [organizationId, role, targetOrganizationId]);

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
