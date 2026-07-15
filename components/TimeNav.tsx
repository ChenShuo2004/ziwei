'use client';
import { motion } from 'framer-motion';
import { STEMS, SI_HUA_TABLE, BRANCHES } from '@/lib/ziwei/constants';
import { getLiuYueSiHua } from '@/lib/ziwei/sihua';
import type { ZiweiChart } from '@/lib/ziwei/types';

export type TimeView = 'mingpan' | 'daxian' | 'liunian' | 'liuyue' | 'liuri' | 'liushi';

export interface TimeContext {
  view: TimeView;
  year: number;
  month: number;
  day: number;
  hour: number;
  daXianIndex: number;
}

interface TimeNavProps {
  chart: ZiweiChart;
  view: TimeView;
  liunianYear: number;
  liuyueMonth: number;
  liuriDay: number;
  liushiHour: number;
  onViewChange: (view: TimeView) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
  onHourChange: (hour: number) => void;
}

/** 由年份计算天干索引 (0-9) */
export function getYearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/** 根据天干索引返回四化映射：starName → SiHua */
export function buildSiHuaOverlay(stemIndex: number): Record<string, string> {
  const stars = SI_HUA_TABLE[stemIndex];
  if (!stars) return {};
  return {
    [stars[0]]: '禄',
    [stars[1]]: '权',
    [stars[2]]: '科',
    [stars[3]]: '忌',
  };
}

const SIHUA_COLORS: Record<string, string> = {
  '禄': '#4ade80',
  '权': '#60a5fa',
  '科': '#facc15',
  '忌': '#f87171',
};

