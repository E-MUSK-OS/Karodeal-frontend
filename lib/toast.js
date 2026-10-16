// Unified Toast Notification Service for KaroDeal
// Dispatches events that ToastContainer listens to. Safe for client-side execution.

export const showToast = {
  error: (message, title = 'Error', duration = 5000) => {
    dispatchToast({ type: 'error', message, title, duration });
  },
  success: (message, title = 'Success', duration = 4000) => {
    dispatchToast({ type: 'success', message, title, duration });
  },
  warning: (message, title = 'Notice', duration = 4500) => {
    dispatchToast({ type: 'warning', message, title, duration });
  },
  info: (message, title = 'Info', duration = 4000) => {
    dispatchToast({ type: 'info', message, title, duration });
  },
};

function dispatchToast(detail) {
  if (typeof window === 'undefined') return;

  const eventDetail = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    ...detail,
  };

  window.dispatchEvent(new CustomEvent('karodeal:toast', { detail: eventDetail }));
}

export default showToast;
