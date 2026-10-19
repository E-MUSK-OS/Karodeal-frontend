'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import ConfirmModal from '@/components/common/ConfirmModal';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import MissingCashbackFilterBar from '@/components/admin/missing-cashback/MissingCashbackFilterBar';
import MissingCashbackTable from '@/components/admin/missing-cashback/MissingCashbackTable';
import MissingCashbackDetailView from '@/components/admin/missing-cashback/MissingCashbackDetailView';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';
import { buildDeduplicatedCreators, matchesCreatorFilter } from '@/lib/adminCreators';

function AdminMissingCashbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Filter Dropdowns State
  const [selectedAdmin, setSelectedAdmin] = useState('ALL');
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Status Update / Modal State
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [awardedCashback, setAwardedCashback] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}, isDestructive: false });
  const [isUpdating, setIsUpdating] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [chatAttachment, setChatAttachment] = useState(null);

  // Formatters & Helpers
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

  // Fetch Tickets from Backend API
  const fetchTickets = async (showLoading = true) => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
    if (!userStr) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(userStr);

    if (user.role === 'SUB_ADMIN') {
      router.replace('/admin/dashboard');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/missing-cashback/admin`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);

        // Real-time refresh of open ticket's messages
        setSelectedTicket(prev => {
          if (!prev) return null;
          const updated = (data.tickets || []).find(t => t.id === prev.id);
          return updated || prev;
        });
      }

      // Fetch admin & sub-admin users list from /auth to populate creator filters
      try {
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (usersRes.ok) {
          const uData = await usersRes.json();
          const allUsers = Array.isArray(uData) ? uData : uData.users || [];
          const adminUsers = allUsers.filter(u => u.role === 'ADMIN' || u.role === 'SUB_ADMIN');
          setAdminUsersList(adminUsers);
        }
      } catch (err) {
        console.error('Failed to load admin users', err);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Polling every 5 seconds for incoming user messages
  useEffect(() => {
    fetchTickets(true);

    const interval = setInterval(() => {
      fetchTickets(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  // Open ticket details & mark read
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

    // Mark as read if adminUnread
    if (ticket.adminUnread) {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
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

  // Handler for selecting a ticket (syncs URL ?id=...)
  const handleSelectTicket = (ticket) => {
    const ticketParam = ticket.ticketId || ticket.id;
    router.push(`/admin/missing-cashback?id=${encodeURIComponent(ticketParam)}`, { scroll: false });
    openUpdateModal(ticket);
  };

  // Handler for back button (resets URL)
  const handleBackToList = () => {
    router.push('/admin/missing-cashback', { scroll: false });
    setSelectedTicket(null);
  };

  // URL query parameter synchronization
  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    if (idParam) {
      const paramLower = idParam.trim().toLowerCase();
      const found = tickets.find(t =>
        (t.ticketId && t.ticketId.toLowerCase() === paramLower) ||
        t.id.toLowerCase() === paramLower ||
        t.id.slice(-6).toUpperCase() === idParam.toUpperCase()
      );

      if (found) {
        if (!selectedTicket || selectedTicket.id !== found.id) {
          openUpdateModal(found);
        }
      }
    } else {
      if (selectedTicket) {
        setSelectedTicket(null);
      }
    }
  }, [idParam, tickets]);

  // Reset page to 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedAdmin]);

  // Extract all creators for Admin dropdown
  const allCreators = (() => {
    let currentAdmin = null;
    try {
      const adminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (adminStr) currentAdmin = JSON.parse(adminStr);
    } catch (e) {}

    return buildDeduplicatedCreators({
      currentAdmin,
      adminUsersList,
      items: tickets,
      getItemCreator: (t) => (t.product || t.matchedClaim?.product)?.createdBy,
      getItemCreatorId: (t) => (t.product || t.matchedClaim?.product)?.createdById,
    });
  })();

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    const prod = t.product || t.matchedClaim?.product;
    const matchesAdmin = matchesCreatorFilter(prod?.createdById, selectedAdmin, allCreators);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      t.storeName.toLowerCase().includes(searchLower) ||
      t.orderId.toLowerCase().includes(searchLower) ||
      t.user?.email?.toLowerCase().includes(searchLower) ||
      t.user?.name?.toLowerCase().includes(searchLower) ||
      prod?.title?.toLowerCase().includes(searchLower) ||
      (t.ticketId && t.ticketId.toLowerCase().includes(searchLower));
    return matchesAdmin && matchesStatus && matchesSearch;
  });

  // Paginated Tickets (25 per page)
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSelectedAdmin('ALL');
    setCurrentPage(1);
  };

  // Initiate Ticket Status Update Confirmation
  const initiateTicketUpdate = (targetStatus) => {
    if (!selectedTicket) return;
    setFormError('');
    setFormSuccess('');

    if (targetStatus === 'REJECTED' && (!adminNote || !adminNote.trim())) {
      showErrorToast("Admin note / rejection reason is compulsory when rejecting a ticket.");
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

  // Execute Ticket Status Update via API
  const executeTicketUpdate = async (targetStatus) => {
    if (!selectedTicket?.id) {
      showErrorToast('No ticket selected.');
      return;
    }

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
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
        showSuccessToast(data.message || 'Ticket updated successfully');
        setTimeout(() => {
          handleBackToList();
          fetchTickets();
        }, 1000);
      } else {
        handleAppError(data.error || 'Failed to update ticket', {
          context: 'Admin / Update Ticket',
          title: 'Update Failed'
        });
      }
    } catch (error) {
      handleAppError(error, {
        context: 'Admin / Update Ticket Network',
        title: 'Update Error',
        fallback: 'Failed to update ticket. Please try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Send message in chat thread
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!chatMessage.trim() && !chatAttachment) || !selectedTicket) return;

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
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
        fetchTickets(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {selectedTicket ? (
        <MissingCashbackDetailView
          ticket={selectedTicket}
          onBack={handleBackToList}
          status={status}
          setStatus={setStatus}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          awardedCashback={awardedCashback}
          setAwardedCashback={setAwardedCashback}
          formError={formError}
          setFormError={setFormError}
          formSuccess={formSuccess}
          isUpdating={isUpdating}
          onInitiateTicketUpdate={initiateTicketUpdate}
          formatDate={formatDate}
          getImageUrl={getImageUrl}
          onOpenLightbox={(img) => setLightboxImage(img)}
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          chatAttachment={chatAttachment}
          setChatAttachment={setChatAttachment}
          isSendingMsg={isSendingMsg}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <>
          <MissingCashbackFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedAdmin={selectedAdmin}
            setSelectedAdmin={setSelectedAdmin}
            allCreators={allCreators}
            onResetFilters={handleResetFilters}
          />

          <MissingCashbackTable
            tickets={paginatedTickets}
            totalItems={filteredTickets.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onSelectTicket={handleSelectTicket}
            formatDate={formatDate}
          />
        </>
      )}

      {/* Proof & Chat Lightbox */}
      <Lightbox
        open={!!lightboxImage}
        close={() => setLightboxImage(null)}
        slides={[{ src: lightboxImage }]}
        plugins={[Zoom]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5 }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}

export default function AdminMissingCashback() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminMissingCashbackContent />
    </Suspense>
  );
}
