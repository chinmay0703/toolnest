import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Design Tools Online — No Signup',
  description: 'Free design tools online. Drawing, fonts, and design utilities. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/design' },
};

export default function DesignPage() {
  const category = getCategoryById('design')!;
  return <CategoryPageContent category={category} />;
}
