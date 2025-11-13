import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Capacities = Record<string, number>;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Default capacities (can be overridden via env or request body)
    const capacities: Capacities = {
      CSE: parseInt(process.env.SEATS_CSE || "60"),
      ECE: parseInt(process.env.SEATS_ECE || "60"),
      CIVIL: parseInt(process.env.SEATS_CIVIL || "40"),
      MECHANICAL: parseInt(process.env.SEATS_MECHANICAL || "40"),
    };

    if (body.capacities && typeof body.capacities === "object") {
      for (const k of Object.keys(body.capacities)) {
        const key = String(k).toUpperCase();
        const v = parseInt(body.capacities[k]);
        if (!isNaN(v)) capacities[key] = v;
      }
    }

    // Count already allocated seats to avoid over-allocation
    const allocatedCounts: Capacities = {};
    for (const b of Object.keys(capacities)) {
      const c = await prisma.student.count({ where: { seatAllotted: b } });
      allocatedCounts[b] = c;
    }

    const remaining: Capacities = {};
    for (const b of Object.keys(capacities)) {
      remaining[b] = Math.max(0, capacities[b] - (allocatedCounts[b] || 0));
    }

    // Fetch candidates: only students with VERIFIED marks and no seat allotted yet
    const candidates = await prisma.student.findMany({
      where: {
        marksStatus: "VERIFIED",
        OR: [{ seatAllotted: null }, { seatAllotted: "" }],
      },
      include: { class12: true, class10: true },
    });

    // Compute a score for ranking: prefer class12 total, tiebreak by class10 total
    const scored = candidates.map((s) => {
      const total12 = s.class12 ? (s.class12.physics + s.class12.chemistry + s.class12.math) : 0;
      const total10 = s.class10
        ? (s.class10.english + s.class10.math + s.class10.science + s.class10.hindi + s.class10.social)
        : 0;
      const score = total12 * 1000 + total10; // weight class12 higher
      return { student: s, total12, total10, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const updates: Array<{ id: string; seatAllotted: string }> = [];

    for (const entry of scored) {
      const s = entry.student;
      const prefs = [s.branchChoice1, s.branchChoice2].filter(Boolean).map((p) => String(p).toUpperCase());
      for (const pref of prefs) {
        if (!pref) continue;
        if (remaining[pref] > 0) {
          const updated = await prisma.student.update({
            where: { id: s.id },
            data: {
              seatAllotted: pref,
              seatStatus: "PENDING",
              notification: `You have been allotted ${pref}. Please accept or reject your seat.`,
            },
          });
          updates.push({ id: updated.id, seatAllotted: pref });
          remaining[pref] -= 1;
          break;
        }
      }
    }

    return NextResponse.json({ success: true, allocated: updates.length, details: { capacities, allocatedCounts, remaining } });
  } catch (err) {
    console.error("Auto-allot error:", err);
    return NextResponse.json({ error: "Server error during auto-allot" }, { status: 500 });
  }
}
