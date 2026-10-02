'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminStr = localStorage.getItem('adminUser');
      if (adminStr) {
        try {
          const adminUser = JSON.parse(adminStr);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-admin`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminUser.token}` },
            cache: 'no-store'
          });
          
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            // Token is invalid or user is no longer an admin
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
            if (!isLoginPage) {
              router.push('/admin/login');
            }
          }
        } catch (err) {
          console.error("Auth check failed", err);
          setIsAuthenticated(false);
          if (!isLoginPage) router.push('/admin/login');
        }
      } else {
        setIsAuthenticated(false);
        if (!isLoginPage) {
          router.push('/admin/login');
        }
      }
      setLoading(false);
    };

    checkAdminAuth();
    window.addEventListener('admin-auth-change', checkAdminAuth);
    return () => window.removeEventListener('admin-auth-change', checkAdminAuth);
  }, [router, isLoginPage, pathname]);

  // If on login page, render standalone login layout
  if (isLoginPage) {
    return <div className="min-h-screen bg-neutral-50 font-sans">{children}</div>;
  }

  // Show loading state while verifying auth
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-neutral-400">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex font-sans relative">
      <AdminSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
