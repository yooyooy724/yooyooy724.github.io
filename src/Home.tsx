import { useCallback, useEffect, useRef, useState } from "react";

import HeroSketch from "./HeroSketch";

// public/ の画像はViteのbase（/yayu_portfolio/）配下へ配置される。
const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, "");

// 経歴は時間軸上の一点ではないので、時系列の章とは分けて扱う。
const overview = { id: "overview", label: "経歴" };

// 章は新しい順に並べる。読み進めるほど過去へさかのぼる。
const chapters = [
  { id: "minertia", label: "Idle Minertia", era: "2025" },
  { id: "sphere", label: "Idle Sphere", era: "2024" },
  { id: "spiral", label: "Idle Spiral", era: "2022" },
  { id: "profile", label: "プロフィール", era: "- 2022" },
];

const navigation: { id: string; label: string; era?: string }[] = [
  overview,
  ...chapters,
];

type Work = {
  id: string;
  logo: string;
  tone: "dark" | "tint" | "";
  chapterLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  facts: { term: string; value: string }[];
  metricsNote?: string;
  // スマートフォンの画面は縦長、Steamのスクリーンショットは横長。
  aspect: "portrait" | "landscape";
  images: { src: string; alt: string }[];
  caseStudies: {
    label: string;
    title: string;
    body: string;
  }[];
  // 技術面は文章ではなく一覧で一気に見せる。カテゴリごとにタブで切り替える
  tech: { tab: string; items: { name: string; detail: string }[] }[];
  storeLink?: { label: string; href: string };
};

