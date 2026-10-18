'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import { Search, ChevronLeft, ChevronRight, MousePointerClick, X, ShieldCheck, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { buildDeduplicatedCreators, matchesCreatorFilter } from '@/lib/adminCreators';
import { cleanProductTitle } from '@/lib/titleSanitizer';

export default function ProductClicksPage() {
  const router = useRouter();
  const [clicks, setClicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('ADMIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState('ALL');
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const filterBarRef = useRef(null);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchClicks();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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

      // Fetch admin & sub-admin users list from /auth if ADMIN
      if (adminUser.role === 'ADMIN') {
        try {
          const usersRes = await fetch(`${apiUrl}/auth`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (usersRes.ok) {
            const uData = await usersRes.json();
            const allUsers = Array.isArray(uData) ? uData : uData.users || [];
            const adminUsers = allUsers.filter(u => u.role === 'ADMIN' || u.role === 'SUB_ADMIN');
            setAdminUsersList(adminUsers);
          }
        } catch (err) {
          console.error('Failed to load admin users', err);
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

  const handleAdminSelect = (adminId) => {
    setSelectedAdmin(adminId);
    setOpenDropdown(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAdmin('ALL');
    setCurrentPage(1);
  };

  // Build the list of admins/sub-admins for the dropdown filter
  const allCreators = (() => {
    let currentAdmin = null;
    try {
      const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (adminStr) currentAdmin = JSON.parse(adminStr);
    } catch (e) {}

    return buildDeduplicatedCreators({
      currentAdmin,
      adminUsersList,
      items: clicks,
      getItemCreator: (c) => c.product?.createdBy,
      getItemCreatorId: (c) => c.product?.createdById,
    });
  })();

  // Filter clicks
  const filteredClicks = clicks.filter((click) => {
    // Admin filter (only applies if user is ADMIN; SUB_ADMIN is already restricted by backend)
    const matchesAdmin = userRole !== 'ADMIN' || selectedAdmin === 'ALL' || matchesCreatorFilter(click.product?.createdById, selectedAdmin, allCreators);
    if (!matchesAdmin) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const productTitle = click.product?.title?.toLowerCase() || '';
    const storeName = click.product?.storeRel?.name?.toLowerCase() || '';
    const userName = click.user?.name?.toLowerCase() || '';
    const userEmail = click.user?.email?.toLowerCase() || '';
    const ipAddress = click.ipAddress?.toLowerCase() || '';
    const creatorName = click.product?.createdBy?.name?.toLowerCase() || '';

    return (
      productTitle.includes(term) ||
      storeName.includes(term) ||
      userName.includes(term) ||
      userEmail.includes(term) ||
      ipAddress.includes(term) ||
      creatorName.includes(term)
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
                {filteredClicks.length !== clicks.length ? `${filteredClicks.length} / ${clicks.length} Clicks` : `${clicks.length} Total Clicks`}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">See which users clicked on your deals</p>
        </div>

        {/* Filters Row */}
        <div ref={filterBarRef} className={`flex flex-wrap items-center gap-2.5 w-full md:w-auto relative transition-all ${openDropdown ? 'z-50' : 'z-20'}`}>
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64 md:w-64">
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
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Admin / Sub-Admin Filter Dropdown (Only for ADMIN role) */}
          {userRole === 'ADMIN' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(!openDropdown)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                  selectedAdmin !== 'ALL'
                    ? 'bg-orange-50 border-[#f96b02] text-[#f96b02] ring-2 ring-orange-100'
                    : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate max-w-[130px]">
                    {selectedAdmin === 'ALL'
                      ? 'All Admins'
                      : (allCreators.find(c => String(c.id) === String(selectedAdmin))?.name || 'Selected Admin')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown ? 'rotate-180 text-black' : 'text-neutral-400'}`} />
              </button>

              {openDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 min-w-[220px] max-w-sm animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                    Filter by Admin
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {/* All Option */}
                    <button
                      type="button"
                      onClick={() => handleAdminSelect('ALL')}
                      className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                        selectedAdmin === 'ALL'
                          ? 'bg-orange-50 font-bold text-[#f96b02]'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="font-bold">All Admins & Sub-Admins</span>
                      {selectedAdmin === 'ALL' && <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />}
                    </button>

                    {/* Admin / Sub-Admin Options */}
                    {allCreators.map((creator) => (
                      <button
                        key={creator.id}
                        type="button"
                        onClick={() => handleAdminSelect(creator.id)}
                        className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-left ${
                          String(selectedAdmin) === String(creator.id)
                            ? 'bg-orange-50 font-bold text-[#f96b02]'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate font-semibold">{creator.name}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                            creator.role === 'ADMIN' ? 'bg-neutral-900 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {creator.role === 'ADMIN' ? 'Main Admin' : 'Sub-Admin'}
                          </span>
                        </div>
                        {String(selectedAdmin) === String(creator.id) && (
                          <Check className="w-3.5 h-3.5 text-[#f96b02] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset Filters Button */}
          {(searchTerm || (userRole === 'ADMIN' && selectedAdmin !== 'ALL')) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 border border-red-200 cursor-pointer shadow-2xs"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
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
                  {searchTerm || selectedAdmin !== 'ALL'
                    ? 'No clicks matching your filter criteria.'
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
                    <td className="px-4 py-3 sm:px-6 sm:py-4 max-w-[200px] sm:max-w-[300px]" title={click.product?.title}>
                      <div className="truncate font-medium text-neutral-900">
                        {cleanProductTitle(click.product?.title || 'Unknown Product')}
                      </div>
                      {userRole === 'ADMIN' && click.product?.createdBy && (
                        <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                          Added by: <span className="font-semibold text-neutral-600">{click.product.createdBy.name || click.product.createdBy.email}</span>
                        </div>
                      )}
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
      <div className="px-3 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white">
        <div className="text-xs sm:text-sm text-neutral-500 font-medium text-center sm:text-left">
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
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto py-0.5">
            {/* Prev Button */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
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
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 sm:min-w-[32px] sm:h-8 sm:px-2 flex items-center justify-center text-xs font-bold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-neutral-900 text-white shadow-2xs'
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
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
