'use client';
import Link from 'next/link';
import { 
  ShieldCheck, IndianRupee, Clock, Users, CheckCircle2, 
  Package, MousePointerClick, TrendingUp, ShoppingBag, Tag, ArrowUpRight 
} from 'lucide-react';

export default function MainAdminDashboard({ stats = {}, recentUsers = [] }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Super Admin
            </span>
            <span className="text-xs font-bold text-neutral-400">Master Platform Overview</span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900">Platform Master Dashboard</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Global analytics, financial withdrawals, store management, and user controls.</p>
        </div>
      </div>

      {/* Main Admin Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Pending Withdrawals */}
        <Link href="/admin/payouts" className="block group">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between group-hover:border-rose-400 transition-all">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pending Withdrawals</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">₹{Number(stats.pendingWithdrawal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-2">
                <Clock className="w-3.5 h-3.5" />
                {stats.pendingWithdrawalsCount || 0} payout requests pending
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* 2. Total Stores */}
        <Link href="/admin/stores" className="block group">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between group-hover:border-neutral-900 transition-all">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Stores</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">{stats.storesCount ?? 0}</div>
              <div className="text-xs text-neutral-500 font-bold flex items-center gap-1 mt-2">
                <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
                Active affiliate stores
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* 3. Total Products */}
        <Link href="/admin/products" className="block group">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between group-hover:border-emerald-400 transition-all">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Products</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">{stats.dealsCount ?? 0}</div>
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live deals on platform
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* 4. Claim Cashback (Sum of product cashback in pending claims) */}
        <Link href="/admin/claims" className="block group">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between group-hover:border-amber-400 transition-all">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pending Claim Cashback</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">₹{Number(stats.pendingCashback || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-2">
                <Clock className="w-3.5 h-3.5" />
                {stats.pendingClaimsCount || 0} claims awaiting review
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Admin Activity & Shortcuts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-neutral-900">Recent User Registrations</h4>
              <p className="text-xs text-neutral-500">Newly registered shoppers and partners</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-neutral-900 hover:text-[#f96b02] flex items-center gap-1 transition-colors"
            >
              View All Users <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold">User</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentUsers && recentUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 font-semibold text-neutral-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name || 'User'}</span>
                    </td>
                    <td className="py-3.5 text-neutral-600 font-mono text-xs">{u.email}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-black text-white' :
                        u.role === 'SUB_ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-neutral-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-neutral-900 mb-1">Super Admin Controls</h4>
            <p className="text-xs text-neutral-500 mb-6">Manage global store and payout operations</p>

            <div className="space-y-3">
              <Link
                href="/admin/payouts"
                className="p-4 rounded-xl border border-neutral-200 hover:border-rose-500 hover:bg-rose-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-5 h-5 text-rose-600" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Payout Requests</div>
                    <div className="text-xs text-neutral-500">Approve user withdrawals</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-rose-600 transition-colors" />
              </Link>

              <Link
                href="/admin/stores"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Manage Stores</div>
                    <div className="text-xs text-neutral-500">Add or edit affiliate stores</div>
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
                href="/admin/users"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-neutral-700" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">User Management</div>
                    <div className="text-xs text-neutral-500">Roles, passwords, and access</div>
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
              All Core Microservices Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
