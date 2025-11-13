import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class12: true,
        class10: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const body = await req.json();
  const { seatAccepted, notification } = body;

  try {
    // Build update payload only with provided fields
    const data: Record<string, any> = {};

    if (typeof seatAccepted !== "undefined") {
      data.seatAccepted = seatAccepted;
      // Keep seatStatus in sync with seatAccepted when provided
      if (seatAccepted === true) data.seatStatus = "ACCEPTED";
      else if (seatAccepted === false) data.seatStatus = "REJECTED";
      else if (seatAccepted === null) data.seatStatus = "PENDING";
    }

    if (typeof notification !== "undefined") data.notification = notification;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
