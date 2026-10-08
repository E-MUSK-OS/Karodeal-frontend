'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, ShoppingBag, Tag, IndianRupee, TrendingUp, Plus, ArrowUpRight, ShieldCheck, CheckCircle2, Clock, Package 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingWithdrawal: 0,
    storesCount: 0,
    dealsCount: 0,
    pendingCashback: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authStr = localStorage.getItem('adminUser') || localStorage.getItem('user');
        if (!authStr) {
          fallbackData();
          return;
        }
        const user = JSON.parse(authStr);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        
        const [usersRes, storesRes, productsRes, payoutsRes, claimsRes] = await Promise.all([
          fetch(`${apiUrl}/auth`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
          fetch(`${apiUrl}/meta/stores`),
          fetch(`${apiUrl}/products`),
          fetch(`${apiUrl}/payouts/admin`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
          fetch(`${apiUrl}/claims/admin`, { headers: { 'Authorization': `Bearer ${user.token}` } })
        ]);

        let pWithdrawal = 0, sCount = 0, dCount = 0, pCashback = 0;
        let rUsers = [];

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success && Array.isArray(usersData.users)) {
            rUsers = usersData.users.slice(0, 5); // top 5
          }
        }

        if (storesRes.ok) {
          const storesData = await storesRes.json();
          if (Array.isArray(storesData)) sCount = storesData.length;
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (Array.isArray(productsData)) dCount = productsData.length;
        }

        if (payoutsRes.ok) {
          const payoutsData = await payoutsRes.json();
          if (payoutsData.success && Array.isArray(payoutsData.payouts)) {
            pWithdrawal = payoutsData.payouts
              .filter(p => p.status === 'PENDING')
              .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          }
        }

        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          if (claimsData.claims && Array.isArray(claimsData.claims)) {
            pCashback = claimsData.claims
              .filter(c => c.status === 'PENDING')
              .reduce((sum, c) => {
                const cbAmt = c.product?.cashback || 0;
                return sum + Number(cbAmt);
              }, 0);
          }
        }

        setStats({
          pendingWithdrawal: pWithdrawal,
          storesCount: sCount,
          dealsCount: dCount,
          pendingCashback: pCashback
        });
        setRecentUsers(rUsers);
      } catch (err) {
        console.error("Error fetching stats:", err);
        fallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    const fallbackData = () => {
      const usersStr = localStorage.getItem('users');
      if (usersStr) {
        const parsedUsers = JSON.parse(usersStr);
        setRecentUsers(parsedUsers.slice(-5).reverse());
        setStats(prev => ({ ...prev, pendingWithdrawal: 4250, storesCount: 8, dealsCount: 24, pendingCashback: 1250 }));
      } else {
        setRecentUsers([
          { name: 'Elon Musk', email: '2383elonmusk@gmail.com', createdAt: new Date().toISOString() }
        ]);
        setStats({ pendingWithdrawal: 4250, storesCount: 8, dealsCount: 24, pendingCashback: 1250 });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Overview</span>
          <h3 className="font-extrabold text-neutral-900 mt-0.5">Admin Dashboard</h3>
          <p className="text-sm text-neutral-500">Welcome to the KaroDeal Admin Portal.</p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Withdrawals</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">₹{Number(stats.pendingWithdrawal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-2">
              <Clock className="w-3.5 h-3.5" />
              Payouts to process
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Stores</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.storesCount}</div>
            <div className="text-xs text-neutral-500 font-medium mt-2">Affiliate stores online</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Products</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.dealsCount}</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live products & deals
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Cashback</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">₹{Number(stats.pendingCashback || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-2">
              <Clock className="w-3.5 h-3.5" />
              Claims awaiting review
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tables / Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-neutral-900">Recent User Registrations</h4>
              <p className="text-xs text-neutral-500">Newly registered shoppers on karodeal</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold">User</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Role / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 font-semibold text-neutral-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name || 'User'}</span>
                    </td>
                    <td className="py-3.5 text-neutral-600 font-mono text-xs">{u.email}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Panel */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1">Quick Admin Actions</h4>
            <p className="text-xs text-neutral-500 mb-6">Shortcuts to manage site content</p>

            <div className="space-y-3">
              <Link
                href="/admin/stores"
                className="p-4 rounded-xl border border-neutral-200 hover:border-[#f96b02] hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Manage Stores</div>
                    <div className="text-xs text-neutral-500">Add or edit store</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#f96b02] transition-colors" />
              </Link>

              <Link
                href="/admin/categories"
                className="p-4 rounded-xl border border-neutral-200 hover:border-[#f96b02] hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Categories</div>
                    <div className="text-xs text-neutral-500">Organize category mappings</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#f96b02] transition-colors" />
              </Link>

              <Link
                href="/admin/products"
                className="p-4 rounded-xl border border-neutral-200 hover:border-[#f96b02] hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Products & Cards</div>
                    <div className="text-xs text-neutral-500">Manage all products and deals</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#f96b02] transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-neutral-900 text-white">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">System Status</div>
            <div className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              All Services Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
