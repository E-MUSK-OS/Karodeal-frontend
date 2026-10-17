'use client';
import { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';
import Button from '@/components/common/Button';
import * as XLSX from 'xlsx';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';
import { cleanProductTitle } from '@/lib/titleSanitizer';

export default function BulkImportModal({ isOpen, onClose, onSuccess, dbStores, dbCategories, currentRole }) {
  const [bulkProducts, setBulkProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  const handleDownloadSample = () => {
    const sampleData = [
      {
        Title: 'Sample Deal Title',
        Store: dbStores[0]?.name || 'Amazon',
        Category: dbCategories[0]?.name || 'Electronics',
        OriginalPrice: 1999,
        SalePrice: 599,
        Discount: 70,
        Image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        AffiliateUrl: 'https://amazon.in/dp/sample',
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'products_import_sample.xlsx');
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const mappedProducts = json.map(row => {
          const originalPrice = Math.max(0, parseFloat(row['OriginalPrice'] || row['originalPrice'] || row['Original Price'] || 0));
          const salePrice = Math.max(0, parseFloat(row['SalePrice'] || row['salePrice'] || row['Sale Price'] || 0));
          const discount = Math.max(0, parseFloat(row['Discount'] || row['discount'] || 0));
          const { withoutReview, withReview } = calculateCashback(salePrice);
          return {
            title: cleanProductTitle(row['Title'] || row['title'] || ''),
            store: dbStores.find(s => s.name.toLowerCase() === String(row['Store'] || row['store'] || '').toLowerCase())?.id || dbStores[0]?.id || '',
            category: dbCategories.find(c => c.name.toLowerCase() === String(row['Category'] || row['category'] || '').toLowerCase())?.id || dbCategories[0]?.id || '',
            originalPrice,
            salePrice,
            discount,
            cashback: withReview,
            cashbackWithoutReview: withoutReview,
            cashbackWithReview: withReview,
            image: row['Image'] || row['image'] || '',
            affiliateUrl: row['AffiliateUrl'] || row['affiliateUrl'] || row['Affiliate Url'] || '',
            isActive: true
          };
        }).filter(p => p.title || p.image);

        setBulkProducts(mappedProducts);
      } catch (err) {
        console.error('Error parsing excel:', err);
        setResultMessage({ type: 'error', text: 'Failed to parse Excel file. Please check format.' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMessage(null);
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      const token = adminUserStr ? JSON.parse(adminUserStr).token : null;

      if (bulkProducts.length === 0) {
        setResultMessage({ type: 'error', text: 'Please upload a valid Excel file with products.' });
        setIsSubmitting(false);
        return;
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
      const res = await fetch(`${apiUrl}/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: bulkProducts })
      });
      
      if (res.ok) {
        const result = await res.json();
        showSuccessToast(`Imported ${result.count} products successfully!`);
        onSuccess({ count: result.count, skippedCount: result.skippedCount });
      } else {
        const errorData = await res.json().catch(() => null);
        const userMsg = handleAppError(errorData?.error || res.statusText || 'Failed to import products', {
          context: 'Admin / Bulk Import',
          title: 'Import Failed'
        });
        setResultMessage({ type: 'error', text: userMsg });
      }
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Admin / Bulk Import Network',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
      setResultMessage({ type: 'error', text: userMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[600px] w-full shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <h4 className="font-bold text-neutral-900 flex items-center gap-2">
            <span className="text-xl">📄</span> Bulk Import (Excel)
          </h4>
          <Button variant="none" size="none" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-[#f96b02] hover:bg-neutral-100 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-900">Excel Format Requirements:</p>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>
            </div>
            <p className="text-xs text-blue-700">
              Columns: <span className="font-semibold text-blue-950">Title, Store, Category, OriginalPrice, SalePrice, Discount, Image, AffiliateUrl</span>
            </p>
            {currentRole !== 'SUB_ADMIN' && (
              <p className="text-[11px] text-blue-600 font-medium">
                Note: Cashback amounts are automatically calculated based on Sale Price.
              </p>
            )}
          </div>
          <div className="border-2 border-dashed border-neutral-300 hover:border-[#f96b02] rounded-2xl p-6 text-center transition-colors cursor-pointer relative bg-neutral-50 flex flex-col items-center justify-center gap-2">
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <Upload className="w-6 h-6 text-neutral-600" />
            <span className="text-sm font-bold text-neutral-800">Upload Excel or CSV File</span>
            {bulkProducts.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mt-2">
                {bulkProducts.length} Products Ready to Import
              </span>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button variant="none" size="none" type="button" onClick={onClose} className="px-5 py-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">Cancel</Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="text-xs rounded-xl !px-6 !py-3 normal-case tracking-normal shadow-md">Import Products</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
