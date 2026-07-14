'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import ShareModal from '@/components/ShareModal';
import { generateChart } from '@/lib/ziwei/algorithm';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import type { BirthInfo, Palace, ZiweiChart } from '@/lib/ziwei/types';
import type { BirthFormState } from '@/components/BirthForm';

type ChartMode = 'ming' | 'daxian' | 'liunian' | 'liuyue' | 'liuri' | 'liushi';

const MODE_LABELS: Record<ChartMode, string> = {
  ming: '本命',
  daxian: '大限',
  liunian: '流年',
  liuyue: '流月',
  liuri: '流日',
  liushi: '流时',
};

function clockToBranch(hour: number, minute: number, longitude: number): number {
  const clockMins = hour * 60 + minute;
  const offset = (longitude - 120) * 4;
  const solar = ((clockMins + offset) % 1440 + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

function parseChartUrl(): BirthInfo | null {
  const params = new URLSearchParams(window.location.search);
  const serialized = params.get('birth');

  if (serialized) {
    try {
      return JSON.parse(serialized) as BirthInfo;
    } catch {
      return null;
    }
  }

  const year = Number(params.get('y'));
  const month = Number(params.get('m'));
  const day = Number(params.get('d'));
  if (!year || !month || !day) return null;

  const longitude = Number(params.get('lo') ?? 120);
  const clockHour = Number(params.get('h') ?? params.get('u') ?? 0);
  const clockMinute = Number(params.get('min') ?? 0);
  const hour = params.has('hour')
    ? Number(params.get('hour'))
    : clockToBranch(clockHour, clockMinute, Number.isFinite(longitude) ? longitude : 120);

  return {
    year,
    month,
    day,
    hour: Number.isFinite(hour) ? hour : 0,
    gender: params.get('g') === 'f' || params.get('g') === 'female' ? 'female' : 'male',
    name: params.get('name') ?? undefined,
    province: params.get('p') ?? undefined,
    city: params.get('c') ?? undefined,
    longitude: Number.isFinite(longitude) ? longitude : 120,
  };
}

function birthToFormState(info: BirthInfo): BirthFormState {
  return {
    name: info.name ?? '',
    year: String(info.year),
    month: String(info.month),
    day: String(info.day),
    clockHour: '0',
    clockMinute: '0',
    unknownTime: false,
    province: info.province ?? '',
    city: info.city ?? '',
    longitude: info.longitude ?? 120,
    gender: info.gender,
  };
}

function buildShareUrl(info: BirthInfo): string {
  const params = new URLSearchParams({
    y: String(info.year),
    m: String(info.month),
    d: String(info.day),
    u: '0',
    p: info.province ?? '',
    c: info.city ?? '',
    lo: String(info.longitude ?? 120),
    g: info.gender === 'female' ? 'f' : 'm',
  });
  return `/chart?${params.toString()}`;
}

function buildReport(chart: ZiweiChart, name: string) {
  const mingPalace = chart.palaces.find(item => item.branch === chart.mingGongBranch);
  const majorStars = mingPalace?.stars.filter(star => star.type === 'major').map(star => star.name).join('、') || '空宫';
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const sihua = chart.palaces.flatMap(palace =>
    palace.stars
      .filter(star => star.siHua)
      .map(star => `- ${star.name}${star.siHua}：落${palace.name}`)
  );

  return `# ${name || '命主'}的紫微斗数全盘分析报告

生成日期：${new Date().toLocaleDateString('zh-CN')}

## 1. 基本信息

- 公历生日：${chart.birthInfo.year}-${chart.birthInfo.month}-${chart.birthInfo.day}
- 出生地：${chart.birthInfo.province ?? ''}${chart.birthInfo.city ?? ''}
- 性别：${chart.birthInfo.gender === 'male' ? '男' : '女'}
- 五行局：${chart.wuxingJuName}
- 命宫：${BRANCHES[chart.mingGongBranch]}
- 身宫：${BRANCHES[chart.shenGongBranch]}

## 2. 命盘总览

命宫主星：${majorStars}

当前大限：${currentDx ? `${currentDx.startAge}-${currentDx.endAge}岁，落${currentDx.palaceName}` : '暂未识别'}

## 3. 十二宫重点

${chart.palaces.map(palace => {
  const stars = palace.stars.filter(star => star.type === 'major').map(star => star.name).join('、') || '空宫';
  return `- ${palace.name}：${stars}（${STEMS[palace.stem]}${BRANCHES[palace.branch]}）`;
}).join('\n')}

## 4. 四化分析

${sihua.length ? sihua.join('\n') : '本盘未识别到明显四化标记。'}

## 5. 现实建议

这份报告先作为 MVP 版本，重点用于保存命盘结构、十二宫信息和后续 AI 深度解读。正式专业版会继续补充大限、流年、专题分析、古籍依据和可下载 PDF。

## 6. 免责声明

以上内容基于传统紫微斗数文化模型生成，仅供自我理解与娱乐参考，不构成现实决策、医疗、法律或投资建议。
`;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [birthData, setBirthData] = useState<BirthFormState | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [mode, setMode] = useState<ChartMode>('ming');
  const [notice, setNotice] = useState('');
  const [bootError, setBootError] = useState('');

  useEffect(() => {
    const info = parseChartUrl();
    if (!info) return;
    try {
      const nextChart = generateChart(info);
      setChart(nextChart);
      setBirthData(birthToFormState(info));
      setBootError('');
    } catch (error) {
      setBootError(error instanceof Error ? error.message : '命盘生成失败，请检查出生参数。');
    }
  }, []);

  useEffect(() => {
    if (chart) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chart]);

  const modeItems = useMemo(() => {
    const currentDx = chart?.daXians[chart.currentDaXianIndex];
    return (Object.keys(MODE_LABELS) as ChartMode[]).map(item => ({
      key: item,
      label: item === 'daxian' && currentDx ? `大限 ${currentDx.startAge}–${currentDx.endAge}` : MODE_LABELS[item],
    }));
  }, [chart]);

  const handleModeClick = (next: ChartMode) => {
    setMode(next);
    if (next === 'liuyue' || next === 'liuri' || next === 'liushi') {
      setNotice(`${MODE_LABELS[next]}属于专业版精细盘，当前先开放入口，算法接入后会同步命盘与解读。`);
      return;
    }
    setNotice('');
  };

  const handleSubmit = (info: BirthInfo) => {
    setChart(generateChart(info));
    setBirthData(birthToFormState(info));
    window.history.replaceState({}, '', buildShareUrl(info));
  };

  const handleExportReport = () => {
    if (!chart) return;
    const name = birthData?.name || chart.birthInfo.name || '命主';
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`${name}-紫微全盘报告-${date}.md`, buildReport(chart, name));
  };

  if (!chart) {
    return (
      <main className="white-page">
        <WhiteHeader active="chart" />
        <section className="white-hero">
          <p className="white-kicker">01 / DESTINY ENGINE</p>
          <h1>紫微斗数排盘</h1>
          <p className="white-subtitle">输入出生信息，生成命盘与 AI 解读。</p>
          <span className="white-rule" />
        </section>

        <section className="white-form-wrap" aria-label="紫微斗数排盘">
          {bootError && (
            <div className="pro-chart-notice" role="alert">
              URL 参数已识别，但自动起盘失败：{bootError}
              <button type="button" onClick={() => setBootError('')}>关闭</button>
            </div>
          )}
          <BirthForm onSubmit={handleSubmit} onFormSave={setBirthData} submitLabel="立即起盘" />
        </section>
      </main>
    );
  }

  return (
    <main className="white-page white-chart-page" id="main-content">
      <a className="skip-link" href="#main-content">跳转到主要内容</a>
      <section className="pro-chart-shell">
        <div className="pro-chart-toolbar" aria-label="命盘工具栏">
          <div className="pro-chart-toolbar-left">
            <button type="button" className="pro-back-button" onClick={() => window.history.back()}>
              <span>‹</span> 返回
            </button>
            <div className="pro-mode-tabs" aria-label="排盘维度">
              {modeItems.map(item => (
                <button
                  key={item.key}
                  type="button"
                  className={mode === item.key ? 'is-active' : ''}
                  onClick={() => handleModeClick(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="pro-chart-toolbar-actions">
            <Link className="pro-upgrade-button" href="/login">升级专业版</Link>
            <button type="button" onClick={() => setNotice('流派切换会作为专业版配置项接入，当前采用默认紫微斗数体系。')}>流派</button>
            <button type="button" onClick={() => setNotice('历史命盘会优先保存在本机，下一步接入本地历史列表。')}>历史</button>
            <button type="button" onClick={() => setNotice('反馈入口会接入表单，当前可先记录到专业版待办。')}>反馈</button>
          </div>
        </div>

        {notice && (
          <div className="pro-chart-notice" role="status">
            {notice}
            <button type="button" onClick={() => setNotice('')}>关闭</button>
          </div>
        )}

        <section className="white-result-grid pro-result-grid">
          <div className="white-board-panel">
            <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
            <div className="pro-board-actions">
              <p>点击宫位查看三方四正</p>
              <button
                type="button"
                className="white-secondary-button"
                onClick={() => { setChart(null); setSelectedPalace(null); window.history.replaceState({}, '', '/chart'); }}
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
            </div>
          </div>

          <div className="white-insight-panel">
            <InsightPanel
              chart={chart}
              selectedPalace={selectedPalace}
              onExportReport={handleExportReport}
            />
          </div>
        </section>
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
        <Link className={active === 'chart' ? 'is-active' : ''} href="/chart">排盘</Link>
        <span>·</span>
        <Link className={active === 'heming' ? 'is-active' : ''} href="/heming">合盘</Link>
        <Link href="/knowledge">知识库</Link>
        <Link href="/library">古籍库</Link>
      </nav>
    </header>
  );
}
