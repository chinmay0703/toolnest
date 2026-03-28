import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Calculators Online — No Signup',
  description: 'Free calculators online. Math, finance, and utility calculators. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/calculators' },
};

export default function CalculatorsPage() {
  const category = getCategoryById('calculators')!;
  return <CategoryPageContent category={category} />;
}
