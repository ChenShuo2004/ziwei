import { redirect } from 'next/navigation';
import { ALL_BOOKS } from '@/lib/classics';

export async function generateStaticParams() {
  return ALL_BOOKS.flatMap(book =>
    book.chapters.map((_, chapter) => ({ book: book.slug, chapter: String(chapter) }))
  );
}

export default async function LegacyChapterPage({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book, chapter } = await params;
  redirect(`/ziwei-mysteries?type=classics&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`);
}
