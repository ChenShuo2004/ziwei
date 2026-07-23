'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useLocale } from '@/components/LocaleProvider';

type Locale = 'zh' | 'en';
type ActiveNav = 'home' | 'chart' | 'heming' | 'mysteries' | 'none';

interface SiteHeaderProps {
  active?: ActiveNav;
  locale?: Locale;
}

const NAV_LABELS: Record<Locale, Record<Exclude<ActiveNav, 'home' | 'none'>, string>> = {
  zh: { chart: '起盘', heming: '合盘', mysteries: '紫薇秘术' },
  en: { chart: 'Chart', heming: 'Synastry', mysteries: 'Mysteries' },
};

export default function SiteHeader({ active = 'none', locale = 'zh' }: SiteHeaderProps) {
  const router = useRouter();
  const { locale: contextLocale, setLocale } = useLocale();
  const activeLocale = locale === 'zh' && contextLocale !== 'zh' ? contextLocale : locale;
  const labels = NAV_LABELS[activeLocale];
  const backLabel = activeLocale === 'en' ? 'Back' : '返回';

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  return (
    <header className="ziwei-header" aria-label={activeLocale === 'en' ? 'Main navigation' : '主导航'}>
      <button
        className="back-button interactive-ring"
        type="button"
        aria-label={backLabel}
        onClick={handleBack}
      >
        <span aria-hidden="true">‹</span>
        <span>{backLabel}</span>
      </button>

      <nav className="top-links" aria-label={activeLocale === 'en' ? 'Quick links' : '顶部快捷入口'}>
        <Link className="interactive-ring" href="/chart" aria-current={active === 'chart' ? 'page' : undefined}>
          {labels.chart}
        </Link>
        <Link className="interactive-ring" href="/heming" aria-current={active === 'heming' ? 'page' : undefined}>
          {labels.heming}
        </Link>
        <Link className="interactive-ring" href="/ziwei-mysteries" aria-current={active === 'mysteries' ? 'page' : undefined}>
          {labels.mysteries}
        </Link>
        <span className="language-switch" aria-label={activeLocale === 'en' ? 'Language switcher' : '语言切换'}>
          <button className={activeLocale === 'zh' ? 'is-active' : undefined} type="button" onClick={() => setLocale('zh')}>
            中
          </button>
          <span>/</span>
          <button className={activeLocale === 'en' ? 'is-active' : undefined} type="button" onClick={() => setLocale('en')}>
            EN
          </button>
        </span>
        <ThemeToggle locale={activeLocale} />
      </nav>
    </header>
  );
}
