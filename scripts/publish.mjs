// dist/ の中身を、公開される場所へ配置する。
// GitHub Pages（ユーザーサイト）は main ブランチ直下を配信するので、
// ディレクトリ構成がそのまま URL になる。
//
//   dist/notes    → notes/          … https://yooyooy724.github.io/notes/
//   それ以外       → yayu_portfolio/ … https://yooyooy724.github.io/yayu_portfolio/
//
// ルート直下には何も置かない。notes/ を直下のままにしているのは、
// 公開URLと、Actions(notes-inbox)の書き込み先を変えないため。
import { cp, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(repoRoot, "dist");
const siteDir = join(repoRoot, "yayu_portfolio");

// ハッシュ付きファイル名が積み上がらないよう、assets/ だけは毎回作り直す。
await rm(join(siteDir, "assets"), { recursive: true, force: true });

const placed = [];
for (const entry of await readdir(distDir)) {
  const dest = entry === "notes" ? join(repoRoot, "notes") : join(siteDir, entry);
  await cp(join(distDir, entry), dest, { recursive: true });
  placed.push(entry === "notes" ? "notes/" : `yayu_portfolio/${entry}`);
}

console.log(`公開ファイルを配置しました: ${placed.join(", ")}`);
