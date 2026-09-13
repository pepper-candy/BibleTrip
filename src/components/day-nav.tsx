"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatShortDate } from "@/lib/dates";
import { getAdjacentDates, getScheduleDays } from "@/lib/schedule";
import { cn } from "@/lib/utils";

export function DayNav({
  code,
  date,
  today,
}: {
  code: string;
  date: string;
  today: string;
}) {
  const router = useRouter();
  const { prev, next } = getAdjacentDates(date);
  const days = getScheduleDays();

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
            {days.map((day) => (
              <option key={day.date} value={day.date}>
                {formatShortDate(day.date)}
                {day.date === today ? " · 今天" : ""} · {day.main}　{day.proverbs}
              </option>
            ))}
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
      {date !== today ? (
        <Link href={`/t/${code}`} className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
          回到今天
        </Link>
      ) : null}
    </div>
  );
}
