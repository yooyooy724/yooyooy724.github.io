import { useCallback, useEffect, useRef, useState } from "react";

// 概要は時間軸上の一点ではないので、時系列の章とは分けて扱う。
const overview = { id: "overview", number: "00", label: "概要" };

// 章は新しい順に並べる。読み進めるほど過去へさかのぼる。
const chapters = [
  { id: "minertia", number: "01", label: "代表作", era: "2025" },
  { id: "turning-point", number: "02", label: "転換点", era: "2024 冬" },
  { id: "sphere", number: "03", label: "広げる", era: "2024" },
  { id: "spiral", number: "04", label: "表現する", era: "2022" },
  { id: "profile", number: "05", label: "プロフィール", era: "— 2022" },
];

const navigation: { id: string; number: string; label: string; era?: string }[] = [
  overview,
  ...chapters,
];

type Work = {
  id: string;
  logo: string;
  tone: "dark" | "tint" | "";
  chapterLabel: string;
  chapterEra: string;
  eyebrow: string;
  title: string;
  description: string;
  facts: { term: string; value: string }[];
  // スマートフォンの画面は縦長、Steamのスクリーンショットは横長。
  aspect: "portrait" | "landscape";
  images: { src: string; alt: string }[];
  caseStudies: {
    label: string;
    title: string;
    body: string;
    stack?: string;
    notes?: { name: string; detail: string }[];
  }[];
  scope: { number: string; field: string; title: string; detail: string }[];
  storeLink?: { label: string; href: string };
};

