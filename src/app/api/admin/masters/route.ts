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
    const { type, name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const Model = type === 'packaging' ? PackagingMaster : ItemDescriptionMaster;

    // Upsert: if exists increment usageCount, else create new
    const existing = await Model.findOne({ name: name.trim() });
    if (existing) {
      existing.usageCount += 1;
      await existing.save();
      return NextResponse.json(existing);
    }

    const newEntry = await Model.create({ name: name.trim() });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'Entry already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
