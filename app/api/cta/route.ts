import { NextResponse } from 'next/server';

const CTA_API_KEY = process.env.CTA_API_KEY;
const MAP_ID = 40710;
const ROUTE = 'brn';
const LIMIT = 8;

interface Arrival {
  rn: string;
  destNm: string;
  arrT: string;
  isApp: string;
  isDly: string;
}

function extractField(xml: string, field: string): string {
  const open = `<${field}>`;
  const close = `</${field}>`;
  const start = xml.indexOf(open);
  if (start === -1) return '';
  return xml.slice(start + open.length, xml.indexOf(close, start)).trim();
}

function parseArrivals(xml: string): Arrival[] {
  const arrivals: Arrival[] = [];
  let pos = xml.indexOf('<eta>');
  while (pos !== -1) {
    const end = xml.indexOf('</eta>', pos);
    if (end === -1) break;
    const block = xml.slice(pos, end);
    arrivals.push({
      rn: extractField(block, 'rn'),
      destNm: extractField(block, 'destNm'),
      arrT: extractField(block, 'arrT'),
      isApp: extractField(block, 'isApp'),
      isDly: extractField(block, 'isDly'),
    });
    pos = xml.indexOf('<eta>', end);
  }
  return arrivals;
}

function minutesUntil(arrT: string): number {
  // arrT format: "20260628 14:30:00"
  const [datePart, timePart] = arrT.split(' ');
  const year = parseInt(datePart.slice(0, 4));
  const month = parseInt(datePart.slice(4, 6)) - 1;
  const day = parseInt(datePart.slice(6, 8));
  const [h, m, s] = timePart.split(':').map(Number);
  const arrMs = new Date(year, month, day, h, m, s).getTime();
  const diffMs = arrMs - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export async function GET() {
  if (!CTA_API_KEY) {
    return NextResponse.json({ error: 'CTA_API_KEY not configured' }, { status: 500 });
  }

  try {
    const url = `https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?mapid=${MAP_ID}&max=${LIMIT}&key=${CTA_API_KEY}&rt=${ROUTE}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`CTA API ${res.status}`);
    const xml = await res.text();

    const raw = parseArrivals(xml);
    const trains = raw.map(a => ({
      run: a.rn,
      dest: a.destNm === 'Kimball' ? 'Kimball' : a.destNm === 'Loop' ? 'Loop' : a.destNm,
      destShort: a.destNm === 'Kimball' ? 'KMBL' : a.destNm === 'Loop' ? 'LOOP' : a.destNm.slice(0, 4).toUpperCase(),
      minutes: minutesUntil(a.arrT),
      approaching: a.isApp === '1',
      delayed: a.isDly === '1',
    }));

    const kimball = trains.filter(t => t.dest === 'Kimball');
    const loop = trains.filter(t => t.dest === 'Loop');

    return NextResponse.json({ kimball, loop, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
