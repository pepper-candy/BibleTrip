"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { InvitePanel } from "@/components/invite-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatHktDateTime, formatLongDate, formatShortDate } from "@/lib/dates";
import { getScheduleDays } from "@/lib/schedule";
import type { Completion, Participant } from "@/lib/types";

type DashboardPayload = {
  event: {
    code: string;
    title: string;
    org: string;
    season: string;
    createdAt: string;
    hostToken: string;
  };
  today: string;
  selectedDate: string;
  participants: Participant[];
  completions: Completion[];
  counts: Record<string, number>;
  joined: number;
  finished: number;
};

export function HostDashboard({
  code,
  initial,
}: {
  code: string;
  initial: DashboardPayload;
}) {
  const [data, setData] = useState(initial);
  const [sort, setSort] = useState<"newest" | "name">("newest");
  const [query, setQuery] = useState("");
  const days = getScheduleDays();

  const load = useCallback(
    async (date: string) => {
      const res = await fetch(`/api/events/${code}/dashboard?date=${date}`, { cache: "no-store" });
      const next = (await res.json()) as DashboardPayload & { error?: string };
      if (!res.ok) throw new Error(next.error || "無法更新");
      setData(next);
    },
    [code],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load(data.selectedDate).catch(() => undefined);
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [data.selectedDate, load]);

  const finishedIds = useMemo(
    () => new Set(data.completions.map((item) => item.participantId)),
    [data.completions],
  );

  const visible = useMemo(() => {
    const q = query.trim();
    const rows = data.completions.filter((row) => !q || row.name.includes(q));
    if (sort === "name") {
      return [...rows].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
    }
    return rows;
  }, [data.completions, query, sort]);

  const unfinished = data.participants.filter((p) => !finishedIds.has(p.id));
  const dayMeta = days.find((day) => day.date === data.selectedDate);

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <p className="text-xs tracking-[0.16em] text-muted-foreground">{data.event.org}</p>
        <h1 className="text-2xl font-semibold text-pretty">{data.event.title}</h1>
        <p className="text-sm text-muted-foreground">{data.event.season}</p>
      </section>

      <InvitePanel code={data.event.code} hostToken={data.event.hostToken} />

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
          <p className="text-xs text-muted-foreground">已加入</p>
          <p className="mt-1 text-3xl font-semibold">{data.joined}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
          <p className="text-xs text-muted-foreground">
            {data.selectedDate === data.today ? "今日完成" : "是日完成"}
          </p>
          <p className="mt-1 text-3xl font-semibold">
            {data.finished}
            <span className="text-base font-normal text-muted-foreground">/{data.joined || 0}</span>
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-medium">完成名單</h2>
            <p className="text-xs text-muted-foreground">{formatLongDate(data.selectedDate)}</p>
          </div>
          <Badge variant="secondary">{dayMeta ? `${dayMeta.main} · ${dayMeta.proverbs}` : "—"}</Badge>
        </div>
        <select
          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={data.selectedDate}
          onChange={(event) => {
            load(event.target.value).catch((err) =>
              toast.error(err instanceof Error ? err.message : "無法切換日期"),
            );
          }}
        >
          {days.map((day) => (
            <option key={day.date} value={day.date}>
              {formatShortDate(day.date)}
              {day.date === data.today ? " · 今天" : ""} · {day.main} · 完成 {data.counts[day.date] ?? 0}
            </option>
          ))}
        </select>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋名字"
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant={sort === "newest" ? "default" : "outline"}
              className="h-10 flex-1"
              onClick={() => setSort("newest")}
            >
              最新
            </Button>
            <Button
              type="button"
              variant={sort === "name" ? "default" : "outline"}
              className="h-10 flex-1"
              onClick={() => setSort("name")}
            >
              姓名
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() =>
                load(data.selectedDate).catch((err) =>
                  toast.error(err instanceof Error ? err.message : "無法更新"),
                )
              }
            >
              重新整理
            </Button>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {data.joined === 0 ? "尚未有參加者加入。" : "這一天還沒有人完成閱讀。"}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((row) => (
              <li key={row.participantId} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">香港時間</p>
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatHktDateTime(row.finishedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {unfinished.length > 0 ? (
        <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
          <h2 className="font-medium">尚未完成（{unfinished.length}）</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {unfinished.map((person) => (
              <li key={person.id}>
                <Badge variant="outline">{person.name}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
