export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: FaqItem[] = [
  {
    question: 'What is transport management software?',
    answer:
      'It is software that digitises the daily work of a transport business, such as LR and challan creation, e-way bills, fleet records, billing and accounts, so teams stop relying on registers and spreadsheets.',
  },
  {
    question: 'Does Trust Logistic support FTL and PTL operations?',
    answer:
      'Yes. You can manage full truckload dispatches with lorry challans and lorry hire, and part truckload movements with multiple LRs per vehicle and crossing memos.',
  },
  {
    question: 'Can I generate e-way bills from Trust Logistic?',
    answer:
      'Yes. E-way bills are generated through GSP integration, including consolidated e-way bills, using the LR and challan details you already entered.',
  },
  {
    question: 'Which documents can I create?',
    answer: 'LRs (bilty), lorry challans, crossing memos and lorry hire records.',
  },
  {
    question: 'Does it handle billing for Paid, To-Pay and TBB transport?',
    answer:
      'Yes. You can raise freight bills and party invoices for Paid, To-Pay and TBB consignments.',
  },
  {
    question: 'Can I see branch-wise accounts?',
    answer:
      'Trust Logistic includes branch cash books, ledgers and reports. Contact us to discuss your branch setup.',
  },
  {
    question: 'Who is Trust Logistic for?',
    answer: 'Transport companies, fleet owners and transport brokers across India.',
  },
  {
    question: 'How do I get a demo?',
    answer:
      'Click Request a Demo, share a few details, and our team will show you the workflows that match your operations.',
  },
];

export const SOLUTIONS_OVERVIEW_FAQS: FaqItem[] = [
  {
    question: 'Do all Trust Logistic modules share one database?',
    answer:
      'Yes. Booking entries created in LR / Bilty flow directly into Lorry Challans, E-Way Bills, delivery tracking, client invoices and branch accounting ledgers without manual re-typing.',
  },
  {
    question: 'Are To-Pay, Paid and TBB billing modes supported?',
    answer:
      'Yes. Every LR can be booked as Paid, To-Pay or T.B.B. (To Be Billed), and TBB consignments group cleanly into party invoices.',
  },
  {
    question: 'Can brokers track hired truck advance and balance payouts?',
    answer:
      'Yes. The Lorry Hire module records agreed hire freight, cash/bank advances, deductions and pending balance payable to truck owners or brokers.',
  },
];

export const PRICING_FAQS: FaqItem[] = [
  {
    question: 'How much does Trust Logistic cost?',
    answer:
      'Pricing depends on the modules, branches and setup your business needs. Contact our team or request a demo and we will recommend a plan and share pricing.',
  },
  {
    question: 'Can I start with a few modules and add more later?',
    answer:
      'Yes. You can begin with the modules you need now, for example LR and challan, and discuss adding billing, e-way bill or accounts as you grow.',
  },
  {
    question: 'Is there support for my team during onboarding?',
    answer:
      'Our team will guide you through setting up your parties, vehicles and documents during onboarding.',
  },
  {
    question: 'Does pricing change with the number of branches?',
    answer:
      'Branches and users are part of the plan discussion. We will explain this clearly before you decide.',
  },
  {
    question: 'How do I get a quote?',
    answer:
      'Click Request a Demo or Contact Us, share a few details about your operations, and our team will get in touch.',
  },
];
