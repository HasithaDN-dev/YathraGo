import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams;
    type NotificationRow = { id?: number | string; [key: string]: unknown };

    // If client asks for allTypes, fetch broadcasts for several user types and merge
    if (search.get('allTypes') === '1' || search.get('allTypes') === 'true') {
      // Try admin endpoint first
      try {
        const adminRes = await fetch(`${BACKEND}/notifications/all`);
        if (adminRes.ok) {
          const body = await adminRes.json();
          // if backend returns wrapper { notifications: [...] }
          if (Array.isArray(body)) return NextResponse.json(body);
          if (Array.isArray(body?.notifications)) return NextResponse.json(body.notifications);
          if (Array.isArray(body?.data)) return NextResponse.json(body.data);
        }
      } catch (err) {
        console.warn('admin /notifications/all not available, falling back to merged queries', err);
      }

      const types = ['WEBUSER', 'DRIVER', 'CUSTOMER', 'VEHICLEOWNER'];
      const results: NotificationRow[] = [];

      await Promise.all(types.map(async (t) => {
        try {
          const r = await fetch(`${BACKEND}/notifications?userType=${t}&userId=0`);
          if (!r.ok) return;
          const body = await r.json();
          // backend may return { success, notifications } or an array
          if (Array.isArray(body)) results.push(...(body as NotificationRow[]));
          else if (Array.isArray((body as unknown as { notifications?: unknown[] }).notifications)) results.push(...(body as unknown as { notifications?: NotificationRow[] }).notifications!);
          else if (Array.isArray((body as unknown as { data?: unknown[] }).data)) results.push(...(body as unknown as { data?: NotificationRow[] }).data!);
        } catch (e) {
          // ignore individual failures
          console.error('proxy allTypes fetch failed for', t, e);
        }
      }));

      // dedupe by id
      const map = new Map<string, NotificationRow>();
      for (const item of results) {
        const row = item as NotificationRow;
        if (row && row.id !== undefined) map.set(String(row.id), row);
      }
      return NextResponse.json(Array.from(map.values()));
    }

    let res = await fetch(`${BACKEND}/notifications`);
    // If backend validates query params and returns 400, try a fallback that requests broadcasts for WEBUSER
    if (!res.ok && res.status === 400) {
      // try requesting broadcasts for WEBUSER (userId=0 will match receiverId === null broadcasts)
      res = await fetch(`${BACKEND}/notifications?userType=WEBUSER&userId=0`);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
