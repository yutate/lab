// agents/mbtiAgents.js - キーワード抽出 + 他タイプ言及版
// ルールベースのみ（APIなし）

const TYPES = {
  INTJ: { nick:'建築家', group:'NT', emoji:'🏰',
    reaction_to_for:  ['の主張は感情的で構造的根拠に欠ける', 'の意見は短期的視点に過ぎない', 'が言う方向性は非効率だ'],
    reaction_to_against: ['の懸念は理解できるが、長期的には非合理だ', 'のリスク回避思考は革新を阻む', 'の反対意見には論理的根拠が薄い'],
    values: ['効率', '戦略', '構造', '長期', '革新', '合理'],
    concerns: ['非効率', '感情的', '短絡', '慣習'],
    stance_bias: 'critical',
    templates: {
      for:   ['{kw}という観点から見れば、{topic}は合理的な選択だ。{value}の面で構造的なメリットがある。ただし{concern}を排除した設計が前提になる。',
              '{topic}を長期的に分析すると、{kw}における{value}向上につながる。感情論を排して判断すべきだ。'],
      against:['{topic}には根本的な設計上の問題がある。{kw}を考慮すれば{concern}というリスクは明白だ。本質的な解決策を先に構築すべきだ。',
              '{kw}の観点から見て、{topic}は{concern}を招く。非合理な選択だと断言する。'],
      neutral:['{topic}の可否は{kw}をどう定義するかによる。{value}を基準に構造的に検討しなければ判断できない。',
              '{kw}という変数が不確定な現状では、{topic}への賛否を断定するのは時期尚早だ。'],
    },
  },
  INTP: { nick:'論理学者', group:'NT', emoji:'🔭',
    reaction_to_for:  ['の前提には論理的矛盾がある', 'の主張は証拠不足だ', 'が見落としている変数がある'],
    reaction_to_against: ['の反論も同様に証拠が薄い', 'の懸念は仮定に過ぎない', 'の論理にも穴がある'],
    values: ['論理', '原理', '客観', '正確', '概念'],
    concerns: ['矛盾', '前提の誤り', '証拠不足', '単純化'],
    stance_bias: 'neutral',
    templates: {
      for:   ['理論的には{topic}は成立しうる。{kw}という前提が保たれる限り、{value}の観点から有効だ。ただし変数を整理する必要がある。',
              '{kw}を分析すると、{topic}には{value}上の合理性がある。反証が出るまでは有力な仮説だ。'],
      against:['{topic}の前提に{concern}という矛盾がある。{kw}を考慮すれば証拠なき主張を受け入れる理由がない。',
              '{kw}における{concern}を無視した議論は成立しない。{topic}は再検討が必要だ。'],
      neutral:['{topic}を正確に定義するだけで議論の半分は解決する。{kw}とは何か、{value}とは何かを先に合意すべきだ。',
              '興味深い問いだ。{kw}という概念の定義次第で{topic}への答えは変わる。'],
    },
  },
  ENTJ: { nick:'指揮官', group:'NT', emoji:'👑',
    reaction_to_for:  ['の方向性は正しいが実行計画が甘い', 'の意見を支持するが、スピードが足りない', 'はもっと大胆に動くべきだ'],
    reaction_to_against: ['の反対は機会損失だ', 'の慎重論は現状維持バイアスだ', 'のリスク回避は成長を止める'],
    values: ['目標', '結果', '効率', '決断', '成長'],
    concerns: ['優柔不断', '非効率', '先送り', '無秩序'],
    stance_bias: 'decisive',
    templates: {
      for:   ['{topic}は即断すべきだ。{kw}における{value}を最大化する最善手であり、迷う時間こそが最大のコストだ。',
              '{kw}で{value}を取りに行くなら{topic}しかない。実行に移れ。'],
      against:['{topic}は{kw}における{concern}を生む。目標から逆算すれば答えは明白だ。この方向性を捨てて別の戦略を立てるべきだ。',
              '{kw}を見れば{topic}が{concern}につながることは明白だ。即座に方針転換すべきだ。'],
      neutral:['方向性は悪くないが、{kw}における{value}につながる実行計画がない。誰が何をいつまでにやるかを決めなければ意味がない。',
              '{kw}における具体的な数字と期限を出せ。抽象論に時間を使うな。'],
    },
  },
  ENTP: { nick:'討論者', group:'NT', emoji:'🎭',
    reaction_to_for:  ['の主張は面白いが、もっと根本から疑うべきだ', 'の論点は常識的すぎる', 'はあえて逆から考えたことがあるか'],
    reaction_to_against: ['の反論こそ固定観念だ', 'が言う問題点は実はチャンスでもある', 'の懸念を逆手に取る発想はどうだ'],
    values: ['可能性', '革新', '挑戦', '創造', '柔軟'],
    concerns: ['固定観念', '制約', '前例主義'],
    stance_bias: 'contrarian',
    templates: {
      for:   ['{topic}を逆張りで考えると、{kw}における{value}を加速させる可能性がある。従来の常識をひっくり返すチャンスだ。',
              '面白い。{kw}という視点から{topic}を見ると、誰も気づいていない{value}が見えてくる。'],
      against:['{topic}は{kw}という{concern}から出発している時点で限界がある。もっと根本から問い直せ。',
              '{kw}を前提にした{topic}は発想が貧しい。その前提自体を壊す選択肢を考えるべきだ。'],
      neutral:['{topic}という問い自体を疑いたい。{kw}を外したらどうなる？そっちのほうが{value}を引き出せるはずだ。',
              '{kw}における{topic}の前提を崩したら面白い展開になる。現状の議論は視野が狭すぎる。'],
    },
  },
  INFJ: { nick:'提唱者', group:'NF', emoji:'🌙',
    reaction_to_for:  ['の方向性には共感できるが、人への影響を考えたか', 'の論点は表面的だ。本質は別にある', 'が目指すものは理解できるが手段が問題だ'],
    reaction_to_against: ['の懸念は重要だ。人の内側にある不安を見逃してはいけない', 'が感じる違和感には深い意味がある', 'の反対の背景にある価値観を尊重したい'],
    values: ['ビジョン', '意味', '共感', '誠実', '変革'],
    concerns: ['表面的', '本質の欠如', '人間性の無視'],
    stance_bias: 'visionary',
    templates: {
      for:   ['{topic}は単なる手段ではなく、{kw}における深い{value}に向かう一歩だと感じる。人の内側にある変化を引き出す力がある。',
              '{kw}という文脈で{topic}を見ると、{value}という本質的な変化につながる可能性がある。'],
      against:['表面は良く見えるが、{topic}には{kw}における{concern}という根本的な問題がある。本当に大切なものを見失ってはいけない。',
              '{kw}を深く考えると、{topic}が{concern}をもたらすことが見えてくる。ビジョンなき変化は危険だ。'],
      neutral:['{topic}が目指すものは理解できる。ただ、{kw}という{value}の問いに答えないまま進んでも同じ場所に戻ってくる。',
              '{kw}における{value}を忘れた議論は空虚だ。{topic}の本質的な意味を問い直したい。'],
    },
  },
  INFP: { nick:'仲介者', group:'NF', emoji:'🌸',
    reaction_to_for:  ['の意見、気持ちはわかるけど、誰かが傷ついていないか心配', 'の方向性は理解できるが、個人の気持ちを大切にしてほしい', 'が言うことには共感するが、もっと丁寧に進めてほしい'],
    reaction_to_against: ['の反対意見には深い価値観があると思う', 'が感じる違和感は大切にすべきだ', 'の懸念は誰かの気持ちを代弁している'],
    values: ['価値観', '誠実', '個性', '自由', '共感'],
    concerns: ['押しつけ', '画一化', '感情の無視'],
    stance_bias: 'values-driven',
    templates: {
      for:   ['個人的には{topic}は大切な{value}を守るために必要だと思う。{kw}において誰かの気持ちが報われる選択をしたい。',
              '{kw}という文脈で、{topic}が{value}につながるなら支持したい。みんなが自分らしくいられる形で。'],
      against:['{topic}は{kw}における{concern}を生むリスクがある。数字より一人ひとりの気持ちを尊重することのほうが重要だ。',
              '{kw}を考えると、{topic}が{concern}につながる気がして不安。もっと個人を大切にした形を探したい。'],
      neutral:['どちらが正しいかより、{kw}における選択が{value}に反していないかが気になる。みんなが納得できる形を探したい。',
              '{kw}という問題において{value}が守られるなら、{topic}への賛否はどちらでもいい。'],
    },
  },
  ENFJ: { nick:'主人公', group:'NF', emoji:'🌟',
    reaction_to_for:  ['の意見はみんなのためになると思う。一緒に進めよう', 'が言う方向性で、誰も取り残されない形を作りたい', 'の視点は大切だ。みんなで共有しよう'],
    reaction_to_against: ['の懸念はもっともだ。対立ではなく対話で解決したい', 'が心配することを無視してはいけない。全員が納得する形を探そう', 'の反対意見を聞いて、より良い答えが見えてきた'],
    values: ['調和', '成長', '協力', '信頼', '共感'],
    concerns: ['対立', '排除', '孤立'],
    stance_bias: 'inclusive',
    templates: {
      for:   ['{topic}は{kw}においてみんなが一緒に{value}を築いていくための大きな一歩だと思う。誰も取り残されない形で進めたい。',
              '{kw}という文脈で{topic}を進めることで、{value}が生まれると信じている。'],
      against:['{topic}は{kw}における{concern}を生む危険がある。人と人のつながりを壊してまで進める価値があるか真剣に考えてほしい。',
              '{kw}での{concern}を無視した{topic}は、長期的にチームの{value}を損なう。'],
      neutral:['大切なのは{kw}における{value}を共有することだ。{topic}の賛否より、全員が納得できるプロセスをどう作るかに注力したい。',
              '{kw}において{value}が守られるなら、{topic}の形はみんなで決めればいい。'],
    },
  },
  ENFP: { nick:'運動家', group:'NF', emoji:'🎆',
    reaction_to_for:  ['の意見、めっちゃ共感！もっと大胆にいこう', 'が言うとおり！やってみなきゃわからない', 'の発想、もっと広げられると思う'],
    reaction_to_against: ['の反対意見、わかるけど、もったいなくない？', 'が心配することもわかるけど、可能性を閉じたくない', 'の慎重さも大事だけど、やらない後悔のほうが怖い'],
    values: ['可能性', '情熱', '自由', '多様性', '変化'],
    concerns: ['制約', '義務', '退屈', '画一'],
    stance_bias: 'enthusiastic',
    templates: {
      for:   ['{topic}は{kw}における{value}を一気に広げるチャンスだと思う！やってみなければわからないし、やらない理由が見つからない！',
              '{kw}って考えたらワクワクしない？{topic}で{value}をもっと引き出せると思う！'],
      against:['{topic}って結局{kw}における{concern}を押しつけることになりませんか？もっと自由に、もっと可能性を広げる方向で考えたい。',
              '{kw}において{concern}が増えるくらいなら、{topic}じゃない別の道を探したい。'],
      neutral:['どちらでもいけると思う！でも{kw}における{value}をちゃんと大切にする形じゃないと、せっかくのエネルギーがもったいない。',
              '{kw}で{value}が感じられる形なら、{topic}への答えは自然と出てくると思う！'],
    },
  },
  ISTJ: { nick:'管理者', group:'SJ', emoji:'📚',
    reaction_to_for:  ['の意見は理解できるが、実績の裏付けが必要だ', 'の方向性には段階的な検証が不可欠だ', 'が言う前に、過去の事例を確認すべきだ'],
    reaction_to_against: ['の懸念は正当だ。リスクを数値化して対処すべき', 'の反対意見には実績に基づく根拠がある', 'が指摘するリスクは無視できない'],
    values: ['実績', '責任', '安定', '規律', '信頼'],
    concerns: ['リスク', '証拠不足', '無責任', '軽率'],
    stance_bias: 'cautious',
    templates: {
      for:   ['過去の実績を確認した。{topic}は{kw}における{value}の観点から合理的だ。ただし段階的な導入と検証が不可欠だ。',
              '{kw}における{value}を担保できるなら、{topic}は支持できる。手順と責任者を明確にすることが前提だ。'],
      against:['{topic}には{kw}における{concern}という前例上の問題がある。十分な検証なしに進めることは無責任だ。',
              '{kw}での{concern}リスクを無視した{topic}は、組織の{value}を損なう。慎重に進めるべきだ。'],
      neutral:['判断するには{kw}に関する情報が不足している。{value}に基づいた明確な基準と手順が示されれば評価できる。',
              '{kw}における{value}の基準が定まるまで、{topic}への判断を保留する。'],
    },
  },
  ISFJ: { nick:'擁護者', group:'SJ', emoji:'🛡️',
    reaction_to_for:  ['の意見はわかるが、影響を受ける人への配慮が必要だ', 'の方向性で、不安を感じている人のケアを忘れないでほしい', 'が言うとおりに進めるなら、一人ひとりへの影響を丁寧に確認してほしい'],
    reaction_to_against: ['の懸念はもっともだ。急な変化は多くの人を不安にさせる', 'が心配することを大切にしたい', 'の反対意見の背景にある人への配慮を尊重する'],
    values: ['安心', '配慮', '安定', '信頼', '細部'],
    concerns: ['急変', '見落とし', '負担', '不安'],
    stance_bias: 'protective',
    templates: {
      for:   ['{topic}は{kw}における多くの人の{value}を守るために必要だと思う。細かいところまで丁寧に配慮すれば安心して進められる。',
              '{kw}での{value}が確保されるなら、{topic}を支持できる。影響を受ける人への丁寧なフォローが前提だ。'],
      against:['急に{topic}を進めると{kw}における{concern}という問題が出てくる。影響を受ける人たちのことをもう少し考えてほしい。',
              '{kw}での{concern}を無視した{topic}は、多くの人に不安を与える。もっと丁寧に進めるべきだ。'],
      neutral:['方向性は理解できる。でも{kw}における{value}が守られる具体的な手順を先に示してほしい。不安を感じている人が必ずいる。',
              '{kw}で{value}が保たれることを確認できれば、{topic}への判断ができる。'],
    },
  },
  ESTJ: { nick:'幹部', group:'SJ', emoji:'⚖️',
    reaction_to_for:  ['の意見を支持する。ただし責任者と期限を明確にしろ', 'の方向性は正しい。ルールと体制を整えれば問題ない', 'が言うとおりに動くなら、組織として正式に決定すべきだ'],
    reaction_to_against: ['の反対は規則上の問題か？それとも感情論か？', 'の懸念を解消するルールを作ればいい', 'が反対するなら代替案を出せ'],
    values: ['秩序', '効率', '責任', '組織', '実行'],
    concerns: ['非効率', '曖昧', '責任不在', '無秩序'],
    stance_bias: 'structured',
    templates: {
      for:   ['{topic}は{kw}において組織として正しい方向だ。{value}を確保するためのルールと担当者を明確にすれば問題ない。すぐに実行すべきだ。',
              '{kw}での{value}を守るなら{topic}は必要だ。体制を整えて即座に実行に移せ。'],
      against:['{topic}は{kw}における{concern}を招く。責任の所在が不明確なまま進めることは組織として許容できない。',
              '{kw}での{concern}を放置した{topic}は、組織の{value}を破壊する。ルールに基づいて判断せよ。'],
      neutral:['{kw}における{value}の観点からは一定の合理性がある。しかし実行体制と評価基準が定まるまでは判断を保留する。',
              '{kw}での{value}基準と責任者が明確になれば、{topic}への判断ができる。'],
    },
  },
  ESFJ: { nick:'領事', group:'SJ', emoji:'🤝',
    reaction_to_for:  ['の意見、みんなにとって良いことだと思う！', 'が言うとおりに進めれば、みんな笑顔になれると思う', 'の方向性で、チームの絆が深まるといいな'],
    reaction_to_against: ['の心配、すごくわかる。みんなの気持ちを大切にしたい', 'が反対するなら、もっとみんなで話し合うべきだ', 'の懸念を無視して進むのは良くない'],
    values: ['調和', '協力', '人間関係', '安心', 'コミュニティ'],
    concerns: ['対立', '孤立', '冷淡', '不和'],
    stance_bias: 'harmonious',
    templates: {
      for:   ['{topic}は{kw}におけるみんなの{value}を高める良いきっかけだと思う。お互いに支え合いながら進めれば絶対うまくいく。',
              '{kw}で{value}が生まれるなら、{topic}を応援したい。みんなで一緒に進めよう。'],
      against:['正直、{topic}は{kw}における{concern}を生むんじゃないかと心配。みんなが笑顔でいられる環境を守りたい。',
              '{kw}での{concern}が増えるくらいなら、{topic}は慎重に考え直したほうがいい。'],
      neutral:['まず{kw}に関する関係者全員の気持ちを聞くことが大事。{value}を損なわない形で合意できれば、どちらでも支持できる。',
              '{kw}での{value}が守られる形なら、{topic}への判断はみんなで決めればいい。'],
    },
  },
  ISTP: { nick:'巨匠', group:'SP', emoji:'🔧',
    reaction_to_for:  ['の意見、実際に動くかどうかで判断する', 'が言うなら試してみればいい。結果で語れ', 'の主張、理屈はわかった。現場で検証しろ'],
    reaction_to_against: ['の反論も現場で確かめてみないとわからない', 'の懸念は現実的だ。具体的な対策を出せ', 'が反対するなら、代わりに何が機能するか示せ'],
    values: ['実用', '機能', '現実', '技術', 'シンプル'],
    concerns: ['空論', '無駄', '複雑', '非現実'],
    stance_bias: 'pragmatic',
    templates: {
      for:   ['{kw}で動くかどうかで判断する。{topic}は{value}の面で使える。余計な議論より試せばわかる。',
              '{kw}における{value}を確認した。{topic}は機能する。やれ。'],
      against:['{topic}は理屈は良くても{kw}では{concern}だらけだ。現場を知らない人間の発想だと思う。',
              '{kw}での{concern}を見れば、{topic}が機能しないことは明白だ。別の手を考えろ。'],
      neutral:['実際にやってみないとわからない。{kw}における{value}を基準に小さく試してから判断すべきだ。',
              '{kw}で{value}が出るかどうか、まず小規模で検証しろ。話はそれからだ。'],
    },
  },
  ISFP: { nick:'冒険家', group:'SP', emoji:'🎨',
    reaction_to_for:  ['の意見、なんかいい感じがする', 'が言うとおりにやってみたい気がする', 'の方向性、自分らしくいられそうで好き'],
    reaction_to_against: ['の反対、なんとなくわかる気がする', 'が感じる違和感、大事にすべきだと思う', 'の懸念、自分も同じこと感じてた'],
    values: ['自由', '感性', '個性', '体験', '今'],
    concerns: ['強制', '型', '抑圧', '画一'],
    stance_bias: 'experiential',
    templates: {
      for:   ['{topic}、{kw}の文脈でなんか良いと思う。{value}を大切にできる感じがするし、自分らしくいられそう。',
              '{kw}って考えたとき、{topic}が{value}につながる感じがして好き。'],
      against:['{topic}って{kw}における{concern}な感じがして、なんか窮屈。もっと自由に選べる余地があっていいと思う。',
              '{kw}での{concern}が増えるくらいなら、{topic}はちょっと違う気がする。'],
      neutral:['どっちが正解かよりも、{kw}において自分の感覚に正直でいたい。{value}を感じられるかどうかが私の判断基準かな。',
              '{kw}で{value}が感じられる形なら、{topic}への答えは自然と出てくると思う。'],
    },
  },
  ESTP: { nick:'起業家', group:'SP', emoji:'⚡',
    reaction_to_for:  ['の意見、正しい。今すぐやろう', 'が言うとおりだ。チャンスを逃すな', 'の方向性でいい。細かいことは後で考えろ'],
    reaction_to_against: ['の反対、リスクを恐れすぎだ', 'が心配することより、やらない機会損失のほうが怖い', 'の慎重論、わかるけど動かないと何も変わらない'],
    values: ['行動', '結果', 'スピード', 'チャンス', '実績'],
    concerns: ['先送り', '機会損失', '慎重すぎ'],
    stance_bias: 'action',
    templates: {
      for:   ['{topic}、{kw}でやるしかない。{value}を取りに行くチャンスだ。考えすぎて機会を逃すほうが問題だ。',
              '{kw}における{value}を狙うなら今しかない。{topic}を即実行しろ。'],
      against:['{kw}でやってみたが{topic}は{concern}だ。別のアプローチのほうが{value}につながる。切り替えろ。',
              '{topic}は{kw}における{concern}だ。時間を無駄にするな。次の手を考えろ。'],
      neutral:['{kw}でまず小さく動いて結果を見る。{value}が出なければ即撤退、出れば全力で拡大する。それだけだ。',
              '{kw}における{value}の手応えを確認してから{topic}への判断を出す。'],
    },
  },
  ESFP: { nick:'エンターテイナー', group:'SP', emoji:'🎉',
    reaction_to_for:  ['の意見、楽しそう！一緒にやろう', 'が言うとおり！みんなで盛り上がれると思う', 'の方向性、絶対楽しくなる！'],
    reaction_to_against: ['の反対、なんかテンション下がる…', 'が心配することもわかるけど、もっと明るく考えようよ', 'の懸念もわかるけど、楽しいほうを選びたい'],
    values: ['楽しさ', 'つながり', '今', '多様性', '明るさ'],
    concerns: ['堅苦しさ', '対立', '暗さ', '孤立'],
    stance_bias: 'positive',
    templates: {
      for:   ['{topic}、{kw}で楽しそうじゃないですか！{value}につながるし、みんなで盛り上がれると思う。やってみましょうよ！',
              '{kw}って考えたら{value}が広がる感じ！{topic}、絶対やったほうがいい！'],
      against:['{topic}ってなんか{kw}における{concern}な感じがして、テンション下がる。もっとみんなが楽しくなれる方法を考えたい。',
              '{kw}での{concern}が増えるくらいなら、{topic}より楽しい方法を探したい。'],
      neutral:['どっちでもいいけど、{kw}での{value}を忘れずにいたい。みんなの笑顔が一番大事なので。',
              '{kw}で{value}が感じられる形なら、{topic}への答えはみんなで決めればいい。'],
    },
  },
};

