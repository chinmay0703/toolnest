import { Metadata } from 'next';
import { CategoryPageContent } from '@/components/tools/CategoryPage';
import { getCategoryById } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Free Camera Tools Online — No Signup',
  description: 'Free camera tools online. Webcam and scanner tools. No signup required. Runs 100% in your browser.',
  alternates: { canonical: 'https://toolnest.vercel.app/camera' },
};

export default function CameraPage() {
  const category = getCategoryById('camera')!;
  return <CategoryPageContent category={category} />;
}
