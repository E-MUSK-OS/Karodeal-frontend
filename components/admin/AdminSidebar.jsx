'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Tag, Users, Settings, LogOut, Package, IndianRupee, Ticket, X 
} from 'lucide-react';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.dispatchEvent(new Event('admin-auth-change'));
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Payout Requests', href: '/admin/payouts', icon: IndianRupee },
    { name: 'Products & Cards', href: '/admin/products', icon: Package },
    { name: 'Stores', href: '/admin/stores', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Cashback Claims', href: '/admin/claims', icon: Ticket },
    { name: 'Missing Cashback', href: '/admin/missing-cashback', icon: Ticket },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

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
              <span className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Admin Control</span>
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
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-3 mb-2">
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
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Footer / Logout */}
      <div className="p-4 border-t border-neutral-800 mt-auto">
        <Button variant="none" size="none"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span>Logout Admin</span>
        </Button>
      </div>
    </aside>
    </>
  );
}
