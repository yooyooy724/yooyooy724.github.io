// dist/ の中身をリポジトリ直下へ配置する。
// GitHub Pages（ユーザーサイト）は main ブランチ直下を配信するため、
// index.html と assets/ が直下に存在する必要がある。
import { cp, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(repoRoot, "dist");

// ハッシュ付きファイル名が積み上がらないよう、assets/ だけは毎回作り直す。
await rm(join(repoRoot, "assets"), { recursive: true, force: true });

const entries = await readdir(distDir);
for (const entry of entries) {
  await cp(join(distDir, entry), join(repoRoot, entry), { recursive: true });
}

console.log(`公開ファイルを配置しました: ${entries.join(", ")}`);
