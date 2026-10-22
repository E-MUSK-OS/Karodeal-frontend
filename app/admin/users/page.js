'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  ChevronDown, 
  Check, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import SubAdminPermissionsModal from '@/components/admin/users/SubAdminPermissionsModal';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';

const ROLES = [
  {
    key: 'USER',
    label: 'User',
    description: 'Standard customer account',
    badgeClass: 'bg-neutral-100 hover:bg-neutral-200/90 text-neutral-800 border-neutral-200/80',
    icon: User,
    iconColor: 'text-neutral-500',
  },
  {
    key: 'SUB_ADMIN',
    label: 'Sub-Admin',
    description: 'Manage products & clicks',
    badgeClass: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs',
    icon: ShieldCheck,
    iconColor: 'text-amber-600',
  },
  {
    key: 'ADMIN',
    label: 'Main Admin',
    description: 'Full system & financial permissions',
    badgeClass: 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 shadow-xs',
    icon: ShieldAlert,
    iconColor: 'text-amber-400',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openRoleId, setOpenRoleId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    confirmText: '', 
    onConfirm: () => {}, 
    isDestructive: true 
  });
  const [permissionsModalUser, setPermissionsModalUser] = useState(null);

  const handlePermissionsUpdated = (userId, updatedData) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId || u._id === userId) {
        return { 
          ...u, 
          role: updatedData.role || u.role, 
          permissions: updatedData.permissions || u.permissions 
        };
      }
      return u;
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminStr = localStorage.getItem('adminUser');
        let token = '';
        if (adminStr) {
          const adminUser = JSON.parse(adminStr);
          token = adminUser.token;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

        const res = await fetch(`${apiUrl}/auth`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDeleteUser = async (userId) => {
    const targetUser = users.find(u => (u.id === userId || u._id === userId));
    const targetEmail = targetUser?.email || 'this user';
    const targetRole = targetUser?.role || 'USER';
    const roleLabel = targetRole === 'ADMIN' ? 'Main Admin' : targetRole === 'SUB_ADMIN' ? 'Sub-Admin' : 'User';

    // Guard: Prevent logged-in admin from deleting their own account
    try {
      const adminStr = localStorage.getItem('adminUser');
      if (adminStr) {
        const currentAdmin = JSON.parse(adminStr);
        const currentId = currentAdmin.id || currentAdmin._id;
        if (currentId === userId || (targetUser?.email && currentAdmin.email === targetUser.email)) {
          showErrorToast('You cannot delete your own active administrator account.');
          return;
        }
      }
    } catch { }

    setConfirmModal({
      isOpen: true,
      title: `Delete ${roleLabel} Account`,
      message: `Are you sure you want to permanently delete "${targetEmail}"? All associated data across the entire system (including wallet, transactions, cashback claims, tickets, messages, product clicks, OTPs, and newsletter subscriptions) will be permanently deleted. This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const adminStr = localStorage.getItem('adminUser');
          let token = '';
          if (adminStr) {
            const adminUser = JSON.parse(adminStr);
            token = adminUser.token;
          }
          
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
          const res = await fetch(`${apiUrl}/auth/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            setUsers(prev => prev.filter(u => u.id !== userId && u._id !== userId));
            showSuccessToast(`Account "${targetEmail}" and all related data deleted successfully.`);
          } else {
            handleAppError(data.error || 'Failed to delete user', {
              context: 'Admin Users / Delete',
              title: 'Delete Failed'
            });
          }
        } catch (err) {
          handleAppError(err, {
            context: 'Admin Users / Delete Network',
            title: 'Delete Error'
          });
        }
      }
    });
  };

  const executeRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const adminStr = localStorage.getItem('adminUser');
      let token = '';
      if (adminStr) {
        const adminUser = JSON.parse(adminStr);
        token = adminUser.token;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/auth/role/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, role: newRole } : u));
        showSuccessToast(`User role successfully changed to ${newRole === 'SUB_ADMIN' ? 'Sub-Admin' : newRole === 'ADMIN' ? 'Main Admin' : 'User'}!`);
      } else {
        handleAppError(data.error || 'Failed to update user role', {
          context: 'Admin Users / Role Change',
          title: 'Role Update Failed'
        });
      }
    } catch (err) {
      handleAppError(err, {
        context: 'Admin Users / Role Change Network',
        title: 'Connection Error'
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const requestRoleChange = (user, newRole) => {
    if ((user.role || 'USER') === newRole) return;

    // Guard: Prevent currently logged in admin from demoting themselves
    try {
      const adminStr = localStorage.getItem('adminUser');
      if (adminStr) {
        const currentAdmin = JSON.parse(adminStr);
        const currentId = currentAdmin.id || currentAdmin._id;
        const targetId = user.id || user._id;
        if ((currentId === targetId || currentAdmin.email === user.email) && newRole !== 'ADMIN') {
          showErrorToast('You cannot change your own role from Main Admin to prevent losing access to the admin dashboard.', 'Role Protection');
          return;
        }
      }
    } catch (_) {}

    const roleLabels = {
      USER: 'User',
      SUB_ADMIN: 'Sub-Admin',
      ADMIN: 'Main Admin',
    };

    const targetLabel = roleLabels[newRole] || newRole;
    const currentLabel = roleLabels[user.role || 'USER'] || (user.role || 'User');
    const userName = user.name || user.email;

    setConfirmModal({
      isOpen: true,
      title: 'Confirm Role Change',
      message: `Are you sure you want to change the role of "${userName}" from ${currentLabel} to ${targetLabel}?`,
      confirmText: `Change to ${targetLabel}`,
      isDestructive: false,
      onConfirm: async () => {
        await executeRoleChange(user.id || user._id, newRole);
      }
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile?.includes(searchQuery)
  );

  // Pagination calculations
  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));
  const currentSafePage = Math.min(currentPage, totalPages);
  const startIndex = (currentSafePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Role dropdown renderer for both mobile card & desktop row
  const renderRoleDropdown = (u, isMobile = false, openUpwards = false) => {
    const userRoleKey = u.role || 'USER';
    const currentConfig = ROLES.find(r => r.key === userRoleKey) || ROLES[0];
    const CurrentIcon = currentConfig.icon;
    const userId = u.id || u._id;
    const isDropdownOpen = openRoleId === userId;

    return (
      <div className="relative inline-block text-left">
        {updatingUserId === userId ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-300 bg-neutral-100 text-neutral-600 shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Updating...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenRoleId(isDropdownOpen ? null : userId);
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer shadow-2xs active:scale-95 select-none ${currentConfig.badgeClass}`}
          >
            <CurrentIcon className={`w-3.5 h-3.5 ${currentConfig.iconColor}`} />
            <span>{currentConfig.label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-60 ${isDropdownOpen ? 'rotate-180 opacity-100' : ''}`} />
          </button>
        )}

        {isDropdownOpen && (
          <>
            {/* Click outside backdrop */}
            <div
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setOpenRoleId(null);
              }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute ${isMobile ? 'left-0 sm:left-auto right-0' : 'left-0'} ${
                openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
              } w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-1.5 z-50 animate-popup divide-y divide-neutral-100`}
            >
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Assign Account Role
              </div>
              <div className="p-1 space-y-0.5">
                {ROLES.map((role) => {
                  const RoleIcon = role.icon;
                  const isSelected = userRoleKey === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRoleId(null);
                        if (!isSelected) {
                          requestRoleChange(u, role.key);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-100 font-bold text-neutral-900'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          role.key === 'ADMIN' ? 'bg-neutral-900 text-white' :
                          role.key === 'SUB_ADMIN' ? 'bg-amber-100 text-amber-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{role.label}</div>
                          <div className="text-[10px] text-neutral-400 leading-tight mt-0.5">{role.description}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section with User counter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-extrabold text-neutral-900">Users Management</h3>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">View and manage registered user accounts & roles</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or mobile..."
            className="w-full px-4 py-2.5 pl-10 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-visible w-full">
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-neutral-900 text-base">No users found</h4>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm">
              {searchQuery ? `No user accounts matching "${searchQuery}". Try searching by another name or email.` : 'No registered users available.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (visible on screen widths < 768px) */}
            <div className="block md:hidden divide-y divide-neutral-100">
              {paginatedUsers.map((u, i) => {
                const userId = u.id || u._id;
                const isDropdownOpen = openRoleId === userId;
                const openUpwards = i >= Math.max(1, paginatedUsers.length - 2);

                return (
                  <div 
                    key={userId || i} 
                    className={`p-4 transition-colors ${isDropdownOpen ? 'relative z-30 bg-neutral-50/90' : 'relative z-0 hover:bg-neutral-50/60'}`}
                  >
                    {/* Header: User Avatar, Name, Sr. No. & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-neutral-900 text-sm truncate">
                            {u.name || 'User'}
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-400">
                            #{startIndex + i + 1}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-1.5 bg-neutral-50/80 rounded-xl p-3 border border-neutral-150/70 text-xs mb-3">
                      <div className="flex items-center gap-2 text-neutral-700 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="font-mono text-neutral-600 truncate break-all" title={u.email}>
                          {u.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-neutral-600">
                          {u.mobile || <span className="text-neutral-400 italic">No mobile registered</span>}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Role and Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-500">Role:</span>
                        {renderRoleDropdown(u, true, openUpwards)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPermissionsModalUser(u)}
                          className={`p-2 rounded-xl transition-all cursor-pointer border ${
                            u.role === 'SUB_ADMIN'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 shadow-2xs'
                              : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 border-transparent hover:border-neutral-200'
                          }`}
                          title={u.role === 'SUB_ADMIN' ? 'Sub-Admin Permissions & Access' : 'Configure Sub-Admin Permissions'}
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>

                        <Button 
                          variant="none" 
                          size="none"
                          onClick={() => handleDeleteUser(userId)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (visible on screen widths >= 768px) */}
            <div className="hidden md:block overflow-x-auto overflow-y-visible w-full">
              <table className="w-full text-left border-collapse text-sm min-w-[760px]">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
                    <th className="py-3.5 px-6 w-16">#</th>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Mobile</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedUsers.map((u, i) => {
                    const userId = u.id || u._id;
                    const isDropdownOpen = openRoleId === userId;
                    const openUpwards = i >= Math.max(1, paginatedUsers.length - 3);

                    return (
                      <tr 
                        key={userId || i} 
                        className={`transition-colors ${isDropdownOpen ? 'relative z-30 bg-neutral-50/90' : 'relative z-0 hover:bg-neutral-50/70'}`}
                      >
                        <td className="py-4 px-6 font-mono text-xs text-neutral-400 font-semibold">
                          {startIndex + i + 1}
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="truncate max-w-[180px]" title={u.name || 'User'}>
                              {u.name || 'User'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-neutral-600 font-mono text-xs">
                          <span className="truncate max-w-[220px] inline-block" title={u.email}>
                            {u.email}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-neutral-600 text-xs">
                          {u.mobile || <span className="text-neutral-400 italic">N/A</span>}
                        </td>
                        <td className="py-4 px-6">
                          {renderRoleDropdown(u, false, openUpwards)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-6 pr-8 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPermissionsModalUser(u)}
                              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                                u.role === 'SUB_ADMIN'
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 shadow-2xs'
                                  : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 border-transparent hover:border-neutral-200'
                              }`}
                              title={u.role === 'SUB_ADMIN' ? 'Sub-Admin Permissions & Access' : 'Configure Sub-Admin Permissions'}
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            <Button 
                              variant="none" 
                              size="none"
                              onClick={() => handleDeleteUser(userId)}
                              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
              <div className="text-center sm:text-left">
                Showing <strong className="text-neutral-900">{startIndex + 1}</strong> to{' '}
                <strong className="text-neutral-900">{endIndex}</strong> of{' '}
                <strong className="text-neutral-900">{totalUsers}</strong> users
                <span className="ml-2 text-neutral-400 font-normal hidden sm:inline">(25 per page)</span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto py-0.5">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentSafePage === 1}
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
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentSafePage <= 3) {
                        pageNum = i + 1;
                      } else if (currentSafePage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentSafePage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 sm:min-w-[32px] sm:h-8 sm:px-2 flex items-center justify-center text-xs font-bold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                            currentSafePage === pageNum
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentSafePage === totalPages}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                    title="Next Page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />

      <SubAdminPermissionsModal
        isOpen={!!permissionsModalUser}
        onClose={() => setPermissionsModalUser(null)}
        user={permissionsModalUser}
        onPermissionsUpdated={handlePermissionsUpdated}
      />
    </div>
  );
}