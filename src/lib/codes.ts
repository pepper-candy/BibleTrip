import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { CODE_ALPHABET, CODE_LENGTH } from "@/lib/constants";

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidCode(value: string): boolean {
  const code = normalizeCode(value);
  return code.length === CODE_LENGTH && [...code].every((ch) => CODE_ALPHABET.includes(ch));
}

export function createInviteCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

export function createHostToken(): string {
  return randomBytes(24).toString("base64url");
}

export function createParticipantId(): string {
  return randomBytes(16).toString("hex");
}

export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function isValidName(value: string): boolean {
  const name = normalizeName(value);
  return name.length >= 1 && name.length <= 20;
}
