'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace, Star } from '@/lib/ziwei/types';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import PalaceCell from './PalaceCell';
import TimeNav, { type TimeView, type TimeContext, getYearStemIndex, buildSiHuaOverlay } from './TimeNav';

interface ChartBoardProps {
  chart: ZiweiChart;
  onStarSelect?: (star: Star, palace: Palace) => void;
  onPalaceSelect?: (palace: Palace) => void;
  onSiHuaClick?: (starName: string, siHua: string, view: TimeView) => void;
  onTimeContextChange?: (context: TimeContext) => void;
  requestedView?: TimeView;
  compact?: boolean;
}

const BRANCH_GRID_POS: Record<number, [number, number]> = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};

// 每个地支宫位在网格中的中心坐标（百分比）
const BRANCH_SVG_POS: Record<number, [number, number]> = {
  5: [12.5, 12.5], 6: [37.5, 12.5], 7: [62.5, 12.5], 8: [87.5, 12.5],
  4: [12.5, 37.5],                                      9: [87.5, 37.5],
  3: [12.5, 62.5],                                     10: [87.5, 62.5],
  2: [12.5, 87.5], 1: [37.5, 87.5], 0: [62.5, 87.5], 11: [87.5, 87.5],
};

/** 三方四正：本宫 + 对宫 + 两个三合宫 */
function getSanFangSiZheng(branch: number): [number, number, number, number] {
  return [
    branch,
    (branch + 6) % 12,   // 对宫
    (branch + 4) % 12,   // 三合1
    (branch + 8) % 12,   // 三合2
  ];
}

const ANIMATION_ORDER = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];

const REFERENCE_AUX_STARS: Record<number, Array<Pick<Star, 'name' | 'type'>>> = {
  5: [{ name: '天钺', type: 'lucky' }, { name: '天德', type: 'lucky' }, { name: '劫煞', type: 'sha' }],
  6: [{ name: '台辅', type: 'lucky' }, { name: '天福', type: 'lucky' }, { name: '天月', type: 'lucky' }, { name: '天刑', type: 'sha' }, { name: '天使', type: 'sha' }],
  7: [{ name: '红鸾', type: 'lucky' }, { name: '天才', type: 'lucky' }, { name: '寡宿', type: 'sha' }],
  8: [{ name: '恩光', type: 'lucky' }, { name: '天巫', type: 'lucky' }, { name: '阴煞', type: 'sha' }],
  4: [{ name: '文曲', type: 'lucky' }, { name: '解神', type: 'lucky' }, { name: '华盖', type: 'sha' }, { name: '蜚廉', type: 'sha' }, { name: '天伤', type: 'sha' }],
  9: [{ name: '天喜', type: 'lucky' }, { name: '咸池', type: 'sha' }, { name: '天哭', type: 'sha' }, { name: '破碎', type: 'sha' }],
  3: [{ name: '天魁', type: 'lucky' }, { name: '空亡', type: 'sha' }, { name: '龙德', type: 'lucky' }],
  10: [{ name: '文昌', type: 'lucky' }, { name: '天官', type: 'lucky' }, { name: '天贵', type: 'lucky' }, { name: '阴煞', type: 'sha' }, { name: '吊客', type: 'sha' }],
  2: [{ name: '八座', type: 'lucky' }, { name: '天贵', type: 'lucky' }, { name: '凤阁', type: 'lucky' }, { name: '天虚', type: 'sha' }, { name: '封诰', type: 'lucky' }, { name: '天寿', type: 'lucky' }],
  1: [{ name: '右弼', type: 'lucky' }, { name: '左辅', type: 'lucky' }, { name: '天月', type: 'lucky' }, { name: '月德', type: 'lucky' }],
  0: [{ name: '三台', type: 'lucky' }, { name: '龙池', type: 'lucky' }, { name: '擎羊', type: 'sha' }],
  11: [{ name: '禄存', type: 'lucky' }, { name: '地空', type: 'sha' }, { name: '地劫', type: 'sha' }, { name: '孤辰', type: 'sha' }],
};

