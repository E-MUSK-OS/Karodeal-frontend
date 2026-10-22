'use client';
import { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Sliders, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  CheckCheck, 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Star, 
  ShoppingBag, 
  FolderTree, 
  MousePointerClick, 
  Ticket, 
  Activity, 
  Mail, 
  Store, 
  MessageSquare, 
  IndianRupee, 
  Loader2, 
  AlertCircle,
  Users
} from 'lucide-react';
import Button from '@/components/common/Button';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

export const ALL_MODULES = [
  {
    key: 'dashboard',
    label: 'Dashboard Overview',
    route: '/admin/dashboard',
    description: 'General metrics, sales cards, store stats & quick counters',
    icon: LayoutDashboard,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    defaultAllowed: true,
  },
  {
    key: 'products',
    label: 'Products & Cards',
    route: '/admin/products',
    description: 'Catalog products, deals, card discounts & coupon offers',
    icon: Package,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultAllowed: true,
  },
  {
    key: 'billing',
    label: 'Billing & Invoices',
    route: '/admin/billing',
    description: 'Merchant commission invoices, billing logs & payment status',
    icon: Receipt,
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    defaultAllowed: true,
  },
  {
    key: 'review-requests',
    label: 'Review Requests',
    route: '/admin/review-requests',
    description: 'Sub-admin submitted requests for Star & Card reviews',
    icon: Star,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    defaultAllowed: true,
  },
  {
    key: 'clicks',
    label: 'Click Tracking',
    route: '/admin/clicks',
    description: 'Affiliate link traffic, clicks, referrers & outbound redirects',
    icon: MousePointerClick,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    defaultAllowed: true,
  },
  {
    key: 'stores',
    label: 'Stores & Merchants',
    route: '/admin/stores',
    description: 'Affiliate store partners, cashback commission rates & logos',
    icon: ShoppingBag,
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    defaultAllowed: false,
  },
  {
    key: 'categories',
    label: 'Categories',
    route: '/admin/categories',
    description: 'Taxonomy, product categories & hierarchy configuration',
    icon: FolderTree,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    defaultAllowed: false,
  },
  {
    key: 'claims',
    label: 'Cashback Claims',
    route: '/admin/claims',
    description: 'Manual user cashback claim submissions & review verification',
    icon: Ticket,
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    defaultAllowed: false,
  },
  {
    key: 'missing-cashback',
    label: 'Missing Cashback',
    route: '/admin/missing-cashback',
    description: 'User support tickets for untracked cashback & ticket replies',
    icon: Ticket,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    defaultAllowed: false,
  },
  {
    key: 'visitor-analytics',
    label: 'Visitor Analytics',
    route: '/admin/visitor-analytics',
    description: 'Real-time traffic, Google search keywords, WhatsApp & journey tracking',
    icon: Activity,
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    defaultAllowed: false,
  },
  {
    key: 'subscribers',
    label: 'Subscribers',
    route: '/admin/subscribers',
    description: 'Newsletter email subscribers, lead contacts & export list',
    icon: Mail,
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    defaultAllowed: false,
  },
  {
    key: 'seller-requests',
    label: 'Seller Requests',
    route: '/admin/seller-requests',
    description: 'Merchant & seller onboarding partner applications',
    icon: Store,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    defaultAllowed: false,
  },
  {
    key: 'messages',
    label: 'Contact Messages',
    route: '/admin/messages',
    description: 'Contact form messages & user inquiries submitted on website',
    icon: MessageSquare,
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    defaultAllowed: false,
  },
  {
    key: 'payouts',
    label: 'Payout Requests',
    route: '/admin/payouts',
    description: 'User wallet withdrawal requests & banking payout approvals',
    icon: IndianRupee,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    defaultAllowed: false,
  },
];

export const DEFAULT_ALLOWED_MODULE_KEYS = [
  'dashboard',
  'products',
  'billing',
  'review-requests',
  'clicks'
];

