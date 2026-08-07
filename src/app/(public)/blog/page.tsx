import { Metadata } from 'next';
export default function BlogPage() {
  return (
    <main className="pt-32 pb-20 bg-gray-50 min-h-screen text-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Logistics Resources & Blog</h1>
        <p className="text-xl text-gray-600 mb-12">Learn how to digitize and scale your transport business.</p>
        <div className="p-12 bg-white rounded-2xl border border-gray-200">
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
