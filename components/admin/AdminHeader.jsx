'use client';
import { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, ShieldCheck, ExternalLink, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

export default function AdminHeader({ onMenuClick }) {
  const [adminUser, setAdminUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const syncUser = () => {
      const adminStr = localStorage.getItem('adminUser');
      if (adminStr) {
        setAdminUser(JSON.parse(adminStr));
      }
    };
    syncUser();
    window.addEventListener('admin-auth-change', syncUser);
    return () => window.removeEventListener('admin-auth-change', syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.dispatchEvent(new Event('admin-auth-change'));
    router.push('/admin/login');
  };

  const isSubAdmin = adminUser?.role === 'SUB_ADMIN';

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 w-full">
      <div className="flex items-center md:hidden">
        <Button variant="none" size="none" 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-neutral-600 hover:text-[#f96b02] focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Spacer for desktop to push right controls */}
      <div className="hidden md:block"></div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-[#f96b02] bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Store
        </Link>

        {/* Admin Badge */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm ${
            isSubAdmin ? 'bg-amber-600' : 'bg-neutral-900'
          }`}>
            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 leading-none">
                {adminUser?.name || 'Administrator'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isSubAdmin 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
              }`}>
                {isSubAdmin ? 'Sub-Admin' : 'Main Admin'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 font-semibold leading-none mt-1">
              {adminUser?.email || ''}
            </div>
          </div>
          <Button variant="none" size="none"
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
