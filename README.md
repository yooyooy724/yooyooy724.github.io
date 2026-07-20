# yooyooy724.github.io

ポートフォリオサイト。React + Vite の静的サイトで、GitHub Pages（ユーザーサイト）として
リポジトリ直下から配信される。

## 構成

```
src/          ソース（index.html / main.tsx / Home.tsx / globals.css）
public/       画像などの静的アセット
scripts/      ビルド成果物をリポジトリ直下へ配置するスクリプト
dist/         ビルド中間物（gitignore 済み）

index.html    ← ビルド成果物（コミット対象）
assets/       ← ビルド成果物（コミット対象）
*.webp *.jpg  ← public/ からコピーされたもの（コミット対象）
```

GitHub Pages はリポジトリ直下をそのまま配信するため、**ビルド成果物もコミットする**。
`index.html` と `assets/` を直接編集しないこと（次のビルドで上書きされる）。編集するのは `src/` 以下。

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