// 3作品は同じ構成で見せる。章ごとの差はこのデータだけに閉じ込める。
const works: Record<string, Work> = {
  minertia: {
    id: "minertia",
    logo: "/icon-idle-minertia.webp",
    tone: "dark",
    chapterLabel: "2025 - 現在",
    eyebrow: "放置ゲーム × ローグライク × 非同期マルチプレイ",
    title: "Idle Minertia",
    description:
      "カジュアルなIdle要素と、ローグライク要素を組み合わせ、従来作より幅広いユーザー層へ届けることを目指したIdleゲームです。一般的なIdleゲームでは、周回を重ねるにつれて遊びの中心が次のコンテンツへ移っていきます。Idle Minertiaでは、ゲームをシンプルで遊びやすい状態に保つため、周回後もメインコンテンツの価値が失われない工夫をこらしています。その工夫の一つにローグライク要素があり、周回ごとに異なるビルドが出来上がり、ゲームの進行と共にビルドの複雑さも増していきます。さらに、非同期でのマルチ協力コンテンツを導入し、他のプレイヤーと協力しながら互いの成長を感じられる体験も特徴です。",
    facts: [
      { term: "リリース", value: "2025年" },
      { term: "公開先", value: "iOS・Android（Steam版を準備中）" },
      { term: "開発環境", value: "Unity・C#・Blazor" },
      { term: "担当", value: "企画から運営まで全域・チームリーダー" },
      { term: "実績", value: "累計 約3.8万DL／App Store 4.6" },
    ],
    metricsNote: "App Store 3.13万／Google Play 6,919（2026年7月確認）",
    aspect: "portrait",
    images: [
      { src: "/idle-minertia-01.webp", alt: "複数のつるはしを合成して進化させる画面" },
      { src: "/idle-minertia-02.webp", alt: "ゲームに登場する道具とエンチャント" },
      { src: "/idle-minertia-03.webp", alt: "採掘と岩盤の進行を示すゲーム画面" },
    ],
    caseStudies: [
      {
        label: "開発体制",
        title: "遊び手ベースをすべてにおいて。",
        body: "UI担当、ドメイン担当という職能・工程ごとの横割りではなく、コンテンツごとに企画から実装までを担う縦割りの分業体制を採用しました。これにより、チームメンバー全員が遊び手に近い視点を保ちながら開発できる状態を目指しています。企画、ゲームデザイン、UI、実装、運営のどの段階においても、遊び手にどのような体験が届くのかを判断の基準としています。",
      },
    ],
    tech: [
      {
        tab: "設計",
        items: [
          { name: "ドメイン駆動設計（DDD）", detail: "ゲームのルールや概念をコードの構造として表す設計手法。仕様書を作らず、コードをチームの共通言語にするために採用。" },
          { name: "MVVMパターン", detail: "ゲームルールをBlazor、UIとグラフィックをUnityに分けるプロジェクト構成。表現に依存せずロジックを開発・検証するため。" },
          { name: "モジュール分割", detail: "広告・課金・バックエンドを独立したプロジェクトに分ける構成。ドメインを外部サービスの都合で汚さないため。" },
        ],
      },
      {
        tab: "ドメイン実装",
        items: [
          { name: "LanguageExt（関数型ライブラリ）", detail: "FinやOptionなどのモナドを提供するC#ライブラリ。失敗を型として表現し、ロジックを堅牢にするため。" },
          { name: "StructLinq（自作LINQライブラリ）", detail: "構造体ベースの自作LINQ。ヒープ確保を無くし、GC負荷を避けるため。" },
          { name: "ECS（自作）", detail: "データを配列で持ち一括処理する自作の仕組み。処理負荷とGCの発生を抑えるため、必要な箇所に限定して導入。" },
        ],
      },
      {
        tab: "UI実装",
        items: [
          { name: "VirtualUI（自作の仮想UI層）", detail: "画面遷移や操作を純粋なC#のViewModelで表す自作レイヤー。Blazorでのプロトタイプ確認と、Unity実装との共有のため。" },
          { name: "UI Toolkit（UIフレームワーク）", detail: "UXML・USSで画面を組むUnityのUI基盤。再利用性を高め、コンテンツ追加のたびに増える制作コストを抑えるため。" },
          { name: "Zenject（DIコンテナ）", detail: "依存関係を外から与える仕組み。実装の差し替えとテストを容易にするため。" },
          { name: "R3（Rxライブラリ）", detail: "状態の変化をObservableとして流すライブラリ。状態とUIの同期を宣言的に書くため。" },
          { name: "UniTask（非同期ライブラリ）", detail: "Unity向けの低アロケーション非同期処理。GCを増やさずに非同期処理を書くため。" },
        ],
      },
      {
        tab: "グラフィック",
        items: [
          { name: "Shader Graph", detail: "ノードでシェーダーを組むUnityの機能。UIやゲーム画面の演出を制作するため。" },
          { name: "Fullscreen Effect", detail: "画面全体へかけるURPのポストエフェクト。場面転換や強調の演出のため。" },
          { name: "Linearity Curve（ベクターツール）", detail: "ベクターデザインツール。制作方法を点・線・図形に統一し、少人数でもアートの品質と速度を保つため。" },
        ],
      },
      {
        tab: "基盤・運営",
        items: [
          { name: "Firebase（BaaS）", detail: "Googleのバックエンドサービス群。Authentication・Firestore・Cloud Functionsで、クラウドセーブと非同期マルチ協力コンテンツをサーバーレスに実装。" },
          { name: "Steamworks.NET（Steam SDK）", detail: "SteamのAPIをC#から扱うライブラリ。準備中のSteam版で実績やクラウドセーブに対応するため。" },
          { name: "fastlane（自動化ツール）", detail: "ストア申請の自動化ツール。スクリーンショットやメタデータ更新の手作業を減らすため。" },
          { name: "Discord", detail: "プレイヤーコミュニティの拠点。フィードバックの収集や不具合対応を、プレイヤーと直接やり取りするため。" },
        ],
      },
    ],
  },

  sphere: {
    id: "sphere",
    logo: "/icon-idle-sphere.webp",
    tone: "",
    chapterLabel: "2024 - 2025",
    eyebrow: "放置ゲーム × インフレーション",
    title: "Idle Sphere",
    description:
      "球体の世界でインフレーションを楽しむ、放置系ゲーム。アイドルゲームとしては王道なシステムで構成され、ゲームの進行とともにグラフィックが華やかに成長します。球面上に広がるパーティクルが織りなす抽象的で幻想的なグラフィックを、天体観測のように眺める体験が特徴です。",
    facts: [
      { term: "リリース", value: "2024年" },
      { term: "公開先", value: "Steam（PC・Mac）・iOS" },
      { term: "開発環境", value: "Unity・C#・UGUI" },
      { term: "担当", value: "UI・グラフィック主担当、コンテンツ企画、採用・進行管理" },
      { term: "実績", value: "Steam 322レビュー（賛否両論）／App Store 3.9" },
    ],
    aspect: "landscape",
    images: [
      { src: "/sphere-shot-01.webp", alt: "生成量の内訳と球体を並べたIdle Sphereのメイン画面" },
      { src: "/sphere-shot-02.webp", alt: "軌道上に並ぶ粒子と球体の描画" },
      { src: "/sphere-shot-03.webp", alt: "配色を変えたテーマでの球体と粒子の描画" },
    ],
    caseStudies: [
      {
        label: "方針",
        title: "イラストレーター不在のチームでGenerative Artを採用する",
        body: "球面上に配置したパーティクルを多様な数学的手法で制御し、幾何学的な美しさを目指しました。Seed値に応じて絵が複雑に変化する仕組みに加え、ポストエフェクトやパーティクル向けのシェーダーを組み合わせ、眺め続けても飽きないグラフィックを目指しました。",
      },
      {
        label: "次への課題",
        title: "速くしたつもりを、測っていなかった。",
        body: "UIとゲームロジックを担当者で分けた体制では、ゲーム全体の完成度を一貫して判断しにくい問題が残りました。技術面でも、描画の基盤は作れた一方で実測に基づく判断ができていません。1ドローあたりのインスタンス数は実測ではなく固定値のままで、色バッファは変化のないフレームでも毎回全量を転送し、ジョブは直列に繋いで同じフレーム内で待っていました。次はProfilerとFrame DebuggerでCPUとGPUを分けて計測し、端末ごとの性能予算と品質段階を先に定義するところから始めます。",
      },
    ],
    tech: [
      {
        tab: "技術",
        items: [
          { name: "Job System・Burst", detail: "Unityの並列処理基盤。自作パーティクルシステムの位置・色・状態を並列更新し、最大約13,000要素を扱うため。" },
          { name: "GPUインスタンシング", detail: "同じメッシュを1命令でまとめて描く手法。ドローコールを抑えるため。個別の色はGraphicsBufferからHLSLで読み出す。" },
          { name: "プロシージャル生成", detail: "数式から粒子の配置を生成する手法。Fibonacci球や3Dノイズを使い、球体のテーマと成長を同じ視覚言語で表すため。" },
          { name: "URP Renderer Feature", detail: "描画パイプラインに後処理を差し込む仕組み。Colorize・Toonなどの見た目の切り替えを、DLCのテーマ展開につなげるため。" },
          { name: "ドメイン駆動設計（DDD）", detail: "ゲームのルールをコードの構造として表す設計手法。新しい試みとして導入し、責務と境界を整理するため。" },
          { name: "マルチプラットフォーム", detail: "モバイル版からPC・Mac版への展開。より広いプレイヤー層へ届けるため。" },
        ],
      },
    ],
    storeLink: { label: "Steamで作品を見る", href: "https://store.steampowered.com/app/3217600/Idle_Sphere/" },
  },

  spiral: {
    id: "spiral",
    logo: "/icon-idle-spiral.webp",
    tone: "tint",
    chapterLabel: "2022 - 2024",
    eyebrow: "放置・クリッカーゲーム × 数学",
    title: "Idle Spiral",
    description:
      "螺旋と数学をテーマにした、放置・クリッカーゲームです。進行とともに数式が変化し、その数式に従って螺旋が外側へ伸びていきます。放置ゲームの王道となるシステムを採用しながら、内部の数式をそのままUIでプレイヤーに提示しました。数式が読めればゲームへの理解が深まり、読めなくても攻略は難しくないため十分に楽しめることが特徴です。数式やプレイヤーの操作と螺旋の描画が連携することで、螺旋の美しさに触れ、愛着を感じられる体験を生み出しています。",
    facts: [
      { term: "リリース", value: "2022年" },
      { term: "公開先", value: "Steam（PC）・iOS・Android" },
      { term: "開発環境", value: "Unity・C#" },
      { term: "担当", value: "UI・グラフィック主担当、ゲームデザイン・実装の一部、モバイル版UI再設計" },
      { term: "関わり方", value: "Steam版は業務委託、約1年かけたモバイル版への移植はアルバイトとして参加" },
      { term: "実績", value: "モバイル累計 約8.3万DL／Steam ユニークユーザー 約32.4万" },
    ],
    metricsNote: "Steam 獲得ライセンス（無料配布含む）457,768・売上総額 $110,076・DLC 18,502本・非常に好評（1,871件）／App Store 4.08万・Google Play 42,036（2026年7月確認）",
    aspect: "landscape",
    images: [
      { src: "/spiral-shot-01.webp", alt: "数式パネルと、複数ラインで描かれた螺旋" },
      { src: "/spiral-shot-02.webp", alt: "破線状のラインで描かれた別デザインの螺旋" },
      { src: "/spiral-shot-03.webp", alt: "リアクター画面と、別の数式から生成された曲線" },
    ],
    caseStudies: [
      {
        label: "取り組み",
        title: "リファクタリングを繰り返す",
        body: "全くの未経験から参加し、UIとGraphicを担当しました。そのため、勉強と開発を同時並行で進め、設計やコードの可読性について知識を得るたびにリファクタリングを繰り返しました。初期は、リファクタリングを重ねるほど全体のコード行数が減り、開発速度も上がりました。技術が身につくにつれて大規模なリファクタリングを行う機会が増え、コード品質と開発速度のトレードオフについて考えるようになりました。",
      },
      {
        label: "取り組み",
        title: "UI・Graphicの観点からのアイデア",
        body: "Graphicをより華やかにし、ゲームをより直感的にするため、UIやGraphicの観点から提案を続けました。たとえば、螺旋の本数を増やすアップグレードの追加や、バトルシステムにおける状態の定義（準備・バトル・結果確認）などを提案しました。",
      },
    ],
    tech: [
      {
        tab: "技術",
        items: [
          { name: "Shader Graph", detail: "ノードでシェーダーを組むUnityの機能。ガラス・炎・水面など30本以上を制作し、螺旋の表現を多彩にするため。" },
          { name: "VFX Graph", detail: "GPUで大量のパーティクルを扱うUnityの機能。よりリッチな演出のため。" },
          { name: "依存性注入（DI）", detail: "依存関係を外から与える設計。MonoBehaviourへの直接依存を減らし、外部ライブラリに縛られないため。" },
          { name: "ラッパー層（自作）", detail: "UnityのUI要素を包む自作の層。UI基盤の変更や差し替えに強くするため。" },
        ],
      },
    ],
    storeLink: { label: "Steamで作品を見る", href: "https://store.steampowered.com/app/1827980/Idle_Spiral/" },
  },
};

