import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Health Tools Online — No Signup',
  description: 'Free health tools online. Health and fitness trackers. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/health' },
};

export default function HealthPage() {
  const category = getCategoryById('health')!;
  return <CategoryPageContent category={category} />;
}
