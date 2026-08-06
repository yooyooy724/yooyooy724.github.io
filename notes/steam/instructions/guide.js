/* Steam移植 指示書サブページ 共通スクリプト。
 *
 * 各 <section data-comment-id="..." data-comment-title="..."> の末尾に
 * コメント欄（追加 / 編集 / 削除）を差し込む。
 *
 * 動作モードは2つ。起動時に /api/feedback を叩いて自動判定する。
 *
 *   live   … start_site.bat で立てたローカルサーバー越しに開いた場合。
 *            公開済みコメントも含めてその場で編集・削除でき、feedback.json へ即保存する。
 *   static … 公開版（github.io）や file:// で開いた場合。
 *            公開済みコメントは読み取り専用。書いたものは localStorage に溜め、
 *            「GitHubへ送信」で notes-inbox Issue にまとめて投げる。
 *
 * 編集は「消して入れ直す」。notes-merge.mjs のマージ鍵が ts + text なので、
 * 本文を書き換えるときは必ず新しい ts を振る（でないと旧本文と別物にならない）。
 *
 * コメントIDは feedback.json 上でサイト全体（親の index.html と共有）の名前空間に載る。
 * 衝突を避けるため、サブページ側は必ず "guide-<ページ>-<節>" を使うこと。
 */
