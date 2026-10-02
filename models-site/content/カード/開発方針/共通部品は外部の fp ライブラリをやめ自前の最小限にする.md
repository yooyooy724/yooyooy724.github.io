---
title: "共通部品は外部の FP ライブラリをやめ自前の最小限にする"
type: モデル
category: 開発方針
tags: [Idle-MInertia, 設計構造]
status: 提案
description: "共通部品は外部の FP ライブラリをやめ、自前の最小限のものにする"
---

共通部品は、外部の FP ライブラリはやめ、自前の最小限のものにする。毎フレームの処理はゼロアロケーション（StructLinq を自作）。
