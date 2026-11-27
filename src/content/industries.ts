import { HOME_FAQS, type FaqItem } from './faqs';

export interface IndustryContent {
  slug: string;
  path: string;
  status: 'live' | 'draft';
  shortName: string;
  cardTitle?: string;
  cardSummary?: string;
  cardHighlights?: string[];
  metaTitle?: string;
  metaDescription?: string;
  h1: string;
  eyebrow: string;
  summary: string;
  challengesTitle: string;
  challenges: { title: string; detail: string }[];
  workflows: { title: string; description: string }[];
  platformFitTitle: string;
  platformFitPoints: string[];
  operationalScenario: {
    title: string;
    description: string;
    modulesUsed: string[];
  };
  faqs: FaqItem[];
  relatedSolutions: string[];
  keywords: string[];
}

export const INDUSTRIES_CONTENT: IndustryContent[] = [
  {
    slug: 'transport-companies',
    path: '/industries/transport-companies/',
    status: 'live',
    shortName: 'Transport Companies (FTL & PTL)',
    cardTitle: 'Transport Companies (FTL & PTL)',
    cardSummary:
      'Run full truckload and part truckload operations across branches from one unified system—without juggling Excel sheets or separate billing tools.',
    cardHighlights: [
      'Unified FTL & PTL LR/Bilty creation with Paid, To-Pay, and TBB billing',
      'Real-time E-Way Bill tracking and digital POD uploads against every LR',
      'Automated freight invoicing, party ledgers, and branch reconciliation',
    ],
    metaTitle: 'Transport Software for FTL & PTL Companies | Trust Logistic',
    metaDescription:
      'Manage FTL and PTL bookings, LR/Bilty, E-Way Bills, PODs, and freight billing in one transport management software built for Indian transport companies.',
    h1: 'Transport Management Software for FTL & PTL Transport Companies',
    eyebrow: 'Transport Companies (FTL & PTL)',
    summary:
      'Run your entire transport business from one screen—from booking and LR/Bilty creation to E-Way Bill compliance, POD tracking, and freight billing—without juggling Excel sheets or multiple tools.',
    challengesTitle: 'Daily Bottlenecks Holding Back Transport Companies',
    challenges: [
      {
        title: '1. Disconnected FTL & PTL Operations',
        detail:
          'Running full-load and part-load bookings on separate registers or spreadsheets creates duplicate data entry, billing delays, and zero visibility across branches.',
      },
      {
        title: '2. Delayed Billing Due to Missing PODs',
        detail:
          'When physical Proofs of Delivery (PODs) get stuck with drivers or branch offices, invoices sit pending for weeks and working capital gets blocked.',
      },
      {
        title: '3. Unreconciled Freight, Advances & Balances',
        detail:
          'Tracking Paid, To-Pay, and TBB (To Be Billed) consignments alongside driver advances and lorry hire balances leads to frequent ledger mismatches.',
      },
    ],
    workflows: [
      {
        title: '1. Unified Booking & LR / Bilty Creation',
        description:
          'Create FTL or PTL LRs in seconds with auto-fetched party rates, consignor/consignee details, and Paid/To-Pay/TBB billing terms.',
      },
      {
        title: '2. Dispatch, E-Way Bill & POD Tracking',
        description:
          'Assign owned or market vehicles, link E-Way Bill numbers with expiry alerts, and upload digital PODs directly against each LR upon delivery.',
      },
      {
        title: '3. One-Click Freight Billing & Party Ledgers',
        description:
          'Convert delivered LRs into freight invoices automatically, track outstanding payments, and reconcile party-wise balances in real time.',
      },
    ],
    platformFitTitle: 'How Trust Logistic Fits Transport Companies',
    platformFitPoints: [
      'Single platform to manage both FTL contracts and daily PTL parcel loads across all branches.',
      'Automated LR-to-Invoice flow eliminates manual re-typing and speeds up monthly billing cycles.',
      'Built-in E-Way Bill tracking, lorry hire, and branch cash books keep every trip audit-ready.',
      'Live visibility into pending PODs, unpaid freight bills, and branch-wise collections.',
    ],
    operationalScenario: {
      title: 'Managing Mixed Daily Dispatches Across Gujarat & Maharashtra',
      description:
        'A mid-sized transporter dispatches 15 FTL industrial loads and 120 PTL parcels daily from Ahmedabad to Surat, Vapi, and Mumbai. Instead of separate billing clerks for FTL and PTL, their team logs all bookings in Trust Logistic, generates LRs and manifests on the spot, tracks POD uploads from destination branches, and raises consolidated weekly freight bills for TBB clients in minutes.',
      modulesUsed: [
        'LR / Bilty Management',
        'E-Way Bill Management',
        'POD & Delivery Tracking',
        'Transport Billing & Accounting',
      ],
    },
    faqs: [
      {
        question: 'Can we manage both FTL and PTL bookings in the same account?',
        answer:
          'Yes. Trust Logistic lets you handle FTL point-to-point dispatches and PTL multi-party consignments under one unified dashboard with separate rate cards and billing rules.',
      },
      {
        question: 'Does the software support Paid, To-Pay, and TBB (To Be Billed) billing types?',
        answer:
          'Yes. You can tag every LR as Paid, To-Pay, or TBB during booking, and the system automatically routes it to cash collection, delivery-branch recovery, or monthly party billing.',
      },
      {
        question: 'Can different branches have their own logins and cash ledgers?',
        answer:
          'Yes. Each branch can work with role-based logins and its own branch cash book, while the head office views unified booking, dispatch, and ledger reports.',
      },
      {
        question: 'Can we link E-Way Bills directly with LRs and track expiry dates?',
        answer:
          'Yes. You can attach E-Way Bill numbers to every LR during booking or dispatch and monitor validity dates from one screen to avoid en-route penalties.',
      },
      {
        question: 'Can we track pending PODs and branch-wise outstanding payments in real time?',
        answer:
          'Yes. The dashboard highlights all delivered LRs awaiting POD upload as well as branch-wise and party-wise unpaid freight bills, so billing and collections never stall.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/e-way-bill-management/',
      '/solutions/transport-billing-invoicing/',
      '/solutions/transport-accounting/',
    ],
    keywords: [
      'transport management software India',
      'FTL PTL transport software',
      'LR bilty software',
      'freight billing software',
      'Trust Logistic',
    ],
  },
  {
    slug: 'fleet-owners',
    path: '/industries/fleet-owners/',
    status: 'live',
    shortName: 'Fleet Owners',
    cardTitle: 'Fleet Owners',
    cardSummary:
      'Keep every owned truck, driver advance, diesel slip, and maintenance bill connected to freight revenue so you see true trip-wise profit.',
    cardHighlights: [
      'Vehicle-wise and trip-wise Profit & Loss (P&L) with diesel mileage tracking',
      'Clean driver khata for cash/UPI advances, bhatta, and final trip settlements',
      'Renewal alerts for insurance, permits, fitness, PUC, and EMIs',
    ],
    metaTitle: 'Fleet Management Software for Fleet Owners | Trust Logistic',
    metaDescription:
      'Track every truck, driver advance, diesel expense, trip profit, and EMI in one fleet management software. Built for Indian fleet owners to cut leaks.',
    h1: 'Fleet Management Software to Control Trips, Expenses & Vehicle Profit',
    eyebrow: 'Fleet Owners',
    summary:
      'Stop guessing how much each truck actually earns. Connect every vehicle, driver advance, diesel slip, maintenance bill, and freight invoice so you see exact trip-wise profit in real time.',
    challengesTitle: 'Where Fleet Owners Lose Money Every Month',
    challenges: [
      {
        title: '1. No Clarity on Trip-Wise Profit & Loss',
        detail:
          'Freight income is tracked in one place while diesel, tolls, FASTag, and driver bhatta sit in separate diaries—making it hard to spot loss-making routes or trucks.',
      },
      {
        title: '2. Uncontrolled Driver Advances & Fuel Leaks',
        detail:
          'Cash advances, en-route repair bills, and unverified diesel entries often go unadjusted during trip settlements, silently eating into fleet margins.',
      },
      {
        title: '3. Missed Renewals & Unexpected Breakdowns',
        detail:
          'Forgetting permit, fitness, insurance, or PUC renewal dates leads to heavy RTO penalties, while untracked tyre and service history increases breakdown costs.',
      },
    ],
    workflows: [
      {
        title: '1. Trip Sheet & Advance Management',
        description:
          'Open a trip sheet for every dispatch, log cash/UPI driver advances, fuel slips, and FASTag tolls, and close settlements cleanly when the truck returns.',
      },
      {
        title: '2. Vehicle-Wise P&L & Mileage Tracking',
        description:
          'Automatically match freight revenue against trip expenses to view net profit, cost per kilometre, and fuel average for every single truck.',
      },
      {
        title: '3. Maintenance, Tyres & Document Alerts',
        description:
          'Record workshop bills and spare parts per vehicle, and get timely reminders before insurance, national permits, fitness certificates, or EMIs are due.',
      },
    ],
    platformFitTitle: 'How Trust Logistic Fits Fleet Owners',
    platformFitPoints: [
      'Complete vehicle-wise and trip-wise profit & loss reports without manual Excel calculations.',
      'Clean driver khata management covering advances, bhatta, incentives, and final trip settlement.',
      'Automated renewal alerts for insurance, permits, fitness, tax, and PUC to avoid RTO fines.',
      'Direct link between fleet trips and customer freight billing so no completed load goes unbilled.',
    ],
    operationalScenario: {
      title: 'Tracking True Profit Across a 25-Truck Owned Fleet',
      description:
        'A fleet owner running 25 heavy commercial trucks on the Ahmedabad–Delhi highway struggled to reconcile driver advances and diesel bills at month-end. With Trust Logistic, every trip opens with a digital trip sheet; diesel, toll, and repair costs are logged against the truck number, and within seconds of trip closure, the owner sees exact net profit per truck and exact driver settlement balance.',
      modulesUsed: [
        'Fleet & Vehicle Management',
        'Trip & Expense Management',
        'Driver Khata & Settlement',
        'Transport Billing & Accounting',
      ],
    },
    faqs: [
      {
        question: 'Can I see profit and loss separately for each truck in my fleet?',
        answer:
          'Yes. Trust Logistic generates both trip-wise and vehicle-wise P&L reports by deducting fuel, toll, driver bhatta, and maintenance expenses from the freight earned.',
      },
      {
        question: 'How does driver settlement and driver khata work in the software?',
        answer:
          'Every cash advance, UPI transfer, fuel slip, and route expense is logged in the trip sheet. At trip end, the system auto-calculates whether money is payable to or recoverable from the driver.',
      },
      {
        question: 'Can I track vehicle document renewals, permits, and EMIs?',
        answer:
          'Yes. You can store dates for insurance, fitness, national/state permits, road tax, PUC, and monthly EMIs, and receive automated alerts well before expiry.',
      },
      {
        question: 'Does the software help track diesel mileage, tyres, and maintenance costs?',
        answer:
          'Yes. You can log fuel fills with odometer readings to track km/litre mileage per truck, along with workshop bills, spare parts, and tyre replacement history.',
      },
      {
        question: 'Can I manage both owned trucks and occasional attached market vehicles?',
        answer:
          'Yes. Your owned vehicles run on trip sheets and expense tracking, while any hired market trucks can be managed alongside them via Lorry Hire Challans without needing a separate tool.',
      },
    ],
    relatedSolutions: [
      '/solutions/fleet-management/',
      '/solutions/driver-management/',
      '/solutions/lr-bilty-management/',
      '/solutions/transport-accounting/',
    ],
    keywords: [
      'fleet management software India',
      'truck expense tracking software',
      'trip profit and loss software',
      'driver khata software',
      'Trust Logistic',
    ],
  },
  {
    slug: 'transport-brokers',
    path: '/industries/transport-brokers/',
    status: 'live',
    shortName: 'Transport Brokers',
    cardTitle: 'Transport Brokers & Commission Agents',
    cardSummary:
      'Manage market vehicles, lorry hire challans, supplier advances, and party billing in one place—with exact brokerage margin visibility on every load.',
    cardHighlights: [
      'Instant Lorry Hire Challan (LHC) linked directly to each party LR',
      'POD-verified supplier balance payouts to prevent premature overpayments',
      'Separate client receivable & supplier payable ledgers with 194C TDS tracking',
    ],
    metaTitle: 'Transport Broker & Lorry Hire Software | Trust Logistic',
    metaDescription:
      'Handle market vehicles, lorry hire challans, party billing, TDS, and broker commission margins accurately with Trust Logistic broker software.',
    h1: 'Transport Software for Brokers & Commission Agents',
    eyebrow: 'Transport Brokers & Commission Agents',
    summary:
      'Manage market vehicles, lorry hire challans, supplier advances, and party billing from one place—so you always know your exact margin on every load and never overpay a truck owner.',
    challengesTitle: 'Everyday Headaches for Transport Brokers',
    challenges: [
      {
        title: '1. Confusion Between Party Rate & Truck Hire Rate',
        detail:
          'Managing dozens of daily market trucks makes it easy to lose track of the exact difference between what the client pays you and what you owe the truck supplier.',
      },
      {
        title: '2. Risk of Paying Balance Before POD Arrives',
        detail:
          'Without a linked tracking system, staff accidentally release final lorry hire balances before receiving a clean, signed POD from the driver—causing costly disputes.',
      },
      {
        title: '3. Messy Supplier Ledgers, Halting & TDS',
        detail:
          'Tracking supplier advances, detention/halting charges, short-delivery deductions, and 194C TDS declarations across hundreds of truck owners becomes chaotic at month-end.',
      },
    ],
    workflows: [
      {
        title: '1. Instant Lorry Hire Challan (LHC) Creation',
        description:
          'Book a market vehicle, enter agreed lorry hire freight, advance paid, and balance terms, and generate a clean Lorry Hire Challan linked directly to the party LR.',
      },
      {
        title: '2. POD-Linked Balance Settlement',
        description:
          'Lock final supplier balance payments until the signed POD is verified and uploaded, automatically adjusting any halting, weight difference, or damage deductions.',
      },
      {
        title: '3. Margin & Supplier Ledger Tracking',
        description:
          'View your net brokerage margin on every single trip, maintain supplier-wise payable ledgers, and track party-wise receivables in one dashboard.',
      },
    ],
    platformFitTitle: 'How Trust Logistic Fits Transport Brokers',
    platformFitPoints: [
      'Links every Party LR directly to its Lorry Hire Challan (LHC) for instant trip-wise margin visibility.',
      'Prevents premature supplier payouts by tying final balance clearance to POD verification.',
      'Handles advances, balance payouts, halting charges, deductions, and TDS records cleanly.',
      'Keeps separate, accurate ledgers for clients (receivables) and truck owners/suppliers (payables).',
    ],
    operationalScenario: {
      title: 'Closing 40+ Daily Market Vehicle Placements Without Payment Errors',
      description:
        "A transport brokerage office arranges 40+ market trucks daily for ceramic and textile factories. Earlier, verifying which truck's POD had arrived before releasing the 20% balance took hours of phone calls. With Trust Logistic, the team issues digital Lorry Hire Challans, marks POD status in real time, and settles supplier balances confidently while tracking exact daily commission earned.",
      modulesUsed: [
        'Lorry Hire & Market Vehicles',
        'LR / Bilty Management',
        'POD & Delivery Tracking',
        'Party & Supplier Accounting',
      ],
    },
    faqs: [
      {
        question: 'Can I see my exact commission or margin on every single load?',
        answer:
          'Yes. Because each party LR is linked to its corresponding Lorry Hire Challan (LHC), Trust Logistic automatically calculates your net margin after advances, halting, and deductions.',
      },
      {
        question: 'How does the software stop wrong balance payments to truck owners?',
        answer:
          'You can track POD receipt status against every challan, giving your accounts team a clear alert if a supplier asks for balance payment before the signed POD is verified and uploaded.',
      },
      {
        question: 'Can I maintain truck owner PAN and 194C TDS details?',
        answer:
          'Yes. You can store supplier PAN details and 194C TDS declarations inside supplier profiles so TDS deductions and year-end compliance stay accurate.',
      },
      {
        question: 'How are halting charges, short-delivery deductions, and weight differences handled?',
        answer:
          'Any en-route halting, loading/unloading charges, or damage/shortage deductions can be recorded directly against the challan and party LR, automatically updating both final settlement amounts.',
      },
      {
        question: 'Can I maintain separate ledgers for client receivables and supplier payables?',
        answer:
          'Yes. Trust Logistic keeps party billing (receivables) and truck owner/broker payouts (payables) cleanly separated, so you always know who owes you and whom you need to pay.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/fleet-management/',
      '/solutions/transport-billing-invoicing/',
      '/solutions/transport-accounting/',
    ],
    keywords: [
      'transport broker software India',
      'lorry hire challan software',
      'transport commission agent software',
      'market vehicle management',
      'Trust Logistic',
    ],
  },
  // ================= PHASE 3 DRAFT INDUSTRIES =================
  {
    slug: 'multi-branch-businesses',
    path: '/industries/multi-branch-businesses/',
    status: 'draft',
    shortName: 'Multi-Branch Businesses',
    h1: 'Multi-Branch Transport Business Software',
    eyebrow: 'Phase 3 Draft Industry',
    summary: 'Centralized operations across originating counters, transit hubs and delivery branches.',
    challengesTitle: 'Challenges',
    challenges: [{ title: 'Branch cash sync', detail: 'Daily reconciliation across multiple branches.' }],
    workflows: [{ title: 'Branch Ledgers', description: 'Per-branch visibility under head office.' }],
    platformFitTitle: 'Platform Fit',
    platformFitPoints: ['Branch-wise role controls and reports.'],
    operationalScenario: { title: 'Multi-branch flow', description: 'Hub-to-hub dispatch.', modulesUsed: ['Accounts'] },
    faqs: HOME_FAQS.slice(0, 2),
    relatedSolutions: ['/solutions/transport-accounting/'],
    keywords: ['Multi Branch Transport Software'],
  },
  {
    slug: 'ftl-transporters',
    path: '/industries/ftl-transporters/',
    status: 'live',
    shortName: 'Full Truckload (FTL)',
    cardTitle: 'Full Truckload (FTL) Transporters',
    cardSummary:
      'Speed up point-to-point factory and corporate dispatches with pre-saved rate contracts, E-Way Bill validity tracking, and faster POD-backed billing.',
    cardHighlights: [
      'Route-wise fixed freight and per-ton/per-quintal contract rate cards',
      'Seamless handling of both owned fleet and attached market trucks',
      'Detention/halting charge tracking and bulk corporate freight billing',
    ],
    metaTitle: 'FTL Transport Software for Full Truckload | Trust Logistic',
    metaDescription:
      'Streamline point-to-point FTL dispatch, LR generation, E-Way Bill tracking, trip settlements, and fast POD billing with Trust Logistic FTL software.',
    h1: 'Software Built for Full Truckload (FTL) Transporters',
    eyebrow: 'Full Truckload (FTL) Transporters',
    summary:
      'Speed up every full-truckload cycle—from party rate confirmation and truck placement to E-Way Bill tracking, POD collection, and on-time corporate billing—with complete trip profitability control.',
    challengesTitle: 'Operational Hurdles in Full Truckload (FTL) Transport',
    challenges: [
      {
        title: '1. Slow Invoice Cycles for Corporate & Factory Clients',
        detail:
          'Corporate clients only release payment against accurate bills with matching LR numbers, weight slips, and clean PODs. Manual verification delays cash flow by weeks.',
      },
      {
        title: '2. E-Way Bill Expiry & Detention Disputes',
        detail:
          'On long-haul FTL routes, missed E-Way Bill validity extensions risk heavy penalties, while unlogged loading/unloading delays make it hard to claim detention charges.',
      },
      {
        title: '3. Mixing Owned Fleet & Attached Market Trucks',
        detail:
          'Most FTL transporters use both owned trucks and hired market vehicles, making it tricky to track trip costs, supplier balances, and net margins in one system.',
      },
    ],
    workflows: [
      {
        title: '1. Contract Rate & Fast FTL Dispatch',
        description:
          'Pre-save client route-wise rate contracts (per ton or fixed truck rate), assign owned or market trucks, and generate LRs with E-Way Bill details in seconds.',
      },
      {
        title: '2. En-Route Tracking, Detention & POD Upload',
        description:
          'Monitor trip milestones from loading to unloading, log halting/detention hours with remarks, and capture digital POD copies immediately upon delivery.',
      },
      {
        title: '3. Audit-Ready Corporate Billing & Settlement',
        description:
          'Generate bulk or trip-wise freight invoices with attached LR and POD references, while simultaneously closing driver trips or market vehicle balances.',
      },
    ],
    platformFitTitle: 'How Trust Logistic Fits FTL Transporters',
    platformFitPoints: [
      'Supports both fixed-freight and per-ton/per-quintal FTL contract rate structures.',
      'Handles owned trucks (trip sheets & diesel) and market trucks (lorry hire challans) side by side.',
      'Tracks E-Way Bill validity and detention/halting charges so you never leave billable revenue behind.',
      'Accelerates payment collection by linking verified PODs directly to corporate freight bills.',
    ],
    operationalScenario: {
      title: 'Running Dedicated Factory-to-Warehouse FTL Contracts Smoothly',
      description:
        'An FTL transporter handles 300+ monthly full-load dispatches for chemical and steel plants using a mix of 15 owned trailers and hired market trucks. Using Trust Logistic, their dispatchers apply pre-approved contract rates automatically, track E-Way Bill validity across inter-state routes, attach scanned PODs to every LR, and send error-free weekly freight bills that get approved faster.',
      modulesUsed: [
        'LR / Bilty Management',
        'E-Way Bill Management',
        'Fleet & Market Vehicle Management',
        'Transport Billing & Accounting',
      ],
    },
    faqs: [
      {
        question: 'Does Trust Logistic support both fixed truck rates and per-ton weight-based billing?',
        answer:
          'Yes. You can configure client rate cards by route, vehicle type, fixed freight, or actual/charged weight (per ton or per quintal), and the bill amount calculates automatically.',
      },
      {
        question: 'Can we add halting, detention, or loading/unloading charges to FTL bills?',
        answer:
          'Yes. Extra charges like detention, union fees, weighbridge slips, or multipoint delivery charges can be added cleanly to both the party invoice and trip settlement.',
      },
      {
        question: 'Does it work if we run both owned trucks and hired market vehicles?',
        answer:
          'Yes. Owned trucks follow the trip sheet and expense workflow, while market vehicles follow the Lorry Hire Challan workflow—all visible in one FTL dashboard.',
      },
      {
        question: 'How does it help avoid E-Way Bill expiry penalties on long-haul routes?',
        answer:
          'Every FTL dispatch displays its linked E-Way Bill validity status, helping your operations team spot expiring bills early and update Part-B or extend validity on time.',
      },
      {
        question: 'Can we attach digital PODs and LR copies when sending bulk corporate bills?',
        answer:
          'Yes. Once signed PODs are uploaded against LRs, you can generate consolidated weekly or monthly corporate freight bills with complete LR, weight, and POD references for faster approval.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/e-way-bill-management/',
      '/solutions/fleet-management/',
      '/solutions/transport-billing-invoicing/',
    ],
    keywords: [
      'FTL transport software',
      'full truckload management software India',
      'FTL dispatch software',
      'POD billing software',
      'Trust Logistic',
    ],
  },
  {
    slug: 'ptl-transporters',
    path: '/industries/ptl-transporters/',
    status: 'live',
    shortName: 'Part Truckload (PTL)',
    cardTitle: 'Part Truckload (PTL) & Parcel Transporters',
    cardSummary:
      'Control high-volume counter bookings, hub-to-hub loading sheets, godown stock, and branch-wise Paid/To-Pay collections with zero missing parcels.',
    cardHighlights: [
      'Rapid per-package, weight, and CFT booking with hamali & door-delivery charges',
      'One-click consolidated truck loading sheets (manifests) and hub arrival tracking',
      'Live branch godown stock register and daily cash/UPI/TBB reconciliation',
    ],
    metaTitle: 'PTL & Parcel Transport Management Software | Trust Logistic',
    metaDescription:
      'Automate multi-party PTL bookings, hub manifests, loading sheets, godown stock, and To-Pay/Paid delivery billing in one PTL software for India.',
    h1: 'Software for Part Truckload (PTL) & Parcel Transporters',
    eyebrow: 'Part Truckload (PTL) & Parcel Transporters',
    summary:
      'Manage high-volume parcel bookings, hub-to-hub loading sheets, godown stock, and Paid/To-Pay/TBB deliveries across branches—with zero missing packages and clean branch-wise cash reconciliation.',
    challengesTitle: 'Why PTL & Parcel Operations Get Chaotic Without Software',
    challenges: [
      {
        title: '1. Missing Packages & Zero Godown Stock Visibility',
        detail:
          'When hundreds of small consignments move through booking offices and transshipment hubs daily, manual registers make it hard to know which parcel is in which truck or godown.',
      },
      {
        title: '2. Manual Loading Sheets & Branch Coordination',
        detail:
          'Preparing truck manifests (challans) by hand and calling destination branches for arrival updates wastes hours every evening and leads to short-delivery disputes.',
      },
      {
        title: '3. Cash Leaks in Paid & To-Pay Collections',
        detail:
          'Collecting cash/UPI at booking counters (Paid) and delivery branches (To-Pay) across multiple locations makes daily cash tallying and branch reconciliation error-prone.',
      },
    ],
    workflows: [
      {
        title: '1. Rapid Counter Booking & LR Generation',
        description:
          'Book high-volume consignments quickly by package count, weight, or CFT with auto-calculated freight, hamali, and door-delivery charges for Paid, To-Pay, or TBB terms.',
      },
      {
        title: '2. Hub Manifests, Loading Sheets & Arrival Entry',
        description:
          'Club multiple LRs into one consolidated truck loading sheet (manifest), track parcels in transit, and mark hub arrivals and godown stock with a single click.',
      },
      {
        title: '3. Delivery Gate Pass & Branch Cash Tally',
        description:
          'Issue delivery receipts/gate passes against To-Pay collections, record PODs, and reconcile daily cash, UPI, and TBB billing across every branch automatically.',
      },
    ],
    platformFitTitle: 'How Trust Logistic Fits PTL Transporters',
    platformFitPoints: [
      'Built for fast multi-party booking counters with package-wise, weight-wise, and CFT rate cards.',
      'End-to-end hub-and-spoke tracking from booking godown to loading sheet, transshipment, and final delivery.',
      'Clean separation and daily reconciliation of Paid, To-Pay, and monthly TBB (To Be Billed) revenue.',
      'Real-time stock register shows pending undelivered parcels at every branch to prevent short-deliveries.',
    ],
    operationalScenario: {
      title: 'Coordinating Daily Overnight Parcel Lines Across 6 Gujarat Branches',
      description:
        'A PTL parcel transporter runs daily overnight services connecting Ahmedabad, Rajkot, Surat, Vadodara, Morbi, and Vapi. Earlier, evening loading sheets took 2 hours and destination branches struggled to tally To-Pay cash. With Trust Logistic, clerks book LRs in seconds, generate consolidated truck manifests automatically, and destination branches see incoming cargo before the truck even arrives—cutting errors and speeding up morning deliveries.',
      modulesUsed: [
        'PTL Booking & LR Management',
        'Manifest & Loading Sheets',
        'Branch & Godown Stock',
        'Branch Cash & Freight Billing',
      ],
    },
    faqs: [
      {
        question: 'Can multiple branches use the software at the same time with separate logins?',
        answer:
          'Yes. Each booking and delivery branch gets role-based access so staff only see their branch operations while the head office gets full multi-branch visibility.',
      },
      {
        question: 'How does the software track parcels sitting in our godown?',
        answer:
          "Every booked LR automatically enters the booking godown stock, moves to 'In Transit' when added to a loading sheet, and updates to destination stock upon arrival until delivered.",
      },
      {
        question: 'Does it handle To-Pay cash collection and TBB monthly billing separately?',
        answer:
          'Yes. Paid and To-Pay collections reflect in daily branch cash/bank reports, while TBB LRs automatically queue up for consolidated party-wise freight invoicing.',
      },
      {
        question: 'Can we generate consolidated truck loading sheets (manifests) for hub-to-hub routes?',
        answer:
          'Yes. You can club dozens of LRs heading to the same route or hub into one loading sheet (manifest) in seconds, eliminating manual challan writing and dispatch delays.',
      },
      {
        question: 'Can we configure extra PTL charges like hamali, door delivery, and CFT rates?',
        answer:
          'Yes. The booking screen supports per-package, per-kg, and CFT pricing along with configurable add-on charges like hamali, docket fees, door pickup, and door delivery.',
      },
    ],
    relatedSolutions: [
      '/solutions/lr-bilty-management/',
      '/solutions/e-way-bill-management/',
      '/solutions/transport-billing-invoicing/',
      '/solutions/transport-accounting/',
    ],
    keywords: [
      'PTL transport software India',
      'part truckload software',
      'parcel transport booking software',
      'transport manifest loading sheet software',
      'Trust Logistic',
    ],
  },
  {
    slug: 'small-mid-size-businesses',
    path: '/industries/small-mid-size-businesses/',
    status: 'draft',
    shortName: 'Small & Mid-Size',
    h1: 'Software for Small & Mid-Size Transport Businesses',
    eyebrow: 'Phase 3 Draft Industry',
    summary: 'Straightforward LR, E-Way Bill and billing workflows without heavy IT overhead.',
    challengesTitle: 'Challenges',
    challenges: [{ title: 'Transitioning off paper', detail: 'Moving daily bilty work online easily.' }],
    workflows: [{ title: 'Simple Onboarding', description: 'Clean web workspace for office staff.' }],
    platformFitTitle: 'Platform Fit',
    platformFitPoints: ['Familiar Indian transport workflows.'],
    operationalScenario: { title: 'Growing Office', description: 'Paperless bilty and invoicing.', modulesUsed: ['Billing'] },
    faqs: HOME_FAQS.slice(0, 2),
    relatedSolutions: ['/solutions/transport-management-software/'],
    keywords: ['Small Transport Software India'],
  },
];

export function getIndustryBySlug(slug: string): IndustryContent | undefined {
  return INDUSTRIES_CONTENT.find((i) => i.slug === slug);
}

export function getLiveIndustries(): IndustryContent[] {
  return INDUSTRIES_CONTENT.filter((i) => i.status === 'live');
}
