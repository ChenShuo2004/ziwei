'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean; // don't show user bubble for auto/topic messages
  title?: string;
}

interface SelectedSiHua {
  starName: string;
  siHua: string;
  view: TimeView;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
}

const TOPICS = [
  { key: 'overview',     label: '命格' },
  { key: 'love',        label: '感情' },
  { key: 'career',      label: '事业' },
  { key: 'wealth',      label: '财运' },
  { key: 'health',      label: '健康' },
  { key: 'personality', label: '性格' },
] as const;

type TopicKey = (typeof TOPICS)[number]['key'];

const TOPIC_PROMPTS: Record<string, string> = {
  overview: `请生成命格总览，按以下结构输出：

**【命格定性】**
用一句话概括这个命盘的核心格局与命主气质。

**【主星解读】**
命宫主星的核心特质，引用倪海夏原话或观点。

**【三方四正】**
财、官、迁三宫的联动分析及整体格局。

**【当前大限】**
当下大限运势方向与最值得关注的事项。

**【优势与注意】**
命盘天赋优势，以及需要注意的风险或功课。`,

  love: `请深度分析感情婚姻运，按以下结构输出：

**【感情格局】**
一句话定性感情命格。

**【夫妻宫分析】**
夫妻宫主星、四化，以及倪海夏体系的具体解读。

**【三方联动】**
相关宫位对感情的影响。

**【当前大限感情运】**
当下10年感情走向与关键节点。

**【实际建议】**
具体可行的感情建议。`,

  career: `请深度分析事业运，按以下结构输出：

**【事业格局】**
一句话定性事业命格，宜任职或宜创业。

**【官禄宫分析】**
官禄宫主星、四化，以及倪师对这种配置的判断。

**【财帛宫联动】**
财运与事业的关系，财路来源分析。

**【当前大限事业运】**
当下10年事业走向。

**【实际建议】**
适合的方向、行业与策略。`,

  wealth: `请深度分析财运，按以下结构输出：

**【财运格局】**
一句话定性财运模式，是主动财还是被动财。

**【财帛宫分析】**
财帛宫主星、四化，财富来源与流动模式。

**【田宅宫（财库）】**
积蓄能力与不动产运势分析。

**【当前大限财运】**
当下财运走向与注意事项。

**【理财建议】**
具体的财务建议。`,

  health: `请分析健康运势，按以下结构输出：

**【疾厄宫主星】**
疾厄宫星曜与健康含义。

**【主要风险】**
结合倪海夏子午流注理论，分析主要健康隐患与需关注的部位。

**【大限健康走势】**
当下健康趋势与关键时间段。

**【预防建议】**
具体注意事项与养生方向。`,

  personality: `请深度解析性格特质，按以下结构输出：

**【命宫主星性格】**
命宫主星的核心性格特质，引用倪师原话。

**【三方性格综合】**
财、官、迁三宫对性格的影响，全貌描绘。

**【人际关系模式】**
与他人互动方式、待人处世风格。

**【优势与人生课题】**
天赋优势，以及需要面对的人生功课。`,
};

const PALACE_ROLES: Record<string, string> = {
  '命宫':   '自我、性格、先天格局',
  '兄弟宫': '兄弟关系、合伙人',
  '夫妻宫': '感情关系、婚姻状态',
  '子女宫': '子女缘分、下属关系',
  '财帛宫': '财运来源、收入方式',
  '疾厄宫': '身体健康、意外',
  '迁移宫': '外出机遇、人际格局',
  '交友宫': '朋友圈、贵人、小人',
  '官禄宫': '事业成就、社会地位',
  '田宅宫': '不动产、家庭环境',
  '福德宫': '精神享受、内心福分',
  '父母宫': '父母关系、文书契约',
};

