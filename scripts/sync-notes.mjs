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
    title: "ストーリー設定",
    desc: "世界観・表ストーリー・キャラクター・脚本。",
    files: ["index.html", "feedback.json"],
    dirs: ["images"],
  },
  {
    dir: "steam",
    from: "SteamSite",
    title: "Steam リリース企画",
    desc: "移植の仕様すり合わせと決定ボード。",
    files: ["index.html", "feedback.json"],
    dirs: [],
  },
  {
    dir: "idea",
    from: "IdeaBoard",
    title: "IdeaBoard（Challenge / Spell）",
    desc: "Challenge カードと、アイディア・コメントのイベントログ。",
    files: ["index.html"],
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
    await cp(src, join(toDir, f));
  }
  for (const d of site.dirs) {
    const src = join(fromDir, d);
    if (!existsSync(src)) continue;
    await cp(src, join(toDir, d), { recursive: true });
  }
  await injectNoindex(join(toDir, "index.html"));

  let note = "";
  if (site.dir === "idea") {
    note = `events ${await buildEventSnapshot(fromDir, toDir)}件`;
  }
  report.push(`${site.dir}${note ? ` (${note})` : ""}`);
}

// /notes/ のトップ
const landing = `<!DOCTYPE html>
<html lang="ja">
<head>
${NOINDEX}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Design Notes（閲覧専用）</title>
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#1a1c20;color:#e2e6ea;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic UI","Meiryo",sans-serif;line-height:1.8;padding:48px 20px}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:22px;letter-spacing:.08em;margin-bottom:6px}
  .lead{color:#949ca6;font-size:13.5px;margin-bottom:28px}
  a.card{display:block;text-decoration:none;color:inherit;background:#23262b;border:1px solid #353a41;border-radius:10px;padding:14px 18px;margin-bottom:12px}
  a.card:hover{border-color:#66c0f4}
  a.card h2{font-size:16px;margin-bottom:2px;color:#eaf1f7}
  a.card p{font-size:13px;color:#949ca6}
  .foot{margin-top:28px;font-size:12px;color:#6f777f;border-top:1px solid #353a41;padding-top:14px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Design Notes</h1>
  <p class="lead">Idle Minertia の設計メモ。<b>閲覧専用の公開版</b>です。コメント・決定の書き込みはローカル版から行います。</p>
${SITES.filter((s) => report.some((r) => r.startsWith(s.dir)))
  .map((s) => `  <a class="card" href="${s.dir}/"><h2>${s.title}</h2><p>${s.desc}</p></a>`)
  .join("\n")}
  <p class="foot">最終更新: ${new Date().toISOString().slice(0, 10)}</p>
</div>
</body>
</html>
`;
await writeFile(join(dest, "index.html"), landing, "utf8");

console.log(`[sync-notes] public/notes を更新しました: ${report.join(", ")}`);
