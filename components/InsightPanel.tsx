'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Palace, ZiweiChart } from '@/lib/ziwei/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean;
  title?: string;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
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

type TopicKey = (typeof TOPICS)[number]['key'];
type PanelMode = 'analysis' | 'chat';

const TOPIC_PROMPTS: Record<TopicKey, string> = {
  overview: '请生成命格总览，包含一句话结论、命盘依据、核心优势、潜在风险、现实建议、未来一年重点。',
  wealth: '请分析财运，包含财富来源、赚钱优势、破财风险、理财建议、未来一年财务重点。',
  career: '请分析事业，包含适合方向、官禄宫依据、合作模式、职业风险、未来一年行动建议。',
  love: '请分析感情与婚恋，包含关系模式、夫妻宫依据、吸引点、冲突点、现实相处建议。',
  personality: '请分析性格，包含命宫主星气质、优势、盲区、人际表达方式、成长建议。',
  health: '请分析健康倾向，避免确定性医疗判断，包含需要关注的生活习惯、压力模式和养生建议。',
  siblings: '请分析兄弟合伙，包含兄弟宫、合伙关系、资源互助、利益边界和合作建议。',
  children: '请分析子女与下属缘分，包含子女宫、教育沟通、下属管理和长期关系建议。',
  travel: '请分析迁移外出，包含迁移宫、异地发展、出行机会、外部贵人与风险。',
  network: '请分析人际贵人，包含交友宫、贵人类型、小人风险、社交策略和合作边界。',
  property: '请分析田宅，包含资产积累、居住环境、不动产倾向和家庭空间建议。',
  fortune: '请分析福德，包含精神状态、内在满足、压力释放、长期福气与生活方式建议。',
  parents: '请分析父母长辈，包含父母宫、长辈资源、文书学习、沟通模式和现实建议。',
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
  const brief = chartBrief(chart);
  return `**一句话结论**
${title}需要结合本盘的命宫主星、大限位置和三方四正一起判断。${brief}

**命盘依据**
当前命盘已完成基础排盘，可以继续围绕十二宫、主星、四化和大限做分层解读。

**核心优势**
你的盘面适合先抓住最强的主星优势，再把优势落到现实行动里，不宜只停留在抽象判断。

**潜在风险**
命理解读只能作为文化参考，不能替代医疗、法律、投资或人生重大决策。

**现实建议**
先把最关心的问题缩小到一个具体场景，例如工作、感情、合伙、搬迁或资产安排，再继续追问会更准确。`;
}

function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } = { title: '核心解读', lines: [] };

  text.split('\n').forEach(line => {
    const sectionMatch = line.trim().match(/^\*\*(.+?)\*\*$/);
    if (sectionMatch) {
      if (current.lines.some(item => item.trim())) sections.push(current);
      current = { title: sectionMatch[1], lines: [] };
      return;
    }
    current.lines.push(line);
  });

  if (current.lines.some(item => item.trim()) || sections.length === 0) sections.push(current);

  return (
    <div className="insight-section-stack">
      {sections.map((section, sectionIndex) => (
        <section key={`${section.title}-${sectionIndex}`} className="insight-section-card">
          <h3>{section.title}</h3>
          <div className="insight-section-body">
            {section.lines.map((line, lineIndex) => {
              if (!line.trim()) return null;
              return <p key={lineIndex}>{line.replace(/^[-*]\s+/, '')}</p>;
            })}
            {streaming && sectionIndex === sections.length - 1 && <span className="insight-stream-cursor" />}
          </div>
        </section>
      ))}
    </div>
  );
}

function TopicIntro({ title, loading }: { title: string; loading: boolean }) {
  return (
    <div className="insight-topic-intro">
      <span>AI 生成 · 仅供参考</span>
      <strong>{title}</strong>
      <p>{loading ? '正在生成结构化解读...' : '切换主题或继续追问，AI 会基于当前命盘回答。'}</p>
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

function AssistantMessage({ msg, streaming }: { msg: Message; streaming: boolean }) {
  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="insight-answer-card">
      <div className="insight-answer-head">
        <span>✓</span>
        <strong>{msg.title ?? '命理解读'}</strong>
      </div>
      <AiContent text={msg.content} streaming={streaming} />
    </motion.article>
  );
}

export default function InsightPanel({ chart, selectedPalace, onExportReport }: InsightPanelProps) {
  const [mode, setMode] = useState<PanelMode>('analysis');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTopic, setActiveTopic] = useState<TopicKey>('overview');
  const [activeTitle, setActiveTitle] = useState('命格总览');
  const messagesRef = useRef<Message[]>([]);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    sendMessage(TOPIC_PROMPTS.overview, { hidden: true, reset: true, title: '命格总览' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;
    const majorStars = selectedPalace.stars.filter(star => star.type === 'major').map(star => star.name).join('、') || '空宫';
    const role = PALACE_ROLES[selectedPalace.name] ?? '该宫位相关主题';
    setActiveTitle(selectedPalace.name);
    setMode('analysis');
    sendMessage(
      `请重点分析${selectedPalace.name}，主管${role}。该宫主星为${majorStars}。请包含宫位定性、主星解读、三方四正联动和现实建议。`,
      { hidden: true, reset: true, title: `${selectedPalace.name}解读` },
    );
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  const streamResponse = async (
    apiMessages: { role: 'user' | 'assistant'; content: string }[],
    options: { title: string; requestId: number; signal: AbortSignal },
  ) => {
    let assistantText = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', title: options.title }]);

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, messages: apiMessages }),
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
    options: { hidden?: boolean; reset?: boolean; title?: string } = {},
  ) => {
    if (!text.trim()) return;

    abortRef.current?.abort();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const prompt = `${text}\n\n当前命盘摘要：${chartBrief(chart)}\n请用中文、分小节、避免绝对化断言。`;
    const userMsg: Message = { role: 'user', content: prompt, hidden: options.hidden };
    const sourceMessages = options.reset ? [userMsg] : [...messagesRef.current, userMsg];
    const apiMessages = sourceMessages.map(message => ({ role: message.role, content: message.content }));

    setMessages(prev => options.reset ? [userMsg] : [...prev, userMsg]);
    setInput('');
    streamResponse(apiMessages, {
      title: options.title ?? '追问解读',
      requestId,
      signal: controller.signal,
    });
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
    });
  };

  const handleSend = () => {
    setMode('chat');
    sendMessage(input, { title: 'AI 追问' });
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
        <button type="button" className={mode === 'chat' ? 'is-active' : ''} onClick={() => setMode('chat')}>
          AI 对话
        </button>
        <button type="button" className="insight-report-button" onClick={onExportReport}>
          导出全盘报告 PDF
        </button>
      </div>

      {mode === 'analysis' && (
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
                  {topic.label}
                  {loading && isActive && <i aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 insight-scroll" aria-live="polite" aria-busy={loading}>
        <div className="insight-intro-row">
          <TopicIntro title={activeTitle} loading={loading} />
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
            return <AssistantMessage key={index} msg={msg} streaming={loading && isLast} />;
          })}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && !event.shiftKey && handleSend()}
            placeholder="继续追问，例如：今年适合换工作吗？"
            disabled={loading}
            className="flex-1 rounded-lg px-3 py-2 text-[12px] focus:outline-none transition-colors"
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-busy={loading}
            className={`ui-button-primary px-3 py-2 rounded-lg text-[12px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${loading ? 'is-loading' : ''}`}
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '...' : '追问'}
          </button>
        </div>
      </div>
    </div>
  );
}
