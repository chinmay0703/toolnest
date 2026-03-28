import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Writing Tools Online — No Signup',
  description: 'Free writing tools online. Grammar, citations, and writing aids. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/writing' },
};

export default function WritingPage() {
  const category = getCategoryById('writing')!;
  return <CategoryPageContent category={category} />;
}
