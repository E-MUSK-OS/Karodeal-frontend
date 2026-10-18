'use client';
import Link from 'next/link';
import { 
  ShieldCheck, IndianRupee, Clock, Users, CheckCircle2, 
  Package, MousePointerClick, TrendingUp, ShoppingBag, Tag, ArrowUpRight, Star 
} from 'lucide-react';

export default function MainAdminDashboard({ stats = {}, recentUsers = [] }) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Super Admin
            </span>
            <span className="text-xs font-bold text-neutral-400">Master Platform Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900">Platform Master Dashboard</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">Global analytics, financial withdrawals, store management, and user controls.</p>
        </div>
      </div>

      {/* Main Admin Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        {/* 1. Pending Withdrawals */}
        <Link href="/admin/payouts" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-rose-400 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                Pending Withdrawals
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 truncate" title={`₹${Number(stats.pendingWithdrawal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                ₹{Number(stats.pendingWithdrawal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-2 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{stats.pendingWithdrawalsCount || 0} payout requests pending</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>

        {/* 2. Total Stores */}
        <Link href="/admin/stores" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-neutral-900 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                Total Stores
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 truncate">
                {stats.storesCount ?? 0}
              </div>
              <div className="text-xs text-neutral-500 font-bold flex items-center gap-1 mt-2 truncate">
                <ShoppingBag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Active affiliate stores</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>

        {/* 3. Total Products */}
        <Link href="/admin/products" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-emerald-400 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                Total Products
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 truncate">
                {stats.dealsCount ?? 0}
              </div>
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Live deals on platform</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>

        {/* 4. Claim Cashback */}
        <Link href="/admin/claims" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-amber-400 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                Pending Claim Cashback
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 truncate" title={`₹${Number(stats.pendingCashback || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                ₹{Number(stats.pendingCashback || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-2 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{stats.pendingClaimsCount || 0} claims awaiting review</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Admin Activity & Shortcuts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Users Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div className="min-w-0">
              <h4 className="font-extrabold text-neutral-900 text-base sm:text-lg truncate">Recent User Registrations</h4>
              <p className="text-xs text-neutral-500 truncate">Newly registered shoppers and partners</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-neutral-900 hover:text-[#f96b02] flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
            >
              View All <span className="hidden sm:inline">Users</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUsers && recentUsers.length > 0 ? (
            <>
              {/* DESKTOP & TABLET TABLE VIEW (screens >= 640px) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 text-xs uppercase tracking-wider">
                      <th className="pb-3 font-bold">User</th>
                      <th className="pb-3 font-bold">Email</th>
                      <th className="pb-3 font-bold">Role</th>
                      <th className="pb-3 font-bold text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {recentUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 font-semibold text-neutral-900">
                          <div className="flex items-center gap-2.5 max-w-[200px] truncate">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <span className="truncate" title={u.name || 'User'}>{u.name || 'User'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-neutral-600 font-mono text-xs whitespace-nowrap">{u.email}</td>
                        <td className="py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'ADMIN' ? 'bg-black text-white' :
                            u.role === 'SUB_ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-neutral-400 text-xs text-right whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (screens < 640px) */}
              <div className="block sm:hidden divide-y divide-neutral-100">
                {recentUsers.map((u, i) => (
                  <div key={i} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-neutral-900 text-sm truncate">{u.name || 'User'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        u.role === 'ADMIN' ? 'bg-black text-white' :
                        u.role === 'SUB_ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-mono gap-2">
                      <span className="truncate">{u.email}</span>
                      <span className="text-neutral-400 font-sans shrink-0">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 sm:p-8 text-center bg-neutral-50 rounded-xl border border-neutral-100">
              <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-700">No registered users yet</p>
              <p className="text-xs text-neutral-500 mt-0.5">New users and shoppers will be listed here.</p>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-black text-white px-3.5 py-1.5 rounded-lg hover:bg-[#f96b02] transition-colors"
              >
                Manage Users
              </Link>
            </div>
          )}
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm flex flex-col justify-between gap-6">
          <div>
            <h4 className="font-extrabold text-neutral-900 text-base sm:text-lg mb-0.5">Super Admin Controls</h4>
            <p className="text-xs text-neutral-500 mb-4 sm:mb-6">Manage global store and payout operations</p>

            <div className="space-y-2.5 sm:space-y-3">
              <Link
                href="/admin/payouts"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-rose-500 hover:bg-rose-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Payout Requests</div>
                    <div className="text-xs text-neutral-500 truncate">Approve user withdrawals</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-rose-600 shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/stores"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Manage Stores</div>
                    <div className="text-xs text-neutral-500 truncate">Add or edit affiliate stores</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/categories"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Categories</div>
                    <div className="text-xs text-neutral-500 truncate">Organize category mappings</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/review-requests"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Review Requests</div>
                    <div className="text-xs text-neutral-500 truncate">Manage 5-star boost claims</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-600 shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/users"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">User Management</div>
                    <div className="text-xs text-neutral-500 truncate">Roles, passwords, and access</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900 text-white">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">System Status</div>
            <div className="text-xs sm:text-sm font-semibold text-white mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate">All Core Microservices Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
