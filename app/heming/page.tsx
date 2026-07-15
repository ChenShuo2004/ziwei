'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import ThemeToggle from '@/components/ThemeToggle';
import { formToBirthInfo } from '@/lib/ziwei/share';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="white-ai-content">
      {lines.map((line, index) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return <h3 key={index}>【{sectionMatch[1]}】</h3>;
        }
        if (!line.trim()) return <div key={index} className="white-ai-gap" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <p key={index}>
            {parts.map((part, partIndex) => (
              partIndex % 2 === 0 ? part : <strong key={partIndex}>{part}</strong>
            ))}
          </p>
        );
      })}
      {streaming && <span className="white-stream-cursor" />}
    </div>
  );
}

export default function HemingPage() {
  const [chartA, setChartA] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [formA, setFormA] = useState<BirthFormState | null>(null);
  const [formB, setFormB] = useState<BirthFormState | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [analysisError, setAnalysisError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const generateChart = useCallback(async (info: BirthInfo): Promise<ZiweiChart | null> => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const isFormReady = (form: BirthFormState | null): boolean =>
    !!(form && form.year && form.month && form.day && form.province && form.city && form.gender && (form.unknownTime || (form.clockHour !== '' && form.clockMinute !== '')));

  const runAnalysis = useCallback(async (q?: string) => {
    setFormError(null);
    if (!isFormReady(formA) || !isFormReady(formB)) {
      setFormError('请先填写双方完整出生信息');
      return;
    }

    setAnalyzing(true);
    setAnalysis('');
    setAnalysisError(false);

    try {
      let cA = chartA;
      let cB = chartB;
      const [newA, newB] = await Promise.all([
        cA ? Promise.resolve(cA) : generateChart(formToBirthInfo(formA!)),
        cB ? Promise.resolve(cB) : generateChart(formToBirthInfo(formB!)),
      ]);
      cA = newA;
      cB = newB;

      if (!cA || !cB) {
        setAnalysisError(true);
        setAnalyzing(false);
        return;
      }

      if (!chartA) setChartA(cA);
      if (!chartB) setChartB(cB);

      const res = await fetch('/api/heming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartA: cA, chartB: cB, question: q ?? undefined }),
      });
      if (!res.ok || !res.body) throw new Error('analysis failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).delta?.text ?? '';
            text += delta;
            setAnalysis(text);
          } catch {
            // ignore malformed stream chunks
          }
        }
      }

      setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setAnalysisError(true);
    } finally {
      setAnalyzing(false);
    }
  }, [chartA, chartB, formA, formB, generateChart]);

  const quickQuestions = [
    '感情匹配度如何？',
    '适合合伙创业吗？',
    '两人结婚是否合适？',
    '哪方面最容易产生矛盾？',
    '财运是否互补？',
  ];

  return (
    <main className="white-page">
      <WhiteHeader active="heming" />
      <section className="white-hero white-hero-compact">
        <p className="white-kicker">02 / SYNASTRY</p>
        <h1>紫微合盘分析</h1>
        <p className="white-subtitle">输入两个人的出生信息</p>
        <span className="white-rule" />
      </section>

      <section className="white-heming-layout">
        <article className="white-party-card">
          <p className="white-party-label">甲方 / A</p>
          <BirthForm hideSubmit compact frame={false} onSubmit={() => {}} onFormSave={setFormA} title="甲方生辰" />
        </article>

        <article className="white-party-card">
          <p className="white-party-label">乙方 / B</p>
          <BirthForm hideSubmit compact frame={false} onSubmit={() => {}} onFormSave={setFormB} title="乙方生辰" />
        </article>
      </section>

      <section ref={analysisRef} className="white-analysis-card">
        <div className="white-section-title">
          <span />
          <strong>合盘分析 · HEMING</strong>
          <span />
        </div>

        {!analysis && !analyzing && (
          <div className="white-empty-state">
            <p>填写双方出生信息后，开始合盘分析。</p>
            <button className="white-submit is-inline" type="button" onClick={() => runAnalysis()}>
              开始合盘分析
            </button>
            {formError && <p className="white-error is-center">{formError}</p>}
          </div>
        )}

        {analyzing && !analysis && (
          <div className="white-loading-state">
            <i />
            <p>正在对比双方命盘...</p>
          </div>
        )}

        {analysis && <AiContent text={analysis} streaming={analyzing} />}

        {analysisError && (
          <p className="white-error is-center">分析暂时不可用，请重试。</p>
        )}
      </section>

      {analysis && (
        <section className="white-followup">
          <p>针对此次合盘继续追问</p>
          <div className="white-chip-row">
            {quickQuestions.map(q => (
              <button
                type="button"
                key={q}
                disabled={analyzing}
                onClick={() => { setQuestion(q); runAnalysis(q); }}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="white-question-row">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !analyzing) runAnalysis(question || undefined); }}
              placeholder="继续追问，如：哪几年是两人感情关键期？"
              disabled={analyzing}
            />
            <button
              type="button"
              className={analyzing ? 'is-loading' : ''}
              disabled={analyzing}
              aria-busy={analyzing}
              onClick={() => runAnalysis(question || undefined)}
            >
              {analyzing ? '分析中...' : '继续追问'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function WhiteHeader({ active }: { active?: 'chart' | 'heming' }) {
  return (
    <header className="white-header">
      <Link className="white-brand" href="/">
        <strong>ziwei</strong>
        <span>紫微斗数 · 三纪</span>
      </Link>
      <nav className="white-nav" aria-label="主导航">
        <Link className={active === 'chart' ? 'is-active' : ''} href="/chart">起盘</Link>
        <span>·</span>
        <Link className={active === 'heming' ? 'is-active' : ''} href="/heming">合盘</Link>
        <Link href="/ziwei-mysteries">紫薇秘术</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
