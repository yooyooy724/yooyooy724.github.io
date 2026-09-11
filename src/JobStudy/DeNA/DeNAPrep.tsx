import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  SYNCED_AT,
  VAULT_ROOT,
  acceptedWeaknesses,
  allSectionIds,
  checkSections,
  competitionArguments,
  competitionFallback,
  competitionItems,
  competitionScript,
  competitionVerdict,
  decisionRows,
  homeworkSections,
  nineReasons,
  notReasons,
  recommendationRows,
  releaseOrder,
  roadmapPhases,
  strongestPoints,
  tocGroups,
  type CheckItem,
  type CheckSection,
  type HomeworkQuestion,
  type HomeworkSection,
} from "./data";
import { copyText, downloadMarkdown, downloadText, fileStamp, fullMarkdown, homeworkMarkdown } from "./markdown";
import {
  buildBackup,
  fetchShared,
  mergeRecords,
  overlayLocal,
  parseBackup,
  usePersistentRecord,
  useTheme,
} from "./storage";

const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, "");

const filled = (s: string | undefined) => Boolean(s && s.trim());

const clock = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/* ------------------------------------------------------------------ *
 * 部品
 * ------------------------------------------------------------------ */

function Bar({ done, total, tone }: { done: number; total: number; tone?: "gate" }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="jp-bar" role="img" aria-label={`${done} / ${total} 完了（${pct}%）`}>
      <span
        className={`jp-bar-fill${done === total && total > 0 ? " is-full" : ""}${tone ? ` ${tone}` : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Count({ done, total }: { done: number; total: number }) {
  return (
    <span className={`jp-count${done === total && total > 0 ? " is-full" : ""}`}>
      <b>{done}</b>
      <i>/{total}</i>
    </span>
  );
}

/** 出典。保管庫のどのファイルを写したものかを各セクションに明記する。 */
function Source({ file }: { file: string }) {
  return (
    <p className="jp-source">
      出典 <code>{VAULT_ROOT}{file}</code>
    </p>
  );
}

function SectionHead({
  id,
  no,
  title,
  file,
  lead,
  done,
  total,
  flag,
  flagText,
}: {
  id: string;
  no?: string;
  title: string;
  file: string;
  lead?: string;
  done?: number;
  total?: number;
  flag?: "gate" | "order";
  flagText?: string;
}) {
  return (
    <div className="jp-section-head">
      <div className="jp-section-title">
        {no ? <span className="jp-section-no">{no}</span> : null}
        <h2>
          <a href={`#${id}`} className="jp-anchor">
            {title}
          </a>
        </h2>
        {typeof done === "number" && typeof total === "number" ? <Count done={done} total={total} /> : null}
      </div>
      {flagText ? <p className={`jp-flag ${flag}`}>{flagText}</p> : null}
      {typeof done === "number" && typeof total === "number" ? (
        <Bar done={done} total={total} tone={flag === "gate" ? "gate" : undefined} />
      ) : null}
      {lead ? <p className="jp-section-lead">{lead}</p> : null}
      <Source file={file} />
    </div>
  );
}

