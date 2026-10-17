import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeSVG } from '@/lib/qr';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url') || 'https://ai-intro-webpage.vercel.app';
    const download = searchParams.get('download') === 'true';

    const svgString = await generateQRCodeSVG({
      url: targetUrl,
      errorCorrectionLevel: 'Q',
      margin: 4,
      width: 400
    });

    const headers = new Headers();
    headers.set('Content-Type', 'image/svg+xml');
    if (download) {
      headers.set('Content-Disposition', 'attachment; filename="pocket-card-qr-print-spec.svg"');
    }

    return new NextResponse(svgString, { status: 200, headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'QR generation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
