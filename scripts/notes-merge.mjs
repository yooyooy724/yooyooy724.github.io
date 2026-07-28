// notes のデータをマージする共通処理。
// Action 側(apply-inbox)とローカル側(pull-notes)で同じ規則を使う。
//
// 規則:
//   comments  … 和集合。ts + text が同じものは同一とみなして重複排除し、ts 順に並べる
//   reactions … 後勝ち
//   choices   … 後勝ち
//   events    … 和集合。eventId で重複排除し、at 順に並べる
//
// 「和集合・後勝ち」なので何度適用しても結果が変わらない(冪等)。
// 取りこぼしより重複を許す方向に倒してある。消えるより残る方がまし、という判断。

export function emptyFeedback() {
  return { comments: {}, reactions: {}, choices: {} };
}

function commentKey(c) {
  return `${c && c.ts}|${c && c.text}`;
}

/** base に patch を重ねた新しいオブジェクトを返す(引数は変更しない) */
export function mergeFeedback(base, patch) {
  const a = base && typeof base === "object" ? base : {};
  const b = patch && typeof patch === "object" ? patch : {};
  const out = emptyFeedback();

  const ids = new Set([
    ...Object.keys(a.comments || {}),
    ...Object.keys(b.comments || {}),
  ]);
  for (const id of ids) {
    const seen = new Set();
    const arr = [];
    for (const c of [...((a.comments || {})[id] || []), ...((b.comments || {})[id] || [])]) {
      if (!c || typeof c.text !== "string") continue;
      const k = commentKey(c);
      if (seen.has(k)) continue;
      seen.add(k);
      arr.push({ text: c.text, ts: String(c.ts || "") });
    }
    arr.sort((x, y) => String(x.ts).localeCompare(String(y.ts)));
    if (arr.length) out.comments[id] = arr;
  }

  out.reactions = { ...(a.reactions || {}), ...(b.reactions || {}) };
  out.choices = { ...(a.choices || {}), ...(b.choices || {}) };

  // 空文字は「解除」の意味なのでキーごと落とす
  for (const key of ["reactions", "choices"]) {
    for (const k of Object.keys(out[key])) {
      if (!out[key][k]) delete out[key][k];
    }
  }
  return out;
}

/** IdeaBoard 用。イベント配列を eventId で重複排除して結合する */
export function mergeEvents(base, patch) {
  const all = [...(Array.isArray(base) ? base : []), ...(Array.isArray(patch) ? patch : [])];
  const seen = new Set();
  const out = [];
  for (const e of all) {
    if (!e || typeof e !== "object" || Array.isArray(e)) continue;
    // eventId が無い古い行は、内容そのものを鍵にして取りこぼさない
    const k = e.eventId ? `id:${e.eventId}` : `raw:${JSON.stringify(e)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  out.sort((x, y) => String(x.at).localeCompare(String(y.at)));
  return out;
}

/** Issue 本文から notes-inbox の payload を取り出す。壊れていれば null */
export function parsePayload(body) {
  if (typeof body !== "string") return null;
  const fence = body.match(/```json\s*([\s\S]*?)```/);
  if (!fence) return null;
  let data;
  try {
    data = JSON.parse(fence[1].trim());
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (!["story", "steam", "idea"].includes(data.site)) return null;
  return data;
}
