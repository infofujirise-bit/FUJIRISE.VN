export const CONTACT_INFO = {
  hotline: "0868822210",
  email: "info.fujirise@gmail.com",
  address: "Tầng 2, VA03B-6 Villa Hoàng Thành, Mỗ Lao, Hà Đông, Hà Nội",
  zalo: "https://zalo.me/0868822210",
  facebook: "https://facebook.com/fujirise",
};

export const NAVIGATION = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '#products' },
  { name: 'Về chúng tôi', href: '#about' },
  { name: 'Tuyển dụng', href: '#careers' },
  { name: 'Hỏi đáp', href: '#faq' },
  { name: 'Tư vấn', href: '#contact' },
];

export const CAREERS = [
  {
    id: 1,
    title: "Nhân viên Kinh doanh (Sales)",
    location: "Hà Nội",
    type: "Toàn thời gian",
    description: "Tìm kiếm và chăm sóc khách hàng tiềm năng cho giải pháp thang máy gia đình cao cấp.",
  },
  {
    id: 2,
    title: "Chuyên viên Marketing",
    location: "Hà Nội",
    type: "Toàn thời gian",
    description: "Xây dựng hình ảnh thương hiệu Fujirise trên các nền tảng số.",
  },
];

export const PRODUCTS = [
  {
    id: 100,
    title: "Model GEH100S - Thang không đối trọng, công nghệ cáp dẹt",
    category: "Thang máy Homelife",
    description: "Thang máy gia đình cao cấp GEH100S — tối ưu cho không gian hiện đại, an toàn và êm ái.",
    images: [
      "/images/geh100s-1.jpg",
      "/images/geh100s-2.jpg",
      "/images/geh100s-3.jpg"
    ],
    specs: {
      load: "350kg",
      speed: "0.4 m/s",
      pit: "250mm",
      oh: "2850 mm",
      travel: "≤ 15m",
      stops: "≤ 6",
      door: "Mở tâm 2 cánh, mở 1 cánh, mở bản lề tự động",
      structure: "Hố thang xây hoặc khung hợp kim nhôm / Khung thép",
    },
    material: "Inox sọc nhuyễn, inox hoa văn tinh xảo hoặc kính cường lực",
    longDescription: `Thành phần cấu tạo:\n\nĐẶC TÍNH KỸ THUẬT\n♦ Tải trọng: 350kg\n♦ Tốc độ: 0.4 m/s\n♦ Pit: 250mm\n♦ OH: 2850 mm\n♦ Hành trình: ≤ 15m\n♦ Điểm dừng: ≤ 6\n♦ Cửa mở: Mở tâm 2 cánh, mở 1 cánh, mở bản lề tự động\n♦ Cấu trúc: Hố thang xây hoặc hố sử dụng khung hợp kim nhôm / Khung thép\n\nCHI TIẾT CẤU HÌNH CABIN\n♦ Chất liệu cabin cao cấp: Lựa chọn linh hoạt giữa inox sọc nhuyễn, inox hoa văn tinh xảo hoặc kính cường lực hiện đại, phù hợp nhiều phong cách thiết kế.\n♦ Vách sau ốp đá vân sang trọng: Tạo điểm nhấn đẳng cấp, nâng tầm thẩm mỹ không gian nội thất.\n♦ Sàn PVC bền đẹp: Chống trơn trượt, dễ vệ sinh, đảm bảo an toàn và độ bền trong quá trình sử dụng.\n♦ Trần đèn trang trí tinh tế: Hệ thống chiếu sáng với hiệu ứng ánh sáng hiện đại, mang lại cảm giác ấm cúng và sang trọng.`
  },
  {
    id: 1,
    title: "Thang máy gia đình Mini",
    category: "Thang máy Homelife",
    description: "Giải pháp tối ưu cho không gian nhỏ hẹp, sang trọng và tiện nghi.",
    images: [
      "/images/thang-mini-1.jpg",
      "/images/thang-mini-2.jpg",
      "/images/thang-mini-3.jpg"
    ],
    specs: {
      load: "250kg - 320kg",
      speed: "0.4m/s",
      pit: "300mm",
      power: "2.2kW",
      origin: "Nhập khẩu nguyên chiếc",
      material: "Inox sọc nhuyễn cao cấp",
    },
    material: "Inox sọc nhuyễn cao cấp",
    longDescription: `Thành phần cấu tạo:\n\nĐẶC TÍNH KỸ THUẬT\n♦ Tải trọng: 250kg - 320kg\n♦ Tốc độ: 0.4m/s\n♦ Pit: 300mm\n♦ Công suất: 2.2kW\n♦ Máy kéo: Nhập khẩu cao cấp\n\nCHI TIẾT CẤU HÌNH CABIN\n♦ Chất liệu cabin cao cấp: Inox sọc nhuyễn cao cấp, linh hoạt chọn lựa.\n♦ Vách sau ốp đá vân sang trọng: Tạo điểm nhấn đẳng cấp, nâng tầm thẩm mỹ không gian nội thất.\n♦ Sàn PVC bền đẹp: Chống trơn trượt, dễ vệ sinh, đảm bảo an toàn và độ bền trong quá trình sử dụng.\n♦ Trần đèn trang trí tinh tế: Hệ thống chiếu sáng với hiệu ứng ánh sáng hiện đại, mang lại cảm giác ấm cúng và sang trọng.`
  },
  {
    id: 2,
    title: "Thang máy Kính quan sát",
    category: "Thang máy Homelife",
    description: "Tầm nhìn panorama đẳng cấp, nâng tầm kiến trúc ngôi nhà.",
    images: [
      "/images/thang-kinh-1.jpg",
      "/images/thang-kinh-2.jpg",
      "/images/thang-kinh-3.jpg"
    ],
    specs: {
      load: "320kg - 450kg",
      speed: "0.6m/s - 1.0m/s",
      pit: "500mm",
      power: "3.7kW",
      origin: "Công nghệ không phòng máy",
      material: "Kính cường lực 2 lớp an toàn",
    },
    material: "Kính cường lực 2 lớp an toàn",
    longDescription: `Thành phần cấu tạo:\n\nĐẶC TÍNH KỸ THUẬT\n♦ Tải trọng: 320kg - 450kg\n♦ Tốc độ: 0.6m/s - 1.0m/s\n♦ Pit: 500mm\n♦ Công suất: 3.7kW\n♦ Công nghệ: Không phòng máy\n\nCHI TIẾT CẤU HÌNH CABIN\n♦ Chất liệu cabin cao cấp: Kính cường lực 2 lớp an toàn, tầm nhìn 360° panorama.\n♦ Vách sau: Thiết kế mở rộng không gian, tối ưu ánh sáng tự nhiên.\n♦ Sàn PVC bền đẹp hoặc Gỗ laminat: Chống trơn trượt, dễ vệ sinh, đảm bảo an toàn.\n♦ Trần đèn trang trí tinh tế: Sáng tự nhiên kết hợp đèn LED hiện đại, mang lại cảm giác ấm cúng và sang trọng.`
  },
  {
    id: 3,
    title: "Thang máy Inox vàng gương",
    category: "Thang máy Homelife",
    description: "Vẻ đẹp quý tộc với họa tiết chạm khắc tinh xảo.",
    images: [
      "/images/thang-vang-1.jpg",
      "/images/thang-vang-2.jpg",
      "/images/thang-vang-3.jpg"
    ],
    specs: {
      load: "450kg - 630kg",
      speed: "1.0m/s",
      pit: "1200mm",
      power: "5.5kW",
      origin: "Nhập khẩu đồng bộ",
      material: "Inox gương mạ vàng PVD",
    },
    material: "Inox gương mạ vàng PVD",
    longDescription: `Thành phần cấu tạo:\n\nĐẶC TÍNH KỸ THUẬT\n♦ Tải trọng: 450kg - 630kg\n♦ Tốc độ: 1.0m/s\n♦ Pit: 1200mm\n♦ Công suất: 5.5kW\n♦ Máy kéo: Nhập khẩu đồng bộ\n\nCHI TIẾT CẤU HÌNH CABIN\n♦ Chất liệu cabin cao cấp: Inox gương mạ vàng PVD - sang trọng đẳng cấp.\n♦ Vách sau ốp đá vân sang trọng hoặc gương: Tạo điểm nhấn đẳng cấp, nâng tầm thẩm mỹ không gian nội thất.\n♦ Sàn PVC bền đẹp hoặc Đá hoa cương: Chống trơn trượt, dễ vệ sinh, đảm bảo an toàn và độ bền trong quá trình sử dụng.\n♦ Trần đèn trang trí tinh tế: Đèn LED dạo ánh sáng ấm, mang lại cảm giác ấm cúng và sang trọng.`
  },
];

