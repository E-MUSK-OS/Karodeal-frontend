'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="bg-white flex flex-col justify-center py-12 relative font-sans ">
      {/* Toast Notification */}
      {error && (
        <div className="fixed top-6 right-6 z-50 animate-slideInRight">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg max-w-sm flex items-start gap-3">
            <div className="text-sm text-red-700 font-medium leading-relaxed">
              {error}
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col bg-neutral-50 sm:mx-auto sm:w-full sm:max-w-[400px] sm:h-auto sm:min-h-[450px] sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200 p-6 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
                setInputCode('');
                setError('');
              } else {
                router.back();
              }
            }}
            className="p-1 -ml-1 text-black hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-black tracking-tight leading-tight">
            {step === 1 ? 'Sign up' : 'Verify Email'}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            {step === 1 ? 'Create an account to get started.' : `We've sent a 4-digit code to ${email}`}
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
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex-1"></div>

            {/* Terms and Bottom Button */}
            <div className="mt-auto">
              <p className="text-[13px] text-neutral-500 mb-5 leading-relaxed">
                By continuing, you agree to Tagdo's <Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">terms & conditions</Link> and <Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">privacy policy</Link>
              </p>

              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg"
              >
                Create Account
              </button>
              <p className="text-sm text-center text-neutral-500 mt-4">
                Already have an account? <Link href="/login" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Login</Link>
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerify}>

            {/* OTP Input */}
            <div className="relative mb-8">
              <input
                type="text"
                id="code"
                name="code"
                maxLength={4}
                className="block px-4 pb-3.5 pt-4 w-full text-center text-2xl tracking-[0.5em] text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                required
              />
              <label
                htmlFor="code"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 ${inputCode ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                4-Digit Code
              </label>
            </div>

            <div className="flex-1"></div>

            <div className="mt-auto">
              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg"
              >
                Verify & Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
