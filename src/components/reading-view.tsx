import type { DayReading, Passage } from "@/lib/types";
import { SEASON_END, SEASON_START } from "@/lib/constants";
import { schedule } from "@/lib/schedule";

function PassageBlock({ passage, kicker }: { passage: Passage; kicker: string }) {
  return (
    <section className="space-y-4">
      <div className="border-b border-border/80 pb-3">
        <p className="text-xs tracking-[0.18em] text-primary">{kicker}</p>
        <h2 className="mt-1 font-serif text-xl font-semibold">{passage.title}</h2>
        <p className="text-xs text-muted-foreground">和合本</p>
      </div>
      <div className="verse-block space-y-3 font-serif text-[1.2rem] leading-[2] text-foreground">
        {passage.verses.map((verse) => (
          <p key={`${verse.chapter}:${verse.verse}`}>
            <sup className="mr-1.5 align-super font-sans text-[0.7rem] font-medium text-primary">
              {verse.verse}
            </sup>
            {verse.text}
          </p>
        ))}
      </div>
    </section>
  );
}

function secondaryKicker(passage: Passage): string {
  if (passage.bookName.includes("詩") || passage.ref.startsWith("詩")) return "每日詩篇";
  return "每日箴言";
}

export function ReadingView({ reading }: { reading: DayReading }) {
  return (
    <article className="space-y-10 rounded-2xl bg-card/80 px-4 py-6 shadow-sm ring-1 ring-foreground/8 sm:px-6">
      <PassageBlock passage={reading.main} kicker="本日經文" />
      <PassageBlock passage={reading.proverbs} kicker={secondaryKicker(reading.proverbs)} />
    </article>
  );
}

export function SeasonGate({ status }: { status: "before" | "after" }) {
  return (
    <div className="rounded-2xl bg-card px-5 py-8 text-center shadow-sm ring-1 ring-foreground/8">
      <p className="text-xs tracking-[0.18em] text-primary">本季行程</p>
      <h2 className="mt-2 text-xl font-semibold">
        {status === "before" ? "本季尚未開始" : "本季已經結束"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {schedule.season}由 {SEASON_START} 至 {SEASON_END}。你仍可瀏覽行程中的經文，
        主持人事先建立活動也不受影響。
      </p>
    </div>
  );
}
