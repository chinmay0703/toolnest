import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Text Tools Online — No Signup',
  description: 'Free text tools online. Transform, analyze, and format text. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/text' },
};

export default function TextPage() {
  const category = getCategoryById('text')!;
  return <CategoryPageContent category={category} />;
}
