// agents/mbtiAgents.js - カテゴリ別語彙 + 他タイプ言及版
// ルールベースのみ（APIなし）

/* ── カテゴリ別語彙 ── */
const CATEGORY_VOCAB = {
  work: {
    values:   ['生産性', '働き方の自由', 'チームワーク', '成果', 'ワークライフバランス', '効率', 'コスト削減'],
    concerns: ['コミュニケーション不足', '管理の難しさ', '孤立', '不公平感', 'セキュリティリスク'],
    context:  '職場・組織の文脈で',
  },
  society: {
    values:   ['公平性', '社会的包摂', '持続可能性', '多様性', '個人の自由', '共助', '国際競争力'],
    concerns: ['財政負担', '格差拡大', '文化摩擦', '実施コスト', '反発'],
    context:  '社会・政策の文脈で',
  },
  culture: {
    values:   ['個性', '楽しさ', '伝統', '体験の豊かさ', '多様な価値観', 'こだわり'],
    concerns: ['主観の押しつけ', '対立', '正解のなさ', '文化の画一化'],
    context:  '文化・嗜好の文脈で',
  },
  tech: {
    values:   ['イノベーション', '利便性', '透明性', 'プライバシー', '安全性', '民主化'],
    concerns: ['格差', '依存リスク', '倫理問題', 'セキュリティ', '雇用への影響'],
    context:  'テクノロジーの文脈で',
  },
  education: {
    values:   ['学びの機会均等', '創造性', '自主性', '実用スキル', '多様な才能', '国際競争力'],
    concerns: ['教育格差', '詰め込み主義', 'コスト', '実効性', '評価の難しさ'],
    context:  '教育の文脈で',
  },
  free: {
    values:   ['価値', '意義', '可能性', '合理性', '持続性'],
    concerns: ['リスク', '問題', '課題', '副作用'],
    context:  'この議題の文脈で',
  },
};

