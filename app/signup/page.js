'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requireGoogleOtp, setRequireGoogleOtp] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const router = useRouter();

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    setInputCode(newOtpValues.join(''));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => !/^\d$/.test(char))) return;
    
    const newOtpValues = [...otpValues];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtpValues[i] = char;
    });
    setOtpValues(newOtpValues);
    setInputCode(newOtpValues.join(''));
    
    const nextIndex = Math.min(pastedData.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => {
      setError((prev) => (prev === msg ? '' : prev));
    }, 4000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Password validation: at least 1 uppercase, 1 lowercase, 1 number, 1 special character, min 8 chars
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      showError('Password must be at least 8 characters long and contain a capital letter, small letter, number, and special character.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Failed to send OTP');
        return;
      }

      setStep(2);
      setError('');
    } catch (err) {
      showError('Failed to connect to backend server');
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
          body: JSON.stringify({ credential: tokenResponse.access_token, isSignup: true }),
        });

        const data = await res.json();

        if (!res.ok) {
          showError(data.error || 'Google login failed');
          return;
        }

        if (data.requireOtp) {
          setVerifyEmail(data.email);
          setVerifyName(data.name);
          setRequireGoogleOtp(true);
          return;
        }

        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        window.dispatchEvent(new Event('auth-change'));

        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        router.push(returnUrl || '/');
      } catch (err) {
        showError('Failed to connect to backend server');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => showError('Google signup failed')
  });

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp: inputCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Failed to sign up');
        return;
      }

      // Save token and user data for session
      localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
      window.dispatchEvent(new Event('auth-change'));

      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push(returnUrl || '/');
    } catch (err) {
      showError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyGoogleOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/verify-google-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, otp: inputCode, name: verifyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Invalid OTP');
        return;
      }

      localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
      window.dispatchEvent(new Event('auth-change'));

      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push(returnUrl || '/');
    } catch (err) {
      showError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  if (requireGoogleOtp) {
    return (
      <div className="bg-white flex flex-col justify-center py-12 relative font-sans ">
        <div className="flex flex-col bg-neutral-50 sm:mx-auto sm:w-full sm:max-w-[400px] sm:h-auto sm:min-h-[450px] sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200 p-6 relative">
          <div className="flex items-center mb-6">
            <Button variant="none" size="none" onClick={() => { setRequireGoogleOtp(false); setInputCode(''); setOtpValues(['','','','','','']); }} className="p-1 -ml-1 text-black hover:bg-neutral-100 rounded-full transition-colors">
              <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
            </Button>
          </div>
          <div>
            <h2 className="font-extrabold text-black tracking-tight leading-tight">Verify Google Account</h2>
            <p className="mt-1.5 text-sm text-neutral-500">We sent a 6-digit OTP to {verifyEmail}</p>
          </div>
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerifyGoogleOtp}>
            {error && <div className="text-red-500 text-sm mb-4 font-medium">{error}</div>}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-digit OTP</label>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-black bg-transparent rounded-xl border-2 border-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <Button variant="none" size="none" type="submit" disabled={isLoading} className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col justify-center py-12 relative font-sans ">
      {/* Toast Notification */}
      {error && (
        <div className="fixed top-6 right-6 z-50 animate-slideInRight">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg max-w-sm flex items-start gap-3">
            <div className="text-sm text-red-700 font-medium leading-relaxed">
              {error}
            </div>
            <Button variant="none" size="none" onClick={() => setError('')} className="text-red-400 hover:text-red-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col bg-neutral-50 sm:mx-auto sm:w-full sm:max-w-[400px] sm:h-auto sm:min-h-[450px] sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200 p-6 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Button variant="none" size="none"
            onClick={() => {
              if (step === 2) {
                setStep(1);
                setInputCode('');
                setOtpValues(['','','','','','']);
                setError('');
              } else {
                router.back();
              }
            }}
            className="p-1 -ml-1 text-black hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </Button>
        </div>

        <div>
          <h2 className="font-extrabold text-black tracking-tight leading-tight">
            {step === 1 ? 'Sign up' : 'Verify Email'}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            {step === 1 ? 'Create an account to get started.' : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleSignup}>

            {/* Floating Label Input - Name */}
            <div className="relative mb-6">
              <input
                type="text"
                id="name"
                name="name"
                className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label
                htmlFor="name"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${name ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                Full Name
              </label>
            </div>

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
            <div className="relative mb-8">
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

            <div className="flex-1"></div>

            <div className="mb-6 flex justify-center w-full">
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-300 rounded-lg px-4 py-3.5 text-[15px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 absolute left-8" />
                <span>Sign up with Google</span>
              </button>
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-neutral-300"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-sm">Or sign up with email</span>
              <div className="flex-grow border-t border-neutral-300"></div>
            </div>

            {/* Terms and Bottom Button */}
            <div className="mt-auto">
              <p className="text-[13px] text-neutral-500 mb-5 leading-relaxed">
                By continuing, you agree to Tagdo's <Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">terms & conditions</Link> and <Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">privacy policy</Link>
              </p>

              <Button variant="none" size="none"
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Loading...' : 'Create Account'}
              </Button>
              <p className="text-sm text-center text-neutral-500 mt-4">
                Already have an account? <Link href="/login" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Login</Link>
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerify}>

            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter 6-digit OTP</label>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-black bg-transparent rounded-xl border-2 border-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="mt-auto">
              <Button variant="none" size="none"
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Verifying...' : 'Verify & Register'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
