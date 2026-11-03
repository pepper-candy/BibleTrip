"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatShortDate } from "@/lib/dates";
import {
  getAdjacentDates,
  getScheduleDay,
  getScheduleDays,
  q3EndDate,
  q4StartDate,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";

function dayLabel(day: { date: string; main: string; proverbs: string }, today: string) {
  return `${formatShortDate(day.date)}${day.date === today ? " · 今天" : ""} · ${day.main}　${day.proverbs}`;
}

export function DayNav({
  code,
  date,
  today,
  journeyDate,
}: {
  code: string;
  date: string;
  today: string;
  journeyDate?: string | null;
}) {
  const router = useRouter();
  const { prev, next } = getAdjacentDates(date);
  const days = getScheduleDays();
  const q3Days = days.filter((day) => day.seasonId === "q3");
  const q4Days = days.filter((day) => day.seasonId === "q4");
  const current = getScheduleDay(date);
  const inQ4 = current?.seasonId === "q4";
  const showToday = date !== today;
  const showJourney = Boolean(journeyDate && journeyDate !== date);
  const todayHref = getScheduleDay(today) ? `/t/${code}/${today}` : `/t/${code}?stay=1`;
  const backToQ3 = q3EndDate();
  const onToQ4 = q4StartDate();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link
          href={prev ? `/t/${code}/${prev}` : `#`}
          aria-disabled={!prev}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-lg" }),
            !prev && "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft />
        </Link>
        <form className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="day-select">
            選擇日期
          </label>
          <select
            id="day-select"
            value={date}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
            onChange={(event) => {
              router.push(`/t/${code}/${event.target.value}`);
            }}
          >
            {inQ4 ? (
              <option value={backToQ3}>← 回到第3季（{formatShortDate(backToQ3)}）</option>
            ) : null}
            <optgroup label="第3季：8月–10月">
              {q3Days.map((day) => (
                <option key={day.date} value={day.date}>
                  {dayLabel(day, today)}
                </option>
              ))}
              {!inQ4 ? (
                <option value={onToQ4}>→ 進入第4季（{formatShortDate(onToQ4)}）</option>
              ) : null}
            </optgroup>
            <optgroup label="第4季：11月–2027年1月">
              {q4Days.map((day) => (
                <option key={`q4-${day.date}`} value={day.date}>
                  {dayLabel(day, today)}
                </option>
              ))}
            </optgroup>
          </select>
        </form>
        <Link
          href={next ? `/t/${code}/${next}` : `#`}
          aria-disabled={!next}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-lg" }),
            !next && "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight />
        </Link>
      </div>
      {showToday || showJourney ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {showToday ? (
            <Link href={todayHref} className={cn(buttonVariants({ variant: "ghost" }), "h-11 flex-1")}>
              回到今天
            </Link>
          ) : null}
          {showJourney && journeyDate ? (
            <Link
              href={`/t/${code}/${journeyDate}`}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 flex-1")}
            >
              繼續我的旅程 · {formatShortDate(journeyDate)}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
