'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Plus, X, Calendar, Search, ArrowRight, Edit2, Paperclip, ChevronDown, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';

export default function MissingCashback() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStores, setAvailableStores] = useState([]);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [userNote, setUserNote] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);

  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [chatAttachment, setChatAttachment] = useState(null);
  const [orderScreenshots, setOrderScreenshots] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setOrderScreenshots(Array.from(e.target.files).slice(0, 3));
    }
  };

  const router = useRouter();

  const fetchTickets = async (showLoading = true) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
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

  useEffect(() => {
    fetchTickets(true);
    fetchStores();

    const interval = setInterval(() => {
      fetchTickets(false);
    }, 5000); // Polling every 5 seconds

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
        setUserNote('My manual cashback claim was rejected. Please review.');
        setIsModalOpen(true);
      }
    }

    return () => clearInterval(interval);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!storeName || !orderDate || !orderId || !orderAmount) {
      setFormError('All fields are required');
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    setIsSubmitting(true);

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
        bodyData.append('orderDate', orderDate);
        bodyData.append('orderId', orderId);
        bodyData.append('orderAmount', orderAmount);
        bodyData.append('userNote', userNote);
        orderScreenshots.forEach(file => {
          bodyData.append('orderScreenshots', file);
        });
      } else {
        bodyData = JSON.stringify({ storeName, orderDate, orderId, orderAmount, userNote });
        headersConfig['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method: editingTicketId ? 'PUT' : 'POST',
        headers: headersConfig,
        body: bodyData
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setStoreName('');
        setOrderDate('');
        setOrderId('');
        setOrderAmount('');
        setUserNote('');
        setEditingTicketId(null);
        setOrderScreenshots([]);
        if (viewingTicket) {
          // Update the viewing ticket as well
          const updatedTicket = { ...viewingTicket, storeName, orderDate: new Date(orderDate).toISOString(), orderId, orderAmount: parseFloat(orderAmount), userNote };
          setViewingTicket(updatedTicket);
        }
        fetchTickets();
      } else {
        setFormError(data.error || 'Failed to submit ticket');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.');
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
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    setEditingTicketId(ticket.id);
    setStoreName(ticket.storeName);
    setOrderDate(new Date(ticket.orderDate).toISOString().split('T')[0]);
    setOrderId(ticket.orderId);
    setOrderAmount(ticket.orderAmount);
    setUserNote(ticket.userNote || '');
    setIsModalOpen(true);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${url}`;
  };

  const openNewTicketModal = () => {
    setEditingTicketId(null);
    setStoreName('');
    setOrderDate('');
    setOrderId('');
    setOrderAmount('');
    setUserNote('');
    setFormError('');
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
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Tickets
          </Button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-black text-neutral-900">{viewingTicket.storeName}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${viewingTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    viewingTicket.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {viewingTicket.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Calendar className="w-4 h-4" /> Raised on {formatDate(viewingTicket.createdAt)}
                  <span className="mx-2">•</span>
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">#{viewingTicket.ticketId || viewingTicket.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>

              {viewingTicket.status === 'PENDING' && (
                <Button variant="none" size="none"
                  onClick={() => handleEditClick(viewingTicket)}
                  className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Edit2 className="w-4 h-4" /> Edit Ticket
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h5>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                    <p className="text-lg font-black text-neutral-900">₹{viewingTicket.orderAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order ID / Receipt No.</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900">{viewingTicket.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                    <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900">{formatDate(viewingTicket.orderDate)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col h-[400px]">
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 shrink-0">Conversation History</h5>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                  {viewingTicket.userNote && (
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mr-8">
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">My Initial Note</span>
                      <p className="text-sm text-neutral-700 break-words">{viewingTicket.userNote}</p>
                    </div>
                  )}
                  {viewingTicket.orderScreenshots && viewingTicket.orderScreenshots.length > 0 && (
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mr-8">
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-2">Order Screenshots</span>
                      <div className="flex flex-wrap gap-2">
                        {viewingTicket.orderScreenshots.map((img, i) => (
                          <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer">
                            <img src={getImageUrl(img)} alt={`Proof ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-neutral-200 hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingTicket.adminNote && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 ml-8 text-right">
                      <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Admin&apos;s Initial Note</span>
                      <p className="text-sm text-amber-900 break-words">{viewingTicket.adminNote}</p>
                    </div>
                  )}
                  {viewingTicket.messages?.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-xl border ${msg.sender === 'USER' ? 'bg-neutral-50 border-neutral-100 mr-8' : 'bg-amber-50 border-amber-100 ml-8 text-right'}`}>
                      <span className={`block text-[10px] font-bold uppercase mb-1 ${msg.sender === 'USER' ? 'text-neutral-400' : 'text-amber-600'}`}>
                        {msg.sender === 'USER' ? 'Me' : 'Admin'} <span className="opacity-50 lowercase ml-1">{formatDate(msg.createdAt)}</span>
                      </span>
                      <p className={`text-sm break-words ${msg.sender === 'USER' ? 'text-neutral-700' : 'text-amber-900'}`}>{msg.message}</p>
                      {msg.attachment && (
                        <a href={getImageUrl(msg.attachment)} target="_blank" rel="noreferrer" className="block mt-2">
                          <img src={getImageUrl(msg.attachment)} alt="Attachment" className="w-24 h-24 object-cover rounded-lg border border-neutral-200 hover:opacity-80 transition-opacity" />
                        </a>
                      )}
                    </div>
                  ))}
                  {!viewingTicket.userNote && !viewingTicket.adminNote && (!viewingTicket.messages || viewingTicket.messages.length === 0) && (
                    <p className="text-sm text-neutral-400 italic text-center mt-8">No messages yet.</p>
                  )}
                </div>

                {viewingTicket.status === 'PENDING' ? (
                  <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2 items-center">
                    <label className="cursor-pointer text-neutral-400 hover:text-black transition-colors p-2 bg-neutral-50 rounded-xl border border-neutral-200">
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
                        placeholder="Type a message..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
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
                  <div className="shrink-0 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500 font-medium">
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-[#f96b02] rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h5 className="font-extrabold text-neutral-900 tracking-tight">Missing Cashback</h5>
              </div>
              <p className="text-neutral-500 text-sm max-w-lg">
                Did you shop but the cashback hasn&apos;t tracked after 72 hours? Raise a ticket and our team will investigate it with the store.
              </p>
            </div>

            <Button variant="none" size="none"
              onClick={openNewTicketModal}
              className="bg-black text-white hover:bg-neutral-800 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Raise Ticket
            </Button>
          </div>

          {/* Information Banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-sm">
            <div className="bg-amber-100 text-amber-700 p-2 rounded-full shrink-0 mt-0.5">
              <InfoIcon />
            </div>
            <div>
              <h5 className="text-amber-900 font-bold mb-1">Important Rules for Missing Cashback</h5>
              <ul className="text-amber-800/80 text-xs sm:text-sm leading-relaxed list-disc list-inside space-y-1">
                <li>Wait for at least <strong>72 hours</strong> after your purchase before raising a ticket.</li>
                <li>Tickets must be raised within <strong>7 days</strong> of the transaction date.</li>
                <li>Do not raise tickets for orders that were cancelled, returned, or exchanged.</li>
              </ul>
            </div>
          </div>

          {/* Search and Table */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search store or Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {isLoading ? (
              <PageLoader />
            ) : filteredTickets.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-100">
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Store Info</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Order Details</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleOpenTicket(ticket)}
                        className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <span className="text-[11px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">
                            #{ticket.ticketId || ticket.id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-neutral-900 text-sm group-hover:text-black transition-colors">{ticket.storeName}</p>
                            {ticket.userUnread && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                            <Calendar className="w-3 h-3" /> Raised on {formatDate(ticket.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-neutral-700">₹{ticket.orderAmount}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Ordered on {formatDate(ticket.orderDate)}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                              ticket.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                              {ticket.status}
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
                <h3 className="font-bold text-neutral-900 mb-2">No tickets found</h3>
                <p className="text-neutral-500 mb-6 max-w-sm text-sm">
                  You haven&apos;t raised any missing cashback claims yet, or your search didn&apos;t match any.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
              <div className="shrink-0 flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                <h4 className="font-bold text-neutral-900">{editingTicketId ? 'Edit Ticket' : 'Raise Missing Cashback Ticket'}</h4>
                <Button variant="none" size="none"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100 text-center">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Store Name</label>
                  <div className="relative">
                    <select
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select a store</option>
                      {availableStores.map(store => (
                        <option key={store.id} value={store.name}>{store.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order Date</label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order Amount (₹)</label>
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

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order ID / Receipt No.</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter exact Order ID from store"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">User Note / Remarks (Optional)</label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    rows="2"
                    placeholder="Any additional details..."
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                  />
                </div>

                {!editingTicketId && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order Receipt / Screenshot (Optional, max 3)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-900 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                    />
                    {orderScreenshots.length > 0 && (
                      <p className="text-[10px] text-green-600 font-bold mt-2">{orderScreenshots.length} image(s) selected</p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth={true}
                    isLoading={isSubmitting}
                    className="py-3.5 rounded-xl normal-case tracking-normal shadow-md"
                  >
                    {isSubmitting ? 'Saving...' : (editingTicketId ? 'Save Changes' : 'Submit Ticket')}
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

// Simple Info Icon SVG component
function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
