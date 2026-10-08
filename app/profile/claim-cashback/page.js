'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Plus, X, Calendar, ArrowRight, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';

export default function ClaimCashback() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingClaim, setViewingClaim] = useState(null);

  // Form State
  const [availableStores, setAvailableStores] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderAmount, setOrderAmount] = useState('');

  const [invoiceScreenshot, setInvoiceScreenshot] = useState(null);
  const [reviewScreenshot, setReviewScreenshot] = useState(null);
  const [noReturnScreenshot, setNoReturnScreenshot] = useState(null);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const fetchClaims = async (showLoading = true) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);

    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/meta/stores`);
      if (res.ok) {
        const data = await res.json();
        setAvailableStores(data || []);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/products`);
      if (res.ok) {
        const data = await res.json();
        setAvailableProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchClaims(true);
    fetchStores();
    fetchProducts();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!storeName || !orderDate || !orderId || !orderAmount) {
      setFormError('All fields (except Product, which is optional) are required');
      return;
    }

    if (!invoiceScreenshot || !reviewScreenshot || !noReturnScreenshot) {
      setFormError('You must upload all 3 screenshots (Invoice, Review, No-Return Proof).');
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    setIsSubmitting(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/claims`;
      const bodyData = new FormData();
      bodyData.append('storeName', storeName);
      if (productId) bodyData.append('productId', productId);
      bodyData.append('orderDate', orderDate);
      bodyData.append('orderId', orderId);
      bodyData.append('orderAmount', orderAmount);
      bodyData.append('invoice', invoiceScreenshot);
      bodyData.append('review', reviewScreenshot);
      bodyData.append('noReturn', noReturnScreenshot);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: bodyData
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setStoreName('');
        setProductId('');
        setProductSearch('');
        setOrderDate('');
        setOrderId('');
        setOrderAmount('');
        setInvoiceScreenshot(null);
        setReviewScreenshot(null);
        setNoReturnScreenshot(null);
        fetchClaims(false);
      } else {
        setFormError(data.error || 'Failed to submit claim');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const openNewClaimModal = () => {
    setStoreName('');
    setProductId('');
    setProductSearch('');
    setOrderDate('');
    setOrderId('');
    setOrderAmount('');
    setInvoiceScreenshot(null);
    setReviewScreenshot(null);
    setNoReturnScreenshot(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${url}`;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 font-sans pb-10 relative">
      {viewingClaim ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button variant="none" size="none"
            onClick={() => setViewingClaim(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Claims
          </Button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-black text-neutral-900">{viewingClaim.storeName}</h2>
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
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                    #{viewingClaim.ticketId || viewingClaim.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h5>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Store / Product</p>
                    <p className="text-lg font-black text-neutral-900">{viewingClaim.storeName}</p>
                    {viewingClaim.product && (
                      <p className="text-sm font-semibold text-blue-600 truncate">{viewingClaim.product.title}</p>
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

              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Claim Verdict</h5>
                {viewingClaim.status === 'APPROVED' && (
                  <div className="bg-green-50 text-green-900 p-4 rounded-xl border border-green-200">
                    <p className="text-sm font-medium mb-1">Congratulations! Your claim was approved.</p>
                    <p className="text-2xl font-black text-green-700">₹{viewingClaim.awardedCashback} Added</p>
                    {viewingClaim.adminNote && <p className="text-sm mt-3 pt-3 border-t border-green-200/50">Note: {viewingClaim.adminNote}</p>}
                  </div>
                )}
                {viewingClaim.status === 'REJECTED' && (
                  <div className="bg-red-50 text-red-900 p-4 rounded-xl border border-red-200">
                    <p className="text-sm font-bold mb-2">Claim Rejected</p>

                    {viewingClaim.adminNote && (
                      <p className="text-sm mt-2 mb-4 p-3 bg-white/60 rounded-lg border border-red-100 break-words">
                        <span className="text-sm lg:text-[15px] xl:text-base font-bold text-red-800">Reason:</span> {viewingClaim.adminNote}
                      </p>
                    )}

                    {!viewingClaim.hasMissingTicket ? (
                      <Button variant="none" size="none"
                        onClick={() => {
                          const params = new URLSearchParams({
                            storeName: viewingClaim.storeName || '',
                            orderDate: viewingClaim.orderDate ? viewingClaim.orderDate.split('T')[0] : '',
                            orderId: viewingClaim.orderId || '',
                            orderAmount: viewingClaim.orderAmount || '',
                            autoOpen: 'true'
                          });
                          router.push(`/profile/missing-cashback?${params.toString()}`);
                        }}
                        className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShieldAlert className="w-4 h-4" /> Raise Missing Cashback Ticket
                      </Button>
                    ) : (
                      <div className="mt-5 bg-neutral-100 text-neutral-600 p-3 rounded-xl border border-neutral-200 text-center text-xs font-bold">
                        A missing cashback ticket has been raised for this claim.
                      </div>
                    )}
                  </div>
                )}
                {viewingClaim.status === 'PENDING' && (
                  <div className="bg-amber-50 text-amber-900 p-4 rounded-xl border border-amber-200">
                    <p className="text-sm font-bold">Under Review</p>
                    <p className="text-sm mt-1">Our team is verifying your screenshots. This usually takes 24-48 hours.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Submitted Proofs</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-700 mb-2">1. Invoice / Receipt</span>
                  <a href={getImageUrl(viewingClaim.invoiceScreenshot)} target="_blank" rel="noreferrer" className="block aspect-square w-full relative group bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={getImageUrl(viewingClaim.invoiceScreenshot)} className="object-cover w-full h-full" alt="Invoice" />
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-700 mb-2">2. Product Review</span>
                  <a href={getImageUrl(viewingClaim.reviewScreenshot)} target="_blank" rel="noreferrer" className="block aspect-square w-full relative group bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={getImageUrl(viewingClaim.reviewScreenshot)} className="object-cover w-full h-full" alt="Review" />
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-700 mb-2">3. Non-Return Proof</span>
                  <a href={getImageUrl(viewingClaim.noReturnScreenshot)} target="_blank" rel="noreferrer" className="block aspect-square w-full relative group bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={getImageUrl(viewingClaim.noReturnScreenshot)} className="object-cover w-full h-full" alt="No Return" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-[#f96b02] rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h5 className="font-extrabold text-neutral-900 tracking-tight">Claim Cashback</h5>
              </div>
              <p className="text-neutral-500 text-sm max-w-lg">
                Submit proofs of your purchase, review, and non-return window to manually claim your cashback.
              </p>
            </div>

            <Button variant="none" size="none"
              onClick={openNewClaimModal}
              className="bg-black text-white hover:bg-neutral-800 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Submit New Claim
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <PageLoader />
            ) : claims.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-100">
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Store Info</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {claims.map((claim) => (
                      <tr
                        key={claim.id}
                        onClick={() => setViewingClaim(claim)}
                        className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <span className="text-[11px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">
                            #{claim.ticketId || claim.id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-neutral-900 text-sm group-hover:text-black transition-colors mb-1">{claim.storeName}</p>
                          {claim.product && (
                            <p className="text-xs text-blue-500 font-semibold truncate max-w-[200px]">{claim.product.title}</p>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-neutral-600">{formatDate(claim.createdAt)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                              claim.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                              {getStatusIcon(claim.status)} {claim.status}
                            </span>
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors transform group-hover:translate-x-1" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4 border border-neutral-100">
                  <ShieldAlert className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">No claims found</h3>
                <p className="text-neutral-500 mb-6 max-w-sm text-sm">
                  You haven't submitted any cashback claims yet. Make sure to claim your cashback after your return window expires!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal for Submitting New Claim */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
              <div className="shrink-0 flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                <h4 className="font-bold text-neutral-900">Submit Cashback Claim</h4>
                <Button variant="none" size="none" onClick={() => setIsModalOpen(false)} className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100 text-center">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Store Name</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value);
                        setShowStoreDropdown(true);
                      }}
                      onFocus={() => setShowStoreDropdown(true)}
                      onBlur={() => setTimeout(() => setShowStoreDropdown(false), 200)}
                      placeholder="Search or enter store..."
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      required
                    />
                    {showStoreDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {availableStores.filter(s => s.name.toLowerCase().includes(storeName.toLowerCase())).map(store => (
                          <div
                            key={store.id}
                            className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-sm"
                            onClick={() => {
                              setStoreName(store.name);
                              setShowStoreDropdown(false);
                            }}
                          >
                            {store.name}
                          </div>
                        ))}
                        {availableStores.filter(s => s.name.toLowerCase().includes(storeName.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-sm text-neutral-500 text-center">Press enter to use custom store</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Product / Deal (Optional)</label>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductId('');
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                      placeholder="Search for a product..."
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                    {showProductDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        <div
                          className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-sm font-semibold text-neutral-500 border-b border-neutral-100"
                          onClick={() => {
                            setProductId('');
                            setProductSearch('');
                            setShowProductDropdown(false);
                          }}
                        >
                          Clear Selection
                        </div>
                        {availableProducts.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                          <div
                            key={product.id}
                            className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-sm truncate"
                            onClick={() => {
                              setProductId(product.id);
                              setProductSearch(product.title);
                              setShowProductDropdown(false);

                              if (product.storeRel && product.storeRel.name) {
                                setStoreName(product.storeRel.name);
                              } else if (product.storeId) {
                                const store = availableStores.find(s => s.id === product.storeId);
                                if (store) setStoreName(store.name);
                              }
                            }}
                          >
                            {product.title}
                          </div>
                        ))}
                        {availableProducts.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-sm text-neutral-500 text-center">No products found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order ID</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Order ID"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order Date</label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      max={new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Amount Paid (₹)</label>
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="e.g. 1499"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
                  <h4 className="font-bold text-blue-900 mb-3">Upload Proofs (Required)</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">1. Invoice / Order Summary</label>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 1024 * 1024) {
                          setFormError('Invoice image must be less than 1MB.');
                          e.target.value = '';
                          setInvoiceScreenshot(null);
                        } else {
                          setFormError('');
                          setInvoiceScreenshot(file);
                        }
                      }} className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">2. Product Review Screenshot</label>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 1024 * 1024) {
                          setFormError('Review screenshot must be less than 1MB.');
                          e.target.value = '';
                          setReviewScreenshot(null);
                        } else {
                          setFormError('');
                          setReviewScreenshot(file);
                        }
                      }} className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">3. Non-Return Proof (Window expired)</label>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 1024 * 1024) {
                          setFormError('Non-return proof must be less than 1MB.');
                          e.target.value = '';
                          setNoReturnScreenshot(null);
                        } else {
                          setFormError('');
                          setNoReturnScreenshot(file);
                        }
                      }} className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth={true}
                    isLoading={isSubmitting}
                    className="py-3.5 rounded-xl normal-case tracking-normal shadow-md"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
