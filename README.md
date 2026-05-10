# AdCP Execution Lab

**広告配分を「最適化する問題」から「合意形成する問題」へ。**

> "誰も最適解を決めていないのに、合理的な構造が生まれる"

---

## Overview

AdCP Execution Lab は、広告メディアプランニングにおける予算配分を、  
中央集権的な最適化エンジンではなく、**分散型のAgent交渉と収束**によって導く意思決定エンジンです。

各メディア（Google / Meta / YouTube / TikTok）が独自の「意図（Agent Intent）」を持ち、  
Allocatorとの交渉を繰り返すことで、最終的な配分が**創発的に**生成されます。

- **Live URL**: https://yutate.github.io/lab/adcp-exe/
- **Mock Agent API**: https://lab-production-d6e6.up.railway.app
- **Lab Top**: https://yutate.github.io/lab/

---

## System Architecture

```
Ad Strategy Studio（意思決定）
        ↓ AdCP Brief JSON
Execution Lab（交渉・実行）
        ↓
Media Planner（予算配分・詳細プラン）
```

### 実行フロー

```
Intent（文脈）
↓
Allocator（初期戦略）
↓
A2A（Agent接続 / HTTP通信）
↓
Agent Intent（各媒体の主体的提案）
↓
Weighted Negotiation（重み付け交渉）
↓
Constraint（現実制約）
↓
Convergence / Stable Trade-off（収束 or 均衡）
↓
Human Decision Layer（最終判断）
```

---

## Files

```
adcp-exe/
├── index.html   — Execution Lab UI（単一ファイル完結）
└── server.js    — Mock Seller Agent API（Node.js / Express）
```

### server.js（Railway上で稼働）

各メディアを模したMock Seller Agent。固定レスポンスではなく、以下を実装：

- **CPAノイズ**（addNoise）— 毎回異なる推定CPA
- **配分圧力**（pressureMultiplier）— 配分が増えるほどCPAが悪化
- **需要飽和**（hardLimit）— 上限超過でavailability: limited
- **媒体ごとの性格**— Google（CV刈り取り）/ Meta（検討・リターゲット）/ YouTube（上流理解）/ TikTok（発見）
- **Intent連動補正**— intent_typeによるCPA・suggested_allocationの変化

---

## Decision Logic

### 1. Intent統合（mergeIntent）

AllocatorのIntentとExecutionのIntentを統合し、Final Intentを生成。

```
Allocator: impulse
Execution: comparison
↓
Final Intent: impulse_comparison
```

| Allocator | Execution | Final Intent |
|---|---|---|
| impulse | comparison | impulse_comparison |
| conversion_like | comparison | conversion_balanced |
| learning | comparison | learning_comparison |
| 同一 | 同一 | そのまま |

### 2. 重み付け交渉（Weighted Negotiation）

各AgentのSuggested Allocationに対して、Intent Policyの重みを掛けて調整。

```
weighted = agent.suggested_allocation × policy.weight[agent]
```

### 3. 制約（Constraint）

```
maxCap    — 媒体ごとの上限
minFloor  — 媒体ごとの最低維持
deltaLimit — 1ステップの変動制限
```

### 4. 収束判定（3状態）

| 状態 | 条件 | 意味 |
|---|---|---|
| **Converged** | diff_total ≤ 2 かつ step ≥ 3 | 完全収束 |
| **Stable Trade-off** | 最終stepでisStable() | 均衡状態（複数Intentの競合） |
| **Not Converged** | それ以外 | 異常・要見直し |

### 5. Human Decision Layer

Stable Trade-offの場合のみ、3つの判断軸を提示。

| Option | 特徴 |
|---|---|
| **Performance Priority** | Google・Meta重視、CPA・CV効率優先 |
| **Growth Priority** | TikTok・Meta重視、若年層・発見優先 |
| **Balanced Human Review** | Agent交渉の最終配分をそのまま維持 |

---

## Design Philosophy

### Before（従来）
- **最適化**（Optimization）
- 中央集権型Planner
- 数学的な唯一解を求める

### After（このシステム）
- **合意形成**（Consensus）
- 分散型Agent
- 均衡状態を「正解の一形態」として扱う

> 「決めるAI」ではなく「決めさせるAI」を作った。

---

## Phase History

| Phase | 内容 |
|---|---|
| v6 | 意思決定・実行の分離 |
| v7 | A2A接続（外部HTTP化） |
| v8 | 制約付き交渉 |
| v9 | Intent連動 |
| v1.0 | 収束（合意形成） |
| v1.1 | Intent統合・Stable Trade-off・Human Decision Layer |

---

## Setup

### Mock Agent Server（ローカル起動）

```bash
cd ~ && npm install express cors
cp server.js ~/server.js
node ~/server.js
# → AdCP Negotiation Mock Agents v1.1 running → http://127.0.0.1:3000
```

### 本番（Railway）

`server.js` と `package.json` を GitHub リポジトリにpushすると、  
Railway が自動でデプロイします。Root Directory: `adcp-exe`

---

## Tech Stack

- **Frontend**: 単一HTML（Vanilla JS）
- **Backend**: Node.js + Express（Railway）
- **Hosting**: GitHub Pages + Railway
- **Dev Environment**: Android / Termux / MGit

---

## Notes

- 実際の媒体APIには接続していません（Mock Agent）
- ライブバイイングは行いません
- APIキーはlocalStorageに保存されます（ブラウザ外には送信されません）
