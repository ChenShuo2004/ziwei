import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

type Locale = 'zh' | 'en';
type ActiveNav = 'home' | 'chart' | 'heming' | 'mysteries' | 'none';

interface SiteHeaderProps {
  active?: ActiveNav;
  locale?: Locale;
}

const NAV_LABELS: Record<Locale, Record<Exclude<ActiveNav, 'home' | 'none'>, string>> = {
  zh: {
    chart: '起盘',
    heming: '合盘',
    mysteries: '紫薇秘术',
  },
  en: {
    chart: 'Chart',
    heming: 'Synastry',
    mysteries: 'Mysteries',
  },
};

export default function SiteHeader({ active = 'none', locale = 'zh' }: SiteHeaderProps) {
  const labels = NAV_LABELS[locale];

  return (
    <header className="ziwei-header" aria-label="主导航">
      <Link
        className="brand interactive-ring"
        href={locale === 'en' ? '/?lang=en' : '/'}
        aria-label="ziwei 首页"
        aria-current={active === 'home' ? 'page' : undefined}
      >
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-copy">
          <strong>WARMTH</strong>
          <small>有温度阅览室</small>
        </span>
      </Link>

      <nav className="top-links" aria-label="顶部快捷入口">
        <Link className="interactive-ring" href="/chart" aria-current={active === 'chart' ? 'page' : undefined}>
          {labels.chart}
        </Link>
        <Link className="interactive-ring" href="/heming" aria-current={active === 'heming' ? 'page' : undefined}>
          {labels.heming}
        </Link>
        <Link className="interactive-ring" href="/ziwei-mysteries" aria-current={active === 'mysteries' ? 'page' : undefined}>
          {labels.mysteries}
        </Link>
        <span className="language-switch" aria-label="语言切换">
          <Link className={locale === 'zh' ? 'is-active' : undefined} href="/">
            中
          </Link>
          <span>/</span>
          <Link className={locale === 'en' ? 'is-active' : undefined} href="/?lang=en">
            EN
          </Link>
        </span>
        <ThemeToggle />
      </nav>
    </header>
  );
}
