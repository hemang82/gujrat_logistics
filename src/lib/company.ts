/**
 * Single source of truth for Trust Logistic company details, contact info,
 * support channels, and social links.
 *
 * CRITICAL CONTENT RULE:
 * Never invent office street addresses, GST/CIN numbers, awards, or SLA claims.
 * Replace placeholders below only with verified business details.
 */

export const COMPANY = {
  brandName: 'Trust Logistic',
  legalName: 'Trust Logistic',
  tagline: 'Transport Management Software for Indian Transporters',
  domain: 'https://trustlogistic.in',
  locale: 'en_IN',
  lang: 'en-IN',
  contact: {
    // Existing verified mailbox used across the live site until custom domain email is active
    primaryEmail: 'trustlogistic.in@gmail.com',
    salesEmail: 'trustlogistic.in@gmail.com',
    supportEmail: 'trustlogistic.in@gmail.com',
    phoneDisplay: '+91 82384 03910',
    phoneHref: 'tel:+918238403910',
    whatsappNumber: '918238403910',
    whatsappDefaultMessage:
      'Hello Trust Logistic team, I would like to book a demo of your Transport Management Software.',
    businessHours: 'Monday – Saturday, 9:00 AM – 7:00 PM IST',
    // City/PIN already published on current contact & legal pages; full street address marked as unverified placeholder
    locationSummary: 'Ahmedabad, Gujarat 382405, India',
    streetAddressPlaceholder: '[Office street address to be confirmed before publication]',
    hasVerifiedOfficeAddress: false,
  },
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61593276774969',
    x: 'https://x.com/trustlogisticin',
    linkedin: 'https://www.linkedin.com/in/trust-logistic-06a5a0429/',
    instagram: 'https://www.instagram.com/trustlogistic.in/',
  },
  legal: {
    jurisdiction: 'Gujarat, India',
    lastUpdated: 'November 2026',
  },
} as const;

export function getWhatsAppUrl(customMessage?: string): string {
  const msg = customMessage || COMPANY.contact.whatsappDefaultMessage;
  return `https://wa.me/${COMPANY.contact.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}
