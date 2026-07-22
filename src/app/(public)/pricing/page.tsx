import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your transport business. No hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: 'Starter', desc: 'For small fleets and single branches.', price: '₹999', features: ['Up to 5 Vehicles', 'Basic LR & Challan', '1 Branch', 'Email Support'] },
            { name: 'Growth', desc: 'For growing transport businesses.', price: '₹2,499', features: ['Up to 20 Vehicles', 'Advanced Accounting', 'Up to 3 Branches', 'E-way Bill Integration', 'Phone Support'], isPopular: true },
            { name: 'Enterprise', desc: 'For large logistics networks.', price: 'Custom', features: ['Unlimited Vehicles', 'Unlimited Branches', 'Custom Reports', 'Dedicated Account Manager', '24/7 Priority Support'] }
          ].map((tier, i) => (
            <div key={i} className={`rounded-3xl p-8 border ${tier.isPopular ? 'border-brand-primary shadow-xl relative' : 'border-gray-200 shadow-sm'}`}>
              {tier.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Most Popular</div>}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{tier.desc}</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                {tier.price !== 'Custom' && <span className="text-gray-500">/mo</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="text-brand-primary font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/demo">
                <Button className={`w-full h-12 rounded-xl font-bold ${tier.isPopular ? 'bg-brand-primary hover:bg-brand-primary-dark text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                  {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
