import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Productivity Online — No Signup',
  description: 'Free productivity online. Timers, notes, generators, trackers. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/productivity' },
};

export default function ProductivityPage() {
  const category = getCategoryById('productivity')!;
  return <CategoryPageContent category={category} />;
}
