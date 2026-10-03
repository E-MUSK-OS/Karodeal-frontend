import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', isDestructive = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-200 animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h4 className="text-xl font-extrabold text-neutral-900 mb-2">
            {title}
          </h4>
          
          <p className="text-sm text-neutral-500 mb-8 font-medium">
            {message}
          </p>
          
          <div className="flex items-center gap-3 w-full">
            <Button variant="none" size="none"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl transition-colors"
            >
              Cancel
            </Button>
            <Button variant="none" size="none"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-5 py-3 font-bold text-sm rounded-xl transition-colors text-white ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700 shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]' 
                  : 'bg-black hover:bg-neutral-800'
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
