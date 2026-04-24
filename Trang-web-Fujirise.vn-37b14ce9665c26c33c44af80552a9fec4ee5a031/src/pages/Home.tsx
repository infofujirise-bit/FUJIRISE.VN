import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Products from '../components/Products';
import Contact from '../components/Contact';
import Careers from '../components/Careers';
import FAQ from '../components/FAQ';
import Configurator from '../components/Configurator';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Wrench, Headset, Clock, PackageCheck, FileBadge, Star, Award } from 'lucide-react';

export default function Home() {
  const [policies, setPolicies] = React.useState<any[]>([
    { id: '1', title: 'Bảo hành toàn diện 24 tháng', description: 'Toàn bộ thiết bị và linh kiện thang máy được bảo hành chính hãng 24 tháng. Miễn phí đổi mới 100% đối với các hư hỏng do lỗi từ nhà sản xuất.', icon: 'ShieldCheck' },
    { id: '2', title: 'Bảo trì định kỳ miễn phí', description: ' Kỹ thuật viên sẽ đến kiểm tra, vệ sinh, căn chỉnh và châm dầu mỡ định kỳ 1 tháng/lần để đảm bảo vận hành êm ái.', icon: 'Wrench' },
    { id: '3', title: 'Xử lý sự cố tốc độ 24/7', description: 'Đội ngũ kỹ thuật túc trực 24/7. Cam kết có mặt xử lý cứu hộ trong vòng 60 phút tại nội thành và 24h đối với các tỉnh lân cận.', icon: 'Clock' },
    { id: '4', title: 'Linh kiện sẵn sàng 100%', description: 'Cam kết cung cấp vật tư, linh kiện thay thế chính hãng nhập khẩu trong suốt vòng đời thang máy, không để khách hàng chờ đợi làm gián đoạn sinh hoạt.', icon: 'PackageCheck' },
    { id: '5', title: 'Hỗ trợ kiểm định an toàn', description: 'Miễn phí toàn bộ chi phí kiểm định an toàn lần đầu tiên. Thang máy chỉ được bàn giao khi có giấy chứng nhận của cơ quan thẩm quyền Nhà nước.', icon: 'FileBadge' },
    { id: '6', title: 'Bảo hiểm trách nhiệm', description: 'Mỗi sản phẩm bàn giao đều đi kèm chứng nhận bảo hiểm trách nhiệm rủi ro, mang lại sự bảo vệ và an tâm tuyệt đối cho mọi thành viên gia đình.', icon: 'Headset' }
  ]);
  const [aboutBg, setAboutBg] = React.useState('/images/van-phong-fujirise.jpg');
  const [content, setContent] = React.useState<any>({});

  React.useEffect(() => {
    // Ghi nhận lượt truy cập (Page View) để hiển thị tự động trên Admin Dashboard
    const trackView = async () => {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        try {
          await supabase.from('page_views').insert([{ path: window.location.pathname }]);
        } catch (err) {}
      }
    };
    trackView();

    const applySettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
        if (data) {
          document.title = data.seo_title || "Fujirise | Giải pháp thang máy cho mọi gia đình";
          if (data.content_dict) {
            setContent(data.content_dict);
          }
          if (data.primary_color) document.documentElement.style.setProperty('--color-fuji-blue', data.primary_color);
          if (data.accent_color) document.documentElement.style.setProperty('--color-fuji-accent', data.accent_color);
          if (data.font_family) {
            let styleEl = document.getElementById('dynamic-font-style');
            if (!styleEl) {
              styleEl = document.createElement('style');
              styleEl.id = 'dynamic-font-style';
              document.head.appendChild(styleEl);
            }
            const safeFont = data.font_family.replace(/["';<>]/g, '');
            styleEl.innerHTML = `body, h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea, select { font-family: "${safeFont}", sans-serif !important; }
            /* CSS tự động phóng to logo và xóa phông trắng nền */
            img[alt*="logo" i], img[src*="logo" i], .nav-logo { transform: scale(1.3); mix-blend-mode: multiply; max-height: 50px !important; }
            `;
          }
        if (data.warranty_policies && data.warranty_policies.length > 0) {
          setPolicies(data.warranty_policies);
        }
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon_url || '/icon.svg';
        if (data.about_bg) setAboutBg(data.about_bg);
        }
      } catch (err) {}
    };
    applySettings();

  const channel = supabase.channel('home-settings-update')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, applySettings)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
  }, []);

  const renderIcon = (name: string) => {
    const props = { size: 28 };
    switch (name) {
      case 'Wrench': return <Wrench {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'PackageCheck': return <PackageCheck {...props} />;
      case 'FileBadge': return <FileBadge {...props} />;
      case 'Headset': return <Headset {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <ShieldCheck {...props} />;
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Products />
      {/* About Section */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative">
              <img 
                src={aboutBg} 
                alt="Fujirise Office" 
                className="rounded-[40px] shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuji-accent/10 rounded-full blur-3xl z-0" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-fuji-blue/5 rounded-[60px] z-0" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-fuji-accent mb-6 block"></span>
              <h2 className="text-5xl md:text-7xl font-black text-fuji-blue tracking-tighter leading-[0.9] mb-10">
                <span dangerouslySetInnerHTML={{ __html: content.about_title || 'THIẾT LẬP <br/><span className="text-slate-300">TIÊU CHUẨN SỐNG</span>' }} />
              </h2>
              <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                {content.about_desc || 'Được thành lập vào năm 2026, Fujirise mang trong mình tầm nhìn khát vọng: Trở thành biểu tượng của sự xa xỉ và an toàn tuyệt đối. Chúng tôi không chỉ cung cấp thang máy nhập khẩu cao cấp, mà còn kiến tạo nên những không gian nghệ thuật, định hình lại phong cách sống đẳng cấp cho giới tinh hoa.'}
              </p>
              <div className="flex gap-12 border-t border-slate-100 pt-10">
                <div>
                  <p className="text-3xl font-black text-fuji-blue">100%</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Nhập khẩu cao cấp</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-fuji-blue">24/7</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Hỗ trợ kỹ thuật</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-fuji-line p-12 rounded-[40px] group hover:bg-fuji-blue transition-colors duration-500">
              <div className="w-12 h-1 bg-fuji-accent mb-8 group-hover:w-24 transition-all" />
              <h3 className="text-sm font-semibold text-fuji-accent mb-4 block">Sứ mệnh</h3>
              <p className="text-2xl font-black text-fuji-blue group-hover:text-white leading-tight mb-6 tracking-tighter">
                <span dangerouslySetInnerHTML={{ __html: content.about_mission_title || 'Setting the Standard for Living <br/> <span className="text-fuji-accent italic">Thiết lập tiêu chuẩn sống</span>' }} />
              </p>
              <p className="text-slate-500 group-hover:text-white/60 font-medium leading-relaxed">
                {content.about_mission_desc || 'Mang đến những giải pháp thang máy an toàn, bền bỉ và dễ tiếp cận, góp phần thiết lập một chuẩn mực sống tiện nghi cho mọi gia đình.'}
              </p>
            </div>

            <div className="bg-fuji-blue p-12 rounded-[40px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuji-accent/10 rounded-bl-full" />
              <div className="w-12 h-1 bg-fuji-accent mb-8" />
              <h3 className="text-sm font-semibold text-fuji-accent mb-4 block">Tầm nhìn</h3>
              <p className="text-3xl font-black text-white leading-tight mb-8 tracking-tighter">
                <span dangerouslySetInnerHTML={{ __html: content.about_vision_title || 'Định hình tiêu chuẩn sống <br/> <span className="text-fuji-accent italic">hiện đại tại Việt Nam</span>' }} />
              </p>
              <p className="text-white/60 font-medium leading-relaxed">
                {content.about_vision_desc || 'Trở thành thương hiệu tiên phong trong việc định hình tiêu chuẩn sống hiện đại tại Việt Nam, nơi tiện nghi không còn là đặc quyền mà là điều hiển nhiên.'}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Configurator />
      <FAQ />
      <Careers />

      {/* Warranty Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-fuji-accent mb-4 block">Cam kết chất lượng</span>
            <h2 className="text-4xl md:text-5xl font-black text-fuji-blue tracking-tighter mb-6">CHÍNH SÁCH BẢO HÀNH</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Fujirise cam kết đồng hành trọn vòng đời sản phẩm, mang lại sự an tâm tuyệt đối cho không gian sống của bạn với tiêu chuẩn dịch vụ khắt khe nhất.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-slate-50 rounded-[32px] p-10 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-fuji-blue mb-6 shadow-sm">
                  {renderIcon(policy.icon)}
                </div>
                <h3 className="text-xl font-black text-fuji-blue mb-4">{policy.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
      <FloatingActions />
    </main>
  );
}
