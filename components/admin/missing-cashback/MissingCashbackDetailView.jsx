'use client';

import { ArrowLeft, Calendar, ShieldAlert, CheckCircle, XCircle, Save } from 'lucide-react';
import Button from '@/components/common/Button';
import TicketChatThread from './TicketChatThread';

export default function MissingCashbackDetailView({
  ticket,
  onBack,
  status,
  setStatus,
  adminNote,
  setAdminNote,
  awardedCashback,
  setAwardedCashback,
  formError,
  setFormError,
  formSuccess,
  isUpdating,
  onInitiateTicketUpdate,
  formatDate,
  getImageUrl,
  onOpenLightbox,
  chatMessage,
  setChatMessage,
  chatAttachment,
  setChatAttachment,
  isSendingMsg,
  onSendMessage
}) {
  if (!ticket) return null;

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {/* Back Button */}
      <Button
        variant="none"
        size="none"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#f96b02] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Button>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6 sm:p-8">
        {/* Ticket Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="font-black text-neutral-900 text-lg sm:text-xl">{ticket.storeName}</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                ticket.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {ticket.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 flex-wrap">
              <Calendar className="w-4 h-4" /> Raised on {formatDate(ticket.createdAt)}
              <span className="mx-2">•</span>
              <span className="text-sm lg:text-[15px] xl:text-base font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-bold">
                #{ticket.ticketId || ticket.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-neutral-900">{ticket.user?.name || 'Unknown User'}</p>
            <p className="text-xs text-neutral-500">{ticket.user?.email}</p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Order Details & Chat Thread */}
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 text-xs">Order Details</h3>
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-4">
                {ticket.product && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Product / Deal</p>
                    <p className="text-sm font-bold text-neutral-900">{ticket.product.title}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Order Amount</p>
                  <p className="text-lg font-black text-neutral-900">₹{ticket.orderAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Order ID / Receipt No.</p>
                  <p className="text-sm lg:text-[15px] xl:text-base font-mono text-neutral-900 font-semibold">{ticket.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                  <p className="text-sm lg:text-[15px] xl:text-base font-medium text-neutral-900">{formatDate(ticket.orderDate)}</p>
                </div>
              </div>
            </div>

            {/* Conversation History Component */}
            <TicketChatThread
              ticket={ticket}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              chatAttachment={chatAttachment}
              setChatAttachment={setChatAttachment}
              isSendingMsg={isSendingMsg}
              onSendMessage={onSendMessage}
              formatDate={formatDate}
              getImageUrl={getImageUrl}
              onOpenLightbox={onOpenLightbox}
            />
          </div>

          {/* Right Column: Manage & Take Action */}
          <div>
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 text-xs">Manage & Update</h3>
            {ticket.status === 'PENDING' ? (
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
                {/* Linked Cashback Claim Banner if exists */}
                {ticket.matchedClaim && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600" /> Linked Cashback Claim
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        ticket.matchedClaim.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                        ticket.matchedClaim.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        Claim {ticket.matchedClaim.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-700 space-y-1">
                      <p>
                        <span className="font-medium text-neutral-500">Claim ID:</span>{' '}
                        #{ticket.matchedClaim.ticketId || ticket.matchedClaim.id.slice(-6).toUpperCase()}
                      </p>
                      {(ticket.product?.title || ticket.matchedClaim.product?.title) && (
                        <p>
                          <span className="font-medium text-neutral-500">Product Name:</span>{' '}
                          <span className="font-bold text-neutral-900">
                            {ticket.product?.title || ticket.matchedClaim.product?.title}
                          </span>
                        </p>
                      )}
                      <p>
                        <span className="font-medium text-neutral-500">Product Cashback:</span>{' '}
                        <span className="font-bold text-green-700">
                          ₹{ticket.product?.cashback ?? ticket.matchedClaim.product?.cashback ?? ticket.matchedClaim.awardedCashback ?? 0}
                        </span>
                      </p>
                    </div>

                    {/* Submitted Proofs from Claim */}
                    {(ticket.matchedClaim.invoiceScreenshot || ticket.matchedClaim.reviewScreenshot || ticket.matchedClaim.noReturnScreenshot) && (
                      <div className="pt-2 border-t border-amber-200/60">
                        <span className="block text-[10px] font-bold text-neutral-500 uppercase mb-1.5">
                          Submitted Proofs in Claim
                        </span>
                        <div className="flex gap-2">
                          {ticket.matchedClaim.invoiceScreenshot && (
                            <button
                              type="button"
                              onClick={() => onOpenLightbox(getImageUrl(ticket.matchedClaim.invoiceScreenshot))}
                              className="cursor-zoom-in relative rounded-lg overflow-hidden border border-amber-200 w-14 h-14 bg-white hover:opacity-90 transition-opacity"
                              title="1. Invoice / Receipt"
                            >
                              <img
                                src={getImageUrl(ticket.matchedClaim.invoiceScreenshot)}
                                alt="Invoice"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )}
                          {ticket.matchedClaim.reviewScreenshot && (
                            <button
                              type="button"
                              onClick={() => onOpenLightbox(getImageUrl(ticket.matchedClaim.reviewScreenshot))}
                              className="cursor-zoom-in relative rounded-lg overflow-hidden border border-amber-200 w-14 h-14 bg-white hover:opacity-90 transition-opacity"
                              title="2. Product Review"
                            >
                              <img
                                src={getImageUrl(ticket.matchedClaim.reviewScreenshot)}
                                alt="Review"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )}
                          {ticket.matchedClaim.noReturnScreenshot && (
                            <button
                              type="button"
                              onClick={() => onOpenLightbox(getImageUrl(ticket.matchedClaim.noReturnScreenshot))}
                              className="cursor-zoom-in relative rounded-lg overflow-hidden border border-amber-200 w-14 h-14 bg-white hover:opacity-90 transition-opacity"
                              title="3. Non-Return Proof"
                            >
                              <img
                                src={getImageUrl(ticket.matchedClaim.noReturnScreenshot)}
                                alt="No Return"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Switch Buttons */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">
                    Update Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['RESOLVED', 'REJECTED'].map((opt) => (
                      <Button
                        variant="none"
                        size="none"
                        key={opt}
                        type="button"
                        onClick={() => {
                          setStatus(opt);
                          if (formError) setFormError('');
                        }}
                        className={`py-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                          status === opt
                            ? opt === 'RESOLVED'
                              ? 'bg-green-100 text-green-700 border-green-300 ring-2 ring-green-500/20 shadow-sm'
                              : 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-500/20 shadow-sm'
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
                      {ticket.matchedClaim ? ' This will also automatically approve the linked claim.' : ''}
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Cashback Amount (₹){' '}
                        <span className="text-neutral-400 font-normal">(Leave empty if no wallet credit needed)</span>
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

                {/* Admin Note textarea */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Admin Note / Resolution Comment{' '}
                    {status === 'REJECTED' ? (
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
                    placeholder={status === 'REJECTED' ? 'Add reason for rejection (Required)...' : 'Add an optional note or explanation...'}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {status === 'REJECTED' ? '* Compulsory: You must specify a reason for rejecting.' : '* Optional when resolving.'}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="none"
                    size="none"
                    type="button"
                    onClick={() => onInitiateTicketUpdate(status)}
                    disabled={isUpdating || !status}
                    className={`w-full text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
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
                    ticket.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                {ticket.adminNote && (
                  <div>
                    <span className="block text-xs font-bold text-neutral-500 uppercase mb-1">
                      Admin Resolution Note
                    </span>
                    <p className="text-sm font-medium text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                      {ticket.adminNote}
                    </p>
                  </div>
                )}

                <p className="text-xs text-neutral-500 font-medium italic pt-2 border-t border-neutral-100">
                  * This ticket has been finalized ({ticket.status}) and cannot be modified or reopened.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
