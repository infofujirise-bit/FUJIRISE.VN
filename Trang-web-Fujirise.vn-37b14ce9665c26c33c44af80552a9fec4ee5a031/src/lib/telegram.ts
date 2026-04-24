import { supabase } from './supabase';

export const sendToTelegram = async (message: string) => {
  try {
    let token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    let chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const { data } = await supabase.from('private_settings').select('*').eq('id', 'default').single();
        if (data?.telegram_token) token = data.telegram_token;
        if (data?.telegram_chat_id) chatId = data.telegram_chat_id;
      }
    } catch (e) {}

    if (!token || !chatId) {
      console.warn('Thiếu cấu hình Telegram Bot Token hoặc Chat ID.');
      return false;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
    return res.ok;
  } catch (err) {
    console.error('Lỗi Telegram:', err);
    return false;
  }
};