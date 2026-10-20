'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Mail, 
  Trash2, 
  MessageSquare, 
  Store, 
  Eye, 
  X, 
  ArrowRight,
  ExternalLink,
  Calendar,
  User,
  CheckCircle2
} from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';
import { parseSellerMessage } from '@/lib/sellerParser';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'SELLER' | 'GENERAL'
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    confirmText: '', 
    onConfirm: () => {}, 
    isDestructive: true 
  });

  const fetchMessages = async () => {
    try {
      const adminStr = localStorage.getItem('adminUser');
      let token = '';
      if (adminStr) {
        const adminUser = JSON.parse(adminStr);
        token = adminUser.token;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      const res = await fetch(`${apiUrl}/contact/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Tag messages with parsed seller data if applicable
  const enrichedMessages = useMemo(() => {
    return messages.map((m) => {
      const sellerData = parseSellerMessage(m.message);
      return {
        ...m,
        isSeller: Boolean(sellerData),
        sellerData,
      };
    });
  }, [messages]);

  const sellerCount = useMemo(() => enrichedMessages.filter((m) => m.isSeller).length, [enrichedMessages]);
  const generalCount = useMemo(() => enrichedMessages.filter((m) => !m.isSeller).length, [enrichedMessages]);

  const filteredMessages = useMemo(() => {
    return enrichedMessages.filter((m) => {
      // Tab filter
      if (activeTab === 'SELLER' && !m.isSeller) return false;
      if (activeTab === 'GENERAL' && m.isSeller) return false;

      // Search query
      const q = searchQuery.toLowerCase();
      if (!q) return true;

      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q) ||
        m.sellerData?.storeName?.toLowerCase().includes(q) ||
        m.sellerData?.platform?.toLowerCase().includes(q)
      );
    });
  }, [enrichedMessages, activeTab, searchQuery]);

  const handleDeleteMessage = (messageId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const adminStr = localStorage.getItem('adminUser');
          let token = '';
          if (adminStr) {
            const adminUser = JSON.parse(adminStr);
            token = adminUser.token;
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
          const res = await fetch(`${apiUrl}/contact/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            if (selectedMessage?.id === messageId) {
              setSelectedMessage(null);
            }
            showSuccessToast('Message deleted successfully.');
          } else {
            handleAppError(data.error || 'Failed to delete message', {
              context: 'Admin Messages / Delete',
              title: 'Delete Failed',
            });
          }
        } catch (err) {
          handleAppError(err, {
            context: 'Admin Messages / Delete Network',
            title: 'Delete Error',
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-neutral-900 text-2xl tracking-tight">
              Contact & Inquiries
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
              {messages.length} Total
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            View customer contact inquiries and e-commerce seller requests
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, store..."
            className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-medium"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* 2. Top Banner Alert if there are Seller Requests */}
      {sellerCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f96b02] text-white flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-neutral-900">
                You have {sellerCount} E-Commerce Seller {sellerCount === 1 ? 'Request' : 'Requests'}
              </div>
              <p className="text-xs text-neutral-600 font-medium">
                Online stores are requesting to list their products on KaroDeal.
              </p>
            </div>
          </div>
          <Link
            href="/admin/seller-requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-[#f96b02] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs"
          >
            <span>Open Seller Requests Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Category Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          All Messages ({messages.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SELLER')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'SELLER'
              ? 'bg-[#f96b02] text-white shadow-xs'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Seller Applications ({sellerCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'GENERAL'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          General Inquiries ({generalCount})
        </button>
      </div>

      {/* 4. Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden w-full">
        {isLoading ? (
          <div className="p-12">
            <PageLoader />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm min-w-[900px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Type & Sender</th>
                  <th className="p-4">Message Preview</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-neutral-500">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-neutral-800 text-base mb-1">
                        No Messages Found
                      </h4>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'No messages have been submitted yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-neutral-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMessage(m)}
                    >
                      {/* Sender & Type */}
                      <td className="p-4 pl-6 align-middle">
                        <div className="flex items-center gap-2 mb-1">
                          {m.isSeller ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#f96b02] text-white">
                              <Store className="w-3 h-3" />
                              Seller Request
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                              General Contact
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-neutral-900 group-hover:text-[#f96b02] transition-colors">
                          {m.isSeller ? m.sellerData?.storeName || m.name : m.name}
                        </div>
                        <div className="text-neutral-500 font-mono text-xs">
                          {m.email}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="p-4 align-middle max-w-md">
                        {m.isSeller ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                              <span>Platform: {m.sellerData?.platform}</span>
                              {m.sellerData?.phone && (
                                <span className="text-neutral-500 font-normal">
                                  • Tel: {m.sellerData.phone}
                                </span>
                              )}
                            </div>
                            {m.sellerData?.storeUrl && (
                              <div className="text-xs text-blue-600 truncate max-w-sm">
                                {m.sellerData.storeUrl}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-600 line-clamp-2 font-medium">
                            {m.message}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-neutral-500 text-xs align-middle whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Full Message */}
                          <button
                            type="button"
                            onClick={() => setSelectedMessage(m)}
                            className="p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                            title="View Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Email Reply */}
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent(
                              m.isSeller
                                ? `KaroDeal Seller Partnership - ${m.sellerData?.storeName || ''}`
                                : 'KaroDeal Support Response'
                            )}`}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Reply via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative">
            
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-5 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                {selectedMessage.isSeller ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#f96b02] text-white">
                    <Store className="w-3.5 h-3.5" />
                    Seller Listing Application
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                    General Inquiry
                  </span>
                )}
                <span className="text-xs text-neutral-400">
                  {new Date(selectedMessage.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase tracking-tight">
                {selectedMessage.isSeller 
                  ? selectedMessage.sellerData?.storeName || selectedMessage.name 
                  : selectedMessage.name}
              </h2>
              <div className="text-xs font-mono text-neutral-500 mt-1">
                {selectedMessage.email}
              </div>
            </div>

            {/* Seller Specific Details if applicable */}
            {selectedMessage.isSeller && selectedMessage.sellerData && (
              <div className="space-y-3 mb-5">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    E-Commerce Platform
                  </div>
                  <div className="text-sm font-bold text-black mt-0.5">
                    {selectedMessage.sellerData.platform}
                  </div>
                </div>

                {selectedMessage.sellerData.storeUrl && (
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Storefront Link
                      </div>
                      <div className="text-xs font-semibold text-neutral-900 truncate">
                        {selectedMessage.sellerData.storeUrl}
                      </div>
                    </div>
                    <a
                      href={selectedMessage.sellerData.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-1 bg-black hover:bg-[#f96b02] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Message Body */}
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Message Content
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                  selectedMessage.isSeller
                    ? `KaroDeal Seller Partnership - ${selectedMessage.sellerData?.storeName || ''}`
                    : 'KaroDeal Support Response'
                )}`}
                className="px-4 py-2 bg-black hover:bg-[#f96b02] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Reply via Email</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

    </div>
  );
}
