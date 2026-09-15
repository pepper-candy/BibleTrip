import Link from "next/link";
import { DoorOpen, LayoutDashboard, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeviceTour } from "@/lib/sessions";
import { cn } from "@/lib/utils";

export function ReturningPortals({ tours }: { tours: DeviceTour[] }) {
  if (tours.length === 0) return null;

  return (
    <Card className="ring-2 ring-primary/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DoorOpen className="size-5 text-primary" />
          傳送門
        </CardTitle>
        <CardDescription>這部裝置已經加入或主持過旅行團，可直接進入已有的計劃。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tours.map((tour) => (
          <div
            key={tour.code}
            className="rounded-xl bg-muted/60 px-4 py-3 ring-1 ring-foreground/8"
          >
            <p className="font-medium">{tour.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              邀請碼 <span className="invite-code font-semibold text-foreground">{tour.code}</span>
              {tour.participantName ? ` · 你好，${tour.participantName}` : null}
              {tour.isHost ? " · 主持人" : null}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {tour.participantName ? (
                <Link
                  href={`/t/${tour.code}`}
                  className={cn(buttonVariants(), "h-12 flex-1 text-base")}
                >
                  <Sparkles data-icon="inline-start" />
                  進入讀經
                </Link>
              ) : null}
              {tour.isHost ? (
                <Link
                  href={`/host/${tour.code}`}
                  className={cn(
                    buttonVariants({ variant: tour.participantName ? "outline" : "default" }),
                    "h-12 flex-1 text-base",
                  )}
                >
                  <LayoutDashboard data-icon="inline-start" />
                  進入主持頁
                </Link>
              ) : null}
              {!tour.participantName && !tour.isHost ? (
                <Link
                  href={`/j/${tour.code}`}
                  className={cn(buttonVariants(), "h-12 flex-1 text-base")}
                >
                  <Sparkles data-icon="inline-start" />
                  進入計劃
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
