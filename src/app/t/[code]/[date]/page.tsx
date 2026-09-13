import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourReadingPage } from "@/components/tour-reading-page";
import { isValidDateKey } from "@/lib/dates";
import { hasReading } from "@/lib/readings";

export const metadata: Metadata = {
  title: "每日讀經",
};

export const dynamic = "force-dynamic";

export default async function DatedReadingPage({
  params,
}: {
  params: Promise<{ code: string; date: string }>;
}) {
  const { code, date } = await params;
  if (!isValidDateKey(date) || !hasReading(date)) notFound();
  return <TourReadingPage code={code} date={date} />;
}
