import q3Json from "../../data/schedule-2026-q3.json";
import q4Json from "../../data/schedule-2026-q4.json";
import { todayInHongKong } from "@/lib/dates";
import type { ScheduleDay, SeasonSchedule } from "@/lib/types";

export type SeasonId = "q3" | "q4";

export type TaggedScheduleDay = ScheduleDay & {
  seasonId: SeasonId;
  seasonLabel: string;
};

const q3 = q3Json as SeasonSchedule;
const q4 = q4Json as SeasonSchedule;

/** Current live season (used for new events / home kicker while today is in Q4). */
export const schedule = q4;

export const seasons: { id: SeasonId; data: SeasonSchedule }[] = [
  { id: "q3", data: q3 },
  { id: "q4", data: q4 },
];

const allDays: TaggedScheduleDay[] = [
  ...q3.days.map((day) => ({
    ...day,
    seasonId: "q3" as const,
    seasonLabel: q3.season,
  })),
  ...q4.days.map((day) => ({
    ...day,
    seasonId: "q4" as const,
    seasonLabel: q4.season,
  })),
].sort((a, b) => a.date.localeCompare(b.date));

const daysByDate = new Map(allDays.map((day) => [day.date, day]));

export function getScheduleDays(): TaggedScheduleDay[] {
  return allDays;
}

export function getScheduleDay(date: string): TaggedScheduleDay | undefined {
  return daysByDate.get(date);
}

export function getAdjacentDates(date: string): { prev?: string; next?: string } {
  const index = allDays.findIndex((day) => day.date === date);
  if (index < 0) return {};
  return {
    prev: allDays[index - 1]?.date,
    next: allDays[index + 1]?.date,
  };
}

export function seasonScheduleForDate(date: string): SeasonSchedule {
  const day = daysByDate.get(date);
  if (day?.seasonId === "q3") return q3;
  if (day?.seasonId === "q4") return q4;
  // Fall back by range
  if (date < q4.days[0].date) return q3;
  return q4;
}

/** Short UI line: 聖經旅行團｜2026 信心之旅（第N季） — no month range. */
export function seasonDisplayTitle(date?: string): string {
  const key = date ?? todayInHongKong();
  const season = seasonScheduleForDate(key).season;
  // "2026 信心之旅（第4季：11月–2027年1月）" → "2026 信心之旅（第4季）"
  const short = season.replace(/（第(\d+)季：[^）]+）/g, "（第$1季）");
  return `聖經旅行團｜${short}`;
}

export function q3EndDate(): string {
  return q3.days[q3.days.length - 1].date;
}

export function q4StartDate(): string {
  return q4.days[0].date;
}
