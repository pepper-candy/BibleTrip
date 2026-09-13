"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeCode } from "@/lib/codes";

export function EnterCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = normalizeCode(code);
    if (next.length < 6) {
      toast.error("請輸入 6 位邀請碼");
      return;
    }
    router.push(`/j/${next}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">邀請碼</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="例如 K7MP2H"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="invite-code h-14 text-center text-xl font-semibold"
        />
      </div>
      <Button type="submit" className="h-12 w-full text-base">
        繼續
      </Button>
    </form>
  );
}

export function JoinNameForm({
  code,
  defaultName,
}: {
  code: string;
  defaultName?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName ?? "");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/events/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as { error?: string; readingPath?: string };
      if (!res.ok) throw new Error(data.error || "無法加入");
      toast.success("已加入，開始今日讀經");
      router.push(data.readingPath ?? `/t/${code}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "無法加入");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">你的顯示名稱</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如 小明"
          maxLength={20}
          required
          autoComplete="nickname"
          className="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          主持人會看到這個名字與完成時間。同一部手機重開連結會記住你。
        </p>
      </div>
      <Button type="submit" disabled={pending} className="h-12 w-full text-base">
        {pending ? "加入中…" : "開始今日讀經"}
      </Button>
    </form>
  );
}
