import { redirect } from 'next/navigation';
import { ALL_BOOKS } from '@/lib/classics';

export async function generateStaticParams() {
  return ALL_BOOKS.map(book => ({ book: book.slug }));
}

export default async function LegacyBookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;
  redirect(`/ziwei-mysteries?type=classics&book=${encodeURIComponent(book)}`);
}
