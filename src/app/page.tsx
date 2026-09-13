import Link from "next/link";
import { BookOpenText, QrCode, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { todayInHongKong, seasonStatus, formatLongDate } from "@/lib/dates";
import { getScheduleDay } from "@/lib/schedule";
import { schedule } from "@/lib/schedule";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const today = todayInHongKong();
  const status = seasonStatus(today);
  const day = getScheduleDay(today);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-10">
      <p className="text-xs tracking-[0.2em] text-primary">{schedule.org}</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">讀經旅行團</h1>
      <p className="mt-2 text-lg text-foreground/80">{schedule.program}</p>
      <p className="mt-1 text-sm text-muted-foreground">{schedule.season}</p>

      <div className="mt-8 rounded-2xl bg-card/80 p-4 ring-1 ring-foreground/8">
        {status === "active" && day ? (
          <>
            <p className="text-xs tracking-[0.16em] text-muted-foreground">今日經文 · 香港時間</p>
            <p className="mt-1 font-medium">{formatLongDate(today)}</p>
            <p className="mt-1 font-serif text-lg">
              {day.main}　{day.proverbs}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">加入後即可閱讀完整和合本經文</p>
          </>
        ) : (
          <>
            <p className="font-medium">{status === "before" ? "本季尚未開始" : "本季已經結束"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              行程為 2026 年 8 月 1 日至 10 月 31 日。主持人仍可先建立活動、發出邀請。
            </p>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="size-5 text-primary" />
              我是主持人
            </CardTitle>
            <CardDescription>建立本季活動，取得邀請碼、連結與 QR，查看誰已完成閱讀。</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/host/new" className={cn(buttonVariants(), "h-12 w-full text-base")}>
              建立或管理活動
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              我是參加者
            </CardTitle>
            <CardDescription>輸入邀請碼或開啟分享連結，填上名字後即可讀今日和合本。</CardDescription>
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
