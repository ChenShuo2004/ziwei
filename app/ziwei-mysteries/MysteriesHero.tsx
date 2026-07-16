'use client';

import { useLocale } from '@/components/LocaleProvider';

export default function MysteriesHero() {
  const { locale } = useLocale();
  return (
    <section className="mysteries-hero">
      <div className="library-eyebrow"><span /><strong>ZIWEI MYSTERIES</strong><span /></div>
      <h1>{locale === 'en' ? 'Zi Wei Mysteries' : '紫薇秘术'}</h1>
      <p>{locale === 'en' ? 'A research entrance combining chart foundations, star systems, palace interpretation and classical source texts.' : '汇合命盘基础、星曜体系、宫位解读与古籍原文，把知识讲解和典籍检索放在同一个研究入口里。'}</p>
    </section>
  );
}