// 画面下の時間軸と同じく、左から右へ過去から現在へ。本文の並び順とは逆向き。
const careerTimeline = [
  {
    phase: "学生時代",
    date: "2016 - 2022",
    title: "認知科学とテクノロジーへの関心",
    detail: "認知科学への関心から、空間認知や運動主体感を大学の授業と独学で学ぶ。教育工学の研究室に所属し、空間認知を題材にしたボードゲームの開発や、VRデバイスを用いた空間描画について研究する。",
    areas: [],
  },
  {
    phase: "ゲーム開発 1年目",
    date: "2022.09 -",
    title: "『Idle Spiral』制作に参加",
    detail: "実務経験のない状態からゲーム開発の実務を始める。3人という小規模なチームの中で、UI・グラフィックの実装を担当する。この経験から、リーダブルコード、デザインパターン、アーキテクチャ、バージョン管理などの基本的なことやグラフィック技術を学ぶ。",
    areas: ["グラフィック", "UI", "一部ゲームデザイン"],
  },
  {
    phase: "ゲーム開発 2年目",
    date: "2024.01 -",
    title: "『Idle Sphere』制作に参加",
    detail: "3〜6人チームで開発を行う。UI・Graphicを中心に担当しつつ、積極的にゲームの機能追加や設計判断に関わる。また今作では新しい試みとしてドメイン駆動設計を取り入れる。さらに、データ駆動プログラミングを取り入れた自作のパーティクルシステムを採用する。そのほかにも、モバイルからPC・Macへのマルチプラットフォーム対応を実現する。",
    areas: ["グラフィック", "UI", "一部ゲームデザイン"],
  },
  {
    phase: "ゲーム開発 3年目",
    date: "2025.01 -",
    title: "『Idle Minertia』制作を主導",
    detail: "企画、ゲームデザイン、開発、運営を横断して統括。最大4人のチームでリーダーを務める。技術面としてはStructLinqやFin,Optionなどのモナドといった関数型プログラミング的思想を取り入れる。そのほかに、Firebaseを使ったクラウドセーブ機能や非同期マルチプレイ要素を採用する。",
    areas: ["グラフィック", "UI", "企画・ゲームデザイン", "開発・実装", "チームリーダー", "運営・事業判断"],
  },
  {
    phase: "ゲーム開発 4年目",
    date: "2026 - 現在",
    title: "リリース後の継続開発",
    detail: "Steam版への移植を準備しながら、アップデートと改善を継続している。",
    areas: [],
  },
];

