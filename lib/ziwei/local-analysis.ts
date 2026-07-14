import type { Palace, Star, ZiweiChart } from './types';
import { BRANCHES, STAR_DESCRIPTIONS, STEMS } from './constants';
import { HEMING_SCORE_CRITERIA, SIHUA_IN_FUQI_GU, STAR_IN_FUQI_GU } from './heming-knowledge';

type Topic =
  | 'overview'
  | 'wealth'
  | 'career'
  | 'love'
  | 'personality'
  | 'health'
  | 'siblings'
  | 'children'
  | 'travel'
  | 'network'
  | 'property'
  | 'fortune'
  | 'parents';

interface TopicMeta {
  title: string;
  palaceKeywords: string[];
  focus: string;
  advantage: string;
  risk: string;
  advice: string;
  nextYear: string;
  safety?: string;
}

const TOPIC_META: Record<Topic, TopicMeta> = {
  overview: {
    title: '命格总览',
    palaceKeywords: ['命'],
    focus: '整体格局要先看命宫，再看财帛、官禄、迁移三方如何把能力落到现实。',
    advantage: '适合先抓住最稳定的主星优势，建立一套可以反复使用的做事方法。',
    risk: '容易只看单一宫位就下判断，忽略现实资源、环境变化和长期节奏。',
    advice: '把命盘当作自我观察工具：先确认自己的优势场景，再用小步试错验证方向。',
    nextYear: '未来一年重点是减少摇摆，把最能形成复利的工作、关系或资产安排固定下来。',
  },
  wealth: {
    title: '财运',
    palaceKeywords: ['财帛'],
    focus: '财运重点看收入来源、守财能力和钱是否能沉淀为长期资产。',
    advantage: '适合把赚钱方式系统化，不只靠临时机会，而是建立稳定现金流。',
    risk: '若财帛宫受煞曜、化忌或空宫影响，容易有冲动投入、现金流断点或赚得到留不住的问题。',
    advice: '先做预算、现金流和风险隔离，再考虑扩张、副业或投资。',
    nextYear: '未来一年适合把财务目标拆成储蓄、还款、增收和资产配置四张清单。',
    safety: '财务内容只作文化参考，不构成投资建议。',
  },
  career: {
    title: '事业',
    palaceKeywords: ['官禄'],
    focus: '事业重点看适合承担什么社会角色，以及能否长期维持稳定输出。',
    advantage: '适合把命宫气质变成职业定位，让能力、岗位和收入模式互相配合。',
    risk: '容易在不适合的环境里硬扛，或因为外部机会太多而分散主线。',
    advice: '优先选择能放大你主星优势的岗位、行业或产品方向，不急着追热点。',
    nextYear: '未来一年重点是明确一个主赛道，积累可展示的成果，而不是频繁换方向。',
  },
  love: {
    title: '感情',
    palaceKeywords: ['夫妻'],
    focus: '感情不只看桃花，更要看亲密关系里的安全感、边界和沟通节奏。',
    advantage: '适合把真实需求讲清楚，关系越透明，越容易稳定推进。',
    risk: '若夫妻宫有煞曜或化忌，容易因为试探、控制感、沉默或现实压力产生消耗。',
    advice: '少猜，多说清楚；先确认金钱观、生活节奏和长期目标，再谈承诺。',
    nextYear: '未来一年适合修正关系里的旧模式，尤其是沟通、边界和共同规划。',
    safety: '感情内容只作文化参考，不能替代真实沟通和专业咨询。',
  },
  personality: {
    title: '性格',
    palaceKeywords: ['命'],
    focus: '性格重点看命宫主星，也要看三方四正如何触发你的行为模式。',
    advantage: '适合把第一反应里的优势训练成稳定能力，而不是只靠情绪和直觉。',
    risk: '容易把某种惯性当成性格本身，忽略它在不同场景下的代价。',
    advice: '把优势用于长期目标，把盲区写成风险清单，遇事先暂停再判断。',
    nextYear: '未来一年适合建立更稳定的表达、决策和复盘习惯。',
  },
  health: {
    title: '健康',
    palaceKeywords: ['疾厄'],
    focus: '健康倾向重点看体质节奏、压力模式和容易失衡的生活习惯。',
    advantage: '适合通过稳定作息、规律运动和压力管理来改善整体状态。',
    risk: '若疾厄宫见煞曜或化忌，通常提醒长期消耗、急躁、熬夜或情绪压力要被认真管理。',
    advice: '把睡眠、饮食、运动和体检作为基础动作，不用命理替代医学判断。',
    nextYear: '未来一年重点是建立可持续的健康节奏，尤其减少长期透支。',
    safety: '这不是医疗建议。如有具体症状，请以正规体检和医生意见为准。',
  },
  siblings: {
    title: '兄弟合伙',
    palaceKeywords: ['兄弟'],
    focus: '兄弟合伙重点看同辈、伙伴、合伙人之间的资源互助和利益边界。',
    advantage: '适合寻找能互补能力的人，但合作前要先定义责任和分账方式。',
    risk: '容易因为人情、信任或口头承诺进入合作，后期在钱、权、责上产生摩擦。',
    advice: '所有合作都要写清楚角色、投入、退出机制和收益分配。',
    nextYear: '未来一年适合筛选高质量伙伴，减少低效率社交和模糊合作。',
  },
  children: {
    title: '子女',
    palaceKeywords: ['子女'],
    focus: '子女宫也可看下属、作品、长期培养出来的人和事。',
    advantage: '适合用耐心和规则感经营长期关系，不急着用控制换结果。',
    risk: '容易在期待、管理或教育方式上用力过猛，造成对方压力或疏离。',
    advice: '把要求拆成清晰规则，给对方成长空间，也保留必要边界。',
    nextYear: '未来一年适合培养可传承的能力、团队或作品，不只追求短期反馈。',
  },
  travel: {
    title: '迁移外出',
    palaceKeywords: ['迁移'],
    focus: '迁移宫看外部机会、异地发展、出行变化和离开熟悉环境后的表现。',
    advantage: '适合主动走出去接触新市场、新圈层或新资源。',
    risk: '外部机会看似很多，但若没有筛选标准，容易奔波消耗或被环境牵着走。',
    advice: '外出、搬迁、换城市或拓展市场前，先确认资源、成本和回撤方案。',
    nextYear: '未来一年适合增加高质量外部连接，但每一次行动都要有明确目的。',
  },
  network: {
    title: '人际贵人',
    palaceKeywords: ['交友', '仆役'],
    focus: '交友宫看朋友圈、协作者、贵人和容易带来消耗的人。',
    advantage: '适合经营少数高信任关系，用长期价值交换建立贵人缘。',
    risk: '容易被热闹关系消耗，或在不清楚边界的关系里承担过多。',
    advice: '区分朋友、客户、合伙人和贵人，不同关系用不同边界管理。',
    nextYear: '未来一年适合清理低质量关系，把精力放在能共同成长的人身上。',
  },
  property: {
    title: '田宅',
    palaceKeywords: ['田宅'],
    focus: '田宅宫看居住环境、家庭空间、不动产倾向和长期安全感。',
    advantage: '适合把赚到的钱逐步沉淀为更稳定的生活和资产结构。',
    risk: '容易因家庭压力、居住变化或资产决策过急，影响现金流和心态。',
    advice: '处理房产、租住、装修或家庭资产时，先算现金流，再谈理想方案。',
    nextYear: '未来一年适合优化居住环境和资产结构，不宜只凭情绪做大额决定。',
    safety: '不动产内容只作文化参考，不构成投资或购房建议。',
  },
  fortune: {
    title: '福德',
    palaceKeywords: ['福德'],
    focus: '福德宫看精神状态、内在满足、抗压方式和长期幸福感。',
    advantage: '适合建立能恢复能量的生活方式，让努力不变成长期透支。',
    risk: '容易外在看起来能撑，内在却长期紧绷，最后影响关系和决策质量。',
    advice: '给休息、兴趣、独处和稳定关系留位置，别把所有价值都押在结果上。',
    nextYear: '未来一年重点是降低精神内耗，建立更可持续的生活节奏。',
  },
  parents: {
    title: '父母长辈',
    palaceKeywords: ['父母'],
    focus: '父母宫看长辈关系、文书学习、制度资源和上级缘分。',
    advantage: '适合借助经验、规则、证书、文书或长辈资源降低试错成本。',
    risk: '容易受权威期待影响，或在沟通里把边界和责任混在一起。',
    advice: '与长辈、上级或制度打交道时，保持尊重，但把自己的选择权拿回来。',
    nextYear: '未来一年适合处理证照、合同、学习和长辈沟通相关事项。',
  },
};

