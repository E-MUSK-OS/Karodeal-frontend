'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Search, CheckCircle, XCircle, Clock, Save, ArrowLeft, ArrowRight, Calendar, Paperclip, X } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export default function AdminMissingCashback() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('ADMIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Modal state
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [awardedCashback, setAwardedCashback] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: false });
  const [isUpdating, setIsUpdating] = useState(false);

  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [chatAttachment, setChatAttachment] = useState(null);

  const router = useRouter();

  const fetchTickets = async (showLoading = true) => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserRole(user.role || 'ADMIN');

    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);

        // If a ticket is currently open, refresh its messages in real-time
        setSelectedTicket(prev => {
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

  useEffect(() => {
    fetchTickets(true);

    const interval = setInterval(() => {
      fetchTickets(false);
    }, 5000); // Polling every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  const initiateTicketUpdate = (targetStatus) => {
    if (!selectedTicket) return;
    setFormError('');
    setFormSuccess('');

    if (targetStatus === 'REJECTED' && (!adminNote || !adminNote.trim())) {
      setFormError("Admin note / rejection reason is compulsory when rejecting a ticket.");
      return;
    }

    if (targetStatus === 'RESOLVED') {
      if (awardedCashback && parseFloat(awardedCashback) > 0) {
        setConfirmModal({
          isOpen: true,
          title: 'Confirm Ticket Resolution',
          message: `Are you sure you want to resolve this ticket and credit ₹${awardedCashback} to ${selectedTicket.user?.name || 'the user'}?${adminNote.trim() ? ` Note: "${adminNote.trim()}".` : ''} Once resolved, this ticket CANNOT be modified or reopened.`,
          confirmText: 'Yes, Resolve & Credit',
          isDestructive: false,
          onConfirm: () => executeTicketUpdate('RESOLVED')
        });
      } else {
        setConfirmModal({
          isOpen: true,
          title: 'Confirm Ticket Resolution',
          message: `Are you sure you want to mark this ticket as RESOLVED?${adminNote.trim() ? ` Note: "${adminNote.trim()}".` : ''} Once resolved, it CANNOT be modified or reopened.`,
          confirmText: 'Yes, Mark Resolved',
          isDestructive: false,
          onConfirm: () => executeTicketUpdate('RESOLVED')
        });
      }
    } else if (targetStatus === 'REJECTED') {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Ticket Rejection',
        message: `Are you sure you want to REJECT this ticket for ${selectedTicket.user?.name || 'the user'}? Rejection reason: "${adminNote.trim()}". Once rejected, it CANNOT be modified or reopened.`,
        confirmText: 'Yes, Reject Ticket',
        isDestructive: true,
        onConfirm: () => executeTicketUpdate('REJECTED')
      });
    }
  };

  const executeTicketUpdate = async (targetStatus) => {
    if (!selectedTicket?.id) {
      setFormError('No ticket selected.');
      return;
    }

    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);
    setIsUpdating(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/admin/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({ 
          status: targetStatus, 
          adminNote: adminNote.trim() || undefined, 
          awardedCashback: targetStatus === 'RESOLVED' && awardedCashback && parseFloat(awardedCashback) > 0 ? parseFloat(awardedCashback) : undefined 
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        // Fallback for non-JSON response
      }

      if (res.ok) {
        setFormSuccess(data.message || 'Ticket updated successfully');
        setTimeout(() => {
          setSelectedTicket(null);
          fetchTickets();
        }, 1200);
      } else {
        setFormError(data.error || 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Failed to update ticket', error);
      setFormError('Failed to update ticket. Please check connection and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!chatMessage.trim() && !chatAttachment) || !selectedTicket) return;

    const userStr = localStorage.getItem('adminUser');
    const user = JSON.parse(userStr);
    setIsSendingMsg(true);

    try {
      const formData = new FormData();
      formData.append('message', chatMessage);
      formData.append('sender', 'ADMIN');
      if (chatAttachment) {
        formData.append('attachment', chatAttachment);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/admin/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket({
          ...selectedTicket,
          messages: [...(selectedTicket.messages || []), data.message]
        });
        setChatMessage('');
        setChatAttachment(null);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status === 'PENDING' ? 'RESOLVED' : ticket.status);
    setAdminNote(ticket.adminNote || '');

    const prod = ticket.product || ticket.matchedClaim?.product;
    let defaultCashback = '';
    if (prod && prod.cashback !== undefined && prod.cashback !== null && prod.cashback !== '') {
      defaultCashback = String(prod.cashback);
    } else if (ticket.matchedClaim?.awardedCashback) {
      defaultCashback = String(ticket.matchedClaim.awardedCashback);
    }
    setAwardedCashback(defaultCashback);
    setFormError('');
    setFormSuccess('');

    if (ticket.adminUnread) {
      const userStr = localStorage.getItem('adminUser');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/admin/${ticket.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${user.token}` }
        }).then(() => {
          setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, adminUnread: false } : t));
        }).catch(console.error);
      }
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

  const filteredTickets = tickets.filter(t =>
    t.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-neutral-900 tracking-tight">Missing Cashback Claims</h3>
            {userRole === 'SUB_ADMIN' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Your Cards Only
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">Manage and resolve user cashback tickets</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search email, store, or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {selectedTicket ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <Button variant="none" size="none"
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#f96b02] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </Button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-black text-neutral-900">{selectedTicket.storeName}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    selectedTicket.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Calendar className="w-4 h-4" /> Raised on {formatDate(selectedTicket.createdAt)}
                  <span className="mx-2">•</span>
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">#{selectedTicket.ticketId || selectedTicket.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-neutral-900">{selectedTicket.user?.name || 'Unknown User'}</p>
                <p className="text-xs text-neutral-500">{selectedTicket.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h3>
                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-4">
                    {selectedTicket.product && (
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Product / Deal</p>
                        <p className="text-sm font-bold text-neutral-900">{selectedTicket.product.title}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                      <p className="text-lg font-black text-neutral-900">₹{selectedTicket.orderAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Order ID / Receipt No.</p>
                      <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900">{selectedTicket.orderId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                      <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900">{formatDate(selectedTicket.orderDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col h-[400px]">
                  <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 shrink-0">Conversation History</h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                    {selectedTicket.userNote && (
                      <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mr-8 text-left">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">User&apos;s Initial Note</span>
                        <p className="text-sm text-neutral-700 break-words">{selectedTicket.userNote}</p>
                      </div>
                    )}
                    {selectedTicket.orderScreenshots && selectedTicket.orderScreenshots.length > 0 && (
                      <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mr-8 text-left">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-2">Order Screenshots</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.orderScreenshots.map((img, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setLightboxImage(getImageUrl(img))}
                              className="cursor-zoom-in relative group rounded-lg overflow-hidden border border-neutral-200 focus:outline-none"
                            >
                              <img src={getImageUrl(img)} alt={`Proof ${i + 1}`} className="w-16 h-16 object-cover group-hover:scale-105 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedTicket.adminNote && (
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 ml-8 text-right">
                        <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1">My Initial Note</span>
                        <p className="text-sm text-amber-900 break-words">{selectedTicket.adminNote}</p>
                      </div>
                    )}
                    {selectedTicket.messages?.map((msg) => (
                      <div key={msg.id} className={`p-3 rounded-xl border ${msg.sender === 'USER' ? 'bg-neutral-50 border-neutral-100 mr-8 text-left' : 'bg-amber-50 border-amber-100 ml-8 text-right'}`}>
                        <span className={`block text-[10px] font-bold uppercase mb-1 ${msg.sender === 'USER' ? 'text-neutral-400' : 'text-amber-600'}`}>
                          {msg.sender === 'USER' ? 'User' : 'Me'} <span className="opacity-50 lowercase ml-1">{formatDate(msg.createdAt)}</span>
                        </span>
                        <p className={`text-sm break-words ${msg.sender === 'USER' ? 'text-neutral-700' : 'text-amber-900'}`}>{msg.message}</p>
                        {msg.attachment && (
                          <button
                            type="button"
                            onClick={() => setLightboxImage(getImageUrl(msg.attachment))}
                            className="block mt-2 cursor-zoom-in relative group rounded-lg overflow-hidden border border-neutral-200 focus:outline-none"
                          >
                            <img src={getImageUrl(msg.attachment)} alt="Attachment" className="w-24 h-24 object-cover group-hover:scale-105 transition-transform" />
                          </button>
                        )}
                      </div>
                    ))}
                    {!selectedTicket.userNote && !selectedTicket.adminNote && (!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                      <p className="text-sm text-neutral-400 italic text-center mt-8">No messages yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2 items-center">
                    <label className="cursor-pointer text-neutral-400 hover:text-[#f96b02] transition-colors p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setChatAttachment(e.target.files[0])} />
                    </label>

                    <div className="flex-1 flex flex-col gap-1">
                      {chatAttachment && (
                        <div className="flex items-center gap-1 text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded w-fit">
                          <span className="truncate max-w-[100px]">{chatAttachment.name}</span>
                          <Button variant="none" size="none" type="button" onClick={() => setChatAttachment(null)} className="hover:text-red-500"><X className="w-3 h-3" /></Button>
                        </div>
                      )}
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message to the user..."
                        className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <Button variant="none" size="none"
                      type="submit"
                      disabled={isSendingMsg || (!chatMessage.trim() && !chatAttachment)}
                      className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-opacity self-end"
                    >
                      {isSendingMsg ? '...' : 'Send'}
                    </Button>
                  </form>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Manage & Update</h3>
                {selectedTicket.status === 'PENDING' ? (
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
                    
                    {/* Linked Cashback Claim Banner if exists */}
                    {selectedTicket.matchedClaim && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-600" /> Linked Cashback Claim
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            selectedTicket.matchedClaim.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                            selectedTicket.matchedClaim.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            Claim {selectedTicket.matchedClaim.status}
                          </span>
                        </div>
                        
                        <div className="text-xs text-neutral-700 space-y-1">
                          <p><span className="font-medium text-neutral-500">Claim ID:</span> #{selectedTicket.matchedClaim.ticketId || selectedTicket.matchedClaim.id.slice(-6).toUpperCase()}</p>
                          {(selectedTicket.product?.title || selectedTicket.matchedClaim.product?.title) && (
                            <p><span className="font-medium text-neutral-500">Product Name:</span> <span className="font-bold text-neutral-900">{selectedTicket.product?.title || selectedTicket.matchedClaim.product?.title}</span></p>
                          )}
                          <p>
                            <span className="font-medium text-neutral-500">Product Cashback:</span>{' '}
                            <span className="font-bold text-green-700">
                              ₹{selectedTicket.product?.cashback ?? selectedTicket.matchedClaim.product?.cashback ?? selectedTicket.matchedClaim.awardedCashback ?? 0}
                            </span>
                          </p>
                        </div>

                        {/* Submitted Proofs from Claim */}
                        {(selectedTicket.matchedClaim.invoiceScreenshot || selectedTicket.matchedClaim.reviewScreenshot || selectedTicket.matchedClaim.noReturnScreenshot) && (
                          <div className="pt-2 border-t border-amber-200/60">
                            <span className="block text-[10px] font-bold text-neutral-500 uppercase mb-1.5">Submitted Proofs in Claim</span>
                            <div className="flex gap-2">
                              {selectedTicket.matchedClaim.invoiceScreenshot && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(getImageUrl(selectedTicket.matchedClaim.invoiceScreenshot))}
                                  className="cursor-zoom-in relative rounded-lg overflow-hidden border border-amber-200 w-14 h-14 bg-white hover:opacity-90 transition-opacity"
                                  title="1. Invoice / Receipt"
                                >
                                  <img src={getImageUrl(selectedTicket.matchedClaim.invoiceScreenshot)} alt="Invoice" className="w-full h-full object-cover" />
                                </button>
                              )}
                              {selectedTicket.matchedClaim.reviewScreenshot && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(getImageUrl(selectedTicket.matchedClaim.reviewScreenshot))}
                                  className="cursor-zoom-in relative rounded-lg overflow-hidden border border-amber-200 w-14 h-14 bg-white hover:opacity-90 transition-opacity"
                                  title="2. Product Review"
                                >
                                  <img src={getImageUrl(selectedTicket.matchedClaim.reviewScreenshot)} alt="Review" className="w-full h-full object-cover" />
                                </button>
                              )}
                              {selectedTicket.matchedClaim.noReturnScreenshot && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(getImageUrl(selectedTicket.matchedClaim.noReturnScreenshot))}
                                  className="cursor-zoom-in relative rounded-lg overflow-hidden border border-amber-200 w-14 h-14 bg-white hover:opacity-90 transition-opacity"
                                  title="3. Non-Return Proof"
                                >
                                  <img src={getImageUrl(selectedTicket.matchedClaim.noReturnScreenshot)} alt="No Return" className="w-full h-full object-cover" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-2">Update Status <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {['RESOLVED', 'REJECTED'].map((opt) => (
                          <Button variant="none" size="none"
                            key={opt}
                            type="button"
                            onClick={() => {
                              setStatus(opt);
                              if (formError) setFormError('');
                            }}
                            className={`py-2.5 text-xs font-bold rounded-xl transition-all border ${status === opt
                              ? (opt === 'RESOLVED' ? 'bg-green-100 text-green-700 border-green-300 ring-2 ring-green-500/20 shadow-sm' :
                                'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-500/20 shadow-sm')
                              : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-black'
                              }`}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Cashback Credit Option when RESOLVED is selected */}
                    {status === 'RESOLVED' && (
                      <div className="bg-green-50/70 border border-green-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-green-900 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Award Cashback (Direct Wallet Credit)</span>
                        </div>
                        <p className="text-xs text-neutral-600">
                          Enter the cashback amount to credit directly to the user&apos;s wallet.
                          {selectedTicket.matchedClaim ? ' This will also automatically approve the linked claim.' : ''}
                        </p>
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Cashback Amount (₹) <span className="text-neutral-400 font-normal">(Leave empty if no wallet credit needed)</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-neutral-400 font-bold text-sm">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={awardedCashback}
                              onChange={(e) => {
                                setAwardedCashback(e.target.value);
                                if (formError) setFormError('');
                              }}
                              placeholder="e.g. 50"
                              className="w-full pl-8 pr-4 py-2 bg-white border border-green-300 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <p className="text-[10px] text-green-700 font-medium mt-1">
                            * Pre-filled with product cashback.
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Admin Note / Resolution Comment {status === 'REJECTED' ? (
                          <span className="text-red-500 font-extrabold">* (Compulsory for Reject)</span>
                        ) : (
                          <span className="text-neutral-400 font-normal">(Optional)</span>
                        )}
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => {
                          setAdminNote(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder={status === 'REJECTED' ? "Add reason for rejection (Required)..." : "Add an optional note or explanation..."}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {status === 'REJECTED' ? '* Compulsory: You must specify a reason for rejecting.' : '* Optional when resolving.'}
                      </p>
                    </div>

                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                        {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">
                        {formSuccess}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button variant="none" size="none"
                        type="button"
                        onClick={() => initiateTicketUpdate(status)}
                        disabled={isUpdating || !status}
                        className={`w-full text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md ${
                          status === 'RESOLVED' && awardedCashback && parseFloat(awardedCashback) > 0
                            ? 'bg-green-600 hover:bg-green-700'
                            : status === 'REJECTED'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-black hover:bg-[#f96b02]'
                        }`}
                      >
                        {status === 'RESOLVED' && awardedCashback && parseFloat(awardedCashback) > 0 ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {isUpdating ? 'Processing...' : `Resolve & Credit ₹${awardedCashback}`}
                          </>
                        ) : status === 'RESOLVED' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {isUpdating ? 'Processing...' : 'Mark Resolved'}
                          </>
                        ) : status === 'REJECTED' ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            {isUpdating ? 'Processing...' : 'Reject Ticket'}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {isUpdating ? 'Processing...' : 'Save Decision'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                      <span className="text-xs font-bold text-neutral-500 uppercase">Ticket Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>

                    {selectedTicket.adminNote && (
                      <div>
                        <span className="block text-xs font-bold text-neutral-500 uppercase mb-1">Admin Resolution Note</span>
                        <p className="text-sm font-medium text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                          {selectedTicket.adminNote}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-neutral-500 font-medium italic pt-2 border-t border-neutral-100">
                      * This ticket has been finalized ({selectedTicket.status}) and cannot be modified or reopened.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <PageLoader />
          ) : filteredTickets.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">User & Store</th>
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Order Details</th>
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Dates</th>
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => openUpdateModal(ticket)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-neutral-900">{ticket.user?.name || 'Unknown'}</span>
                          <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                            #{ticket.ticketId || ticket.id.slice(-6).toUpperCase()}
                          </span>
                          {ticket.adminUnread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">{ticket.user?.email}</div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                            {ticket.storeName}
                          </span>
                          {ticket.product && (
                            <span className="inline-block bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 max-w-[170px] truncate" title={ticket.product.title}>
                              📦 {ticket.product.title}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm text-neutral-900">₹{ticket.orderAmount}</div>
                        <div className="text-xs font-mono text-neutral-500">ID: {ticket.orderId}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-neutral-500"><span className="text-sm lg:text-[15px] xl:text-base font-medium">Ordered:</span> {formatDate(ticket.orderDate)}</div>
                        <div className="text-xs text-neutral-500"><span className="text-sm lg:text-[15px] xl:text-base font-medium">Raised:</span> {formatDate(ticket.createdAt)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                          ticket.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                          {ticket.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {ticket.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                          {ticket.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#f96b02] transition-colors transform group-hover:translate-x-1 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 text-neutral-300 mb-3" />
              <h3 className="font-bold text-neutral-900 mb-1">No claims found</h3>
              <p className="text-sm text-neutral-500">There are no missing cashback tickets matching your criteria.</p>
            </div>
          )}
        </div>
      )}
      <Lightbox
        open={!!lightboxImage}
        close={() => setLightboxImage(null)}
        slides={[{ src: lightboxImage }]}
        plugins={[Zoom]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5 }}
      />
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
    </div>
  );
}
