import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ソースは src/、ビルドはいったん dist/ に出す。
// リポジトリ直下への配置は scripts/publish.mjs が行う。
// （outDir を直接リポジトリ直下にすると、emptyOutDir の設定次第で
//   .git ごと消えかねないため、必ず dist/ を経由させる）
export default defineConfig({
  // ポートフォリオは https://yooyooy724.github.io/yayu_portfolio/ に置く。
  // ルート直下には何も置かない（/notes/ は publish.mjs が別扱いで直下へ配置する）。
  base: "/yayu_portfolio/",
  root: "src",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // ページを増やすときは、src/ 以下のディレクトリ構成をそのままURLにする多ページ構成にする。
    // 例: src/JobStudy/DeNA/index.html → dist/JobStudy/DeNA/index.html
    //     → publish.mjs が yayu_portfolio/JobStudy/ へ移し、
    //       https://yooyooy724.github.io/yayu_portfolio/JobStudy/DeNA/ で開ける。
    // （SPAのクライアントルーティングは GitHub Pages が404を返すので使えない）
    // パスは root（src/）からの相対で書く。
    rollupOptions: {
      input: {
        main: "index.html",
        jobStudyDeNA: "JobStudy/DeNA/index.html",
      },
    },
  },
});
