require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Simple request logging for debugging
app.use((req, res, next) => {
  console.log('[proxy] incoming', req.method, req.url);
  // body may not be populated yet for JSON parser; log after parsing in routes
  next();
});

// Simple in-memory dedupe cache for Telegram messages to avoid duplicates
const recentTelegram = new Map(); // key -> timestamp
const TELEGRAM_DEDUPE_WINDOW_MS = 8000; // 8 seconds

async function sendTelegramMessage(text) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) throw new Error('Telegram not configured');
  const key = String(text).slice(0, 500);
  const now = Date.now();
  // cleanup
  for (const [k, t] of recentTelegram.entries()) {
    if (now - t > TELEGRAM_DEDUPE_WINDOW_MS) recentTelegram.delete(k);
  }
  if (recentTelegram.has(key)) {
    return { ok: false, skipped: true };
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const res = await axios.post(url, { chat_id: CHAT_ID, text, parse_mode: 'HTML' });
  if (res && res.data && res.data.ok) {
    recentTelegram.set(key, now);
    return { ok: true, result: res.data };
  }
  return { ok: false, result: res.data };
}

const TELEGRAM_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  } catch (e) {
    console.warn('Could not initialize Supabase admin client:', e.message || e);
  }
}

app.post('/api/telegram', async (req, res) => {
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'Telegram not configured on server.' });
  }

  const text = req.body.text || req.body.message || 'No message provided';
  try {
    const r = await sendTelegramMessage(text);
    if (r.skipped) return res.json({ ok: true, skipped: true });
    return res.json({ ok: !!r.ok, result: r.result });
  } catch (err) {
    console.error('Telegram proxy error:', err?.response?.data || err.message || err);
    return res.status(500).json({ ok: false, error: err?.response?.data || err.message || String(err) });
  }
});

// Server-side lead endpoint: inserts into Supabase (service role) and sends Telegram
app.post('/api/lead', async (req, res) => {
  const payload = req.body || {};
  const name = payload.name || 'Không rõ';
  const phone = payload.phone || 'Không rõ';
  const email = payload.email || null;
  const message = payload.message || '';
  const category = payload.type || payload.category || 'general';
  const position = payload.position || null;
  const years_experience = payload.yearsExperience || payload.years_experience || null;
  const expected_salary = payload.expectedSalary || payload.expected_salary || null;
  const skills = payload.skills || null;
  const education = payload.education || null;
  const portfolio = payload.portfolio || null;
  const resume_link = payload.resumeLink || payload.resume_link || null;
  const cover_letter = payload.coverLetter || payload.cover_letter || null;

  // Track results
  let supabaseOk = false;
  let telegramOk = false;

  // Try insertion with full structured object first (requires columns exist)
  if (supabaseAdmin) {
    try {
      const leadFull = {
        name,
        phone,
        email,
        message,
        category,
        position,
        years_experience,
        expected_salary,
        skills,
        education,
        portfolio,
        resume_link,
        cover_letter,
        status: 'new'
      };

      const { data, error } = await supabaseAdmin.from('leads').insert([leadFull]);
      if (!error) supabaseOk = true;
      else {
        console.warn('Supabase full insert failed, attempting fallback:', error.message || error);
        try {
          const { data: d2, error: e2 } = await supabaseAdmin.from('leads').insert([{ name, phone, email, message, status: 'new' }]);
          if (!e2) supabaseOk = true;
        } catch (e2) {
          console.error('Supabase fallback insert failed:', e2?.message || e2);
        }
      }
    } catch (e) {
      console.error('Supabase admin insert error:', e?.message || e);
      try {
        const { data: d3, error: e3 } = await supabaseAdmin.from('leads').insert([{ name, phone, email, message, status: 'new' }]);
        if (!e3) supabaseOk = true;
      } catch (e3) {
        console.error('Supabase fallback insert also failed:', e3?.message || e3);
      }
    }
  }

  // Compose a clear, single Telegram message including the category and structured fields
  try {
    if (TELEGRAM_TOKEN && CHAT_ID) {
      const markerMap = { consult: '🔴', catalog: '🔵', recruitment: '⚪️' };
      const labelMap = { consult: 'TƯ VẤN', catalog: 'NHẬN CATALOG', recruitment: 'TUYỂN DỤNG' };
      const marker = markerMap[category] || '📥';
      const catLabel = labelMap[category] || String(category).toUpperCase();

      let text = `${marker} <b>${catLabel}</b>\n----------------------------\n`;
      text += `<b>Thông tin liên hệ</b>\n`;
      text += `<b>Họ tên:</b> ${name}\n`;
      text += `<b>Điện thoại:</b> ${phone}`;
      if (email) text += `\n<b>Email:</b> ${email}`;
      if (payload.address) text += `\n<b>Địa chỉ:</b> ${payload.address}`;

      // Job / structured section (if present)
      const jobParts = [];
      if (position) jobParts.push(`<b>Vị trí:</b> ${position}`);
      if (years_experience) jobParts.push(`<b>Kinh nghiệm:</b> ${years_experience}`);
      if (expected_salary) jobParts.push(`<b>Lương mong muốn:</b> ${expected_salary}`);
      if (skills) jobParts.push(`<b>Kỹ năng:</b> ${skills}`);
      if (education) jobParts.push(`<b>Học vấn:</b> ${education}`);
      if (portfolio) jobParts.push(`<b>Portfolio:</b> ${portfolio}`);
      if (resume_link) jobParts.push(`<b>CV:</b> ${resume_link}`);
      if (cover_letter) jobParts.push(`<b>Thư xin việc:</b> ${cover_letter}`);
      if (jobParts.length) text += `\n\n<b>Chi tiết:</b>\n` + jobParts.join('\n');

      if (message) text += `\n\n<b>Nội dung:</b> ${message}`;

      text += `\n----------------------------\n<b>Supabase:</b> ${supabaseOk ? '✅' : '❌'}`;

      const r = await sendTelegramMessage(text);
      if (r.ok) telegramOk = true;
    }
  } catch (e) {
    console.warn('Telegram notify from /api/lead failed:', e?.response?.data || e.message || e);
  }

  res.json({ ok: true, supabase: supabaseOk, telegram: telegramOk });
});

app.listen(port, () => {
  console.log(`Telegram proxy server running on http://localhost:${port}`);
});
