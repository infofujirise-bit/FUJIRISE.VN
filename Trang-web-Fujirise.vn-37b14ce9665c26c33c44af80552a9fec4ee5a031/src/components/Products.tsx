import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from '../constants';
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { sendToTelegram } from '../lib/telegram';
import { supabase } from '../lib/supabase';

export default function Products() {
  const [selectedProduct, setSelectedProduct] = React.useState<typeof PRODUCTS[0] | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [products, setProducts] = React.useState<any[]>(PRODUCTS);
  const modalContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // KÍCH HOẠT ĐỒNG BỘ DỮ LIỆU TỪ SUPABASE
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data && data.length > 0) {
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
          // SIÊU TÍNH NĂNG: Nếu Database trống (chưa thêm SP nào), tự động hiển thị SP mẫu để Web luôn đẹp
          setProducts(PRODUCTS);
        }
      } catch (err) {
        console.warn("Hệ thống: Mất kết nối Database, tự động chuyển sang dữ liệu dự phòng Offline.");
        setProducts(PRODUCTS);
      }
    };
    
    if (import.meta.env.VITE_SUPABASE_URL) {
      fetchProducts();
    }

    // Lắng nghe mọi thay đổi (thêm, sửa, xóa) trên bảng 'products' từ Admin
    const channel = supabase
      .channel('products-realtime-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    // Dọn dẹp listener khi component bị hủy
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-play carousel when product is selected
  React.useEffect(() => {
    if (!selectedProduct) return;
    const images = selectedProduct.images || [];
    if (images.length === 0) return;
    
    setCurrentIndex(0);
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % images.length;
      setCurrentIndex(i);
    }, 3000);
    return () => clearInterval(id);
  }, [selectedProduct]);

  // Tự động cuộn lên trên cùng khi mở Modal sản phẩm mới
  React.useEffect(() => {
    if (selectedProduct && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [selectedProduct]);

  return (
    <section id="products" className="py-32 bg-fuji-line relative overflow-hidden">
      {/* Decorative vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="vi-text text-sm font-semibold text-fuji-accent mb-4 block">Selection</span>
            <h2 className="text-5xl md:text-6xl font-black text-fuji-blue tracking-tighter leading-none">
              BỘ SƯU TẬP <br /><span className="font-serif-display text-slate-300">THANG MÁY</span>
            </h2>
          </div>
          <p className="text-slate-600 max-w-sm text-sm font-bold leading-relaxed uppercase tracking-widest italic">
            "Sự kết hợp hoàn hảo giữa kỹ thuật và thẩm mỹ kiến trúc đương đại."
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-8 shadow-3xl bg-slate-50 transition-transform duration-500 group-hover:-translate-y-2">
                <img
                  src={(product.images && product.images[0]) || 'https://via.placeholder.com/1200x800?text=No+Image'}
                  alt={product.title}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/1200x800?text=No+Image'; }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-fuji-blue/20 group-hover:bg-transparent transition-colors" />
                
                {/* Floating info badge */}
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-fuji-blue text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                  <p className="text-fuji-accent text-[10px] font-black uppercase tracking-widest mb-1">Xem thông số kỹ thuật</p>
                  <p className="font-bold text-lg leading-tight uppercase">{product.title}</p>
                </div>
              </div>
              
              <div className="px-2">
                <h3 className="text-2xl font-black text-fuji-blue tracking-tighter mb-4 uppercase">{product.title}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">{product.description}</p>
                <button
                  className="inline-flex items-center gap-3 text-fuji-blue text-xs font-black uppercase tracking-widest hover:text-fuji-accent transition-all"
                >
                  <div className="w-8 h-[1px] bg-fuji-accent" /> XEM CHI TIẾT <ArrowRight size={14} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-fuji-blue/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-white rounded-[30px] md:rounded-[40px] shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-fuji-blue text-white rounded-full flex items-center justify-center hover:bg-fuji-accent transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div ref={modalContentRef} className="flex-1 overflow-y-auto flex flex-col relative w-full h-full scroll-smooth">
              {/* Image carousel section */}
            <div className="relative shrink-0 h-[300px] md:h-[500px] bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                <div className="w-full h-full relative">
                  {(selectedProduct.images || []).map((src: string, i: number) => (
                    <img
                      key={src}
                      src={src || 'https://via.placeholder.com/1200x800?text=No+Image'}
                      alt={`${selectedProduct.title} ${i + 1}`}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/1200x800?text=No+Image'; }}
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 drop-shadow-xl ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    />
                  ))}
                </div>
                {/* Carousel indicators */}
                {(selectedProduct.images || []).length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {(selectedProduct.images || []).map((_, i: number) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentIndex(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content section */}
            <div className="p-6 md:p-10 flex-1">
                <span className="text-fuji-accent text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">{selectedProduct.category || 'Danh mục'}</span>
                <h3 className="text-3xl font-black text-fuji-blue tracking-tighter leading-tight mb-4 uppercase">
                  {selectedProduct.title}
                </h3>
                <p className="text-slate-600 mb-6 font-medium text-sm">{selectedProduct.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(selectedProduct.specs || {}).map(([key, value]) => {
                  // Tự động bỏ qua không hiển thị các thông số bị bỏ trống trong Admin
                  if (!value || String(value).trim() === '') return null;
                  const labels: Record<string, string> = {
                    load: 'Tải trọng', speed: 'Tốc độ', pit: 'Hố Pit', power: 'Công suất',
                    origin: 'Động cơ/CN', oh: 'Chiều cao OH', travel: 'Hành trình',
                    stops: 'Điểm dừng', door: 'Cửa mở', structure: 'Cấu trúc'
                  };
                  return (
                    <div key={key}>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">{labels[key] || key}</p>
                      <p className="text-sm font-bold text-fuji-blue">{value as React.ReactNode}</p>
                    </div>
                  );
                })}
              </div>

                <div className="bg-fuji-accent/10 rounded-xl p-4 mb-6">
                    <p className="text-[10px] font-black uppercase text-fuji-accent mb-2">Vật liệu & Chi tiết</p>
                    <p className="text-slate-700 font-semibold text-sm">{selectedProduct.specs?.material || selectedProduct.material || 'Liên hệ để tìm hiểu'}</p>
                </div>

                {/* Long description / structured sections */}
                {selectedProduct.longDescription && (
                  <div className="mt-8 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
                    {selectedProduct.longDescription.split(/\r?\n/).map((line: string, i: number) => {
                      const text = line.trim();
                      if (!text) return <div key={i} className="h-4" />; // Tạo khoảng trống cho dòng trống
                      
                      // Nhận diện Tiêu đề lớn (In hoa toàn bộ)
                      const isHeading = text === text.toUpperCase() && text.length > 5 && !text.startsWith('♦') && !text.startsWith('-');
                      if (isHeading) {
                        return <h4 key={i} className="text-sm font-black text-fuji-blue mt-8 mb-4 tracking-widest border-b border-slate-200 pb-2">{text}</h4>;
                      }

                      // Nhận diện Tiêu đề phụ (Kết thúc bằng dấu hai chấm)
                      if (text.endsWith(':') && text.split(' ').length < 10) {
                        return <h5 key={i} className="text-sm font-bold text-slate-800 mt-6 mb-2">{text}</h5>;
                      }
                      
                      // Nhận diện các dòng thuộc tính (Bắt đầu bằng ♦ hoặc -)
                      if (text.startsWith('♦') || text.startsWith('-')) {
                        const colonIndex = text.indexOf(':');
                        if (colonIndex !== -1 && colonIndex < 50) {
                          const label = text.substring(1, colonIndex).trim();
                          const value = text.substring(colonIndex + 1).trim();
                          return (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-600 mb-3">
                              <span className="text-fuji-accent shrink-0 mt-0.5"><CheckCircle2 size={16} /></span>
                              <div className="leading-relaxed"><strong className="text-slate-800 font-bold">{label}:</strong> {value}</div>
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="flex items-start gap-3 text-sm text-slate-600 mb-3">
                            <span className="text-fuji-accent shrink-0 mt-0.5"><CheckCircle2 size={16} /></span>
                            <span className="font-medium leading-relaxed">{text.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      
                      // Văn bản đoạn văn bình thường
                      return <p key={i} className="text-sm text-slate-600 font-medium leading-relaxed mb-3">{text}</p>;
                    })}
                  </div>
                )}
              </div>
              {/* Inquiry form + Footer action button */}
          <div className="p-6 md:p-10 border-t border-slate-100 bg-slate-50 shrink-0 space-y-4">
                <ProductInquiryForm product={selectedProduct} onClose={() => setSelectedProduct(null)} />
              </div>
          </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProductInquiryForm({ product, onClose }: any) {
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', address: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const telegramMessage = `🔵 <b>NHẬN BÁO GIÁ - ${product.title}</b>\n----------------------------\n<b>Họ tên:</b> ${form.name}\n<b>Điện thoại:</b> ${form.phone}\n<b>Email:</b> ${form.email || 'Không có'}\n<b>Địa chỉ:</b> ${form.address || '-'}\n----------------------------`;
      await sendToTelegram(telegramMessage);

      const hasSupabase = !!((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY);
      if (hasSupabase) {
        try {
          const { error } = await supabase.from('leads').insert([{ name: form.name, phone: form.phone, email: form.email || null, message: `Product inquiry: ${product.title}`, status: 'new' }]);
          if (error) console.warn('Supabase insert failed (client):', error.message || error);
        } catch (e: any) {
          console.error('Client supabase error:', e);
        }
      }

      onClose();
    } catch (err: any) {
      console.error('Inquiry submit error:', err);
      alert('Có lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-black uppercase text-slate-400">Họ và tên</label>
        <input value={form.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
      </div>
      <div>
        <label className="text-[10px] font-black uppercase text-slate-400">Số điện thoại</label>
        <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Email</label>
          <input value={form.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400">Địa chỉ</label>
          <input value={form.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-3 rounded-xl border" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border">Hủy</button>
        <button onClick={onSubmit} disabled={isSubmitting || !form.name || !form.phone} className="flex-1 py-3 rounded-xl bg-fuji-accent text-white font-black">{isSubmitting ? 'ĐANG GỬI...' : 'Gửi yêu cầu'}</button>
      </div>
    </div>
  );
}
