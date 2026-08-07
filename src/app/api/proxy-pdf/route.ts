import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch PDF: ${response.statusText}`, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    // Force inline display instead of attachment
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="EwayBill.pdf"',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error: any) {
    console.error('PDF Proxy Error:', error);
    return new NextResponse('Error proxying PDF: ' + error.message, { status: 500 });
  }
}