// 3作品は同じ構成で見せる。章ごとの差はこのデータだけに閉じ込める。
const works: Record<string, Work> = {
  minertia: {
    id: "minertia",
    logo: "/icon-idle-minertia.webp",
    tone: "dark",
    chapterLabel: "代表作",
    chapterEra: "2025年 リリース",
    eyebrow: "放置ゲーム × ローグライク × 非同期マルチプレイ",
    title: "Idle Minertia",
    description:
      "カジュアルな遊びやすさと、ローグライク要素による選択・ビルド構築の奥行きを組み合わせ、従来作より幅広いユーザー層へ届けることを目指した放置ゲームです。周回後もメインコンテンツの価値が失われないゲーム設計と、プレイヤー同士が協力する非同期マルチプレイコンテンツを特徴としています。",
    facts: [
      { term: "リリース", value: "2025年" },
      { term: "公開先", value: "iOS・Android" },
      { term: "開発環境", value: "Unity・C#・Blazor" },
    ],
    aspect: "portrait",
    images: [
      { src: "/idle-minertia-01.webp", alt: "複数のつるはしを合成して進化させる画面" },
      { src: "/idle-minertia-02.webp", alt: "ゲームに登場する道具とエンチャント" },
      { src: "/idle-minertia-03.webp", alt: "採掘と岩盤の進行を示すゲーム画面" },
    ],
    caseStudies: [
      {
        label: "企画・ゲームデザイン",
        title: "メインコンテンツが死なない周回を設計する。",
        body: "一般的な放置ゲームでは、周回を重ねるにつれて遊びの中心が次のコンテンツへ移っていきます。Idle Minertiaでは、ゲームをシンプルで遊びやすい状態に保つため、周回後もメインコンテンツの価値が失われない仕組みを採用しました。一方で同じ体験の繰り返しにならないよう、ローグライク要素による選択と組み合わせを取り入れ、周回ごとに異なる体験を生み出しています。さらに、非同期のマルチ協力コンテンツを導入し、他のプレイヤーと協力しながら互いの成長を感じられる体験を加えました。",
      },
      {
        label: "開発理念",
        title: "遊び手ベースをすべてにおいて。",
        body: "UI担当、ドメイン担当という職能・工程ごとの横割りではなく、コンテンツごとに企画から実装までを担う縦割りの分業体制を採用しました。これにより、チームメンバー全員が遊び手に近い視点を保ちながら開発できる状態を目指しています。企画、ゲームデザイン、UI、実装、運営のどの段階においても、遊び手にどのような体験が届くのかを判断の基準としています。",
      },
      {
        label: "設計",
        title: "コンテンツごとに本質を問うDDD。",
        body: "チームメンバーが全員プログラマーだったため、仕様共有のためのドキュメントは作成せず、コードそのものをチームの共通言語としました。そこで、コンテンツの概念、ルール、制約をコードによって明確に表明する必要があると考え、DDDを採用しました。ドメインを明確にするプロセスを設けたことで、チームメンバーもそれぞれ、コンテンツを精緻に理解しながら開発を進められたと感じています。また、DDDに基づいて責務と境界を整理したことで、コードの品質も向上しました。",
        stack: "DDD・C#・.NET Standard 2.1",
      },
      {
        label: "技術",
        title: "ゲームの中身と表現を分離する。",
        body: "ゲームのルールや状態を扱う部分はBlazorプロジェクト、プレイヤーが実際に触れる表現部分はUnityプロジェクトで管理しています。Blazorプロジェクトでは、ゲームロジックに加えて、画面遷移や操作を含む仮想的なUIを純粋なC#で表現し、BlazorのUI機構をプロトタイプとしても活用しています。UnityプロジェクトはBlazor側のビルド成果物を参照し、最終的なUIとグラフィックの実装に専念します。",
        stack: "Blazor・Unity・C#・MVVM",
      },
      {
        label: "技術",
        title: "効率的な計算と、シンプルなコードを両立する。",
        body: "放置ゲームでは、内部ロジックの処理負荷やメモリ使用量が課題になりやすくなります。データ指向設計は有効ですが、既存のオブジェクト指向設計へ全面的に導入すると、プロジェクト全体の構造が複雑になる可能性があります。そこで全面的な移行は選ばず、用途を限定した独自ECSとStructLinqを採用しました。必要な箇所だけデータを連続的に扱うことで、コードの見通しを保ちながら、処理負荷とGCの発生を抑えています。",
        notes: [
          {
            name: "独自ECS",
            detail: "データの配列管理と一括処理に機能を絞り、既存アーキテクチャへの影響を抑えた。並列処理とBurstコンパイルは対象外とした。",
          },
          {
            name: "StructLinq",
            detail: "構造体ベースのLINQ実装を用い、ヒープ確保とGC負荷を抑えた。",
          },
        ],
      },
      {
        label: "アート制作",
        title: "コンテンツ追加の制作コストを抑える。",
        body: "本プロジェクトでは、リリース後の継続的なアップデートを前提としています。品質と提供速度を両立するため、1つのコンテンツを追加するたびに制作コストが不用意に増えない仕組みを重視しました。UI制作にはUI Toolkitを採用し、UXML、USS、C#を用いて、再利用・管理しやすい形で画面を実装しています。アートアセットの制作にはベクターデザインツールのLinearity Curveを活用し、点、線、図形を組み合わせる制作方法に統一しました。",
        stack: "UI Toolkit・UXML・USS・Linearity Curve",
      },
    ],
    scope: [
      { number: "01", field: "企画", title: "ゲームデザイン", detail: "ゲームの企画とルール、周回、コンテンツを設計。" },
      { number: "02", field: "表現", title: "アート", detail: "UIとグラフィック、アートアセットを制作。" },
      { number: "03", field: "開発", title: "設計と実装", detail: "ドメイン設計からUnity上の実装までを担当。" },
      { number: "04", field: "運営", title: "コミュニティ運営", detail: "プレイヤーとの接点を持ち、リリース後の運営を継続。" },
      { number: "05", field: "チーム", title: "チームリーダー", detail: "5人規模のチームで、タスク設計、割り振り、進行確認を担当。" },
    ],
  },

  sphere: {
    id: "sphere",
    logo: "/icon-idle-sphere.webp",
    tone: "",
    chapterLabel: "役割の拡張",
    chapterEra: "2024年",
    eyebrow: "放置ゲーム × インフレーション",
    title: "Idle Sphere",
    description:
      "球体の世界でインフレーションを楽しむ、放置系ゲーム。モバイル版から開発を始め、その後Steam向けのPC・Mac版へ移植しました。レベニューシェアでの共同開発となり、制作に加えてチームを動かす役割も担いました。",
    facts: [
      { term: "リリース", value: "2024年" },
      { term: "開発順序", value: "iOS → Steam（PC・Mac）" },
      { term: "開発環境", value: "Unity・C#・UGUI" },
    ],
    aspect: "landscape",
    images: [
      { src: "/sphere-shot-01.webp", alt: "生成量の内訳と球体を並べたIdle Sphereのメイン画面" },
      { src: "/sphere-shot-02.webp", alt: "軌道上に並ぶ粒子と球体の描画" },
      { src: "/sphere-shot-03.webp", alt: "配色を変えたテーマでの球体と粒子の描画" },
    ],
    caseStudies: [
      {
        label: "思想",
        title: "数値の増加を、画面上の体験に変える。",
        body: "ゲーム内通貨の増加を球体の動きや視覚効果に結びつけ、数値のインフレーションを画面上の体験として伝えることを目指しました。",
      },
      {
        label: "技術",
        title: "Unityの標準機能の、一段下へ降りる。",
        body: "通常のParticle Systemでは扱えない規模と挙動が必要だったため、ゲームロジックと連携するパーティクル基盤を自作しました。最大構成でおよそ13,000要素を同時に扱います。",
        stack: "Unity・C#・UGUI",
        notes: [
          {
            name: "Jobs / Burst / NativeContainer",
            detail: "位置・速度・加速度・色・状態を複数のNativeListへ配置し、回転、球面運動、ノイズ流、追従、消滅演出を並列更新した。",
          },
          {
            name: "GPUインスタンシング",
            detail: "RenderMeshInstancedで描画をまとめ、個別の色はGraphicsBufferからHLSLのCustom Functionで読み出す。",
          },
          {
            name: "手続き的な球面配置",
            detail: "Fibonacci球、螺旋球、Euler角ベースの分布、3Dノイズによる流れを用い、球体というテーマと成長を同じ視覚言語へ統合した。",
          },
          {
            name: "URP Renderer Feature",
            detail: "Colorize、Toon、Pixelation、Chromatic Aberrationなどを切り替え可能にし、見た目そのものをDLCのテーマ展開へ接続した。",
          },
        ],
      },
      {
        label: "次への課題",
        title: "速くしたつもりを、測っていなかった。",
        body: "UIとゲームロジックを担当者で分けた体制では、ゲーム全体の完成度を一貫して判断しにくい問題が残りました。技術面でも、描画の基盤は作れた一方で実測に基づく判断ができていません。1ドローあたりのインスタンス数は実測ではなく固定値のままで、色バッファは変化のないフレームでも毎回全量を転送し、ジョブは直列に繋いで同じフレーム内で待っていました。次はProfilerとFrame DebuggerでCPUとGPUを分けて計測し、端末ごとの性能予算と品質段階を先に定義するところから始めます。",
      },
    ],
    scope: [
      { number: "01", field: "設計", title: "UI・グラフィック", detail: "主担当として画面とビジュアルを設計。" },
      { number: "02", field: "企画", title: "コンテンツ", detail: "ゲーム内コンテンツの検討にも関わる。" },
      { number: "03", field: "チーム", title: "採用と進行管理", detail: "アルバイトメンバーの採用、タスクの割り振り、進行確認を担当。" },
    ],
    storeLink: { label: "Steamで作品を見る", href: "https://store.steampowered.com/app/3217600/Idle_Sphere/" },
  },

  spiral: {
    id: "spiral",
    logo: "/icon-idle-spiral.webp",
    tone: "tint",
    chapterLabel: "はじまり",
    chapterEra: "2022年 — 2023年",
    eyebrow: "放置・クリッカーゲーム × 数学",
    title: "Idle Spiral",
    description:
      "螺旋と数学をテーマにした、放置・クリッカーゲーム。2022年9月、実務経験のない状態からUI・グラフィック担当として開発に参加しました。Steam版での開発経験を経て、iOS・Android版への移植ではUIを全面的に作り直しています。",
    facts: [
      { term: "公開先", value: "Steam（PC）・iOS・Android" },
      { term: "開発順序", value: "Steam（PC） → iOS・Android" },
      { term: "開発環境", value: "Unity・C#・UGUI" },
    ],
    aspect: "landscape",
    images: [
      { src: "/spiral-shot-01.webp", alt: "数式パネルと、複数ラインで描かれた螺旋" },
      { src: "/spiral-shot-02.webp", alt: "破線状のラインで描かれた別デザインの螺旋" },
      { src: "/spiral-shot-03.webp", alt: "リアクター画面と、別の数式から生成された曲線" },
    ],
    caseStudies: [
      {
        label: "思想",
        title: "狭い画面ほど、何を先に伝えるかを決める。",
        body: "表示領域が限られるほど、すべてを並べるのではなく、何を先に伝えるかを決める。現在まで続く情報設計の出発点です。",
      },
      {
        label: "技術",
        title: "螺旋を、毎フレーム描き直す。",
        body: "螺旋の頂点列をX/Y/Zの倍精度系列として保持し、位相差を加えて複数ラインへ展開。単一の画像ではなく、ゲームの進行に応じて形そのものが変化する描画を実装しました。",
        stack: "Unity・C#・UGUI",
        notes: [
          {
            name: "LineRenderer / AraTrail",
            detail: "表現に応じて描画方式を切り替える構造をとり、発光の質感と描画の安定性を使い分けた。",
          },
          {
            name: "Shader Graph",
            detail: "主螺旋、ガラス、ノイズ、炎、水面など30本以上を制作し、画面ごとの質感を作り分けた。",
          },
          {
            name: "TEXDraw",
            detail: "数式をそのまま画面に組版し、数学というテーマをUIの一部として見せた。",
          },
        ],
      },
      {
        label: "次への課題",
        title: "動くコードと、壊れないコードは違う。",
        body: "螺旋の頂点列はリスト先頭への挿入と全要素シフトを繰り返しており、ライン数に比例してCPU負荷が増える構造でした。また、境界値のテストがあれば防げた実装ミスも残っていました。第三者によるコード監査で、自分が書いたグラデーション更新とライン色更新の不具合を指摘されています。原因は個々の注意力ではなく、回帰を検知する仕組みがなかったことでした。この2つが、次作でのデータ指向な描画基盤と、テストへの姿勢につながっています。",
      },
    ],
    scope: [
      { number: "01", field: "設計", title: "UI・グラフィック", detail: "主担当として画面とビジュアルを設計。" },
      { number: "02", field: "開発", title: "ゲームデザインと実装", detail: "ゲームデザインと内部実装にも部分的に参加。" },
      { number: "03", field: "移植", title: "モバイル版のUI再設計", detail: "iOS・Android版への移植では、UIを全面的に作り直し。" },
    ],
    storeLink: { label: "Steamで作品を見る", href: "https://store.steampowered.com/app/1827980/Idle_Spiral/" },
  },
};

