import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Data Tools Online — No Signup',
  description: 'Free data tools online. Convert and manage data files. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/data' },
};

export default function DataPage() {
  const category = getCategoryById('data')!;
  return <CategoryPageContent category={category} />;
}
