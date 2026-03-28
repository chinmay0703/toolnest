import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Image Tools Online — No Signup',
  description: 'Free image tools online. Edit, convert, compress images. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/image' },
};

export default function ImagePage() {
  const category = getCategoryById('image')!;
  return <CategoryPageContent category={category} />;
}