// 画面下の時間軸と同じく、左から右へ過去から現在へ。本文の並び順とは逆向き。
const careerTimeline = [
  {
    phase: "学生時代",
    date: "2016 — 2022",
    title: "人と空間への関心",
    detail: "認知科学や教育工学を中心に学びました。空間認知を題材にしたボードゲームの開発や、VRデバイスを用いた空間描画について研究しました。",
    areas: [],
  },
  {
    phase: "ゲーム開発 1年目",
    date: "2022.09 —",
    title: "Idle Spiral",
    detail: "未経験の状態から、UI・グラフィックを中心にゲーム開発の実務を始めました。描画パイプラインや低レベルAPIを独学で習得し、共同開発を通じて、基本的なデザインパターン、ソフトウェアアーキテクチャ、バージョン管理についても学びました。",
    areas: ["グラフィック", "UI", "一部ゲームデザイン"],
  },
  {
    phase: "ゲーム開発 2年目",
    date: "2024.01 —",
    title: "Idle Sphere",
    detail: "グラフィックの表現品質を高めるため、独自のパーティクルシステムを開発・採用しました。技術選定やプロジェクト全体の設計判断にも関わり、モバイルからPC・Macへのマルチプラットフォーム対応を実現しました。",
    areas: ["グラフィック", "UI", "一部ゲームデザイン"],
  },
  {
    phase: "ゲーム開発 3年目",
    date: "2025.01 —",
    title: "Idle Minertia",
    detail: "企画、ゲームデザイン、開発、運営を横断して統括しました。また、5人規模のチームでリーダーを務めました。",
    areas: ["グラフィック", "UI", "企画・ゲームデザイン", "開発・実装", "チームリーダー", "運営・事業判断"],
  },
  {
    phase: "ゲーム開発 4年目",
    date: "2026 — 現在",
    title: "リリース後の継続開発",
    detail: "リリース後もアップデートと改善を継続し、今に至ります。",
    areas: [],
  },
];

