'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';

export default function UploadReceipt({ student }: { student: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const toastId = toast.loading('Uploading receipt...');

    try {
      // 1. Upload to Cloudinary directly
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'default'); 

      const cloudinaryRes = await fetch(
        'https://api.cloudinary.com/v1_1/dj9elwflm/image/upload', //place with actual cloud name
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await cloudinaryRes.json();

      if (!data.secure_url) throw new Error('Cloudinary upload failed');

      // 2. Save the URL to the student’s record
      const dbRes = await fetch(`/api/students/${student.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secure_url: data.secure_url }),
      });

      if (!dbRes.ok) throw new Error('Failed to update receipt in DB');

      toast.success('✅ Receipt uploaded successfully!', { id: toastId });
      setFile(null);
    } catch (err: any) {
      toast.error('❌ Upload failed: ' + err.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (!student?.seatAccepted) {
    return (
      <div className="text-sm text-yellow-600 font-semibold mt-4">
        ⏳ Your seat is not accepted yet. Please wait for seat allotment.
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 rounded-xl shadow-xl border border-border bg-white dark:bg-zinc-900 transition-all duration-300">
      <h3 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-4">
        Upload Payment Receipt
      </h3>

      <label
        htmlFor="receipt-upload"
        className="block text-sm font-medium text-muted-foreground mb-2"
      >
        Select your payment receipt image
      </label>

      <Input
        id="receipt-upload"
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 file:cursor-pointer file:text-pink-600"
      />

      {file && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-4">
          Selected: {file.name}
        </p>
      )}

      <Button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
      >
        <UploadCloud className="w-4 h-4" />
        {uploading ? 'Uploading...' : 'Upload Receipt'}
      </Button>
    </div>
  );
}
