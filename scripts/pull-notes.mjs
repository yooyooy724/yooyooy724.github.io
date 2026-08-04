// 公開版 notes/ に溜まった変更を、DesignNotes 側(正本)へ戻す。
//
// 書き込みは Action によって notes/ 側に入るため、この経路が無いと
// スマホから付けたコメントが手元の DesignNotes に永久に入らない。
// build の先頭で必ず走らせること（package.json 参照）。
//
// マージ規則は scripts/notes-merge.mjs と共通。和集合・後勝ちなので
// 何度走らせても結果は変わらない。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { emptyFeedback, mergeEvents, mergeFeedback } from "./notes-merge.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const notes = join(repoRoot, "notes");
const source = process.env.DESIGN_NOTES
  ? process.env.DESIGN_NOTES
  : join(repoRoot, "..", "IdleMinertia", "DesignNotes");

if (!existsSync(source)) {
  console.warn(`[pull-notes] 取り込み先が見つかりません: ${source}`);
  console.warn("[pull-notes] スキップします。");
  process.exit(0);
}
if (!existsSync(notes)) {
  console.warn("[pull-notes] notes/ がまだありません。スキップします。");
  process.exit(0);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

const report = [];

// --- StorySite / SteamSite / PromotionSite: feedback.json ---
for (const [dir, from] of [
  ["story", "StorySite"],
  ["steam", "SteamSite"],
  ["promotion", "PromotionSite"],
]) {
  const published = join(notes, dir, "feedback.json");
  const local = join(source, from, "feedback.json");
  if (!existsSync(published)) continue;

  const before = readJson(local, emptyFeedback());
  const after = mergeFeedback(before, readJson(published, emptyFeedback()));
  if (JSON.stringify(before) === JSON.stringify(after)) continue;

  mkdirSync(dirname(local), { recursive: true });
  writeFileSync(local, JSON.stringify(after, null, 2), "utf8");

  const n =
    Object.values(after.comments).reduce((a, b) => a + b.length, 0) -
    Object.values(before.comments || {}).reduce((a, b) => a + b.length, 0);
  report.push(`${from}(コメント +${n} / 決定 ${Object.keys(after.choices).length})`);
}

// --- IdeaBoard: events.json → 日付・作者ごとの jsonl へ振り分け ---
const publishedEvents = join(notes, "idea", "data", "events.json");
const eventsDir = join(source, "IdeaBoard", "data", "events");
if (existsSync(publishedEvents) && existsSync(eventsDir)) {
  const incoming = readJson(publishedEvents, []);

  // 既に手元にある eventId を集める
  const known = new Set();
  const { readdirSync } = await import("node:fs");
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".jsonl")) {
        for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
          const t = line.trim();
          if (!t) continue;
          try {
            const ev = JSON.parse(t);
            known.add(ev.eventId ? `id:${ev.eventId}` : `raw:${t}`);
          } catch {
            /* 壊れた行は無視 */
          }
        }
      }
    }
  };
  walk(eventsDir);

  // 手元に無いものだけを、元と同じ命名規則のファイルへ追記する
  const buckets = new Map();
  for (const ev of mergeEvents([], incoming)) {
    const k = ev.eventId ? `id:${ev.eventId}` : `raw:${JSON.stringify(ev)}`;
    if (known.has(k)) continue;
    const d = new Date(ev.at || Date.now());
    const day = isNaN(d.getTime()) ? new Date() : d;
    const y = String(day.getFullYear());
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");
    const author = String(ev.author || "user")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "user";
    const file = join(eventsDir, y, m, `${y}-${m}-${dd}_${author}.jsonl`);
    if (!buckets.has(file)) buckets.set(file, []);
    buckets.get(file).push(ev);
  }

  let added = 0;
  for (const [file, list] of buckets) {
    mkdirSync(dirname(file), { recursive: true });
    const prev = existsSync(file) ? readFileSync(file, "utf8") : "";
    const tail = prev && !prev.endsWith("\n") ? "\n" : "";
    writeFileSync(file, prev + tail + list.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf8");
    added += list.length;
  }
  if (added) report.push(`IdeaBoard(イベント +${added})`);
}

console.log(
  report.length
    ? `[pull-notes] DesignNotes へ戻しました: ${report.join(", ")}`
    : "[pull-notes] 戻すものはありませんでした。",
);
