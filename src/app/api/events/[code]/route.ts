import { isValidCode, normalizeCode } from "@/lib/codes";
import { jsonError, jsonOk } from "@/lib/http";
import { schedule } from "@/lib/schedule";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const code = normalizeCode((await context.params).code);
  if (!isValidCode(code)) return jsonError("邀請碼格式不正確", 400);

  const event = await getStore().getEvent(code);
  if (!event) return jsonError("找不到這個活動", 404);

  return jsonOk({
    code: event.code,
    title: event.title,
    org: event.org,
    program: schedule.program,
    season: event.season,
    translation: schedule.translation,
  });
}
