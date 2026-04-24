import React from 'react';
import { Phone, Mail, MapPin, Facebook, MessageCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTACT_INFO, NAVIGATION } from '../constants';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState('/logo.svg');

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 'default').single();
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch (e) {}
    };
    fetchLogo();

    // Lắng nghe thay đổi Logo thời gian thực
    const channel = supabase.channel('navbar-settings-update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchLogo)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Utility Bar - Ultra Minimal */}
      <div className="hidden md:block bg-fuji-blue text-white/50 py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.25em]">
          <div className="flex gap-8">
            <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={10} strokeWidth={3} className="text-fuji-accent" /> {CONTACT_INFO.email}
            </a>
            <p className="flex items-center gap-2">
              <MapPin size={10} strokeWidth={3} className="text-fuji-accent" /> Mỗ Lao, Hà Đông, Hà Nội
            </p>
          </div>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /></span>
            <div className="w-px h-3 bg-white/10" />
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </div>

      <nav className={cn(
        "transition-all duration-500",
        scrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-2xl shadow-fuji-blue/5 py-3" 
          : "bg-white py-4"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
          {/* Logo Left */}
          <a href="/" className="block shrink-0">
            <img 
              src={logoUrl || '/images/logo 1.png'} 
              alt="Fujirise Logo" 
              className={cn(
                "w-auto object-contain transition-all duration-500 origin-left",
                scrolled ? "h-12 md:h-14" : "h-16 md:h-20"
              )}
            />
          </a>

          {/* Desktop Menu - Centered */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-8 flex-1 justify-center">
            {NAVIGATION.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[9px] xl:text-[11px] font-black uppercase tracking-[0.1em] xl:tracking-[0.2em] text-slate-500 hover:text-fuji-blue transition-all relative group/item whitespace-nowrap"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fuji-accent transition-all group-hover/item:w-full" />
              </a>
            ))}
          </div>

          {/* Call to Action Right */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="text-right">
              <p className="text-[9px] text-fuji-accent uppercase font-black tracking-widest leading-none mb-1">Hotline</p>
              <a href={`tel:${CONTACT_INFO.hotline}`} className="text-fuji-blue font-black text-xl tracking-tight leading-none hover:opacity-70 transition-all">
                {CONTACT_INFO.hotline.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3')}
              </a>
            </div>
            <a 
              href="#contact" 
              className="px-6 py-3 bg-fuji-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-fuji-accent transition-all shadow-lg active:scale-95"
            >
              Tư vấn ngay
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-fuji-blue focus:outline-none p-2 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Content ... (rest remains or tweaked similarly) */}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl md:hidden border-t"
          >
            <div className="flex flex-col p-6 gap-4">
              {NAVIGATION.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-slate-800 hover:text-fuji-blue flex items-center justify-between"
                >
                  {item.name}
                  <div className="w-1.5 h-1.5 bg-fuji-blue rounded-full opacity-0 group-hover:opacity-100" />
                </a>
              ))}
              <div className="pt-4 border-t flex flex-col gap-3">
                <a href={`tel:${CONTACT_INFO.hotline}`} className="flex items-center gap-3 text-fuji-blue font-bold">
                  <Phone size={20} /> {CONTACT_INFO.hotline}
                </a>
                <div className="flex gap-4">
                  <a href={CONTACT_INFO.facebook} className="p-2 border rounded-full text-blue-600"><Facebook size={20} /></a>
                  <a href={CONTACT_INFO.zalo} className="p-2 border rounded-full text-blue-400"><MessageCircle size={20} /></a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  </header>
  );
}