export default function SubAdminPermissionsModal({
  isOpen,
  onClose,
  user,
  onPermissionsUpdated
}) {
  const [allowedModules, setAllowedModules] = useState(DEFAULT_ALLOWED_MODULE_KEYS);
  const [canAdd, setCanAdd] = useState(true);
  const [canUpdate, setCanUpdate] = useState(true);
  const [canDelete, setCanDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promoteToSubAdmin, setPromoteToSubAdmin] = useState(true);

  // Initialize or fetch permissions when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;

    const initialPerms = user.permissions;
    if (initialPerms) {
      setAllowedModules(
        Array.isArray(initialPerms.allowedModules) && initialPerms.allowedModules.length > 0
          ? initialPerms.allowedModules
          : DEFAULT_ALLOWED_MODULE_KEYS
      );
      setCanAdd(initialPerms.canAdd !== undefined ? Boolean(initialPerms.canAdd) : true);
      setCanUpdate(initialPerms.canUpdate !== undefined ? Boolean(initialPerms.canUpdate) : true);
      setCanDelete(initialPerms.canDelete !== undefined ? Boolean(initialPerms.canDelete) : false);
    } else {
      // Fetch latest from API
      const fetchPerms = async () => {
        setIsLoading(true);
        try {
          const adminStr = localStorage.getItem('adminUser');
          const token = adminStr ? JSON.parse(adminStr).token : '';
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
          const userId = user.id || user._id;
          const res = await fetch(`${apiUrl}/auth/sub-admin-permissions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.permissions) {
              setAllowedModules(data.permissions.allowedModules || DEFAULT_ALLOWED_MODULE_KEYS);
              setCanAdd(Boolean(data.permissions.canAdd));
              setCanUpdate(Boolean(data.permissions.canUpdate));
              setCanDelete(Boolean(data.permissions.canDelete));
            }
          }
        } catch (err) {
          console.error('Failed to load permissions:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPerms();
    }

    setPromoteToSubAdmin(user.role !== 'SUB_ADMIN');
  }, [isOpen, user]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const toggleModule = (moduleKey) => {
    setAllowedModules((prev) => {
      if (prev.includes(moduleKey)) {
        return prev.filter((k) => k !== moduleKey);
      } else {
        return [...prev, moduleKey];
      }
    });
  };

  const handleSelectAllModules = () => {
    setAllowedModules(ALL_MODULES.map((m) => m.key));
  };

  const handleResetToDefault = () => {
    setAllowedModules([...DEFAULT_ALLOWED_MODULE_KEYS]);
    setCanAdd(true);
    setCanUpdate(true);
    setCanDelete(false);
  };

  const handleDeselectAll = () => {
    setAllowedModules(['dashboard']); // Keep at least dashboard
  };

  const handleSave = async () => {
    setIsSaving(true);
    const userId = user.id || user._id;

    try {
      const adminStr = localStorage.getItem('adminUser');
      const token = adminStr ? JSON.parse(adminStr).token : '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      // 1. If user is currently a standard USER and promotion is enabled, update role to SUB_ADMIN
      if (user.role === 'USER' && promoteToSubAdmin) {
        const roleRes = await fetch(`${apiUrl}/auth/role/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ role: 'SUB_ADMIN' })
        });
        if (!roleRes.ok) {
          const errData = await roleRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update user role to Sub-Admin');
        }
      }

      // 2. Save Permissions
      const permsPayload = {
        allowedModules,
        canAdd,
        canUpdate,
        canDelete
      };

      const res = await fetch(`${apiUrl}/auth/sub-admin-permissions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(permsPayload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sub-admin permissions');
      }

      showSuccessToast(`Permissions updated successfully for "${user.name || user.email}"!`);
      
      if (onPermissionsUpdated) {
        onPermissionsUpdated(userId, {
          role: user.role === 'USER' && promoteToSubAdmin ? 'SUB_ADMIN' : user.role,
          permissions: data.permissions || permsPayload
        });
      }

      onClose();
    } catch (err) {
      handleAppError(err, {
        context: 'Sub-Admin Permissions',
        title: 'Save Error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const userName = user.name || 'User';
  const userEmail = user.email || '';
  const currentRole = user.role || 'USER';

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-neutral-200/80 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-neutral-200/80 flex items-center justify-between gap-4 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-neutral-900 text-lg leading-tight truncate">
                  Sub-Admin Permissions & Access
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  currentRole === 'SUB_ADMIN'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : currentRole === 'ADMIN'
                    ? 'bg-neutral-900 text-white border-neutral-800'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}>
                  {currentRole === 'SUB_ADMIN' ? 'Sub-Admin' : currentRole === 'ADMIN' ? 'Main Admin' : 'Standard User'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                Configuring dashboard view & CRUD privileges for <strong className="text-neutral-800">{userName}</strong> ({userEmail})
              </p>
            </div>
          </div>

          <Button 
            variant="none" 
            size="none"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1 [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-sm font-semibold text-neutral-500">Loading user permissions...</span>
            </div>
          ) : (
            <>
              {/* User Promotion Banner if current role is USER */}
              {currentRole === 'USER' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <strong className="text-amber-900 font-bold block mb-0.5">
                      Promote to Sub-Admin on Save
                    </strong>
                    <p className="text-amber-800 leading-relaxed mb-2">
                      This user is currently a regular customer account. Saving these module and CRUD permissions will promote them to <strong>Sub-Admin</strong> with immediate administrative dashboard access.
                    </p>
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={promoteToSubAdmin}
                        onChange={(e) => setPromoteToSubAdmin(e.target.checked)}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="font-semibold text-amber-900">
                        Automatically update account role to Sub-Admin
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 1: CRUD ACTION PERMISSIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                      <span>CRUD Operations & Action Rights</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                        Action Permissions
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Control whether this sub-admin can Add new records, Edit existing records, or Delete records.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* CAN ADD */}
                  <div 
                    onClick={() => setCanAdd(!canAdd)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      canAdd 
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
                        : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/60 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          canAdd ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-neutral-200 text-neutral-500'
                        }`}>
                          <PlusCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block leading-tight">
                            Add & Create
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${canAdd ? 'text-emerald-700' : 'text-neutral-400'}`}>
                            {canAdd ? 'ALLOWED' : 'RESTRICTED'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        canAdd ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {canAdd && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Can create new products, cards, stores, and submit review requests.
                    </p>
                  </div>

                  {/* CAN UPDATE */}
                  <div 
                    onClick={() => setCanUpdate(!canUpdate)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      canUpdate 
                        ? 'bg-sky-50/80 border-sky-300 shadow-xs' 
                        : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/60 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          canUpdate ? 'bg-sky-600 text-white shadow-2xs' : 'bg-neutral-200 text-neutral-500'
                        }`}>
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block leading-tight">
                            Update & Edit
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${canUpdate ? 'text-sky-700' : 'text-neutral-400'}`}>
                            {canUpdate ? 'ALLOWED' : 'RESTRICTED'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        canUpdate ? 'bg-sky-600 border-sky-600 text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {canUpdate && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Can modify details, edit pricing, change links, and update statuses.
                    </p>
                  </div>

                  {/* CAN DELETE */}
                  <div 
                    onClick={() => setCanDelete(!canDelete)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      canDelete 
                        ? 'bg-rose-50/80 border-rose-300 shadow-xs' 
                        : 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          canDelete ? 'bg-rose-600 text-white shadow-2xs' : 'bg-neutral-200 text-neutral-500'
                        }`}>
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block leading-tight">
                            Delete Records
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${canDelete ? 'text-rose-700' : 'text-neutral-400'}`}>
                            {canDelete ? 'ALLOWED' : 'DISABLED (SAFE)'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        canDelete ? 'bg-rose-600 border-rose-600 text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {canDelete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Can permanently delete products, cards, and data. Keep disabled for maximum safety.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DASHBOARD MODULES VISIBILITY */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
                      <span>Dashboard Sidebar & Module Access</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {allowedModules.length} of {ALL_MODULES.length} enabled
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Select which modules will appear in this Sub-Admin's sidebar and dashboard navigation.
                    </p>
                  </div>

                  {/* Preset / Batch Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Select all modules"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Select All</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reset to recommended standard permissions"
                    >
                      <RotateCcw className="w-3 h-3 text-neutral-600" />
                      <span>Recommended</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors cursor-pointer"
                      title="Clear all optional modules"
                    >
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2.5">
                  {ALL_MODULES.map((module) => {
                    const ModuleIcon = module.icon;
                    const isChecked = allowedModules.includes(module.key);

                    return (
                      <div
                        key={module.key}
                        onClick={() => toggleModule(module.key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                          isChecked 
                            ? 'bg-white border-neutral-900 shadow-2xs ring-1 ring-neutral-900/10' 
                            : 'bg-neutral-50/60 border-neutral-200/80 hover:bg-neutral-100/60 opacity-60'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? 'bg-neutral-900 text-white shadow-2xs' : 'bg-neutral-200 text-neutral-500'
                        }`}>
                          <ModuleIcon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold text-neutral-900 truncate">
                                {module.label}
                              </span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${module.badgeColor}`}>
                                {module.route.replace('/admin', '')}
                              </span>
                            </div>

                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              isChecked ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-neutral-300 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-tight mt-1 line-clamp-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200/80 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Changes take effect immediately on next page navigation or login.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="none"
              size="none"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </Button>

            <Button
              variant="none"
              size="none"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold rounded-xl bg-neutral-900 hover:bg-amber-600 text-white transition-all shadow-md shadow-neutral-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Permissions...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Permissions</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
