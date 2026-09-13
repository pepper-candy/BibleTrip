import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JoinNameForm } from "@/components/join-forms";
import { SiteShell } from "@/components/site-shell";
import { isValidCode, normalizeCode } from "@/lib/codes";
import { readParticipant } from "@/lib/cookies";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "加入旅行團",
};

export const dynamic = "force-dynamic";

export default async function JoinCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ again?: string }>;
}) {
  const code = normalizeCode((await params).code);
  if (!isValidCode(code)) redirect("/join");

  const event = await getStore().getEvent(code);
  if (!event) {
    return (
      <SiteShell title="找不到活動" subtitle="這個邀請碼還沒有對應的旅行團，請向主持人確認。">
        <a href="/join" className="text-sm text-primary underline">
          重新輸入
        </a>
      </SiteShell>
    );
  }

  const identity = await readParticipant(code);
  const again = (await searchParams).again;
  if (identity && again !== "1") {
    redirect(`/t/${code}`);
  }

  return (
    <SiteShell
      kicker={event.org}
      title={event.title}
      subtitle={`${event.season}。填上顯示名稱後，會立刻看到今日和合本經文。`}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        邀請碼 <span className="invite-code font-semibold text-foreground">{code}</span>
      </p>
      <JoinNameForm code={code} defaultName={identity?.name} />
    </SiteShell>
  );
}
