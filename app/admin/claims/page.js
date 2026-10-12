'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, CheckCircle, XCircle, Search, Calendar, FileText, ArrowRight, Download } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import CustomSelect from '@/components/common/CustomSelect';
import * as XLSX from 'xlsx';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('ADMIN');
  const [viewingClaim, setViewingClaim] = useState(null);

  // Status Update State
  const [awardedCashback, setAwardedCashback] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => { }, isDestructive: false });
  const [lightboxImage, setLightboxImage] = useState(null);

  const uniqueStores = ['ALL', ...new Set(claims.map(c => c.storeName).filter(Boolean))];

  const filteredClaims = claims.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesStore = storeFilter === 'ALL' || c.storeName === storeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          c.product?.title?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesStore && matchesSearch;
  });

  const exportToExcel = () => {
    if (filteredClaims.length === 0) {
      alert("No data to export!");
      return;
    }

    const data = filteredClaims.map(c => ({
      'Claim ID': c.id,
      'Date': new Date(c.createdAt).toLocaleDateString(),
      'User Name': c.user?.name || 'Unknown',
      'User Email': c.user?.email || '',
      'Store': c.storeName,
      'Product': c.product?.title || '',
      'Order ID': c.orderId,
      'Order Date': new Date(c.orderDate).toLocaleDateString(),
      'Order Amount (₹)': c.orderAmount,
      'Status': c.status,
      'Cashback Awarded (₹)': c.awardedCashback || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");
    XLSX.writeFile(workbook, `Cashback_Claims_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const router = useRouter();

  const fetchClaims = async () => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserRole(user.role || 'ADMIN');

    if (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN') {
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

  const initiateStatusUpdate = (status) => {
    setActionError('');

    if (status === 'APPROVED') {
      if (!awardedCashback || parseFloat(awardedCashback) <= 0) {
        setActionError("Please enter a valid positive cashback amount to approve.");
        return;
      }
    }

    if (status === 'REJECTED' && (!adminNote || !adminNote.trim())) {
      setActionError("Admin Note / Rejection reason is compulsory when rejecting a claim.");
      return;
    }

    if (status === 'APPROVED') {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Claim Approval',
        message: `Are you sure you want to approve this claim and credit ₹${awardedCashback} to ${viewingClaim.user?.name || 'the user'}?${adminNote.trim() ? ` Note: "${adminNote.trim()}".` : ''} Once approved, this claim CANNOT be modified or reopened.`,
        confirmText: 'Yes, Approve & Credit',
        isDestructive: false,
        onConfirm: () => executeStatusUpdate('APPROVED')
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Claim Rejection',
        message: `Are you sure you want to reject this claim for ${viewingClaim.user?.name || 'the user'}? Rejection reason: "${adminNote.trim()}". Once rejected, this claim CANNOT be modified or reopened.`,
        confirmText: 'Yes, Reject Claim',
        isDestructive: true,
        onConfirm: () => executeStatusUpdate('REJECTED')
      });
    }
  };

  const executeStatusUpdate = async (status) => {
    const userStr = localStorage.getItem('adminUser');
    const user = JSON.parse(userStr);
    setIsUpdating(true);
    setActionError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims/admin/${viewingClaim.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminNote: adminNote.trim() || undefined,
          awardedCashback: status === 'APPROVED' ? parseFloat(awardedCashback) : null
        })
      });

      if (res.ok) {
        setViewingClaim(null);
        setAwardedCashback('');
        setAdminNote('');
        setActionError('');
        fetchClaims();
      } else {
        const data = await res.json();
        setActionError(data.error || 'Failed to update claim');
      }
    } catch (error) {
      setActionError('An error occurred. Please try again.');
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

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {viewingClaim ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button variant="none" size="none"
            onClick={() => setViewingClaim(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#f96b02] transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Claims List
          </Button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-black text-neutral-900">Review Claim: {viewingClaim.user?.name}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingClaim.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    viewingClaim.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {viewingClaim.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Calendar className="w-4 h-4" /> Claimed on {formatDate(viewingClaim.createdAt)}
                  <span className="mx-2">•</span>
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-bold">
                    #{viewingClaim.ticketId || viewingClaim.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h3>
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
                  <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Product Info</h3>
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
                <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Take Action</h3>
                {viewingClaim.status === 'PENDING' ? (
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1.5">Award Cashback (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={awardedCashback}
                        onChange={(e) => {
                          setAwardedCashback(e.target.value);
                          if (actionError) setActionError('');
                        }}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-white"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5 font-medium">* Required if approving</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                        Admin Note <span className="text-neutral-500 font-normal">(Optional for Approve, Compulsory for Reject)</span>
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => {
                          setAdminNote(e.target.value);
                          if (actionError) setActionError('');
                        }}
                        placeholder="Add an optional approval note or required rejection reason..."
                        rows="2"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1.5 font-medium">* Note is required only when rejecting</p>
                    </div>

                    {actionError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                        {actionError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="none" size="none"
                        onClick={() => initiateStatusUpdate('APPROVED')}
                        disabled={isUpdating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5" /> Approve & Credit
                      </Button>
                      <Button variant="none" size="none"
                        onClick={() => initiateStatusUpdate('REJECTED')}
                        disabled={isUpdating}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <XCircle className="w-5 h-5" /> Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border ${viewingClaim.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <h3 className="font-black mb-2">Claim {viewingClaim.status}</h3>
                    {viewingClaim.status === 'APPROVED' && (
                      <div className="mb-2">
                        <p className="text-sm lg:text-[15px] xl:text-base font-medium mb-1">Cashback Awarded: <span className="font-black text-xl">₹{viewingClaim.awardedCashback}</span></p>
                      </div>
                    )}
                    {viewingClaim.adminNote && (
                      <div className="mt-3 p-3 bg-white/60 rounded-xl border border-black/5">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Admin Note</p>
                        <p className="text-sm font-medium">{viewingClaim.adminNote}</p>
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 font-medium mt-4 italic border-t border-black/5 pt-3">
                      * This claim has been finalized ({viewingClaim.status}) and cannot be modified or reopened.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Submitted Proofs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">1. Invoice / Receipt</span>
                  <button onClick={() => setLightboxImage(getImageUrl(viewingClaim.invoiceScreenshot))} className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none">
                    <img src={getImageUrl(viewingClaim.invoiceScreenshot)} className="object-cover w-full h-full" alt="Invoice" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">2. Product Review</span>
                  <button onClick={() => setLightboxImage(getImageUrl(viewingClaim.reviewScreenshot))} className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none">
                    <img src={getImageUrl(viewingClaim.reviewScreenshot)} className="object-cover w-full h-full" alt="Review" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-700 mb-3">3. Non-Return Proof</span>
                  <button onClick={() => setLightboxImage(getImageUrl(viewingClaim.noReturnScreenshot))} className="block aspect-square w-full relative group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-[#f96b02] transition-colors focus:outline-none">
                    <img src={getImageUrl(viewingClaim.noReturnScreenshot)} className="object-cover w-full h-full" alt="No Return" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-neutral-900 text-lg">Manage Cashback Claims</h3>
              {userRole === 'SUB_ADMIN' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Your Cards Only
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="w-full sm:w-40">
                <CustomSelect
                  value={storeFilter}
                  onChange={(val) => setStoreFilter(val)}
                  options={uniqueStores.map(store => ({ id: store, name: store === 'ALL' ? 'All Stores' : store }))}
                  placeholder="Select Store"
                />
              </div>
              <div className="w-full sm:w-40">
                <CustomSelect
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { id: 'ALL', name: 'All Claims' },
                    { id: 'PENDING', name: 'Pending' },
                    { id: 'APPROVED', name: 'Approved' },
                    { id: 'REJECTED', name: 'Rejected' }
                  ]}
                  placeholder="Select Status"
                />
              </div>
              <Button onClick={exportToExcel} variant="primary" size="none" className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md">
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm w-full overflow-hidden">
            {isLoading ? (
              <PageLoader />
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
                    {filteredClaims.map(claim => (
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
                            <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                              #{claim.ticketId || claim.id.slice(-6).toUpperCase()}
                            </span>
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
                          <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-[#f96b02] transition-colors inline-block" />
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
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
      <Lightbox
        open={!!lightboxImage}
        close={() => setLightboxImage(null)}
        slides={[{ src: lightboxImage }]}
        plugins={[Zoom]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5 }}
      />
    </div>
  );
}
