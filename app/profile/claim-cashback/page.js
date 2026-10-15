'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, Plus, X, Calendar, ArrowRight, CheckCircle, Clock, XCircle, Maximize2,
  UploadCloud, FileText, Star, ShieldCheck, Trash2, Sparkles, Receipt, Store, ShoppingBag,
  Eye, RefreshCw, Check, AlertCircle, Hash, Zap
} from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { calculateCashback } from '@/lib/cashbackCalculator';

function ProofUploadCard({
  stepNumber,
  title,
  subtitle,
  file,
  preview,
  onFileSelect,
  onRemove,
  onPreview,
  required = true,
  badgeText,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="bg-neutral-50/70 rounded-xl p-2.5 sm:p-3 border border-neutral-200/80 transition-all hover:border-neutral-300 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-md bg-neutral-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
            {stepNumber}
          </span>
          <h5 className="text-[11px] font-bold text-neutral-900 truncate">
            {title}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </h5>
        </div>
        {badgeText && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-orange-100 text-[#f96b02] shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview ? (
        <div className="bg-white border border-emerald-300 rounded-lg p-2 shadow-2xs flex items-center gap-2">
          <div
            onClick={onPreview}
            className="relative group w-11 h-11 rounded-md overflow-hidden border border-neutral-200 shrink-0 cursor-zoom-in bg-neutral-100"
            title="Click to zoom preview"
          >
            <img
              src={preview}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-neutral-800 truncate">{file?.name || 'Screenshot'}</p>
            <p className="text-[10px] text-neutral-400">
              {file?.size ? formatFileSize(file.size) : 'Ready'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={onPreview}
                className="text-[10px] font-bold text-neutral-600 hover:text-black cursor-pointer transition-colors"
              >
                View
              </button>
              <span className="text-[9px] text-neutral-300">•</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
            title="Remove screenshot"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-lg p-2.5 sm:p-3 text-center transition-all flex flex-col items-center justify-center gap-1 group ${
            isDragging
              ? 'border-[#f96b02] bg-orange-50/70 scale-[1.01]'
              : 'border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/80'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-orange-50 border border-neutral-200 group-hover:border-orange-200 flex items-center justify-center text-neutral-500 group-hover:text-[#f96b02] transition-colors">
            <UploadCloud className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-800 group-hover:text-black leading-tight">
              Upload Image
            </p>
            <p className="text-[9px] text-neutral-400 mt-0.5">PNG, JPG (Max 1MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimCashback() {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingClaim, setViewingClaim] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

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
  const [claimType, setClaimType] = useState('WITHOUT_REVIEW');

  const [invoiceScreenshot, setInvoiceScreenshot] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [reviewScreenshot, setReviewScreenshot] = useState(null);
  const [reviewPreview, setReviewPreview] = useState(null);
  const [noReturnScreenshot, setNoReturnScreenshot] = useState(null);
  const [noReturnPreview, setNoReturnPreview] = useState(null);

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

  const processFile = (file, type) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      const label = type === 'invoice' ? 'Invoice image' : type === 'review' ? 'Review screenshot' : 'Non-return proof';
      setFormError(`${label} must be less than 1MB.`);
      return;
    }
    if (file.type && !file.type.startsWith('image/')) {
      setFormError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    setFormError('');
    if (type === 'invoice') {
      setInvoiceScreenshot(file);
      if (invoicePreview) URL.revokeObjectURL(invoicePreview);
      setInvoicePreview(URL.createObjectURL(file));
    } else if (type === 'review') {
      setReviewScreenshot(file);
      if (reviewPreview) URL.revokeObjectURL(reviewPreview);
      setReviewPreview(URL.createObjectURL(file));
    } else if (type === 'noReturn') {
      setNoReturnScreenshot(file);
      if (noReturnPreview) URL.revokeObjectURL(noReturnPreview);
      setNoReturnPreview(URL.createObjectURL(file));
    }
  };

  const removeProof = (type) => {
    if (type === 'invoice') {
      if (invoicePreview) URL.revokeObjectURL(invoicePreview);
      setInvoiceScreenshot(null);
      setInvoicePreview(null);
    } else if (type === 'review') {
      if (reviewPreview) URL.revokeObjectURL(reviewPreview);
      setReviewScreenshot(null);
      setReviewPreview(null);
    } else if (type === 'noReturn') {
      if (noReturnPreview) URL.revokeObjectURL(noReturnPreview);
      setNoReturnScreenshot(null);
      setNoReturnPreview(null);
    }
  };

  const handleInvoiceChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file, 'invoice');
  };

  const handleReviewChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file, 'review');
  };

  const handleNoReturnChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file, 'noReturn');
  };

  const resetForm = () => {
    setStoreName('');
    setProductId('');
    setProductSearch('');
    setOrderDate('');
    setOrderId('');
    setOrderAmount('');
    setClaimType('WITHOUT_REVIEW');
    if (invoicePreview) URL.revokeObjectURL(invoicePreview);
    if (reviewPreview) URL.revokeObjectURL(reviewPreview);
    if (noReturnPreview) URL.revokeObjectURL(noReturnPreview);
    setInvoiceScreenshot(null);
    setInvoicePreview(null);
    setReviewScreenshot(null);
    setReviewPreview(null);
    setNoReturnScreenshot(null);
    setNoReturnPreview(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!storeName || !orderDate || !orderId || !orderAmount) {
      setFormError('All fields (except Product, which is optional) are required');
      return;
    }

    if (!invoiceScreenshot || !noReturnScreenshot) {
      setFormError('You must upload Invoice and Non-Return proof screenshots.');
      return;
    }

    if (claimType === 'WITH_REVIEW' && !reviewScreenshot) {
      setFormError('Review screenshot is required when choosing "With Review" claim.');
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
      bodyData.append('claimType', claimType);
      bodyData.append('invoice', invoiceScreenshot);
      if (claimType === 'WITH_REVIEW' && reviewScreenshot) {
        bodyData.append('review', reviewScreenshot);
      }
      bodyData.append('noReturn', noReturnScreenshot);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: bodyData
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
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
    resetForm();
    setIsModalOpen(true);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getProductCashbackInfo = (prod) => {
    if (!prod) return { withReview: 200, withoutReview: 100 };
    if (prod.cashbackWithReview !== undefined && prod.cashbackWithReview !== null &&
        prod.cashbackWithoutReview !== undefined && prod.cashbackWithoutReview !== null) {
      return {
        withReview: Number(prod.cashbackWithReview),
        withoutReview: Number(prod.cashbackWithoutReview)
      };
    }
    return calculateCashback(prod.salePrice || prod.price || 0);
  };

  const selectedProduct = availableProducts.find(p => p.id === productId);
  const selectedProductCashback = selectedProduct 
    ? getProductCashbackInfo(selectedProduct)
    : { withReview: 0, withoutReview: 0 };

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
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="font-black text-neutral-900">{viewingClaim.storeName}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingClaim.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    viewingClaim.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {viewingClaim.status}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingClaim.claimType === 'WITHOUT_REVIEW' ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-orange-50 text-[#f96b02] border border-orange-200'}`}>
                    {viewingClaim.claimType === 'WITHOUT_REVIEW' ? '⚡ Without Review Claim' : '🌟 With Review Claim'}
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
                    <p className="text-xs text-neutral-500 mb-1">Claim Type</p>
                    <p className="text-sm font-bold text-neutral-800">
                      {viewingClaim.claimType === 'WITHOUT_REVIEW' ? 'Without Review (Standard Cashback)' : 'With Review (Higher Cashback)'}
                    </p>
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
                            productId: viewingClaim.productId || '',
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
                  <button
                    type="button"
                    onClick={() => setLightboxImage(getImageUrl(viewingClaim.invoiceScreenshot))}
                    className="block aspect-square w-full relative group bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 cursor-zoom-in hover:border-[#f96b02] transition-colors focus:outline-none"
                  >
                    <img src={getImageUrl(viewingClaim.invoiceScreenshot)} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" alt="Invoice" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="p-2 bg-white/90 rounded-full text-neutral-700 shadow-sm">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                </div>

                {viewingClaim.reviewScreenshot && (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-700 mb-2">2. Product Review</span>
                    <button
                      type="button"
                      onClick={() => setLightboxImage(getImageUrl(viewingClaim.reviewScreenshot))}
                      className="block aspect-square w-full relative group bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 cursor-zoom-in hover:border-[#f96b02] transition-colors focus:outline-none"
                    >
                      <img src={getImageUrl(viewingClaim.reviewScreenshot)} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" alt="Review" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="p-2 bg-white/90 rounded-full text-neutral-700 shadow-sm">
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-700 mb-2">
                    {viewingClaim.reviewScreenshot ? '3. Non-Return Proof' : '2. Non-Return Proof'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxImage(getImageUrl(viewingClaim.noReturnScreenshot))}
                    className="block aspect-square w-full relative group bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 cursor-zoom-in hover:border-[#f96b02] transition-colors focus:outline-none"
                  >
                    <img src={getImageUrl(viewingClaim.noReturnScreenshot)} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" alt="No Return" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="p-2 bg-white/90 rounded-full text-neutral-700 shadow-sm">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              {viewingClaim.claimType === 'WITHOUT_REVIEW' && !viewingClaim.reviewScreenshot && (
                <p className="text-xs text-neutral-500 mt-3 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  ⚡ This claim was submitted without a product review. Review screenshot was not required.
                </p>
              )}
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
                Submit proofs of your purchase and non-return window to manually claim your cashback.
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
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Store & Claim Info</th>
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
                          <p className="font-bold text-neutral-900 text-sm group-hover:text-black transition-colors mb-0.5">{claim.storeName}</p>
                          {claim.product && (
                            <p className="text-xs text-blue-500 font-semibold truncate max-w-[200px] mb-1">{claim.product.title}</p>
                          )}
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${claim.claimType === 'WITHOUT_REVIEW' ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-orange-50 text-[#f96b02] border border-orange-200'}`}>
                            {claim.claimType === 'WITHOUT_REVIEW' ? '⚡ Without Review' : '🌟 With Review'}
                          </span>
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
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl lg:max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative border border-neutral-100">
              
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#f96b02]/10 border border-[#f96b02]/20 flex items-center justify-center text-[#f96b02]">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-base sm:text-lg leading-tight">Submit Cashback Claim</h4>
                    <p className="text-[11px] text-neutral-500 font-medium">Verify your order details and upload proof screenshots</p>
                  </div>
                </div>
                <Button 
                  variant="none" 
                  size="none" 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
                {formError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-semibold border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Product (First) & Store (Second) Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Product / Deal (FIRST) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                        Product / Deal <span className="text-neutral-400 font-normal">(Select First)</span>
                      </span>
                      {productId && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Linked
                        </span>
                      )}
                    </label>
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
                      placeholder="Search or pick product..."
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    />
                    {showProductDropdown && (
                      <div className="absolute z-30 w-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                        <div
                          className="px-4 py-2 hover:bg-neutral-50 cursor-pointer text-xs font-bold text-neutral-400 border-b border-neutral-100 flex items-center justify-between"
                          onClick={() => {
                            setProductId('');
                            setProductSearch('');
                            setShowProductDropdown(false);
                          }}
                        >
                          <span>✕ Clear Selection (Custom Product)</span>
                        </div>
                        {availableProducts.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                          <div
                            key={product.id}
                            className="px-4 py-2.5 hover:bg-neutral-50 cursor-pointer text-sm font-medium text-neutral-800 flex items-center justify-between gap-2"
                            onClick={() => {
                              setProductId(product.id);
                              setProductSearch(product.title);
                              setShowProductDropdown(false);

                              // Auto-select store from product
                              if (product.storeRel && product.storeRel.name) {
                                setStoreName(product.storeRel.name);
                              } else if (product.storeId) {
                                const matchedStore = availableStores.find(s => s.id === product.storeId);
                                if (matchedStore) setStoreName(matchedStore.name);
                              } else if (product.store) {
                                setStoreName(typeof product.store === 'string' ? product.store : (product.store.name || ''));
                              }
                            }}
                          >
                            <span className="truncate">{product.title}</span>
                          </div>
                        ))}
                        {availableProducts.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2.5 text-xs text-neutral-500 text-center italic">No products found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Store Name (SECOND - Auto Selected) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-neutral-500" />
                        Store Name <span className="text-red-500">*</span>
                      </span>
                      {productId && storeName && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Auto-Selected
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value);
                        setShowStoreDropdown(true);
                      }}
                      onFocus={() => setShowStoreDropdown(true)}
                      onBlur={() => setTimeout(() => setShowStoreDropdown(false), 200)}
                      placeholder="Store name (e.g. Amazon, Flipkart)..."
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      required
                    />
                    {showStoreDropdown && (
                      <div className="absolute z-30 w-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                        {availableStores.filter(s => s.name.toLowerCase().includes(storeName.toLowerCase())).map(store => (
                          <div
                            key={store.id}
                            className="px-4 py-2 hover:bg-neutral-50 cursor-pointer text-sm font-medium text-neutral-800 flex items-center justify-between"
                            onClick={() => {
                              setStoreName(store.name);
                              setShowStoreDropdown(false);
                            }}
                          >
                            <span>{store.name}</span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase">Store</span>
                          </div>
                        ))}
                        {availableStores.filter(s => s.name.toLowerCase().includes(storeName.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2.5 text-xs text-neutral-500 text-center italic">
                            Press Enter to use custom store: "{storeName}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Simplified Claim Option Selector (Minimal Content with Logo Orange) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <span>Claim Option</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {claimType === 'WITH_REVIEW' ? '3 Proofs Required' : '2 Proofs Required'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Without Review (First) */}
                    <div
                      onClick={() => setClaimType('WITHOUT_REVIEW')}
                      className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center justify-between gap-3 ${
                        claimType === 'WITHOUT_REVIEW'
                          ? 'bg-orange-50/70 border-[#f96b02] shadow-xs ring-2 ring-orange-100'
                          : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          claimType === 'WITHOUT_REVIEW' ? 'bg-[#f96b02] text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-neutral-900 truncate">Without Review</h5>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                              claimType === 'WITHOUT_REVIEW' ? 'bg-orange-100 text-[#f96b02]' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                              Fast
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-medium">2 proofs required</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-base font-black ${
                          claimType === 'WITHOUT_REVIEW' ? 'text-[#f96b02]' : 'text-neutral-700'
                        }`}>
                          ₹{selectedProductCashback.withoutReview}
                        </span>
                      </div>
                    </div>

                    {/* Option 2: With Review (Second) */}
                    <div
                      onClick={() => setClaimType('WITH_REVIEW')}
                      className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center justify-between gap-3 ${
                        claimType === 'WITH_REVIEW'
                          ? 'bg-orange-50/70 border-[#f96b02] shadow-xs ring-2 ring-orange-100'
                          : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          claimType === 'WITH_REVIEW' ? 'bg-[#f96b02] text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-neutral-900 truncate">With Review</h5>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                              claimType === 'WITH_REVIEW' ? 'bg-orange-100 text-[#f96b02]' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                              Max
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-medium">3 proofs required</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-base font-black ${
                          claimType === 'WITH_REVIEW' ? 'text-[#f96b02]' : 'text-neutral-700'
                        }`}>
                          ₹{selectedProductCashback.withReview}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Order Details: 3-column Grid (Order ID, Date, Amount) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-neutral-500" />
                      Order ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. 402-1234567"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      Order Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      max={new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-500">₹</span>
                      Amount Paid (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                      value={orderAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setOrderAmount(val);
                      }}
                      placeholder="e.g. 1499"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 4. Compact Proof Screenshots in Requested Order: 1. Invoice, 2. Non-Return, 3. Review */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                        Upload Proofs
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                        {claimType === 'WITH_REVIEW' ? '3 Required' : '2 Required'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Click image thumbnail to zoom
                    </span>
                  </div>

                  {/* Responsive Grid: Compact boxes side by side */}
                  <div className={`grid grid-cols-1 ${claimType === 'WITH_REVIEW' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5`}>
                    {/* 1st: Invoice / Order Summary */}
                    <ProofUploadCard
                      stepNumber={1}
                      title="Invoice / Receipt"
                      subtitle="Order ID & price visible"
                      file={invoiceScreenshot}
                      preview={invoicePreview}
                      onFileSelect={(file) => processFile(file, 'invoice')}
                      onRemove={() => removeProof('invoice')}
                      onPreview={() => invoicePreview && setLightboxImage(invoicePreview)}
                      required={true}
                    />

                    {/* 2nd: Non-Return Proof */}
                    <ProofUploadCard
                      stepNumber={2}
                      title="Non-Return Proof"
                      subtitle="Delivered & window closed"
                      file={noReturnScreenshot}
                      preview={noReturnPreview}
                      onFileSelect={(file) => processFile(file, 'noReturn')}
                      onRemove={() => removeProof('noReturn')}
                      onPreview={() => noReturnPreview && setLightboxImage(noReturnPreview)}
                      required={true}
                    />

                    {/* 3rd: Product Review Screenshot (Only if WITH_REVIEW) */}
                    {claimType === 'WITH_REVIEW' && (
                      <div className="animate-in fade-in duration-200">
                        <ProofUploadCard
                          stepNumber={3}
                          title="Review Screenshot"
                          subtitle="Rating & review screenshot"
                          file={reviewScreenshot}
                          preview={reviewPreview}
                          onFileSelect={(file) => processFile(file, 'review')}
                          onRemove={() => removeProof('review')}
                          onPreview={() => reviewPreview && setLightboxImage(reviewPreview)}
                          required={true}
                          badgeText="+₹ Cashback"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Submit CTA */}
                <div className="pt-2 space-y-2.5">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth={true}
                    isLoading={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      'Submitting Claim...'
                    ) : (
                      <>
                        <span>
                          Submit Claim
                          {(claimType === 'WITH_REVIEW' ? selectedProductCashback.withReview : selectedProductCashback.withoutReview) > 0
                            ? ` • Earn ₹${claimType === 'WITH_REVIEW' ? selectedProductCashback.withReview : selectedProductCashback.withoutReview} Cashback`
                            : ''}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safe & Encrypted Submission • Reviewed within 24-48 Hours</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
