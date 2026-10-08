'use client';
import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, Mail, Phone, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-neutral-900">Users Management</h3>
          <p className="text-sm text-neutral-500">View and manage registered user accounts</p>
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

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden w-full">
        {isLoading ? <PageLoader /> : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((u, i) => (
                <tr key={i} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="p-4 pl-6 font-bold text-neutral-900 flex items-center gap-3 whitespace-nowrap">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <span>{u.name || 'User'}</span>
                  </td>
                  <td className="p-4 text-neutral-600 font-mono text-xs">{u.email}</td>
                  <td className="p-4 text-neutral-600">{u.mobile || 'N/A'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Button variant="none" size="none"
                      onClick={() => handleDeleteUser(u.id || u._id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}