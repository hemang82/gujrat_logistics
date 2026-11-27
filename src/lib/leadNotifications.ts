import nodemailer from 'nodemailer';
import { COMPANY } from './company';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendNotificationEmail({
  subject,
  html,
  replyTo,
}: {
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;
  const toEmail = process.env.LEADS_NOTIFY_EMAIL || COMPANY.contact.salesEmail;

  if (!host || !user || !pass || !fromEmail || !toEmail) {
    console.warn('SMTP credentials not configured — lead saved to MongoDB only.');
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${COMPANY.brandName} Website" <${fromEmail}>`,
      to: toEmail,
      replyTo: replyTo || undefined,
      subject,
      html,
    });

    return { sent: true };
  } catch (err) {
    console.error('Lead email notification failed:', err);
    return { sent: false, reason: 'SEND_ERROR' };
  }
}

export async function notifyDemoLead(data: {
  name: string;
  phone: string;
  companyName: string;
  city: string;
  fleetSize: string;
  email?: string;
  painPoint: string;
}) {
  const subject = `[Trust Logistic Demo] ${data.companyName} (${data.city})`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#0F766E;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;font-size:20px;">New Demo Request</h2>
      </div>
      <div style="padding:24px;color:#06262A;line-height:1.6;">
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.companyName)}</p>
        <p><strong>City:</strong> ${escapeHtml(data.city)}</p>
        <p><strong>Fleet Size:</strong> ${escapeHtml(data.fleetSize)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email || 'Not provided')}</p>
        <p><strong>Message / Challenge:</strong><br/>${escapeHtml(data.painPoint)}</p>
      </div>
    </div>
  `;
  return sendNotificationEmail({ subject, html, replyTo: data.email });
}

export async function notifyContactInquiry(data: {
  inquiryType: 'sales' | 'support';
  firstName: string;
  lastName: string;
  workEmail: string;
  phone?: string;
  companyName?: string;
  message: string;
}) {
  const label = data.inquiryType === 'support' ? 'Customer Support' : 'Sales Enquiry';
  const subject = `[Trust Logistic ${label}] ${data.firstName} ${data.lastName}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#0A4F4A;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;font-size:20px;">New ${label}</h2>
      </div>
      <div style="padding:24px;color:#06262A;line-height:1.6;">
        <p><strong>Type:</strong> ${escapeHtml(label)}</p>
        <p><strong>Name:</strong> ${escapeHtml(`${data.firstName} ${data.lastName}`)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.workEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone || 'Not provided')}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.companyName || 'Not provided')}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(data.message)}</p>
      </div>
    </div>
  `;
  return sendNotificationEmail({ subject, html, replyTo: data.workEmail });
}
