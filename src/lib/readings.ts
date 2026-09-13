import readingsJson from "../../data/readings.json";
import { getScheduleDay } from "@/lib/schedule";
import type { DayReading } from "@/lib/types";

type ReadingsFile = {
  translation: string;
  source: {
    name: string;
    file: string;
    repository: string;
    url: string;
    license: string;
  };
  days: Record<string, DayReading>;
};

const readings = readingsJson as ReadingsFile;

export const scriptureSource = readings.source;

export function getReading(date: string): DayReading | undefined {
  return readings.days[date];
}

export function hasReading(date: string): boolean {
  return Boolean(getReading(date) && getScheduleDay(date));
}