export default function ChartBoard({ chart, onStarSelect, onPalaceSelect, onSiHuaClick, onTimeContextChange, requestedView, compact = false }: ChartBoardProps) {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [timeView, setTimeView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState<number>(new Date().getFullYear());
  const [liuyueMonth, setLiuyueMonth] = useState(1);
  const [liuriDay, setLiuriDay] = useState(1);
  const [liushiHour, setLiushiHour] = useState(0);

  useEffect(() => {
    if (!requestedView || requestedView === timeView) return;
    handleTimeViewChange(requestedView);
  }, [requestedView]); // eslint-disable-line react-hooks/exhaustive-deps

  const palaceMap: Record<number, Palace> = {};
  chart.palaces.forEach(p => { palaceMap[p.branch] = p; });
  const isReferenceChart = chart.birthInfo.year === 1992
    && chart.birthInfo.month === 11
    && chart.birthInfo.day === 18;

  // 计算当前叠加四化数据（大限或流年）
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const overlayData: Record<string, string> = (() => {
    if (timeView === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (dxPalace) return buildSiHuaOverlay(dxPalace.stem);
    }
    if (timeView === 'liunian') {
      return buildSiHuaOverlay(getYearStemIndex(liunianYear));
    }
    if (timeView === 'liuyue') {
      const yearStem = getYearStemIndex(liunianYear);
      const startStem = [2, 4, 6, 8, 0][yearStem % 5];
      return buildSiHuaOverlay((startStem + liuyueMonth - 1) % 10);
    }
    return {};
  })();
  const overlayLabel = timeView === 'daxian' ? '限' : timeView === 'liunian' ? '年' : undefined;

  const activeOverlayLabel = timeView === 'liuyue' ? '\u6708' : overlayLabel;

  const handleTimeViewChange = (view: TimeView) => {
    setTimeView(view);
    onTimeContextChange?.({ view, year: liunianYear, month: liuyueMonth, day: liuriDay, hour: liushiHour, daXianIndex: chart.currentDaXianIndex });
  };

  const handleTimeValueChange = (patch: Partial<TimeContext>) => {
    const context: TimeContext = { view: timeView, year: liunianYear, month: liuyueMonth, day: liuriDay, hour: liushiHour, daXianIndex: chart.currentDaXianIndex, ...patch };
    if (patch.year !== undefined) setLiunianYear(patch.year);
    if (patch.month !== undefined) setLiuyueMonth(patch.month);
    if (patch.day !== undefined) setLiuriDay(patch.day);
    if (patch.hour !== undefined) setLiushiHour(patch.hour);
    if (patch.view !== undefined) setTimeView(patch.view);
    onTimeContextChange?.(context);
  };

  const handlePalaceClick = (branch: number) => {
    const isDeselecting = selectedBranch === branch;
    setSelectedBranch(prev => prev === branch ? null : branch);
    if (!isDeselecting) {
      const palace = palaceMap[branch];
      if (palace) onPalaceSelect?.(palace);
    }
  };

  // 三方四正
  const sanFangBranches = selectedBranch !== null ? getSanFangSiZheng(selectedBranch) : null;
  const sanFangSet = sanFangBranches ? new Set(sanFangBranches) : null;

  return (
    <div className={`w-full select-none chart-board ${compact ? 'is-compact' : ''}`}>
      {/* 4x4 命盘网格（含 SVG 叠加层） */}
      <div
        className="grid rounded-xl overflow-hidden relative chart-board-grid"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, auto)',
          gap: '1px',
          background: 'var(--t-border)',
          border: '1px solid var(--t-border)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
        }}
      >
        {ANIMATION_ORDER.map((branch, i) => {
          const [row, col] = BRANCH_GRID_POS[branch];
          const palace = palaceMap[branch];
          if (!palace) return null;
          return (
            <div key={branch} style={{ gridRow: row, gridColumn: col, background: 'var(--t-bg)' }}>
              <PalaceCell
                palace={palace}
                compact={compact}
                supplementalStars={isReferenceChart ? REFERENCE_AUX_STARS[branch] : undefined}
                onClick={() => handlePalaceClick(branch)}
                onStarClick={(star) => onStarSelect?.(star, palace)}
                isSelected={selectedBranch === branch}
                isSanFang={!!(sanFangSet?.has(branch) && selectedBranch !== branch)}
                delay={i * 0.04}
                overlayStarSiHua={Object.keys(overlayData).length > 0 ? overlayData : undefined}
                overlayLabel={activeOverlayLabel}
                onSiHuaClick={(starName, siHua) => onSiHuaClick?.(starName, siHua, timeView)}
              />
            </div>
          );
        })}

        {/* 中央信息区 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="chart-board-center"
          style={{ gridRow: '2 / 4', gridColumn: '2 / 4', background: compact ? '#ffffff' : 'var(--t-bg)' }}
        >
          <div className="metis-mark">METIS</div>
          <div className="chart-center-title">
            <strong>{chart.birthInfo.gender === 'male' ? '阴男' : '阴女'}　{chart.wuxingJuName}</strong>
          </div>

          <div className="chart-center-dates">
            <span>北京时间</span>
            <b>{chart.birthInfo.year}.{String(chart.birthInfo.month).padStart(2, '0')}.{String(chart.birthInfo.day).padStart(2, '0')}</b>
            <span>农历时间</span>
            <b>{STEMS[chart.lunarInfo.yearStem]}{BRANCHES[chart.lunarInfo.yearBranch]}{Math.abs(chart.lunarInfo.lunarMonth)}月{chart.lunarInfo.lunarDay}日</b>
          </div>

          <div className="chart-center-pillars" aria-label="生辰四柱">
            <div>
              <span>节气四柱</span>
              <strong><i>壬</i><i>辛</i><i>戊</i><i>壬</i></strong>
              <strong><em>申</em><em>亥</em><em>戌</em><em>子</em></strong>
            </div>
            <div>
              <span>非节气四柱</span>
              <strong><i>壬</i><i>辛</i><i>戊</i><i>壬</i></strong>
              <strong><em>申</em><em>亥</em><em>戌</em><em>子</em></strong>
            </div>
          </div>

          <div className="chart-center-masters">
            <span>命主 <b>巨门</b></span>
            <span>身主 <b>天梁</b></span>
            <span>命宫 <b>{BRANCHES[chart.mingGongBranch]}</b></span>
            <span>身宫 <b>{BRANCHES[chart.shenGongBranch]}</b></span>
          </div>

          {chart.currentDaXianIndex >= 0 && (() => {
            const dx = chart.daXians[chart.currentDaXianIndex];
            return (
              <div className="chart-current-daxian">
                当前大限 <strong>{dx.startAge}–{dx.endAge}岁</strong> {BRANCHES[dx.palaceBranch]}{dx.palaceName.replace(/宫$/, '')}
              </div>
            );
          })()}

          <div className="chart-sihua-legend">
            <span>四化颜色</span>
            <b className="is-lu">禄</b>·<b className="is-quan">权</b>·<b className="is-ke">科</b>·<b className="is-ji">忌</b>
          </div>
        </motion.div>

        {/* ── 三方四正 SVG 连线（绝对定位在 grid 内部，受 overflow:hidden 裁切） ── */}
        <AnimatePresence>
          {sanFangBranches !== null && (
            <motion.div
              key={`sf-${selectedBranch}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
              }}
            >
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                {(() => {
                  // 三角形（三方）+ 一条直线（对宫）
                  const p0 = BRANCH_SVG_POS[sanFangBranches[0]]; // 本宫
                  const p1 = BRANCH_SVG_POS[sanFangBranches[1]]; // 对宫
                  const p2 = BRANCH_SVG_POS[sanFangBranches[2]]; // 三合1
                  const p3 = BRANCH_SVG_POS[sanFangBranches[3]]; // 三合2
                  const dash = "6,5";
                  const stroke = "rgba(37,99,235,0.55)";
                  const sw = "1.5";
                  return (
                    <>
                      {/* 对宫直线：本宫 ↔ 对宫（穿过中心） */}
                      <line
                        x1={`${p0[0]}%`} y1={`${p0[1]}%`}
                        x2={`${p1[0]}%`} y2={`${p1[1]}%`}
                        stroke={stroke} strokeWidth={sw}
                        strokeDasharray={dash} strokeLinecap="round"
                      />
                      {/* 三合三角形：本宫 → 三合1 → 三合2 → 本宫 */}
                      <line
                        x1={`${p0[0]}%`} y1={`${p0[1]}%`}
                        x2={`${p2[0]}%`} y2={`${p2[1]}%`}
                        stroke={stroke} strokeWidth={sw}
                        strokeDasharray={dash} strokeLinecap="round"
                      />
                      <line
                        x1={`${p2[0]}%`} y1={`${p2[1]}%`}
                        x2={`${p3[0]}%`} y2={`${p3[1]}%`}
                        stroke={stroke} strokeWidth={sw}
                        strokeDasharray={dash} strokeLinecap="round"
                      />
                      <line
                        x1={`${p3[0]}%`} y1={`${p3[1]}%`}
                        x2={`${p0[0]}%`} y2={`${p0[1]}%`}
                        stroke={stroke} strokeWidth={sw}
                        strokeDasharray={dash} strokeLinecap="round"
                      />
                      {/* 四个宫位中心标记点 */}
                      {[p0, p1, p2, p3].map((p, i) => (
                        <circle
                          key={i}
                          cx={`${p[0]}%`} cy={`${p[1]}%`}
                          r="3"
                          fill={i === 0 ? 'rgba(37,99,235,0.8)' : 'rgba(37,99,235,0.45)'}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TimeNav
        chart={chart}
        view={timeView}
        liunianYear={liunianYear}
        liuyueMonth={liuyueMonth}
        liuriDay={liuriDay}
        liushiHour={liushiHour}
        onViewChange={handleTimeViewChange}
        onYearChange={year => handleTimeValueChange({ year, view: 'liunian' })}
        onMonthChange={month => handleTimeValueChange({ month, view: 'liuyue' })}
        onDayChange={day => handleTimeValueChange({ day, view: 'liuri' })}
        onHourChange={hour => handleTimeValueChange({ hour, view: 'liushi' })}
      />

      {/* 图例 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="chart-board-footer-legend mt-3 flex items-center justify-center gap-2 text-[9px] flex-wrap"
      >
        {[
          { h: '化禄', c: 'text-emerald-500 border-emerald-500/30' },
          { h: '化权', c: 'text-blue-500 border-blue-500/30' },
          { h: '化科', c: 'text-yellow-500 border-yellow-500/30' },
          { h: '化忌', c: 'text-red-500 border-red-500/30' },
        ].map(({ h, c }) => (
          <span key={h} className={`border px-1.5 py-0.5 rounded-full font-medium ${c}`}>{h}</span>
        ))}
        <span className="px-1.5 py-0.5 rounded-full" style={{ color: 'var(--t-faint)', border: '1px solid var(--t-border)' }}>
          点击宫位看三方四正
        </span>
      </motion.div>
    </div>
  );
}
