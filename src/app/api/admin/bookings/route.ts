import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Branch from '@/models/Branch';
import { resolveBranchId } from '@/lib/resolveBranch';
import { addCashTransaction } from '@/lib/ledgerUtils';
import { getLogisticQuery, getLogisticIdForCreate } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Booking.init();
    Vehicle.init();
    Driver.init();
    Branch.init();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query: any = { isDeleted: { $ne: true }, ...(await getLogisticQuery(req)) };

    // Apply branch isolation for branch users
    const userRole = (session.user as any)?.role;
    if (userRole === 'branch' || userRole === 'branch_user') {
      const userBranchStr = (session.user as any)?.branch || (session.user as any)?.bookingBranch;
      if (userBranchStr) {
        let userBranchObj = userBranchStr;
        try {
          if (typeof userBranchStr === 'string' && /^[0-9a-fA-F]{24}$/.test(userBranchStr)) {
            const mongoose = require('mongoose');
            userBranchObj = new mongoose.Types.ObjectId(userBranchStr);
          }
        } catch (e) { }

        query.$or = [
          { bookingBranch: userBranchObj },
          { branch: userBranchObj }
        ];
      }
    }

    if (search) {
      const cleanSearch = search.trim().replace(/^lr-/i, '');
      
      const searchConditions: any[] = [
        { lrNumber: { $regex: cleanSearch, $options: 'i' } },
        { lrNumber: cleanSearch } // exact string match
      ];
      
      if (!isNaN(Number(cleanSearch))) {
        searchConditions.push({ lrNumber: Number(cleanSearch) });
      }
      
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Sort by creation time descending (newest created first)
    const bookings = await Booking.find(query)
      .populate('branch', 'name code')
      .populate('bookingBranch', 'name code')
      .populate('destinationBranch', 'name code')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Booking.init();
    Vehicle.init();
    Driver.init();
    Branch.init();
    
    const data = await req.json();

    // Prevent Cast to ObjectId failed for empty string
    if (data.vehicle === "") delete data.vehicle;
    if (data.driver === "") delete data.driver;
    if (data.branch === "") delete data.branch;
    if (data.bookingBranch === "") delete data.bookingBranch;
    if (data.destinationBranch === "") delete data.destinationBranch;

    if (data.branch) data.branch = await resolveBranchId(data.branch);
    if (data.bookingBranch) data.bookingBranch = await resolveBranchId(data.bookingBranch);
    if (data.destinationBranch) data.destinationBranch = await resolveBranchId(data.destinationBranch);
    
    // Note: LR number duplicate check is now handled below in the generation logic
    
    
    // Map aggregated items to material field for backwards compatibility
    if (data.items && data.items.length > 0) {
      const firstItem = data.items[0];
      const totalQuantity = data.items.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0);
      const totalWeight = data.items.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0);
      const allItemDescriptions = data.items.map((item: any) => item.description).filter(Boolean).join(', ');
      
      data.material = {
        itemName: allItemDescriptions || firstItem.description || 'Goods',
        quantity: totalQuantity || 1,
        weight: totalWeight || 0,
        chargedWeight: totalWeight || 0,
        packagingType: firstItem.packaging || 'Pkg'
      };
    }

    if (!data.pickupLocation && data.bookingBranch) {
      data.pickupLocation = data.bookingBranch;
    }
    if (!data.deliveryLocation && data.destinationBranch) {
      data.deliveryLocation = data.destinationBranch;
    }

    // Auto-generate LR number starting from 10001 if not provided
    // Use database max to avoid race conditions / duplicate errors
    let finalLrNumber = data.lrNumber;
    const logisticQuery = await getLogisticQuery() || {};
    
    if (!finalLrNumber) {
      // Find the highest existing numeric LR number for this branch
      const allBookings = await Booking.find({ lrNumber: { $exists: true }, branch: data.branch, ...logisticQuery }, { lrNumber: 1 });
      let maxNum = 1000;
      allBookings.forEach((b: any) => {
        if (b.lrNumber) {
          const num = parseInt(String(b.lrNumber).replace(/\D/g, ''), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      finalLrNumber = (maxNum + 1).toString();
    } else {
      // If frontend sent a number, verify it's not taken — if taken, auto-increment
      const existingBooking = await Booking.findOne({ lrNumber: String(data.lrNumber), branch: data.branch, ...logisticQuery });
      if (existingBooking) {
        const allBookings = await Booking.find({ lrNumber: { $exists: true }, branch: data.branch, ...logisticQuery }, { lrNumber: 1 });
        let maxNum = 1000;
        allBookings.forEach((b: any) => {
          if (b.lrNumber) {
            const num = parseInt(String(b.lrNumber).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        finalLrNumber = (maxNum + 1).toString();
      }
    }
    
    // Initialize tracking history
    const trackingHistory = [
      {
        status: 'pending',
        timestamp: new Date(),
        remarks: 'Booking created (LR Generated)',
        location: data.pickupLocation || data.bookingBranch || 'Origin'
      }
    ];

    const newBooking = new Booking({
      ...data,
      lrNumber: finalLrNumber,
      logisticId: await getLogisticIdForCreate(),
      createdBy: session?.user?.id,
      status: 'pending',
      trackingHistory
    });
    
    await newBooking.save();

    // Mark Vehicle and Driver as on-trip
    if (data.vehicle) {
      await Vehicle.findByIdAndUpdate(data.vehicle, { status: 'on-trip' });
    }
    if (data.driver) {
      await Driver.findByIdAndUpdate(data.driver, { status: 'on-trip' });
    }
    
    // Ledger: If Booking is Paid, credit the origin branch
    if (newBooking.paymentCondition === 'paid' && newBooking.charges?.totalAmount > 0) {
      const originBranch = newBooking.bookingBranch || (session?.user as any)?.branch;
      if (originBranch) {
        await addCashTransaction({
          branchId: originBranch.toString(),
          type: 'credit',
          amount: newBooking.charges.totalAmount,
          referenceType: 'Booking',
          referenceId: newBooking._id.toString(),
          description: `Advance Paid LR booking: ${newBooking.lrNumber}`,
          createdBy: session?.user?.id
        });
        
        // Mark as paid since they paid in advance
        newBooking.isPaid = true;
        await newBooking.save();
      }
    }

    revalidatePath('/admin/bookings');
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
