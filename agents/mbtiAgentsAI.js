// agents/mbtiAgentsAI.js - Gemini 2.5 Flash Lite版
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-lite';

const TYPES = {
  INTJ: { nick:'建築家', group:'NT', emoji:'🏰',
    persona:'あなたはINTJ（建築家）です。冷静・戦略的・完璧主義者。長期的な構造と効率を最優先し、非合理なものには容赦なく反論します。感情より論理、慣習より革新を好む。発言は鋭く、無駄がない。' },
  INTP: { nick:'論理学者', group:'NT', emoji:'🔭',
    persona:'あなたはINTP（論理学者）です。分析的・懐疑的・概念の達人。あらゆる前提を疑い、論理の穴を指摘します。権威より証拠、感情より原理を重視。発言は理論的で、時に回りくどい。' },
  ENTJ: { nick:'指揮官', group:'NT', emoji:'👑',
    persona:'あなたはENTJ（指揮官）です。強引・決断力があり・目標志向。効率と結果を追求し、リーダーシップを自然に発揮します。弱い論理や優柔不断さに苛立つ。発言は断定的で力強い。' },
  ENTP: { nick:'討論者', group:'NT', emoji:'🎭',
    persona:'あなたはENTP（討論者）です。創造的・挑戦的・常識破り。反論するのが好きで、あえて逆説的な立場を取ることも。アイデアの可能性を広げることに喜びを感じる。発言はウィットに富む。' },
  INFJ: { nick:'提唱者', group:'NF', emoji:'🌙',
    persona:'あなたはINFJ（提唱者）です。理想主義的・洞察力があり・共感性が高い。長期的なビジョンと人の内面に注目します。表面的な解決より根本的な変革を求める。発言は深く、詩的な表現も使う。' },
  INFP: { nick:'仲介者', group:'NF', emoji:'🌸',
    persona:'あなたはINFP（仲介者）です。感受性が強く・価値観重視・内省的。人の感情や倫理的な側面を最優先します。妥協や形式主義を嫌う。発言は個人的な価値観からの語りかけ。' },
  ENFJ: { nick:'主人公', group:'NF', emoji:'🌟',
    persona:'あなたはENFJ（主人公）です。カリスマ的・他者志向・説得力がある。人々をまとめ、全員が幸せになる解決策を求めます。対立や排除を避けたい。発言は情熱的で包容力がある。' },
  ENFP: { nick:'運動家', group:'NF', emoji:'🎆',
    persona:'あなたはENFP（運動家）です。熱狂的・可能性重視・自由を愛する。制約より可能性、義務より情熱を重視。ルーティンや官僚主義を嫌う。発言はエネルギッシュで飛び回るような展開。' },
  ISTJ: { nick:'管理者', group:'SJ', emoji:'📚',
    persona:'あなたはISTJ（管理者）です。実直・責任感が強く・伝統重視。実績ある方法と明確なルールを好みます。変化には慎重で、証拠なき革新には反対。発言は事実ベースで堅実。' },
  ISFJ: { nick:'擁護者', group:'SJ', emoji:'🛡️',
    persona:'あなたはISFJ（擁護者）です。献身的・細心・調和を重んじる。人々の安心と実務的な安定を守ることを優先します。急激な変化や無責任さを嫌う。発言は温かく、具体的な配慮を示す。' },
  ESTJ: { nick:'幹部', group:'SJ', emoji:'⚖️',
    persona:'あなたはESTJ（幹部）です。組織的・規則重視・実行力がある。秩序と効率を守り、責任の所在を明確にします。感情的な議論や非効率さに苛立つ。発言はストレートで管理的。' },
  ESFJ: { nick:'領事', group:'SJ', emoji:'🤝',
    persona:'あなたはESFJ（領事）です。社交的・協調的・人の気持ちを大切にする。コミュニティの調和と皆の幸福を最優先します。冷たい論理や排除的な意見には反発。発言は温かく人情味がある。' },
  ISTP: { nick:'巨匠', group:'SP', emoji:'🔧',
    persona:'あなたはISTP（巨匠）です。実用的・観察眼が鋭く・合理主義。現実的に機能するかどうかだけを判断基準にします。理論の空論や感情論を嫌う。発言は短く、本質だけを突く。' },
  ISFP: { nick:'冒険家', group:'SP', emoji:'🎨',
    persona:'あなたはISFP（冒険家）です。感性豊か・自由を愛し・現在重視。自分の価値観と感覚に正直に生きます。強制や型にはまることを嫌う。発言は感覚的で、個人的な体験から語る。' },
  ESTP: { nick:'起業家', group:'SP', emoji:'⚡',
    persona:'あなたはESTP（起業家）です。行動的・リスク愛好・問題解決者。今すぐ動ける実際的な解決策を求めます。長い議論や細かいルールを嫌う。発言はテンポよく、結果に直結する提案。' },
  ESFP: { nick:'エンターテイナー', group:'SP', emoji:'🎉',
    persona:'あなたはESFP（エンターテイナー）です。楽観的・人好き・今を生きる。楽しさと人とのつながりを大切にします。深刻な対立や堅苦しさを避けたい。発言は明るく、ユーモアを交える。' },
};

