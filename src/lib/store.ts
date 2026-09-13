import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Redis } from "@upstash/redis";
import type { Completion, Participant, TourEvent } from "@/lib/types";

type MemoryData = {
  events: Record<string, TourEvent>;
  participants: Record<string, Record<string, Participant>>;
  completions: Record<string, Record<string, Record<string, Completion>>>;
};

export type TourStore = {
  createEvent: (event: TourEvent) => Promise<TourEvent>;
  getEvent: (code: string) => Promise<TourEvent | null>;
  upsertParticipant: (code: string, participant: Participant) => Promise<Participant>;
  getParticipant: (code: string, id: string) => Promise<Participant | null>;
  listParticipants: (code: string) => Promise<Participant[]>;
  markComplete: (code: string, date: string, completion: Completion) => Promise<Completion>;
  getCompletion: (code: string, date: string, participantId: string) => Promise<Completion | null>;
  listCompletions: (code: string, date: string) => Promise<Completion[]>;
  dailyCounts: (code: string, dates: string[]) => Promise<Record<string, number>>;
};

type GlobalStore = {
  memory: MemoryData;
  redis?: Redis;
};

const globalForStore = globalThis as typeof globalThis & { __tourStore?: GlobalStore };

function emptyData(): MemoryData {
  return { events: {}, participants: {}, completions: {} };
}

function getGlobal(): GlobalStore {
  if (!globalForStore.__tourStore) {
    globalForStore.__tourStore = { memory: emptyData() };
  }
  return globalForStore.__tourStore;
}

function redisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function getRedis(): Redis | null {
  const creds = redisCredentials();
  if (!creds) return null;
  const g = getGlobal();
  if (!g.redis) {
    g.redis = new Redis(creds);
  }
  return g.redis;
}

function parseMaybeJson<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function filePath() {
  return join(process.cwd(), ".data", "store.json");
}

function loadFileData(): MemoryData {
  const path = filePath();
  if (!existsSync(path)) return emptyData();
  try {
    return JSON.parse(readFileSync(path, "utf8")) as MemoryData;
  } catch {
    return emptyData();
  }
}

function saveFileData(data: MemoryData) {
  const path = filePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data));
}

function shouldUseFileStore() {
  return process.env.NODE_ENV !== "production" || process.env.USE_FILE_STORE === "1";
}

function createMemoryStore(persistToFile: boolean): TourStore {
  const load = (): MemoryData => {
    if (persistToFile) {
      const data = loadFileData();
      getGlobal().memory = data;
      return data;
    }
    return getGlobal().memory;
  };

  const save = (data: MemoryData) => {
    getGlobal().memory = data;
    if (persistToFile) saveFileData(data);
  };

  return {
    async createEvent(event) {
      const data = load();
      data.events[event.code] = event;
      data.participants[event.code] ??= {};
      data.completions[event.code] ??= {};
      save(data);
      return event;
    },
    async getEvent(code) {
      return load().events[code] ?? null;
    },
    async upsertParticipant(code, participant) {
      const data = load();
      data.participants[code] ??= {};
      data.participants[code][participant.id] = participant;
      save(data);
      return participant;
    },
    async getParticipant(code, id) {
      return load().participants[code]?.[id] ?? null;
    },
    async listParticipants(code) {
      return Object.values(load().participants[code] ?? {}).sort((a, b) =>
        a.joinedAt.localeCompare(b.joinedAt),
      );
    },
    async markComplete(code, date, completion) {
      const data = load();
      data.completions[code] ??= {};
      data.completions[code][date] ??= {};
      const existing = data.completions[code][date][completion.participantId];
      if (existing) {
        existing.name = completion.name;
        save(data);
        return existing;
      }
      data.completions[code][date][completion.participantId] = completion;
      save(data);
      return completion;
    },
    async getCompletion(code, date, participantId) {
      return load().completions[code]?.[date]?.[participantId] ?? null;
    },
    async listCompletions(code, date) {
      return Object.values(load().completions[code]?.[date] ?? {}).sort((a, b) =>
        b.finishedAt.localeCompare(a.finishedAt),
      );
    },
    async dailyCounts(code, dates) {
      const data = load();
      const counts: Record<string, number> = {};
      for (const date of dates) {
        counts[date] = Object.keys(data.completions[code]?.[date] ?? {}).length;
      }
      return counts;
    },
  };
}

function createRedisStore(redis: Redis): TourStore {
  const eventKey = (code: string) => `tour:event:${code}`;
  const partsKey = (code: string) => `tour:parts:${code}`;
  const doneKey = (code: string, date: string) => `tour:done:${code}:${date}`;

  return {
    async createEvent(event) {
      await redis.set(eventKey(event.code), event);
      return event;
    },
    async getEvent(code) {
      return parseMaybeJson<TourEvent>(await redis.get(eventKey(code)));
    },
    async upsertParticipant(code, participant) {
      await redis.hset(partsKey(code), { [participant.id]: JSON.stringify(participant) });
      return participant;
    },
    async getParticipant(code, id) {
      return parseMaybeJson<Participant>(await redis.hget(partsKey(code), id));
    },
    async listParticipants(code) {
      const raw = (await redis.hgetall<Record<string, unknown>>(partsKey(code))) ?? {};
      return Object.values(raw)
        .map((value) => parseMaybeJson<Participant>(value))
        .filter((p): p is Participant => Boolean(p))
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    },
    async markComplete(code, date, completion) {
      const existing = parseMaybeJson<Completion>(
        await redis.hget(doneKey(code, date), completion.participantId),
      );
      if (existing) {
        existing.name = completion.name;
        await redis.hset(doneKey(code, date), {
          [completion.participantId]: JSON.stringify(existing),
        });
        return existing;
      }
      await redis.hset(doneKey(code, date), {
        [completion.participantId]: JSON.stringify(completion),
      });
      return completion;
    },
    async getCompletion(code, date, participantId) {
      return parseMaybeJson<Completion>(await redis.hget(doneKey(code, date), participantId));
    },
    async listCompletions(code, date) {
      const raw = (await redis.hgetall<Record<string, unknown>>(doneKey(code, date))) ?? {};
      return Object.values(raw)
        .map((value) => parseMaybeJson<Completion>(value))
        .filter((c): c is Completion => Boolean(c))
        .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
    },
    async dailyCounts(code, dates) {
      if (dates.length === 0) return {};
      const pipeline = redis.pipeline();
      for (const date of dates) pipeline.hlen(doneKey(code, date));
      const results = await pipeline.exec<number[]>();
      const counts: Record<string, number> = {};
      dates.forEach((date, i) => {
        counts[date] = Number(results?.[i] ?? 0);
      });
      return counts;
    },
  };
}

export function getStore(): TourStore {
  const redis = getRedis();
  if (redis) return createRedisStore(redis);
  return createMemoryStore(shouldUseFileStore());
}

export function storeMode(): "upstash" | "file" | "memory" {
  if (redisCredentials()) return "upstash";
  return shouldUseFileStore() ? "file" : "memory";
}
