import { HOME_FAQS, type FaqItem } from './faqs';

export interface SolutionWorkflowStep {
  step: string;
  title: string;
  detail: string;
}

export interface SolutionContent {
  slug: string;
  path: string;
  status: 'live' | 'draft';
  shortName: string;
  metaTitle?: string;
  metaDescription?: string;
  h1: string;
  eyebrow: string;
  summary: string;
  problemTitle: string;
  problemPoints: string[];
  workflowTitle: string;
  workflowSteps: SolutionWorkflowStep[];
  featureDetails: { title: string; description: string }[];
  practicalBenefits: string[];
  faqs: FaqItem[];
  relatedSolutions: string[];
  relatedIndustries: string[];
  keywords: string[];
}

export const SOLUTIONS_CONTENT: SolutionContent[] = [
  {
    slug: 'transport-management-software',
    path: '/solutions/transport-management-software/',
    status: 'live',
    shortName: 'Transport Management Software',
    metaTitle: 'Transport Management Software India | Trust Logistic',
    metaDescription:
      'Run LR, lorry challan, GSP e-way bill, fleet, delivery and branch accounts on one connected transport management software for FTL and PTL.',
    h1: 'Transport Management Software Built for Indian Freight Operations',
    eyebrow: 'Transport Management Software',
    summary:
      'Trust Logistic connects LR booking, lorry challans, GSP e-way bills, fleet records, delivery updates and branch accounts in one system, for both full truckload (FTL) and part truckload (PTL) transporters.',
    problemTitle: 'Why disconnected tools slow down transport offices',
    problemPoints: [
      'Paper bilty books and separate Excel sheets mean the same consignment is written again and again, and mistakes slip into freight, challans and bills.',
      'Branches keep their own records, so the head office waits for calls and reports to know which consignments are booked, in transit or delivered.',
      'Challan, e-way bill and billing work happens in different places, so nobody can see a full trip from booking to payment without searching through files.',
    ],
    workflowTitle: 'From booking to billing in four connected steps',
    workflowSteps: [
      {
        step: '01',
        title: 'Book the LR',
        detail:
          'Enter party, route, goods and freight once. Choose Paid, To-Pay or TBB and print the LR in your own format.',
      },
      {
        step: '02',
        title: 'Create the challan and e-way bill',
        detail:
          'Load consignments on a vehicle, issue the lorry challan and generate the GSP e-way bill or consolidated e-way bill from the same data.',
      },
      {
        step: '03',
        title: 'Track fleet and delivery',
        detail:
          'Record the vehicle, driver and any crossing memo or lorry hire, then update delivery status so every branch sees the same picture.',
      },
      {
        step: '04',
        title: 'Bill and close accounts',
        detail:
          'Raise freight bills from completed LRs and see the entries in party ledgers and branch cash books.',
      },
    ],
    featureDetails: [
      {
        title: 'Connected from LR to ledger',
        description:
          'Details entered at booking carry into challans, e-way bills, bills and accounts, so teams stop typing the same data twice.',
      },
      {
        title: 'Multi-branch operations',
        description:
          'Branches work on one shared system with branch-wise cash books and reports, so the head office sees the whole business.',
      },
      {
        title: 'Public consignment tracking',
        description:
          'A party can look up its LR itself instead of calling your office for status.',
      },
      {
        title: 'Print-ready documents',
        description:
          'Print LRs, challans, memos and bills in formats your drivers, parties and branches already recognise.',
      },
    ],
    practicalBenefits: [
      'One record per consignment, from booking to payment.',
      'Fewer repeated entries and calculation errors.',
      'Faster answers when a party asks where its consignment is.',
      'Head-office visibility across every branch.',
      'Works for full loads and part loads.',
    ],
    faqs: [
      {
        question: 'What is transport management software?',
        answer:
          'Transport management software is a system that digitises the daily work of a transport business: LR booking, challans, e-way bills, fleet records, delivery updates, billing and accounts. It replaces bilty books and scattered spreadsheets with one connected record per consignment.',
      },
      {
        question: 'Is Trust Logistic suitable for both FTL and PTL transporters?',
        answer:
          'Yes. Full truckload operations can use LRs, lorry challans and lorry hire, while part truckload operations can combine many LRs on one vehicle and use crossing memos for branch transfers.',
      },
      {
        question: 'Can my customers check the status of their consignment?',
        answer:
          'Trust Logistic includes public tracking, so a party can look up an LR without calling your office. Delivery updates entered by your team keep that status current.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/e-way-bill-management/',
      '/solutions/transport-billing-invoicing/',
      '/solutions/transport-accounting/',
    ],
    relatedIndustries: [
      '/industries/transport-companies/',
      '/industries/ftl-transporters/',
      '/industries/ptl-transporters/',
    ],
    keywords: [
      'transport management software',
      'TMS for transporters',
      'transport software India',
      'FTL PTL transport software',
      'LR to billing software',
    ],
  },
  {
    slug: 'lr-bilty-management',
    path: '/solutions/lr-bilty-management/',
    status: 'live',
    shortName: 'LR / Bilty Management',
    metaTitle: 'LR & Bilty Software for Transporters | Trust Logistic',
    metaDescription:
      'Create digital LRs, lorry challans, crossing memos and lorry hire records with Paid, To-Pay and TBB freight. Replace handwritten bilty pads.',
    h1: 'Digital LR / Bilty, Lorry Challan, Crossing Memo & Lorry Hire',
    eyebrow: 'LR / Bilty Software',
    summary:
      'Replace handwritten bilty pads with fast digital LRs, and manage lorry challans, crossing memos and lorry hire from the same booking record.',
    problemTitle: 'Operational leaks in paper LR and challan workflows',
    problemPoints: [
      'Hand-calculated freight and charges lead to arithmetic mistakes that often surface only when a party disputes the bill.',
      'Finding an old LR in a stack of bilty books takes time, and a missing copy can delay delivery or billing.',
      'The same consignment details are copied again onto the challan, memo and bill, which invites duplicate entries and mismatches.',
    ],
    workflowTitle: 'Four documents, one booking record',
    workflowSteps: [
      {
        step: '01',
        title: 'Digital LR',
        detail:
          'Create the LR with consignor, consignee, route, goods and freight, and select Paid, To-Pay or TBB.',
      },
      {
        step: '02',
        title: 'Lorry challan',
        detail:
          'Group LRs on a vehicle and issue the challan for dispatch.',
      },
      {
        step: '03',
        title: 'Crossing memo',
        detail:
          'Record transfers between branches or vehicles so part loads keep a clear paper trail.',
      },
      {
        step: '04',
        title: 'Lorry hire',
        detail:
          'Record hired-vehicle details against the trip, linked to the challan.',
      },
    ],
    featureDetails: [
      {
        title: 'Paid, To-Pay and TBB freight',
        description:
          'Book every freight type from one screen and let the system carry it into billing.',
      },
      {
        title: 'Item masters',
        description:
          'Save frequently used goods and items so booking staff select instead of typing.',
      },
      {
        title: 'Custom print formats',
        description:
          'Print LRs and related documents in layouts your parties and drivers already know.',
      },
      {
        title: 'Delivery tracking',
        description:
          'Update delivery status against each LR so branches and parties see the same status.',
      },
    ],
    practicalBenefits: [
      'Quicker booking at the counter with less handwriting.',
      'Freight totals calculated by the system, not by hand.',
      'LR records kept in one place instead of scattered bilty books.',
      'The same data reused for challans, e-way bills and billing.',
    ],
    faqs: [
      {
        question: 'What is the difference between an LR, a challan and a crossing memo?',
        answer:
          'An LR (lorry receipt, or bilty) is the consignment note for one booking. A lorry challan lists the consignments loaded on one vehicle for dispatch. A crossing memo records goods transferred between branches or vehicles, which is common in part-load (PTL) movement.',
      },
      {
        question: 'What do Paid, To-Pay and TBB mean?',
        answer:
          'Paid means the consignor pays freight at booking. To-Pay means the consignee pays on delivery. TBB (To Be Billed) means freight is billed to the party later through a freight bill. Trust Logistic supports all three.',
      },
      {
        question: 'Can I print LRs in my own format?',
        answer:
          'Trust Logistic provides print formats for LRs and related documents. Tell our team the layout you need during the demo and we will confirm it.',
      },
    ],
    relatedSolutions: [
      '/solutions/transport-management-software/',
      '/solutions/e-way-bill-management/',
      '/solutions/transport-billing-invoicing/',
      '/solutions/fleet-management/',
    ],
    relatedIndustries: [
      '/industries/ftl-transporters/',
      '/industries/ptl-transporters/',
      '/industries/transport-brokers/',
    ],
    keywords: [
      'LR software',
      'bilty software',
      'digital LR',
      'lorry challan software',
      'crossing memo',
      'lorry hire software',
    ],
  },
  {
    slug: 'e-way-bill-management',
    path: '/solutions/e-way-bill-management/',
    status: 'live',
    shortName: 'E-Way Bill Management',
    metaTitle: 'E-Way Bill Software for Transporters | Trust Logistic',
    metaDescription:
      'Generate e-way bills, update Part-B and create consolidated e-way bills through GSP integration using your LR and challan data.',
    h1: 'E-Way Bill Generation via GSP Integration',
    eyebrow: 'E-Way Bill Software',
    summary:
      'Generate, update and consolidate e-way bills from your LR and challan data through GSP integration, so staff do not re-type consignment details for every vehicle.',
    problemTitle: 'Portal friction during peak dispatch hours',
    problemPoints: [
      'Typing consignment, party and vehicle details again for every LR slows dispatch when many vehicles leave together.',
      'A wrong vehicle number or a missed Part-B update can hold a loaded truck while staff stop work to fix it.',
      'When several e-way bills travel on one vehicle, preparing a consolidated e-way bill by hand is slow and easy to get wrong.',
    ],
    workflowTitle: 'How e-way bills flow through Trust Logistic',
    workflowSteps: [
      {
        step: '01',
        title: 'Link the e-way bill to the LR',
        detail:
          'Start from an LR or challan so party and goods details are already filled in.',
      },
      {
        step: '02',
        title: 'Generate through GSP',
        detail:
          'Send the details through GSP integration to generate the e-way bill and update Part-B with vehicle details.',
      },
      {
        step: '03',
        title: 'Consolidate (CEWB)',
        detail:
          'Bundle e-way bills for consignments on one vehicle into a consolidated e-way bill.',
      },
      {
        step: '04',
        title: 'Review API logs',
        detail:
          'Check the log of each request and response for audit and troubleshooting.',
      },
    ],
    featureDetails: [
      {
        title: 'GSP API integration',
        description:
          'Generate e-way bills through a GST Suvidha Provider (GSP) connection from within the transport workflow.',
      },
      {
        title: 'Part-B updates',
        description:
          'Update vehicle details when a vehicle changes, without starting the e-way bill again.',
      },
      {
        title: 'CEWB bundling',
        description:
          'Combine multiple e-way bills for one vehicle into a consolidated e-way bill.',
      },
      {
        title: 'Branch audit',
        description:
          'Review e-way bill activity branch by branch to keep compliance visible.',
      },
    ],
    practicalBenefits: [
      'Less re-typing during busy dispatch hours.',
      'Vehicle changes handled through Part-B updates.',
      'Consolidated e-way bills prepared from existing records.',
      'A clear log of each e-way bill action for audit.',
    ],
    faqs: [
      {
        question: 'How does Trust Logistic generate e-way bills?',
        answer:
          'It uses GSP (GST Suvidha Provider) API integration. You start from an LR or challan, and the system sends the details to generate the e-way bill.',
      },
      {
        question: 'What is a consolidated e-way bill (CEWB)?',
        answer:
          'A consolidated e-way bill combines the e-way bills of several consignments moving in one vehicle into a single document. Trust Logistic supports CEWB bundling for such trips.',
      },
      {
        question: 'What is Part-B, and can I update it?',
        answer:
          'Part-B of an e-way bill holds the vehicle details. You can update it from Trust Logistic when the vehicle changes. E-way bill rules are set by authorities and can change, so confirm specific cases with your tax advisor.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/transport-management-software/',
      '/solutions/transport-billing-invoicing/',
      '/solutions/reports-analytics/',
    ],
    relatedIndustries: [
      '/industries/transport-companies/',
      '/industries/ptl-transporters/',
      '/industries/transport-brokers/',
    ],
    keywords: [
      'e-way bill software for transporters',
      'GSP e-way bill',
      'consolidated e-way bill software',
      'Part-B update',
      'e-way bill generation',
    ],
  },
  {
    slug: 'transport-billing-invoicing',
    path: '/solutions/transport-billing-invoicing/',
    status: 'live',
    shortName: 'Transport Billing & Invoicing',
    metaTitle: 'Transport Billing Software for India | Trust Logistic',
    metaDescription:
      'Turn Paid, To-Pay and TBB bookings into accurate freight bills with charge breakdowns, invoice printing and a billing register.',
    h1: 'Transport Billing & Freight Invoicing Linked to Every LR',
    eyebrow: 'Transport Billing Software',
    summary:
      'Turn completed Paid, To-Pay and TBB bookings into accurate freight bills, with charge breakdowns, invoice printing and a billing register, all linked to the original LR.',
    problemTitle: 'Revenue leakage from unbilled TBB LRs and manual bills',
    problemPoints: [
      'TBB consignments get delivered and then forgotten, so freight bills go out late or are never raised.',
      'Bills copied by hand from LRs carry wrong charges, which leads to disputes and delayed payments.',
      'Without a clear list of bills raised and amounts pending, chasing payments depends on memory and phone calls.',
    ],
    workflowTitle: 'From unbilled LR to receivable in four steps',
    workflowSteps: [
      {
        step: '01',
        title: 'Filter unbilled LRs',
        detail:
          'Pull up completed LRs that have not yet been billed, party by party.',
      },
      {
        step: '02',
        title: 'Review charges',
        detail:
          'Check freight and other charges for each LR before billing.',
      },
      {
        step: '03',
        title: 'Issue the invoice',
        detail:
          'Create the freight bill and print it for the party.',
      },
      {
        step: '04',
        title: 'Track receivables',
        detail:
          'Follow bills raised and amounts pending through the billing register.',
      },
    ],
    featureDetails: [
      {
        title: 'TBB consolidated billing',
        description:
          "Combine a party's unbilled LRs into one freight bill instead of raising many small bills.",
      },
      {
        title: 'Charge breakdown',
        description:
          'Show freight and other charges clearly so parties can verify every line.',
      },
      {
        title: 'Invoice print',
        description:
          'Print freight bills in a clean, party-ready format.',
      },
      {
        title: 'Billing register',
        description:
          'Keep a running record of every bill raised for reference and follow-up.',
      },
    ],
    practicalBenefits: [
      'Fewer unbilled LRs slipping through.',
      'Bills that match the LR, so fewer disputes.',
      'One consolidated bill per party where that suits your practice.',
      'A clear register of bills raised.',
    ],
    faqs: [
      {
        question: 'Can I create one freight bill for many TBB LRs?',
        answer:
          "Yes. Trust Logistic supports consolidated TBB billing, so you can combine a party's unbilled LRs into a single freight bill.",
      },
      {
        question: 'How do I find LRs that are not billed yet?',
        answer:
          'Filter unbilled LRs before billing, review the charges and issue the invoice. The billing register then shows which bills you have already raised.',
      },
      {
        question: 'Can I handle Paid, To-Pay and TBB bookings separately?',
        answer:
          'Yes. Paid and To-Pay collections stay tracked in branch cash books, while TBB consignments group cleanly into party freight bills.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/transport-accounting/',
      '/solutions/reports-analytics/',
      '/solutions/transport-management-software/',
    ],
    relatedIndustries: [
      '/industries/transport-companies/',
      '/industries/fleet-owners/',
      '/industries/transport-brokers/',
    ],
    keywords: [
      'transport billing software',
      'freight invoice software',
      'TBB billing',
      'freight bill software',
      'transport invoice software',
    ],
  },
  {
    slug: 'transport-accounting',
    path: '/solutions/transport-accounting/',
    status: 'live',
    shortName: 'Transport Accounting',
    metaTitle: 'Transport Accounting Software India | Trust Logistic',
    metaDescription:
      'Branch cash books, party ledgers, expense tracking and hire or driver settlements built for transport businesses, posted from your LRs.',
    h1: 'Transport Accounting, Branch Cash Books & Party Ledgers',
    eyebrow: 'Transport Accounting Software',
    summary:
      'Keep client accounts, branch cash collections, operating expenses and hire or driver settlements together, with entries posted from your LRs and bills instead of re-typed.',
    problemTitle: 'Why generic accounting tools miss transport realities',
    problemPoints: [
      'Generic tools do not understand LRs, TBB freight, lorry hire or driver advances, so accounts staff make manual entries for each of them.',
      'Cash collected at branch counters is hard to reconcile when every branch keeps its own notebook.',
      'Trip expenses and hire payments end up scattered across vouchers, so the true result of a trip is unclear.',
    ],
    workflowTitle: 'From booking entry to settled account',
    workflowSteps: [
      {
        step: '01',
        title: 'Auto-post entries',
        detail:
          'LRs, bills and settlements post to the right ledgers without re-entry.',
      },
      {
        step: '02',
        title: 'Record branch cash and expenses',
        detail:
          "Capture each branch's cash and operating expenses in its own cash book.",
      },
      {
        step: '03',
        title: 'Settle accounts',
        detail:
          'Clear party balances, lorry hire payments and driver settlements.',
      },
      {
        step: '04',
        title: 'Audit',
        detail:
          'Review ledgers and cash books branch by branch to check that the numbers agree.',
      },
    ],
    featureDetails: [
      {
        title: 'Branch cash ledger',
        description:
          "Every branch has its own cash book, so the head office sees each branch's position separately.",
      },
      {
        title: 'Client ledgers',
        description:
          "See each party's billed amount, received amount and balance in one place.",
      },
      {
        title: 'Expense tracking',
        description:
          'Record operating and trip expenses against the right branch or trip.',
      },
      {
        title: 'Hire and driver settlement',
        description:
          'Settle lorry hire and driver balances from the same system.',
      },
    ],
    practicalBenefits: [
      'Less manual posting for the accounts team.',
      'A clear cash position for every branch.',
      'Party balances ready when you follow up for payment.',
      'Hire and driver dues settled with a visible record.',
    ],
    faqs: [
      {
        question: 'What are branch cash books?',
        answer:
          'A branch cash book records the cash a branch collects and spends, such as freight collected at the counter and local expenses, so the head office can review each branch separately.',
      },
      {
        question: 'Are accounting entries posted automatically?',
        answer:
          'Entries from LRs, bills and settlements are posted to ledgers automatically, so accounts staff do not enter the same transaction twice.',
      },
      {
        question: 'Do I still need separate accounting software?',
        answer:
          "Trust Logistic covers transport-specific accounts such as branch cash books, party ledgers and hire settlements. Whether you also need a separate statutory accounting package depends on your accountant's practice.",
      },
    ],
    relatedSolutions: [
      '/solutions/transport-billing-invoicing/',
      '/solutions/reports-analytics/',
      '/solutions/driver-management/',
      '/solutions/fleet-management/',
    ],
    relatedIndustries: [
      '/industries/transport-companies/',
      '/industries/fleet-owners/',
    ],
    keywords: [
      'transport accounting software',
      'branch cash book',
      'party ledger for transporters',
      'lorry hire settlement',
      'transport expense tracking',
    ],
  },
  {
    slug: 'fleet-management',
    path: '/solutions/fleet-management/',
    status: 'live',
    shortName: 'Fleet Management',
    metaTitle: 'Fleet Management Software for Transporters | Trust Logistic',
    metaDescription:
      'Keep one registry of owned and hired trucks with documents, status, trip history and expenses linked to challans and lorry hire.',
    h1: 'Fleet & Lorry Registry for Owned and Hired Vehicles',
    eyebrow: 'Fleet Management Software',
    summary:
      'Maintain one central record of your own trucks and hired market vehicles, with documents, status, trip history and expenses linked to challans and lorry hire.',
    problemTitle: 'Managing mixed owned and attached fleets manually',
    problemPoints: [
      'Owned, attached and hired vehicles are tracked in different registers, so nobody has one complete list of vehicles.',
      'Vehicle documents are kept in files and phones, and it is easy to miss a document that needs attention.',
      'Trip history and vehicle expenses are scattered, so the cost of running a vehicle is hard to see.',
    ],
    workflowTitle: 'From vehicle registration to trip history',
    workflowSteps: [
      {
        step: '01',
        title: 'Register trucks',
        detail:
          'Add owned and hired vehicles with their details to the registry.',
      },
      {
        step: '02',
        title: 'Assign to challans',
        detail:
          'Select the vehicle when you issue a lorry challan for dispatch.',
      },
      {
        step: '03',
        title: 'Monitor status',
        detail:
          'Check the current status of each vehicle at a glance.',
      },
      {
        step: '04',
        title: 'Review trip history',
        detail:
          "Open a vehicle's past trips and expenses when you need them.",
      },
    ],
    featureDetails: [
      {
        title: 'Vehicle documents',
        description:
          'Keep vehicle document details in one place instead of scattered files.',
      },
      {
        title: 'Vehicle status',
        description:
          'See where each vehicle stands in your operation without calling around.',
      },
      {
        title: 'Lorry hire integration',
        description:
          'Link hired vehicles to lorry hire records so owned and hired trucks follow one process.',
      },
      {
        title: 'Expense history',
        description:
          'Review the expenses recorded against each vehicle over time.',
      },
    ],
    practicalBenefits: [
      'One list of every vehicle you use, owned or hired.',
      'Vehicle details selected at dispatch, not retyped.',
      'Easier follow-up on vehicle documents.',
      'Clear trip and expense history per vehicle.',
    ],
    faqs: [
      {
        question: 'Can I manage hired vehicles as well as my own trucks?',
        answer:
          'Yes. Owned and hired vehicles sit in one registry, and lorry hire records link to the trips where hired vehicles were used.',
      },
      {
        question: 'What fleet information can I store?',
        answer:
          'Vehicle records, vehicle documents, current status, trip history and expense history, all linked to your challans.',
      },
      {
        question: 'Does fleet management include GPS tracking?',
        answer:
          'The fleet module focuses on vehicle records, documents, status, trip history and expenses. If you need location tracking, ask our team about your requirement during the demo.',
      },
    ],
    relatedSolutions: [
      '/solutions/driver-management/',
      '/solutions/lr-bilty-management/',
      '/solutions/transport-accounting/',
      '/solutions/reports-analytics/',
    ],
    relatedIndustries: [
      '/industries/fleet-owners/',
      '/industries/ftl-transporters/',
      '/industries/transport-companies/',
    ],
    keywords: [
      'fleet management software for transporters',
      'truck registry software',
      'owned and hired vehicles',
      'vehicle document management',
      'fleet expense tracking',
    ],
  },
  {
    slug: 'driver-management',
    path: '/solutions/driver-management/',
    status: 'live',
    shortName: 'Driver Management',
    metaTitle: 'Driver Management Software for Transporters | Trust Logistic',
    metaDescription:
      'Maintain driver profiles, licence records, advances and per-driver ledgers, and clear trip balances through settlements.',
    h1: 'Driver Registry, License Records & Trip Ledger Management',
    eyebrow: 'Driver Management Software',
    summary:
      "Maintain clean driver records, driving licence details, advances and trip balances, so every driver's account and history is available in one place.",
    problemTitle: 'Untracked driver advances and license records create friction',
    problemPoints: [
      'Advances given to drivers are noted in notebooks or on phones, so balances are disputed at the end of the trip.',
      'Driving licence details are kept in separate files, which makes verification slow when a vehicle is about to leave.',
      'It is hard to say which driver ran which trip without searching through old challans.',
    ],
    workflowTitle: 'From driver registry to cleared balance',
    workflowSteps: [
      {
        step: '01',
        title: 'Driver registry',
        detail:
          'Add each driver with profile and driving licence details.',
      },
      {
        step: '02',
        title: 'Assign on dispatch',
        detail:
          'Select the driver when you issue the lorry challan.',
      },
      {
        step: '03',
        title: 'Log advances',
        detail:
          "Record advances and payments against the driver's ledger.",
      },
      {
        step: '04',
        title: 'Clear balances',
        detail:
          "Settle the driver's balance and close the trip account.",
      },
    ],
    featureDetails: [
      {
        title: 'Driver profiles and licence details',
        description:
          "Keep each driver's profile and DL details in one record.",
      },
      {
        title: 'Per-driver ledger',
        description:
          'See advances, payments and balances for each driver separately.',
      },
      {
        title: 'Challan history',
        description:
          'Open the challans a driver has handled to see past trips.',
      },
      {
        title: 'Settlement',
        description:
          'Clear driver balances with a recorded settlement.',
      },
    ],
    practicalBenefits: [
      'Advances recorded as they are given.',
      'Licence details at hand when assigning a driver.',
      'A clear trip history for every driver.',
      'Fewer disputes at settlement time.',
    ],
    faqs: [
      {
        question: 'How are driver advances tracked?',
        answer:
          'Advances are logged in a per-driver ledger and adjusted when the balance is settled, so both sides can see the same figures.',
      },
      {
        question: 'Can I see which trips a driver has done?',
        answer:
          'Yes. The challan history shows the challans handled by each driver.',
      },
      {
        question: 'Does it store driving licence details?',
        answer:
          'Driver profiles hold driving licence (DL) details together with the other driver information.',
      },
    ],
    relatedSolutions: [
      '/solutions/fleet-management/',
      '/solutions/transport-accounting/',
      '/solutions/lr-bilty-management/',
      '/solutions/reports-analytics/',
    ],
    relatedIndustries: [
      '/industries/fleet-owners/',
      '/industries/transport-companies/',
    ],
    keywords: [
      'driver management software',
      'driver ledger',
      'driver advance tracking',
      'driving licence records',
      'driver settlement',
    ],
  },
  {
    slug: 'reports-analytics',
    path: '/solutions/reports-analytics/',
    status: 'live',
    shortName: 'Reports & Analytics',
    metaTitle: 'Transport Reports & Registers Software | Trust Logistic',
    metaDescription:
      'Daily booking registers, challan, memo and hire reports, billing reports and summaries for every branch, ready to export.',
    h1: 'Operational Registers, Invoice Summaries & Financial Reports',
    eyebrow: 'Reports & Analytics',
    summary:
      'Generate structured daily booking registers, pending delivery reports, challan, memo and lorry hire reports and billing summaries, so your team decides with facts instead of guesswork.',
    problemTitle: 'Making daily decisions without clear operational registers',
    problemPoints: [
      "Without a daily booking register, owners rely on calls from branches to know the day's business.",
      'Pending deliveries and unbilled work stay invisible until a party complains.',
      'Collecting figures from several sheets for month-end takes time and invites errors.',
    ],
    workflowTitle: 'From question to export in four steps',
    workflowSteps: [
      {
        step: '01',
        title: 'Select the report',
        detail:
          'Choose the register or report you need.',
      },
      {
        step: '02',
        title: 'Filter',
        detail:
          'Narrow it down before viewing the figures.',
      },
      {
        step: '03',
        title: 'Verify totals',
        detail:
          'Check the totals against your records.',
      },
      {
        step: '04',
        title: 'Export',
        detail:
          'Export the report for your team, accountant or branches.',
      },
    ],
    featureDetails: [
      {
        title: 'Daily and summary registers',
        description:
          "See each day's bookings and summaries over a period.",
      },
      {
        title: 'Challan, memo and hire reports',
        description:
          'Review lorry challans, crossing memos and lorry hire activity.',
      },
      {
        title: 'Billing reports',
        description:
          'Check bills raised and pending amounts.',
      },
      {
        title: 'Export',
        description:
          'Export reports for sharing and record-keeping.',
      },
    ],
    practicalBenefits: [
      'A clear daily view of bookings.',
      'Pending deliveries and unbilled work spotted early.',
      'Month-end figures ready from one system.',
      'Reports your accountant can use.',
    ],
    faqs: [
      {
        question: 'Which reports are available?',
        answer:
          'Daily and summary registers, challan, memo and lorry hire reports, and billing reports.',
      },
      {
        question: 'Can I see pending deliveries?',
        answer:
          'Yes. Pending delivery reports show consignments that are booked but not yet marked delivered.',
      },
      {
        question: 'Can I export reports?',
        answer:
          'Yes. Reports can be exported for sharing with your team, your accountant or your branches.',
      },
    ],
    relatedSolutions: [
      '/solutions/transport-billing-invoicing/',
      '/solutions/transport-accounting/',
      '/solutions/lr-bilty-management/',
      '/solutions/e-way-bill-management/',
    ],
    relatedIndustries: [
      '/industries/transport-companies/',
      '/industries/fleet-owners/',
    ],
    keywords: [
      'transport reports software',
      'booking register',
      'pending delivery report',
      'challan report',
      'transport billing report',
    ],
  },
  // ================= PHASE 3 DRAFT SOLUTIONS =================
  {
    slug: 'branch-operations-management',
    path: '/solutions/branch-operations-management/',
    status: 'draft',
    shortName: 'Branch & Operations',
    h1: 'Multi-Branch & Daily Dispatch Operations Management',
    eyebrow: 'Phase 3 Draft Module',
    summary: 'Coordinate booking counters, receiving godowns, branch stock and user permissions.',
    problemTitle: 'Coordinating operations across regional branches',
    problemPoints: ['Inter-branch reconciliation delays', 'Stock visibility gaps across hubs'],
    workflowTitle: 'Multi-branch operational coordination',
    workflowSteps: [
      { step: '01', title: 'Branch Booking', detail: 'Capture origin LR with branch code.' },
      { step: '02', title: 'Hub Dispatch & Delivery', detail: 'Track arrival and cash collection.' },
    ],
    featureDetails: [{ title: 'Branch Controls', description: 'Per-branch visibility and cash books.' }],
    practicalBenefits: ['Centralized oversight across branch locations.'],
    faqs: HOME_FAQS.slice(0, 2),
    relatedSolutions: ['/solutions/transport-accounting/'],
    relatedIndustries: ['/industries/transport-companies/'],
    keywords: ['Branch Management Transport'],
  },
  {
    slug: 'integrations',
    path: '/solutions/integrations/',
    status: 'draft',
    shortName: 'Integrations',
    h1: 'Confirmed Platform Integrations',
    eyebrow: 'Phase 3 Draft Page',
    summary: 'Verified statutory and operational integrations including GSP E-Way Bill connectivity.',
    problemTitle: 'Connected compliance workflows',
    problemPoints: ['Avoid manual portal re-entry'],
    workflowTitle: 'GSP integration flow',
    workflowSteps: [
      { step: '01', title: 'Connect Credentials', detail: 'Authorized GSP setup in admin settings.' },
    ],
    featureDetails: [{ title: 'GSP E-Way Bill API', description: 'Direct EWB & CEWB integration.' }],
    practicalBenefits: ['Single-click compliance from verified LR data.'],
    faqs: HOME_FAQS.slice(0, 2),
    relatedSolutions: ['/solutions/e-way-bill-management/'],
    relatedIndustries: ['/industries/transport-companies/'],
    keywords: ['Trust Logistic Integrations'],
  },
];

export function getSolutionBySlug(slug: string): SolutionContent | undefined {
  return SOLUTIONS_CONTENT.find((s) => s.slug === slug);
}

export function getLiveSolutions(): SolutionContent[] {
  return SOLUTIONS_CONTENT.filter((s) => s.status === 'live');
}
