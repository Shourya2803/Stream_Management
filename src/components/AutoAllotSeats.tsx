"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AutoAllotSeats() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAutoAllot = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auto-allot", { method: "POST" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(payload?.error || "Auto-allot failed");
      } else {
        // build a short description from returned details (remaining seats per branch)
        const details = payload?.details;
        let desc: string | undefined = undefined;
        try {
          if (details && details.remaining) {
            const parts: string[] = [];
            for (const k of Object.keys(details.remaining)) {
              parts.push(`${k}: ${details.remaining[k]} remaining`);
            }
            desc = parts.join(" • ");
          }
        } catch (e) {
          // ignore
        }

        toast.success(`Auto-allot completed — allocated ${payload?.allocated ?? 0} seats.`, { description: desc });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error during auto-allot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <Button onClick={handleAutoAllot} disabled={loading} size="sm">
        {loading ? "Allotting..." : "Auto Allot Seats"}
      </Button>
    </div>
  );
}
