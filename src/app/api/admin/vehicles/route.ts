import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getLogisticQuery, getLogisticIdForCreate } from '@/lib/apiAuth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    Vehicle.init();
    Driver.init();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    const query: any = { isDeleted: { $ne: true }, ...(await getLogisticQuery(request)) };
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(query).populate('assignedDriver', 'name phone').sort({ createdAt: -1 }).lean();
    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    await connectToDatabase();
    Vehicle.init();
    Driver.init();

    // Prevent Cast to ObjectId failed for empty string
    if (data.assignedDriver === "") {
      delete data.assignedDriver;
    }

    data.logisticId = await getLogisticIdForCreate();
    const vehicle = await Vehicle.create(data);

    if (data.assignedDriver) {
      // 1. Force remove this driver from ALL other vehicles to fix corrupted data
      await Vehicle.updateMany(
        { assignedDriver: data.assignedDriver, _id: { $ne: vehicle._id } },
        { $unset: { assignedDriver: 1 } }
      );
      
      // 2. Force remove this vehicle from ANY other drivers
      await Driver.updateMany(
        { assignedVehicle: vehicle._id, _id: { $ne: data.assignedDriver } },
        { $unset: { assignedVehicle: 1 } }
      );
      
      // 3. Assign new vehicle to driver
      await Driver.findByIdAndUpdate(data.assignedDriver, { assignedVehicle: vehicle._id });
    }

    revalidatePath('/admin/fleet/vehicles');
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Vehicle number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
