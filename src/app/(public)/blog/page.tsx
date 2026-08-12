import { Metadata } from 'next';
export default function BlogPage() {
  return (
    <main className="pt-36 md:pt-40 pb-20 bg-gray-50 min-h-screen text-center">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Logistics Resources & Blog</h1>
        <p className="mb-12 text-base text-gray-600 leading-relaxed">Learn how to digitize and scale your transport business.</p>
        <div className="p-12 bg-white rounded-full border border-gray-200">
          <p className="text-gray-500 font-medium">Articles coming soon...</p>
        </div>
      </div>
    </main>
  );}


export const metadata: Metadata = {
  title: 'Blog - Logistics Insights & Updates',
  description: 'Read the latest insights, updates, and best practices in the Indian transport and logistics industry from Trust Logistic.',
  alternates: {
    canonical: 'https://trustlogistic.in/blog',
  }
};
