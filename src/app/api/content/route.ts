import { NextResponse } from 'next/server';
import { getPublishedContent } from '@/lib/db';

export async function GET() {
  const content = getPublishedContent();
  return NextResponse.json(content);
}
