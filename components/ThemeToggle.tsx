'use client';

import { useTheme } from '@/components/ThemeProvider';

type ThemeLocale = 'zh' | 'en';

export default function ThemeToggle({ className = '', locale = 'zh' }: { className?: string; locale?: ThemeLocale }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const labels = locale === 'zh'
    ? { light: '纯白', dark: '墨蓝', switchToLight: '切换到纯白主题', switchToDark: '切换到墨蓝主题' }
    : { light: 'Light', dark: 'Dark', switchToLight: 'Switch to light theme', switchToDark: 'Switch to dark theme' };

  return (
    <button
      type="button"
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      aria-label={isDark ? labels.switchToLight : labels.switchToDark}
      aria-pressed={isDark}
      onClick={toggle}
    >
      {isDark ? labels.light : labels.dark}
    </button>
  );
}
