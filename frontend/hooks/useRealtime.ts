'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useRealtime<T>(
  table: string,
  onPayload: (payload: T) => void
) {
  const handlerRef = useRef(onPayload);
  handlerRef.current = onPayload;

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const channel = client
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if ('new' in payload && payload.new) {
            handlerRef.current(payload.new as T);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [table]);
}
