'use client';
import { useState, useEffect } from 'react';
import { Search, Mail, Trash2, MessageSquare } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: true });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const adminStr = localStorage.getItem('adminUser');
        let token = '';
        if (adminStr) {
          const adminUser = JSON.parse(adminStr);
          token = adminUser.token;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

        const res = await fetch(`${apiUrl}/contact/messages`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleDeleteMessage = async (messageId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
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
          const res = await fetch(`${apiUrl}/contact/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const data = await res.json();
          if (res.ok) {
            setMessages(messages.filter(m => m.id !== messageId));
          } else {
            alert(data.error || 'Failed to delete message');
          }
        } catch (err) {
          console.error('Failed to delete message', err);
          alert('Failed to delete message. Please try again.');
        }
      }
    });
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-neutral-900">Contact Messages</h3>
          <p className="text-sm text-neutral-500">View and manage messages sent from the Contact Us form</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-full px-4 py-2.5 pl-10 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden w-full">
        {isLoading ? <PageLoader /> : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm min-w-[900px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Sender</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-neutral-500">
                    No messages found.
                  </td>
                </tr>
              ) : filteredMessages.map((m, i) => (
                <tr key={m.id || i} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="p-4 pl-6 align-middle">
                    <div className="font-bold text-neutral-900">{m.name}</div>
                    <div className="text-neutral-500 font-mono text-xs mt-1">{m.email}</div>
                  </td>
                  <td className="p-4 text-neutral-600 align-middle whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4 pr-6 text-right align-middle">
                    <div className="flex justify-end gap-2">
                      <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Open Gmail Inbox">
                        <Mail className="w-4 h-4" /> Open Gmail
                      </a>
                    </div>
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
