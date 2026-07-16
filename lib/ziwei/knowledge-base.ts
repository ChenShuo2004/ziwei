export type StarName =
  | '紫微' | '天机' | '太阳' | '武曲' | '天同' | '廉贞' | '天府'
  | '太阴' | '贪狼' | '巨门' | '天相' | '天梁' | '七杀' | '破军';

export type KnowledgeTopicKey =
  | 'overview' | 'personality' | 'love' | 'career' | 'wealth' | 'health'
  | 'family' | 'children' | 'move' | 'friends' | 'home' | 'spirit' | 'parents';

export type LocalAnalysisTopic =
  | 'overview' | 'wealth' | 'career' | 'love' | 'personality' | 'health'
  | 'siblings' | 'children' | 'travel' | 'network' | 'property' | 'fortune' | 'parents';

export interface KnowledgeSection {
  title: string;
  body: string;
}

export interface StarKnowledgeEntry {
  star: StarName;
  topic: KnowledgeTopicKey;
  topicLabel: string;
  palaceName: string;
  title: string;
  summary: string;
  dingdiao: string;
  lundian: string;
  yiju: string;
  advice: string;
  risk: string;
  classic: string;
  sections: KnowledgeSection[];
}

interface StarProfile {
  nature: string;
  keywords: string;
  strength: string;
  shadow: string;
  bestUse: string;
  classicHint: string;
}

interface TopicProfile {
  key: KnowledgeTopicKey;
  label: string;
  palaceName: string;
  focus: string;
  evidence: string;
  advice: string;
  risk: string;
  safety?: string;
}

export const KNOWLEDGE_TOPIC_MAP: Record<KnowledgeTopicKey, { label: string; palaceName: string }> = {
  overview: { label: '命格总览', palaceName: '命宫' },
  personality: { label: '性格特质', palaceName: '命宫' },
  love: { label: '感情婚姻', palaceName: '夫妻' },
  career: { label: '事业职业', palaceName: '官禄' },
  wealth: { label: '财富运势', palaceName: '财帛' },
  health: { label: '健康状态', palaceName: '疾厄' },
  family: { label: '兄弟合伙', palaceName: '兄弟' },
  children: { label: '子女缘分', palaceName: '子女' },
  move: { label: '迁移外出', palaceName: '迁移' },
  friends: { label: '人际贵人', palaceName: '仆役' },
  home: { label: '田宅不动产', palaceName: '田宅' },
  spirit: { label: '精神福德', palaceName: '福德' },
  parents: { label: '父母长辈', palaceName: '父母' },
};

export const KNOWLEDGE_TOPICS = Object.entries(KNOWLEDGE_TOPIC_MAP).map(([key, value]) => ({
  key: key as KnowledgeTopicKey,
  ...value,
}));

export const LOCAL_TO_KNOWLEDGE_TOPIC: Record<LocalAnalysisTopic, KnowledgeTopicKey> = {
  overview: 'overview',
  wealth: 'wealth',
  career: 'career',
  love: 'love',
  personality: 'personality',
  health: 'health',
  siblings: 'family',
  children: 'children',
  travel: 'move',
  network: 'friends',
  property: 'home',
  fortune: 'spirit',
  parents: 'parents',
};

export const KNOWLEDGE_STARS: StarName[] = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府',
  '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
];

