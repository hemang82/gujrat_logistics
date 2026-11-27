import Link from 'next/link';
import { ArrowRight, CheckCircle2, Layers, Truck } from 'lucide-react';
import { DemoCtaRow, SectionHeader } from './SectionHeader';

const OPERATIONAL_MODES = [
  {
    title: 'Full Truckload (FTL)',
    icon: Truck,
    bullets: [
      'Book and dispatch full loads with a lorry challan',
      'Record lorry hire and advances against each trip',
      'Generate GSP e-way bills and freight bills per trip',
    ],
    href: '/industries/ftl-transporters/',
    linkLabel: 'Explore FTL workflow',
  },
  {
    title: 'Part Truckload (PTL)',
    icon: Layers,
    bullets: [
      'Combine multiple LRs onto a single lorry challan',
      'Record crossing memos for branch-to-branch transfers',
      'Generate consolidated e-way bills (CEWB) and Paid, To-Pay or TBB bills',
    ],
    href: '/industries/ptl-transporters/',
    linkLabel: 'Explore PTL workflow',
  },
];

export function FtlPtlSection() {
  return (
    <section
      aria-labelledby="ftl-ptl-heading"
      className="bg-[#F3F7F7] py-14 md:py-24 border-t border-[#0F766E]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headingId="ftl-ptl-heading"
          eyebrow="FTL & PTL Operations"
          title="Built for Full Truckload (FTL) and Part Truckload (PTL)"
          subtitle="Run dedicated single-party trips and consolidated multi-LR loads from the same booking desk."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
          {OPERATIONAL_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.title}
                className="rounded-3xl bg-white p-4 sm:p-5 border border-[#0F766E]/12 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F3F7F7] text-[#0F766E] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#06262A] tracking-tight">
                      {mode.title}
                    </h3>
                  </div>

                  <ul className="space-y-1.5 border-t border-[#0F766E]/10 pt-2.5">
                    {mode.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-base text-[#52666B] leading-snug"
                      >
                        <CheckCircle2
                          className="w-4.5 h-4.5 text-[#0F766E] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={mode.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E] hover:text-[#0A4F4A]"
                >
                  {mode.linkLabel}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>

        <DemoCtaRow
          prompt="Need dedicated FTL workflows, PTL crossing memos or both in your account?"
          secondaryHref="/industries/"
          secondaryLabel="View Industries"
        />
      </div>
    </section>
  );
}
