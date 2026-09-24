import { getScheduleDays } from "@/lib/schedule";

/**
 * Date for「繼續我的旅程」.
 *
 * A participant with no completions is new: there is no journey yet, so callers
 * leave them on today. Otherwise this is the schedule day after their latest
 * completion, when that day is still due. Skipped days before that latest
 * completion are left behind, so the pointer stays on the leading edge.
 * If they have already reached today but earlier days are still open, this is
 * the latest unfinished day on or before today.
 */
export function journeyDateFor(completedDates: Iterable<string>, today: string): string | null {
  const completed = new Set(completedDates);
  const days = getScheduleDays();
  const completedDays = days.filter((day) => completed.has(day.date));
  if (completedDays.length === 0) return null;

  const unfinished = days.filter((day) => day.date <= today && !completed.has(day.date));
  if (unfinished.length === 0) return null;

  const lastDone = completedDays[completedDays.length - 1].date;
  const next = days.find((day) => day.date > lastDone);
  if (next && next.date <= today && !completed.has(next.date)) return next.date;

  return unfinished[unfinished.length - 1].date;
}
