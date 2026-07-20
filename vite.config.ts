import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ソースは src/、ビルドはいったん dist/ に出す。
// リポジトリ直下への配置は scripts/publish.mjs が行う。
// （outDir を直接リポジトリ直下にすると、emptyOutDir の設定次第で
//   .git ごと消えかねないため、必ず dist/ を経由させる）
export default defineConfig({
  root: "src",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
