import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { Phone, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { sendToTelegram } from '../lib/telegram';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

type FormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
  address: string;
};

export default function Contact() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [contactInfo, setContactInfo] = React.useState({ hotline: '0868822210', address: 'Hà Nội' });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('hotline, address').eq('id', 'default').single();
        if (data) setContactInfo({ hotline: data.hotline || '0868822210', address: data.address || 'Hà Nội' });
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  const onSubmit = async (data: FormData) => {
    const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    setIsSubmitting(true);
    try {
      const telegramMessage = `\n🔥 <b>LEAD MỚI TỪ WEBSITE FUJIRISE</b>\n----------------------------\n<b>Họ tên:</b> ${data.name}\n<b>Điện thoại:</b> ${data.phone}\n<b>Email:</b> ${data.email || 'Không có'}\n<b>Địa chỉ:</b> ${data.address || 'Không có'}\n<b>Nội dung:</b> ${data.message || 'Không có'}\n----------------------------`;
      await sendToTelegram(telegramMessage);

      if (hasSupabase) {
        try {
          const { error: supabaseError } = await supabase.from('leads').insert([
            { name: data.name, phone: data.phone, email: data.email || null, message: `Địa chỉ: ${data.address || 'Không có'} - Nội dung: ${data.message || 'Không có'}`, status: 'new' }
          ]);
          if (supabaseError) console.warn('Supabase insert failed (client):', supabaseError.message || supabaseError);
        } catch (supaErr) {
          console.warn('Lỗi lưu vào Supabase:', supaErr);
        }
      }

      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error('Contact error:', error);
      alert('Có lỗi khi gửi yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-white relative">
      {/* Background decoration */}
      <div className="absolute left-0 bottom-0 w-1/3 h-px bg-slate-100" />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Info Side */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-fuji-accent mb-6 block"
            >
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black text-fuji-blue tracking-tighter leading-none mb-10"
            >
              YÊU CẦU <br/><span className="font-serif-display text-slate-300">TƯ VẤN</span>
            </motion.h2>
            <p className="text-slate-500 mb-12 text-lg leading-relaxed max-w-md font-medium">
              Đội ngũ chuyên gia của Fujirise luôn sẵn sàng hỗ trợ bạn 24/7 để tìm ra giải pháp thang máy hoàn mỹ nhất cho ngôi nhà của bạn.
            </p>

            <div className="space-y-10">
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-fuji-line text-fuji-blue rounded-full flex items-center justify-center group-hover:bg-fuji-accent group-hover:text-white transition-all shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hotline 24/7</h4>
                  <p className="text-fuji-blue font-black text-2xl tracking-tighter">{contactInfo.hotline}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-fuji-line text-fuji-blue rounded-full flex items-center justify-center group-hover:bg-fuji-accent group-hover:text-white transition-all shadow-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Văn phòng</h4>
                  <p className="text-fuji-blue font-black text-lg tracking-tight leading-tight">{contactInfo.address.split(',')[0]}</p>
                  <p className="text-slate-400 text-xs font-medium">{contactInfo.address.split(',').slice(1).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="relative">
            <div className="bg-fuji-blue p-10 md:p-14 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Họ và tên *</label>
                    <input
                      {...register("name", { required: true })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Số điện thoại *</label>
                    <input
                      {...register("phone", { required: true })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Email</label>
                    <input
                      {...register("email")}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Địa chỉ</label>
                    <input
                      {...register("address")}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all font-bold text-white placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block ml-1">Yêu cầu của bạn</label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-fuji-accent focus:bg-white/20 outline-none transition-all resize-none font-bold text-white placeholder:text-white/20"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all",
                    isSubmitting ? "bg-white/10 text-white/30" : "bg-fuji-accent text-white hover:bg-white hover:text-fuji-blue shadow-xl"
                  )}
                >
                  {isSubmitting ? "SENDING..." : (
                    <>GỬI YÊU CẦU NGAY <ArrowRight size={20} strokeWidth={3} /></>
                  )}
                </button>
              </form>

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-8 z-10"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-serif font-bold text-fuji-blue mb-4 text-center">Gửi Thành Công!</h3>
                <p className="text-slate-600">
                  Cảm ơn bạn đã tin tưởng Fujirise. <br />
                  Đội ngũ chuyên viên sẽ liên hệ lại trong vòng 15 phút.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
