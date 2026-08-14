// DesignNotes の3サイトを public/notes/ へ取り込む（閲覧専用の公開版）。
//
// 各 index.html はサーバーがあれば読み書き、無ければ静的スナップショットを読んで
// 閲覧専用に切り替わる作りになっている。ここではその「静的スナップショット」を用意する。
//   - StorySite / SteamSite … feedback.json をそのまま置く
//   - IdeaBoard             … data/events/**/*.jsonl を events.json に畳んで置く
//
// server.js / start_site.bat / feedback_history.jsonl は公開しない。
// （履歴には削除済みコメントが残るため）
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = process.env.DESIGN_NOTES
  ? process.env.DESIGN_NOTES
  : join(repoRoot, "..", "IdleMinertia", "DesignNotes");
const dest = join(repoRoot, "public", "notes");

if (!existsSync(source)) {
  console.warn(`[sync-notes] 取り込み元が見つかりません: ${source}`);
  console.warn("[sync-notes] notes の更新をスキップします（既存の public/notes はそのまま）。");
  process.exit(0);
}

const SITES = [
  {
    dir: "story",
    from: "StorySite",
    label: "Story",
    title: "ストーリー設定",
    desc: "世界観・表ストーリー・キャラクター・脚本。",
    can: "進行タイムラインでチュートリアルと会話の順番を並べ替えられます。脚本はチャット形式。",
    files: ["index.html", "feedback.json"],
    dirs: ["images"],
  },
  {
    dir: "steam",
    from: "SteamSite",
    label: "Steam",
    title: "Steam リリース企画",
    desc: "決定事項と、これから行う作業の実行計画。",
    can: "章ごとにコメントできます。実装向けの指示書をサブページに追加中です。",
    // spec.html = 項目別の詳細仕様（旧 archive.html）。
    // archive.html は旧URLからの転送用スタブとして残してある。
    files: ["index.html", "spec.html", "archive.html", "feedback.json"],
    // instructions/ はフェーズ2の指示書サブページ。index.html から辿る。
    // コメントは親と同じ feedback.json（../feedback.json）を読む。
    dirs: ["instructions"],
  },
  {
    dir: "idea",
    from: "IdeaBoard",
    label: "Idea",
    title: "IdeaBoard（Challenge / Spell）",
    desc: "Challenge カードと、アイディア・コメントのイベントログ。",
    can: "Challenge（試練）と Spell の正本。仕様書より新しいことがあります。",
    files: ["index.html"],
    dirs: [],
  },
  {
    dir: "promotion",
    from: "PromotionSite",
    label: "Promotion",
    title: "プロモーションメモ",
    desc: "前提 / X 運用 / イベント / スケジュールの4ページ。",
    can: "思いついたことをメモとして積んでいくだけの場所。",
    files: ["index.html", "feedback.json"],
    dirs: [],
  },
];

const NOINDEX = '<meta name="robots" content="noindex,nofollow">';

// 検索エンジンに拾わせない。URL を知っていれば誰でも見られる点は変わらないので、
// 秘匿ではなく「積極的に晒さない」程度の意味しかない。
async function injectNoindex(file) {
  const html = await readFile(file, "utf8");
  if (html.includes('name="robots"')) return;
  await writeFile(file, html.replace(/<head>/i, `<head>\n${NOINDEX}`), "utf8");
}

// dirs で丸ごとコピーしたフォルダにも HTML が入ることがある（steam の instructions/ 等）。
// files 側だけに noindex を入れていると、サブページだけ検索に載ってしまう。
async function injectNoindexDeep(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await injectNoindexDeep(p);
    else if (e.name.endsWith(".html")) await injectNoindex(p);
  }
}

// data/events 配下の .jsonl を1本の配列に畳む
async function collectJsonl(dir, out = []) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await collectJsonl(p, out);
    else if (e.name.endsWith(".jsonl")) out.push(p);
  }
  return out;
}

async function buildEventSnapshot(fromDir, toDir) {
  const events = [];
  for (const file of await collectJsonl(join(fromDir, "data", "events"))) {
    const text = await readFile(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t) continue;
      try {
        events.push(JSON.parse(t));
      } catch {
        console.warn(`[sync-notes] 壊れた行を無視: ${file}`);
      }
    }
  }
  events.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  await mkdir(join(toDir, "data"), { recursive: true });
  await writeFile(join(toDir, "data", "events.json"), JSON.stringify(events), "utf8");
  return events.length;
}

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });

const report = [];
for (const site of SITES) {
  const fromDir = join(source, site.from);
  if (!existsSync(fromDir)) {
    console.warn(`[sync-notes] 見つかりません、スキップ: ${fromDir}`);
    continue;
  }
  const toDir = join(dest, site.dir);
  await mkdir(toDir, { recursive: true });

  for (const f of site.files) {
    const src = join(fromDir, f);
    if (!existsSync(src)) continue;
    const destFile = join(toDir, f);
    await cp(src, destFile);
    if (f.endsWith(".html")) await injectNoindex(destFile);
  }
  for (const d of site.dirs) {
    const src = join(fromDir, d);
    if (!existsSync(src)) continue;
    const destDir = join(toDir, d);
    await cp(src, destDir, { recursive: true });
    await injectNoindexDeep(destDir);
  }
  let note = "";
  if (site.dir === "idea") {
    note = `events ${await buildEventSnapshot(fromDir, toDir)}件`;
  }
  report.push(`${site.dir}${note ? ` (${note})` : ""}`);
}

