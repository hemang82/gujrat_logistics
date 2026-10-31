import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, FileText, Lock, Building2, MapPin, Scale, RefreshCw, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Trust Logistic | Transport Management System',
  description: 'Transport & Logistics Privacy Policy of Trust Logistic. Learn how we collect, handle, protect, and process Lorry Receipts (LR/Bilty), E-Way Bills, Fleet, Consignment, and Delivery data in full compliance with Indian Laws.',
  alternates: {
    canonical: 'https://trustlogistic.in/privacy',
  }
};

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-32 md:pt-36 pb-20 bg-slate-50 min-h-screen">
      <article className="container mx-auto px-4 max-w-5xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-12 mb-8">
          <header className="pb-8 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-brand-primary text-xs font-bold tracking-wider uppercase mb-4">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              Transport & Logistics Compliance
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy for Transport Operations
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Effective Date: 31 October 2026 &bull; Regulated under the Carriage by Road Act 2007, Information Technology Act 2000, and Digital Personal Data Protection Act (DPDPA) 2023.
            </p>
          </header>

          <div className="mt-8 space-y-10 text-slate-700 leading-relaxed text-sm md:text-base">
            
            {/* Section 1: Introduction */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  01
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Introduction & Scope of Services
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                Trust Logistic (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;, or &ldquo;<strong>us</strong>&rdquo;) operates an end-to-end cloud-based Transport Management System (TMS) and logistics service network across India. We provide software and operational logistics infrastructure for transporters, fleet operators, booking agents, branch hubs, consignors (senders), consignees (receivers), and commercial drivers.
              </p>
              <p className="text-slate-600 pl-9">
                This Privacy Policy explicitly governs how we collect, process, record, store, transmit, and safeguard personal and commercial transportation data generated during cargo booking, Lorry Receipt (LR / Bilty) issuance, vehicle dispatch, challan creation, transit tracking, E-Way Bill validation, delivery confirmation, and financial freight settlement.
              </p>
            </section>

            {/* Section 2: Data We Collect */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  02
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Logistics & Transport Data We Collect
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                To process freight shipments legally and efficiently under Indian transport and taxation guidelines, we collect and process the following operational categories of data:
              </p>

              <div className="pl-9 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* 2.1 LR & Consignment Data */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                    Consignment & LR (Bilty) Data
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>System LR / GR Numbers, booking date, and rate types (Paid, To-Pay, T.B.B. Account).</li>
                    <li><strong>Consignor (Sender):</strong> Firm/trade name, pickup address, contact phone, and GSTIN.</li>
                    <li><strong>Consignee (Receiver):</strong> Firm/trade name, delivery address, phone, and GSTIN.</li>
                    <li>Booking origin branch, delivery destination branch, and delivery area pincodes.</li>
                  </ul>
                </div>

                {/* 2.2 Cargo & Material Data */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Truck className="w-4 h-4 text-brand-primary shrink-0" />
                    Cargo & Packaging Details
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Number of packages, packaging type (Bora, Bag, Roll, Box, Carton, Drum, Bundle).</li>
                    <li>Commodity description, HSN classification, actual gross weight, and charged weight.</li>
                    <li>Declared commercial invoice numbers and taxable cargo invoice value.</li>
                  </ul>
                </div>

                {/* 2.3 Tax & E-Way Bill Data */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Scale className="w-4 h-4 text-brand-primary shrink-0" />
                    Tax & Government E-Way Bill Data
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Government 12-digit E-Way Bill numbers and EWB validity periods.</li>
                    <li>Part-A and Part-B vehicle assignment logs and transshipment records.</li>
                    <li>Consolidated E-Way Bill (CEWB) numbers for multi-consignment truck loads.</li>
                    <li>GST rates applied (5%, 12%, 18%) or Reverse Charge Mechanism (RCM) flags.</li>
                  </ul>
                </div>

                {/* 2.4 Fleet, Vehicle & Driver Information */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
                    Fleet, Vehicle & Driver KYC
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Commercial vehicle registration numbers (e.g., GJ, MH, DL, RJ series).</li>
                    <li>Driver full name, verified mobile number, and Driving License (DL) details.</li>
                    <li>Truck owner / transport broker contracts and Lorry Hire memo settlement terms.</li>
                    <li>Driver advance payments, diesel slip issuances, and balance payment vouchers.</li>
                  </ul>
                </div>

                {/* 2.5 Delivery & Proof of Delivery (POD) */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
                    Delivery & Proof of Delivery (POD)
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Date and exact timestamp of cargo delivery at the destination branch/doorstep.</li>
                    <li>Receiver signature, digital acknowledgement stamp, or receiving memo records.</li>
                    <li>Cash collection verification for To-Pay consignments and branch cash ledger entries.</li>
                    <li>Shortage, damage, or demurrage remarks recorded during physical cargo handover.</li>
                  </ul>
                </div>

                {/* 2.6 Location & Transit Tracking */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                    Transit Milestones & Live Tracking
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Branch loading scans, dispatch challan generation, and hub arrival logs.</li>
                    <li>Transit status flags (Booked, In Transit, Out for Delivery, Delivered, Crossing).</li>
                    <li>Telematics or GPS location breadcrumbs where active tracking devices are integrated.</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Section 3: How We Use Transport Data */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  03
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  How We Use Transport & Logistics Data
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                All transport information collected is utilized exclusively for legitimate logistics operations and regulatory compliance:
              </p>
              <ul className="text-slate-600 pl-13 space-y-2 list-disc">
                <li><strong>LR & Bilty Issuance:</strong> To format, print, and digitally archive legitimate consignment notes mandated by the Carriage by Road Rules.</li>
                <li><strong>Shipment Tracking:</strong> To allow senders and receivers to track parcel movements in real-time via LR Number lookups on our public portal (<code className="bg-slate-100 text-brand-primary px-1.5 py-0.5 rounded text-xs">/track</code>).</li>
                <li><strong>Automated Delivery Alerts:</strong> To transmit automated WhatsApp and SMS delivery status updates, arrival notices, and digital LR copies to consignors and consignees.</li>
                <li><strong>Fleet & Challan Routing:</strong> To compile truck loading sheets, dispatch manifests, crossing challans to secondary transporters, and lorry hire memos.</li>
                <li><strong>Statutory Tax Filings:</strong> To verify GST compliance, generate GSTR-1 / GSTR-3B audit trails, update Part-B of Government E-Way Bills, and comply with state transit permits.</li>
                <li><strong>Branch Financial Accounting:</strong> To reconcile To-Pay collections, Paid freight ledgers, T.B.B. corporate account billings, and inter-branch settlement accounts.</li>
              </ul>
            </section>

            {/* Section 4: Commercial Confidentiality & Trade Secrets */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  04
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Commercial Confidentiality & Trade Secrecy
                </h2>
              </div>
              <div className="pl-9 space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs md:text-sm font-medium">
                  <strong>Strict Non-Disclosure Guarantee:</strong> We understand that client customer lists, consignor-consignee trade pairings, negotiated freight rates, and transport routes represent confidential business trade secrets.
                </div>
                <p className="text-slate-600">
                  We guarantee that commercial pricing, proprietary freight contracts, client party directories, and volume discounts stored on our platform are strictly isolated. We will <strong>NEVER</strong> sell, rent, disclose, or trade your commercial transport data, freight tariff sheets, or party databases to third-party marketing brokers or competing transporters.
                </p>
              </div>
            </section>

            {/* Section 5: Authorized Sharing & Disclosures */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  05
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Authorized Data Sharing in Logistics
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                Data is shared strictly on a need-to-know basis with authorized entities to complete transit operations:
              </p>
              <ul className="text-slate-600 pl-13 space-y-2 list-disc">
                <li><strong>Consignees & Consignors:</strong> Shipment progress, driver contact (if assigned for doorstep delivery), and POD acknowledgements.</li>
                <li><strong>Branch & Hub Operators:</strong> Destination branch managers, unloading supervisors, and crossing delivery agents for cargo sorting and delivery.</li>
                <li><strong>Secondary / Crossing Transporters:</strong> When a consignment is routed via a crossing transport partner to deliver to remote destinations outside direct network branches.</li>
                <li><strong>Government & Statutory Authorities:</strong> GST inspectors, RTO / VAHAN authorities, National Informatics Centre (NIC) E-Way Bill portals, and law enforcement when formally mandated under applicable Indian legislation.</li>
              </ul>
            </section>

            {/* Section 6: Data Retention & Archival */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  06
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Data Retention & Statutory Archival
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                Under the Indian Goods and Services Tax (GST) Act, Carriage by Road Rules, and the Companies Act, transport service providers are legally obligated to maintain transactional records:
              </p>
              <ul className="text-slate-600 pl-13 space-y-2 list-disc">
                <li><strong>Tax Invoices, Lorry Receipts & Financial Vouchers:</strong> Retained for a minimum period of <strong>6 to 8 years</strong> to support statutory tax audits, insurance claims, and legal dispute settlements.</li>
                <li><strong>Proof of Delivery (POD) Records:</strong> Preserved digitally for reference until freight accounts and customer reconciliations are formally closed.</li>
                <li><strong>Transient Telematics / GPS Pings:</strong> Real-time telematics breadcrumbs are aggregated into trip summary records and raw granular pings are automatically purged following trip completion.</li>
              </ul>
            </section>

            {/* Section 7: Data Security & Access Controls */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  07
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Data Security & System Safeguards
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                We employ comprehensive technical and operational safeguards to secure all logistics records:
              </p>
              <div className="pl-9 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Lock className="w-4 h-4 text-brand-primary" />
                    256-Bit SSL/TLS
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    All communications between your browser, branch terminals, and our servers are encrypted in transit.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    Role-Based Access
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Branch operators only access their respective branch shipments and cannot view unrelated branch ledgers.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <RefreshCw className="w-4 h-4 text-brand-primary" />
                    Automated Backups
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Daily automated cloud snapshots with point-in-time recovery ensure continuous operational availability.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Stakeholder Rights */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  08
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Consignor, Consignee & Transporter Rights
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                In compliance with the Digital Personal Data Protection Act (DPDPA), 2023, you have the right to:
              </p>
              <ul className="text-slate-600 pl-13 space-y-2 list-disc">
                <li>Request verification and rectification of incorrect contact numbers or GST details on non-dispatched consignments.</li>
                <li>Obtain digital printouts, PDF copies, and duplicate receipts of your historical LRs, freight invoices, and POD slips.</li>
                <li>Opt out of non-essential promotional SMS or WhatsApp alerts (essential transit/delivery notifications remain operational).</li>
              </ul>
            </section>

            {/* Section 9: Grievance Officer & Contact */}
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-100/70 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  09
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Grievance Redressal & Contact Information
                </h2>
              </div>
              <p className="text-slate-600 pl-9">
                For inquiries, data protection questions, or complaints regarding the processing of transportation records, please contact our designated Grievance Officer:
              </p>
              
              <div className="pl-9">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 max-w-lg">
                  <div className="font-bold text-slate-900 text-sm">
                    Trust Logistic &bull; Privacy & Grievance Cell
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                      <span>Email: <a href="mailto:trustlogistic.in@gmail.com" className="text-brand-primary font-semibold hover:underline">trustlogistic.in@gmail.com</a></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                      <span>Direct Support: <a href="tel:+918238403910" className="text-brand-primary font-semibold hover:underline">+91 82384 03910</a></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>Registered Office: Trust Logistic, Ahmedabad, Gujarat 382405, India</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                    Response Timeline: We acknowledge grievances within 24 hours and resolve concerns within 48 to 72 business hours.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </article>
    </main>
  );
}
