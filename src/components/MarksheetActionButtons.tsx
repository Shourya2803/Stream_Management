'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarksheetActionButtons({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async (status: 'VERIFIED' | 'REJECTED') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/marksheet-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json().catch(async () => {
        const text = await res.text().catch(() => null);
        return { message: text || (res.ok ? `Marksheet ${status.toLowerCase()} successfully` : 'Failed to update marksheet status'), student: null };
      });

      if (!res.ok) {
        toast.error(payload?.message || 'Failed to update marksheet status');
      } else {
        toast.success(payload?.message || `Marksheet ${status.toLowerCase()} successfully`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="default" onClick={() => handle('VERIFIED')} disabled={loading}>
        <Check className="w-4 h-4 mr-1" /> Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handle('REJECTED')} disabled={loading}>
        <XCircle className="w-4 h-4 mr-1" /> Reject
      </Button>
    </div>
  );
}