function palaceByName(chart: ZiweiChart, keyword: string): Palace | undefined {
  return chart.palaces.find(palace => palace.name.includes(keyword));
}

function palaceByBranch(chart: ZiweiChart, branch?: number): Palace | undefined {
  if (typeof branch !== 'number') return undefined;
  return chart.palaces.find(palace => palace.branch === branch);
}

function palaceForTopic(chart: ZiweiChart, topic: Topic): Palace | undefined {
  for (const keyword of TOPIC_META[topic].palaceKeywords) {
    const palace = palaceByName(chart, keyword);
    if (palace) return palace;
  }
  return mingPalace(chart);
}

function mingPalace(chart: ZiweiChart): Palace | undefined {
  return chart.palaces.find(palace => palace.isMingGong)
    ?? palaceByBranch(chart, chart.mingGongBranch)
    ?? palaceByName(chart, '命');
}

function currentDaXian(chart: ZiweiChart): Palace | undefined {
  const dx = chart.daXians[chart.currentDaXianIndex];
  return palaceByBranch(chart, dx?.palaceBranch);
}

function oppositePalace(chart: ZiweiChart, palace?: Palace): Palace | undefined {
  return palaceByBranch(chart, palace?.oppositeBranch);
}

function starsOf(palace?: Palace, type?: Star['type']): Star[] {
  if (!palace) return [];
  return type ? palace.stars.filter(star => star.type === type) : palace.stars;
}

