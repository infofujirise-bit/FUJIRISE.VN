import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Hero() {
  const [bgUrl, setBgUrl] = React.useState('https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=2000');
  const [companyName, setCompanyName] = React.useState('Fujirise');
  const [content, setContent] = React.useState<any>({});

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('hero_bg, company_name, content_dict').eq('id', 'default').single();
        if (data?.hero_bg) setBgUrl(data.hero_bg);
        if (data?.company_name) setCompanyName(data.company_name);
        if (data?.content_dict) setContent(data.content_dict);
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hình ảnh thang máy sang chảnh sắc nét */}
      <div className="absolute inset-0">
        <img
          src={bgUrl} 
          alt="Luxury Elevator" 
          className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-fuji-blue/90" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
        {/* Nút badge design lại cho đỡ cụt đầu */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-fuji-accent animate-pulse shadow-[0_0_10px_#C5A059]" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">{companyName} - Giải pháp thang máy cao cấp</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8 drop-shadow-2xl"
        >
          <span dangerouslySetInnerHTML={{ __html: content.hero_title || 'NÂNG TẦM <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuji-accent to-yellow-200 italic font-serif">KHÔNG GIAN SỐNG</span>' }} />
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {content.hero_desc || 'Giải pháp thang máy gia đình nhập khẩu cao cấp, kết hợp hoàn hảo giữa kỹ thuật an toàn tuyệt đối và nghệ thuật kiến trúc đương đại.'}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#products" className="px-8 py-4 bg-fuji-accent text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-fuji-blue transition-all shadow-[0_0_40px_rgba(197,160,89,0.4)] flex items-center gap-2">
            Khám phá ngay <ArrowRight size={16} />
          </a>
          <a href="#contact" className="px-8 py-4 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
            Nhận tư vấn
          </a>
        </motion.div>
      </div>
    </section>
  );
}
