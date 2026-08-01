import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import PackagingMaster from '@/models/PackagingMaster';
import ItemDescriptionMaster from '@/models/ItemDescriptionMaster';

// GET: List all masters with search + type filter
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'packaging'; // 'packaging' | 'description'
    const q = searchParams.get('q') || '';
    const suggest = searchParams.get('suggest') === 'true';

    const Model = type === 'packaging' ? PackagingMaster : ItemDescriptionMaster;
    const query: any = { isActive: true };

    if ((session.user as any).role === 'logistic') {
      query.logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      query.logisticId = (session.user as any).logisticId;
    }

    if (q) query.name = { $regex: q, $options: 'i' };

    const items = await Model.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(suggest ? 15 : 200)
      .lean();

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create new master entry
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const body = await req.json();

    let logisticId;
    if ((session.user as any).role === 'logistic') {
      logisticId = (session.user as any).id;
    } else if ((session.user as any).logisticId) {
      logisticId = (session.user as any).logisticId;
    }

    // Handle bulk insertion
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        if (!item.name || !item.name.trim()) continue;
        const Model = item.type === 'packaging' ? PackagingMaster : ItemDescriptionMaster;
        const checkQuery: any = { name: item.name.trim() };
        if (logisticId) checkQuery.logisticId = logisticId;
        
        const existing = await Model.findOne(checkQuery);
        if (existing) {
          existing.usageCount += 1;
          await existing.save();
        } else {
          await Model.create({ name: item.name.trim(), logisticId });
        }
      }
      return NextResponse.json({ success: true }, { status: 201 });
    }

    // Fallback for single insertion
    const { type, name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter Name' }, { status: 400 });
    }

    const Model = type === 'packaging' ? PackagingMaster : ItemDescriptionMaster;

    const checkQuery: any = { name: name.trim() };
    if (logisticId) checkQuery.logisticId = logisticId;

    // Upsert: if exists increment usageCount, else create new
    const existing = await Model.findOne(checkQuery);
    if (existing) {
      existing.usageCount += 1;
      await existing.save();
      return NextResponse.json(existing);
    }

    const newEntry = await Model.create({ name: name.trim(), logisticId });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'Entry already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
