import { isValidCode, normalizeCode, tokensMatch } from "@/lib/codes";
import { readHostToken } from "@/lib/cookies";
import { isValidDateKey, todayInHongKong } from "@/lib/dates";
import { jsonError, jsonOk } from "@/lib/http";
import { getScheduleDays, getScheduleDay } from "@/lib/schedule";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

async function authorize(request: Request, code: string) {
  const store = getStore();
  const event = await store.getEvent(code);
  if (!event) return { event: null, ok: false as const };
  const header = request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const cookieToken = await readHostToken(code);
  const ok = Boolean(
    (cookieToken && tokensMatch(cookieToken, event.hostToken)) ||
      (bearer && tokensMatch(bearer, event.hostToken)),
  );
  return { event, ok };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const code = normalizeCode((await context.params).code);
  if (!isValidCode(code)) return jsonError("邀請碼格式不正確");

  const { event, ok } = await authorize(request, code);
  if (!event) return jsonError("找不到這個活動", 404);
  if (!ok) return jsonError("需要主持權限", 401);

  const url = new URL(request.url);
  const today = todayInHongKong();
  const requested = url.searchParams.get("date") ?? today;
  const selectedDate = getScheduleDay(requested)?.date ?? (getScheduleDay(today)?.date ?? getScheduleDays()[0].date);
  if (!isValidDateKey(selectedDate)) return jsonError("日期格式不正確");

  const store = getStore();
  const [participants, completions, counts] = await Promise.all([
    store.listParticipants(code),
    store.listCompletions(code, selectedDate),
    store.dailyCounts(
      code,
      getScheduleDays().map((day) => day.date),
    ),
  ]);

  return jsonOk({
    event: {
      code: event.code,
      title: event.title,
      org: event.org,
      season: event.season,
      createdAt: event.createdAt,
      hostToken: event.hostToken,
    },
    today,
    selectedDate,
    participants,
    completions,
    counts,
    joined: participants.length,
    finished: completions.length,
  });
}
