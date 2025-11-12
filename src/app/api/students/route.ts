// /src/app/api/students/route.ts
import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        class10: true,
        class12: true,
      },
    });

    // Add computed totals
    const formatted = students.map((student) => {
      const total10 =
        (student.class10?.english || 0) +
        (student.class10?.math || 0) +
        (student.class10?.science || 0) +
        (student.class10?.hindi || 0) +
        (student.class10?.social || 0);

      const total12 =
        (student.class12?.physics || 0) +
        (student.class12?.chemistry || 0) +
        (student.class12?.math || 0);

      return {
        id: student.id,
        name: student.name,
        total10,
        total12,
        branchChoice1: student.branchChoice1,
        branchChoice2: student.branchChoice2,
        seatAccepted: student.seatAccepted,
        seatStatus: student.seatStatus,
        // include receipt fields so the frontend can filter by uploaded/verified receipts
        receiptUrl: student.receiptUrl,
        receiptStatus: student.receiptStatus,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
