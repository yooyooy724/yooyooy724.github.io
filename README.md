# yooyooy724.github.io

ポートフォリオサイト。React + Vite の静的サイトで、GitHub Pages（ユーザーサイト）として
リポジトリ直下から配信される。

## 公開URL

| URL | 中身 |
| --- | --- |
| `https://yooyooy724.github.io/` | **何も置かない**（404） |
| `https://yooyooy724.github.io/yayu_portfolio/` | ポートフォリオ |
| `https://yooyooy724.github.io/notes/` | Design Notes（DesignNotes から生成） |

## 構成

```
src/            ソース（index.html / main.tsx / Home.tsx / globals.css）
public/         画像などの静的アセット
scripts/        ビルド成果物を配置するスクリプト
dist/           ビルド中間物（gitignore 済み）

yayu_portfolio/ ← ビルド成果物（コミット対象）
notes/          ← ビルド成果物（コミット対象。Actions からも書き込まれる）
.nojekyll       Jekyll を止める（消さないこと）
```

`.nojekyll` は消さないこと。これが無いと GitHub Pages が Jekyll を走らせ、
直下に `index.html` が無いぶん **この README がトップページとして描画される**。

GitHub Pages はリポジトリ直下をそのまま配信し、ディレクトリ構成がそのまま URL になるため、
**ビルド成果物もコミットする**。`yayu_portfolio/` と `notes/` を直接編集しないこと
（次のビルドで上書きされる）。編集するのは `src/` 以下と、notes については DesignNotes 側。

ポートフォリオは直下ではなく `/yayu_portfolio/` 配下に置くので、`vite.config.ts` の
`base` を変えたら、`src/Home.tsx` の `asset()` を通していない画像パスがないか確認すること。
JSX 内の文字列リテラルは Vite が書き換えてくれない。

## 開発

```bash
npm install
npm run dev        # 開発サーバー
```

## 公開手順

```bash
npm run build      # vite build → dist/ → リポジトリ直下へ配置
git add -A
git commit -m "サイトを更新"
git push
```

`npm run build` は `dist/` に出力したあと `scripts/publish.mjs` が直下へコピーする。
`assets/` は毎回削除してから作り直すので、古いハッシュ付きファイルは残らない。

## その他

```bash
npm run typecheck  # tsc --noEmit
npm run preview    # ビルド結果をローカル確認
```
