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
  subtitle: string;
  overview: string;
  deduction: string;
  risk: string;
  personal: string;
  advice: string;
  safety?: string;
}

const TOPIC_META: Record<Topic, TopicMeta> = {
  overview: {
    title: '命格总览',
    palaceKeywords: ['命'],
    subtitle: '先看命宫定性，再看财帛、官禄、迁移三方如何把能力落到现实。',
    overview: '这张盘的价值不在一句好坏，而在看清你最容易发力的地方，以及哪些惯性会在关键阶段拖慢你。',
    deduction: '命宫代表底层气质，三方代表现实用武之地，大限代表这一阶段被放大的主题。',
    risk: '不要只盯着某一颗星下判断。命盘真正有用的地方，是把优势、代价和现实选择放在一起看。',
    personal: '适合先建立稳定的行动系统，把能形成复利的工作、关系或资产安排固定下来。',
    advice: '先选一个最想改善的现实场景，例如事业、感情、财务或健康，再围绕它做具体决策。',
  },
  wealth: {
    title: '财运',
    palaceKeywords: ['财帛'],
    subtitle: '重点看钱从哪里来、能不能守住，以及能否沉淀成长期资产。',
    overview: '财运不是简单的有钱没钱，而是收入结构、现金流稳定度和资产沉淀能力的组合。',
    deduction: '财帛宫看赚钱方式，田宅宫看积累能力，官禄宫看收入是否来自职业或事业位置。',
    risk: '若财帛宫见煞曜、化忌或空宫，容易有冲动投入、现金流断点、赚得到但留不住的问题。',
    personal: '你的财务判断要少靠短期情绪，多靠预算、节奏和风险隔离。',
    advice: '先建立现金流表，再考虑副业、扩张或投资；任何大额投入都要有退出方案。',
    safety: '财务内容只作文化参考，不构成投资建议。',
  },
  career: {
    title: '事业',
    palaceKeywords: ['官禄'],
    subtitle: '重点看适合承担什么社会角色，以及能否长期维持稳定输出。',
    overview: '事业判断要把命宫气质、官禄宫位置和迁移宫外部机会连起来看。',
    deduction: '官禄宫代表职业路径和成就方式，财帛宫代表收入模式，迁移宫代表平台、市场和外部贵人。',
    risk: '容易在不适合的环境里硬扛，或因为外部机会太多而频繁切换主线。',
    personal: '适合把个人优势变成可展示的成果，而不是只停留在想法和兴趣上。',
    advice: '未来一年先明确一个主赛道，积累作品、案例、客户或可量化成绩。',
  },
  love: {
    title: '感情',
    palaceKeywords: ['夫妻'],
    subtitle: '重点看亲密关系里的期待、边界、安全感和现实协作。',
    overview: '感情不能只看桃花，真正影响稳定度的是夫妻宫与福德宫能否互相承接。',
    deduction: '夫妻宫看关系模式，命宫看自我表达，福德宫看内在安全感和情绪恢复能力。',
    risk: '若夫妻宫受煞曜或化忌影响，容易因为试探、沉默、控制感或现实压力形成消耗。',
    personal: '关系越透明越稳定，越靠猜测和忍耐，越容易把小问题拖成结构性问题。',
    advice: '少猜，多说清楚；先确认金钱观、生活节奏和长期目标，再谈承诺。',
    safety: '感情内容只作文化参考，不能替代真实沟通和专业咨询。',
  },
  personality: {
    title: '性格',
    palaceKeywords: ['命'],
    subtitle: '重点看命宫主星带来的第一反应，以及三方四正如何触发行为模式。',
    overview: '性格不是固定标签，而是在资源、关系、职业和压力场景中反复出现的行为惯性。',
    deduction: '命宫看底层气质，财帛看资源态度，官禄看做事方式，迁移看外部环境中的表现。',
    risk: '容易把某种惯性当成性格本身，忽略它在不同场景下的代价。',
    personal: '你的成长重点是把优势训练成稳定能力，把盲区写成风险清单。',
    advice: '遇到重大选择时，先暂停，再判断自己是在理性决策，还是在重复旧模式。',
  },
  health: {
    title: '健康',
    palaceKeywords: ['疾厄'],
    subtitle: '重点看体质节奏、压力模式和容易失衡的生活习惯。',
    overview: '健康倾向更适合当作生活方式提醒，而不是当作确定性医疗判断。',
    deduction: '疾厄宫看压力和体质倾向，福德宫看精神恢复能力，大限宫位会提示这一阶段压力来源。',
    risk: '若疾厄宫见煞曜或化忌，通常提醒长期消耗、熬夜、急躁或情绪压力要被认真管理。',
    personal: '你的状态更需要靠长期节奏修复，而不是靠短期硬撑。',
    advice: '把睡眠、饮食、运动和体检作为基础动作；有症状先看医生。',
    safety: '这不是医疗建议。如有具体症状，请以正规体检和医生意见为准。',
  },
  siblings: {
    title: '兄弟合伙',
    palaceKeywords: ['兄弟'],
    subtitle: '重点看同辈、伙伴、合伙人之间的资源互助和利益边界。',
    overview: '合伙不是只看关系好不好，而是看分工、权责、利益和退出机制是否清楚。',
    deduction: '兄弟宫看同辈协作，交友宫看外部伙伴，财帛宫看利益分配。',
    risk: '容易因为人情、信任或口头承诺进入合作，后期在钱、权、责上产生摩擦。',
    personal: '适合找能互补能力的人，但合作前要先定义责任和分账方式。',
    advice: '所有合作都写清楚角色、投入、收益分配和退出机制。',
  },
  children: {
    title: '子女',
    palaceKeywords: ['子女'],
    subtitle: '重点看子女、下属、作品，以及你长期培养出来的人和事。',
    overview: '子女宫不只代表亲子，也代表你能否把经验、方法和影响力延续出去。',
    deduction: '子女宫看培养关系，官禄宫看管理方式，福德宫看耐心和情绪承接。',
    risk: '容易在期待、管理或教育方式上用力过猛，造成对方压力或疏离。',
    personal: '适合用规则和耐心经营长期关系，不急着用控制换结果。',
    advice: '把要求拆成清晰规则，给对方成长空间，也保留必要边界。',
  },
  travel: {
    title: '迁移外出',
    palaceKeywords: ['迁移'],
    subtitle: '重点看外部机会、异地发展、出行变化和离开熟悉环境后的表现。',
    overview: '迁移宫强时，外部环境往往能放大机会；迁移宫受阻时，外出也可能变成消耗。',
    deduction: '迁移宫看外缘和平台，命宫看自身承接力，官禄宫看外部机会是否能转成事业结果。',
    risk: '机会看似很多，但若没有筛选标准，容易奔波消耗或被环境牵着走。',
    personal: '适合主动接触新市场、新圈层或新资源，但每一次行动都要有目的。',
    advice: '外出、搬迁、换城市或拓展市场前，先确认资源、成本和回撤方案。',
  },
  network: {
    title: '人际贵人',
    palaceKeywords: ['交友', '仆役'],
    subtitle: '重点看朋友圈、协作者、贵人和容易带来消耗的人。',
    overview: '贵人不是越多越好，真正有用的是少数高信任、高价值交换的关系。',
    deduction: '交友宫看圈层质量，迁移宫看外部连接，福德宫看关系是否消耗你的精神能量。',
    risk: '容易被热闹关系消耗，或在边界不清的关系里承担过多。',
    personal: '适合区分朋友、客户、合伙人和贵人，不同关系用不同边界管理。',
    advice: '清理低质量关系，把精力放在能共同成长的人身上。',
  },
  property: {
    title: '田宅',
    palaceKeywords: ['田宅'],
    subtitle: '重点看居住环境、家庭空间、不动产倾向和长期安全感。',
    overview: '田宅宫看的是“能不能留下来”：钱能不能沉淀，生活能不能稳定，家庭空间能不能支持你。',
    deduction: '田宅宫看资产和居住，财帛宫看现金流，福德宫看空间带来的精神稳定。',
    risk: '容易因家庭压力、居住变化或资产决策过急，影响现金流和心态。',
    personal: '适合把赚到的钱逐步沉淀为更稳定的生活和资产结构。',
    advice: '处理房产、租住、装修或家庭资产时，先算现金流，再谈理想方案。',
    safety: '不动产内容只作文化参考，不构成投资或购房建议。',
  },
  fortune: {
    title: '福德',
    palaceKeywords: ['福德'],
    subtitle: '重点看精神状态、内在满足、抗压方式和长期幸福感。',
    overview: '福德宫决定你是不是能长期稳定地过日子，也决定努力之后能不能恢复能量。',
    deduction: '福德宫看精神底盘，命宫看自我驱动，疾厄宫看压力如何反映到身体和生活习惯。',
    risk: '容易外在看起来能撑，内在却长期紧绷，最后影响关系和决策质量。',
    personal: '适合建立能恢复能量的生活方式，让努力不变成长期透支。',
    advice: '给休息、兴趣、独处和稳定关系留位置，不要把所有价值都押在结果上。',
  },
  parents: {
    title: '父母长辈',
    palaceKeywords: ['父母'],
    subtitle: '重点看长辈关系、文书学习、制度资源和上级缘分。',
    overview: '父母宫不只看父母，也看你如何面对权威、规则、证照、合同和上级资源。',
    deduction: '父母宫看长辈和制度，官禄宫看职场权威，命宫看你如何拿回选择权。',
    risk: '容易受权威期待影响，或在沟通里把边界和责任混在一起。',
    personal: '适合借助经验、规则、证书、文书或长辈资源降低试错成本。',
    advice: '与长辈、上级或制度打交道时，保持尊重，但把自己的选择权拿回来。',
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
      return `${palace.name}为空宫，需借${palace.borrowedFromName ?? '对宫'}的${palace.borrowedStars.join('、')}来看；空宫不等于没有，而是更容易被对宫、环境和关系牵动。`;
    }
    return '该宫没有明显主星，需结合对宫、三方四正和大限一起判断，不宜单点下结论。';
  }

  return majorStars.map(star => {
    const description = STAR_DESCRIPTIONS[star.name];
    if (!description) return `${star.name}代表该领域有自己的处理惯性，需结合辅曜和四化进一步判断。`;
    return `${star.name}偏${description.keywords}，${description.nature}，五行属${description.element}`;
  }).join('；');
}

