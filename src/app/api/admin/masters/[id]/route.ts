import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import PackagingMaster from '@/models/PackagingMaster';
import ItemDescriptionMaster from '@/models/ItemDescriptionMaster';

// PUT: Update master entry
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const body = await req.json();
    const { type, name, isActive } = body;

    const Model = type === 'packaging' ? PackagingMaster : ItemDescriptionMaster;

    const updated = await Model.findByIdAndUpdate(
      id,
      { ...(name && { name: name.trim() }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Hard delete master entry
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'packaging';

    await connectToDatabase();

    const Model = type === 'packaging' ? PackagingMaster : ItemDescriptionMaster;
    await Model.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
