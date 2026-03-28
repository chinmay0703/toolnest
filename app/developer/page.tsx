import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Developer Tools Online — No Signup',
  description: 'Free developer tools online. Code formatters, encoders, generators. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/developer' },
};

export default function DeveloperPage() {
  const category = getCategoryById('developer')!;
  return <CategoryPageContent category={category} />;
}