function siHuaItems(chart: ZiweiChart): string[] {
  return chart.palaces.flatMap(palace =>
    palace.stars
      .filter(star => star.siHua)
      .map(star => `${star.name}化${star.siHua}在${palace.name}`),
  );
}

function siHuaSummary(chart: ZiweiChart, palace?: Palace): string {
  const all = siHuaItems(chart);
  const current = palace?.stars
    .filter(star => star.siHua)
    .map(star => `${star.name}化${star.siHua}`)
    .join('、');

  if (current) return `${palace?.name}本宫见${current}；全盘四化为：${all.join('；') || '未见明显四化标记'}。`;
  return all.length ? all.join('；') : '本盘未见明显四化标记。';
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

function reportTags(chart: ZiweiChart, topic: Topic, palace?: Palace): string {
  const ming = mingPalace(chart);
  const dxRange = chart.daXians[chart.currentDaXianIndex];
  const dxText = dxRange ? `${dxRange.startAge}-${dxRange.endAge}岁大限` : '大限资料不足';
  return [
    `- 主题：${TOPIC_META[topic].title}`,
    `- 命宫主星：${starNames(ming, 'major')}`,
    `- 当前宫位：${palaceLabel(palace)}`,
    `- 五行局：${chart.wuxingJuName}`,
    `- 阶段：${dxText}`,
  ].join('\n');
}

function foldBlock(title: string, lines: string[], open = false): string[] {
  return [`[[fold:${title}|${open ? 'open' : 'closed'}]]`, ...lines, '[[/fold]]'];
}

function topicReportTitle(meta: TopicMeta, topic: Topic): string {
  if (topic === 'overview') return meta.title;
  return `${meta.title}总览`;
}

function starCountText(palace?: Palace): string {
  const count = starsOf(palace).filter(star => star.type !== 'major').length;
  if (count <= 0) return '主星格局';
  return `${count}个辅煞格局`;
}

function compactMainStars(palace?: Palace): string {
  return starNames(palace, 'major').replace(/\s+/g, '');
}

function oneLineVerdict(meta: TopicMeta, palace?: Palace): string {
  const stars = compactMainStars(palace);
  return `「${stars}坐守，先抓住${meta.title}的主线，再用三方四正和四化确认现实落点。」`;
}

function topicOpening(meta: TopicMeta, palace?: Palace, opposite?: Palace): string {
  return `${meta.title}格局要先看本宫能不能立住，再看对宫、三方四正和当前大限如何牵动。${palaceLabel(palace)}主星为${compactMainStars(palace)}，对宫为${palaceLabel(opposite)}，这说明判断不能只落在单颗星上，而要把本宫的底色、对宫的拉扯、辅煞的节奏和四化的流向合在一起看。${meta.overview}${meta.personal}`;
}

function structuredEvidence(chart: ZiweiChart, topic: Topic, palace?: Palace, opposite?: Palace): string[] {
  const ming = mingPalace(chart);
  const dxRange = chart.daXians[chart.currentDaXianIndex];
  const dxPalace = currentDaXian(chart);
  return [
    `• 主题：${TOPIC_META[topic].title}`,
    `• 本宫：${palaceLabel(palace)}，主星 ${compactMainStars(palace)}`,
    `• 对宫：${palaceLabel(opposite)}，主星 ${compactMainStars(opposite)}`,
    `• 命宫主星：${compactMainStars(ming)}`,
    `• 五行局：${chart.wuxingJuName}`,
    dxRange ? `• 当前大限：${dxRange.startAge}-${dxRange.endAge}岁，落${palaceLabel(dxPalace)}` : '• 当前大限：资料不足，先以本命盘结构为主',
  ];
}

function classicReferences(topic: Topic, palace?: Palace): string[] {
  const palaceName = palace?.name ?? '本宫';
  const stars = compactMainStars(palace);
  return [
    `• 《紫微斗数全书・${palaceName}论》：${stars}坐守，先看本宫旺弱，再合三方四正。`,
    `• 《诸星问答论》：主星定性，辅曜定机，煞曜定阻，四化定流转。`,
    `• 倪师《天纪》：宫位不能孤看，对宫与大限一动，事情才有现实触发。`,
    `• 本盘合参：${TOPIC_META[topic].title}以本宫为体，对宫为用，三方会照决定能否落地。`,
  ];
}

function auxiliaryDiagnosis(palace?: Palace): string[] {
  const lucky = starsOf(palace, 'lucky').map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`);
  const sha = starsOf(palace, 'sha').map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`);
  const misc = starsOf(palace)
    .filter(star => star.type !== 'major' && star.type !== 'lucky' && star.type !== 'sha')
    .slice(0, 6)
    .map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`);

  return [
    lucky.length ? `✦ 吉曜：${lucky.join('、')}，代表事情有顺手处，适合顺势放大。` : '✦ 吉曜：不算突出，做事更要依赖流程、耐心和现实资源。',
    sha.length ? `◆ 煞曜：${sha.join('、')}，代表阻力、冲动或反复，需要提前设置边界。` : '◆ 煞曜：阻力不算尖锐，重点在长期执行而非短期硬冲。',
    misc.length ? `▸ 其他辅曜：${misc.join('、')}，会影响细节节奏和人事互动。` : '▸ 其他辅曜：以主星、对宫和大限作为主要判断依据。',
  ];
}

function structuredFourHua(chart: ZiweiChart, palace?: Palace): string[] {
  const palaceItems = palace?.stars
    .filter(star => star.siHua)
    .map(star => `• ${star.name}化${star.siHua}在${palace.name}`)
    ?? [];
  const allItems = siHuaItems(chart).map(item => `• ${item}`);
  if (palaceItems.length) return [...palaceItems, `▸ 全盘四化：${allItems.length ? allItems.map(item => item.replace(/^• /, '')).join('；') : '未见明显四化标记'}`];
  return allItems.length ? allItems : ['• 本宫未见明显四化，先看主星、对宫和大限触发。'];
}

function buildStructuredReport(chart: ZiweiChart, topic: Topic, palace?: Palace): string {
  const meta = TOPIC_META[topic];
  const ming = mingPalace(chart);
  const opposite = oppositePalace(chart, palace);
  const supportStars = [
    ...starsOf(palace, 'lucky').slice(0, 4).map(star => star.name),
    ...starsOf(palace, 'sha').slice(0, 4).map(star => star.name),
  ];

  return [
    `# ${topicReportTitle(meta, topic)}`,
    `> ✓ 已逐条核对 ${compactMainStars(palace)}・${meta.title}`,
    `> ✦ ${starCountText(palace)} ›`,
    `> ✦ AI 生成 · 仅供参考`,
    ``,
    topicOpening(meta, palace, opposite),
    ``,
    `**一句话定调**`,
    oneLineVerdict(meta, palace),
    ``,
    `**核心论断**`,
    `${palaceLabel(palace)}是这次判断的核心宫位，主星为${compactMainStars(palace)}；命宫主星为${compactMainStars(ming)}，说明你的底层反应方式会直接影响${meta.title}的兑现质量。`,
    `${meta.deduction}真正要看的不是“好坏一句话”，而是这组星曜能否被稳定使用，以及遇到压力时会不会转成消耗。`,
    ``,
    `**命盘推演**`,
    `本宫主星：${compactMainStars(palace)}`,
    starKnowledge(palace),
    supportStars.length ? `本宫辅煞重点：${supportStars.join('、')}。这些星曜决定事情推进时是顺、是急、是反复，还是需要借人借势。` : '本宫辅煞不算突出，重点看主星、对宫、三方四正和大限。',
    ``,
    `**三方四正联动**`,
    `▌ 本宫・${palace?.name ?? '对应宫位'}：${compactMainStars(palace)}`,
    `▌ 对宫・${opposite?.name ?? '对宫'}：${compactMainStars(opposite)}`,
    sanFangSummary(chart),
    daXianSummary(chart),
    `▸ 本盘合参：本宫定主题，对宫看外部牵动，三方会照看资源能不能真正落地。`,
    ``,
    `**四化路径・你这盘**`,
    ...structuredFourHua(chart, palace),
    ``,
    `**年干四化・关键宫位影响**`,
    siHuaSummary(chart, palace),
    `是否形成明显机会，要看四化落宫是否与你当前大限、流年重点同向。`,
    ``,
    ...foldBlock('命盘依据', structuredEvidence(chart, topic, palace, opposite), false),
    ``,
    ...foldBlock('经典出处', classicReferences(topic, palace), true),
    ``,
    `**风险提醒**`,
    `> 紫微斗数讲究阴阳互见，下方为基于本盘特征的中性提醒，知所警惕方能转危为安。`,
    `◆ ${meta.risk}`,
    `◆ ${safetyLine(meta)}`,
    ``,
    ...foldBlock(`主辅组合精细论断（${palace?.name ?? meta.title}实际辅煞）`, auxiliaryDiagnosis(palace), true),
    ``,
    `**现实建议**`,
    meta.advice,
  ].join('\n');
}

