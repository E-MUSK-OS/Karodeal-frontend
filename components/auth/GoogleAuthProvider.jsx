'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthProvider({ children, clientId }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
