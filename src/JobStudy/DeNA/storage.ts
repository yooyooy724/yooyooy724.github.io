import { useCallback, useEffect, useRef, useState } from "react";

// このページの状態は端末の localStorage にだけ置く（サーバーを持たない静的サイトなので）。
// キーはバージョン付き。設問やチェック項目の id を変えると別データ扱いになるため、
// data.ts 側の id は一度決めたら変えない。
const PREFIX = "jobstudy-dena-v1:";

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // プライベートウィンドウなど、読めない環境でも表示は壊さない
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/**
 * localStorage に遅延書き込みするレコード。
 * 戻り値の savedAt が更新されたら「保存できた」ことの合図になる。
 */
export function usePersistentRecord<T>(key: string, initial: Record<string, T>) {
  const [value, setValue] = useState<Record<string, T>>(() => read(key, initial));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // 打鍵ごとに書くと重いので、止まってから書く。
  useEffect(() => {
    if (!dirty) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (write(key, value)) {
        setSavedAt(new Date());
        setFailed(false);
      } else {
        setFailed(true);
      }
      setDirty(false);
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [dirty, key, value]);

  const set = useCallback((id: string, next: T) => {
    setValue((prev) => ({ ...prev, [id]: next }));
    setDirty(true);
  }, []);

  const reset = useCallback(() => {
    setValue({});
    setDirty(true);
  }, []);

  // バックアップの読み込みで中身をまるごと差し替える。
  const replace = useCallback((next: Record<string, T>) => {
    setValue(next);
    setDirty(true);
  }, []);

  return { value, set, reset, replace, savedAt, failed, dirty };
}

/* ------------------------------------------------------------------ *
 * バックアップ
 *
 * localStorage はブラウザごと・端末ごとに分かれているため、
 * 別のブラウザで開いても入力は出てこない（サーバーを持たない静的サイトの制約）。
 * 持ち運びはファイル経由で行う。
 *
 * 公開リポジトリのため、回答をリポジトリ側へ同期する方式は採らない。
 * 就職活動の本音がそのまま公開されてしまう。
 * ------------------------------------------------------------------ */

export type Backup = {
  kind: "jobstudy-dena-backup";
  version: 1;
  savedAt: string;
  answers: Record<string, string>;
  checks: Record<string, boolean>;
};

export function buildBackup(answers: Record<string, string>, checks: Record<string, boolean>): string {
  const data: Backup = {
    kind: "jobstudy-dena-backup",
    version: 1,
    savedAt: new Date().toISOString(),
    answers,
    checks,
  };
  return JSON.stringify(data, null, 2);
}

/** 壊れたファイルを読ませても既存の入力を失わないよう、検証してから返す。 */
export function parseBackup(raw: string): Backup | null {
  try {
    const data = JSON.parse(raw) as Partial<Backup>;
    if (data?.kind !== "jobstudy-dena-backup") return null;
    const answers = data.answers;
    const checks = data.checks;
    if (typeof answers !== "object" || answers === null) return null;
    if (typeof checks !== "object" || checks === null) return null;
    const cleanAnswers: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers)) if (typeof v === "string") cleanAnswers[k] = v;
    const cleanChecks: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(checks)) if (typeof v === "boolean") cleanChecks[k] = v;
    return {
      kind: "jobstudy-dena-backup",
      version: 1,
      savedAt: typeof data.savedAt === "string" ? data.savedAt : "",
      answers: cleanAnswers,
      checks: cleanChecks,
    };
  } catch {
    return null;
  }
}

/**
 * 読み込んだ内容を現在の入力へ重ねる。
 * 既存の回答は消さず、**書かれている項目だけ**を上書きする（片方の端末で進めた分を失わないため）。
 */
export function mergeRecords<T>(current: Record<string, T>, incoming: Record<string, T>): Record<string, T> {
  return { ...current, ...incoming };
}

/* ------------------------------------------------------------------ *
 * 共有版（リポジトリに置いた回答）
 *
 * 本人の判断で公開リポジトリに回答を置いている。
 * これにより、どのブラウザ・どの端末で開いても同じ内容から始められる。
 *
 * 書き戻しはブラウザからはできない（トークンを置けないため）。
 * 更新は「バックアップを保存」または「全部まとめてコピー」で手元へ出し、
 * public/jobstudy-dena-answers.json を差し替えて push する。
 * ------------------------------------------------------------------ */

export const SHARED_URL = import.meta.env.BASE_URL + "jobstudy-dena-answers.json";

/**
 * 共有版を土台にし、**この端末で書いた中身のほうを優先**して重ねる。
 * 共有版が古くても、手元の書きかけを消さないための順序。
 */
export function overlayLocal(
  shared: Record<string, string>,
  local: Record<string, string>,
): Record<string, string> {
  const out = { ...shared };
  for (const [k, v] of Object.entries(local)) if (v && v.trim()) out[k] = v;
  return out;
}

export async function fetchShared(): Promise<Backup | null> {
  try {
    const res = await fetch(SHARED_URL, { cache: "no-store" });
    if (!res.ok) return null;
    return parseBackup(await res.text());
  } catch {
    return null;
  }
}

export type Theme = "light" | "dark";

/** 端末の設定を初期値にし、明示的に切り替えたらそれを覚える。 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = read<Theme | null>("theme", null);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    write("theme", theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return { theme, toggle };
}
