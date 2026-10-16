import { showToast } from './toast';

/**
 * Sanitizes technical or cryptic error messages into clear, human-friendly messages for the end user.
 */
export function sanitizeErrorMessage(rawError, fallback = 'Something went wrong. Please try again.') {
  if (!rawError) return fallback;

  // Extract string message from various error formats
  let msg = '';
  if (typeof rawError === 'string') {
    msg = rawError;
  } else if (rawError?.message && typeof rawError.message === 'string') {
    msg = rawError.message;
  } else if (rawError?.error && typeof rawError.error === 'string') {
    msg = rawError.error;
  } else if (typeof rawError === 'object') {
    try {
      msg = JSON.stringify(rawError);
    } catch {
      msg = '';
    }
  }

  const lower = msg.toLowerCase();

  // If HTML document was returned (e.g., 502 Bad Gateway / 504 Gateway Timeout HTML page)
  if (msg.includes('<!DOCTYPE') || msg.includes('<html') || msg.includes('502 Bad Gateway') || msg.includes('504 Gateway')) {
    return 'The server is momentarily busy. Please try again in a moment.';
  }

  // Network & connection errors
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('fetch failed') ||
    lower.includes('econnrefused') ||
    lower.includes('err_connection_refused') ||
    lower.includes('network error')
  ) {
    return 'Unable to connect to the server. Please check your internet connection or try again shortly.';
  }

  // Session & Authentication
  if (
    lower.includes('jwt expired') ||
    lower.includes('token expired') ||
    lower.includes('invalid token') ||
    lower.includes('jwt malformed') ||
    lower.includes('unauthorized') ||
    lower.includes('auth token missing')
  ) {
    return 'Your session has expired. Please sign in again to continue.';
  }

  // Permissions & Access
  if (lower.includes('forbidden') || lower.includes('access denied') || lower.includes('not authorized')) {
    return 'You do not have permission to perform this action.';
  }

  // Database & Prisma technical errors
  if (
    lower.includes('prisma') ||
    lower.includes('p2002') ||
    lower.includes('unique constraint') ||
    lower.includes('foreign key') ||
    lower.includes('database query') ||
    lower.includes('syntax error') ||
    lower.includes('table') ||
    lower.includes('column')
  ) {
    if (lower.includes('unique constraint') || lower.includes('already exists') || lower.includes('p2002')) {
      return 'A record with this information already exists. Please check your details.';
    }
    return 'We encountered a data issue. Please verify your input and try again.';
  }

  // Server internal errors
  if (lower.includes('internal server error') || lower.includes('status code 500')) {
    return 'The server encountered an unexpected condition. Please try again shortly.';
  }

  // Not found
  if (lower.includes('not found') || lower.includes('status code 404')) {
    return 'The requested information could not be found.';
  }

  // Rate limits
  if (lower.includes('too many requests') || lower.includes('rate limit') || lower.includes('status code 429')) {
    return 'Too many attempts. Please wait a few moments and try again.';
  }

  // File size / upload
  if (lower.includes('file size') || lower.includes('payload too large') || lower.includes('entity too large')) {
    return 'The uploaded file is too large. Please choose a smaller image (under 5MB).';
  }

  // If the message is already short, clean, and user-friendly, return it directly
  if (msg.length > 0 && msg.length < 150 && !msg.includes('at ') && !msg.includes('Error:')) {
    return msg;
  }

  return fallback;
}

/**
 * Handles errors uniformly:
 * 1. Logs the exact technical details to Developer Console.
 * 2. Displays a clean, sanitized toast message to the end user.
 */
export function handleAppError(error, options = {}) {
  const {
    context = 'General',
    fallback = 'Something went wrong. Please try again.',
    title = 'Action Failed',
    showToastNotification = true,
  } = options;

  // 1. Developer Console Logging:
  // Shows structured technical details for developers without leaking to the user UI
  if (typeof window !== 'undefined') {
    console.groupCollapsed(`%c[KaroDeal Error] %c${context}: ${error?.message || error || 'Unknown'}`, 'color: #ef4444; font-weight: bold;', 'color: #6b7280;');
    console.error('Diagnostic Details:', {
      context,
      rawError: error,
      status: error?.status || error?.statusCode,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
    console.groupEnd();
  }

  // 2. User-Facing Sanitization:
  const userFriendlyMessage = sanitizeErrorMessage(error, fallback);

  // 3. User Toast Notification:
  if (showToastNotification) {
    showToast.error(userFriendlyMessage, title);
  }

  return userFriendlyMessage;
}

export function showSuccessToast(message, title = 'Success') {
  showToast.success(message, title);
}

export function showErrorToast(message, title = 'Error') {
  showToast.error(sanitizeErrorMessage(message), title);
}

export default handleAppError;
