# Trust Logistic — Public Marketing Website & TMS Platform

Enterprise-ready public marketing website for **Trust Logistic**, engineered with Next.js App Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, Lenis smooth scroll, and MDX — strictly isolated from internal `/admin`, logistic, superadmin, `/api`, and `/track` portal routes.

---

## Quick Start

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:2001`.

### Required Environment Variables (`.env.local` / Vercel)
- `MONGODB_URI` — MongoDB connection string for lead storage (`DemoRequest`, `ContactQuery`) and admin data
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — Used by `/admin` authentication
- Optional Email Lead Notifications:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL`

---

## Architecture & Admin Isolation

- All public marketing routes live inside `src/app/(public)/` and `src/components/public/`.
- Admin, Logistic, and Superadmin dashboards remain completely untouched inside `src/app/admin/`, `src/components/admin/`, and `src/app/api/admin/`.
- `next.config.ts` sets `skipTrailingSlashRedirect: true` so `/admin/*`, `/api/*`, and `/track` URLs never receive automatic trailing-slash redirects, while `src/middleware.ts` enforces trailing slashes (`/.../`) cleanly on public marketing pages only.

---

## How To Manage Content & Assets

### 1. Replace Images (`/src/lib/assets.ts`)
- Add optimized `.webp` / `.avif` / `.png` files under `/public/` or `/public/images/`.
- Update the matching slot inside `src/lib/assets.ts` (`src`, `width`, `height`, descriptive `alt`).
- **Hero Truck (`<Truck />`)**: Drop a transparent side-view commercial truck facing **LEFT** at `/public/truck.webp`. While absent, `<Truck />` automatically renders the custom inline SVG truck with synchronized rotating wheels.
- Any photo/screenshot slot set to `src: null` renders an accessible branded teal visual surface (`[Media Slot]` label in development).

### 2. Edit Copy, Modules & Verified Proof (`/src/content/`)
- **Company details & contact channels**: Edit `src/lib/company.ts` (`COMPANY`).
- **Solutions (Phase 1 & 3)**: Edit `src/content/solutions.ts`.
- **Industries (Phase 1 & 3)**: Edit `src/content/industries.ts`.
- **FAQs**: Edit `src/content/faqs.ts`.
- **Client Logos, Testimonials, Case Studies, Leadership, Careers**: Edit `src/content/proof.ts`. Empty by default so unverified social proof stays omitted in production.
- **MDX Insights (Phase 3)**: Add `.mdx` articles under `src/content/insights/`.

### 3. Publish a Draft Page (Phase 2 / Phase 3 → Live)
1. Open `src/lib/sitemap.ts` (`SITE_MAP` array — the single source of truth).
2. Confirm real content/media is populated for the route.
3. Change `status: 'draft'` to `status: 'live'` and `inSitemap: true`.
4. Navigation menus (`Navbar`, `MegaMenu`, `Footer`), breadcrumbs, `<meta name="robots">`, and `/sitemap.xml` update automatically!

### 4. Add Redirects (`/src/lib/redirects.ts`)
- Add `{ source: '/old-path', destination: '/new-path/', permanent: true }` to `LEGACY_REDIRECTS` in `src/lib/redirects.ts`.
- `next.config.ts` reads `LEGACY_REDIRECTS` automatically on build/deploy.

### 5. Deploy on Vercel
1. Connect repository (`website-development` or merged `main`) in Vercel.
2. Add environment variables (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, optional SMTP variables).
3. Framework preset: **Next.js** (build command `npm run build`). `/sitemap.xml` and `/robots.txt` are generated natively from `src/app/sitemap.ts` and `src/app/robots.ts`.

---

## Before-Launch Confirmation Checklist (Information Needed From You)

Per `Trust_Logistic_Complete_Website_Sitemap.pdf` (Section 13), review and supply the following before flipping draft pages to `live` or updating placeholders:

- [ ] **Confirmed Software Modules & Plan Limits**: Confirm final scope of confirmed capabilities (LR/Bilty, Lorry Challan, Crossing Memo, Lorry Hire, Delivery, Fleet, Drivers, Accounts, Billing/Invoicing, Reports, GSP E-Way Bill).
- [ ] **Pricing & Commercials**: Supply verified plan figures, billing structure (monthly vs annual/setup), and branch limits to replace `"Contact us for pricing"` in `/pricing/` and `PricingPreview`.
- [ ] **Company Contact Details & Office Address**: Confirm full office street address (`streetAddressPlaceholder` in `src/lib/company.ts`), custom domain mailboxes (`hello@trustlogistic.in` / `support@trustlogistic.in`), and dedicated support phone/WhatsApp SLAs.
- [ ] **Customer Proof (Written Permission Required)**: Supply approved client names, logos (`public/images/clients/`), written quotes/testimonials, and verifiable case study outcomes in `src/content/proof.ts` (unlocks Homepage Proof section & Phase 2 `/projects/`, `/case-studies/`, `/testimonials/`).
- [ ] **Confirmed Hero Metrics (Optional)**: If numeric hero callouts are desired on `/` left column, provide verified figures in `APPROVED_HERO_METRICS` inside `src/content/proof.ts`.
- [ ] **Truck Asset & Photos**:
  - `/public/truck.webp` (transparent side-view truck facing LEFT)
  - Real yard/highway photo (`ASSETS.hero.sitePhoto`)
  - Real loading dock photo (`ASSETS.hero.dockPhoto`)
  - Real clean product screenshots (without legacy "Gujarat Logistic" branding) for the 8 confirmed Solutions slots in `ASSETS.solutions`
- [ ] **Brand Vector Logo**: Crisp vector `.svg` logo + lightweight `.webp` OG share image (`1200x630`).
- [ ] **Leadership & Hiring**: Confirm public leadership profiles + photos (`APPROVED_LEADERSHIP`) and whether hiring roles should be published (`ACTIVE_CAREER_OPENINGS`).
- [ ] **Security, Backup & SLA**: Only publish `/security-data-protection/`, `/sla/`, `/cookie-policy/`, and `/refund-policy/` once legal/technical statements and SLA guarantees are officially approved.
