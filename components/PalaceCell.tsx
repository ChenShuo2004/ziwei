'use client';
import { motion } from 'framer-motion';
import type { Palace, Star } from '@/lib/ziwei/types';
import { STEMS, BRANCHES } from '@/lib/ziwei/constants';
import clsx from 'clsx';

interface PalaceCellProps {
  palace: Palace;
  onClick?: () => void;
  onStarClick?: (star: Star) => void;
  isSelected?: boolean;
  isSanFang?: boolean;
  delay?: number;
  compact?: boolean;
  supplementalStars?: Array<Pick<Star, 'name' | 'type'>>;
  /** 叠加四化：星名 → 四化类型（'禄'/'权'/'科'/'忌'） */
  overlayStarSiHua?: Record<string, string>;
  /** 叠加标签：'年'（流年）或 '限'（大限） */
  overlayLabel?: string;
  /** 点击叠加四化 badge 回调 */
  onSiHuaClick?: (starName: string, siHua: string) => void;
}

const SIHUA_STYLES: Record<string, string> = {
  '禄': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  '权': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  '科': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  '忌': 'text-red-400 bg-red-500/10 border-red-500/30',
};

const SiHuaBadge = ({
  siHua,
  overlay,
  label,
  onClick,
}: {
  siHua: string;
  overlay?: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center text-[8px] px-1 rounded-full border leading-none py-px font-bold ml-1 flex-shrink-0',
        SIHUA_STYLES[siHua],
        overlay && 'border-dashed opacity-80',
        onClick && 'cursor-pointer hover:opacity-100',
      )}
      onClick={onClick}
    >
      {overlay && label && <span className="mr-px opacity-70">{label}</span>}
      {siHua}
    </span>
  );
};

export default function PalaceCell({
  palace, onClick, onStarClick, isSelected, isSanFang, delay = 0,
  overlayStarSiHua, overlayLabel, onSiHuaClick, compact = false, supplementalStars = [],
}: PalaceCellProps) {
  const { branch, stem, name, stars, daXianAge, isCurrentDaXian, isMingGong, isShenGong } = palace;
  const ganzhi = `${STEMS[stem]}${BRANCHES[branch]}`;

  const realStars = stars.filter(star => star.name !== '空宫');
  const majorStars = realStars.filter(s => s.type === 'major');
  const minorStars = realStars.filter(s => s.type === 'minor');
  const luckyStars = realStars.filter(s => s.type === 'lucky');
  const shaStars = realStars.filter(s => s.type === 'sha');
  const existingNames = new Set(realStars.map(star => star.name));
  const supplements: Star[] = supplementalStars
    .filter(star => !existingNames.has(star.name))
    .map(star => ({ ...star, brightness: 'normal' }));
  const displayStars = [...majorStars, ...luckyStars, ...minorStars, ...shaStars, ...supplements];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      onClick={onClick}
      className={clsx(
        'relative cursor-pointer transition-all duration-200 h-full palace-cell',
        compact && 'is-compact',
      )}
      style={{
        minHeight: compact ? '128px' : '128px',
        background: isCurrentDaXian
          ? 'rgba(198,47,47,0.035)'
          : isSelected
          ? 'rgba(37,99,235,0.18)'
          : isSanFang
          ? 'rgba(37,99,235,0.09)'
          : '#ffffff',
        boxShadow: isCurrentDaXian
          ? 'inset 0 -2px 0 rgba(198,47,47,0.34)'
          : isSelected
          ? 'inset 0 0 0 1.5px rgba(37,99,235,0.7)'
          : isSanFang
          ? 'inset 0 0 0 1px rgba(37,99,235,0.4)'
          : 'none',
      }}
    >
      {/* 大限年龄 */}
      {daXianAge && (
        <div className="palace-cell-age">
          {daXianAge[0]}–{daXianAge[1]}
        </div>
      )}

      <div className="palace-star-field">
        {displayStars.length === 0 && <span className="palace-empty-star">空宫</span>}
        {displayStars.map((star, index) => {
          const overlaySiHua = overlayStarSiHua?.[star.name];
          return (
            <button
              key={`${star.name}-${index}`}
              type="button"
              className={clsx(
                'palace-vertical-star',
                `is-${star.type}`,
                star.brightness === 'dim' && 'is-dim',
              )}
              onClick={e => { e.stopPropagation(); onStarClick?.(star); }}
            >
              <span>{star.name}</span>
              {star.siHua && <SiHuaBadge siHua={star.siHua} />}
              {overlaySiHua && (
                <SiHuaBadge
                  siHua={overlaySiHua}
                  overlay
                  label={overlayLabel}
                  onClick={e => {
                    e.stopPropagation();
                    onSiHuaClick?.(star.name, overlaySiHua);
                  }}
                />
              )}
              {star.brightness && <small>{star.brightness === 'bright' ? '旺' : star.brightness === 'dim' ? '陷' : '平'}</small>}
            </button>
          );
        })}
      </div>

      <div className="palace-cell-footer">
        <span className="palace-cell-ganzhi">{ganzhi}</span>
        {isMingGong || isShenGong ? (
          <span className="palace-cell-special">
            {name.replace(/宫$/, '')}
            {isMingGong && ' · 命'}
            {isShenGong && ' · 身'}
          </span>
        ) : (
          <span className="palace-cell-name">{name.replace(/宫$/, '')}</span>
        )}
      </div>
    </motion.div>
  );
}
