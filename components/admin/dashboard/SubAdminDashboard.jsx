'use client';
import Link from 'next/link';
import { 
  Package, MousePointerClick, 
  CheckCircle2, TrendingUp, ArrowUpRight, ShoppingBag, Tag, Star, Receipt, IndianRupee
} from 'lucide-react';

export default function SubAdminDashboard({ stats = {}, latestDeals = [] }) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Package className="w-3 h-3 text-white" /> Partner Dashboard
            </span>
            <span className="text-xs font-bold text-neutral-400">Deal Management & Clicks</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900">Partner Deal Center</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">Manage your deals and monitor shopper clicks in real-time.</p>
        </div>
      </div>

      {/* Sub-Admin Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* 1. My Live Products */}
        <Link href="/admin/products" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-neutral-900 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                My Products & Deals
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 mt-1 truncate">
                {stats.myDealsCount ?? 0}
              </div>
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Live on KaroDeal</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>

        {/* 2. My Product Clicks */}
        <Link href="/admin/clicks" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-blue-400 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                My Deals Clicks
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 mt-1 truncate">
                {stats.myClicksCount ?? 0}
              </div>
              <div className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>Shoppers directed to stores</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MousePointerClick className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>

        {/* 3. Total Billing */}
        <Link href="/admin/billing" className="block group">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3 group-hover:border-emerald-500 transition-all">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider truncate">
                Total Billing
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 mt-1 truncate" title={`₹${Number(stats.totalBilling || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                ₹{Number(stats.totalBilling || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2 truncate">
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>{stats.approvedClaimsCount || 0} approved claims</span>
              </div>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* Sub-Admin Activity & Actions Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Latest Deals Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div className="min-w-0">
              <h4 className="font-extrabold text-neutral-900 text-base sm:text-lg truncate">Latest Deals</h4>
              <p className="text-xs text-neutral-500 truncate">Newly added products and live offers</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-neutral-900 hover:text-[#f96b02] flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap"
            >
              View All <span className="hidden sm:inline">Deals</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestDeals && latestDeals.length > 0 ? (
            <>
              {/* DESKTOP & TABLET TABLE VIEW (screens >= 640px) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 text-xs uppercase tracking-wider">
                      <th className="pb-3 font-bold">Product Name</th>
                      <th className="pb-3 font-bold">Store</th>
                      <th className="pb-3 font-bold">Category</th>
                      <th className="pb-3 font-bold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {latestDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 font-semibold text-neutral-900 max-w-[220px] lg:max-w-[280px] truncate" title={deal.title}>
                          {deal.title}
                        </td>
                        <td className="py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <ShoppingBag className="w-3 h-3 shrink-0" />
                            {deal.storeRel?.name || 'Store'}
                          </span>
                        </td>
                        <td className="py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            <Tag className="w-3 h-3 text-neutral-400 shrink-0" />
                            {deal.categoryRel?.name || 'Category'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <div className="font-bold text-neutral-900 text-sm">₹{deal.salePrice}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (screens < 640px) */}
              <div className="block sm:hidden divide-y divide-neutral-100">
                {latestDeals.map((deal) => (
                  <div key={deal.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-neutral-900 text-sm line-clamp-2" title={deal.title}>
                        {deal.title}
                      </div>
                      <div className="font-black text-neutral-900 text-sm shrink-0 whitespace-nowrap">
                        ₹{deal.salePrice}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <ShoppingBag className="w-3 h-3 shrink-0" />
                        {deal.storeRel?.name || 'Store'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        <Tag className="w-3 h-3 text-neutral-400 shrink-0" />
                        {deal.categoryRel?.name || 'Category'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 sm:p-8 text-center bg-neutral-50 rounded-xl border border-neutral-100">
              <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-700">No deals added yet</p>
              <p className="text-xs text-neutral-500 mt-0.5">Your newly added deals will appear here without images.</p>
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-black text-white px-3.5 py-1.5 rounded-lg hover:bg-[#f96b02] transition-colors"
              >
                + Add First Deal
              </Link>
            </div>
          )}
        </div>

        {/* Quick Sub-Admin Actions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm flex flex-col justify-between gap-6">
          <div>
            <h4 className="font-extrabold text-neutral-900 text-base sm:text-lg mb-0.5">My Quick Actions</h4>
            <p className="text-xs text-neutral-500 mb-4 sm:mb-6">Shortcuts to manage your deals</p>

            <div className="space-y-2.5 sm:space-y-3">
              <Link
                href="/admin/products"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Manage My Deals</div>
                    <div className="text-xs text-neutral-500 truncate">Add, edit, or remove your deals</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/clicks"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Click Tracking</div>
                    <div className="text-xs text-neutral-500 truncate">See real-time deal clicks</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/billing"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 truncate">Billing & Orders</div>
                    <div className="text-xs text-neutral-500 truncate">View claims and invoices</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>

              <Link
                href="/admin/review-requests"
                className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
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
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-colors ml-2" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900 text-white">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">Account Access</div>
            <div className="text-xs sm:text-sm font-semibold text-white mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate">Product Partner Rights Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
