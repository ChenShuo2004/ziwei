'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Palace, ZiweiChart } from '@/lib/ziwei/types';
import { detectPatterns } from '@/lib/ziwei/patterns';
import { useLocale } from '@/components/LocaleProvider';
import type { TimeContext } from './TimeNav';
import styles from './InsightPanel.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean;
  title?: string;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  timeContext?: TimeContext | null;
  onExportReport?: () => void;
}

const TOPICS = [
  { key: 'overview', label: '命格总览' },
  { key: 'wealth', label: '财运' },
  { key: 'career', label: '事业' },
  { key: 'love', label: '感情' },
  { key: 'personality', label: '性格' },
  { key: 'health', label: '健康' },
  { key: 'siblings', label: '兄弟合伙' },
  { key: 'children', label: '子女' },
  { key: 'travel', label: '迁移外出' },
  { key: 'network', label: '人际贵人' },
  { key: 'property', label: '田宅' },
  { key: 'fortune', label: '福德' },
  { key: 'parents', label: '父母长辈' },
] as const;

const TOPIC_LABELS_EN: Record<string, string> = {
  overview: 'Overview', wealth: 'Wealth', career: 'Career', love: 'Relationships', personality: 'Personality',
  health: 'Health', siblings: 'Siblings & Partners', children: 'Children', travel: 'Travel', network: 'Network',
  property: 'Property', fortune: 'Wellbeing', parents: 'Parents',
};

type TopicKey = (typeof TOPICS)[number]['key'];
type PanelMode = 'analysis' | 'chat';

interface InterpretMeta {
  topic?: TopicKey;
  period?: string | null;
  palaceBranch?: number | null;
}

const TOPIC_PROMPTS: Record<TopicKey, string> = {
  overview: '请生成命格总览，包含命盘标签、主标题、命格总览、命盘推演、三方四正联动、风险提醒、针对你的命盘、现实建议。',
  wealth: '请分析财运，重点包含现金流、财富来源、财帛宫依据、田宅积累、破财风险和现实财务建议。',
  career: '请分析事业，重点包含官禄宫依据、适合方向、迁移外部机会、职业风险和未来一年行动建议。',
  love: '请分析感情与婚恋，重点包含夫妻宫依据、福德宫安全感、关系模式、冲突风险和现实相处建议。',
  personality: '请分析性格，重点包含命宫主星气质、三方四正触发方式、优势、盲区和成长建议。',
  health: '请分析健康倾向，避免确定性医疗判断，重点包含疾厄宫、压力模式、生活习惯和养生建议。',
  siblings: '请分析兄弟合伙，重点包含兄弟宫、合伙关系、资源互助、利益边界和合作建议。',
  children: '请分析子女与下属缘分，重点包含子女宫、教育沟通、下属管理和长期关系建议。',
  travel: '请分析迁移外出，重点包含迁移宫、异地发展、出行机会、外部贵人与风险。',
  network: '请分析人际贵人，重点包含交友宫、贵人类型、小人风险、社交策略和合作边界。',
  property: '请分析田宅，重点包含资产积累、居住环境、不动产倾向和家庭空间建议。',
  fortune: '请分析福德，重点包含精神状态、内在满足、压力释放、长期福气与生活方式建议。',
  parents: '请分析父母长辈，重点包含父母宫、长辈资源、文书学习、沟通模式和现实建议。',
};

const PALACE_ROLES: Record<string, string> = {
  命宫: '自我、性格、先天格局',
  兄弟宫: '兄弟关系、合伙人',
  夫妻宫: '感情关系、婚姻状态',
  子女宫: '子女缘分、下属关系',
  财帛宫: '财运来源、收入方式',
  疾厄宫: '身体健康、压力风险',
  迁移宫: '外出机会、异地发展',
  交友宫: '朋友圈、贵人与小人',
  官禄宫: '事业成就、社会位置',
  田宅宫: '不动产、家庭环境',
  福德宫: '精神享受、内在状态',
  父母宫: '父母关系、文书助力',
};

