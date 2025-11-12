import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
  
    const { userId } = await auth();
    console.log("User ID from Clerk:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
    }

  
    const body = await req.json();
    const branch1 = body.branch1 ?? body.branchChoice1;
    const branch2 = body.branch2 ?? body.branchChoice2;

  
    const marksheetUrl = body.marksheetUrl || null;

 
    const requiredFields = [
      "name", "email", "phone",
      "english10", "maths10", "science10", "hindi10", "social10",
      "physics12", "chemistry12", "maths12"
    ];

    const missingFields = requiredFields.filter((f) => !body[f]);
    if (!branch1) missingFields.push("branchChoice1 or branch1");
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing fields: ${missingFields.join(", ")}` }, { status: 400 });
    }

 
    let existingStudent = await prisma.student.findUnique({
      where: { userId },
      include: { class10: true, class12: true },
    });

    if (existingStudent) {
     
      const updatedStudent = await prisma.student.update({
        where: { userId },
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          branchChoice1: branch1,
          branchChoice2: branch2,
          marksheetUrl,
          // If a marksheet was uploaded (or re-uploaded), reset the verification status
          // so admins will see the approve/reject controls again.
          ...(marksheetUrl ? { marksStatus: "PENDING" } : {}),

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

    
    const student = await prisma.student.create({
      data: {
        userId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        branchChoice1: branch1,
        branchChoice2: branch2,
        marksheetUrl,
        // New students with an uploaded marksheet should start in PENDING state
        ...(marksheetUrl ? { marksStatus: "PENDING" } : {}),

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
