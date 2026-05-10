// agents/mbtiAgents.js
// 16タイプのMock Agent。EXECUTION LABのadcpAgentsと同じ思想で実装。
// - 各タイプはagent_intentと価値軸を持つ
// - トピックキーワードをルールベースで解析してstanceと発言を生成
// - 収束判定もルールベース（Converged / Stable Trade-off / Not Converged）

/* ── 16タイプ定義 ── */
const TYPES = {
  INTJ: {
    nick: '建築家', group: 'NT', emoji: '🏰',
    agent_intent: 'optimize_for_long_term_structure',
    values: ['効率', '戦略', '構造', '長期', '革新', '合理'],
    concerns: ['非効率', '感情的', '短絡', '慣習', '依存'],
    stance_bias: 'critical',
    templates: {
      for:     '長期的に見れば{topic}は合理的な選択だ。{value}の観点から構造的なメリットがある。ただし{concern}を排除した設計が前提になる。',
      against: '{topic}には根本的な設計上の問題がある。{concern}というリスクを無視しているのは非合理だ。本質的な解決策を先に構築すべきだ。',
      neutral: '{topic}の可否は{value}をどう定義するかによる。感情論を排して構造的に検討しなければ判断できない。',
    },
  },
  INTP: {
    nick: '論理学者', group: 'NT', emoji: '🔭',
    agent_intent: 'identify_logical_inconsistencies',
    values: ['論理', '原理', '客観', '正確', '概念', '探求'],
    concerns: ['矛盾', '前提', '証拠不足', '単純化'],
    stance_bias: 'neutral',
    templates: {
      for:     '理論的には{topic}は成立しうる。ただし{value}という前提が崩れると全体が瓦解する。変数を整理して検証が必要だ。',
      against: '{topic}の前提自体に{concern}という論理的矛盾がある。証拠なき主張を受け入れる理由が見当たらない。',
      neutral: '{topic}を正確に定義するだけで議論の半分は解決するはずだが、そもそも{value}とは何かという問題が先にある。',
    },
  },
  ENTJ: {
    nick: '指揮官', group: 'NT', emoji: '👑',
    agent_intent: 'drive_decisive_action_for_results',
    values: ['目標', '結果', '効率', '決断', '成長', 'リーダーシップ'],
    concerns: ['優柔不断', '非効率', '先送り', '無秩序'],
    stance_bias: 'decisive',
    templates: {
      for:     '{topic}は即断すべきだ。{value}を最大化するための最善手であり、迷う時間こそが最大のコストだ。実行に移れ。',
      against: '{topic}は{concern}を生む。目標から逆算すれば答えは明白だ。この方向性を捨てて別の戦略を立てるべきだ。',
      neutral: '方向性は悪くないが、{value}につながる実行計画がない。誰が何をいつまでにやるかを決めなければ意味がない。',
    },
  },
  ENTP: {
    nick: '討論者', group: 'NT', emoji: '🎭',
    agent_intent: 'challenge_assumptions_and_expand_possibilities',
    values: ['可能性', '革新', '挑戦', '創造', '柔軟'],
    concerns: ['固定観念', '制約', '前例主義'],
    stance_bias: 'contrarian',
    templates: {
      for:     '{topic}を逆張りで考えると、むしろ{value}を加速させる可能性がある。従来の常識をひっくり返すチャンスかもしれない。',
      against: '{topic}は発想が貧しい。{concern}という固定観念から出発している時点で限界がある。もっと根本から問い直せ。',
      neutral: '問い自体を疑いたい。{topic}という前提を外したらどうなる？そっちのほうが{value}を引き出せるはずだ。',
    },
  },
  INFJ: {
    nick: '提唱者', group: 'NF', emoji: '🌙',
    agent_intent: 'align_actions_with_deeper_values',
    values: ['ビジョン', '意味', '共感', '誠実', '変革', '成長'],
    concerns: ['表面的', '本質の欠如', '人間性の無視'],
    stance_bias: 'visionary',
    templates: {
      for:     '{topic}は単なる手段ではなく、より深い{value}に向かうための一歩だと感じる。人の内側にある変化を引き出す力がある。',
      against: '表面は良く見えるが、{topic}には{concern}という根本的な問題がある。本当に大切なものを見失ってはいけない。',
      neutral: '{topic}が目指すものは理解できる。ただ、{value}という本質的な問いに答えないまま進んでも同じ場所に戻ってくる。',
    },
  },
  INFP: {
    nick: '仲介者', group: 'NF', emoji: '🌸',
    agent_intent: 'protect_individual_values_and_authenticity',
    values: ['価値観', '誠実', '個性', '自由', '共感'],
    concerns: ['押しつけ', '画一化', '感情の無視', '形式主義'],
    stance_bias: 'values-driven',
    templates: {
      for:     '個人的には{topic}は大切な{value}を守るために必要だと思う。誰かの気持ちが報われる選択をしたい。',
      against: '{topic}は{concern}を生むリスクがある。数字や効率より、一人ひとりの気持ちを尊重することのほうが重要だ。',
      neutral: 'どちらが正しいかより、その選択が{value}に反していないかが気になる。みんなが納得できる形を探したい。',
    },
  },
  ENFJ: {
    nick: '主人公', group: 'NF', emoji: '🌟',
    agent_intent: 'foster_inclusive_growth_for_everyone',
    values: ['調和', '成長', '協力', '信頼', '共感', 'チーム'],
    concerns: ['対立', '排除', '孤立', '不信'],
    stance_bias: 'inclusive',
    templates: {
      for:     '{topic}はみんなが一緒に{value}を築いていくための大きな一歩だと思う。誰も取り残されない形で進めていきたい。',
      against: '{topic}は{concern}を生む危険がある。人と人のつながりを壊してまで進める価値があるのかを真剣に考えてほしい。',
      neutral: '大切なのは{value}を共有することだ。{topic}の賛否より、全員が納得できるプロセスをどう作るかに注力したい。',
    },
  },
  ENFP: {
    nick: '運動家', group: 'NF', emoji: '🎆',
    agent_intent: 'maximize_human_potential_and_freedom',
    values: ['可能性', '情熱', '自由', '多様性', '変化', '創造'],
    concerns: ['制約', '義務', '退屈', '画一'],
    stance_bias: 'enthusiastic',
    templates: {
      for:     '{topic}は{value}を一気に広げるチャンスだと思う。やってみなければわからないし、やらない理由が見つからない！',
      against: '{topic}って結局{concern}を押しつけることになりませんか？もっと自由に、もっと可能性を広げる方向で考えたい。',
      neutral: 'どちらでもいけると思う。でも{value}をちゃんと大切にする形じゃないと、せっかくのエネルギーがもったいない。',
    },
  },
  ISTJ: {
    nick: '管理者', group: 'SJ', emoji: '📚',
    agent_intent: 'ensure_reliability_through_proven_methods',
    values: ['実績', '責任', '安定', '規律', '信頼', '正確'],
    concerns: ['リスク', '証拠不足', '無責任', '軽率'],
    stance_bias: 'cautious',
    templates: {
      for:     '過去の実績を確認した。{topic}は{value}という観点から見て合理的だ。ただし段階的な導入と検証が不可欠だ。',
      against: '{topic}には{concern}という前例上の問題がある。十分な検証なしに進めることは無責任だと考える。',
      neutral: '判断するには情報が不足している。{value}に基づいた明確な基準と手順が示されれば評価できる。',
    },
  },
  ISFJ: {
    nick: '擁護者', group: 'SJ', emoji: '🛡️',
    agent_intent: 'protect_peoples_wellbeing_and_stability',
    values: ['安心', '配慮', '安定', '信頼', '細部'],
    concerns: ['急変', '見落とし', '負担', '不安'],
    stance_bias: 'protective',
    templates: {
      for:     '{topic}は多くの人の{value}を守るために必要だと思う。細かいところまで丁寧に配慮すれば安心して進められる。',
      against: '急に{topic}を進めると{concern}という問題が出てくる。影響を受ける人たちのことをもう少し考えてほしい。',
      neutral: '方向性は理解できる。でも{value}が守られる具体的な手順を先に示してほしい。不安を感じている人が必ずいる。',
    },
  },
  ESTJ: {
    nick: '幹部', group: 'SJ', emoji: '⚖️',
    agent_intent: 'maintain_order_and_accountability',
    values: ['秩序', '効率', '責任', '組織', '実行', '明確'],
    concerns: ['非効率', '曖昧', '責任不在', '無秩序'],
    stance_bias: 'structured',
    templates: {
      for:     '{topic}は組織として正しい方向だ。{value}を確保するためのルールと担当者を明確にすれば問題ない。すぐに実行すべきだ。',
      against: '{topic}は{concern}を招く。責任の所在が不明確なまま進めることは組織として許容できない。',
      neutral: '{value}の観点からは一定の合理性がある。しかし実行体制と評価基準が定まるまでは判断を保留する。',
    },
  },
  ESFJ: {
    nick: '領事', group: 'SJ', emoji: '🤝',
    agent_intent: 'preserve_community_harmony_and_support',
    values: ['調和', '協力', '人間関係', '安心', 'コミュニティ'],
    concerns: ['対立', '孤立', '冷淡', '不和'],
    stance_bias: 'harmonious',
    templates: {
      for:     '{topic}はみんなの{value}を高める良いきっかけだと思う。お互いに支え合いながら進めれば絶対うまくいく。',
      against: '正直、{topic}は{concern}を生むんじゃないかと心配。みんなが笑顔でいられる環境を守りたい。',
      neutral: 'まず関係者全員の気持ちを聞くことが大事だと思う。{value}を損なわない形で合意できれば、どちらでも支持できる。',
    },
  },
  ISTP: {
    nick: '巨匠', group: 'SP', emoji: '🔧',
    agent_intent: 'focus_on_what_actually_works',
    values: ['実用', '機能', '現実', '技術', 'シンプル'],
    concerns: ['空論', '無駄', '複雑', '非現実'],
    stance_bias: 'pragmatic',
    templates: {
      for:     '動くかどうかで判断する。{topic}は{value}の面で使える。余計な議論より試せばわかる。',
      against: '{topic}は理屈は良くても実際には{concern}だらけだ。現場を知らない人間の発想だと思う。',
      neutral: '実際にやってみないとわからない。{value}を基準に小さく試してから判断すべきだ。',
    },
  },
  ISFP: {
    nick: '冒険家', group: 'SP', emoji: '🎨',
    agent_intent: 'honor_individual_experience_and_freedom',
    values: ['自由', '感性', '個性', '体験', '今'],
    concerns: ['強制', '型', '抑圧', '画一'],
    stance_bias: 'experiential',
    templates: {
      for:     '{topic}、なんか良いと思う。{value}を大切にできる感じがするし、自分らしくいられそう。',
      against: '{topic}って{concern}な感じがして、なんか窮屈。もっと自由に選べる余地があっていいと思う。',
      neutral: 'どっちが正解かよりも、自分の感覚に正直でいたい。{value}を感じられるかどうかが私の判断基準かな。',
    },
  },
  ESTP: {
    nick: '起業家', group: 'SP', emoji: '⚡',
    agent_intent: 'seize_opportunities_with_immediate_action',
    values: ['行動', '結果', 'スピード', 'チャンス', '実績'],
    concerns: ['先送り', '機会損失', '慎重すぎ'],
    stance_bias: 'action',
    templates: {
      for:     '{topic}、やるしかない。{value}を取りに行くチャンスだ。考えすぎて機会を逃すほうが問題だ。',
      against: 'やってみたが{topic}は{concern}だ。別のアプローチのほうが{value}につながる。切り替えろ。',
      neutral: 'まず小さく動いて結果を見る。{value}が出なければ即撤退、出れば全力で拡大する。それだけだ。',
    },
  },
  ESFP: {
    nick: 'エンターテイナー', group: 'SP', emoji: '🎉',
    agent_intent: 'create_joy_and_connection_in_the_present',
    values: ['楽しさ', 'つながり', '今', '多様性', '明るさ'],
    concerns: ['堅苦しさ', '対立', '暗さ', '孤立'],
    stance_bias: 'positive',
    templates: {
      for:     '{topic}、楽しそうじゃないですか！{value}につながるし、みんなで盛り上がれると思う。やってみましょうよ！',
      against: '{topic}ってなんか{concern}な感じがして、テンション下がる。もっとみんなが楽しくなれる方法を考えたい。',
      neutral: 'どっちでもいいけど、{value}を忘れずにいたい。みんなの笑顔が一番大事だと思うので。',
    },
  },
};

