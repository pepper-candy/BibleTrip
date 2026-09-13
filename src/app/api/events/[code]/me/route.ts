import { isValidCode, normalizeCode } from "@/lib/codes";
import { readParticipant } from "@/lib/cookies";
import { isValidDateKey, todayInHongKong } from "@/lib/dates";
import { jsonError, jsonOk } from "@/lib/http";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const code = normalizeCode((await context.params).code);
  if (!isValidCode(code)) return jsonError("邀請碼格式不正確");

  const identity = await readParticipant(code);
  if (!identity) return jsonOk({ participant: null, completion: null });

  const date = new URL(request.url).searchParams.get("date") ?? todayInHongKong();
  if (!isValidDateKey(date)) return jsonError("日期格式不正確");

  const store = getStore();
  const participant = await store.getParticipant(code, identity.id);
  const completion = participant
    ? await store.getCompletion(code, date, participant.id)
    : null;

  return jsonOk({
    participant: participant ? { id: participant.id, name: participant.name } : null,
    completion,
  });
}
