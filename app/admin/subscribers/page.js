'use client';
import { useState, useEffect } from 'react';
import { Search, Mail, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: true });

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const adminStr = localStorage.getItem('adminUser');
        let token = '';
        if (adminStr) {
          const adminUser = JSON.parse(adminStr);
          token = adminUser.token;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

        const res = await fetch(`${apiUrl}/newsletter/subscribers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.success) {
          setSubscribers(data.subscribers);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch subscribers', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const handleDeleteSubscriber = async (subscriberId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subscriber',
      message: 'Are you sure you want to delete this subscriber? They will no longer receive emails.',
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
          const res = await fetch(`${apiUrl}/newsletter/subscribers/${subscriberId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const data = await res.json();
          if (res.ok) {
            setSubscribers(subscribers.filter(s => s.id !== subscriberId));
          } else {
            alert(data.error || 'Failed to delete subscriber');
          }
        } catch (err) {
          console.error('Failed to delete subscriber', err);
          alert('Failed to delete subscriber. Please try again.');
        }
      }
    });
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-neutral-900">Newsletter Subscribers</h3>
          <p className="text-sm text-neutral-500">View and manage users who subscribed to the newsletter</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email..."
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
                <th className="p-4 pl-6">Email Address</th>
                <th className="p-4">Subscribed On</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-neutral-500">
                    No subscribers found.
                  </td>
                </tr>
              ) : filteredSubscribers.map((s, i) => (
                <tr key={s.id || i} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="p-4 pl-6 font-bold text-neutral-900 flex items-center gap-3 whitespace-nowrap">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{s.email}</span>
                  </td>
                  <td className="p-4 text-neutral-600">
                    {new Date(s.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Button variant="none" size="none"
                      onClick={() => handleDeleteSubscriber(s.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Subscriber"
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