function starNames(palace?: Palace, type?: Star['type']): string {
  const names = starsOf(palace, type).map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`);
  if (names.length > 0) return names.join('、');
  if (type === 'major' && palace?.isEmpty && palace.borrowedStars?.length) {
    return `空宫，借${palace.borrowedFromName ?? '对宫'}的${palace.borrowedStars.join('、')}来看`;
  }
  return type === 'major' ? '无主星' : '无明显辅煞';
}

function palaceLabel(palace?: Palace): string {
  if (!palace) return '对应宫位';
  const stem = STEMS[palace.stem] ?? '';
  const branch = BRANCHES[palace.branch] ?? '';
  return `${palace.name}${stem || branch ? `（${stem}${branch}）` : ''}`;
}

function starKnowledge(palace?: Palace): string {
  const majorStars = starsOf(palace, 'major');
  if (!majorStars.length) {
    if (palace?.borrowedStars?.length) {
      return `${palace.name}为空宫，需借${palace.borrowedFromName ?? '对宫'}的${palace.borrowedStars.join('、')}来看，重点是先观察外部环境和关系互动，再判断本宫事务。`;
    }
    return '该宫没有明显主星，需结合对宫、三方四正和大限一起判断，不宜单点下结论。';
  }

  return majorStars.map(star => {
    const description = STAR_DESCRIPTIONS[star.name];
    if (!description) return `${star.name}代表该领域有自己的处理惯性，需结合辅曜和四化进一步判断。`;
    return `${star.name}偏${description.keywords}，${description.nature}，五行属${description.element}`;
  }).join('；');
}

function siHuaSummary(chart: ZiweiChart, palace?: Palace): string {
  const transformed = chart.palaces.flatMap(item =>
    item.stars
      .filter(star => star.siHua)
      .map(star => `${star.name}化${star.siHua}在${item.name}`),
  );
  const current = palace?.stars
    .filter(star => star.siHua)
    .map(star => `${star.name}化${star.siHua}`)
    .join('、');

  if (current) return `${palace?.name}本宫见${current}；全盘四化为：${transformed.join('；') || '未见明显四化标记'}。`;
  return transformed.length ? transformed.join('；') : '本盘未见明显四化标记。';
}

function sanFangSummary(chart: ZiweiChart): string {
  const wealth = palaceByName(chart, '财帛');
  const career = palaceByName(chart, '官禄');
  const travel = palaceByName(chart, '迁移');
  return `财帛宫主星为${starNames(wealth, 'major')}，官禄宫主星为${starNames(career, 'major')}，迁移宫主星为${starNames(travel, 'major')}。这组三方决定能力如何变成收入、事业和外部机会。`;
}

function daXianSummary(chart: ZiweiChart): string {
  const dxRange = chart.daXians[chart.currentDaXianIndex];
  const dxPalace = currentDaXian(chart);
  if (!dxRange) return '当前大限资料不足，先以本命盘结构作为主要判断。';
  return `当前大限为${dxRange.startAge}-${dxRange.endAge}岁，落${palaceLabel(dxPalace) || dxRange.palaceName}，主星为${starNames(dxPalace, 'major')}。这十年的重点会被该宫位事务放大。`;
}

function safetyLine(meta: TopicMeta): string {
  return meta.safety ?? '命理解读只作文化参考，不替代医疗、法律、投资、心理咨询或人生重大决策。';
}

function buildTopicReport(chart: ZiweiChart, topic: Topic): string {
  const meta = TOPIC_META[topic];
  const palace = palaceForTopic(chart, topic);
  const ming = mingPalace(chart);
  const opposite = oppositePalace(chart, palace);
  const supportStars = [
    ...starsOf(palace, 'lucky').slice(0, 4).map(star => star.name),
    ...starsOf(palace, 'sha').slice(0, 4).map(star => star.name),
  ];

  return [
    `**一句话结论**`,
    `${meta.title}的重点不是一句“好或不好”，而是看${palaceLabel(palace)}的主星如何与命宫、三方四正和当前大限配合。${meta.focus}`,
    ``,
    `**命盘依据**`,
    `${palaceLabel(palace)}主星为${starNames(palace, 'major')}；命宫主星为${starNames(ming, 'major')}；对宫为${palaceLabel(opposite)}，主星为${starNames(opposite, 'major')}。${supportStars.length ? `本宫辅煞曜可重点看：${supportStars.join('、')}。` : '本宫辅煞曜不算突出。'}${sanFangSummary(chart)}`,
    ``,
    `**你的优势**`,
    `${starKnowledge(palace)}。${meta.advantage}`,
    ``,
    `**容易卡住的地方**`,
    `${meta.risk} ${siHuaSummary(chart, palace)}`,
    ``,
    `**现实建议**`,
    `${meta.advice} ${safetyLine(meta)}`,
    ``,
    `**未来一年重点**`,
    `${daXianSummary(chart)}${meta.nextYear}`,
  ].join('\n');
}

function buildFocusedPalaceReport(chart: ZiweiChart, palace: Palace): string {
  const ming = mingPalace(chart);
  const opposite = oppositePalace(chart, palace);
  const supportStars = starsOf(palace)
    .filter(star => star.type !== 'major')
    .slice(0, 8)
    .map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`);

  return [
    `**一句话结论**`,
    `${palace.name}主管的事务不能只看本宫主星，要同时看对宫、命宫和当前大限。这个宫位越清楚，现实决策越不容易被情绪带走。`,
    ``,
    `**命盘依据**`,
    `${palaceLabel(palace)}主星为${starNames(palace, 'major')}；对宫${palaceLabel(opposite)}主星为${starNames(opposite, 'major')}；命宫主星为${starNames(ming, 'major')}。${supportStars.length ? `本宫还见${supportStars.join('、')}，会影响事情推进的顺逆和节奏。` : '本宫辅煞曜不算突出，重点看主星和对宫。'}`,
    ``,
    `**你的优势**`,
    `${starKnowledge(palace)}。如果把这个宫位的优势落到行动里，适合先做清晰规划，再稳定推进。`,
    ``,
    `**容易卡住的地方**`,
    `若该宫见空宫、煞曜或化忌，容易出现反复、误判、关系消耗或资源不到位。${siHuaSummary(chart, palace)}`,
    ``,
    `**现实建议**`,
    `把${palace.name}对应的事情拆成三步：先确认事实，再设边界，最后决定投入。不要只凭一时感受做长期承诺。命理解读只作文化参考，不替代现实判断。`,
    ``,
    `**未来一年重点**`,
    `${daXianSummary(chart)}未来一年适合把${palace.name}相关事项做一次整理：该保留的保留，该止损的止损，该长期经营的就建立规则。`,
  ].join('\n');
}

