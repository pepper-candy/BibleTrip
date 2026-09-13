import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteShell({
  children,
  kicker,
  title,
  subtitle,
  wide,
}: {
  children: React.ReactNode;
  kicker?: string;
  title?: string;
  subtitle?: string;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border/70 bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="min-w-0">
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground">讀經旅行團</p>
            <p className="truncate font-medium text-foreground">2026 信心之旅</p>
          </Link>
          <p className="hidden text-right text-xs text-muted-foreground sm:block">
            大坑東堂青少年部
          </p>
        </div>
      </header>
      <main className={cn("mx-auto flex w-full flex-1 flex-col px-4 py-6", wide ? "max-w-3xl" : "max-w-xl")}>
        {(kicker || title || subtitle) && (
          <div className="mb-6 space-y-2">
            {kicker ? (
              <p className="text-xs tracking-[0.18em] text-primary uppercase">{kicker}</p>
            ) : null}
            {title ? <h1 className="text-2xl font-semibold tracking-tight text-pretty">{title}</h1> : null}
            {subtitle ? <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
