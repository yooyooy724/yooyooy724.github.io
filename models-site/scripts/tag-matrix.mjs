// カードのタグを数えて「タグ表」ページ（タグ × カテゴリの枚数）を作る。
// ビルドの直前に実行する（.github/workflows/models.yml）。Quartz は .gitignore の対象を読まないので、生成物もコミットしておく（公開サイトは常にビルド時に作り直した内容になる）。
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const content = join(import.meta.dirname, "..", "content");
const cardsDir = join(content, "カード");
const categories = ["世界観モデル", "ゲームデザインモデル", "開発方針", "ビジネスモデル"];
const scopes = new Set(["全体", "Idle-MInertia"]);

// 運用.md の語彙表から、テーマタグの並び順を取る（表にないタグは後ろに足す）
const vocab = [];
for (const m of readFileSync(join(content, "運用.md"), "utf8").matchAll(/^\| (?:世界観|ゲームデザイン|開発|ビジネス|横断) \| (.+) \|$/gm)) {
  vocab.push(...m[1].split("・").map((s) => s.trim()));
}

const count = new Map(); // tag -> category -> n
let untagged = [];
for (const cat of categories) {
  const dir = join(cardsDir, cat);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(join(dir, f), "utf8");
    const tags = (text.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const themes = tags.filter((t) => !scopes.has(t));
    if (!themes.length) untagged.push(`${cat}/${f.replace(/\.md$/, "")}`);
    for (const t of themes) {
      if (!count.has(t)) count.set(t, new Map());
      count.get(t).set(cat, (count.get(t).get(cat) ?? 0) + 1);
    }
  }
}

const order = [...vocab, ...[...count.keys()].filter((t) => !vocab.includes(t))];
const cell = (n) => (n ? String(n) : "·");
const rows = order.map((t) => {
  const c = count.get(t) ?? new Map();
  const total = categories.reduce((s, k) => s + (c.get(k) ?? 0), 0);
  const mark = total <= 3 ? " ⚠" : "";
  return `| [${t}](tags/${encodeURIComponent(t)})${mark} | ${categories.map((k) => cell(c.get(k))).join(" | ")} | ${total} |`;
});

const md = `---
title: タグ表
type: 地図
status: 確定
---

テーマのタグごとに、カテゴリ別のカードの枚数を数えた表。ビルドのたびに自動で作り直される。

- 「·」は0枚。⚠ は合計3枚以下のタグで、まだ考えが足りていないところの目安
- タグ名を押すと、そのタグのカードの一覧に飛べる

| タグ | ${categories.join(" | ")} | 計 |
| --- | ${categories.map(() => "---").join(" | ")} | --- |
${rows.join("\n")}

## テーマのタグがまだないカード

${untagged.length ? untagged.map((u) => `- ${u}`).join("\n") : "- なし"}
`;
writeFileSync(join(content, "タグ表.md"), md);
console.log(`タグ表: ${order.length} タグ、タグなし ${untagged.length} 枚`);
