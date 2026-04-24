/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gcnkancuxubpcxaocxuc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbmthbmN1eHVicGN4YW9jeHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTU5NDcsImV4cCI6MjA5MjM5MTk0N30.xxpNK7Nwn_rzRwMO0rtaCs0SGJBt61-I1n7LRhftmJk';

// Lazy initialization to prevent app crash when keys are missing
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    const warn = () => console.warn('SUPABASE ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Action ignored.');
    
    return {
      from: () => ({
        insert: () => { warn(); return { error: { message: 'Supabase not configured' } }; },
        select: () => { warn(); return { data: [], count: 0, error: { message: 'Supabase not configured' } }; },
        order: function() { return this; },
        limit: function() { return this; },
        single: () => { warn(); return { data: null, error: { message: 'Supabase not configured' } }; },
        eq: function() { return this; },
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async () => { warn(); return { data: {}, error: null }; },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => { warn(); },
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      channel: () => ({
        on: function() { return this; },
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      removeChannel: () => {},
    };
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabaseClient() as any;

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  created_at?: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'seller';
}
