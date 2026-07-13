import type { Palace, Star, ZiweiChart } from './types';
import { STAR_DESCRIPTIONS } from './constants';
import { HEMING_SCORE_CRITERIA, STAR_IN_FUQI_GU, SIHUA_IN_FUQI_GU } from './heming-knowledge';

type Topic = 'overview' | 'love' | 'career' | 'wealth' | 'health' | 'personality';

const TOPIC_TITLES: Record<Topic, string> = {
  overview: '命格总观',
  love: '感情婚姻',
  career: '事业方向',
  wealth: '财运结构',
  health: '健康提示',
  personality: '性格特质',
};

function palaceByName(chart: ZiweiChart, keyword: string): Palace | undefined {
  return chart.palaces.find(p => p.name.includes(keyword));
}

function palaceByBranch(chart: ZiweiChart, branch?: number): Palace | undefined {
  if (typeof branch !== 'number') return undefined;
  return chart.palaces.find(p => p.branch === branch);
}

function mingPalace(chart: ZiweiChart): Palace | undefined {
  return chart.palaces.find(p => p.isMingGong) ?? palaceByBranch(chart, chart.mingGongBranch) ?? palaceByName(chart, '命');
}

function currentDaXian(chart: ZiweiChart): Palace | undefined {
  const dx = chart.daXians[chart.currentDaXianIndex];
  return palaceByBranch(chart, dx?.palaceBranch);
}

function starsOf(palace?: Palace, type?: Star['type']): Star[] {
  if (!palace) return [];
  return type ? palace.stars.filter(s => s.type === type) : palace.stars;
}

function starNames(palace?: Palace, type?: Star['type']): string {
  const names = starsOf(palace, type).map(s => `${s.name}${s.siHua ? `化${s.siHua}` : ''}`);
  if (names.length > 0) return names.join('、');
  if (palace?.isEmpty && palace.borrowedStars?.length) {
    return `空宫，借${palace.borrowedFromName ?? '对宫'} ${palace.borrowedStars.join('、')}`;
  }
  return '无主星';
}

function starKnowledge(palace?: Palace): string {
  const majorStars = starsOf(palace, 'major');
  if (!majorStars.length) return '当前宫位没有主星描述，需结合借宫和三方四正判断。';
  return majorStars.map(star => {
    const description = STAR_DESCRIPTIONS[star.name];
    if (!description) return `${star.name}：项目知识库暂无该主星的详细描述。`;
    return `${star.name}（${description.keywords}，${description.nature}，五行属${description.element}）`;
  }).join('；');
}

function siHuaSummary(chart: ZiweiChart): string {
  const transformed = chart.palaces.flatMap(p =>
    p.stars
      .filter(s => s.siHua)
      .map(s => `${s.name}化${s.siHua}在${p.name}`),
  );
  return transformed.length ? transformed.join('；') : '本盘未见明显四化标记。';
}

function focusedPalaceFromText(chart: ZiweiChart, text: string): Palace | undefined {
  if (!text.includes('重点分析')) return undefined;
  const names = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '交友', '官禄', '田宅', '福德', '父母'];
  const found = names.find(name => text.includes(name));
  return found ? palaceByName(chart, found.replace('宫', '')) : undefined;
}

function detectTopic(text: string): Topic {
  if (text.includes('命格总观') || text.includes('命格') || text.includes('总观')) return 'overview';
  if (text.includes('感情') || text.includes('婚') || text.includes('夫妻')) return 'love';
  if (text.includes('事业') || text.includes('工作') || text.includes('官禄')) return 'career';
  if (text.includes('财') || text.includes('财富') || text.includes('田宅')) return 'wealth';
  if (text.includes('健康') || text.includes('疾厄') || text.includes('身体')) return 'health';
  if (text.includes('性格') || text.includes('人格') || text.includes('气质')) return 'personality';
  return 'overview';
}