const STAR_PROFILES: Record<StarName, StarProfile> = {
  紫微: {
    nature: '主领导、统筹、尊严与高标准',
    keywords: '领导力、秩序感、责任位置',
    strength: '能把分散资源组织起来，适合站到核心位置做判断',
    shadow: '容易自尊心强、期待过高，或在没有支持时变成孤军奋战',
    bestUse: '用制度、节奏和可信赖的团队放大优势',
    classicHint: '紫微为帝座，喜百官朝拱，忌孤君无辅。',
  },
  天机: {
    nature: '主思考、变化、策略与学习',
    keywords: '机变、策划、学习力',
    strength: '擅长拆解复杂问题，能在变化中找到新路径',
    shadow: '容易想太多、改太快，导致行动不够稳定',
    bestUse: '把灵感沉淀成流程，减少反复摇摆',
    classicHint: '天机为善变之星，宜谋划，忌过度游移。',
  },
  太阳: {
    nature: '主外放、照耀、名声与担当',
    keywords: '公开表达、责任、影响力',
    strength: '适合承担公共角色，用透明和热情带动他人',
    shadow: '容易过度消耗、好面子，或把照顾别人放在自己前面',
    bestUse: '把热心变成可持续的边界和节奏',
    classicHint: '太阳喜庙旺，主贵显与光明，落陷则先看消耗。',
  },
  武曲: {
    nature: '主财务、执行、规则与结果',
    keywords: '财星、纪律、决断',
    strength: '适合处理钱、资源、制度和高压执行',
    shadow: '容易太硬、太急，忽略人的感受和弹性',
    bestUse: '用数字和规则做底盘，再补足沟通温度',
    classicHint: '武曲为财星，刚毅果决，喜见禄权科辅。',
  },
  天同: {
    nature: '主福气、舒适、协调与情绪修复',
    keywords: '温和、享受、恢复力',
    strength: '能缓和关系和压力，适合做长期稳定的陪伴与服务',
    shadow: '容易逃避压力、依赖舒适区，行动爆发力不足',
    bestUse: '把温和变成稳定输出，而不是拖延理由',
    classicHint: '天同为福星，喜吉曜扶持，忌安逸过度。',
  },
  廉贞: {
    nature: '主边界、审美、情感张力与规则意识',
    keywords: '原则、桃花、辨识力',
    strength: '能在复杂关系里看清边界，适合处理规则和人性议题',
    shadow: '容易情绪拉扯、爱恨分明，或在关系里反复试探',
    bestUse: '把敏锐和原则转化为清晰协议',
    classicHint: '廉贞带桃花与囚象，吉则清明有才，煞重则多纠结。',
  },
  天府: {
    nature: '主稳定、仓储、管理与资源承接',
    keywords: '财库、稳重、承载',
    strength: '擅长守成、配置资源，让事情慢慢积累成资产',
    shadow: '容易保守、反应慢，或过度依赖既有安全感',
    bestUse: '用稳健底盘承接长期机会',
    classicHint: '天府为南斗主星，重守成与财库，喜稳定格局。',
  },
  太阴: {
    nature: '主细腻、积累、财产与内在感受',
    keywords: '审美、储蓄、情绪感知',
    strength: '擅长细节、长期积累和照顾隐性需求',
    shadow: '容易敏感、多虑，或把安全感寄托在外部确认',
    bestUse: '把细腻变成资产管理、内容沉淀和稳定关系',
    classicHint: '太阴主富与田宅，喜庙旺明净，落陷则重安全感。',
  },
  贪狼: {
    nature: '主欲望、社交、才艺与增长机会',
    keywords: '桃花、资源、人脉',
    strength: '能打开局面，适合增长、销售、娱乐、社群和跨界',
    shadow: '容易贪多、分心，或被短期刺激牵着走',
    bestUse: '用目标和边界管理欲望，把机会筛成资产',
    classicHint: '贪狼为桃花欲望星，遇火铃有爆发，亦忌失控。',
  },
  巨门: {
    nature: '主表达、辨析、争议与信息差',
    keywords: '口才、判断、暗处问题',
    strength: '适合研究、咨询、谈判、传播和问题诊断',
    shadow: '容易口舌是非、质疑过度，或把沟通变成消耗',
    bestUse: '把批判力转成清晰表达和专业证据',
    classicHint: '巨门为暗曜，善辩明理，忌化忌与无谓争执。',
  },
  天相: {
    nature: '主辅佐、协作、制度与公平',
    keywords: '印星、协调、支持',
    strength: '擅长做可靠的中枢，维护秩序和团队协同',
    shadow: '容易过度配合、怕冲突，或把责任揽太多',
    bestUse: '用原则和边界做协作，而不是单纯迎合',
    classicHint: '天相为印星，重辅佐与公正，喜府相成格。',
  },
  天梁: {
    nature: '主保护、经验、规则与长辈缘',
    keywords: '荫星、责任、专业守护',
    strength: '适合做顾问、教育、医疗、法务、公益和风控',
    shadow: '容易说教、保守，或把责任感变成压力',
    bestUse: '把经验转化为方法论，少用道理压人',
    classicHint: '天梁为荫星，能解厄护身，喜清贵与专业。',
  },
  七杀: {
    nature: '主突破、竞争、决断与孤勇',
    keywords: '将星、开创、压力',
    strength: '适合在高压、竞争、转型环境里快速破局',
    shadow: '容易孤立、急进，或把所有事都当战场',
    bestUse: '用纪律和复盘承接开创力',
    classicHint: '七杀为将星，喜制化得宜，忌煞重无制。',
  },
  破军: {
    nature: '主破旧立新、重组、冒险与变化',
    keywords: '变革、重启、消耗',
    strength: '适合处理旧系统升级、创新、转型和从零到一',
    shadow: '容易不耐守成、先破后立成本高，关系与资源波动大',
    bestUse: '每次改变前先算成本、节奏和退路',
    classicHint: '破军主破耗与开创，吉则破旧立新，凶则反复消耗。',
  },
};

