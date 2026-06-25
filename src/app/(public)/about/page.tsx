import { ShieldCheck, Truck, Users, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'About Us - Gujarat Logistic',
  description: 'Learn about Gujarat Logistic, our mission, and our team.',
};

export default function AboutPage() {
  const stats = [
    { value: '15+', label: 'Years Experience' },
    { value: '250+', label: 'Fleet Size' },
    { value: '33', label: 'Districts Covered' },
    { value: '10K+', label: 'Happy Clients' },
  ];

  const features = [
    { icon: <ShieldCheck className="w-8 h-8" />, title: 'Reliability', desc: 'We deliver on our promises, ensuring your cargo reaches safely.' },
    { icon: <Truck className="w-8 h-8" />, title: 'Modern Fleet', desc: 'Our vehicles are equipped with GPS tracking for real-time updates.' },
    { icon: <Users className="w-8 h-8" />, title: 'Expert Team', desc: 'Dedicated professionals handling your logistics with care.' },
    { icon: <Award className="w-8 h-8" />, title: 'Excellence', desc: 'Award-winning service recognized across the logistics industry.' },
  ];

  return (
    <div className="pt-32 pb-20 bg-brand-bg min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary mb-6">About Gujarat Logistic</h1>
          <p className="text-lg text-brand-text-secondary leading-relaxed">
            Founded with a vision to revolutionize transportation in Gujarat, we are a leading logistics provider committed to safe, timely, and cost-effective delivery solutions.
          </p>
        </div>

        {/* Mission / Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-brand-primary mb-4">Our Mission</h2>
              <p className="text-brand-text-secondary leading-relaxed">
                To provide seamless and innovative logistics solutions that empower businesses to grow without boundaries. We strive to be the most trusted transport partner by prioritizing customer satisfaction and operational excellence.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-brand-primary mb-4">Our Vision</h2>
              <p className="text-brand-text-secondary leading-relaxed">
                To connect every corner of Gujarat through a robust, technology-driven logistics network, making transportation faster, transparent, and completely reliable for everyone.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-brand-primary-dark rounded-3xl p-8 md:p-12 mb-20 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-bold text-brand-primary-light mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h2 className="text-3xl font-bold text-center text-brand-text-primary mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-brand-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-brand-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
