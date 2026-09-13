import type { Metadata } from "next";
import { CreateEventForm } from "@/components/create-event-form";
import { SiteShell } from "@/components/site-shell";
import { schedule } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "建立活動",
};

export default function HostNewPage() {
  return (
    <SiteShell
      kicker="主持人"
      title="建立本季活動"
      subtitle={`${schedule.org} · ${schedule.season}。建立後會得到 6 位邀請碼、分享連結與 QR。`}
    >
      <CreateEventForm />
    </SiteShell>
  );
}
