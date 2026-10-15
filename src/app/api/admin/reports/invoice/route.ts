import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    Client.init();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const role = (session.user as any)?.role;
    const userLogisticId = role === 'logistic' ? (session.user as any)?.id : (session.user as any)?.logisticId;

    const query: any = { isDeleted: { $ne: true } };

    if (role === 'logistic' || userLogisticId) {
      query.logisticId = userLogisticId;
    }

    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.invoiceDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.invoiceDate.$lte = end;
      }
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { invoiceNumber: { $regex: s, $options: 'i' } },
        { clientName: { $regex: s, $options: 'i' } },
        { clientPhone: { $regex: s, $options: 'i' } }
      ];
    }

    Booking.init();

    const invoices = await Invoice.find(query)
      .sort({ invoiceDate: -1, createdAt: -1 })
      .populate('client', 'name phone gstNumber companyName')
      .populate({
        path: 'bookings',
        select: 'material items charges lrNumber'
      })
      .lean();

    let grandBilledAmount = 0;
    let grandPaidAmount = 0;
    let grandDueAmount = 0;
    let grandGstAmount = 0;
    let grandPkgs = 0;
    let grandWeight = 0;

    const formatted = invoices.map((inv: any) => {
      const total = Number(inv.grandTotal) || 0;
      const paid = Number(inv.amountPaid) || 0;
      const due = total - paid;
      const gst = Number(inv.totalGst) || 0;

      // Calculate total pkgs and weight across all LRs in this invoice
      let pkgs = 0;
      let weight = 0;
      if (inv.bookings && Array.isArray(inv.bookings)) {
        inv.bookings.forEach((b: any) => {
          if (b.items && Array.isArray(b.items) && b.items.length > 0) {
            pkgs += b.items.reduce((s: number, it: any) => s + (Number(it.packages) || 0), 0);
            weight += b.items.reduce((s: number, it: any) => s + (Number(it.weight) || 0), 0);
          } else if (b.material) {
            pkgs += Number(b.material.quantity) || 1;
            weight += Number(b.material.weight) || 0;
          }
        });
      }

      grandBilledAmount += total;
      grandPaidAmount += paid;
      grandDueAmount += due;
      grandGstAmount += gst;
      grandPkgs += pkgs;
      grandWeight += weight;

      return {
        _id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        clientName: inv.client?.companyName || inv.clientName || 'N/A',
        clientPhone: inv.clientPhone || inv.client?.phone || '',
        clientGst: inv.clientGst || inv.client?.gstNumber || '',
        lrCount: inv.bookings?.length || 0,
        pkgs,
        weight,
        totalFreight: Number(inv.totalFreight) || 0,
        totalGst: gst,
        grandTotal: total,
        amountPaid: paid,
        amountDue: due,
        status: inv.status || 'unpaid'
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalInvoices: formatted.length,
        grandBilledAmount,
        grandPaidAmount,
        grandDueAmount,
        grandGstAmount,
        grandPkgs,
        grandWeight
      },
      records: formatted
    });
  } catch (error: any) {
    console.error('Invoice Report API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
