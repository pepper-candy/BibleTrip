import { cookies } from "next/headers";
import { COOKIE_MAX_AGE, hostCookieName, participantCookieName } from "@/lib/constants";
import type { Participant } from "@/lib/types";

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export function serializeParticipant(participant: Pick<Participant, "id" | "name">): string {
  return JSON.stringify({ id: participant.id, name: participant.name });
}

export function parseParticipantCookie(value: string | undefined): { id: string; name: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { id?: string; name?: string };
    if (!parsed.id || !parsed.name) return null;
    return { id: parsed.id, name: parsed.name };
  } catch {
    return null;
  }
}

export async function readHostToken(code: string): Promise<string | null> {
  const jar = await cookies();
  return jar.get(hostCookieName(code))?.value ?? null;
}

export async function readParticipant(code: string) {
  const jar = await cookies();
  return parseParticipantCookie(jar.get(participantCookieName(code))?.value);
}

export { cookieBase, hostCookieName, participantCookieName };