function focusedPalaceFromText(chart: ZiweiChart, text: string): Palace | undefined {
  if (!text.includes('重点分析')) return undefined;
  const names = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '仆役', '官禄', '田宅', '福德', '父母'];
  const found = names.find(name => text.includes(name));
  if (!found) return undefined;
  return palaceByName(chart, found.replace('宫', ''));
}

function detectTopic(text: string): Topic {
  const normalized = text.replace(/\s+/g, '');
  if (normalized.includes('兄弟') || normalized.includes('合伙')) return 'siblings';
  if (normalized.includes('子女') || normalized.includes('下属')) return 'children';
  if (normalized.includes('迁移') || normalized.includes('外出') || normalized.includes('异地') || normalized.includes('搬迁')) return 'travel';
  if (normalized.includes('人际') || normalized.includes('贵人') || normalized.includes('交友') || normalized.includes('朋友')) return 'network';
  if (normalized.includes('田宅') || normalized.includes('房') || normalized.includes('居住') || normalized.includes('资产')) return 'property';
  if (normalized.includes('福德') || normalized.includes('精神') || normalized.includes('压力') || normalized.includes('内在')) return 'fortune';
  if (normalized.includes('父母') || normalized.includes('长辈') || normalized.includes('文书')) return 'parents';
  if (normalized.includes('感情') || normalized.includes('婚') || normalized.includes('夫妻')) return 'love';
  if (normalized.includes('事业') || normalized.includes('工作') || normalized.includes('职业') || normalized.includes('官禄')) return 'career';
  if (normalized.includes('财') || normalized.includes('财富') || normalized.includes('赚钱') || normalized.includes('理财')) return 'wealth';
  if (normalized.includes('健康') || normalized.includes('疾厄') || normalized.includes('身体') || normalized.includes('养生')) return 'health';
  if (normalized.includes('性格') || normalized.includes('人格') || normalized.includes('气质')) return 'personality';
  return 'overview';
}

