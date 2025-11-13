// app/api/students/by-branch/route.ts
import { NextResponse } from "next/server";
import prisma  from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { branch } = await req.json();

    if (!branch) {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: {
        seatAllotted: branch,
        receiptStatus: "VERIFIED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