// 各プラットフォームはストアページへのリンクになる。
const participatedWorks: {
  title: string;
  icon: string;
  platforms: { label: string; href?: string }[];
}[] = [
  {
    title: "Idle Minertia",
    icon: "/icon-idle-minertia.webp",
    platforms: [
      {
        label: "iOS",
        href: "https://apps.apple.com/jp/app/idle-minertia-%E6%94%BE%E7%BD%AE%E3%81%A7%E7%A9%B4%E6%8E%98%E3%82%8A/id6748000916",
      },
      {
        label: "Android",
        href: "https://play.google.com/store/apps/details?id=com.idlesystem.IdleCube&hl=ja",
      },
      // Steam版はまだストアページが無いので、リンクにはしない。
      { label: "Steam（準備中）" },
    ],
  },
  {
    title: "Idle Sphere",
    icon: "/icon-idle-sphere.webp",
    platforms: [
      { label: "Steam（PC・Mac）", href: "https://store.steampowered.com/app/3217600/Idle_Sphere/" },
      { label: "iOS", href: "https://apps.apple.com/jp/app/idlesphere/id6480509205" },
    ],
  },
  {
    title: "Idle Spiral",
    icon: "/icon-idle-spiral.webp",
    platforms: [
      { label: "Steam（PC）", href: "https://store.steampowered.com/app/1827980/Idle_Spiral/" },
      { label: "iOS", href: "https://apps.apple.com/jp/app/idlespiral/id6476647541" },
      {
        label: "Android",
        href: "https://play.google.com/store/apps/details?id=com.idlesystem.IdleSpiral&hl=ja",
      },
    ],
  },
];

