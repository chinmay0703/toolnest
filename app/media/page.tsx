import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Media Tools Online — No Signup',
  description: 'Free media tools online. Audio and video processing. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/media' },
};

export default function MediaPage() {
  const category = getCategoryById('media')!;
  return <CategoryPageContent category={category} />;
}