const TOPIC_PROFILES: Record<KnowledgeTopicKey, TopicProfile> = {
  overview: {
    key: 'overview',
    label: '命格总览',
    palaceName: '命宫',
    focus: '底层气质、人生主轴与做事方式',
    evidence: '先看命宫主星，再看三方四正的财帛、官禄、迁移，最后叠加四化与大限阶段。',
    advice: '先把优势变成可重复的行动系统，再选择能长期复利的事业、关系和资产结构。',
    risk: '不要用单颗星给自己贴死标签，命盘要看组合、阶段和现实选择。',
  },
  personality: {
    key: 'personality',
    label: '性格特质',
    palaceName: '命宫',
    focus: '第一反应、决策习惯、优势与盲区',
    evidence: '命宫看自我表达，福德宫看内在恢复，迁移宫看外部环境中的呈现。',
    advice: '把优势写成可执行的工作方法，把盲区写成检查清单。',
    risk: '性格不是借口，真正有价值的是知道自己在什么场景会失衡。',
  },
  love: {
    key: 'love',
    label: '感情婚姻',
    palaceName: '夫妻',
    focus: '亲密关系中的期待、边界、安全感与长期协作',
    evidence: '夫妻宫看关系模式，福德宫看深层安全感，命宫看自我表达方式。',
    advice: '少猜测，多把金钱观、生活节奏、边界和长期目标讲清楚。',
    risk: '感情内容只作文化参考，不能替代真实沟通、心理咨询或法律建议。',
    safety: '婚恋判断避免绝对化，现实中的沟通、尊重和责任永远优先于命理标签。',
  },
  career: {
    key: 'career',
    label: '事业职业',
    palaceName: '官禄',
    focus: '职业路径、社会角色、长期产出方式',
    evidence: '官禄宫看职业舞台，命宫看能力底色，迁移宫看外部机会，财帛宫看收入承接。',
    advice: '选择能放大个人优势的赛道，并用作品、案例、客户或可量化成果沉淀信用。',
    risk: '不要因短期机会频繁切换主线，事业最怕优势无法积累。',
  },
  wealth: {
    key: 'wealth',
    label: '财富运势',
    palaceName: '财帛',
    focus: '收入结构、现金流、资产沉淀与风险控制',
    evidence: '财帛宫看赚钱方式，田宅宫看沉淀能力，官禄宫看收入来源是否稳定。',
    advice: '先建立现金流表和风险隔离，再考虑副业、扩张或投资。',
    risk: '财务内容只作文化参考，不构成投资建议；重大决策必须回到现实数据。',
    safety: '涉及投资、借贷、房产或合伙资金时，以专业财务和法律意见为准。',
  },
  health: {
    key: 'health',
    label: '健康状态',
    palaceName: '疾厄',
    focus: '压力模式、体力节奏、生活习惯与恢复力',
    evidence: '疾厄宫看压力反应，福德宫看精神恢复，大限宫位看阶段性压力来源。',
    advice: '把睡眠、饮食、运动、体检和情绪恢复当成基础工程。',
    risk: '健康内容不是医疗判断；有症状先看医生，不要用命理解读替代诊断。',
    safety: '本内容不提供诊断、治疗或用药建议。',
  },
  family: {
    key: 'family',
    label: '兄弟合伙',
    palaceName: '兄弟',
    focus: '同辈关系、合作分工、资源互助与利益边界',
    evidence: '兄弟宫看同辈协作，仆役宫看外部伙伴，财帛宫看利益分配。',
    advice: '所有合作先写清角色、投入、收益、决策权和退出机制。',
    risk: '不要只因人情或信任进入合作，后期最容易卡在钱、权、责。',
  },
  children: {
    key: 'children',
    label: '子女缘分',
    palaceName: '子女',
    focus: '子女、下属、作品、长期培养出来的人和事',
    evidence: '子女宫看培养关系，官禄宫看管理方式，福德宫看耐心和情绪承接。',
    advice: '把要求拆成清晰规则，给对方成长空间，也保留必要边界。',
    risk: '过度控制会让关系变成压力，培养类事务需要时间而不是急推结果。',
  },
  move: {
    key: 'move',
    label: '迁移外出',
    palaceName: '迁移',
    focus: '外部机会、异地发展、出行变化与平台资源',
    evidence: '迁移宫看外缘和平台，命宫看承接力，官禄宫看机会能否转成事业结果。',
    advice: '外出、搬迁、换城市或拓展市场前，先确认资源、成本和回撤方案。',
    risk: '外部机会多不等于都要抓，缺少筛选标准会变成奔波消耗。',
  },
  friends: {
    key: 'friends',
    label: '人际贵人',
    palaceName: '仆役',
    focus: '朋友、圈层、贵人、小人与协作网络',
    evidence: '仆役宫看圈层质量，迁移宫看外部连接，福德宫看关系是否消耗精神能量。',
    advice: '区分朋友、客户、合伙人和贵人，不同关系用不同边界管理。',
    risk: '热闹关系未必高价值，低质量社交会消耗判断力和时间。',
  },
  home: {
    key: 'home',
    label: '田宅不动产',
    palaceName: '田宅',
    focus: '居住环境、资产沉淀、家庭空间与长期安全感',
    evidence: '田宅宫看资产和空间，财帛宫看现金流，福德宫看空间带来的精神稳定。',
    advice: '处理房产、租住、装修和家庭资产时，先算现金流，再谈理想方案。',
    risk: '不动产内容只作文化参考，不构成购房、投资或法律建议。',
    safety: '重大资产安排应结合合同、税务、贷款和家庭真实现金流。',
  },
  spirit: {
    key: 'spirit',
    label: '精神福德',
    palaceName: '福德',
    focus: '内在满足、精神恢复、压力释放与长期幸福感',
    evidence: '福德宫看精神底盘，命宫看驱动力，疾厄宫看压力如何反映到身体。',
    advice: '给休息、兴趣、独处和稳定关系留位置，不要把所有价值都押在结果上。',
    risk: '外在能撑不代表内在不累，长期透支会影响关系和决策质量。',
  },
  parents: {
    key: 'parents',
    label: '父母长辈',
    palaceName: '父母',
    focus: '父母、长辈、上级、文书、制度与权威资源',
    evidence: '父母宫看长辈和制度，官禄宫看职场权威，命宫看自我选择权。',
    advice: '与长辈、上级或制度打交道时，保持尊重，但把责任和边界说清。',
    risk: '容易把权威期待和个人选择混在一起，需要分清建议、要求和自己的决定。',
  },
};

