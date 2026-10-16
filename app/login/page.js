'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && u.token) {
          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('returnUrl');
          router.push(returnUrl || '/');
          return;
        }
      } catch {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
      }
    }

    // Silently pre-warm serverless backend and Neon DB so user doesn't hit cold-start lag
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    fetch(`${apiUrl}/health`).catch(() => { });
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const formEmail = e.target.email.value;
    const formPassword = e.target.password.value;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formEmail, password: formPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }

      localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
      window.dispatchEvent(new Event('auth-change'));

      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push(returnUrl || '/');
    } catch (err) {
      setError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: tokenResponse.access_token, isSignup: false }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Google login failed');
          return;
        }

        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        window.dispatchEvent(new Event('auth-change'));

        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        router.push(returnUrl || '/');
      } catch (err) {
        setError('Failed to connect to backend server');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google login failed')
  });

  return (
    <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 relative font-sans">
      <div className="flex flex-col bg-neutral-50 w-full max-w-[420px] rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-7 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="p-2 -ml-2 text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-full transition-colors inline-flex items-center justify-center cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </Link>
        </div>

        <div>
          <h2 className="font-extrabold text-black tracking-tight leading-tight">
            Login
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="mt-8 flex flex-col flex-1" onSubmit={handleLogin}>

          {error && <div className="text-red-500 text-sm mb-4 font-medium">{error}</div>}

          {/* Floating Label Input - Email */}
          <div className="relative mb-6">
            <input
              type="email"
              id="email"
              name="email"
              className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label
              htmlFor="email"
              className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${email ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
            >
              Email address
            </label>
          </div>

          {/* Floating Label Input - Password */}
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer pr-12 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label
              htmlFor="password"
              className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${password ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
            >
              Password
            </label>
            <Button variant="none" size="none"
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex justify-end mb-6">
            <Link href="/login/forgot-password" className="text-sm font-medium text-black hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="mb-6 flex justify-center w-full">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={() => loginWithGoogle()}
              icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 shrink-0" />}
              className="gap-3"
            >
              Continue with Google
            </Button>
          </div>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-neutral-300"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-400 text-sm">Or log in with email</span>
            <div className="flex-grow border-t border-neutral-300"></div>
          </div>

          {/* Terms and Bottom Button */}
          <div className="mt-auto">
            <p className="text-[13px] text-neutral-500 mb-5 leading-relaxed">
              By continuing, you agree to Karodeal&apos;s <Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">terms & conditions</Link> and <Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">privacy policy</Link>
            </p>

            <Button
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              type="submit"
            >
              Continue
            </Button>
            <p className="text-sm text-center text-neutral-500 mt-4">
              Don&apos;t have an account? <Link href="/signup" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
