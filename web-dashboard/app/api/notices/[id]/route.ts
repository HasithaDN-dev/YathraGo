import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET(req: Request, ctx: unknown) {
  const { params } = ctx as { params?: { id?: string } };
  const id = params?.id;
  const res = await fetch(`${BACKEND}/notifications/${id}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: Request, ctx: unknown) {
  try {
    const { params } = ctx as { params?: { id?: string } };
    const id = params?.id;
    const body = await req.json();
    const res = await fetch(`${BACKEND}/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: unknown) {
  const { params } = ctx as { params?: { id?: string } };
  const id = params?.id;
  const res = await fetch(`${BACKEND}/notifications/${id}`, { method: 'DELETE' });
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status });
  return NextResponse.json({ success: true });
}