export default function TimeNav({
  chart,
  view,
  liunianYear,
  liuyueMonth,
  liuriDay,
  liushiHour,
  onViewChange,
  onYearChange,
  onMonthChange,
  onDayChange,
  onHourChange,
}: TimeNavProps) {
  const currentDx = chart.daXians[chart.currentDaXianIndex];

  // 计算当前叠加四化信息
  const getOverlayInfo = (): { stemName: string; overlay: Record<string, string> } | null => {
    if (view === 'mingpan') return null;

    if (view === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (!dxPalace) return null;
      const stemIndex = dxPalace.stem;
      return {
        stemName: STEMS[stemIndex],
        overlay: buildSiHuaOverlay(stemIndex),
      };
    }

    if (view === 'liunian') {
      const stemIndex = getYearStemIndex(liunianYear);
      return {
        stemName: STEMS[stemIndex],
        overlay: buildSiHuaOverlay(stemIndex),
      };
    }

    if (view === 'liuyue') {
      const result = getLiuYueSiHua(getYearStemIndex(liunianYear), liuyueMonth);
      return { stemName: result.stemName, overlay: result.transforms };
    }

    return null;
  };

  const overlayInfo = getOverlayInfo();

  return (
    <div className="mb-3">
      {/* Tab 行 */}
      <div
        className="flex items-center rounded-xl p-1 gap-1"
        style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
      >
        {/* 本命 */}
        <TabButton
          active={view === 'mingpan'}
          onClick={() => onViewChange('mingpan')}
        >
          本命
        </TabButton>

        {/* 大限 */}
        <TabButton
          active={view === 'daxian'}
          onClick={() => onViewChange('daxian')}
        >
          {currentDx ? `大限 ${currentDx.startAge}–${currentDx.endAge}` : '大限'}
        </TabButton>

        {/* 流年 — 含年份切换 */}
        <div
          className="relative flex-1 flex items-center justify-center rounded-lg py-1.5 gap-1 transition-all duration-200"
          style={{
            background: view === 'liunian'
              ? 'rgba(212,168,67,0.12)'
              : 'transparent',
            border: view === 'liunian'
              ? '1px solid rgba(212,168,67,0.25)'
              : '1px solid transparent',
          }}
        >
          <button
            onClick={() => onViewChange('liunian')}
            className="text-[10px] font-medium flex-1 text-center"
            style={{ color: view === 'liunian' ? 'var(--t-gold)' : 'var(--t-faint)' }}
          >
            流年
          </button>
          {/* 年份 +/- */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded"
              style={{ color: 'var(--t-faint)' }}
            >
              ‹
            </button>
            <span
              className="text-[10px] font-mono min-w-[28px] text-center cursor-pointer"
              style={{ color: view === 'liunian' ? 'var(--t-gold)' : 'var(--t-faint)' }}
              onClick={() => onViewChange('liunian')}
            >
              {liunianYear}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded"
              style={{ color: 'var(--t-faint)' }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 叠加四化说明行 */}
      {overlayInfo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 mt-1.5 px-1 flex-wrap"
        >
          <span className="text-[9px]" style={{ color: 'var(--t-faint)' }}>
            {view === 'daxian' ? '大限' : `${liunianYear}`}·{overlayInfo.stemName}年四化：
          </span>
          {(['禄', '权', '科', '忌'] as const).map(sh => {
            const starName = Object.keys(overlayInfo.overlay).find(k => overlayInfo.overlay[k] === sh);
            if (!starName) return null;
            return (
              <span key={sh} className="text-[9px] font-medium" style={{ color: SIHUA_COLORS[sh] }}>
                {starName}化{sh}
              </span>
            );
          })}
        </motion.div>
      )}

      <div className="chart-time-controls" aria-label={'\u547d\u76d8\u65f6\u95f4\u7ef4\u5ea6'}>
        <TimeSection label={'\u5927\u9650'} hint={'\u6df1\u8272\u4e3a\u6240\u9009\u5927\u9650\uff0c\u70b9\u51fb\u5207\u6362'}>
          <div className="chart-time-options">
            {chart.daXians.map((item, index) => (
              <TimeOption key={`${item.startAge}-${item.endAge}`} active={view === 'daxian' && index === chart.currentDaXianIndex} onClick={() => onViewChange('daxian')} title={`${item.startAge}\u2013${item.endAge}\u5c81`} subtitle={item.palaceName} />
            ))}
          </div>
        </TimeSection>

        <TimeSection label={'\u6d41\u5e74'} hint={'\u7d2b\u8272\u4e3a\u5f53\u524d\u5e74\uff0c\u70b9\u51fb\u4efb\u4e00\u5e74\u5207\u6362'}>
          <div className="chart-time-options">
            {Array.from({ length: 6 }, (_, index) => liunianYear - 4 + index).map(year => (
              <TimeOption key={year} active={view === 'liunian' && year === liunianYear} onClick={() => { onYearChange(year); onViewChange('liunian'); }} title={String(year)} subtitle={`${getYearStemIndex(year)}\u5e74`} />
            ))}
          </div>
        </TimeSection>

        <TimeSection label={'\u6d41\u6708'} hint={'\u7cbe\u7ec6\u5230\u6bcf\u6708\u8fd0\u52bf\uff0c\u70b9\u51fb\u5207\u6362'}>
          <div className="chart-time-options">
            {Array.from({ length: 12 }, (_, index) => index + 1).map(month => (
              <TimeOption key={month} active={view === 'liuyue' && month === liuyueMonth} onClick={() => { onMonthChange(month); onViewChange('liuyue'); }} title={`${month}\u6708`} />
            ))}
          </div>
        </TimeSection>

        <TimeSection label={'\u6d41\u65e5'} hint={'\u7cbe\u7ec6\u5230\u6bcf\u5929\uff0c\u70b9\u51fb\u5207\u6362'}>
          <div className="chart-time-options">
            {Array.from({ length: 31 }, (_, index) => index + 1).map(day => (
              <TimeOption key={day} active={view === 'liuri' && day === liuriDay} onClick={() => { onDayChange(day); onViewChange('liuri'); }} title={`\u521d${day}`} />
            ))}
          </div>
        </TimeSection>

        <TimeSection label={'\u6d41\u65f6'} hint={'\u7cbe\u7ec6\u5230\u65f6\u8fb0\uff0c\u70b9\u51fb\u5207\u6362'}>
          <div className="chart-time-options">
            {BRANCHES.map((branch, hour) => (
              <TimeOption key={branch} active={view === 'liushi' && hour === liushiHour} onClick={() => { onHourChange(hour); onViewChange('liushi'); }} title={`${branch}\u65f6`} />
            ))}
          </div>
        </TimeSection>
      </div>
    </div>
  );
}

function TimeSection({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="chart-time-section">
      <div className="chart-time-section-title"><strong>{label}</strong><span>{hint}</span></div>
      {children}
    </section>
  );
}

function TimeOption({ active, onClick, title, subtitle }: { active: boolean; onClick: () => void; title: string; subtitle?: string }) {
  return (
    <button type="button" className={`chart-time-option${active ? ' is-active' : ''}`} onClick={onClick} aria-pressed={active}>
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all duration-200"
      style={{
        background: active ? 'rgba(212,168,67,0.12)' : 'transparent',
        color: active ? 'var(--t-gold)' : 'var(--t-faint)',
        border: active ? '1px solid rgba(212,168,67,0.25)' : '1px solid transparent',
      }}
    >
      {children}
    </button>
  );
}
