import { redirect } from 'next/navigation';

export default async function LegacyLibrarySearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim();
  redirect(q ? `/ziwei-mysteries?type=classics&q=${encodeURIComponent(q)}` : '/ziwei-mysteries?type=classics');
}
