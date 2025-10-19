import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.toString();
    const res = await fetch(`${BACKEND}/search?${q}`);
    const data = await res.text();
    return new NextResponse(data, { status: res.status });
  } catch {
    return new NextResponse('[]', { status: 500 });
  }
}