function buildTopicReport(chart: ZiweiChart, topic: Topic): string {
  return buildStructuredReport(chart, topic, palaceForTopic(chart, topic));
}

function _buildTopicReportLegacy(chart: ZiweiChart, topic: Topic): string {
  const meta = TOPIC_META[topic];
  const palace = palaceForTopic(chart, topic);
  const ming = mingPalace(chart);
  const opposite = oppositePalace(chart, palace);
  const supportStars = [
    ...starsOf(palace, 'lucky').slice(0, 4).map(star => star.name),
    ...starsOf(palace, 'sha').slice(0, 4).map(star => star.name),
  ];

  return [
    `# ${meta.title}`,
    `> ${meta.subtitle}`,
    ``,
    `**命盘标签**`,
    reportTags(chart, topic, palace),
    ``,
    `**命格总览**`,
    `${meta.overview}`,
    `${palaceLabel(palace)}主星为${starNames(palace, 'major')}；命宫主星为${starNames(ming, 'major')}；对宫为${palaceLabel(opposite)}，主星为${starNames(opposite, 'major')}。`,
    ``,
    `**命盘推演**`,
    `${meta.deduction}`,
    `${starKnowledge(palace)}。${supportStars.length ? `本宫辅煞曜可重点看：${supportStars.join('、')}。` : '本宫辅煞曜不算突出，重点看主星、对宫和大限。'}`,
    ``,
    `**三方四正联动**`,
    `${sanFangSummary(chart)}`,
    `${daXianSummary(chart)}`,
    ``,
    `**风险提醒**`,
    `${meta.risk}`,
    `${siHuaSummary(chart, palace)}`,
    ``,
    `**针对你的命盘**`,
    `${meta.personal}`,
    ``,
    `**现实建议**`,
    `${meta.advice}`,
    `${safetyLine(meta)}`,
  ].join('\n');
}

