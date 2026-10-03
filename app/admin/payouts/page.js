'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Button from '@/components/common/Button';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const userStr = localStorage.getItem('adminUser');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/payouts/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (id, status, adminNote = '') => {
    if (!confirm(`Are you sure you want to mark this payout as ${status}?`)) return;

    setProcessingId(id);
    try {
      const userStr = localStorage.getItem('adminUser');
      const user = JSON.parse(userStr);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/payouts/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status, adminNote })
      });

      if (res.ok) {
        // Update local state
        setPayouts(payouts.map(p => p.id === id ? { ...p, status, adminNote } : p));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process payout');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayouts = payouts.filter(p =>
    p.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Payout Requests</h3>
          <p className="text-sm text-neutral-500">Manage user withdrawal requests</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search email, name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">User</th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Method & Details</th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <tr><td colSpan="5" className="py-8 text-center text-neutral-500">Loading...</td></tr>
              ) : filteredPayouts.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-neutral-500">No payout requests found</td></tr>
              ) : (
                filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-neutral-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-neutral-900">{payout.user?.name || 'No Name'}</div>
                      <div className="text-sm text-neutral-500">{payout.user?.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-emerald-600 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" />
                        {payout.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-bold mb-1">
                        {payout.method.replace('_', ' ')}
                      </span>
                      <p className="text-sm text-neutral-600 max-w-[200px] break-all">{payout.paymentDetails}</p>
                    </td>
                    <td className="py-4 px-4">
                      {payout.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>}
                      {payout.status === 'APPROVED' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-200"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                      {payout.status === 'REJECTED' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200"><XCircle className="w-3 h-3" /> Rejected</span>}

                      {payout.adminNote && (
                        <p className="text-[10px] text-neutral-500 mt-1">Note: {payout.adminNote}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {payout.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="none" size="none"
                            onClick={() => handleProcess(payout.id, 'APPROVED')}
                            disabled={processingId === payout.id}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </Button>
                          <Button variant="none" size="none"
                            onClick={() => {
                              const note = prompt('Reason for rejection (optional):');
                              if (note !== null) handleProcess(payout.id, 'REJECTED', note);
                            }}
                            disabled={processingId === payout.id}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
