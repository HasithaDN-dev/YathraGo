"use client";

import React, { useEffect, useState } from 'react';
import { getNotices, Notice } from '@/lib/notices';

type NoticeLike = Record<string, unknown>;

export default function LatestNotices() {
	const [notices, setNotices] = useState<Notice[]>(() =>
		getNotices().filter(n => {
			const a = (n.audience || '').toLowerCase();
			return a === '' || a === 'all' || a === 'web';
		}).slice(0, 5)
	);

	useEffect(() => {
		let mounted = true;
		const fetchNotices = async () => {
			try {
				const res = await fetch('/api/notices?userType=WEBUSER&userId=0');
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const body = await res.json();

				let items: NoticeLike[] = [];
				if (Array.isArray(body)) items = body;
				else if (Array.isArray(body.notifications)) items = body.notifications as NoticeLike[];
				else if (Array.isArray(body.data)) items = body.data as NoticeLike[];
				else if (Array.isArray(body.result)) items = body.result as NoticeLike[];
				else if (body.payload) {
					const p = body.payload as unknown as NoticeLike;
					if (p && typeof p === 'object' && Array.isArray(p.notifications as unknown)) items = p.notifications as NoticeLike[];
				}
				else items = [];

				const normalized: Notice[] = items.map((it: NoticeLike) => ({
					id: String((it.id ?? it._id ?? it.noticeId ?? '')),
					title: String(it.title ?? it.message ?? it.body ?? ''),
					body: String(it.body ?? it.message ?? ''),
					publishedAt: String(it.createdAt ?? it.publishedAt ?? it.created_at ?? new Date().toISOString()),
					audience: String(it.audience ?? it.receiver ?? ''),
				}));

				const webOnly = normalized.filter(n => {
					const a = (n.audience || '').toLowerCase();
					return a === '' || a === 'all' || a === 'web';
				}).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

				if (mounted) setNotices(webOnly.slice(0, 5));
			} catch (err) {
				console.debug('LatestNotices: failed to load remote notices', err);
				// keep initial mocks
			}
		};
		fetchNotices();
		const t = setInterval(fetchNotices, 30000);
		return () => { mounted = false; clearInterval(t); };
	}, []);

	if (!notices.length) return <div className="text-sm text-gray-500">No notifications</div>;

	return (
		<div className="grid grid-cols-1 gap-4">
			{notices.map(n => (
				<div key={n.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
					<div className="font-semibold text-gray-900">{n.title}</div>
					<div className="text-sm text-gray-600 mt-1">{n.body}</div>
					<div className="text-xs text-gray-400 mt-2">{new Date(n.publishedAt).toLocaleString()}</div>
				</div>
			))}
		</div>
	);
}
