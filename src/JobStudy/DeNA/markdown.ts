import { VAULT_ROOT, checkSections, competitionItems, homeworkSections } from "./data";

const stamp = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const fileStamp = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};

const filled = (s: string | undefined) => Boolean(s && s.trim());

/** 宿題1セクション分。保管庫の該当ファイルにそのまま貼れる形にする。 */
export function homeworkMarkdown(sectionId: string, answers: Record<string, string>): string {
  const section = homeworkSections.find((s) => s.id === sectionId);
  if (!section) return "";

  const lines: string[] = [];
  lines.push(`## 宿題${section.no}_${section.title}`, "");
  lines.push(`出典: \`${VAULT_ROOT}${section.source}\``, "");

  for (const q of section.questions) {
    const answer = answers[q.id];
    // Q番号のある設問だけ番号を残す（宿題02 の「数値」「過去作」などは見出しに混ぜない）
    const heading = /^Q/.test(q.label) ? `${q.label}. ${q.question}` : q.question;
    lines.push(`### ${heading}`, "");
    if (filled(answer)) {
      lines.push(answer.trim(), "");
    } else {
      lines.push("→ （未回答）", "");
    }
  }

  if (section.followUps?.length) {
    lines.push("#### 付帯タスク", "");
    for (const f of section.followUps) lines.push(`- [ ] ${f}`);
    lines.push("");
  }

  return lines.join("\n");
}

/** チェックリストの状態。保管庫のチェックボックスに写し戻せる形にする。 */
function checklistMarkdown(checks: Record<string, boolean>): string {
  const lines: string[] = ["## これからやること（チェック状況）", ""];

  const render = (title: string, source: string, items: { id: string; text: string }[]) => {
    const done = items.filter((i) => checks[i.id]).length;
    lines.push(`### ${title} — ${done}/${items.length}`, "");
    lines.push(`出典: \`${VAULT_ROOT}${source}\``, "");
    for (const item of items) lines.push(`- [${checks[item.id] ? "x" : " "}] ${item.text}`);
    lines.push("");
  };

  for (const s of checkSections) render(`${s.no}. ${s.title}`, s.source, s.items);
  render("副業の競業性の整理", "副業の競業性の整理.md", competitionItems);

  return lines.join("\n");
}

/** 全部まとめて。宿題の回答が先、チェック状況が後。 */
export function fullMarkdown(answers: Record<string, string>, checks: Record<string, boolean>): string {
  const answered = homeworkSections
    .flatMap((s) => s.questions)
    .filter((q) => filled(answers[q.id])).length;
  const total = homeworkSections.reduce((n, s) => n + s.questions.length, 0);
  const doneChecks =
    checkSections.reduce((n, s) => n + s.items.filter((i) => checks[i.id]).length, 0) +
    competitionItems.filter((i) => checks[i.id]).length;
  const totalChecks =
    checkSections.reduce((n, s) => n + s.items.length, 0) + competitionItems.length;

  const lines: string[] = [
    "# DeNA対策 — 宿題の回答とチェック状況",
    "",
    `書き出し: ${stamp()}`,
    `宿題: ${answered}/${total} 回答済み ／ チェック: ${doneChecks}/${totalChecks} 完了`,
    "",
    "> このファイルは `/JobStudy/DeNA/` のページから書き出したもの。",
    `> 正本は \`${VAULT_ROOT}\` 配下。Claude に渡して保管庫へ反映する。`,
    "",
    "---",
    "",
  ];

  for (const s of homeworkSections) {
    lines.push(homeworkMarkdown(s.id, answers));
  }

  lines.push("---", "");
  lines.push(checklistMarkdown(checks));

  return lines.join("\n");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // クリップボードAPIが使えない環境（http や古いブラウザ）向けの退避策
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadMarkdown(text: string, name: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
