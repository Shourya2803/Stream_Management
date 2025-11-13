import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const payload = await req.json();
    // accept payload as { status } or { marksheetStatus }
    const status = (payload.status ?? payload.marksheetStatus ?? payload.marksStatus) as string;

    if (!status || !["VERIFIED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const data: Record<string, any> = { marksStatus: status };

    // If rejected, add a notification for the student
    if (status === "REJECTED") {
      data.notification = 'Your 12th marksheet has been rejected. Please re-upload or contact faculty.';
    }

    const updatedStudent = await prisma.student.update({ where: { id }, data });

    return NextResponse.json({ success: true, message: `Marksheet ${status.toLowerCase()} successfully`, student: updatedStudent });
  } catch (err) {
    console.error("Error updating marks status:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
