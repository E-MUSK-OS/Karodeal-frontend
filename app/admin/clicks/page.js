'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';

export default function ProductClicksPage() {
  const router = useRouter();
  const [clicks, setClicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClicks();
  }, []);

  const fetchClicks = async () => {
    try {
      const adminStr = localStorage.getItem('adminUser');
      if (!adminStr) {
        router.push('/admin/login');
        return;
      }
      
      const adminUser = JSON.parse(adminStr);
      const token = adminUser.token;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/admin/clicks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setClicks(data);
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminUser');
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('Failed to fetch clicks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6 border-b border-neutral-200">
        <h2 className="font-bold text-neutral-900">Product Click Analytics</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">See which users clicked on your deals</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50 text-neutral-500 font-medium">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Time</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Product Name</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Store</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">User Name</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">User Email / IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {clicks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">
                  No clicks recorded yet.
                </td>
              </tr>
            ) : (
              clicks.map((click) => (
                <tr key={click.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-neutral-600">
                    {new Date(click.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-neutral-900 max-w-[200px] sm:max-w-[300px] truncate">
                    {click.product?.title || 'Unknown Product'}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-neutral-600">
                    {click.product?.storeRel?.name || '-'}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    {click.userId ? (
                      <span className="font-medium text-blue-600">{click.user?.name || 'No Name'}</span>
                    ) : (
                      <span className="text-neutral-500 italic">Guest User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-neutral-600">
                    {click.userId ? (
                      click.user?.email || '-'
                    ) : (
                      <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{click.ipAddress || 'Unknown IP'}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
