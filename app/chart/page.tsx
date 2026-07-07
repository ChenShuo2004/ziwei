'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, Palace, ZiweiChart } from '@/lib/ziwei/types';

export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  useEffect(() => {
    if (chart) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chart]);

  if (!chart) {
    return (
      <main className="white-page">
        <WhiteHeader active="chart" />
        <section className="white-hero">
          <p className="white-kicker">01 / DESTINY ENGINE</p>
          <h1>起紫微命盘</h1>
          <p className="white-subtitle">输入出生年月日时</p>
          <span className="white-rule" />
        </section>

        <section className="white-form-wrap" aria-label="起紫微命盘">
          <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} submitLabel="立即起盘" />
        </section>
      </main>
    );
  }

  return (
    <main className="white-page white-chart-page">
      <WhiteHeader active="chart" />
      <section className="white-workbench-head">
        <div>
          <p className="white-kicker">01 / DESTINY ENGINE</p>
          <h1>紫微斗数命盘</h1>
          <p>点击宫位查看三方四正，右侧自动生成本地命理解读。</p>
        </div>
        <button
          type="button"
          className="white-secondary-button"
          onClick={() => { setChart(null); setSelectedPalace(null); }}
        >
          重新起盘
        </button>
      </section>

      <section className="white-result-grid">
        <div className="white-board-panel">
          <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
        </div>
        <div className="white-insight-panel">
          <InsightPanel chart={chart} selectedPalace={selectedPalace} />
        </div>
      </section>
    </main>
  );
}

function WhiteHeader({ active }: { active?: 'chart' | 'heming' }) {
  return (
    <header className="white-header">
      <Link className="white-brand" href="/">
        <strong>METIS</strong>
        <span>紫微斗数 · 三纪</span>
      </Link>
      <nav className="white-nav" aria-label="主导航">
        <Link className={active === 'chart' ? 'is-active' : ''} href="/chart">起盘</Link>
        <span>·</span>
        <Link className={active === 'heming' ? 'is-active' : ''} href="/heming">合盘</Link>
        <Link href="/knowledge">知识库</Link>
        <Link href="/library">古籍库</Link>
        <Link className="white-nav-pill" href="/login">专业版</Link>
      </nav>
    </header>
  );
}
