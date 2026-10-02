// dist/ はリポジトリの .gitignore で除外されるため、ビルド不要の素の JS をここに直接置く
// 各ページの本文の先頭に「このページを編集」ボタンを置く rehype プラグイン。
// 行き先は /admin/（Sveltia CMS）の該当エントリ。対応は ../../admin/config.yml の collections と揃える。

const PAGE_ENTRIES = {
  "index.md": "pages/entries/index",
  "リスク.md": "pages/entries/risk",
  "運用.md": "pages/entries/ops",
}

function editPath(rel) {
  if (rel.startsWith("カード/") && rel.endsWith(".md")) {
    const entry = rel.slice("カード/".length, -".md".length)
    return "cards/entries/" + entry.split("/").map(encodeURIComponent).join("/")
  }
  if (PAGE_ENTRIES[rel]) return PAGE_ENTRIES[rel]
  // カテゴリのページ（.base）などは、カードの一覧を開く
  return "cards"
}

function rehypeEditLink() {
  return (tree, file) => {
    const raw = String(file.data?.relativePath ?? file.data?.filePath ?? "").split(String.fromCharCode(92)).join("/") // Windows の区切り文字をそろえる
    const rel = raw.replace(/^.*?content\//, "")
    // タグのページと、自動で作るタグ表は編集しないのでボタンを出さない
    if (!rel || rel.startsWith("tags/") || rel === "タグ表.md") return
    tree.children.unshift({
      type: "element",
      tagName: "a",
      properties: { className: ["yy-edit"], href: `/admin/#/collections/${editPath(rel)}`, target: "_blank", rel: "noopener" },
      children: [{ type: "text", value: "✎ このページを編集" }],
    })
  }
}

export default function EditLink() {
  return {
    name: "EditLink",
    htmlPlugins() {
      return [rehypeEditLink]
    },
  }
}