function topicForPalaceName(name: string): TopicKey | undefined {
  if (name.includes('兄弟')) return 'siblings';
  if (name.includes('子女')) return 'children';
  if (name.includes('夫妻')) return 'love';
  if (name.includes('财帛')) return 'wealth';
  if (name.includes('疾厄')) return 'health';
  if (name.includes('迁移')) return 'travel';
  if (name.includes('交友') || name.includes('仆役')) return 'network';
  if (name.includes('官禄')) return 'career';
  if (name.includes('田宅')) return 'property';
  if (name.includes('福德')) return 'fortune';
  if (name.includes('父母')) return 'parents';
  if (name.includes('命')) return 'overview';
  return undefined;
}

const RADAR_AXES = ['综合', '事业', '财运', '感情', '性格', '健康'] as const;

const CHAT_EXAMPLES = [
  '今年适合换工作吗？',
  '我的财运风险主要在哪里？',
  '感情关系里需要注意什么？',
  '接下来三个月适合做什么决定？',
];

function chartBrief(chart: ZiweiChart) {
  const ming = chart.palaces.find(palace => palace.branch === chart.mingGongBranch);
  const majorStars = ming?.stars.filter(star => star.type === 'major').map(star => star.name).join('、') || '空宫';
  const currentDx = chart.daXians[chart.currentDaXianIndex];

  return [
    `命宫主星：${majorStars}`,
    `五行局：${chart.wuxingJuName}`,
    currentDx ? `当前大限：${currentDx.startAge}-${currentDx.endAge}岁，落${currentDx.palaceName}` : '',
  ].filter(Boolean).join('；');
}

function fallbackAnswer(title: string, chart: ZiweiChart) {
  return `# ${title}
> 当前远程或本地解读暂时不可用，先给你一版基础命盘报告框架。

**命盘标签**
- ${chartBrief(chart)}
- 生成方式：本地兜底解读

**命格总览**
当前命盘已完成基础排盘，可以继续围绕十二宫、主星、四化和大限做分层解读。

**命盘推演**
先看命宫主星，再看财帛、官禄、迁移三方，最后把当前大限放进去判断阶段重点。

**现实建议**
先把最关心的问题缩小到一个具体场景，例如工作、感情、合伙、搬迁或资产安排，再继续追问会更准确。命理解读只作文化参考。`;
}

function palaceByName(chart: ZiweiChart, keyword: string) {
  return chart.palaces.find(palace => palace.name.includes(keyword));
}

function majorStars(palace?: Palace) {
  const names = palace?.stars.filter(star => star.type === 'major').map(star => star.name) ?? [];
  if (names.length) return names.join('、');
  if (palace?.borrowedStars?.length) return `空宫借${palace.borrowedStars.join('、')}`;
  return '空宫';
}

function scorePalace(palace?: Palace) {
  if (!palace) return 58;
  let score = 58;
  score += Math.min(palace.stars.filter(star => star.type === 'major').length, 2) * 10;
  score += palace.stars.filter(star => star.type === 'lucky').length * 4;
  score -= palace.stars.filter(star => star.type === 'sha').length * 5;
  score += palace.stars.filter(star => star.siHua === '禄' || star.siHua === '科').length * 6;
  score += palace.stars.filter(star => star.siHua === '权').length * 4;
  score -= palace.stars.filter(star => star.siHua === '忌').length * 8;
  if (palace.isEmpty) score -= 4;
  return Math.max(32, Math.min(92, score));
}

function useOverview(chart: ZiweiChart) {
  return useMemo(() => {
    const ming = chart.palaces.find(palace => palace.branch === chart.mingGongBranch);
    const career = palaceByName(chart, '官禄');
    const wealth = palaceByName(chart, '财帛');
    const love = palaceByName(chart, '夫妻');
    const health = palaceByName(chart, '疾厄');
    const fortune = palaceByName(chart, '福德');
    const currentDx = chart.daXians[chart.currentDaXianIndex];
    const siHuaCount = chart.palaces.reduce((count, palace) => count + palace.stars.filter(star => star.siHua).length, 0);
    const scores = [
      Math.round((scorePalace(ming) + scorePalace(career) + scorePalace(wealth)) / 3),
      scorePalace(career),
      scorePalace(wealth),
      scorePalace(love),
      scorePalace(ming),
      Math.round((scorePalace(health) + scorePalace(fortune)) / 2),
    ];

    return {
      ming,
      career,
      wealth,
      love,
      health,
      currentDx,
      siHuaCount,
      scores,
      cards: [
        {
          title: '核心优势',
          body: `${majorStars(ming)}坐命，先把稳定优势放到长期目标里，比追求短期判断更有价值。`,
        },
        {
          title: '关系模式',
          body: `夫妻宫见${majorStars(love)}，关系里最重要的是把期待、边界和现实安排说清楚。`,
        },
        {
          title: '成长课题',
          body: currentDx
            ? `当前${currentDx.startAge}-${currentDx.endAge}岁大限落${currentDx.palaceName}，适合把阶段重点收敛到可执行计划。`
            : '当前适合把阶段重点收敛到可执行计划。',
        },
      ],
    };
  }, [chart]);
}

