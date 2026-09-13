"use client";

import { useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribe() {
  return () => undefined;
}

export function InvitePanel({ code, hostToken }: { code: string; hostToken: string }) {
  const invitePath = `/j/${code}`;
  const inviteUrl = useSyncExternalStore(
    subscribe,
    () => `${window.location.origin}${invitePath}`,
    () => "",
  );

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`已複製${label}`);
    } catch {
      toast.error("無法複製，請手動選取");
    }
  }

  return (
    <div className="grid gap-5 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/8 sm:grid-cols-[auto_1fr]">
      <div className="mx-auto rounded-xl bg-white p-3 ring-1 ring-border">
        {inviteUrl ? (
          <QRCodeSVG value={inviteUrl} size={148} level="M" bgColor="#ffffff" fgColor="#24382f" />
        ) : (
          <div className="size-[148px] animate-pulse rounded-md bg-muted" />
        )}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground">邀請碼</p>
          <p className="invite-code mt-1 text-3xl font-semibold">{code}</p>
        </div>
        <p className="text-sm break-all text-muted-foreground">{inviteUrl || "產生連結中…"}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={() => copy(inviteUrl, "邀請連結")}
            disabled={!inviteUrl}
          >
            <Copy data-icon="inline-start" />
            複製連結
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={() => copy(code, "邀請碼")}
          >
            複製邀請碼
          </Button>
        </div>
        <div className="rounded-xl bg-muted/70 p-3">
          <p className="text-xs text-muted-foreground">主持密鑰（換裝置時使用，請妥善保存）</p>
          <button
            type="button"
            className="mt-1 w-full truncate text-left font-mono text-xs"
            onClick={() => copy(hostToken, "主持密鑰")}
          >
            {hostToken}
          </button>
        </div>
      </div>
    </div>
  );
}
