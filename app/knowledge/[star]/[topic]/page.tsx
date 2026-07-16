import { redirect } from 'next/navigation';
import { getAllKnowledgeRoutes } from '@/lib/seo/knowledge';

export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllKnowledgeRoutes().map(route => ({ star: route.slug, topic: route.topic }));
}

export default async function LegacyKnowledgeDetailPage({ params }: { params: Promise<{ star: string; topic: string }> }) {
  const { star, topic } = await params;
  redirect(`/ziwei-mysteries?type=knowledge&star=${encodeURIComponent(star)}&topic=${encodeURIComponent(topic)}`);
}
