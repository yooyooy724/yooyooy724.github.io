---
title: "作業はブランチと worktree に閉じる"
type: モデル
category: 開発方針
tags: [全体, 作業管理, エージェントとの分担]
status: 提案
description: "ひとまとまりの作業は専用ブランチと worktree で完結させ、本線と本人の作業ディレクトリを汚さない。DLL は確定したソースから作る"
adrs: [14, 18, 67, 68, 104, 124, 210, 249, 298, 305, 312, 358, 360]
---

**原則**: ひとまとまりの作業（Steam・lint・AI の大きな実装）は専用のブランチと worktree で完結させ、本線と本人が触っている作業ディレクトリには書かない。本線に入れる DLL はコミット済みのソースから作る。

## なぜ

- 本人が同じリポジトリで同時に作業しており、新規ファイルや .meta の散乱だけでもライブ環境を汚して衝突する（ADR-0068）
- 別の機械の feature ブランチから診断基盤を含まない DLL がビルドされ、防御が巻き戻ったビルドが出た（ADR-0104）
- 「反映を忘れると古い DLL のまま修正が一切効かない」事故が起きる（ADR-0018）
- ゲーム側と共有パッケージ側でブランチ名が食い違うと、どの組み合わせで動くのか分からない（ADR-0210）
- 製品ラインごとに独立して出荷でき、ブランチの混在が再発しないようにする（ADR-0067）

## 規則

| 規則 | 範囲 | 根拠 |
| --- | --- | --- |
| AI に腰を据えた実装をさせるときは専用の git worktree を切る。単発の小修正だけは例外 | 全体 | ADR-0068 |
| Steam 向けの作業は専用ブランチ／worktree（minertia-steam2）だけで行い、仕様書・ノートの変更も同じブランチで完結させる | Idle-MInertia | ADR-0124, ADR-0298, ADR-0305 |
| 何が Steam の作業かはコミット題でなく企画サイト（GitHub Page）を正として判定する | Idle-MInertia | ADR-0124 |
| 本線への個別取り込み（cherry-pick）はせず、次のモバイル版も Steam のブランチから出す | Idle-MInertia | ADR-0312 |
| DLL はコミット済み HEAD のソースから再ビルドして反映し、publish した DLL を Assets/Plugins へコピーする手順を明文化する | Idle-MInertia | ADR-0018, ADR-0104 |
| ゲーム側と共有パッケージ側のブランチ名を揃える | Idle-Factory | ADR-0210 |
| 製品ごとにリポジトリを分け、共有パッケージは独立して出荷する | 全体 | ADR-0067 |
| push 先はブランチごとに決める（Steam 版 Unity は origin と upstream、Steam 用 Domain は origin だけ） | Idle-MInertia | ADR-0358, ADR-0360 |
| リポジトリに入れない作業物（p5 の素材ページ）は置き場を決めて git の外に保存する | Rootflux | ADR-0249 |

## 境界

- 次作を同じリポジトリのブランチで育て、前作の本線を止めた（ADR-0014）。別リポジトリにしなかった理由は記録にない
- Domain の push 先は「upstream のみ」から、Steam 用ブランチについて「origin のみ」に改めた（ADR-0360）
- Steam 版 Unity は origin のみ（2026-09-27 の指示）から origin と upstream の両方に改めた（ADR-0358）

## 根拠となった決定

| No. | 日付 | 決定 |
| --- | --- | --- |
| ADR-0014 | 2025-02-25 | 次作（のちの Idle MInertia）は同じリポジトリの crush_cubes ブランチで育て、Idle Sphere の本線を止める |
| ADR-0018 | 2025-04-16 | Unity プロジェクトはドメインをソースではなくビルド済み DLL として取り込む |
| ADR-0067 | 2026-07-04 | 共有の com.idlesystem.* パッケージを idle-system-core に切り出し、ゲームごとに独立して出荷する |
| ADR-0068 | 2026-07-06 | AI に腰を据えた実装をさせるときは専用の git worktree を切り、本人が触っている作業ディレクトリには書かせない |
| ADR-0104 | 2026-08-05 | 統合で消えた例外隔離と課金復元の防御を戻し、DLL は確定したソースからビルドし直して反映する |
| ADR-0124 | 2026-08-20 | Steam 向けの作業は専用ブランチ／worktree（minertia-steam2）だけで行い、何が Steam の作業かはコミット題でなく GitHub Page を正として判定する |
| ADR-0210 | 2026-10-04 | Rakugaki 描画ブランチを rootflux-landscape に合流させる |
| ADR-0249 | 2026-10-06 | p5 で作った Steam 素材とアイコンの作業ページは、リポジトリに入れずデスクトップのフォルダに保存する |
| ADR-0298 | 2026-10-08 | Steam の仕様書も minertia-steam2 で編集し、作業は Steam のブランチで完結させる |
| ADR-0305 | 2026-10-08 | ヒントのノートの変更は Steam のブランチで扱い、本線へは push しない |
| ADR-0312 | 2026-10-08 | 次のモバイル版も Steam のブランチから出す方向で、本線への個別取り込みはしない |
| ADR-0358 | 2026-10-11 | Steam 版 Unity（minertia-steam2）は origin と upstream の両方へ push する |
| ADR-0360 | 2026-10-11 | Steam 用 Domain（minertia-steam2）は origin にだけ push し、upstream には上げない |
