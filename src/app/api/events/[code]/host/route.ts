import { isValidCode, normalizeCode, tokensMatch } from "@/lib/codes";
import { cookieBase, hostCookieName } from "@/lib/cookies";
import { jsonError, jsonOk } from "@/lib/http";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const code = normalizeCode((await context.params).code);
  if (!isValidCode(code)) return jsonError("邀請碼格式不正確");

  const event = await getStore().getEvent(code);
  if (!event) return jsonError("找不到這個活動", 404);

  let hostToken = "";
  try {
    const body = (await request.json()) as { hostToken?: string };
    hostToken = typeof body.hostToken === "string" ? body.hostToken.trim() : "";
  } catch {
    return jsonError("請輸入主持密鑰");
  }
  if (!hostToken || !tokensMatch(hostToken, event.hostToken)) {
    return jsonError("主持密鑰不正確", 401);
  }

  const response = jsonOk({ ok: true, hostPath: `/host/${code}` });
  response.cookies.set(hostCookieName(code), event.hostToken, cookieBase());
  return response;
}
