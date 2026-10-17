import { NextRequest, NextResponse } from 'next/server';

interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  adSpend?: string;
  bottleneck?: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
}

// In-memory inquiry store for audit logging (in production connects to CRM / Webhook)
const recentInquiries: Array<InquiryPayload & { receivedAt: string; ip: string }> = [];

export async function POST(req: NextRequest) {
  try {
    const body: InquiryPayload = await req.json();

    // Input Validation
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid business email address.' },
        { status: 400 }
      );
    }

    // IP Attribution
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const recorded = {
      ...body,
      receivedAt: new Date().toISOString(),
      ip
    };

    recentInquiries.unshift(recorded);
    if (recentInquiries.length > 100) recentInquiries.pop();

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully. Ujjawal will review your funnel metrics.',
      leadId: `lead_${Date.now().toString(36)}`,
      attributedSource: body.utmSource || 'direct'
    });
  } catch (err) {
    console.error('Inquiry API Error:', err);
    return NextResponse.json(
      { error: 'Internal server error processing marketing inquiry.' },
      { status: 500 }
    );
  }
}
