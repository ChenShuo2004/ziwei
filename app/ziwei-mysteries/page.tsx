import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import { getMysteryItems, getMysteryKnowledgeReader, getMysteryReader } from '@/lib/ziwei-mysteries';
import ZiweiMysteriesClient from './ZiweiMysteriesClient';
import MysteriesHero from './MysteriesHero';

type ZiweiMysteriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: '紫薇秘术 · 知识讲解与古籍原文',
  description: '紫薇秘术统一整合紫微斗数知识讲解、14 主星体系、宫位解读、古籍原文与典籍注解。',
  keywords: ['紫薇秘术', '紫微斗数', '紫微斗数古籍', '紫微斗数知识', '倪海厦', '紫微斗数全集'],
  openGraph: {
    title: '紫薇秘术',
    description: '知识讲解、星曜体系、宫位解读与古籍原文的统一入口。',
    type: 'website',
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ZiweiMysteriesPage({ searchParams }: ZiweiMysteriesPageProps) {
  const params = await searchParams;
  const items = getMysteryItems();
  const reader = getMysteryReader(firstParam(params?.book), firstParam(params?.chapter));
  const knowledgeReader = getMysteryKnowledgeReader(firstParam(params?.star), firstParam(params?.topic));

  return (
    <main className="ziwei-home mysteries-page">
      <SiteHeader active="mysteries" />

      <MysteriesHero />

      <ZiweiMysteriesClient items={items} reader={reader} knowledgeReader={knowledgeReader} />
    </main>
  );
}
