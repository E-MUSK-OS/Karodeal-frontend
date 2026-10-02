'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, CheckCircle, XCircle, Search, Calendar, FileText, ArrowRight } from 'lucide-react';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingClaim, setViewingClaim] = useState(null);

  // Status Update State
  const [awardedCashback, setAwardedCashback] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const router = useRouter();

  const fetchClaims = async () => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);

    if (user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [router]);

  const handleUpdateStatus = async (status) => {
    if (status === 'APPROVED' && (!awardedCashback || parseFloat(awardedCashback) <= 0)) {
      alert("Please enter a valid cashback amount to approve.");
      return;
    }

    const userStr = localStorage.getItem('adminUser');
    const user = JSON.parse(userStr);
    setIsUpdating(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin/${viewingClaim.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminNote,
          awardedCashback: status === 'APPROVED' ? parseFloat(awardedCashback) : null
        })
      });

      if (res.ok) {
        setViewingClaim(null);
        setAwardedCashback('');
        setAdminNote('');
        fetchClaims();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update claim');
      }
    } catch (error) {
      alert('An error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAwardedCashback = async () => {
    if (!awardedCashback || parseFloat(awardedCashback) <= 0) {
      alert("Please enter a valid positive cashback amount.");
      return;
    }

    if (parseFloat(awardedCashback) === viewingClaim.awardedCashback) {
      return;
    }

    if (!confirm(`Are you sure you want to change the cashback to ₹${awardedCashback}? This will adjust the user's wallet balance by the difference.`)) return;

    const userStr = localStorage.getItem('adminUser');
    const user = JSON.parse(userStr);
    setIsUpdating(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin/${viewingClaim.id}/cashback`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newAwardedCashback: parseFloat(awardedCashback),
          adminNote
        })
      });

      if (res.ok) {
        alert('Cashback amount successfully updated!');
        setViewingClaim(null);
        setAwardedCashback('');
        setAdminNote('');
        fetchClaims();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update cashback');
      }
    } catch (error) {
      alert('An error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {viewingClaim ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <button
            onClick={() => setViewingClaim(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Claims List
          </button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-neutral-900">Review Claim: {viewingClaim.user?.name}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingClaim.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    viewingClaim.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {viewingClaim.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Calendar className="w-4 h-4" /> Claimed on {formatDate(viewingClaim.createdAt)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Store / Product</p>
                    <p className="text-lg font-black text-neutral-900">{viewingClaim.storeName}</p>
                    {!viewingClaim.product && (
                      <p className="text-sm font-semibold text-neutral-400 mt-1">No Product Selected</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                    <p className="text-lg font-black text-neutral-900">₹{viewingClaim.orderAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order ID</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900">{viewingClaim.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900">{formatDate(viewingClaim.orderDate)}</p>
                  </div>
                </div>
              </div>

              {viewingClaim.product && (
                <div>
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Product Info</h3>
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                    <img src={viewingClaim.product.image} alt={viewingClaim.product.title} className="w-full h-32 object-contain bg-white rounded-xl mb-4 border border-neutral-100" />
                    <p className="font-bold text-sm text-neutral-900 line-clamp-2 mb-3">{viewingClaim.product.title}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-neutral-500">Sale Price</p>
                        <p className="text-sm lg:text-[15px] xl:text-base font-bold text-green-600">₹{viewingClaim.product.salePrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Original</p>
                        <p className="text-sm lg:text-[15px] xl:text-base font-semibold text-neutral-400 line-through">₹{viewingClaim.product.originalPrice}</p>
                      </div>
                      <div className="col-span-2 pt-2 mt-2 border-t border-neutral-200">
                        <div>
                          <p className="text-xs text-neutral-500">Expected Cashback</p>
                          <p className="text-sm lg:text-[15px] xl:text-base font-black text-blue-600">₹{
                            (() => {
                              const p = viewingClaim.product;
                              if (p.cashback !== undefined && p.cashback !== null && p.cashback !== '') return Number(p.cashback);
                              const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
                              return (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
                            })()
                          }</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={!viewingClaim.product ? "md:col-span-1 lg:col-span-2" : ""}>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Take Action</h3>
                {viewingClaim.status === 'PENDING' ? (
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1.5">Award Cashback (₹)</label>
                      <input
                        type="number"
                        value={awardedCashback}
                        onChange={(e) => setAwardedCashback(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-[10px] text-blue-600 mt-1.5">* Required if approving</p>
                    </div>



                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1.5">Admin Note (Optional)</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="e.g. Invoice not readable, etc."
                        rows="2"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleUpdateStatus('APPROVED')}
                        disabled={isUpdating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5" /> Approve & Credit
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('REJECTED')}
                        disabled={isUpdating}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <XCircle className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border ${viewingClaim.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <h3 className="text-lg font-black mb-2">Claim {viewingClaim.status}</h3>
                    {viewingClaim.status === 'APPROVED' && (
                      <div className="mb-4">
                        <p className="text-sm lg:text-[15px] xl:text-base font-medium mb-3">Cashback Awarded: <span className="font-black text-xl">₹{viewingClaim.awardedCashback}</span></p>

                        <div className="bg-white/60 p-4 rounded-xl border border-green-200">
                          <label className="block text-xs font-bold text-green-800 mb-1.5">Edit Cashback Amount (₹)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={awardedCashback}
                              onChange={(e) => setAwardedCashback(e.target.value)}
                              placeholder="New Amount"
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                            />
                            <button
                              onClick={handleUpdateAwardedCashback}
                              disabled={isUpdating || parseFloat(awardedCashback) === viewingClaim.awardedCashback}
                              className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 text-sm rounded-lg disabled:opacity-50 transition-colors"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {viewingClaim.adminNote && (
                      <div className="mt-4 p-3 bg-white/60 rounded-xl border border-black/5">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Admin Note</p>
                        <p className="text-sm font-medium">{viewingClaim.adminNote}</p>
                      </div>
                    )}
                    {viewingClaim.status === 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus('PENDING')}
                        disabled={isUpdating}
                        className="mt-4 bg-white border border-red-200 hover:bg-red-100 text-red-800 font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm text-sm"
                      >
                        Reopen Claim
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Submitted Proofs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">1. Invoice / Receipt</span>
                  <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${viewingClaim.invoiceScreenshot}`} target="_blank" rel="noreferrer" className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-black transition-colors">
                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${viewingClaim.invoiceScreenshot}`} className="object-cover w-full h-full" alt="Invoice" />
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">2. Product Review</span>
                  <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${viewingClaim.reviewScreenshot}`} target="_blank" rel="noreferrer" className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-black transition-colors">
                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${viewingClaim.reviewScreenshot}`} className="object-cover w-full h-full" alt="Review" />
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">3. Non-Return Proof</span>
                  <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${viewingClaim.noReturnScreenshot}`} target="_blank" rel="noreferrer" className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-black transition-colors">
                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${viewingClaim.noReturnScreenshot}`} className="object-cover w-full h-full" alt="No Return" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-neutral-900">Manage Cashback Claims</h3>
            <div className="flex bg-neutral-100 p-1 rounded-lg overflow-x-auto whitespace-nowrap hide-scrollbar max-w-full">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-sm font-bold transition-all flex-1 text-center ${statusFilter === status
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm w-full overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-500">Loading claims...</div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">User</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Store</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Date</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {claims.filter(c => statusFilter === 'ALL' || c.status === statusFilter).map(claim => (
                      <tr
                        key={claim.id}
                        onClick={() => {
                          setViewingClaim(claim);

                          let defaultCashback = claim.awardedCashback || '';
                          if (!defaultCashback && claim.product) {
                            const p = claim.product;
                            if (p.cashback !== undefined && p.cashback !== null && p.cashback !== '') {
                              defaultCashback = Number(p.cashback);
                            } else {
                              const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
                              defaultCashback = (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
                            }
                          }

                          setAwardedCashback(defaultCashback);
                          setAdminNote(claim.adminNote || '');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-neutral-900">{claim.user?.name || 'Unknown'}</p>
                            {claim.status === 'PENDING' && (new Date() - new Date(claim.createdAt)) < 24 * 60 * 60 * 1000 && (
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">{claim.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-neutral-900">{claim.storeName}</p>
                          {claim.product && (
                            <p className="text-xs text-blue-500 font-semibold truncate max-w-[200px]">{claim.product.title}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">₹{claim.orderAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-500">{formatDate(claim.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-black transition-colors inline-block" />
                        </td>
                      </tr>
                    ))}
                    {claims.filter(c => statusFilter === 'ALL' || c.status === statusFilter).length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-neutral-500">
                          No claims found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
