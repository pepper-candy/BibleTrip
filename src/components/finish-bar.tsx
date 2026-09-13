"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatHktDateTime } from "@/lib/dates";
import type { Completion } from "@/lib/types";

export function FinishBar({
  code,
  date,
  isToday,
  initial,
}: {
  code: string;
  date: string;
  isToday: boolean;
  initial: Completion | null;
}) {
  const [completion, setCompletion] = useState<Completion | null>(initial);
  const [pending, setPending] = useState(false);

  async function finish() {
    setPending(true);
    try {
      const res = await fetch(`/api/events/${code}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = (await res.json()) as { error?: string; completion?: Completion };
      if (!res.ok || !data.completion) throw new Error(data.error || "未能記錄");
      setCompletion(data.completion);
      toast.success(isToday ? "今日已完成" : "是日已完成");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "未能記錄");
    } finally {
      setPending(false);
    }
  }

  const doneLabel = isToday ? "今日已完成" : "是日已完成";

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-border/80 bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
      {completion ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 rounded-2xl bg-card px-4 py-3 text-center ring-1 ring-foreground/8">
          <p className="flex items-center gap-2 font-medium text-primary">
            <CheckCircle2 className="size-5" />
            {doneLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            完成時間（香港）{formatHktDateTime(completion.finishedAt)}
          </p>
          <Button disabled className="h-12 w-full text-base">
            {doneLabel}
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-xl">
          <Button
            onClick={finish}
            disabled={pending}
            className="h-13 w-full text-base font-semibold"
            style={{ height: "3.25rem" }}
          >
            {pending ? "記錄中…" : "完成閱讀"}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Finish · 會記錄你在這一天的完成時間
          </p>
        </div>
      )}
    </div>
  );
}