/** Render AI markdown: **【Title】** → gold header, **bold** → strong */
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } = { title: '核心解读', lines: [] };

  text.split('\n').forEach((line) => {
    const sectionMatch = line.trim().match(/^\*\*【(.+?)】\*\*$/);
    if (sectionMatch) {
      if (current.lines.some(item => item.trim())) sections.push(current);
      current = { title: sectionMatch[1], lines: [] };
      return;
    }
    current.lines.push(line);
  });

  if (current.lines.some(item => item.trim()) || sections.length === 0) sections.push(current);

  const renderInline = (line: string) => {
    const parts = line.replace(/^[-*]\s+/, '').split(/\*\*(.+?)\*\*/);
    return parts.map((part, j) =>
      j % 2 === 0
        ? part
        : <strong key={j} className="font-semibold text-slate-950">{part}</strong>
    );
  };

  return (
    <div className="insight-section-stack">
      {sections.map((section, sectionIndex) => (
        <section key={`${section.title}-${sectionIndex}`} className="insight-section-card">
          <h3>{section.title}</h3>
          <div className="insight-section-body">
            {section.lines.map((line, lineIndex) => {
              if (line.trim() === '') return null;
              return (
                <p key={lineIndex}>
                  {renderInline(line.trim())}
                </p>
              );
            })}
            {streaming && sectionIndex === sections.length - 1 && (
              <span className="insight-stream-cursor" />
            )}
          </div>
        </section>
      ))}
      {streaming && sections.length === 0 && (
        <span className="insight-stream-cursor" />
      )}
    </div>
  );
}

function TopicIntro({ title, loading }: { title: string; loading: boolean }) {
  return (
    <div className="insight-topic-intro">
      <span>{title}</span>
      <strong>{title}解读</strong>
      <p>{loading ? '正在生成结构化解读…' : '点击上方主题可切换不同维度，内容会按小节分开展示。'}</p>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-xl px-3 py-2 text-[11px] bg-amber-50 text-amber-800 ring-1 ring-amber-200">
        {content}
      </div>
    </motion.div>
  );
}

