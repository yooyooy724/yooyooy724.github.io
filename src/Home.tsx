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

const currentAreas = [
  { number: "01", title: "UI・グラフィック", detail: "情報の優先順位を定め、触れた瞬間に意図が伝わる画面をつくる。" },
  { number: "02", title: "開発・実装", detail: "見た目と動きを切り離さず、体験として成立するところまで実装する。" },
  { number: "03", title: "ゲームシステム", detail: "継続的な変更に耐え、長く運営できる構造を選ぶ。" },
  { number: "04", title: "ゲームデザイン", detail: "遊び手の選択と感情から、成長・報酬・周回を組み立てる。" },
  { number: "05", title: "運営・事業判断", detail: "届け方と収益を後付けにせず、企画段階からゲーム体験に組み込む。" },
  { number: "06", title: "チームリーダー", detail: "工程ごとの横割りではなく、遊び手に届く成果までを担う縦割りで仕事を設計する。" },
];

// 旧「全体を担う」章の内容を、対象作品である Idle Minertia の担当範囲として統合した。
const minertiaScope = [
  {
    number: "01",
    field: "設計",
    title: "ゲームデザイン",
    detail: "放置ゲームにローグライク要素を組み込み、周回ごとの差分と長期的な成長を設計。",
  },
  {
    number: "02",
    field: "開発",
    title: "設計と実装",
    detail: "MVVMとUIToolkitを採用し、企画上の判断を実装まで一貫して反映。",
  },
  {
    number: "03",
    field: "事業",
    title: "届け方から逆算",
    detail: "広告で何を伝えるかを先に考え、ゲームの見せ方、テンポ、コンテンツを設計。",
  },
  {
    number: "04",
    field: "運営",
    title: "運営と意思決定",
    detail: "リリース、アップデート、ストア、コミュニティ、収益に関する判断を継続。",
  },
  {
    number: "05",
    field: "チーム",
    title: "成果までを縦に担う",
    detail:
      "工程ごとに仕事を横割りするのではなく、遊び手に届く成果までを担える単位でタスクを設計し、割り振りと進行確認を担当。",
  },
];

const minertiaTech = [
  {
    name: "UIToolkit",
    detail: "UXMLとUSSで画面構造とスタイルを宣言的に持たせ、uGUIより複雑な画面を整理しやすくした。",
  },
  {
    name: "独自ECS",
    detail: "データを配列に連続配置して一括更新する構成。多数のオブジェクトを扱っても処理負荷を抑えられる。",
  },
  {
    name: "StructLinq",
    detail: "構造体ベースのLINQ実装。ヒープ確保を避け、毎フレームのGC発生を抑える。",
  },
];

// 画面下の時間軸と同じく、左から右へ過去から現在へ。本文の並び順とは逆向き。
const careerTimeline = [
  { phase: "学生時代", date: "2016 — 2022", title: "人と空間への関心", detail: "空間認知ボードゲーム・VR研究" },
  { phase: "ゲーム開発 1年目", date: "2022.09 —", title: "Idle Spiral", detail: "UI・グラフィックから実務を開始" },
  { phase: "ゲーム開発 2年目", date: "2024.01 —", title: "Idle Sphere", detail: "技術とチームリーダーへ拡張" },
  { phase: "ゲーム開発 3年目", date: "2025.01 —", title: "Idle Minertia", detail: "企画・ゲームデザイン・開発を統合" },
  { phase: "ゲーム開発 4年目", date: "2026 —", title: "リリース後の運営", detail: "事業判断・改善・チーム運営" },
];

const minertiaImages = [
  { src: "/idle-minertia-01.webp", alt: "複数のつるはしを合成して進化させる画面" },
  { src: "/idle-minertia-02.webp", alt: "ゲームに登場する道具とエンチャント" },
  { src: "/idle-minertia-03.webp", alt: "採掘と岩盤の進行を示すゲーム画面" },
];

// href を持つプラットフォームはストアページへのリンクになる。
// Idle Sphere の Google Play だけは、旧サイトにあったURL
// （com.idlesystem.IdleSphere）が現在404を返すためリンクしていない。
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
      { label: "Android" },
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

