import type { Locale } from '@/components/LocaleProvider';

export const UI_TEXT = {
  chart: { zh: '排盘', en: 'Chart' },
  heming: { zh: '合盘', en: 'Synastry' },
  mysteries: { zh: '紫薇秘术', en: 'Mysteries' },
  chartTitle: { zh: '紫微斗数排盘', en: 'Zi Wei Dou Shu Chart' },
  chartSubtitle: { zh: '输入出生信息，生成命盘与传统知识解读。', en: 'Enter birth details to generate your chart and explore traditional interpretations.' },
  startChart: { zh: '立即起盘', en: 'Generate Chart' },
  close: { zh: '关闭', en: 'Close' },
  back: { zh: '返回', en: 'Back' },
  currentSchool: { zh: '当前推演体系', en: 'Current method' },
  selectedSchool: { zh: '已切换至', en: 'Switched to' },
  chartToolbar: { zh: '命盘工具栏', en: 'Chart toolbar' },
  chartDimension: { zh: '排盘维度', en: 'Chart dimension' },
  shareChart: { zh: '分享命盘', en: 'Share chart' },
  restartChart: { zh: '重新起盘', en: 'Restart chart' },
  viewPalace: { zh: '点击宫位查看三方四正', en: 'Select a palace to view its relationships' },
  report: { zh: '报告', en: 'Report' },
  knowledge: { zh: '知识讲解', en: 'Knowledge' },
  classics: { zh: '古籍原文', en: 'Classics' },
  noData: { zh: '暂无内容', en: 'No content yet' },
  loading: { zh: '正在加载...', en: 'Loading...' },
} as const;

export type UiTextKey = keyof typeof UI_TEXT;

export function text(key: UiTextKey, locale: Locale): string {
  return UI_TEXT[key][locale];
}

export const ZIWEI_TERMS = {
  ming: { zh: '本命', en: 'Natal chart（本命）' },
  daxian: { zh: '大限', en: 'Major period（大限）' },
  liunian: { zh: '流年', en: 'Annual cycle（流年）' },
  liuyue: { zh: '流月', en: 'Monthly cycle（流月）' },
  liuri: { zh: '流日', en: 'Daily cycle（流日）' },
  liushi: { zh: '流时', en: 'Hourly cycle（流时）' },
  mingPalace: { zh: '命宫', en: 'Life Palace（命宫）' },
  spousePalace: { zh: '夫妻宫', en: 'Spouse Palace（夫妻宫）' },
  wealthPalace: { zh: '财帛宫', en: 'Wealth Palace（财帛宫）' },
  fortunePalace: { zh: '福德宫', en: 'Fortune & Wellbeing Palace（福德宫）' },
  fourTransformations: { zh: '四化', en: 'Four Transformations（四化）' },
} as const;

export function term(key: keyof typeof ZIWEI_TERMS, locale: Locale): string {
  return ZIWEI_TERMS[key][locale];
}
