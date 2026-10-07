import { NextResponse } from 'next/server';

const EXPRESS_URL = process.env.EXPRESS_URL ?? 'http://server:3000';

export async function GET() {
  const res = await fetch(`${EXPRESS_URL}/text`, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${EXPRESS_URL}/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data);
}
