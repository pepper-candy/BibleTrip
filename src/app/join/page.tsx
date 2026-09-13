import type { Metadata } from "next";
import { EnterCodeForm } from "@/components/join-forms";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "輸入邀請碼",
};

export default function JoinPage() {
  return (
    <SiteShell
      kicker="參加者"
      title="輸入邀請碼"
      subtitle="主持人分享的 6 位代碼，或直接開啟邀請連結。"
    >
      <EnterCodeForm />
    </SiteShell>
  );
}
