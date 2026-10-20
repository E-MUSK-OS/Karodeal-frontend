'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, Plus, X, Calendar, Search, ArrowRight, Edit2, Paperclip, 
  ChevronDown, Loader2, Maximize2, ShoppingBag, Store, Hash, Eye, Trash2, 
  UploadCloud, AlertCircle, Receipt, Check 
} from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';
import { processImageUpload } from '@/lib/imageProcessor';

function ProofUploadCard({
  stepNumber,
  title,
  subtitle,
  file,
  preview,
  onFileSelect,
  onRemove,
  onPreview,
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
    <div className="bg-neutral-50/70 dark:bg-neutral-800/50 rounded-xl p-2.5 sm:p-3 border border-neutral-200/80 dark:border-neutral-700 transition-all hover:border-neutral-300 dark:hover:border-neutral-600 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black flex items-center justify-center shrink-0">
            {stepNumber}
          </span>
          <h5 className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
            {title}
          </h5>
        </div>
        {badgeText && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#f96b02] shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview ? (
        <div className="bg-white dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-700/60 rounded-lg p-2 shadow-2xs flex items-center gap-2">
          <div
            onClick={onPreview}
            className="relative group w-11 h-11 rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0 cursor-zoom-in bg-neutral-100 dark:bg-neutral-900"
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
            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">{file?.name || 'Screenshot'}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {file?.size ? formatFileSize(file.size) : 'Ready'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={onPreview}
                className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
              >
                View
              </button>
              <span className="text-[9px] text-neutral-300 dark:text-neutral-600">•</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer shrink-0"
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
              ? 'border-[#f96b02] bg-orange-50/70 dark:bg-orange-950/40 scale-[1.01]'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50/80 dark:hover:bg-neutral-800'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-700 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/50 border border-neutral-200 dark:border-neutral-600 group-hover:border-orange-200 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:text-[#f96b02] transition-colors">
            <UploadCloud className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white leading-tight">
              Upload Image
            </p>
            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">{subtitle || 'PNG, JPG, WebP'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MissingCashback() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStores, setAvailableStores] = useState([]);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [userNote, setUserNote] = useState('');
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);

  // 3 Dedicated Proof Upload Slots
  const [proof1, setProof1] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [proof2, setProof2] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [proof3, setProof3] = useState(null);
  const [preview3, setPreview3] = useState(null);

  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [chatAttachment, setChatAttachment] = useState(null);

  const processProof = async (file, slotIndex) => {
    if (!file) return;
    try {
      const processed = await processImageUpload(file, { maxSizeMB: 5.0 });
      if (!processed) return;

      if (slotIndex === 1) {
        if (preview1) URL.revokeObjectURL(preview1);
        setProof1(processed.file);
        setPreview1(processed.previewUrl);
      } else if (slotIndex === 2) {
        if (preview2) URL.revokeObjectURL(preview2);
        setProof2(processed.file);
        setPreview2(processed.previewUrl);
      } else if (slotIndex === 3) {
        if (preview3) URL.revokeObjectURL(preview3);
        setProof3(processed.file);
        setPreview3(processed.previewUrl);
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to process image');
    }
  };

  const removeProof = (slotIndex) => {
    if (slotIndex === 1) {
      if (preview1) URL.revokeObjectURL(preview1);
      setProof1(null);
      setPreview1(null);
    } else if (slotIndex === 2) {
      if (preview2) URL.revokeObjectURL(preview2);
      setProof2(null);
      setPreview2(null);
    } else if (slotIndex === 3) {
      if (preview3) URL.revokeObjectURL(preview3);
      setProof3(null);
      setPreview3(null);
    }
  };

  const resetModalState = () => {
    setIsModalOpen(false);
    setEditingTicketId(null);
    setStoreName('');
    setOrderDate('');
    setOrderId('');
    setOrderAmount('');
    setUserNote('');
    setProductId('');
    setProductSearch('');
    setFormError('');
    setShowProductDropdown(false);
    setShowStoreDropdown(false);
    if (preview1) URL.revokeObjectURL(preview1);
    if (preview2) URL.revokeObjectURL(preview2);
    if (preview3) URL.revokeObjectURL(preview3);
    setProof1(null);
    setPreview1(null);
    setProof2(null);
    setPreview2(null);
    setProof3(null);
    setPreview3(null);
  };

  const router = useRouter();

  const fetchTickets = async (showLoading = true) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      if (showLoading) setIsLoading(false);
      return;
    }
    const user = JSON.parse(userStr);

    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);

        // If a ticket is currently open, refresh its messages in real-time
        setViewingTicket(prev => {
          if (!prev) return null;
          const updated = (data.tickets || []).find(t => t.id === prev.id);
          return updated || prev;
        });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
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
        const prods = Array.isArray(data) ? data : data.products || [];
        setAvailableProducts(prods);
        return prods;
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    return [];
  };

  useEffect(() => {
    fetchTickets(true);
    fetchStores();

    const initData = async () => {
      const prods = await fetchProducts();
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autoOpen') === 'true') {
          setStoreName(params.get('storeName') || '');

          try {
            if (params.get('orderDate')) {
              setOrderDate(new Date(params.get('orderDate')).toISOString().split('T')[0]);
            }
          } catch (e) { }

          setOrderId(params.get('orderId') || '');
          setOrderAmount(params.get('orderAmount') || '');
          const pId = params.get('productId') || '';
          setProductId(pId);
          if (pId && prods) {
            const found = prods.find(p => p.id === pId);
            if (found) setProductSearch(found.title);
          }
          setUserNote('My manual cashback claim was rejected. Please review.');
          setIsModalOpen(true);
        }
      }
    };
    initData();

    const interval = setInterval(() => {
      fetchTickets(false);
    }, 5000); // Polling every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (productId && availableProducts.length > 0 && !productSearch) {
      const matched = availableProducts.find(p => p.id === productId);
      if (matched) {
        setProductSearch(matched.title);
      }
    }
  }, [productId, availableProducts, productSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!productId) {
      showErrorToast('Please select a product/deal from the list for your missing cashback ticket.');
      setFormError('Product selection is required. Please search and select a product.');
      return;
    }

    if (!storeName || !orderId || !orderAmount) {
      showErrorToast('All required fields (Product, Store, Order ID, Order Amount) must be filled');
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    setIsSubmitting(true);

    const submitOrderDate = orderDate || new Date().toISOString();

    try {
      const url = editingTicketId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/${editingTicketId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback`;

      let bodyData;
      let headersConfig = {
        'Authorization': `Bearer ${user.token}`
      };

      if (!editingTicketId) {
        bodyData = new FormData();
        bodyData.append('storeName', storeName);
        bodyData.append('orderDate', submitOrderDate);
        bodyData.append('orderId', orderId);
        bodyData.append('orderAmount', orderAmount);
        bodyData.append('userNote', userNote);
        bodyData.append('productId', productId);
        const filesToUpload = [proof1, proof2, proof3].filter(Boolean);
        filesToUpload.forEach(file => {
          bodyData.append('orderScreenshots', file);
        });
      } else {
        bodyData = JSON.stringify({ storeName, orderDate: submitOrderDate, orderId, orderAmount, userNote, productId });
        headersConfig['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: editingTicketId ? 'PUT' : 'POST',
        headers: headersConfig,
        body: bodyData
      });

      const data = await res.json();

      if (res.ok) {
        resetModalState();
        if (viewingTicket) {
          // Update the viewing ticket as well
          const updatedTicket = { 
            ...viewingTicket, 
            storeName, 
            orderDate: new Date(submitOrderDate).toISOString(), 
            orderId, 
            orderAmount: parseFloat(orderAmount), 
            userNote,
            product: productId ? availableProducts.find(p => p.id === productId) || viewingTicket.product : null
          };
          setViewingTicket(updatedTicket);
        }
        fetchTickets();
        showSuccessToast(editingTicketId ? 'Ticket updated successfully!' : 'Missing cashback ticket submitted successfully!');
      } else {
        const userMsg = handleAppError(data.error || 'Failed to submit ticket', {
          context: 'Missing Cashback Ticket Submit',
          title: 'Submission Failed',
          fallback: 'Could not submit your ticket. Please check the details.'
        });
        setFormError(userMsg);
      }
    } catch (error) {
      const userMsg = handleAppError(error, {
        context: 'Missing Cashback Network',
        title: 'Connection Error',
        fallback: 'Unable to connect to the server. Please try again.'
      });
      setFormError(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!chatMessage.trim() && !chatAttachment) || !viewingTicket) return;

    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    setIsSendingMsg(true);

    try {
      const formData = new FormData();
      formData.append('message', chatMessage);
      formData.append('sender', 'USER');
      if (chatAttachment) {
        formData.append('attachment', chatAttachment);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/${viewingTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setViewingTicket({
          ...viewingTicket,
          messages: [...(viewingTicket.messages || []), data.message]
        });
        setChatMessage('');
        setChatAttachment(null);
        fetchTickets();
        showSuccessToast('Message sent.');
      } else {
        handleAppError('Failed to send message', {
          context: 'Missing Cashback Chat',
          title: 'Message Error'
        });
      }
    } catch (error) {
      handleAppError(error, {
        context: 'Missing Cashback Chat Network',
        title: 'Connection Error'
      });
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleOpenTicket = (ticket) => {
    setViewingTicket(ticket);

    if (ticket.userUnread) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/${ticket.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${user.token}` }
        }).then(() => {
          setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, userUnread: false } : t));
        }).catch(console.error);
      }
    }
  };

  const handleEditClick = (ticket) => {
    resetModalState();
    setEditingTicketId(ticket.id);
    setStoreName(ticket.storeName);
    setOrderDate(new Date(ticket.orderDate).toISOString().split('T')[0]);
    setOrderId(ticket.orderId);
    setOrderAmount(ticket.orderAmount);
    setUserNote(ticket.userNote || '');
    setProductId(ticket.productId || '');
    setProductSearch(ticket.product?.title || '');
    setIsModalOpen(true);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const openNewTicketModal = () => {
    resetModalState();
    setIsModalOpen(true);
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

  const filteredTickets = tickets.filter(t =>
    t.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 font-sans pb-10 relative">
      {viewingTicket ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button variant="none" size="none"
            onClick={() => setViewingTicket(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Tickets
          </Button>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 dark:border-neutral-800 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-black text-neutral-900 dark:text-white">{viewingTicket.storeName}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingTicket.status === 'RESOLVED' ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' :
                    viewingTicket.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' :
                      'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                    {viewingTicket.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-4 h-4" /> Raised on {formatDate(viewingTicket.createdAt)}
                  <span className="mx-2">•</span>
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300">#{viewingTicket.ticketId || viewingTicket.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>

              {viewingTicket.status === 'PENDING' && (
                <Button variant="none" size="none"
                  onClick={() => handleEditClick(viewingTicket)}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Edit2 className="w-4 h-4" /> Edit Ticket
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h5 className="font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">Order Details</h5>
                <div className="space-y-4">
                  {viewingTicket.product && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Product</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{viewingTicket.product.title}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Order Amount</p>
                    <p className="text-lg font-black text-neutral-900 dark:text-white">₹{viewingTicket.orderAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Order ID / Receipt No.</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900 dark:text-white">{viewingTicket.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Order Date</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900 dark:text-white">{formatDate(viewingTicket.orderDate)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col h-[400px]">
                <h5 className="font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4 shrink-0">Conversation History</h5>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                  {viewingTicket.userNote && (
                    <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800 mr-8">
                      <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">My Initial Note</span>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 break-words">{viewingTicket.userNote}</p>
                    </div>
                  )}
                  {viewingTicket.orderScreenshots && viewingTicket.orderScreenshots.length > 0 && (
                    <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800 mr-8">
                      <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-2">Order Screenshots</span>
                      <div className="flex flex-wrap gap-2">
                        {viewingTicket.orderScreenshots.map((img, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setLightboxImage(getImageUrl(img))}
                            className="cursor-zoom-in relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 focus:outline-none"
                          >
                            <img src={getImageUrl(img)} alt={`Proof ${i + 1}`} className="w-16 h-16 object-cover group-hover:scale-105 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTicket.adminNote && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-100 dark:border-amber-900/50 ml-8 text-right">
                      <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Admin&apos;s Initial Note</span>
                      <p className="text-sm text-amber-900 dark:text-amber-200 break-words">{viewingTicket.adminNote}</p>
                    </div>
                  )}
                  {viewingTicket.messages?.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-xl border ${msg.sender === 'USER' ? 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-100 dark:border-neutral-800 mr-8' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 ml-8 text-right'}`}>
                      <span className={`block text-[10px] font-bold uppercase mb-1 ${msg.sender === 'USER' ? 'text-neutral-400 dark:text-neutral-500' : 'text-amber-600 dark:text-amber-400'}`}>
                        {msg.sender === 'USER' ? 'Me' : 'Admin'} <span className="opacity-50 lowercase ml-1">{formatDate(msg.createdAt)}</span>
                      </span>
                      <p className={`text-sm break-words ${msg.sender === 'USER' ? 'text-neutral-700 dark:text-neutral-300' : 'text-amber-900 dark:text-amber-200'}`}>{msg.message}</p>
                      {msg.attachment && (
                        <button
                          type="button"
                          onClick={() => setLightboxImage(getImageUrl(msg.attachment))}
                          className="block mt-2 cursor-zoom-in relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 focus:outline-none"
                        >
                          <img src={getImageUrl(msg.attachment)} alt="Attachment" className="w-24 h-24 object-cover group-hover:scale-105 transition-transform" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!viewingTicket.userNote && !viewingTicket.adminNote && (!viewingTicket.messages || viewingTicket.messages.length === 0) && (
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 italic text-center mt-8">No messages yet.</p>
                  )}
                </div>

                {viewingTicket.status === 'PENDING' ? (
                  <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2 items-center">
                    <label className="cursor-pointer text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <Paperclip className="w-5 h-5" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.heic,.heif" 
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            try {
                              const p = await processImageUpload(f, { maxSizeMB: 5.0 });
                              setChatAttachment(p ? p.file : f);
                            } catch (err) {
                              showErrorToast(err.message || 'Failed to process attachment');
                            }
                          }
                        }} 
                      />
                    </label>

                    <div className="flex-1 flex flex-col gap-1">
                      {chatAttachment && (
                        <div className="flex items-center gap-1 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded w-fit">
                          <span className="truncate max-w-[100px]">{chatAttachment.name}</span>
                          <Button variant="none" size="none" type="button" onClick={() => setChatAttachment(null)} className="hover:text-red-500"><X className="w-3 h-3" /></Button>
                        </div>
                      )}
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!chatMessage.trim() && !chatAttachment}
                      isLoading={isSendingMsg}
                      className="text-sm rounded-xl !px-4 !py-2.5 normal-case tracking-normal self-end"
                    >
                      {isSendingMsg ? 'Sending...' : 'Send'}
                    </Button>
                  </form>
                ) : (
                  <div className="shrink-0 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    This ticket is {viewingTicket.status.toLowerCase()} and closed for new messages.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-[#f96b02] rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h5 className="font-extrabold text-neutral-900 dark:text-white tracking-tight">Missing Cashback</h5>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-lg">
                Did you shop but the cashback hasn&apos;t tracked after 72 hours? Raise a ticket and our team will investigate it with the store.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={openNewTicketModal}
              className="text-[13px] sm:text-[14px] shrink-0"
            >
              <Plus className="w-4 h-4" /> RAISE TICKET
            </Button>
          </div>

          {/* Information Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-sm">
            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 p-2 rounded-full shrink-0 mt-0.5">
              <InfoIcon />
            </div>
            <div>
              <h5 className="text-amber-900 dark:text-amber-300 font-bold mb-1">Important Rules for Missing Cashback</h5>
              <ul className="text-amber-800/80 dark:text-amber-300/80 text-xs sm:text-sm leading-relaxed list-disc list-inside space-y-1">
                <li>Wait for at least <strong>72 hours</strong> after your purchase before raising a ticket.</li>
                <li>Tickets must be raised within <strong>7 days</strong> of the transaction date.</li>
                <li>Do not raise tickets for orders that were cancelled, returned, or exchanged.</li>
              </ul>
            </div>
          </div>

          {/* Search and Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search store or Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-800 transition-all"
                />
                <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {isLoading ? (
              <PageLoader />
            ) : filteredTickets.length > 0 ? (
              <>
                {/* Mobile Card List View (< sm) */}
                <div className="sm:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleOpenTicket(ticket)}
                      className="p-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/60 active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-md">
                          #{ticket.ticketId || ticket.id.slice(-8).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          {ticket.userUnread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap ${
                            ticket.status === 'RESOLVED' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                            ticket.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                            'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 dark:text-white text-sm leading-snug">{ticket.storeName}</p>
                          {ticket.product && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate mt-0.5 font-medium">
                              📦 {ticket.product.title}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">₹{ticket.orderAmount}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100/70 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                          <span className="whitespace-nowrap font-medium text-neutral-700 dark:text-neutral-300">Raised on {formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                          <span className="text-[11px]">Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop / Tablet Table View (>= sm) */}
                <div className="hidden sm:block overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-neutral-50/80 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                        <th className="py-4 px-5 lg:px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap min-w-[110px]">Ticket ID</th>
                        <th className="py-4 px-5 lg:px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider min-w-[220px]">Store Info</th>
                        <th className="py-4 px-5 lg:px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap min-w-[150px]">Order Details</th>
                        <th className="py-4 px-5 lg:px-6 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap min-w-[150px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() => handleOpenTicket(ticket)}
                          className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-5 lg:px-6 whitespace-nowrap">
                            <span className="text-[11px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-md">
                              #{ticket.ticketId || ticket.id.slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-5 lg:px-6 min-w-[220px]">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-neutral-900 dark:text-white text-sm group-hover:text-black dark:group-hover:text-white transition-colors">{ticket.storeName}</p>
                              {ticket.userUnread && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
                              )}
                            </div>
                            {ticket.product && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[240px] mb-1 font-medium">
                                📦 {ticket.product.title}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                              <Calendar className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
                              <span className="whitespace-nowrap">Raised on {formatDate(ticket.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 lg:px-6 whitespace-nowrap min-w-[150px]">
                            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">₹{ticket.orderAmount}</p>
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 whitespace-nowrap">Ordered on {formatDate(ticket.orderDate)}</p>
                          </td>
                          <td className="py-4 px-5 lg:px-6 whitespace-nowrap min-w-[150px]">
                            <div className="flex items-center justify-between gap-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${
                                ticket.status === 'RESOLVED' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                ticket.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}>
                                {ticket.status}
                              </span>

                              <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white transition-colors transform group-hover:translate-x-1 shrink-0" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-neutral-100 dark:border-neutral-700">
                  <ShieldAlert className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-2">No tickets found</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm text-sm">
                  You haven&apos;t raised any missing cashback claims yet, or your search didn&apos;t match any.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl lg:max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative border border-neutral-100 dark:border-neutral-800">
              
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#f96b02]/10 border border-[#f96b02]/20 flex items-center justify-center text-[#f96b02]">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white text-base sm:text-lg leading-tight">
                      {editingTicketId ? 'Edit Missing Cashback Ticket' : 'Raise Missing Cashback Ticket'}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Verify purchase details and upload proof screenshots</p>
                  </div>
                </div>
                <Button 
                  variant="none" 
                  size="none" 
                  onClick={resetModalState} 
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">

                {/* 1. Product (First) & Store (Second - Auto Selected) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Product / Deal (FIRST - COMPULSORY) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        Product / Deal <span className="text-red-500">*</span>
                      </span>
                      {productId ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                          Required
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
                        if (formError) setFormError('');
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                      placeholder="Search and select product (Required)..."
                      className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all"
                      required
                    />
                    {!productId && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1">
                        * Please search and select a product/deal from the dropdown.
                      </p>
                    )}
                    {showProductDropdown && (
                      <div className="absolute z-30 w-full mt-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-52 overflow-y-auto py-1">
                        {availableProducts
                          .filter(p => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()))
                          .map(product => (
                            <div
                              key={product.id}
                              className={`px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 cursor-pointer text-sm font-medium flex items-center justify-between gap-2 ${
                                productId === product.id ? 'bg-orange-50/60 dark:bg-orange-950/40 text-[#f96b02] font-bold' : 'text-neutral-800 dark:text-neutral-200'
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setProductId(product.id);
                                setProductSearch(product.title);
                                setShowProductDropdown(false);
                                if (formError) setFormError('');

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
                              {product.storeRel?.name && (
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-400 font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 shrink-0">
                                  {product.storeRel.name}
                                </span>
                              )}
                            </div>
                          ))}
                        {availableProducts.filter(p => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 text-center italic">No matching products found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Store Name (SECOND - Auto Selected) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        Store Name <span className="text-red-500">*</span>
                      </span>
                      {productId && storeName && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
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
                      className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all"
                      required
                    />
                    {showStoreDropdown && (
                      <div className="absolute z-30 w-full mt-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                        {availableStores.filter(s => !storeName || s.name.toLowerCase().includes(storeName.toLowerCase())).map(store => (
                          <div
                            key={store.id}
                            className="px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 cursor-pointer text-sm font-medium text-neutral-800 dark:text-neutral-200 flex items-center justify-between"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStoreName(store.name);
                              setShowStoreDropdown(false);
                            }}
                          >
                            <span>{store.name}</span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase">Store</span>
                          </div>
                        ))}
                        {availableStores.filter(s => !storeName || s.name.toLowerCase().includes(storeName.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 text-center italic">
                            Press Enter or continue typing for custom store: &quot;{storeName}&quot;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Order Details: 2-column Grid (Order ID, Amount) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                      Order ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. 402-1234567"
                      className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">₹</span>
                      Order Amount (₹) <span className="text-red-500">*</span>
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
                      className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 3. Upload Proofs (3 Dedicated Cards - Optional) */}
                {!editingTicketId && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white whitespace-nowrap">
                          Proof Screenshots
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 whitespace-nowrap shrink-0">
                          Optional (Max 3)
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium whitespace-nowrap truncate text-right">
                        Click thumbnail to zoom
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <ProofUploadCard
                        stepNumber={1}
                        title="Proof 1"
                        subtitle="Optional"
                        file={proof1}
                        preview={preview1}
                        onFileSelect={(f) => processProof(f, 1)}
                        onRemove={() => removeProof(1)}
                        onPreview={() => preview1 && setLightboxImage(preview1)}
                      />
                      <ProofUploadCard
                        stepNumber={2}
                        title="Proof 2"
                        subtitle="Optional"
                        file={proof2}
                        preview={preview2}
                        onFileSelect={(f) => processProof(f, 2)}
                        onRemove={() => removeProof(2)}
                        onPreview={() => preview2 && setLightboxImage(preview2)}
                      />
                      <ProofUploadCard
                        stepNumber={3}
                        title="Proof 3"
                        subtitle="Optional"
                        file={proof3}
                        preview={preview3}
                        onFileSelect={(f) => processProof(f, 3)}
                        onRemove={() => removeProof(3)}
                        onPreview={() => preview3 && setLightboxImage(preview3)}
                      />
                    </div>
                  </div>
                )}

                {/* 4. User Note / Remarks */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">User Note / Remarks (Optional)</label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    rows="2"
                    placeholder="Any additional details or message for support..."
                    className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none"
                  />
                </div>

                <div className="pt-2 pb-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth={true}
                    isLoading={isSubmitting}
                    className="text-[13px] sm:text-[14px]"
                  >
                    {isSubmitting ? 'SUBMITTING TICKET...' : (editingTicketId ? 'SAVE CHANGES' : 'SUBMIT TICKET')}
                  </Button>
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

// Simple Info Icon SVG component
function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
