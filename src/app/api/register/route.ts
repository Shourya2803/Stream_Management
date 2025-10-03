import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ✅ Get Clerk userId
    const { userId } = await auth();
    console.log("User ID from Clerk:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
    }

    // ✅ Parse request body
    const body = await req.json();
    console.log("Received body:", body);

    // ✅ Basic validation
    const requiredFields = [
      "name", "email", "phone", "branch",
      "english10", "maths10", "science10", "hindi10", "social10",
      "physics12", "chemistry12", "maths12"
    ];

    const missingFields = requiredFields.filter(f => !body[f]);
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing fields: ${missingFields.join(", ")}` }, { status: 400 });
    }

    // ✅ Check if student already exists
    let existingStudent = await prisma.student.findUnique({
      where: { userId },
      include: { class10: true, class12: true },
    });

    if (existingStudent) {
      // ✅ Update existing student and marks
     const updatedStudent = await prisma.student.update({
  where: { userId },
  data: {
    name: body.name,
    email: body.email,
    phone: body.phone,
    branchChoice1: body.branch,

    class10: {
      upsert: {
        create: {
          english: parseInt(body.english10),
          math: parseInt(body.maths10),
          science: parseInt(body.science10),
          hindi: parseInt(body.hindi10),
          social: parseInt(body.social10),
        },
        update: {
          english: parseInt(body.english10),
          math: parseInt(body.maths10),
          science: parseInt(body.science10),
          hindi: parseInt(body.hindi10),
          social: parseInt(body.social10),
        },
      },
    },

    class12: {
      upsert: {
        create: {
          physics: parseInt(body.physics12),
          chemistry: parseInt(body.chemistry12),
          math: parseInt(body.maths12),
        },
        update: {
          physics: parseInt(body.physics12),
          chemistry: parseInt(body.chemistry12),
          math: parseInt(body.maths12),
        },
      },
    },
  },
  include: { class10: true, class12: true },
});

      return NextResponse.json({ success: true, student: updatedStudent });
    }

    // ✅ Create new student with nested marks
    const student = await prisma.student.create({
      data: {
        userId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        branchChoice1: body.branch,
        branchChoice2: "",

        class10: {
          create: {
            english: parseInt(body.english10),
            math: parseInt(body.maths10),
            science: parseInt(body.science10),
            hindi: parseInt(body.hindi10),
            social: parseInt(body.social10),
          },
        },

        class12: {
          create: {
            physics: parseInt(body.physics12),
            chemistry: parseInt(body.chemistry12),
            math: parseInt(body.maths12),
          },
        },
      },
      include: { class10: true, class12: true },
    });

    return NextResponse.json({ success: true, student });

  } catch (error: any) {
    console.error("Error in /api/register:", error);

    if (error.code === "P2021") {
      return NextResponse.json(
        { error: "Database table not found. Did you run migrations?" },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
