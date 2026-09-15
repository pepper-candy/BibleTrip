import { cookies } from "next/headers";
import { isValidCode } from "@/lib/codes";
import { parseParticipantCookie } from "@/lib/cookies";
import { getStore } from "@/lib/store";

export type DeviceTour = {
  code: string;
  title: string;
  isHost: boolean;
  participantName?: string;
};

export async function listDeviceTours(): Promise<DeviceTour[]> {
  const jar = await cookies();
  const hosted = new Set<string>();
  const joined = new Map<string, string>();

  for (const cookie of jar.getAll()) {
    if (cookie.name.startsWith("host_")) {
      const code = cookie.name.slice("host_".length);
      if (isValidCode(code) && cookie.value) hosted.add(code);
      continue;
    }
    if (cookie.name.startsWith("p_")) {
      const code = cookie.name.slice("p_".length);
      const identity = parseParticipantCookie(cookie.value);
      if (isValidCode(code) && identity) joined.set(code, identity.name);
    }
  }

  const codes = [...new Set([...hosted, ...joined.keys()])].sort();
  if (codes.length === 0) return [];

  const store = getStore();
  const tours = await Promise.all(
    codes.map(async (code) => {
      const event = await store.getEvent(code);
      return {
        code,
        title: event?.title || "讀經旅行團",
        isHost: hosted.has(code),
        participantName: joined.get(code),
      } satisfies DeviceTour;
    }),
  );

  return tours;
}
