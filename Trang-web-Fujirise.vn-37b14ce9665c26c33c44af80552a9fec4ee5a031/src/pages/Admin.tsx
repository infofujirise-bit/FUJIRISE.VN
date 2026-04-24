import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Users, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  ArrowUpRight,
  MessageSquare,
  Activity,
  Calendar,
  Lock,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  UserPlus,
  Edit3,
  Trash2,
  UploadCloud,
  Palette,
  Sparkles,
  Brain,
  Wrench,
  Clock,
  PackageCheck,
  FileBadge,
  Headset,
  Star,
  Award,
  Database,
  AlertTriangle,
  ImageIcon as LucideImage,
  X,
  Send
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { sendToTelegram } from '../lib/telegram';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status?: string;
  created_at: string;
};

type Tab = 'dashboard' | 'content' | 'images' | 'configurator' | 'warranty' | 'users' | 'settings';

export default function Admin() {
  const [user, setUser] = React.useState<any>(null);
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'admin' | 'editor'>('admin');
  const [isAppLoading, setIsAppLoading] = React.useState(true);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<Tab>('dashboard');
  const [error, setError] = React.useState('');
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  // Quên mật khẩu State
  const [forgotStep, setForgotStep] = React.useState(0);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotOTP, setForgotOTP] = React.useState('');
  const [generatedOTP, setGeneratedOTP] = React.useState('');
  const [forgotMsg, setForgotMsg] = React.useState('');
  const [isSendingQuickReport, setIsSendingQuickReport] = React.useState(false);

  React.useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('fuji_admin_session');
      if (sessionStr) {
        const u = JSON.parse(sessionStr);
        setUser(u);
        setIsAdminUser(true);
        setUserRole(u.role || 'admin');
      }
    } catch(e) {
      try { localStorage.removeItem('fuji_admin_session'); } catch(err) {}
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Bộ đếm, Ghi Log Database và Cảnh báo AI Telegram
    const reportSuccess = async (mode: string) => {
      try { localStorage.removeItem('fuji_failed_login'); } catch(e) {}
      sendToTelegram(`✅ <b>ĐĂNG NHẬP ADMIN THÀNH CÔNG</b>\n- Tài khoản: ${cleanEmail}\n- Chế độ: ${mode}\n- Thời gian: ${new Date().toLocaleString('vi-VN')}`).catch(()=>{});
      if (import.meta.env.VITE_SUPABASE_URL) {
        try {
          await supabase.from('security_logs').insert([{ event_type: 'login_success', email_tried: cleanEmail, details: { mode } }]);
        } catch(e) {}
      }
    };

    const reportFailure = async (errorMsg: string) => {
      // Tắt trạng thái Loading và báo lỗi ngay lập tức cho người dùng, các lệnh AI sẽ chạy ngầm
      setError(errorMsg);
      setIsLoggingIn(false);

      let fails = 1;
      try {
        fails = parseInt(localStorage.getItem('fuji_failed_login') || '0') + 1;
        localStorage.setItem('fuji_failed_login', fails.toString());
      } catch(e) {}
      
      if (import.meta.env.VITE_SUPABASE_URL) {
        try {
          await supabase.from('security_logs').insert([{ event_type: 'login_failed', email_tried: cleanEmail, details: { password_tried: cleanPassword, fails, error: errorMsg } }]);
        } catch(e) {}
      }

      if (fails >= 3) {
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAhr4zkQ9hlrDRdLcGpJxXG52dZSyFdRw4";
          if (apiKey) {
             const prompt = `Phân tích hành vi bảo mật hệ thống: Có kẻ gian đang cố gắng dò mật khẩu vào trang Quản trị (Admin) của website bán thang máy.
             - Email vừa thử: "${cleanEmail}"
             - Mật khẩu vừa thử: "${cleanPassword}"
             - Số lần thử sai liên tiếp: ${fails} lần.
             Yêu cầu: Đóng vai trò là chuyên gia bảo mật AI, hãy viết một tin nhắn cảnh báo khẩn cấp (tối đa 4 câu) gửi cho chủ website qua Telegram. Phân tích xem mật khẩu kẻ gian thử có tính chất gì (đoán bừa hay có chủ đích). Tin nhắn cần có các biểu tượng cảnh báo nguy hiểm (🚨, ⚠️), nêu rõ mức độ nghiêm trọng và đề xuất 1 hành động bảo mật. Trả về đúng nội dung tin nhắn HTML (dùng <b>, <i>), không giải thích thêm.`;

             // Thêm Timeout 5 giây để tránh treo API của Gemini
             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 5000);
             
             const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                signal: controller.signal
             });
             clearTimeout(timeoutId);
             const data = await res.json();
             const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

             if (aiMessage) {
                 await sendToTelegram(`🤖 <b>AI BẢO MẬT CẢNH BÁO</b>\n\n${aiMessage.replace(/```html/g, '').replace(/```/g, '')}`);
             } else throw new Error('No AI MSG');
          } else throw new Error('No API Key');
        } catch (e) {
           // Fallback nếu AI lỗi
           sendToTelegram(`🚨 <b>CẢNH BÁO BẢO MẬT MỨC CAO</b>\nPhát hiện cố gắng xâm nhập Web Admin!\n- Tài khoản nhập: ${cleanEmail}\n- Mật khẩu: ${cleanPassword}\n- Số lần sai: ${fails}\n- Thời gian: ${new Date().toLocaleString('vi-VN')}`).catch(()=>{});
        }
      }
    };

    // 1. Chế độ Offline/Bypass khi chưa cấu hình file .env
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '') {
      if (cleanEmail === 'info.fujirise@gmail.com' && cleanPassword === 'Fujirise2026@') {
        await reportSuccess('Local Offline');
        setUser({ id: 'admin-local', email: cleanEmail, role: 'admin' });
        setIsAdminUser(true);
        setUserRole('admin');
        setActiveTab('dashboard');
        setIsLoggingIn(false);
        return;
      } else {
        return await reportFailure('Website chưa kết nối Database (Thiếu file .env). Vui lòng dùng tài khoản gốc!');
      }
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (error) {
        // 2. Chế độ Bypass khi chưa chạy SQL (bảng admins chưa tồn tại)
        if (error.message?.includes('does not exist') || error.message?.includes('admins') || error.code === '42P01') {
          if (cleanEmail === 'info.fujirise@gmail.com' && cleanPassword === 'Fujirise2026@') {
            await reportSuccess('SQL Bypass');
            setUser({ id: 'admin-temp', email: cleanEmail, role: 'admin' });
            setIsAdminUser(true);
            setUserRole('admin');
            setActiveTab('dashboard');
            setIsLoggingIn(false);
            return;
          }
        }
        return await reportFailure('Lỗi CSDL: ' + error.message);
      }

      if (!data) {
        // 3. Trường hợp Supabase tự động bật khóa RLS chặn quyền đọc, data sẽ bị rỗng (null)
        if (cleanEmail === 'info.fujirise@gmail.com' && cleanPassword === 'Fujirise2026@') {
          await reportSuccess('RLS Failsafe Bypass');
          setUser({ id: 'admin-temp', email: cleanEmail, role: 'admin' });
          setIsAdminUser(true);
          setUserRole('admin');
          setActiveTab('dashboard');
          setIsLoggingIn(false);
          return;
        }
        return await reportFailure('Sai email hoặc mật khẩu!');
      }

      if (data) {
        await reportSuccess('Chính thức');
        setUser(data);
        setIsAdminUser(true);
        setUserRole(data.role);
        try { localStorage.setItem('fuji_admin_session', JSON.stringify(data)); } catch(e) {}
        setActiveTab('dashboard');
      } else {
        return await reportFailure('Sai email hoặc mật khẩu!');
      }
    } catch (err: any) {
      return await reportFailure('Lỗi hệ thống: ' + err.message);
    }
    
    setIsLoggingIn(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    
    const cleanEmail = forgotEmail.trim().toLowerCase();

    try {
      if (forgotStep === 1) {
        const { data, error } = await supabase.from('admins').select('*').eq('email', cleanEmail).maybeSingle();
        
        if (error) {
          setForgotMsg('Lỗi kiểm tra dữ liệu: ' + error.message);
          return;
        }

        if (!data) {
          // Nếu là email admin gốc nhưng chưa có trong DB -> Tự động khởi tạo lại
          if (cleanEmail === 'info.fujirise@gmail.com') {
             const newId = 'admin-' + Math.random().toString(36).substring(2, 15);
             const { error: insertErr } = await supabase.from('admins').insert([{ id: newId, email: cleanEmail, password: 'Fujirise2026@', role: 'admin' }]);
             if (insertErr) {
               setForgotMsg('Không thể khởi tạo tài khoản gốc: ' + insertErr.message);
               return;
             }
          } else {
            setForgotMsg('Email không tồn tại trong hệ thống.');
            return;
          }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(otp);

        let token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        let chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
        try {
          const { data: privConfig } = await supabase.from('private_settings').select('*').eq('id', 'default').single();
          if (privConfig?.telegram_token) token = privConfig.telegram_token;
          if (privConfig?.telegram_chat_id) chatId = privConfig.telegram_chat_id;
        } catch (e) {}

        if (token && chatId) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: `🔐 <b>YÊU CẦU KHÔI PHỤC MẬT KHẨU</b>\n📧 Tài khoản: ${cleanEmail}\n🔑 Mã OTP của bạn là: <b>${otp}</b>\n\n<i>Nhập mã này lên website để nhận mật khẩu mới.</i>`, parse_mode: 'HTML' })
          });
          setForgotStep(2);
        } else {
          if (cleanEmail === 'info.fujirise@gmail.com') {
             setForgotMsg('Mật khẩu gốc của bạn mặc định là: Fujirise2026@');
          } else {
             setForgotMsg('Hệ thống chưa cài Telegram Bot! Không thể gửi OTP.');
          }
        }
      } else if (forgotStep === 2) {
        if (forgotOTP.trim() === generatedOTP) {
          const newPass = 'Fuji' + Math.floor(1000 + Math.random() * 9000).toString();
          const { error: updateError } = await supabase.from('admins').update({ password: newPass }).eq('email', cleanEmail);
          
          if (updateError) { setForgotMsg('Lỗi CSDL: ' + updateError.message); return; }

          let token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
          let chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
          try {
            const { data: privConfig } = await supabase.from('private_settings').select('*').eq('id', 'default').single();
            if (privConfig?.telegram_token) token = privConfig.telegram_token;
            if (privConfig?.telegram_chat_id) chatId = privConfig.telegram_chat_id;
          } catch (e) {}

          if (token && chatId) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: `✅ <b>KHÔI PHỤC THÀNH CÔNG</b>\n📧 Tài khoản: ${cleanEmail}\n🔑 Mật khẩu mới của bạn là: <b>${newPass}</b>\n\n<i>Vui lòng đăng nhập bằng mật khẩu này.</i>`, parse_mode: 'HTML' })
            });
          }
          alert('Mật khẩu mới đã được cấp và gửi qua Telegram của bạn!');
          setForgotStep(0); setForgotEmail(''); setForgotOTP('');
        } else {
          setForgotMsg('Mã OTP không chính xác!');
        }
      }
    } catch (err: any) {
      setForgotMsg('Có lỗi xảy ra: ' + err.message);
    }
  };

  const sendQuickReport = async () => {
    setIsSendingQuickReport(true);
    try {
      let token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      let chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      try {
        const { data: privConfig } = await supabase.from('private_settings').select('*').eq('id', 'default').single();
        if (privConfig?.telegram_token) token = privConfig.telegram_token;
        if (privConfig?.telegram_chat_id) chatId = privConfig.telegram_chat_id;
      } catch (e) {}

      if (!token || !chatId) {
        alert("Chưa cấu hình Telegram Token hoặc Chat ID trong Cài đặt!");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const { count: totalViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
      const { count: todayViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayIso);

      const { data: todayLeads } = await supabase.from('leads').select('*').gte('created_at', todayIso);
      const leadsCount = todayLeads?.length || 0;

      let tuVanLeads: any[] = [];
      let tuyenDungLeads: any[] = [];
      let catalogLeads: any[] = [];

      todayLeads?.forEach(lead => {
        const msg = (lead.message || '').toLowerCase();
        if (msg.includes('ứng tuyển') || msg.includes('tuyển dụng')) tuyenDungLeads.push(lead);
        else if (msg.includes('catalog')) catalogLeads.push(lead);
        else tuVanLeads.push(lead);
      });

      let msgText = `📊 <b>BÁO CÁO NHANH WEBSITE</b>\n`;
      msgText += `📅 Ngày: ${new Date().toLocaleDateString('vi-VN')} - ${new Date().toLocaleTimeString('vi-VN')}\n`;
      msgText += `----------------------------\n`;
      msgText += `👁 <b>Lượt truy cập:</b> ${todayViews || 0} (Hôm nay) / ${totalViews || 0} (Tổng)\n`;
      msgText += `📩 <b>Yêu cầu mới:</b> ${leadsCount}\n`;
      msgText += `----------------------------\n`;

      if (leadsCount > 0) {
         if (tuVanLeads.length > 0) { msgText += `📞 <b>CẦN TƯ VẤN (${tuVanLeads.length}):</b>\n`; tuVanLeads.forEach(l => msgText += `- ${l.name} | ${l.phone}\n`); }
         if (catalogLeads.length > 0) { msgText += `📔 <b>XIN CATALOG (${catalogLeads.length}):</b>\n`; catalogLeads.forEach(l => msgText += `- ${l.name} | ${l.phone} | ${l.email || ''}\n`); }
         if (tuyenDungLeads.length > 0) { msgText += `💼 <b>ỨNG TUYỂN (${tuyenDungLeads.length}):</b>\n`; tuyenDungLeads.forEach(l => msgText += `- ${l.name} | ${l.phone}\n`); }
      } else {
        msgText += `<i>Chưa có khách hàng liên hệ hôm nay.</i>\n`;
      }

      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: msgText, parse_mode: 'HTML' }) });
      if (!res.ok) throw new Error("Lỗi API Telegram");
      alert("Đã gửi báo cáo nhanh qua Telegram thành công!");
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi gửi báo cáo: " + err.message);
    } finally { 
      setIsSendingQuickReport(false); 
    }
  };

  const handleLogout = async () => {
    try { localStorage.removeItem('fuji_admin_session'); } catch(e) {}
    setUser(null);
    setIsAdminUser(false);
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-fuji-blue rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-black text-fuji-blue text-xs italic">F</div>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser) {
    return (
      <div className="min-h-screen bg-fuji-blue relative flex items-center justify-center p-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuji-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-3xl border border-white/20 w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative z-10"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-white text-fuji-blue rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-2xl relative">
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-fuji-accent rounded-full flex items-center justify-center text-[10px] text-white animate-bounce">
                <Lock size={12} />
              </div>
              F
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight italic">FUJIRISE ADMIN</h1>
            <p className="text-white/50 text-[10px] uppercase font-black tracking-[0.2em] mt-2">Hệ quản trị cao cấp</p>
          </div>

          <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Tài khoản (Email)</label>
                  <input 
                    type="email" 
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all text-white placeholder:text-white/20"
                    placeholder="info.fujirise@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Mật khẩu</label>
                    <button type="button" onClick={() => setForgotStep(1)} className="text-[10px] font-bold text-white/50 hover:text-white transition-colors underline">Quên mật khẩu?</button>
                  </div>
                  <input 
                    type="password" 
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all text-white placeholder:text-white/20"
                    placeholder="••••••••"
                  />
                </div>
                
                <button type="submit" disabled={isLoggingIn} className="w-full bg-white text-fuji-blue py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 mt-2 hover:bg-fuji-accent hover:text-white transition-all">
                  {isLoggingIn ? 'Đang xử lý...' : 'ĐĂNG NHẬP HỆ THỐNG'}
                </button>
                
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-[10px] font-bold uppercase tracking-wider text-center">{error}</div>
                )}
              </form>
          </div>

          <AnimatePresence>
            {forgotStep > 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative text-slate-800">
                  <button onClick={() => {setForgotStep(0); setForgotMsg('');}} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  <h3 className="text-xl font-black text-fuji-blue mb-2">Khôi phục mật khẩu</h3>
                  
                  <form onSubmit={handleForgotSubmit} className="space-y-4 mt-6">
                    {forgotStep === 1 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-4 font-medium">Hệ thống sẽ gửi mã OTP xác thực qua Telegram của bạn.</p>
                        <label className="text-[10px] font-black uppercase text-slate-400">Nhập Email của bạn</label>
                        <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-fuji-blue outline-none" placeholder="info.fujirise@gmail.com" />
                      </div>
                    )}
                    {forgotStep === 2 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-4 font-medium">Mã OTP 6 số đã được gửi qua Telegram của bạn.</p>
                        <label className="text-[10px] font-black uppercase text-slate-400">Mã xác nhận (OTP)</label>
                        <input type="text" required value={forgotOTP} onChange={e => setForgotOTP(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 tracking-widest font-mono text-center text-lg outline-none focus:border-fuji-blue" placeholder="------" maxLength={6} />
                      </div>
                    )}
                    {forgotMsg && <p className="text-xs font-bold text-red-500 mt-2">{forgotMsg}</p>}
                    <button type="submit" className="w-full py-3 bg-fuji-blue text-white rounded-xl font-black text-xs uppercase hover:bg-fuji-accent transition-colors mt-4">
                      {forgotStep === 1 ? 'Gửi mã OTP qua Telegram' : 'Nhận Mật Khẩu Mới'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Polished */}
      <aside className="w-72 bg-fuji-blue text-white flex flex-col h-screen sticky top-0 z-40">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-fuji-blue rounded-xl flex items-center justify-center font-black text-xl italic shadow-2xl">F</div>
          <div>
            <h1 className="font-black text-lg tracking-tighter leading-none">ADMIN</h1>
            <p className="text-[8px] uppercase tracking-[0.3em] text-fuji-accent font-black mt-1">Control Panel v2.0</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {userRole === 'admin' && (
            <>
              <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Tổng quan</p>
              <NavBtn icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <div className="h-4" />
            </>
          )}

          <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Quản lý</p>
          {userRole === 'admin' && <NavBtn icon={<FileText size={20} />} label="Liên hệ (Leads)" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />}
          <NavBtn icon={<ImageIcon size={20} />} label="Sản phẩm" active={activeTab === 'images'} onClick={() => setActiveTab('images')} />
          <NavBtn icon={<Palette size={20} />} label="Mô phỏng nội thất" active={activeTab === 'configurator'} onClick={() => setActiveTab('configurator')} />
          <NavBtn icon={<ShieldCheck size={20} />} label="Chính sách bảo hành" active={activeTab === 'warranty'} onClick={() => setActiveTab('warranty')} />
          
          {userRole === 'admin' && (
            <>
              <NavBtn icon={<Users size={20} />} label="Nhân viên" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <div className="h-4" />
              <p className="px-4 text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Hệ thống</p>
              <NavBtn icon={<Settings size={20} />} label="Cài đặt" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </>
          )}
        </nav>

        <div className="p-6">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-4">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full border-2 border-fuji-accent overflow-hidden bg-slate-200 flex items-center justify-center font-black text-fuji-blue">
                 <div className="w-full h-full bg-slate-300 flex items-center justify-center font-black text-fuji-blue">{user?.email?.charAt(0).toUpperCase()}</div>
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black truncate">{userRole === 'admin' ? 'Quản trị viên' : 'Bên tập viên'}</p>
                 <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
               </div>
             </div>
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 transition-all text-[10px] font-black uppercase tracking-widest"
             >
               <LogOut size={16} /> Đăng xuất
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Balanced */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-fuji-blue tracking-tighter uppercase">
              {activeTab === 'dashboard' ? 'Bảng Điều Khiển' : 
               activeTab === 'content' ? 'Quản lý Liên hệ' :
               activeTab === 'images' ? 'Sản phẩm' :
               activeTab === 'configurator' ? 'Mô phỏng nội thất' :
               activeTab === 'warranty' ? 'Chính sách bảo hành' :
               activeTab === 'users' ? 'Quản lý Nhân viên' : 'Cài đặt'}
            </h2>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-400">Stable</div>
          </div>

          <div className="flex items-center gap-6">
             <button 
               onClick={sendQuickReport}
               disabled={isSendingQuickReport}
               className="flex items-center justify-center gap-2 bg-fuji-blue text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-colors shadow-lg shadow-fuji-blue/20 disabled:opacity-50"
               title="Nhận báo cáo nhanh qua Telegram"
             >
                <Send size={16} /> {isSendingQuickReport ? 'Đang gửi...' : 'Báo cáo nhanh'}
             </button>
             <div className="w-px h-6 bg-slate-100" />
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Tìm kiếm..." 
                 className="bg-slate-50 border-none rounded-xl h-10 w-64 pl-10 text-xs font-medium focus:ring-2 focus:ring-fuji-blue transition-all"
               />
             </div>
             <div className="w-px h-6 bg-slate-100" />
             <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-fuji-blue transition-colors">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-fuji-blue transition-colors">
                <Calendar size={20} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && userRole === 'admin' && <Dashboard />}
              {activeTab === 'content' && <LeadManager />}
              {activeTab === 'images' && <ProductManager />}
              {activeTab === 'configurator' && <ConfiguratorManager />}
              {activeTab === 'warranty' && <WarrantyManager />}
              {activeTab === 'users' && userRole === 'admin' && <UserManager />}
              {activeTab === 'settings' && userRole === 'admin' && <SettingsManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function WarrantyManager() {
  const [policies, setPolicies] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const defaultPolicies = [
    { id: '1', title: 'Bảo hành toàn diện 24 tháng', description: 'Toàn bộ thiết bị và linh kiện thang máy được bảo hành chính hãng 24 tháng. Miễn phí đổi mới 100% đối với các hư hỏng do lỗi từ nhà sản xuất.', icon: 'ShieldCheck' },
    { id: '2', title: 'Bảo trì định kỳ miễn phí', description: 'Tặng gói bảo trì 12 tháng. Kỹ thuật viên sẽ đến kiểm tra, vệ sinh, căn chỉnh và châm dầu mỡ định kỳ 1 tháng/lần để đảm bảo vận hành êm ái.', icon: 'Wrench' },
    { id: '3', title: 'Xử lý sự cố tốc độ 24/7', description: 'Đội ngũ kỹ thuật túc trực 24/7. Cam kết có mặt xử lý cứu hộ trong vòng 60 phút tại nội thành và 24h đối với các tỉnh lân cận.', icon: 'Clock' },
    { id: '4', title: 'Linh kiện sẵn sàng 100%', description: 'Cam kết cung cấp vật tư, linh kiện thay thế chính hãng nhập khẩu trong suốt vòng đời thang máy, không để khách hàng chờ đợi làm gián đoạn sinh hoạt.', icon: 'PackageCheck' },
    { id: '5', title: 'Hỗ trợ kiểm định an toàn', description: 'Miễn phí toàn bộ chi phí kiểm định an toàn lần đầu tiên. Thang máy chỉ được bàn giao khi có giấy chứng nhận của cơ quan thẩm quyền Nhà nước.', icon: 'FileBadge' },
    { id: '6', title: 'Bảo hiểm trách nhiệm', description: 'Mỗi sản phẩm bàn giao đều đi kèm chứng nhận bảo hiểm trách nhiệm rủi ro, mang lại sự bảo vệ và an tâm tuyệt đối cho mọi thành viên gia đình.', icon: 'Headset' }
  ];

  React.useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('site_settings').select('warranty_policies').eq('id', 'default').single();
      if (data && data.warranty_policies && data.warranty_policies.length > 0) {
        setPolicies(data.warranty_policies);
      } else {
        setPolicies(defaultPolicies);
      }
    } catch (err) {
      setPolicies(defaultPolicies);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('site_settings').update({ warranty_policies: policies }).eq('id', 'default');
      if (error) throw error;
      alert('Đã lưu cấu hình Chính sách bảo hành thành công!');
    } catch (err: any) {
      if (err.message?.includes('warranty_policies')) {
        alert('Lỗi: Bạn cần chạy mã SQL để thêm cột warranty_policies vào bảng site_settings trước khi lưu.');
      } else {
        alert('Lỗi khi lưu: ' + err.message);
      }
    }
    setIsSaving(false);
  };

  const updatePolicy = (index: number, key: string, value: any) => {
    const newPolicies = [...policies];
    newPolicies[index] = { ...newPolicies[index], [key]: value };
    setPolicies(newPolicies);
  };

  const addPolicy = () => {
    setPolicies([...policies, { id: 'new-' + Date.now(), title: 'Chính sách mới', description: 'Mô tả chi tiết...', icon: 'ShieldCheck' }]);
  };

  const removePolicy = (index: number) => {
    if(!window.confirm('Xóa chính sách này?')) return;
    const newPolicies = [...policies];
    newPolicies.splice(index, 1);
    setPolicies(newPolicies);
  };

  const iconOptions = [
    { value: 'ShieldCheck', label: 'Cái Khiên (Bảo vệ)' },
    { value: 'Wrench', label: 'Cờ lê (Bảo trì)' },
    { value: 'Clock', label: 'Đồng hồ (Thời gian)' },
    { value: 'PackageCheck', label: 'Hộp hàng (Linh kiện)' },
    { value: 'FileBadge', label: 'Chứng chỉ (Kiểm định)' },
    { value: 'Headset', label: 'Tai nghe (Hỗ trợ)' },
    { value: 'Star', label: 'Ngôi sao (Chất lượng)' },
    { value: 'Award', label: 'Huy chương (Uy tín)' }
  ];

  if (isLoading) return <div className="text-center py-20 text-slate-400">Đang tải cấu hình...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
         <div>
           <h2 className="text-2xl font-black text-fuji-blue tracking-tighter uppercase">Chính sách bảo hành</h2>
           <p className="text-xs text-slate-400 mt-1 font-bold">Quản lý các cam kết dịch vụ hiển thị ở trang chủ</p>
         </div>
         <div className="flex gap-4">
           <button onClick={addPolicy} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">+ Thêm chính sách</button>
           <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all disabled:opacity-50">{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</button>
         </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {policies.map((policy, idx) => (
          <div key={policy.id} className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Icon minh họa</label>
                <select value={policy.icon} onChange={e => updatePolicy(idx, 'icon', e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue">
                  {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Tiêu đề chính sách</label>
                <input value={policy.title} onChange={e => updatePolicy(idx, 'title', e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Mô tả chi tiết</label>
                <textarea value={policy.description} onChange={e => updatePolicy(idx, 'description', e.target.value)} rows={4} className="w-full mt-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 outline-none focus:border-fuji-blue leading-relaxed" />
              </div>
            </div>
            <button onClick={() => removePolicy(idx)} className="w-full py-2 mt-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Xóa mục này</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick, disabled }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left group",
        active 
          ? "bg-white text-fuji-blue shadow-2xl shadow-white/5" 
          : "text-white/50 hover:bg-white/5 hover:text-white",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-fuji-blue text-white" : "bg-white/5 text-white/50 group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function ProductManager() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) {
        // Parse an toàn dữ liệu đề phòng cột Database bị set nhầm thành text thay vì jsonb
        const sanitizedData = data.map(p => {
          let parsedImages = p.images || [];
          let parsedSpecs = p.specs || {};
          if (typeof parsedImages === 'string') {
            try { parsedImages = JSON.parse(parsedImages); } catch(e) { parsedImages = []; }
          }
          if (typeof parsedSpecs === 'string') {
            try { parsedSpecs = JSON.parse(parsedSpecs); } catch(e) { parsedSpecs = {}; }
          }
          return { ...p, images: parsedImages, specs: parsedSpecs };
        });
        setProducts(sanitizedData);
      } else {
        console.error("Lỗi fetch sản phẩm:", error);
      }
    } catch (err) {
      console.error("Lỗi ngoại lệ khi fetch sản phẩm:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    const p = { 
      title: 'Sản phẩm mới', category: 'Thang máy Homelife', description: '', 
      images: [], material: '', longDescription: '',
      specs: { load: '', speed: '', pit: '', oh: '', travel: '', stops: '', door: '', structure: '', power: '', origin: '' }
    };
    setEditing(p);
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert(`Lỗi khi xóa: ${error.message}`);
    } else {
      fetchProducts();
    }
  };

  const handleSaveEdit = async (p: any) => {
    setIsSaving(true);
    const { id, ...productData } = p;
    try {
      if (id) {
        const { error } = await supabase.from('products').update(productData).eq('id', id).select();
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]).select();
        if (error) throw error;
      }
      await fetchProducts();
      setEditing(null);
    } catch (e: any) {
      alert(`Có lỗi khi lưu sản phẩm: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-fuji-blue tracking-tighter uppercase">Quản lý Sản phẩm</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest italic">Quản lý nội dung sản phẩm trên Website</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input type="text" placeholder="Tìm tên sản phẩm..." className="pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold outline-none focus:border-fuji-blue w-64" />
          </div>
          <button onClick={handleAdd} className="px-6 py-3 bg-fuji-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all flex items-center gap-2">
             <Edit3 size={14} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Đang tải danh sách sản phẩm...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[40px] p-6 shadow-sm border border-slate-100 group">
              <div className="h-48 rounded-3xl overflow-hidden mb-6 relative bg-slate-100">
                <img src={(product.images && product.images[0]) || 'https://via.placeholder.com/400x300?text=No+Image'} onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(product)} className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-fuji-blue shadow-lg"><Settings size={14} /></button>
                  <button onClick={() => handleDelete(product.id)} className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-red-500 shadow-lg">×</button>
                </div>
              </div>
              <h3 className="font-black text-fuji-blue text-sm uppercase tracking-tight mb-2 truncate">{product.title}</h3>
              <p className="text-[10px] text-slate-400 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex gap-2">
                <button onClick={() => setEditing(product)} className="flex-1 py-3 bg-fuji-line rounded-xl text-[9px] font-black uppercase text-fuji-blue hover:bg-fuji-blue hover:text-white transition-all border border-transparent hover:border-fuji-blue">Chỉnh sửa nội dung</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-5xl z-50 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black text-fuji-blue mb-6 uppercase tracking-tight border-b pb-4">Biên tập Sản Phẩm</h3>
              <ProductEditor product={editing} isSaving={isSaving} onCancel={() => setEditing(null)} onSave={handleSaveEdit} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfiguratorManager() {
  const [configs, setConfigs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadingIdx, setUploadingIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('site_settings').select('interior_configs').eq('id', 'default').single();
      if (data && data.interior_configs && data.interior_configs.length > 0) {
        setConfigs(data.interior_configs);
      } else {
        setConfigs([
          { id: 'gold', name: 'Luxury Gold', primary: '#C5A059', bg: '/images/mau-thang-gold.jpg', description: 'Chất liệu Inox gương vàng PVD cao cấp, họa tiết vân mây sang trọng.' },
          { id: 'glass', name: 'Modern Glass', primary: '#A0A0A0', bg: '/images/mau-thang-glass.jpg', description: 'Vách kính cường lực panorama, ôm trọn tầm nhìn và ánh sáng tự nhiên.' },
          { id: 'silver', name: 'Classic Silver', primary: '#64748b', bg: '/images/mau-thang-silver.jpg', description: 'Inox sọc nhuyễn tinh tế, bền bỉ với thời gian, dễ dàng vệ sinh.' }
        ]);
      }
    } catch (err) {
      // Bỏ qua lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('site_settings').update({ interior_configs: configs }).eq('id', 'default');
      if (error) throw error;
      alert('Đã lưu cấu hình Bộ mô phỏng nội thất thành công!');
    } catch (err: any) {
      if (err.message?.includes('interior_configs')) {
        alert('Lỗi: Bạn cần chạy mã SQL để thêm cột interior_configs vào bảng site_settings trước khi lưu.');
      } else {
        alert('Lỗi khi lưu: ' + err.message);
      }
    }
    setIsSaving(false);
  };

  const updateConfig = (index: number, key: string, value: any) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [key]: value };
    setConfigs(newConfigs);
  };

  const addConfig = () => {
    setConfigs([...configs, { id: 'new-' + Date.now(), name: 'Tùy chọn mới', primary: '#000000', bg: '', description: '' }]);
  };

  const removeConfig = (index: number) => {
    if(!window.confirm('Xóa tùy chọn nội thất này?')) return;
    const newConfigs = [...configs];
    newConfigs.splice(index, 1);
    setConfigs(newConfigs);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `interior-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      updateConfig(index, 'bg', publicUrl);
    } catch (err: any) {
      if (err.message?.includes('Bucket not found') || err.message?.includes('storage')) {
        alert(
          'CẢNH BÁO TỪ HỆ THỐNG:\n\n' +
          'Supabase chưa có "thùng chứa" tên là "images".\n' +
          'Vui lòng vào Dashboard, copy mã SQL trong bảng cảnh báo đỏ và chạy trong SQL Editor để hệ thống tự động tạo!'
        );
      } else {
        alert('Lỗi upload: ' + err.message);
      }
    } finally {
      setUploadingIdx(null);
      e.target.value = '';
    }
  };

  if (isLoading) return <div className="text-center py-20 text-slate-400">Đang tải cấu hình...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
         <div>
           <h2 className="text-2xl font-black text-fuji-blue tracking-tighter uppercase">Bộ Mô Phỏng Nội Thất</h2>
           <p className="text-xs text-slate-400 mt-1 font-bold">Chỉnh sửa hình ảnh, màu sắc và thông tin mô phỏng ở trang chủ</p>
         </div>
         <div className="flex gap-4">
           <button onClick={addConfig} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">+ Thêm tùy chọn</button>
           <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-fuji-accent transition-all disabled:opacity-50">{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</button>
         </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {configs.map((config, idx) => (
          <div key={config.id} className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <img src={config.bg || 'https://via.placeholder.com/600x400?text=Chua+co+anh'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer px-4 py-2 bg-white text-fuji-blue rounded-xl text-[10px] font-black uppercase shadow-lg">
                  {uploadingIdx === idx ? 'Đang tải...' : 'Đổi ảnh (Upload)'}
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, idx)} disabled={uploadingIdx !== null} className="hidden" />
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Tên Option (Tiêu đề)</label>
                <input value={config.name} onChange={e => updateConfig(idx, 'name', e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Màu sắc đặc trưng</label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="color" value={config.primary} onChange={e => updateConfig(idx, 'primary', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                  <input type="text" value={config.primary} onChange={e => updateConfig(idx, 'primary', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-600 outline-none focus:border-fuji-blue" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Mô tả ngắn</label>
                <textarea value={config.description} onChange={e => updateConfig(idx, 'description', e.target.value)} rows={2} className="w-full mt-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 outline-none focus:border-fuji-blue" />
              </div>
            </div>
            <button onClick={() => removeConfig(idx)} className="w-full py-2 mt-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Xóa tùy chọn này</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManager() {
  const [admins, setAdmins] = React.useState<any[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any>(null);
  
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newRole, setNewRole] = React.useState('editor');
  const [newPhone, setNewPhone] = React.useState('');

  React.useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await supabase.from('admins').select('*');
      if (data) setAdmins(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    
    if (editingUser) {
      await supabase.from('admins').update({ email: cleanEmail, password: cleanPassword, role: newRole, phone: newPhone.trim() }).eq('id', editingUser.id);
      alert("Cập nhật thông tin nhân viên thành công!");
    } else {
      const fakeUid = crypto.randomUUID ? crypto.randomUUID() : 'user-' + Date.now();
      await supabase.from('admins').insert([{ id: fakeUid, email: cleanEmail, password: cleanPassword, role: newRole, phone: newPhone.trim() }]);
      alert("Đã tạo tài khoản nhân viên thành công!");
    }
    setShowAdd(false);
    setEditingUser(null);
    setNewEmail(''); setNewPassword(''); setNewRole('editor'); setNewPhone('');
    fetchAdmins();
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setNewEmail(user.email);
    setNewPassword(user.password);
    setNewRole(user.role);
    setNewPhone(user.phone || '');
    setShowAdd(true);
  };

  const removeUser = async (user: any) => {
    if(user.email === 'info.fujirise@gmail.com') {
      alert("Không thể xóa tài khoản Quản trị gốc!");
      return;
    }
    if(!window.confirm("Thu hồi quyền của nhân viên này?")) return;
    await supabase.from('admins').delete().eq('id', user.id);
    fetchAdmins();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
         <div>
           <h2 className="text-2xl font-black text-fuji-blue tracking-tighter uppercase">Quản lý Nhân sự</h2>
           <p className="text-xs text-slate-400 mt-1 font-bold">Phân quyền đăng nhập và chỉnh sửa nội dung Website</p>
         </div>
         <button onClick={() => {setEditingUser(null); setNewEmail(''); setNewPassword(''); setNewRole('editor'); setNewPhone(''); setShowAdd(true);}} className="px-6 py-3 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-all flex items-center gap-2">
            <UserPlus size={16} /> Thêm nhân viên
         </button>
      </div>
      
      <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-slate-50/50">
             <tr>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài khoản</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò (Role)</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
             {admins.map(a => (
               <tr key={a.id} className="hover:bg-slate-50/30 transition-colors">
                 <td className="p-6 font-bold text-sm text-slate-700 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">{a.email.charAt(0).toUpperCase()}</div>
                   {a.email}
                 </td>
                 <td className="p-6">
                   <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", a.role === 'admin' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600")}>
                     {a.role === 'admin' ? 'Admin (Toàn quyền)' : 'Editor (Chỉ viết bài)'}
                   </span>
                 </td>
                 <td className="p-6"><span className="font-mono text-xs text-slate-500 tracking-wider">{a.password}</span></td>
                 <td className="p-6 text-right">
                   <button onClick={() => openEdit(a)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors inline-flex items-center justify-center mr-2"><Edit3 size={14} /></button>
                   <button onClick={() => removeUser(a)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors inline-flex items-center justify-center"><Trash2 size={14} /></button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-black text-fuji-blue mb-2">{editingUser ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'}</h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Quản lý tài khoản và mật khẩu trực tiếp.</p>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Email nhân viên</label>
                    <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={editingUser && editingUser.email === 'info.fujirise@gmail.com'} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-fuji-blue font-bold disabled:opacity-50" placeholder="nhanvien@fujirise.com" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Mật khẩu đăng nhập</label>
                    <input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-fuji-blue font-bold" placeholder="Nhập mật khẩu..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Số điện thoại</label>
                    <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-fuji-blue font-bold" placeholder="0868..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Phân quyền</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value)} disabled={editingUser && editingUser.email === 'info.fujirise@gmail.com'} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-fuji-blue font-bold bg-white disabled:opacity-50">
                      <option value="editor">Editor (Chỉ xem và sửa Sản Phẩm)</option>
                      <option value="admin">Admin (Toàn quyền hệ thống)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="button" onClick={() => {setShowAdd(false); setEditingUser(null);}} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase">Hủy</button>
                    <button type="submit" className="flex-1 py-3 bg-fuji-blue text-white rounded-xl font-black text-xs uppercase hover:bg-fuji-accent transition-colors">{editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}</button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsManager() {
  const [settings, setSettings] = React.useState({
    companyName: 'FUJIRISE GLOBAL',
    seoTitle: 'Fujirise | Giải pháp thang máy cho mọi gia đình',
    hotline: '0868.822.210',
    email: 'info.fujirise@gmail.com',
    primaryColor: '#1b2a43',
    accentColor: '#C5A059',
    fontFamily: 'Inter',
    logoUrl: '',
    faviconUrl: '',
    heroBg: '',
    aboutBg: '',
    address: '',
    socialLinks: [] as any[],
    contentDict: {} as any
  });
  const [privateSettings, setPrivateSettings] = React.useState({ telegramToken: '', telegramChatId: '', reportTime: '17:00' });
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadingField, setUploadingField] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
        if (data) {
          setSettings({
            companyName: data.company_name || 'FUJIRISE GLOBAL',
            seoTitle: data.seo_title || 'Fujirise | Giải pháp thang máy cho mọi gia đình',
            hotline: data.hotline || '0868.822.210',
            email: data.email || 'info.fujirise@gmail.com',
            primaryColor: data.primary_color || '#1b2a43',
            accentColor: data.accent_color || '#C5A059',
            fontFamily: data.font_family || 'Inter',
            logoUrl: data.logo_url || '',
            faviconUrl: data.favicon_url || '',
            heroBg: data.hero_bg || '',
            aboutBg: data.about_bg || '',
            address: data.address || '',
            socialLinks: data.social_links || [
              { id: 'fb', platform: 'Facebook', icon: 'Facebook', url: '' },
              { id: 'zl', platform: 'Zalo', icon: 'MessageCircle', url: '' }
            ],
            contentDict: data.content_dict || {}
          });
        }
        
        try {
          const { data: privData } = await supabase.from('private_settings').select('*').eq('id', 'default').single();
          if (privData) {
            setPrivateSettings({
              telegramToken: privData.telegram_token || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
              telegramChatId: privData.telegram_chat_id || import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
              reportTime: privData.report_time || '17:00'
            });
          }
        } catch (e) {
          setPrivateSettings(s => ({
            ...s,
            telegramToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
            telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || ''
          }));
        }
      } catch (e) {
        console.error('Settings fetch error:', e);
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingField(field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `global-${field}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      setSettings(s => ({ ...s, [field]: publicUrl }));
    } catch (err: any) {
      alert('Lỗi upload: ' + err.message + '\n(Hãy đảm bảo bạn đã tạo bucket "images" public trên Supabase)');
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const updateSocial = (index: number, key: string, value: string) => {
    const newLinks = [...settings.socialLinks];
    newLinks[index] = { ...newLinks[index], [key]: value };
    setSettings(s => ({ ...s, socialLinks: newLinks }));
  };

  const addSocial = () => {
    setSettings(s => ({ ...s, socialLinks: [...s.socialLinks, { id: Date.now().toString(), platform: 'Nền tảng mới', icon: 'Globe', url: '' }] }));
  };

  const removeSocial = (index: number) => {
    const newLinks = [...settings.socialLinks];
    newLinks.splice(index, 1);
    setSettings(s => ({ ...s, socialLinks: newLinks }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        id: 'default',
        company_name: settings.companyName,
        hotline: settings.hotline,
        email: settings.email,
        primary_color: settings.primaryColor,
        accent_color: settings.accentColor,
        font_family: settings.fontFamily,
        logo_url: settings.logoUrl,
        favicon_url: settings.faviconUrl,
        hero_bg: settings.heroBg,
        about_bg: settings.aboutBg,
        address: settings.address,
        social_links: settings.socialLinks,
        seo_title: settings.seoTitle,
        content_dict: settings.contentDict
      });
      if (error) throw new Error('Lỗi lưu Cấu hình chung: ' + error.message);

      const { error: privError } = await supabase.from('private_settings').upsert({
        id: 'default', telegram_token: privateSettings.telegramToken, telegram_chat_id: privateSettings.telegramChatId, report_time: privateSettings.reportTime
      });
      if (privError) throw new Error('Lỗi lưu Cấu hình Telegram: Bạn cần chạy SQL để tạo bảng private_settings');

      alert('Đã lưu cấu hình thành công! Các thay đổi về màu sắc và font chữ đã được áp dụng toàn hệ thống.');
      
      document.documentElement.style.setProperty('--color-fuji-blue', settings.primaryColor);
      document.documentElement.style.setProperty('--color-fuji-accent', settings.accentColor);
      
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.faviconUrl || '/icon.svg';

      let styleEl = document.getElementById('dynamic-font-style');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-font-style';
        document.head.appendChild(styleEl);
      }
    const safeFont = settings.fontFamily.replace(/["';<>]/g, '');
    styleEl.innerHTML = `body, h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea, select { font-family: "${safeFont}", sans-serif !important; }`;
      
    } catch (e: any) {
      alert('Lỗi lưu cấu hình: ' + e.message + '\n\nBạn cần chạy mã SQL tạo bảng site_settings (Xem hướng dẫn).');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-black text-fuji-blue uppercase tracking-tight">Cấu hình chung</h3>
           <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-fuji-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-fuji-blue/20 hover:bg-fuji-accent transition-all disabled:opacity-50">
             {isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
           </button>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề Web trên Trình duyệt (SEO Title)</label>
              <input value={settings.seoTitle} onChange={e => setSettings(s => ({...s, seoTitle: e.target.value}))} placeholder="Fujirise | Giải pháp thang máy cho mọi gia đình" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-fuji-blue" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên công ty</label>
              <input value={settings.companyName} onChange={e => setSettings(s => ({...s, companyName: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-fuji-blue" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hotline hiển thị</label>
              <input value={settings.hotline} onChange={e => setSettings(s => ({...s, hotline: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-fuji-blue" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email liên hệ</label>
              <input value={settings.email} onChange={e => setSettings(s => ({...s, email: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-fuji-blue" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ Văn phòng</label>
              <input value={settings.address} onChange={e => setSettings(s => ({...s, address: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-fuji-blue" />
            </div>
          </div>

          {/* Dynamic Social Links */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mạng xã hội & Liên kết ngoài</label>
              <button onClick={addSocial} className="text-[10px] font-black text-fuji-blue hover:text-fuji-accent uppercase bg-slate-50 px-3 py-1 rounded-lg">+ Thêm liên kết</button>
            </div>
            <div className="space-y-3">
              {settings.socialLinks.map((social, idx) => (
                <div key={social.id} className="flex flex-wrap md:flex-nowrap gap-3 items-center">
                  <div className="w-full md:w-[140px] shrink-0">
                    <select value={social.icon || 'Globe'} onChange={e => updateSocial(idx, 'icon', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm text-fuji-blue">
                      <option value="Facebook">Facebook</option>
                      <option value="Youtube">YouTube</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter">Twitter / X</option>
                      <option value="Video">TikTok</option>
                      <option value="MessageCircle">Zalo / Chat</option>
                      <option value="Globe">Khác</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/4 shrink-0">
                    <input value={social.platform} onChange={e => updateSocial(idx, 'platform', e.target.value)} placeholder="Tên: Facebook..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm text-fuji-blue" />
                  </div>
                  <div className="flex-1 flex gap-2 items-center w-full">
                    <input value={social.url} onChange={e => updateSocial(idx, 'url', e.target.value)} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium text-sm text-slate-600" />
                    <button onClick={() => removeSocial(idx)} className="w-10 h-10 flex items-center justify-center shrink-0 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight">Giao diện (Màu sắc & Font)</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Màu chủ đạo (Xanh)</label>
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50">
              <input type="color" value={settings.primaryColor} onChange={e => setSettings(s => ({...s, primaryColor: e.target.value}))} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
              <input type="text" value={settings.primaryColor} onChange={e => setSettings(s => ({...s, primaryColor: e.target.value}))} className="bg-transparent border-none outline-none font-mono text-xs w-full font-bold uppercase" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Màu nhấn (Vàng)</label>
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50">
              <input type="color" value={settings.accentColor} onChange={e => setSettings(s => ({...s, accentColor: e.target.value}))} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
              <input type="text" value={settings.accentColor} onChange={e => setSettings(s => ({...s, accentColor: e.target.value}))} className="bg-transparent border-none outline-none font-mono text-xs w-full font-bold uppercase" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Font chữ toàn Web</label>
            <select value={settings.fontFamily} onChange={e => setSettings(s => ({...s, fontFamily: e.target.value}))} className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-fuji-blue text-sm cursor-pointer">
              <option value="Inter">Inter (Mặc định)</option>
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight">Nội dung Văn bản (Sửa chữ trên Web)</h3>
        
        <div className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">💡 Hướng dẫn định dạng từng chữ (Màu sắc, kích thước, giãn dòng)</p>
          <p className="text-[11px] text-blue-600 leading-relaxed mb-2">Hệ thống hỗ trợ mã HTML. Để tùy chỉnh một đoạn chữ, hãy bọc nó trong thẻ <code className="bg-white px-1.5 py-0.5 rounded text-fuji-accent font-bold">&lt;span&gt;</code>. Ví dụ:</p>
          <ul className="text-[11px] text-blue-700 list-disc list-inside space-y-1.5 font-mono">
            <li>Đổi màu sắc: <code className="bg-white px-1.5 py-0.5 rounded text-fuji-accent">&lt;span style="color: #ff0000;"&gt;Chữ màu đỏ&lt;/span&gt;</code></li>
            <li>Cỡ chữ to: <code className="bg-white px-1.5 py-0.5 rounded text-fuji-accent">&lt;span style="font-size: 40px;"&gt;Chữ to 40px&lt;/span&gt;</code></li>
            <li>Giãn dòng: <code className="bg-white px-1.5 py-0.5 rounded text-fuji-accent">&lt;span style="line-height: 2;"&gt;Giãn cách gấp đôi&lt;/span&gt;</code></li>
            <li>Kết hợp tất cả: <code className="bg-white px-1.5 py-0.5 rounded text-fuji-accent">&lt;span style="color: #C5A059; font-size: 30px; letter-spacing: 2px;"&gt;FUJIRISE&lt;/span&gt;</code></li>
          </ul>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề trang chủ (Dùng &lt;br/&gt; để xuống dòng)</label>
              <textarea value={settings.contentDict.hero_title || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, hero_title: e.target.value}}))} rows={4} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-fuji-blue text-xs leading-relaxed transition-all" placeholder='&lt;span class="text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-blue-500 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"&gt;NÂNG TẦM&lt;/span&gt; &lt;br /&gt; &lt;span class="text-transparent bg-clip-text bg-gradient-to-r from-fuji-accent to-yellow-200 italic font-serif"&gt;KHÔNG GIAN SỐNG&lt;/span&gt;' />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Đoạn mô tả dưới tiêu đề trang chủ</label>
              <textarea value={settings.contentDict.hero_desc || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, hero_desc: e.target.value}}))} rows={4} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-slate-600 text-xs leading-relaxed transition-all" placeholder="Giải pháp thang máy gia đình nhập khẩu cao cấp..." />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề Giới thiệu</label>
              <textarea value={settings.contentDict.about_title || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, about_title: e.target.value}}))} rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-fuji-blue text-xs leading-relaxed transition-all" placeholder='THIẾT LẬP <br/><span class="text-slate-300">TIÊU CHUẨN SỐNG</span>' />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Đoạn mô tả giới thiệu</label>
              <textarea value={settings.contentDict.about_desc || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, about_desc: e.target.value}}))} rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-slate-600 text-xs leading-relaxed transition-all" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề Sứ mệnh</label>
              <textarea value={settings.contentDict.about_mission_title || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, about_mission_title: e.target.value}}))} rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-fuji-blue text-xs leading-relaxed transition-all" placeholder='Setting the Standard for Living...' />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Đoạn mô tả Sứ mệnh</label>
              <textarea value={settings.contentDict.about_mission_desc || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, about_mission_desc: e.target.value}}))} rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-slate-600 text-xs leading-relaxed transition-all" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề Tầm nhìn</label>
              <textarea value={settings.contentDict.about_vision_title || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, about_vision_title: e.target.value}}))} rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-fuji-blue text-xs leading-relaxed transition-all" placeholder='Định hình tiêu chuẩn sống...' />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Đoạn mô tả Tầm nhìn</label>
              <textarea value={settings.contentDict.about_vision_desc || ''} onChange={e => setSettings(s => ({...s, contentDict: {...s.contentDict, about_vision_desc: e.target.value}}))} rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-fuji-blue outline-none font-mono text-slate-600 text-xs leading-relaxed transition-all" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-fuji-blue mb-8 uppercase tracking-tight">Hình ảnh Toàn cục (Global Media)</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { key: 'logoUrl', label: 'Logo Công ty', desc: 'Hiển thị ở Thanh Menu (Nên upload file ảnh Logo PNG. Hệ thống tự động xóa phông nền trắng, phóng to logo sắc nét hơn)' },
            { key: 'faviconUrl', label: 'Favicon (Icon nhỏ)', desc: 'Hiển thị ở Tab trình duyệt (Khuyên dùng ảnh vuông)' },
            { key: 'heroBg', label: 'Ảnh bìa Trang chủ', desc: 'Hình nền to nhất khi vừa vào web' },
            { key: 'aboutBg', label: 'Ảnh Giới thiệu', desc: 'Hình ảnh phần "Thiết lập tiêu chuẩn sống"' }
          ].map(item => (
            <div key={item.key} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{item.label}</label>
                <p className="text-[9px] text-slate-400 ml-1 font-medium">{item.desc}</p>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {settings[item.key as keyof typeof settings] ? (
                    <img src={settings[item.key as keyof typeof settings]} className="w-full h-full object-cover" />
                  ) : (
                    <LucideImage size={20} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input 
                    value={settings[item.key as keyof typeof settings]} 
                    onChange={e => setSettings(s => ({...s, [item.key]: e.target.value}))} 
                    className="w-full text-[10px] font-mono p-2 rounded-lg border border-slate-200 outline-none mb-2 text-slate-500 truncate"
                    placeholder="Nhập link hoặc Upload"
                  />
                  <label className={cn(
                    "cursor-pointer inline-flex items-center justify-center w-full py-2 bg-white border border-slate-200 text-fuji-blue rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-fuji-blue transition-colors",
                    uploadingField === item.key && "opacity-50 cursor-not-allowed"
                  )}>
                    {uploadingField === item.key ? 'Đang tải...' : 'Tải ảnh lên'}
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, item.key)} disabled={uploadingField !== null} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-fuji-blue rounded-[40px] p-10 shadow-sm text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuji-accent/10 rounded-full blur-[80px]" />
        <h3 className="text-xl font-black mb-8 uppercase tracking-tight relative z-10">Cấu hình Telegram & Tự động Báo cáo</h3>
        <div className="space-y-6 relative z-10 transition-all">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Bot Token (API)</label>
              <input type="password" placeholder="Nhập Token Bot Telegram..." value={privateSettings.telegramToken} onChange={e => setPrivateSettings(s => ({...s, telegramToken: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none font-mono text-xs placeholder:text-white/20 focus:border-fuji-accent" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Chat ID (Mã nhóm/Cá nhân)</label>
              <input type="text" placeholder="Nhập Chat ID..." value={privateSettings.telegramChatId} onChange={e => setPrivateSettings(s => ({...s, telegramChatId: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none font-mono text-xs placeholder:text-white/20 focus:border-fuji-accent" />
            </div>
          </div>
          <div className="space-y-2 w-1/3">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Giờ gửi báo cáo tự động hàng ngày</label>
            <input type="time" value={privateSettings.reportTime} onChange={e => setPrivateSettings(s => ({...s, reportTime: e.target.value}))} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none font-black text-lg focus:border-fuji-accent cursor-pointer" />
          </div>
          <p className="text-[9px] text-white/30 italic">Lưu ý: Tính năng Gửi báo cáo tự động sẽ hoạt động khi bạn mở tab Admin này trên trình duyệt.</p>
        </div>
      </div>
    </div>
  );
}


function Dashboard() {
  const [leadsCount, setLeadsCount] = React.useState(0);
  const [viewsCount, setViewsCount] = React.useState(0);
  const [recentLeads, setRecentLeads] = React.useState<Lead[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [dbStatus, setDbStatus] = React.useState<'checking' | 'ok' | 'error'>('checking');
  const [dbError, setDbError] = React.useState('');
  const [isSendingReport, setIsSendingReport] = React.useState(false);

  const executeSendReport = async (isManual = true) => {
    setIsSendingReport(true);
    try {
      let token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      let chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      try {
        const { data: privConfig } = await supabase.from('private_settings').select('*').eq('id', 'default').single();
        if (privConfig?.telegram_token) token = privConfig.telegram_token;
        if (privConfig?.telegram_chat_id) chatId = privConfig.telegram_chat_id;
      } catch (e) {}

      if (!token || !chatId) {
        if (isManual) alert("Chưa cấu hình Telegram Token hoặc Chat ID trong Cài đặt!");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const { count: totalViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
      const { count: todayViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayIso);

      const { data: todayLeads } = await supabase.from('leads').select('*').gte('created_at', todayIso);
      const leadsCount = todayLeads?.length || 0;

      let tuVanLeads: any[] = [];
      let tuyenDungLeads: any[] = [];
      let catalogLeads: any[] = [];

      todayLeads?.forEach(lead => {
        const msg = (lead.message || '').toLowerCase();
        if (msg.includes('ứng tuyển') || msg.includes('tuyển dụng')) tuyenDungLeads.push(lead);
        else if (msg.includes('catalog')) catalogLeads.push(lead);
        else tuVanLeads.push(lead);
      });

      let msgText = `📊 <b>BÁO CÁO THỐNG KÊ WEBSITE</b>\n`;
      msgText += `📅 Ngày: ${new Date().toLocaleDateString('vi-VN')}\n`;
      msgText += `⚙️ Chế độ: ${isManual ? 'Thủ công' : 'Tự động'}\n`;
      msgText += `----------------------------\n`;
      msgText += `👁 <b>Lượt truy cập:</b> ${todayViews || 0} (Hôm nay) / ${totalViews || 0} (Tổng)\n`;
      msgText += `📩 <b>Yêu cầu mới:</b> ${leadsCount}\n`;
      msgText += `----------------------------\n`;

      if (leadsCount > 0) {
         if (tuVanLeads.length > 0) { msgText += `📞 <b>CẦN TƯ VẤN (${tuVanLeads.length}):</b>\n`; tuVanLeads.forEach(l => msgText += `- ${l.name} | ${l.phone}\n`); }
         if (catalogLeads.length > 0) { msgText += `📔 <b>XIN CATALOG (${catalogLeads.length}):</b>\n`; catalogLeads.forEach(l => msgText += `- ${l.name} | ${l.phone} | ${l.email || ''}\n`); }
         if (tuyenDungLeads.length > 0) { msgText += `💼 <b>ỨNG TUYỂN (${tuyenDungLeads.length}):</b>\n`; tuyenDungLeads.forEach(l => msgText += `- ${l.name} | ${l.phone}\n`); }
      } else {
        msgText += `<i>Chưa có khách hàng liên hệ hôm nay.</i>\n`;
      }

      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: msgText, parse_mode: 'HTML' }) });
      if (!res.ok) throw new Error("Lỗi API Telegram");
      if (isManual) alert("Đã gửi báo cáo qua Telegram thành công!");
    } catch (err: any) {
      console.error(err);
      if (isManual) alert("Lỗi khi gửi báo cáo: " + err.message);
    } finally { setIsSendingReport(false); }
  };

  const handleAnalyze = async () => {
    // Đọc API Key từ biến môi trường, nếu không có thì dùng Key mặc định bạn cung cấp
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAhr4zkQ9hlrDRdLcGpJxXG52dZSyFdRw4";
    if (!apiKey) {
      alert("Vui lòng cấu hình GEMINI_API_KEY trong file .env để sử dụng tính năng này!");
      return;
    }
    setIsAnalyzing(true);
    try {
      const prompt = `Dưới vai trò là chuyên gia phân tích dữ liệu kinh doanh, hãy phân tích các số liệu sau của website bán thang máy:
      - Tổng số khách hàng liên hệ (Leads): ${leadsCount}
      - Lượt truy cập website: ${viewsCount}
      - Biểu đồ 7 ngày qua: ${JSON.stringify(chartData)}
      Yêu cầu: 
      1. Viết 1 đoạn văn ngắn (tối đa 3 câu) đánh giá hiệu quả hiện tại và đưa ra 1 lời khuyên thực tế để cải thiện.
      2. Đề xuất 1 CHIẾN DỊCH MARKETING bằng AI ngắn gọn để thu hút thêm khách hàng tiềm năng (Gồm: Tên chiến dịch, Kênh triển khai, Thông điệp chính).
      Trình bày văn bản trơn dễ đọc, chuyên nghiệp, phân dòng rõ ràng, không dùng markdown phức tạp.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiAnalysis(text || "Không thể phân tích dữ liệu lúc này.");
    } catch (err: any) {
      alert("Lỗi kết nối AI: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    // SIÊU TÍNH NĂNG: Tự động kiểm tra sức khỏe Database
    const checkDatabaseHealth = async () => {
      try {
        const { error: e1 } = await supabase.from('site_settings').select('id').limit(1);
        if (e1) throw e1;
        const { error: e4 } = await supabase.from('private_settings').select('id').limit(1);
        if (e4) throw e4;
        const { error: e2 } = await supabase.from('products').select('id').limit(1);
        if (e2) throw e2;
        const { error: e3 } = await supabase.from('admins').select('id').limit(1);
        if (e3) throw e3;
        setDbStatus('ok');
      } catch (err: any) {
        setDbStatus('error');
        setDbError(err.message);
      }
    };
    checkDatabaseHealth();

    const fetchLeads = async () => {
      try {
        const { data, count } = await supabase
          .from('leads')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);
  
        if (data) setRecentLeads(data);
        if (count !== null) setLeadsCount(count);
        
        // Đếm số lượt truy cập từ bảng page_views
        const { count: vCount, error: vError } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
        if (!vError) setViewsCount(vCount || 0); 
  
        // Tạo dữ liệu biểu đồ 7 ngày gần nhất dựa trên leads
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return { date: d, name: `Th${d.getMonth()+1}/${d.getDate()}`, leads: 0 };
        });
  
        const { data: allLeads } = await supabase.from('leads').select('created_at').gte('created_at', last7Days[0].date.toISOString());
        
        if (allLeads) {
          allLeads.forEach(lead => {
            const lDate = new Date(lead.created_at).getDate();
            const dayObj = last7Days.find(d => d.date.getDate() === lDate);
            if (dayObj) dayObj.leads += 1;
          });
        }
        
        setChartData(last7Days.map(d => ({ name: d.name, leads: d.leads })));
      } catch (err) {
        console.error(err);
      }
    };

    fetchLeads();

    const channel = supabase
      .channel('leads-ui')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setRecentLeads(prev => [payload.new as Lead, ...prev.slice(0, 4)]);
        setLeadsCount(prev => prev + 1);
      })
      .subscribe();

    // Bộ đếm thời gian tự động gửi báo cáo
    const checkAutoReport = async () => {
      const { data } = await supabase.from('private_settings').select('report_time').eq('id', 'default').single();
      const targetTime = data?.report_time || '17:00';
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const lastSent = localStorage.getItem('last_report_date');
      const todayStr = now.toLocaleDateString('vi-VN');

      if (currentTime === targetTime && lastSent !== todayStr) {
         await executeSendReport(false);
         localStorage.setItem('last_report_date', todayStr);
      }
    };
    const intervalId = setInterval(checkAutoReport, 60000); // Kiểm tra mỗi phút

    return () => { supabase.removeChannel(channel); clearInterval(intervalId); };
  }, []);

  return (
    <div className="space-y-10">
      {/* CẢNH BÁO DATABASE THÔNG MINH */}
      {dbStatus === 'error' && (
        <div className="bg-red-500 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-red-600/30">
            <Database size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white text-red-500 p-2 rounded-xl"><AlertTriangle size={24} /></div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Phát hiện lỗi Cơ sở dữ liệu!</h3>
            </div>
            <p className="font-medium text-red-100 mb-6 max-w-3xl leading-relaxed">
              Hệ thống phát hiện Supabase của bạn chưa được cài đặt các bảng dữ liệu chuẩn xác (Lỗi: {dbError}). 
              Để các tính năng hoạt động 100%, vui lòng làm theo hướng dẫn dưới đây:
            </p>
            <div className="bg-black/20 p-6 rounded-2xl border border-white/10 max-w-4xl">
              <p className="font-bold mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white text-red-500 flex items-center justify-center text-xs">1</span> Vào mục SQL Editor trên Supabase, dán đoạn mã sau và bấm RUN:</p>
              <textarea 
                readOnly 
                className="w-full h-48 bg-black/50 text-green-400 font-mono text-[10px] p-4 rounded-xl outline-none border border-white/5 whitespace-pre"
                value={`-- CẬP NHẬT DATABASE MẠNH MẼ VÀ TÍCH HỢP AI SECURITY CHO FUJIRISE\n\n-- 1. BẢNG CẤU HÌNH\nCREATE TABLE IF NOT EXISTS public.site_settings (id text primary key, seo_title text, content_dict jsonb, company_name text, hotline text, email text, primary_color text, accent_color text, font_family text, logo_url text, favicon_url text, hero_bg text, about_bg text, address text, interior_configs jsonb, warranty_policies jsonb, social_links jsonb);\nINSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;\nALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_title text;\nALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS content_dict jsonb;\n\n-- 2. BẢNG CẤU HÌNH RIÊNG TƯ\nCREATE TABLE IF NOT EXISTS public.private_settings (id text primary key, telegram_token text, telegram_chat_id text, report_time text default '17:00');\nINSERT INTO public.private_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;\n\n-- 3. BẢNG SẢN PHẨM\nCREATE TABLE IF NOT EXISTS public.products (id bigint generated by default as identity primary key, title text not null, category text, description text, images jsonb, specs jsonb, material text, "longDescription" text, created_at timestamp with time zone default timezone('utc'::text, now()) not null);\n\n-- 4. BẢNG LEADS\nCREATE TABLE IF NOT EXISTS public.leads (id uuid default gen_random_uuid() primary key, name text, phone text, email text, message text, status text default 'new', created_at timestamptz default now());\n\n-- 5. BẢNG TRUY CẬP\nCREATE TABLE IF NOT EXISTS public.page_views (id bigint generated by default as identity primary key, path text, created_at timestamp with time zone default timezone('utc'::text, now()) not null);\n\n-- 6. BẢNG TÀI KHOẢN ADMIN\nCREATE TABLE IF NOT EXISTS public.admins (id text primary key, email text unique not null, password text not null, role text not null, phone text);\nINSERT INTO public.admins (id, email, password, role) VALUES ('admin-default', 'info.fujirise@gmail.com', 'Fujirise2026@', 'admin') ON CONFLICT (email) DO NOTHING;\n\n-- 7. BẢNG NHẬT KÝ BẢO MẬT (MỚI)\nCREATE TABLE IF NOT EXISTS public.security_logs (id bigint generated by default as identity primary key, event_type text, email_tried text, details jsonb, created_at timestamp with time zone default timezone('utc'::text, now()) not null);\n\n-- 8. TẮT RLS\nALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.private_settings DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.products DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.page_views DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.security_logs DISABLE ROW LEVEL SECURITY;\n\n-- 9. CẤU HÌNH STORAGE\nINSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO UPDATE SET public = true;\nDROP POLICY IF EXISTS "Public_Access" ON storage.objects;\nDROP POLICY IF EXISTS "Allow_Uploads" ON storage.objects;\nDROP POLICY IF EXISTS "Allow_Updates" ON storage.objects;\nDROP POLICY IF EXISTS "Allow_Deletes" ON storage.objects;\nCREATE POLICY "Public_Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');\nCREATE POLICY "Allow_Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');\nCREATE POLICY "Allow_Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'images');\nCREATE POLICY "Allow_Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'images');`}
              />
              <p className="font-bold mt-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white text-red-500 flex items-center justify-center text-xs">2</span> Sau khi RUN thành công, hãy F5 tải lại trang web này.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          icon={<MessageSquare className="text-blue-500" />} 
          label="Tổng yêu cầu" 
          value={leadsCount} 
          trend="+12%" 
          positive={true}
        />
        <StatCard 
          icon={<Smartphone className="text-purple-500" />} 
          label="Lượt truy cập" 
          value={viewsCount.toLocaleString()} 
          trend="+5%" 
          positive={true}
        />
        <StatCard 
          icon={<Activity className="text-green-500" />} 
          label="Tỷ lệ chuyển đổi" 
          value="3.2%" 
          trend="-0.8%" 
          positive={false}
        />
        <StatCard 
          icon={<Lock className="text-orange-500" />} 
          label="Admin Online" 
          value="1" 
          trend="Stable" 
          positive={true}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
           <div className="flex items-start justify-between mb-8">
             <div>
               <h3 className="font-black text-fuji-blue text-sm uppercase tracking-widest">Tiến độ thu thập Lead</h3>
               <p className="text-xs text-slate-400 mt-1">Dữ liệu tính theo tuần hiện tại</p>
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={() => executeSendReport(true)}
                 disabled={isSendingReport}
                 className="px-4 py-2 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-colors flex items-center gap-2 shadow-lg shadow-fuji-blue/20 disabled:opacity-50"
               >
                 <Send size={14} /> {isSendingReport ? 'Đang gửi...' : 'Gửi Báo Cáo Ngay'}
               </button>
               <button className="p-2 border rounded-xl hover:bg-slate-50 transition-colors"><ExternalLink size={16} className="text-slate-400" /></button>
             </div>
           </div>
           
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData.length > 0 ? chartData : [{name: '...', leads: 0}]}>
                 <defs>
                   <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#1b2a43" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#1b2a43" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                   dy={10}
                 />
                 <YAxis hide />
                 <Tooltip 
                   contentStyle={{ 
                     borderRadius: '16px', 
                     border: 'none', 
                     boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                     fontSize: '12px',
                     fontWeight: 900
                   }} 
                 />
                 <Area 
                   type="monotone" 
                   dataKey="leads" 
                   stroke="#1b2a43" 
                   strokeWidth={4}
                   fillOpacity={1} 
                   fill="url(#colorLeads)" 
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-gradient-to-b from-white to-slate-50 rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-fuji-accent/10 rounded-bl-full transition-transform duration-700 group-hover:scale-125" />
           <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-fuji-accent/20 flex items-center justify-center text-fuji-accent">
               <Sparkles size={20} />
             </div>
             <h3 className="font-black text-fuji-blue text-sm uppercase tracking-widest">Trợ lý AI</h3>
           </div>
           
           <div className="flex-1 mb-6 relative z-10 overflow-y-auto">
             {aiAnalysis ? (
               <div className="text-sm font-medium text-slate-700 leading-relaxed space-y-3">
                 {aiAnalysis.split('\n').map((line, i) => <p key={i}>{line.replace(/\*\*/g, '')}</p>)}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-4">
                 <Brain size={48} className="text-slate-300 mb-4 animate-pulse" />
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">AI sẽ đọc dữ liệu kinh doanh<br/>và đưa ra lời khuyên</p>
               </div>
             )}
           </div>

           <button 
             onClick={handleAnalyze} 
             disabled={isAnalyzing}
             className="w-full py-4 bg-fuji-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuji-accent transition-all relative z-10 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isAnalyzing ? (
               <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AI Đang xử lý...</>
             ) : (
               <><Sparkles size={16} /> Phân tích dữ liệu ngay</>
             )}
           </button>
        </div>
      </div>

      {/* Leads Table row */}
      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <h3 className="font-black text-fuji-blue text-sm uppercase tracking-widest italic">Lead mới nhất</h3>
          <button className="text-[10px] font-black text-fuji-accent uppercase tracking-widest border-b-2 border-fuji-accent pb-1">Xem tất cả</button>
        </div>
        <div className="space-y-3">
          {recentLeads.map((lead, idx) => (
            <motion.div 
              key={lead.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center font-black text-fuji-blue shadow-sm">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm tracking-tight">{lead.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{lead.phone} • {lead.email || 'No email'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    (!lead.status || lead.status === 'new') ? "bg-blue-500" : lead.status === 'processing' ? "bg-orange-500" : lead.status === 'completed' ? "bg-green-500" : "bg-slate-400"
                  )} />
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    (!lead.status || lead.status === 'new') ? "text-blue-500" : lead.status === 'processing' ? "text-orange-500" : lead.status === 'completed' ? "text-green-500" : "text-slate-400"
                  )}>
                    {(!lead.status || lead.status === 'new') ? 'Khách Mới' : 
                     lead.status === 'processing' ? 'Đang xử lý' : 
                     lead.status === 'completed' ? 'Đã xong' : 'Từ chối'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">{new Date(lead.created_at).toLocaleTimeString()}</p>
              </div>
              <button className="ml-6 w-10 h-10 flex items-center justify-center text-slate-300 hover:text-fuji-blue group-hover:scale-110 transition-all">
                <ArrowUpRight size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadManager() {
  const [leads, setLeads] = React.useState<Lead[]>([]);

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (data) setLeads(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    
    const headers = ['Khách hàng', 'Số điện thoại', 'Email', 'Ghi chú', 'Trạng thái', 'Thời gian gửi'];
    const csvRows = leads.map(lead => {
      const dateStr = new Date(lead.created_at).toLocaleString('vi-VN');
      const message = lead.message ? lead.message.replace(/"/g, '""') : '';
      const statusMap: any = { new: 'Mới', processing: 'Đang xử lý', completed: 'Đã xong', rejected: 'Từ chối' };
      const statusStr = statusMap[lead.status || 'new'] || 'Mới';
      return `"${lead.name}","${lead.phone}","${lead.email || ''}","${message}","${statusStr}","${dateStr}"`;
    });
    
    // Thêm \uFEFF ở đầu để Excel nhận diện đúng encoding UTF-8 (không bị lỗi tiếng Việt)
    const csvString = '\uFEFF' + headers.join(',') + '\n' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Khach_Hang_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center">
         <div>
           <h3 className="text-lg font-black text-fuji-blue tracking-tighter uppercase">Danh sách chi tiết</h3>
           <p className="text-xs text-slate-400 mt-1 font-medium">Tất cả khách hàng tiềm năng gửi từ Website</p>
         </div>
         <button 
           onClick={handleExportCSV}
           className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
         >
            Xuất dữ liệu CSV
         </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ghi chú</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
              <th className="p-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-fuji-blue text-white flex items-center justify-center font-black text-sm">{lead.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-800 text-sm tracking-tight">{lead.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{lead.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8 text-[11px] text-slate-500 font-medium max-w-xs">{lead.message}</td>
                <td className="p-8 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(lead.created_at).toLocaleString('vi-VN')}</td>
                <td className="p-8 text-right">
                  <select
                    value={lead.status || 'new'}
                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border-none appearance-none transition-all duration-300",
                      (!lead.status || lead.status === 'new') ? "bg-blue-50 text-blue-500 hover:bg-blue-100" :
                      lead.status === 'processing' ? "bg-orange-50 text-orange-500 hover:bg-orange-100" :
                      lead.status === 'completed' ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    <option value="new">Khách Mới</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Đã xong</option>
                    <option value="rejected">Hủy/Từ chối</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductEditor({ product, isSaving, onCancel, onSave }: any) {
  const [form, setForm] = React.useState<any>({ 
    ...product,
    specs: product.specs || { load: '', speed: '', pit: '', oh: '', travel: '', stops: '', door: '', structure: '', power: '', origin: '' }
  });

  const [isUploading, setIsUploading] = React.useState(false);

  const update = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));
  const updateSpec = (k: string, v: string) => setForm((s: any) => ({ ...s, specs: { ...s.specs, [k]: v } }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Đặt tên file ngẫu nhiên để không bị trùng
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // Upload lên Supabase Storage (vào bucket tên là 'images')
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
      if (uploadError) throw uploadError;

      // Lấy link Public của ảnh vừa tải lên
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

      // Thêm link vừa lấy vào danh sách ảnh hiện tại
      const currentImages = form.images || [];
      update('images', [...currentImages, publicUrl]);
    } catch (err: any) {
      if (err.message?.includes('Bucket not found') || err.message?.includes('storage')) {
        alert(
          'CẢNH BÁO TỪ HỆ THỐNG:\n\n' +
          'Supabase chưa có "thùng chứa" tên là "images".\n' +
          'Vui lòng vào Dashboard, copy mã SQL trong bảng cảnh báo đỏ và chạy trong SQL Editor để hệ thống tự động tạo!'
        );
      } else {
        alert('Lỗi khi tải ảnh lên: ' + err.message);
      }
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-8">
      {/* Phần 1: Thông tin cơ bản */}
      <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
        <h4 className="text-xs font-black text-fuji-blue uppercase tracking-widest flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-fuji-accent"/> Thông tin cơ bản</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">Tên Sản Phẩm (Tiêu đề)</label>
            <input value={form.title || ''} onChange={e => update('title', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-fuji-blue outline-none font-bold" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">Danh mục</label>
            <input value={form.category || ''} onChange={e => update('category', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-fuji-blue outline-none font-bold" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Mô tả ngắn (Hiển thị ở Card)</label>
          <textarea value={form.description || ''} onChange={e => update('description', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-fuji-blue outline-none font-medium" rows={2} />
        </div>
      </div>

      {/* Phần 2: Thông số kỹ thuật chi tiết */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
         <h4 className="text-xs font-black text-fuji-blue uppercase tracking-widest flex items-center gap-2 mb-6"><span className="w-2 h-2 rounded-full bg-fuji-accent"/> Thông số kỹ thuật (Bắt buộc để hiển thị đẹp)</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'load', label: 'Tải trọng', placeholder: 'VD: 350kg' },
              { key: 'speed', label: 'Tốc độ', placeholder: 'VD: 0.4 m/s' },
              { key: 'pit', label: 'Hố Pit', placeholder: 'VD: 250mm' },
              { key: 'oh', label: 'Chiều cao OH', placeholder: 'VD: 2850 mm' },
              { key: 'travel', label: 'Hành trình', placeholder: 'VD: ≤ 15m' },
              { key: 'stops', label: 'Điểm dừng', placeholder: 'VD: ≤ 6' },
              { key: 'power', label: 'Công suất', placeholder: 'VD: 2.2kW' },
              { key: 'origin', label: 'Động cơ/CN', placeholder: 'VD: Nhập khẩu châu Âu' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-[9px] font-black uppercase text-slate-500">{field.label}</label>
                <input value={form.specs?.[field.key] || ''} onChange={e => updateSpec(field.key, e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue" placeholder={field.placeholder} />
              </div>
            ))}
            <div className="col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-500">Cửa mở</label>
                <input value={form.specs?.door || ''} onChange={e => updateSpec('door', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue" placeholder="VD: Mở tâm 2 cánh" />
            </div>
            <div className="col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-500">Cấu trúc hố</label>
                <input value={form.specs?.structure || ''} onChange={e => updateSpec('structure', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue" placeholder="VD: Khung hợp kim nhôm" />
            </div>
         </div>
         <div className="mt-4">
            <label className="text-[9px] font-black uppercase text-slate-500">Chất liệu / Vật liệu chính (Material)</label>
            <input value={form.material || ''} onChange={e => update('material', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-fuji-blue outline-none focus:border-fuji-blue" placeholder="VD: Lựa chọn inox, kính, đá vân..." />
         </div>
      </div>

      {/* Phần 3: Nội dung & Hình ảnh */}
      <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
         <h4 className="text-xs font-black text-fuji-blue uppercase tracking-widest flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-fuji-accent"/> Bài viết & Hình ảnh</h4>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Bài viết chi tiết (Xuống dòng tự động tạo đoạn mới)</label>
          <textarea value={form.longDescription || ''} onChange={e => update('longDescription', e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-fuji-blue outline-none font-medium" rows={6} placeholder="Nhập bài viết giới thiệu chi tiết về sản phẩm..." />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Link Hình Ảnh (Mỗi dòng 1 đường link URL)</label>
          <textarea value={(form.images || []).join('\n')} onChange={e => update('images', e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean))} className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-fuji-blue outline-none font-mono text-xs" rows={4} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
          
          <div className="mt-4 flex items-center">
            <label className={cn(
              "cursor-pointer px-6 py-3 bg-slate-100 text-fuji-blue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-fuji-blue hover:text-white"
            )}>
              <UploadCloud size={16} /> {isUploading ? 'ĐANG TẢI LÊN...' : 'UPLOAD ẢNH TỪ MÁY TÍNH'}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t">
        <button onClick={onCancel} className="px-8 py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase hover:bg-slate-200 transition-colors">Hủy bỏ</button>
        <button onClick={() => onSave(form)} disabled={isSaving} className="px-10 py-4 rounded-xl bg-fuji-blue text-white font-black text-xs uppercase hover:bg-fuji-accent transition-colors shadow-xl flex items-center gap-2">
          {isSaving ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, positive }: any) {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
          positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        )}>
          {trend}
        </div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h4>
    </div>
  );
}
