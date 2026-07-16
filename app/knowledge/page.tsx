import { redirect } from 'next/navigation';

export default function LegacyKnowledgePage() {
  redirect('/ziwei-mysteries?type=knowledge');
}
