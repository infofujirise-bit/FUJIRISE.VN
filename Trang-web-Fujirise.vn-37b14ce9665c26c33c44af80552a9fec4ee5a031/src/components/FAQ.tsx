import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { FAQS } from '../constants';

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-fuji-line overflow-hidden">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="vi-text text-sm font-semibold text-fuji-accent mb-4 block">Kiến thức chuyên môn</span>
          <h2 className="vi-heading text-4xl md:text-5xl text-fuji-blue tracking-tighter leading-none mb-6">
            HỎI ĐÁP <span className="text-slate-300">CHUYÊN GIA</span>
          </h2>
          <p className="text-slate-500 font-medium">Giải đáp những thắc mắc phổ biến nhất khi tìm hiểu về giải pháp thang máy gia đình.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-fuji-blue/5 text-fuji-accent flex items-center justify-center shrink-0">
                    <HelpCircle size={16} />
                  </div>
                  <span className="font-bold text-fuji-blue tracking-tight">{faq.q}</span>
                </div>
                <div className="text-fuji-accent">
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 ml-12 text-slate-500 leading-relaxed font-medium whitespace-pre-line">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <p className="vi-text text-sm font-medium text-slate-400 mb-6">Bạn còn thắc mắc khác?</p>
            <a href="#contact" className="inline-flex items-center gap-3 px-8 py-4 bg-fuji-blue text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-fuji-accent transition-all shadow-xl">
                LIÊN HỆ CHUYÊN GIA NGAY
            </a>
        </div>
      </div>
    </section>
  );
}