function buildEntry(star: StarName, topic: KnowledgeTopicKey): StarKnowledgeEntry {
  const starProfile = STAR_PROFILES[star];
  const topicProfile = TOPIC_PROFILES[topic];
  const topicLabel = topicProfile.label;
  const title = `${star} · ${topicLabel}`;
  const summary = `${star}落在${topicLabel}主题里，核心是把「${starProfile.keywords}」用在${topicProfile.focus}上。`;
  const dingdiao = `${star}的底色是${starProfile.nature}。看${topicLabel}时，不是简单判断好坏，而是看它能否把${starProfile.strength}落实到现实选择里。`;
  const lundian = `${star}在这个主题上的优势，是${starProfile.bestUse}；需要留意的是${starProfile.shadow}。如果本宫再会吉曜、禄权科，通常更容易形成稳定成果；若煞忌过重，则要先处理节奏、边界和风险。`;
  const yiju = `${topicProfile.evidence}本宫主星提供底色，对宫提供外部牵动，三方四正决定资源能不能落地，四化与大限则提示什么时候被放大。`;
  const advice = `${topicProfile.advice}对${star}来说，最重要的是把「${starProfile.keywords}」变成可检查的行动，而不是停留在性格描述。`;
  const risk = `${topicProfile.risk}${topicProfile.safety ? ` ${topicProfile.safety}` : ''}`;
  const classic = `${starProfile.classicHint} ${topicLabel}仍需合参本宫、对宫、三方四正与大限，不宜孤看单星。`;

  return {
    star,
    topic,
    topicLabel,
    palaceName: topicProfile.palaceName,
    title,
    summary,
    dingdiao,
    lundian,
    yiju,
    advice,
    risk,
    classic,
    sections: [
      { title: '一句话定调', body: dingdiao },
      { title: '核心论断', body: lundian },
      { title: '命盘依据', body: yiju },
      { title: '现实建议', body: advice },
      { title: '风险提醒', body: risk },
      { title: '经典参考', body: classic },
    ],
  };
}

export const STAR_KNOWLEDGE_DB: Record<StarName, Record<KnowledgeTopicKey, StarKnowledgeEntry>> =
  Object.fromEntries(
    KNOWLEDGE_STARS.map(star => [
      star,
      Object.fromEntries(
        KNOWLEDGE_TOPICS.map(topic => [topic.key, buildEntry(star, topic.key)]),
      ) as Record<KnowledgeTopicKey, StarKnowledgeEntry>,
    ]),
  ) as Record<StarName, Record<KnowledgeTopicKey, StarKnowledgeEntry>>;

export function getKnowledgeEntry(star: string, topic: KnowledgeTopicKey): StarKnowledgeEntry | null {
  if (!isStarName(star)) return null;
  return STAR_KNOWLEDGE_DB[star][topic] ?? null;
}

export function getEntryForLocalTopic(star: string | undefined, topic: LocalAnalysisTopic): StarKnowledgeEntry | null {
  if (!star) return null;
  return getKnowledgeEntry(star, LOCAL_TO_KNOWLEDGE_TOPIC[topic]);
}

export function renderKnowledgeEntry(entry: StarKnowledgeEntry): string {
  return entry.sections.map(section => `**【${section.title}】**\n${section.body}`).join('\n\n');
}

export function isStarName(value: string): value is StarName {
  return KNOWLEDGE_STARS.includes(value as StarName);
}
