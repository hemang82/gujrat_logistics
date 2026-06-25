import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    Driver.init();
    Vehicle.init();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    const query: any = { isDeleted: { $ne: true } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(query).populate('assignedVehicle', 'vehicleNumber type').sort({ createdAt: -1 }).lean();
    return NextResponse.json(drivers);
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
    Driver.init();
    Vehicle.init();

    // Prevent Cast to ObjectId failed for empty string
    if (data.assignedVehicle === "") {
      delete data.assignedVehicle;
    }

    const driver = await Driver.create(data);

    if (data.assignedVehicle) {
      // 1. Force remove this vehicle from ALL other drivers to fix corrupted data
      await Driver.updateMany(
        { assignedVehicle: data.assignedVehicle, _id: { $ne: driver._id } },
        { $unset: { assignedVehicle: 1 } }
      );
      
      // 2. Force remove this driver from ANY other vehicles
      await Vehicle.updateMany(
        { assignedDriver: driver._id, _id: { $ne: data.assignedVehicle } },
        { $unset: { assignedDriver: 1 } }
      );
      
      // 3. Assign new driver to vehicle
      await Vehicle.findByIdAndUpdate(data.assignedVehicle, { assignedDriver: driver._id });
    }

    revalidatePath('/admin/fleet/drivers');
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'License number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
