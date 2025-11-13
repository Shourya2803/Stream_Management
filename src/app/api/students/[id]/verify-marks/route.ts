import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const submitted = await req.json();
    // Example submitted:
    // { class10: { math: 80, science: 85, english: 90, hindi: 88 }, class12: { math: 95, physics: 90, chemistry: 85 } }

    const official10 = await prisma.class10Marks.findUnique({ where: { studentId: id } });
    const official12 = await prisma.class12Marks.findUnique({ where: { studentId: id } });

    if (!official10 || !official12) {
      return NextResponse.json({ error: "Official marks not found" }, { status: 404 });
    }

    let status: "VERIFIED" | "REJECTED" = "VERIFIED";

    // Compare Class 10 marks
    for (const subject of ["math", "science", "english", "hindi"] as const) {
      if (submitted.class10[subject] !== official10[subject]) {
        status = "REJECTED";
        break;
      }
    }

    // Compare Class 12 marks if Class 10 passed
    if (status === "VERIFIED") {
      for (const subject of ["math", "physics", "chemistry"] as const) {
        if (submitted.class12[subject] !== official12[subject]) {
          status = "REJECTED";
          break;
        }
      }
    }

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        marksStatus: status,
        notification:
          status === "REJECTED"
            ? "Your submitted marks do not match official records. Please check."
            : null,
      },
    });

    return NextResponse.json({ success: true, status, student: updatedStudent });
  } catch (error) {
    console.error("Error verifying marks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
