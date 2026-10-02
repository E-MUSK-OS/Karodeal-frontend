'use client';
import { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, ShieldCheck, ExternalLink, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminHeader({ onMenuClick }) {
  const [adminUser, setAdminUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const adminStr = localStorage.getItem('adminUser');
    if (adminStr) {
      setAdminUser(JSON.parse(adminStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.dispatchEvent(new Event('admin-auth-change'));
    router.push('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 w-full">
      {/* Mobile Menu Button */}
      <div className="flex items-center md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-neutral-600 hover:text-black focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Spacer for desktop to push right controls */}
      <div className="hidden md:block"></div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Store
        </Link>



        {/* Admin Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-neutral-900 leading-none mb-0.5">
              {adminUser?.name || 'Admin Manager'}
            </div>
            <div className="text-[10px] text-neutral-500 font-semibold leading-none">
              {adminUser?.email || 'admin@tagdo.com'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
