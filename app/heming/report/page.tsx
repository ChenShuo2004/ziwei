'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import type { Palace, ZiweiChart } from '@/lib/ziwei/types';
import { useLocale } from '@/components/LocaleProvider';

interface HemingReportData {
  chartA: ZiweiChart;
  chartB: ZiweiChart;
  analysis: string;
}

function palace(chart: ZiweiChart, keyword: string): Palace | undefined {
  return chart.palaces.find(item => item.name.includes(keyword));
}

function majorStars(item?: Palace): string {
  return item?.stars.filter(star => star.type === 'major').map(star => star.name).join('、') || '空宫';
}

function siHua(item?: Palace): string {
  return item?.stars.filter(star => star.siHua).map(star => `${star.name}化${star.siHua}`).join('、') || '暂无本宫四化';
}

function palaceLine(chart: ZiweiChart, keyword: string): string {
  const item = palace(chart, keyword);
  return `${majorStars(item)} · ${siHua(item)}`;
}

function ReportText({ text }: { text: string }) {
  return (
    <div className="white-ai-content">
      {text.split('\n').map((line, index) => {
        if (!line.trim()) return <div key={index} className="white-ai-gap" />;
        if (line.startsWith('# ')) return <h2 key={index}>{line.slice(2)}</h2>;
        if (line.startsWith('> ')) return <blockquote key={index}>{line.slice(2)}</blockquote>;
        const heading = line.match(/^\*\*(.+?)\*\*$/);
        if (heading) return <h3 key={index}>{heading[1]}</h3>;
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return <p key={index}>{parts.map((part, partIndex) => partIndex % 2 ? <strong key={partIndex}>{part}</strong> : part)}</p>;
      })}
    </div>
  );
}

export default function HemingReportPage() {
  const { locale } = useLocale();
  const [data, setData] = useState<HemingReportData | null>(null);
  const [missing, setMissing] = useState(false);
  const reportLocale = useRef<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('heming-report');
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as HemingReportData;
      if (!parsed.chartA || !parsed.chartB || !parsed.analysis) throw new Error('invalid report');
      setData(parsed);
    } catch {
      setMissing(true);
    }
  }, []);

  useEffect(() => {
    if (!data || reportLocale.current === locale) return;
    reportLocale.current = locale;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/heming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chartA: data.chartA, chartB: data.chartB, locale }),
        });
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let report = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split('\n')) {
            if (!line.startsWith('data: ') || line.slice(6) === '[DONE]') continue;
            try { report += JSON.parse(line.slice(6)).delta?.text ?? ''; } catch { /* Ignore malformed chunks. */ }
          }
          if (!cancelled && report) setData(current => current ? { ...current, analysis: report } : current);
        }
      } catch {
        // Keep the last complete report when a language refresh cannot connect.
      }
    })();
    return () => { cancelled = true; };
  }, [data, locale]);

  const highlights = useMemo(() => {
    if (!data) return [];
    const aSpouse = palace(data.chartA, '夫妻');
    const bSpouse = palace(data.chartB, '夫妻');
    return [
      ['双方命宫', `${majorStars(palace(data.chartA, '命'))} / ${majorStars(palace(data.chartB, '命'))}`],
      ['夫妻宫互照', `${majorStars(aSpouse)} / ${majorStars(bSpouse)}`],
      ['福德宫安全感', `${majorStars(palace(data.chartA, '福德'))} / ${majorStars(palace(data.chartB, '福德'))}`],
    ];
  }, [data]);

  if (missing) {
    return (
      <main className="white-page">
        <SiteHeader active="heming" />
        <section className="white-empty-state heming-report-empty">
          <h1>{locale === 'en' ? 'Synastry report unavailable' : '合盘报告已失效'}</h1>
          <p>{locale === 'en' ? 'Return to Synastry and generate a new report.' : '请返回合盘页面，重新填写双方出生信息并生成报告。'}</p>
          <Link className="white-submit is-inline" href="/heming">{locale === 'en' ? 'Back to Synastry' : '返回合盘'}</Link>
        </section>
      </main>
    );
  }

  if (!data) {
    return <main className="white-page"><SiteHeader active="heming" /><div className="white-loading-state"><i /><p>{locale === 'en' ? 'Preparing synastry report...' : '正在整理合盘报告...'}</p></div></main>;
  }

  return (
    <main className="white-page">
      <SiteHeader active="heming" />
      <section className="white-hero white-hero-compact heming-report-hero">
        <p className="white-kicker">02 / SYNASTRY REPORT</p>
        <h1>{locale === 'en' ? 'Synastry Deep Report' : '合盘深度报告'}</h1>
        <p className="white-subtitle">{locale === 'en' ? 'Compare chart rhythm, intimacy expectations, emotional security and practical cooperation.' : '从命宫节奏、夫妻宫期待、福德宫安全感与现实协作，完整观察双方关系结构。'}</p>
        <span className="white-rule" />
        <Link className="heming-back-link" href="/heming">‹ 返回重新合盘</Link>
      </section>

      <section className="heming-report-parties" aria-label="双方命盘摘要">
        {[['甲方', data.chartA], ['乙方', data.chartB]].map(([label, chart]) => {
          const typedChart = chart as ZiweiChart;
          return (
            <article className="white-party-card heming-summary-card" key={label as string}>
              <span className="white-party-label">{label as string}</span>
              <h2>{majorStars(palace(typedChart, '命'))}</h2>
              <p>五行局：{typedChart.wuxingJuName}</p>
              <dl>
                <div><dt>命宫</dt><dd>{palaceLine(typedChart, '命')}</dd></div>
                <div><dt>夫妻</dt><dd>{palaceLine(typedChart, '夫妻')}</dd></div>
                <div><dt>福德</dt><dd>{palaceLine(typedChart, '福德')}</dd></div>
              </dl>
            </article>
          );
        })}
      </section>

      <section className="white-analysis-card heming-deep-report">
        <div className="white-section-title"><span /><strong>{locale === 'en' ? 'Relationship Structure' : '关系结构总览'}</strong><span /></div>
        <div className="heming-highlight-grid">
          {highlights.map(([title, value]) => <article key={title}><strong>{title}</strong><p>{value}</p></article>)}
        </div>
        <div className="heming-report-outline">
          <h3>{locale === 'en' ? 'Report Focus' : '本次报告重点'}</h3>
          <p>{locale === 'en' ? 'Synastry is not only about compatibility. It also examines division of roles, expression of needs and stable agreements around money, family and long-term goals.' : '合盘不只判断“合不合”，更要看两个人如何分工、如何表达需求，以及在金钱、家庭和长期目标上能否形成稳定规则。'}</p>
          <p>{locale === 'en' ? 'The Spouse Palace reflects intimacy expectations, Fortune & Wellbeing Palace reflects emotional security, and the Life Palace shows each person’s response under pressure.' : '夫妻宫负责亲密关系的期待，福德宫反映关系中的安全感；命宫与三方四正则帮助判断双方遇到压力时的行动节奏。'}</p>
        </div>
        <ReportText text={data.analysis} />
      </section>
    </main>
  );
}
