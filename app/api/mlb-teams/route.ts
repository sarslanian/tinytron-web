import { NextResponse } from 'next/server';

const EXPRESS_URL = process.env.EXPRESS_URL ?? 'http://server:3000';

export async function GET() {
  try {
    const res = await fetch(`${EXPRESS_URL}/mlb/teams`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ teams: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${EXPRESS_URL}/mlb/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reach server' }, { status: 502 });
  }
}
