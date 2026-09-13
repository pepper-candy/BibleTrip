"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HostUnlock({ code }: { code: string }) {
  const router = useRouter();
  const [hostToken, setHostToken] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/events/${code}/host`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "無法驗證");
      toast.success("已確認主持身分");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "無法驗證");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hostToken">主持密鑰</Label>
        <Input
          id="hostToken"
          value={hostToken}
          onChange={(e) => setHostToken(e.target.value)}
          placeholder="建立活動時顯示的密鑰"
          autoComplete="off"
          className="h-12 font-mono text-sm"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-12 w-full text-base">
        {pending ? "驗證中…" : "開啟主持頁"}
      </Button>
    </form>
  );
}
