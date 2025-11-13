import { notFound } from "next/navigation";
import {
  GraduationCap,
  Phone,
  Mail,
  User,
  BookOpen,
  FileCheck,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Check,
  ChevronLeft,
} from "lucide-react";
import Link from 'next/link'
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/adminNavbar";
import SeatAllotmentForm from "@/components/SeatAllotmentForm";
import Image from "next/image";
import ReceiptActionButtons from "@/components/ReceiptActionButtons";
import MarksheetActionButtons from '@/components/MarksheetActionButtons';
import OfferLetterUpload from "@/components/OfferLetterUpload";
import { Button } from "@/components/ui/button";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // If BASE_URL is not configured, show a helpful message instead of silently using localhost
  if (!BASE_URL) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen p-6 sm:p-10 bg-background text-foreground max-w-4xl mx-auto flex items-center justify-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">Configuration required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The application is missing a required configuration: <code>NEXT_PUBLIC_BASE_URL</code>.
                Please set <code>NEXT_PUBLIC_BASE_URL</code> to your site's public URL in your environment variables and restart the server.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const res = await fetch(`${BASE_URL}/api/students/${id}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) return notFound();

  const student = await res.json();
  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 sm:p-10 bg-background text-foreground max-w-6xl mx-auto animate-fadeIn">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h2 className="text-2xl font-bold ml-4">{student.name}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - main details */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.phone || '—'}</p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Physics</p>
                    <p className="font-medium">{student.class12?.physics ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chemistry</p>
                    <p className="font-medium">{student.class12?.chemistry ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mathematics</p>
                    <p className="font-medium">{student.class12?.math ?? '—'}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">1st Preference</p>
                    <Badge className="mt-1">{student.branchChoice1 || '—'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">2nd Preference</p>
                    <Badge className="mt-1">{student.branchChoice2 || '—'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Seat Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Allotted</p>
                    <div className="mt-1">
                      {student.seatAllotted ? (
                        <Badge variant="secondary" className="text-green-600 border-green-300">
                          {student.seatAllotted}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          Not Allotted
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <div className="mt-1">
                      {student.seatAccepted ? (
                        <Badge variant="secondary" className="text-green-600 border-green-300">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-300">No</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Documents</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Receipt */}
                <div>
                  <p className="text-sm text-muted-foreground">Payment Receipt</p>
                  {student.receiptUrl ? (
                    <div className="mt-2">
                      <Image src={student.receiptUrl} alt="Payment Receipt" width={600} height={360} className="rounded-md border" />
                      <div className="mt-2"> 
                        <p className="text-sm">Status: <span className="font-medium">{student.receiptStatus}</span></p>
                        {student.receiptStatus === 'PENDING' && (
                          <div className="mt-2"><ReceiptActionButtons studentId={student.id} /></div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No receipt uploaded</p>
                  )}
                </div>

                {/* Marksheet */}
                <div>
                  <p className="text-sm text-muted-foreground">12th Marksheet</p>
                  {student.marksheetUrl ? (
                    <div className="mt-2">
                      <Image src={student.marksheetUrl} alt="12th Marksheet" width={600} height={360} className="rounded-md border" />
                      <div className="mt-2 flex items-center gap-4">
                        <p className="text-sm">Status: <span className="font-medium">{student.marksStatus}</span></p>
                        {student.marksStatus === 'PENDING' && <MarksheetActionButtons studentId={student.id} />}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No marksheet uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm text-muted-foreground">Offer Letter</h4>
                  <div className="mt-2">
                    {student.receiptStatus === 'VERIFIED' ? (
                      <OfferLetterUpload studentId={student.id} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Offer letter upload available after receipt verification.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-muted-foreground">Manual Seat Allotment</h4>
                  <div className="mt-2"><SeatAllotmentForm studentId={student.id} /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Latest notification</p>
                <p className="mt-2 font-medium">{student.notification || 'No notifications'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
