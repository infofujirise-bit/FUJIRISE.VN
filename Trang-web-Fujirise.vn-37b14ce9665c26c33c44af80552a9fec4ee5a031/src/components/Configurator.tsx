import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sendToTelegram } from '../lib/telegram';
import { supabase } from '../lib/supabase';

const CONFIGS = [
  {
    id: 'gold',
    name: 'Luxury Gold',
    primary: '#C5A059',
    bg: '/images/mau-thang-gold.jpg',
    description: 'Chất liệu Inox gương vàng PVD cao cấp, họa tiết vân mây sang trọng.'
  },
  {
    id: 'glass',
    name: 'Modern Glass',
    primary: '#A0A0A0',
    bg: '/images/mau-thang-glass.jpg',
    description: 'Vách kính cường lực panorama, ôm trọn tầm nhìn và ánh sáng tự nhiên.'
  },
  {
    id: 'silver',
    name: 'Classic Silver',
    primary: '#64748b',
    bg: '/images/mau-thang-silver.jpg',
    description: 'Inox sọc nhuyễn tinh tế, bền bỉ với thời gian, dễ dàng vệ sinh.'
  }
];

export default function Configurator() {
  const [active, setActive] = React.useState(CONFIGS[0]);
  const [configs, setConfigs] = React.useState<any[]>(CONFIGS);
  const [showModal, setShowModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  type FormData = {
    name: string;
    phone: string;
    email: string;
  };

  const { register, handleSubmit, reset } = useForm<FormData>();

  React.useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('interior_configs').eq('id', 'default').single();
        if (data && data.interior_configs && data.interior_configs.length > 0) {
          setConfigs(data.interior_configs);
          setActive(prev => data.interior_configs.find((c: any) => c.id === prev.id) || data.interior_configs[0]);
        }
      } catch (e) {}
    };

    if (import.meta.env.VITE_SUPABASE_URL) fetchConfigs();

    const channel = supabase.channel('configs-realtime-update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchConfigs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const onSubmit = async (data: FormData) => {
    const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    setIsSubmitting(true);
    try {
      const telegramMessage = `\n🔥 <b>CATALOG REQUEST</b>\n----------------------------\n<b>Họ tên:</b> ${data.name}\n<b>Điện thoại:</b> ${data.phone}\n<b>Email:</b> ${data.email}\n----------------------------`;
      await sendToTelegram(telegramMessage);

      if (hasSupabase) {
        try {
          const { error: supabaseError } = await supabase.from('leads').insert([{ 
            name: data.name,
            phone: data.phone,
            email: data.email,
            message: `Catalog request`,
            status: 'new'
          }]);
          if (supabaseError) console.warn('Supabase insert failed:', supabaseError.message || supabaseError);
        } catch (supaErr) {
          console.warn('Lỗi lưu vào Supabase:', supaErr);
        }
      }

      setIsSuccess(true);
      reset();
      setTimeout(() => {
        setIsSuccess(false);
        setShowModal(false);
      }, 2500);
    } catch (err: any) {
      console.error('Catalog request error:', err);
      alert('Có lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-fuji-blue overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Visual Showcase */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="relative aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(197,160,89,0.2)] border-4 border-fuji-accent/20"
              >
                <img 
                  src={active.bg} 
                  alt={active.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fuji-blue via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-fuji-accent text-sm font-semibold mb-2">Đang trình diễn</p>
                    <h3 className="text-white text-3xl font-bold">{active.name}</h3>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-[450px]">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none mb-8 pt-4">
              BỘ MÔ PHỎNG <br /><span className="text-fuji-accent italic">NỘI THẤT</span>
            </h2>
            <p className="text-white/60 mb-10 font-medium">Tùy chọn phong cách thiết kế phù hợp với kiến trúc ngôi nhà của bạn. Trải nghiệm không gian thang máy ảo ngay lập tức.</p>
            <div className="space-y-4">
              {configs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setActive(config)}
                  className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition-all duration-300 text-left ${
                    active.id === config.id 
                    ? 'border-fuji-accent bg-fuji-accent/10' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-xl shadow-inner border border-white/20" 
                        style={{ backgroundColor: config.primary }} 
                    />
                    <div>
                        <h4 className={`font-black text-sm uppercase tracking-widest ${active.id === config.id ? 'text-fuji-accent' : 'text-white'}`}>
                            {config.name}
                        </h4>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Premium Finish</p>
                    </div>
                  </div>
                  {active.id === config.id && (
                    <div className="w-6 h-6 bg-fuji-accent rounded-full flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button type="button" onClick={() => setShowModal(true)} className="mt-8 w-full py-4 bg-white text-fuji-blue rounded-xl font-black text-xs uppercase tracking-widest hover:bg-fuji-accent hover:text-white transition-all flex items-center justify-center gap-3">
                NHẬN CATALOGUE MẪU NỘI THẤT <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-fuji-blue/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="bg-white w-full max-w-md rounded-[24px] p-8 relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-fuji-blue mb-2">Nhận catalogue miễn phí</h3>
              <p className="text-sm text-slate-500 mb-6">Vui lòng nhập thông tin để chúng tôi gửi catalogue mẫu đến bạn.</p>

              {isSuccess ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Check size={36} />
                  </div>
                  <p className="font-bold">Yêu cầu đã gửi — Chúng tôi sẽ liên hệ sớm!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">Họ và tên *</label>
                    <input {...register('name', { required: true })} className="w-full mt-2 px-4 py-3 border rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">Số điện thoại *</label>
                    <input {...register('phone', { required: true })} className="w-full mt-2 px-4 py-3 border rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">Email nhận catalogue *</label>
                    <input {...register('email', { required: true })} className="w-full mt-2 px-4 py-3 border rounded-2xl outline-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-2xl bg-white/50">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-fuji-blue text-white rounded-2xl font-black">
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
