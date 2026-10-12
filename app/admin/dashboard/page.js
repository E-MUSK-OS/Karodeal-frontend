'use client';
import { useState, useEffect } from 'react';
import PageLoader from '@/components/common/PageLoader';
import SubAdminDashboard from '@/components/admin/dashboard/SubAdminDashboard';
import MainAdminDashboard from '@/components/admin/dashboard/MainAdminDashboard';

export default function AdminDashboardPage() {
  const [role, setRole] = useState(null);
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [latestDeals, setLatestDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authStr = localStorage.getItem('adminUser');
        if (!authStr) {
          setIsLoading(false);
          return;
        }
        const user = JSON.parse(authStr);
        setRole(user.role || 'ADMIN');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        
        const res = await fetch(`${apiUrl}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role || user.role || 'ADMIN');
          setStats(data.stats || {});
          setRecentUsers(data.recentUsers || []);
          setRecentClaims(data.recentClaims || []);
          setLatestDeals(data.latestDeals || []);
        } else {
          console.error("Failed to load admin stats");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return role === 'SUB_ADMIN' ? (
    <SubAdminDashboard stats={stats} latestDeals={latestDeals} />
  ) : (
    <MainAdminDashboard stats={stats} recentUsers={recentUsers} />
  );
}