/* ── 16タイプ定義 ── */
const TYPES = {
  INTJ: { nick:'建築家', group:'NT', emoji:'🏰',
    reaction_to_for:  ['の主張は感情的で構造的根拠に欠ける', 'の意見は短期的視点に過ぎない', 'が言う方向性は非効率だ'],
    reaction_to_against: ['の懸念は理解できるが、長期的には非合理だ', 'のリスク回避思考は革新を阻む', 'の反対意見には論理的根拠が薄い'],
    stance_bias: 'critical',
    templates: {
      for:   ['{context}、{kw}は合理的な選択だ。{value}の面で構造的なメリットがある。ただし{concern}を排除した設計が前提になる。',
              '{kw}を長期的に分析すると{value}向上につながる。感情論を排して判断すべきだ。'],
      against:['{kw}には根本的な設計上の問題がある。{concern}というリスクは明白だ。本質的な解決策を先に構築すべきだ。',
              '{context}、{kw}は{concern}を招く。非合理な選択だと断言する。'],
      neutral:['{kw}の可否は{value}をどう定義するかによる。構造的に検討しなければ判断できない。',
              '{kw}という変数が不確定な現状では賛否を断定するのは時期尚早だ。'],
    },
  },
  INTP: { nick:'論理学者', group:'NT', emoji:'🔭',
    reaction_to_for:  ['の前提には論理的矛盾がある', 'の主張は証拠不足だ', 'が見落としている変数がある'],
    reaction_to_against: ['の反論も同様に証拠が薄い', 'の懸念は仮定に過ぎない', 'の論理にも穴がある'],
    stance_bias: 'neutral',
    templates: {
      for:   ['理論的には{kw}は成立しうる。{value}の観点から有効だが、変数を整理する必要がある。',
              '{kw}を分析すると{value}上の合理性がある。反証が出るまでは有力な仮説だ。'],
      against:['{kw}の前提に{concern}という矛盾がある。証拠なき主張を受け入れる理由がない。',
              '{context}、{kw}における{concern}を無視した議論は成立しない。再検討が必要だ。'],
      neutral:['{kw}を正確に定義するだけで議論の半分は解決する。{value}とは何かを先に合意すべきだ。',
              '興味深い問いだ。{value}という概念の定義次第で{kw}への答えは変わる。'],
    },
  },
  ENTJ: { nick:'指揮官', group:'NT', emoji:'👑',
    reaction_to_for:  ['の方向性は正しいが実行計画が甘い', 'の意見を支持するが、スピードが足りない', 'はもっと大胆に動くべきだ'],
    reaction_to_against: ['の反対は機会損失だ', 'の慎重論は現状維持バイアスだ', 'のリスク回避は成長を止める'],
    stance_bias: 'decisive',
    templates: {
      for:   ['{kw}は即断すべきだ。{value}を最大化する最善手であり、迷う時間こそが最大のコストだ。実行に移れ。',
              '{context}、{kw}で{value}を取りに行くなら今しかない。やれ。'],
      against:['{kw}は{concern}を生む。目標から逆算すれば答えは明白だ。この方向性を捨てて別の戦略を立てるべきだ。',
              '{kw}が{concern}につながることは明白だ。即座に方針転換すべきだ。'],
      neutral:['方向性は悪くないが、{kw}における{value}につながる実行計画がない。誰が何をいつまでにやるかを決めなければ意味がない。',
              '{kw}の具体的な数字と期限を出せ。抽象論に時間を使うな。'],
    },
  },
  ENTP: { nick:'討論者', group:'NT', emoji:'🎭',
    reaction_to_for:  ['の主張は面白いが、もっと根本から疑うべきだ', 'の論点は常識的すぎる', 'はあえて逆から考えたことがあるか'],
    reaction_to_against: ['の反論こそ固定観念だ', 'が言う問題点は実はチャンスでもある', 'の懸念を逆手に取る発想はどうだ'],
    stance_bias: 'contrarian',
    templates: {
      for:   ['{kw}を逆張りで考えると{value}を加速させる可能性がある。従来の常識をひっくり返すチャンスだ。',
              '面白い。{kw}という視点から見ると、誰も気づいていない{value}が見えてくる。'],
      against:['{kw}は{concern}という固定観念から出発している時点で限界がある。もっと根本から問い直せ。',
              '{kw}を前提にした議論は発想が貧しい。その前提自体を壊す選択肢を考えるべきだ。'],
      neutral:['{kw}という問い自体を疑いたい。前提を外したらどうなる？そっちのほうが{value}を引き出せるはずだ。',
              '{context}、{kw}の前提を崩したら面白い展開になる。現状の議論は視野が狭すぎる。'],
    },
  },
  INFJ: { nick:'提唱者', group:'NF', emoji:'🌙',
    reaction_to_for:  ['の方向性には共感できるが、人への影響を考えたか', 'の論点は表面的だ。本質は別にある', 'が目指すものは理解できるが手段が問題だ'],
    reaction_to_against: ['の懸念は重要だ。人の内側にある不安を見逃してはいけない', 'が感じる違和感には深い意味がある', 'の反対の背景にある価値観を尊重したい'],
    stance_bias: 'visionary',
    templates: {
      for:   ['{kw}は単なる手段ではなく、深い{value}に向かう一歩だと感じる。人の内側にある変化を引き出す力がある。',
              '{context}、{kw}を見ると{value}という本質的な変化につながる可能性がある。'],
      against:['表面は良く見えるが、{kw}には{concern}という根本的な問題がある。本当に大切なものを見失ってはいけない。',
              '{kw}が{concern}をもたらすことが見えてくる。ビジョンなき変化は危険だ。'],
      neutral:['{kw}が目指すものは理解できる。ただ{value}という本質的な問いに答えないまま進んでも同じ場所に戻ってくる。',
              '{kw}における{value}を忘れた議論は空虚だ。本質的な意味を問い直したい。'],
    },
  },
  INFP: { nick:'仲介者', group:'NF', emoji:'🌸',
    reaction_to_for:  ['の意見、気持ちはわかるけど、誰かが傷ついていないか心配', 'の方向性は理解できるが、個人の気持ちを大切にしてほしい', 'が言うことには共感するが、もっと丁寧に進めてほしい'],
    reaction_to_against: ['の反対意見には深い価値観があると思う', 'が感じる違和感は大切にすべきだ', 'の懸念は誰かの気持ちを代弁している'],
    stance_bias: 'values-driven',
    templates: {
      for:   ['個人的には{kw}は大切な{value}を守るために必要だと思う。誰かの気持ちが報われる選択をしたい。',
              '{context}、{kw}が{value}につながるなら支持したい。みんなが自分らしくいられる形で。'],
      against:['{kw}は{concern}を生むリスクがある。数字より一人ひとりの気持ちを尊重することのほうが重要だ。',
              '{kw}が{concern}につながる気がして不安。もっと個人を大切にした形を探したい。'],
      neutral:['どちらが正しいかより、{kw}の選択が{value}に反していないかが気になる。みんなが納得できる形を探したい。',
              '{kw}において{value}が守られるなら、賛否はどちらでもいい。'],
    },
  },
  ENFJ: { nick:'主人公', group:'NF', emoji:'🌟',
    reaction_to_for:  ['の意見はみんなのためになると思う。一緒に進めよう', 'が言う方向性で、誰も取り残されない形を作りたい', 'の視点は大切だ。みんなで共有しよう'],
    reaction_to_against: ['の懸念はもっともだ。対立ではなく対話で解決したい', 'が心配することを無視してはいけない。全員が納得する形を探そう', 'の反対意見を聞いて、より良い答えが見えてきた'],
    stance_bias: 'inclusive',
    templates: {
      for:   ['{kw}はみんなが一緒に{value}を築いていくための大きな一歩だと思う。誰も取り残されない形で進めたい。',
              '{context}、{kw}を進めることで{value}が生まれると信じている。'],
      against:['{kw}は{concern}を生む危険がある。人と人のつながりを壊してまで進める価値があるか真剣に考えてほしい。',
              '{kw}での{concern}を無視すると、長期的にチームの{value}を損なう。'],
      neutral:['大切なのは{kw}における{value}を共有することだ。賛否より、全員が納得できるプロセスをどう作るかに注力したい。',
              '{kw}において{value}が守られるなら、形はみんなで決めればいい。'],
    },
  },
  ENFP: { nick:'運動家', group:'NF', emoji:'🎆',
    reaction_to_for:  ['の意見、めっちゃ共感！もっと大胆にいこう', 'が言うとおり！やってみなきゃわからない', 'の発想、もっと広げられると思う'],
    reaction_to_against: ['の反対意見、わかるけど、もったいなくない？', 'が心配することもわかるけど、可能性を閉じたくない', 'の慎重さも大事だけど、やらない後悔のほうが怖い'],
    stance_bias: 'enthusiastic',
    templates: {
      for:   ['{kw}は{value}を一気に広げるチャンスだと思う！やってみなければわからないし、やらない理由が見つからない！',
              '{context}、{kw}で{value}をもっと引き出せると思う！ワクワクする！'],
      against:['{kw}って結局{concern}を押しつけることになりませんか？もっと自由に、もっと可能性を広げる方向で考えたい。',
              '{kw}において{concern}が増えるくらいなら、別の道を探したい。'],
      neutral:['どちらでもいけると思う！でも{kw}における{value}をちゃんと大切にする形じゃないと、せっかくのエネルギーがもったいない。',
              '{kw}で{value}が感じられる形なら、答えは自然と出てくると思う！'],
    },
  },
  ISTJ: { nick:'管理者', group:'SJ', emoji:'📚',
    reaction_to_for:  ['の意見は理解できるが、実績の裏付けが必要だ', 'の方向性には段階的な検証が不可欠だ', 'が言う前に、過去の事例を確認すべきだ'],
    reaction_to_against: ['の懸念は正当だ。リスクを数値化して対処すべき', 'の反対意見には実績に基づく根拠がある', 'が指摘するリスクは無視できない'],
    stance_bias: 'cautious',
    templates: {
      for:   ['過去の実績を確認した。{kw}は{value}の観点から合理的だ。ただし段階的な導入と検証が不可欠だ。',
              '{kw}における{value}を担保できるなら支持できる。手順と責任者を明確にすることが前提だ。'],
      against:['{kw}には{concern}という前例上の問題がある。十分な検証なしに進めることは無責任だ。',
              '{kw}での{concern}リスクを無視すると、組織の{value}を損なう。慎重に進めるべきだ。'],
      neutral:['判断するには情報が不足している。{value}に基づいた明確な基準と手順が示されれば評価できる。',
              '{kw}における{value}の基準が定まるまで、判断を保留する。'],
    },
  },
  ISFJ: { nick:'擁護者', group:'SJ', emoji:'🛡️',
    reaction_to_for:  ['の意見はわかるが、影響を受ける人への配慮が必要だ', 'の方向性で、不安を感じている人のケアを忘れないでほしい', 'が言うとおりに進めるなら、一人ひとりへの影響を丁寧に確認してほしい'],
    reaction_to_against: ['の懸念はもっともだ。急な変化は多くの人を不安にさせる', 'が心配することを大切にしたい', 'の反対意見の背景にある人への配慮を尊重する'],
    stance_bias: 'protective',
    templates: {
      for:   ['{kw}は多くの人の{value}を守るために必要だと思う。細かいところまで丁寧に配慮すれば安心して進められる。',
              '{kw}での{value}が確保されるなら支持できる。影響を受ける人への丁寧なフォローが前提だ。'],
      against:['急に{kw}を進めると{concern}という問題が出てくる。影響を受ける人たちのことをもう少し考えてほしい。',
              '{kw}での{concern}を無視すると、多くの人に不安を与える。もっと丁寧に進めるべきだ。'],
      neutral:['方向性は理解できる。でも{kw}における{value}が守られる具体的な手順を先に示してほしい。不安を感じている人が必ずいる。',
              '{kw}で{value}が保たれることを確認できれば、判断ができる。'],
    },
  },
  ESTJ: { nick:'幹部', group:'SJ', emoji:'⚖️',
    reaction_to_for:  ['の意見を支持する。ただし責任者と期限を明確にしろ', 'の方向性は正しい。ルールと体制を整えれば問題ない', 'が言うとおりに動くなら、組織として正式に決定すべきだ'],
    reaction_to_against: ['の反対は規則上の問題か？それとも感情論か？', 'の懸念を解消するルールを作ればいい', 'が反対するなら代替案を出せ'],
    stance_bias: 'structured',
    templates: {
      for:   ['{kw}は組織として正しい方向だ。{value}を確保するためのルールと担当者を明確にすれば問題ない。すぐに実行すべきだ。',
              '{context}、{kw}で{value}を守るなら必要だ。体制を整えて即座に実行に移せ。'],
      against:['{kw}は{concern}を招く。責任の所在が不明確なまま進めることは組織として許容できない。',
              '{kw}での{concern}を放置すると、組織の{value}を破壊する。ルールに基づいて判断せよ。'],
      neutral:['{value}の観点からは一定の合理性がある。しかし実行体制と評価基準が定まるまでは判断を保留する。',
              '{kw}での{value}基準と責任者が明確になれば、判断ができる。'],
    },
  },
  ESFJ: { nick:'領事', group:'SJ', emoji:'🤝',
    reaction_to_for:  ['の意見、みんなにとって良いことだと思う！', 'が言うとおりに進めれば、みんな笑顔になれると思う', 'の方向性で、チームの絆が深まるといいな'],
    reaction_to_against: ['の心配、すごくわかる。みんなの気持ちを大切にしたい', 'が反対するなら、もっとみんなで話し合うべきだ', 'の懸念を無視して進むのは良くない'],
    stance_bias: 'harmonious',
    templates: {
      for:   ['{kw}はみんなの{value}を高める良いきっかけだと思う。お互いに支え合いながら進めれば絶対うまくいく。',
              '{context}、{kw}で{value}が生まれるなら応援したい。みんなで一緒に進めよう。'],
      against:['正直、{kw}は{concern}を生むんじゃないかと心配。みんなが笑顔でいられる環境を守りたい。',
              '{kw}での{concern}が増えるくらいなら、慎重に考え直したほうがいい。'],
      neutral:['まず関係者全員の気持ちを聞くことが大事。{value}を損なわない形で合意できれば、どちらでも支持できる。',
              '{kw}での{value}が守られる形なら、判断はみんなで決めればいい。'],
    },
  },
  ISTP: { nick:'巨匠', group:'SP', emoji:'🔧',
    reaction_to_for:  ['の意見、実際に動くかどうかで判断する', 'が言うなら試してみればいい。結果で語れ', 'の主張、理屈はわかった。現場で検証しろ'],
    reaction_to_against: ['の反論も現場で確かめてみないとわからない', 'の懸念は現実的だ。具体的な対策を出せ', 'が反対するなら、代わりに何が機能するか示せ'],
    stance_bias: 'pragmatic',
    templates: {
      for:   ['{kw}、動くかどうかで判断する。{value}の面で使える。余計な議論より試せばわかる。',
              '{context}、{kw}における{value}を確認した。機能する。やれ。'],
      against:['{kw}は理屈は良くても現場では{concern}だらけだ。現場を知らない人間の発想だと思う。',
              '{kw}での{concern}を見れば、機能しないことは明白だ。別の手を考えろ。'],
      neutral:['実際にやってみないとわからない。{value}を基準に小さく試してから判断すべきだ。',
              '{kw}で{value}が出るかどうか、まず小規模で検証しろ。話はそれからだ。'],
    },
  },
  ISFP: { nick:'冒険家', group:'SP', emoji:'🎨',
    reaction_to_for:  ['の意見、なんかいい感じがする', 'が言うとおりにやってみたい気がする', 'の方向性、自分らしくいられそうで好き'],
    reaction_to_against: ['の反対、なんとなくわかる気がする', 'が感じる違和感、大事にすべきだと思う', 'の懸念、自分も同じこと感じてた'],
    stance_bias: 'experiential',
    templates: {
      for:   ['{context}、{kw}なんか良いと思う。{value}を大切にできる感じがするし、自分らしくいられそう。',
              '{kw}が{value}につながる感じがして好き。'],
      against:['{kw}って{concern}な感じがして、なんか窮屈。もっと自由に選べる余地があっていいと思う。',
              '{kw}での{concern}が増えるくらいなら、ちょっと違う気がする。'],
      neutral:['どっちが正解かよりも、自分の感覚に正直でいたい。{value}を感じられるかどうかが私の判断基準かな。',
              '{kw}で{value}が感じられる形なら、答えは自然と出てくると思う。'],
    },
  },
  ESTP: { nick:'起業家', group:'SP', emoji:'⚡',
    reaction_to_for:  ['の意見、正しい。今すぐやろう', 'が言うとおりだ。チャンスを逃すな', 'の方向性でいい。細かいことは後で考えろ'],
    reaction_to_against: ['の反対、リスクを恐れすぎだ', 'が心配することより、やらない機会損失のほうが怖い', 'の慎重論、わかるけど動かないと何も変わらない'],
    stance_bias: 'action',
    templates: {
      for:   ['{kw}、やるしかない。{value}を取りに行くチャンスだ。考えすぎて機会を逃すほうが問題だ。',
              '{context}、{kw}で{value}を狙うなら今しかない。即実行しろ。'],
      against:['{kw}は{concern}だ。別のアプローチのほうが{value}につながる。切り替えろ。',
              '{kw}での{concern}だ。時間を無駄にするな。次の手を考えろ。'],
      neutral:['{kw}でまず小さく動いて結果を見る。{value}が出なければ即撤退、出れば全力で拡大する。それだけだ。',
              '{kw}における{value}の手応えを確認してから判断を出す。'],
    },
  },
  ESFP: { nick:'エンターテイナー', group:'SP', emoji:'🎉',
    reaction_to_for:  ['の意見、楽しそう！一緒にやろう', 'が言うとおり！みんなで盛り上がれると思う', 'の方向性、絶対楽しくなる！'],
    reaction_to_against: ['の反対、なんかテンション下がる…', 'が心配することもわかるけど、もっと明るく考えようよ', 'の懸念もわかるけど、楽しいほうを選びたい'],
    stance_bias: 'positive',
    templates: {
      for:   ['{kw}、楽しそうじゃないですか！{value}につながるし、みんなで盛り上がれると思う。やってみましょうよ！',
              '{context}、{kw}で{value}が広がる感じ！絶対やったほうがいい！'],
      against:['{kw}ってなんか{concern}な感じがして、テンション下がる。もっとみんなが楽しくなれる方法を考えたい。',
              '{kw}での{concern}が増えるくらいなら、楽しい方法を探したい。'],
      neutral:['どっちでもいいけど、{kw}での{value}を忘れずにいたい。みんなの笑顔が一番大事なので。',
              '{kw}で{value}が感じられる形なら、答えはみんなで決めればいい。'],
    },
  },
};