// /notes/ のトップ。各ノートへの入口をまとめたハブ。
// 配色・字組みはポートフォリオ(src/globals.css)に合わせる。
const live = SITES.filter((s) => report.some((r) => r.startsWith(s.dir)));
const landing = `<!DOCTYPE html>
<html lang="ja">
<head>
${NOINDEX}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Idle Minertia / Design Notes</title>
<style>
  :root{
    --ink:#151a17; --paper:#f2efe7; --card:#e5e2d9;
    --muted:#757a74; --muted-strong:#5f645e; --line:#cbc8bf;
    --green:#b8de50; --orange:#f06b45; --blue:#a7c6f1;
    --font-jp:"Yu Gothic","Hiragino Kaku Gothic ProN",sans-serif;
    --font-display:Arial,Helvetica,sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);font-family:var(--font-jp);line-height:1.9;font-size:15px;
    padding:clamp(40px,8vw,88px) clamp(22px,6vw,40px) 80px}
  .wrap{max-width:760px;margin:0 auto}
  .label{font-family:var(--font-display);font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
  .eyebrow{color:var(--orange);margin-bottom:10px}
  h1{font-size:clamp(2rem,6vw,3.4rem);font-weight:550;letter-spacing:-.055em;line-height:1.1}
  .lead{color:var(--muted-strong);font-size:.82rem;line-height:1.95;margin:16px 0 0;max-width:600px}
  .list{border-top:1px solid var(--line);margin-top:clamp(34px,5vw,52px)}
  a.card{display:grid;grid-template-columns:auto 1fr auto;gap:6px 20px;align-items:baseline;
    border-bottom:1px solid var(--line);padding:22px 4px;text-decoration:none;color:inherit;
    transition:background 160ms ease,padding 160ms ease}
  a.card:hover,a.card:focus-visible{background:var(--card);outline:none;padding-left:14px;padding-right:14px}
  a.card .no{font-family:var(--font-display);font-size:.62rem;font-weight:700;color:var(--muted);letter-spacing:.1em}
  a.card h2{font-size:clamp(1.05rem,2vw,1.4rem);font-weight:600;letter-spacing:-.035em}
  a.card .go{font-family:var(--font-display);font-size:.62rem;font-weight:700;letter-spacing:.1em;color:var(--orange);white-space:nowrap}
  a.card .body{grid-column:2;min-width:0}
  a.card p{color:var(--muted-strong);font-size:.75rem;line-height:1.85;margin-top:6px}
  a.card p.can{color:var(--muted);font-size:.68rem;margin-top:2px}
  .how{background:var(--blue);border-radius:16px;padding:18px 22px;margin-top:clamp(34px,5vw,52px)}
  .how .t{margin-bottom:6px;opacity:.7}
  .how p{font-size:.78rem;line-height:1.9}
  .foot{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;
    border-top:1px solid var(--line);margin-top:40px;padding-top:16px;
    font-family:var(--font-display);font-size:.58rem;letter-spacing:.1em;color:var(--muted)}
  @media (max-width:560px){
    a.card{grid-template-columns:auto 1fr}
    a.card .go{display:none}
  }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow label">Idle Minertia</p>
  <h1>Design Notes</h1>
  <p class="lead">設計・企画のメモをまとめた場所。ここは<b>公開版</b>で、書き込みは端末に溜めてから GitHub 経由で反映されます。決定やコメントを直接保存したいときは、手元のローカル版から開いてください。</p>

  <div class="list">
${live
  .map(
    (s, i) => `    <a class="card" href="${s.dir}/">
      <span class="no">${String(i + 1).padStart(2, "0")}</span>
      <h2>${s.title}</h2>
      <span class="go">Open →</span>
      <div class="body"><p>${s.desc}</p><p class="can">${s.can}</p></div>
    </a>`,
  )
  .join("\n")}
  </div>

  <div class="how">
    <p class="t label">書き込みについて</p>
    <p>この公開版で書いたものは、いったんその端末に溜まります。各ページの「GitHubへ送信」を押すと Issue になり、1分ほどで反映されます。公開済みの内容を消したり書き換えたりするのはローカル版からだけです。</p>
  </div>

  <div class="foot">
    <span>Last updated ${new Date().toISOString().slice(0, 10)}</span>
    <span>${live.length} notes</span>
  </div>
</div>
</body>
</html>
`;
await writeFile(join(dest, "index.html"), landing, "utf8");

console.log(`[sync-notes] public/notes を更新しました: ${report.join(", ")}`);
