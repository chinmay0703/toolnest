import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Education Tools Online — No Signup',
  description: 'Free education tools online. Learning, quizzes, and study aids. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/education' },
};

export default function EducationPage() {
  const category = getCategoryById('education')!;
  return <CategoryPageContent category={category} />;
}
