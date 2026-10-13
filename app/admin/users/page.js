'use client';
import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, Mail, Phone, Trash2, ShieldCheck, ShieldAlert, User, ChevronDown, Check, Loader2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';

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
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: true });


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
          setUsers(data.users);
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

  const handleDeleteUser = async (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
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
          
          const data = await res.json();
          if (res.ok) {
            setUsers(users.filter(u => u.id !== userId && u._id !== userId));
          } else {
            alert(data.error || 'Failed to delete user');
          }
        } catch (err) {
          console.error('Failed to delete user', err);
          alert('Failed to delete user. Please try again.');
        }
      }
    });
  };

  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

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
        setSuccessToast(`User role successfully changed to ${newRole === 'SUB_ADMIN' ? 'Sub-Admin' : newRole === 'ADMIN' ? 'Main Admin' : 'User'}!`);
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error('Failed to change user role', err);
      alert('Unable to connect to backend server. Please verify backend is running on port 5000 and try again.');
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
          alert('You cannot change your own role from Main Admin to prevent losing access to the admin dashboard.');
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
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-neutral-700 animate-popup">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-neutral-900">Users Management</h3>
          <p className="text-sm text-neutral-500">View and manage registered user accounts & roles</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2.5 pl-10 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-visible w-full">
        {isLoading ? <PageLoader /> : (
        <div className="overflow-x-auto md:overflow-visible w-full">
          <table className="w-full text-left border-separate border-spacing-0 text-sm min-w-[780px]">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6 border-b border-neutral-200">User</th>
                <th className="p-4 border-b border-neutral-200">Email</th>
                <th className="p-4 border-b border-neutral-200">Mobile</th>
                <th className="p-4 border-b border-neutral-200">Role</th>
                <th className="p-4 border-b border-neutral-200">Status</th>
                <th className="p-4 pr-6 text-right border-b border-neutral-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((u, i) => {
                const userRoleKey = u.role || 'USER';
                const currentConfig = ROLES.find(r => r.key === userRoleKey) || ROLES[0];
                const CurrentIcon = currentConfig.icon;
                const userId = u.id || u._id;
                const isDropdownOpen = openRoleId === userId;
                const openUpwards = i >= 2 && filteredUsers.length >= 3;

                return (
                  <tr key={i} className={`transition-colors ${isDropdownOpen ? 'relative z-30 bg-neutral-50/90' : 'relative z-0 hover:bg-neutral-50/70'}`}>
                    <td className="p-4 pl-6 font-bold text-neutral-900 border-b border-neutral-100">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span>{u.name || 'User'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600 font-mono text-xs border-b border-neutral-100">{u.email}</td>
                    <td className="p-4 text-neutral-600 border-b border-neutral-100">{u.mobile || 'N/A'}</td>
                    <td className={`p-4 border-b border-neutral-100 ${isDropdownOpen ? 'relative z-40' : 'relative'}`}>
                      {/* Modern Interactive Role Dropdown */}
                      <div className="relative inline-block text-left">
                        {updatingUserId === userId ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-300 bg-neutral-100 text-neutral-600 shadow-xs">
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
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer shadow-xs active:scale-95 select-none ${currentConfig.badgeClass}`}
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
                              className={`absolute left-0 ${openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'} w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-1.5 z-50 animate-popup divide-y divide-neutral-100`}
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
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Button variant="none" size="none"
                        onClick={() => handleDeleteUser(userId)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}