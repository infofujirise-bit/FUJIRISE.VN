import React from 'react';
import { Facebook, MessageCircle, MapPin, Phone, Mail, Instagram } from 'lucide-react';
import { CONTACT_INFO, NAVIGATION } from '../constants';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [logoUrl, setLogoUrl] = React.useState('/images/logo 1.png');

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 'default').single();
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch (e) {}
    };
    fetchLogo();
  }, []);

  return (
    <footer className="bg-fuji-blue text-white pt-24 pb-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuji-accent to-transparent opacity-30" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuji-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <a href="/" className="block">
              <img 
                src={logoUrl} 
                alt="Fujirise Logo" 
                className="h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-2xl"
              />
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Kiến tạo những giải pháp di chuyển thông minh, an toàn và sang trọng bậc nhất cho không gian kiến trúc Việt.
            </p>
            <div className="flex gap-4">
              <a href={CONTACT_INFO.facebook} className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-white rounded-full flex items-center justify-center transition-all border border-white/10">
                <Facebook size={18} />
              </a>
              <a href={CONTACT_INFO.zalo} className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-white rounded-full flex items-center justify-center transition-all border border-white/10">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-fuji-accent text-white rounded-full flex items-center justify-center transition-all border border-white/10">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-fuji-accent mb-8">Điều hướng</h4>
            <nav className="flex flex-col gap-4">
              {NAVIGATION.map(item => (
                <a key={item.name} href={item.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group/link">
                  <div className="w-1 h-1 bg-fuji-accent rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Services/Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-fuji-accent mb-8">Hỗ trợ</h4>
            <nav className="flex flex-col gap-4">
              <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Câu hỏi thường gặp</a>
              <a href="#careers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Cơ hội nghề nghiệp</a>
              <a href="#contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Yêu cầu báo giá</a>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Chính sách bảo hành</a>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-fuji-accent mb-6">Liên hệ</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Phone size={18} className="text-fuji-accent shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white/40 mb-1">Hotline</p>
                  <p className="font-bold text-sm">{CONTACT_INFO.hotline}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail size={18} className="text-fuji-accent shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white/40 mb-1">Email</p>
                  <p className="font-bold text-sm truncate">{CONTACT_INFO.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin size={18} className="text-fuji-accent shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] uppercase font-black text-white/40 mb-1">Trụ sở</p>
                  <p className="text-xs text-slate-400 leading-tight">VA03B-6 Villa Hoàng Thành, Mỗ Lao, Hà Nội</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <p>© 2026 Fujirise.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
