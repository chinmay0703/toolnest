import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Social Media Tools Online — No Signup',
  description: 'Free social media tools online. Social media helpers and generators. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/social' },
};

export default function SocialPage() {
  const category = getCategoryById('social')!;
  return <CategoryPageContent category={category} />;
}
