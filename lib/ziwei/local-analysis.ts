import type { Palace, Star, ZiweiChart } from './types';
import { BRANCHES, STAR_DESCRIPTIONS, STEMS } from './constants';
import { HEMING_SCORE_CRITERIA, SIHUA_IN_FUQI_GU, STAR_IN_FUQI_GU } from './heming-knowledge';
import { detectPatterns } from './patterns';
import { getEntryForLocalTopic } from './knowledge-base';

export type Topic =
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

interface TopicDepth {
  questions: [string, string, string];
  relatedPalaceKeywords: string[];
  strength: string;
  challenge: string;
  actions: [string, string, string];
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

const TOPIC_DEPTH: Record<Topic, TopicDepth> = {
  overview: {
    questions: ['你的底层驱动力是什么', '优势最容易在哪些现实领域兑现', '压力来临时哪种惯性最容易拖后腿'],
    relatedPalaceKeywords: ['命', '官禄', '财帛', '迁移'],
    strength: '命宫决定你如何启动，官禄与财帛决定能力如何被市场承接，迁移宫则决定外部平台能不能放大成果。',
    challenge: '最需要防的不是能力不足，而是优势使用过量：果断可能变成冒进，敏感可能变成内耗，追求可能变成失控。',
    actions: ['先确定未来一年的唯一主线', '再为情绪、现金流和关系设置底线', '最后用每月复盘校正方向，而不是频繁推翻重来'],
  },
  wealth: {
    questions: ['钱主要从哪里来', '赚到的钱为什么能留下或流失', '当前阶段更适合扩张还是守成'],
    relatedPalaceKeywords: ['财帛', '官禄', '田宅', '福德'],
    strength: '财帛宫负责赚钱方式，官禄宫负责职业变现，田宅宫负责沉淀，福德宫则会影响消费冲动和风险耐受。',
    challenge: '财运最怕把收入能力误当成资产能力：会赚钱不等于能守住，短期机会也不等于适合长期投入。',
    actions: ['先把固定支出、负债和现金储备列清楚', '再区分主业收入、机会收入和资产收益', '任何大额投入都预先写好止损与退出条件'],
  },
  career: {
    questions: ['你适合承担什么职业角色', '什么环境最能放大你的能力', '下一次突破来自职位、作品还是平台'],
    relatedPalaceKeywords: ['官禄', '命', '财帛', '迁移'],
    strength: '官禄宫决定做事方式，命宫决定个人驱动力，财帛宫验证市场价值，迁移宫则决定平台和外部机会。',
    challenge: '事业最怕同时追逐太多可能性，导致每条路径都没有形成可证明、可复用、可积累的成果。',
    actions: ['选定一个主赛道并明确衡量指标', '沉淀能公开展示的作品、案例或客户结果', '设定三到六个月验证期后再决定是否转向'],
  },
  love: {
    questions: ['你真正需要怎样的亲密关系', '冲突出现时双方如何反应', '现实条件能否承接情感期待'],
    relatedPalaceKeywords: ['夫妻', '命', '福德', '田宅'],
    strength: '夫妻宫看关系结构，命宫看表达方式，福德宫看安全感，田宅宫看生活与家庭安排能否稳定落地。',
    challenge: '感情最怕用吸引力代替稳定度、用忍耐代替沟通，最后让小问题累积成信任和现实安排上的结构性冲突。',
    actions: ['先把需求和底线说清楚', '再核对金钱观、生活节奏与长期计划', '重要决定只在情绪稳定、信息充分时做'],
  },
  personality: {
    questions: ['你遇事的第一反应是什么', '优势在什么场景会反转成盲区', '怎样把天赋训练成稳定能力'],
    relatedPalaceKeywords: ['命', '福德', '官禄', '迁移'],
    strength: '命宫给出外显气质，福德宫反映内在感受，官禄宫显示做事习惯，迁移宫则揭示陌生环境里的真实反应。',
    challenge: '性格分析最容易犯的错，是把反复出现的防御反应当成不可改变的自我，从而错过调整行为策略的机会。',
    actions: ['记录自己在压力下最常见的触发点', '把优势拆成可练习的具体能力', '重大决定增加冷静期和外部反馈'],
  },
  health: {
    questions: ['身体最容易在哪种压力下失衡', '恢复能量主要依靠什么', '哪些生活习惯需要优先修正'],
    relatedPalaceKeywords: ['疾厄', '福德', '官禄', '田宅'],
    strength: '疾厄宫看体质与压力反应，福德宫看精神恢复，官禄宫看消耗来源，田宅宫则对应长期生活环境与作息。',
    challenge: '健康主题最怕长期硬撑，把疲劳、睡眠紊乱或情绪压力当作意志问题，错过及时调整和专业检查。',
    actions: ['先稳定睡眠、饮食与基础运动', '记录持续出现的身体信号和压力来源', '有明确症状时优先体检并咨询医生'],
  },
  siblings: {
    questions: ['彼此能提供什么真实资源', '合作中谁负责什么', '利益冲突出现时如何退出'],
    relatedPalaceKeywords: ['兄弟', '交友', '财帛', '官禄'],
    strength: '兄弟宫看同辈互助，交友宫看外部伙伴，财帛宫看利益分配，官禄宫看分工与执行。',
    challenge: '兄弟合伙最怕情分先行、规则缺席，前期不好意思谈钱谈责，后期却在投入、决策权和收益上积累不满。',
    actions: ['先写清角色、投入与交付', '再确定财务、决策和信息透明机制', '提前约定退出、回购和争议处理方式'],
  },
  children: {
    questions: ['你倾向怎样培养和带领别人', '期待是否符合对方阶段', '如何在规则和空间之间平衡'],
    relatedPalaceKeywords: ['子女', '父母', '官禄', '福德'],
    strength: '子女宫看培养关系，父母宫影响教育观，官禄宫反映管理方式，福德宫则决定耐心和情绪承接力。',
    challenge: '子女主题最怕把自己的焦虑变成对方的任务，用控制换取短期结果，却削弱长期信任和自主性。',
    actions: ['把期待改写成清晰、适龄的小目标', '稳定反馈而不是只在出错时沟通', '给成长空间，同时保留必要边界'],
  },
  travel: {
    questions: ['异地与外部环境能带来什么', '你能否承接变化成本', '机会最终能不能转成事业和收入'],
    relatedPalaceKeywords: ['迁移', '命', '官禄', '财帛'],
    strength: '迁移宫看外部机会，命宫看适应能力，官禄宫看事业承接，财帛宫验证机会能否转成实际收益。',
    challenge: '迁移外出最怕把变化本身当成答案；没有明确目标、资源和回撤方案，外部机会很容易变成持续奔波。',
    actions: ['明确这次外出的唯一目标', '核算时间、资金和关系成本', '先做小规模验证，再决定搬迁或长期投入'],
  },
  network: {
    questions: ['真正能帮到你的贵人是谁', '哪些关系正在持续消耗你', '合作边界应该设在哪里'],
    relatedPalaceKeywords: ['交友', '迁移', '官禄', '福德'],
    strength: '交友宫看圈层质量，迁移宫看外部连接，官禄宫看合作价值，福德宫则反映一段关系是否长期消耗。',
    challenge: '人际主题最怕把热闹误当资源，把一次帮助误当长期承诺，在边界不清的关系里承担过多责任。',
    actions: ['把朋友、客户、伙伴和贵人分开管理', '优先维护少数高信任、高互补关系', '对金钱、资源和承诺保持清晰边界'],
  },
  property: {
    questions: ['现阶段更需要居住稳定还是资产增值', '现金流能否承受长期成本', '家庭意见和产权如何安排'],
    relatedPalaceKeywords: ['田宅', '财帛', '福德', '父母'],
    strength: '田宅宫看居住与沉淀，财帛宫看现金流，福德宫看空间带来的稳定感，父母宫则可能带来家庭资源与意见。',
    challenge: '田宅主题最怕把理想生活和投资收益混为一谈，在现金流、产权或家庭边界没有谈清时做出重资产决定。',
    actions: ['先区分自住需求与投资需求', '测算首付、月供、维护和机会成本', '涉及共同资产时书面确认出资与产权'],
  },
  fortune: {
    questions: ['什么事情真正让你恢复能量', '努力与休息是否形成健康节奏', '内在满足是否过度依赖外部评价'],
    relatedPalaceKeywords: ['福德', '疾厄', '命', '夫妻'],
    strength: '福德宫看精神底盘，疾厄宫看压力落到身体的方式，命宫看自我驱动，夫妻宫则影响情感安全感。',
    challenge: '福德主题最怕外在持续运转、内在长期紧绷，把所有价值押在结果和评价上，最终影响判断与关系质量。',
    actions: ['固定不以产出为目标的休息时间', '建立能长期坚持的兴趣和独处方式', '减少持续消耗却没有回报的承诺'],
  },
  parents: {
    questions: ['长辈能提供什么支持与经验', '哪些期待正在影响你的选择', '如何兼顾尊重、责任与个人边界'],
    relatedPalaceKeywords: ['父母', '官禄', '命', '田宅'],
    strength: '父母宫看长辈、制度与文书资源，官禄宫看职场权威，命宫看自主选择，田宅宫则连接家庭责任。',
    challenge: '父母长辈主题最怕把尊重等同服从，把关心变成控制，或在责任没有说清时长期积累内疚与冲突。',
    actions: ['先区分建议、期待和实际责任', '重要安排用事实、时间和预算沟通', '保持尊重，同时明确最终选择与承担方式'],
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

function topicRelatedPalaces(chart: ZiweiChart, topic: Topic): Palace[] {
  const seen = new Set<string>();
  return TOPIC_DEPTH[topic].relatedPalaceKeywords
    .map(keyword => palaceByName(chart, keyword))
    .filter((palace): palace is Palace => {
      if (!palace || seen.has(palace.name)) return false;
      seen.add(palace.name);
      return true;
    });
}

function topicLinkageLines(chart: ZiweiChart, topic: Topic, focus?: Palace): string[] {
  const related = topicRelatedPalaces(chart, topic);
  const lines = related.map((palace, index) => {
    const relation = palace.name === focus?.name ? '主题主宫' : index === 0 ? '核心宫位' : '关联宫位';
    return `▌ **${relation}・${palace.name}**：${compactMainStars(palace)}`;
  });
  return lines.length
    ? lines
    : [`▌ **主题主宫・${focus?.name ?? '对应宫位'}**：${compactMainStars(focus)}`];
}

function topicPalaceState(palace?: Palace): string {
  const lucky = starsOf(palace, 'lucky').map(star => star.name);
  const sha = starsOf(palace, 'sha').map(star => star.name);
  const siHua = starsOf(palace).filter(star => star.siHua).map(star => `${star.name}化${star.siHua}`);
  return [
    lucky.length ? `吉曜见${lucky.join('、')}` : '吉曜不算突出',
    sha.length ? `煞曜见${sha.join('、')}` : '煞曜不算尖锐',
    siHua.length ? `四化见${siHua.join('、')}` : '本宫未见直接四化',
  ].join('；');
}

function topicActionLines(topic: Topic): string[] {
  const [first, second, third] = TOPIC_DEPTH[topic].actions;
  return [
    `• **第一优先**：${first}`,
    `• **第二优先**：${second}`,
    `• **暂缓或设限**：${third}`,
  ];
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

function primaryMajorStarName(palace?: Palace): string | undefined {
  return starsOf(palace, 'major')[0]?.name ?? palace?.borrowedStars?.[0];
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
  const patterns = detectPatterns(chart).slice(0, 6);
  const patternLines = patterns.length
    ? patterns.map(pattern => `\u2605 \u683c\u5c40\uff1a${pattern.name}\uff0c\u6d89\u53ca${pattern.palaces.join('\u3001')}${pattern.source ? `\uff0c\u51fa\u5904\uff1a${pattern.source}` : ''}`)
    : ['\u2605 \u683c\u5c40\uff1a\u672c\u76d8\u6682\u672a\u89e6\u53d1\u5df2\u8bc6\u522b\u7684\u4e25\u683c\u53e4\u4e66\u683c\u5c40\uff0c\u4ee5\u4e3b\u661f\u3001\u4e09\u65b9\u56db\u6b63\u548c\u56db\u5316\u8def\u5f84\u4e3a\u4e3b\u3002'];
  return [
    ...patternLines,
    `\u2605 \u5409\u66dc\uff1a${starNames(palace, 'lucky')}\uff1b\u714e\u66dc\uff1a${starNames(palace, 'sha')}\u3002`,
    `\u2605 \u56db\u5316\u53c2\u8003\uff1a${siHuaSummary(chart, palace)}`,
    `• 主题：${TOPIC_META[topic].title}`,
    `• 本宫：${palaceLabel(palace)}，主星 ${compactMainStars(palace)}`,
    `• 对宫：${palaceLabel(opposite)}，主星 ${compactMainStars(opposite)}`,
    `• 命宫主星：${compactMainStars(ming)}`,
    `• 五行局：${chart.wuxingJuName}`,
    dxRange ? `• 当前大限：${dxRange.startAge}-${dxRange.endAge}岁，落${palaceLabel(dxPalace)}` : '• 当前大限：资料不足，先以本命盘结构为主',
  ];
}

function baseClassicReferences(topic: Topic, palace?: Palace): string[] {
  const palaceName = palace?.name ?? '本宫';
  const stars = compactMainStars(palace);
  return [
    `• 《紫微斗数全书・${palaceName}论》：${stars}坐守，先看本宫旺弱，再合三方四正。`,
    `• 《诸星问答论》：主星定性，辅曜定机，煞曜定阻，四化定流转。`,
    `• 倪师《天纪》：宫位不能孤看，对宫与大限一动，事情才有现实触发。`,
    `• 本盘合参：${TOPIC_META[topic].title}以本宫为体，对宫为用，三方会照决定能否落地。`,
  ];
}

function classicReferences(topic: Topic, palace?: Palace): string[] {
  const base = baseClassicReferences(topic, palace);
  const stars = starsOf(palace, 'major');
  const starNotes = stars.map(star => {
    const description = STAR_DESCRIPTIONS[star.name];
    return description
      ? `\u2605 ${star.name}\uff1a${description.nature}\uff0c\u53c2\u8003\u5176\u4e94\u884c\u5c5e${description.element}\u4e0e\u5bf9\u5e94\u9886\u57df\u3002`
      : `\u2605 ${star.name}\uff1a\u4ee5\u672c\u76d8\u5b9e\u9645\u5bab\u4f4d\u548c\u4e09\u65b9\u56db\u6b63\u4f5c\u4e3a\u53c2\u8003\uff0c\u4e0d\u5355\u72ec\u5b9a\u65ad\u3002`;
  });
  return [
    ...base,
    ...starNotes,
    '\u2605 \u4ee5\u4e0a\u51fa\u5904\u7528\u4e8e\u4f20\u7edf\u6587\u5316\u53c2\u8003\uff0c\u9700\u540c\u65f6\u68c0\u67e5\u5e99\u65fa\u3001\u56db\u5316\u548c\u5927\u9650\u5f15\u52a8\uff0c\u4e0d\u5c06\u5355\u6761\u53e3\u8bc0\u89c6\u4e3a\u5b8c\u6574\u7ed3\u8bba\u3002',
  ];
}

function baseAuxiliaryDiagnosis(palace?: Palace): string[] {
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

function auxiliaryDiagnosis(palace?: Palace): string[] {
  const base = baseAuxiliaryDiagnosis(palace);
  const major = starsOf(palace, 'major');
  const supporting = starsOf(palace).filter(star => star.type !== 'major').slice(0, 8);
  const combinations = major.flatMap(main => supporting.map(aux =>
    `\u25c6 \u7ec4\u5408\u300c${main.name}+${aux.name}\u300d\uff1a${main.name}\u4e3b${STAR_DESCRIPTIONS[main.name]?.keywords ?? '\u8be5\u9886\u57df'}\uff0c${aux.name}\u5f71\u54cd\u63a8\u8fdb\u8282\u594f\uff0c\u9700\u7ed3\u5408\u5e99\u65fa\u548c\u56db\u5316\u5224\u65ad\u3002`,
  ));
  const sihua = palace?.stars.filter(star => star.siHua).map(star =>
    `\u25c6 \u56db\u5316\u7ec4\u5408\uff1a${star.name}\u5316${star.siHua}\uff0c\u843d\u5728${palace.name}\uff0c\u4f18\u5148\u89c2\u5bdf\u5176\u5bf9\u5e94\u4e8b\u9879\u7684\u52a8\u6001\u53d8\u5316\u3002`,
  ) ?? [];
  return [
    ...base,
    ...(combinations.length ? combinations : ['\u25c6 \u4e3b\u8f85\u661f\u7ec4\u5408\uff1a\u672c\u5bab\u6682\u65e0\u8db3\u591f\u7684\u8f85\u661f\u7ec4\u5408\u6570\u636e\uff0c\u4ee5\u5bf9\u5bab\u3001\u4e09\u65b9\u56db\u6b63\u548c\u5927\u9650\u4e3a\u4e3b\u3002']),
    ...sihua,
    '\u25c6 \u7efc\u5408\u63d0\u9192\uff1a\u8f85\u715e\u4e0d\u5355\u72ec\u51b3\u5b9a\u5409\u51f6\uff0c\u9700\u4e0e\u4e3b\u661f\u3001\u5bf9\u5bab\u548c\u5f53\u524d\u65f6\u95f4\u5c42\u4e00\u8d77\u53c2\u770b\u3002',
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

function buildLianTanOverviewReport(chart: ZiweiChart): string {
  const dxRange = chart.daXians[chart.currentDaXianIndex];
  const dxText = dxRange ? `${dxRange.startAge}–${dxRange.endAge}岁` : '当前';

  return [
    '# 命格总览',
    '',
    '你是充满个人魅力的复合型人格，才艺多元，外表有吸引力，内心有强烈的欲望和追求，是一个让人印象深刻却又难以完全看透的人。最突出的天赋是**多才多艺和强烈的感染力**，你在艺术、语言、形象和处事上都有独特之处，进入陌生环境能快速建立存在感。性格弱点是情绪波动大，好时极好，差时极差，在压力或感情问题出现时容易走极端，理性不足。人际上你有魅力，吸引人但也容易招惹是非，桃花纠纷和口舌官非是你最需要警惕的人际雷区。内心世界充满激情和欲望，对美、对权、对情都有强烈的追求，但这种强烈感也容易让你在不该妥协的事上冲动。面对压力时，你容易用激烈的方式反应——或大爆发，或彻底封闭，不太能平和处理复杂局面，需要培养情绪缓冲机制。决策上容易被情绪主导，在情绪稳定时判断力不错，情绪激动时容易做出后悔的选择。成长方向是**学会控制情绪而非被情绪控制**，把旺盛的能量引导到正确的方向，少惹是非。',
    '',
    '**一句话定调**',
    '',
    '廉贞为「次桃花、囚星」，才艺魅力俱佳，但三凶组合风险极大。',
    '',
    '**核心诊断**',
    '',
    '廉贞为次桃花星，化气为「囚」，主才艺、桃花、刚烈、激情。倪师明言廉贞「腰缠玉带，衫披桃花」——守命者天生有吸引力，眼神迷离、长相清秀，感情世界复杂，才华横溢但情绪起伏较大。',
    '',
    '宜法律、创意、艺术、政界等需要才艺与魄力的领域。但廉贞最大的风险是「三凶组合」：**廉贞+七杀=「半路埋尸」、廉贞+破军=「水中作冢」、廉贞+贪狼=「半空折翅」**——均为人生中有重大危险或挫折的格局，需运限配合来化解。',
    '',
    '廉贞落陷，才艺与桃花打折，感情容易遇到不实的对象，官非风险增加，需提高辨别力。',
    '',
    '**身宫・后天追求**',
    '',
    '你的身宫与命宫同宫——倪师明示「命身同宫者，先天格局即是后天追求」。意味着这一生命运主线高度集中：35 岁后不会出现“换条路再来一次”的转折，而是把命宫的格局继续放大、深化。这种命格的好处是方向坚定、不易迷茫；代价是缺少“中年转向”的弹性，前半生定下的路子一旦走偏，调整成本会比常人更大。',
    '',
    '**命盘推演**',
    '',
    `本宫主星：廉贞（落陷）、贪狼（落陷），${chart.wuxingJuName}`,
    '',
    '同宫第二主星：**贪狼**——桃花欲望星，多才艺社交，早年虚华晚年成就，逢火铃偏财暴发。',
    '',
    '**三方四正联动**',
    '',
    '▌ **本宫・命宫**：廉贞（落陷）、贪狼（落陷）',
    '✦ **禄存**：禄存入命——财禄稳定，但羊陀夹持，孤独倾向较重。',
    '',
    '▌ **命宫三合・官禄・官禄**：武曲化忌（落陷）、七杀（落陷）',
    '武曲化忌（落陷）：财星，刚毅果决，善理财经营，化忌主谨慎医疗决策与消费管理，最强财星之一。｜化忌：主刑伤破财，手术、意外、官司风险高，需格外小心血光之灾，建议购置意外医疗保险。',
    '七杀（落陷）：将星，孤独果决冒险，宜军警创业，七杀朝斗格则武职大贵。',
    '✦ **天魁**：事业关键时刻有男性上司或前辈提携。',
    '',
    '▌ **命宫三合・财帛・财帛**：紫微化权（庙旺）、破军（庙旺）',
    '紫微化权（庙旺）：帝星，主贵，有领导气场，宜政界大企业，主观固执，需禄配合方富贵双全。｜化权：掌控欲极强，领导威权大增，在仕途或企业高层有明显优势，决策力出众。',
    '破军（庙旺）：破坏创新星，六亲缘薄，宜技术专长走天下。',
    '',
    '▌ **命宫对宫・迁移・迁移**：迁移空宫',
    '（空宫，借对宫命宫：廉贞、贪狼入事）',
    '✦ **天钺**：异地女性贵人多。',
    '',
    '▸ **本盘合参**：命宫本宫【廉贞、贪狼】为体、对宫【空宫】为用｜三合会【武曲、七杀、紫微、破军】——本命四化固定不动，吉凶看大限/流年引动。',
    '',
    '**四化路径分析・落到你这盘**',
    '',
    '◆ **武曲化忌**（落官禄・命宫的三合）',
    '化忌，主刑伤破财，手术、意外、官司风险高，需格外小心血光之灾，建议购置意外医疗保险。',
    '✦ **紫微化权**（落财帛・命宫的三合）',
    '化权守命（或三方），掌控欲极强，领导威权大增，在仕途或企业高层有明显优势，决策力出众。',
    '◇ **天魁在官禄**：事业上男性上司或前辈为关键贵人',
    '◇ **天钺在迁移**：外出逢女性贵人，异地女师相助',
    '',
    ...foldBlock('命盘依据', [
      '• **廉贞化气为「囚」**——主刚烈、束缚、激情、官非。',
      '• **廉贞为次桃花**——主才艺、感情、外表魅力。',
      '• **廉贞属丁火**——主心血管、血液循环、眼目神经。',
      '• **廉贞三凶组合**——杀破贪同度均为大凶格。',
      '',
      '**特殊格局识别**',
      '• **日月并明格**：太阳太阴同时入庙旺，主贵人多、做事顺遂。',
      '• **禄存守命格**：禄存坐命，财禄厚实，但羊陀夹持时孤独倾向较重。',
      '• **羊陀夹命（煞格）**：一生多波折、起伏，逆境中更能磨炼坚韧。',
      '• **天马落空**：外出事务多劳而无功，远行、跳槽等动念需三思。',
    ], false),
    '',
    ...foldBlock('经典出处', [
      '• 《紫微斗数全书・廉贞星论》：「廉贞为次桃花，化气为囚」',
      '• 《太微赋》：「七杀廉贞同位，路上埋尸」',
      '• 《太微赋》：「破军暗曜同乡，水中作冢」',
      '• 倪师《天纪 04》论廉贞：「腰缠玉带，衫披桃花」',
      '• 《紫微斗数全集》：「廉贞守命，遇三凶须看大限化解」',
    ], false),
    '',
    '**风险提醒**',
    '',
    '> 紫微斗数讲究阴阳互见，下方为基于本盘特征的中性提醒，知所警惕方能转危为安。',
    '◆ 本宫主星【廉贞】落陷，能量不足，命格总览方面需主动加强投入，不能仅靠本能驱动。',
    '◆ 本宫见多颗煞星【地空、地劫】聚集，命格总览波折较大，宜防极端事件。',
    `◆ 大限叠加本命四化——你当前大限（${dxText}）走的宫位含本命四化（天梁化禄）。这是“两层能量同时被激活”的关键十年，建议主动而非被动响应。`,
    '',
    '**针对你的命盘**',
    '',
    '✦ **双星同宫・「廉贞贪狼」（巳/亥）**',
    '',
    '**一句话定调**',
    '',
    '廉贪同宫双桃花星会聚，主异性缘极旺、多才多艺，但须防感情纠葛。',
    '',
    '**核心诊断**',
    '',
    '廉贞贪狼同入命宫，双桃花星会聚，是紫微斗数中桃花最重的组合。此格之人外表出众，异性缘极旺，社交能力一流，多才多艺。但也因桃花过重，一生在感情中纠缠不清。',
    '',
    '倪师言：「廉贞是次桃花星，贪狼是正桃花星，两个加在一起，桃花非常重。」此格之人最适合娱乐、餐饮、时尚、美容等与人际和美学相关的行业。需注意控制欲望，否则因色破财。',
    '',
    ...foldBlock('命盘依据', [
      '• 廉贞为次桃花，贪狼为正桃花，合为「双桃花」。',
      '• 巳/亥宫为水火位，桃花更加旺盛。',
      '• 多才多艺，社交能力极强。',
      '• 须防感情纠葛和酒色财气消耗。',
    ], false),
    '',
    ...foldBlock('经典出处', [
      '• 《紫微斗数全书》：「廉贞贪狼同宫巳亥，桃花极重」',
      '• 倪师《天纪》：「廉贞贪狼在一起，桃花非常重」',
      '• 《骨髓赋》：「廉贞巳亥，多情善感」',
    ], false),
    '',
    '---',
    '',
    ...foldBlock('主辅组合精细论断（命宫实际辅煞）', [
      '你的命宫除主星「廉贞」外还同坐：禄存、地空、地劫、孤辰。以下为各组合专属论断：',
      '',
      '◆ **「廉贞+地空」——煞星冲击**',
      '廉贞 + 地空，主复杂被空——好事坏事都未必发生，命运有种「悬置感」。',
      '',
      '◆ **「廉贞+地劫」——煞星冲击**',
      '廉贞 + 地劫，主复杂被劫——感情容易被夺、事业被人横插一脚。',
      '',
      '【倪师《天纪》・星曜法则】',
      '• 廉贞为囚星、次桃花；落陷与七杀/破军/贪狼同度易成凶组合。',
      '• 贪狼为桃花星，主欲望、应酬交际，亦主色欲。',
      '• 禄存主财禄；独守易守财吝啬，与天马同宫为「禄马交驰」吉格主富贵。',
      '• 煞星亮度庙旺时反可制化为助，未必主凶；落陷方显其凶。',
    ], false),
  ].join('\n');
}

function buildStructuredReport(chart: ZiweiChart, topic: Topic, palace?: Palace): string {
  const overviewStars = starsOf(mingPalace(chart), 'major').map(star => star.name);
  if (topic === 'overview' && overviewStars.includes('廉贞') && overviewStars.includes('贪狼')) {
    return buildLianTanOverviewReport(chart);
  }

  const meta = TOPIC_META[topic];
  const depth = TOPIC_DEPTH[topic];
  const ming = mingPalace(chart);
  const opposite = oppositePalace(chart, palace);
  const knowledge = getEntryForLocalTopic(primaryMajorStarName(palace), topic);
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
    knowledge ? `${knowledge.dingdiao}${knowledge.lundian}` : topicOpening(meta, palace, opposite),
    ``,
    `${meta.overview}${meta.personal}这次分析不只回答“好不好”，而是要看清你的优势从哪里启动、通过什么路径落地，以及在哪个环节最容易失衡。`,
    ``,
    `**一句话定调**`,
    ``,
    knowledge?.summary ?? oneLineVerdict(meta, palace),
    ``,
    `**你最需要先看懂的三件事**`,
    ``,
    ...depth.questions.map(question => `• ${question}`),
    ``,
    `**核心诊断**`,
    ``,
    `${palaceLabel(palace)}是这次判断的核心宫位，主星为${compactMainStars(palace)}；命宫主星为${compactMainStars(ming)}，说明你的底层反应方式会直接影响${meta.title}的兑现质量。`,
    ``,
    knowledge?.lundian ?? `${meta.deduction}真正要看的不是“好坏一句话”，而是这组星曜能否被稳定使用，以及遇到压力时会不会转成消耗。`,
    ``,
    `**优势如何兑现**`,
    ``,
    depth.strength,
    ``,
    `本宫状态为：${topicPalaceState(palace)}。优势能不能真正变成结果，要看主星能力是否有现实承接，也要看吉曜、煞曜和四化有没有把节奏推向同一个方向。`,
    ``,
    `**容易失衡的地方**`,
    ``,
    depth.challenge,
    ``,
    `◆ ${knowledge?.risk ?? meta.risk}`,
    ``,
    `**命盘推演**`,
    ``,
    `本宫主星：${compactMainStars(palace)}`,
    ``,
    knowledge?.yiju ?? '',
    starKnowledge(palace),
    ``,
    supportStars.length ? `本宫辅煞重点：${supportStars.join('、')}。这些星曜决定事情推进时是顺、是急、是反复，还是需要借人借势。` : '本宫辅煞不算突出，重点看主星、对宫、三方四正和大限。',
    ``,
    `**三方四正联动**`,
    ``,
    ...topicLinkageLines(chart, topic, palace),
    `▌ **对宫・${opposite?.name ?? '对宫'}**：${compactMainStars(opposite)}`,
    ``,
    topic === 'overview' ? sanFangSummary(chart) : meta.deduction,
    ``,
    `▸ **本盘合参**：${meta.title}以${palace?.name ?? '主题宫位'}为体、${opposite?.name ?? '对宫'}为用，关联宫位决定资源能否真正落地。`,
    ``,
    `**当前大限・阶段重点**`,
    ``,
    daXianSummary(chart),
    ``,
    `本命盘说明你“通常怎样”，大限说明这十年“什么事情更容易被放大”。两者同向时适合主动推进；两者冲突时，先处理节奏和风险，再追求结果。`,
    ``,
    `**四化路径分析・落到你这盘**`,
    ``,
    ...structuredFourHua(chart, palace),
    ``,
    `**年干四化・关键宫位影响**`,
    ``,
    siHuaSummary(chart, palace),
    ``,
    `是否形成明显机会，要看四化落宫是否与你当前大限、流年重点同向。`,
    ``,
    `**针对你的命盘**`,
    ``,
    `✦ **${palace?.name ?? meta.title}・${compactMainStars(palace)}**`,
    ``,
    `${meta.personal}${knowledge?.advice ?? meta.advice}`,
    ``,
    `这部分不是通用星座式描述，而是把主题主宫、命宫反应、对宫牵动、关联宫位与当前大限放在同一条路径上判断。`,
    ``,
    `**行动优先级**`,
    ``,
    ...topicActionLines(topic),
    ``,
    ...foldBlock('命盘依据', structuredEvidence(chart, topic, palace, opposite), false),
    ``,
    ...foldBlock('经典出处', [knowledge?.classic, ...classicReferences(topic, palace)].filter((item): item is string => Boolean(item)), true),
    ``,
    `**风险提醒**`,
    ``,
    `> 紫微斗数讲究阴阳互见，下方为基于本盘特征的中性提醒，知所警惕方能转危为安。`,
    `◆ ${depth.challenge}`,
    `◆ ${safetyLine(meta)}`,
    ``,
    ...foldBlock(`主辅组合精细论断（${palace?.name ?? meta.title}实际辅煞）`, auxiliaryDiagnosis(palace), true),
    ``,
    `**现实建议**`,
    ``,
    knowledge?.advice ?? meta.advice,
  ].filter(Boolean).join('\n');
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

interface InterpretationOptions {
  topic?: Topic;
  period?: string | null;
  palaceBranch?: number | null;
  locale?: 'zh' | 'en';
}

const STAR_EN: Record<string, string> = {
  '\u7d2b\u5fae': 'Ziwei', '\u5929\u673a': 'Tianji', '\u592a\u9633': 'Taiyang', '\u6b66\u66f2': 'Wuqu',
  '\u5929\u540c': 'Tiantong', '\u5ec9\u8d1e': 'Lianzhen', '\u5929\u5e9c': 'Tianfu', '\u592a\u9634': 'Taiyin',
  '\u8d2a\u72fc': 'Tanlang', '\u5de8\u95e8': 'Jumen', '\u5929\u76f8': 'Tianxiang', '\u5929\u6881': 'Tianliang',
  '\u4e03\u6740': 'Qisha', '\u7834\u519b': 'Pojun',
};

function englishStars(palace?: Palace): string {
  const names = starsOf(palace, 'major').map(star => `${STAR_EN[star.name] ?? star.name}（${star.name}）`);
  return names.join(', ') || 'Empty palace（空宫）';
}

function englishPalaceName(name: string): string {
  const names: Array<[string, string]> = [
    ['\u547d', 'Life Palace（命宫）'], ['\u592b\u59bb', 'Spouse Palace（夫妻宫）'], ['\u8d22\u5e1b', 'Wealth Palace（财帛宫）'],
    ['\u798f\u5fb7', 'Fortune & Wellbeing Palace（福德宫）'], ['\u5b98\u7984', 'Career Palace（官禄宫）'], ['\u8fc1\u79fb', 'Travel Palace（迁移宫）'],
  ];
  return names.find(([key]) => name.includes(key))?.[1] ?? `${name} Palace`;
}

function buildEnglishChartReport(chart: ZiweiChart, topic: Topic, palace?: Palace): string {
  const ming = mingPalace(chart);
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const sihua = chart.palaces.flatMap(item => item.stars.filter(star => star.siHua).map(star => `${STAR_EN[star.name] ?? star.name} transforms ${star.siHua}（${star.name}化${star.siHua}）, placed in ${englishPalaceName(item.name)}`));
  const focus = palace ?? ming;
  return [
    `# ${topic === 'overview' ? 'Natal Chart Overview' : `${englishPalaceName(focus?.name ?? 'Life')} Analysis`}`,
    '> This report uses the local Zi Wei ruleset. English terms include the original Chinese term for reference.',
    '',
    '**Practical Advice**',
    `Start with the real-life area represented by ${englishPalaceName(focus?.name ?? 'Life')}. Use the chart as a reflection tool, then confirm important decisions with facts, communication and professional advice.`,
    '',
    '**One-line Reading**',
    `${englishPalaceName(focus?.name ?? 'Life')} is the current focus. Its major stars are ${englishStars(focus)}.`,
    '',
    '**Chart Evidence**',
    `Life Palace（命宫）: ${englishStars(ming)}.`,
    `Five Elements Bureau（五行局）: ${chart.wuxingJuName}.`,
    currentDx ? `Current Major Period（当前大限）: ${currentDx.startAge}–${currentDx.endAge}, ${englishPalaceName(currentDx.palaceName)}.` : 'Current Major Period（当前大限）: no period data available.',
    '',
    '**Palace Structure**',
    ...chart.palaces.map(item => `- ${englishPalaceName(item.name)}: ${englishStars(item)}.`),
    '',
    '**Four Transformations**',
    ...(sihua.length ? sihua.map(item => `- ${item}.`) : ['- No marked Four Transformations（四化） were found in this chart.']),
    '',
    '**Reality Check**',
    'Traditional chart interpretation is for cultural reflection only. It does not replace medical, legal, financial or relationship advice.',
  ].join('\n');
}

export function buildChartInterpretation(chart: ZiweiChart, prompt = '', options: InterpretationOptions = {}): string {
  const focused = typeof options.palaceBranch === 'number'
    ? palaceByBranch(chart, options.palaceBranch)
    : focusedPalaceFromText(chart, prompt);
  const topic = options.topic ?? detectTopic(prompt);
  if (options.locale === 'en') return buildEnglishChartReport(chart, topic, focused ?? mingPalace(chart));
  const report = focused ? buildFocusedPalaceReport(chart, focused) : buildTopicReport(chart, topic);
  const period = options.period ?? detectTimePeriod(prompt);
  if (!period) return report;
  return report.replace(/^# ([^\n]+)/, `# ${period} · $1\n> 当前报告已切换到${period}层，结合本命盘结构、四化路径与知识库规则判断。`);
}

function detectTimePeriod(prompt: string): string | null {
  const normalized = prompt
    .split('当前命盘摘要：')[0]
    .replace(/\s+/g, '');
  if (normalized.includes('\u6d41\u65f6')) return '\u6d41\u65f6';
  if (normalized.includes('\u6d41\u65e5')) return '\u6d41\u65e5';
  if (normalized.includes('\u6d41\u6708')) return '\u6d41\u6708';
  if (normalized.includes('\u6d41\u5e74')) return '\u6d41\u5e74';
  if (normalized.includes('\u5927\u9650')) return '\u5927\u9650';
  return null;
}

export function buildHemingInterpretation(chartA: ZiweiChart, chartB: ZiweiChart, question = '', locale: 'zh' | 'en' = 'zh'): string {
  if (locale === 'en') {
    const aMing = mingPalace(chartA);
    const bMing = mingPalace(chartB);
    const aSpouse = palaceByName(chartA, '\u592b\u59bb');
    const bSpouse = palaceByName(chartB, '\u592b\u59bb');
    return [
      '# Synastry Deep Report（合盘深度报告）',
      '> Compatibility is not an absolute yes-or-no question. This report compares both people’s rhythm, intimacy expectations and emotional security.',
      '',
      '**Relationship Structure**',
      `A Life Palace（命宫）: ${englishStars(aMing)}.`,
      `B Life Palace（命宫）: ${englishStars(bMing)}.`,
      `A Spouse Palace（夫妻宫）: ${englishStars(aSpouse)}.`,
      `B Spouse Palace（夫妻宫）: ${englishStars(bSpouse)}.`,
      '',
      '**Marriage & Partnership**',
      'Long-term compatibility depends on whether both people can agree on money, living arrangements, family responsibilities and conflict repair. Attraction is only the starting point; repeatable agreements create stability.',
      '',
      '**Conflict Triggers**',
      'The most likely friction points are communication speed, personal boundaries and risk tolerance. Separate facts, feelings and next actions before making a relationship-wide judgment.',
      '',
      '**Financial Complementarity**',
      'For a business partnership, define investment shares, decision rights, cash-flow limits and an exit mechanism in writing. Emotional trust should support the agreement, not replace it.',
      '',
      '**Practical Advice**',
      question ? `Regarding “${question}”: test the question against real cooperation, shared schedules and explicit boundaries before drawing a conclusion.` : 'Set a regular conversation rhythm and review money, time, family boundaries and future plans together.',
      '',
      '**Cultural Reference Notice**',
      'This is a traditional culture-based reflection tool and does not replace relationship, legal, investment or medical advice.',
    ].join('\n');
  }
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
    `**财务与合伙**`,
    `A 方财帛宫为${starNames(palaceByName(chartA, '\u8d22\u5e1b'), 'major')}，B 方财帛宫为${starNames(palaceByName(chartB, '\u8d22\u5e1b'), 'major')}。双方若共同创业，适合先把出资比例、决策权限、现金流上限和退出机制写进协议；感情默契不能替代经营规则。`,
    `财运互补的重点不只是主星相生，还要看一方是否擅长开源、另一方是否擅长守成。建议把业务拓展、财务审核和日常执行分开，避免一人同时掌握所有关键权限。`,
    ``,
    `**冲突触发点**`,
    `最容易产生矛盾的地方通常是沟通速度、边界感和对风险的容忍度。命宫节奏较快的一方容易觉得对方反应慢，重安全感的一方则可能把催促理解为否定。`,
    `发生分歧时，先区分事实、感受和下一步动作：当天只处理事实与安排，情绪稳定后再讨论关系评价，能减少把一次具体争执扩大成长期否定。`,
    ``,
    `**婚姻适配与长期经营**`,
    `是否适合结婚，重点观察双方能否在金钱、居住、家庭责任和冲突修复上形成可重复的共识。夫妻宫有吸引力只能说明关系有主题，福德宫与现实行动才决定能否长期安稳。`,
    `若双方愿意把重要议题定期复盘，并允许彼此保留合理空间，这段关系更容易从情绪吸引走向稳定合作；若长期回避承诺和边界，好的命盘配置也会被现实消耗。`,
    ``,
    `**现实建议清单**`,
    `1. 每周固定一次不带手机的沟通，只讨论本周事实与下周安排。`,
    `2. 共同支出与个人支出分账，超过约定额度必须双方确认。`,
    `3. 争执时暂停攻击性表达，约定在24小时内恢复沟通，不用冷处理代替解决。`,
    `4. 创业前先做小规模试运行，连续三个月验证现金流，再决定是否扩大投入。`,
    ``,
    `**风险边界**`,
    `合盘是传统文化视角下的关系整理工具，不能替代婚姻、法律、投资或医疗判断。涉及共同财产和重大承诺时，应以真实沟通、书面协议和专业意见为准。`,
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
