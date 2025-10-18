"use client";

import React, { useEffect, useState } from 'react';

type RemoteNotice = {
	id: number;
	sender: string;
	message: string;
	createdAt: string;
	receiver?: string;
};

export default function LatestNotices() {
	const [notices, setNotices] = useState<RemoteNotice[]>([]);

		useEffect(() => {
			let mounted = true;
			const fetchNotices = async () => {
				try {
					const res = await fetch('http://localhost:3000/notifications');
					if (!res.ok) return;
				const data: RemoteNotice[] = await res.json();
				// Only show notifications intended for WEBUSER or broadcast to ALL
				const filtered = data.filter((n) => n.receiver === 'WEBUSER' || n.receiver === 'ALL');
				if (mounted) setNotices(filtered.slice(0, 5));
				} catch (error) {
					console.error('Failed to fetch remote notifications', error);
				}
			};
			fetchNotices();
			const t = setInterval(fetchNotices, 30000); // refresh every 30s
			return () => {
				mounted = false;
				clearInterval(t);
			};
		}, []);

	if (!notices.length) {
		return <div className="text-sm text-gray-500">No notifications</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-4">
			{notices.map(n => (
				<div key={n.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
					<div className="font-semibold text-gray-900">{n.sender}</div>
					<div className="text-sm text-gray-600 mt-1">{n.message}</div>
					<div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
				</div>
			))}
		</div>
	);
}