function AssistantMessage({ msg, streaming }: { msg: Message; streaming: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="insight-answer-card"
    >
      <div className="insight-answer-head">
        <span>✦</span>
        <strong>{msg.title ?? '命理解读'}</strong>
      </div>
      <AiContent text={msg.content} streaming={streaming} />
    </motion.article>
  );
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTopic, setActiveTopic] = useState<TopicKey>('overview');
  const [activeTitle, setActiveTitle] = useState('命格');
  const messagesRef = useRef<Message[]>([]); // always-current copy for closures
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-generate 命格总览 on mount
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    sendMessage(TOPIC_PROMPTS.overview, { hidden: true, reset: true, title: '命格解读' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject palace analysis when palace selected
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;
    setActiveTitle(selectedPalace.name);

    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0
      ? majorStars.map(s => `${s.name}${s.siHua ? '化' + s.siHua : ''}`).join('、')
      : '空宫（借对宫）';
    const role = PALACE_ROLES[selectedPalace.name] ?? '';

    const prompt = `请重点分析【${selectedPalace.name}】（主管：${role}），该宫主星为${starDesc}，按以下结构输出：

**【宫位定性】**
${selectedPalace.name}在命盘中的意义，以及这种星曜配置的整体判断。

**【主星解读】**
主星在此宫的倪海夏体系解读，引用具体观点。

**【三方四正联动】**
三方四正宫位对此宫的影响。

**【实际建议】**
基于此宫的具体建议。`;

    sendMessage(prompt, { hidden: true, reset: true, title: `${selectedPalace.name}解读` });
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  // 注入四化飞化分析
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;

    // 找出该星所在宫位
    const palaceOfStar = chart.palaces.find(p =>
      p.stars.some(s => s.name === selectedSiHua.starName)
    );
    const palaceName = palaceOfStar?.name ?? '未知宫位';
    const viewLabel = selectedSiHua.view === 'daxian' ? '大限' : '流年';
    setActiveTitle(`${viewLabel}四化`);

    const prompt = `请分析【${viewLabel}${selectedSiHua.starName}化${selectedSiHua.siHua}】的飞化影响，按以下结构输出：

**【化${selectedSiHua.siHua}基本含义】**
化${selectedSiHua.siHua}在倪海夏体系中的核心含义，以及${selectedSiHua.starName}化${selectedSiHua.siHua}的特殊含义。

**【落宫影响】**
${selectedSiHua.starName}化${selectedSiHua.siHua}落在【${palaceName}】，该宫主管的领域受到何种影响，倪师如何解读。

**【三方四正飞化路径】**
化${selectedSiHua.siHua}入${palaceName}后，对其三方四正（对宫、两个三合宫）的联动影响。

**【当前运势影响】**
在${viewLabel}时间维度下，此化${selectedSiHua.siHua}对命主近期运势的具体影响。

**【实际建议】**
基于此四化的具体可操作建议。`;

    sendMessage(prompt, { hidden: true, reset: true, title: `${viewLabel}四化解读` });
  }, [selectedSiHua]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (!res.ok) throw new Error('请求失败');
      if (!res.body) throw new Error('无响应流');

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
            const delta = JSON.parse(data).delta?.text ?? '';
            assistantText += delta;
            setMessages(prev => {
              if (options.requestId !== requestIdRef.current) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText, title: options.title };
              return updated;
            });
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      if (options.signal.aborted || options.requestId !== requestIdRef.current) return;
      setMessages(prev => [...prev, { role: 'assistant', content: '解读失败，请稍后重试。', title: options.title }]);
    } finally {
      if (options.requestId === requestIdRef.current) {
        setLoading(false);
        loadingRef.current = false;
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

    loadingRef.current = true;
    setLoading(true);

    const userMsg: Message = { role: 'user', content: text, hidden: options.hidden };
    // Capture current messages synchronously via ref (avoids stale closure)
    const sourceMessages = options.reset ? [userMsg] : [...messagesRef.current, userMsg];
    const apiMessages = sourceMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    setMessages(prev => options.reset ? [userMsg] : [...prev, userMsg]);
    setInput('');
    streamResponse(apiMessages, {
      title: options.title ?? '命理解读',
      requestId,
      signal: controller.signal,
    });
  };

  const handleTopicClick = (topicKey: TopicKey) => {
    setActiveTopic(topicKey);
    const topic = TOPICS.find(item => item.key === topicKey) ?? TOPICS[0];
    setActiveTitle(topic.label);
    sendMessage(TOPIC_PROMPTS[topicKey], {
      hidden: true,
      reset: true,
      title: `${topic.label}解读`,
    });
  };

  const handleSend = () => {
    sendMessage(input, { title: '追问解读' });
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

      {/* ── Topic buttons ── */}
      <div className="insight-topic-bar">
        <div className="insight-topic-grid">
          {TOPICS.map(t => {
            const isActive = activeTopic === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTopicClick(t.key)}
                className={isActive ? 'is-active' : ''}
                type="button"
              >
                {t.label}
                {loading && isActive && <i aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 insight-scroll">
        <div className="insight-intro-row">
          <TopicIntro title={activeTitle} loading={loading} />
          <button type="button" className="insight-copy-button" onClick={handleCopy} disabled={loading || !messages.some(message => message.role === 'assistant' && message.content.trim())}>
            {copied ? '已复制' : '复制解读'}
          </button>
        </div>

        {/* Loading state before first message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }}>✦</div>
            <p className="text-[10px] animate-pulse" style={{ color: 'var(--t-faint)' }}>命格解读生成中…</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            if (msg.role === 'user' && msg.hidden) return null;

            if (msg.role === 'user') {
              return <UserMessage key={i} content={msg.content} />;
            }

            // Assistant message
            const isLastMsg = i === messages.length - 1;
            return <AssistantMessage key={i} msg={msg} streaming={loading && isLastMsg} />;
          })}
        </AnimatePresence>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="继续追问，如：今年适合换工作吗？"
            disabled={loading}
            className="flex-1 rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-colors"
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '…' : '追问'}
          </button>
        </div>
      </div>

    </div>
  );
}
