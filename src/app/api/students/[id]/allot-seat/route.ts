// src/app/api/students/[id]/allot-seat/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const seat = body.seat;

  if (!seat) {
    return NextResponse.json({ error: "Seat is required" }, { status: 400 });
  }

  try {
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        seatAllotted: seat,
        notification: `🎉 You have been allotted a seat in ${seat}`,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (err) {
    console.error("Error allotting seat:", err);
    return NextResponse.json({ error: "Failed to allot seat" }, { status: 500 });
  }
}