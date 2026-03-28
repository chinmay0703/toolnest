import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Security Tools Online — No Signup',
  description: 'Free security tools online. Encryption, hashing, password tools. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/security' },
};

export default function SecurityPage() {
  const category = getCategoryById('security')!;
  return <CategoryPageContent category={category} />;
}
