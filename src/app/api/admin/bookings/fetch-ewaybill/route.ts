import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number');

    if (!number || !/^\d{12}$/.test(number)) {
      return NextResponse.json({ error: 'Invalid E-Way Bill Number. Must be exactly 12 digits.' }, { status: 400 });
    }

    // ==========================================
    // PLACEHOLDER: Integration with Government GSP APIs (ClearTax, Sandbox, etc.)
    // ==========================================
    // Example call logic:
    // const gspResponse = await fetch(`https://api.sandbox.co.in/gsp/ewb/v1.03/ewaybill?ewbNo=${number}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.GSP_BEARER_TOKEN}`,
    //     'x-api-key': process.env.GSP_API_KEY
    //   }
    // });
    // const data = await gspResponse.json();
    // ==========================================

    // Mock response details matching realistic goods shipments for testing:
    // We select different mock data depending on the last digit of the ewayBillNo for a dynamic feel
    const lastDigit = parseInt(number.slice(-1)) || 0;
    const index = lastDigit % 3;

    let mockEwayBillDetails: any;

    if (index === 0) {
      mockEwayBillDetails = {
        ewayBillNo: number,
        ewayBillDate: new Date().toLocaleDateString('en-IN'),
        consignor: {
          name: 'GUJARAT CHEMICALS LTD',
          gst: '24AAACG1234A1Z1',
          phone: '9825012345',
          address: 'Plot No. 12, GIDC Estate, Vatva, Ahmedabad, Gujarat - 382445'
        },
        consignee: {
          name: 'MAHARASHTRA PLASTICS CORP',
          gst: '27AAACM5678B2Z2',
          phone: '9922098765',
          address: 'Bldg C, Phase 2, Industrial Area, Thane, Maharashtra - 400604'
        },
        destinationBranch: 'MUMBAI',
        invoiceNumber: `INV/2026/08${lastDigit}0`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        totalValue: 125000,
        items: [
          {
            packages: 25,
            packaging: 'BAGS',
            description: 'POLYPROPYLENE GRANULES RAW MATERIAL',
            weight: 1250,
            nw: 'W',
            rate: 4.5,
            amount: 5625
          },
          {
            packages: 10,
            packaging: 'DRUMS',
            description: 'INDUSTRIAL PLASTICIZERS CHEMICALS',
            weight: 800,
            nw: 'W',
            rate: 6.0,
            amount: 4800
          }
        ]
      };
    } else if (index === 1) {
      mockEwayBillDetails = {
        ewayBillNo: number,
        ewayBillDate: new Date().toLocaleDateString('en-IN'),
        consignor: {
          name: 'SHREE AMBICA TEXTILES',
          gst: '24AABCS4589C1Z4',
          phone: '9426011223',
          address: 'G-24, New Textile Market, Ring Road, Surat, Gujarat - 395002'
        },
        consignee: {
          name: 'BALAJI GARMENTS',
          gst: '27AAEFB9876D2Z8',
          phone: '9892044556',
          address: 'Shop No 10, Sector 17, Vashi, Navi Mumbai, Maharashtra - 400703'
        },
        destinationBranch: 'SURAT',
        invoiceNumber: `INV/2026/09${lastDigit}1`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        totalValue: 98000,
        items: [
          {
            packages: 45,
            packaging: 'ROLLS',
            description: 'COTTON FABRIC GREY SHIRTING CLOTH',
            weight: 2150,
            nw: 'W',
            rate: 8.5,
            amount: 18275
          },
          {
            packages: 15,
            packaging: 'BOXES',
            description: 'TEXTILE DYES & COLOUR CHEMICALS',
            weight: 320,
            nw: 'W',
            rate: 12.0,
            amount: 3840
          }
        ]
      };
    } else {
      mockEwayBillDetails = {
        ewayBillNo: number,
        ewayBillDate: new Date().toLocaleDateString('en-IN'),
        consignor: {
          name: 'RAJKOT ENGINE VALVES',
          gst: '24AABCR7890F1Z9',
          phone: '9099088776',
          address: 'Plot 232, GIDC Metoda, Kalawad Road, Rajkot, Gujarat - 360021'
        },
        consignee: {
          name: 'AUTO PARTS DISTRIBUTORS',
          gst: '27AABCA4560E1ZA',
          phone: '9167055443',
          address: 'Ground Floor, Opera House, Mumbai, Maharashtra - 400004'
        },
        destinationBranch: 'RAJKOT',
        invoiceNumber: `INV/2026/07${lastDigit}2`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        totalValue: 156000,
        items: [
          {
            packages: 120,
            packaging: 'BOXES',
            description: 'AUTOMOTIVE ENGINE VALVES PRECISION PARTS',
            weight: 1500,
            nw: 'W',
            rate: 15.0,
            amount: 22500
          }
        ]
      };
    }

    return NextResponse.json(mockEwayBillDetails);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch E-Way Bill details.', details: error.message }, { status: 500 });
  }
}