export const FAQS = [
  {
    q: "Chi phí lắp thang máy gia đình khoảng bao nhiêu?",
    a: "Tùy vào dòng thang, số tầng và vật liệu, chi phí thường từ 300 triệu đến hơn 1 tỷ đồng. Chúng tôi sẽ khảo sát thực tế để tư vấn phương án phù hợp nhất với ngân sách."
  },
  {
    q: "Nhà tôi có diện tích nhỏ, có lắp được không?",
    a: "Hoàn toàn được. Hiện nay có nhiều giải pháp thang máy hố nhỏ, không cần phòng máy, phù hợp cả nhà phố diện tích hạn chế.\n\n• Với thang nhỏ (2–3 người): Có thể làm hố thang từ 1000 x 1000 mm.\n• Với thang phổ biến (4–5 người): Nên từ 1300 x 1300 mm trở lên."
  },
  {
    q: "Lắp thang máy có cần xây hố thang từ đầu không?",
    a: "Nếu là nhà xây mới, nên thiết kế từ đầu. Với nhà cải tạo, vẫn có thể lắp bằng khung thép hoặc kính, không ảnh hưởng nhiều đến kết cấu."
  },
  {
    q: "Thang máy gia đình có tốn điện không?",
    a: "Mức tiêu thụ điện tương đương một thiết bị gia dụng lớn (như điều hòa), khá tiết kiệm nhờ công nghệ hiện đại."
  },
  {
    q: "Khi mất điện thì thang có hoạt động không?",
    a: "Thang được trang bị hệ thống cứu hộ tự động (ARD), giúp đưa cabin về tầng gần nhất và mở cửa an toàn."
  },
  {
    q: "Thang máy có an toàn cho trẻ em và người lớn tuổi không?",
    a: "Rất an toàn. Thang có đầy đủ cảm biến, chống kẹt cửa, dừng khẩn cấp… phù hợp cho mọi thành viên trong gia đình."
  },
  {
    q: "Thời gian lắp đặt thang máy là bao lâu?",
    a: "Thông thường từ 120 ngày, tính từ ngày ký hợp đồng, báo giá thang máy."
  },
  {
    q: "Có cần bảo trì thường xuyên không?",
    a: "Nên bảo trì định kỳ 1–2 tháng/lần để đảm bảo thang luôn vận hành ổn định và kéo dài tuổi thọ."
  },
  {
    q: "Thang máy có gây tiếng ồn không?",
    a: "Các dòng thang hiện đại vận hành rất êm ái, gần như không gây ảnh hưởng đến sinh hoạt gia đình."
  },
  {
    q: "Có thể thiết kế thang theo nội thất nhà không?",
    a: "Hoàn toàn có thể. Khách hàng có thể tùy chọn vật liệu như kính, inox, gỗ… để phù hợp phong cách kiến trúc."
  },
  {
    q: "Nên chọn thang máy kính hay thang truyền thống?",
    a: "• Thang kính: Đẹp, hiện đại, phù hợp nhà mới.\n• Thang truyền thống: Chi phí tốt hơn, bền bỉ.\n\n→ Tùy nhu cầu và ngân sách."
  },
  {
    q: "Chiều cao tầng trên cùng tối thiểu bao nhiêu?",
    a: "Chiều cao tầng trên cùng (OH) tối thiểu từ 2600 mm, tùy theo loại thang. Đội ngũ kỹ thuật sẽ khảo sát và tư vấn phương án phù hợp để đảm bảo an toàn và thẩm mỹ."
  },
  {
    q: "Có cần xin giấy phép khi lắp thang máy không?",
    a: "Thông thường không cần giấy phép riêng, nhưng cần tuân thủ thiết kế xây dựng và tiêu chuẩn an toàn."
  },
  {
    q: "Lắp thang máy có làm tăng giá trị ngôi nhà không?",
    a: "Có. Thang máy giúp tăng tiện nghi, thẩm mỹ và giá trị bất động sản đáng kể."
  },
  {
    q: "Tôi nên chọn dòng thang nào phù hợp?",
    a: "• Ngân sách vừa: Chọn dòng tiêu chuẩn.\n• Ưu tiên thẩm mỹ: Chọn dòng kính.\n• Cao cấp: Chọn dòng luxury.\n\n→ Chúng tôi sẽ tư vấn chi tiết theo nhu cầu thực tế của bạn."
  }
];
