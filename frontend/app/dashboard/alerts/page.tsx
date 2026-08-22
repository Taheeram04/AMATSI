'use client';

/*
 * app/dashboard/alerts/page.tsx — SMS ALERTS
 * Real alert history per farm from the backend, plus manual SMS dispatch.
 */

import { useCallback, useEffect, useState } from 'react';
import { BellRing, Send } from 'lucide-react';
import { alertAPI, farmAPI } from '@/lib/api/client';
import type { ApiFarm } from '@/types';
import { mockAlerts } from '@/lib/mock/data';

type AlertRow = { id: string; message: string; timestamp: string; status: 'delivered' | 'pending' | 'failed' };

const STATUS_STYLES: Record<AlertRow['status'], { badge: string; label: string }> = {
  delivered: { badge: 'bg-emerald-100 text-emerald-700', label: 'Delivered' },
  pending: { badge: 'bg-amber-100 text-amber-700', label: 'Pending' },
  failed: { badge: 'bg-rose-100 text-rose-600', label: 'Failed' },
};

export default function AlertsPage() {
  const [farms, setFarms] = useState<ApiFarm[]>([]);
  const [farmId, setFarmId] = useState<string>('');
  const [alerts, setAlerts] = useState<AlertRow[] | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await farmAPI.getFarms();
        setFarms(list);
        if (list.length > 0) setFarmId(list[0].id);
      } catch {
        setError('Failed to load farms');
      }
    })();
  }, []);

  const loadHistory = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setAlerts(await alertAPI.getHistory(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    }
  }, []);

  useEffect(() => {
    loadHistory(farmId);
  }, [farmId, loadHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      await alertAPI.send({ farm_id: farmId, message: message.trim() });
      setMessage('');
      setNotice('Alert queued for delivery.');
      await loadHistory(farmId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send alert');
    } finally {
      setSending(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const shownAlerts: AlertRow[] =
    alerts ??
    mockAlerts().map((a) => ({
      id: a.id,
      message: a.message,
      timestamp: a.timestamp,
      status: a.status,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">SMS Alerts</h1>
        <p className="mt-1 text-stone-500 text-sm">
          Delivery log and manual dispatch for your farms.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>
      )}

      <form onSubmit={handleSend} className="rounded-2xl border border-stone-200/60 bg-brand-card p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-stone-700">Farm</span>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              required
            >
              {farms.length === 0 && <option value="">No farms available</option>}
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-stone-700">Message</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Irrigate North Field tonight at 6pm"
              maxLength={320}
              required
              disabled={farms.length === 0}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={sending || farms.length === 0}
          className="flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {sending ? 'Queuing...' : 'Send SMS Alert'}
        </button>
      </form>

      <div className="rounded-2xl border border-stone-200/60 bg-brand-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <BellRing className="h-4 w-4 text-emerald-800" />
          <h2 className="font-serif text-base font-bold text-stone-900">Delivery History</h2>
        </div>
        {!farmId && farms.length === 0 ? (
          <p className="text-sm text-stone-500">Create a farm first to start sending alerts.</p>
        ) : shownAlerts.length === 0 ? (
          <p className="text-sm text-stone-500">No alerts sent yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {shownAlerts.map((a) => {
              const style = STATUS_STYLES[a.status];
              return (
                <li key={a.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm text-stone-800">{a.message}</p>
                    <p className="mt-0.5 text-[11px] font-mono text-stone-400">
                      {new Date(a.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${style.badge}`}>
                    {style.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
