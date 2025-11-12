'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ReceiptActionButtons({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReceiptDecision = async (status: 'VERIFIED' | 'REJECTED') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/receipt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptStatus: status,
          notification:
            status === 'REJECTED'
              ? 'Your payment receipt has been rejected. Please contact the faculty or upload receipt again.' 
              : null,
        }),
      });

      if (res.ok) {
        toast.success(`Receipt ${status.toLowerCase()} successfully!`);
        window.location.reload();
      } else {
        toast.error('Failed to update receipt status');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 mt-3">
      <Button
        variant="secondary"
        onClick={() => handleReceiptDecision('VERIFIED')}
        disabled={loading}
      >
        Accept
      </Button>
      <Button
        variant="destructive"
        onClick={() => handleReceiptDecision('REJECTED')}
        disabled={loading}
      >
        Reject
      </Button>
    </div>
  );
}