function CheckRow({
  item,
  checked,
  onToggle,
}: {
  item: CheckItem;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <li className={`jp-check${checked ? " is-done" : ""}`}>
      <label>
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className="jp-check-box" aria-hidden="true" />
        <span className="jp-check-body">
          <span className="jp-check-text">{item.text}</span>
          {item.notes?.length ? (
            <span className="jp-check-notes">
              {item.notes.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          ) : null}
        </span>
      </label>
      {item.jumpTo ? (
        <a className="jp-jump" href={`#${item.jumpTo}`}>
          該当箇所へ ↓
        </a>
      ) : null}
    </li>
  );
}

function ChecklistSection({
  section,
  checks,
  onToggle,
  hideDone,
}: {
  section: CheckSection;
  checks: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
  hideDone: boolean;
}) {
  const total = section.items.length;
  const done = section.items.filter((i) => checks[i.id]).length;
  const shown = hideDone ? section.items.filter((i) => !checks[i.id]) : section.items;

  return (
    <section className={`jp-section${section.flag === "gate" ? " is-gate" : ""}`} id={section.id}>
      <SectionHead
        id={section.id}
        no={section.no}
        title={section.title}
        file={section.source}
        lead={section.lead}
        done={done}
        total={total}
        flag={section.flag}
        flagText={section.flagText}
      />

      {section.table ? (
        <div className="jp-table-wrap">
          <table className="jp-table">
            <thead>
              <tr>
                <th>{section.table.head[0]}</th>
                <th>{section.table.head[1]}</th>
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((r) => (
                <tr key={r.term}>
                  <th scope="row">{r.term}</th>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {shown.length ? (
        <ul className="jp-checks">
          {shown.map((item) => (
            <CheckRow key={item.id} item={item} checked={Boolean(checks[item.id])} onToggle={(v) => onToggle(item.id, v)} />
          ))}
        </ul>
      ) : (
        <p className="jp-empty">この角度は完了。</p>
      )}
    </section>
  );
}

function QuestionCard({
  q,
  value,
  onChange,
  index,
}: {
  q: HomeworkQuestion;
  value: string;
  onChange: (next: string) => void;
  index: number;
}) {
  const answered = filled(value);
  const chars = value ? value.trim().length : 0;

  return (
    <li className={`jp-q${answered ? " is-answered" : ""}${q.hot ? " is-hot" : ""}`} id={`q-${q.id}`}>
      <div className="jp-q-head">
        <span className="jp-q-label">{q.label}</span>
        <h3>{q.question}</h3>
        <span className={`jp-q-state${answered ? " is-answered" : ""}`}>{answered ? "回答済み" : "未回答"}</span>
      </div>

      {q.hot ? <p className="jp-q-hot">DeNA対策で優先度が高い</p> : null}
      {q.aim ? <p className="jp-q-aim">狙い — {q.aim}</p> : null}
      {q.hints?.length ? (
        <ul className="jp-q-hints">
          {q.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : null}
      {q.existing ? (
        <details className="jp-q-existing">
          <summary>保管庫にある書きかけの回答（要追記）</summary>
          <p>{q.existing}</p>
        </details>
      ) : null}

      <textarea
        className="jp-textarea"
        data-answer-index={index}
        rows={q.rows ?? 4}
        value={value}
        placeholder={q.placeholder ?? "箇条書きで本音を書くのが先。磨くのは後。"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${q.label} ${q.question} への回答`}
      />

      <div className="jp-q-foot">
        <span>{chars ? `${chars} 字` : "空欄"}</span>
        {q.existing && !answered ? (
          <button type="button" className="jp-mini" onClick={() => onChange(q.existing ?? "")}>
            書きかけを読み込む
          </button>
        ) : null}
        {answered ? (
          <button type="button" className="jp-mini" onClick={() => onChange("")}>
            消す
          </button>
        ) : null}
      </div>
    </li>
  );
}

function HomeworkBlock({
  section,
  answers,
  onChange,
  onCopy,
  hideDone,
  offset,
}: {
  section: HomeworkSection;
  answers: Record<string, string>;
  onChange: (id: string, next: string) => void;
  onCopy: (id: string) => void;
  hideDone: boolean;
  offset: number;
}) {
  const total = section.questions.length;
  const done = section.questions.filter((q) => filled(answers[q.id])).length;
  const shown = hideDone ? section.questions.filter((q) => !filled(answers[q.id])) : section.questions;

  return (
    <section className="jp-section" id={section.id}>
      <SectionHead
        id={section.id}
        no={section.no}
        title={section.title}
        file={section.source}
        lead={section.lead}
        done={done}
        total={total}
      />

      <div className="jp-section-tools">
        <button type="button" className="jp-mini" onClick={() => onCopy(section.id)}>
          この宿題をコピー
        </button>
      </div>

      {shown.length ? (
        <ol className="jp-qs">
          {shown.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={offset + section.questions.indexOf(q)}
              value={answers[q.id] ?? ""}
              onChange={(v) => onChange(q.id, v)}
            />
          ))}
        </ol>
      ) : (
        <p className="jp-empty">この宿題は全問埋まっている。</p>
      )}

      {section.followUps?.length ? (
        <div className="jp-note-box">
          <p className="label">付帯タスク</p>
          <ul>
            {section.followUps.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {section.answeredInVault?.length ? (
        <details className="jp-answered">
          <summary>保管庫で回答済みの設問（{section.answeredInVault.length}）</summary>
          <ul>
            {section.answeredInVault.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * ページ
 * ------------------------------------------------------------------ */

const SHORTCUTS: [string, string][] = [
  ["J / N", "次のセクションへ"],
  ["K / P", "前のセクションへ"],
  ["H", "先頭（進捗）へ戻る"],
  ["U", "残りだけ表示の切り替え"],
  ["D", "ダークモードの切り替え"],
  ["Ctrl + Enter", "入力中 → 次の未回答へ飛ぶ"],
  ["Esc", "入力欄から抜ける／この一覧を閉じる"],
  ["?", "この一覧"],
];

export default function DeNAPrep() {
  const { theme, toggle: toggleTheme } = useTheme();
  const checkStore = usePersistentRecord<boolean>("checks", {});
  const answerStore = usePersistentRecord<string>("answers", {});
  const checks = checkStore.value;
  const answers = answerStore.value;

  const [hideDone, setHideDone] = useState(false);
  const [active, setActive] = useState(allSectionIds[0]);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  /* --- 進捗 --- */
  const checkTotal = useMemo(
    () => checkSections.reduce((n, s) => n + s.items.length, 0) + competitionItems.length,
    [],
  );
  const checkDone = useMemo(
    () =>
      checkSections.reduce((n, s) => n + s.items.filter((i) => checks[i.id]).length, 0) +
      competitionItems.filter((i) => checks[i.id]).length,
    [checks],
  );
  const hwTotal = useMemo(() => homeworkSections.reduce((n, s) => n + s.questions.length, 0), []);
  const hwDone = useMemo(
    () => homeworkSections.reduce((n, s) => n + s.questions.filter((q) => filled(answers[q.id])).length, 0),
    [answers],
  );
  const gateSection = checkSections.find((s) => s.flag === "gate");
  const gateDone = gateSection ? gateSection.items.filter((i) => checks[i.id]).length : 0;
  const gateTotal = gateSection ? gateSection.items.length : 0;

  /* --- 保存表示 --- */
  const savedAt = useMemo(() => {
    const a = checkStore.savedAt?.getTime() ?? 0;
    const b = answerStore.savedAt?.getTime() ?? 0;
    const latest = Math.max(a, b);
    return latest ? new Date(latest) : null;
  }, [checkStore.savedAt, answerStore.savedAt]);
  const saving = checkStore.dirty || answerStore.dirty;
  const saveFailed = checkStore.failed || answerStore.failed;

  /* --- 現在地 --- */
  useEffect(() => {
    const sections = allSectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.1, 0.5] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [hideDone]);

  /* --- スクロール量 --- */
  useEffect(() => {
    let frame = 0;
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
    setTocOpen(false);
  }, []);

  const step = useCallback(
    (delta: number) => {
      const i = allSectionIds.indexOf(active);
      const next = allSectionIds[Math.min(allSectionIds.length - 1, Math.max(0, (i < 0 ? 0 : i) + delta))];
      if (next) goTo(next);
    },
    [active, goTo],
  );

  /* --- 書き出し --- */
  const handleCopyAll = useCallback(async () => {
    const ok = await copyText(fullMarkdown(answers, checks));
    notify(ok ? "全部コピーした。Claude に貼れる。" : "コピーできなかった。書き出しを使う。");
  }, [answers, checks, notify]);

  const handleCopySection = useCallback(
    async (id: string) => {
      const ok = await copyText(homeworkMarkdown(id, answers));
      notify(ok ? "この宿題をコピーした。" : "コピーできなかった。");
    },
    [answers, notify],
  );

  const handleDownload = useCallback(() => {
    downloadMarkdown(fullMarkdown(answers, checks), `DeNA対策_回答_${fileStamp()}.md`);
    notify("Markdown を書き出した。");
  }, [answers, checks, notify]);

  /* --- 共有版の取り込み（どのブラウザで開いても同じ内容から始める） --- */
  const [sharedAt, setSharedAt] = useState<string | null>(null);
  const pulled = useRef(false);

  useEffect(() => {
    if (pulled.current) return;
    pulled.current = true;
    let alive = true;
    void (async () => {
      const shared = await fetchShared();
      if (!alive || !shared) return;
      // 共有版を土台に、この端末で書いた分を上に重ねる（書きかけを消さない）
      answerStore.replace(overlayLocal(shared.answers, answerStore.value));
      checkStore.replace({ ...shared.checks, ...checkStore.value });
      setSharedAt(shared.savedAt);
    })();
    return () => {
      alive = false;
    };
  }, [answerStore, checkStore]);

  /* --- バックアップ（別のブラウザ・別の端末へ持ち運ぶ） --- */
  const fileInput = useRef<HTMLInputElement | null>(null);

  const handleBackupSave = useCallback(() => {
    downloadText(buildBackup(answers, checks), `DeNA対策_バックアップ_${fileStamp()}.json`, "application/json");
    notify("バックアップを保存した。別の端末ではこれを読み込む。");
  }, [answers, checks, notify]);

  const handleBackupPick = useCallback(() => fileInput.current?.click(), []);

  const handleBackupLoad = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const data = parseBackup(await file.text());
      if (!data) {
        notify("読み込めなかった。このページで保存した .json を選ぶ。");
        return;
      }
      answerStore.replace(mergeRecords(answers, data.answers));
      checkStore.replace(mergeRecords(checks, data.checks));
      const n = Object.values(data.answers).filter((v) => v.trim()).length;
      notify(`読み込んだ。回答 ${n} 件を反映した。`);
    },
    [answers, checks, answerStore, checkStore, notify],
  );

  /* --- キーボード --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = Boolean(el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable));

      // 入力中でも効かせるのはこの2つだけ
      if (typing) {
        if (e.key === "Escape") {
          el?.blur();
          return;
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          const areas = Array.from(document.querySelectorAll<HTMLTextAreaElement>("textarea[data-answer-index]"));
          const from = areas.indexOf(el as HTMLTextAreaElement);
          const next =
            areas.slice(from + 1).find((a) => !a.value.trim()) ?? areas.find((a) => !a.value.trim() && a !== el);
          if (next) {
            next.focus();
            next.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            notify("未回答の設問はもう無い。");
          }
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "j":
        case "n":
          e.preventDefault();
          step(1);
          break;
        case "k":
        case "p":
          e.preventDefault();
          step(-1);
          break;
        case "h":
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "u":
          e.preventDefault();
          setHideDone((v) => !v);
          break;
        case "d":
          e.preventDefault();
          toggleTheme();
          break;
        case "?":
          e.preventDefault();
          setHelp((v) => !v);
          break;
        case "Escape":
          setHelp(false);
          setTocOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notify, step, toggleTheme]);

  // 宿題のテキストエリアに通し番号を振るためのオフセット
  const offsets = useMemo(() => {
    let n = 0;
    const map: Record<string, number> = {};
    for (const s of homeworkSections) {
      map[s.id] = n;
      n += s.questions.length;
    }
    return map;
  }, []);

  const gyoumuDone = competitionItems.filter((i) => checks[i.id]).length;

  return (
    <div className="jp">
      <span className="jp-scroll" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <header className="jp-topbar">
        <a className="jp-home" href={asset("/")} aria-label="ポートフォリオへ戻る">
          <img src={asset("/yayu-mark.png")} alt="" aria-hidden="true" />
          <span>Ya.Yu.</span>
        </a>

        <div className="jp-topbar-mid">
          <span className="jp-topbar-stat">
            やること <Count done={checkDone} total={checkTotal} />
          </span>
          <span className="jp-topbar-stat">
            宿題 <Count done={hwDone} total={hwTotal} />
          </span>
          <span className={`jp-save${saveFailed ? " is-failed" : ""}`} aria-live="polite">
            {saveFailed
              ? "保存できない（この端末では保存が使えない）"
              : saving
                ? "保存中…"
                : savedAt
                  ? `保存済み ${clock(savedAt)}`
                  : "自動保存"}
          </span>
        </div>

        <div className="jp-topbar-actions">
          <button
            type="button"
            className={`jp-mini${hideDone ? " is-on" : ""}`}
            onClick={() => setHideDone((v) => !v)}
            aria-pressed={hideDone}
            title="U"
          >
            残りだけ
          </button>
          <button type="button" className="jp-mini" onClick={toggleTheme} title="D">
            {theme === "dark" ? "☀ 明るく" : "☾ 暗く"}
          </button>
          <button type="button" className="jp-mini" onClick={() => setHelp((v) => !v)} title="?">
            ?
          </button>
          <button type="button" className="jp-mini jp-toc-open" onClick={() => setTocOpen((v) => !v)} aria-expanded={tocOpen}>
            目次
          </button>
        </div>
      </header>

      <div className="jp-body">
        <nav className={`jp-toc${tocOpen ? " is-open" : ""}`} aria-label="目次">
          <p className="label jp-toc-title">現在地</p>
          {tocGroups.map((group) => (
            <div className="jp-toc-group" key={group.label}>
              <p className="jp-toc-group-label">{group.label}</p>
              <ul>
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={active === entry.id ? "is-active" : undefined}
                      aria-current={active === entry.id ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        goTo(entry.id);
                      }}
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="jp-toc-keys">J / K でセクション移動・? でキー一覧</p>
        </nav>

        <main className="jp-main">
          {/* ---------------- ヒーロー ---------------- */}
          <section className="jp-hero">
            <p className="label jp-eyebrow">Job Study — DeNA</p>
            <h1>DeNA対策</h1>
            <p className="jp-hero-lead">
              第1目標に決めた DeNA の準備。<b>これからやること</b>と、<b>宿題を書く場所</b>の2つだけ。
            </p>

            <div className="jp-hero-grid">
              <div className="jp-stat">
                <p className="label">やること</p>
                <Count done={checkDone} total={checkTotal} />
                <Bar done={checkDone} total={checkTotal} />
                <p className="jp-stat-note">8つの角度＋副業の整理</p>
              </div>
              <div className="jp-stat">
                <p className="label">宿題</p>
                <Count done={hwDone} total={hwTotal} />
                <Bar done={hwDone} total={hwTotal} />
                <p className="jp-stat-note">未回答の設問に書き込める</p>
              </div>
              <div className="jp-stat is-gate">
                <p className="label">第一関門 — 副業の確認</p>
                <Count done={gateDone} total={gateTotal} />
                <Bar done={gateDone} total={gateTotal} tone="gate" />
                <p className="jp-stat-note">ここが通らないと DeNA は成立しない</p>
              </div>
            </div>

            <div className="jp-order" aria-label="応募までの順序">
              <p className="label">崩せない順序</p>
              <ol>
                {releaseOrder.map((o) => (
                  <li key={o.step}>
                    <span className="jp-order-no">{o.step}</span>
                    <b>{o.label}</b>
                    <em>{o.state}</em>
                  </li>
                ))}
              </ol>
              <p className="jp-order-why">
                入社後の新規リリースは副業承認のハードルが跳ね上がる。Steam版を応募より前に出せば「入社前から存在する既存作品」になる。
              </p>
            </div>

            <div className="jp-actions">
              <button type="button" className="jp-btn is-primary" onClick={handleCopyAll}>
                全部まとめてコピー
              </button>
              <button type="button" className="jp-btn" onClick={handleDownload}>
                Markdown で書き出し
              </button>
              <span className="jp-actions-note">Claude に貼って保管庫へ反映する</span>
            </div>

            <div className="jp-actions">
              <button type="button" className="jp-btn" onClick={handleBackupSave}>
                バックアップを保存（.json）
              </button>
              <button type="button" className="jp-btn" onClick={handleBackupPick}>
                バックアップを読み込む
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                onChange={handleBackupLoad}
                hidden
              />
              <span className="jp-actions-note">
                {sharedAt
                  ? `共有版を読み込み済み（${sharedAt.slice(0, 10)}）。どの端末で開いてもここから始まる。書いた分を共有版へ反映するには、このファイルを Claude に渡す`
                  : "入力はこのブラウザの中に保存される。共有版へ反映するには、このファイルを Claude に渡す"}
              </span>
            </div>
          </section>

          {/* ---------------- 前提 ---------------- */}
          <section className="jp-section" id="premise">
            <SectionHead id="premise" title="決定と順序" file="DeNA対策.md／候補企業.md／行動計画.md" />

            <h3 className="jp-h3">決定の根拠</h3>
            <div className="jp-table-wrap">
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>決め手</th>
                    <th>中身</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionRows.map((r) => (
                    <tr key={r.term}>
                      <th scope="row">{r.term}</th>
                      <td>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="jp-h3">承知したうえで受け入れた弱点</h3>
            <ul className="jp-bullets is-warn">
              {acceptedWeaknesses.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>

            <h3 className="jp-h3">
              総合推薦 <span className="jp-h3-src">候補企業.md</span>
            </h3>
            <div className="jp-table-wrap">
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>位置</th>
                    <th>企業</th>
                    <th>理由</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendationRows.map((r) => (
                    <tr key={r.company} className={r.emphasis ? "is-emphasis" : undefined}>
                      <th scope="row">{r.rank}</th>
                      <td>{r.company}</td>
                      <td>{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="jp-h3">
              全体ロードマップ <span className="jp-h3-src">行動計画.md</span>
            </h3>
            <ol className="jp-phases">
              {roadmapPhases.map((p) => (
                <li key={p.phase}>
                  <span className="label">{p.phase}</span>
                  <b>{p.title}</b>
                  <em>{p.when}</em>
                  <span className="jp-phase-body">{p.body}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------------- 1. これからやること ---------------- */}
          <h2 className="jp-part">
            <span className="label">Part 1</span>
            これからやること
          </h2>

          {checkSections.map((s) => (
            <ChecklistSection
              key={s.id}
              section={s}
              checks={checks}
              onToggle={checkStore.set}
              hideDone={hideDone}
            />
          ))}

          {/* ---------------- 副業の競業性 ---------------- */}
          <section className="jp-section is-gate" id="gyoumu">
            <SectionHead
              id="gyoumu"
              title="副業の競業性の整理"
              file="副業の競業性の整理.md"
              lead="当初の「Steam買い切りだから重ならない」は成立しない。戦略は「同業と認めたうえで承認基準を満たすことを示す」。"
              done={gyoumuDone}
              total={competitionItems.length}
              flag="gate"
              flagText="第一関門の資料 — 面接前に必ず読む"
            />

            <h3 className="jp-h3">重なりの判定</h3>
            <div className="jp-table-wrap">
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>軸</th>
                    <th>Idle MInertia</th>
                    <th>DeNA ゲーム事業</th>
                    <th>判定</th>
                  </tr>
                </thead>
                <tbody>
                  {competitionVerdict.map((r) => (
                    <tr key={r.axis} className={r.overlap ? "is-emphasis" : undefined}>
                      <th scope="row">{r.axis}</th>
                      <td>{r.mine}</td>
                      <td>{r.dena}</td>
                      <td>
                        <span className={`jp-tag${r.overlap ? " is-warn" : ""}`}>{r.verdict}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="jp-callout">
              フルスイングは申請承認制で、<b>同業のプロジェクト参加が承認された事例がある</b>。「非競業であること」は承認の必要条件ではない。
            </p>

            <h3 className="jp-h3">4つの論点への答え</h3>
            <div className="jp-table-wrap">
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>論点</th>
                    <th>想定される懸念</th>
                    <th>用意する答え</th>
                  </tr>
                </thead>
                <tbody>
                  {competitionArguments.map((r) => (
                    <tr key={r.point}>
                      <th scope="row">{r.point}</th>
                      <td>{r.worry}</td>
                      <td>{r.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="jp-h3">最も強い材料</h3>
            <ul className="jp-bullets is-good">
              {strongestPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            <h3 className="jp-h3">落としどころ（上から順に交渉する）</h3>
            <div className="jp-table-wrap">
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>段階</th>
                    <th>内容</th>
                    <th>失うもの</th>
                  </tr>
                </thead>
                <tbody>
                  {competitionFallback.map((r) => (
                    <tr key={r.step}>
                      <th scope="row">{r.step}</th>
                      <td>{r.content}</td>
                      <td>{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <details className="jp-script">
              <summary>面接・申請での言い方（草案）</summary>
              <blockquote>
                {competitionScript.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </blockquote>
            </details>

            <h3 className="jp-h3">このセクション固有のタスク</h3>
            <ul className="jp-checks">
              {(hideDone ? competitionItems.filter((i) => !checks[i.id]) : competitionItems).map((item) => (
                <CheckRow
                  key={item.id}
                  item={item}
                  checked={Boolean(checks[item.id])}
                  onToggle={(v) => checkStore.set(item.id, v)}
                />
              ))}
            </ul>
          </section>

          {/* ---------------- 2. 宿題 ---------------- */}
          <h2 className="jp-part">
            <span className="label">Part 2</span>
            宿題（未回答の設問）
          </h2>
          <p className="jp-part-lead">
            打つと自動保存される。完璧な文章にしなくていい。<b>箇条書きで本音を書くのが先、磨くのは後</b>。
          </p>

          {homeworkSections.map((s) => (
            <HomeworkBlock
              key={s.id}
              section={s}
              answers={answers}
              onChange={answerStore.set}
              onCopy={handleCopySection}
              hideDone={hideDone}
              offset={offsets[s.id] ?? 0}
            />
          ))}

          <div className="jp-actions is-bottom">
            <button type="button" className="jp-btn is-primary" onClick={handleCopyAll}>
              全部まとめてコピー
            </button>
            <button type="button" className="jp-btn" onClick={handleDownload}>
              Markdown で書き出し
            </button>
          </div>

          {/* ---------------- 資料 ---------------- */}
          <h2 className="jp-part">
            <span className="label">資料</span>
            志望動機の材料
          </h2>

          <section className="jp-section" id="reasons">
            <SectionHead
              id="reasons"
              title="私が就職したい9つの理由"
              file="私が就職したい9つの理由.md"
              lead="宿題05 Q1「志望動機の共通の芯」の材料。9/9 完成（2026-08-18）。"
            />

            {nineReasons.map((g) => (
              <div key={g.group}>
                <h3 className="jp-h3">{g.group}</h3>
                <div className="jp-table-wrap">
                  <table className="jp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>理由</th>
                        <th>中身</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map((r) => (
                        <tr key={r.no}>
                          <th scope="row">{r.no}</th>
                          <td>{r.reason}</td>
                          <td>{r.body}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <h3 className="jp-h3">理由に入れないと決めたもの</h3>
            <div className="jp-table-wrap">
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>判断</th>
                  </tr>
                </thead>
                <tbody>
                  {notReasons.map((r) => (
                    <tr key={r.term}>
                      <th scope="row">{r.term}</th>
                      <td>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="jp-section-lead">5 と 6 は表裏。「稼ぎが動機ではないので固定給のほうが適性がある」が両方の根にある。</p>
          </section>

          <footer className="jp-footer">
            <p>
              内容は Obsidian 保管庫「僕の世界」の <code>{VAULT_ROOT}</code> 配下を手で写した静的スナップショット。
              正本は保管庫側。最終同期 {SYNCED_AT}。
            </p>
            <p>チェックと回答はこの端末の localStorage にだけ保存される。共有されない。</p>
            <p className="jp-footer-links">
              <a href={asset("/")}>← ポートフォリオへ戻る</a>
              <button type="button" className="jp-mini" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                先頭へ ↑
              </button>
            </p>
          </footer>
        </main>
      </div>

      {toast ? (
        <p className="jp-toast" role="status">
          {toast}
        </p>
      ) : null}

      {help ? (
        <div className="jp-help" role="dialog" aria-label="キーボード操作" onClick={() => setHelp(false)}>
          <div className="jp-help-card" onClick={(e) => e.stopPropagation()}>
            <p className="label">キーボード操作</p>
            <dl>
              {SHORTCUTS.map(([key, desc]) => (
                <div key={key}>
                  <dt>
                    <kbd>{key}</kbd>
                  </dt>
                  <dd>{desc}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="jp-btn" onClick={() => setHelp(false)}>
              閉じる
            </button>
          </div>
        </div>
      ) : null}

      {tocOpen ? <button type="button" className="jp-scrim" aria-label="目次を閉じる" onClick={() => setTocOpen(false)} /> : null}
    </div>
  );
}
