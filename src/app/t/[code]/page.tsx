import type { Metadata } from "next";
import { TourReadingPage } from "@/components/tour-reading-page";

export const metadata: Metadata = {
  title: "今日讀經",
};

export const dynamic = "force-dynamic";

export default async function TodayReadingPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ stay?: string }>;
}) {
  const { code } = await params;
  const { stay } = await searchParams;
  return <TourReadingPage code={code} preferToday={stay === "1"} />;
}
