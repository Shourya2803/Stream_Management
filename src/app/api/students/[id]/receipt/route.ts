// route.ts (e.g., src/app/api/students/[id]/receipt/route.ts)
import { NextRequest, NextResponse } from "next/server";
import prisma  from "@/lib/prisma"; // Adjust this if needed
import { Prisma } from "@prisma/client";
import { ReceiptStatus } from "@prisma/client"; // Ensure this is imported correctly

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const studentId = params.id;
  const { secure_url } = await req.json(); // sent from client after Cloudinary upload

  if (!secure_url) {
    return NextResponse.json({ error: "Missing receipt URL" }, { status: 400 });
  }

  try {
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        receiptUrl: secure_url,
        receiptStatus: "PENDING", // optionally make this dynamic
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update student receipt:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}


export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await context.params;

  const payload = await req.json();
  const { receiptStatus, notification } = payload;

  console.debug(`[receipt PATCH] id=${studentId} payload=`, payload);

  if (!['REJECTED', 'VERIFIED', 'PENDING'].includes(receiptStatus)) {
    return new Response('Invalid receipt status', { status: 400 });
  }

  try {
    // Fetch current row to decide cascading changes
    const current = await prisma.student.findUnique({ where: { id: studentId } });
    if (!current) return new Response('Student not found', { status: 404 });

    const data: Record<string, any> = {
      receiptStatus,
      notification: notification || null,
    };

    // Do NOT auto-accept seat when receipt is verified. Receipt verification
    // is a separate step that should occur after a seat is accepted. Only
    // update receiptStatus and notification here.

    const updated = await prisma.student.update({ where: { id: studentId }, data });
    console.debug(`[receipt PATCH] updated student id=${studentId}`, { seatAccepted: updated.seatAccepted, seatStatus: updated.seatStatus, receiptStatus: updated.receiptStatus });

    return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Failed to update receipt status:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
