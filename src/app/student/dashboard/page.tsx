'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Form from '@/components/form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleQuit = async () => {
    const ok = confirm('Are you sure you want to quit your application? This will delete your application and sign you out.');
    if (!ok) return;

    try {
      const res = await fetch('/api/students/me', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to delete application');
        return;
      }

      // Successfully deleted — sign out the user
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error quitting application:', err);
      toast.error('Unexpected error. Please try again later.');
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <Form />
          <div className="mt-6 text-center">
            <button
              onClick={handleQuit}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              Quit Application
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
