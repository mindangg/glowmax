// Structured content from PAGE.md — 22 sections
// Clean Vietnamese text, no emoji, organized for Info tab

export type ContentBlock = {
  heading?: string;
  body: string;
};

export type InfoSection = {
  id: string;
  title: string;
  category: 'skincare' | 'xuong' | 'dinhduong' | 'phongcach' | 'tamly';
  categoryLabel: string;
  summary: string;
  content: ContentBlock[];
};

export const INFO_CATEGORIES = [
  { key: 'skincare', label: 'Da & Skincare' },
  { key: 'xuong', label: 'Xương & Cấu trúc mặt' },
  { key: 'dinhduong', label: 'Dinh dưỡng' },
  { key: 'phongcach', label: 'Phong cách & Ngoại hình' },
  { key: 'tamly', label: 'Tâm lý & Khoa học ngoại hình' },
] as const;

export const INFO_SECTIONS: InfoSection[] = [
  // ─── SKINCARE ───────────────────────────────────────────────────────────────

  {
    id: 'hoatchat',
    title: 'Các hoạt chất cơ bản & cơ chế tác động lên da',
    category: 'skincare',
    categoryLabel: 'Da & Skincare',
    summary: 'Da gặp vấn đề do 4 cơ chế chính. Mỗi hoạt chất xử lý một hoặc nhiều cơ chế này.',
    content: [
      {
        heading: 'Bản chất da & vấn đề cần giải quyết',
        body: 'Da gặp vấn đề không phải ngẫu nhiên mà do 4 cơ chế chính: tăng tiết bã nhờn (sebum), tăng sừng hóa (tế bào chết không bong đúng), tắc nghẽn lỗ chân lông, viêm (inflammation). Mỗi hoạt chất xử lý một hoặc nhiều cơ chế này.',
      },
      {
        heading: 'BHA (Salicylic Acid) — Xử lý tắc nghẽn bên trong',
        body: 'Tan trong dầu, phân tử nhỏ, đi sâu vào lỗ chân lông. Hòa tan trong lớp dầu trên da, phá liên kết giữa keratin và lipid, làm tan nút tắc. Kết quả: giảm mụn đầu đen, mụn ẩn, làm sạch pore từ bên trong.',
      },
      {
        heading: 'AHA (Glycolic / Lactic Acid) — Xử lý bề mặt',
        body: 'Tan trong nước, hoạt động trên epidermis. Làm yếu liên kết desmosome, đẩy nhanh bong tế bào chết, lộ lớp da mới. Kết quả: da sáng hơn, giảm texture, mịn hơn. Không xử lý sâu pore như BHA.',
      },
      {
        heading: 'Retinol — Tác động ở cấp độ gene',
        body: 'Chuyển hóa: Retinol → Retinal → Retinoic Acid. Vào nhân tế bào, gắn vào receptor RAR/RXR, điều chỉnh biểu hiện gene. Hệ quả: tăng cell turnover, giảm hình thành comedone, tăng collagen. Đây là hoạt chất core lâu dài.',
      },
      {
        heading: 'Niacinamide — Ổn định sinh lý da',
        body: 'Giảm hoạt động tuyến bã nhờn, tăng tổng hợp ceramide, giảm cytokine viêm. Kết quả: ít dầu hơn, da ít kích ứng, barrier khỏe. Hoạt chất "ổn định hệ thống".',
      },
      {
        heading: 'Vitamin C — Chống oxy hóa & sắc tố',
        body: 'Trung hòa free radicals, ức chế tyrosinase giảm melanin, tham gia tổng hợp collagen. Kết quả: sáng da, giảm thâm, bảo vệ khỏi UV.',
      },
      {
        heading: 'Moisturizer — Kiểm soát nước & barrier',
        body: 'Thành phần: humectant hút nước, emollient làm mềm, occlusive khóa nước. Tăng hydration, giảm TEWL (mất nước qua da), phục hồi lipid barrier. Nếu da thiếu nước, cơ thể tăng tiết dầu — tăng nguy cơ tắc nghẽn. Moisturizer là nền tảng, không phải phụ.',
      },
      {
        heading: 'Sunscreen — Bảo vệ toàn bộ hệ',
        body: 'UV gây DNA damage, viêm, phá collagen, tăng melanin. Không dùng sunscreen: mụn lâu lành, thâm nặng hơn, da yếu dần. Không sunscreen = mọi thứ khác giảm hiệu quả.',
      },
      {
        heading: 'Tương tác hoạt chất',
        body: 'BHA + Retinol: hiệu quả cao nhưng tăng irritation. AHA + Retinol: dễ over-exfoliation. Vitamin C + Sunscreen: tăng bảo vệ UV. Combination sai sẽ phá barrier.',
      },
    ],
  },

  {
    id: 'seoro',
    title: 'Sẹo rỗ (Acne Scar) & cơ chế mất collagen',
    category: 'skincare',
    categoryLabel: 'Da & Skincare',
    summary: 'Sẹo rỗ là tổn thương cấu trúc sâu trong da (dermis), không phải vấn đề bề mặt. Skincare không thể xóa sẹo rỗ.',
    content: [
      {
        heading: 'Bản chất của sẹo rỗ',
        body: 'Sẹo rỗ không phải là vấn đề bề mặt mà là tổn thương cấu trúc sâu trong da (dermis). Khi bị mụn viêm nặng, enzyme MMPs phá hủy collagen, mô liên kết bị tổn thương. Nếu collagen tái tạo không đủ, da bị lõm xuống hình thành sẹo rỗ.',
      },
      {
        heading: 'Các loại sẹo rỗ',
        body: 'Ice pick scar: nhỏ, sâu, giống lỗ kim — khó điều trị nhất. Boxcar scar: rộng, đáy phẳng, mép rõ. Rolling scar: gợn sóng, do mô xơ kéo da xuống. Mỗi loại cần phương pháp khác nhau.',
      },
      {
        heading: 'Tại sao skincare không xóa được sẹo rỗ',
        body: 'Skincare chỉ tác động epidermis. Sẹo rỗ nằm ở dermis — không đủ sâu để tái tạo cấu trúc. Retinol có thể tăng collagen nhẹ nhưng không xóa sẹo sâu.',
      },
      {
        heading: 'Nguyên tắc điều trị',
        body: 'Phải kích thích collagen mới. Hai cách chính: (1) Controlled injury — Microneedling, Laser tạo tổn thương có kiểm soát để kích thích tái tạo. (2) Subcision — cắt sợi xơ kéo da xuống cho rolling scar. Chỉ cải thiện được 50–80%, không thể hoàn toàn.',
      },
      {
        heading: 'Ngăn ngừa quan trọng hơn điều trị',
        body: 'Kiểm soát mụn sớm, tránh nặn mạnh và viêm kéo dài. Sẹo là tổn thương không hồi phục hoàn toàn — phòng bệnh hơn chữa bệnh.',
      },
    ],
  },

  {
    id: 'quangthammmat',
    title: 'Quầng thâm mắt & cơ chế sinh học',
    category: 'skincare',
    categoryLabel: 'Da & Skincare',
    summary: 'Quầng thâm mắt có nhiều nguyên nhân khác nhau. Điều trị cần nhắm đúng nguyên nhân.',
    content: [
      {
        heading: 'Nguyên nhân chính',
        body: 'Da vùng mắt rất mỏng (~0.5mm so với 2mm ở nơi khác), mạch máu gần bề mặt hơn. Có 3 loại nguyên nhân: sắc tố (melanin), mạch máu (vascular), và cấu trúc (hollow/structural).',
      },
      {
        heading: 'Loại vascular (mạch máu)',
        body: 'Mạch máu dưới da mỏng lộ ra, tạo màu tím xanh. Nguyên nhân: thiếu ngủ, mệt mỏi, cortisol cao làm mạch máu giãn. Cách nhận biết: ấn nhẹ thấy mờ đi, ánh sáng xanh tím.',
      },
      {
        heading: 'Loại pigment (sắc tố)',
        body: 'Melanin tích tụ ở vùng mắt do UV, viêm, di truyền. Cách nhận biết: màu nâu, không thay đổi khi ấn. Điều trị: Vitamin C, Niacinamide, retinol nhẹ, sunscreen vùng mắt.',
      },
      {
        heading: 'Loại structural (cấu trúc)',
        body: 'Mất volume (fat, collagen) tạo shadow. Thường thấy ở người lớn tuổi, di truyền. Skincare không thể fix hoàn toàn — cần filler hoặc procedure.',
      },
      {
        heading: 'Cải thiện không cần thủ thuật',
        body: 'Ngủ đủ 7–9 tiếng. Giảm cortisol (stress). Dùng caffeine topical (co mạch tạm thời). Vitamin C serum buổi sáng. Retinol nhẹ buổi tối. Sunscreen mỗi ngày. Cold compress giảm sưng tạm thời.',
      },
    ],
  },

  {
    id: 'lamtrangda',
    title: 'Cách làm trắng da & cơ chế melanin',
    category: 'skincare',
    categoryLabel: 'Da & Skincare',
    summary: 'Làm trắng da không phải "tẩy trắng" mà là giảm sản xuất melanin và làm da đều màu hơn.',
    content: [
      {
        heading: 'Cơ chế hình thành melanin',
        body: 'UV kích thích da gây stress tế bào → kích hoạt enzyme tyrosinase → biến tyrosine thành melanin → melanin vận chuyển lên bề mặt da. Đây là cơ chế tự bảo vệ của cơ thể.',
      },
      {
        heading: 'Nguyên tắc làm trắng',
        body: 'Cần can thiệp vào 3 bước: (1) Giảm tạo melanin — dùng Vitamin C ức chế tyrosinase. (2) Ngăn melanin lên bề mặt — Niacinamide chặn vận chuyển. (3) Loại bỏ tế bào chứa melanin — AHA, retinol tăng cell turnover.',
      },
      {
        heading: 'Vai trò của sunscreen',
        body: 'Không dùng sunscreen → UV liên tục kích thích tạo melanin mới → mọi hoạt chất làm trắng đều giảm tác dụng. Sunscreen là bước không thể thiếu.',
      },
      {
        heading: 'Kết quả thực tế',
        body: 'Không thể thay đổi skin tone tự nhiên. Chỉ có thể: giảm thâm, tàn nhang, da đều màu hơn, loại bỏ melanin do UV. Kết quả cần 4–12 tuần kiên trì.',
      },
    ],
  },

  {
    id: 'tpbs',
    title: 'Thực phẩm bổ sung (Supplements)',
    category: 'skincare',
    categoryLabel: 'Da & Skincare',
    summary: 'Các supplement hỗ trợ sức khỏe da và cơ thể — hiểu cơ chế để dùng đúng mục đích.',
    content: [
      {
        heading: 'Collagen — Loại và cơ chế',
        body: 'Collagen supplement (Type I, II, III) khi uống bị phân giải thành amino acid. Peptide nhỏ (glycine, proline, hydroxyproline) kích thích fibroblast tổng hợp collagen nội sinh. Hiệu quả chủ yếu sau 8–12 tuần dùng liên tục.',
      },
      {
        heading: 'Vitamin C & Zinc',
        body: 'Vitamin C cần thiết cho tổng hợp collagen (cofactor của enzyme). Zinc giảm viêm, hỗ trợ lành thương, điều tiết sebum. Cả hai hỗ trợ skin barrier và giảm mụn.',
      },
      {
        heading: 'Omega-3 (Fish oil)',
        body: 'EPA và DHA giảm viêm hệ thống (anti-inflammatory). Giảm mụn viêm, cải thiện da khô, hỗ trợ barrier. Liều: 1–3g EPA+DHA mỗi ngày.',
      },
      {
        heading: 'Creatine',
        body: 'Tăng ATP trong tế bào cơ, cải thiện hiệu suất tập luyện, hỗ trợ tăng cơ. Có thể tăng DHT nhẹ ở một số người — không có bằng chứng rõ ràng gây rụng tóc ở người không nhạy cảm.',
      },
      {
        heading: 'Lưu ý chung',
        body: 'Supplement hỗ trợ, không thay thế dinh dưỡng từ thực phẩm. Ưu tiên: ngủ đủ giấc, ăn đủ protein, kiểm soát stress — hiệu quả hơn bất kỳ supplement nào.',
      },
    ],
  },

  // ─── XƯƠNG & CẤU TRÚC MẶT ────────────────────────────────────────────────

  {
    id: 'xuong',
    title: 'Các xương chính quyết định ngoại hình khuôn mặt',
    category: 'xuong',
    categoryLabel: 'Xương & Cấu trúc mặt',
    summary: 'Khuôn mặt được quyết định bởi 3 xương quan trọng nhất: Mandible, Maxilla và Zygomatic.',
    content: [
      {
        heading: 'Nền tảng sinh học của khuôn mặt',
        body: 'Khuôn mặt được quyết định chủ yếu bởi cấu trúc xương sọ mặt (facial skeleton). Da và mỡ chỉ là lớp phủ bên ngoài. 3 xương quan trọng nhất: Mandible (xương hàm dưới), Maxilla (xương hàm trên), Zygomatic (xương gò má).',
      },
      {
        heading: 'Mandible — Jawline',
        body: 'Quyết định chiều rộng và độ sắc của jawline. Gonial angle thấp (~90–110°) → jawline sắc, mặt góc cạnh. Gonial angle cao (>120°) → jawline tròn, mặt mềm. Mandible mạnh: cằm rõ, đường hàm sắc. Mandible yếu/lùi: cằm lùi, jawline mờ.',
      },
      {
        heading: 'Maxilla — Midface',
        body: 'Nằm ở trung tâm, ảnh hưởng đến mũi, môi, vùng dưới mắt. Forward maxilla: midface đầy, môi cân đối, profile đẹp. Recessed maxilla: midface lõm, mũi trông to hơn, vùng mắt trũng. Đây là yếu tố quyết định side profile aesthetics.',
      },
      {
        heading: 'Zygomatic — Chiều sâu khuôn mặt',
        body: 'Tạo chiều rộng mặt, tạo shadow tự nhiên, tạo chiều sâu 3D. Gò má cao: mặt sắc nét, có chiều sâu, ánh sáng tạo contour tự nhiên. Gò má thấp: mặt phẳng, ít definition.',
      },
      {
        heading: 'Ảnh hưởng của mỡ & nước',
        body: 'Body fat cao: mỡ phủ lên xương, che jawline, mặt tròn. Body fat thấp: xương lộ rõ, face nét hơn. Nước retention (sodium, glycogen, cortisol): nước giữ dưới da làm mất definition, puffy face, jawline mờ — đây là yếu tố thay đổi nhanh nhất.',
      },
    ],
  },

  {
    id: 'mewing',
    title: 'Mewing & ảnh hưởng thực tế lên khuôn mặt',
    category: 'xuong',
    categoryLabel: 'Xương & Cấu trúc mặt',
    summary: 'Mewing ở người lớn gần như không thay đổi cấu trúc xương. Hiểu đúng để không lãng phí thời gian.',
    content: [
      {
        heading: 'Lý thuyết của Mewing',
        body: 'Lưỡi đặt lên vòm miệng tạo lực lên maxilla. Lý thuyết: áp lực liên tục có thể reshape xương theo thời gian.',
      },
      {
        heading: 'Thực tế sinh học',
        body: 'Ở trẻ em (growth plates còn mở): có thể ảnh hưởng nhẹ đến phát triển. Ở người lớn (sau dậy thì): growth plates đóng, xương gần như cố định — mewing gần như không thay đổi được xương rõ rệt.',
      },
      {
        heading: 'Giới hạn sinh học sau dậy thì',
        body: 'Growth plates đóng sau dậy thì. Xương không có khả năng remodel đáng kể từ áp lực lưỡi. Không có bài tập nào làm to hàm hay thay đổi cấu trúc xương ở người lớn.',
      },
      {
        heading: 'Cách tối ưu ngoại hình không đổi xương',
        body: 'Giảm body fat → lộ cấu trúc. Kiểm soát nước/sodium → giảm puffy. Posture đúng → tối ưu visual. Đây là 3 đòn bẩy thực sự hiệu quả.',
      },
    ],
  },

  {
    id: 'posture',
    title: 'Dáng ngồi & dáng đứng (Posture) & ảnh hưởng lên ngoại hình',
    category: 'xuong',
    categoryLabel: 'Xương & Cấu trúc mặt',
    summary: 'Posture ảnh hưởng trực tiếp đến cách người khác nhìn nhận bạn — và bạn nhìn nhận bản thân.',
    content: [
      {
        heading: 'Posture & jawline',
        body: 'Forward head posture kéo mô mềm xuống, làm jawline mờ. Posture chuẩn: cổ thẳng, đầu cân bằng → jawline rõ hơn, face nhìn sắc hơn. Đây là thay đổi về góc nhìn, không phải xương.',
      },
      {
        heading: 'Posture & chiều cao visual',
        body: 'Đứng thẳng: có thể thêm 1–3cm chiều cao visual. Vai mở: tăng perceived frame. Cằm song song mặt đất: mặt nhìn cân đối hơn. Tổng hợp: posture chuẩn = thay đổi ấn tượng rõ ràng mà không cần bất cứ thứ gì khác.',
      },
      {
        heading: 'Posture & tâm lý',
        body: 'Nghiên cứu (Amy Cuddy): power posture ảnh hưởng đến cortisol và testosterone. Posture mở rộng → tự tin hơn. Tự tin → cách nói chuyện, giao tiếp mắt, biểu hiện cơ thể thay đổi — người khác cảm nhận được.',
      },
      {
        heading: 'Cách cải thiện posture',
        body: 'Strengthen posterior chain (lưng, mông, hamstring). Stretch anterior chain (ngực, hip flexor). Neck retraction — thu cằm về sau. Đây là cải thiện dài hạn và bền vững nhất.',
      },
    ],
  },

  {
    id: 'matlech',
    title: 'Mặt lệch (Facial Asymmetry) & cơ chế sinh học',
    category: 'xuong',
    categoryLabel: 'Xương & Cấu trúc mặt',
    summary: '100% khuôn mặt người đều không đối xứng hoàn toàn. Hiểu để không bị ám ảnh không cần thiết.',
    content: [
      {
        heading: 'Tại sao mặt không đối xứng',
        body: 'Asymmetry là hoàn toàn bình thường về mặt sinh học. Nguyên nhân: di truyền (gene không đối xứng), tư thế ngủ (một bên chịu lực), thói quen nhai (một bên cơ phát triển hơn), lịch sử chấn thương.',
      },
      {
        heading: 'Mức độ ảnh hưởng đến attractiveness',
        body: 'Symmetry nhẹ thường không giảm attractiveness. Thực tế: nhiều người đẹp có asymmetry rõ nhưng vẫn được coi là hấp dẫn. Não tự "điều chỉnh" và không chú ý đến asymmetry nhỏ khi nhìn tổng thể.',
      },
      {
        heading: 'Yếu tố có thể cải thiện',
        body: 'Không nhai một bên (tập nhai đều). Tư thế ngủ thay đổi (không ép mặt xuống gối). Posture cổ/đầu cân bằng. Kiểm soát nước (asymmetry thường rõ hơn khi puffy).',
      },
      {
        heading: 'Yếu tố không thể thay đổi',
        body: 'Cấu trúc xương di truyền sau dậy thì không thay đổi được bằng thói quen. Chỉ có thể tối ưu hóa, không thể "fix" hoàn toàn không cần thủ thuật.',
      },
    ],
  },

  // ─── DINH DƯỠNG ─────────────────────────────────────────────────────────

  {
    id: 'debloatfood',
    title: 'Xếp hạng đồ ăn debloat',
    category: 'dinhduong',
    categoryLabel: 'Dinh dưỡng',
    summary: 'Puffy face không phải do mỡ mà do sodium, glycogen và nước. Kiểm soát điện giải là chìa khóa.',
    content: [
      {
        heading: 'Bản chất của Puffy Face',
        body: 'Puffy không phải do mỡ mà do water retention. 3 yếu tố chính: Sodium (giữ nước ngoài tế bào), Glycogen (giữ nước trong tế bào), Hormone (cortisol, insulin điều chỉnh nước). Debloat = kiểm soát 3 yếu tố này.',
      },
      {
        heading: 'Cơ chế điện giải Sodium vs Potassium',
        body: 'Sodium tăng → cơ thể giữ nước ngoài tế bào → gây puffy. Potassium cân bằng điện giải, giúp đào thải sodium → giảm giữ nước. Tỷ lệ sodium:potassium cực kỳ quan trọng.',
      },
      {
        heading: 'Nhóm Best — Giảm puffy mạnh nhất',
        body: 'Đặc điểm: giàu potassium, ít sodium, hỗ trợ hydration. Thực phẩm: chuối, khoai tây/khoai lang, rau xanh (spinach, cải), dưa leo, nước. Cơ chế: tăng potassium → cân bằng sodium → giảm giữ nước.',
      },
      {
        heading: 'Nhóm Neutral',
        body: 'Thực phẩm: cơm, thịt, trứng, cá. Không quá nhiều sodium, không gây spike glycogen mạnh. Vấn đề không phải ăn gì mà là ăn bao nhiêu và có ổn định không.',
      },
      {
        heading: 'Nhóm Worst — Gây puffy mạnh',
        body: 'Thực phẩm: mì gói, fast food, snack mặn, đồ đóng hộp, đồ ăn nhiều sauce. Sodium tăng mạnh → cơ thể giữ nước → nước tích dưới da → mặt sưng, jawline biến mất.',
      },
      {
        heading: 'Nguyên tắc ăn để debloat',
        body: 'Giữ sodium thấp và ổn định. Tăng potassium. Giữ carb ổn định. Uống đủ nước (paradox: uống nhiều → ít giữ nước hơn). Tránh processed food.',
      },
    ],
  },

  {
    id: 'chieucao',
    title: 'Chiều cao, GH & IGF-1',
    category: 'dinhduong',
    categoryLabel: 'Dinh dưỡng',
    summary: 'Chiều cao phụ thuộc vào GH, IGF-1 và growth plate. Sau khi growth plate đóng, không thể cao thêm tự nhiên.',
    content: [
      {
        heading: 'Bản chất sinh học của chiều cao',
        body: 'Chiều cao tăng thông qua xương dài ra tại epiphyseal growth plate (đĩa tăng trưởng). Khi growth plate còn mở → xương dài ra. Khi đóng → chiều cao dừng lại.',
      },
      {
        heading: 'GH (Growth Hormone) — Hormone khởi động',
        body: 'GH được tiết từ tuyến yên (pituitary gland). GH không trực tiếp làm xương dài — nó kích hoạt IGF-1. Tiết mạnh nhất trong deep sleep (NREM stage 3). Đây là lý do ngủ cực kỳ quan trọng.',
      },
      {
        heading: 'IGF-1 — Yếu tố quyết định chiều cao',
        body: 'GH kích thích gan → gan sản xuất IGF-1 → IGF-1 đến growth plate → kích thích tế bào phân chia, tăng tạo sụn → chuyển thành xương. IGF-1 mới là yếu tố trực tiếp làm xương dài.',
      },
      {
        heading: 'Yếu tố ảnh hưởng GH & IGF-1',
        body: 'Ngủ: thiếu ngủ giảm GH, ngủ sâu tăng GH. Dinh dưỡng: protein tăng IGF-1, thiếu dinh dưỡng giảm tăng trưởng. Tập luyện: compound exercise, cường độ cao tăng GH tạm thời. Insulin: hỗ trợ IGF-1 nhưng quá cao gây rối loạn hormone.',
      },
      {
        heading: 'Sau dậy thì',
        body: 'Growth plate đóng. GH và IGF-1 vẫn có nhưng không còn tăng chiều cao. GH lúc này chỉ ảnh hưởng metabolism, không làm xương dài. Không có bài tập hay supplement nào thay đổi được điều này.',
      },
    ],
  },

  {
    id: 'morningdebloat',
    title: 'Morning Routine Debloat',
    category: 'dinhduong',
    categoryLabel: 'Dinh dưỡng',
    summary: 'Puffy buổi sáng là bình thường do fluid và hormone. Morning debloat đơn giản và hiệu quả trong 15–30 phút.',
    content: [
      {
        heading: 'Vì sao sáng dậy mặt bị puffy',
        body: 'Trong lúc ngủ: nằm ngang → dịch dồn lên vùng mặt. Giảm vận động → giảm circulation. Hormone thay đổi (cortisol awakening response, ADH). Kết quả: nước tích tụ dưới da, mặt sưng nhẹ.',
      },
      {
        heading: 'Bước 1 — Uống nước ngay khi thức dậy',
        body: 'Khi ngủ mất nước nhẹ → cơ thể giữ nước để bù. Uống nước → giảm tín hiệu giữ nước → tăng đào thải sodium qua thận. Paradox: uống nhiều nước → ít giữ nước hơn.',
      },
      {
        heading: 'Bước 2 — Tiếp xúc ánh sáng',
        body: 'Ánh sáng kích hoạt circadian rhythm → điều chỉnh cortisol → hormone ổn định hơn, giảm stress response → gián tiếp giảm water retention.',
      },
      {
        heading: 'Bước 3 — Vận động nhẹ',
        body: 'Đi bộ, cardio nhẹ, stretching. Tăng circulation, kích thích lymphatic drainage. Fluid di chuyển ra khỏi vùng mặt, giảm sưng. Đây là cách "xả nước cơ học".',
      },
      {
        heading: 'Bước 4 & 5 — Dinh dưỡng buổi sáng',
        body: 'Tránh sodium cao buổi sáng (không ăn mặn). Giữ carb ở mức vừa phải (không spike glycogen). Sau 15–30 phút debloat đúng cách → cải thiện rõ. Sau 1–2 giờ → mặt ổn định.',
      },
    ],
  },

  {
    id: 'carb',
    title: 'Carb, Glycogen & Vì sao mặt bạn to hơn',
    category: 'dinhduong',
    categoryLabel: 'Dinh dưỡng',
    summary: 'Ngoại hình thay đổi hàng ngày không phải vì mỡ mà vì glycogen, nước, sodium và insulin.',
    content: [
      {
        heading: 'Chuỗi phản ứng từ carb',
        body: 'Carb → glucose → insulin tiết ra → glucose đưa vào cơ và gan → chuyển thành glycogen. Insulin là hormone "lưu trữ năng lượng".',
      },
      {
        heading: 'Glycogen luôn đi kèm nước',
        body: '1g glycogen giữ ~2.7–4g nước. Glycogen là phân tử ưa nước, kéo nước vào trong tế bào. Khi glycogen tăng → lượng nước trong cơ thể tăng.',
      },
      {
        heading: 'Hai loại nước — điều quan trọng nhất',
        body: 'Intracellular water (trong tế bào): làm cơ "full" — là look tốt. Extracellular water (ngoài tế bào, dưới da): làm mặt puffy — là look xấu. Vấn đề không phải là nước mà là nước nằm ở đâu.',
      },
      {
        heading: 'Tại sao bị "puffy ngày hôm sau"',
        body: 'Cheat meal (carb + muối cao) → insulin tăng → glycogen tăng → sodium tăng → nước giữ lại. Sáng hôm sau: mặt to hơn, mí mắt nặng, jawline biến mất. Đây không phải là mỡ.',
      },
      {
        heading: 'Cách kiểm soát đúng',
        body: 'Giữ carb ổn định, không có insulin spike. Không ăn carb + sodium cực cao cùng lúc. Uống đủ nước. Tập luyện để tiêu glycogen. Ngủ đủ để giảm cortisol.',
      },
    ],
  },

  {
    id: 'peakface',
    title: 'Peak Face & Body Pump',
    category: 'dinhduong',
    categoryLabel: 'Dinh dưỡng',
    summary: 'Peak look là trạng thái ngoại hình tối ưu ngắn hạn. Có thể chủ động tạo ra bằng cách kiểm soát sinh lý.',
    content: [
      {
        heading: 'Bản chất của Peak Look',
        body: 'Peak look = tối ưu ngoại hình trong thời gian ngắn. 3 yếu tố: glycogen (độ full của cơ), water distribution (nước nằm ở đâu), blood flow (lưu lượng máu). Không phải tăng cơ/mỡ mà là tối ưu phân bố nước và máu.',
      },
      {
        heading: 'Các bước đạt peak face',
        body: 'Bước 1: giảm sodium nhẹ 12–24h trước (không cắt hoàn toàn). Bước 2: giữ carb ở mức vừa (glycogen vừa đủ, không overflow). Bước 3: uống đủ nước. Bước 4: giảm cortisol (ngủ đủ, tránh stress).',
      },
      {
        heading: 'Body pump — cơ chế',
        body: 'Tập luyện → tăng nitric oxide → mạch máu giãn (vasodilation) → máu dồn vào cơ. Kết quả: cơ to hơn tạm thời, vein nổi, nhìn full. Yếu tố tăng pump: glycogen cao, hydration tốt, sodium vừa phải.',
      },
      {
        heading: 'Peak trong 1 ngày',
        body: 'Sáng: uống nước, debloat. Trước event: ăn nhẹ carb, pump nhẹ. Ngay trước: pump đầy + ánh sáng tốt. Timing rất quan trọng — pump kéo dài 1–2 giờ.',
      },
    ],
  },

  {
    id: 'leanvsbulk',
    title: 'Lean vs Bulk & Vì sao không cần Bulk',
    category: 'dinhduong',
    categoryLabel: 'Dinh dưỡng',
    summary: 'Aesthetic không đến từ to lớn mà từ body fat thấp + cơ vừa đủ. Lean lâu dài tốt hơn bulk rồi cut.',
    content: [
      {
        heading: 'Body fat % & ngoại hình',
        body: '10–12%: jawline sắc, vein rõ, face rất nét. 12–15%: cân bằng nhất, vẫn nét nhưng không quá gầy. >18–20%: mỡ che xương, mặt tròn, jawline mờ. Face aesthetics phụ thuộc mạnh vào body fat.',
      },
      {
        heading: 'Vấn đề của Bulk',
        body: 'Tăng fat song song với muscle → che cấu trúc, face xấu đi trước. Water retention tăng khi insulin cao → puffy face, body mềm. Phải cut lại sau bulk — cycle không cần thiết nếu mục tiêu là aesthetics.',
      },
      {
        heading: 'Lean gain — Cách tốt hơn',
        body: 'Calorie surplus nhẹ hoặc maintenance. Protein cao (1.6–2.2g/kg). Progressive overload. Kết quả: tăng cơ chậm nhưng không tăng mỡ nhiều. Đây là cách build body "clean".',
      },
      {
        heading: 'Kết luận',
        body: 'Aesthetics = body fat thấp + muscle vừa đủ. Không cần bulk nếu mục tiêu là ngoại hình. Optimal zone: 11–15% body fat, cơ tăng chậm nhưng sạch. To không phải là aesthetic.',
      },
    ],
  },

  // ─── PHONG CÁCH & NGOẠI HÌNH ────────────────────────────────────────────

  {
    id: 'mauquanao',
    title: 'Chọn màu quần áo & cơ chế tạo contrast ngoại hình',
    category: 'phongcach',
    categoryLabel: 'Phong cách & Ngoại hình',
    summary: 'Style đẹp không phải đồ đắt mà là contrast đúng, màu đúng, fit chuẩn.',
    content: [
      {
        heading: 'Contrast — Yếu tố quan trọng nhất',
        body: 'Não đánh giá ngoại hình dựa trên contrast, shape và cleanliness. Contrast cao → nhìn sắc nét, thu hút mắt, clean. Contrast thấp → nhìn mờ, ít nổi bật. Style đẹp = tối ưu contrast.',
      },
      {
        heading: 'Chọn màu theo skin tone',
        body: 'Da sáng: phù hợp màu tối (đen, navy, xám đậm) → contrast mạnh → khuôn mặt nổi bật. Da vàng/trung bình: navy, xanh rêu, xám, trắng. Da tối: trắng, màu sáng để tạo tách biệt rõ.',
      },
      {
        heading: 'Neutral colors — Nền tảng style',
        body: 'Đen, trắng, xám, navy, beige: không gây nhiễu thị giác, dễ phối, luôn clean. Đây là base của mọi outfit đẹp. Tránh quá 2–3 màu trong 1 outfit.',
      },
      {
        heading: 'Tại sao màu ảnh hưởng đến face look',
        body: 'Màu gần mặt (áo, cổ) ảnh hưởng perception khuôn mặt. Contrast cao → jawline rõ hơn về mặt visual, da sáng hơn. Fit quan trọng hơn màu: vai vừa, tay gọn, không quá rộng hay bó.',
      },
    ],
  },

  {
    id: 'mu',
    title: 'Chọn mũ phù hợp khuôn mặt',
    category: 'phongcach',
    categoryLabel: 'Phong cách & Ngoại hình',
    summary: 'Mũ có thể cải thiện hoặc làm xấu tỷ lệ khuôn mặt. Hiểu cơ chế để chọn đúng.',
    content: [
      {
        heading: 'Cơ chế mũ ảnh hưởng ngoại hình',
        body: 'Mũ thay đổi visual proportions của khuôn mặt. Brim (vành) tạo shadow, che bớt trán hoặc kéo dài visual. Crown (chóp) ảnh hưởng chiều cao tổng thể. Màu mũ tạo contrast với khuôn mặt.',
      },
      {
        heading: 'Mặt dài',
        body: 'Cần mũ rộng vành để cân bằng chiều dài. Tránh mũ có crown cao (kéo dài mặt thêm). Phù hợp: wide brim hat, bucket hat.',
      },
      {
        heading: 'Mặt tròn/vuông',
        body: 'Cần mũ có crown cao và vành hẹp để kéo dài visual. Tránh mũ tròn hoặc vành quá rộng. Phù hợp: snapback cao, baseball cap với crown cao.',
      },
      {
        heading: 'Nguyên tắc chung',
        body: 'Mũ và khuôn mặt không nên có cùng shape (tròn+tròn = không đẹp). Cần contrast giữa hình dạng mũ và mặt. Màu neutral (đen, navy, xám) là an toàn nhất.',
      },
    ],
  },

  {
    id: 'kinh',
    title: 'Chọn kính & cơ chế ảnh hưởng đến khuôn mặt',
    category: 'phongcach',
    categoryLabel: 'Phong cách & Ngoại hình',
    summary: 'Kính có thể che nhược điểm hoặc làm nổi bật nhược điểm. Nguyên tắc: shape kính phải contrast với shape mặt.',
    content: [
      {
        heading: 'Nguyên tắc cơ bản',
        body: 'Shape kính phải contrast với shape khuôn mặt. Mặt tròn → kính angular (vuông, chữ nhật). Mặt vuông/angular → kính oval, tròn. Mặt dài → kính cổng vòm rộng để cân bằng chiều dài.',
      },
      {
        heading: 'Kích thước kính',
        body: 'Kính quá lớn: che cấu trúc mặt, giảm jawline visual. Kính quá nhỏ: mắt nhìn xa, mặt trông to hơn. Optimal: frame ngang bằng hoặc hơn chiều rộng khuôn mặt nhẹ.',
      },
      {
        heading: 'Màu gọng kính',
        body: 'Màu tối (đen, tortoise): classic, ít cầu kỳ, phù hợp đa skin tone. Màu kim loại (gold, silver): sang hơn nhưng cần skin tone phù hợp. Neutral là lựa chọn safe nhất.',
      },
      {
        heading: 'Kính & jawline',
        body: 'Kính không che jawline (frame kết thúc trên cheekbone) → jawline rõ hơn. Kính oversized che jawline → jawline mờ đi. Nếu jawline là điểm mạnh: chọn kính nhỏ hơn để khuôn hàm lộ.',
      },
    ],
  },

  // ─── TÂM LÝ & KHOA HỌC NGOẠI HÌNH ──────────────────────────────────────

  {
    id: 'prettyprivilege',
    title: 'Pretty Privilege & cơ chế não bộ đánh giá ngoại hình',
    category: 'tamly',
    categoryLabel: 'Tâm lý & Khoa học ngoại hình',
    summary: 'Não bộ đánh giá ngoại hình trong vòng 100ms — và điều này ảnh hưởng đến mọi tương tác xã hội.',
    content: [
      {
        heading: 'Cơ chế não đánh giá ngoại hình',
        body: 'Não đánh giá attractiveness trong vòng 100ms (trước khi ý thức xử lý). Amygdala xử lý khuôn mặt và gán emotion ngay lập tức. Đây là phản xạ tiến hóa, không phải lựa chọn có ý thức.',
      },
      {
        heading: 'Pretty Privilege là gì',
        body: 'Người hấp dẫn hơn nhận được lợi thế trong hầu hết mọi tình huống: tuyển dụng, tòa án, tương tác xã hội, dating. Không phải "bất công" — đây là cơ chế sinh học được ghi nhận qua nhiều nghiên cứu.',
      },
      {
        heading: 'Những yếu tố tạo nên attractiveness',
        body: 'Symmetry (đối xứng), averageness (khuôn mặt trung bình của dân số), sexual dimorphism (đặc điểm giới tính rõ), skin quality, grooming. Quan trọng: không phải "đẹp tuyệt đối" mà là "khỏe mạnh và well-groomed".',
      },
      {
        heading: 'Ý nghĩa thực tiễn',
        body: 'Bạn không thể thay đổi cấu trúc xương, nhưng có thể: tối ưu skin, posture, grooming, body fat, style. Những yếu tố này chiếm phần lớn impression mà người khác nhận được. ROI cao nhất: body fat, skin, haircut, posture.',
      },
    ],
  },

  {
    id: 'haloeffect',
    title: 'Halo Effect & cách não "gán nhãn" bạn từ ngoại hình',
    category: 'tamly',
    categoryLabel: 'Tâm lý & Khoa học ngoại hình',
    summary: 'Halo Effect: người đẹp được não tự động gán thêm nhiều phẩm chất tốt — thông minh, đáng tin, năng lực cao.',
    content: [
      {
        heading: 'Halo Effect là gì',
        body: 'Khi não thấy một đặc điểm tốt (ví dụ: khuôn mặt hấp dẫn), nó tự động suy ra các đặc điểm tốt khác (thông minh, đáng tin cậy, có năng lực, thành công). Đây là cognitive bias hoàn toàn tự động.',
      },
      {
        heading: 'Cơ chế sinh học',
        body: 'Hệ thống dopaminergic phản ứng với khuôn mặt hấp dẫn. Amygdala gán "safe/trustworthy" nhanh hơn với người đẹp. Khuôn mặt đối xứng được liên kết với "khỏe mạnh về gene" — đây là cơ chế tiến hóa.',
      },
      {
        heading: 'Ảnh hưởng trong cuộc sống',
        body: 'Phỏng vấn xin việc: người đẹp hơn được đánh giá có năng lực cao hơn. Tòa án: bị cáo có ngoại hình tốt nhận hình phạt nhẹ hơn. Giảng dạy: giáo viên đẹp được đánh giá dạy tốt hơn. Giao tiếp: người đẹp được người khác kiên nhẫn hơn.',
      },
      {
        heading: 'Cách tận dụng Halo Effect',
        body: 'Grooming (tóc, da, vệ sinh) tạo impression "well-cared for" ngay lập tức. Posture và confidence reinforces halo. Dressing well là "investment" vào first impression. Bạn kiểm soát được phần lớn những yếu tố này.',
      },
    ],
  },

  {
    id: 'cortisol',
    title: 'Cortisol & Vì sao stress làm xấu ngoại hình',
    category: 'tamly',
    categoryLabel: 'Tâm lý & Khoa học ngoại hình',
    summary: 'Cortisol cao làm xấu da, tăng giữ nước, gây rụng tóc và ức chế tăng cơ. Quản lý stress là skincare.',
    content: [
      {
        heading: 'Cortisol là gì',
        body: 'Cortisol là stress hormone được tiết bởi tuyến thượng thận (adrenal gland). Cần thiết trong ngắn hạn (fight-or-flight). Có hại khi mãn tính (chronic stress).',
      },
      {
        heading: 'Cortisol ảnh hưởng da như thế nào',
        body: 'Tăng sebum production → tăng mụn. Phá vỡ collagen → da lão hóa nhanh hơn. Làm chậm lành thương. Gây viêm hệ thống → eczema, psoriasis trở nặng.',
      },
      {
        heading: 'Cortisol ảnh hưởng ngoại hình toàn thân',
        body: 'Water retention: cortisol làm thận giữ sodium → giữ nước → puffy face. Cortisol ức chế testosterone và GH → giảm tăng cơ. Tăng fat storage (đặc biệt vùng bụng). Rụng tóc (telogen effluvium).',
      },
      {
        heading: 'Cách giảm cortisol hiệu quả',
        body: 'Ngủ đủ 7–9 tiếng (quan trọng nhất). Tập luyện đều đặn (nhưng không overtrain). Mindfulness, thiền. Giảm caffeine vào buổi chiều tối. Giảm chronic stressor trong cuộc sống. Xã hội hóa và kết nối.',
      },
    ],
  },

  {
    id: 'giaclap',
    title: 'Tối ưu giấc ngủ & cơ chế ảnh hưởng ngoại hình',
    category: 'tamly',
    categoryLabel: 'Tâm lý & Khoa học ngoại hình',
    summary: 'Ngủ là "beauty sleep" có cơ sở khoa học — GH tiết mạnh, collagen tái tạo, cortisol giảm, não loại bỏ toxin.',
    content: [
      {
        heading: 'Cơ chế "Beauty Sleep"',
        body: 'Trong deep sleep (NREM stage 3): GH tiết mạnh nhất → kích thích tái tạo tế bào và tổng hợp collagen. Cortisol giảm xuống thấp nhất. Hệ bạch huyết não (glymphatic system) hoạt động → loại bỏ toxin.',
      },
      {
        heading: 'Thiếu ngủ ảnh hưởng ngoại hình',
        body: 'Quầng thâm mắt nặng hơn (mạch máu giãn). Puffy face (cortisol cao, ADH tăng giữ nước). Da xỉn màu (giảm circulation). Skin barrier yếu hơn (tăng TEWL). Mụn nhiều hơn (cortisol tăng sebum). Biểu cảm mặt tiêu cực hơn.',
      },
      {
        heading: 'Tối ưu giấc ngủ',
        body: 'Ngủ 7–9 tiếng mỗi đêm. Ngủ và thức cùng giờ mỗi ngày (circadian consistency). Phòng tối và mát (18–20°C). Không màn hình 30–60 phút trước khi ngủ (blue light ức chế melatonin). Tránh caffeine sau 2–3PM.',
      },
      {
        heading: 'Tư thế ngủ',
        body: 'Nằm ngửa: tốt nhất cho face (không ép mặt xuống gối → giảm asymmetry và wrinkle). Nằm nghiêng: có thể gây compression asymmetry lâu dài. Gối đầu cao vừa phải: giảm fluid dồn lên mặt.',
      },
    ],
  },
];

export function getSectionsByCategory(category: InfoSection['category']): InfoSection[] {
  return INFO_SECTIONS.filter((s) => s.category === category);
}

export function getSectionById(id: string): InfoSection | undefined {
  return INFO_SECTIONS.find((s) => s.id === id);
}
