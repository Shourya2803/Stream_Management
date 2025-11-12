'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SeatAllotmentForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAllotment = async () => {
    // Use the dedicated allot-seat endpoint which returns the updated student
    const res = await fetch(`/api/students/${studentId}/allot-seat`, {
      method: "POST",
      body: JSON.stringify({ seat: selectedBranch }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      setStatusMessage({
        type: "success",
        text: `✅ Seat allotted: ${selectedBranch}`,
      });
      // refresh the page to show updated server-rendered student data
      router.refresh();
    } else {
      console.error("Allot-seat failed:", data);
      setStatusMessage({
        type: "error",
        text: "❌ Failed to allot seat.",
      });
    }
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
      <Select onValueChange={setSelectedBranch}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CSE">CSE</SelectItem>
          <SelectItem value="ECE">ECE</SelectItem>
          <SelectItem value="Mechanical">Mechanical</SelectItem>
          <SelectItem value="Civil">Civil</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleAllotment} disabled={!selectedBranch}>
        Allot Seat
      </Button>

      {/* Status Message */}
      {statusMessage && (
        <p
          className={`mt-2 text-sm ${
            statusMessage.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  );
}
