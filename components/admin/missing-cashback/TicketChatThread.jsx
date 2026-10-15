'use client';

import { Paperclip, X } from 'lucide-react';
import Button from '@/components/common/Button';

export default function TicketChatThread({
  ticket,
  chatMessage,
  setChatMessage,
  chatAttachment,
  setChatAttachment,
  isSendingMsg,
  onSendMessage,
  formatDate,
  getImageUrl,
  onOpenLightbox
}) {
  if (!ticket) return null;

  return (
    <div className="flex flex-col h-[400px]">
      <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-4 shrink-0 text-xs">
        Conversation History
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {/* User Initial Note */}
        {ticket.userNote && (
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mr-8 text-left">
            <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
              User&apos;s Initial Note
            </span>
            <p className="text-sm text-neutral-700 break-words">{ticket.userNote}</p>
          </div>
        )}

        {/* Order Screenshots */}
        {ticket.orderScreenshots && ticket.orderScreenshots.length > 0 && (
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mr-8 text-left">
            <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-2">
              Order Screenshots
            </span>
            <div className="flex flex-wrap gap-2">
              {ticket.orderScreenshots.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => onOpenLightbox(getImageUrl(img))}
                  className="cursor-zoom-in relative group rounded-lg overflow-hidden border border-neutral-200 focus:outline-none"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Proof ${i + 1}`}
                    className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin Initial Note */}
        {ticket.adminNote && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 ml-8 text-right">
            <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1">
              My Initial Note
            </span>
            <p className="text-sm text-amber-900 break-words">{ticket.adminNote}</p>
          </div>
        )}

        {/* Back-and-Forth Messages */}
        {ticket.messages?.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl border ${
              msg.sender === 'USER'
                ? 'bg-neutral-50 border-neutral-100 mr-8 text-left'
                : 'bg-amber-50 border-amber-100 ml-8 text-right'
            }`}
          >
            <span
              className={`block text-[10px] font-bold uppercase mb-1 ${
                msg.sender === 'USER' ? 'text-neutral-400' : 'text-amber-600'
              }`}
            >
              {msg.sender === 'USER' ? 'User' : 'Me'}{' '}
              <span className="opacity-50 lowercase ml-1">{formatDate(msg.createdAt)}</span>
            </span>
            <p className={`text-sm break-words ${msg.sender === 'USER' ? 'text-neutral-700' : 'text-amber-900'}`}>
              {msg.message}
            </p>
            {msg.attachment && (
              <button
                type="button"
                onClick={() => onOpenLightbox(getImageUrl(msg.attachment))}
                className="block mt-2 cursor-zoom-in relative group rounded-lg overflow-hidden border border-neutral-200 focus:outline-none"
              >
                <img
                  src={getImageUrl(msg.attachment)}
                  alt="Attachment"
                  className="w-24 h-24 object-cover group-hover:scale-105 transition-transform"
                />
              </button>
            )}
          </div>
        ))}

        {!ticket.userNote && !ticket.adminNote && (!ticket.messages || ticket.messages.length === 0) && (
          <p className="text-sm text-neutral-400 italic text-center mt-8">No messages yet.</p>
        )}
      </div>

      {/* Message Input Box or Closed Notice */}
      {ticket.status === 'PENDING' ? (
        <form onSubmit={onSendMessage} className="shrink-0 flex gap-2 items-center">
          <label className="cursor-pointer text-neutral-400 hover:text-[#f96b02] transition-colors p-2 bg-neutral-50 rounded-xl border border-neutral-200">
            <Paperclip className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setChatAttachment(e.target.files[0])}
            />
          </label>

          <div className="flex-1 flex flex-col gap-1">
            {chatAttachment && (
              <div className="flex items-center gap-1 text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded w-fit">
                <span className="truncate max-w-[100px]">{chatAttachment.name}</span>
                <Button
                  variant="none"
                  size="none"
                  type="button"
                  onClick={() => setChatAttachment(null)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </Button>
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
          <Button
            variant="none"
            size="none"
            type="submit"
            disabled={isSendingMsg || (!chatMessage.trim() && !chatAttachment)}
            className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-opacity self-end cursor-pointer"
          >
            {isSendingMsg ? '...' : 'Send'}
          </Button>
        </form>
      ) : (
        <div className="shrink-0 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500 font-medium">
          This ticket is {ticket.status.toLowerCase()} and closed for new messages.
        </div>
      )}
    </div>
  );
}
