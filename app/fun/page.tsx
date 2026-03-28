import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Fun Tools Online — No Signup',
  description: 'Free fun tools online. Games, randomizers, and fun stuff. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/fun' },
};

export default function FunPage() {
  const category = getCategoryById('fun')!;
  return <CategoryPageContent category={category} />;
}
