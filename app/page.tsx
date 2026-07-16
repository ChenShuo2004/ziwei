'use client';

import HomeScrollStage, { type HomeModule } from '@/components/HomeScrollStage';
import SiteHeader from '@/components/layout/SiteHeader';
import { useLocale } from '@/components/LocaleProvider';

type Locale = 'zh' | 'en';

const content: Record<Locale, {
  brandSubtitle: string;
  nav: {
    chart: string;
    heming: string;
    mysteries: string;
  };
  skip: string;
  srTitle: string;
  beamLabel: string;
  beamTitle: string;
  beamButton: string;
  footer: Array<{ href: string; text: string }>;
  modules: HomeModule[];
}> = {
  zh: {
    brandSubtitle: '紫微斗数 · 三纪',
    nav: {
      chart: '起盘',
      heming: '合盘',
      mysteries: '紫薇秘术',
    },
    skip: '跳转到主要内容',
    srTitle: 'ziwei 紫微斗数在线排盘 · AI 命盘解读 · 合盘 · 命运双胞胎',
    beamLabel: 'ziwei 紫微斗数文化研究平台',
    beamTitle: '以命盘为入口，进入天 · 地 · 人三纪体系',
    beamButton: '查看命盘',
    footer: [
      { href: '/chart', text: '01 起盘' },
      { href: '/heming', text: '02 合盘' },
      { href: '/ziwei-mysteries', text: '03 紫薇秘术' },
    ],
    modules: [
      {
        no: '01',
        eyebrow: 'DESTINY ENGINE',
        title: '紫微命盘',
        description: '输入生辰，查看您的紫微命盘与传统知识解读',
        href: '/chart',
        image: '/images/scenes/home-ziwei-doushu-b.jpg',
      },
      {
        no: '02',
        eyebrow: 'SYNASTRY',
        title: '合盘分析',
        description: '对比两个人命盘，研究宫位与星曜在关系中的应用',
        href: '/heming',
        image: '/images/scenes/synastry.webp',
      },
      {
        no: '03',
        eyebrow: 'CHART TWINS',
        title: '命理学双子',
        description: '匹配同命盘配置，研究相同星曜与宫位组合的数据样本',
        href: '/twins',
        image: '/images/scenes/destiny-twins.webp',
      },
      {
        no: '04',
        eyebrow: 'TIAN JI',
        title: '天纪 · 命理',
        description: '上知天文 · 紫微斗数命理体系',
        href: '/tianji',
        image: '/images/scenes/sanji-tianji.jpg',
      },
      {
        no: '05',
        eyebrow: 'DI JI',
        title: '地纪 · 堪舆',
        description: '下知地理 · 风水堪舆经典',
        href: '/diji',
        image: '/images/scenes/sanji-diji.jpg',
      },
      {
        no: '06',
        eyebrow: 'REN JI',
        title: '人纪 · 中医',
        description: '中知人事 · 黄帝内经养生纲领',
        href: '/renji',
        image: '/images/scenes/sanji-renji.jpg',
      },
      {
        no: '07',
        eyebrow: 'ACADEMY',
        title: '学术中心',
        description: '紫薇秘术、古籍原文与学习入口',
        href: '/ziwei-mysteries',
        image: '/images/scenes/hero-clean.jpg',
      },
    ],
  },
  en: {
    brandSubtitle: 'Zi Wei Dou Shu · Three Disciplines',
    nav: {
      chart: 'Chart',
      heming: 'Synastry',
      mysteries: 'Mysteries',
    },
    skip: 'Skip to main content',
    srTitle: 'ziwei charting · AI interpretation · synastry · chart twins',
    beamLabel: 'ziwei RESEARCH PLATFORM',
    beamTitle: 'Use the chart as the doorway into Heaven, Earth, and Human systems',
    beamButton: 'Open Chart',
    footer: [
      { href: '/chart', text: '01 Chart' },
      { href: '/heming', text: '02 Synastry' },
      { href: '/ziwei-mysteries', text: '03 Mysteries' },
    ],
    modules: [
      {
        no: '01',
        eyebrow: 'DESTINY ENGINE',
        title: 'Zi Wei Chart',
        description: 'Enter birth data to view a Zi Wei chart with traditional interpretation',
        href: '/chart',
        image: '/images/scenes/home-ziwei-doushu-b.jpg',
      },
      {
        no: '02',
        eyebrow: 'SYNASTRY',
        title: 'Synastry',
        description: 'Compare two charts and study how palaces and stars interact in relationships',
        href: '/heming',
        image: '/images/scenes/synastry.webp',
      },
      {
        no: '03',
        eyebrow: 'CHART TWINS',
        title: 'Chart Twins',
        description: 'Explore data samples with matching chart structures and star placements',
        href: '/twins',
        image: '/images/scenes/destiny-twins.webp',
      },
      {
        no: '04',
        eyebrow: 'TIAN JI',
        title: 'Heaven · Destiny',
        description: 'Astronomy, timing, and the Zi Wei destiny system',
        href: '/tianji',
        image: '/images/scenes/sanji-tianji.jpg',
      },
      {
        no: '05',
        eyebrow: 'DI JI',
        title: 'Earth · Feng Shui',
        description: 'Geography, space, and classical feng shui references',
        href: '/diji',
        image: '/images/scenes/sanji-diji.jpg',
      },
      {
        no: '06',
        eyebrow: 'REN JI',
        title: 'Human · Medicine',
        description: 'Human affairs, medicine, and wellness from classical systems',
        href: '/renji',
        image: '/images/scenes/sanji-renji.jpg',
      },
      {
        no: '07',
        eyebrow: 'ACADEMY',
        title: 'Mysteries',
        description: 'Knowledge notes, classical texts, and study references',
        href: '/ziwei-mysteries',
        image: '/images/scenes/hero-clean.jpg',
      },
    ],
  },
};

export default function HomePage() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <main className="ziwei-home">
      <a className="skip-link" href="#main-content">{t.skip}</a>

      <SiteHeader active="home" locale={locale} />

      <h1 className="sr-only">{t.srTitle}</h1>

      <HomeScrollStage modules={t.modules} />

      <section className="beam">
        <p>{t.beamLabel}</p>
        <h2>{t.beamTitle}</h2>
        <a className="beam-button" href="/chart">{t.beamButton}</a>
      </section>

      <footer className="ziwei-footer">
        <nav aria-label="页脚导航">
          {t.footer.map((link) => <a href={link.href} key={link.href}>{link.text}</a>)}
        </nav>
        <div className="legal">
          <a href="/terms">免责声明</a>
          <a href="/privacy">隐私</a>
          <a href="mailto:feedback@wdyziweidoushu666.com?subject=%E8%BF%9D%E6%B3%95%E5%92%8C%E4%B8%8D%E8%89%AF%E4%BF%A1%E6%81%AF%E4%B8%BE%E6%8A%A5">举报</a>
          <a href="https://beian.miit.gov.cn/">渝ICP备2026013379号-1</a>
          <a href="https://beian.mps.gov.cn/">渝公网安备50019002505469号</a>
        </div>
      </footer>
    </main>
  );
}
