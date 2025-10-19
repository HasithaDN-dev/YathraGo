export type Notice = {
  id: string;
  title: string;
  body: string;
  publishedAt: string; // ISO date
  audience?: string; // optional audience tag
};

export const mockNotices: Notice[] = [
  {
    id: "n1",
    title: "Safety Reminder: Seat Belts",
    body: "All drivers are required to ensure children are seated and seat belts fastened where available.",
    publishedAt: "2025-08-01T09:00:00.000Z",
    audience: "drivers"
  },
  {
    id: "n2",
    title: "Weather Alert: Heavy Rain Expected",
    body: "Routes may be delayed due to heavy rain tomorrow. Please plan accordingly and communicate with parents.",
    publishedAt: "2025-09-15T07:30:00.000Z",
    audience: "all"
  }
];

let notices = [...mockNotices];

export function getNotices() {
  return notices.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function addNotice(n: Omit<Notice, 'id' | 'publishedAt'>) {
  const newNotice: Notice = {
    id: `n${Date.now()}`,
    publishedAt: new Date().toISOString(),
    ...n,
  };
  notices = [newNotice, ...notices];
  return newNotice;
}

export function getNotice(id: string) {
  return notices.find(n => n.id === id) ?? null;
}

export function updateNotice(id: string, data: Partial<Omit<Notice, 'id' | 'publishedAt'>>) {
  const idx = notices.findIndex(n => n.id === id);
  if (idx === -1) return null;
  const updated: Notice = {
    ...notices[idx],
    ...data,
    // keep publishedAt unless explicitly provided in data (unlikely)
    publishedAt: notices[idx].publishedAt,
  };
  notices[idx] = updated;
  // keep ordering by publishedAt (latest first)
  notices = notices.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return updated;
}

export function deleteNotice(id: string) {
  const exists = notices.some(n => n.id === id);
  if (!exists) return false;
  notices = notices.filter(n => n.id !== id);
  return true;
}
