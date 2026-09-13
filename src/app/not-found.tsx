import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell title="找不到頁面" subtitle="連結可能已過期，或日期不在本季行程。">
      <Link href="/" className="text-sm text-primary underline">
        回到首頁
      </Link>
    </SiteShell>
  );
}