function selectedTopicText(chart: ZiweiChart, topic: Topic): string {
  const ming = mingPalace(chart);
  const spouse = palaceByName(chart, '夫妻');
  const career = palaceByName(chart, '官禄');
  const wealth = palaceByName(chart, '财帛');
  const health = palaceByName(chart, '疾厄');
  const fortune = palaceByName(chart, '福德');
  const moving = palaceByName(chart, '迁移');
  const dx = currentDaXian(chart);
  const dxRange = chart.daXians[chart.currentDaXianIndex];

  const sections: Record<Topic, string> = {
    overview: [
      `**【命格定性】**`,
      `命宫落在${ming?.name ?? '命宫'}，主星为${starNames(ming, 'major')}。这类结构的重点，是先看命宫气质，再用财帛、官禄、迁移三方来判断人如何把能力落实到现实。`,
      ``,
      `**【主星解读】**`,
      `${starKnowledge(ming)}。主星代表做事的底层惯性；辅曜、煞曜与四化同看，可以判断阻力来自人际、资源、节奏还是情绪。`,
      ``,
      `**【三方四正】**`,
      `财帛宫为${starNames(wealth, 'major')}，官禄宫为${starNames(career, 'major')}，迁移宫为${starNames(moving, 'major')}。三方组合显示：财富、职业与外部环境需要一起读，单看某一宫容易失真。`,
      ``,
      `**【当前大限】**`,
      dxRange
        ? `当前大限为${dxRange.startAge}-${dxRange.endAge}岁，落${dx?.name ?? dxRange.palaceName}，主星为${starNames(dx, 'major')}。这十年的重心会更集中在${dx?.name ?? '该宫位'}所管事务。`
        : `当前大限资料不足，可先以本命三方结构作为主要判断。`,
      ``,
      `**【四化提示】**`,
      siHuaSummary(chart),
    ].join('\n'),

    love: [
      `**【感情格局】**`,
      `夫妻宫主星为${starNames(spouse, 'major')}。感情判断不只看桃花，也要看命宫的自我模式与福德宫的内在需求是否能承接亲密关系。`,
      ``,
      `**【夫妻宫分析】**`,
      `${starKnowledge(spouse)}。${spouse?.stars.find(star => star.siHua)?.siHua ? `夫妻宫见${spouse.stars.find(star => star.siHua)?.siHua}，需把关系中的投入、主导和压力说清楚。` : '若有化禄、化权，多见吸引与主导；若有化忌或煞曜，则更需要把边界、沟通和现实压力说清楚。'}`,
      ``,
      `**【三方联动】**`,
      `命宫为${starNames(ming, 'major')}，福德宫为${starNames(fortune, 'major')}。感情能否稳定，关键在于自我节奏与内在安全感能不能同步。`,
      ``,
      `**【实际建议】**`,
      `适合把关系推进节奏放慢一点，先确认价值观、金钱观和生活方式。遇到冲突时，少用试探，多用明确表达。`,
    ].join('\n'),

    career: [
      `**【事业格局】**`,
      `官禄宫主星为${starNames(career, 'major')}，命宫为${starNames(ming, 'major')}。事业上既要看适合做什么，也要看能不能长期维持同一种工作节奏。`,
      ``,
      `**【官禄宫分析】**`,
      `${starKnowledge(career)}。官禄宫代表社会角色、职业路径和成就方式，具体职业仍需结合能力、经验和现实机会验证。`,
      ``,
      `**【财帛联动】**`,
      `财帛宫为${starNames(wealth, 'major')}。收入模式与职业选择要一致：若财帛宫偏动，适合项目制和多渠道；若偏守，适合稳定现金流与长期资产。`,
      ``,
      `**【当前大限】**`,
      dxRange
        ? `${dxRange.startAge}-${dxRange.endAge}岁大限落${dx?.name ?? dxRange.palaceName}，事业判断要把该宫所管事务放进决策。`
        : `当前大限资料不足，先以官禄、财帛、迁移三宫作为主要依据。`,
    ].join('\n'),

    wealth: [
      `**【财运格局】**`,
      `财帛宫主星为${starNames(wealth, 'major')}。财运不是单纯“有钱或没钱”，而是看钱从哪里来、能不能守住、是否容易因选择失误而流失。`,
      ``,
      `**【财帛宫分析】**`,
      `${starKnowledge(wealth)}。财帛宫有力时，适合主动建立收入系统；受煞或化忌影响时，宜先控风险，再谈扩张。`,
      ``,
      `**【田宅宫】**`,
      `田宅宫为${starNames(palaceByName(chart, '田宅'), 'major')}，代表积累、家宅、不动产和长期安全感。它和财帛宫共同决定“赚到的钱能不能留下来”。`,
      ``,
      `**【理财建议】**`,
      `本地解读只作文化研究参考。实际财务上，建议优先做预算、现金流和风险隔离，避免把短期判断当作重仓依据。`,
    ].join('\n'),

    health: [
      `**【疾厄宫主星】**`,
      `疾厄宫主星为${starNames(health, 'major')}。疾厄宫在命理里看的是体质倾向、压力模式和容易失衡的生活节奏。`,
      ``,
      `**【主要风险】**`,
      `${starKnowledge(health)}若见煞曜或化忌，通常提示压力、作息、急躁或长期消耗需要被认真管理；若吉曜较多，则更适合通过稳定习惯保持状态。`,
      ``,
      `**【大限健康走势】**`,
      dxRange
        ? `当前${dxRange.startAge}-${dxRange.endAge}岁大限落${dx?.name ?? dxRange.palaceName}，健康判断还应结合该宫所管事务带来的压力来源。`
        : `当前大限资料不足，可先观察疾厄宫与福德宫。`,
      ``,
      `**【提醒】**`,
      `这不是医疗建议。若有具体症状，请以正规体检和医生意见为准。`,
    ].join('\n'),

    personality: [
      `**【命宫主星性格】**`,
      `${starKnowledge(ming)}。命宫主星代表第一反应、决策风格和面对压力时最容易采用的策略。`,
      ``,
      `**【三方性格综合】**`,
      `财帛宫${starNames(wealth, 'major')}、官禄宫${starNames(career, 'major')}、迁移宫${starNames(moving, 'major')}共同显示：性格不是静态标签，而是在资源、职业和外部环境里被不断触发的行为模式。`,
      ``,
      `**【人际关系模式】**`,
      `看人际要同时看迁移、交友与福德。外在表现若和内在需求不一致，容易出现“表面能扛、内里疲惫”的落差。`,
      ``,
      `**【人生课题】**`,
      `把命宫优势用到长期目标上，把煞曜或化忌提示当作风险管理清单，比追求单一句断更有价值。`,
    ].join('\n'),
  };

  return sections[topic];
}