function RadarChart({ scores }: { scores: number[] }) {
  const center = 90;
  const radius = 62;
  const points = scores.map((score, index) => {
    const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
    const value = Math.max(0.2, Math.min(1, score / 100));
    return `${center + Math.cos(angle) * radius * value},${center + Math.sin(angle) * radius * value}`;
  }).join(' ');

  const grid = [0.33, 0.66, 1].map(scale =>
    RADAR_AXES.map((_, index) => {
      const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
      return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
    }).join(' '),
  );

  return (
    <motion.svg
      className={styles.radarSvg}
      viewBox="0 0 180 180"
      role="img"
      aria-label="六维命盘参考图"
      initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
    >
      {grid.map(item => <polygon key={item} points={item} className={styles.radarGrid} />)}
      {RADAR_AXES.map((axis, index) => {
        const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
        const x = center + Math.cos(angle) * 78;
        const y = center + Math.sin(angle) * 78;
        return <text key={axis} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={styles.radarLabel}>{axis}</text>;
      })}
      <motion.polygon
        points={points}
        className={styles.radarArea}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.45 }}
      />
      <motion.polygon
        points={points}
        className={styles.radarLine}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.72, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

function OverviewPanel({ chart }: { chart: ZiweiChart }) {
  const overview = useOverview(chart);
  return (
    <section className={styles.overviewPanel}>
      <PatternPopover chart={chart} />
      <div className={styles.overviewFacts}>
        <span>命宫主星 · {majorStars(overview.ming)}</span>
        <span>{chart.wuxingJuName}</span>
        {overview.currentDx && (
          <span>大限 {overview.currentDx.startAge}-{overview.currentDx.endAge} · {overview.currentDx.palaceName}</span>
        )}
        <span>四化 {overview.siHuaCount} 项</span>
      </div>
      <div className={styles.overviewMain}>
        <RadarChart scores={overview.scores} />
        <div className={styles.overviewCards}>
          {overview.cards.map(card => (
            <article key={card.title}>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
      <p className={styles.overviewNote}>六维强度为本地规则粗略估算，仅作阅读参考。</p>
    </section>
  );
}

function PatternPopover({ chart }: { chart: ZiweiChart }) {
  const patterns = detectPatterns(chart).slice(0, 3);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!patterns.length) return null;

  return (
    <div ref={rootRef} className={styles.patternPopover}>
      <button
        type="button"
        className={styles.patternTrigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(value => !value)}
      >
        <span aria-hidden="true">✦</span> {patterns.length} 个古书格局 <span aria-hidden="true">›</span>
      </button>
      {open && (
        <div className={styles.patternMenu} role="dialog" aria-label="古书格局">
          {patterns.map((pattern, index) => (
            <article key={`${pattern.name}-${index}`} className={styles.patternCard}>
              <div className={styles.patternCardHeader}>
                <strong>{pattern.name}</strong>
                <div className={styles.patternBadges}>
                  {pattern.palaces.slice(0, 2).map(palace => (
                    <span key={palace}>{palace.replace(/宫/g, '')}</span>
                  ))}
                </div>
              </div>
              <p>{pattern.description}</p>
              <small>出处 · {pattern.source ?? '传统口径，待核'}</small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems;
    listItems = [];
    elements.push(
      <ul key={`list-${elements.length}`} className={styles.reportList}>
        {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </ul>,
    );
  };

  const renderFold = (title: string, bodyLines: string[], open: boolean) => {
    flushList();
    elements.push(
      <details key={`fold-${elements.length}`} className={styles.reportFold} open={open}>
        <summary>
          <span>{title}</span>
          <small>{open ? '收起' : '展开'}</small>
        </summary>
        <div className={styles.reportFoldBody}>
          <ReportContent text={bodyLines.join('\n')} />
        </div>
      </details>,
    );
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    const foldMatch = line.match(/^\[\[fold:(.+?)(?:\|(open|closed))?\]\]$/);
    if (foldMatch) {
      const bodyLines: string[] = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== '[[/fold]]') {
        bodyLines.push(lines[index]);
        index += 1;
      }
      renderFold(foldMatch[1], bodyLines, foldMatch[2] === 'open');
      continue;
    }

    if (line === '---') {
      flushList();
      elements.push(<hr key={index} className={styles.reportDivider} />);
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      listItems.push(line.replace(/^[-•]\s+/, ''));
      continue;
    }

    flushList();
    const titleMatch = line.match(/^#\s+(.+)$/);
    const quoteMatch = line.match(/^>\s+(.+)$/);
    const sectionMatch = line.match(/^\*\*(.+?)\*\*$/);

    if (titleMatch) {
      elements.push(<h2 key={index} className={styles.reportTitle}>{titleMatch[1]}</h2>);
    } else if (quoteMatch) {
      elements.push(<p key={index} className={styles.reportLead}>{quoteMatch[1]}</p>);
    } else if (sectionMatch) {
      elements.push(<h3 key={index} className={styles.reportSectionTitle}>{sectionMatch[1]}</h3>);
    } else if (/^[◆✦▌▸]/.test(line)) {
      elements.push(<p key={index} className={styles.reportMarkedLine}>{line}</p>);
    } else {
      elements.push(<p key={index} className={styles.reportParagraph}>{line}</p>);
    }
  }
  flushList();

  return (
    <div className={styles.reportContent}>
      {elements}
      {streaming && <span className="insight-stream-cursor" />}
    </div>
  );
}

function TopicIntro({ title }: { title: string }) {
  return (
    <div className="insight-topic-intro">
      <strong>{title}</strong>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <div className="max-w-[85%] rounded-xl px-3 py-2 text-[12px] bg-amber-50 text-amber-800 ring-1 ring-amber-200">
        {content}
      </div>
    </motion.div>
  );
}

function _ChatEmptyState({ onExampleClick }: { onExampleClick: (question: string) => void }) {
  return (
    <div className={styles.chatEmptyState}>
      <strong>直接问 AI</strong>
      <p>围绕当前命盘问一个具体问题，AI 会结合命盘摘要、宫位、四化和当前上下文回答。</p>
      <div className={styles.chatExamples}>
        {CHAT_EXAMPLES.map(question => (
          <button key={question} type="button" onClick={() => onExampleClick(question)}>
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

function _ChatMessageBubble({ message, streaming }: { message: Message; streaming?: boolean }) {
  if (message.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={styles.chatUserRow}>
        <div className={styles.chatUserBubble}>{message.content}</div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={styles.chatAssistantBubble}>
      <ReportContent text={message.content} streaming={streaming} />
    </motion.div>
  );
}

function AssistantMessage({
  chart,
  msg,
  streaming,
}: {
  chart: ZiweiChart;
  msg: Message;
  streaming: boolean;
}) {
  const isOverview = msg.title === '命格总览';

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.answerReport}>
      {isOverview && <OverviewPanel chart={chart} />}
      <ReportContent text={msg.content} streaming={streaming} />
    </motion.article>
  );
}

export default function InsightPanel({ chart, selectedPalace, timeContext, onExportReport }: InsightPanelProps) {
  const { locale } = useLocale();
  const [mode, setMode] = useState<PanelMode>('analysis');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [_chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTopic, setActiveTopic] = useState<TopicKey>('overview');
  const [activeTitle, setActiveTitle] = useState('命格总览');
  const messagesRef = useRef<Message[]>([]);
  const chatMessagesRef = useRef<Message[]>([]);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTimeContext = useRef<string>('');
  const lastReportLocale = useRef(locale);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { chatMessagesRef.current = chatMessages; }, [chatMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, chatMessages, mode]);

  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    sendMessage(TOPIC_PROMPTS.overview, { hidden: true, reset: true, title: '命格总览', topic: 'overview', period: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;
    const stars = selectedPalace.stars.filter(star => star.type === 'major').map(star => star.name).join('、') || '空宫';
    const role = PALACE_ROLES[selectedPalace.name] ?? '该宫位相关主题';
    const palaceTopic = topicForPalaceName(selectedPalace.name);
    if (palaceTopic) setActiveTopic(palaceTopic);
    setActiveTitle(selectedPalace.name);
    setMode('analysis');
    sendMessage(
      `请重点分析${selectedPalace.name}，主管${role}。该宫主星为${stars}。请按宫位定位、本宫主星、对宫与三方、风险提醒、现实建议输出。`,
      { hidden: true, reset: true, title: `${selectedPalace.name}解读`, topic: palaceTopic, period: null, palaceBranch: selectedPalace.branch },
    );
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!timeContext || timeContext.view === 'mingpan') return;
    const key = `${timeContext.view}:${timeContext.year}:${timeContext.month}:${timeContext.day}:${timeContext.hour}`;
    if (lastTimeContext.current === key) return;
    lastTimeContext.current = key;
    const labels = {
      daxian: '\u5927\u9650',
      liunian: '\u6d41\u5e74',
      liuyue: '\u6d41\u6708',
      liuri: '\u6d41\u65e5',
      liushi: '\u6d41\u65f6',
    } as const;
    const label = labels[timeContext.view];
    setMode('analysis');
    setActiveTitle(`${label}\u5206\u6790`);
    sendMessage(
      `\u8bf7\u5206\u6790${timeContext.year}\u5e74${timeContext.month}\u6708${timeContext.day}\u65e5\u5b50\u65f6\u7684${label}\u8fd0\u52bf\uff0c\u7ed3\u5408\u5f53\u524d\u547d\u76d8\u3001\u56db\u5316\u3001\u4e09\u65b9\u56db\u6b63\u548c\u77e5\u8bc6\u5e93\u8fdb\u884c\u5206\u6790\uff0c\u660e\u786e\u8fd9\u4e00\u65f6\u95f4\u5c42\u7684\u4e3b\u9898\u3001\u98ce\u9669\u548c\u73b0\u5b9e\u5efa\u8bae\u3002`,
      { hidden: true, reset: true, title: `${label}\u5206\u6790`, topic: activeTopic, period: label },
    );
  }, [timeContext]); // eslint-disable-line react-hooks/exhaustive-deps

  const streamResponse = async (
    apiMessages: { role: 'user' | 'assistant'; content: string }[],
    options: { title: string; requestId: number; signal: AbortSignal; meta?: InterpretMeta },
  ) => {
    let assistantText = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', title: options.title }]);

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, messages: apiMessages, locale, ...options.meta }),
        signal: options.signal,
      });
      if (!res.ok || !res.body) throw new Error('AI request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta?.text ?? parsed.delta ?? '';
            assistantText += delta;
            setMessages(prev => {
              if (options.requestId !== requestIdRef.current) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText, title: options.title };
              return updated;
            });
          } catch {
            // Ignore malformed stream chunks.
          }
        }
      }
    } catch {
      if (options.signal.aborted || options.requestId !== requestIdRef.current) return;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: fallbackAnswer(options.title, chart),
          title: options.title,
        };
        return updated;
      });
    } finally {
      if (options.requestId === requestIdRef.current) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  };

  const sendMessage = (
    text: string,
    options: { hidden?: boolean; reset?: boolean; title?: string } & InterpretMeta = {},
  ) => {
    if (!text.trim()) return;

    abortRef.current?.abort();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const prompt = `${text}\n\n当前命盘摘要：${chartBrief(chart)}\n请用中文、分层报告结构、避免绝对化断言，开头直接进入标题、摘要和报告正文。`;
    const userMsg: Message = { role: 'user', content: prompt, hidden: options.hidden };
    const sourceMessages = options.reset ? [userMsg] : [...messagesRef.current, userMsg];
    const apiMessages = sourceMessages.map(message => ({ role: message.role, content: message.content }));

    setMessages(prev => options.reset ? [userMsg] : [...prev, userMsg]);
    streamResponse(apiMessages, {
      title: options.title ?? '追问解读',
      requestId,
      signal: controller.signal,
      meta: {
        topic: options.topic,
        period: options.period,
        palaceBranch: options.palaceBranch,
      },
    });
  };

  useEffect(() => {
    if (!autoLoaded.current || lastReportLocale.current === locale) return;
    lastReportLocale.current = locale;
    sendMessage(TOPIC_PROMPTS[activeTopic], {
      hidden: true,
      reset: true,
      title: activeTitle,
      topic: activeTopic,
      period: null,
    });
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const _sendChatMessage = (question: string) => {
    const text = question.trim();
    if (!text) return;

    abortRef.current?.abort();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setMode('chat');
    setChatInput('');

    const prompt = `${text}\n\n当前命盘摘要：${chartBrief(chart)}\n请用中文直接回答用户问题，结合当前命盘、宫位、四化和大限信息。回答要像对话，不要写成完整报告；先给结论，再给2-4条理由和现实建议，避免绝对化判断。`;
    const visibleUserMsg: Message = { role: 'user', content: text };
    const apiUserMsg: Message = { role: 'user', content: prompt };
    const sourceMessages = [...chatMessagesRef.current, apiUserMsg];
    const apiMessages = sourceMessages.map(message => ({ role: message.role, content: message.content }));

    setChatMessages(prev => [...prev, visibleUserMsg, { role: 'assistant', content: '', title: 'AI 对话' }]);

    void (async () => {
      let assistantText = '';

      try {
        const res = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chart, messages: apiMessages }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error('AI chat request failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.delta?.text ?? parsed.delta ?? '';
              assistantText += delta;
              setChatMessages(prev => {
                if (requestId !== requestIdRef.current) return prev;
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText, title: 'AI 对话' };
                return updated;
              });
            } catch {
              // Ignore malformed stream chunks.
            }
          }
        }
      } catch {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: '这次 AI 暂时没有连上。我先建议你把问题缩小到一个具体场景，例如工作、感情、财务或未来三个月，再重新问一次。',
            title: 'AI 对话',
          };
          return updated;
        });
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    })();
  };

  const handleTopicClick = (topicKey: TopicKey) => {
    const topic = TOPICS.find(item => item.key === topicKey) ?? TOPICS[0];
    setMode('analysis');
    setActiveTopic(topicKey);
    setActiveTitle(topic.label);
    sendMessage(TOPIC_PROMPTS[topicKey], {
      hidden: true,
      reset: true,
      title: topic.label,
      topic: topicKey,
      period: null,
    });
  };

  const handleCopy = async () => {
    const answer = [...messages].reverse().find(message => message.role === 'assistant' && message.content.trim());
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden card-glass">
      <div className="insight-mode-bar">
        <button type="button" className={mode === 'analysis' ? 'is-active' : ''} onClick={() => setMode('analysis')}>
          命盘分析
        </button>
        <button
          type="button"
          className="insight-report-button insight-icon-button"
          onClick={onExportReport}
          aria-label="导出全盘报告 PDF"
          title="导出全盘报告 PDF"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" />
          </svg>
        </button>
      </div>

      <div className="insight-topic-bar">
          <div className="insight-topic-grid is-pro-grid">
            {TOPICS.map(topic => {
              const isActive = activeTopic === topic.key;
              return (
                <button
                  key={topic.key}
                  onClick={() => handleTopicClick(topic.key)}
                  className={isActive ? 'is-active' : ''}
                  aria-pressed={isActive}
                  type="button"
                >
                  {locale === 'en' ? TOPIC_LABELS_EN[topic.key] : topic.label}
                  {loading && isActive && <i aria-hidden="true" />}
                </button>
              );
            })}
          </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 insight-scroll" aria-live="polite" aria-busy={loading}>
        <>
            <div className="insight-intro-row">
              <TopicIntro title={activeTitle} />
              <button
                type="button"
                className="insight-copy-button"
                onClick={handleCopy}
                disabled={loading || !messages.some(message => message.role === 'assistant' && message.content.trim())}
              >
                {copied ? '已复制' : '复制解读'}
              </button>
            </div>

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3 text-amber-500/20">✦</div>
                <p className="text-[12px] animate-pulse text-slate-500">命格解读生成中...</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                if (msg.role === 'user' && msg.hidden) return null;
                if (msg.role === 'user') return <UserMessage key={index} content={msg.content} />;
                const isLast = index === messages.length - 1;
                return <AssistantMessage key={index} chart={chart} msg={msg} streaming={loading && isLast} />;
              })}
            </AnimatePresence>
        </>
      </div>

    </div>
  );
}