/* ── キーワード抽出 ── */
const STOP_WORDS = new Set([
  'を','に','は','が','で','の','と','も','や','か','て','し','た','な','い','う','え','お',
  'ない','ある','いる','する','なる','れる','られる','せる','させる','から','まで','より','など',
  'これ','それ','あれ','この','その','あの','ここ','そこ','こと','もの','ため','とき',
  'べき','ほど','だけ','でも','しか','こそ','さえ','すら','のみ','ずつ','ごと',
  'について','において','によって','として','とともに','にとって','に対して','に関して',
]);

function extractKeywords(topic) {
  const cleaned = topic.replace(/[。、！？!?「」『』【】・\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2);
  const keywords = words.filter(w => !STOP_WORDS.has(w));
  return [...new Set(keywords)].slice(0, 3);
}

/* ── スタンス決定 ── */
const POSITIVE_WORDS = ['推進','導入','賛成','必要','重要','すべき','メリット','向上','改善','効果','促進','強化','拡大','採用','義務化'];
const NEGATIVE_WORDS = ['廃止','反対','問題','リスク','すべきでない','危険','懸念','デメリット','削減','禁止','停止','失敗'];

function analyzeTopic(topic) {
  const pos = POSITIVE_WORDS.filter(w => topic.includes(w)).length;
  const neg = NEGATIVE_WORDS.filter(w => topic.includes(w)).length;
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
}

function decideStance(type, topicLean, round, history) {
  const bias = type.stance_bias;
  if (round >= 2 && history.length > 0) {
    const forCount = history.filter(h => h.stance === 'for').length;
    const againstCount = history.filter(h => h.stance === 'against').length;
    if (bias === 'contrarian') return forCount > againstCount ? 'against' : 'for';
    if (['harmonious','inclusive'].includes(bias)) return forCount >= againstCount ? 'for' : 'against';
  }
  const biasMap = {
    decisive:'for', action:'for', enthusiastic:'for', positive:'for',
    visionary:'for', contrarian:'against', cautious:'against', protective:'against',
    structured:'neutral', harmonious:'neutral', inclusive:'neutral',
    'values-driven':'neutral', critical:'against', neutral:'neutral',
    pragmatic:'neutral', experiential:'neutral',
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
function generateStatement(typeCode, topic, round, history) {
  const type = TYPES[typeCode];
  if (!type) throw new Error('Unknown type: ' + typeCode);

  const keywords = extractKeywords(topic);
  const kw = keywords.length > 0
    ? keywords[Math.floor(Math.random() * keywords.length)]
    : topic.slice(0, 6);

  const topicLean = analyzeTopic(topic);
  const stance = decideStance(type, topicLean, round, history);
  const value   = type.values[Math.floor(Math.random() * Math.min(3, type.values.length))];
  const concern = type.concerns[Math.floor(Math.random() * Math.min(2, type.concerns.length))];

  const templates = type.templates[stance] || type.templates.neutral;
  const template  = templates[Math.floor(Math.random() * templates.length)];

  let statement = template
    .replace(/{topic}/g, topic)
    .replace(/{kw}/g, kw)
    .replace(/{value}/g, value)
    .replace(/{concern}/g, concern);

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
function runDebate({ topic, participants, round, history }) {
  const opinions = participants.map(typeCode =>
    generateStatement(typeCode, topic, round, history)
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

module.exports = { runDebate, TYPES };
