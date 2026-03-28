import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Finance Tools Online — No Signup',
  description: 'Free finance tools online. Currency, investments, and budgeting. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/finance' },
};

export default function FinancePage() {
  const category = getCategoryById('finance')!;
  return <CategoryPageContent category={category} />;
}
