// dist/ の中身を、公開される場所へ配置する。
// GitHub Pages（ユーザーサイト）は main ブランチ直下を配信するので、
// ディレクトリ構成がそのまま URL になる。
//
//   dist/notes    → notes/          … https://yooyooy724.github.io/notes/
//   dist/JobStudy → JobStudy/       … https://yooyooy724.github.io/JobStudy/DeNA/
//   それ以外       → yayu_portfolio/ … https://yooyooy724.github.io/yayu_portfolio/
//
// ルート直下に置くのは notes/ と JobStudy/ だけ。
// notes/ は公開URLと Actions(notes-inbox) の書き込み先を変えないため。
// JobStudy/ は本人がルート直下のURLを指定したため。
// どちらも HTML の中の参照は base(/yayu_portfolio/) のままなので、
// JS/CSS は yayu_portfolio/assets/ から読まれる。assets は移動させないこと。
import { cp, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(repoRoot, "dist");
const siteDir = join(repoRoot, "yayu_portfolio");

// ルート直下へ出す（yayu_portfolio/ をかぶせない）エントリ。
const rootEntries = new Set(["notes", "JobStudy"]);

// ハッシュ付きファイル名が積み上がらないよう、assets/ だけは毎回作り直す。
await rm(join(siteDir, "assets"), { recursive: true, force: true });
// JobStudy はページ構成が変わったときに古いHTMLが残らないよう毎回作り直す。
await rm(join(repoRoot, "JobStudy"), { recursive: true, force: true });

const placed = [];
for (const entry of await readdir(distDir)) {
  const toRoot = rootEntries.has(entry);
  const dest = toRoot ? join(repoRoot, entry) : join(siteDir, entry);
  await cp(join(distDir, entry), dest, { recursive: true });
  placed.push(toRoot ? `${entry}/` : `yayu_portfolio/${entry}`);
}

console.log(`公開ファイルを配置しました: ${placed.join(", ")}`);
