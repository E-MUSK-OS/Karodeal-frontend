'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Search, CheckCircle, XCircle, Clock, Save, ArrowLeft, ArrowRight, Calendar, Paperclip, X } from 'lucide-react';

export default function AdminMissingCashback() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Modal state
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const userStr = localStorage.getItem('adminUser');
    const user = JSON.parse(userStr);
    setIsUpdating(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/admin/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      console.error('Failed to update ticket');
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
    setStatus(ticket.status);
    setAdminNote(ticket.adminNote || '');

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

  const filteredTickets = tickets.filter(t =>
    t.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">Missing Cashback Claims</h3>
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
          <button
            onClick={() => setSelectedTicket(null)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </button>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-neutral-900">{selectedTicket.storeName}</h2>
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
                  <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">#{selectedTicket.id.slice(-8).toUpperCase()}</span>
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
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Order Details</h3>
                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-4">
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
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 shrink-0">Conversation History</h3>
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
                            <a key={i} href={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${img}`} target="_blank" rel="noreferrer">
                              <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${img}`} alt={`Proof ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-neutral-200 hover:opacity-80 transition-opacity" />
                            </a>
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
                          <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${msg.attachment}`} target="_blank" rel="noreferrer" className="block mt-2">
                            <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace('/api', '')}${msg.attachment}`} alt="Attachment" className="w-24 h-24 object-cover rounded-lg border border-neutral-200 hover:opacity-80 transition-opacity" />
                          </a>
                        )}
                      </div>
                    ))}
                    {!selectedTicket.userNote && !selectedTicket.adminNote && (!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                      <p className="text-sm text-neutral-400 italic text-center mt-8">No messages yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2 items-center">
                    <label className="cursor-pointer text-neutral-400 hover:text-black transition-colors p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                      <Paperclip className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setChatAttachment(e.target.files[0])} />
                    </label>

                    <div className="flex-1 flex flex-col gap-1">
                      {chatAttachment && (
                        <div className="flex items-center gap-1 text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded w-fit">
                          <span className="truncate max-w-[100px]">{chatAttachment.name}</span>
                          <button type="button" onClick={() => setChatAttachment(null)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
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
                    <button
                      type="submit"
                      disabled={isSendingMsg || (!chatMessage.trim() && !chatAttachment)}
                      className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-opacity self-end"
                    >
                      {isSendingMsg ? '...' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Manage & Update</h3>
                <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-2">Update Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['PENDING', 'RESOLVED', 'REJECTED'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setStatus(opt)}
                          className={`py-2 text-xs font-bold rounded-lg transition-colors border ${status === opt
                              ? (opt === 'RESOLVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                opt === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                  'bg-amber-100 text-amber-700 border-amber-200')
                              : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {status === 'RESOLVED' && (
                      <p className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded border border-amber-100">
                        * Note: Setting status to RESOLVED does not automatically add money. You must add the cashback to the user&apos;s wallet manually.
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full bg-black hover:bg-neutral-800 text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Save className="w-4 h-4" /> {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading tickets...</div>
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
                            #{ticket.id.slice(-8).toUpperCase()}
                          </span>
                          {ticket.adminUnread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">{ticket.user?.email}</div>
                        <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                          {ticket.storeName}
                        </span>
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
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 text-neutral-300 mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">No claims found</h3>
              <p className="text-sm text-neutral-500">There are no missing cashback tickets matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