/* ── キーワード解析 ── */
const POSITIVE_WORDS = ['推進', '導入', '賛成', '必要', '重要', 'すべき', 'メリット', '向上', '改善', '効果', '促進', '強化', '拡大', '増加', '採用'];
const NEGATIVE_WORDS = ['廃止', '反対', '問題', 'リスク', 'すべきでない', '危険', '懸念', 'デメリット', '削減', '禁止', '停止', '廃棄', '失敗'];

function analyzeTopic(topic) {
  const positiveScore = POSITIVE_WORDS.filter(w => topic.includes(w)).length;
  const negativeScore = NEGATIVE_WORDS.filter(w => topic.includes(w)).length;
  return { positiveScore, negativeScore };
}

/* ── スタンス決定 ── */
// stance_biasとトピック分析を組み合わせてstanceを決定
function decideStance(type, topicAnalysis) {
  const { positiveScore, negativeScore } = topicAnalysis;
  const bias = type.stance_bias;

  // トピック自体が強く方向を持つ場合は影響を受ける
  const topicLean = positiveScore > negativeScore ? 'positive'
    : negativeScore > positiveScore ? 'negative' : 'neutral';

  const biasMap = {
    decisive:      topicLean === 'negative' ? 'against' : 'for',
    action:        topicLean === 'negative' ? 'against' : 'for',
    enthusiastic:  topicLean === 'negative' ? 'neutral' : 'for',
    positive:      topicLean === 'negative' ? 'neutral' : 'for',
    cautious:      topicLean === 'positive' ? 'neutral' : 'against',
    protective:    topicLean === 'positive' ? 'neutral' : 'against',
    structured:    topicLean === 'negative' ? 'against' : 'neutral',
    harmonious:    'neutral',
    inclusive:     'neutral',
    visionary:     topicLean === 'negative' ? 'against' : 'for',
    'values-driven': 'neutral',
    critical:      topicLean === 'positive' ? 'neutral' : 'against',
    neutral:       'neutral',
    contrarian:    topicLean === 'positive' ? 'against' : 'for', // あえて逆張り
    pragmatic:     topicLean === 'negative' ? 'against' : 'neutral',
    experiential:  topicLean === 'negative' ? 'against' : 'neutral',
  };

  return biasMap[bias] || 'neutral';
}