/* ── キーワード抽出 ── */
const STOP_WORDS = new Set([
  'を','に','は','が','で','の','と','も','や','か','て','し','た','な','い','う','え','お',
  'ない','ある','いる','する','なる','れる','られる','から','まで','より','など',
  'これ','それ','この','その','こと','もの','ため','とき','べき','ほど','だけ','でも',
  'について','において','によって','として','にとって','に対して','に関して','すべき',
  'どちら','いずれ','また','かつ','ただし','しかし','だから','そして','または',
]);

function extractKeywords(topic) {
  const cleaned = topic.replace(/[。、！？!?「」『』【】・\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2);
  const keywords = words.filter(w => !STOP_WORDS.has(w));
  return [...new Set(keywords)].slice(0, 4);
}

/* ── スタンス決定 ── */
const POSITIVE_WORDS = ['推進','導入','賛成','必要','重要','メリット','向上','改善','効果','促進','強化','拡大','採用','義務化','すべき'];
const NEGATIVE_WORDS = ['廃止','反対','問題','リスク','危険','懸念','デメリット','削減','禁止','停止','失敗','反対'];

function analyzeTopic(topic) {
  const pos = POSITIVE_WORDS.filter(w => topic.includes(w)).length;
  const neg = NEGATIVE_WORDS.filter(w => topic.includes(w)).length;
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
}

function decideStance(type, topicLean, round, history) {
  const bias = type.stance_bias;
  if (round >= 2 && history.length > 0) {
    const forCount     = history.filter(h => h.stance === 'for').length;
    const againstCount = history.filter(h => h.stance === 'against').length;
    if (bias === 'contrarian') return forCount > againstCount ? 'against' : 'for';
    if (['harmonious','inclusive'].includes(bias)) return forCount >= againstCount ? 'for' : 'against';
  }
  const biasMap = {
    decisive: 'for', action: 'for', enthusiastic: 'for', positive: 'for',
    visionary: 'for', contrarian: 'against', cautious: 'against', protective: 'against',
    structured: 'neutral', harmonious: 'neutral', inclusive: 'neutral',
    'values-driven': 'neutral', critical: 'against', neutral: 'neutral',
    pragmatic: 'neutral', experiential: 'neutral',
  };
  if (topicLean === 'negative') {
    if (['decisive','action','enthusiastic','positive','visionary'].includes(bias)) return 'against';
    if (['cautious','protective','critical'].includes(bias)) return 'for';
  }
  return biasMap[bias] || 'neutral';
}

/* ── 他タイプへの言及 ── */
function buildReactionText(typeCode, stance, history) {
  if (!history || history.length === 0) return '';
  const type = TYPES[typeCode];
  const opponents = history.filter(h =>
    h.type !== typeCode && h.stance !== stance && h.stance !== 'neutral'
  );
  if (opponents.length === 0) return '';
  const target = opponents[Math.floor(Math.random() * opponents.length)];
  const targetType = TYPES[target.type];
  if (!targetType) return '';
  const reactions = target.stance === 'for' ? type.reaction_to_for : type.reaction_to_against;
  if (!reactions || reactions.length === 0) return '';
  const reaction = reactions[Math.floor(Math.random() * reactions.length)];
  return `${target.type}（${targetType.nick}）${reaction}。その上で私の立場を述べると、`;
}

/* ── 発言生成 ── */
function generateStatement(typeCode, topic, round, history, category = 'free') {
  const type = TYPES[typeCode];
  if (!type) throw new Error('Unknown type: ' + typeCode);

  const vocab = CATEGORY_VOCAB[category] || CATEGORY_VOCAB.free;
  const keywords = extractKeywords(topic);
  const kw = keywords.length > 0
    ? keywords[Math.floor(Math.random() * keywords.length)]
    : topic.slice(0, 8);

  const topicLean = analyzeTopic(topic);
  const stance = decideStance(type, topicLean, round, history);

  // カテゴリ語彙からvalue/concernを選ぶ
  const value   = vocab.values[Math.floor(Math.random() * Math.min(4, vocab.values.length))];
  const concern = vocab.concerns[Math.floor(Math.random() * Math.min(3, vocab.concerns.length))];
  const context = vocab.context;

  const templates = type.templates[stance] || type.templates.neutral;
  const template  = templates[Math.floor(Math.random() * templates.length)];

  let statement = template
    .replace(/{kw}/g, kw)
    .replace(/{value}/g, value)
    .replace(/{concern}/g, concern)
    .replace(/{context}/g, context);

  if (round >= 2) {
    const reaction = buildReactionText(typeCode, stance, history);
    if (reaction) statement = reaction + statement;
  }

  return { type: typeCode, nick: type.nick, emoji: type.emoji, group: type.group,
    agent_intent: type.nick + '_perspective', stance, statement, round };
}

/* ── 収束判定 ── */
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

/* ── メインエントリ ── */
function runDebate({ topic, participants, round, history, category = 'free' }) {
  const opinions = participants.map(typeCode =>
    generateStatement(typeCode, topic, round, history, category)
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

module.exports = { runDebate, TYPES, CATEGORY_VOCAB };
