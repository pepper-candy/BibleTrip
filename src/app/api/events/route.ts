import { NextResponse } from "next/server";
import { DEFAULT_TITLE, hostCookieName } from "@/lib/constants";
import { cookieBase } from "@/lib/cookies";
import { createHostToken, createInviteCode } from "@/lib/codes";
import { jsonOk } from "@/lib/http";
import { schedule } from "@/lib/schedule";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let title = DEFAULT_TITLE;
  try {
    const body = (await request.json()) as { title?: string };
    if (typeof body.title === "string" && body.title.trim()) {
      title = body.title.trim().slice(0, 80);
    }
  } catch {
    // empty body is fine
  }

  const store = getStore();
  let code = createInviteCode();
  for (let i = 0; i < 5; i++) {
    if (!(await store.getEvent(code))) break;
    code = createInviteCode();
  }

  const event = await store.createEvent({
    code,
    title,
    org: schedule.org,
    season: schedule.season,
    hostToken: createHostToken(),
    createdAt: new Date().toISOString(),
  });

  const response = jsonOk({
    code: event.code,
    title: event.title,
    hostToken: event.hostToken,
    invitePath: `/j/${event.code}`,
    hostPath: `/host/${event.code}`,
  });

  response.cookies.set(hostCookieName(event.code), event.hostToken, cookieBase());
  return response;
}

export async function GET() {
  return NextResponse.json({
    org: schedule.org,
    program: schedule.program,
    season: schedule.season,
    translation: schedule.translation,
    timezone: schedule.timezone,
  });
}
