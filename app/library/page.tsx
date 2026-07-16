import { redirect } from 'next/navigation';

export default function LegacyLibraryPage() {
  redirect('/ziwei-mysteries?type=classics');
}
