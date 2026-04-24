import { supabase } from './supabase';

export const sendToTelegram = async (message: string) => {
  let token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  let chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  try {
    const { data } = await supabase.from('private_settings').select('telegram_token, telegram_chat_id').eq('id', 'default').single();
    if (data?.telegram_token) token = data.telegram_token;
    if (data?.telegram_chat_id) chatId = data.telegram_chat_id;
  } catch (e) {
    console.warn("Could not fetch telegram settings from DB", e);
  }

  if (!token || !chatId) {
    console.error("Missing Telegram config");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error sending to Telegram:", error);
    return false;
  }
};