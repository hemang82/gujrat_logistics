import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Client from '@/models/Client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    if (q.length < 2) {
      return NextResponse.json([]);
    }

    await connectToDatabase();

    const regex = new RegExp(q, 'i');

    // 1. Fetch matching bookings
    const bookings = await Booking.find({
      $or: [
        { 'consignor.name': regex },
        { 'consignee.name': regex }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

    // 2. Fetch matching clients
    const clients = await Client.find({
      name: regex,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    const suggestionsMap = new Map<string, { name: string; phone: string; gst: string }>();

    // Load clients first (high accuracy)
    for (const client of clients) {
      const nameKey = client.name.trim().toLowerCase();
      if (!suggestionsMap.has(nameKey)) {
        suggestionsMap.set(nameKey, {
          name: client.name.trim(),
          phone: client.phone || '',
          gst: client.gstin || ''
        });
      }
    }

    // Load bookings
    for (const b of bookings) {
      if (b.consignor && b.consignor.name && regex.test(b.consignor.name)) {
        const nameKey = b.consignor.name.trim().toLowerCase();
        if (!suggestionsMap.has(nameKey)) {
          suggestionsMap.set(nameKey, {
            name: b.consignor.name.trim(),
            phone: b.consignor.phone || '',
            gst: b.consignor.gstNumber || ''
          });
        }
      }
      if (b.consignee && b.consignee.name && regex.test(b.consignee.name)) {
        const nameKey = b.consignee.name.trim().toLowerCase();
        if (!suggestionsMap.has(nameKey)) {
          suggestionsMap.set(nameKey, {
            name: b.consignee.name.trim(),
            phone: b.consignee.phone || '',
            gst: b.consignee.gstNumber || ''
          });
        }
      }
    }

    const results = Array.from(suggestionsMap.values()).slice(0, 15);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
