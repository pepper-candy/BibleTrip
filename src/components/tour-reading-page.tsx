import Link from "next/link";
import { redirect } from "next/navigation";
import { DayNav } from "@/components/day-nav";
import { FinishBar } from "@/components/finish-bar";
import { ReadingView, SeasonGate } from "@/components/reading-view";
import { SiteShell } from "@/components/site-shell";
import { isValidCode, normalizeCode } from "@/lib/codes";
import { readParticipant } from "@/lib/cookies";
import { formatLongDate, seasonStatus, todayInHongKong } from "@/lib/dates";
import { journeyDateFor } from "@/lib/progress";
import { getReading, hasReading } from "@/lib/readings";
import { getScheduleDays } from "@/lib/schedule";
import { getStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export async function TourReadingPage({
  code: rawCode,
  date: rawDate,
  preferToday = false,
}: {
  code: string;
  date?: string;
  preferToday?: boolean;
}) {
  const code = normalizeCode(rawCode);
  if (!isValidCode(code)) redirect("/join");

  const event = await getStore().getEvent(code);
  if (!event) {
    return (
      <SiteShell title="找不到活動" subtitle="邀請碼可能打錯了，或活動尚未建立。">
        <Link href="/join" className="text-sm text-primary underline">
          重新輸入邀請碼
        </Link>
      </SiteShell>
    );
  }

  const identity = await readParticipant(code);
  if (!identity) redirect(`/j/${code}`);

  const today = todayInHongKong();
  const store = getStore();
  const completedDates = await store.listCompletedDates(
    code,
    identity.id,
    getScheduleDays().map((day) => day.date),
  );
  const journeyDate = journeyDateFor(completedDates, today);
  if (!rawDate && !preferToday && journeyDate && journeyDate !== today) {
    redirect(`/t/${code}/${journeyDate}`);
  }

  const requested = rawDate ?? today;
  const status = seasonStatus(today);
  const inSeasonDay = hasReading(requested);
  const reading = inSeasonDay ? getReading(requested) : undefined;
  const completion =
    identity && reading ? await store.getCompletion(code, requested, identity.id) : null;

  return (
    <SiteShell wide>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{event.title}</p>
          <h1 className="text-xl font-semibold">
            {reading ? formatLongDate(requested) : "本季行程"}
          </h1>
          <p className="text-sm text-muted-foreground">
            你好，{identity.name} ·{" "}
            <Link href={`/j/${code}?again=1`} className="underline-offset-2 hover:underline">
              更改名稱
            </Link>
          </p>
        </div>
        <Badge variant="secondary">和合本</Badge>
      </div>

      {status !== "active" && !rawDate ? <SeasonGate status={status} /> : null}

      <div className="mt-4">
        <DayNav
          code={code}
          date={reading?.date ?? (hasReading(today) ? today : "2026-08-01")}
          today={today}
          journeyDate={journeyDate}
        />
      </div>

      {reading ? (
        <>
          <div className="mt-5 mb-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{reading.main.ref}</span>
            <span>·</span>
            <span>{reading.proverbs.ref}</span>
          </div>
          <ReadingView reading={reading} />
          <FinishBar
            code={code}
            date={reading.date}
            isToday={reading.date === today}
            initial={completion}
          />
        </>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">請從上方選擇一天，閱讀該日和合本經文。</p>
      )}
    </SiteShell>
  );
}
