import { createClient } from '@supabase/supabase-js';

// 1. Kiểm tra môi trường để nhận biết trạng thái kết nối
const HAS_ENV = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://offline-fujirise.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'offline-key';

// 2. Tùy chỉnh Fetch API để website luôn "mượt", không bao giờ bị treo (xoay vòng) do mạng
const smoothFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  if (!HAS_ENV) {
    // Chặn fetch ngay lập tức nếu chưa có Data, mô phỏng lỗi chuẩn của Supabase
    return new Response(JSON.stringify({ message: 'Chưa cấu hình cơ sở dữ liệu', details: 'Offline bypass' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    return await fetch(url, options);
  } catch (error) {
    // Bắt lỗi rớt mạng hoặc tường lửa, trả về lỗi thay vì văng Exception sập trang web
    return new Response(JSON.stringify({ message: 'Mất kết nối mạng', details: 'Network Error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Duy trì phiên đăng nhập mượt mà cho Admin
    autoRefreshToken: true
  },
  global: {
    fetch: smoothFetch
  }
});

// 3. Ghi đè tính năng Realtime (WebSocket) để ngăn chặn rò rỉ bộ nhớ & giật lag
const originalChannel = supabase.channel.bind(supabase);
supabase.channel = (name: string, opts?: any) => {
  if (!HAS_ENV) {
    // Tạo một kênh (channel) giả mạo để các file UI gọi .subscribe() không bị sập
    const mockChannel: any = {
      on: () => mockChannel,
      subscribe: (cb?: any) => { if(cb) cb('CLOSED'); return mockChannel; },
      unsubscribe: () => Promise.resolve()
    };
    return mockChannel;
  }
  return originalChannel(name, opts);
};