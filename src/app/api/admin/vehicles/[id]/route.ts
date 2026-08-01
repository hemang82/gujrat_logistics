import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getLogisticQuery } from '@/lib/apiAuth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    Vehicle.init();
    Driver.init();
    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
    }
    
    const vehicle = await Vehicle.findOne(query).populate('assignedDriver', 'name phone').lean();
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    return NextResponse.json(vehicle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();
    Vehicle.init();
    Driver.init();

    // Prevent Cast to ObjectId failed for empty string
    if (data.assignedDriver === "") {
      data.assignedDriver = null; // Use null to explicitly unset in update, or delete it and $unset later
    }
    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
      // Also prevent branch users from changing branch manually
      delete data.branch;
    } else if (data.branch === "") {
      data.branch = null;
    }

    const oldVehicle = await Vehicle.findOne(query);
    if (!oldVehicle) return NextResponse.json({ error: 'Vehicle not found or unauthorized' }, { status: 404 });

    // Handle unset for empty strings
    const updatePayload: any = { ...data };
    if (data.branch === null) {
      delete updatePayload.branch;
    }

    const vehicle = await Vehicle.findOneAndUpdate(query, updatePayload, { new: true });

    if (data.branch === null) {
        await Vehicle.findByIdAndUpdate(id, { $unset: { branch: 1 } });
    }


    // Handle driver assignment changes
    if (oldVehicle.assignedDriver?.toString() !== data.assignedDriver) {
      // Remove old driver's assignment
      if (oldVehicle.assignedDriver) {
        await Driver.findByIdAndUpdate(oldVehicle.assignedDriver, { $unset: { assignedVehicle: 1 } });
      }
      // Set new driver's assignment
      if (data.assignedDriver) {
        // 1. Force remove this driver from ALL other vehicles to fix corrupted data
        await Vehicle.updateMany(
          { assignedDriver: data.assignedDriver, _id: { $ne: id } },
          { $unset: { assignedDriver: 1 } }
        );
        
        // 2. Force remove this vehicle from ANY other drivers
        await Driver.updateMany(
          { assignedVehicle: id, _id: { $ne: data.assignedDriver } },
          { $unset: { assignedVehicle: 1 } }
        );
        
        // 3. Assign new vehicle to driver
        await Driver.findByIdAndUpdate(data.assignedDriver, { assignedVehicle: id });
      }
    }

    // If data.assignedDriver is null, we need to explicitly unset it in the vehicle document
    if (data.assignedDriver === null) {
        await Vehicle.findByIdAndUpdate(id, { $unset: { assignedDriver: 1 } });
    }

    revalidatePath('/admin/fleet/vehicles');
    return NextResponse.json(vehicle);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Vehicle number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    Vehicle.init();
    Driver.init();
    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
    }

    const vehicle = await Vehicle.findOneAndUpdate(query, { isDeleted: true }, { new: true });
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found or unauthorized' }, { status: 404 });

    // Unlink the driver
    if (vehicle.assignedDriver) {
      await Driver.findByIdAndUpdate(vehicle.assignedDriver, { $unset: { assignedVehicle: 1 } });
    }

    revalidatePath('/admin/fleet/vehicles');
    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
