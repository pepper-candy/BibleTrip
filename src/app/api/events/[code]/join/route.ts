import { cookies } from "next/headers";
import { createParticipantId, isValidCode, isValidName, normalizeCode, normalizeName } from "@/lib/codes";
import { cookieBase, parseParticipantCookie, participantCookieName } from "@/lib/cookies";
import { jsonError, jsonOk } from "@/lib/http";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const code = normalizeCode((await context.params).code);
  if (!isValidCode(code)) return jsonError("邀請碼格式不正確");

  const store = getStore();
  const event = await store.getEvent(code);
  if (!event) return jsonError("找不到這個活動", 404);

  let name = "";
  try {
    const body = (await request.json()) as { name?: string };
    name = typeof body.name === "string" ? normalizeName(body.name) : "";
  } catch {
    return jsonError("請輸入顯示名稱");
  }
  if (!isValidName(name)) return jsonError("名稱需為 1–20 個字");

  const jar = await cookies();
  const existing = parseParticipantCookie(jar.get(participantCookieName(code))?.value);
  const participant = await store.upsertParticipant(code, {
    id: existing?.id ?? createParticipantId(),
    name,
    joinedAt: new Date().toISOString(),
  });

  const response = jsonOk({
    participantId: participant.id,
    name: participant.name,
    readingPath: `/t/${code}`,
  });
  response.cookies.set(
    participantCookieName(code),
    JSON.stringify({ id: participant.id, name: participant.name }),
    cookieBase(),
  );
  return response;
}
