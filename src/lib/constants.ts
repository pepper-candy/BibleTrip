export const TIMEZONE = "Asia/Hong_Kong";
export const SEASON_START = "2026-08-01";
export const SEASON_END = "2026-10-31";

export const DEFAULT_TITLE = "聖經旅行團｜2026 信心之旅（第3季）";

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 120;

export function hostCookieName(code: string) {
  return `host_${code.toUpperCase()}`;
}

export function participantCookieName(code: string) {
  return `p_${code.toUpperCase()}`;
}
