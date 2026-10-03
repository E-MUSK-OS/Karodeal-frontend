'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className="bg-white flex flex-col justify-center py-12 relative font-sans ">
      <div className="flex flex-col bg-neutral-50 sm:mx-auto sm:w-full sm:max-w-[400px] sm:h-auto sm:min-h-[450px] sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200 p-6 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-black hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-black tracking-tight leading-tight">
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
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-end mb-6">
            <Link href="/login/forgot-password" className="text-sm font-medium text-black hover:underline">
              Forgot password?
            </Link>
          </div>
          {/* Terms and Bottom Button */}
          <div className="mt-auto">
            <p className="text-[13px] text-neutral-500 mb-5 leading-relaxed">
              By continuing, you agree to Tagdo's <Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">terms & conditions</Link> and <Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">privacy policy</Link>
            </p>

            <button
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
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
            <p className="text-sm text-center text-neutral-500 mt-4">
              Don't have an account? <Link href="/signup" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