export function buildChartInterpretation(chart: ZiweiChart, prompt = ''): string {
  const focused = focusedPalaceFromText(chart, prompt);
  if (focused) {
    return [
      `**【宫位定性】**`,
      `${focused.name}主星为${starNames(focused, 'major')}，辅煞星为${starNames(focused).replace(starNames(focused, 'major'), '').replace(/^、/, '') || '无明显辅煞'}。该宫需要结合命宫与三方四正一同判断。`,
      ``,
      `**【主星解读】**`,
      `${starKnowledge(focused)}主星决定这个宫位事务的处理方式：是主动开创、稳定累积、借外部机会，还是需要先化解压力与反复。`,
      ``,
      `**【三方四正联动】**`,
      `若该宫与命、财、官、迁形成呼应，事情容易落实；若见空宫、煞曜或化忌，则更适合先做结构性安排，不宜只凭一时感觉推进。`,
      ``,
      `**【实际建议】**`,
      `把${focused.name}对应事务拆成可执行的步骤：先处理风险，再扩大投入；先验证关系和资源，再承诺长期结果。`,
    ].join('\n');
  }

  const topic = detectTopic(prompt);
  return [
    `**【${TOPIC_TITLES[topic]}】**`,
    selectedTopicText(chart, topic),
  ].join('\n');
}