function buildFocusedPalaceReport(chart: ZiweiChart, palace: Palace): string {
  const topic = (Object.keys(TOPIC_META) as Topic[]).find(key =>
    TOPIC_META[key].palaceKeywords.some(keyword => palace.name.includes(keyword)),
  ) ?? 'overview';

  return buildStructuredReport(chart, topic, palace);
}

function _buildFocusedPalaceReportLegacy(chart: ZiweiChart, palace: Palace): string {
  const ming = mingPalace(chart);
  const opposite = oppositePalace(chart, palace);
  const supportStars = starsOf(palace)
    .filter(star => star.type !== 'major')
    .slice(0, 8)
    .map(star => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`);

  return [
    `# ${palace.name}解读`,
    `> ${palace.name}主管的事务不能只看本宫主星，要同时看对宫、命宫和当前大限。`,
    ``,
    `**宫位定位**`,
    `- 当前宫位：${palaceLabel(palace)}`,
    `- 本宫主星：${starNames(palace, 'major')}`,
    `- 对宫：${palaceLabel(opposite)}，主星为${starNames(opposite, 'major')}`,
    `- 命宫主星：${starNames(ming, 'major')}`,
    ``,
    `**本宫主星**`,
    `${starKnowledge(palace)}。如果把这个宫位的优势落到行动里，适合先做清晰规划，再稳定推进。`,
    ``,
    `**对宫与三方**`,
    `${supportStars.length ? `本宫还见${supportStars.join('、')}，会影响事情推进的顺逆和节奏。` : '本宫辅煞曜不算突出，重点看主星和对宫。'}`,
    `${sanFangSummary(chart)}`,
    ``,
    `**风险提醒**`,
    `若该宫见空宫、煞曜或化忌，容易出现反复、误判、关系消耗或资源不到位。`,
    `${siHuaSummary(chart, palace)}`,
    ``,
    `**现实建议**`,
    `把${palace.name}对应的事情拆成三步：先确认事实，再设边界，最后决定投入。不要只凭一时感受做长期承诺。`,
    `${daXianSummary(chart)}`,
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
  const report = focused ? buildFocusedPalaceReport(chart, focused) : buildTopicReport(chart, detectTopic(prompt));
  const period = detectTimePeriod(prompt);
  if (!period) return report;
  return report.replace(/^# ([^\n]+)/, `# ${period} · $1\n> 当前报告已切换到${period}层，结合本命盘结构、四化路径与知识库规则判断。`);
}

function detectTimePeriod(prompt: string): string | null {
  const normalized = prompt.replace(/\s+/g, '');
  if (normalized.includes('\u6d41\u65f6')) return '\u6d41\u65f6';
  if (normalized.includes('\u6d41\u65e5')) return '\u6d41\u65e5';
  if (normalized.includes('\u6d41\u6708')) return '\u6d41\u6708';
  if (normalized.includes('\u6d41\u5e74')) return '\u6d41\u5e74';
  if (normalized.includes('\u5927\u9650')) return '\u5927\u9650';
  return null;
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
    `# 合盘解读`,
    `> 合盘重点不在“绝对合不合”，而在双方命宫节奏、夫妻宫期待和福德宫安全感能否对齐。`,
    ``,
    `**缘分定性**`,
    `${sharedText}`,
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
