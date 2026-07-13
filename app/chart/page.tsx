'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, Palace, ZiweiChart } from '@/lib/ziwei/types';
import type { BirthFormState } from '@/components/BirthForm';
import ShareModal from '@/components/ShareModal';

export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [birthData, setBirthData] = useState<BirthFormState | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const serialized = new URLSearchParams(window.location.search).get('birth');
    if (!serialized) return;
    try {
      const info = JSON.parse(serialized) as BirthInfo;
      setChart(generateChart(info));
        setBirthData({
          name: info.name ?? '', year: String(info.year), month: String(info.month), day: String(info.day),
          clockHour: '8', clockMinute: '0', unknownTime: false, province: info.province ?? '',
          city: info.city ?? '', longitude: info.longitude ?? 120, gender: info.gender,
        });
    } catch {
      window.history.replaceState({}, '', '/chart');
    }
  }, []);

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
          <BirthForm
            onSubmit={(info: BirthInfo) => {
              setChart(generateChart(info));
              const encoded = encodeURIComponent(JSON.stringify(info));
              window.history.replaceState({}, '', `/chart?birth=${encoded}`);
            }}
            onFormSave={setBirthData}
            submitLabel="立即起盘"
          />
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
        <button
          type="button"
          className="white-secondary-button"
          onClick={() => setShareOpen(true)}
          disabled={!birthData}
        >
          分享命盘
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
      {birthData && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          shareUrl={window.location.href}
          chart={chart}
          birth={{
            year: birthData.year,
            month: birthData.month,
            day: birthData.day,
            hour: birthData.clockHour,
            minute: birthData.clockMinute,
            gender: birthData.gender,
            city: birthData.city,
          }}
        />
      )}
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
      </nav>
    </header>
  );
}
