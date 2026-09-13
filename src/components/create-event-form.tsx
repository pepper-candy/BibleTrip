"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_TITLE } from "@/lib/constants";

export function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = (await res.json()) as { error?: string; hostPath?: string };
      if (!res.ok) throw new Error(data.error || "無法建立活動");
      toast.success("活動已建立");
      router.push(data.hostPath ?? "/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "無法建立活動");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">活動名稱</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          required
          className="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          將使用本季固定行程（2026-08-01 至 2026-10-31），並產生邀請碼。
        </p>
      </div>
      <Button type="submit" disabled={pending} className="h-12 w-full text-base">
        {pending ? "建立中…" : "建立本季活動"}
      </Button>
    </form>
  );
}