export function buildChartInterpretation(chart: ZiweiChart, prompt = ''): string {
  const focused = focusedPalaceFromText(chart, prompt);
  if (focused) return buildFocusedPalaceReport(chart, focused);
  return buildTopicReport(chart, detectTopic(prompt));
}

export function buildHemingInterpretation(chartA: ZiweiChart, chartB: ZiweiChart, question = ''): string {
  const aMing = mingPalace(chartA);
  const bMing = mingPalace(chartB);
  const aSpouse = palaceByName(chartA, '夫妻');
  const bSpouse = palaceByName(chartB, '夫妻');
  const aFortune = palaceByName(chartA, '福德');
  const bFortune = palaceByName(chartB, '福德');

  const aStars = new Set(starsOf(aMing, 'major').map(star => star.name));
  const shared = starsOf(bMing, 'major').filter(star => aStars.has(star.name)).map(star => star.name);
  const sharedText = shared.length
    ? `双方命宫有${shared.join('、')}呼应，理解彼此节奏会更容易。`
    : '双方命宫主星差异较大，关系中的吸引点也会伴随磨合点。';

  return [
    `**缘分定性**`,
    `${sharedText}合盘重点不在“绝对合不合”，而在双方命宫节奏、夫妻宫期待和福德宫安全感能否对齐。`,
    ``,
    `**双方命宫**`,
    `A 的命宫主星为${starNames(aMing, 'major')}；B 的命宫主星为${starNames(bMing, 'major')}。命宫显示两个人遇事时的第一反应，差异越大，越需要提前约定沟通方式。`,
    ``,
    `**夫妻宫互看**`,
    `A 的夫妻宫为${starNames(aSpouse, 'major')}；B 的夫妻宫为${starNames(bSpouse, 'major')}。A 方依据：${starKnowledge(aSpouse)}。B 方依据：${starKnowledge(bSpouse)}。夫妻宫代表亲密关系里的默认期待，若一方要稳定、一方要空间，就要把边界和承诺讲清楚。`,
    ``,
    `**内在需求**`,
    `A 的福德宫为${starNames(aFortune, 'major')}；B 的福德宫为${starNames(bFortune, 'major')}。福德宫越能互相照顾，关系越不容易只停留在表面配合。`,
    ``,
    `**知识库判断**`,
    buildHemingKnowledgeNote(aSpouse, bSpouse),
    ``,
    `**相处建议**`,
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
