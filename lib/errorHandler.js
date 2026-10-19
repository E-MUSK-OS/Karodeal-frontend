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

  // Credentials & Login
  if (lower.includes('invalid email or password') || lower.includes('invalid credentials') || lower.includes('incorrect email or password')) {
    return 'The email address or password entered is incorrect. Please check your credentials or reset your password.';
  }

  // Current password mismatch
  if (lower.includes('current password is incorrect') || lower.includes('wrong current password')) {
    return 'The current password you entered does not match our records. Please try again.';
  }

  // Account / User Not Found
  if (lower.includes('user not found') || lower.includes('account not found') || lower.includes('no user found') || lower.includes('no account found')) {
    return 'No account was found with the provided email. Please verify your details or sign up.';
  }

  // Password rules & mismatches
  if (lower.includes('password must be at least') || lower.includes('password must contain') || lower.includes('weak password')) {
    return 'Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.';
  }
  if (lower.includes('password and confirm') || lower.includes('passwords do not match') || lower.includes('password mismatch')) {
    return 'The entered passwords do not match. Please ensure both passwords match.';
  }

  // OTP / Verification Code
  if (lower.includes('invalid otp') || lower.includes('otp expired') || lower.includes('invalid verification code') || lower.includes('verification code expired')) {
    return 'The verification code is incorrect or has expired. Please check your email or request a new code.';
  }

  // Wallet / Payouts
  if (lower.includes('insufficient balance') || lower.includes('insufficient available balance')) {
    return 'Your wallet does not have sufficient available balance for this withdrawal.';
  }
  if (lower.includes('minimum withdrawal')) {
    return 'The minimum withdrawal amount is ₹1000.';
  }

  // Session & Authentication
  if (
    lower.includes('jwt expired') ||
    lower.includes('token expired') ||
    lower.includes('invalid token') ||
    lower.includes('jwt malformed') ||
    lower.includes('unauthorized') ||
    lower.includes('auth token missing') ||
    lower.includes('session expired')
  ) {
    return 'Your login session has expired for your security. Please sign in again to continue.';
  }

  // Permissions & Access
  if (lower.includes('forbidden') || lower.includes('access denied') || lower.includes('not authorized') || lower.includes('administrator privileges')) {
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
    if (lower.includes('unique constraint') || lower.includes('already exists') || lower.includes('already registered') || lower.includes('p2002')) {
      return 'An account or record with this information already exists. Please check your details.';
    }
    return 'We encountered a data issue. Please verify your input and try again.';
  }

  // Server internal errors
  if (lower.includes('internal server error') || lower.includes('status code 500') || lower.includes('failed to create') || lower.includes('failed to update')) {
    return 'Our services experienced a temporary issue while processing your request. Please try again shortly.';
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
  const isStackTrace = /\bat\s+[A-Za-z0-9_$.<>]+\s+\(/i.test(msg) || msg.includes('\n    at ') || (msg.includes(' at ') && /:\d+:\d+/.test(msg));
  if (msg.length > 0 && msg.length < 300 && !isStackTrace && !msg.startsWith('TypeError:') && !msg.startsWith('ReferenceError:') && !msg.startsWith('SyntaxError:')) {
    return msg;
  }

  return fallback;
}

/**
 * Handles errors uniformly:
 * 1. Logs standardized technical details to Developer Console without triggering Turbopack overlays.
 * 2. Displays a clean, sanitized toast message to the end user explaining the reason clearly.
 */
export function handleAppError(error, options = {}) {
  const {
    context = 'General',
    fallback = 'Something went wrong. Please try again.',
    title = 'Action Failed',
    showToastNotification = true,
  } = options;

  // 1. User-Facing Sanitization:
  const userFriendlyMessage = sanitizeErrorMessage(error, fallback);

  // 2. Standardized Developer Console Logging:
  if (typeof window !== 'undefined') {
    const rawMsg = typeof error === 'string' ? error : (error?.message || error?.error || 'Unknown Error');
    console.groupCollapsed(`%c[KaroDeal Error] %c${context}: %c${rawMsg}`, 'color: #f96b02; font-weight: bold;', 'color: #ef4444; font-weight: bold;', 'color: #6b7280; font-weight: normal;');
    console.warn('Standard Error Record:', {
      context,
      rawError: error,
      userFriendlyMessage,
      status: error?.status || error?.statusCode,
      timestamp: new Date().toISOString(),
    });
    console.groupEnd();
  }

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
