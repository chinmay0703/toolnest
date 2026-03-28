import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free PDF Tools Online — No Signup',
  description: 'Free pdf tools online. Edit, convert, compress PDF files. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/pdf' },
};

export default function PdfPage() {
  const category = getCategoryById('pdf')!;
  return <CategoryPageContent category={category} />;
}
