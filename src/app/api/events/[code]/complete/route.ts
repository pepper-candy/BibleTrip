import { isValidCode, normalizeCode } from "@/lib/codes";
import { readParticipant } from "@/lib/cookies";
import { isValidDateKey } from "@/lib/dates";
import { jsonError, jsonOk } from "@/lib/http";
import { hasReading } from "@/lib/readings";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const code = normalizeCode((await context.params).code);
  if (!isValidCode(code)) return jsonError("邀請碼格式不正確");

  const identity = await readParticipant(code);
  if (!identity) return jsonError("請先加入活動", 401);

  let date = "";
  try {
    const body = (await request.json()) as { date?: string };
    date = typeof body.date === "string" ? body.date : "";
  } catch {
    return jsonError("請提供日期");
  }
  if (!isValidDateKey(date) || !hasReading(date)) {
    return jsonError("這一天不在本季行程");
  }

  const store = getStore();
  const event = await store.getEvent(code);
  if (!event) return jsonError("找不到這個活動", 404);

  const participant = await store.getParticipant(code, identity.id);
  if (!participant) return jsonError("請重新加入活動", 401);

  const completion = await store.markComplete(code, date, {
    participantId: participant.id,
    name: participant.name,
    finishedAt: new Date().toISOString(),
  });

  return jsonOk({ completion });
}
