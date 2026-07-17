import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Branch from '@/models/Branch';
import Agent from '@/models/Agent';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    Agent.init();
    const branch = await Branch.findById(id).populate('agent').lean();
    if (!branch || branch.isDeleted) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (error: any) {
    console.error('Error fetching branch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    await connectToDatabase();

    const existingBranch = await Branch.findById(id);
    if (!existingBranch || existingBranch.isDeleted) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Verify unique code if changing
    if (body.code && body.code.toUpperCase() !== existingBranch.code) {
      const duplicateCode = await Branch.findOne({ code: body.code.toUpperCase(), _id: { $ne: id } });
      if (duplicateCode) {
        return NextResponse.json({ error: `Branch Code "${body.code.toUpperCase()}" already exists` }, { status: 400 });
      }
      body.code = body.code.toUpperCase();
    }

    if (body.agent === "") body.agent = null;

    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedBranch);
  } catch (error: any) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    
    // Perform soft delete
    const branch = await Branch.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
