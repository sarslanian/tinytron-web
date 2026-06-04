import { NextResponse } from 'next/server';

const EXPRESS_URL = process.env.EXPRESS_URL ?? 'http://server:3000';

export async function GET() {
  const res = await fetch(`${EXPRESS_URL}/current_mode`, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { mode } = await request.json();
  const res = await fetch(`${EXPRESS_URL}/switch_mode/${mode}`, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data);
}