/* ── 発言生成 ── */
function generateStatement(typeCode, topic, round, history) {
  const type = TYPES[typeCode];
  if (!type) throw new Error(`Unknown type: ${typeCode}`);

  const topicAnalysis = analyzeTopic(topic);
  const stance = decideStance(type, topicAnalysis);

  // Round 2以降は他タイプの発言を参照して微妙にスタンスをシフト
  let finalStance = stance;
  if (round >= 2 && history.length > 0) {
    const forCount  = history.filter(h => h.stance === 'for').length;
    const againstCount = history.filter(h => h.stance === 'against').length;
    // 少数派側に引っ張られるタイプは立場を維持、harmonious系は多数派へ
    if (['harmonious', 'inclusive'].includes(type.stance_bias)) {
      finalStance = forCount >= againstCount ? 'for' : 'against';
    }
    // contrarian は多数派の逆へ
    if (type.stance_bias === 'contrarian') {
      finalStance = forCount > againstCount ? 'against' : 'for';
    }
  }

  const value   = type.values[Math.floor(Math.random() * Math.min(3, type.values.length))];
  const concern = type.concerns[Math.floor(Math.random() * Math.min(2, type.concerns.length))];

  const template = type.templates[finalStance] || type.templates.neutral;
  const statement = template
    .replace(/{topic}/g,   topic)
    .replace(/{value}/g,   value)
    .replace(/{concern}/g, concern);

  return {
    type: typeCode,
    nick: type.nick,
    emoji: type.emoji,
    group: type.group,
    agent_intent: type.agent_intent,
    stance: finalStance,
    statement,
    round,
  };
}

