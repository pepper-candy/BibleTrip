import type { Metadata } from "next";
import { TourReadingPage } from "@/components/tour-reading-page";

export const metadata: Metadata = {
  title: "今日讀經",
};

export const dynamic = "force-dynamic";

export default async function TodayReadingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <TourReadingPage code={code} />;
}