// 各プラットフォームはストアページへのリンクになる。
const participatedWorks: {
  title: string;
  icon: string;
  summary: string;
  platforms: { label: string; href?: string }[];
}[] = [
  {
    title: "Idle Minertia",
    icon: "/icon-idle-minertia.webp",
    summary: "企画・ゲームデザイン・開発・運営を横断して担当。",
    platforms: [
      {
        label: "iOS",
        href: "https://apps.apple.com/jp/app/idle-minertia-%E6%94%BE%E7%BD%AE%E3%81%A7%E7%A9%B4%E6%8E%98%E3%82%8A/id6748000916",
      },
      {
        label: "Android",
        href: "https://play.google.com/store/apps/details?id=com.idlesystem.IdleCube&hl=ja",
      },
    ],
  },
  {
    title: "Idle Sphere",
    icon: "/icon-idle-sphere.webp",
    summary: "UI・グラフィックを担当。コンテンツにも関わる。モバイル版を開発後、Steamへ移植。",
    platforms: [
      { label: "Steam（PC・Mac）", href: "https://store.steampowered.com/app/3217600/Idle_Sphere/" },
      { label: "iOS", href: "https://apps.apple.com/jp/app/idlesphere/id6480509205" },
    ],
  },
  {
    title: "Idle Spiral",
    icon: "/icon-idle-spiral.webp",
    summary: "UI・グラフィックを担当。Steam版での開発を経て、モバイル版への移植に参加。",
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
              <img src={image.src} alt={image.alt} loading="lazy" />
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
        <img className="chapter-logo" src={work.logo} alt="" aria-hidden="true" />
        <div className="chapter-meta">
          <span>{work.chapterLabel}</span>
          <span>{work.chapterEra}</span>
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
          </div>
        </div>

        <WorkGallery work={work} />

        <div className="case-study-grid">
          {work.caseStudies.map((study) => (
            <article key={study.label}>
              <p className="label">{study.label}</p>
              <h3>{study.title}</h3>
              <p>{study.body}</p>
              {study.stack && <small>{study.stack}</small>}
              {study.notes && (
                <dl className="tech-notes">
                  {study.notes.map((note) => (
                    <div key={note.name}>
                      <dt>{note.name}</dt>
                      <dd>{note.detail}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>
          ))}
        </div>

        <div className="responsibilities">
          <p className="label">担当範囲</p>
          <ol className="scope-detail">
            {work.scope.map((item) => (
              <li key={item.number}>
                <span>{item.number}</span>
                <div>
                  <p>{item.field}</p>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
          {work.storeLink && (
            <a className="store-link" href={work.storeLink.href} target="_blank" rel="noreferrer">
              {work.storeLink.label} ↗
            </a>
          )}
        </div>
      </section>
  );

  return (
    <main>
      <aside className="sidebar">
        <a className="identity" href="#overview" aria-label="ページ上部へ">
          <strong>YAYU</strong>
          <span>YANASHIMA YUSUKE</span>
        </a>

        <nav className="chapter-nav" aria-label="目次">
          <ol>
            {navigation.map((item) => (
              <li key={item.id} className={activeSection === item.id ? "active" : ""}>
                <a href={`#${item.id}`} aria-current={activeSection === item.id ? "location" : undefined}>
                  <span>{item.number}</span>
                  {item.label}
                  {item.era ? <i>{item.era}</i> : null}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="sidebar-foot">
          <span>ゲームデザイン</span>
          <span>開発・実装</span>
          <span>運営・事業判断</span>
        </div>
      </aside>

      <div className="mobile-header">
        <a href="#overview">YAYU</a>
        <span>{activeLabel}</span>
      </div>

      <div className="page">
        <section className="hero chapter" id="overview">
          <div className="hero-copy">
            <p className="hero-subtitle">活動経歴をまとめる</p>
          </div>

          <div className="works-overview">
            <div className="works-overview-heading">
              <div>
                <p>これまで携わった作品</p>
                <h2>3つのゲームを通じて、担当領域を広げる。</h2>
              </div>
              <div className="career-start">
                <strong>2022年9月</strong>
                <span>ゲーム開発の実務を開始</span>
              </div>
            </div>
            <div className="career-summary" aria-label="これまで携わった作品">
              {participatedWorks.map((work) => (
                <article key={work.title}>
                  <img src={work.icon} alt={`${work.title}のアプリアイコン`} />
                  <div className="work-summary-copy">
                    <h3>{work.title}</h3>
                    <p>{work.summary}</p>
                    <ul aria-label={`${work.title}の公開プラットフォーム`}>
                      {work.platforms.map((platform) => (
                        <li key={platform.label}>
                          {platform.href ? (
                            <a href={platform.href} target="_blank" rel="noreferrer">
                              {platform.label}
                              <span aria-hidden="true"> ↗</span>
                            </a>
                          ) : (
                            platform.label
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
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
                    <ul className="timeline-areas" aria-label={`${item.phase}の担当領域`}>
                      {item.areas.map((area) => <li key={area}>{area}</li>)}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

        </section>

        {renderWork(works.minertia)}

        <section className="turning chapter dark" id="turning-point">
          <div className="chapter-meta">
            <span>転換点</span>
            <span>2024年 冬</span>
          </div>

          <div className="turning-copy">
            <p className="eyebrow">UIの役割を捉え直す</p>
            <h2>
              UIは、遊び手と
              <br />
              ゲームの仕組みのあいだにある。
            </h2>
            <p>
              UIは、ドメイン側の状態やルールの影響を受けながら、画面サイズやアクセシビリティなど、
              遊び手側の制約にも応える必要があります。つまりUIは、ゲームの仕組みと遊び手の板挟みになる場所です。
            </p>
          </div>

          <div className="ui-relationship" aria-label="遊び手、UI、ゲームの仕組みの関係">
            <article>
              <span>遊び手側</span>
              <strong>見える・わかる・操作できる</strong>
              <p>画面サイズ／入力方法／アクセシビリティ／情報の優先順位</p>
            </article>
            <div className="ui-bridge">
              <b>UI</b>
              <p>状態とルールを、理解と操作に翻訳する</p>
            </div>
            <article>
              <span>ドメイン側</span>
              <strong>ゲームの状態とルール</strong>
              <p>数値／進行／条件／相互作用／ゲームデザイン</p>
            </article>
          </div>
          <p className="relationship-conclusion">
            遊び手を最優先するなら、ドメインとUIを別々に最適化するのではなく、
            同じ目的を共有しながら一体として設計する必要がある。
            この考えは、ここから先でさかのぼる2作の反省から生まれ、Idle Minertiaの開発体制と設計方針につながりました。
          </p>
        </section>

        {renderWork(works.sphere)}

        {renderWork(works.spiral)}

        <section className="profile chapter" id="profile">
          <div className="chapter-meta">
            <span>プロフィール</span>
            <span>— 2022年</span>
          </div>

          <div className="profile-grid">
            <div>
              <p className="eyebrow">出発点</p>
              <h2>梁嶋 悠介 <span>Yayu</span></h2>
            </div>
            <div className="profile-copy">
              <p>
                早稲田大学人間科学部卒業。空間認知を題材にしたボードゲームの研究、
                大学院でのVR空間描画研究を経て、ゲーム開発の道へ進みました。
              </p>
              <p>
                ものづくりで重視しているのは、プレイヤーのセーブデータを壊さないことと、
                アップデートのたびに遊び手を驚かせることです。
              </p>
              <a href="https://github.com/yooyooy724" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </div>

          <footer>
            <span>© 2026 YAYU</span>
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
