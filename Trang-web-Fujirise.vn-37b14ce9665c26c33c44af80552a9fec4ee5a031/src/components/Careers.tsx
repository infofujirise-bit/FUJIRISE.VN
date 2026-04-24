import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Clock, ArrowRight, X, CheckCircle2, User, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CAREERS } from '../constants';
import { supabase } from '../lib/supabase';
import { sendToTelegram } from '../lib/telegram';
import { cn } from '../lib/utils';

type RecruitmentFormData = {
  name: string;
  phone: string;
  email?: string;
  cvLink?: string;
};

export default function Careers() {
  const [selectedJob, setSelectedJob] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { register, handleSubmit, reset } = useForm<RecruitmentFormData>();

  const onSubmit = async (data: RecruitmentFormData) => {
    setIsSubmitting(true);
    try {
      const fields: string[] = [];
      fields.push(`Họ tên: ${data.name}`);
      fields.push(`Điện thoại: ${data.phone}`);
      if (data.email) fields.push(`Email: ${data.email}`);
      if (data.cvLink) fields.push(`Link CV: ${data.cvLink}`);
      const messageText = fields.join('\n');
      const msg = `⚪️ <b>TUYỂN DỤNG</b>\n----------------------------\n<b>Thông tin liên hệ</b>\n${messageText}\n\n<i>Hệ thống Tuyển dụng tự động.</i>`;
      
      await sendToTelegram(msg);

      const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      if (hasSupabase) {
        try {
          const { error } = await supabase.from('leads').insert([{
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            message: `Ứng tuyển\n${messageText}`,
            status: 'new'
          }]);
          if (error) console.warn('Supabase insert (client) failed:', error.message || error);
        } catch (e: any) {
          console.error('Client supabase insert error:', e?.message || e);
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedJob(null);
        reset();
      }, 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="careers" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuji-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center md:text-left">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="vi-text text-sm font-semibold text-fuji-accent mb-6 block"
          >
            Cơ hội nghề nghiệp
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-fuji-blue tracking-tighter leading-none mb-8"
          >
            GIA NHẬP <br/><span className="text-slate-300">ĐỘI NGŨ</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl text-lg font-medium leading-relaxed"
          >
            Tại Fujirise, chúng tôi không chỉ xây dựng thang máy, chúng tôi kiến tạo hành trình thành công cho mỗi cá nhân. Cùng nhau nâng tầm cuộc sống Việt.
          </motion.p>
        </div>

        <div className="grid gap-6">
          {CAREERS.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-fuji-line p-10 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-fuji-blue transition-all duration-500 border border-transparent hover:shadow-2xl hover:shadow-fuji-blue/20"
            >
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-fuji-blue group-hover:bg-fuji-accent group-hover:text-white transition-all shadow-xl shadow-fuji-blue/5">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-fuji-blue group-hover:text-white mb-3 tracking-tight">{job.title}</h3>
                  <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/50">
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-fuji-accent" /> {job.location}</span>
                    <span className="flex items-center gap-2"><Clock size={14} className="text-fuji-accent" /> {job.type}</span>
                  </div>
                </div>
              </div>
              
                <div className="flex items-center gap-10">
                  <p className="hidden lg:block text-slate-500 group-hover:text-white/60 text-sm max-w-xs italic leading-relaxed font-medium">"{job.description}"</p>
                  <button 
                    onClick={() => {
                      setSelectedJob(job.title);
                    }}
                    className="bg-white text-fuji-blue px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/5 group-hover:bg-fuji-accent group-hover:text-white transition-all flex items-center gap-3 whitespace-nowrap active:scale-95"
                  >
                    ỨNG TUỂN <ArrowRight size={18} strokeWidth={3} />
                  </button>
                </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-fuji-dark rounded-[50px] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuji-accent/10 rounded-full blur-[80px]" />
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Chưa tìm thấy vị trí mong muốn?</h3>
            <p className="text-white/50 font-medium text-lg">Gửi thông tin để chúng tôi lưu hồ sơ và liên hệ khi có cơ hội phù hợp.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedJob("Ứng tuyển tự do");
            }}
            className="btn-primary bg-fuji-accent hover:bg-white hover:text-fuji-dark px-12 relative z-10 h-16 uppercase tracking-[0.2em] text-xs"
          >
            GỬI THÔNG TIN NGAY
          </button>
        </div>
      </div>

      {/* Recruitment Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-fuji-blue/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] p-10 md:p-14 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-8 right-8 text-slate-300 hover:text-fuji-blue transition-colors"
              >
                <X size={32} />
              </button>

              <div className="mb-8 text-center">
                <span className="text-sm font-semibold text-fuji-accent mb-2 block">Biểu mẫu ứng tuyển</span>
                <h3 className="text-2xl font-extrabold text-fuji-blue">Nộp hồ sơ trực tuyến</h3>
                <p className="text-slate-500 font-medium mt-2">Vị trí: <span className="text-fuji-blue font-black">{selectedJob}</span></p>
              </div>

              {!isSuccess ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2"><User size={14} /> Họ và tên *</label>
                      <input 
                        {...register('name', { required: true })}
                        className="w-full px-4 py-3 rounded-xl bg-fuji-line border-transparent focus:bg-white focus:border-fuji-accent outline-none transition-all font-semibold text-fuji-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2"><Phone size={14} /> Số điện thoại *</label>
                      <input 
                        {...register('phone', { required: true })}
                        className="w-full px-4 py-3 rounded-xl bg-fuji-line border-transparent focus:bg-white focus:border-fuji-accent outline-none transition-all font-semibold text-fuji-blue"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <input {...register('email')} className="w-full px-4 py-3 rounded-xl bg-fuji-line focus:bg-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Link CV / Portfolio</label>
                      <input {...register('cvLink')} className="w-full px-4 py-3 rounded-xl bg-fuji-line focus:bg-white outline-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all mt-2",
                      isSubmitting ? "bg-slate-100 text-slate-400" : "bg-fuji-blue text-white hover:bg-fuji-accent shadow-2xl shadow-fuji-blue/20"
                    )}
                  >
                    {isSubmitting ? "ĐANG GỬI..." : "GỬI HỒ SƠ"}
                  </button>
                </form>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={56} />
                  </div>
                  <h4 className="text-3xl font-black text-fuji-blue mb-4">Gửi Thành Công!</h4>
                  <p className="text-slate-500 font-medium">Cảm ơn bạn đã quan tâm. Chúng tôi sẽ xem xét hồ sơ và liên hệ sớm nhất.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