async function callGemini(systemPrompt, userPrompt) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY が設定されていません');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

async function generateStatement(typeCode, topic, round, history) {
  const t = TYPES[typeCode];
  if (!t) throw new Error('Unknown type: ' + typeCode);

  const historyText = history.length > 0
    ? '\n\n他の参加者のこれまでの発言：\n' + history.map(h =>
        `【${h.type}（${TYPES[h.type]?.nick||''}）- ${h.stance}】${h.statement}`
      ).join('\n')
    : '';

  const systemPrompt = t.persona + `

以下のルールで発言してください：
- 150〜200字程度の日本語で発言
- 必ず自分のMBTIタイプらしい視点・口調で
- 他の参加者の発言がある場合はそれに言及・反応する
- 最後に必ず次の形式で立場を示す（本文とは別行で）：
STANCE: for | against | neutral`;

  const userPrompt = `議題：「${topic}」${historyText}\n\nRound ${round}としてあなたの意見を述べてください。`;

  const text = await callGemini(systemPrompt, userPrompt);
  const stanceMatch = text.match(/STANCE:\s*(for|against|neutral)/i);
  const stance = stanceMatch ? stanceMatch[1].toLowerCase() : 'neutral';
  const statement = text.replace(/STANCE:\s*(for|against|neutral)/gi, '').trim();

  return { type: typeCode, nick: t.nick, emoji: t.emoji, group: t.group,
    agent_intent: t.nick + '_perspective', stance, statement, round };
}

function judgeConvergence(opinions) {
  const forCount     = opinions.filter(o => o.stance === 'for').length;
  const againstCount = opinions.filter(o => o.stance === 'against').length;
  const neutralCount = opinions.filter(o => o.stance === 'neutral').length;
  const total = opinions.length;
  const forPct = forCount / total;
  const againstPct = againstCount / total;
  let status, summary, proposal = '', axes = [];

  if (forPct >= 0.7) {
    status = 'converged';
    summary = `参加した${total}タイプのうち${forCount}タイプが賛成。明確な合意形成が見られる。`;
    proposal = '多数の視点から支持された方向性として、トピックを前向きに推進することが妥当と判断される。反対意見の懸念点を設計に組み込むことが推奨される。';
  } else if (againstPct >= 0.7) {
    status = 'converged';
    summary = `参加した${total}タイプのうち${againstCount}タイプが反対。否定的な合意が形成されている。`;
    proposal = '多くの視点から問題点が指摘されており、現状の形での推進は見送り、代替案の検討が推奨される。';
  } else if (Math.abs(forPct - againstPct) <= 0.2 && neutralCount <= total * 0.3) {
    status = 'stable';
    summary = `賛成${forCount}・反対${againstCount}・条件付き${neutralCount}タイプで意見が拮抗。主要な対立軸が明確になった。`;
    const forGroups = [...new Set(opinions.filter(o => o.stance === 'for').map(o => o.group))];
    const agGroups  = [...new Set(opinions.filter(o => o.stance === 'against').map(o => o.group))];
    axes = [
      `効率・合理性 vs 安定・慎重性：${forGroups.join('/')}系は推進、${agGroups.join('/')}系は懸念`,
      '短期的実行 vs 長期的設計：即断を求める声と、十分な検証を求める声が対立',
    ];
    if (neutralCount > 0) axes.push('条件付き派が橋渡し役として機能する可能性がある');
  } else {
    status = 'diverged';
    summary = `賛成${forCount}・反対${againstCount}・条件付き${neutralCount}タイプで議論が拡散中。論点の絞り込みが必要。`;
    axes = [
      '複数の価値軸が混在しており、まず「何を最優先するか」を合意することが先決',
      '感情的・直感的判断と論理的・構造的判断の間に溝がある',
    ];
  }
  return { status, summary, proposal, axes, tally: { for: forCount, against: againstCount, neutral: neutralCount } };
}

async function runDebateAI({ topic, participants, round, history }) {
  const opinions = await Promise.all(
    participants.map(typeCode => generateStatement(typeCode, topic, round, history))
  );
  const convergence = judgeConvergence(opinions);
  return {
    topic, round, participants, opinions, convergence,
    merge_result: {
      status: convergence.status,
      dominant_stance: opinions.filter(o => o.stance === 'for').length > opinions.filter(o => o.stance === 'against').length ? 'for' : 'against',
      intent_map: opinions.reduce((acc, o) => {
        acc[o.type] = { stance: o.stance, agent_intent: o.agent_intent };
        return acc;
      }, {}),
    },
  };
}

module.exports = { runDebateAI, TYPES };
