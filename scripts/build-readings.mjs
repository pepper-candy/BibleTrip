#!/usr/bin/env node
/**
 * Resolve every scheduled reference to Traditional Chinese Union Version (和合本) text.
 *
 * Source: seven1m/open-bibles `chi-cuv.usfx.xml`
 * https://github.com/seven1m/open-bibles
 * Public-domain Chinese Union Version (Traditional), 1919.
 *
 * Usage:
 *   node scripts/build-readings.mjs
 *
 * Downloads the USFX file into data/cache/ (gitignored) unless CUV_USFX_PATH is set.
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schedulePath = join(root, "data", "schedule-2026-q3.json");
const outPath = join(root, "data", "readings.json");
const cacheDir = join(root, "data", "cache");
const defaultUsfxPath = join(cacheDir, "chi-cuv.usfx.xml");
const USFX_URL =
  process.env.CUV_USFX_URL ||
  "https://raw.githubusercontent.com/seven1m/open-bibles/master/chi-cuv.usfx.xml";

const BOOK_MAP = {
  徒: { id: "ACT", name: "使徒行傳" },
  羅: { id: "ROM", name: "羅馬書" },
  林前: { id: "1CO", name: "哥林多前書" },
  林後: { id: "2CO", name: "哥林多後書" },
  加: { id: "GAL", name: "加拉太書" },
  弗: { id: "EPH", name: "以弗所書" },
  腓: { id: "PHP", name: "腓立比書" },
  西: { id: "COL", name: "歌羅西書" },
  箴: { id: "PRO", name: "箴言" },
};

const REF_RE = /^(徒|羅|林前|林後|加|弗|腓|西|箴)(\d+)(?::(\d+)(?:-(\d+))?)?$/;

function parseRef(ref) {
  const m = REF_RE.exec(ref);
  if (!m) throw new Error(`Unrecognized reference: ${ref}`);
  const [, abbr, chapter, start, end] = m;
  const book = BOOK_MAP[abbr];
  return {
    abbr,
    bookId: book.id,
    bookName: book.name,
    chapter: Number(chapter),
    start: start ? Number(start) : null,
    end: end ? Number(end) : start ? Number(start) : null,
  };
}

function formatTitle(parsed) {
  if (!parsed.start) return `${parsed.bookName} ${parsed.chapter}`;
  if (parsed.start === parsed.end) {
    return `${parsed.bookName} ${parsed.chapter}:${parsed.start}`;
  }
  return `${parsed.bookName} ${parsed.chapter}:${parsed.start}-${parsed.end}`;
}

function stripXml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, "")
    .trim();
}

function parseUsfx(xml) {
  const books = {};
  const bookRe = /<book id="([A-Z0-9]+)">([\s\S]*?)<\/book>/g;
  let bookMatch;
  while ((bookMatch = bookRe.exec(xml))) {
    const bookId = bookMatch[1];
    const body = bookMatch[2];
    const chapters = {};
    const parts = body.split(/<c id="(\d+)"\s*\/>/);
    for (let i = 1; i < parts.length; i += 2) {
      const chapter = Number(parts[i]);
      const chunk = parts[i + 1] ?? "";
      const verses = {};
      const verseRe = /<v id="(\d+[a-z]?)"\s*\/>([\s\S]*?)<ve\s*\/?>/g;
      let verseMatch;
      while ((verseMatch = verseRe.exec(chunk))) {
        const n = Number(String(verseMatch[1]).replace(/[a-z]/g, ""));
        const text = stripXml(verseMatch[2]);
        if (!Number.isFinite(n) || !text) continue;
        verses[n] = verses[n] ? `${verses[n]}${text}` : text;
      }
      chapters[chapter] = verses;
    }
    books[bookId] = chapters;
  }
  return books;
}

function resolvePassage(books, ref) {
  const parsed = parseRef(ref);
  const chapter = books[parsed.bookId]?.[parsed.chapter];
  if (!chapter) {
    throw new Error(`Missing chapter for ${ref} (${parsed.bookId} ${parsed.chapter})`);
  }
  const verseNums = Object.keys(chapter)
    .map(Number)
    .sort((a, b) => a - b);
  const start = parsed.start ?? verseNums[0];
  const end = parsed.end ?? verseNums[verseNums.length - 1];
  const verses = [];
  for (let v = start; v <= end; v++) {
    const text = chapter[v];
    if (!text) {
      throw new Error(`Missing verse ${ref} → ${parsed.bookName} ${parsed.chapter}:${v}`);
    }
    verses.push({ chapter: parsed.chapter, verse: v, text });
  }
  return {
    ref,
    title: formatTitle(parsed),
    bookName: parsed.bookName,
    chapter: parsed.chapter,
    verses,
  };
}

async function ensureUsfx() {
  const custom = process.env.CUV_USFX_PATH;
  if (custom && existsSync(custom)) return custom;
  if (existsSync(defaultUsfxPath)) return defaultUsfxPath;
  mkdirSync(cacheDir, { recursive: true });
  console.log(`Downloading ${USFX_URL}`);
  const res = await fetch(USFX_URL);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download CUV USFX: ${res.status} ${res.statusText}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(defaultUsfxPath));
  return defaultUsfxPath;
}

async function main() {
  const schedule = JSON.parse(readFileSync(schedulePath, "utf8"));
  if (!Array.isArray(schedule.days) || schedule.days.length !== 92) {
    throw new Error(`Expected 92 scheduled days, got ${schedule.days?.length}`);
  }

  const usfxPath = await ensureUsfx();
  const xml = readFileSync(usfxPath, "utf8");
  const books = parseUsfx(xml);

  const days = {};
  for (const day of schedule.days) {
    days[day.date] = {
      date: day.date,
      main: resolvePassage(books, day.main),
      proverbs: resolvePassage(books, day.proverbs),
    };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    translation: "和合本（繁體）",
    source: {
      name: "Chinese Union Version, Traditional Chinese (1919)",
      file: "chi-cuv.usfx.xml",
      repository: "https://github.com/seven1m/open-bibles",
      url: USFX_URL,
      license: "Public Domain",
    },
    days,
  };

  writeFileSync(outPath, JSON.stringify(payload));
  const sample = days["2026-08-01"];
  console.log(
    `Wrote ${Object.keys(days).length} days → ${outPath} (${Math.round(
      Buffer.byteLength(JSON.stringify(payload)) / 1024,
    )} KB)`,
  );
  console.log(`Sample ${sample.date} ${sample.main.ref}: ${sample.main.verses[0].text.slice(0, 28)}…`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
