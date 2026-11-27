'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import connectDB from '@/lib/db';
import DemoRequest from '@/models/DemoRequest';
import ContactQuery from '@/models/ContactQuery';
import { checkRateLimit } from '@/lib/rateLimit';
import { notifyContactInquiry, notifyDemoLead } from '@/lib/leadNotifications';

const demoLeadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  phone: z
    .string()
    .trim()
    .min(10, 'Enter a valid 10-digit phone number')
    .max(20)
    .regex(/^[+\d\s()-]{10,20}$/, 'Enter a valid phone number'),
  company: z.string().trim().min(2, 'Please enter your company name').max(160),
  city: z.string().trim().min(2, 'Please enter your city').max(100),
  fleetSize: z.string().trim().min(1, 'Please select fleet size').max(60),
  message: z.string().trim().min(4, 'Please tell us briefly what you need').max(2000),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  website: z.string().optional(), // Honeypot field
});

const contactSchema = z.object({
  inquiryType: z.enum(['sales', 'support']).default('sales'),
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  workEmail: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  companyName: z.string().trim().max(150).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2500),
  website: z.string().optional(), // Honeypot field
});

async function getClientKey(prefix: string): Promise<string> {
  const hdrs = await headers();
  const forwarded = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${prefix}:${forwarded}`;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitDemoLead(rawInput: unknown): Promise<ActionResult> {
  const parsed = demoLeadSchema.safeParse(rawInput);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] || 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors,
    };
  }

  // Honeypot spam check (silently succeed so bots don't retry)
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return { success: true };
  }

  const rateKey = await getClientKey('demo');
  const limit = checkRateLimit(rateKey, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many submissions. Please wait ${limit.retryAfterSec || 60} seconds before trying again.`,
    };
  }

  try {
    await connectDB();

    await DemoRequest.create({
      name: parsed.data.name,
      phone: parsed.data.phone,
      companyName: parsed.data.company,
      city: parsed.data.city,
      fleetSize: parsed.data.fleetSize,
      email: parsed.data.email || undefined,
      painPoint: parsed.data.message,
    });

    await notifyDemoLead({
      name: parsed.data.name,
      phone: parsed.data.phone,
      companyName: parsed.data.company,
      city: parsed.data.city,
      fleetSize: parsed.data.fleetSize,
      email: parsed.data.email || undefined,
      painPoint: parsed.data.message,
    });

    return { success: true };
  } catch (err) {
    console.error('submitDemoLead error:', err);
    return {
      success: false,
      error: 'Unable to save your request right now. Please try again or reach us on WhatsApp.',
    };
  }
}

export async function submitContactQuery(rawInput: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(rawInput);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] || 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors,
    };
  }

  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return { success: true };
  }

  const rateKey = await getClientKey('contact');
  const limit = checkRateLimit(rateKey, 6, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many messages sent. Please try again in ${limit.retryAfterSec || 60} seconds.`,
    };
  }

  try {
    await connectDB();

    await ContactQuery.create({
      inquiryType: parsed.data.inquiryType,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      workEmail: parsed.data.workEmail,
      phone: parsed.data.phone || undefined,
      companyName: parsed.data.companyName || undefined,
      message: parsed.data.message,
    });

    await notifyContactInquiry({
      inquiryType: parsed.data.inquiryType,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      workEmail: parsed.data.workEmail,
      phone: parsed.data.phone || undefined,
      companyName: parsed.data.companyName || undefined,
      message: parsed.data.message,
    });

    return { success: true };
  } catch (err) {
    console.error('submitContactQuery error:', err);
    return {
      success: false,
      error: 'Unable to send your message right now. Please try again or email us directly.',
    };
  }
}
