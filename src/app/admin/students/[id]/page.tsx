
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/adminNavbar";
import SeatAllotmentForm from "@/components/SeatAllotmentForm";
import Image from "next/image";
import ReceiptActionButtons from "@/components/ReceiptActionButtons";
import OfferLetterUpload from "@/components/OfferLetterUpload";


export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${BASE_URL}/api/students/${id}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return notFound();
  }

  const student = await res.json();



  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 sm:p-10 bg-background text-foreground max-w-4xl mx-auto animate-fadeIn">
        <Card className="shadow-lg border border-border rounded-2xl transition-all duration-300 hover:shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <User className="w-6 h-6 text-primary" />
              <CardTitle className="text-3xl font-bold text-primary">
                {student.name}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5" />
                {student.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-5 h-5" />
                {student.phone}
              </p>
            </div>

            <Separator />

           

            <Separator />

            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-muted-foreground" />
                1st Branch Preference: <Badge>{student.branchChoice1}</Badge>
              </p>
              <p className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-muted-foreground" />
                2nd Branch Preference: <Badge>{student.branchChoice2}</Badge>
              </p>
              <p className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                Seat Allotted: {
                  student.seatAllotted ? (
                    <Badge variant="secondary" className="text-green-600 border-green-300">
                      {student.seatAllotted}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      Not Allotted
                    </Badge>
                  )
                }
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                Seat Accepted: {
                  student.seatAccepted ? (
                    <Badge variant="secondary" className="text-green-600 border-green-300">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      No
                    </Badge>
                  )
                }
              </p>

  {student.receiptUrl && (
  <div className="space-y-2 mt-4">
    <p className="text-muted-foreground text-sm">Uploaded Receipt:</p>
    <Image
      src={student.receiptUrl}
      alt="Payment Receipt"
      width={400}
      height={300}
      className="rounded-md border shadow-md"
    />

    {/* Action Buttons */}
   {student.receiptStatus === 'PENDING' && (
  <ReceiptActionButtons studentId={student.id} />
)}
  </div>
)}

       
           <p className="flex items-center gap-2">
  <FileCheck className="w-5 h-5 text-muted-foreground" />
  Receipt Status:
  <Badge
    variant="secondary"
    className={
      student.receiptStatus === 'VERIFIED'
        ? 'text-green-600 border-green-300'
        : student.receiptStatus === 'REJECTED'
        ? 'text-red-600 border-red-300'
        : 'text-yellow-600 border-yellow-300'
    }
  >
    {student.receiptStatus}
  </Badge>
</p>
{student.receiptStatus === "VERIFIED" && (
  <OfferLetterUpload studentId={student.id} />
)}


              <Separator/>
              <div className="pt-4">
    <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
      Allot Seat
    </h3>
    <SeatAllotmentForm studentId={student.id} />
  </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
