"use client";

import { useEffect, useRef } from "react";
import type p5 from "p5";

// ヒーローのアイコンは画像をそのまま出さず、p5で「動く絵」として描く。
// 3パターンのうち1つを、ページを開くたびにランダムに選ぶ。
const PATTERNS = ["halftone", "flow", "slices"] as const;
type Pattern = (typeof PATTERNS)[number];

// サイトのパレットに合わせる（globals.css の --ink / --orange）
const INK: [number, number, number] = [21, 26, 23];
const ACCENT: [number, number, number] = [240, 107, 69];

export default function HeroSketch({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let instance: p5 | null = null;

    // p5 は window 前提なので、SSRを避けてクライアントでだけ読み込む
    import("p5").then(({ default: P5 }) => {
      if (disposed) return;

      // 通常はランダム。?art=flow のように指定すると特定のパターンを固定できる。
      const requested = new URLSearchParams(window.location.search).get("art");
      const pattern: Pattern = PATTERNS.includes(requested as Pattern)
        ? (requested as Pattern)
        : PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const sketch = (p: p5) => {
        let img: p5.Image;
        // 低解像度に落としたインク濃度マップ。全パターンの共通データ。
        let field: Float32Array;
        let cols = 0;
        let rows = 0;

        // flow用
        type Particle = { x: number; y: number; life: number };
        let particles: Particle[] = [];
        let trail: p5.Graphics | null = null;
        // slices用。線画をアクセント色に塗り替えたシルエット。
        let tinted: p5.Graphics | null = null;

        const canvasSize = () => {
          const w = Math.max(200, host.clientWidth || 320);
          return { w, h: Math.round(w * (img.height / img.width)) };
        };

        const buildField = () => {
          const sample = 96;
          cols = sample;
          rows = Math.max(1, Math.round(sample * (img.height / img.width)));
          const small = img.get();
          small.resize(cols, rows);
          small.loadPixels();
          field = new Float32Array(cols * rows);
          for (let i = 0; i < cols * rows; i++) {
            const r = small.pixels[i * 4];
            const g = small.pixels[i * 4 + 1];
            const b = small.pixels[i * 4 + 2];
            const a = small.pixels[i * 4 + 3];
            // 白地・透過のどちらでも「線の濃さ」になるよう、明度と不透明度を掛ける
            field[i] = (1 - (r + g + b) / 3 / 255) * (a / 255);
          }
        };

        const inkAt = (nx: number, ny: number) => {
          if (nx < 0 || nx >= 1 || ny < 0 || ny >= 1) return 0;
          const cx = Math.floor(nx * cols);
          const cy = Math.floor(ny * rows);
          return field[cy * cols + cx];
        };

        const spawn = (): Particle => {
          // インクの乗っているセルを引き当てるまで再抽選する
          for (let i = 0; i < 80; i++) {
            const cx = Math.floor(Math.random() * cols);
            const cy = Math.floor(Math.random() * rows);
            if (field[cy * cols + cx] > 0.25) {
              return {
                x: ((cx + Math.random()) / cols) * p.width,
                y: ((cy + Math.random()) / rows) * p.height,
                life: 60 + Math.random() * 200,
              };
            }
          }
          return { x: p.width / 2, y: p.height / 2, life: 60 };
        };

        const setupFlow = () => {
          // バッファは作り直さず使い回す。p5.Graphics の remove() は
          // インスタンスモードだと内部参照を辿れずに落ちる。
          if (!trail) trail = p.createGraphics(p.width, p.height);
          else trail.resizeCanvas(p.width, p.height);
          trail.clear();
          trail.strokeCap(p.ROUND);
          particles = Array.from({ length: 150 }, spawn);
        };

        // 線画は黒なので tint() では色が乗らない。
        // source-in で不透明部分だけをアクセント色に置き換える。
        const setupTinted = () => {
          if (!tinted) tinted = p.createGraphics(p.width, p.height);
          else tinted.resizeCanvas(p.width, p.height);
          tinted.clear();
          tinted.image(img, 0, 0, tinted.width, tinted.height);
          tinted.drawingContext.globalCompositeOperation = "source-in";
          tinted.noStroke();
          tinted.fill(...ACCENT);
          tinted.rect(0, 0, tinted.width, tinted.height);
          tinted.drawingContext.globalCompositeOperation = "source-over";
        };

        p.preload = () => {
          img = p.loadImage(src);
        };

        p.setup = () => {
          const { w, h } = canvasSize();
          p.createCanvas(w, h);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));

          // 動きを減らす設定のユーザーには、静止画をそのまま見せる
          if (reduceMotion) {
            p.image(img, 0, 0, w, h);
            p.noLoop();
            return;
          }

          buildField();
          if (pattern === "flow") setupFlow();
          if (pattern === "slices") setupTinted();
        };

        p.windowResized = () => {
          if (reduceMotion) return;
          const { w, h } = canvasSize();
          if (w === p.width) return;
          p.resizeCanvas(w, h);
          if (pattern === "flow") setupFlow();
          if (pattern === "slices") setupTinted();
        };

        // パターン1: ハーフトーン。線の濃さを点の大きさに変換し、ノイズで揺らす。
        const drawHalftone = () => {
          p.clear();
          p.noStroke();
          const stepX = p.width / cols;
          const stepY = p.height / rows;
          const t = p.millis() / 1000;
          for (let cy = 0; cy < rows; cy++) {
            for (let cx = 0; cx < cols; cx++) {
              const ink = field[cy * cols + cx];
              if (ink < 0.12) continue;
              const wob = p.noise(cx * 0.18, cy * 0.18, t * 0.55);
              const accent = (cx * 31 + cy * 17) % 59 === 0;
              p.fill(...(accent ? ACCENT : INK));
              p.circle(
                (cx + 0.5) * stepX,
                (cy + 0.5) * stepY,
                stepX * ink * (0.55 + 0.9 * wob),
              );
            }
          }
        };

        // パターン2: フローフィールド。粒子がノイズに流されながら線の上だけを歩き、
        // 絵が少しずつ「描かれていく」。一定時間で白紙に戻る。
        const drawFlow = () => {
          if (!trail) return;
          p.clear();
          const t = p.millis() / 1000;

          for (const pt of particles) {
            const angle =
              p.noise(pt.x * 0.006, pt.y * 0.006, t * 0.12) * p.TWO_PI * 3;
            const nx = pt.x + Math.cos(angle) * 1.7;
            const ny = pt.y + Math.sin(angle) * 1.7;
            const ink = inkAt(nx / p.width, ny / p.height);
            pt.life -= 1;

            if (ink < 0.12 || pt.life <= 0) {
              Object.assign(pt, spawn());
              continue;
            }

            const accent = pt.life % 97 === 0;
            trail.stroke(...(accent ? ACCENT : INK), 26 + ink * 60);
            trail.strokeWeight(0.8 + ink * 2);
            trail.line(pt.x, pt.y, nx, ny);
            pt.x = nx;
            pt.y = ny;
          }

          // 描き込みすぎたら白紙に戻して、また最初から描き直す
          if (p.frameCount % 1100 === 0) trail.clear();

          // うっすら下絵を敷いて、描き始めでも形が分かるようにする
          p.tint(255, 16);
          p.image(img, 0, 0, p.width, p.height);
          p.noTint();
          p.image(trail, 0, 0);
        };

        // パターン3: スライスグリッチ。横帯ごとに波でずらし、
        // 奥に版ずれ風のアクセント色を敷く。
        const drawSlices = () => {
          p.clear();
          const t = p.millis() / 1000;

          if (tinted) {
            p.tint(255, 140);
            p.image(tinted, Math.sin(t * 0.9) * 7, Math.cos(t * 0.7) * 6);
            p.noTint();
          }

          const sliceH = Math.max(2, Math.round(p.height / 80));
          const srcSliceH = img.height / (p.height / sliceH);
          for (let y = 0, i = 0; y < p.height; y += sliceH, i++) {
            const amp = 9 * p.noise(i * 0.07, t * 0.45);
            const off = Math.sin(i * 0.33 + t * 2.1) * amp;
            p.image(
              img,
              off,
              y,
              p.width,
              sliceH,
              0,
              i * srcSliceH,
              img.width,
              srcSliceH,
            );
          }
        };

        p.draw = () => {
          if (reduceMotion) return;
          if (pattern === "halftone") drawHalftone();
          else if (pattern === "flow") drawFlow();
          else drawSlices();
        };
      };

      instance = new P5(sketch, host);
    });

    return () => {
      disposed = true;
      instance?.remove();
    };
  }, [src]);

  return <div className="hero-sketch" ref={hostRef} aria-hidden="true" />;
}
