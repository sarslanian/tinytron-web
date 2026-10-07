import { NextResponse } from 'next/server';

const EXPRESS_URL = process.env.EXPRESS_URL ?? 'http://server:3000';

export async function GET() {
  try {
    const res = await fetch(`${EXPRESS_URL}/cfb/teams`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ teams: [] });
  }
}