export function buildHemingInterpretation(chartA: ZiweiChart, chartB: ZiweiChart, question = ''): string {
  const aMing = mingPalace(chartA);
  const bMing = mingPalace(chartB);
  const aSpouse = palaceByName(chartA, '夫妻');
  const bSpouse = palaceByName(chartB, '夫妻');
  const aFortune = palaceByName(chartA, '福德');
  const bFortune = palaceByName(chartB, '福德');

  const aStars = new Set(starsOf(aMing, 'major').map(s => s.name));
  const shared = starsOf(bMing, 'major').filter(s => aStars.has(s.name)).map(s => s.name);
  const sharedText = shared.length ? `双方命宫有${shared.join('、')}呼应，理解彼此节奏会更容易。` : '双方命宫主星差异较大，关系中的吸引点也会伴随磨合点。';

  return [
    `**【缘分定性】**`,
    `${sharedText}合盘重点不在“绝对合不合”，而在双方命宫节奏、夫妻宫期待和福德宫安全感能否对齐。`,
    ``,
    `**【双方命宫】**`,
    `A 的命宫主星为${starNames(aMing, 'major')}；B 的命宫主星为${starNames(bMing, 'major')}。命宫显示两个人遇事时的第一反应，差异越大，越需要提前约定沟通方式。`,
    ``,
    `**【夫妻宫互看】**`,
    `A 的夫妻宫为${starNames(aSpouse, 'major')}；B 的夫妻宫为${starNames(bSpouse, 'major')}。A 方依据：${starKnowledge(aSpouse)} B 方依据：${starKnowledge(bSpouse)}。夫妻宫代表对亲密关系的默认期待，若一方要稳定、一方要空间，就要把边界和承诺讲清楚。`,
    ``,
    `**【内在需求】**`,
    `A 的福德宫为${starNames(aFortune, 'major')}；B 的福德宫为${starNames(bFortune, 'major')}。福德宫越能互相照顾，关系越不容易只停留在表面配合。`,
    ``,
    `**【知识库判断】**`,
    buildHemingKnowledgeNote(aSpouse, bSpouse),
    ``,
    `**【相处建议】**`,
    question
      ? `针对“${question}”：建议先看现实协作，再看情绪投射。把钱、时间、家庭边界和长期目标写清楚，比反复猜测对方心意更有效。`
      : `建议先建立固定沟通节奏，尤其是金钱、时间安排、家庭边界和未来规划。合盘能提示关系结构，但真正能改善关系的是清楚表达和稳定行动。`,
  ].join('\n');
}

function buildHemingKnowledgeNote(aSpouse?: Palace, bSpouse?: Palace): string {
  const aMajor = starsOf(aSpouse, 'major')[0]?.name;
  const bMajor = starsOf(bSpouse, 'major')[0]?.name;
  const aRule = aMajor ? STAR_IN_FUQI_GU[aMajor] : undefined;
  const bRule = bMajor ? STAR_IN_FUQI_GU[bMajor] : undefined;
  const aSihua = aSpouse?.stars.find(star => star.siHua)?.siHua;
  const bSihua = bSpouse?.stars.find(star => star.siHua)?.siHua;
  const notes = [
    aRule ? `A 方${aMajor}在夫妻宫：${aRule.summary}。` : 'A 方夫妻宫主星暂无专项断语。',
    bRule ? `B 方${bMajor}在夫妻宫：${bRule.summary}。` : 'B 方夫妻宫主星暂无专项断语。',
    aSihua ? `A 方夫妻宫见${aSihua}：${SIHUA_IN_FUQI_GU[`化${aSihua}` as keyof typeof SIHUA_IN_FUQI_GU] ?? '需结合全盘判断'}。` : '',
    bSihua ? `B 方夫妻宫见${bSihua}：${SIHUA_IN_FUQI_GU[`化${bSihua}` as keyof typeof SIHUA_IN_FUQI_GU] ?? '需结合全盘判断'}。` : '',
  ].filter(Boolean);
  return `${notes.join(' ')} 本地合盘评分口径：${HEMING_SCORE_CRITERIA['三星']}。`;
}

export function streamText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(/[\s\S]{1,80}/g) ?? [text];

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: chunk } })}\n\n`));
        await new Promise(resolve => setTimeout(resolve, 8));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
