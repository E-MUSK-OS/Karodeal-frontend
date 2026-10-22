'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/verify-admin`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminUser.token}` },
            cache: 'no-store'
          });

          if (res.ok) {
            const data = await res.json();
            const currentRole = data.role || adminUser.role || 'ADMIN';
            let updated = false;

            if (data.role && adminUser.role !== data.role) {
              adminUser.role = data.role;
              updated = true;
            }

            if (data.permissions !== undefined) {
              adminUser.permissions = data.permissions;
              updated = true;
            }

            if (updated) {
              localStorage.setItem('adminUser', JSON.stringify(adminUser));
            }

            // Protect pages for Sub-Admins based on allowed modules
            if (currentRole === 'SUB_ADMIN') {
              // Users management is strictly Main Admin only
              if (pathname.startsWith('/admin/users')) {
                router.replace('/admin/dashboard');
                return;
              }

              const defaultModules = ['dashboard', 'products', 'billing', 'review-requests', 'clicks'];
              const allowedModules = (data.permissions?.allowedModules || adminUser.permissions?.allowedModules || defaultModules);

              const MODULE_PREFIX_MAP = {
                'dashboard': '/admin/dashboard',
                'products': '/admin/products',
                'billing': '/admin/billing',
                'review-requests': '/admin/review-requests',
                'clicks': '/admin/clicks',
                'stores': '/admin/stores',
                'categories': '/admin/categories',
                'claims': '/admin/claims',
                'missing-cashback': '/admin/missing-cashback',
                'visitor-analytics': '/admin/visitor-analytics',
                'subscribers': '/admin/subscribers',
                'seller-requests': '/admin/seller-requests',
                'messages': '/admin/messages',
                'payouts': '/admin/payouts',
              };

              const matchedEntry = Object.entries(MODULE_PREFIX_MAP).find(([, prefix]) => 
                pathname === prefix || pathname.startsWith(`${prefix}/`)
              );

              if (matchedEntry && !allowedModules.includes(matchedEntry[0])) {
                router.replace('/admin/dashboard');
                return;
              }
            }

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
    <div className="h-screen bg-neutral-100 text-neutral-900 flex font-sans relative overflow-hidden">
      <AdminSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-7 overflow-y-auto min-w-0 [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent]">
          {children}
        </main>
      </div>
    </div>
  );
}
