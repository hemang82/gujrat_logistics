import Link from 'next/link';
import {
  ArrowLeftRight,
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  PackageCheck,
  Receipt,
  Truck,
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const HOME_SOLUTION_CARDS = [
  {
    id: 'lr-bilty',
    shortName: 'LR / Bilty Management',
    summary:
      'Create consignment notes fast, with party, route, goods and freight details ready to print.',
    path: '/solutions/lr-bilty-management/',
    icon: FileText,
  },
  {
    id: 'lorry-challan',
    shortName: 'Lorry Challan',
    summary: 'Issue challans for every dispatch, for full and part loads.',
    path: '/solutions/lr-bilty-management/',
    icon: ClipboardList,
  },
  {
    id: 'crossing-memo',
    shortName: 'Crossing Memo',
    summary:
      'Record branch-to-branch transfers so part loads move with a clear paper trail.',
    path: '/solutions/lr-bilty-management/',
    icon: ArrowLeftRight,
  },
  {
    id: 'lorry-hire',
    shortName: 'Lorry Hire',
    summary:
      'Record hired vehicles against each challan and keep hire details linked to the trip.',
    path: '/solutions/fleet-management/',
    icon: ClipboardCheck,
  },
  {
    id: 'e-way-bill',
    shortName: 'E-Way Bill & CEWB',
    summary:
      'Generate GSP e-way bills and consolidated e-way bills from existing LR and challan data.',
    path: '/solutions/e-way-bill-management/',
    icon: FileCheck2,
  },
  {
    id: 'delivery-management',
    shortName: 'Delivery Management',
    summary:
      'Track consignments to delivery and keep status visible to every branch.',
    path: '/solutions/transport-management-software/',
    icon: PackageCheck,
  },
  {
    id: 'fleet-driver',
    shortName: 'Fleet & Driver Management',
    summary: 'Keep vehicle and driver records organised in one place.',
    path: '/solutions/fleet-management/',
    icon: Truck,
  },
  {
    id: 'billing-accounts',
    shortName: 'Billing & Accounts',
    summary:
      'Raise freight bills for Paid, To-Pay and TBB, with branch cash books, ledgers and reports.',
    path: '/solutions/transport-billing-invoicing/',
    icon: Receipt,
  },
];

export function SolutionCards() {
  return (
    <section
      aria-labelledby="key-solutions-heading"
      className="bg-white py-14 md:py-24 border-t border-[#0F766E]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headingId="key-solutions-heading"
          eyebrow="Key Solutions"
          title="Confirmed modules covering your complete freight lifecycle."
          subtitle="Manage bookings, dispatch challans, e-way bills, fleet records and freight billing inside one system."
          action={
            <Link
              href="/solutions/"
              className="inline-flex items-center gap-2 rounded-full border border-[#0F766E]/25 bg-[#F3F7F7] px-5 py-2.5 text-sm font-bold text-[#0F766E] hover:bg-[#0F766E] hover:text-white transition-colors w-fit"
            >
              See All Features
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          }
        />

        {/* Max 3 Cards per Row on Desktop, 1 per Row on Mobile — Compact Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {HOME_SOLUTION_CARDS.map((solution) => {
            const Icon = solution.icon;

            return (
              <Link
                key={solution.id}
                href={solution.path}
                className="group rounded-2xl bg-[#F3F7F7] p-3.5 sm:p-4 border border-[#0F766E]/10 hover:bg-white hover:shadow-[0_14px_32px_rgba(15,118,110,0.09)] hover:border-[#0F766E]/35 transition-all flex items-start gap-3"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white flex items-center justify-center transition-colors shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-extrabold text-[#06262A] group-hover:text-[#0F766E] transition-colors leading-snug">
                      {solution.shortName}
                    </h3>
                    <ArrowRight
                      className="w-4 h-4 text-[#0F766E] shrink-0 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-0.5 text-base text-[#52666B] leading-snug">
                    {solution.summary}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
