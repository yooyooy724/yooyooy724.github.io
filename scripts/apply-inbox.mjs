// Issue 本文の payload を notes/ の公開データへ適用する。
// GitHub Actions (.github/workflows/notes-inbox.yml) から呼ばれる。
//
// 入力: 環境変数 ISSUE_BODY
// 出力: notes/<site>/feedback.json もしくは notes/idea/data/events.json を更新
//       GITHUB_OUTPUT に summary= を書き出す(Issue へのコメントに使う)
//
// 呼び出し元で「Issue の作成者 == リポジトリ所有者」を検証済みである前提だが、
// ここでも payload の形は厳しく見る。
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { emptyFeedback, mergeEvents, mergeFeedback, parsePayload } from "./notes-merge.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function fail(msg) {
  console.error(`[apply-inbox] ${msg}`);
  emit(`適用できませんでした: ${msg}`);
  process.exit(1);
}

function emit(summary) {
  if (!process.env.GITHUB_OUTPUT) return;
  // 複数行を避けたいので改行は潰す
  appendFileSync(process.env.GITHUB_OUTPUT, `summary=${summary.replace(/\r?\n/g, " ")}\n`, "utf8");
}

function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

const payload = parsePayload(process.env.ISSUE_BODY || "");
if (!payload) fail("本文から notes-inbox の JSON を読み取れませんでした");

const site = payload.site;

if (site === "idea") {
  const events = Array.isArray(payload.events) ? payload.events : null;
  if (!events) fail("events が配列ではありません");
  if (events.length > 500) fail(`events が多すぎます (${events.length})`);

  const file = join(repoRoot, "notes", "idea", "data", "events.json");
  const before = readJson(file, []);
  const after = mergeEvents(before, events);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(after), "utf8");

  const added = after.length - (Array.isArray(before) ? before.length : 0);
  console.log(`[apply-inbox] idea: ${added}件追加 (合計 ${after.length})`);
  emit(`IdeaBoard に ${added} 件のイベントを追加しました（合計 ${after.length}）。`);
} else {
  const file = join(repoRoot, "notes", site, "feedback.json");
  const before = readJson(file, emptyFeedback());

  const patch = {
    comments: payload.comments && typeof payload.comments === "object" ? payload.comments : {},
    reactions: payload.reactions && typeof payload.reactions === "object" ? payload.reactions : {},
    choices: payload.choices && typeof payload.choices === "object" ? payload.choices : {},
  };
  const nComments = Object.values(patch.comments).reduce(
    (n, a) => n + (Array.isArray(a) ? a.length : 0),
    0,
  );
  const nReactions = Object.keys(patch.reactions).length;
  const nChoices = Object.keys(patch.choices).length;
  if (nComments + nReactions + nChoices === 0) fail("適用する変更がありませんでした");
  if (nComments > 500) fail(`コメントが多すぎます (${nComments})`);

  const after = mergeFeedback(before, patch);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(after, null, 2), "utf8");

  const parts = [];
  if (nChoices) parts.push(`決定 ${nChoices}件`);
  if (nReactions) parts.push(`反応 ${nReactions}件`);
  if (nComments) parts.push(`コメント ${nComments}件`);
  console.log(`[apply-inbox] ${site}: ${parts.join(" / ")}`);
  emit(`${site} に ${parts.join(" / ")} を反映しました。`);
}
