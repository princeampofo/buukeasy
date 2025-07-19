import { useState, useEffect } from 'react';

interface BillingInfo {
  currentPlan: {
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    nextBillingDate: string;
    features: string[];
  };
  paymentMethod: {
    last4: string;
    expiryDate: string;
    brand: string;
  };
  recentInvoices: {
    id: string;
    date: string;
    amount: number;
    status: string;
    downloadUrl: string;
  }[];
}

export function useBilling(userId: string) {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/settings/billing?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch billing information');
      }
      const data = await response.json();
      if (data.success) {
        setBillingInfo(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch billing information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentMethod = async () => {
    // TODO: Implement payment method update logic
    // This would typically integrate with your payment provider (e.g., Stripe)
    throw new Error('Not implemented');
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/settings/billing/download-invoice/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }
      // Handle invoice download (e.g., PDF blob)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download invoice');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBillingInfo();
    }
  }, [userId]);

  return {
    billingInfo,
    isLoading,
    error,
    refetch: fetchBillingInfo,
    updatePaymentMethod,
    downloadInvoice
  };
} 