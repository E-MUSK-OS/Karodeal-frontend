'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthProvider({ children, clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID }) {
  const validClientId =
    typeof clientId === 'string' &&
    clientId.trim().length > 0 &&
    !clientId.includes('your-google-client-id') &&
    !clientId.includes('your_client_id')
      ? clientId.trim()
      : null;

  if (!validClientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={validClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
