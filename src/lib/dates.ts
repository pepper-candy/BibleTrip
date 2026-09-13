import { SEASON_END, SEASON_START, TIMEZONE } from "@/lib/constants";

export function todayInHongKong(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function seasonStatus(date = todayInHongKong()): "before" | "active" | "after" {
  if (date < SEASON_START) return "before";
  if (date > SEASON_END) return "after";
  return "active";
}

export function formatLongDate(date: string): string {
  const d = new Date(`${date}T12:00:00+08:00`);
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

export function formatShortDate(date: string): string {
  const d = new Date(`${date}T12:00:00+08:00`);
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: TIMEZONE,
    month: "numeric",
    day: "numeric",
  }).format(d);
}

export function formatHktDateTime(iso: string): string {
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function isValidDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
