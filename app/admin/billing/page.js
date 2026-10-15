'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import BillingSummaryCards from '@/components/admin/billing/BillingSummaryCards';
import BillingFilterBar from '@/components/admin/billing/BillingFilterBar';
import BillingTable from '@/components/admin/billing/BillingTable';
import { getSocket } from '@/lib/socket';

export default function AdminBillingPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [summary, setSummary] = useState({
    totalBilling: 0,
    totalApprovedClaims: 0,
    withReviewBilling: 0,
    withReviewCount: 0,
    withoutReviewBilling: 0,
    withoutReviewCount: 0,
    totalOrderAmount: 0
  });
  const [products, setProducts] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [claimStatus, setClaimStatus] = useState('APPROVED'); // 'APPROVED', 'ALL', 'PENDING'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subAdminId, setSubAdminId] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Fetch Billing Data from Backend API
  const fetchBillingData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
      if (!userStr) {
        router.push('/admin/login');
        return;
      }
      const user = JSON.parse(userStr);
      setIsMainAdmin(user.role === 'ADMIN');

      // Construct Query Parameters
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (claimStatus) params.append('claimStatus', claimStatus);
      if (period === 'custom') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }
      if (user.role === 'ADMIN' && subAdminId) {
        params.append('subAdminId', subAdminId);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/billing?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || {});
        setProducts(data.products || []);
        setLastUpdated(new Date());
        if (Array.isArray(data.subAdmins)) {
          setSubAdmins(data.subAdmins);
        }
      } else {
        console.error('Failed to fetch billing data');
      }
    } catch (err) {
      console.error('Billing fetch error:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [period, claimStatus, startDate, endDate, subAdminId, router]);

  // Initial fetch and on filter changes
  useEffect(() => {
    fetchBillingData(false);
  }, [fetchBillingData]);

  // Real-time live updates via WebSockets and polling fallback
  useEffect(() => {
    const socket = getSocket();

    const handleRealtimeChange = () => {
      // Re-fetch silently without disturbing UI/spinners
      fetchBillingData(true);
    };

    if (socket) {
      socket.on('billing:changed', handleRealtimeChange);
      socket.on('claims:changed', handleRealtimeChange);
      socket.on('products:changed', handleRealtimeChange);
    }

    // Window event listeners (e.g. from local tabs or actions)
    window.addEventListener('karodeal:claims_changed', handleRealtimeChange);
    window.addEventListener('karodeal:billing_changed', handleRealtimeChange);

    // Continuous 15-second live polling interval
    const liveInterval = setInterval(() => {
      fetchBillingData(true);
    }, 15000);

    return () => {
      if (socket) {
        socket.off('billing:changed', handleRealtimeChange);
        socket.off('claims:changed', handleRealtimeChange);
        socket.off('products:changed', handleRealtimeChange);
      }
      window.removeEventListener('karodeal:claims_changed', handleRealtimeChange);
      window.removeEventListener('karodeal:billing_changed', handleRealtimeChange);
      clearInterval(liveInterval);
    };
  }, [fetchBillingData]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, period, claimStatus, subAdminId]);

  // Filter products locally by search query
  const filteredProducts = products.filter((prod) => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      prod.title?.toLowerCase().includes(searchLower) ||
      prod.storeName?.toLowerCase().includes(searchLower) ||
      prod.createdByName?.toLowerCase().includes(searchLower)
    );
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setPeriod('all');
    setClaimStatus('APPROVED');
    setStartDate('');
    setEndDate('');
    setSubAdminId('ALL');
    setCurrentPage(1);
  };

  const handleExportToExcel = () => {
    if (filteredProducts.length === 0) {
      alert('No billing data to export!');
      return;
    }

    const data = filteredProducts.map((prod, index) => ({
      'Sr No': index + 1,
      'Product Title': prod.title,
      'Store': prod.storeName,
      'Added By': prod.createdByName,
      'Sale Price (₹)': prod.salePrice,
      'With Review Rate (₹)': prod.cashbackWithReviewRate,
      'With Review Claims': prod.withReviewCount,
      'With Review Billing (₹)': prod.withReviewBilling,
      'Without Review Rate (₹)': prod.cashbackWithoutReviewRate,
      'Without Review Claims': prod.withoutReviewCount,
      'Without Review Billing (₹)': prod.withoutReviewBilling,
      'Total Claims': prod.totalClaimsCount,
      'Total Billing (₹)': prod.totalBilling,
      'Total Gross Sales (₹)': prod.totalOrderAmount
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Billing');
    XLSX.writeFile(
      workbook,
      `Product_Cashback_Billing_${claimStatus}_${period}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 4 Top Summary Statistics Cards */}
      <BillingSummaryCards summary={summary} />

      {/* Filter and Period Selection Bar */}
      <BillingFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        period={period}
        setPeriod={setPeriod}
        claimStatus={claimStatus}
        setClaimStatus={setClaimStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        subAdminId={subAdminId}
        setSubAdminId={setSubAdminId}
        subAdmins={subAdmins}
        isMainAdmin={isMainAdmin}
        lastUpdated={lastUpdated}
        onResetFilters={handleResetFilters}
        onExportExcel={handleExportToExcel}
        onManualRefresh={() => fetchBillingData(false)}
      />

      {/* Product-wise Breakdown Table */}
      <BillingTable
        products={paginatedProducts}
        totalItems={filteredProducts.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
      />
    </div>
  );
}

