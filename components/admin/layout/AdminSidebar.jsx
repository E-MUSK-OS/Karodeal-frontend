'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Users, LogOut, Package, IndianRupee, Ticket, X, MousePointerClick, Mail, MessageSquare, Star, Receipt, Store, Activity
} from 'lucide-react';
import { getSocket } from '@/lib/socket';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [pendingStarCount, setPendingStarCount] = useState(0);

  useEffect(() => {
    const updateRole = () => {
      try {
        const adminStr = localStorage.getItem('adminUser');
        if (adminStr) {
          const user = JSON.parse(adminStr);
          setRole(user.role || 'ADMIN');
        }
      } catch (e) {
        setRole(null);
      }
    };

    updateRole();
    window.addEventListener('admin-auth-change', updateRole);
    return () => window.removeEventListener('admin-auth-change', updateRole);
  }, []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const adminStr = localStorage.getItem('adminUser');
        if (!adminStr) return;
        const user = JSON.parse(adminStr);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        const res = await fetch(`${apiUrl}/review-requests?status=PENDING`, {
          headers: { Authorization: `Bearer ${user.token}` },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setPendingStarCount(data?.counts?.pending || 0);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchPendingCount();

    const socket = getSocket();
    if (socket) {
      socket.on('star_requests:changed', fetchPendingCount);
    }

    const handleCustomChange = () => fetchPendingCount();
    window.addEventListener('karodeal:star_requests_changed', handleCustomChange);

    return () => {
      if (socket) socket.off('star_requests:changed', fetchPendingCount);
      window.removeEventListener('karodeal:star_requests_changed', handleCustomChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.dispatchEvent(new Event('admin-auth-change'));
    router.push('/admin/login');
  };

  const allNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Visitor Analytics', href: '/admin/visitor-analytics', icon: Activity },
    { name: 'Payout Requests', href: '/admin/payouts', icon: IndianRupee },
    { name: 'Products & Cards', href: '/admin/products', icon: Package },
    { name: 'Billing', href: '/admin/billing', icon: Receipt },
    { name: 'Review Requests', href: '/admin/review-requests', icon: Star },
    { name: 'Stores', href: '/admin/stores', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Cashback Claims', href: '/admin/claims', icon: Ticket },
    { name: 'Missing Cashback', href: '/admin/missing-cashback', icon: Ticket },
    { name: 'Click Tracking', href: '/admin/clicks', icon: MousePointerClick },
    { name: 'Subscribers', href: '/admin/subscribers', icon: Mail },
    { name: 'Seller Requests', href: '/admin/seller-requests', icon: Store },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  ];

  // Sub-admin can see: Products & Cards, Billing, Review Requests, Click Tracking (plus Dashboard)
  const subAdminAllowedHrefs = [
    '/admin/dashboard',
    '/admin/products',
    '/admin/billing',
    '/admin/review-requests',
    '/admin/clicks'
  ];

  const navItems = role === 'SUB_ADMIN'
    ? allNavItems.filter((item) => subAdminAllowedHrefs.includes(item.href))
    : allNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-neutral-900 text-white flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="KaroDeal Admin Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                role === 'SUB_ADMIN' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-neutral-100 text-neutral-700'
              }`}>
                {role === 'SUB_ADMIN' ? 'Sub-Admin' : 'Main Admin'}
              </span>
            </div>
          </div>
          
          <Button variant="none" size="none" 
            className="md:hidden text-neutral-500 hover:text-[#f96b02]"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-3.5 space-y-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#262626_transparent]">
          <div className="text-[11px] font-black text-neutral-400 uppercase tracking-wider px-3.5 py-1 mb-1">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all ${
                  isActive
                    ? 'bg-white text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80 font-medium'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.href === '/admin/review-requests' && pendingStarCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full shrink-0">
                    {pendingStarCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Footer / Logout */}
        <div className="p-3.5 border-t border-neutral-800 mt-auto shrink-0">
          <Button variant="none" size="none"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            <span>Logout Admin</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
