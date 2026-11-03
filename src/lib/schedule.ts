import scheduleJson from "../../data/schedule-2026-q4.json";
import type { ScheduleDay, SeasonSchedule } from "@/lib/types";

export const schedule = scheduleJson as SeasonSchedule;

const daysByDate = new Map(schedule.days.map((day) => [day.date, day]));

/** Live season line for UI — follows the deployed schedule, not the invite’s frozen event.title. */
export function seasonDisplayTitle(): string {
  return `聖經旅行團｜${schedule.season}`;
}

export function getScheduleDays(): ScheduleDay[] {
  return schedule.days;
}

export function getScheduleDay(date: string): ScheduleDay | undefined {
  return daysByDate.get(date);
}

export function getAdjacentDates(date: string): { prev?: string; next?: string } {
  const index = schedule.days.findIndex((day) => day.date === date);
  if (index < 0) return {};
  return {
    prev: schedule.days[index - 1]?.date,
    next: schedule.days[index + 1]?.date,
  };
}