// 進捗（0 = 最初の章 = 現在）を、左＝過去・右＝現在の軸上の位置に反転して割り当てる。
const toEraAxis = (progress: number) => (1 - progress) * 100;

// 作品ごとに独立したカルーセル。3作それぞれが自分のスクロール状態を持つ。
// 技術一覧。カテゴリが複数あるときだけタブを出す。
function TechHighlights({ work }: { work: Work }) {
  const [active, setActive] = useState(0);
  const groups = work.tech;
  const current = groups[Math.min(active, groups.length - 1)];

  return (
    <div className="tech-highlights">
      {groups.length > 1 && (
        <div className="tech-tabs" aria-label="技術のカテゴリ">
          {groups.map((group, index) => (
            <button
              key={group.tab}
              type="button"
              aria-pressed={index === active}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
            >
              {group.tab}
            </button>
          ))}
        </div>
      )}
      <ul>
        {current.items.map((item) => (
          <li key={item.name}>
            <strong>{item.name}</strong>
            <span>{item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkGallery({ work }: { work: Work }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reach, setReach] = useState({ previous: false, next: true });

  const scrollImages = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.78, behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateReach = () => {
      const maximum = track.scrollWidth - track.clientWidth;
      // scroll-snap は最初の図をスクロールポート左端へ寄せるため、
      // 先頭の位置は 0 ではなく左パディングのぶんだけずれる。
      const start = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      setReach({
        previous: track.scrollLeft > start + 4,
        next: maximum > 4 && track.scrollLeft < maximum - 4,
      });
    };

    updateReach();
    track.addEventListener("scroll", updateReach, { passive: true });
    const resizeObserver = new ResizeObserver(updateReach);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", updateReach);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`work-gallery ${work.aspect}`} aria-label={`${work.title}のゲーム画面`}>
      <div className="carousel-stage">
        <div className="carousel-track" ref={trackRef}>
          {work.images.map((image) => (
            <figure key={image.src}>
              <img src={asset(image.src)} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
        <button
          className="carousel-button carousel-previous"
          type="button"
          onClick={() => scrollImages(-1)}
          aria-label="前の画像を見る"
          disabled={!reach.previous}
        >
          ←
        </button>
        <button
          className="carousel-button carousel-next"
          type="button"
          onClick={() => scrollImages(1)}
          aria-label="次の画像を見る"
          disabled={!reach.next}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState(overview.id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tickPositions, setTickPositions] = useState<Record<string, number>>({});

  // 軸の両端は最初の章と最後の章。概要は時間軸に載せないので範囲から外す。
  const eraRange = useCallback(() => {
    const first = document.getElementById(chapters[0].id);
    const last = document.getElementById(chapters[chapters.length - 1].id);
    return { start: first?.offsetTop ?? 0, end: last?.offsetTop ?? 0 };
  }, []);

  const toProgress = (offset: number, range: { start: number; end: number }) => {
    if (range.end <= range.start) return 0;
    return Math.min(1, Math.max(0, (offset - range.start) / (range.end - range.start)));
  };

  useEffect(() => {
    const sections = navigation
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.15, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // 各章が時間軸のどこに刻まれるかは、レイアウトが変わったときだけ測り直す。
  useEffect(() => {
    const measureTicks = () => {
      const range = eraRange();
      const positions: Record<string, number> = {};

      chapters.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return;
        positions[id] = toProgress(section.offsetTop, range);
      });

      setTickPositions(positions);
    };

    measureTicks();
    window.addEventListener("resize", measureTicks);
    const resizeObserver = new ResizeObserver(measureTicks);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("resize", measureTicks);
      resizeObserver.disconnect();
    };
  }, [eraRange]);

  useEffect(() => {
    let frame = 0;

    const readProgress = () => {
      setScrollProgress(toProgress(window.scrollY, eraRange()));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(readProgress);
    };

    readProgress();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [eraRange]);

  const markerPosition = toEraAxis(scrollProgress);
  // 端でラベルがはみ出さないよう、読み取り表示だけは内側に寄せる。
  const readoutPosition = Math.min(90, Math.max(10, markerPosition));
  const activeChapter = chapters.find((item) => item.id === activeSection);
  const activeLabel = navigation.find((item) => item.id === activeSection)?.label;
  // 概要は時間軸上の一点ではないため、表示中はインジケータを引っ込める。
  const axisHidden = !activeChapter;

  // 3作品を同じ構成で描く。画像が複数あるものだけカルーセルになる。
  const renderWork = (work: Work) => (
      <section
        className={`featured chapter${work.tone ? ` ${work.tone}` : ""}`}
        id={work.id}
      >
        <div className="chapter-meta">
          <span>{work.chapterLabel}</span>
          <img className="chapter-logo" src={asset(work.logo)} alt="" aria-hidden="true" />
        </div>

        <div className="featured-title">
          <div>
            <p className="eyebrow">{work.eyebrow}</p>
            <h2>{work.title}</h2>
            <p className="featured-description">{work.description}</p>
          </div>
          <div className="featured-meta">
            <dl>
              {work.facts.map((fact) => (
                <div key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            {work.metricsNote ? <small className="metrics-note">{work.metricsNote}</small> : null}
          </div>
        </div>

        <WorkGallery work={work} />

        <div className="case-study-grid">
          {work.caseStudies.map((study) => (
            <article key={study.title}>
              <p className="label">{study.label}</p>
              <h3>{study.title}</h3>
              <p>{study.body}</p>
            </article>
          ))}
        </div>

        <TechHighlights work={work} />

        {work.storeLink && (
          <a className="store-link" href={work.storeLink.href} target="_blank" rel="noreferrer">
            {work.storeLink.label} ↗
          </a>
        )}
      </section>
  );

  return (
    <main>
      <header className="site-header">
        <a className="site-logo" href="#overview">
          <img src={asset("/yayu-mark.png")} alt="" aria-hidden="true" width={34} height={34} />
          Ya.Yu.
        </a>
        <nav className="site-nav" aria-label="章へ移動">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "active" : ""}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <span className="site-header-current">{activeLabel}</span>
      </header>

      <div className="page">
        <section className="hero chapter" id="overview">
          <div className="hero-copy">
            <h1 className="hero-logo-title">
              <span className="visually-hidden">Ya.Yu.</span>
              <HeroSketch src={asset("/yayu.png")} />
            </h1>
            <p className="hero-name">梁嶋悠介のポートフォリオ</p>
            <p className="hero-art-note">上のアートは開くたびにコードから生成されます（p5.js）</p>
          </div>

          <div className="works-overview">
            <div className="works-overview-heading">
              <div>
                <p>経歴</p>
              </div>
            </div>

            <div className="career-graph">
              <ol className="career-timeline" aria-label="学生時代から現在までの時系列">
                {careerTimeline.map((item) => (
                  <li key={item.phase}>
                    <span className="timeline-phase">{item.phase}</span>
                    <i aria-hidden="true" />
                    <time>{item.date}</time>
                    <strong>{item.title}</strong>
                    <p className="timeline-description">{item.detail}</p>
                    {item.areas.length > 0 ? (
                      <>
                        {/* 読み上げには下の aria-label が使われるので、見出しは視覚のためだけに置く。 */}
                        <p className="timeline-areas-label" aria-hidden="true">担当領域</p>
                        <ul className="timeline-areas" aria-label={`${item.phase}の担当領域`}>
                          {item.areas.map((area) => <li key={area}>{area}</li>)}
                        </ul>
                      </>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>

            <div className="career-summary" aria-label="これまで携わった作品">
              {participatedWorks.map((work) => (
                <article key={work.title}>
                  <img src={asset(work.icon)} alt={`${work.title}のアプリアイコン`} width={72} height={72} />
                  <div className="work-summary-copy">
                    <h3>{work.title}</h3>
                    <ul aria-label={`${work.title}の公開プラットフォーム`}>
                      {work.platforms.map((platform) => (
                        <li key={platform.label}>
                          {platform.href ? (
                            <a href={platform.href} target="_blank" rel="noreferrer">
                              {platform.label}
                              <span aria-hidden="true"> ↗</span>
                            </a>
                          ) : (
                            <span className="platform-pending">{platform.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            {/* 3作品とも同じジャンルなので、馴染みのない読み手のために一言だけ補う。 */}
            <aside className="genre-note">
              <p className="genre-note-label">ちなみに</p>
              <h3>Idleゲームとは？</h3>
              <p>
                複雑なアクション性を無くし、放置する間に進行することを特徴とするジャンルです。代表作としては<a href="https://orteil.dashnet.org/cookieclicker/" target="_blank" rel="noreferrer">『Cookie Clicker』<span aria-hidden="true">↗</span></a>があり、増えた資源を何に投資し、どの時点でリセットするかを考えながら攻略することが遊び方の中心となります。
              </p>
              <p>
                主に英語圏のブラウザゲームサイトを中心に広まり、今ではSteamやモバイルアプリでも定着しつつあり、スキマ時間のゲームとして親しまれています。
              </p>
            </aside>
          </div>

        </section>

        {renderWork(works.minertia)}

        {renderWork(works.sphere)}

        {renderWork(works.spiral)}

        <section className="profile chapter" id="profile">
          <div className="chapter-meta">
            <span>プロフィール</span>
          </div>

          <div className="profile-grid">
            <div>
              <h2>梁嶋 悠介 <span>Yanashima Yusuke / Yayu</span></h2>
            </div>
            <div className="profile-copy">
              <p>
                早稲田大学人間科学部卒業。大学院で空間描画を研究したのち、ゲーム開発の道へ進みました。
              </p>
              <p>
                セーブデータを壊さない堅牢さと、アップデートのたびに遊び手を驚かせる変化の両立を重視しています。
              </p>
              <a href="https://github.com/yooyooy724" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </div>

          <footer>
            <span>© 2026 Ya.Yu.</span>
            <a href="#overview">現在へ戻る ↑</a>
          </footer>
        </section>
      </div>

      <nav
        className={`era-axis${axisHidden ? " is-hidden" : ""}`}
        aria-label="時間軸"
        aria-hidden={axisHidden}
        inert={axisHidden}
      >
        <span className="era-axis-end">過去</span>

        <div className="era-axis-track">
          <span className="era-axis-line" aria-hidden="true" />
          <span
            className="era-axis-travelled"
            aria-hidden="true"
            style={{ left: `${markerPosition}%` }}
          />

          {chapters.map((item) => (
            <a
              key={item.id}
              className={`era-tick${activeSection === item.id ? " active" : ""}`}
              href={`#${item.id}`}
              style={{ left: `${toEraAxis(tickPositions[item.id] ?? 0)}%` }}
              aria-label={`${item.label}（${item.era}）へ移動`}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              <i aria-hidden="true" />
            </a>
          ))}

          <span className="era-marker" aria-hidden="true" style={{ left: `${markerPosition}%` }} />
          <span className="era-readout" aria-hidden="true" style={{ left: `${readoutPosition}%` }}>
            <b>{activeChapter?.era}</b>
            <em>{activeChapter?.label}</em>
          </span>
        </div>

        <span className="era-axis-end">現在</span>
      </nav>
    </main>
  );
}
