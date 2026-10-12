'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import { Search, ChevronLeft, ChevronRight, MousePointerClick, X } from 'lucide-react';

export default function ProductClicksPage() {
  const router = useRouter();
  const [clicks, setClicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('ADMIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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
      setUserRole(adminUser.role || 'ADMIN');
      const token = adminUser.token;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/admin/clicks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setClicks(Array.isArray(data) ? data : []);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter clicks
  const filteredClicks = clicks.filter((click) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const productTitle = click.product?.title?.toLowerCase() || '';
    const storeName = click.product?.storeRel?.name?.toLowerCase() || '';
    const userName = click.user?.name?.toLowerCase() || '';
    const userEmail = click.user?.email?.toLowerCase() || '';
    const ipAddress = click.ipAddress?.toLowerCase() || '';

    return (
      productTitle.includes(term) ||
      storeName.includes(term) ||
      userName.includes(term) ||
      userEmail.includes(term) ||
      ipAddress.includes(term)
    );
  });

  // Pagination calculations (25 items per page)
  const totalPages = Math.ceil(filteredClicks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClicks = filteredClicks.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) return <PageLoader />;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      {/* Header and Controls */}
      <div className="p-4 sm:p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-neutral-700" />
              Product Click Analytics
            </h3>
            {userRole === 'SUB_ADMIN' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Your Cards Only
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                {clicks.length} Total Clicks
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">See which users clicked on your deals</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search clicks..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50 text-neutral-500 font-medium">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-4">#</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Time</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Product Name</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Store</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">User Name</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">User Email / IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {currentClicks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">
                  {searchTerm
                    ? 'No clicks matching your search criteria.'
                    : userRole === 'SUB_ADMIN'
                    ? 'No clicks recorded on your cards yet.'
                    : 'No clicks recorded yet.'}
                </td>
              </tr>
            ) : (
              currentClicks.map((click, index) => {
                const globalIndex = startIndex + index + 1;
                return (
                  <tr key={click.id || index} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs font-semibold text-neutral-400">
                      {globalIndex}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-neutral-600 text-xs sm:text-sm">
                      {new Date(click.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-neutral-900 max-w-[200px] sm:max-w-[300px] truncate" title={click.product?.title}>
                      {click.product?.title || 'Unknown Product'}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-neutral-600">
                      {click.product?.storeRel?.name ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                          {click.product.storeRel.name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      {click.userId ? (
                        <span className="font-semibold text-neutral-900">{click.user?.name || 'No Name'}</span>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">Guest User</span>
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-neutral-600 font-mono text-xs">
                      {click.userId ? (
                        click.user?.email || '-'
                      ) : (
                        <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
                          {click.ipAddress || 'Unknown IP'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-4 py-4 sm:px-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <div className="text-xs sm:text-sm text-neutral-500 font-medium">
          {filteredClicks.length > 0 ? (
            <>
              Showing <span className="font-bold text-neutral-900">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-neutral-900">
                {Math.min(startIndex + itemsPerPage, filteredClicks.length)}
              </span>{' '}
              of <span className="font-bold text-neutral-900">{filteredClicks.length}</span> entries
              <span className="ml-2 text-neutral-400 font-normal hidden sm:inline">(25 per page)</span>
            </>
          ) : (
            'Showing 0 entries'
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 px-2 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
                      currentPage === pageNum
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
