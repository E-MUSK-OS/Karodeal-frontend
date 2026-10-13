'use client';
import Link from 'next/link';
import { 
  Package, MousePointerClick, 
  CheckCircle2, TrendingUp, ArrowUpRight, ShoppingBag, Tag
} from 'lucide-react';

export default function SubAdminDashboard({ stats = {}, latestDeals = [] }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900">Admin</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your deals and monitor shopper clicks in real-time.</p>
        </div>
      </div>

      {/* Sub-Admin Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 1. My Live Products */}
        <Link href="/admin/products" className="block group">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between group-hover:border-neutral-900 transition-all">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">My Products & Deals</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">{stats.myDealsCount ?? 0}</div>
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live on KaroDeal
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* 2. My Product Clicks */}
        <Link href="/admin/clicks" className="block group">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between group-hover:border-blue-400 transition-all">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">My Deals Clicks</div>
              <div className="text-2xl font-black text-neutral-900 mt-1">{stats.myClicksCount ?? 0}</div>
              <div className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Shoppers directed to stores
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MousePointerClick className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* Sub-Admin Activity & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Deals Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-neutral-900">Latest Deals</h4>
              <p className="text-xs text-neutral-500">Newly added products and live offers</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-neutral-900 hover:text-[#f96b02] flex items-center gap-1 transition-colors"
            >
              View All Deals <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestDeals && latestDeals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
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
                      <td className="py-3.5 font-semibold text-neutral-900 max-w-[260px] truncate" title={deal.title}>
                        {deal.title}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          <ShoppingBag className="w-3 h-3" />
                          {deal.storeRel?.name || 'Store'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          <Tag className="w-3 h-3 text-neutral-400" />
                          {deal.categoryRel?.name || 'Category'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="font-bold text-neutral-900 text-sm">₹{deal.salePrice}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-100">
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
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-neutral-900 mb-1">My Quick Actions</h4>
            <p className="text-xs text-neutral-500 mb-6">Shortcuts to manage your deals</p>

            <div className="space-y-3">
              <Link
                href="/admin/products"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neutral-700 group-hover:text-black" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Manage My Deals</div>
                    <div className="text-xs text-neutral-500">Add, edit, or remove your deals</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </Link>

              <Link
                href="/admin/clicks"
                className="p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <MousePointerClick className="w-5 h-5 text-neutral-700 group-hover:text-black" />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Click Tracking</div>
                    <div className="text-xs text-neutral-500">See real-time deal clicks</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-neutral-900 text-white">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Account Access</div>
            <div className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Product Partner Rights Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
