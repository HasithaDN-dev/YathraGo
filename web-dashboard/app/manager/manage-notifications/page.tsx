"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import type { Notice } from "@/lib/notices";

export default function PublishNoticesPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [type, setType] = useState<"System" | "Alert" | "Other" | "Chat">("System");
  const [receiver, setReceiver] = useState<"CUSTOMER" | "DRIVER" | "WEBUSER" | "ALL">("CUSTOMER");
  // selectedReceiver holds the chosen receiver from the name search
  const [selectedReceiver, setSelectedReceiver] = useState<{ id: number; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string; phone?: string; email?: string }>>([]);
  const searchTimeout = useRef<number | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'sender' | 'type'>('newest');
  const [selected, setSelected] = useState<Notice | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  type BackendNotification = {
    id: number | string;
    sender?: string;
    message?: string;
    createdAt?: string;
    receiver?: string;
    [key: string]: unknown;
  };

  const fetchNotices = useCallback(async () => {
    try {
      setFetchError(null);
  const res = await fetch('/api/notices?allTypes=1');
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to fetch /api/notices:', res.status, text);
        setNotices([]);
        setFetchError(`Failed to load notices: ${res.status} ${res.statusText}`);
        return;
      }

  const raw = await res.json();
  // save raw response for debugging and log
  setRawResponse(raw);
  console.debug('fetchNotices raw response:', raw);

      // backend might return an array or a wrapper object like { data: [...] } or { items: [...] }
      // also handle wrapper formats like { success: true, notifications: [...] } or { notification: {...} }
      const rows: BackendNotification[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.notifications)
        ? raw.notifications
        : Array.isArray(raw?.result)
        ? raw.result
        : Array.isArray(raw?.payload)
        ? raw.payload
        : raw?.notification && !Array.isArray(raw.notification)
        ? [raw.notification]
        : [];

      if (!Array.isArray(raw) && typeof raw === 'object' && raw !== null) {
        // if it's an object wrapper but doesn't contain common keys we'll warn
        if (!Array.isArray(raw.data) && !Array.isArray(raw.items) && !Array.isArray(raw.notifications)) {
          console.warn('fetchNotices: unexpected response shape', raw);
        }
      }

      // backend returns Notification rows: { id, sender, message, createdAt, ... }
      const data: Notice[] = rows.map((r: BackendNotification) => ({
        id: String(r.id),
        title: r.sender ?? '',
        body: r.message ?? '',
        publishedAt: r.createdAt ?? new Date().toISOString(),
        audience: r.receiver,
      }));
  console.debug('fetchNotices normalized rows:', rows, 'mapped count:', data.length);
  setNotices(data);
  // don't treat an empty list as an error — it's a valid state
  setFetchError(null);
    } catch (error) {
      console.error('Failed to fetch notices', error);
      setNotices([]);
      setFetchError(String(error));
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const openNotice = async (id: string) => {
    try {
      const res = await fetch(`/api/notices/${id}`);
      if (!res.ok) return;
      const r = await res.json();
      const n: Notice = {
        id: String(r.id),
        title: r.sender ?? r.title ?? '',
        body: r.message ?? r.body ?? '',
        publishedAt: r.createdAt ?? r.publishedAt ?? new Date().toISOString(),
        audience: r.receiver ?? r.audience,
      };
      setSelected(n);
    } catch (error) {
      console.error('openNotice failed', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchNotices();
    } catch (error) {
      console.error('delete failed', error);
    }
  };

  const startEdit = (n: Notice) => {
    setSelected(n);
    setEditing(true);
    setTitle(n.title);
    setBody(n.body);
    setAudience(((n as unknown) as { audience?: string }).audience || "all");
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/notices/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: title.trim(), message: body.trim(), receiver: audience === 'all' ? 'ALL' : (audience === 'drivers' ? 'DRIVER' : (audience === 'owners' ? 'VEHICLEOWNER' : 'WEBUSER')) }),
      });
      if (res.ok) {
        setEditing(false);
        setSelected(null);
        setTitle('');
        setBody('');
        await fetchNotices();
      }
    } catch (error) {
      console.error('saveEdit failed', error);
    }
  };

  const sendNotification = async () => {
    type AppPayload = {
      sender: string;
      message: string;
      type: "System" | "Alert" | "Other" | "Chat";
      receiver?: string;
      receiverId?: number;
    };

    const payloadForApp: AppPayload = {
      sender: title || "Admin",
      message: body,
      type,
    };

    if (receiver !== 'ALL') payloadForApp.receiver = receiver;

    // If a specific user was selected, send with receiverId.
    // If no specific user is selected and receiver !== 'ALL', interpret as "send to all of that type" (backend should handle receiver field).
    if (selectedReceiver) {
      payloadForApp.receiverId = selectedReceiver.id;
    }

    try {
      // prepare backend-shaped payload
      const backendPayload: Record<string, unknown> = {
        sender: payloadForApp.sender,
        message: payloadForApp.message,
        type: payloadForApp.type,
      };
      if (payloadForApp.receiver) backendPayload.receiver = payloadForApp.receiver;
      if (payloadForApp.receiverId !== undefined) backendPayload.receiverId = payloadForApp.receiverId;

      // For WEBUSER and ALL, use the proxied API which will forward to the backend.
      if (receiver === 'WEBUSER' || receiver === 'ALL') {
        await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendPayload),
        });
        await fetchNotices();
      }

      if (receiver === 'DRIVER' || receiver === 'CUSTOMER' || receiver === 'ALL') {
        const res = await fetch('http://localhost:3000/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendPayload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      alert('Notification sent');
      setTitle('');
      setBody('');
      setSelectedReceiver(null);
      setSearchTerm('');
      setSuggestions([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert('Failed to send: ' + message);
    }
  };

  // Debounced search for receiver names
  useEffect(() => {
    if (receiver === 'ALL') {
      setSuggestions([]);
      return;
    }
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/proxy-search?type=${encodeURIComponent(receiver)}&q=${encodeURIComponent(searchTerm)}`);
        // The dashboard proxy will forward to backend /search (we'll create a proxy route)
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('search error', err);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm, receiver]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">Manage Notifications</h1>
        <p className="text-[var(--neutral-gray)] mt-2">Create and publish notifications to users. You can target a specific user by receiverId or broadcast to all users of a receiver type.</p>
      </div>

      <Card className="shadow-sm border border-[var(--neutral-gray)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">New Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Input placeholder="Sender" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex gap-2">
              <select value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as "System" | "Alert" | "Other" | "Chat")} className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg">
                <option value="System">System</option>
                <option value="Alert">Alert</option>
                <option value="Other">Other</option>
                <option value="Chat">Chat</option>
              </select>

              <select value={receiver} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReceiver(e.target.value as "CUSTOMER" | "DRIVER" | "WEBUSER" | "ALL")} className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg">
                <option value="CUSTOMER">Customer</option>
                <option value="DRIVER">Driver</option>
                <option value="WEBUSER">Web User</option>
                <option value="ALL">All</option>
              </select>


              {/* receiver search */}
              <div className="mt-2 w-full">
                <Input placeholder="Search receiver by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="text-xs text-[var(--neutral-gray)] mt-1">Leave empty to send to all users of the selected receiver type.</div>
                {selectedReceiver && (
                  <div className="mt-1 text-sm">Selected: <span className="font-medium">{selectedReceiver.name}</span></div>
                )}
                {suggestions.length > 0 && (
                  <div className="border rounded mt-1 bg-white max-h-40 overflow-auto">
                    {suggestions.map(s => (
                      <div key={s.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setSelectedReceiver({ id: s.id, name: s.name }); setSearchTerm(''); setSuggestions([]); }}>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-[var(--neutral-gray)]">{s.phone ?? s.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={sendNotification} className="bg-[var(--success-green)] text-white">Send</Button>
              
              <Link href="/manager">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-[var(--neutral-gray)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">Published Notices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fetchError && (
              <div className="text-sm text-[var(--error-red)]">{fetchError}</div>
            )}
            {(!fetchError && notices.length === 0 && rawResponse) && (
              <div className="text-xs text-[var(--neutral-gray)] mt-2">
                <div className="font-medium">Raw response (debug):</div>
                <pre className="whitespace-pre-wrap text-[12px] max-h-48 overflow-auto">{JSON.stringify(rawResponse, null, 2)}</pre>
              </div>
            )}
            {/* Sorting controls */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm mr-2">Sort:</label>
                <select value={sortBy} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSortBy(e.target.value as 'newest' | 'oldest' | 'sender' | 'type'); setPage(1); }} className="px-2 py-1 border rounded">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="sender">Sender</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>

            {(() => {
              const sorted = [...notices].sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
                if (sortBy === 'oldest') return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
                if (sortBy === 'sender') return (a.title || '').localeCompare(b.title || '');
                if (sortBy === 'type') return (((a as unknown) as { type?: string }).type || '').localeCompare(((b as unknown) as { type?: string }).type || '');
                return 0;
              });
              return sorted.slice((page - 1) * pageSize, page * pageSize).map(n => (
                <div key={n.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-[var(--color-deep-navy)]">{n.title}</div>
                      <div className="text-xs text-[var(--neutral-gray)]">{new Date(n.publishedAt).toLocaleString()}</div>
                      <div className="text-sm mt-1">{n.body}</div>
                    </div>
                    <div className="flex flex-col items-end ml-4 space-y-2">
                      <Button size="sm" variant="outline" onClick={() => openNotice(n.id)}>View</Button>
                      {(n.audience === 'WEBUSER') && (
                        <>
                          <Button size="sm" onClick={() => startEdit(n)} className="bg-[var(--bright-orange)] text-white">Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(n.id)} className="text-[var(--error-red)] border-[var(--error-red)]">Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.min(Math.ceil(notices.length / pageSize), p + 1))} disabled={page >= Math.ceil(notices.length / pageSize)}>Next</button>
              <div className="text-sm text-[var(--neutral-gray)]">Page {page} of {Math.max(1, Math.ceil(notices.length / pageSize))}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Page size:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View / Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-deep-navy)]">{editing ? 'Edit Notice' : selected.title}</h3>
              <div className="flex items-center gap-2">
                {editing ? (
                  <Button size="sm" onClick={() => { saveEdit(); }}>Save</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setSelected(null); }}>Close</Button>
                )}
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
                <div className="flex gap-2">
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} className="px-3 py-2 border border-[var(--neutral-gray)] rounded-lg">
                    <option value="all">All</option>
                    <option value="drivers">Drivers</option>
                    <option value="owners">Owners</option>
                  </select>
                  <Button onClick={() => { setEditing(false); setTitle(''); setBody(''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-[var(--neutral-gray)]">{selected.body}</div>
                <div className="text-xs text-[var(--neutral-gray)]">Published: {new Date(selected.publishedAt).toLocaleString()}</div>
                <div className="flex gap-2 mt-4">
                  {selected.audience === 'WEBUSER' ? (
                    <>
                      <Button onClick={() => startEdit(selected)}>Edit</Button>
                      <Button variant="destructive" onClick={() => { handleDelete(selected.id); setSelected(null); }}>Delete</Button>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--neutral-gray)]">This notice is not a Web User notice. Edit and delete are restricted.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
