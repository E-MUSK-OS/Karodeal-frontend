'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, ShoppingBag, Tag, IndianRupee, TrendingUp, Plus, ArrowUpRight, ShieldCheck, CheckCircle2, Clock 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 12,
    storesCount: 8,
    dealsCount: 24,
    pendingCashback: '₹4,250.00',
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    // Fetch users list from localStorage or fallback
    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      const parsedUsers = JSON.parse(usersStr);
      setRecentUsers(parsedUsers.slice(-5).reverse());
      setStats((prev) => ({
        ...prev,
        usersCount: Math.max(parsedUsers.length, 12),
      }));
    } else {
      setRecentUsers([
        { name: 'Elon Musk', email: '2383elonmusk@gmail.com', date: 'Today' },
        { name: 'Rahul Sharma', email: 'rahul.s@example.com', date: 'Yesterday' },
        { name: 'Priya Patel', email: 'priya.p@example.com', date: '2 days ago' },
      ]);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Overview</span>
          <h3 className="text-2xl font-extrabold text-neutral-900 mt-0.5">Admin Dashboard</h3>
          <p className="text-sm text-neutral-500">Welcome to the Tagdo Dealora Admin Portal.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/stores"
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Store
          </Link>
          <Link
            href="/admin/deals"
            className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.usersCount}</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              +14% this week
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
            <Users className="w-6 h-6" />
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
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Deals</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.dealsCount}</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live coupons & offers
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Cashback</div>
            <div className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.pendingCashback}</div>
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
              <h4 className="text-lg font-bold text-neutral-900">Recent User Registrations</h4>
              <p className="text-xs text-neutral-500">Newly registered shoppers on Tagdo</p>
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
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Quick Admin Actions</h4>
            <p className="text-xs text-neutral-500 mb-6">Shortcuts to manage site content</p>

            <div className="space-y-3">
              <Link
                href="/admin/stores"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Manage Stores</div>
                    <div className="text-xs text-neutral-500">Add or edit store cashback rates</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </Link>

              <Link
                href="/admin/categories"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Categories</div>
                    <div className="text-xs text-neutral-500">Organize category mappings</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </Link>

              <Link
                href="/admin/deals"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Deals & Coupons</div>
                    <div className="text-xs text-neutral-500">Publish store offers & promo codes</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
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
