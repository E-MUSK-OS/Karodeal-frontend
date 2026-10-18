'use client';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '@/components/common/Button';
import { handleAppError } from '@/lib/errorHandler';

function ActiveGoogleLoginButton({
  text,
  onSuccess,
  onError,
  disabled,
  className,
  icon,
  ...props
}) {
  const login = useGoogleLogin({
    onSuccess,
    onError: (err) => {
      if (onError) {
        onError(err);
      } else {
        handleAppError(err, {
          context: 'Google OAuth Dialog',
          title: 'Sign In Cancelled',
          fallback: 'Google sign in was cancelled or failed.'
        });
      }
    }
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      fullWidth
      onClick={() => login()}
      disabled={disabled}
      icon={icon}
      className={className || 'gap-3'}
      {...props}
    >
      {text}
    </Button>
  );
}

export default function GoogleAuthButton({
  text = 'Continue with Google',
  onSuccess,
  onError,
  disabled = false,
  className = 'gap-3',
  icon = <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 shrink-0" />,
  ...props
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured =
    typeof clientId === 'string' &&
    clientId.trim().length > 0 &&
    !clientId.includes('your-google-client-id') &&
    !clientId.includes('your_client_id');

  if (!isConfigured) {
    return (
      <Button
        type="button"
        variant="outline"
        size="md"
        fullWidth
        onClick={() => {
          handleAppError(
            'Google Sign-In is not configured yet. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.',
            {
              context: 'Google Sign In',
              title: 'Google Sign-In Unavailable',
              fallback: 'Google Sign-In is not configured yet. Please sign in using your email and password.'
            }
          );
        }}
        disabled={disabled}
        icon={icon}
        className={className || 'gap-3'}
        {...props}
      >
        {text}
      </Button>
    );
  }

  return (
    <ActiveGoogleLoginButton
      text={text}
      onSuccess={onSuccess}
      onError={onError}
      disabled={disabled}
      className={className}
      icon={icon}
      {...props}
    />
  );
}

