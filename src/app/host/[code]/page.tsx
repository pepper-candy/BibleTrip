import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HostDashboard } from "@/components/host-dashboard";
import { HostUnlock } from "@/components/host-unlock";
import { SiteShell } from "@/components/site-shell";
import { isValidCode, normalizeCode, tokensMatch } from "@/lib/codes";
import { readHostToken } from "@/lib/cookies";
import { todayInHongKong } from "@/lib/dates";
import { getScheduleDay, getScheduleDays } from "@/lib/schedule";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "主持進度",
};

export const dynamic = "force-dynamic";

export default async function HostDashboardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const code = normalizeCode((await params).code);
  if (!isValidCode(code)) notFound();

  const store = getStore();
  const event = await store.getEvent(code);
  if (!event) {
    return (
      <SiteShell title="找不到活動" subtitle="這個邀請碼還沒有對應的旅行團。">
        <p className="text-sm text-muted-foreground">請回到首頁重新建立，或檢查連結。</p>
      </SiteShell>
    );
  }

  const token = await readHostToken(code);
  if (!token || !tokensMatch(token, event.hostToken)) {
    return (
      <SiteShell
        kicker="主持人"
        title="確認主持身分"
        subtitle="這部裝置尚未登入主持。請貼上建立活動時顯示的主持密鑰。"
      >
        <HostUnlock code={code} />
      </SiteShell>
    );
  }

  const today = todayInHongKong();
  const selectedDate = getScheduleDay(today)?.date ?? getScheduleDays()[0].date;
  const [participants, completions, counts] = await Promise.all([
    store.listParticipants(code),
    store.listCompletions(code, selectedDate),
    store.dailyCounts(
      code,
      getScheduleDays().map((day) => day.date),
    ),
  ]);

  return (
    <SiteShell wide>
      <HostDashboard
        code={code}
        initial={{
          event: {
            code: event.code,
            title: event.title,
            org: event.org,
            season: event.season,
            createdAt: event.createdAt,
            hostToken: event.hostToken,
          },
          today,
          selectedDate,
          participants,
          completions,
          counts,
          joined: participants.length,
          finished: completions.length,
        }}
      />
    </SiteShell>
  );
}