/* ── 収束判定 ── */
// EXECUTION LABの mergeIntent → Converged / Stable Trade-off / Not Converged に対応
function judgeConvergence(opinions) {
  const forCount     = opinions.filter(o => o.stance === 'for').length;
  const againstCount = opinions.filter(o => o.stance === 'against').length;
  const neutralCount = opinions.filter(o => o.stance === 'neutral').length;
  const total        = opinions.length;

  const forPct     = forCount / total;
  const againstPct = againstCount / total;

  let status, summary, proposal, axes;

  if (forPct >= 0.7) {
    // 7割以上が賛成 → Converged
    status   = 'converged';
    summary  = `参加した${total}タイプのうち${forCount}タイプが賛成。明確な合意形成が見られる。`;
    proposal = `多数の視点から支持された方向性として、トピックを前向きに推進することが妥当と判断される。実行にあたっては${opinions.find(o=>o.stance==='against')?.nick || '慎重派'}の懸念点を設計に組み込むことが推奨される。`;
    axes     = [];
  } else if (againstPct >= 0.7) {
    // 7割以上が反対 → Converged（否定方向）
    status   = 'converged';
    summary  = `参加した${total}タイプのうち${againstCount}タイプが反対。否定的な合意が形成されている。`;
    proposal = `多くの視点から問題点が指摘されており、現状の形での推進は見送り、代替案の検討が推奨される。`;
    axes     = [];
  } else if (Math.abs(forPct - againstPct) <= 0.2 && neutralCount <= total * 0.3) {
    // 拮抗している → Stable Trade-off
    status  = 'stable';
    summary = `賛成${forCount}タイプ・反対${againstCount}タイプ・条件付き${neutralCount}タイプで意見が拮抗。主要な対立軸が明確になった。`;
    proposal = '';

    // 対立軸を抽出：賛成側と反対側のgroupを見て対立構造を表現
    const forGroups  = [...new Set(opinions.filter(o=>o.stance==='for').map(o=>o.group))];
    const agGroups   = [...new Set(opinions.filter(o=>o.stance==='against').map(o=>o.group))];
    axes = [
      `効率・合理性 vs 安定・慎重性：${forGroups.join('/')}系は推進、${agGroups.join('/')}系は懸念`,
      `短期的実行 vs 長期的設計：即断を求める声と、十分な検証を求める声が対立`,
      `個人の価値観 vs 組織の秩序：個人の裁量を重視する立場と、ルール・体制を重視する立場の相違`,
    ].slice(0, 2 + (neutralCount > 0 ? 1 : 0));
  } else {
    // それ以外 → Not Converged
    status  = 'diverged';
    summary = `賛成${forCount}・反対${againstCount}・条件付き${neutralCount}タイプで議論が拡散中。論点の絞り込みが必要。`;
    proposal = '';
    axes = [
      `複数の価値軸が混在しており、まず「何を最優先するか」を合意することが先決`,
      `感情的・直感的判断と論理的・構造的判断の間に溝がある`,
    ];
  }

  return { status, summary, proposal, axes, tally: { for: forCount, against: againstCount, neutral: neutralCount } };
}

/* ── メインエントリ ── */
function runDebate({ topic, participants, round, history }) {
  // 参加タイプの発言を生成
  const opinions = participants.map(typeCode =>
    generateStatement(typeCode, topic, round, history)
  );

  // 収束判定
  const convergence = judgeConvergence(opinions);

  return {
    topic,
    round,
    participants,
    opinions,
    convergence,
    // EXECUTION LABのmergeIntent相当
    merge_result: {
      status: convergence.status,
      dominant_stance: opinions.filter(o=>o.stance==='for').length > opinions.filter(o=>o.stance==='against').length ? 'for' : 'against',
      intent_map: opinions.reduce((acc, o) => {
        acc[o.type] = { stance: o.stance, agent_intent: o.agent_intent };
        return acc;
      }, {}),
    },
  };
}

module.exports = { runDebate, TYPES };
