"use client";

import { useEffect, useState } from "react";
import { formatLongDate, seasonStatus, todayInHongKong } from "@/lib/dates";
import { getScheduleDay } from "@/lib/schedule";

export function TodayVerseCard({ initialToday }: { initialToday: string }) {
  const [today, setToday] = useState(initialToday);

  useEffect(() => {
    const sync = () => setToday(todayInHongKong());
    sync();
    const id = window.setInterval(sync, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const status = seasonStatus(today);
  const day = getScheduleDay(today);

  if (status === "active" && day) {
    return (
      <div className="mt-8 rounded-2xl bg-card/80 p-4 ring-1 ring-foreground/8">
        <p className="text-xs tracking-[0.16em] text-muted-foreground">今日經文 · 香港時間</p>
        <p className="mt-1 font-medium">{formatLongDate(today)}</p>
        <p className="mt-1 font-serif text-lg">
          {day.main}　{day.proverbs}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">加入後即可閱讀完整和合本經文</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl bg-card/80 p-4 ring-1 ring-foreground/8">
      <p className="font-medium">{status === "before" ? "本季尚未開始" : "本季已經結束"}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        行程為 2026 年 8 月 1 日至 10 月 31 日。主持人仍可先建立活動、發出邀請。
      </p>
    </div>
  );
}
