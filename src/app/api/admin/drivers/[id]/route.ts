import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import { getLogisticQuery } from '@/lib/apiAuth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    Driver.init();
    Vehicle.init();

    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
    }

    const driver = await Driver.findOne(query).populate('assignedVehicle', 'vehicleNumber type').lean();
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

    return NextResponse.json(driver);
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
    Driver.init();
    Vehicle.init();

    // Prevent Cast to ObjectId failed for empty string
    if (data.assignedVehicle === "") {
      data.assignedVehicle = null;
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

    const oldDriver = await Driver.findOne(query);
    if (!oldDriver) return NextResponse.json({ error: 'Driver not found or unauthorized' }, { status: 404 });

    // Handle unset for empty strings
    const updatePayload: any = { ...data };
    if (data.branch === null) {
      delete updatePayload.branch;
    }

    const driver = await Driver.findOneAndUpdate(query, updatePayload, { new: true });

    if (data.branch === null) {
        await Driver.findByIdAndUpdate(id, { $unset: { branch: 1 } });
    }

    // Handle vehicle assignment changes
    if (oldDriver.assignedVehicle?.toString() !== data.assignedVehicle) {
      if (oldDriver.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(oldDriver.assignedVehicle, { $unset: { assignedDriver: 1 } });
      }
      if (data.assignedVehicle) {
        // 1. Force remove this vehicle from ALL other drivers to fix corrupted data
        await Driver.updateMany(
          { assignedVehicle: data.assignedVehicle, _id: { $ne: id } },
          { $unset: { assignedVehicle: 1 } }
        );
        
        // 2. Force remove this driver from ANY other vehicles
        await Vehicle.updateMany(
          { assignedDriver: id, _id: { $ne: data.assignedVehicle } },
          { $unset: { assignedDriver: 1 } }
        );
        
        // 3. Assign new driver to vehicle
        await Vehicle.findByIdAndUpdate(data.assignedVehicle, { assignedDriver: id });
      }
    }

    // If data.assignedVehicle is null, we need to explicitly unset it in the driver document
    if (data.assignedVehicle === null) {
        await Driver.findByIdAndUpdate(id, { $unset: { assignedVehicle: 1 } });
    }

    revalidatePath('/admin/fleet/drivers');
    return NextResponse.json(driver);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'License number already exists' }, { status: 400 });
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
    Driver.init();
    Vehicle.init();

    const query: any = { _id: id, ...(await getLogisticQuery()) };
    const user = session.user as any;
    if (user.role === 'branch_user' || user.role === 'branch') {
      query.branch = user.branchId || user.branch;
    }

    const driver = await Driver.findOneAndUpdate(query, { isDeleted: true }, { new: true });
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

    // Unlink the vehicle
    if (driver.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicle, { $unset: { assignedDriver: 1 } });
    }

    revalidatePath('/admin/fleet/drivers');
    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