export default function Home() {
  const [activeSection, setActiveSection] = useState(overview.id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tickPositions, setTickPositions] = useState<Record<string, number>>({});
  // 詳細は同時にひとつだけ開く。null は全て閉じた状態。
  const [openArea, setOpenArea] = useState<string | null>(null);
  const minertiaTrackRef = useRef<HTMLDivElement>(null);
  const [minertiaScroll, setMinertiaScroll] = useState({ previous: false, next: true });

  const scrollMinertiaImages = (direction: -1 | 1) => {
    const track = minertiaTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.78, behavior: "smooth" });
  };

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

  useEffect(() => {
    const track = minertiaTrackRef.current;
    if (!track) return;

    const updateScrollButtons = () => {
      const maximum = track.scrollWidth - track.clientWidth;
      setMinertiaScroll({
        previous: track.scrollLeft > 4,
        next: maximum > 4 && track.scrollLeft < maximum - 4,
      });
    };

    updateScrollButtons();
    track.addEventListener("scroll", updateScrollButtons, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, []);

  const markerPosition = toEraAxis(scrollProgress);
  // 端でラベルがはみ出さないよう、読み取り表示だけは内側に寄せる。
  const readoutPosition = Math.min(90, Math.max(10, markerPosition));
  const activeChapter = chapters.find((item) => item.id === activeSection);
  const activeLabel = navigation.find((item) => item.id === activeSection)?.label;
  // 概要は時間軸上の一点ではないため、表示中はインジケータを引っ込める。
  const axisHidden = !activeChapter;

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
        <section className="hero chapter" id="overview" data-index="00">
          <div className="hero-copy">
            <h1>Yayu games</h1>
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

          <div className="current-areas" aria-label="制作を通じて広げてきた領域">
            <div className="current-areas-heading">
              <p>制作を通じて広げてきた領域</p>
            </div>
            <ol>
              {currentAreas.map((item) => {
                const open = openArea === item.number;
                return (
                  <li key={item.number} className={open ? "open" : ""}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`area-detail-${item.number}`}
                      onClick={() => setOpenArea(open ? null : item.number)}
                    >
                      <span>{item.number}</span>
                      <strong>{item.title}</strong>
                      <i aria-hidden="true" />
                    </button>
                    <p id={`area-detail-${item.number}`} hidden={!open}>
                      {item.detail}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="career-graph">
            <ol className="career-timeline" aria-label="学生時代から現在までの時系列">
              {careerTimeline.map((item) => (
                <li key={item.phase}>
                  <span className="timeline-phase">{item.phase}</span>
                  <i aria-hidden="true" />
                  <time>{item.date}</time>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </li>
              ))}
            </ol>
          </div>

          <a className="continue-link" href="#minertia">
            <span>過去へさかのぼる</span>
            <b aria-hidden="true">↓</b>
          </a>
        </section>

        <section className="featured chapter dark" id="minertia" data-index="01">
          <div className="chapter-meta">
            <span>代表作</span>
            <span>2025年 リリース</span>
          </div>

          <div className="featured-title">
            <div>
              <p className="eyebrow">放置ゲーム × ローグライク</p>
              <h2>Idle Minertia</h2>
              <p className="featured-description">
                カジュアルなユーザーにも届く入口をつくり、ローグライク要素による
                選択とビルド構築の奥行きを加えることで、従来作よりターゲット層を広げた放置ゲームです。
              </p>
            </div>
            <div className="featured-meta">
              <p className="created-by">Created by<br /><strong>Yusuke Yanashima</strong></p>
              <dl>
                <div><dt>リリース</dt><dd>2025年</dd></div>
                <div><dt>公開先</dt><dd>iOS・Android</dd></div>
                <div><dt>開発形態</dt><dd>企画・開発主導</dd></div>
              </dl>
            </div>
          </div>

          <div className="minertia-carousel" aria-label="Idle Minertiaのゲーム画面">
            <div className="carousel-stage">
              <div className="carousel-track" ref={minertiaTrackRef}>
                {minertiaImages.map((image) => (
                  <figure key={image.src}>
                    <img src={image.src} alt={image.alt} />
                  </figure>
                ))}
              </div>
              <button className="carousel-button carousel-previous" type="button" onClick={() => scrollMinertiaImages(-1)} aria-label="前の画像を見る" disabled={!minertiaScroll.previous}>←</button>
              <button className="carousel-button carousel-next" type="button" onClick={() => scrollMinertiaImages(1)} aria-label="次の画像を見る" disabled={!minertiaScroll.next}>→</button>
            </div>
          </div>

          <div className="case-study-grid">
            <article>
              <p className="label">思想</p>
              <h3>遊び手ベースをすべてにおいて。</h3>
              <p>
                UI、ゲームデザイン、ゲームロジックを一貫して担当し、
                プレイヤーに届く体験から逆算して判断しました。チームのタスクも工程ごとの横割りではなく、
                遊び手に届く成果までを一貫して担う縦割りを目指しています。
              </p>
            </article>
            <article>
              <p className="label">技術</p>
              <h3>DDDとMVVMで、変更に耐える構造へ。</h3>
              <p>
                DDDでゲーム内の概念とルールを整理し、MVVMで責務を分離。
                Unityへの依存を抑え、インタラクションをC#側で管理しました。
              </p>
              <small>Unity・C#</small>
              <dl className="tech-notes">
                {minertiaTech.map((item) => (
                  <div key={item.name}>
                    <dt>{item.name}</dt>
                    <dd>{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </article>
            <article>
              <p className="label">企画戦略</p>
              <h3>メインコンテンツが死なない周回を組む。</h3>
              <p>
                Idleゲームでは周回とともに次のコンテンツへシフトすることがほとんどですが、
                システムをシンプルかつカジュアルにするため、メインコンテンツが死なない周回システムを取り入れました。
                同時にメインコンテンツに飽きないよう、ローグライク要素による選択・組み合わせによる
                周回する楽しさを取り入れ、ゲームを深く楽しむ層にも届くよう設計しました。
                さらに、非同期のマルチ協力コンテンツを入れることで、プレイヤー間の高め合いも取り入れています。
              </p>
            </article>
          </div>

          <div className="responsibilities">
            <p className="label">担当範囲</p>
            <ol className="scope-detail">
              {minertiaScope.map((item) => (
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
          </div>
        </section>

        <section className="turning chapter dark" id="turning-point" data-index="02">
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

        <section className="journey chapter" id="sphere" data-index="03">
          <div className="chapter-meta">
            <span>役割の拡張</span>
            <span>2024年</span>
          </div>

          <div className="journey-layout">
            <div className="journey-intro">
              <p className="eyebrow">第二作・Idle Sphere</p>
              <figure className="journey-image">
                <img src="/idle-sphere.jpg" alt="Idle Sphereの公式ストア画像" />
              </figure>
            </div>
            <div className="journey-body">
              <p className="lead">
                球体の世界でインフレーションを楽しむ、放置系ゲーム。
              </p>
              <p>
                モバイル版から開発を始め、その後Steam向けのPC・Mac版へ移植しました。
                レベニューシェアでの共同開発となり、制作に加えてチームを動かす役割も担いました。
              </p>
              <div className="project-facts">
                <div><span>開発順序</span><strong>iOS・Android → Steam（PC・Mac）</strong></div>
                <div><span>関わり</span><strong>共同開発・レベニューシェア</strong></div>
              </div>
              <div className="project-aspects">
                <article>
                  <h3>担当</h3>
                  <p>UI・グラフィックを主担当とし、アルバイトメンバーの採用、タスクの割り振り、進行確認を行いました。</p>
                </article>
                <article>
                  <h3>思想</h3>
                  <p>ゲーム内通貨の増加を球体の動きや視覚効果に結びつけ、数値のインフレーションを画面上の体験として伝えることを目指しました。</p>
                </article>
                <article>
                  <h3>技術</h3>
                  <p>Unity、C#、UGUIに加え、DOTSの低レベルAPIを用いて、ゲームロジックと連携する独自ParticleSystemを実装しました。</p>
                </article>
                <article>
                  <h3>次への課題</h3>
                  <p>描画性能は改善した一方、UIとゲームロジックを担当者で分けた体制では、ゲーム全体の完成度を一貫して判断しにくい問題が残りました。</p>
                </article>
              </div>
              <a className="store-link" href="https://store.steampowered.com/app/3217600/Idle_Sphere/" target="_blank" rel="noreferrer">Steamで作品を見る ↗</a>
            </div>
          </div>
        </section>

        <section className="journey chapter tint" id="spiral" data-index="04">
          <div className="chapter-meta">
            <span>はじまり</span>
            <span>2022年 — 2023年</span>
          </div>

          <div className="journey-layout">
            <div className="journey-intro">
              <p className="eyebrow">第一作・Idle Spiral</p>
              <figure className="journey-image">
                <img src="/idle-spiral.jpg" alt="Idle Spiralの公式ストア画像" />
              </figure>
            </div>
            <div className="journey-body">
              <p className="lead">
                螺旋と数学をテーマにした、放置・クリッカーゲーム。
              </p>
              <p>
                2022年9月、実務経験のない状態からUI・グラフィック担当として開発に参加しました。
                Steam版での開発経験を経て、iOS・Android版への移植ではUIを全面的に作り直しています。
              </p>
              <div className="project-facts">
                <div><span>公開先</span><strong>Steam（PC）／iOS／Android</strong></div>
                <div><span>関わり</span><strong>業務委託 → アルバイト</strong></div>
              </div>
              <div className="project-aspects">
                <article>
                  <h3>担当</h3>
                  <p>UI・グラフィックを主担当とし、ゲームデザインと内部実装にも部分的に参加。モバイル移植ではUIを全面的に再設計しました。</p>
                </article>
                <article>
                  <h3>思想</h3>
                  <p>表示領域が限られるほど、すべてを並べるのではなく、何を先に伝えるかを決める。現在まで続く情報設計の出発点です。</p>
                </article>
                <article>
                  <h3>技術</h3>
                  <p>Unity、C#、UGUIを使用。螺旋描画にはLineRendererを用い、チーム開発に必要なデザインパターンも実務の中で習得しました。</p>
                </article>
                <article>
                  <h3>次への課題</h3>
                  <p>CPU側で行う螺旋描画の負荷、Prefab管理の属人性、UIとゲームロジックの距離を次作へ持ち越しました。</p>
                </article>
              </div>
              <a className="store-link" href="https://store.steampowered.com/app/1827980/Idle_Spiral/" target="_blank" rel="noreferrer">Steamで作品を見る ↗</a>
            </div>
          </div>
        </section>

        <section className="profile chapter" id="profile" data-index="05">
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