(() => {
  const SITE = "steam";
  const ISSUE_URL = "https://github.com/yooyooy724/yooyooy724.github.io/issues/new";
  const PENDING_KEY = "minertia-steam-guide-comments-v1";
  const STATIC_FEEDBACK = "../feedback.json";
  const API = "/api/feedback";
  const API_LOG = "/api/log";

  const sections = [...document.querySelectorAll("section[data-comment-id]")];
  if (!sections.length) return;

  const submitButton = document.getElementById("submit-comments");
  const pendingSummary = document.getElementById("pending-summary");
  const modeBadge = document.getElementById("comment-mode");

  let live = false;                                   // ローカルサーバーに繋がっているか
  let store = { comments: {}, reactions: {}, choices: {} }; // 公開済み（= feedback.json の中身）
  let pending = loadPending();                        // 未送信（static モードのみ使う）
  let editing = null;                                 // 編集中: "<id> <ts>|<text>"

  /* ---------- 保管 ---------- */

  function loadPending() {
    try {
      const value = JSON.parse(localStorage.getItem(PENDING_KEY) || "{}");
      return { comments: value.comments && typeof value.comments === "object" ? value.comments : {} };
    } catch {
      return { comments: {} };
    }
  }

  function savePending() {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch {}
  }

  function keyOf(comment) {
    return `${String(comment.ts || "")}|${String(comment.text || "")}`;
  }

  function timestamp() {
    const date = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      + ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function pendingCount() {
    return Object.values(pending.comments).reduce(
      (count, comments) => count + (Array.isArray(comments) ? comments.length : 0),
      0,
    );
  }

  /** 送信済みと同じ内容が pending に残っていたら落とす（二重表示の防止） */
  function reconcile() {
    for (const [id, comments] of Object.entries(pending.comments)) {
      const seen = new Set((store.comments[id] || []).map(keyOf));
      const rest = comments.filter(comment => !seen.has(keyOf(comment)));
      if (rest.length) pending.comments[id] = rest;
      else delete pending.comments[id];
    }
    savePending();
  }

  /** live モード: feedback.json をまるごと書き戻す */
  function persist() {
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(store),
    }).catch(() => {
      alert("保存に失敗しました。ローカルサーバーが止まっていないか確認してください。");
    });
  }

  function log(entry) {
    fetch(API_LOG, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }

  /* ---------- 表示用のデータ ---------- */

  function combinedComments(id) {
    const result = [];
    const seen = new Set();
    for (const comment of store.comments[id] || []) {
      const key = keyOf(comment);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ ...comment, pending: false });
    }
    if (!live) {
      for (const comment of pending.comments[id] || []) {
        const key = keyOf(comment);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ ...comment, pending: true });
      }
    }
    return result.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  }

  /* ---------- 操作 ---------- */

  function addComment(id, text) {
    const comment = { text, ts: timestamp() };
    if (live) {
      if (!store.comments[id]) store.comments[id] = [];
      store.comments[id].push(comment);
      persist();
      log({ id, ...comment });
    } else {
      if (!pending.comments[id]) pending.comments[id] = [];
      pending.comments[id].push(comment);
      savePending();
    }
    render();
  }

  /** 対象を取り除く。取り除けたら true */
  function removeComment(id, target, isPending) {
    if (isPending) {
      const rest = (pending.comments[id] || []).filter(c => keyOf(c) !== keyOf(target));
      if (rest.length) pending.comments[id] = rest;
      else delete pending.comments[id];
      savePending();
      return true;
    }
    if (!live) {
      alert("公開済みのコメントは、この画面からは編集・削除できません。\n"
        + "ローカル版（start_site.bat）から開いて操作してください。");
      return false;
    }
    const rest = (store.comments[id] || []).filter(c => keyOf(c) !== keyOf(target));
    if (rest.length) store.comments[id] = rest;
    else delete store.comments[id];
    return true;
  }

  function deleteComment(id, target, isPending) {
    if (!isPending && !confirm("このコメントを削除します。よろしいですか？")) return;
    if (!removeComment(id, target, isPending)) return;
    if (live && !isPending) persist();
    render();
  }

  /** 編集 = 消して入れ直す。ts を新しくしないとマージ鍵が変わらない */
  function commitEdit(id, target, isPending, text) {
    if (!text.trim()) return;
    if (!removeComment(id, target, isPending)) return;
    const comment = { text: text.trim(), ts: timestamp() };
    if (target.author) comment.author = target.author;
    if (isPending) {
      if (!pending.comments[id]) pending.comments[id] = [];
      pending.comments[id].push(comment);
      savePending();
    } else {
      if (!store.comments[id]) store.comments[id] = [];
      store.comments[id].push(comment);
      persist();
    }
    editing = null;
    render();
  }

  function editKey(id, comment) {
    return `${id} ${keyOf(comment)}`;
  }

  /* ---------- 描画 ---------- */

  function renderComment(id, comment) {
    const item = document.createElement("div");
    item.className = `comment-item${comment.pending ? " pending-item" : ""}`;

    const meta = document.createElement("div");
    meta.className = "comment-meta";
    const who = comment.pending ? "未送信" : comment.author ? `@${comment.author}` : "反映済み";
    meta.append(document.createTextNode(`${who} · ${comment.ts || ""}`));

    const editable = comment.pending || live;
    if (editable) {
      const actions = document.createElement("div");
      actions.className = "comment-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "comment-edit";
      edit.textContent = "編集";
      edit.addEventListener("click", () => { editing = editKey(id, comment); render(); });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "comment-remove";
      remove.textContent = comment.pending ? "取り消す" : "削除";
      remove.addEventListener("click", () => deleteComment(id, comment, comment.pending));

      actions.append(edit, remove);
      meta.append(actions);
    }
    item.append(meta);

    if (editing === editKey(id, comment)) {
      const form = document.createElement("div");
      form.className = "comment-edit-form";
      const textarea = document.createElement("textarea");
      textarea.maxLength = 2000;
      textarea.value = comment.text;
      const row = document.createElement("div");
      row.className = "row";
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "comment-cancel";
      cancel.textContent = "やめる";
      cancel.addEventListener("click", () => { editing = null; render(); });
      const save = document.createElement("button");
      save.type = "button";
      save.className = "comment-save";
      save.textContent = "保存";
      save.addEventListener("click", () => commitEdit(id, comment, comment.pending, textarea.value));
      row.append(cancel, save);
      form.append(textarea, row);
      item.append(form);
    } else {
      const text = document.createElement("p");
      text.className = "comment-text";
      text.textContent = comment.text;
      item.append(text);
    }
    return item;
  }

  function renderSection(section) {
    const id = section.dataset.commentId;
    const title = section.dataset.commentTitle;
    let box = section.querySelector(":scope > .comment-box");
    if (!box) {
      box = document.createElement("div");
      box.className = "comment-box";
      section.append(box);
    }
    box.replaceChildren();

    const comments = combinedComments(id);
    const head = document.createElement("div");
    head.className = "comment-head";
    const heading = document.createElement("h3");
    heading.textContent = `${title}へのコメント`;
    const count = document.createElement("span");
    count.className = "comment-count";
    count.textContent = `${comments.length}件`;
    head.append(heading, count);
    box.append(head);

    if (comments.length) {
      const list = document.createElement("div");
      list.className = "comment-list";
      for (const comment of comments) list.append(renderComment(id, comment));
      box.append(list);
    } else {
      const empty = document.createElement("p");
      empty.className = "comment-empty";
      empty.textContent = "コメントはありません。";
      box.append(empty);
    }

    const form = document.createElement("div");
    form.className = "comment-form";
    const textarea = document.createElement("textarea");
    textarea.maxLength = 2000;
    textarea.placeholder = "この節へのコメントを入力";
    textarea.setAttribute("aria-label", `${title}へのコメント`);
    const add = document.createElement("button");
    add.type = "button";
    add.className = "comment-add";
    add.textContent = "追加";
    add.disabled = true;
    textarea.addEventListener("input", () => { add.disabled = !textarea.value.trim(); });
    add.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text) return;
      textarea.value = "";
      addComment(id, text);
    });
    form.append(textarea, add);
    box.append(form);
  }

  function render() {
    for (const section of sections) renderSection(section);
    const count = pendingCount();
    if (live) {
      pendingSummary.textContent = "feedback.json へ自動保存";
      submitButton.hidden = true;
    } else {
      pendingSummary.textContent = `未送信 ${count}件（指示書ページ全体）`;
      submitButton.hidden = false;
      submitButton.disabled = count === 0;
    }
    if (modeBadge) {
      modeBadge.textContent = live ? "ローカル版・編集可" : "公開版・下書き";
      modeBadge.classList.toggle("live", live);
    }
  }

  /* ---------- 送信 ---------- */

  function submitComments() {
    const count = pendingCount();
    if (!count) return;
    const payload = {
      site: SITE,
      at: new Date().toISOString(),
      comments: pending.comments,
      reactions: {},
      choices: {},
    };
    const body = "### notes-inbox\n\nこの Issue は自動処理されます。内容を編集しないでください。\n\n```json\n"
      + JSON.stringify(payload) + "\n```\n";
    const title = `[notes-inbox] steam 指示書コメント ${count}件`;
    const url = `${ISSUE_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    if (url.length <= 7500) {
      window.open(url, "_blank");
      return;
    }
    navigator.clipboard.writeText(body).then(() => {
      alert("コメント本文をコピーしました。開いたIssueへ貼り付けてください。");
      window.open(ISSUE_URL, "_blank");
    }, () => {
      prompt(`Issue本文をコピーしてください（タイトル: ${title}）`, body);
    });
  }

  /* ---------- 起動 ---------- */

  function normalize(data) {
    return {
      comments: data && typeof data.comments === "object" && data.comments ? data.comments : {},
      reactions: data && typeof data.reactions === "object" && data.reactions ? data.reactions : {},
      choices: data && typeof data.choices === "object" && data.choices ? data.choices : {},
    };
  }

  if (submitButton) submitButton.addEventListener("click", submitComments);
  render();

  fetch(API, { cache: "no-store" })
    .then(response => {
      const type = response.headers.get("content-type") || "";
      if (!response.ok || !type.includes("json")) return Promise.reject();
      return response.json();
    })
    .then(data => {                       // ローカルサーバーあり
      live = true;
      store = normalize(data);
      render();
    })
    .catch(() => {                        // 公開版 / file://
      fetch(STATIC_FEEDBACK, { cache: "no-store" })
        .then(response => (response.ok ? response.json() : Promise.reject()))
        .then(data => {
          store = normalize(data);
          reconcile();
          render();
        })
        .catch(() => {});
    });
})();
