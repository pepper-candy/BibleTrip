import Link from "next/link";
import { BookOpenText, QrCode, Users } from "lucide-react";
import { ReturningPortals } from "@/components/returning-portals";
import { TodayVerseCard } from "@/components/today-verse-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { todayInHongKong } from "@/lib/dates";
import { schedule } from "@/lib/schedule";
import { listDeviceTours } from "@/lib/sessions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = todayInHongKong();
  const tours = await listDeviceTours();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-10">
      <p className="text-xs tracking-[0.2em] text-primary">{schedule.org}</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">讀經旅行團</h1>
      <p className="mt-2 text-lg text-foreground/80">{schedule.program}</p>
      <p className="mt-1 text-sm text-muted-foreground">{schedule.season}</p>

      <TodayVerseCard initialToday={today} />

      <div className="mt-8 grid gap-4">
        <ReturningPortals tours={tours} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="size-5 text-primary" />
              我是主持人
            </CardTitle>
            <CardDescription>
              {tours.some((tour) => tour.isHost)
                ? "要再開一團，可在此建立新活動。已有的計劃請用上方傳送門進入。"
                : "建立本季活動，取得邀請碼、連結與 QR，查看誰已完成閱讀。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/host/new" className={cn(buttonVariants(), "h-12 w-full text-base")}>
              建立新活動
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              我是參加者
            </CardTitle>
            <CardDescription>
              {tours.some((tour) => tour.participantName)
                ? "已加入的計劃可用上方傳送門進入。也可輸入另一個邀請碼加入新團。"
                : "輸入邀請碼或開啟分享連結，填上名字後即可讀今日和合本。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/join" className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full text-base")}>
              輸入邀請碼
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <BookOpenText className="mt-0.5 size-4 shrink-0" />
        <p>
          本季覆蓋使徒行傳 20–28、羅馬書、哥林多前後書、加拉太書、以弗所書、腓立比書、歌羅西書，以及每日箴言。經文為公開領域
          1919 年和合本（繁體）。
        </p>
      </div>
    </div>
  );
}
