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

  return { value, set, reset, savedAt, failed, dirty };
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
